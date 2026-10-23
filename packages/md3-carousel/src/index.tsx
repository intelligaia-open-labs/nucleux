import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { cn } from "@nucleux/utils";

export type Md3CarouselLayout = "multi-browse" | "uncontained" | "hero" | "full-screen";
export type Md3CarouselAlignment = "start" | "center";

interface ItemContextValue {
  index: number;
  count: number;
  layout: Md3CarouselLayout;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

/** Gap between items (M3: 8dp). */
const GAP = 8;

export interface Md3CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the carousel region (required). */
  "aria-label": string;
  /**
   * M3 carousel layout. `multi-browse` shows large, medium and small items;
   * `uncontained` keeps every item at full size and lets the last one run off
   * the edge; `hero` shows one large item plus small peek items; `full-screen`
   * shows one item that fills the carousel. Defaults to "multi-browse".
   */
  layout?: Md3CarouselLayout;
  /** Hero only: put the large item at the start (with a small item after it) or centred between two small items. Defaults to "start". */
  alignment?: Md3CarouselAlignment;
  /** Full-size width of a large item in px, for `multi-browse` and `uncontained`. Defaults to 200. */
  itemWidth?: number;
  /** Width of a fully masked (small) item in px; M3 allows 40–56. Defaults to 56. */
  smallItemWidth?: number;
  /** Extra Embla options (loop, dragFree…); `axis` and `align` are set by the layout. */
  opts?: Omit<EmblaOptionsType, "axis">;
  /** Receive the Embla API instance once ready. */
  setApi?: (api: EmblaCarouselType | undefined) => void;
  /** Called with the index of the item at the focal position after each snap. */
  onIndexChange?: (index: number) => void;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A Material Design 3 carousel built on Embla. Items are full-bleed tiles with
 * 28px corners and 8px gaps; as they scroll toward the edges they are masked
 * (clipped symmetrically from both sides, so imagery stays centred) down to a
 * small sliver, and the following items close up behind them, reproducing the
 * M3 keyline motion. Four layouts: multi-browse, uncontained, hero (start or
 * centre aligned) and full-screen. The root is a labelled, focusable
 * `region` with `aria-roledescription="carousel"`; Left/Right arrows move one
 * item, Home/End jump to the ends, and each Md3CarouselItem is a labelled
 * `group` slide ("2 of 6" by default).
 */
export const Md3Carousel = React.forwardRef<HTMLDivElement, Md3CarouselProps>(
  (
    {
      layout = "multi-browse",
      alignment = "start",
      itemWidth = 200,
      smallItemWidth = 56,
      opts,
      setApi,
      onIndexChange,
      className,
      style,
      children,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const centered = layout === "hero" && alignment === "center";
    const [viewportRef, api] = useEmblaCarousel({
      align: centered ? "center" : "start",
      containScroll: centered ? false : "trimSnaps",
      skipSnaps: layout === "uncontained",
      ...opts,
      axis: "x",
    });

    const masked = layout === "multi-browse" || layout === "hero";

    // Keyline masking: each slide's slot keeps its layout width (so Embla's
    // snapping is untouched) while the visible tile inside shrinks and shifts.
    const applyMasks = React.useCallback(
      (embla: EmblaCarouselType) => {
        const slides = embla.slideNodes();
        const root = embla.rootNode().getBoundingClientRect();
        const V = root.width;
        let shift = 0;
        slides.forEach((slide, i) => {
          const tile = slide.querySelector<HTMLElement>("[data-md3-carousel-tile]");
          if (!tile) return;
          if (!masked || V === 0) {
            tile.style.clipPath = "";
            tile.style.transform = "";
            tile.style.setProperty("--md3-carousel-reveal", "1");
            return;
          }
          const rect = slide.getBoundingClientRect();
          const W = rect.width;
          const x = rect.left - root.left;
          const small = Math.min(smallItemWidth, W);
          const last = i === slides.length - 1;
          let visible = W;
          let dx = 0;
          if (x < 0) {
            // Leaving at the start edge: shrink, pinned to the slot's end edge.
            visible = Math.min(W, Math.max(small, x + W));
            dx = (W - visible) / 2;
          } else {
            // Toward the end edge: fill what is left, leaving room for one small item.
            const left = x - shift;
            const remaining = V - left;
            const target = last ? remaining : remaining - small - GAP;
            visible = Math.min(W, Math.max(small, target));
            dx = -shift - (W - visible) / 2;
            shift += W - visible;
          }
          const inset = (W - visible) / 2;
          tile.style.clipPath = inset > 0.5 ? `inset(0 ${inset}px 0 ${inset}px round 28px)` : "";
          tile.style.transform = Math.abs(dx) > 0.5 ? `translateX(${dx}px)` : "";
          const reveal = W > small ? (visible - small) / (W - small) : 1;
          tile.style.setProperty("--md3-carousel-reveal", reveal.toFixed(3));
        });
      },
      [masked, smallItemWidth],
    );

    React.useEffect(() => {
      if (!api) return;
      setApi?.(api);
      const onSelect = (embla: EmblaCarouselType) => onIndexChange?.(embla.selectedScrollSnap());
      const update = (embla: EmblaCarouselType) => applyMasks(embla);
      applyMasks(api);
      api.on("scroll", update);
      api.on("reInit", update);
      api.on("resize", update);
      api.on("select", onSelect);
      return () => {
        api.off("scroll", update);
        api.off("reInit", update);
        api.off("resize", update);
        api.off("select", onSelect);
      };
    }, [api, setApi, onIndexChange, applyMasks]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !api) return;
      const jump = prefersReducedMotion();
      const ltr = getComputedStyle(event.currentTarget).direction !== "rtl";
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (ltr) api.scrollPrev(jump);
          else api.scrollNext(jump);
          break;
        case "ArrowRight":
          event.preventDefault();
          if (ltr) api.scrollNext(jump);
          else api.scrollPrev(jump);
          break;
        case "Home":
          event.preventDefault();
          api.scrollTo(0, jump);
          break;
        case "End":
          event.preventDefault();
          api.scrollTo(api.scrollSnapList().length - 1, jump);
          break;
      }
    };

    const items = React.Children.toArray(children).filter(React.isValidElement);
    const basis: React.CSSProperties["flexBasis"] =
      layout === "full-screen"
        ? "100%"
        : layout === "hero"
          ? centered
            ? `calc(100% - ${2 * (smallItemWidth + GAP)}px)`
            : `calc(100% - ${smallItemWidth + GAP}px)`
          : `${itemWidth}px`;

    return (
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        data-layout={layout}
        onKeyDown={handleKeyDown}
        className={cn(
          "font-md",
          "relative h-[200px] w-full rounded-md-xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
          (layout === "multi-browse" || layout === "hero") && "px-4",
          className,
        )}
        style={style}
        {...props}
      >
        <div ref={viewportRef} className="h-full overflow-hidden">
          <div className="flex h-full touch-pan-y" style={{ gap: layout === "full-screen" ? 0 : GAP }}>
            {items.map((child, index) => (
              <div
                key={child.key ?? index}
                className="relative h-full min-w-0 shrink-0 grow-0"
                style={{ flexBasis: basis }}
              >
                <ItemContext.Provider value={{ index, count: items.length, layout }}>{child}</ItemContext.Provider>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
Md3Carousel.displayName = "Md3Carousel";

export interface Md3CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short text shown over the bottom of the item; it fades out as the item is masked. */
  label?: React.ReactNode;
}

/**
 * One carousel item: a full-bleed tile (put an `<img className="h-full w-full
 * object-cover">` or any background inside) on surface-container-high with
 * 28px corners. It is a `role="group"` slide labelled "n of total" unless you
 * pass `aria-label`. Inside a masked layout it exposes the CSS variable
 * `--md3-carousel-reveal` (0 when fully masked, 1 when fully open) for fading
 * your own overlay content.
 */
export const Md3CarouselItem = React.forwardRef<HTMLDivElement, Md3CarouselItemProps>(
  ({ label, className, children, ...props }, ref) => {
    const ctx = React.useContext(ItemContext);
    if (!ctx) throw new Error("Md3CarouselItem must be used within a Md3Carousel");
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        aria-label={props["aria-labelledby"] ? undefined : `${ctx.index + 1} of ${ctx.count}`}
        data-md3-carousel-tile=""
        className={cn(
          "font-md",
          "relative h-full w-full overflow-hidden bg-md-surface-container-high text-md-on-surface will-change-transform",
          ctx.layout === "full-screen" ? "rounded-none" : "rounded-md-xl",
          "[&>img]:h-full [&>img]:w-full [&>img]:object-cover",
          className,
        )}
        {...props}
      >
        {children}
        {label != null && (
          <div
            className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-md-inverse-surface/60 to-transparent px-4 pb-4 pt-8 text-base font-medium text-md-inverse-on-surface transition-opacity motion-reduce:transition-none"
            style={{ opacity: "var(--md3-carousel-reveal, 1)" }}
          >
            {label}
          </div>
        )}
      </div>
    );
  },
);
Md3CarouselItem.displayName = "Md3CarouselItem";
