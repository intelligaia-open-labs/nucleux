# @nucleux/md3-suggested-prompts

Material 3 Suggested Prompts — a few ready-made requests that place editable text in the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/suggested-prompts`](https://www.npmjs.com/package/@nucleux/suggested-prompts) (`SuggestedPrompts`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3SuggestedPrompts`** — 3–5 ready-made prompts as M3 suggestion chips, outlined cards or a rich tooltip; `onSelect` hands back the fuller prompt; `afterSelect` keep / mark / remove
- **`Md3SuggestedPrompt`** — one suggestion (chip, card or tooltip action, from the surrounding variant)
- Types: `Md3SuggestedPromptsProps`, `Md3SuggestedPromptProps`, `Md3SuggestedPromptsVariant`, `Md3SuggestedPromptsAfterSelect`, `SuggestedPromptItem`

## Install

```bash
pnpm add @nucleux/md3-suggested-prompts @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3SuggestedPrompts } from "@nucleux/md3-suggested-prompts";

<Md3SuggestedPrompts
  label="Try asking:"
  items={[{ title: "Find unresolved decisions", prompt: "Find the unresolved decisions blocking the September release." }]}
  onSelect={(prompt) => setDraft(prompt)}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
