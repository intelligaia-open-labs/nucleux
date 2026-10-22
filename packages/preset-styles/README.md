# @nucleux/preset-styles

Preset Styles — one-click named styles for how the agent's output looks or reads, as a chip or a Style row in Request settings — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A style communicates in one tap what would take a paragraph to describe. Pick
it before generating (a swatch grid or a list of brand presets), or set how
replies are written from the composer's Style control — with a sample reply
that follows the pointer, a chip that names the active style, × back to the
base style with Undo, and custom styles made from the person's own writing.
The request text is never edited: the style travels with the send.

## Exports

- **`PresetStyles`** — the picker (`variant`: `"grid"` | `"list"` | `"menu"`)
- **`usePresetStyles`** — its state and behaviour (shared with the Material 3 twin), plus `presetStylesCopy`, `presetStylesNoticeText` and `presetStylesMoveFocus`
- Types: `PresetStylesProps`, `PresetStyle`, `PresetStylesVariant`, `PresetStylesView`, `PresetStylesNotice`, `PresetStyleSwatch`, `PresetStyleReference`, `PresetStyleRequest`, `PresetStyleDraft`, `PresetStyleSource`

## Variants

| `variant` | Use |
| --- | --- |
| `grid` (default) | Swatch tiles picked before generating; `allowReference` adds "Match a style" (drop or pick an image), `lockable` the per-project lock. |
| `list` | A short list of named, brand-agreed presets. |
| `menu` | A Style control in the composer (`OpenInput`) that opens "Use style": styles with one line each, a live preview, Create & edit styles. |

## Behaviour

- `styles`, `value` / `defaultValue` / `onValueChange`. Arrow keys, Home and End move between styles.
- Grid / list: `lockable`, `locked` / `defaultLocked` / `onLockedChange`, `lockScope`; `allowReference`, `reference` / `defaultReference` / `onReferenceChange(file | null)`.
- Menu: choosing applies at once and closes; Escape or an outside click closes and returns focus to the control. `previewPrompt` + each style's `sample` drive the preview (`showPreview`). One status line says where the style applies (`scope`, `earlierReplies`); × returns to `baseStyle` with Undo.
- Custom styles: pass `onGenerateStyle(request) => Promise<draft>` (the app's model call) to enable Create & edit styles — paste or upload an example, or describe the style; the component shows progress and a retryable error, then a review card where name, description and instructions are editable, with a preview, Save and Save and use (`onSaveStyle(style, use)`).
- `withComposer={false}` renders only the Style control for your own composer; otherwise `message` / `defaultMessage` / `onMessageChange` and `onSubmit(text, styleId)`.

## Usage

```tsx
import { PresetStyles } from "@nucleux/preset-styles";

<PresetStyles
  variant="menu"
  styles={[
    { id: "normal", name: "Normal", description: "Aria’s default replies.", sample: normalReply },
    { id: "concise", name: "Concise", description: "Shorter, more direct replies.", sample: conciseReply },
  ]}
  previewPrompt="Summarize the October release."
  onGenerateStyle={(req) => api.generateStyle(req)}
  onSubmit={(text, style) => send(text, { style })}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
