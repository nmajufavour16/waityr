import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const { referral_code } = await req.json() as { referral_code: string };

  if (!referral_code || !/^[a-zA-Z0-9_-]{3,20}$/.test(referral_code)) {
    return NextResponse.json(
      { error: 'Referral code must be 3–20 characters: letters, numbers, hyphens, underscores.' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Check uniqueness
  const { data: existing } = await supabase
    .from('waitlist_entries')
    .select('id')
    .eq('referral_code', referral_code)
    .neq('email', email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'That referral code is already taken.' }, { status: 409 });
  }

  const { error } = await supabase
    .from('waitlist_entries')
    .update({ referral_code })
    .eq('email', email);

  if (error) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, referral_code });
}
