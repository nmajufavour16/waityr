import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendMagicLinkEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: entry } = await supabase
      .from('waitlist_entries')
      .select('id, email, position, confirmed')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!entry) {
      // Don't reveal whether email exists — send generic response
      return NextResponse.json({ ok: true });
    }

    // Generate a fresh token
    const newToken = randomUUID();

    await supabase
      .from('waitlist_entries')
      .update({ confirmation_token: newToken })
      .eq('id', entry.id);

    await sendMagicLinkEmail({
      to: entry.email,
      position: entry.position,
      confirmationToken: newToken,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Sign-in error:', err);
    return NextResponse.json({ error: 'Failed to send sign-in link.' }, { status: 500 });
  }
}
