import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowUpCircle, Trophy, Users, Clock,
  Share2, ShieldCheck, Zap, TrendingUp, Eye,
} from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import LiveCounter from '@/components/LiveCounter';
import StackedActivityFeed from '@/components/StackedActivityFeed';
import FAQ from '@/components/FAQ';
import Logo from '@/components/Logo';
import { createServerClient } from '@/lib/supabase';
import type { ActivityFeedItem } from '@/lib/supabase';

async function getInitialFeedItems(): Promise<ActivityFeedItem[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('activity_feed').select('*')
      .order('created_at', { ascending: false }).limit(50);
    return (data ?? []) as ActivityFeedItem[];
  } catch { return []; }
}

async function getStats() {
  try {
    const supabase = createServerClient();
    const { count: total } = await supabase
      .from('waitlist_entries').select('id', { count: 'exact', head: true });
    const { data: rev } = await supabase
      .from('waitlist_entries').select('total_spent_cents');
    const revenue = (rev ?? []).reduce(
      (s: number, r: { total_spent_cents: number }) => s + (r.total_spent_cents ?? 0), 0
    );
    const { data: top } = await supabase
      .from('waitlist_entries').select('top_spot_count')
      .order('top_spot_count', { ascending: false }).limit(1).maybeSingle();
    return { total_waiters: total ?? 0, total_revenue_cents: revenue, top_spot_record: top?.top_spot_count ?? 0 };
  } catch { return { total_waiters: 0, total_revenue_cents: 0, top_spot_record: 0 }; }
}

interface Props { searchParams: { ref?: string; error?: string }; }

