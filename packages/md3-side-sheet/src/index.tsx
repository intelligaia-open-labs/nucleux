import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Md3IconButton } from "@nucleux/md3-icon-button";

export type Md3SideSheetVariant = "standard" | "modal";
export type Md3SideSheetSide = "left" | "right";

interface SideSheetContextValue {
  variant: Md3SideSheetVariant;
  side: Md3SideSheetSide;
  titleId: string;
  setHasTitle: (has: boolean) => void;
  close: () => void;
}

const SideSheetContext = React.createContext<SideSheetContextValue | null>(null);

function useSideSheet(part: string): SideSheetContextValue {
  const ctx = React.useContext(SideSheetContext);
  if (!ctx) throw new Error(`${part} must be used within a Md3SideSheet`);
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

// Body scroll lock shared by every open modal side sheet, so stacked sheets restore correctly.
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

export interface Md3SideSheetProps extends React.HTMLAttributes<HTMLElement> {
  /** `standard` sits in the page layout beside the content; `modal` floats over a scrim. Defaults to "standard". */
  variant?: Md3SideSheetVariant;
  /** Screen (or layout) edge the sheet is attached to. Defaults to "right". */
  side?: Md3SideSheetSide;
  /** Whether the sheet is shown. Defaults to true for standard sheets and false for modal ones. */
  open?: boolean;
  /** Called when the sheet asks to close (close button, Escape or scrim click). */
  onOpenChange?: (open: boolean) => void;
  /** Modal only: when false, Escape and scrim clicks do not close the sheet. Defaults to true. */
  dismissible?: boolean;
  /** Standard only: draw a divider on the edge facing the content. Defaults to false. */
  divider?: boolean;
  /** Modal only: element to portal into. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

/**
 * A Material Design 3 side sheet: a surface of supplementary content anchored to
 * the left or right edge. The `standard` variant is an in-layout, non-modal
 * `<aside>` on the surface colour that sits beside the main content; the `modal`
 * variant portals a `role="dialog"` panel on surface-container-low over a scrim,
 * moves focus into it, traps Tab, locks body scroll, closes on Escape or a scrim
 * click and returns focus to whatever opened it. Compose it from
 * Md3SideSheetHeader (title with optional back and close icon buttons),
 * Md3SideSheetBody and Md3SideSheetActions.
 */
export const Md3SideSheet = React.forwardRef<HTMLElement, Md3SideSheetProps>(
  (
    {
      variant = "standard",
      side = "right",
      open: openProp,
      onOpenChange,
      dismissible = true,
      divider = false,
      container,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const open = openProp ?? variant === "standard";
    const titleId = `${React.useId()}-title`;
    const [hasTitle, setHasTitle] = React.useState(false);
    const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange]);
    const value = React.useMemo<SideSheetContextValue>(
      () => ({ variant, side, titleId, setHasTitle, close }),
      [variant, side, titleId, close],
    );

    if (!open) return null;

    if (variant === "standard") {
      return (
        <SideSheetContext.Provider value={value}>
          <aside
            ref={ref}
            aria-labelledby={hasTitle ? titleId : undefined}
            data-side={side}
            className={cn(
              "flex h-full w-full max-w-[400px] shrink-0 flex-col bg-md-surface text-md-on-surface",
              divider && (side === "right" ? "border-l border-md-outline-variant" : "border-r border-md-outline-variant"),
              className,
            )}
            {...props}
          >
            {children}
          </aside>
        </SideSheetContext.Provider>
      );
    }

    return (
      <SideSheetContext.Provider value={value}>
        <ModalPortal container={container}>
          <ModalSideSheet
            ref={ref as React.Ref<HTMLDivElement>}
            side={side}
            dismissible={dismissible}
            close={close}
            labelledBy={hasTitle ? titleId : undefined}
            className={className}
            {...(props as React.HTMLAttributes<HTMLDivElement>)}
          >
            {children}
          </ModalSideSheet>
        </ModalPortal>
      </SideSheetContext.Provider>
    );
  },
);
Md3SideSheet.displayName = "Md3SideSheet";

function ModalPortal({ children, container }: { children: React.ReactNode; container?: HTMLElement | null }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, container ?? document.body);
}

interface ModalSideSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  side: Md3SideSheetSide;
  dismissible: boolean;
  close: () => void;
  labelledBy?: string;
}

