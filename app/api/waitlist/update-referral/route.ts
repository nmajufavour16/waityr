import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

const updateSchema = z.object({
  referral_code: z.string().regex(/^[a-zA-Z0-9_-]{3,20}$/, 'Referral code must be 3–20 characters: letters, numbers, hyphens, underscores.'),
});

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const body = await req.json();
  const parseResult = updateSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
  }

  const { referral_code } = parseResult.data;

  // Check uniqueness
  const { rows: existingRows } = await db.query(
    'SELECT id FROM waitlist_entries WHERE referral_code = $1 AND email != $2 LIMIT 1',
    [referral_code, email]
  );

  if (existingRows.length > 0) {
    return NextResponse.json({ error: 'That referral code is already taken.' }, { status: 409 });
  }

  try {
    await db.query(
      'UPDATE waitlist_entries SET referral_code = $1 WHERE email = $2',
      [referral_code, email]
    );
  } catch (error) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, referral_code });
}
