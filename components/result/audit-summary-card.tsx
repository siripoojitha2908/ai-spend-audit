import { formatCurrency } from '@/lib/utils';
import type { AuditResult } from '@/types/audit';
import { Badge } from '@/components/ui/badge';

interface AuditSummaryCardProps {
  audit: AuditResult;
}

export function AuditSummaryCard({ audit }: AuditSummaryCardProps) {
  const riskMessage = audit.totalMonthlySavings > 500 ? 'High savings opportunity – ideal for Credex consultation.' : audit.totalMonthlySavings < 100 ? 'Your stack is already close to optimized.' : 'Solid savings identified; there is room to refine your plan mix.';

  return (
    <div className="card-glass p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Audit results</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">{formatCurrency(audit.totalMonthlySavings)} monthly savings</h1>
          <p className="mt-4 max-w-2xl text-slate-300">{riskMessage}</p>
        </div>
        <Badge>{audit.recommendations.length} recommendations</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Annual savings</p>
          <p className="mt-3 text-3xl font-semibold text-white">${audit.totalAnnualSavings.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Audit confidence</p>
          <p className="mt-3 text-3xl font-semibold text-white">{Math.round(audit.confidence * 100)}%</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI generated summary</p>
          <p className="mt-4 text-slate-300">{audit.summary}</p>
        </div>
        {audit.recommendations.map((item) => (
          <div key={item.toolId} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.toolName}</h2>
                <p className="mt-1 text-sm text-slate-400">{item.plan}</p>
              </div>
              <Badge>{item.confidenceLabel}</Badge>
            </div>
            <p className="mt-4 text-slate-300">{item.reason}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full bg-white/5 px-3 py-1">Spend ${item.currentSpend.toLocaleString()}</span>
              <span className="rounded-full bg-white/5 px-3 py-1">Save ${item.monthlySavings.toLocaleString()}/mo</span>
              <span className="rounded-full bg-white/5 px-3 py-1">Annual ${item.annualSavings.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-sm text-slate-400">This audit report is generated from the tool inputs you provided. Share the public URL if you need stakeholders to review without revealing personal or company data.</p>
        {audit.totalMonthlySavings > 500 ? (
          <div className="mt-5 rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4 text-sm text-brand-100">
            <p className="font-semibold">High priority savings</p>
            <p className="mt-2">Your spend profile is a strong fit for a Credex consultation. Follow up with a tailored outreach campaign to capture that interest.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
