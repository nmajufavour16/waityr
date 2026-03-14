'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient, type ActivityFeedItem } from '@/lib/supabase';

const MAX_ITEMS = 50;

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface FeedItemProps {
  item: ActivityFeedItem;
  isNew?: boolean;
}

function FeedItem({ item, isNew }: FeedItemProps) {
  const isSystem = item.event_type === 'system';

  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0 ${
        isNew ? 'animate-feed-item' : ''
      }`}
    >
      <p
        className={`text-sm leading-relaxed flex-1 ${
          isSystem ? 'text-[#9CA3AF] italic' : 'text-[#374151]'
        }`}
      >
        {item.display_text}
      </p>
      <span className="text-xs text-[#9CA3AF] shrink-0 pt-0.5">
        {formatRelativeTime(item.created_at)}
      </span>
    </div>
  );
}

interface Props {
  initialItems?: ActivityFeedItem[];
}

export default function ActivityFeed({ initialItems = [] }: Props) {
  const [items, setItems] = useState<ActivityFeedItem[]>(initialItems);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const supabase = createBrowserClient();

    // Initial fetch if no SSR data
    if (initialItems.length === 0) {
      supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_ITEMS)
        .then(({ data }) => {
          if (data) setItems(data as ActivityFeedItem[]);
        });
    }

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          const newItem = payload.new as ActivityFeedItem;
          setItems((prev) => {
            const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
            return updated;
          });
          setNewIds((prev) => {
            const next = new Set(prev);
            next.add(newItem.id);
            setTimeout(() => {
              setNewIds((s) => {
                const n = new Set(s);
                n.delete(newItem.id);
                return n;
              });
            }, 1000);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialItems]);

  if (items.length === 0) {
    return (
      <div className="text-sm text-[#9CA3AF] py-8 text-center">
        The list is new. Be the first.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} isNew={newIds.has(item.id)} />
      ))}
    </div>
  );
}
