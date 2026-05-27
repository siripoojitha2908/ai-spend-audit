import { NextResponse } from 'next/server';
import { auditPayloadSchema } from '@/services/validation';
import { generateAuditRecommendations } from '@/services/audit-engine';
import { generateAIAuditSummary } from '@/lib/ai-client';
import { saveAuditRecord } from '@/lib/audit-store';
import { hasSupabaseConfig } from '@/lib/supabase';
import { insertAuditRecordToSupabase } from '@/lib/supabase-data';

export async function POST(request: Request) {
  console.log('Audit POST request received');

  let body: unknown;

  try {
    body = await request.json();
    console.log('Audit request body', body);
  } catch (error) {
    console.error('Audit request JSON parse failed', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parseResult = auditPayloadSchema.safeParse(body);
  console.log('Audit validation result', parseResult.success, parseResult);

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const message = Object.values(fieldErrors).flat().filter(Boolean).join(' ') || 'Invalid audit payload.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }

  try {
    const audit = generateAuditRecommendations(parseResult.data.tools.map((tool) => ({
      ...tool,
      id: tool.id ?? crypto.randomUUID(),
    })));
    const summary = await generateAIAuditSummary(audit);
    const record = { ...audit, summary, createdAt: new Date().toISOString() };

    if (!hasSupabaseConfig()) {
      saveAuditRecord(record);
      const responsePayload = { success: true, data: record };
      console.log('Audit local save response', responsePayload);
      return NextResponse.json(responsePayload, { status: 201 });
    }

    const supabaseResult = await insertAuditRecordToSupabase(record);
    console.log('Supabase insert result', supabaseResult);

    if (!supabaseResult.ok) {
      console.error('Audit insert error', supabaseResult.error);
      return NextResponse.json({ success: false, error: 'Failed to persist audit record.' }, { status: 500 });
    }

    const responsePayload = { success: true, data: supabaseResult.data };
    console.log('Audit response', responsePayload);
    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error('Audit create error', error);
    return NextResponse.json({ success: false, error: 'Failed to create audit.' }, { status: 500 });
  }
}
