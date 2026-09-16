import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { sendAdminTweetDraftEmail } from '@/lib/email';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  x_handle: z.string().max(30).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('waityr_email')?.value;

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { name, x_handle } = parseResult.data;

    // Verify user is a VIP (has top_spot_count > 0)
    const { rows } = await db.query(
      'SELECT id, top_spot_count FROM waitlist_entries WHERE email = $1 LIMIT 1',
      [email]
    );

    if (rows.length === 0 || rows[0].top_spot_count === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Clean up handle
    let cleanHandle = x_handle?.trim() || '';
    if (cleanHandle.startsWith('@')) {
      cleanHandle = cleanHandle.substring(1);
    }

    // Update database
    await db.query(
      'UPDATE waitlist_entries SET name = $1, x_handle = $2 WHERE email = $3',
      [name, cleanHandle, email]
    );

    // Send admin the drafted tweet email (fire and forget)
    sendAdminTweetDraftEmail({ name, x_handle: cleanHandle }).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('VIP profile update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
