import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { cn } from "@nucleux/utils";

type Orientation = "horizontal" | "vertical";

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: EmblaCarouselType | undefined;
  orientation: Orientation;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const useCarousel = (component: string) => {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error(`${component} must be used within a Carousel`);
  return ctx;
};

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  opts?: EmblaOptionsType;
  /** Receive the Embla API instance once ready. */
  setApi?: (api: EmblaCarouselType | undefined) => void;
}

/** A swipeable/keyboard-navigable carousel built on Embla. */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ orientation = "horizontal", opts, setApi, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel({
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    });
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((embla: EmblaCarouselType) => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    React.useEffect(() => {
      if (!api) return;
      setApi?.(api);
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api.off("reInit", onSelect);
        api.off("select", onSelect);
      };
    }, [api, setApi, onSelect]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    };

    return (
      <CarouselContext.Provider
        value={{ carouselRef, api, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
      >
        <div
          ref={ref}
          role="region"
          aria-roledescription="carousel"
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export type CarouselContentProps = React.HTMLAttributes<HTMLDivElement>;

/** The scrolling viewport holding {@link CarouselItem}s. */
export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel("CarouselContent");
    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

/** A single slide. */
export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel("CarouselItem");
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const navBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Scrolls to the previous slide. */
export const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { scrollPrev, canScrollPrev, orientation } = useCarousel("CarouselPrevious");
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Previous slide"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          navBase,
          "absolute",
          orientation === "horizontal"
            ? "-left-4 top-1/2 -translate-y-1/2"
            : "-top-4 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

/** Scrolls to the next slide. */
export const CarouselNext = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { scrollNext, canScrollNext, orientation } = useCarousel("CarouselNext");
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Next slide"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          navBase,
          "absolute",
          orientation === "horizontal"
            ? "-right-4 top-1/2 -translate-y-1/2"
            : "-bottom-4 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";
