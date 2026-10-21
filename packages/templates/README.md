# @nucleux/templates

Templates — fill-in-the-blank prompt scaffolds that turn vague intent into a good question — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

Structured prompts that capture good prompting: a sentence with named slots,
a list of fully written prompts, or a library grouped by domain. Nothing runs
until the person picks "Use this prompt" or a template.

## Exports

- **`Templates`** — fill-in-the-blank (`fill-blanks`): a form with inline slot fields
- **`TemplatesList`** — prefilled list (`prefilled-list`): one-tap prompts
- **`TemplatesBrowser`** — categorised browser (`categorized-browser`): vertical tabs per category
- Types: `TemplatesProps`, `PromptSegment`, `PromptSlot`, `TemplatesListProps`, `TemplatesListItem`, `TemplatesBrowserProps`, `TemplatesCategory`

## Behaviour

- `segments` mix literal strings and slots `{ slot, placeholder, label?, options?, required? }`. `options` give native type-ahead; the field stays free text.
- Required slots are counted ("1 blank left", `aria-live`) and the submit waits for them. Empty optional slots fall back to their placeholder.
- `onComplete(prompt, values)` gets the interpolated sentence. `TemplatesList`/`TemplatesBrowser` call `onSelect(prompt, item[, category])`.

## Usage

```tsx
import { Templates, TemplatesList, TemplatesBrowser } from "@nucleux/templates";

<Templates
  segments={[
    "Summarise ", { slot: "meeting", placeholder: "meeting", options: ["the standup", "the board review"], required: true },
    " in ", { slot: "length", placeholder: "3 bullets" },
    " for ", { slot: "audience", placeholder: "execs" }, ".",
  ]}
  onComplete={(prompt) => setDraft(prompt)}
/>

<TemplatesList aria-label="Templates" items={["Draft a follow-up to the at-risk accounts"]} onSelect={setDraft} />
```

## Install

```bash
pnpm add @nucleux/templates @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
