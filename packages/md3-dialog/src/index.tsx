import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headline: React.ReactNode;
  /** Optional hero icon, centered above the headline. */
  icon?: React.ReactNode;
  /** Supporting body content. */
  children?: React.ReactNode;
  /** Action buttons (typically text buttons), right-aligned. */
  actions?: React.ReactNode;
  /** Close on scrim click / Escape (default true). */
  dismissible?: boolean;
  className?: string;
}

/** A Material Design 3 basic dialog with scrim, headline, body, and actions. */
export function Md3Dialog({
  open,
  onOpenChange,
  headline,
  icon,
  children,
  actions,
  dismissible = true,
  className,
}: Md3DialogProps) {
  const baseId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  React.useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, close]);

  React.useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-md-inverse-surface/40" onClick={dismissible ? close : undefined} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-headline`}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col rounded-md-xl bg-md-surface-container-high p-6 text-md-on-surface shadow-md-3 outline-none",
          className,
        )}
      >
        {icon && (
          <div className="mb-4 flex justify-center text-md-secondary [&_svg]:size-6">{icon}</div>
        )}
        <h2
          id={`${baseId}-headline`}
          className={cn("text-2xl text-md-on-surface", icon ? "text-center" : "")}
        >
          {headline}
        </h2>
        {children && <div className="mt-4 text-sm text-md-on-surface-variant">{children}</div>}
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}
