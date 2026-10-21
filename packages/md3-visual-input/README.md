# @nucleux/md3-visual-input

Material 3 Visual Input — show the agent an image, a photo or a screenshot as context on the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/visual-input`](https://www.npmjs.com/package/@nucleux/visual-input) (`VisualInput`). It shares the twin's API exactly — the props types are the twin's own — so you can switch families by changing only the import. Only the look differs: MD3 colour roles, shape, elevation, state layers and motion (stilled under reduced motion).

## Exports

- **`Md3VisualInput`** — drag-drop / paste-chip / camera-capture; previews rise in as removable MD3 cards, errors land in an error-container alert, nothing is ever sent
- **`fileMatchesAccept`** — re-exported from `@nucleux/visual-input`
- Types: `Md3VisualInputProps`, `Md3VisualInputVariant`, `Md3VisualInputSource`, `Md3VisualInputFileStatus`, `Md3VisualInputRejectionReason`, `VisualInputFile`, `VisualInputRejection`

## Install

```bash
pnpm add @nucleux/md3-visual-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3VisualInput } from "@nucleux/md3-visual-input";

<Md3VisualInput
  variant="paste-chip"
  seeText="Aria will see this when you send"
  onFilesChange={setFiles}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
