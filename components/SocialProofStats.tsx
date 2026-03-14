'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  total_waiters: number;
  total_revenue_cents: number;
  top_spot_record_purchases: number;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function SocialProofStats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/stats')
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-9 w-24 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      value: stats.total_waiters.toLocaleString(),
      label: 'People waiting',
    },
    {
      value: formatDollars(stats.total_revenue_cents),
      label: 'Spent to move up',
    },
    {
      value: stats.top_spot_record_purchases.toString(),
      label: 'Record: times someone has reclaimed #1',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8">
      {items.map((item, i) => (
        <div key={i}>
          <p className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tabular-nums">
            {item.value}
          </p>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-snug">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
