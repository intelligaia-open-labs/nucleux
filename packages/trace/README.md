# @nucleux/trace

Compact, collapsible list of agent steps — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Trace`** — root list of steps
- **`TraceLine`** — one step (`status`: `running` | `error` | `pending`); wrap in a link or button to make it interactive
- **`TraceIcon`**, **`TraceTitle`**, **`TraceDescription`** — parts of a line
- **`TraceCollapsible`**, **`TraceCollapsibleTrigger`**, **`TraceCollapsibleContent`** — an expandable step (Nucleux `Collapsible`)

## Install

```bash
pnpm add @nucleux/trace @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Trace, TraceLine, TraceIcon, TraceTitle, TraceDescription, TraceCollapsible, TraceCollapsibleTrigger, TraceCollapsibleContent } from "@nucleux/trace";

<Trace>
  <TraceCollapsible>
    <TraceCollapsibleTrigger>
      <TraceLine>
        <TraceIcon><Search /></TraceIcon>
        <TraceTitle>Searched the web</TraceTitle>
        <TraceDescription>8 results</TraceDescription>
      </TraceLine>
    </TraceCollapsibleTrigger>
    <TraceCollapsibleContent>Queried “EU AI Act timeline”.</TraceCollapsibleContent>
  </TraceCollapsible>
  <TraceLine status="running"><TraceTitle>Drafting the summary</TraceTitle></TraceLine>
</Trace>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
