import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-3">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0A0A0A] mb-4 font-display tracking-tight">
          Are you lost?
        </h1>
        <p className="text-[#6B7280] mb-8 text-lg leading-relaxed">
          There is nothing here. Just an empty void. You can either stand here waiting for a page that will never load, or you can go back and wait for something real.
        </p>
        <Link
          href="/"
          className="inline-block btn-teal bg-[#0A0A0A] text-white font-semibold px-8 py-3.5 rounded-lg w-full sm:w-auto shadow-sm"
        >
          Return to the Queue
        </Link>
      </div>
    </div>
  );
}
