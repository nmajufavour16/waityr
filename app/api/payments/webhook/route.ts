import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
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
  // ── Step 3: Idempotency check ─────────────────────────────────────────────
  try {
    await db.query('INSERT INTO paystack_events (reference, event_type) VALUES ($1, $2)', [reference, body.event]);
  } catch (err: any) {
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
  const { rows: entryRows } = await db.query(
    'SELECT id, email, position, top_spot_count, bump_count, total_spent_cents FROM waitlist_entries WHERE id = $1 LIMIT 1',
    [entryId]
  );

  if (entryRows.length === 0) {
    console.error('[webhook] Entry not found:', entryId);
    return new NextResponse('OK', { status: 200 });
  }

  const entry = entryRows[0];

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
    await db.query(
      `INSERT INTO activity_feed (event_type, entry_id, position_before, position_after, amount_cents, display_text)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['random_bump', entryId, currentPosition, targetPosition, amountCents, `Someone paid $1. They moved from #${currentPosition} to #${targetPosition}.`]
    );

    // Update entry stats
    await db.query(
      'UPDATE waitlist_entries SET bump_count = bump_count + 1, total_spent_cents = total_spent_cents + 100 WHERE id = $1',
      [entryId]
    );
  } else if (type === 'top_spot') {
    // If already at #1, refund and skip
    if (currentPosition === 1) {
      console.log('[webhook] Already at #1 for top_spot — refunding');
      await refundTransaction(reference).catch(console.error);
      return new NextResponse('OK', { status: 200 });
    }

    // Find who's currently at #1 (before the move)
    const { rows: topEntryRows } = await db.query(
      'SELECT id, email, joined_at FROM waitlist_entries WHERE position = 1 LIMIT 1'
    );
    const currentTopEntry = topEntryRows.length > 0 ? topEntryRows[0] : null;

    const { rows: totalCountRows } = await db.query('SELECT COUNT(id) FROM waitlist_entries');
    const totalCount = parseInt(totalCountRows[0].count || '0', 10);

    const displaced = currentPosition - 1; // number of people moved down

    try {
      await performPositionMove(entryId, 1);
    } catch (err) {
      console.error('[webhook] performPositionMove to #1 failed:', err);
      return new NextResponse('OK', { status: 200 });
    }

    // Log to activity feed
    await db.query(
      `INSERT INTO activity_feed (event_type, entry_id, position_before, position_after, amount_cents, display_text)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['top_spot', entryId, currentPosition, 1, amountCents, `👑 Someone paid $2.99. They are now #1. ${displaced} ${displaced === 1 ? 'person' : 'people'} moved down one spot.`]
    );

    // Update entry stats
    await db.query(
      'UPDATE waitlist_entries SET top_spot_count = top_spot_count + 1, total_spent_cents = total_spent_cents + 299 WHERE id = $1',
      [entryId]
    );

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
