import * as React from "react";
import { createPortal } from "react-dom";
import { cn, Slot } from "@nucleux/utils";

export type DrawerDirection = "bottom" | "top" | "left" | "right";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  direction: DrawerDirection;
  dismissible: boolean;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (has: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext(part: string): DrawerContextValue {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Drawer>.`);
  return ctx;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true" && !el.closest("[hidden]"),
  );
}

// Body scroll lock shared by every open drawer, so nested drawers restore correctly.
let scrollLockCount = 0;
let savedBodyStyle: { overflow: string; paddingRight: string } | null = null;

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (scrollLockCount === 0) {
    const body = document.body;
    savedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  scrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0 && savedBodyStyle) {
    document.body.style.overflow = savedBodyStyle.overflow;
    document.body.style.paddingRight = savedBodyStyle.paddingRight;
    savedBodyStyle = null;
  }
}

export interface DrawerProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the drawer asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Screen edge the drawer is attached to. Defaults to "bottom". */
  direction?: DrawerDirection;
  /** When false, Escape, overlay clicks and dragging do not close the drawer. Defaults to true. */
  dismissible?: boolean;
  /** Trigger, content and close parts. */
  children?: React.ReactNode;
}

/**
 * A panel that slides in from an edge of the screen, typically the bottom on
 * mobile. `Drawer` holds the open state (controlled with `open` /
 * `onOpenChange`, or uncontrolled with `defaultOpen`) and the `direction`, and
 * shares them with DrawerTrigger, DrawerContent and DrawerClose. Escape, an
 * overlay click or dragging the panel towards its edge closes it.
 */
export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  direction = "bottom",
  dismissible = true,
  children,
}: DrawerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolled;
  const baseId = React.useId();
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [hasDescription, setHasDescription] = React.useState(false);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = React.useMemo<DrawerContextValue>(
    () => ({
      open,
      setOpen,
      direction,
      dismissible,
      contentId: `${baseId}-content`,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      hasDescription,
      setHasDescription,
      triggerRef,
    }),
    [open, setOpen, direction, dismissible, baseId, hasDescription],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}
Drawer.displayName = "Drawer";

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element (e.g. a Nucleux `Button`) as the trigger. */
  asChild?: boolean;
}

/**
 * The control that opens the drawer. Renders a `<button>` with
 * `aria-haspopup="dialog"` and `aria-expanded`, or its child with `asChild`.
 * Focus returns here when the drawer closes.
 */
export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ asChild = false, onClick, type = "button", ...props }, ref) => {
    const ctx = useDrawerContext("DrawerTrigger");
    const shared = {
      "data-slot": "drawer-trigger",
      "data-state": ctx.open ? "open" : "closed",
      "aria-haspopup": "dialog" as const,
      "aria-expanded": ctx.open,
      "aria-controls": ctx.open ? ctx.contentId : undefined,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.setOpen(!ctx.open);
      },
      ...props,
    };
    if (asChild) {
      return (
        <Slot
          ref={mergeRefs<HTMLElement>(ref as React.Ref<HTMLElement>, ctx.triggerRef)}
          {...(shared as React.HTMLAttributes<HTMLElement>)}
        />
      );
    }
    return (
      <button
        ref={mergeRefs<HTMLButtonElement>(ref, ctx.triggerRef as React.Ref<HTMLButtonElement>)}
        type={type}
        {...shared}
      />
    );
  },
);
DrawerTrigger.displayName = "DrawerTrigger";

export interface DrawerPortalProps {
  /** Content to render outside the current DOM tree. */
  children?: React.ReactNode;
  /** Element to portal into. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

/**
 * Renders its children into `document.body` (or `container`) with React's
 * `createPortal`, so the drawer escapes overflow and stacking contexts.
 * DrawerContent uses it automatically.
 */
export function DrawerPortal({ children, container }: DrawerPortalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, container ?? document.body);
}
DrawerPortal.displayName = "DrawerPortal";

export interface DrawerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the overlay. */
  className?: string;
}

/** The dimmed backdrop behind the panel. Clicking it closes a dismissible drawer. */
export const DrawerOverlay = React.forwardRef<HTMLDivElement, DrawerOverlayProps>(
  ({ className, onClick, ...props }, ref) => {
    const ctx = useDrawerContext("DrawerOverlay");
    if (!ctx.open) return null;
    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-slot="drawer-overlay"
        data-state="open"
        className={cn("fixed inset-0 z-50 bg-foreground/50 animate-nx-fade-in", className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && ctx.dismissible) ctx.setOpen(false);
        }}
        {...props}
      />
    );
  },
);
DrawerOverlay.displayName = "DrawerOverlay";

const directionClasses: Record<DrawerDirection, string> = {
  top: "inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b",
  bottom: "inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t",
  right: "inset-y-0 right-0 w-3/4 border-l sm:max-w-sm",
  left: "inset-y-0 left-0 w-3/4 border-r sm:max-w-sm",
};

const NO_DRAG = "input, textarea, select, button, a[href], [contenteditable], [data-vaul-no-drag]";
const DRAG_THRESHOLD = 30; // percent of the panel's size
const FLICK_VELOCITY = 0.5; // px per ms

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the panel. */
  className?: string;
}

/**
 * The drawer panel. When open it portals an overlay and a
 * `role="dialog" aria-modal="true"` panel into `document.body`, labelled by
 * DrawerTitle and described by DrawerDescription. It moves focus into the
 * panel, keeps Tab inside it, locks body scroll, closes on Escape and returns
 * focus to the trigger on close. The panel can be dragged towards its edge to
 * dismiss (past 30% of its size or with a quick flick); bottom drawers show a
 * grab handle.
 */
export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, ...props }, ref) => {
    const ctx = useDrawerContext("DrawerContent");
    if (!ctx.open) return null;
    return (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPanel ref={ref} ctx={ctx} {...props}>
          {children}
        </DrawerPanel>
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

interface DrawerPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  ctx: DrawerContextValue;
}

const DrawerPanel = React.forwardRef<HTMLDivElement, DrawerPanelProps>(
  (
    { ctx, className, children, onKeyDown, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props },
    ref,
  ) => {
    const panelRef = React.useRef<HTMLDivElement>(null);
    const { direction, dismissible, setOpen, triggerRef } = ctx;
    const drag = React.useRef<{
      id: number;
      start: number;
      time: number;
      delta: number;
      active: boolean;
    } | null>(null);

    // Focus in on open; restore focus to the trigger (or whatever had focus) on close.
    React.useEffect(() => {
      const previous = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
      return () => {
        const target =
          triggerRef.current && triggerRef.current.isConnected
            ? triggerRef.current
            : previous && previous.isConnected
              ? previous
              : null;
        target?.focus();
      };
    }, [triggerRef]);

    // Scroll lock while open.
    React.useEffect(() => {
      lockBodyScroll();
      return unlockBodyScroll;
    }, []);

    // Escape closes, as in Sheet and Dialog.
    React.useEffect(() => {
      if (!dismissible) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          setOpen(false);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [dismissible, setOpen]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = getFocusable(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const vertical = direction === "bottom" || direction === "top";
    const sign = direction === "bottom" || direction === "right" ? 1 : -1;

    const applyOffset = (offset: number, animate: boolean) => {
      const panel = panelRef.current;
      if (!panel) return;
      panel.style.transition = animate ? "transform 0.2s ease-out" : "none";
      panel.style.transform =
        offset === 0 ? "" : vertical ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || !dismissible || event.button !== 0) return;
      if ((event.target as HTMLElement).closest(NO_DRAG)) return;
      drag.current = {
        id: event.pointerId,
        start: vertical ? event.clientY : event.clientX,
        time: event.timeStamp,
        delta: 0,
        active: false,
      };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const d = drag.current;
      if (!d || d.id !== event.pointerId) return;
      const raw = ((vertical ? event.clientY : event.clientX) - d.start) * sign;
      if (!d.active) {
        if (Math.abs(raw) < 5) return;
        d.active = true;
        d.time = event.timeStamp;
        d.start = vertical ? event.clientY : event.clientX;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* jsdom / unsupported */
        }
        return;
      }
      // Only follow the pointer towards the edge; resist a little the other way.
      d.delta = raw > 0 ? raw : raw * 0.1;
      applyOffset(d.delta * sign, false);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.active || d.id !== event.pointerId) return;
      const panel = panelRef.current;
      const size = panel ? (vertical ? panel.offsetHeight : panel.offsetWidth) : 0;
      const elapsed = Math.max(1, event.timeStamp - d.time);
      const velocity = d.delta / elapsed;
      const pastThreshold = size > 0 && d.delta >= (size * DRAG_THRESHOLD) / 100;
      if (!cancelled && d.delta > 0 && (pastThreshold || velocity > FLICK_VELOCITY)) {
        setOpen(false);
      } else {
        applyOffset(0, true);
      }
    };

    return (
      <div
        ref={mergeRefs(ref, panelRef)}
        id={ctx.contentId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
        tabIndex={-1}
        data-slot="drawer-content"
        data-state="open"
        data-vaul-drawer-direction={direction}
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col border-border bg-background text-foreground shadow-lg outline-none animate-nx-fade-in",
          directionClasses[direction],
          className,
        )}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag(event, false);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          endDrag(event, true);
        }}
        {...props}
      >
        <div
          aria-hidden="true"
          data-slot="drawer-handle"
          className="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 touch-none rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        {children}
      </div>
    );
  },
);
DrawerPanel.displayName = "DrawerPanel";

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the header. */
  className?: string;
}

/** Header slot for DrawerTitle and DrawerDescription; centred on top and bottom drawers. */
export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="drawer-header"
    className={cn(
      "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
      className,
    )}
    {...props}
  />
));
DrawerHeader.displayName = "DrawerHeader";

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the footer. */
  className?: string;
}

/** Footer slot pinned to the bottom of the panel, for actions. */
export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
));
DrawerFooter.displayName = "DrawerFooter";

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Additional classes merged onto the title. */
  className?: string;
}

/** The drawer's heading; wired to the panel's `aria-labelledby`. */
export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(({ className, ...props }, ref) => {
  const ctx = React.useContext(DrawerContext);
  return (
    <h2
      ref={ref}
      id={ctx?.titleId}
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

export interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional classes merged onto the description. */
  className?: string;
}

/** Supporting copy under the title; wired to the panel's `aria-describedby`. */
export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(DrawerContext);
    const setHasDescription = ctx?.setHasDescription;
    React.useEffect(() => {
      if (!setHasDescription) return;
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return (
      <p
        ref={ref}
        id={ctx?.descriptionId}
        data-slot="drawer-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  },
);
DrawerDescription.displayName = "DrawerDescription";

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child element (e.g. a Nucleux `Button`) as the close control. */
  asChild?: boolean;
}

/** A control that closes the drawer. Renders a `<button>`, or its child with `asChild`. */
export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ asChild = false, onClick, type = "button", ...props }, ref) => {
    const ctx = useDrawerContext("DrawerClose");
    const shared = {
      "data-slot": "drawer-close",
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.setOpen(false);
      },
      ...props,
    };
    if (asChild) {
      return <Slot ref={ref as React.Ref<HTMLElement>} {...(shared as React.HTMLAttributes<HTMLElement>)} />;
    }
    return <button ref={ref} type={type} {...shared} />;
  },
);
DrawerClose.displayName = "DrawerClose";
