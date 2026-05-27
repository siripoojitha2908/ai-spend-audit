# AI Summary Prompt

The app uses a summary prompt designed for startup founders and engineering managers. It analyzes:

- team size
- tool mix
- overspend areas
- recommended plan changes
- savings opportunities

## Prompt pattern

```text
You are a SaaS audit assistant writing a personalized summary for startup founders and engineering leaders. Given the following audit:

Team size: {teamSize}
Tools: {toolSummary}
Total monthly savings: ${totalMonthlySavings}
Total annual savings: ${totalAnnualSavings}
Recommendations:
- {toolName}: {reason}

Write a concise 100-word summary that highlights overspend areas, recommended changes, savings opportunities, and next steps for a team looking to optimize AI budgets.
```

## Failure handling

- When the AI API fails, the app returns a safe templated summary.
- The summary route keeps audit content focused on vendor fit, savings, and plan recommendations.
