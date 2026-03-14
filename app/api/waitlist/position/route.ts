import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/waitlist/position?email=...
// Returns the current position for a confirmed user.
// In production, gate this behind Supabase session auth.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required.' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('waitlist_entries')
    .select(
      'id, position, joined_at, confirmed, total_spent_cents, bump_count, top_spot_count, referral_code'
    )
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
  }

  if (!data.confirmed) {
    return NextResponse.json({ error: 'Email not confirmed.' }, { status: 403 });
  }

  return NextResponse.json(data);
}
