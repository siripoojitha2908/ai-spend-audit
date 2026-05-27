import { getSupabaseAdmin } from '@/lib/supabase';
import type { AuditResult, LeadRecord } from '@/types/audit';

interface SupabaseAuditRow {
  id: string;
  team_size: number;
  tools: AuditResult['tools'];
  recommendations: AuditResult['recommendations'];
  total_monthly_savings: number;
  total_annual_savings: number;
  confidence: number;
  summary: string;
  public: boolean;
  created_at: string;
}

interface SupabaseLeadRow {
  id: string;
  audit_id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  created_at: string;
}

function normalizeAuditRow(row: SupabaseAuditRow): AuditResult {
  return {
    id: row.id,
    tools: row.tools,
    recommendations: row.recommendations,
    totalMonthlySavings: row.total_monthly_savings,
    totalAnnualSavings: row.total_annual_savings,
    confidence: row.confidence,
    summary: row.summary,
    teamSize: row.team_size,
    createdAt: row.created_at,
  };
}

function normalizeLeadRow(row: SupabaseLeadRow): LeadRecord {
  return {
    id: row.id,
    auditId: row.audit_id,
    email: row.email,
    companyName: row.company_name ?? undefined,
    role: row.role ?? undefined,
    teamSize: row.team_size ?? undefined,
    createdAt: row.created_at,
  };
}

function toSupabaseAuditInsert(record: AuditResult) {
  return {
    id: record.id,
    team_size: record.teamSize,
    tools: record.tools,
    recommendations: record.recommendations,
    total_monthly_savings: record.totalMonthlySavings,
    total_annual_savings: record.totalAnnualSavings,
    confidence: record.confidence,
    summary: record.summary,
    created_at: record.createdAt,
  };
}

function toSupabaseLeadInsert(payload: {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}) {
  return {
    audit_id: payload.auditId,
    email: payload.email.trim().toLowerCase(),
    company_name: payload.companyName?.trim() || null,
    role: payload.role?.trim() || null,
    team_size: payload.teamSize ?? null,
    created_at: new Date().toISOString(),
  };
}

export async function insertAuditRecordToSupabase(record: AuditResult) {
  try {
    const supabase = getSupabaseAdmin() as any;
    const { data, error } = await supabase
      .from('audits')
      .upsert([toSupabaseAuditInsert(record)], {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      return { ok: false as const, error: error.message };
    }

    return { ok: true as const, data: normalizeAuditRow(data as SupabaseAuditRow) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to persist audit to Supabase.',
    };
  }
}

export async function fetchAuditRecordFromSupabase(id: string) {
  try {
    const supabase = getSupabaseAdmin() as any;
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { ok: false as const, error: error?.message ?? 'Audit not found.' };
    }

    return { ok: true as const, data: normalizeAuditRow(data as SupabaseAuditRow) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to fetch audit from Supabase.',
    };
  }
}

export async function fetchPublicAuditFromSupabase(id: string) {
  const auditResult = await fetchAuditRecordFromSupabase(id);
  if (!auditResult.ok) {
    return auditResult;
  }

  const audit = auditResult.data;
  return {
    ok: true as const,
    data: {
      id: audit.id,
      teamSize: audit.teamSize,
      tools: audit.tools.map((tool) => ({
        ...tool,
        monthlySpend: Math.round(tool.monthlySpend),
      })),
      recommendations: audit.recommendations,
      totalMonthlySavings: audit.totalMonthlySavings,
      totalAnnualSavings: audit.totalAnnualSavings,
      confidence: audit.confidence,
      summary: audit.summary,
      createdAt: audit.createdAt,
    },
  };
}

export async function insertLeadToSupabase(payload: {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}) {
  try {
    const supabase = getSupabaseAdmin() as any;
    const { data, error } = await supabase
      .from('leads')
      .insert(toSupabaseLeadInsert(payload))
      .select()
      .single();

    if (error) {
      const message = error.message.includes('Could not find the table')
        ? 'The Supabase leads table is not configured in this project.'
        : error.message;
      return { ok: false as const, error: message };
    }

    return { ok: true as const, data: normalizeLeadRow(data as SupabaseLeadRow) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to persist lead to Supabase.',
    };
  }
}

export async function fetchLeadsByAuditId(auditId: string) {
  try {
    const supabase = getSupabaseAdmin() as any;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    const rows = (data ?? []) as SupabaseLeadRow[];

    return {
      ok: true as const,
      data: rows.map((row) => normalizeLeadRow(row)),
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to fetch leads from Supabase.',
    };
  }
}
