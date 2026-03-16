'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createBrowserClient, type ActivityFeedItem } from '@/lib/supabase';

const MAX_ITEMS = 50;
const STACK_VISIBLE = 4;
const AUTO_CYCLE_MS = 3500;

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function eventColor(type: ActivityFeedItem['event_type']) {
  switch (type) {
    case 'top_spot':      return 'bg-amber-400';
    case 'random_bump':   return 'bg-[#0D9488]';
    case 'referral_bump': return 'bg-purple-400';
    case 'joined':        return 'bg-blue-400';
    default:              return 'bg-gray-300';
  }
}

interface StackCardProps {
  item: ActivityFeedItem;
  index: number;
  onDismiss: () => void;
  isAnimatingOut: boolean;
}

function StackCard({ item, index, onDismiss, isAnimatingOut }: StackCardProps) {
  const isTop = index === 0;
  const scale = 1 - index * 0.04;
  const translateY = index * 10;
  const opacity = index > STACK_VISIBLE - 1 ? 0 : 1 - index * 0.15;
  const zIndex = 20 - index;

  const style: React.CSSProperties = isAnimatingOut && isTop
    ? { zIndex: 30, transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)', transform: 'translateY(-28px) scale(0.96)', opacity: 0 }
    : {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        zIndex,
        transition: isTop ? undefined : 'all 0.38s cubic-bezier(0.22,1,0.36,1)',
      };

  return (
    <div
      className={`absolute inset-x-0 glass-card rounded-2xl px-5 py-4 cursor-pointer select-none
        ${isTop ? 'hover:shadow-lg transition-shadow duration-200' : 'pointer-events-none'}
      `}
      style={style}
      onClick={isTop ? onDismiss : undefined}
    >
      <div className="flex items-start gap-3">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${eventColor(item.event_type)}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${
            item.event_type === 'system' ? 'text-[#9CA3AF] italic' : 'text-[#374151]'
          }`}>
            {item.display_text}
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">{formatRelativeTime(item.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialItems?: ActivityFeedItem[];
}

export default function StackedActivityFeed({ initialItems = [] }: Props) {
  const [items, setItems] = useState<ActivityFeedItem[]>(initialItems);
  const [dismissing, setDismissing] = useState(false);
  const mounted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cycle = useCallback(() => {
    if (dismissing) return;
    setDismissing(true);
    setTimeout(() => {
      setItems((prev) => {
        if (prev.length <= 1) return prev;
        return [...prev.slice(1), prev[0]];
      });
      setDismissing(false);
    }, 340);
  }, [dismissing]);

  // Auto-cycle
  useEffect(() => {
    timerRef.current = setInterval(cycle, AUTO_CYCLE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cycle]);

  // Reset timer on manual tap
  const handleManualCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    cycle();
    timerRef.current = setInterval(cycle, AUTO_CYCLE_MS);
  }, [cycle]);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const supabase = createBrowserClient();

    if (initialItems.length === 0) {
      supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_ITEMS)
        .then(({ data }) => { if (data) setItems(data as ActivityFeedItem[]); });
    }

    const channel = supabase
      .channel('feed_stack')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_feed' }, (payload) => {
        setItems((prev) => [payload.new as ActivityFeedItem, ...prev].slice(0, MAX_ITEMS));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [initialItems]);

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl px-5 py-8 text-center">
        <p className="text-sm text-[#9CA3AF]">The list is new. Be the first.</p>
      </div>
    );
  }

  const stackItems = items.slice(0, STACK_VISIBLE);
  const stackHeight = 80 + (Math.min(stackItems.length - 1, STACK_VISIBLE - 1)) * 10;

  return (
    <div className="space-y-4">
      <div className="relative w-full" style={{ height: `${stackHeight}px` }}>
        {[...stackItems].reverse().map((item, revIdx) => {
          const idx = stackItems.length - 1 - revIdx;
          return (
            <StackCard
              key={item.id}
              item={item}
              index={idx}
              onDismiss={handleManualCycle}
              isAnimatingOut={dismissing && idx === 0}
            />
          );
        })}
      </div>

      {items.length > STACK_VISIBLE && (
        <div className="mt-2 space-y-0 border border-gray-100 rounded-xl overflow-hidden">
          {items.slice(STACK_VISIBLE).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${eventColor(item.event_type)}`} />
              <p className={`text-sm flex-1 leading-relaxed ${
                item.event_type === 'system' ? 'text-[#9CA3AF] italic' : 'text-[#374151]'
              }`}>
                {item.display_text}
              </p>
              <span className="text-[11px] text-[#9CA3AF] shrink-0 pt-0.5">{formatRelativeTime(item.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    }
