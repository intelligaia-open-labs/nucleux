import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Md3Menu } from "@nucleux/md3-menu";
import { cn } from "@nucleux/utils";

export type Md3SplitButtonVariant = "filled" | "tonal" | "elevated" | "outlined";
export type Md3SplitButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type Md3SplitButtonMenuAlign = "start" | "end";

export interface Md3SplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  variant?: Md3SplitButtonVariant;
  /** XS 32px, S 40px, M 56px, L 96px, XL 136px tall. */
  size?: Md3SplitButtonSize;
  /** Leading icon of the action button. */
  icon?: React.ReactNode;
  /** Accessible name for the action button when it shows only an icon. */
  actionLabel?: string;
  /** Click handler of the leading (primary action) button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Menu contents — usually Md3MenuItem / Md3MenuDivider elements from `@nucleux/md3-menu`. */
  menu: React.ReactNode;
  /** Accessible name of the trailing menu button. */
  menuLabel?: string;
  /** Which edge of the split button the menu lines up with. */
  menuAlign?: Md3SplitButtonMenuAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Disables both the action and the menu button. */
  disabled?: boolean;
}

const colors: Record<Md3SplitButtonVariant, string> = {
  filled: "bg-md-primary text-md-on-primary hover:shadow-md-1",
  tonal: "bg-md-secondary-container text-md-on-secondary-container hover:shadow-md-1",
  elevated: "bg-md-surface-container-low text-md-primary shadow-md-1 hover:shadow-md-2",
  outlined: "border border-md-outline bg-transparent text-md-primary",
};

const sizes: Record<Md3SplitButtonSize, { height: string; label: string; iconOnly: string; trailing: string }> = {
  xs: { height: "h-8 gap-1 text-sm [&_svg]:size-5", label: "px-3", iconOnly: "w-10", trailing: "w-8" },
  sm: { height: "h-10 gap-2 text-sm [&_svg]:size-5", label: "px-4", iconOnly: "w-12", trailing: "w-10" },
  md: { height: "h-14 gap-2 text-base [&_svg]:size-6", label: "px-6", iconOnly: "w-16", trailing: "w-14" },
  lg: { height: "h-24 gap-3 text-2xl [&_svg]:size-8", label: "px-12", iconOnly: "w-28", trailing: "w-24" },
  xl: { height: "h-[136px] gap-4 text-[32px] [&_svg]:size-10", label: "px-16", iconOnly: "w-40", trailing: "w-[136px]" },
};

/** Inner (facing) corners at rest, on hover and while pressed. */
const inner: Record<Md3SplitButtonSize, { leading: string; trailing: string }> = {
  xs: {
    leading: "rounded-r-md-xs hover:rounded-r-md-sm active:rounded-r-md-md",
    trailing: "rounded-l-md-xs hover:rounded-l-md-sm active:rounded-l-md-md",
  },
  sm: {
    leading: "rounded-r-md-xs hover:rounded-r-md-md active:rounded-r-md-lg",
    trailing: "rounded-l-md-xs hover:rounded-l-md-md active:rounded-l-md-lg",
  },
  md: {
    leading: "rounded-r-md-xs hover:rounded-r-md-md active:rounded-r-md-lg",
    trailing: "rounded-l-md-xs hover:rounded-l-md-md active:rounded-l-md-lg",
  },
  lg: {
    leading: "rounded-r-md-sm hover:rounded-r-md-lg active:rounded-r-[20px]",
    trailing: "rounded-l-md-sm hover:rounded-l-md-lg active:rounded-l-[20px]",
  },
  xl: {
    leading: "rounded-r-md-md hover:rounded-r-[20px] active:rounded-r-md-xl",
    trailing: "rounded-l-md-md hover:rounded-l-[20px] active:rounded-l-md-xl",
  },
};

const buttonBase = cn(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-medium",
  "transition-[border-radius,box-shadow] duration-200 ease-out",
  // State layer (Material 3): on-color overlay at 8% hover / 12% focus+press
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
  "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
  // Focus ring + disabled
  "outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
  "disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none",
);

const menuItems = (menu: HTMLElement | null) =>
  menu
    ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]')).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true",
      )
    : [];

