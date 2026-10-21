import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@nucleux/utils";

interface NavContextValue {
  openValue: string | null;
  setOpenValue: (v: string | null) => void;
}
const NavContext = React.createContext<NavContextValue | null>(null);
const ItemValueContext = React.createContext<string | null>(null);

export type NavigationMenuProps = React.HTMLAttributes<HTMLElement>;

/** A site navigation bar with hover/focus-revealed dropdown panels. */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => {
    const [openValue, setOpenValue] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (openValue === null) return;
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenValue(null);
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [openValue]);

    return (
      <nav
        ref={ref}
        className={cn("relative flex justify-center", className)}
        onMouseLeave={() => setOpenValue(null)}
        {...props}
      >
        <NavContext.Provider value={{ openValue, setOpenValue }}>{children}</NavContext.Provider>
      </nav>
    );
  },
);
NavigationMenu.displayName = "NavigationMenu";

export type NavigationMenuListProps = React.HTMLAttributes<HTMLUListElement>;

export const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
  ),
);
NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value?: string;
}

/** A single entry in the {@link NavigationMenuList}. */
export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const generated = React.useId();
    return (
      <ItemValueContext.Provider value={value ?? generated}>
        <li ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </li>
      </ItemValueContext.Provider>
    );
  },
);
NavigationMenuItem.displayName = "NavigationMenuItem";

const triggerBase =
  "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring";

export type NavigationMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Opens the associated {@link NavigationMenuContent} on hover/focus. */
export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const nav = React.useContext(NavContext);
    const value = React.useContext(ItemValueContext);
    if (!nav || value === null) throw new Error("NavigationMenuTrigger must be used within a NavigationMenuItem");
    const open = nav.openValue === value;
    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseEnter={() => nav.setOpenValue(value)}
        onFocus={() => nav.setOpenValue(value)}
        onClick={() => nav.setOpenValue(open ? null : value)}
        className={cn(triggerBase, open && "bg-accent", className)}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
    );
  },
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export type NavigationMenuContentProps = React.HTMLAttributes<HTMLDivElement>;

/** The dropdown panel shown when its trigger is active. */
export const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, children, ...props }, ref) => {
    const nav = React.useContext(NavContext);
    const value = React.useContext(ItemValueContext);
    if (!nav || value === null) throw new Error("NavigationMenuContent must be used within a NavigationMenuItem");
    if (nav.openValue !== value) return null;
    return (
      <div
        ref={ref}
        role="menu"
        className={cn(
          "absolute left-0 top-full z-50 mt-1.5 min-w-[16rem] animate-nx-fade-in rounded-lg border border-border bg-background p-2 text-foreground shadow-md",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
NavigationMenuContent.displayName = "NavigationMenuContent";

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

/** A navigation link, usable at the top level or inside content panels. */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active = false, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-accent font-medium",
        className,
      )}
      {...props}
    />
  ),
);
NavigationMenuLink.displayName = "NavigationMenuLink";
