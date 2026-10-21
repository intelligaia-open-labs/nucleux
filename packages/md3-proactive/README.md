# @nucleux/md3-proactive

Material 3 Proactive Suggestions — the agent notices something and offers one reviewable next step — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/proactive`](https://www.npmjs.com/package/@nucleux/proactive) (`ProactiveSuggestion`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3ProactiveSuggestion`** — an unsolicited suggestion with the finding, the evidence, one action (working state while it runs), snooze and dismiss; a secondary-container banner, an inline capsule or a side toast; remembered per `evidenceKey`
- Types: `Md3ProactiveSuggestionProps`, `Md3ProactiveSuggestionVariant`, `Md3ProactiveSuggestionPersist`

## Install

```bash
pnpm add @nucleux/md3-proactive @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3ProactiveSuggestion } from "@nucleux/md3-proactive";

<Md3ProactiveSuggestion
  agentName="Aria"
  evidenceKey="blockers-w38"
  title="Two release blockers have no owner"
  description="Assign owners before the release?"
  actionLabel="Review"
  onAction={openReview}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