/**
 * A Material 3 Expressive split button: a leading button for the primary action
 * joined (2px apart, small inner corners) to a trailing menu button that opens a
 * menu of related actions. When the menu opens the trailing button becomes fully
 * round and its chevron turns over. The menu uses Md3Menu with menu-button
 * semantics: `aria-haspopup`/`aria-expanded` on the trailing button, arrow-key
 * navigation between items, and Escape, Tab, outside click or choosing an item to
 * close. Filled, tonal, elevated and outlined colour styles in five sizes.
 */
export const Md3SplitButton = React.forwardRef<HTMLDivElement, Md3SplitButtonProps>(
  (
    {
      variant = "filled",
      size = "sm",
      icon,
      actionLabel,
      onClick,
      menu,
      menuLabel = "More options",
      menuAlign = "end",
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = openProp ?? internalOpen;
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const focusOnOpen = React.useRef<"first" | "last" | null>(null);
    const baseId = React.useId();
    const triggerId = `${baseId}-trigger`;
    const menuId = `${baseId}-menu`;

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (openProp === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [openProp, onOpenChange],
    );

    const close = React.useCallback(
      (returnFocus: boolean) => {
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus();
      },
      [setOpen],
    );

    // Move focus into the menu once it has rendered.
    React.useEffect(() => {
      if (!open || !focusOnOpen.current) return;
      const items = menuItems(menuRef.current);
      (focusOnOpen.current === "last" ? items[items.length - 1] : items[0])?.focus();
      focusOnOpen.current = null;
    }, [open]);

    // Close on a pointer press outside the split button.
    React.useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: PointerEvent | MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("mousedown", onPointerDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("mousedown", onPointerDown);
      };
    }, [open, close]);

    const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        focusOnOpen.current = e.key === "ArrowDown" ? "first" : "last";
        if (open) {
          const items = menuItems(menuRef.current);
          (e.key === "ArrowDown" ? items[0] : items[items.length - 1])?.focus();
          focusOnOpen.current = null;
        } else setOpen(true);
      }
    };

    const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = menuItems(menuRef.current);
      const index = items.indexOf(document.activeElement as HTMLElement);
      let next: number | null = null;
      switch (e.key) {
        case "ArrowDown":
          next = index < 0 ? 0 : (index + 1) % items.length;
          break;
        case "ArrowUp":
          next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = items.length - 1;
          break;
        case "Escape":
          e.preventDefault();
          close(true);
          return;
        case "Tab":
          close(false);
          return;
        default:
          return;
      }
      e.preventDefault();
      items[next]?.focus();
    };

    const onMenuClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const item = (e.target as HTMLElement).closest('[role="menuitem"]');
      if (item && !e.defaultPrevented) close(true);
    };

    const s = sizes[size];
    const iconOnly = icon != null && (children == null || children === false);

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="group"
        className={cn("font-md", "relative inline-flex items-center gap-0.5", className)}
        {...props}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label={actionLabel}
          onClick={onClick}
          className={cn(
            buttonBase,
            s.height,
            iconOnly ? s.iconOnly : s.label,
            "rounded-l-full",
            inner[size].leading,
            colors[variant],
          )}
        >
          {icon && <span className="relative inline-flex shrink-0">{icon}</span>}
          {!iconOnly && children != null && <span className="relative">{children}</span>}
        </button>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          disabled={disabled}
          aria-label={menuLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          data-state={open ? "open" : "closed"}
          onClick={() => {
            focusOnOpen.current = open ? null : "first";
            setOpen(!open);
          }}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            buttonBase,
            s.height,
            s.trailing,
            // Opening morphs the trailing button into a full circle/pill.
            open ? "rounded-full" : cn("rounded-r-full", inner[size].trailing),
            colors[variant],
          )}
        >
          <ChevronDown
            aria-hidden
            className={cn(
              "relative transition-transform duration-200 ease-out motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
        </button>
        {open && (
          <Md3Menu
            ref={menuRef}
            id={menuId}
            aria-labelledby={triggerId}
            onKeyDown={onMenuKeyDown}
            onClick={onMenuClick}
            className={cn(
              "absolute top-full z-50 mt-1 animate-nx-fade-in motion-reduce:animate-none",
              menuAlign === "end" ? "right-0" : "left-0",
            )}
          >
            {menu}
          </Md3Menu>
        )}
      </div>
    );
  },
);
Md3SplitButton.displayName = "Md3SplitButton";
