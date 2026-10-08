import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3TopAppBarVariant = "small" | "center" | "medium" | "large";

export interface Md3TopAppBarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: Md3TopAppBarVariant;
  /** Leading element (usually a navigation icon button). */
  leading?: React.ReactNode;
  /** Trailing action elements. */
  trailing?: React.ReactNode;
  /** The title text. */
  headline: React.ReactNode;
}

/** A Material Design 3 top app bar (small, center-aligned, medium, or large). */
export const Md3TopAppBar = React.forwardRef<HTMLElement, Md3TopAppBarProps>(
  ({ variant = "small", leading, trailing, headline, className, ...props }, ref) => {
    const tall = variant === "medium" || variant === "large";

    return (
      <header
        ref={ref}
        className={cn(
          "flex w-full bg-md-surface text-md-on-surface",
          tall ? "flex-col px-4 pb-6 pt-2" : "h-16 items-center gap-1 px-1",
          variant === "medium" && "h-28",
          variant === "large" && "h-36",
          className,
        )}
        {...props}
      >
        <div className={cn("flex items-center gap-1", tall && "w-full")}>
          {leading && <span className="shrink-0">{leading}</span>}
          {!tall && (
            <h1
              className={cn(
                "flex-1 truncate text-xl",
                variant === "center" ? "text-center" : "px-1",
              )}
            >
              {headline}
            </h1>
          )}
          {trailing && <span className="ml-auto flex shrink-0 items-center">{trailing}</span>}
        </div>
        {tall && (
          <h1 className={cn("mt-auto px-1 text-md-on-surface", variant === "large" ? "text-4xl" : "text-2xl")}>
            {headline}
          </h1>
        )}
      </header>
    );
  },
);
Md3TopAppBar.displayName = "Md3TopAppBar";
