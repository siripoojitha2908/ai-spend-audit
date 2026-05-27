'use client';

import Link from 'next/link';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="container py-24 text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Something went wrong</p>
      <h1 className="mt-6 text-5xl font-semibold text-white">Unexpected error</h1>
      <p className="mt-4 text-slate-300">{error.message}</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
        Return to homepage
      </Link>
    </div>
  );
}
