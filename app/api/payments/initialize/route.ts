import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { initializeTransaction } from '@/lib/paystack';

const paymentSchema = z.object({
  type: z.union([z.literal('random_bump'), z.literal('top_spot')]),
  email: z.string().email('Invalid email address.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = paymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { type, email } = parseResult.data;

    // Look up confirmed entry
    const { rows } = await db.query(
      'SELECT id, email, confirmed, position FROM waitlist_entries WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    const entry = rows.length > 0 ? rows[0] : null;

    if (!entry || !entry.confirmed) {
      return NextResponse.json(
        { error: 'Entry not found or email not confirmed.' },
        { status: 403 }
      );
    }

    // Amount in kobo (NGN) based on 1350 rate
    const amount = type === 'random_bump' ? 135000 : 405000;

    const result = await initializeTransaction({
      email: entry.email,
      amount,
      currency: 'NGN',
      metadata: {
        type,
        entry_id: entry.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      channels: ['card'],
    });

    return NextResponse.json({
      authorization_url: result.authorization_url,
      reference: result.reference,
    });
  } catch (err) {
    console.error('Payment initialize error:', err);
    return NextResponse.json({ error: 'Failed to initialize payment.' }, { status: 500 });
  }
}
