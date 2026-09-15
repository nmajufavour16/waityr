import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?error=invalid_token`);
  }

  // Find entry by confirmation token
  const { rows } = await db.query(
    'SELECT id, email, confirmed, joined_at FROM waitlist_entries WHERE confirmation_token = $1 LIMIT 1',
    [token]
  );

  if (rows.length === 0) {
    return NextResponse.redirect(`${appUrl}/?error=token_not_found`);
  }
  const entry = rows[0];

  // Check token age (24-hour expiry)
  const joinedAt = new Date(entry.joined_at);
  const ageMs = Date.now() - joinedAt.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (!entry.confirmed && ageMs > twentyFourHours) {
    return NextResponse.redirect(`${appUrl}/?error=token_expired`);
  }

  // Already confirmed — redirect straight to dashboard
  if (entry.confirmed) {
    const res = NextResponse.redirect(`${appUrl}/dashboard`);
    res.cookies.set('waityr_email', entry.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  // Confirm the entry
  await db.query(
    'UPDATE waitlist_entries SET confirmed = true WHERE id = $1',
    [entry.id]
  );

  // Set session cookie and redirect to dashboard
  const res = NextResponse.redirect(`${appUrl}/dashboard`);
  res.cookies.set('waityr_email', entry.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
