# @nucleux/md3-open-input

Material 3 Open Input — the persistent free-form composer for any natural-language ask: grows to eight lines then Expand, with a Request settings menu (Mode, Tone, Style, Improve prompt) — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/open-input`](https://www.npmjs.com/package/@nucleux/open-input) (`OpenInput`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3OpenInput`** — the persistent composer: auto-grows to `maxHeight`, Enter or ⌘/Ctrl+Enter sends (`sendKey`), counter near `maxLength`, keeps the text and offers Retry when `onSubmit` rejects, Stop while `loading`; variants expanding-area / single-line / input-with-send
- **`Md3OpenInputModelChip`** — the composer's model chip ("Balanced High" in the primary colour), for the `model` slot
- Types: `Md3OpenInputProps`, `Md3OpenInputVariant`, `Md3OpenInputSendKey`, `Md3OpenInputSendVariant`, `Md3OpenInputLayout`, `Md3OpenInputModelChipProps`

By default it is the nucleux.in Material 3 composer bar: `+` (`onAdd`), the field, the `model` chip, a mic (`onVoice`) and a round send that fills with the primary colour once there is text (`sendVariant="filled"`). `Md3AgentComposer` renders this same component.

## Install

```bash
pnpm add @nucleux/md3-open-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";

<Md3OpenInput
  aria-label="Message Aria"
  placeholder="Ask about this project…"
  onSubmit={send}
  onAdd={openAddMenu}
  model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
  onVoice={startDictation}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
