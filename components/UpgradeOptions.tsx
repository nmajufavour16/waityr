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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Random Bump */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-[#0A0A0A]">Random Bump</p>
          <p className="text-3xl font-extrabold text-[#0A0A0A] mt-2 mb-3">$1</p>
          <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-5">
            Move up to a random spot between here and #2. Not #1. We said "random," not "magic."
          </p>
          <div className="w-full">
            <button
              onClick={() => handlePayment('random_bump')}
              disabled={loadingType !== null}
              className="w-full bg-white hover:bg-gray-50 text-[#0A0A0A] border border-gray-200 font-semibold text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingType === 'random_bump' ? '...' : 'Move Me Up'}
            </button>
            <p className="text-[11px] text-[#9CA3AF] mt-2 text-center">
              Your new position is a surprise. Results may vary.
            </p>
          </div>
        </div>

        {/* Top of the List */}
        <div className="border-2 border-[#0D9488] rounded-xl p-5 flex flex-col items-center text-center relative shadow-sm">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#0D9488] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
              Recommended
            </span>
          </div>
          <p className="text-sm font-semibold text-[#0A0A0A]">Top of the List</p>
          <p className="text-3xl font-extrabold text-[#0A0A0A] mt-2 mb-3">$2.99</p>
          <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-5">
            Become #1. Immediately. Until someone else pays $2.99.
          </p>
          <div className="w-full">
            <button
              onClick={() => handlePayment('top_spot')}
              disabled={loadingType !== null}
              className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingType === 'top_spot' ? '...' : 'Take #1'}
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
