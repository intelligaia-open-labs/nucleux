# @nucleux/md3-prompt-enhancer

Material 3 Prompt Enhancer — proposes a clearer version of the request you wrote, every addition marked and explained — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, states, keyboard model and accessible names are those of [`@nucleux/prompt-enhancer`](https://www.npmjs.com/package/@nucleux/prompt-enhancer) (`PromptEnhancer`) — the props types are re-exported from it and the logic is its `usePromptEnhancer` — so you switch families by changing only the import. Only the look differs: an outlined review card above an `Md3AgentComposer`, primary-container highlights, M3 checkboxes, text/outlined/filled buttons, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3PromptEnhancer`** — the composer with an Enhance tool, the review card and status lines
- Types: `Md3PromptEnhancerProps`, `Md3PromptEnhancerVariant`, `Md3PromptEnhancerState`, `Md3PromptEnhancerDiffStyle`, `Md3PromptEnhancerChange`, `Md3PromptEnhancerSuggestion`, `Md3PromptEnhancerSegment`, `Md3PromptEnhancerController`

## Install

```bash
pnpm add @nucleux/md3-prompt-enhancer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3PromptEnhancer } from "@nucleux/md3-prompt-enhancer";

<Md3PromptEnhancer
  value={draft}
  onValueChange={setDraft}
  onEnhance={(prompt, { signal }) => api.enhance(prompt, { signal })}
  onSubmit={send}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
