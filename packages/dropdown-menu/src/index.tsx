import * as React from "react";
import { cn, Slot } from "@nucleux/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
  triggerId: string;
}
const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu(component: string) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenu>`);
  return ctx;
}

export interface DropdownMenuProps {
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * A menu of actions opened from a trigger button. Compose
 * DropdownMenuTrigger + DropdownMenuContent with DropdownMenuItem,
 * DropdownMenuLabel, DropdownMenuSeparator and DropdownMenuGroup.
 * Closes on outside click, Escape, or choosing an item; arrow keys, Home and
 * End move between items.
 */
export function DropdownMenu({ open, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const isControlled = open != null;
  const value = isControlled ? open : internal;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentId = React.useId();
  const triggerId = React.useId();

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
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [value, setOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open: value, setOpen, triggerRef, contentId, triggerId }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the single child (e.g. a `<Button>`) as the trigger instead of a plain `<button>`. */
  asChild?: boolean;
}

/** The button that opens the menu. Give icon-only triggers an `aria-label`. */
export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild = false, onClick, onKeyDown, type = "button", ...props }, ref) => {
    const { open, setOpen, triggerRef, contentId, triggerId } = useDropdownMenu("DropdownMenuTrigger");
    const setRefs = (node: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    const triggerProps = {
      id: triggerId,
      "aria-haspopup": "menu" as const,
      "aria-expanded": open,
      "aria-controls": open ? contentId : undefined,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented && (e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
          e.preventDefault();
          setOpen(true);
        }
      },
      ...props,
    };
    if (asChild) return <Slot ref={setRefs as React.Ref<HTMLElement>} {...(triggerProps as React.HTMLAttributes<HTMLElement>)} />;
    return <button ref={setRefs} type={type} {...triggerProps} />;
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const itemsOf = (menu: HTMLElement) =>
  Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'));

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment relative to the trigger. */
  align?: "start" | "end";
  /** Open below (default) or above the trigger. */
  side?: "bottom" | "top";
}

/** The menu panel. Focus moves to the first item when it opens. */
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = "start", side = "bottom", className, onKeyDown, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentId, triggerId } = useDropdownMenu("DropdownMenuContent");
    const menuRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (open && menuRef.current) itemsOf(menuRef.current)[0]?.focus();
    }, [open]);

    if (!open) return null;

    const close = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };

    return (
      <div
        ref={(node) => {
          menuRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={contentId}
        role="menu"
        aria-labelledby={triggerId}
        tabIndex={-1}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || !menuRef.current) return;
          const items = itemsOf(menuRef.current);
          const i = items.indexOf(document.activeElement as HTMLElement);
          const focus = (n: number) => items[(n + items.length) % items.length]?.focus();
          if (e.key === "ArrowDown") (e.preventDefault(), focus(i + 1));
          else if (e.key === "ArrowUp") (e.preventDefault(), focus(i - 1));
          else if (e.key === "Home") (e.preventDefault(), focus(0));
          else if (e.key === "End") (e.preventDefault(), focus(items.length - 1));
          else if (e.key === "Escape" || e.key === "Tab") {
            if (e.key === "Escape") e.preventDefault();
            close();
          }
        }}
        className={cn(
          "absolute z-50 min-w-[8rem] rounded-lg border border-border bg-background p-1 text-foreground shadow-md outline-none animate-nx-fade-in",
          side === "top" ? "bottom-full mb-1" : "top-full mt-1",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      />
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  /** "destructive" styles a delete-style action. */
  variant?: "default" | "destructive";
  /** Indent to line up with items that have an icon. */
  inset?: boolean;
  /** Called when the item is chosen (click, Enter or Space). Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
}

/** One action in the menu. Choosing it closes the menu unless `onSelect` prevents it. */
export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ variant = "default", inset = false, onSelect, onClick, disabled, type = "button", className, ...props }, ref) => {
    const { setOpen, triggerRef } = useDropdownMenu("DropdownMenuItem");
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          const event = new Event("select", { cancelable: true });
          onSelect?.(event);
          if (!event.defaultPrevented) {
            setOpen(false);
            triggerRef.current?.focus();
          }
        }}
        className={cn(
          "flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors focus:bg-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
          variant === "destructive"
            ? "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 [&_svg]:text-destructive"
            : "text-foreground hover:bg-accent [&_svg]:text-muted-foreground",
          inset && "pl-8",
          className,
        )}
        {...props}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Indent to line up with items that have an icon. */
  inset?: boolean;
}

/** Non-interactive heading for a group of items. */
export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ inset = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", inset && "pl-8", className)}
      {...props}
    />
  ),
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

/** Groups related items (e.g. under one label). */
export const DropdownMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} role="group" {...props} />,
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

/** Hairline separator between groups. */
export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/** Keyboard shortcut hint shown at the end of an item. */
export const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
