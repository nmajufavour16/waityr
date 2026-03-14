'use client';

import { useState } from 'react';

interface Props {
  email: string;
  onSuccess?: () => void;
}

export default function UpgradeOptions({ email, onSuccess }: Props) {
  const [loadingType, setLoadingType] = useState<
    'random_bump' | 'top_spot' | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (type: 'random_bump' | 'top_spot') => {
    setLoadingType(type);
    setError(null);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setLoadingType(null);
        return;
      }

      // Redirect to Paystack hosted page
      window.location.href = data.authorization_url;
    } catch {
      setError('Could not connect. Please try again.');
      setLoadingType(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Random Bump */}
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
          <div>
            <p className="font-600 text-[#0A0A0A] text-base font-semibold">
              Random Bump
            </p>
            <p className="text-2xl font-700 font-bold text-[#0A0A0A] mt-1">$1</p>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed flex-1">
            Move up to a random spot between here and #2. Not #1. We said
            "random," not "magic."
          </p>
          <div>
            <button
              onClick={() => handlePayment('random_bump')}
              disabled={loadingType !== null}
              className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingType === 'random_bump'
                ? 'Redirecting...'
                : 'Move Me Up — $1'}
            </button>
            <p className="text-[11px] text-[#9CA3AF] mt-2 text-center">
              Your new position is a surprise. Results may vary.
            </p>
          </div>
        </div>

        {/* Top of the List */}
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-600 text-[#0A0A0A] text-base font-semibold">
                Top of the List
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wide bg-[#0D9488] text-white px-1.5 py-0.5 rounded">
                Most Purchased
              </span>
            </div>
            <p className="text-2xl font-700 font-bold text-[#0A0A0A] mt-1">$3</p>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed flex-1">
            Become #1. Immediately. Until someone else pays $3.
          </p>
          <div>
            <button
              onClick={() => handlePayment('top_spot')}
              disabled={loadingType !== null}
              className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingType === 'top_spot'
                ? 'Redirecting...'
                : 'I Want #1 — $3'}
            </button>
            <p className="text-[11px] text-[#9CA3AF] mt-2 text-center">
              Position not guaranteed to stay. We mentioned this.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Transparency disclosure */}
      <p className="text-[11px] text-[#9CA3AF] text-center leading-relaxed">
        Payments move your position on the Waityr waitlist. They do not
        purchase access to a product. The product is the waitlist. This is
        disclosed because we believe in honesty.
      </p>
    </div>
  );
}
