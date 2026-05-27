import { z } from 'zod';

export const supportedToolNames = [
  'Cursor',
  'GitHub Copilot',
  'Claude',
  'ChatGPT',
  'Anthropic',
  'OpenAI',
  'Gemini',
  'Windsurf',
] as const;

export const auditToolSchema = z.object({
  id: z.string().uuid().optional(),
  tool: z.enum(supportedToolNames),
  plan: z.string(),
  monthlySpend: z.coerce.number().min(0),
  seats: z.coerce.number().min(1),
  teamSize: z.coerce.number().min(1),
  useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
});

export const auditPayloadSchema = z.object({
  tools: z.array(auditToolSchema).min(1),
});

export const leadPayloadSchema = z.object({
  auditId: z.string(),
  email: z.string().email(),
  companyName: z.string().max(80).optional(),
  role: z.string().max(60).optional(),
  teamSize: z.number().min(1).optional(),
  honey: z.string().optional(),
});

export const summaryPayloadSchema = z.object({
  auditId: z.string().optional(),
  tools: z.array(auditToolSchema),
  totalMonthlySavings: z.number(),
  totalAnnualSavings: z.number(),
  confidence: z.number().min(0).max(1),
});
