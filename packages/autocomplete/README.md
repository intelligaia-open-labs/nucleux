# @nucleux/autocomplete

Autocomplete — ghost text that anticipates and completes user actions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Autocomplete`** — a text field (built on `Textarea`) that shows the likely rest of the text as ghost text after the caret.
  - `variant`: `"ghost-suffix"` (inline, with the accept key at its end), `"sentence-completion"` (a whole sentence, with *Tab to accept / Esc to dismiss* hints), `"block-completion"` (multi-line, monospace — code, table rows, long drafts)
  - `getSuggestion(text, { signal })` — the app's model call; returns the continuation (sync or async). Aborted when the text changes. Or pass a fixed `suggestion`.
  - `value` / `defaultValue` / `onValueChange`, `minChars` (8), `debounceMs` (150), `acceptKey` (`"tab"` | `"right"` | `"both"`, never Enter)
  - `onAccept(inserted)`, `onDismiss()`, `onError(error)`, `onStateChange(state)`; `label`, `fieldClassName`, `hideHints`
- Types: `AutocompleteProps`, `AutocompleteVariant`, `AutocompleteAcceptKey`, `AutocompleteState`, `AutocompleteRequest`

## Behaviour

- **Tab** (or the host's key) accepts the whole suggestion as ordinary, editable text and leaves the caret after it. **⌘/Ctrl + →** takes one word. A click on the ghost text accepts it. Accepting never submits.
- **Esc** dismisses it, and it stays away until the field is cleared.
- Keep typing the same words and it follows along without a new request; diverge and it is gone.
- Only suggests once `minChars` are typed and only while the caret is at the end of the text — never mid-word.
- The ghost text lives in an `aria-hidden` overlay, outside the field's value, and is announced once through a polite live region: "Suggestion: …. Tab to accept."
- If `getSuggestion` throws, the field keeps working without a suggestion and `onError` is called.

## Install

```bash
pnpm add @nucleux/autocomplete @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Autocomplete } from "@nucleux/autocomplete";

<Autocomplete
  label="Prompt"
  getSuggestion={async (text, { signal }) => {
    const res = await fetch("/api/complete", { method: "POST", body: text, signal });
    return (await res.json()).completion; // the text to add after the caret
  }}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
