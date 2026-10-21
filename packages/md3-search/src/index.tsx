import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  /** Leading element (defaults to a search icon). */
  leading?: React.ReactNode;
  /** Trailing element (e.g. an avatar or icon button). */
  trailing?: React.ReactNode;
}

/** A Material Design 3 search bar (full-width pill on a surface container). */
export const Md3Search = React.forwardRef<HTMLInputElement, Md3SearchProps>(
  ({ value, onValueChange, leading, trailing, placeholder = "Search", className, ...props }, ref) => (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-full bg-md-surface-container-high px-4 text-md-on-surface",
        className,
      )}
    >
      <span className="shrink-0 text-md-on-surface-variant [&_svg]:size-6">
        {leading ?? <Search aria-hidden />}
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-md-on-surface-variant [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {trailing && <span className="shrink-0">{trailing}</span>}
    </div>
  ),
);
Md3Search.displayName = "Md3Search";
