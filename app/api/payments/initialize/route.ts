import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { initializeTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email } = body as {
      type: 'random_bump' | 'top_spot';
      email: string;
    };

    if (!type || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (type !== 'random_bump' && type !== 'top_spot') {
      return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Look up confirmed entry
    const { data: entry } = await supabase
      .from('waitlist_entries')
      .select('id, email, confirmed, position')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!entry || !entry.confirmed) {
      return NextResponse.json(
        { error: 'Entry not found or email not confirmed.' },
        { status: 403 }
      );
    }

    // Amount in cents (USD)
    const amount = type === 'random_bump' ? 100 : 300;

    const result = await initializeTransaction({
      email: entry.email,
      amount,
      currency: 'USD',
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
