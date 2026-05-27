import OpenAI from 'openai';
import type { AuditResult } from '@/types/audit';

const getOpenAIKey = () => process.env.OPENAI_API_KEY;

const getFallbackSummary = (audit: AuditResult) =>
  `Your audit identified $${audit.totalMonthlySavings} in monthly savings and $${audit.totalAnnualSavings} annually. Review plan fit for your current AI tools, reduce expensive enterprise seats on small teams, and consider API-based alternatives for high-volume workflows.`;

const getOpenAIClient = () => {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
};

export async function generateAIAuditSummary(audit: AuditResult) {
  const fallbackSummary = getFallbackSummary(audit);
  const client = getOpenAIClient();
  if (!client) {
    console.warn('OPENAI_API_KEY is not configured; using fallback audit summary.');
    return fallbackSummary;
  }

  const toolSummary = audit.tools
    .map((tool) => `${tool.tool} (${tool.plan}, ${tool.seats} seats, ${tool.useCase})`)
    .join(', ');

  const prompt = `You are a SaaS audit assistant writing a personalized summary for startup founders and engineering leaders. Given the following audit:

Team size: ${audit.teamSize}
Tools: ${toolSummary}
Total monthly savings: $${audit.totalMonthlySavings}
Total annual savings: $${audit.totalAnnualSavings}
Recommendations:
${audit.recommendations.map((recommendation) => `- ${recommendation.toolName}: ${recommendation.reason}`).join('\n')}

Write a concise 100-word summary that highlights overspend areas, recommended changes, savings opportunities, and next steps for a team looking to optimize AI budgets.\n`;

  try {
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
    });

    const text = response.output_text ?? '';
    return text.trim();
  } catch (error) {
    console.error('AI summary generation failure', error);
    return fallbackSummary;
  }
}
