# @nucleux/handwriting

Handwriting Input — hand-drawn input recognised as text or instructions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/handwriting @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { HandwritingInput } from "@nucleux/handwriting";

<HandwritingInput
  variant="draw-pad"                    // "draw-pad" | "live-ocr" | "annotation-stroke"
  convert="review"                      // or "auto" (recognise after a pause)
  onRecognize={async ({ strokes, toImage }) => {
    // Your recogniser — Nucleux never recognises on its own.
    const res = await myRecognizer(await toImage());
    return {
      text: res.text,
      alternatives: res.candidates,     // whole-text readings
      words: res.words,                 // [{ text, uncertain, alternatives }]
    };
  }}
  onAccept={(text, { source, strokes }) => composer.append(text, { from: source, ink: strokes })}
/>
```

- A pointer-driven `<canvas>` pad (pen pressure scales the ink), with **Undo stroke** and **Clear**.
- The reading appears **under** the ink. Words marked `uncertain` are buttons with “?” that open their
  alternatives; **Add to message** stays disabled until they are settled. The reading is editable.
- On failure the ink is kept and **Retry** / **Rewrite** are offered.
- **Type instead** switches to a text field — the keyboard path is always there.
- `annotation-stroke` draws over `children` (a diagram, a screenshot) and reads the mark as an instruction.
- Nothing is sent when writing finishes; `onAccept` hands the confirmed text to your composer.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
