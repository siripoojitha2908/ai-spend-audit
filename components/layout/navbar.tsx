import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="font-semibold text-white">
          AI Spend Audit
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/audit" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/20 hover:text-white">
            Audit my spend
          </Link>
        </nav>
      </div>
    </header>
  );
}
