import * as React from "react";
import { X } from "lucide-react";
import { Md3Fab } from "@nucleux/md3-fab";
import { cn } from "@nucleux/utils";

export type Md3FabMenuColor = "primary" | "secondary" | "tertiary";
export type Md3FabMenuFabSize = "small" | "regular" | "large";
export type Md3FabMenuAlign = "start" | "end";

interface FabMenuContextValue {
  color: Md3FabMenuColor;
  /** Close the menu and return focus to the FAB. */
  closeAndFocus: () => void;
}
const FabMenuContext = React.createContext<FabMenuContextValue | null>(null);

/** Close button (the FAB once the menu is open): the strong colour of the set. */
const closeColors: Record<Md3FabMenuColor, string> = {
  primary: "bg-md-primary text-md-on-primary",
  secondary: "bg-md-secondary text-md-on-secondary",
  tertiary: "bg-md-tertiary text-md-on-tertiary",
};

/** Menu items: the container colour of the set, contrasting with the close button. */
const itemColors: Record<Md3FabMenuColor, string> = {
  primary: "bg-md-primary-container text-md-on-primary-container",
  secondary: "bg-md-secondary-container text-md-on-secondary-container",
  tertiary: "bg-md-tertiary-container text-md-on-tertiary-container",
};

export interface Md3FabMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Colour set: the closed FAB, the close button and the items all follow it. */
  color?: Md3FabMenuColor;
  /** Size of the FAB while closed. Once open it becomes a 56px round close button. */
  fabSize?: Md3FabMenuFabSize;
  /** Icon shown on the FAB while the menu is closed. */
  icon: React.ReactNode;
  /** Icon shown on the close button (defaults to an X). */
  closeIcon?: React.ReactNode;
  /** Accessible name of the FAB, e.g. "Create". */
  label: string;
  /** Which edge the FAB and items line up against (default "end"). */
  align?: Md3FabMenuAlign;
}

/**
 * A Material Design 3 Expressive FAB menu. A FAB that, when pressed, turns into a
 * round close button and opens a stack of 2–6 large pill-shaped menu items above it,
 * in the primary, secondary or tertiary colour set. The FAB is a menu button
 * (`aria-haspopup="menu"`, `aria-expanded`); the items form a `role="menu"` with
 * arrow-key, Home and End navigation. Escape, Tab, choosing an item or clicking
 * outside closes it, and focus returns to the FAB. Compose with Md3FabMenuItem.
 */
export const Md3FabMenu = React.forwardRef<HTMLDivElement, Md3FabMenuProps>(
  (
    {
      open,
      defaultOpen = false,
      onOpenChange,
      color = "primary",
      fabSize = "regular",
      icon,
      closeIcon,
      label,
      align = "end",
      onKeyDown,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = open !== undefined;
    const [internal, setInternal] = React.useState(defaultOpen);
    const isOpen = isControlled ? open : internal;

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    /** Which item to focus after an interaction opens the menu. */
    const focusOnOpen = React.useRef<"first" | "last" | null>(null);
    const baseId = React.useId();
    const triggerId = `${baseId}-fab`;
    const menuId = `${baseId}-menu`;

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternal(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const closeAndFocus = React.useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, [setOpen]);

    const items = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);

    // Move focus into the menu when the user opened it (not on mount with defaultOpen).
    React.useEffect(() => {
      if (!isOpen || !focusOnOpen.current) return;
      const list = items();
      (focusOnOpen.current === "last" ? list[list.length - 1] : list[0])?.focus();
      focusOnOpen.current = null;
    }, [isOpen]);

    // Close on a pointer press outside; give focus back to the FAB unless the press
    // landed on something else focusable.
    React.useEffect(() => {
      if (!isOpen) return;
      const onPointerDown = (e: PointerEvent) => {
        if (rootRef.current?.contains(e.target as Node)) return;
        setOpen(false);
        window.setTimeout(() => {
          const active = document.activeElement;
          if (!active || active === document.body) triggerRef.current?.focus();
        }, 0);
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [isOpen, setOpen]);

    const onRootKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeAndFocus();
      }
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isOpen || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
      e.preventDefault();
      // Items stack above the FAB, so ArrowUp lands on the nearest (last) one.
      focusOnOpen.current = e.key === "ArrowUp" ? "last" : "first";
      setOpen(true);
    };

    const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const list = items();
      if (!list.length) return;
      const index = list.indexOf(document.activeElement as HTMLElement);
      let next: number | null = null;
      if (e.key === "ArrowDown") next = (index + 1) % list.length;
      else if (e.key === "ArrowUp") next = (index - 1 + list.length) % list.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      else if (e.key === "Tab") {
        setOpen(false);
        return;
      }
      if (next === null) return;
      e.preventDefault();
      list[next]?.focus();
    };

    return (
      <div
        ref={setRefs}
        className={cn(
          "relative inline-flex flex-col gap-2",
          align === "end" ? "items-end" : "items-start",
          className,
        )}
        {...props}
        onKeyDown={onRootKeyDown}
      >
        {isOpen && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            className={cn("flex flex-col gap-1", align === "end" ? "items-end" : "items-start")}
            onKeyDown={onMenuKeyDown}
          >
            <FabMenuContext.Provider value={{ color, closeAndFocus }}>{children}</FabMenuContext.Provider>
          </div>
        )}
        <Md3Fab
          ref={triggerRef}
          id={triggerId}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          color={color}
          size={isOpen ? "regular" : fabSize}
          icon={isOpen ? (closeIcon ?? <X />) : icon}
          className={cn(
            "transition-[border-radius,width,height,background-color,box-shadow] duration-200 motion-reduce:transition-none",
            isOpen && cn("!rounded-full", closeColors[color]),
          )}
          onClick={() => {
            if (!isOpen) focusOnOpen.current = "first";
            setOpen(!isOpen);
          }}
          onKeyDown={onTriggerKeyDown}
        />
      </div>
    );
  },
);
Md3FabMenu.displayName = "Md3FabMenu";

export interface Md3FabMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading icon. */
  icon?: React.ReactNode;
}

/**
 * One action in a {@link Md3FabMenu}: a 56px pill with an icon and a label in the
 * menu's container colour. Choosing it runs `onClick`, then closes the menu and
 * returns focus to the FAB (call `event.preventDefault()` to keep it open).
 */
export const Md3FabMenuItem = React.forwardRef<HTMLButtonElement, Md3FabMenuItemProps>(
  ({ icon, className, children, onClick, type = "button", ...props }, ref) => {
    const ctx = React.useContext(FabMenuContext);
    const color = ctx?.color ?? "primary";
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        tabIndex={-1}
        className={cn(
          "relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full pl-4 pr-6 text-base font-medium [&_svg]:size-6",
          "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
          "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
          "disabled:pointer-events-none disabled:opacity-[0.38]",
          "motion-safe:animate-nx-fade-in motion-safe:[animation-fill-mode:backwards]",
          itemColors[color],
          className,
        )}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx?.closeAndFocus();
        }}
        {...props}
      >
        {icon && <span className="relative shrink-0">{icon}</span>}
        <span className="relative whitespace-nowrap">{children}</span>
      </button>
    );
  },
);
Md3FabMenuItem.displayName = "Md3FabMenuItem";
