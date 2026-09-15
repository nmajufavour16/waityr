import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import Logo from '@/components/Logo';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) redirect('/?error=not_signed_in');

  const { rows: entryRows } = await db.query(
    'SELECT id, email, position, joined_at, confirmed, total_spent_cents, bump_count, top_spot_count, referral_code FROM waitlist_entries WHERE email = $1 LIMIT 1',
    [email]
  );
  const entry = entryRows.length > 0 ? entryRows[0] : null;

  if (!entry || !entry.confirmed) redirect('/confirm');

  const { rows: feedItems } = await db.query(
    'SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 50'
  );

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
