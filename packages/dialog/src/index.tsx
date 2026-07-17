import * as React from "react";
import { cn } from "@nucleux/utils";

interface DialogContextValue {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
}
const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests to close (overlay click / Escape). */
  onOpenChange: (open: boolean) => void;
  /** Panel content — compose DialogHeader/Title/Description/Footer. */
  children: React.ReactNode;
  /** Class overrides for the panel. */
  className?: string;
  /** Disable closing on overlay click / Escape. */
  dismissible?: boolean;
}

/**
 * A modal dialog. Controlled via `open` / `onOpenChange`. Renders an overlay and
 * a centered panel; closes on overlay click or Escape (unless `dismissible` is
 * false). Compose with DialogHeader, DialogTitle, DialogDescription, DialogFooter.
 */
export function Dialog({ open, onOpenChange, children, className, dismissible = true }: DialogProps) {
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
    <DialogContext.Provider
      value={{ titleId: `${baseId}-title`, descriptionId: `${baseId}-desc`, onClose: close }}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            "relative z-10 flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-lg outline-none animate-nx-fade-in",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);
    return (
      <h2
        ref={ref}
        id={ctx?.titleId}
        className={cn("text-xl font-semibold text-foreground", className)}
        {...props}
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(DialogContext);
  return (
    <p ref={ref} id={ctx?.descriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
});
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";
