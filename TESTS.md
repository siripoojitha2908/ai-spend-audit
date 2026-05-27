# Testing

The repository uses Vitest for unit testing.

## Run tests

```bash
npm run test
```

## Coverage

The current test suite focuses on the audit engine:
- Wrong plan detection for enterprise-tier overspend
- Savings aggregation across multiple tool inputs
- Low-savings honest result handling
- Same-vendor downgrade recommendations
- Multiple tool aggregation behavior

## Test files

- `tests/audit-engine.test.ts`
