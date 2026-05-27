import { describe, expect, it } from 'vitest';
import { generateAuditRecommendations } from '@/services/audit-engine';

describe('Audit engine', () => {
  it('detects wrong enterprise plans for tiny teams', () => {
    const audit = generateAuditRecommendations([
      { id: '1', tool: 'ChatGPT', plan: 'Enterprise', monthlySpend: 1200, seats: 2, teamSize: 2, useCase: 'coding' },
    ]);

    expect(audit.recommendations[0].confidenceLabel).toBe('High');
    expect(audit.recommendations[0].monthlySavings).toBeGreaterThan(0);
    expect(audit.recommendations[0].reason).toContain('Enterprise plans');
  });

  it('calculates aggregate savings across multiple tools', () => {
    const audit = generateAuditRecommendations([
      { id: 'a', tool: 'Cursor', plan: 'Pro', monthlySpend: 220, seats: 3, teamSize: 6, useCase: 'coding' },
      { id: 'b', tool: 'ChatGPT', plan: 'Team', monthlySpend: 180, seats: 4, teamSize: 6, useCase: 'writing' },
    ]);

    expect(audit.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(audit.totalAnnualSavings).toBe(audit.totalMonthlySavings * 12);
    expect(audit.recommendations.length).toBe(2);
  });

  it('returns low savings honest message when savings are minimal', () => {
    const audit = generateAuditRecommendations([
      { id: '3', tool: 'Windsurf', plan: 'Starter', monthlySpend: 15, seats: 1, teamSize: 3, useCase: 'mixed' },
    ]);

    expect(audit.totalMonthlySavings).toBe(0);
    expect(audit.recommendations[0].reason).toContain('Current plan appears aligned');
  });

  it('recommends same-vendor downgrade when a lower tier is available', () => {
    const audit = generateAuditRecommendations([
      { id: '4', tool: 'Cursor', plan: 'Business', monthlySpend: 360, seats: 4, teamSize: 5, useCase: 'coding' },
    ]);

    expect(audit.recommendations[0].monthlySavings).toBeGreaterThan(0);
    expect(audit.recommendations[0].recommendedSpend).toBeLessThan(360);
  });

  it('handles multiple tool inputs and keeps recommendations safe', () => {
    const audit = generateAuditRecommendations([
      { id: '5', tool: 'OpenAI', plan: 'API Direct', monthlySpend: 800, seats: 12, teamSize: 12, useCase: 'data' },
      { id: '6', tool: 'Claude', plan: 'Max', monthlySpend: 480, seats: 6, teamSize: 6, useCase: 'research' },
    ]);

    expect(audit.recommendations.length).toBe(2);
    expect(audit.totalAnnualSavings).toBe(audit.recommendations.reduce((sum, rec) => sum + rec.annualSavings, 0));
  });
});
