# @nucleux/md3-theme

Material Design 3 theme for Nucleux — remaps the semantic `--nx-*` tokens to the MD3 tonal palette so any Nucleux component renders in a Material UI 3 look — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React.

## Install

```bash
pnpm add @nucleux/md3-theme @nucleux/tokens
```

## Usage

Import the base tokens once, then the MD3 theme:

```ts
import "@nucleux/tokens/styles.css";
import "@nucleux/md3-theme/theme.css";
```

Wrap any subtree in `nx-theme-mui` to switch it (and everything inside) from the
default shadcn/slate look to Material UI 3 — the same components, restyled:

```tsx
<div className="nx-theme-mui">
  <AgentComposer /* … */ />   {/* now Material 3 */}
</div>
```

Combine with `.dark` for dark mode (`<html class="dark">` or on the wrapper).

## License

MIT © Nucleux
