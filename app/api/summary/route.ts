import { NextResponse } from 'next/server';
import { summaryPayloadSchema } from '@/services/validation';
import { generateAuditRecommendations } from '@/services/audit-engine';
import { generateAIAuditSummary } from '@/lib/ai-client';
import { hasSupabaseConfig } from '@/lib/supabase';
import { saveAuditRecord } from '@/lib/audit-store';
import { insertAuditRecordToSupabase } from '@/lib/supabase-data';

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = summaryPayloadSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.format() }, { status: 400 });
  }

  const normalizedTools = parseResult.data.tools.map((tool) => ({
    ...tool,
    id: tool.id ?? crypto.randomUUID(),
  }));

  const draftAudit = generateAuditRecommendations(normalizedTools);
  const audit = {
    ...draftAudit,
    id: parseResult.data.auditId ?? draftAudit.id,
    totalMonthlySavings: parseResult.data.totalMonthlySavings,
    totalAnnualSavings: parseResult.data.totalAnnualSavings,
    confidence: parseResult.data.confidence,
  };

  const summary = await generateAIAuditSummary(audit);
  const record = { ...audit, summary };
  saveAuditRecord(record);

  if (hasSupabaseConfig()) {
    const supabaseResult = await insertAuditRecordToSupabase(record);
    if (!supabaseResult.ok) {
      console.error('Summary sync error', supabaseResult.error);
    }
  }

  return NextResponse.json({ summary }, { status: 200 });
}
