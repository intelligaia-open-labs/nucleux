# @nucleux/open-input

Open Input — free-form composer for any natural-language ask: grows to eight lines then Expand, with a Request settings menu (Mode, Tone, Style, Improve prompt) — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The persistent composer users return to after the first interaction. It grows
with the prompt up to `maxHeight` and then scrolls, always pairs the field with
a visible send button, shows a counter only near `maxLength`, and never loses
the text: a failed send keeps it and offers Retry.

## Exports

- **`OpenInput`** — the composer (ref → the `<textarea>`)
- Types: `OpenInputProps`, `OpenInputVariant`, `OpenInputSendKey`

## Variants

| `variant` | Use |
| --- | --- |
| `expanding-area` (default) | Starts as one line, grows; controls in a footer row. Chat, email. |
| `single-line` | Compact pill for dense layouts (a docked side panel). |
| `input-with-send` | Field plus a separate, explicit send button. Canvas and code prompts. |

## Behaviour

- `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled — clears only after a successful send).
- `onSubmit(text)` may return a promise: a spinner shows while pending; a rejection keeps the text and shows an error row (`role="alert"`) with Retry. Pass `error` / `onRetry` to control it yourself.
- `sendKey="enter"` (default; Shift+Enter is a newline) or `"mod-enter"` (⌘/Ctrl+Enter sends). The send button carries `aria-keyshortcuts`.
- Send is disabled only while there is nothing to send. `loading` swaps it for a Stop button (`onStop`).
- `label` renders a visible `<label>`; otherwise pass `aria-label`. `actions` holds secondary controls (add context, voice, model).
- `maxLength` + `counterThreshold` (0.8): the `n / max` counter appears near the limit (`aria-live="polite"`).

## Usage

```tsx
import { OpenInput } from "@nucleux/open-input";

const [value, setValue] = useState("");

<OpenInput
  label="Ask Aria"
  placeholder="What do you want to know?"
  value={value}
  onValueChange={setValue}
  maxLength={4000}
  onSubmit={async (text) => { await send(text); setValue(""); }}
/>
```

## Install

```bash
pnpm add @nucleux/open-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
