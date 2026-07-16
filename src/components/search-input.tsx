import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Custom leading icon (defaults to a magnifier). */
  icon?: React.ReactNode;
  /** Optional trailing content, e.g. a keyboard-shortcut hint. */
  trailing?: React.ReactNode;
  /** Wrapper className (the input fills the remaining space). */
  containerClassName?: string;
}

/** Compact search field used in the top navigation ("Ask or search"). */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { icon, trailing, placeholder = "Ask or search", className, containerClassName, ...props },
    ref,
  ) => (
    <div
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring",
        containerClassName,
      )}
    >
      <span className="shrink-0 text-muted-foreground [&_svg]:size-5">
        {icon ?? <Search />}
      </span>
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
      {trailing && <span className="shrink-0 text-muted-foreground">{trailing}</span>}
    </div>
  ),
);
SearchInput.displayName = "SearchInput";
