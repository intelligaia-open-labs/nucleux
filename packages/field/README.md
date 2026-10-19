# @nucleux/field

Form field layout — label, control, description and error — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Field`** — one field, `role="group"` (`orientation`: `vertical` | `horizontal` | `responsive`; `data-invalid`, `data-disabled`)
- **`FieldLabel`** (Nucleux `Label`), **`FieldTitle`**, **`FieldDescription`**, **`FieldContent`**
- **`FieldError`** — `role="alert"`; renders `children` or deduplicated `errors` (one message plain, several as a list)
- **`FieldSet`**, **`FieldLegend`** (`variant="legend" | "label"`), **`FieldGroup`**, **`FieldSeparator`**
- **`fieldVariants`** — class helper for custom fields

## Install

```bash
pnpm add @nucleux/field @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@nucleux/field";
import { Input } from "@nucleux/input";

<FieldGroup>
  <Field data-invalid="true">
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
    <FieldError id="email-error" errors={[{ message: "Enter a valid email address." }]} />
  </Field>
  <Field>
    <FieldLabel htmlFor="name">Full name</FieldLabel>
    <Input id="name" aria-describedby="name-help" />
    <FieldDescription id="name-help">As it appears on your invoices.</FieldDescription>
  </Field>
</FieldGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
