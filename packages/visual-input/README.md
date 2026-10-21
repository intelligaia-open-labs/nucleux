# @nucleux/visual-input

Visual Input — attach images, screenshots, or videos as part of the ask — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/visual-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { VisualInput, type VisualInputFile } from "@nucleux/visual-input";

const [files, setFiles] = useState<VisualInputFile[]>([]);

<VisualInput
  variant="paste-chip"            // "drag-drop" | "paste-chip" | "camera-capture"
  files={files}
  onFilesChange={setFiles}
  maxSize={20 * 1024 * 1024}
  maxFiles={4}
  seeText="Aria will see this when you send"
  unsupportedText="Aria can read images (PNG, JPG, HEIC)."
>
  <OpenInput … />                 {/* the composer the visual is paired with */}
</VisualInput>
```

- **Sources:** `sources={["upload", "paste", "camera"]}` — only what the product allows. Upload covers the
  browse button and drag-and-drop; paste picks up images pasted anywhere inside the component (plain-text
  paste is untouched); camera uses `<input type="file" accept="image/*" capture>`.
- **Limits:** `accept`, `maxSize`, `maxFiles`, `multiple`. Refused files are listed in an alert that says
  why and what can be used, and reported through `onReject`.
- **Never auto-sends.** The component only manages files; your app sends them with the prompt.
- **Per-file state:** set `status: "reading" | "error"` and `error` on a file to show a working or failed chip.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
