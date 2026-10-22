# @nucleux/prompt-enhancer

Prompt Enhancer — a magic-wand action that rewrites a short ask into a precise one, shown as a reviewable diff; starts from the wand or the Improve prompt row in Request settings — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

An Enhance action in the composer expands a terse prompt into a clearer one
and shows it beside the original — each addition marked, explained and
removable, assumptions labelled. It never silently replaces the prompt: Use
puts the result in the composer with Undo and sends nothing; Keep original and
Edit are always there, and a failure leaves the original untouched. The
component calls no model — the app supplies `onEnhance`.

## Exports

- **`PromptEnhancer`** — the composer, the Enhance action and the review
- **`usePromptEnhancer`** — the shared, non-visual logic (state machine, async enhance with cancel, Use/Undo)
- Helpers: `buildEnhancedPrompt`, `resolveEnhancedPrompt`, `getPromptEnhancerSegments`, `describePromptEnhancerChange`, `PROMPT_ENHANCER_TEXT`
- Types: `PromptEnhancerProps`, `PromptEnhancerVariant`, `PromptEnhancerState`, `PromptEnhancerDiffStyle`, `PromptEnhancerChange`, `PromptEnhancerSuggestion`, `PromptEnhancerSegment`, `PromptEnhancerController`

## Variants

| `variant` | Use |
| --- | --- |
| `preview-diff` (default) | Original and enhanced side by side (`diffStyle="split"`) or one sentence with additions marked (`"inline"`) |
| `wand-button` | The enhancement is applied in place; Undo restores the original |
| `auto-enhance-toggle` | A switch: when on, Send enhances the prompt first, then sends it |

States: `original`, `enhancing` (cancel), `enhanced`, `editing`, `accepted` (Undo), `reverted`, `failed` (Try again / Keep original).

## Install

```bash
pnpm add @nucleux/prompt-enhancer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { PromptEnhancer } from "@nucleux/prompt-enhancer";

<PromptEnhancer
  value={draft}
  onValueChange={setDraft}
  hint="Aria will expand this prompt"
  onEnhance={(prompt, { signal }) => api.enhance(prompt, { signal })}
  // resolves with { changes: [{ id, text: " from the last quarter", reason, assumption? }] }
  // or { text: "the whole enhanced prompt" }
  onSubmit={send}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
