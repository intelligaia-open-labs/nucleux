# @nucleux/nudges

Nudges — tiny contextual hints that surface features the user hasn't discovered yet — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A small, non-blocking tip shown when a real signal fires. It says what the
person can do, can say why it appeared, and offers Try it, Not now and a
dismiss button (Escape too). With a `nudgeId` it is capped at one per session
and dismissals are remembered.

## Exports

- **`Nudge`** — the tip
- **`NudgeAction`** — a small action button for extra `actions`
- Types: `NudgeProps`, `NudgeActionProps`, `NudgeVariant`, `NudgeSide`, `NudgePersist`

## Variants

| `variant` | Use |
| --- | --- |
| `inline-tip-card` (default) | A card in the layout for less time-sensitive tips. |
| `tooltip-nudge` | A bubble pointing at `children` (the control); closes on outside click. |
| `highlight-pulse` | A soft ring and a "New" badge around `children`, gone once used. |

## Behaviour

- `message` (required), `title`, `reason` (behind "Why this tip?", `aria-expanded`).
- `onTry` / `onSnooze` / `onDismiss` show their actions; `open` / `defaultOpen` / `onOpenChange` control visibility.
- The anchor control gets `aria-describedby` pointing at the message.
- `nudgeId` + `persist` (`"local"` default, `"session"`, `"none"`): a dismissed or used tip never returns, and only one id'd nudge shows per session. `onImpression` fires each time it is shown, for tracking.
- The pulse respects `prefers-reduced-motion`.

## Usage

```tsx
import { Nudge } from "@nucleux/nudges";

{textOnlySends >= 3 && (
  <Nudge variant="tooltip-nudge" nudgeId="pdf-upload" message="Try uploading a PDF — Aria can summarise it in seconds."
    reason="You've sent three text-only messages." onTry={openUpload} onImpression={track}>
    <Button size="icon" aria-label="Attach a file"><Paperclip /></Button>
  </Nudge>
)}
```

## Install

```bash
pnpm add @nucleux/nudges @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
