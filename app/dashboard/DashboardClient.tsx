'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient, type ActivityFeedItem } from '@/lib/supabase';
import CountUp from '@/components/CountUp';
import UpgradeOptions from '@/components/UpgradeOptions';
import ActivityFeed from '@/components/ActivityFeed';

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardClient({ entry, initialFeedItems }: Props) {
  const [position, setPosition] = useState(entry.position);
  const [copied, setCopied] = useState(false);
  const prevPosition = useRef(entry.position);
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://waityr.com';

  const referralLink = `${appUrl}/?ref=${entry.referral_code}`;

  useEffect(() => {
    const supabase = createBrowserClient();

    // Subscribe to position changes for this specific entry
    const channel = supabase
      .channel(`entry_${entry.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'waitlist_entries',
          filter: `id=eq.${entry.id}`,
        },
        (payload) => {
          const newPos = (payload.new as Entry).position;
          if (newPos !== prevPosition.current) {
            prevPosition.current = newPos;
            setPosition(newPos);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entry.id]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const days = daysSince(entry.joined_at);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Your spot.</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Everything you need to know about your position on the list.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — primary cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Position */}
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-4">
              Your Position
            </p>
            <div className="flex items-end gap-4 mb-6">
              <CountUp
                target={position}
                duration={400}
                prefix="#"
                className="text-[64px] leading-none font-bold text-[#0D9488] tabular-nums"
              />
              <div className="pb-2 text-sm text-[#6B7280]">
                <p>
                  {days === 0 ? 'Joined today' : `${days} ${days === 1 ? 'day' : 'days'} on the list`}
                </p>
                <p>
                  ${(entry.total_spent_cents / 100).toFixed(2)} spent total
                </p>
              </div>
            </div>

            {/* Upgrade options */}
            <UpgradeOptions email={entry.email} />
          </div>

          {/* Activity Feed */}
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-4">
              Activity
            </p>
            <ActivityFeed initialItems={initialFeedItems} />
          </div>
        </div>

        {/* Right column — secondary cards */}
        <div className="space-y-6">
          {/* Your Stats */}
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-4">
              Your Stats
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#9CA3AF]">Joined</p>
                <p className="text-sm text-[#0A0A0A] font-medium">
                  {formatDate(entry.joined_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">Random bumps purchased</p>
                <p className="text-sm text-[#0A0A0A] font-medium">
                  {entry.bump_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">Times held #1</p>
                <p className="text-sm text-[#0A0A0A] font-medium">
                  {entry.top_spot_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">Total spent</p>
                <p className="text-sm text-[#0A0A0A] font-medium">
                  ${(entry.total_spent_cents / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Referral */}
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-2">
              Refer a Friend
            </p>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
              Every signup through your link moves you up 1 spot. No payment
              required.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#6B7280] font-mono break-all mb-3">
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="w-full border border-gray-200 hover:border-gray-300 text-sm font-medium text-[#0A0A0A] py-2 px-4 rounded-lg transition-colors"
            >
              {copied ? 'Copied.' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
