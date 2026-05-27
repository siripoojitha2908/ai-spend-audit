import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10">
      <div className="container grid gap-6 md:grid-cols-[1fr_0.5fr] md:items-center">
        <div>
          <p className="text-sm text-slate-400">AI Spend Audit is a launch-ready lead generation tool for founders and engineering managers.</p>
          <p className="mt-3 text-xs text-slate-500">Built with Next.js, Supabase, Resend, and OpenAI. Designed for modern SaaS conversion.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-slate-300">
          <Link href="/audit" className="hover:text-white">Audit</Link>
          <Link href="/" className="hover:text-white">Home</Link>
        </div>
      </div>
    </footer>
  );
}