const ModalSideSheet = React.forwardRef<HTMLDivElement, ModalSideSheetProps>(
  ({ side, dismissible, close, labelledBy, className, children, onKeyDown, ...props }, ref) => {
    const panelRef = React.useRef<HTMLDivElement>(null);
    const [entered, setEntered] = React.useState(false);

    // Slide in on the next frame (transition is disabled under reduced motion).
    React.useEffect(() => {
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }, []);

    // Focus in on open; restore focus to whatever had it on close.
    React.useEffect(() => {
      const previous = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
      return () => {
        if (previous && previous.isConnected) previous.focus();
      };
    }, []);

    React.useEffect(() => {
      lockBodyScroll();
      return unlockBodyScroll;
    }, []);

    React.useEffect(() => {
      if (!dismissible) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          close();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [dismissible, close]);

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

    return (
      <div className="fixed inset-0 z-50">
        <div
          aria-hidden="true"
          data-slot="md3-side-sheet-scrim"
          className={cn(
            "absolute inset-0 bg-md-inverse-surface/40 transition-opacity duration-300",
            entered ? "opacity-100" : "opacity-0",
          )}
          onClick={dismissible ? close : undefined}
        />
        <div
          ref={mergeRefs(ref, panelRef)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          data-side={side}
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute inset-y-0 flex w-[85vw] max-w-[400px] flex-col bg-md-surface-container-low text-md-on-surface shadow-md-1 outline-none",
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
            side === "right" ? "right-0 rounded-l-md-lg" : "left-0 rounded-r-md-lg",
            !entered && (side === "right" ? "translate-x-full" : "-translate-x-full"),
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
ModalSideSheet.displayName = "ModalSideSheet";

export interface Md3SideSheetHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** When set, shows a leading back icon button that calls this handler. */
  onBack?: () => void;
  /** Accessible name of the back button. Defaults to "Back". */
  backLabel?: string;
  /** Show the trailing close icon button. Defaults to true. */
  showClose?: boolean;
  /** Accessible name of the close button. Defaults to "Close". */
  closeLabel?: string;
  /** Draw a divider under the header. Defaults to false. */
  divider?: boolean;
}

/**
 * The side sheet header: an optional leading back icon button, the headline
 * (children, rendered as an `<h2>` that labels the sheet) and a trailing close
 * icon button that asks the sheet to close.
 */
export const Md3SideSheetHeader = React.forwardRef<HTMLDivElement, Md3SideSheetHeaderProps>(
  (
    { onBack, backLabel = "Back", showClose = true, closeLabel = "Close", divider = false, className, children, ...props },
    ref,
  ) => {
    const { titleId, setHasTitle, close } = useSideSheet("Md3SideSheetHeader");
    React.useEffect(() => {
      setHasTitle(true);
      return () => setHasTitle(false);
    }, [setHasTitle]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-[72px] shrink-0 items-center gap-1 pb-4 pt-3 pr-3",
          onBack ? "pl-3" : "pl-6",
          divider && "border-b border-md-outline-variant",
          className,
        )}
        {...props}
      >
        {onBack && (
          <Md3IconButton aria-label={backLabel} onClick={onBack} className="shrink-0">
            <ArrowLeft />
          </Md3IconButton>
        )}
        <h2 id={titleId} className="min-w-0 flex-1 truncate text-[22px] leading-7 text-md-on-surface-variant">
          {children}
        </h2>
        {showClose && (
          <Md3IconButton aria-label={closeLabel} onClick={close} className="shrink-0">
            <X />
          </Md3IconButton>
        )}
      </div>
    );
  },
);
Md3SideSheetHeader.displayName = "Md3SideSheetHeader";

export type Md3SideSheetBodyProps = React.HTMLAttributes<HTMLDivElement>;

/** The scrollable content region of a side sheet, padded to the 24px M3 margins. */
export const Md3SideSheetBody = React.forwardRef<HTMLDivElement, Md3SideSheetBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 pb-6 text-sm text-md-on-surface-variant", className)}
      {...props}
    />
  ),
);
Md3SideSheetBody.displayName = "Md3SideSheetBody";

export interface Md3SideSheetActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Draw the divider above the actions. Defaults to true. */
  divider?: boolean;
}

/** The optional bottom action row of a side sheet (e.g. Save / Cancel buttons), start-aligned per M3. */
export const Md3SideSheetActions = React.forwardRef<HTMLDivElement, Md3SideSheetActionsProps>(
  ({ divider = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 px-6 pb-6 pt-4",
        divider && "border-t border-md-outline-variant",
        className,
      )}
      {...props}
    />
  ),
);
Md3SideSheetActions.displayName = "Md3SideSheetActions";
