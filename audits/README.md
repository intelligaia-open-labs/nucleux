# Nucleux AI-Readiness Audits

Reports from [open-design-system-bench](https://github.com/christophhdesign/open-design-system-bench)
- the open benchmark for "when an AI agent builds UI against your component
library, does it use your system correctly?"

## Files

| File | What |
|---|---|
| `ai-readiness-audit.md` | Tier-1 static audit (7 checks) + Tier-2 behavioral sub-scores, human-readable |
| `ai-readiness-audit.json` | Same, machine-readable JSON |
| `tier2-medium-run-results.json` | Full Tier-2 benchmark run (16 ok cells, glm-5.2 via Yantra) |

## Headline

- **Composite: 43.4 / 100 - Tier: Invested** (40-70)
- **Ceiling: 30.8** - guided mean 61.6, but 0/16 cells passed every dimension
- **Engagement: 0.0** - the agent ignored the design system entirely (apiFidelity=0 across all cells; it hand-rolls instead of importing @nucleux components)
- **Vocabulary-behavioral: 100.0** - no hallucinated components or invented props

## How to reproduce

```sh
# Tier-1 audit (free, no API key, seconds):
npx tsx src/cli.ts audit --verbose

# Tier-2 benchmark (needs an LLM provider):
npx tsx src/cli.ts run --profile medium --judge-provider <provider> --judge-model <model>
npx tsx src/cli.ts audit --run runs/<run-dir> --verbose
```
