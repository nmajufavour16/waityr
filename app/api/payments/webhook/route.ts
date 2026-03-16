import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase';
import { performPositionMove, randomBetween } from '@/lib/positions';
import { refundTransaction } from '@/lib/paystack';
import { sendDisplacedFromTopEmail } from '@/lib/email';

export const runtime = 'nodejs';

// Paystack sends POST to this endpoint after every successful charge.
export async function POST(req: NextRequest) {
  // ── Step 1: Verify HMAC-SHA512 signature ──────────────────────────────────
  const rawBody = await req.text();
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex');

  const signature = req.headers.get('x-paystack-signature');

  if (hash !== signature) {
    console.warn('[webhook] Signature mismatch — rejecting');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // ── Step 2: Only handle charge.success ────────────────────────────────────
  if (body.event !== 'charge.success') {
    return new NextResponse('OK', { status: 200 });
  }

  const reference: string = body.data.reference;
  const supabase = createServerClient();

  // ── Step 3: Idempotency check ─────────────────────────────────────────────
  const { error: insertError } = await supabase
    .from('paystack_events')
    .insert({ reference, event_type: body.event });

  if (insertError) {
    // Duplicate reference — already processed
    console.log(`[webhook] Duplicate reference ${reference} — skipping`);
    return new NextResponse('OK', { status: 200 });
  }

  // ── Step 4: Extract metadata ───────────────────────────────────────────────
  const type: 'random_bump' | 'top_spot' = body.data.metadata?.type;
  const entryId: string = body.data.metadata?.entry_id;
  const amountCents: number = body.data.amount; // Paystack returns amount in kobo/cents

  if (!type || !entryId) {
    console.error('[webhook] Missing metadata in charge.success');
    return new NextResponse('OK', { status: 200 });
  }

  // Look up current entry
  const { data: entry, error: entryError } = await supabase
    .from('waitlist_entries')
    .select('id, email, position, top_spot_count, bump_count, total_spent_cents')
    .eq('id', entryId)
    .single();

  if (entryError || !entry) {
    console.error('[webhook] Entry not found:', entryId);
    return new NextResponse('OK', { status: 200 });
  }

  const currentPosition: number = entry.position;

  // ── Step 5: Position mutation ──────────────────────────────────────────────
  if (type === 'random_bump') {
    // If already at #2 or #1, refund and skip
    if (currentPosition <= 2) {
      console.log(`[webhook] Position ${currentPosition} <= 2 for random_bump — refunding`);
      await refundTransaction(reference).catch(console.error);
      return new NextResponse('OK', { status: 200 });
    }

    const targetPosition = randomBetween(2, currentPosition - 1);

    try {
      await performPositionMove(entryId, targetPosition);
    } catch (err) {
      console.error('[webhook] performPositionMove failed:', err);
      return new NextResponse('OK', { status: 200 });
    }

    // Log to activity feed
    await supabase.from('activity_feed').insert({
      event_type: 'random_bump',
      entry_id: entryId,
      position_before: currentPosition,
      position_after: targetPosition,
      amount_cents: amountCents,
      display_text: `Someone paid $1. They moved from #${currentPosition} to #${targetPosition}.`,
    });

    // Update entry stats
    await supabase
      .from('waitlist_entries')
      .update({
        bump_count: entry.bump_count + 1,
        total_spent_cents: entry.total_spent_cents + 100,
      })
      .eq('id', entryId);
  } else if (type === 'top_spot') {
    // If already at #1, refund and skip
    if (currentPosition === 1) {
      console.log('[webhook] Already at #1 for top_spot — refunding');
      await refundTransaction(reference).catch(console.error);
      return new NextResponse('OK', { status: 200 });
    }

    // Find who's currently at #1 (before the move)
    const { data: currentTopEntry } = await supabase
      .from('waitlist_entries')
      .select('id, email, joined_at')
      .eq('position', 1)
      .maybeSingle();

    const totalCount = await supabase
      .from('waitlist_entries')
      .select('id', { count: 'exact', head: true });

    const displaced = currentPosition - 1; // number of people moved down

    try {
      await performPositionMove(entryId, 1);
    } catch (err) {
      console.error('[webhook] performPositionMove to #1 failed:', err);
      return new NextResponse('OK', { status: 200 });
    }

    // Log to activity feed
    await supabase.from('activity_feed').insert({
      event_type: 'top_spot',
      entry_id: entryId,
      position_before: currentPosition,
      position_after: 1,
      amount_cents: amountCents,
      display_text: `Someone paid $3. They are now #1. ${displaced} ${displaced === 1 ? 'person' : 'people'} moved down one spot.`,
    });

    // Update entry stats
    await supabase
      .from('waitlist_entries')
      .update({
        top_spot_count: entry.top_spot_count + 1,
        total_spent_cents: entry.total_spent_cents + 300,
      })
      .eq('id', entryId);

    // Optionally notify displaced #1 holder
    if (currentTopEntry) {
      const heldSince = new Date(currentTopEntry.joined_at);
      const heldMs = Date.now() - heldSince.getTime();
      const heldHours = heldMs / (1000 * 60 * 60);

      // Send email (fire-and-forget; opt-in check would go here in production)
      sendDisplacedFromTopEmail({
        to: currentTopEntry.email,
        timeHeldHours: heldHours,
        newPosition: 2,
      }).catch(console.error);
    }
  }

  return new NextResponse('OK', { status: 200 });
}
