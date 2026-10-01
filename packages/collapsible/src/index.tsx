import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@nucleux/utils";

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
  disabled: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

const useCollapsible = (component: string) => {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error(`${component} must be used within a Collapsible`);
  return ctx;
};

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/** A disclosure region that expands/collapses its content. */
export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, defaultOpen = false, onOpenChange, disabled = false, className, children, ...props }, ref) => {
    const isControlled = open !== undefined;
    const [internal, setInternal] = React.useState(defaultOpen);
    const isOpen = isControlled ? open : internal;
    const baseId = React.useId();
    const contentId = `${baseId}-content`;
    const triggerId = `${baseId}-trigger`;

    const toggle = React.useCallback(() => {
      if (disabled) return;
      const next = !isOpen;
      if (!isControlled) setInternal(next);
      onOpenChange?.(next);
    }, [disabled, isOpen, isControlled, onOpenChange]);

    return (
      <div ref={ref} className={cn(className)} data-state={isOpen ? "open" : "closed"} {...props}>
        <CollapsibleContext.Provider value={{ open: isOpen, toggle, contentId, triggerId, disabled }}>
          {children}
        </CollapsibleContext.Provider>
      </div>
    );
  },
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hide the default chevron affordance. */
  hideChevron?: boolean;
}

/** The button that toggles a {@link Collapsible}. */
export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, children, hideChevron = false, onClick, ...props }, ref) => {
    const { open, toggle, contentId, triggerId, disabled } = useCollapsible("CollapsibleTrigger");
    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) toggle();
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        {!hideChevron && (
          <ChevronDown
            aria-hidden
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        )}
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement>;

/** The region revealed when a {@link Collapsible} is open. */
export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, contentId, triggerId } = useCollapsible("CollapsibleContent");
    if (!open) return null;
    return (
      <div
        ref={ref}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={cn("animate-nx-fade-in pt-1.5 text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";
