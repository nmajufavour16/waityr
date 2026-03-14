import Link from 'next/link';

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/"
            className="text-xl font-semibold text-[#0A0A0A] tracking-tight"
          >
            Waityr
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">
              Check your email.
            </h1>
            <p className="text-[#6B7280] text-sm mt-3 leading-relaxed">
              We sent a confirmation link. Click it to lock in your position.
              The link expires in 24 hours.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 text-left text-sm text-[#6B7280]">
            <p className="font-medium text-[#0A0A0A] mb-1">
              Can't find it?
            </p>
            <p>Check your spam folder. It was sent from noreply@waityr.com.</p>
          </div>

          <Link
            href="/"
            className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors underline underline-offset-2 block"
          >
            ← Back to the list
          </Link>
        </div>
      </main>
    </div>
  );
}
