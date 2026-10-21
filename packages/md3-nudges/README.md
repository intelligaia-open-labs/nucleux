# @nucleux/md3-nudges

Material 3 Nudges — a quiet, dismissible tip about a capability that would help right now — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/nudges`](https://www.npmjs.com/package/@nucleux/nudges) (`Nudge`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3Nudge`** — a dismissible tip: a filled inline card, an anchored primary-container bubble (`tooltip-nudge`) or a primary ring with a "New" badge (`highlight-pulse`); Why this tip?, Try it, Not now; remembered with `nudgeId`
- **`Md3NudgeAction`** — an extra action inside the nudge (takes the shadcn `ButtonProps`)
- Types: `Md3NudgeProps`, `Md3NudgeActionProps`, `Md3NudgeVariant`, `Md3NudgeSide`, `Md3NudgePersist`

## Install

```bash
pnpm add @nucleux/md3-nudges @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Nudge } from "@nucleux/md3-nudges";

<Md3Nudge
  nudgeId="pdf-upload"
  message="You can ask Aria about text you select in a transcript."
  reason="You selected transcript text twice today."
  onTry={openSelectionAsk}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
