import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@nucleux/utils";

interface SheetContextValue {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
}
const SheetContext = React.createContext<SheetContextValue | null>(null);

export type SheetSide = "right" | "left" | "top" | "bottom";

const sideClasses: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 h-full w-full max-w-sm border-l",
  left: "inset-y-0 left-0 h-full w-full max-w-sm border-r",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full border-t",
};

export interface SheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Called when the sheet requests to close (overlay click / Escape / close button). */
  onOpenChange: (open: boolean) => void;
  /** Which edge the sheet slides in from. */
  side?: SheetSide;
  /** Panel content — compose SheetHeader/Title/Description/Body/Footer. */
  children: React.ReactNode;
  /** Class overrides for the panel. */
  className?: string;
  /** Disable closing on overlay click / Escape. */
  dismissible?: boolean;
}

/**
 * A slide-over drawer anchored to a screen edge. Controlled via `open` /
 * `onOpenChange`; closes on overlay click, Escape, or {@link SheetClose}.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  dismissible = true,
}: SheetProps) {
  const baseId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  React.useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, close]);

  React.useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <SheetContext.Provider
      value={{ titleId: `${baseId}-title`, descriptionId: `${baseId}-desc`, onClose: close }}
    >
      <div className="fixed inset-0 z-50">
        <div
          aria-hidden
          className="absolute inset-0 bg-foreground/50 animate-nx-fade-in"
          onClick={dismissible ? close : undefined}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${baseId}-title`}
          aria-describedby={`${baseId}-desc`}
          tabIndex={-1}
          className={cn(
            "absolute flex flex-col border-border bg-background shadow-lg outline-none animate-nx-fade-in",
            sideClasses[side],
            className,
          )}
        >
          {children}
        </div>
      </div>
    </SheetContext.Provider>
  );
}

export const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(SheetContext);
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between gap-4 border-b border-border p-4", className)}
        {...props}
      >
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          aria-label="Close"
          onClick={ctx?.onClose}
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  },
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(SheetContext);
    return (
      <h2
        ref={ref}
        id={ctx?.titleId}
        className={cn("text-sm font-semibold text-foreground", className)}
        {...props}
      />
    );
  },
);
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(SheetContext);
  return (
    <p ref={ref} id={ctx?.descriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
});
SheetDescription.displayName = "SheetDescription";

export const SheetBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("min-h-0 flex-1 overflow-y-auto p-4", className)} {...props} />
  ),
);
SheetBody.displayName = "SheetBody";

export const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-2 border-t border-border p-4", className)}
      {...props}
    />
  ),
);
SheetFooter.displayName = "SheetFooter";

/** A button that closes the enclosing Sheet. */
export const SheetClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, type = "button", ...props }, ref) => {
    const ctx = React.useContext(SheetContext);
    return (
      <button
        ref={ref}
        type={type}
        onClick={(e) => {
          onClick?.(e);
          ctx?.onClose();
        }}
        {...props}
      />
    );
  },
);
SheetClose.displayName = "SheetClose";
