import { redirect } from 'next/navigation';
import Link from 'next/link';
import CountUp from '@/components/CountUp';
import UpgradeOptions from '@/components/UpgradeOptions';
import Logo from '@/components/Logo';

interface Props {
  searchParams: Promise<{ position?: string; email?: string }>;
}

export default async function JoinedPage(props: Props) {
  const searchParams = await props.searchParams;
  const positionParam = searchParams.position;
  const email = searchParams.email;

  if (!positionParam || !email) {
    redirect('/');
  }

  const position = parseInt(positionParam, 10);
  const ahead = position - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Custom Navbar (No "Get in line") ─────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#6B7280] font-medium hover:text-[#0f766e] transition-colors px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#0D9488]/10">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20">
        <div className="w-full max-w-lg mx-auto text-center space-y-6 anim-fade-up">
          {/* Position number with count-up */}
          <div>
            <CountUp
              target={position}
              duration={800}
              prefix="#"
              className="block text-[72px] leading-none font-extrabold text-[#0D9488] tabular-nums tracking-tight"
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
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-[#6B7280] text-left shadow-sm">
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
          <div className="pt-2">
            <Link
              href="/"
              className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors underline underline-offset-2"
            >
              No thanks, I'll stay where I am →
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <Link href="/"><Logo size="md" className="opacity-70" /></Link>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/#how-it-works" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">How it works</Link>
              <Link href="/#pricing" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Pricing</Link>
              <Link href="/#faq" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">FAQ</Link>
              <Link href="/privacy" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Terms</Link>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#9CA3AF]">© 2026 Waityr. Something is coming.</p>
            <p className="text-xs text-[#9CA3AF]">Payments via Paystack. The waitlist is the product.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
