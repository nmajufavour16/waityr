'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ArrowRight, Mail } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      setSent(true);
    } catch {
      setError('Could not connect. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#0D9488]/10 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A0A0A]">Check your email.</h1>
                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                  We sent a sign-in link to <span className="font-medium text-[#0A0A0A]">{email}</span>.
                  Click it to access your dashboard.
                </p>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Can&apos;t find it? Check spam. Sent from your Waityr email address.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Sign in.</h1>
                <p className="text-sm text-[#6B7280] mt-2">
                  Enter the email you joined with. We&apos;ll send you a sign-in link.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 disabled:opacity-50 transition"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : <>Send sign-in link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>

              <p className="text-center text-xs text-[#9CA3AF]">
                Not on the list?{' '}
                <Link href="/" className="text-[#0D9488] hover:underline">
                  Join the waitlist
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
