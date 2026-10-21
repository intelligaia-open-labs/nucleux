# @nucleux/md3-gesture

Material 3 Gesture Input — swipes, circles and pinches as named, confirmable signals — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/gesture`](https://www.npmjs.com/package/@nucleux/gesture) (`GestureInput`). It shares the twin's API exactly — the props types are the twin's own — so you can switch families by changing only the import. Only the look differs: MD3 colour roles, shape, elevation, state layers and motion (stilled under reduced motion).

## Exports

- **`Md3GestureInput`** — circle-to-select / swipe-action / pinch-context; the mark draws in primary, the capture is named and waits for Confirm (or fires with Undo), and every gesture has a key and an assist chip
- **`recognizeSimpleGesture`** — re-exported from `@nucleux/gesture`
- Types: `Md3GestureInputProps`, `Md3GestureInputVariant`, `Md3GestureInputBuiltInGesture`, `Md3GestureInputGesture`, `Md3GestureInputSource`, `Md3GestureInputRecognizer`, `GestureInputPoint`, `GestureInputBounds`, `GestureInputAction`, `GestureInputEvent`, `GestureInputRecognizeRequest`

## Install

```bash
pnpm add @nucleux/md3-gesture @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3GestureInput } from "@nucleux/md3-gesture";

<Md3GestureInput
  actions={[
    { gesture: "swipe-left", label: "Summarise" },
    { gesture: "swipe-right", label: "File away" },
  ]}
  onGesture={(e) => run(e.action)}
>
  <ThreadCard />
</Md3GestureInput>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
