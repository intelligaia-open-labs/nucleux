# @nucleux/select

Select — a custom listbox select with a trigger, groups and keyboard navigation — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Select`** — root; `value`/`defaultValue`/`onValueChange`, `open`/`onOpenChange`, `disabled`, `required`, `name` (submits with forms)
- **`SelectTrigger`** (`size`: default/sm), **`SelectValue`** (`placeholder`)
- **`SelectContent`** — the listbox (`position`, `align`); flips above the trigger when there is no room below
- **`SelectItem`** (`value`, `disabled`, `textValue`), **`SelectGroup`**, **`SelectLabel`**, **`SelectSeparator`**
- **`SelectScrollUpButton`**, **`SelectScrollDownButton`** — kept for shadcn API parity

For a plain native `<select>`, use `@nucleux/native-select`.

## Install

```bash
pnpm add @nucleux/select @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@nucleux/select";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger aria-label="Status"><SelectValue placeholder="Status" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="open">Open</SelectItem>
    <SelectItem value="done">Done</SelectItem>
  </SelectContent>
</Select>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
