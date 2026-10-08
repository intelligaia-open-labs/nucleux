# Nucleux AI-Readiness Audits

Reports from [open-design-system-bench](https://github.com/christophhdesign/open-design-system-bench)
— the open benchmark for "when an AI agent builds UI against your component
library, does it use your system correctly?"

## Files

| File | What |
|---|---|
| `ai-readiness-audit.md` | Tier-1 static audit (7 checks) + Tier-2 behavioral sub-scores, human-readable |
| `ai-readiness-audit.json` | Same, machine-readable JSON |
| `tier2-medium-run-results.json` | Full Tier-2 benchmark run (30 cells: 10 tasks x bare/agents-md/skill, glm-5.2 via Yantra) |

## Headline (after tickets #9-#16 landed)

- **Composite: 67.5 / 100 — Invested tier** (was 43.4 before the fixes; surface-only now scores 83.7 = AI-native)
- **Lift: 73.7** (raw +23.7: bare 51.6 → agents-md 70.5 → skill 79.5)
- **Engagement: 42.3** (was 0.0 — agents now import @nucleux/* instead of hand-rolling)
- **Ceiling: 37.6** — held down by a compile-dimension fixture artifact (see caveat)
- **Vocabulary-behavioral: 100.0** — no hallucinated components or invented props

### Known fixture caveat (Ceiling/compile)

The bench's source-consume fixture maps `@nucleux/react` to source but cannot
resolve the monorepo's internal `@nucleux/utils` cross-imports, so cells that
import the real components fail `tsc` with TS2307 on the *library's own files*
— not on the agent's code. apiFidelity/tokenDiscipline/a11yStatic/judgment are
unaffected (they read source text). Against a published npm build containing
these fixes, compile would pass and Ceiling/composite would rise.

## How to reproduce

```sh
# Tier-1 audit (free, no API key, seconds):
npx tsx src/cli.ts audit --verbose

# Tier-2 benchmark (needs an LLM provider):
npx tsx src/cli.ts run --profile medium --judge-provider <provider> --judge-model <model>
npx tsx src/cli.ts audit --run runs/<run-dir> --verbose
```
