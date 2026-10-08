import * as React from "react";
import { cn } from "@nucleux/utils";

export interface Md3SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  message: React.ReactNode;
  /** Optional trailing action label (rendered as a text button). */
  action?: string;
  onAction?: () => void;
}

/**
 * A Material Design 3 snackbar. Presentational + controlled via `open`; position
 * it with `className` (e.g. fixed bottom-4). Uses the inverse surface roles.
 */
export const Md3Snackbar = React.forwardRef<HTMLDivElement, Md3SnackbarProps>(
  ({ open, message, action, onAction, className, ...props }, ref) => {
    if (!open) return null;
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "flex min-h-12 items-center gap-2 rounded-md-xs bg-md-inverse-surface px-4 py-3 text-sm text-md-inverse-on-surface shadow-md-3",
          className,
        )}
        {...props}
      >
        <span className="flex-1">{message}</span>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className="relative -mr-2 shrink-0 overflow-hidden rounded-md-xs px-3 py-1.5 text-sm font-medium text-md-inverse-primary outline-none before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12]"
          >
            <span className="relative">{action}</span>
          </button>
        )}
      </div>
    );
  },
);
Md3Snackbar.displayName = "Md3Snackbar";
