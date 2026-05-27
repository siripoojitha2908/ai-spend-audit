import { getAuditRecord } from '@/lib/audit-store';
import { fetchAuditRecordFromSupabase, fetchPublicAuditFromSupabase } from '@/lib/supabase-data';
import { hasSupabaseConfig } from '@/lib/supabase';
import type { AuditResult } from '@/types/audit';

export async function fetchAuditById(id: string): Promise<AuditResult | null> {
  const localAudit = getAuditRecord(id);

  if (!hasSupabaseConfig()) {
    return localAudit;
  }

  try {
    const supabaseResult = await fetchAuditRecordFromSupabase(id);
    if (supabaseResult.ok) {
      return supabaseResult.data;
    }

    console.error('fetchAuditById error', supabaseResult.error);
    return localAudit;
  } catch (error) {
    console.error('fetchAuditById error', error);
    return localAudit;
  }
}

export async function fetchPublicAuditById(id: string) {
  const localAudit = getAuditRecord(id);

  if (!hasSupabaseConfig()) {
    return localAudit
      ? {
          id: localAudit.id,
          teamSize: localAudit.teamSize,
          tools: localAudit.tools,
          recommendations: localAudit.recommendations,
          totalMonthlySavings: localAudit.totalMonthlySavings,
          totalAnnualSavings: localAudit.totalAnnualSavings,
          confidence: localAudit.confidence,
        }
      : null;
  }

  try {
    const supabaseResult = await fetchPublicAuditFromSupabase(id);
    if (supabaseResult.ok) {
      return supabaseResult.data;
    }

    console.error('fetchPublicAuditById error', supabaseResult.error);
    return localAudit
      ? {
          id: localAudit.id,
          teamSize: localAudit.teamSize,
          tools: localAudit.tools,
          recommendations: localAudit.recommendations,
          totalMonthlySavings: localAudit.totalMonthlySavings,
          totalAnnualSavings: localAudit.totalAnnualSavings,
          confidence: localAudit.confidence,
        }
      : null;
  } catch (error) {
    console.error('fetchPublicAuditById error', error);
    return localAudit
      ? {
          id: localAudit.id,
          teamSize: localAudit.teamSize,
          tools: localAudit.tools,
          recommendations: localAudit.recommendations,
          totalMonthlySavings: localAudit.totalMonthlySavings,
          totalAnnualSavings: localAudit.totalAnnualSavings,
          confidence: localAudit.confidence,
        }
      : null;
  }
}
