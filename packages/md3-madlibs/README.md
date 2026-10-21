# @nucleux/md3-madlibs

Material 3 Madlibs — a request written as a sentence with a few labelled blanks, filled and reviewed before it goes to the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/madlibs`](https://www.npmjs.com/package/@nucleux/madlibs) (`Madlibs`) — the props types are re-exported from it and the state logic is shared — so you switch families by changing only the import. Only the look differs: tonal inline fields that settle into the sentence as they fill, an italic primary-tinted suggested value, an error outline with words, Material 3 colour roles, shape and state layers (motion reduced under `prefers-reduced-motion`).

## Exports

- **`Md3Madlibs`** — the scaffold card (variants `inline-dropdowns`, `form-rows`, `chip-builder`; `blankStyle` `filled` / `underline`; `density`)
- Types: `Md3MadlibsProps`, `Md3MadlibsBlank`, `Md3MadlibsValues`, `Md3MadlibsSuggestion`, `Md3MadlibsVariant`, `Md3MadlibsBlankStyle`, `Md3MadlibsDensity`, `Md3MadlibsStatus`

## Install

```bash
pnpm add @nucleux/md3-madlibs @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Madlibs } from "@nucleux/md3-madlibs";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";

<Md3Madlibs
  template="Summarize {document} for {audience}[, focusing on {topic}]."
  blanks={blanks}
  description="Fill in the blanks — you can edit the whole sentence before sending."
  onUse={(prompt) => { previous.current = draft; setDraft(prompt); }}
  onUndo={() => setDraft(previous.current)}
/>
<Md3AgentComposer placeholder="Or write your own request…" value={draft} onValueChange={setDraft} onSubmit={send} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
