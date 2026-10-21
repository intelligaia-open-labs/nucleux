# @nucleux/md3-autocomplete

Material 3 Autocomplete — ghost text that anticipates and completes user actions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/autocomplete`](https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/autocomplete): **same props, callbacks and keyboard model** — switch families by changing only the import. Only the look differs: a filled Material text area (surface-container-high, large shape, primary focus indicator), the suggestion in on-surface-variant fading in over 150 ms (no fade under reduced motion), a small outlined key cap at its end, and assist-chip key hints.

## Exports

- **`Md3Autocomplete`** — a text field that shows the likely rest of the text as ghost text after the caret.
  - `variant`: `"ghost-suffix"`, `"sentence-completion"` (with *Tab to accept / Esc to dismiss* hints), `"block-completion"` (multi-line, monospace)
  - `getSuggestion(text, { signal })` (sync or async, aborted when the text changes) or a fixed `suggestion`
  - `value` / `defaultValue` / `onValueChange`, `minChars` (8), `debounceMs` (150), `acceptKey` (`"tab"` | `"right"` | `"both"`, never Enter)
  - `onAccept(inserted)`, `onDismiss()`, `onError(error)`, `onStateChange(state)`; `label`, `fieldClassName`, `hideHints`, `invalid`
- Types (re-exported from `@nucleux/autocomplete`): `Md3AutocompleteProps`, `Md3AutocompleteVariant`, `Md3AutocompleteAcceptKey`, `Md3AutocompleteState`, `Md3AutocompleteRequest`

## Behaviour

- **Tab** (or the host's key) accepts the whole suggestion as ordinary, editable text and leaves the caret after it. **⌘/Ctrl + →** takes one word. A click on the ghost text accepts it. Accepting never submits.
- **Esc** dismisses it, and it stays away until the field is cleared.
- Keep typing the same words and it follows along without a new request; diverge and it is gone.
- The ghost text lives in an `aria-hidden` overlay, outside the field's value, and is announced once through a polite live region: "Suggestion: …. Tab to accept."

## Install

```bash
pnpm add @nucleux/md3-autocomplete @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Autocomplete } from "@nucleux/md3-autocomplete";

<Md3Autocomplete
  label="Prompt"
  getSuggestion={async (text, { signal }) => {
    const res = await fetch("/api/complete", { method: "POST", body: text, signal });
    return (await res.json()).completion;
  }}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