export default async function HomePage({ searchParams }: Props) {
  const [feedItems, stats] = await Promise.all([getInitialFeedItems(), getStats()]);
  const { ref: referralCode, error } = searchParams;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>
          <div className="flex items-center gap-1">
            <a href="#how-it-works" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden md:block">How it works</a>
            <a href="#pricing" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden md:block">Pricing</a>
            <a href="#faq" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden md:block">FAQ</a>
            <Link href="/signin" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">Sign in</Link>
            <a href="#join" className="text-sm font-semibold bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white transition-colors px-4 py-1.5 rounded-lg ml-1 btn-teal">Get in line</a>
          </div>
        </div>
      </nav>

      <main>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="hero-bg" id="join">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">

            {error && (
              <div className="mb-8 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-700 anim-fade-in">
                {error === 'token_expired' && 'That link has expired. Join again to get a new one.'}
                {error === 'token_not_found' && 'That link is invalid.'}
                {(error === 'invalid_token' || error === 'not_signed_in') && 'Sign in to access your dashboard.'}
              </div>
            )}

            <div className="max-w-2xl mx-auto text-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2.5 border border-gray-200 bg-white rounded-full px-3.5 py-1.5 mb-10 shadow-sm anim-fade-in mx-auto">
                  <span className="pulse-dot" />
                  <span className="text-xs font-medium text-[#374151]">Now live &mdash; accepting Waityrs globally</span>
                </div>

                <h1 className="text-[44px] sm:text-[60px] lg:text-[68px] font-semibold text-[#0A0A0A] leading-[1.02] tracking-tight anim-fade-up delay-1 mx-auto font-display">
                  Something is<br />coming.{' '}
                  <span className="text-[#0D9488]"><em>Get in line!</em></span>
                </h1>

                <p className="mt-5 text-[17px] sm:text-[19px] text-[#6B7280] max-w-md leading-relaxed anim-fade-up delay-2 mx-auto">
                  We can&apos;t tell you what it is, yet.
                  But it&apos;s going to be something.
                </p>

                <div className="mt-5 anim-fade-up delay-3">
                  <LiveCounter />
                </div>

                <div className="mt-7 anim-fade-up delay-4 flex justify-center">
                  <WaitlistForm referralCode={referralCode} />
                </div>
              </div>


            </div>

            {/* Stats strip — all screen sizes */}
            <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-6 anim-fade-up delay-5">
              {[
                { value: stats.total_waiters > 0 ? stats.total_waiters.toLocaleString() : '—', label: 'Waityrs in queue' },
                { value: stats.total_revenue_cents > 0 ? `$${(stats.total_revenue_cents / 100).toFixed(0)}` : '$0', label: 'Spent chasing #1' },
                { value: stats.top_spot_record > 0 ? stats.top_spot_record.toString() : '—', label: 'Record #1 reclaims' },
                { value: '0', label: 'Products shipped' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[24px] font-extrabold text-[#0A0A0A] tabular-nums tracking-tight">{s.value}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-gray-100 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#0A0A0A] tracking-tight font-display">
                Three steps. Infinite competition.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
              {[
                { icon: <Users className="w-5 h-5 text-[#0D9488]" />, step: '01', title: 'Join as a Waityr', body: 'Enter your email. Get a position number. Confirm your spot. You are now on the list.' },
                { icon: <ArrowUpCircle className="w-5 h-5 text-[#0D9488]" />, step: '02', title: 'Move up', body: 'Pay $1 to jump to a random higher position. Or pay $3 to go straight to #1. Immediately.' },
                { icon: <Trophy className="w-5 h-5 text-[#0D9488]" />, step: '03', title: 'Hold your spot', body: "Someone can pay $3 and take #1 from you at any time. That's the game. Hold on as long as you can." },
              ].map((s, i) => (
                <div key={i} className="card-hover border border-gray-200 rounded-2xl p-6 bg-white">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 flex items-center justify-center">{s.icon}</div>
                    <span className="text-xs font-bold text-[#D1D5DB] tracking-widest">{s.step}</span>
                  </div>
                  <p className="font-bold text-[#0A0A0A] mb-2">{s.title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What you get ─────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-24 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">What every Waityr gets</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#0A0A0A] tracking-tight font-display">
                Everything included.
              </h2>
              <p className="text-[#6B7280] mt-3 text-lg">Which is a number, some competition, and a referral link.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <TrendingUp className="w-4 h-4 text-[#0D9488]" />, title: 'A live position number', body: 'Real. Updates instantly. Changes when you pay, when others pay, when referrals happen.' },
                { icon: <Eye className="w-4 h-4 text-[#0D9488]" />, title: 'Full activity feed', body: 'Watch every Waityr join, bump up, and fight for #1 — happening live in front of you.' },
                { icon: <Zap className="w-4 h-4 text-[#0D9488]" />, title: 'Instant #1 access', body: '$3 and you are #1. No delays. The position updates before the page does.' },
                { icon: <Share2 className="w-4 h-4 text-[#0D9488]" />, title: 'Your referral link', body: 'Every Waityr who joins through your link moves you up one spot. Free. No payment required.' },
                { icon: <Clock className="w-4 h-4 text-[#0D9488]" />, title: 'Time on the list', body: "We track how long you've held each position. The patience leaderboard is coming." },
                { icon: <ShieldCheck className="w-4 h-4 text-[#0D9488]" />, title: 'Radical transparency', body: "No product yet. Payments move your position only. Stated here, in the FAQ, and before every payment." },
              ].map((f, i) => (
                <div key={i} className="card-hover border border-gray-200 rounded-xl p-5 bg-white">
                  <div className="w-8 h-8 rounded-lg bg-[#0D9488]/10 flex items-center justify-center mb-4">{f.icon}</div>
                  <p className="font-semibold text-[#0A0A0A] text-sm mb-1.5">{f.title}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="border-t border-gray-100 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-lg mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">Move up</p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#0A0A0A] tracking-tight mb-2 font-display">Simple pricing.</h2>
              <p className="text-[#6B7280] text-lg">You probably shouldn&apos;t. But Waityrs do. They always do.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">

              <div className="card-hover border border-gray-200 rounded-2xl p-6 bg-white flex flex-col">
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
                <div className="border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-[#9CA3AF]">Free forever</div>
              </div>

              {/* $1 — Recommended */}
              <div className="card-hover border-2 border-[#0D9488] rounded-2xl p-6 bg-white flex flex-col relative shadow-md">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0D9488] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
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
                <div className="btn-teal bg-[#0D9488] rounded-xl py-2.5 text-center text-sm font-semibold text-white cursor-pointer">
                  Move Me Up — $1
                </div>
              </div>

              {/* $3 */}
              <div className="card-hover border border-gray-200 rounded-2xl p-6 bg-white flex flex-col">
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
                <div className="border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-[#0A0A0A]">I Want #1 — $3</div>
              </div>
            </div>
            <p className="mt-6 text-[11px] text-[#9CA3AF] max-w-md leading-relaxed mx-auto text-center">
              Payments move your Waityr position only. The waitlist is the product.
            </p>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-24 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-14 text-center">What Waityrs are saying</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { quote: 'I joined the list. I received a number. The number was real. I have no further comments.', name: 'A. Okafor', handle: 'Waityr. Currently waiting.' },
                { quote: "I paid $3. I was #1 for nine minutes. Someone paid $3. I read the FAQ again. It was there. It had always been there.", name: 'T. Williams', handle: 'Former #1. Twice.' },
                { quote: 'My referral link worked. Three Waityrs joined. I moved up three spots. The system is exactly as described. I remain on the list.', name: 'M. Chen', handle: 'Referred 3. Still waiting.' },
              ].map((t, i) => (
                <div key={i} className="card-hover border border-gray-200 rounded-2xl p-6 bg-white flex flex-col gap-5">
                  <p className="text-sm text-[#374151] leading-[1.8] flex-1">&ldquo;{t.quote}&rdquo;</p>
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
        <section className="border-t border-gray-100 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-3 mb-3 justify-center lg:justify-start">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Live activity</p>
                  <span className="pulse-dot" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A0A0A] tracking-tight mb-3 font-display">
                  The queue is moving.<br />
                  <span className="text-[#0D9488]">Right now.</span>
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-sm mx-auto lg:mx-0">
                  Every join, every bump, every Waityr who just paid to become #1 —
                  all of it, live. Tap the top card to cycle through.
                </p>
              </div>
              <div>
                <Suspense fallback={<div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>}>
                  <StackedActivityFeed initialItems={feedItems} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-gray-100 py-24 bg-gray-50/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-6 text-center">FAQ</p>
              <FAQ />
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-28">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-[#0A0A0A] tracking-tight mb-4 leading-tight font-display">
              Get in line.<br />
              <span className="text-[#0D9488]">The queue is already moving.</span>
            </h2>
            <p className="text-[#6B7280] mb-10 text-lg max-w-sm mx-auto">
              {stats.total_waiters > 1
                ? `${stats.total_waiters.toLocaleString()} Waityrs are ahead of you right now.`
                : 'Be one of the first Waityrs in line.'}
            </p>
            <div className="flex justify-center">
              <WaitlistForm referralCode={referralCode} />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <Link href="/"><Logo size="md" className="opacity-70" /></Link>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#how-it-works" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">How it works</a>
              <a href="#pricing" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">FAQ</a>
              <Link href="/privacy" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Terms</Link>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#9CA3AF]">© 2026 Waityr. Something is coming.</p>
            <p className="text-xs text-[#9CA3AF]">Payments via Paystack. The waitlist is the product.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
