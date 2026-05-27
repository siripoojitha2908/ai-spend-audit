# AI Spend Audit

AI Spend Audit is a launch-ready B2B SaaS web application for startup founders and engineering leaders to audit AI tool overspend, generate shareable savings reports, and capture qualified leads.

## Features
- Modern Next.js 14 App Router design
- Tailwind CSS + glassmorphism UI
- Supabase backend for audit storage and lead capture
- Resend transactional email integration
- OpenAI summary generation with error-safe fallback
- Shareable public audit pages
- Rules-based audit engine for plan recommendations
- LocalStorage form persistence and client-side validation
- Production-ready GitHub Actions CI

## Quick Start
1. Clone the repo.
2. Copy `.env.example` to `.env.local` and fill in credentials.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Deployment
Deploy on Vercel using the repository and set environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (optional)
- `NEXT_PUBLIC_APP_URL`

## Project Structure
- `app/` — Next.js routes, pages, and layout
- `components/` — reusable UI and page sections
- `lib/` — Supabase, AI client, email, pricing, and utilities
- `services/` — audit engine, validation, and share helpers
- `tests/` — Vitest test suite
- `.github/workflows/ci.yml` — CI pipeline

## Database schema
- `audits` table: `id`, `tools`, `recommendations`, `totalMonthlySavings`, `totalAnnualSavings`, `confidence`, `summary`, `teamSize`, `createdAt`
- `leads` table: `id`, `audit_id`, `email`, `company_name`, `role`, `team_size`, `created_at`

## Tradeoffs
- Uses a rules-based engine for deterministic audit recommendations rather than full AI calculation.
- Summary generation is powered by OpenAI, with fallback text for reliability.
- The project is designed for launch readiness while leaving room for future SaaS growth, analytics, and onboarding flow enhancements.

**Supabase Repair**
- **Purpose:** Safe, idempotent schema repair for `audits` and `leads`, with verification steps.
- **Files:** See [supabase/migrations/20260527_repair_schema.sql](supabase/migrations/20260527_repair_schema.sql) and [scripts/supabase-repair.mjs](scripts/supabase-repair.mjs).
- **Required env vars:**
   - **NEXT_PUBLIC_SUPABASE_URL:** Supabase project URL.
   - **SUPABASE_SERVICE_ROLE_KEY:** Service key (sensitive) used for server-side schema repair and verification.
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY:** Optional for local app runtime.
- **Local setup:**
   1. Copy `.env.example` to `.env.local` and fill values.
   2. Ensure `.env.local` is listed in `.gitignore` (it is by default).
   3. Install dependencies: `npm install`.
   4. Run repair: `npm run supabase:repair`.
- **What the repair does:** Creates missing tables/columns, safely adds indexes, and adds FK only when there are no dangling lead references. It never drops existing data.
- **Verification steps performed automatically:** audit insert, lead insert, and public-audit retrieval. The runner prints a `FINAL_STATUS` JSON with results.
