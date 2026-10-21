# @nucleux/md3-carousel

Material 3 carousel — multi-browse, uncontained, hero and full-screen layouts with masked items — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3Carousel`** — labelled `region` (required `aria-label`; `layout="multi-browse" | "uncontained" | "hero" | "full-screen"`, `alignment` for hero, `itemWidth`, `smallItemWidth`, `setApi`, `onIndexChange`); arrow keys, Home and End move between items
- **`Md3CarouselItem`** — a slide (`role="group"`, labelled "n of total"); optional `label` that fades as the item is masked

## Install

```bash
pnpm add @nucleux/md3-carousel @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Carousel, Md3CarouselItem } from "@nucleux/md3-carousel";

<Md3Carousel aria-label="Destinations" layout="multi-browse" itemWidth={220}>
  {photos.map((p) => (
    <Md3CarouselItem key={p.id} label={p.title}>
      <img src={p.src} alt={p.alt} />
    </Md3CarouselItem>
  ))}
</Md3Carousel>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
