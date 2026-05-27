import { createClient } from '@supabase/supabase-js';
import type { AuditInputTool, AuditRecommendation, AuditResult, LeadRecord } from '@/types/audit';

export interface SupabaseDatabase {
  public: {
    Tables: {
      audits: {
        Row: {
          id: string;
          team_size: number;
          tools: AuditInputTool[];
          recommendations: AuditRecommendation[];
          total_monthly_savings: number;
          total_annual_savings: number;
          confidence: number;
          summary: string;
          public: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          team_size: number;
          tools: AuditInputTool[];
          recommendations: AuditRecommendation[];
          total_monthly_savings: number;
          total_annual_savings: number;
          confidence: number;
          summary: string;
          public?: boolean;
          created_at: string;
        };
        Update: Partial<{
          team_size: number;
          tools: AuditInputTool[];
          recommendations: AuditRecommendation[];
          total_monthly_savings: number;
          total_annual_savings: number;
          confidence: number;
          summary: string;
          public: boolean;
          created_at: string;
        }>;
      };
      leads: {
        Row: {
          id: string;
          audit_id: string;
          email: string;
          company_name: string | null;
          role: string | null;
          team_size: number | null;
          created_at: string;
        };
        Insert: {
          audit_id: string;
          email: string;
          company_name: string | null;
          role: string | null;
          team_size: number | null;
          created_at?: string;
        };
        Update: Partial<{
          audit_id: string;
          email: string;
          company_name: string | null;
          role: string | null;
          team_size: number | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    anonKey: supabasePublishableKey,
    serviceRoleKey: supabaseServiceRoleKey,
  };
}

export function hasSupabasePublicConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function hasSupabaseConfig() {
  return hasSupabasePublicConfig() && hasSupabaseAdminConfig();
}

function ensureServerConfig() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error('Supabase admin configuration is incomplete. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  }
}

function createSupabaseClient(url: string, key: string) {
  return createClient<SupabaseDatabase>(url, key, {
    auth: { persistSession: false },
  });
}

export function getSupabaseBrowserClient() {
  if (!hasSupabasePublicConfig()) {
    throw new Error('Supabase public configuration is incomplete. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.');
  }

  return createSupabaseClient(supabaseUrl as string, supabasePublishableKey as string);
}

export function getSupabaseAdmin() {
  ensureServerConfig();
  return createSupabaseClient(supabaseUrl as string, supabaseServiceRoleKey as string);
}

export function getSupabaseClient() {
  return getSupabaseBrowserClient();
}

export type { AuditInputTool, AuditRecommendation, AuditResult, LeadRecord };
