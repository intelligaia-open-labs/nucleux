import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3BottomSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Show the drag handle at the top (default true). */
  showHandle?: boolean;
  dismissible?: boolean;
}

/** A Material Design 3 modal bottom sheet with a scrim and drag handle. */
export const Md3BottomSheet = React.forwardRef<HTMLDivElement, Md3BottomSheetProps>(
  ({ open, onOpenChange, showHandle = true, dismissible = true, className, children, ...props }, ref) => {
    const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

    React.useEffect(() => {
      if (!open || !dismissible) return;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, dismissible, close]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div aria-hidden className="absolute inset-0 bg-md-inverse-surface/40" onClick={dismissible ? close : undefined} />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-10 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-t-md-xl bg-md-surface-container-low p-4 pb-8 text-md-on-surface shadow-md-3 animate-nx-fade-in",
            className,
          )}
          {...props}
        >
          {showHandle && (
            <div className="mx-auto mb-4 h-1 w-8 shrink-0 rounded-full bg-md-on-surface-variant/40" />
          )}
          {children}
        </div>
      </div>
    );
  },
);
Md3BottomSheet.displayName = "Md3BottomSheet";
