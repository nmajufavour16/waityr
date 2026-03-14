import { Suspense } from 'react';
import Link from 'next/link';
import WaitlistForm from '@/components/WaitlistForm';
import LiveCounter from '@/components/LiveCounter';
import ActivityFeed from '@/components/ActivityFeed';
import SocialProofStats from '@/components/SocialProofStats';
import FAQ from '@/components/FAQ';
import { createServerClient } from '@/lib/supabase';
import type { ActivityFeedItem } from '@/lib/supabase';

// Fetch initial feed items server-side
async function getInitialFeedItems(): Promise<ActivityFeedItem[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    return (data ?? []) as ActivityFeedItem[];
  } catch {
    return [];
  }
}

interface Props {
  searchParams: { ref?: string; error?: string };
}

export default async function HomePage({ searchParams }: Props) {
  const initialFeedItems = await getInitialFeedItems();
  const referralCode = searchParams.ref;
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            Waityr
          </span>
          <Link
            href="/dashboard"
            className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-20 sm:pt-28">
          {/* Error banner */}
          {error && (
            <div className="mb-8 border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#6B7280]">
              {error === 'token_expired' &&
                'That confirmation link has expired. Join the list again.'}
              {error === 'token_not_found' &&
                'That confirmation link is invalid. Join the list again.'}
              {error === 'invalid_token' &&
                'Something went wrong. Join the list again.'}
            </div>
          )}

          <h1 className="text-[36px] sm:text-[56px] font-bold text-[#0A0A0A] leading-[1.1] tracking-tight">
            Something is coming.
          </h1>
          <p className="mt-4 text-[18px] sm:text-[24px] text-[#6B7280] font-normal">
            Get in line.
          </p>

          {/* Live counter */}
          <div className="mt-6">
            <LiveCounter />
          </div>

          {/* Waitlist form */}
          <div className="mt-8">
            <WaitlistForm referralCode={referralCode} />
          </div>

          {/* Disclosure */}
          <p className="mt-8 text-xs text-[#9CA3AF] max-w-md leading-relaxed">
            There is currently no product being built. The waitlist is the
            product. Payments move your position on this list and do not
            purchase access to anything else.
          </p>
        </section>

        {/* ── Activity Feed ─────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-widest mb-6">
                Activity
              </h2>
              <Suspense fallback={
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-5 rounded w-full" />
                  ))}
                </div>
              }>
                <ActivityFeed initialItems={initialFeedItems} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ── Social Proof Stats ────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <SocialProofStats />
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-widest mb-6">
                Questions
              </h2>
              <FAQ />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-[#0A0A0A]">Waityr</span>
          <p className="text-xs text-[#9CA3AF] text-center">
            The product is the waitlist.{' '}
            <span className="mx-1">·</span>
            Payments processed securely by Paystack.
          </p>
        </div>
      </footer>
    </div>
  );
}
