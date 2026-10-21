# @nucleux/proactive

Proactive Suggestions — invisible AI moments that arrive exactly when needed — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

An unsolicited suggestion raised when the agent notices something specific and
actionable. It leads with the finding, can show the evidence, offers exactly
one next action plus a one-press dismiss (× or Escape) and an optional snooze,
and does nothing until the person acts.

## Exports

- **`ProactiveSuggestion`**
- Types: `ProactiveSuggestionProps`, `ProactiveSuggestionVariant`, `ProactiveSuggestionPersist`

## Variants

| `variant` | Use |
| --- | --- |
| `contextual-banner` (default) | At the top of a surface. |
| `inline-suggestion` | A compact action beside the row or element it is about. |
| `side-toast` | Fixed to the bottom-right corner (override with `className`). |

## Behaviour

- `title` (the finding), `description` (the recommendation), `reason` (the evidence), `actionLabel` + `onAction`.
- `onAction` may return a promise: the action shows a spinner and `pendingLabel` meanwhile.
- `evidenceKey` + `persist` (`"local"` default): a dismissal is remembered so the same facts never bring it back, and only one keyed suggestion shows per session.
- `resolved` says "Resolved" and drops the actions. It sits in a polite live region, so its arrival is announced without taking focus.

## Usage

```tsx
import { ProactiveSuggestion } from "@nucleux/proactive";

<ProactiveSuggestion
  agentName="Aria"
  evidenceKey="renewals-2026-w17"
  title="Three renewals expire this week"
  description="Want Aria to draft outreach for each?"
  actionLabel="Draft emails"
  onAction={openReview}
  onSnooze={remindTomorrow}
/>
```

## Install

```bash
pnpm add @nucleux/proactive @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
