import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { maskEmail } from '@/lib/positions';
import { sendConfirmationEmail } from '@/lib/email';

const joinSchema = z.object({
  email: z.string().email('Invalid email address.'),
  referral_code: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = joinSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }
    
    const { email, referral_code } = parseResult.data;

    const { rows: existingRows } = await db.query(
      'SELECT id, email, position FROM waitlist_entries WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (existingRows.length > 0) {
      return NextResponse.json({ already_exists: true }, { status: 200 });
    }

    let resultRows;
    try {
      const result = await db.query(
        'SELECT * FROM join_waitlist($1, $2)',
        [email.toLowerCase().trim(), referral_code ?? null]
      );
      resultRows = result.rows;
    } catch (rpcError) {
      console.error('join_waitlist RPC error:', rpcError);
      return NextResponse.json({ error: 'Failed to join waitlist.' }, { status: 500 });
    }

    if (!resultRows || resultRows.length === 0) {
      console.error('join_waitlist returned no result');
      return NextResponse.json({ error: 'Failed to join waitlist.' }, { status: 500 });
    }

    const row = resultRows[0];
    const newId: string = row.new_id;
    const newPosition: number = row.new_position;
    const confirmationToken: string = row.new_confirmation_token;
    const referrerId: string | null = row.referrer_id;

    await db.query(
      `INSERT INTO activity_feed (event_type, entry_id, position_after, display_text)
       VALUES ($1, $2, $3, $4)`,
      ['joined', newId, newPosition, `${maskEmail(email)} joined the list. They are #${newPosition}.`]
    );

    if (referrerId && row.referrer_position) {
      const newReferrerPos = row.referrer_position - 1;
      await db.query(
        `INSERT INTO activity_feed (event_type, entry_id, position_before, position_after, display_text)
         VALUES ($1, $2, $3, $4, $5)`,
        ['referral_bump', referrerId, row.referrer_position, newReferrerPos, `${maskEmail(email)} joined via referral. Their referrer moved up to #${newReferrerPos}.`]
      );
    }

    sendConfirmationEmail({ to: email, position: newPosition, confirmationToken })
      .catch((err) => console.error('Email send failed:', err));

    return NextResponse.json({ position: newPosition, entry_id: newId });
  } catch (err) {
    console.error('Join error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
