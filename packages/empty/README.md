# @nucleux/empty

Empty state — media, title, description and actions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Empty`** — root (add `border` for a dashed outline; `role="alert"` for failures)
- **`EmptyHeader`**, **`EmptyMedia`** (`variant="icon"`), **`EmptyTitle`**, **`EmptyDescription`**
- **`EmptyContent`** — actions below the header

## Install

```bash
pnpm add @nucleux/empty @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@nucleux/empty";

<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><FolderOpen /></EmptyMedia>
    <EmptyTitle>No projects yet</EmptyTitle>
    <EmptyDescription>Create a project to start tracking tasks.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent><Button>New project</Button></EmptyContent>
</Empty>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
