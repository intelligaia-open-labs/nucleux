# @nucleux/madlibs

Madlibs — a request written as a sentence with a few labelled blanks, filled and reviewed before it goes to the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A fill-in-the-blank prompt scaffold: "Summarize [document] for [audience], focusing on [topic]." Each blank has a
human label, suggested values and a free-text fallback; an optional clause (`[ … ]`) leaves the sentence while its
blank is empty; the assembled request shows as it fills. An agent-suggested value stays marked until kept. Use prompt
names any missing blank in words (clearing nothing), otherwise hands the sentence to `onUse` for your composer — the
scaffold never sends — and confirms with Undo.

## Exports

- **`Madlibs`** — the scaffold card
- `useMadlibs`, `useMadlibsBlank` — the shared state machine and blank keyboard/ARIA wiring (used by `@nucleux/md3-madlibs`)
- `parseMadlibsTemplate`, `getMadlibsBlanks`, `assembleMadlibsPrompt`, `madlibsBlankWidth` — template helpers
- Types: `MadlibsProps`, `MadlibsBlank`, `MadlibsValues`, `MadlibsSuggestion`, `MadlibsVariant`, `MadlibsBlankStyle`, `MadlibsDensity`, `MadlibsStatus`, `MadlibsPart`, `MadlibsTemplatePart`, `MadlibsController`, `UseMadlibsBlankOptions`

## Variants

| `variant` | Use |
| --- | --- |
| `inline-dropdowns` (default) | A flowing sentence; each blank is an inline field with a list of values |
| `form-rows` | One labelled row per blank, when each slot needs room |
| `chip-builder` | Tap chips to fill the next blank; tap a filled chip to remove it |

`blankStyle` (`filled` / `underline`) and `density` (`comfortable` / `compact`) adjust the look.

## Keyboard

Each blank is an editable combobox: type anything, or ArrowDown/ArrowUp to open and move through its values, Enter to
pick, Escape to close.

## Install

```bash
pnpm add @nucleux/madlibs @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Madlibs } from "@nucleux/madlibs";
import { OpenInput } from "@nucleux/open-input";

<Madlibs
  template="Summarize {document} for {audience}[, focusing on {topic}]."
  blanks={[
    { id: "document", label: "Document", options: ["Q3 Customer Research", "September release notes"] },
    { id: "audience", label: "Audience", options: ["Leadership", "Engineering"] },
    { id: "topic", label: "Topic", options: ["Onboarding issues", "Pricing feedback"] },
  ]}
  suggestion={{ blank: "audience", value: "Leadership", reason: "the document's owner is the leadership team." }}
  onUse={(prompt) => { previous.current = draft; setDraft(prompt); }}
  onUndo={() => setDraft(previous.current)}
/>
<OpenInput aria-label="Message" value={draft} onValueChange={setDraft} onSubmit={send} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
