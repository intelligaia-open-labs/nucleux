import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Wrapper className (the chevron is positioned within it). */
  containerClassName?: string;
}

/**
 * An accessible select built on the native `<select>` element (full keyboard +
 * screen-reader support), styled to match the design system with a chevron.
 * Pass `<option>`s as children.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, containerClassName, children, ...props }, ref) => (
    <div className={cn("relative inline-flex w-full", containerClassName)}>
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  ),
);
NativeSelect.displayName = "NativeSelect";

/** An `<option>` for NativeSelect. */
export const NativeSelectOption = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  (props, ref) => <option ref={ref} {...props} />,
);
NativeSelectOption.displayName = "NativeSelectOption";

/** An `<optgroup>` for NativeSelect. */
export const NativeSelectOptGroup = React.forwardRef<HTMLOptGroupElement, React.OptgroupHTMLAttributes<HTMLOptGroupElement>>(
  (props, ref) => <optgroup ref={ref} {...props} />,
);
NativeSelectOptGroup.displayName = "NativeSelectOptGroup";
