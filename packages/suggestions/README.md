# @nucleux/suggestions

Suggestions — quick-action chips above the composer, under an answer or on a selection that add to the request, never send it — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

Context-aware chips that turn the likely next step into a tap. At most three,
labelled with verbs. They can be marked as the agent's ("Aria suggests"),
explain themselves behind an info toggle and be dismissed. Choosing one never
sends: it is appended after the person's own words, stays editable, and is
confirmed in one line with Undo.

## Exports

- **`Suggestions`** — the chip row and its status lines
- **`SuggestionsComposer`** — the row wired to `OpenInput`: pause before offering, append with Undo, dismiss, withdraw when no longer relevant, optional async loading
- Helpers shared with the Material 3 twin: `appendSuggestion`, `handleSuggestionsKeyDown`, `useSuggestions`, `useSuggestionsComposer`, `suggestionsMessages`, `suggestionKey`
- Types: `SuggestionsProps`, `SuggestionsComposerProps`, `SuggestionItem`, `SuggestionsVariant`, `SuggestionsStatus`, `SuggestionsMessages`

## Variants

| `variant` | Use |
| --- | --- |
| `compose` (default) | Chips just above the composer: starters or quick edits. |
| `follow-up` | Under an answer: what to ask next (marked ↳). |
| `selection` | A floating toolbar of actions on highlighted content (`role="toolbar"`). |

## States (`status`)

`available` (chips) · `loading` · `error` (Retry via `onRetry`) · `accepted` (Undo via `onUndo`) · `dismissed` · `irrelevant` · `idle` (renders nothing).

## Behaviour

- `label` gives the row a visible heading and names the group; without it, pass `aria-label`.
- `reason` sits behind an info button (`aria-expanded`). `onDismiss` adds a close button; Escape dismisses too.
- `actionLabel` prefixes each chip's accessible name ("Add to prompt: Include unresolved blockers").
- Arrow keys move between chips, Home/End jump to the ends; every chip is also a Tab stop.
- `pendingId` marks a chip whose action is running (spinner, `aria-busy`).
- No model calls: suggestions are data (`suggestions`) or an async `loadSuggestions(draft, { signal })` the app supplies.

## Usage

```tsx
import { SuggestionsComposer } from "@nucleux/suggestions";

<SuggestionsComposer
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

```tsx
import { Suggestions } from "@nucleux/suggestions";

<Suggestions variant="follow-up" aria-label="Suggested follow-ups"
  suggestions={[{ label: "Why Acme?" }, { label: "Draft outreach" }]} onSelect={(s) => ask(s.label)} />
```

## Install

```bash
pnpm add @nucleux/suggestions @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
