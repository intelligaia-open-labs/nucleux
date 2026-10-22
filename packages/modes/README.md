# @nucleux/modes

Modes — choose how the agent works on a request (Fast, Balanced, Deep research), as a chip in the composer or a Mode row in Request settings, switchable before sending — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A named set of behaviour presets that makes the speed/depth trade-off — or the
way of working — legible without exposing raw parameters. Each mode says what
changes and how long it takes; the active mode sits in the composer as a chip
that can be changed or cleared before sending; unavailable modes stay listed
with the reason; a change adds one quiet line with Undo. Choosing a mode never
touches the prompt text, and Modes never sends on its own.

## Exports

- **`Modes`** — the whole pattern (`variant`: `composer` · `segmented` · `list` · `chip`)
- **`ModesSegmented`** — the segmented control (radio group)
- **`ModesList`** — rich rows: icon, name, expected speed · what it's for, unavailable reason
- **`ModesChip`** — the composer chip ("⚡ Fast ▾") with an optional ×
- **`ModesPicker`** — the dialog the chip opens: heading, rows, refusal alert, "No mode"
- **`ModesNote`** — "Mode changed to … Your text is unchanged." with Undo
- Shared logic (also used by `@nucleux/md3-modes`): `useModes`, `useModesRoving`, `useModesDismiss`, `modesLabels`, `modeSupportingText`
- Types: `ModesProps`, `ModeOption`, `ModesVariant`, `ModesNotice`, `ModesSubmitDetails`, `UseModesOptions`, `ModesState`, and each sub-component's `…Props`

## Variants

| `variant` | Use |
| --- | --- |
| `composer` (default) | The site's live preview: segmented control, the mode list and the chip in the composer. |
| `segmented` | Three or four labelled segments — session-level, like a tab (right rail, code). |
| `list` | Rich rows with expected speed — generation settings. |
| `chip` | Only the chip and its picker — beside the send button (chat, email). |

## Behaviour

- `modes` (`{ id, name, shortName?, description?, meta?, icon?, unavailable? }[]`), `value` / `defaultValue` / `onValueChange(id | null, mode | null)`.
- `open` / `defaultOpen` / `onOpenChange` for the picker; `clearable` (default true); `showDescriptions` (default true); `label` (default "Mode").
- Choosing an `unavailable` mode is refused: it isn't applied, the picker shows why (`role="alert"`), `onUnavailable(mode)` fires.
- Composer: `draft` / `defaultDraft` / `onDraftChange`, `onSubmit(text, { mode })`, `placeholder`, `composerLeading`, `composerActions`, `sendLabel`.
- Keyboard: radio groups with one tab stop; Arrow keys / Home / End move, Space or Enter chooses; Escape closes the picker and returns focus to the chip. Changes are announced politely.

## Install

```bash
pnpm add @nucleux/modes @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Modes } from "@nucleux/modes";

<Modes
  modes={[
    { id: "fast", name: "Fast", icon: "⚡", meta: "~3 seconds", description: "everyday asks and quick lookups" },
    { id: "balanced", name: "Balanced", icon: "⚖️", meta: "~15 seconds", description: "most tasks" },
    { id: "deep", name: "Deep research", shortName: "Deep", icon: "🧠", meta: "~1 minute", description: "multi-source, high-stakes" },
  ]}
  defaultValue="balanced"
  onSubmit={(text, { mode }) => send(text, { mode: mode?.id })}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
