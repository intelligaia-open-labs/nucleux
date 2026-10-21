# @nucleux/md3-suggestions

Material 3 Suggestions — agent-marked suggestion chips above the composer that add to the request, never send it — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model, states and accessible names are those of [`@nucleux/suggestions`](https://www.npmjs.com/package/@nucleux/suggestions) (`Suggestions`, `SuggestionsComposer`) — the props types are re-exported from it and the state logic is shared — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, outlined suggestion chips with a primary add icon, state layers, a raised composer card, and motion reduced under `prefers-reduced-motion`.

## Exports

- **`Md3Suggestions`** — the "Aria suggests" chip row with Why and Dismiss icon buttons, its status lines (added with Undo, dismissed, no longer relevant, loading, error with Retry), plus `follow-up` and `selection` variants
- **`Md3SuggestionsComposer`** — the row wired to `Md3AgentComposer`
- Re-exported helpers: `appendSuggestion`, `suggestionsMessages`
- Types: `Md3SuggestionsProps`, `Md3SuggestionsComposerProps`, `Md3SuggestionItem`, `Md3SuggestionsVariant`, `Md3SuggestionsStatus`, `Md3SuggestionsMessages`

## Install

```bash
pnpm add @nucleux/md3-suggestions @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3SuggestionsComposer } from "@nucleux/md3-suggestions";

<Md3SuggestionsComposer
  defaultValue="Summarize the September release."
  label="Aria suggests"
  reason="Release summaries are read to decide what still needs attention."
  suggestions={[
    { label: "Include unresolved blockers" },
    { label: "Group the work by owner" },
    { label: "Compare with the August release" },
  ]}
  isRelevant={(draft) => /release/i.test(draft)}
  onSubmit={send}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
