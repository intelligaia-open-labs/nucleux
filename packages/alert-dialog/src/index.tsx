import * as React from "react";
import { cn } from "@nucleux/utils";

export interface AlertDialogProps {
  /** Whether the alert dialog is open. */
  open: boolean;
  /** Called when the dialog requests to close (Escape / a button). */
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Confirm button label. */
  confirmLabel?: string;
  /** Cancel button label. */
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Style the confirm action as destructive. */
  destructive?: boolean;
  /** Extra content between the description and the actions. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * A modal confirmation dialog for consequential actions. Unlike Dialog, it uses
 * role="alertdialog", does not close on overlay click, and focuses Cancel by
 * default. Escape triggers cancel.
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
  children,
  className,
}: AlertDialogProps) {
  const baseId = React.useId();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const cancel = React.useCallback(() => {
    onCancel?.();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const confirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, cancel]);

  React.useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 animate-nx-fade-in bg-foreground/50" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        aria-describedby={description ? `${baseId}-desc` : undefined}
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-lg outline-none animate-nx-fade-in",
          className,
        )}
      >
        <div className="flex flex-col gap-1">
          <h2 id={`${baseId}-title`} className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p id={`${baseId}-desc`} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {children}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={cancel}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={confirm}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
