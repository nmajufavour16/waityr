'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  total_waiters: number;
  total_revenue_cents: number;
  top_spot_record_purchases: number;
  top_spot_record_holder_masked_email: string | null;
  number_one_tenure_hours: number;
}

export default function LiveCounter() {
  const [stats, setStats] = useState<StatsData | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-5 w-64 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
    );
  }

  const tenureDisplay =
    stats.number_one_tenure_hours < 1
      ? `${Math.round(stats.number_one_tenure_hours * 60)} minutes`
      : stats.number_one_tenure_hours < 24
      ? `${stats.number_one_tenure_hours.toFixed(1)} hours`
      : `${(stats.number_one_tenure_hours / 24).toFixed(1)} days`;

  return (
    <div className="space-y-1 text-[#6B7280]">
      <p className="text-base">
        <span className="font-semibold text-[#0A0A0A]">
          {stats.total_waiters.toLocaleString()}
        </span>{' '}
        {stats.total_waiters === 1 ? 'person is' : 'people are'} already waiting.
      </p>
      {stats.total_waiters > 0 && stats.number_one_tenure_hours > 0 && (
        <p className="text-sm">
          The person at #1 has been waiting {tenureDisplay}.
        </p>
      )}
    </div>
  );
}
