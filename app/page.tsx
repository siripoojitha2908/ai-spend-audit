import { ArrowRight, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import { FeatureCard } from '@/components/marketing/feature-card';
import { HomeHero } from '@/components/marketing/home-hero';
import { HomeStats } from '@/components/marketing/home-stats';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container py-10 lg:py-16">
      <HomeHero />
      <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card-glass p-8">
          <div className="mb-8 flex items-center gap-3 text-slate-300">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Secure AI budget review</p>
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Launch-ready AI spend intelligence for early-stage teams.</h2>
          <p className="mt-5 text-slate-300">Build trust with every startup that lands, convert high-value engineering teams with a polished audit flow and real savings insight.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/audit" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              Audit My AI Spend
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#insights" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20">
              Explore insights
            </a>
          </div>
        </div>
        <HomeStats />
      </section>

      <section id="insights" className="mt-16 grid gap-6 lg:grid-cols-3">
        <FeatureCard icon={Sparkles} title="Smart overspend detection" description="Rules-driven recommendations reduce AI line items, downgrade expensive plans, and suggest smarter alternatives." />
        <FeatureCard icon={TrendingUp} title="Analytics and shareable results" description="Create a trackable report URL, capture email-qualified leads, and highlight consultation opportunities." />
        <FeatureCard icon={ShieldCheck} title="Built for founders and engineering leaders" description="Professional dashboards, responsive layouts, and audit UX tuned for SaaS conversion." />
      </section>
    </div>
  );
}
