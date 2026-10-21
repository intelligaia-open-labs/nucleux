# @nucleux/structured-input

StructuredInput — an agent's structured clarifying question — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/structured-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

Lightweight slots and hints that compose clearer prompts. Four composable pieces:

```tsx
import {
  StructuredInput,        // a clarifying question with single/multi choice, "something else" and skip
  StructuredInputSlots,   // named-slots: 2–4 labelled fields that fill a prompt template
  StructuredInputTags,    // tag-input: @person, p:project, /file become chips
  StructuredInputWizard,  // wizard-step: Step 2 of 3 · Audience, Back / Next / Generate
} from "@nucleux/structured-input";

<StructuredInputSlots
  slots={[
    { name: "audience", label: "Audience", options: [{ value: "execs", label: "Execs" }],
      suggested: "from the meeting invite" },
    { name: "length", label: "Length", placeholder: "3 bullets" },
    { name: "topic", label: "Topic", placeholder: "Yesterday's standup", wide: true },
  ]}
  freeform
  onSubmit={(values, freeform) => send(fill(template, values), freeform)}
/>

<StructuredInputTags
  triggers={[{ trigger: "@", label: "Person", suggestions: ["sam", "priya"] }, { trigger: "p:", label: "Project" }]}
  onSubmit={(parts, text) => send(text)}
/>

<StructuredInputWizard steps={["Intent", "Audience", "Tone"]} description="Who is the brief for?" onSubmit={generate}>
  {/* the current step's fields */}
</StructuredInputWizard>
```

Rules the components follow: plain labels; a freeform override; **no field is ever required before
sending**; agent-suggested values are marked “Suggested” (with why) and become “Edited by you” once
changed — never changed back. The single-choice question follows the radio-group keyboard pattern
(arrow keys move and select).

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
