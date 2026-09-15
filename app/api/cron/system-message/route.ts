import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  // Verify cron secret (if set in env variables)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { rows: countRows } = await db.query('SELECT COUNT(*) as count FROM waitlist_entries');
    const count = parseInt(countRows[0].count, 10);

    const { rows: topRows } = await db.query('SELECT joined_at FROM waitlist_entries WHERE position = 1 LIMIT 1');
    const topEntry = topRows[0];

    let text = `The list is quiet. ${count} people are waiting. They seem fine.`;

    if (topEntry) {
      const ms = Date.now() - new Date(topEntry.joined_at).getTime();
      const hours = (ms / (1000 * 60 * 60)).toFixed(1);
      text = `The person at #1 has held their position for ${hours} hours. No comment.`;
    }

    await db.query(
      `INSERT INTO activity_feed (event_type, display_text) VALUES ($1, $2)`,
      ['system', text]
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
