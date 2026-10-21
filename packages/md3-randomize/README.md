# @nucleux/md3-randomize

Material 3 Randomize — a surprise-me control that places a random, editable starter in the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/randomize`](https://www.npmjs.com/package/@nucleux/randomize) (`Randomize`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3Randomize`** — a surprise-me control (tonal dice icon button, shuffle bar or random card) that places a random, editable starter via `onSelect` and asks before replacing the person's `draft`; `prompts` pool or async `generate`
- Types: `Md3RandomizeProps`, `Md3RandomizeVariant`, `Md3RandomizeUseMode`

## Install

```bash
pnpm add @nucleux/md3-randomize @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Randomize } from "@nucleux/md3-randomize";

<Md3Randomize draft={draft} prompts={starters} onSelect={(p, { mode }) => setDraft(mode === "append" ? `${draft}\n\n${p}` : p)} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
