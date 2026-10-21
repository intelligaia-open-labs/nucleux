import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@nucleux/utils";

type Direction = "horizontal" | "vertical";
const DirectionContext = React.createContext<Direction>("horizontal");

export interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
}

/** A container of {@link ResizablePanel}s separated by draggable {@link ResizableHandle}s. */
export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ direction = "horizontal", className, children, ...props }, ref) => (
    <DirectionContext.Provider value={direction}>
      <div
        ref={ref}
        data-direction={direction}
        className={cn("flex h-full w-full", direction === "vertical" && "flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </DirectionContext.Provider>
  ),
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial size as a flex-grow weight (defaults to 1). */
  defaultSize?: number;
}

/** A single resizable region within a {@link ResizablePanelGroup}. */
export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ defaultSize = 1, className, style, ...props }, ref) => (
    <div
      ref={ref}
      data-resizable-panel=""
      className={cn("overflow-auto", className)}
      style={{ flex: `${defaultSize} 1 0%`, ...style }}
      {...props}
    />
  ),
);
ResizablePanel.displayName = "ResizablePanel";

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the grip dots affordance. */
  withHandle?: boolean;
  /** Accessible name for the splitter. */
  "aria-label"?: string;
}

const MIN_PX = 40;
const KEY_STEP_PX = 24;

/** The draggable divider between two {@link ResizablePanel}s. */
export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ withHandle = false, className, "aria-label": ariaLabel = "Resize panels", ...props }, ref) => {
    const direction = React.useContext(DirectionContext);
    const horizontal = direction === "horizontal";
    const selfRef = React.useRef<HTMLDivElement>(null);
    const [valueNow, setValueNow] = React.useState(50);
    const setRefs = (node: HTMLDivElement | null) => {
      (selfRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const measure = React.useCallback(() => {
      const handle = selfRef.current;
      const prev = handle?.previousElementSibling as HTMLElement | null;
      const next = handle?.nextElementSibling as HTMLElement | null;
      if (!prev || !next) return null;
      const dim = horizontal ? "width" : "height";
      return { prev, next, prevSize: prev.getBoundingClientRect()[dim], nextSize: next.getBoundingClientRect()[dim] };
    }, [horizontal]);

    React.useEffect(() => {
      const m = measure();
      if (m && m.prevSize + m.nextSize > 0) {
        setValueNow(Math.round((m.prevSize / (m.prevSize + m.nextSize)) * 100));
      }
    }, [measure]);

    const resizeBy = (deltaPx: number) => {
      const m = measure();
      if (!m) return;
      const newPrev = m.prevSize + deltaPx;
      const newNext = m.nextSize - deltaPx;
      if (newPrev < MIN_PX || newNext < MIN_PX) return;
      m.prev.style.flex = `0 0 ${newPrev}px`;
      m.next.style.flex = `0 0 ${newNext}px`;
      setValueNow(Math.round((newPrev / (newPrev + newNext)) * 100));
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      let last = horizontal ? e.clientX : e.clientY;
      const onMove = (ev: PointerEvent) => {
        const curr = horizontal ? ev.clientX : ev.clientY;
        resizeBy(curr - last);
        last = curr;
      };
      const onUp = (ev: PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture?.(ev.pointerId);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const dec = horizontal ? "ArrowLeft" : "ArrowUp";
      const inc = horizontal ? "ArrowRight" : "ArrowDown";
      if (e.key === dec) {
        e.preventDefault();
        resizeBy(-KEY_STEP_PX);
      } else if (e.key === inc) {
        e.preventDefault();
        resizeBy(KEY_STEP_PX);
      }
    };

    return (
      <div
        ref={setRefs}
        role="separator"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex shrink-0 items-center justify-center bg-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
          horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
          className,
        )}
        {...props}
      >
        {withHandle && (
          <span
            className={cn(
              "z-10 flex items-center justify-center rounded-sm border border-border bg-background",
              horizontal ? "h-6 w-3" : "h-3 w-6",
            )}
          >
            <GripVertical aria-hidden className={cn("h-3 w-3 text-muted-foreground", !horizontal && "rotate-90")} />
          </span>
        )}
      </div>
    );
  },
);
ResizableHandle.displayName = "ResizableHandle";
