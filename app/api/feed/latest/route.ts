import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { rows } = await db.query(
      'SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json({ items: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
