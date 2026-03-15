import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WaitlistForm from '@/components/WaitlistForm';
import LiveCounter from '@/components/LiveCounter';
import ActivityFeed from '@/components/ActivityFeed';
import FAQ from '@/components/FAQ';
import { createServerClient } from '@/lib/supabase';
import type { ActivityFeedItem } from '@/lib/supabase';

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

async function getStats() {
  try {
    const supabase = createServerClient();
    const { count: totalWaiters } = await supabase
      .from('waitlist_entries')
      .select('id', { count: 'exact', head: true });
    const { data: revenueData } = await supabase
      .from('waitlist_entries')
      .select('total_spent_cents');
    const totalRevenue = (revenueData ?? []).reduce(
      (sum: number, r: { total_spent_cents: number }) => sum + (r.total_spent_cents ?? 0), 0
    );
    const { data: topSpot } = await supabase
      .from('waitlist_entries')
      .select('top_spot_count')
      .order('top_spot_count', { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      total_waiters: totalWaiters ?? 0,
      total_revenue_cents: totalRevenue,
      top_spot_record: topSpot?.top_spot_count ?? 0,
    };
  } catch {
    return { total_waiters: 0, total_revenue_cents: 0, top_spot_record: 0 };
  }
}

interface Props {
  searchParams: { ref?: string; error?: string };
}

export default async function HomePage({ searchParams }: Props) {
  const [initialFeedItems, stats] = await Promise.all([
    getInitialFeedItems(),
    getStats(),
  ]);

  const referralCode = searchParams.ref;
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Waityr"
              width={96}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors hidden sm:block">What you get</a>
            <a href="#faq" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors hidden sm:block">FAQ</a>
            <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <main>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28">
          {error && (
            <div className="mb-8 border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#6B7280]">
              {error === 'token_expired' && 'That confirmation link has expired. Join the list again.'}
              {error === 'token_not_found' && 'That confirmation link is invalid. Join the list again.'}
              {error === 'invalid_token' && 'Something went wrong. Join the list again.'}
            </div>
          )}

          <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-xs text-[#6B7280]">Now live — accepting entries globally</span>
          </div>

          <h1 className="text-[40px] sm:text-[64px] font-bold text-[#0A0A0A] leading-[1.05] tracking-tight max-w-2xl">
            The last waitlist<br />you&apos;ll ever <span className="text-[#0D9488]">need.</span>
          </h1>

          <p className="mt-5 text-[17px] sm:text-[20px] text-[#6B7280] max-w-xl leading-relaxed">
            Something is coming. We&apos;re not ready to share what it is yet.
            Get in line. Move up. Compete for #1. There is no product behind this.
            The waitlist <em>is</em> the product.
          </p>

          <div className="mt-6">
            <LiveCounter />
          </div>

          <div className="mt-8">
            <WaitlistForm referralCode={referralCode} />
          </div>

          {/* Stat strip */}
          <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: stats.total_waiters.toLocaleString(), label: 'people waiting' },
              { value: `$${(stats.total_revenue_cents / 100).toLocaleString()}`, label: 'spent to move up' },
              { value: stats.top_spot_record.toString(), label: 'record #1 reclaims' },
              { value: '0', label: 'products shipped' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-[#0A0A0A] tabular-nums">{s.value}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section id="features" className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-12">What you get</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { symbol: '◻', title: 'A number', body: 'Your position on the list. It is a real number. It will change. This is the core feature.' },
                { symbol: '◻', title: 'Uncertainty', body: 'No ETA. No roadmap. No update emails. The product is coming. We are not ready to share when.' },
                { symbol: '◻', title: 'Competition', body: 'Anyone can pay $3 and take #1. At any time. Including right now. Including while you are reading this.' },
                { symbol: '◻', title: 'Transparency', body: 'We have told you exactly what this is. The FAQ is complete. Re-read it if needed. Nothing is hidden.' },
                { symbol: '◻', title: 'A referral link', body: 'Share it. Every person who joins through your link moves you up one spot. Free. No payment required.' },
                { symbol: '◻', title: 'The experience', body: 'Anticipation is a feeling. This product delivers it. That is all it delivers. We are being honest.' },
              ].map((f, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <p className="text-lg text-[#0D9488] mb-3">{f.symbol}</p>
                  <p className="font-semibold text-[#0A0A0A] mb-2">{f.title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-gray-100 py-20 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Move up</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-2">Simple, honest pricing.</h2>
            <p className="text-[#6B7280] text-sm mb-12">You probably shouldn&apos;t. But people do.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div className="border border-gray-200 rounded-lg p-6 bg-white flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-[#0A0A0A]">Stay where you are</p>
                  <p className="text-3xl font-bold text-[#0A0A0A] mt-1">$0</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Your current position', 'Activity feed access', 'Referral link', 'No judgement'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex gap-2"><span className="text-gray-300">—</span>{item}</li>
                  ))}
                </ul>
                <p className="text-xs text-[#9CA3AF]">You already have this.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-[#0A0A0A]">Random Bump</p>
                  <p className="text-3xl font-bold text-[#0A0A0A] mt-1">$1</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Move to a random spot', 'Between here and #2', 'Not #1. We said "random."', 'Results may vary'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex gap-2"><span className="text-[#0D9488]">—</span>{item}</li>
                  ))}
                </ul>
                <p className="text-xs text-[#9CA3AF]">Confirm your email first.</p>
              </div>

              <div className="border-2 border-[#0D9488] rounded-lg p-6 bg-white flex flex-col gap-4 relative">
                <div className="absolute -top-3 left-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-[#0D9488] text-white px-2 py-0.5 rounded-full">Most purchased</span>
                </div>
                <div>
                  <p className="font-semibold text-[#0A0A0A]">Top of the List</p>
                  <p className="text-3xl font-bold text-[#0A0A0A] mt-1">$3</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {['Become #1. Immediately.', 'Until someone else pays $3', 'This was disclosed upfront', 'We told you'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex gap-2"><span className="text-[#0D9488]">—</span>{item}</li>
                  ))}
                </ul>
                <p className="text-xs text-[#9CA3AF]">Confirm your email first.</p>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-[#9CA3AF] max-w-lg leading-relaxed">
              Payments move your position on the Waityr waitlist. They do not purchase access to a product.
              The product is the waitlist. This is disclosed because we believe in honesty.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-12">What people are saying</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  quote: 'I joined the list. I received a number. The number was real. I have no further feedback.',
                  name: 'A. Okafor',
                  handle: '@aokafor · Joined. Waiting.',
                },
                {
                  quote: 'I paid $3. I was #1 for eleven minutes. Someone paid $3. I became #2. This was in the FAQ. I had read the FAQ.',
                  name: 'T. Williams',
                  handle: '@twilliams · Former #1',
                },
                {
                  quote: 'I used my referral link. Three people signed up. I moved up three spots. The system works as described. I am still waiting.',
                  name: 'M. Chen',
                  handle: '@mchen · Referred 3',
                },
              ].map((t, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <p className="text-sm text-[#374151] leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{t.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{t.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section id="activity" className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-6">Activity</p>
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

        {/* FAQ */}
        <section id="faq" className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-6">FAQ</p>
              <FAQ />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-gray-100 py-20 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-3">
              Stop waiting to wait.<br />
              <span className="text-[#0D9488]">Start waiting now.</span>
            </h2>
            <p className="text-[#6B7280] text-sm mb-8">
              Join {stats.total_waiters > 0 ? stats.total_waiters.toLocaleString() : 'others'} already in line.
            </p>
            <div className="flex justify-center">
              <WaitlistForm referralCode={referralCode} />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="Waityr" width={72} height={24} className="h-5 w-auto opacity-60" />
          </Link>
          <p className="text-xs text-[#9CA3AF] text-center">
            The product is the waitlist.
            <span className="mx-2">·</span>
            Payments processed securely by Paystack.
            <span className="mx-2">·</span>
            © 2026 Waityr. Nothing is trademarked.
          </p>
        </div>
      </footer>
    </div>
  );
}
