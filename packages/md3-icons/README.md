# @nucleux/md3-icons

Material Symbols (Outlined, weight 400) as React icons — the exact glyphs nucleux.in's Material 3
previews draw, inlined as path data (no icon font, no flash of ligature text).

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/md3-icons
```

## Usage

```tsx
import { MsAdd, MsArrowUpward, MsIcon } from "@nucleux/md3-icons";

<MsAdd className="size-6 text-md-on-surface-variant" />
<MsIcon name="tune" className="size-5" />
<MsArrowUpward title="Send" /> {/* labelled: role="img" */}
```

Icons are filled shapes on Material's 960 grid (`viewBox="0 -960 960 960"`, `fill="currentColor"`):
colour with `text-*`, size with `size-*` (default `size-6`). Decorative (`aria-hidden`) unless
`title` is passed. Names follow the Material Symbol name (`Ms` + PascalCase; `…Filled` for the
filled style); `msIconNames` lists them all.

## License

React code MIT © Nucleux. Icon path data: Material Symbols © Google LLC, Apache License 2.0 — see `NOTICE`.
