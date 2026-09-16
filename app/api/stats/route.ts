import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { maskEmail } from '@/lib/positions';

export const revalidate = 30; // Next.js route cache: 30 seconds

export async function GET() {
  try {
    // Total waiters
    const { rows: countRows } = await db.query('SELECT COUNT(id) FROM waitlist_entries WHERE confirmed = true');
    const totalWaiters = parseInt(countRows[0].count || '0', 10);

    // Total revenue
    const { rows: revenueRows } = await db.query('SELECT SUM(total_spent_cents) FROM waitlist_entries');
    const totalRevenueCents = parseInt(revenueRows[0].sum || '0', 10);

    // Top spot record
    const { rows: topSpotRows } = await db.query('SELECT email, top_spot_count FROM waitlist_entries ORDER BY top_spot_count DESC LIMIT 1');
    const topSpotData = topSpotRows.length > 0 ? topSpotRows[0] : null;

    const topSpotRecordPurchases = topSpotData?.top_spot_count ?? 0;
    const topSpotRecordMasked = topSpotData?.email
      ? maskEmail(topSpotData.email)
      : null;

    // How long has #1 been waiting
    const { rows: numberOneRows } = await db.query('SELECT joined_at FROM waitlist_entries WHERE position = 1 LIMIT 1');
    const numberOne = numberOneRows.length > 0 ? numberOneRows[0] : null;

    let numberOneTenureHours = 0;
    if (numberOne?.joined_at) {
      const ms = Date.now() - new Date(numberOne.joined_at).getTime();
      numberOneTenureHours = Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
    }

    return NextResponse.json(
      {
        total_waiters: totalWaiters ?? 0,
        total_revenue_cents: totalRevenueCents,
        top_spot_record_purchases: topSpotRecordPurchases,
        top_spot_record_holder_masked_email: topSpotRecordMasked,
        number_one_tenure_hours: numberOneTenureHours,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json(
      { total_waiters: 0, total_revenue_cents: 0, top_spot_record_purchases: 0 },
      { status: 500 }
    );
  }
}
