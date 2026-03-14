import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { maskEmail } from '@/lib/positions';

export const revalidate = 30; // Next.js route cache: 30 seconds

export async function GET() {
  try {
    const supabase = createServerClient();

    // Total waiters
    const { count: totalWaiters } = await supabase
      .from('waitlist_entries')
      .select('id', { count: 'exact', head: true });

    // Total revenue
    const { data: revenueData } = await supabase
      .from('waitlist_entries')
      .select('total_spent_cents');

    const totalRevenueCents = (revenueData ?? []).reduce(
      (sum, row) => sum + (row.total_spent_cents ?? 0),
      0
    );

    // Top spot record (most times reclaimed #1)
    const { data: topSpotData } = await supabase
      .from('waitlist_entries')
      .select('email, top_spot_count')
      .order('top_spot_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    const topSpotRecordPurchases = topSpotData?.top_spot_count ?? 0;
    const topSpotRecordMasked = topSpotData?.email
      ? maskEmail(topSpotData.email)
      : null;

    // How long has #1 been waiting
    const { data: numberOne } = await supabase
      .from('waitlist_entries')
      .select('joined_at')
      .eq('position', 1)
      .maybeSingle();

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
