import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}
const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface ItemContextValue {
  value: string;
  open: boolean;
  headingId: string;
  panelId: string;
}
const ItemContext = React.createContext<ItemContextValue | null>(null);

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Allow multiple panels open at once. */
  type?: "single" | "multiple";
  /** Initial open value(s). */
  defaultValue?: string | string[];
}

/** A vertically stacked set of collapsible panels. */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultValue, className, ...props }, ref) => {
    const [open, setOpen] = React.useState<string[]>(
      defaultValue == null ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue],
    );

    const toggle = React.useCallback(
      (value: string) => {
        setOpen((prev) => {
          const isOpen = prev.includes(value);
          if (type === "multiple") {
            return isOpen ? prev.filter((v) => v !== value) : [...prev, value];
          }
          return isOpen ? [] : [value];
        });
      },
      [type],
    );

    const ctx = React.useMemo<AccordionContextValue>(
      () => ({ isOpen: (v) => open.includes(v), toggle }),
      [open, toggle],
    );

    return (
      <AccordionContext.Provider value={ctx}>
        <div ref={ref} className={cn("divide-y divide-border rounded-lg border border-border", className)} {...props} />
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext);
    if (!ctx) throw new Error("<AccordionItem> must be used inside <Accordion>");
    const id = React.useId();
    const item = React.useMemo<ItemContextValue>(
      () => ({ value, open: ctx.isOpen(value), headingId: `${id}-h`, panelId: `${id}-p` }),
      [value, ctx, id],
    );
    return (
      <ItemContext.Provider value={item}>
        <div ref={ref} className={className} {...props} />
      </ItemContext.Provider>
    );
  },
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const acc = React.useContext(AccordionContext);
    const item = React.useContext(ItemContext);
    if (!acc || !item) throw new Error("<AccordionTrigger> must be used inside <AccordionItem>");
    return (
      <button
        ref={ref}
        type="button"
        id={item.headingId}
        aria-expanded={item.open}
        aria-controls={item.panelId}
        onClick={() => acc.toggle(item.value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", item.open && "rotate-180")}
        />
      </button>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const item = React.useContext(ItemContext);
    if (!item) throw new Error("<AccordionContent> must be used inside <AccordionItem>");
    if (!item.open) return null;
    return (
      <div
        ref={ref}
        role="region"
        id={item.panelId}
        aria-labelledby={item.headingId}
        className={cn("px-4 pb-3 text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  },
);
AccordionContent.displayName = "AccordionContent";
