import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowUpCircle,
  Trophy,
  Users,
  Clock,
  Share2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Eye,
} from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import LiveCounter from '@/components/LiveCounter';
import ActivityFeed from '@/components/ActivityFeed';
import FAQ from '@/components/FAQ';
import Logo from '@/components/Logo';
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
  } catch { return []; }
}

async function getStats() {
  try {
    const supabase = createServerClient();
    const { count: total } = await supabase
      .from('waitlist_entries')
      .select('id', { count: 'exact', head: true });
    const { data: rev } = await supabase
      .from('waitlist_entries')
      .select('total_spent_cents');
    const revenue = (rev ?? []).reduce(
      (s: number, r: { total_spent_cents: number }) => s + (r.total_spent_cents ?? 0), 0
    );
    const { data: top } = await supabase
      .from('waitlist_entries')
      .select('top_spot_count')
      .order('top_spot_count', { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      total_waiters: total ?? 0,
      total_revenue_cents: revenue,
      top_spot_record: top?.top_spot_count ?? 0,
    };
  } catch {
    return { total_waiters: 0, total_revenue_cents: 0, top_spot_record: 0 };
  }
}

interface Props {
  searchParams: { ref?: string; error?: string };
}

export default async function HomePage({ searchParams }: Props) {
  const [feedItems, stats] = await Promise.all([getInitialFeedItems(), getStats()]);
  const referralCode = searchParams.ref;
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <a href="#how-it-works" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden sm:block">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden sm:block">
              Pricing
            </a>
            <Link href="/signin" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
              Sign in
            </Link>
            <a href="#join" className="text-sm font-semibold bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white transition-colors px-4 py-1.5 rounded-lg ml-1">
              Get in line
            </a>
          </div>
        </div>
      </nav>

      <main>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="hero-bg">
          <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20" id="join">

            {error && (
              <div className="mb-8 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3 text-sm text-amber-700">
                {error === 'token_expired' && 'That link has expired. Join again to get a new one.'}
                {error === 'token_not_found' && 'That link is invalid. Join the list again.'}
                {(error === 'invalid_token' || error === 'not_signed_in') && 'Sign in to access your dashboard.'}
              </div>
            )}

            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 border border-gray-200 bg-white rounded-full px-3.5 py-1.5 mb-10 shadow-sm">
              <span className="pulse-dot" />
              <span className="text-xs font-medium text-[#374151]">
                Now live &mdash; accepting entries globally
              </span>
            </div>

            {/* H1 — user's preferred copy */}
            <h1 className="text-[40px] sm:text-[66px] font-extrabold text-[#0A0A0A] leading-[1.03] tracking-tight max-w-3xl">
              Something is coming.<br />
              <span className="text-[#0D9488]">We&apos;re not ready</span><br />
              to share what it is yet.
            </h1>

            <p className="mt-6 text-[17px] sm:text-[19px] text-[#6B7280] max-w-lg leading-relaxed">
              Get in line &mdash; <strong className="text-[#0A0A0A] font-semibold">Waityr</strong>.
              Move up. Compete for #1.
              The waitlist <em>is</em> the product.
            </p>

            {/* Live count */}
            <div className="mt-5">
              <LiveCounter />
            </div>

            {/* Form */}
            <div className="mt-8">
              <WaitlistForm referralCode={referralCode} />
            </div>

            {/* Stats strip */}
            <div className="mt-14 pt-8 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6">
              {[
                { value: stats.total_waiters > 0 ? stats.total_waiters.toLocaleString() : '—', label: 'in queue' },
                { value: stats.total_revenue_cents > 0 ? `$${(stats.total_revenue_cents / 100).toFixed(0)}` : '$0', label: 'spent chasing #1' },
                { value: stats.top_spot_record > 0 ? stats.top_spot_record.toString() : '—', label: 'record #1 reclaims' },
                { value: '0', label: 'products shipped' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[26px] font-extrabold text-[#0A0A0A] tabular-nums tracking-tight">{s.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight mb-14">
              Three steps.<br className="sm:hidden" /> Infinite competition.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-5 h-5 text-[#0D9488]" />,
                  step: '01',
                  title: 'Join the queue',
                  body: 'Enter your email. Get a position number. Confirm your spot. You are now on the list.',
                },
                {
                  icon: <ArrowUpCircle className="w-5 h-5 text-[#0D9488]" />,
                  step: '02',
                  title: 'Move up',
                  body: 'Pay $1 to jump to a random higher position. Or pay $3 to go straight to #1. Immediately.',
                },
                {
                  icon: <Trophy className="w-5 h-5 text-[#0D9488]" />,
                  step: '03',
                  title: 'Hold your spot',
                  body: "Someone can pay $3 and take #1 from you at any time. That's the game. Hold on as long as you can.",
                },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0D9488]/10 flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    <span className="text-xs font-bold text-[#D1D5DB] tracking-widest">{s.step}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0A0A0A] mb-1.5">{s.title}</p>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What you get ─────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-20 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">What you get</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight mb-14">
              Everything included.<br />
              <span className="text-[#6B7280] font-normal text-xl sm:text-2xl">Which is a number, some competition, and a referral link.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <TrendingUp className="w-4 h-4 text-[#0D9488]" />, title: 'A live position number', body: 'Real. Updates instantly. Changes when you pay, when others pay, and when referrals happen.' },
                { icon: <Eye className="w-4 h-4 text-[#0D9488]" />, title: 'Full activity feed', body: 'Watch the queue move. Every join, every bump, every #1 takeover — happening live.' },
                { icon: <Zap className="w-4 h-4 text-[#0D9488]" />, title: 'Instant #1 access', body: '$3 and you are #1. No delays. The position updates before the page does.' },
                { icon: <Share2 className="w-4 h-4 text-[#0D9488]" />, title: 'Your referral link', body: 'Every signup through your link moves you up one spot. Free. No payment required.' },
                { icon: <Clock className="w-4 h-4 text-[#0D9488]" />, title: 'Time on the list', body: "We track how long you've held each position. The patience leaderboard is coming." },
                { icon: <ShieldCheck className="w-4 h-4 text-[#0D9488]" />, title: 'Radical transparency', body: "No product yet. Payments move your position only. Disclosed here, in the FAQ, and before every payment." },
              ].map((f, i) => (
                <div key={i} className="card-hover border border-gray-200 rounded-xl p-5 bg-white">
                  <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <p className="font-semibold text-[#0A0A0A] text-sm mb-1.5">{f.title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">Move up</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight mb-2">Simple pricing.</h2>
            <p className="text-[#6B7280] text-base mb-12">You probably shouldn&apos;t. But people do. They always do.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">

              {/* $0 */}
              <div className="card-hover border border-gray-200 rounded-xl p-6 bg-white flex flex-col">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#0A0A0A]">Stay put</p>
                  <p className="text-4xl font-extrabold text-[#0A0A0A] mt-2 tracking-tight">$0</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">You already have this.</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {['Your position, unchanged', 'Full activity feed', 'Referral link', 'No judgement'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <div className="border border-gray-200 rounded-lg py-2.5 text-center text-sm font-medium text-[#9CA3AF]">
                  Free forever
                </div>
              </div>

              {/* $1 — Recommended */}
              <div className="card-hover border-2 border-[#0D9488] rounded-xl p-6 bg-white flex flex-col relative shadow-sm">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0D9488] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                    Recommended
                  </span>
                </div>
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#0A0A0A]">Random Bump</p>
                  <p className="text-4xl font-extrabold text-[#0A0A0A] mt-2 tracking-tight">$1</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Move up. Somewhere.</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {['Jump to a random spot', 'Between here and #2', 'Not #1 — we said "random"', 'Results genuinely vary'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#0D9488] shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <div className="bg-[#0D9488] rounded-lg py-2.5 text-center text-sm font-semibold text-white">
                  Move Me Up — $1
                </div>
              </div>

              {/* $3 */}
              <div className="card-hover border border-gray-200 rounded-xl p-6 bg-white flex flex-col">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-[#0A0A0A]">Top of the List</p>
                  <p className="text-4xl font-extrabold text-[#0A0A0A] mt-2 tracking-tight">$3</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Until someone else does.</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {['Become #1 immediately', 'Everyone else moves down', 'Yours until someone pays $3', 'We told you upfront'].map((item, i) => (
                    <li key={i} className="text-sm text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <div className="border border-gray-200 rounded-lg py-2.5 text-center text-sm font-medium text-[#0A0A0A]">
                  I Want #1 — $3
                </div>
              </div>
            </div>
            <p className="mt-6 text-[11px] text-[#9CA3AF] max-w-md leading-relaxed">
              Payments move your position on the Waityr waitlist only. They do not purchase access to a product.
              The product is the waitlist. Refunds available within 24 hours, no questions asked.
            </p>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-20 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-12">What people are saying</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { quote: 'I joined the list. I received a number. The number felt real. I have no further comments.', name: 'A. Okafor', handle: 'Joined. Currently waiting.' },
                { quote: "I paid $3. I was #1 for nine minutes. Someone paid $3. I read the FAQ again. It was there. It had always been there.", name: 'T. Williams', handle: 'Former #1. Twice.' },
                { quote: 'My referral link worked. Three people joined. I moved up three spots. The system is exactly as described. I remain on the list.', name: 'M. Chen', handle: 'Referred 3. Still waiting.' },
              ].map((t, i) => (
                <div key={i} className="card-hover border border-gray-200 rounded-xl p-6 bg-white flex flex-col gap-5">
                  <p className="text-sm text-[#374151] leading-[1.75] flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-[#0A0A0A]">{t.name}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{t.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Activity Feed ────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Live activity</p>
              <span className="pulse-dot" />
            </div>
            <div className="max-w-2xl">
              <Suspense fallback={
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-5 w-full" />
                  ))}
                </div>
              }>
                <ActivityFeed initialItems={feedItems} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-gray-100 py-20 bg-gray-50/60">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-6">FAQ</p>
              <FAQ />
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
              Get in line.<br />
              <span className="text-[#0D9488]">The queue is already moving.</span>
            </h2>
            <p className="text-[#6B7280] mb-10 text-base max-w-sm mx-auto">
              {stats.total_waiters > 1
                ? `${stats.total_waiters.toLocaleString()} people are ahead of you right now.`
                : 'Be one of the first in line.'}
            </p>
            <div className="flex justify-center">
              <WaitlistForm referralCode={referralCode} />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/"><Logo size="sm" className="opacity-50" /></Link>
          <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
            The product is the waitlist.
            <span className="mx-2 opacity-40">·</span>
            Payments via Paystack.
            <span className="mx-2 opacity-40">·</span>
            © 2026 Waityr. Nothing is trademarked.
          </p>
        </div>
      </footer>
    </div>
  );
}
