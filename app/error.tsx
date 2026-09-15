'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log the error to an error reporting service here.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-[#0A0A0A] mb-4 font-display tracking-tight">
          Well, this is embarrassing.
        </h1>
        <p className="text-[#6B7280] mb-8 text-lg leading-relaxed">
          Something just broke. We'd love to claim this is a psychological test of your patience, but honestly, it's just a server error. You've lost your place in line. Kidding. Try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="btn-teal bg-[#0D9488] text-white font-semibold px-6 py-3 rounded-lg w-full sm:w-auto"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-[#6B7280] hover:text-[#0A0A0A] font-medium transition-colors px-6 py-3 w-full sm:w-auto"
          >
            Go back to the start
          </Link>
        </div>
      </div>
    </div>
  );
}
