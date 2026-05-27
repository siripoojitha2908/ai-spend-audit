import { pricingCatalog } from '@/lib/pricing';
import type { AuditInputTool, AuditRecommendation, AuditResult } from '@/types/audit';

const confidenceLabel = (value: number) => {
  if (value >= 0.75) return 'High' as const;
  if (value >= 0.45) return 'Medium' as const;
  return 'Low' as const;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const findVendorPricing = (toolName: string) => pricingCatalog.find((entry) => entry.vendor === toolName);

const calculateRecommendedPlan = (tool: AuditInputTool) => {
  const pricing = findVendorPricing(tool.tool);
  if (!pricing) return { name: tool.plan, monthlyPrice: tool.monthlySpend };

  const sameVendor = pricing.plans.filter((plan) => plan.minSeats <= tool.seats && (plan.maxSeats === null || plan.maxSeats >= tool.seats));
  const bestSameVendor = sameVendor.reduce((lowest, plan) => {
    if (!lowest || plan.monthlyPrice < lowest.monthlyPrice) return plan;
    return lowest;
  }, sameVendor[0]);

  if (bestSameVendor && bestSameVendor.monthlyPrice * tool.seats < tool.monthlySpend) {
    return { name: bestSameVendor.name, monthlyPrice: bestSameVendor.monthlyPrice * tool.seats };
  }

  const apiPlan = pricing.plans.find((plan) => plan.name.toLowerCase().includes('api'));
  if (apiPlan && tool.monthlySpend > 500 && tool.useCase !== 'research') {
    return { name: apiPlan.name, monthlyPrice: apiPlan.monthlyPrice * tool.seats };
  }

  return { name: tool.plan, monthlyPrice: tool.monthlySpend };
};

const alternativeVendor = (tool: AuditInputTool, recommendedSpend: number) => {
  const pricing = findVendorPricing(tool.tool);
  if (!pricing?.defaultAlternative) return null;
  const alternative = findVendorPricing(pricing.defaultAlternative);
  if (!alternative) return null;

  const alternativeBest = alternative.plans.reduce((best, plan) => {
    const cost = plan.monthlyPrice * tool.seats;
    if (!best || cost < best.cost) return { plan, cost };
    return best;
  }, null as null | { plan: (typeof alternative.plans)[number]; cost: number });

  if (alternativeBest && alternativeBest.cost < recommendedSpend * 0.95) {
    return `${alternative.vendor} ${alternativeBest.plan.name}`;
  }

  return null;
};

const buildReason = (tool: AuditInputTool, recommendedPlan: string, recommendedSpend: number): string => {
  if (tool.plan.toLowerCase().includes('enterprise') && tool.teamSize < 5) {
    return 'Enterprise plans for very small groups often signal overspend; downgrade to a smaller tier for the same coverage.';
  }

  if (tool.monthlySpend > 0 && recommendedSpend < tool.monthlySpend) {
    if (recommendedPlan !== tool.plan) {
      return `Your team is likely overpaying for ${tool.plan}. Switching to ${recommendedPlan} should reduce seat costs without cutting access.`;
    }
    return 'Current spending is higher than the best available match for your team size; re-evaluate your plan or API usage.';
  }

  if (tool.monthlySpend > 0 && tool.teamSize <= 2 && tool.plan.toLowerCase().includes('team')) {
    return 'Small teams often qualify for individual or pro tiers rather than a team plan.';
  }

  return 'Current plan appears aligned with team size and expected use case; savings are limited.';
};

export function generateAuditRecommendations(tools: AuditInputTool[]): AuditResult {
  const recommendations: AuditRecommendation[] = tools.map((tool) => {
    const target = calculateRecommendedPlan(tool);
    const roundedRecommendedSpend = Math.round(target.monthlyPrice);
    const monthlySavings = Math.max(0, tool.monthlySpend - roundedRecommendedSpend);
    const annualSavings = monthlySavings * 12;
    const alternative = alternativeVendor(tool, roundedRecommendedSpend);
    const confidenceValue = clamp(monthlySavings / Math.max(1, tool.monthlySpend), 0, 1);
    const confidence = Math.max(0.1, Math.min(0.95, confidenceValue + (tool.teamSize < 5 && tool.plan.toLowerCase().includes('enterprise') ? 0.2 : 0)));

    return {
      toolId: tool.id,
      toolName: tool.tool,
      plan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendedSpend: target.monthlyPrice,
      monthlySavings,
      annualSavings,
      reason: buildReason(tool, target.name, target.monthlyPrice) + (alternative ? ` Consider ${alternative} for a lower-cost alternative.` : ''),
      confidence,
      confidenceLabel: confidenceLabel(confidence),
      alternative,
    };
  });

  const totalMonthlySavings = recommendations.reduce((sum, rec) => sum + rec.monthlySavings, 0);
  const totalAnnualSavings = recommendations.reduce((sum, rec) => sum + rec.annualSavings, 0);
  const confidence = tools.length ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length : 0.65;

  return {
    id: crypto.randomUUID(),
    tools,
    recommendations,
    totalMonthlySavings: Math.round(totalMonthlySavings),
    totalAnnualSavings: Math.round(totalAnnualSavings),
    confidence: clamp(confidence, 0.2, 0.95),
    summary: '',
    teamSize: tools.reduce((max, tool) => Math.max(max, tool.teamSize), 0),
    createdAt: new Date().toISOString(),
  };
}
