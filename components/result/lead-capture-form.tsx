'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

interface LeadCaptureFormProps {
  auditId: string;
}

type FormValues = {
  email: string;
  companyName?: string;
  role?: string;
  teamSize: number;
  honey?: string;
};

export function LeadCaptureForm({ auditId }: LeadCaptureFormProps) {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: { email: '', companyName: '', role: '', teamSize: 5, honey: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSending(true);
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, ...values }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof result.error === 'string' ? result.error : result?.note || 'Submission failed. Please try again later.';
        toast.push({ type: 'error', title: 'Lead Failed', message });
        return;
      }

      toast.push({ type: 'success', title: 'Lead saved', message: 'We captured the lead — thank you!' });
      form.reset({ email: '', companyName: '', role: '', teamSize: 5, honey: '' });
    } catch (error) {
      toast.push({ type: 'error', title: 'Network error', message: 'Unable to submit lead capture.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card-glass p-6">
      <h2 className="text-xl font-semibold text-white">Capture this lead</h2>
      <p className="mt-2 text-sm text-slate-400">Collect contact info after the audit to turn savings into a qualified opportunity.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">Business email</label>
            <Input id="email" type="email" {...form.register('email', { required: true })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="companyName">Company name</label>
            <Input id="companyName" {...form.register('companyName')} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="role">Role</label>
            <Input id="role" {...form.register('role')} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="teamSize">Team size</label>
            <Select id="teamSize" {...form.register('teamSize', { valueAsNumber: true })}>
              {[1, 2, 3, 4, 5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Select>
          </div>
        </div>
        <input className="hidden" type="text" autoComplete="off" {...form.register('honey')} />
        <Button type="submit" disabled={isSending}>{isSending ? 'Saving lead…' : 'Capture lead'}</Button>
      </form>
    </div>
  );
}
