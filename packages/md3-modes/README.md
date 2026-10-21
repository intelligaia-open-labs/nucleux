# @nucleux/md3-modes

Material 3 Modes — choose how the agent approaches a request (Brainstorm, Draft, Review, Plan), shown as a chip in the composer and switchable before sending — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, states, keyboard model and accessible names are those of [`@nucleux/modes`](https://www.npmjs.com/package/@nucleux/modes) (`Modes`) — the props types are re-exported from it and the state logic (`useModes`) is shared — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`). In the `composer` variant the Mode chip sits in an `Md3AgentComposer` toolbar and the picker grows up from the composer.

## Exports

- **`Md3Modes`** — the whole pattern (`variant`: `composer` · `segmented` · `list` · `chip`)
- **`Md3ModesSegmented`** — an `Md3SegmentedButton` of modes (radio group)
- **`Md3ModesList`** — mode rows: 40dp icon tile, name, what changes, unavailable reason, trailing check
- **`Md3ModesChip`** — outlined "Mode ▾" assist chip, or tonal "Mode **Plan** ▾ ×" once set
- **`Md3ModesPicker`** — the menu-surface dialog: heading, rows, error-container alert, "No mode"
- **`Md3ModesNote`** — "Mode changed to … Your text is unchanged." with Undo
- Types: `Md3ModesProps`, `Md3ModeOption`, `Md3ModesVariant`, `Md3ModesNotice`, `Md3ModesSubmitDetails`, and each sub-component's `Md3…Props`

## Install

```bash
pnpm add @nucleux/md3-modes @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Modes } from "@nucleux/md3-modes";
import { Flag, Lightbulb, NotebookPen, Eye } from "lucide-react";

<Md3Modes
  modes={[
    { id: "brainstorm", name: "Brainstorm", icon: <Lightbulb />, description: "Explore several possible directions." },
    { id: "draft", name: "Draft", icon: <NotebookPen />, description: "Write a first version you can edit." },
    { id: "review", name: "Review", icon: <Eye />, description: "Check existing work for gaps and risks." },
    { id: "plan", name: "Plan", icon: <Flag />, description: "Break the work into steps with owners and dates." },
  ]}
  onSubmit={(text, { mode }) => send(text, { mode: mode?.id })}
/>
```

`sendLabel` is accepted for API parity; the send button is named by `Md3AgentComposer` ("Send").

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
