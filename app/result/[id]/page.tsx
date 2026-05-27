'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { LeadCaptureForm } from '@/components/result/lead-capture-form';
import { formatCurrency } from '@/lib/utils';
import type { AuditResult } from '@/types/audit';

interface ResultPageProps {
  params: { id: string };
}

const idSchema = z.string().uuid();

type ShareResponse = {
  data?: AuditResult;
  error?: string;
};

export default function ResultPage({ params }: ResultPageProps) {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [message, setMessage] = useState('Loading your audit report…');

  const isValidId = useMemo(() => idSchema.safeParse(params.id).success, [params.id]);

  useEffect(() => {
    if (!isValidId) {
      setStatus('error');
      setMessage('This audit ID is invalid. Please return to the audit form and create a new report.');
      return;
    }

    let isMounted = true;

    const loadAudit = async () => {
      setStatus('loading');
      setMessage('Loading your audit report…');

      try {
        const response = await fetch(`/api/share?id=${encodeURIComponent(params.id)}`);
        const payload = (await response.json()) as ShareResponse;

        if (!response.ok) {
          if (!isMounted) {
            return;
          }

          setStatus('empty');
          setMessage(payload.error || 'We could not find an audit for this ID.');
          return;
        }

        if (!payload.data) {
          if (!isMounted) {
            return;
          }

          setStatus('empty');
          setMessage('This audit has no reportable data yet.');
          return;
        }

        if (!isMounted) {
          return;
        }

        setAudit(payload.data);
        setStatus('ready');
      } catch {
        if (!isMounted) {
          return;
        }

        setStatus('error');
        setMessage('We could not load the audit right now. Please refresh and try again.');
      }
    };

    void loadAudit();

    return () => {
      isMounted = false;
    };
  }, [isValidId, params.id]);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-spend-audit.vercel.app'}/share/${params.id}`;

  if (status === 'loading') {
    return (
      <div className="container py-10 lg:py-16">
        <div className="card-glass p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Loading report</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Preparing your audit summary</h1>
              <p className="mt-3 text-slate-300">We are fetching the saved audit and rendering the public report experience.</p>
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error' || status === 'empty') {
    return (
      <div className="container py-10 lg:py-16">
        <div className="card-glass p-8">
          <div className="flex items-center gap-3 text-brand-100">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm uppercase tracking-[0.24em]">Audit unavailable</p>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white">We couldn’t load this audit</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{message}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/audit" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              <ArrowLeft className="h-4 w-4" />
              Run a new audit
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return null;
  }

  return (
    <div className="container py-10 lg:py-16">
      <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card-glass p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Audit results</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">{formatCurrency(audit.totalMonthlySavings)} monthly savings</h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  This report highlights the tools, savings, and recommendations captured in your audit so you can share the outcome with leadership or follow up directly.
                </p>
              </div>
              <Badge>{audit.tools.length} tools</Badge>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Annual savings</p>
                <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(audit.totalAnnualSavings)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Recommendations</p>
                <p className="mt-3 text-3xl font-semibold text-white">{audit.recommendations.length}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">AI generated summary</p>
              <p className="mt-4 text-slate-200">{audit.summary}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Tools used</h2>
                <p className="text-sm text-slate-400">Current spend snapshots</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {audit.tools.map((tool) => (
                  <div key={tool.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tool.tool}</h3>
                        <p className="mt-1 text-sm text-slate-400">{tool.plan}</p>
                      </div>
                      <Badge>{tool.seats} seats</Badge>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-white">{formatCurrency(tool.monthlySpend)}</p>
                    <p className="mt-2 text-sm text-slate-400">Team size: {tool.teamSize} • {tool.useCase}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Recommendations</h2>
                <p className="text-sm text-slate-400">Priority actions for your stack</p>
              </div>
              <div className="space-y-4">
                {audit.recommendations.map((item) => (
                  <div key={item.toolId} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.toolName}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.plan}</p>
                      </div>
                      <Badge>{item.confidenceLabel}</Badge>
                    </div>
                    <p className="mt-4 text-slate-200">{item.reason}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                      <span className="rounded-full bg-white/5 px-3 py-1">Current spend: {formatCurrency(item.currentSpend)}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1">Recommended: {formatCurrency(item.recommendedSpend)}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1">Monthly savings: {formatCurrency(item.monthlySavings)}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1">Annual savings: {formatCurrency(item.annualSavings)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card-glass p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Shareable report</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Share or export your report</h2>
            <p className="mt-3 text-sm text-slate-300">Use the public link below to share the read-only report with stakeholders. It contains the audit findings and savings recommendations without any lead details.</p>
            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
              <p className="font-medium">Public URL</p>
              <a className="mt-2 block break-all text-brand-200 hover:text-brand-100" href={`/share/${audit.id}`}>{publicUrl}</a>
            </div>
          </div>
          <LeadCaptureForm auditId={audit.id} />
        </aside>
      </div>
    </div>
  );
}
