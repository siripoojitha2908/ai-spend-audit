export type ToolVendor =
  | 'Cursor'
  | 'GitHub Copilot'
  | 'Claude'
  | 'ChatGPT'
  | 'Anthropic'
  | 'OpenAI'
  | 'Gemini'
  | 'Windsurf';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export interface AuditInputTool {
  id: string;
  tool: ToolVendor;
  plan: string;
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: UseCase;
}

export interface AuditRecommendation {
  toolId: string;
  toolName: ToolVendor;
  plan: string;
  currentSpend: number;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  confidence: number;
  confidenceLabel: 'Low' | 'Medium' | 'High';
  alternative?: string | null;
}

export interface AuditResult {
  id: string;
  tools: AuditInputTool[];
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  confidence: number;
  summary: string;
  teamSize: number;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  createdAt: string;
}
