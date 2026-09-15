import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/waitlist/position?email=...
// Returns the current position for a confirmed user.
// In production, gate this behind Supabase session auth.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required.' }, { status: 400 });
  }

  const { rows } = await db.query(
    'SELECT id, position, joined_at, confirmed, total_spent_cents, bump_count, top_spot_count, referral_code FROM waitlist_entries WHERE email = $1 LIMIT 1',
    [email.toLowerCase().trim()]
  );
  const data = rows.length > 0 ? rows[0] : null;

  if (!data) {
    return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
  }

  if (!data.confirmed) {
    return NextResponse.json({ error: 'Email not confirmed.' }, { status: 403 });
  }

  return NextResponse.json(data);
}
