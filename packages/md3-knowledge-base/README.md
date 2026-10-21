# @nucleux/md3-knowledge-base

Material 3 Knowledge Base — persistent, named sources the agent grounds in, with readiness and provenance — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/knowledge-base`](../knowledge-base) and **shares its API**: the props types are re-exported from it, so switching families is a change of import only.

## Exports

- **`Md3KnowledgeBase`** — pick the bases the agent grounds in: a card of checkable list rows (default) or a wrap of filter chips with document counts (`variant="chips"`). Readiness is a word on each row (Ready, Processing, Needs refresh, Couldn't process) led by a ring (not usable yet) or a filled disc (usable); a failed row is outlined in error with Retry on the row (`onRefresh`); `onAdd` adds an "Add a base" control.
- **`Md3KnowledgeBaseSources`** — the documents (and sections) an answer read; while `reading`, a pulsing tonal band says so, politely announced.
- **`Md3KnowledgeBaseCoverage`** — a tonal label: "Well-covered · 14 matches", "Partly covered", "Thin coverage".
- Types: `Md3KnowledgeBaseProps`, `Md3KnowledgeBaseSourcesProps`, `Md3KnowledgeBaseCoverageProps`, `Md3KnowledgeBaseVariant`, `Md3KnowledgeBaseCoverageLevel`, `Md3KnowledgeSourceStatus`, `KnowledgeSource`, `KnowledgeBaseSourceRef`

## Install

```bash
pnpm add @nucleux/md3-knowledge-base @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3KnowledgeBase, Md3KnowledgeBaseSources, Md3KnowledgeBaseCoverage } from "@nucleux/md3-knowledge-base";

<Md3KnowledgeBase
  heading="Active knowledge"
  onRefresh={(id) => reindex(id)}
  sources={[
    { id: "crm", name: "CRM records", status: "ready", count: 18240 },
    { id: "msa", name: "MSA Template.pdf", status: "error", meta: "Password-protected" },
  ]}
/>
<Md3KnowledgeBaseSources baseName="Sales playbook" sources={[{ id: "1", name: "Renewal Playbook v3", section: "§4.1" }]} />
<Md3KnowledgeBaseCoverage level="high" matches={14} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
