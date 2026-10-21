# @nucleux/gesture

Gesture Input — swipes, pinches, circles as expressive signals — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/gesture @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { GestureInput } from "@nucleux/gesture";

<GestureInput
  variant="swipe-action"               // "circle-to-select" | "swipe-action" | "pinch-context"
  actions={[
    { gesture: "swipe-left", label: "Summarise" },   // key defaults to ArrowLeft
    { gesture: "swipe-right", label: "File away" },  // key defaults to ArrowRight
  ]}
  onGesture={({ gesture, action, bounds, source }) => run(action)}
  onDismiss={() => {}}
>
  <ThreadCard />
</GestureInput>
```

- **One gesture, one action.** A gesture that maps to no action is reported as not recognised.
- **Recognition:** pass `recognize={(req) => "circle" | … | null}` (sync or async) for your own recogniser;
  otherwise `recognizeSimpleGesture` (exported) reads direction, a closed loop and a two-finger pinch.
- **Feedback:** the live path / swipe offset / zoom follows the pointer; what was captured is outlined,
  labelled (“Circled · Enhance this”) and announced. With `confirm` (default) it waits for the action
  button or Enter, and Escape / Dismiss drops it; with `confirm={false}` it fires and offers Undo.
- **Keyboard equivalents (required):** every action has a key on the focused target (arrows, Enter for
  circle, `+` / `-` for pinch, or `key` for custom gestures) and a visible button.
- Taps pass through to the content; pointer capture starts only once a movement is clearly a gesture.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
