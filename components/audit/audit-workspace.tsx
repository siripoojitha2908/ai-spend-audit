'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auditPayloadSchema } from '@/services/validation';
import { supportedTools, pricingCatalog } from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import type { AuditInputTool } from '@/types/audit';

const defaultToolRow = (): AuditInputTool => ({
  id: crypto.randomUUID(),
  tool: 'GitHub Copilot',
  plan: 'Individual',
  monthlySpend: 85,
  seats: 1,
  teamSize: 3,
  useCase: 'coding',
});

const localStorageKey = 'ai-spend-audit-tools';

type FormValues = { tools: AuditInputTool[] };

export function AuditWorkspace() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { push } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(auditPayloadSchema),
    defaultValues: { tools: [defaultToolRow()] },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'tools' });

  useEffect(() => {
    const saved = window.localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuditInputTool[];
        if (Array.isArray(parsed) && parsed.length) {
          form.reset({ tools: parsed.map((tool) => ({ ...tool, id: tool.id || crypto.randomUUID() })) });
        }
      } catch {
        window.localStorage.removeItem(localStorageKey);
      }
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.tools?.length) {
        window.localStorage.setItem(localStorageKey, JSON.stringify(value.tools));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const watchedTools = form.watch('tools');
  const totalSpend = watchedTools?.reduce((sum, tool) => sum + (tool?.monthlySpend || 0), 0) ?? 0;

  const onSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const payload = {
      tools: values.tools.map((tool) => ({
        ...tool,
        monthlySpend: Number(tool.monthlySpend),
        seats: Number(tool.seats),
        teamSize: Number(tool.teamSize),
      })),
    };

    console.log('Audit submit payload', payload);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let result: { success?: boolean; data?: { id?: string }; error?: string } | null = null;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse audit response JSON', parseError);
      }

      console.log('Audit response', response.status, result);

      if (!response.ok || !result?.success) {
        const message = typeof result?.error === 'string'
          ? result.error
          : JSON.stringify(result?.error) || 'Unable to run audit.';
        setErrorMessage(message);
        push({ type: 'error', title: 'Audit failed', message });
        return;
      }

      const auditId = result.data?.id;
      if (!auditId) {
        const message = 'Audit created but no audit ID was returned.';
        setErrorMessage(message);
        push({ type: 'error', title: 'Audit failed', message });
        return;
      }

      router.push(`/result/${auditId}`);
    } catch (error) {
      console.error('Audit submission error', error);
      const message = error instanceof Error
        ? error.name === 'AbortError'
          ? 'Audit request timed out. Please try again.'
          : error.message
        : 'Unable to connect to the audit engine.';
      setErrorMessage(message);
      push({ type: 'error', title: 'Audit failed', message });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="card-glass p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Audit input</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Build your AI spend audit with plan-level detail.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Add every tool line item, compare plan tiers, and let the rules engine identify overspend quickly.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current spend</p>
            <p className="mt-2 text-3xl font-semibold">${totalSpend.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="card-glass p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr] flex-1">
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`tool-${field.id}`}>Tool</label>
                  <Controller
                    name={`tools.${index}.tool`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <Select id={`tool-${field.id}`} {...controllerField}>
                        {supportedTools.map((tool) => (
                          <option key={tool} value={tool}>{tool}</option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`plan-${field.id}`}>Plan</label>
                  <Controller
                    name={`tools.${index}.plan`}
                    control={form.control}
                    render={({ field: controllerField }) => {
                      const selectedTool = form.getValues(`tools.${index}.tool`);
                      const pricing = pricingCatalog.find((item) => item.vendor === selectedTool);
                      return (
                        <Select id={`plan-${field.id}`} {...controllerField}>
                          {pricing?.plans.map((plan) => (
                            <option key={plan.name} value={plan.name}>{plan.name}</option>
                          ))}
                        </Select>
                      );
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`monthlySpend-${field.id}`}>Monthly spend</label>
                  <Controller
                    name={`tools.${index}.monthlySpend`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <Input
                        id={`monthlySpend-${field.id}`}
                        type="number"
                        min={0}
                        step={5}
                        {...controllerField}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`seats-${field.id}`}>Seats</label>
                  <Controller
                    name={`tools.${index}.seats`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <Input id={`seats-${field.id}`} type="number" min={1} step={1} {...controllerField} />
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`teamSize-${field.id}`}>Team size</label>
                  <Controller
                    name={`tools.${index}.teamSize`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <Input id={`teamSize-${field.id}`} type="number" min={1} step={1} {...controllerField} />
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200" htmlFor={`useCase-${field.id}`}>Primary use case</label>
                  <Controller
                    name={`tools.${index}.useCase`}
                    control={form.control}
                    render={({ field: controllerField }) => (
                      <Select id={`useCase-${field.id}`} {...controllerField}>
                        <option value="coding">Coding</option>
                        <option value="writing">Writing</option>
                        <option value="data">Data</option>
                        <option value="research">Research</option>
                        <option value="mixed">Mixed</option>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge>{index === 0 ? 'Primary' : `Tool ${index + 1}`}</Badge>
                <button type="button" onClick={() => remove(index)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-red-400 hover:text-red-300">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" className="inline-flex items-center gap-2 bg-white/10 text-white hover:bg-white/15" onClick={() => append(defaultToolRow())}>
            <Plus className="h-4 w-4" /> Add another tool
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running audit…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Audit my AI spend
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>

        {errorMessage ? <p className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
