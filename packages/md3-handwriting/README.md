# @nucleux/md3-handwriting

Material 3 Handwriting Input — write the request by hand, settle uncertain words, add it yourself — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/handwriting`](https://www.npmjs.com/package/@nucleux/handwriting) (`HandwritingInput`). It shares the twin's API exactly — the props types are the twin's own — so you can switch families by changing only the import. Only the look differs: MD3 colour roles, shape, elevation, state layers and motion (stilled under reduced motion).

## Exports

- **`Md3HandwritingInput`** — draw-pad / live-ocr / annotation-stroke; the reading sits under the ink, uncertain words are “?” buttons with an MD3 menu of alternatives, and Add to message waits until they are settled
- Types: `Md3HandwritingInputProps`, `Md3HandwritingInputVariant`, `Md3HandwritingInputConvert`, `Md3HandwritingInputMode`, `Md3HandwritingInputStatus`, `HandwritingPoint`, `HandwritingStroke`, `HandwritingWord`, `HandwritingRecognition`, `HandwritingRecognizeRequest`, `HandwritingAcceptDetail`

## Install

```bash
pnpm add @nucleux/md3-handwriting @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3HandwritingInput } from "@nucleux/md3-handwriting";

<Md3HandwritingInput onRecognize={myRecognizer} onAccept={(text) => append(text)} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
