'use client';

import { useState } from 'react';
import PositionModal from './PositionModal';

interface Props {
  referralCode?: string;
}

export default function WaitlistForm({ referralCode }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{
    position: number;
    email: string;
  } | null>(null);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referral_code: referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }

      if (data.already_exists) {
        setError("You're already on the list. Check your email to sign in.");
        return;
      }

      setModalData({ position: data.position, email });
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <div className="w-full max-w-lg">
        {/* Form row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKey}
            placeholder="you@example.com"
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-[#0A0A0A] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 disabled:opacity-50 transition"
            aria-label="Email address"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Getting you in line...' : 'Get in Line →'}
          </button>
        </div>

        {/* Inline error */}
        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {/* Fine print */}
        {!error && (
          <p className="mt-2 text-xs text-[#9CA3AF]">
            No spam. One confirmation email. That's it.
          </p>
        )}
      </div>

      {/* Position reveal modal */}
      {modalData && (
        <PositionModal
          position={modalData.position}
          email={modalData.email}
          onDismiss={() => setModalData(null)}
        />
      )}
    </>
  );
}
