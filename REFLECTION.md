## 1. Hardest bug
The hardest issue was the audit submit flow getting stuck in loading state. I initially assumed it was frontend related, but later found the API route was not returning a response in all execution paths. I debugged it using console logs step-by-step from frontend → API → Supabase. Fixing missing return statements resolved the issue.

## 2. Decision I reversed
Initially I used full AI-based calculations for audit recommendations, but later switched to a rules-based engine for consistency and lower cost. This improved reliability and reduced unpredictable outputs.

## 3. What I would build next
I would add analytics dashboards showing historical audit trends and SaaS spend forecasting for companies.

## 4. AI usage
I used AI tools for boilerplate generation, debugging hints, and refactoring suggestions. However, I manually verified all API logic and database schema. One issue AI suggested incorrectly was a Supabase schema change that would have overwritten existing data, which I avoided.

## 5. Self rating
- Discipline: 8/10 — consistent daily progress
- Code quality: 8/10 — modular structure used
- Design sense: 7/10 — clean UI but simple
- Problem solving: 8/10 — debugged API flow issues
- Entrepreneurial thinking: 7/10 — basic GTM and economics included
