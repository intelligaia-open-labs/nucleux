import * as React from "react";
import { cn } from "../lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
}
const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover(component: string) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Popover>`);
  return ctx;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * A click-triggered popover. Compose PopoverTrigger + PopoverContent. Closes on
 * outside click or Escape. Content is positioned relative to the trigger.
 */
export function Popover({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const isControlled = open != null;
  const value = isControlled ? open : internal;
  const contentId = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!value) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [value, setOpen]);

  return (
    <PopoverContext.Provider value={{ open: value, setOpen, contentId }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, type = "button", ...props }, ref) => {
    const { open, setOpen, contentId } = usePopover("PopoverTrigger");
    return (
      <button
        ref={ref}
        type={type}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        onClick={(e) => {
          onClick?.(e);
          setOpen(!open);
        }}
        {...props}
      />
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment relative to the trigger. */
  align?: "start" | "end";
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ align = "start", className, ...props }, ref) => {
    const { open, contentId } = usePopover("PopoverContent");
    if (!open) return null;
    return (
      <div
        ref={ref}
        id={contentId}
        className={cn(
          "absolute top-full z-50 mt-2 min-w-[12rem] rounded-lg border border-border bg-background p-4 text-foreground shadow-md outline-none animate-nx-fade-in",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      />
    );
  },
);
PopoverContent.displayName = "PopoverContent";
