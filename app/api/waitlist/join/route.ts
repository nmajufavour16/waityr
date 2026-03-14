import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { maskEmail } from '@/lib/positions';
import { sendConfirmationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, referral_code } = body as {
      email: string;
      referral_code?: string;
    };

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check for existing entry
    const { data: existing } = await supabase
      .from('waitlist_entries')
      .select('id, email, position')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ already_exists: true }, { status: 200 });
    }

    // Use atomic RPC to join
    const { data: result, error: rpcError } = await supabase.rpc('join_waitlist', {
      p_email: email.toLowerCase().trim(),
      p_referral_code: referral_code ?? null,
    });

    if (rpcError || !result || result.length === 0) {
      console.error('join_waitlist RPC error:', rpcError);
      return NextResponse.json({ error: 'Failed to join waitlist.' }, { status: 500 });
    }

    const row = result[0];
    const newId: string = row.new_id;
    const newPosition: number = row.new_position;
    const confirmationToken: string = row.new_confirmation_token;
    const referrerId: string | null = row.referrer_id;

    // Log joined event
    await supabase.from('activity_feed').insert({
      event_type: 'joined',
      entry_id: newId,
      position_after: newPosition,
      display_text: `${maskEmail(email)} joined the list. They are #${newPosition}.`,
    });

    // Log referral bump if applicable
    if (referrerId && row.referrer_position) {
      const newReferrerPos = row.referrer_position - 1;
      await supabase.from('activity_feed').insert({
        event_type: 'referral_bump',
        entry_id: referrerId,
        position_before: row.referrer_position,
        position_after: newReferrerPos,
        display_text: `${maskEmail(email)} joined via referral. Their referrer moved up to #${newReferrerPos}.`,
      });
    }

    // Send confirmation email (non-blocking)
    sendConfirmationEmail({
      to: email,
      position: newPosition,
      confirmationToken,
    }).catch((err) => console.error('Email send failed:', err));

    return NextResponse.json({
      position: newPosition,
      entry_id: newId,
    });
  } catch (err) {
    console.error('Join error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
