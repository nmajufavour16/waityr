'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, type ActivityFeedItem } from '@/lib/supabase';
import CountUp from '@/components/CountUp';
import StackedActivityFeed from '@/components/StackedActivityFeed';
import { ToastContainer, useToast } from '@/components/Toast';
import {
  LogOut, Copy, Check, Pencil, X, ArrowUpCircle, Trophy,
  TrendingUp, Calendar, Zap,
} from 'lucide-react';

interface Entry {
  id: string;
  email: string;
  position: number;
  joined_at: string;
  confirmed: boolean;
  total_spent_cents: number;
  bump_count: number;
  top_spot_count: number;
  referral_code: string;
}

interface Props {
  entry: Entry;
  initialFeedItems: ActivityFeedItem[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
}

// ── Upgrade options (dashboard version — $1 recommended) ──────────────────────
function DashboardUpgradeOptions({ email }: { email: string }) {
  const [loading, setLoading] = useState<'random_bump' | 'top_spot' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pay = async (type: 'random_bump' | 'top_spot') => {
    setLoading(type); setError(null);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      window.location.href = data.authorization_url;
    } catch { setError('Could not connect. Try again.'); }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* $1 — Recommended */}
        <div className="border-2 border-[#0D9488] rounded-xl p-4 flex flex-col gap-3 relative">
          <div className="absolute -top-3 left-3">
            <span className="bg-[#0D9488] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">Random Bump</p>
            <p className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight mt-0.5">$1</p>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed flex-1">
            Jump to a random spot between here and #2. Not #1. We said "random."
          </p>
          <button
            onClick={() => pay('random_bump')}
            disabled={loading !== null}
            className="btn-teal w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading === 'random_bump' ? 'Redirecting...' : 'Move Me Up — $1'}
          </button>
        </div>

        {/* $3 */}
        <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">Top of the List</p>
            <p className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight mt-0.5">$3</p>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed flex-1">
            Become #1. Until someone else pays $3. This was disclosed.
          </p>
          <button
            onClick={() => pay('top_spot')}
            disabled={loading !== null}
            className="btn-teal w-full border border-gray-200 hover:border-gray-300 text-[#0A0A0A] font-semibold text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading === 'top_spot' ? 'Redirecting...' : 'I Want #1 — $3'}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
        Payments move your position only. No product access is purchased.
        The waitlist is the product.
      </p>
    </div>
  );
}

// ── Editable referral link ────────────────────────────────────────────────────
function ReferralCard({ initialCode, appUrl }: { initialCode: string; appUrl: string }) {
  const [code, setCode] = useState(initialCode);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialCode);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = `${appUrl}/?ref=${code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/waitlist/update-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: draft }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Update failed.'); return; }
      setCode(data.referral_code);
      setEditing(false);
    } catch { setError('Could not connect.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Refer a Waityr</p>
        {!editing && (
          <button onClick={() => { setEditing(true); setDraft(code); setError(null); }}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
        Every Waityr who joins through your link moves you up one spot. No payment required.
      </p>

      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError(null); }}
              placeholder="your-code"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
            />
            <button onClick={save} disabled={saving}
              className="bg-[#0D9488] text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-[#0f766e] transition-colors">
              {saving ? '...' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setError(null); }}
              className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-2">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-[10px] text-[#9CA3AF]">Letters, numbers, hyphens, underscores. 3–20 chars.</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-[#6B7280] font-mono break-all mb-3">
            {link}
          </div>
          <button onClick={copy}
            className="w-full border border-gray-200 hover:border-gray-300 text-sm font-medium text-[#0A0A0A] py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            {copied ? <><Check className="w-3.5 h-3.5 text-[#0D9488]" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
          </button>
        </>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardClient({ entry, initialFeedItems }: Props) {
  const [position, setPosition] = useState(entry.position);
  const prevPosition = useRef(entry.position);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://waityr.vercel.app';
  const days = daysSince(entry.joined_at);

  // Sign out
  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  // Live position updates + leapfrog notifications
  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`entry_${entry.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'waitlist_entries',
        filter: `id=eq.${entry.id}`,
      }, (payload) => {
        const newPos = (payload.new as Entry).position;
        const oldPos = prevPosition.current;
        if (newPos !== oldPos) {
          prevPosition.current = newPos;
          setPosition(newPos);
          if (newPos > oldPos) {
            // Someone leapfrogged this user
            addToast({
              type: 'leapfrog',
              message: 'Someone just jumped ahead of you.',
              subtext: `You moved from #${oldPos} to #${newPos}. Open your dashboard to move back up.`,
            });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [entry.id, addToast]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="space-y-8 anim-fade-up">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0A0A0A] tracking-tight font-display">Your spot.</h1>
            <p className="text-sm text-[#6B7280] mt-1">{entry.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Position card */}
            <div className="border border-gray-200 rounded-2xl p-6 anim-scale-in delay-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] mb-3">Your Position</p>
              <div className="flex items-end gap-5 mb-2">
                <CountUp
                  target={position}
                  duration={400}
                  prefix="#"
                  className="text-[72px] leading-none font-extrabold text-[#0D9488] tabular-nums tracking-tight"
                />
                <div className="pb-2 space-y-0.5">
                  <p className="text-sm text-[#6B7280]">
                    {days === 0 ? 'Joined today' : `${days} day${days !== 1 ? 's' : ''} on the list`}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    ${(entry.total_spent_cents / 100).toFixed(2)} spent total
                  </p>
                </div>
              </div>
              <DashboardUpgradeOptions email={entry.email} />
            </div>

            {/* Activity */}
            <div className="border border-gray-200 rounded-2xl p-6 anim-fade-up delay-2">
              <div className="flex items-center gap-2 mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">Live Activity</p>
                <span className="pulse-dot" />
              </div>
              <StackedActivityFeed initialItems={initialFeedItems} />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Stats */}
            <div className="border border-gray-200 rounded-2xl p-5 anim-fade-up delay-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] mb-4">Your Stats</p>
              <div className="space-y-4">
                {[
                  { icon: <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />, label: 'Joined', value: formatDate(entry.joined_at) },
                  { icon: <ArrowUpCircle className="w-3.5 h-3.5 text-[#0D9488]" />, label: 'Random bumps', value: entry.bump_count.toString() },
                  { icon: <Trophy className="w-3.5 h-3.5 text-[#0D9488]" />, label: 'Times held #1', value: entry.top_spot_count.toString() },
                  { icon: <TrendingUp className="w-3.5 h-3.5 text-[#0D9488]" />, label: 'Total spent', value: `$${(entry.total_spent_cents / 100).toFixed(2)}` },
                  { icon: <Zap className="w-3.5 h-3.5 text-[#0D9488]" />, label: 'Days on list', value: days === 0 ? 'Today' : `${days} days` },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-[#0D9488]/10 flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral */}
            <div className="anim-fade-up delay-4">
              <ReferralCard initialCode={entry.referral_code} appUrl={appUrl} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
