import type { ToolVendor } from '@/types/audit';

export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  minSeats: number;
  maxSeats: number | null;
  description: string;
}

export interface VendorPricing {
  vendor: ToolVendor;
  plans: PricingPlan[];
  defaultAlternative?: string;
}

export const pricingCatalog: VendorPricing[] = [
  {
    vendor: 'Cursor',
    plans: [
      { name: 'Hobby', monthlyPrice: 20, minSeats: 1, maxSeats: 5, description: 'Light usage for startups testing AI coding.' },
      { name: 'Pro', monthlyPrice: 45, minSeats: 1, maxSeats: 20, description: 'Standard team productivity plan.' },
      { name: 'Business', monthlyPrice: 90, minSeats: 10, maxSeats: 100, description: 'Extended toolset for growing engineering teams.' },
      { name: 'Enterprise', monthlyPrice: 180, minSeats: 50, maxSeats: null, description: 'Custom contracts, support, and audit controls.' },
    ],
    defaultAlternative: 'GitHub Copilot',
  },
  {
    vendor: 'GitHub Copilot',
    plans: [
      { name: 'Individual', monthlyPrice: 19, minSeats: 1, maxSeats: 1, description: 'Single developer personal plan.' },
      { name: 'Business', monthlyPrice: 30, minSeats: 5, maxSeats: 100, description: 'Collaboration for small teams.' },
      { name: 'Enterprise', monthlyPrice: 60, minSeats: 50, maxSeats: null, description: 'Enterprise security and support.' },
    ],
    defaultAlternative: 'Cursor',
  },
  {
    vendor: 'Claude',
    plans: [
      { name: 'Free', monthlyPrice: 0, minSeats: 1, maxSeats: 5, description: 'Entry-level access for evaluation.' },
      { name: 'Pro', monthlyPrice: 50, minSeats: 1, maxSeats: 20, description: 'More tokens and faster performance.' },
      { name: 'Max', monthlyPrice: 120, minSeats: 5, maxSeats: 50, description: 'High throughput for heavy teams.' },
      { name: 'Team', monthlyPrice: 210, minSeats: 10, maxSeats: 100, description: 'Team management controls and compliance.' },
      { name: 'Enterprise', monthlyPrice: 380, minSeats: 50, maxSeats: null, description: 'Custom SLA and dedicated support.' },
      { name: 'API Direct', monthlyPrice: 0.065, minSeats: 1, maxSeats: null, description: 'Pay-as-you-go API spend for production workloads.' },
    ],
    defaultAlternative: 'OpenAI',
  },
  {
    vendor: 'ChatGPT',
    plans: [
      { name: 'Plus', monthlyPrice: 20, minSeats: 1, maxSeats: 5, description: 'Premium access for individual users.' },
      { name: 'Team', monthlyPrice: 25, minSeats: 3, maxSeats: 50, description: 'Collaboration and shared workspace.' },
      { name: 'Enterprise', monthlyPrice: 50, minSeats: 20, maxSeats: null, description: 'Enterprise-grade admin controls.' },
      { name: 'API Direct', monthlyPrice: 0.06, minSeats: 1, maxSeats: null, description: 'Flexible API spend for production.' },
    ],
    defaultAlternative: 'OpenAI',
  },
  {
    vendor: 'Anthropic',
    plans: [
      { name: 'API Direct', monthlyPrice: 0.09, minSeats: 1, maxSeats: null, description: 'Direct Anthropic API spend for teams.' },
    ],
    defaultAlternative: 'OpenAI',
  },
  {
    vendor: 'OpenAI',
    plans: [
      { name: 'API Direct', monthlyPrice: 0.06, minSeats: 1, maxSeats: null, description: 'Direct OpenAI API spend for production applications.' },
    ],
    defaultAlternative: 'Anthropic',
  },
  {
    vendor: 'Gemini',
    plans: [
      { name: 'Pro', monthlyPrice: 25, minSeats: 1, maxSeats: 10, description: 'Advanced assistant access for small teams.' },
      { name: 'Ultra', monthlyPrice: 80, minSeats: 5, maxSeats: 50, description: 'Higher throughput for content and coding.' },
      { name: 'API', monthlyPrice: 0.07, minSeats: 1, maxSeats: null, description: 'API pricing for production services.' },
    ],
    defaultAlternative: 'OpenAI',
  },
  {
    vendor: 'Windsurf',
    plans: [
      { name: 'Starter', monthlyPrice: 15, minSeats: 1, maxSeats: 5, description: 'Basic AI workflow management.' },
      { name: 'Growth', monthlyPrice: 40, minSeats: 5, maxSeats: 30, description: 'Structured workflows for growing teams.' },
      { name: 'Scale', monthlyPrice: 90, minSeats: 15, maxSeats: null, description: 'Enterprise workflow orchestration.' },
    ],
    defaultAlternative: 'ChatGPT',
  },
];

export const supportedTools = pricingCatalog.map((vendor) => vendor.vendor);

export const defaultToolPlans = pricingCatalog.reduce<Record<ToolVendor, string>>((acc, vendor) => {
  acc[vendor.vendor] = vendor.plans[0].name;
  return acc;
}, {} as Record<ToolVendor, string>);
