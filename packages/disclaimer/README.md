# @nucleux/disclaimer

Disclaimer — a first-impression clarification of what the AI is, isn't, and what it doesn't know — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A short, honest statement of the agent's scope, limits and knowledge cutoff,
shown at the start of the experience. Not legal boilerplate, and never in the
error colour — a known limit is not a failure.

## Exports

- **`Disclaimer`**
- Types: `DisclaimerProps`, `DisclaimerVariant`, `DisclaimerGroup`

## Variants

| `variant` | Use |
| --- | --- |
| `capabilities-list` (default) | "What Aria can do" on the welcome screen. |
| `limitations-card` | "Aria won't" — regulated or high-stakes contexts. |
| `cutoff-note` | "Aria knows up to April 2026" — a caption in a panel footer or by the compose button. |

## Behaviour

- `agentName` feeds the default title and label; `items` are bullets, `children` a short paragraph.
- Three points max: beyond `maxItems` (3) they sit behind "Show all" (`aria-expanded`).
- `groups` render labelled rows (can / can't / needs approval / may get wrong).
- `cutoff` and `learnMoreHref` add a footer line. The root is `role="note"`, named by its title.

## Usage

```tsx
import { Disclaimer } from "@nucleux/disclaimer";

<Disclaimer agentName="Aria" items={["Summarise documents and threads", "Draft replies and emails"]} cutoff="Apr 2026" />
<Disclaimer variant="cutoff-note" agentName="Aria" cutoff="April 2026" />
```

## Install

```bash
pnpm add @nucleux/disclaimer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
