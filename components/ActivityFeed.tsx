'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import type { ActivityFeedItem } from '@/app/dashboard/DashboardClient';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevTopItemRef = useRef<string | null>(initialItems[0]?.id || null);

  const { data } = useSWR('/api/feed/latest', fetcher, {
    fallbackData: { items: initialItems },
    refreshInterval: 3000,
  });

  const items: ActivityFeedItem[] = data?.items || initialItems;

  useEffect(() => {
    if (items.length === 0) return;
    const currentTop = items[0].id;
    
    if (prevTopItemRef.current && prevTopItemRef.current !== currentTop) {
      // Find new items
      const prevIndex = items.findIndex(item => item.id === prevTopItemRef.current);
      const newItems = prevIndex > 0 ? items.slice(0, prevIndex) : [items[0]];
      
      const ids = newItems.map(item => item.id);
      setNewIds(prev => new Set([...Array.from(prev), ...ids]));
      
      setTimeout(() => {
        setNewIds(prev => {
          const next = new Set(prev);
          ids.forEach(id => next.delete(id));
          return next;
        });
      }, 1000);
    }
    prevTopItemRef.current = currentTop;
  }, [items]);

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
