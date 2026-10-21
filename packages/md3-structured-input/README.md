# @nucleux/md3-structured-input

Material 3 Structured Input — a compact form for exact values, suggestions marked and every value yours — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/structured-input`](https://www.npmjs.com/package/@nucleux/structured-input) (`StructuredInput`). It shares the twin's API exactly — the props types are the twin's own — so you can switch families by changing only the import. Only the look differs: MD3 colour roles, shape, elevation, state layers and motion (stilled under reduced motion).

## Exports

- **`Md3StructuredInput`** — a clarifying question as MD3 radio / checkbox rows, free-text escape and skip
- **`Md3StructuredInputSlots`** — 2–4 labelled MD3 outlined fields; “Suggested” marks become “Edited by you”
- **`Md3StructuredInputTags`** — `@` / `p:` / `/` tags become tonal input chips, suggestions as MD3 suggestion chips
- **`Md3StructuredInputWizard`** — multi-step MD3 card with a segmented progress track
- **`structuredPartsToText`** — re-exported from `@nucleux/structured-input`
- Types: `Md3StructuredInputProps`, `Md3StructuredInputSlotsProps`, `Md3StructuredInputTagsProps`, `Md3StructuredInputWizardProps`, `StructuredOption`, `StructuredInputSlot`, `StructuredInputValues`, `StructuredInputTagTrigger`, `StructuredInputPart`

## Install

```bash
pnpm add @nucleux/md3-structured-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3StructuredInput } from "@nucleux/md3-structured-input";

<Md3StructuredInput
  question="Which audience is this for?"
  options={[{ value: "execs", label: "Executives" }, { value: "eng", label: "Engineers" }]}
  onSubmit={(values) => answer(values)}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
