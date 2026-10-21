# @nucleux/suggested-prompts

Suggested Prompts — smart, context-aware preset actions to jumpstart engagement — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A few ready-made prompts that answer "what do I type?" without blocking the
composer. Choosing one hands its prompt to `onSelect` — place it in the
composer as editable text; never send it.

## Exports

- **`SuggestedPrompts`** — the set (`items` + `onSelect`, or compose children)
- **`SuggestedPrompt`** — one suggestion (a button; `icon`, `description`, `selected`)
- Types: `SuggestedPromptsProps`, `SuggestedPromptProps`, `SuggestedPromptItem`, `SuggestedPromptsVariant`, `SuggestedPromptsAfterSelect`

## Variants

| `variant` | Use |
| --- | --- |
| `chip-row` (default) | Pills above the composer in an empty thread. |
| `card-list` | Stacked cards with a supporting line, in an assistant panel. |
| `contextual-tooltip` | A dark bubble by the selection or cursor with one action; `onDismiss` adds × and Escape. |

## Behaviour

- `items` are strings or `{ id?, title, prompt?, description?, icon? }`; `onSelect(prompt, item)` gets the fuller `prompt` when there is one.
- Capped at `max` (5).
- `afterSelect`: `"keep"` (default), `"mark"` (others stay, the chosen one gets `aria-pressed`; control it with `selectedId`) or `"remove"` (remove once tapped).
- With `items` the set is a list named by `label` ("Try asking:"), or "Suggested prompts".
- Hide the set once the person types (the `hidden` attribute, or don't render it). `InitialCta` does this for you.

## Usage

```tsx
import { SuggestedPrompts } from "@nucleux/suggested-prompts";

<SuggestedPrompts
  label="Try asking:"
  items={[
    { title: "Find unresolved decisions", prompt: "Find the unresolved decisions blocking the September release." },
    "Draft a follow-up to Acme Corp",
    "Which accounts need attention?",
  ]}
  onSelect={(prompt) => { setDraft(prompt); composerRef.current?.focus(); }}
/>
```

## Install

```bash
pnpm add @nucleux/suggested-prompts @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
