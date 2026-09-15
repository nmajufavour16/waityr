import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendMagicLinkEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

const signinSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = signinSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { email } = parseResult.data;

    const { rows } = await db.query(
      'SELECT id, email, position, confirmed FROM waitlist_entries WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    const entry = rows.length > 0 ? rows[0] : null;

    if (!entry) {
      // Don't reveal whether email exists — send generic response
      return NextResponse.json({ ok: true });
    }

    // Generate a fresh token
    const newToken = randomUUID();

    await db.query(
      'UPDATE waitlist_entries SET confirmation_token = $1 WHERE id = $2',
      [newToken, entry.id]
    );

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
