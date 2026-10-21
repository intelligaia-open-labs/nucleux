# @nucleux/knowledge-base

KnowledgeBase — select the context files an agent may use — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`KnowledgeBase`** (variant `kb-picker`) — choose which bases the agent grounds in this session. Props: `sources`, `value` / `defaultValue` / `onValueChange`, `heading`, plus `variant` (`"list"` default, or `"chips"` — "Product docs · 412"), `onAdd` / `addLabel` ("Add a base"), `onRefresh(id)` (Refresh / Retry on a stale or failed row).
  `KnowledgeSource`: `id`, `name`, `meta`, `icon`, plus `status` (`"ready"` | `"processing"` | `"stale"` | `"error"`, shown as Ready, Processing, Needs refresh, Couldn't process) and `count`.
- **`KnowledgeBaseSources`** (variant `kb-source-list`) — under an answer: the documents and sections it read (`sources: { id, name, section?, href? }[]`), "Used 3 sources from Sales playbook" with `baseName`; `reading` shows and announces "Reading…" while it happens.
- **`KnowledgeBaseCoverage`** (variant `kb-coverage-badge`) — `level` (`"high"` | `"partial"` | `"low"`) and `matches`: "Well-covered · 14 matches", "Partly covered", "Thin coverage".
- Types: `KnowledgeBaseProps`, `KnowledgeBaseVariant`, `KnowledgeSource`, `KnowledgeSourceStatus`, `KnowledgeBaseSourceRef`, `KnowledgeBaseSourcesProps`, `KnowledgeBaseCoverageProps`, `KnowledgeBaseCoverageLevel`.

## Install

```bash
pnpm add @nucleux/knowledge-base @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { KnowledgeBase, KnowledgeBaseSources, KnowledgeBaseCoverage } from "@nucleux/knowledge-base";

<KnowledgeBase variant="chips" heading="Grounded in" sources={bases} value={active} onValueChange={setActive} onAdd={addBase} />

<KnowledgeBaseSources sources={[{ id: "1", name: "Renewal Playbook v3", section: "§4.1" }]} />
<KnowledgeBaseCoverage level="high" matches={14} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
