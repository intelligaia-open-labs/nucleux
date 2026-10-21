# @nucleux/initial-cta

Initial CTA — the large, inviting input that anchors the empty state — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The empty-state invitation: an open headline, at most one supporting line, and
the same `OpenInput` the conversation continues in, so people learn one
control. It composes `SuggestedPrompts` (place, focus, never send) and takes
any other entry point — a `Randomize` dice, say — through `actions`.

## Exports

- **`InitialCta`** (ref → the `<textarea>`)
- Types: `InitialCtaProps`, `InitialCtaVariant`, `InitialCtaHeadingLevel`

## Variants

| `variant` | Use |
| --- | --- |
| `centered-hero` (default) | A wide composer dominating an empty thread. |
| `gradient-cta` | A brand-tinted panel with a single-line composer. |
| `multi-modal-row` | Voice, file and image buttons (`onVoice`, `onAttachFile`, `onAddImage`). |

## Behaviour

- Takes every `OpenInput` prop (`value`/`onValueChange` or `defaultValue`, `onSubmit`, `sendKey`, `maxLength`, `actions`, `loading`…). Uncontrolled, it clears only after a successful send.
- `suggestions` show while the field is empty; choosing one places its prompt, focuses the field with the caret at the end, marks the choice and announces it. They step aside once the person edits, and come back if the field is cleared.
- `headline` (default "What can I help with?") names the section; `headingLevel` sets its level.

## Usage

```tsx
import { InitialCta } from "@nucleux/initial-cta";
import { Randomize } from "@nucleux/randomize";

<InitialCta
  aria-label="Message Aria"
  headline="What can I help with today?"
  description="Ask about your accounts, draft emails, or analyse data."
  suggestions={["Summarise renewal risks", "Draft a follow-up to Acme"]}
  value={draft}
  onValueChange={setDraft}
  actions={<Randomize showLabel={false} prompts={starters} draft={draft} onSelect={(p) => setDraft(p)} />}
  onSubmit={startConversation}
/>
```

## Install

```bash
pnpm add @nucleux/initial-cta @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
