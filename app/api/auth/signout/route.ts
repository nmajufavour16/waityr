import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const url = new URL('/', req.url);
  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.set('waityr_email', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
