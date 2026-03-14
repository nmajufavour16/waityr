import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?error=invalid_token`);
  }

  const supabase = createServerClient();

  // Find entry by confirmation token
  const { data: entry, error } = await supabase
    .from('waitlist_entries')
    .select('id, email, confirmed, joined_at')
    .eq('confirmation_token', token)
    .maybeSingle();

  if (error || !entry) {
    return NextResponse.redirect(`${appUrl}/?error=token_not_found`);
  }

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
  await supabase
    .from('waitlist_entries')
    .update({ confirmed: true })
    .eq('id', entry.id);

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
