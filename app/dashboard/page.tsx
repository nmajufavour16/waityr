import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import Logo from '@/components/Logo';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) redirect('/?error=not_signed_in');

  const supabase = createServerClient();
  const { data: entry } = await supabase
    .from('waitlist_entries')
    .select('id, email, position, joined_at, confirmed, total_spent_cents, bump_count, top_spot_count, referral_code')
    .eq('email', email)
    .maybeSingle();

  if (!entry || !entry.confirmed) redirect('/confirm');

  const { data: feedItems } = await supabase
    .from('activity_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>
          {/* Sign out only — no "Get in line" clutter */}
          <DashboardSignOut />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <DashboardClient entry={entry} initialFeedItems={feedItems ?? []} />
      </main>
    </div>
  );
}

// Thin server-renderable wrapper — actual sign-out logic is in DashboardClient
function DashboardSignOut() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
      >
        Sign out
      </button>
    </form>
  );
}
