import { fetchPublicAuditById } from '@/services/share';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SharePageProps {
  params: { id: string };
}

export default async function SharePage({ params }: SharePageProps) {
  const audit = await fetchPublicAuditById(params.id);
  if (!audit) {
    notFound();
  }

  return (
    <div className="container py-10 lg:py-16">
      <div className="card-glass p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">AI Spend Audit</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Team audit for {audit.teamSize} seat{audit.teamSize === 1 ? '' : 's'} & {audit.tools.length} tools</h1>
        <p className="mt-4 max-w-2xl text-slate-300">This public report highlights overspend risks and savings opportunities without revealing contact details.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Monthly savings</p>
            <p className="mt-3 text-4xl font-semibold text-white">${audit.totalMonthlySavings.toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-400">Annualized savings: ${audit.totalAnnualSavings.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Audit confidence</p>
            <p className="mt-3 text-4xl font-semibold text-white">{Math.min(100, Math.round(audit.confidence * 100))}%</p>
            <p className="mt-2 text-sm text-slate-400">Rules-based insight across plans and usage patterns.</p>
          </div>
        </div>
        <div className="mt-10 grid gap-4">
          {audit.recommendations.map((item) => (
            <div key={item.toolId} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.toolName}</h2>
                  <p className="mt-1 text-sm text-slate-400">{item.plan}</p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{item.confidenceLabel}</span>
              </div>
              <p className="mt-4 text-slate-300">{item.reason}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full bg-white/5 px-3 py-1">Spend: ${item.currentSpend.toLocaleString()}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">Saved: ${item.monthlySavings.toLocaleString()}/mo</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">This page is safe to share publicly and contains no contact details.</p>
          <Link className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600" href="/">
            Back to AI Spend Audit
          </Link>
        </div>
      </div>
    </div>
  );
}
