'use client';

import { useEffect, useState } from 'react';
import CountUp from './CountUp';
import UpgradeOptions from './UpgradeOptions';

interface Props {
  position: number;
  email: string;
  onDismiss: () => void;
}

export default function PositionModal({ position, email, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Brief delay so the animation feels intentional
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const ahead = position - 1;

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-lg mx-auto text-center space-y-6">
        {/* Position number with count-up */}
        <div>
          <CountUp
            target={visible ? position : 0}
            duration={800}
            prefix="#"
            className="block text-[96px] leading-none font-bold text-[#0D9488] tabular-nums"
          />
          <p className="text-xl font-semibold text-[#0A0A0A] mt-3">
            You're #{position}.
          </p>
        </div>

        {/* Context */}
        <div className="text-[#6B7280] text-sm space-y-1">
          {ahead > 0 && (
            <p>You're ahead of {ahead.toLocaleString()} {ahead === 1 ? 'person' : 'people'} who joined after you.</p>
          )}
          {position > 1 && (
            <p>
              {(position - 1).toLocaleString()}{' '}
              {position - 1 === 1 ? 'person got' : 'people got'} here before you.
              That's how lists work.
            </p>
          )}
        </div>

        {/* Check email notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-[#6B7280] text-left">
          <p className="font-medium text-[#0A0A0A] mb-1">Check your email.</p>
          <p>
            We sent a confirmation link to{' '}
            <span className="text-[#0A0A0A] font-medium">{email}</span>. Confirm
            your spot to access your dashboard and move up.
          </p>
        </div>

        {/* Upgrade options */}
        <UpgradeOptions email={email} />

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors underline underline-offset-2"
        >
          No thanks, I'll stay where I am →
        </button>
      </div>
    </div>
  );
}
