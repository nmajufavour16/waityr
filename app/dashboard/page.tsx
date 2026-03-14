import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) {
    redirect('/?error=not_signed_in');
  }

  const supabase = createServerClient();

  const { data: entry } = await supabase
    .from('waitlist_entries')
    .select(
      'id, email, position, joined_at, confirmed, total_spent_cents, bump_count, top_spot_count, referral_code'
    )
    .eq('email', email)
    .maybeSingle();

  if (!entry || !entry.confirmed) {
    redirect('/confirm');
  }

  // Initial activity feed
  const { data: feedItems } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold text-[#0A0A0A] tracking-tight"
          >
            Waityr
          </Link>
          <span className="text-sm text-[#6B7280]">{email}</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <DashboardClient
          entry={entry}
          initialFeedItems={feedItems ?? []}
        />
      </main>
    </div>
  );
}
