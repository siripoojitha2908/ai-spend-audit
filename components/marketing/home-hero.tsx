import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Built for teams optimizing AI spend
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Audit AI subscription spend, slash waste, and convert with a premium report.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-300">AI Spend Audit gives startup leaders a polished SaaS experience: budget-aware recommendations, a sharable savings report, and lead capture built for high-conversion outreach.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/audit" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
            Start audit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#insights" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20">
            Why it works
          </a>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-glow">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-brand-500 to-violet-500 opacity-70" />
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-900/90 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Audit preview</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">$4,220 in annual AI savings</h2>
            <p className="mt-3 text-sm text-slate-300">Actions: switch plans, reduce seat waste, consolidate API spend, and secure a follow-up consultation.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Cursor Pro', 'GitHub Copilot', 'OpenAI API', 'Anthropic API'].map((tool) => (
              <div key={tool} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">{tool}</p>
                <p className="mt-3 text-lg font-semibold text-white">${tool.includes('API') ? '1,200' : '420'}/mo</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
