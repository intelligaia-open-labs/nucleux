# @nucleux/randomize

Randomize — a 'dice' that kickstarts the experience with a fun result — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A "surprise me" control beside the composer that fills it with a random
starter. It never replaces the input and never sends: the prompt goes to
`onSelect`, editable. If the composer already holds the person's words it asks
first — Replace, Add below or Cancel.

## Exports

- **`Randomize`**
- Types: `RandomizeProps`, `RandomizeVariant`, `RandomizeUseMode`

## Variants

| `variant` | Use |
| --- | --- |
| `dice-button` (default) | A dice in the composer toolbar; one tap places a starter (`showLabel={false}` inside a toolbar). |
| `shuffle-bar` | A labelled bar: shuffle, preview, then Use this. |
| `random-card` | A card with a random starter, Pick another, Use this and a way back. |

## Behaviour

- `prompts`: a local pool, no repeats until it is used up. Or `generate(previous)` (sync or async) with a working state ("Finding a different direction…") and Try again on failure.
- `onSelect(prompt, { mode })` — `mode` is `"append"` when the person chose Add below.
- Pass the composer's text as `draft` to enable the replace / add below / cancel guard.
- Status changes are announced politely.

## Usage

```tsx
import { Randomize } from "@nucleux/randomize";

<Randomize
  variant="random-card"
  prompts={["Draft a one-paragraph product brief for an idea you haven't shipped."]}
  draft={draft}
  onSelect={(p, { mode }) => setDraft(mode === "append" ? `${draft}\n\n${p}` : p)}
/>
```

## Install

```bash
pnpm add @nucleux/randomize @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
