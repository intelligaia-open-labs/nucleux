# Nucleux design knowledge

The machine-readable design knowledge that coding agents get through
`@nucleux/mcp`. Edit the sources here; everything agent-facing is generated
from them and checked in CI.

```
knowledge/
  workflow.md                 the design-first agent workflow (one source for
                              the skill, the AGENTS.md section and the MCP prompt)
  patterns/<id>/
    pattern.json              the spec
    example.tsx               a complete, working reference (default export)
```

## Adding or changing a pattern

A pattern is a reusable page composition built **only from components Nucleux
already exports**. If it needs a component that doesn't exist, build the
component first (see `CLAUDE.md`), or set `"status": "proposed"`.

1. Create `knowledge/patterns/<id>/` (kebab-case; the id must match the directory).
2. Write `example.tsx`: a default-exported component that renders the pattern
   with realistic sample data, imports only from `@nucleux/react` (plus
   `react` and `lucide-react`), and uses only semantic token classes.
3. Write `pattern.json`:

   | Field | Type | Notes |
   | --- | --- | --- |
   | `id`, `name`, `summary`, `description` | string | `summary` is the one line shown in search results |
   | `status` | `"curated"` \| `"proposed"` | curated = reviewed and tested |
   | `since` | string | library version it was added in |
   | `useCases`, `keywords` | string[] | drive `search_patterns` (weighted highest) |
   | `whenToUse`, `whenNotToUse` | string[] | |
   | `components.required`, `components.optional` | export names | every name must be a real export; every required one must be imported by the example |
   | `composition` | tree of `{ component \| element, role?, children? }` | each `component` must be listed above |
   | `layout`, `responsive`, `tokens`, `accessibility`, `antiPatterns` | string[] | concrete rules with breakpoints and class names |
   | `states`, `routing` | string (optional) | |
   | `related` | pattern ids | must exist |
   | `dependencies.npm` | `{ name, reason }[]` | non-Nucleux packages the example needs |
   | `example` | file name | usually `example.tsx` |

4. Regenerate and test:

   ```bash
   pnpm --filter @nucleux/mcp build   # regenerates catalog, knowledge.json, skill
   pnpm typecheck && pnpm test        # example typechecks, renders, passes axe
   ```

   `scripts/gen-mcp-knowledge.mjs` refuses unknown components, unknown related
   patterns and `@nucleux` imports that don't exist. The tests also fail if
   `knowledge.json` is out of date or an example has accessibility violations.

## Changing the workflow

Edit `workflow.md`, then run `node scripts/gen-agent-files.mjs` (the MCP build
does this too). Commit the regenerated `SKILL.md`, `templates/AGENTS.md` and
plugin copy. `src/test/docs.test.ts` fails if they drift.

## Component metadata

Component contracts are not written by hand: `scripts/gen-mcp-catalog.mjs` reads
each package's exported `*Props` interfaces with the TypeScript parser. To
improve what agents see for a component, improve its source: JSDoc on each
prop, string-literal union types for variants (`type ButtonVariant = "primary" | …`),
defaults in the destructuring pattern, and `@deprecated` tags.
