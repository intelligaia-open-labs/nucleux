import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn, Slot } from "@nucleux/utils";
import { Button, type ButtonProps } from "@nucleux/button";
import { Input, type InputProps } from "@nucleux/input";
import { Separator, type SeparatorProps } from "@nucleux/separator";
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "@nucleux/sheet";
import { Skeleton } from "@nucleux/skeleton";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_QUERY = "(max-width: 767px)";

/** True below the `md` breakpoint (768px). False during server rendering. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);
  return isMobile;
}

export interface SidebarContextValue {
  /** "expanded" or "collapsed" (desktop). */
  state: "expanded" | "collapsed";
  /** Desktop open state. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Phone open state (the sidebar is a Sheet below md). */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  /** Toggles the right state for the current screen size. */
  toggleSidebar: () => void;
}
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** Read and control the sidebar from any component inside SidebarProvider. */
export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial desktop state (uncontrolled). Default true. */
  defaultOpen?: boolean;
  /** Desktop open state (controlled). */
  open?: boolean;
  /** Called when the desktop state changes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Wraps the whole layout: holds the open state, the phone/desktop switch and
 * the ⌘B / Ctrl+B shortcut, and remembers the desktop state in a cookie
 * (`sidebar_state`). Put a Sidebar and a SidebarInset inside.
 */
export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultOpen = true, open: openProp, onOpenChange, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = openProp ?? internalOpen;

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const next = typeof value === "function" ? value(open) : value;
        if (onOpenChange) onOpenChange(next);
        else setInternalOpen(next);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [onOpenChange, open],
    );

    const toggleSidebar = React.useCallback(
      () => (isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)),
      [isMobile, setOpen],
    );

    React.useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";
    const value = React.useMemo<SidebarContextValue>(
      () => ({ state, open, setOpen: (o: boolean) => setOpen(o), isMobile, openMobile, setOpenMobile, toggleSidebar }),
      [state, open, setOpen, isMobile, openMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={value}>
        <div
          ref={ref}
          data-slot="sidebar-wrapper"
          style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-muted/40", className)}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which edge. */
  side?: "left" | "right";
  /** "sidebar" (flush), "floating" (rounded card) or "inset" (page sits in a rounded card beside it). */
  variant?: "sidebar" | "floating" | "inset";
  /** How it collapses on desktop: slide out ("offcanvas"), shrink to icons ("icon"), or never ("none"). */
  collapsible?: "offcanvas" | "icon" | "none";
}

/**
 * The application sidebar. Fixed beside the page from `md` up, collapsing as
 * set by `collapsible`; below `md` it opens as a Sheet. Compose SidebarHeader,
 * SidebarContent (SidebarGroup → SidebarMenu → SidebarMenuItem →
 * SidebarMenuButton) and SidebarFooter. Must be inside SidebarProvider.
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div
          ref={ref}
          data-slot="sidebar"
          className={cn("flex h-full w-[var(--sidebar-width)] flex-col bg-muted/40 text-foreground", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} side={side} className="w-[var(--sidebar-width)] max-w-[85vw] p-0">
          <div
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="flex h-full w-full flex-col bg-background text-foreground"
            style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            {children}
          </div>
        </Sheet>
      );
    }

    const padded = variant === "floating" || variant === "inset";
    return (
      <div
        ref={ref}
        className="group peer hidden text-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-slot="sidebar"
      >
        <div
          data-slot="sidebar-gap"
          className={cn(
            "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180",
            padded
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
          )}
        />
        <div
          data-slot="sidebar-container"
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            padded
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
              : "border-border group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className="flex h-full w-full flex-col bg-muted/40 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-border group-data-[variant=floating]:bg-background group-data-[variant=floating]:shadow-sm"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

/** Icon button that toggles the sidebar (opens the Sheet on phones). */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar, isMobile, open, openMobile } = useSidebar();
    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        data-slot="sidebar-trigger"
        variant="ghost"
        size="icon"
        aria-expanded={isMobile ? openMobile : open}
        className={cn("size-7", className)}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft className="size-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

/** Thin hit area on the sidebar's edge that toggles it (mouse only; not in the tab order). */
export const SidebarRail = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        data-sidebar="rail"
        data-slot="sidebar-rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-muted",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

/** The page area beside the sidebar (a `<main>`). With `variant="inset"` it becomes a rounded card. */
export const SidebarInset = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full min-w-0 flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  ),
);
SidebarInset.displayName = "SidebarInset";

/** Compact search/filter field for the sidebar header. */
export const SidebarInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    data-slot="sidebar-input"
    data-sidebar="input"
    className={cn("h-8 w-full bg-background shadow-none", className)}
    {...props}
  />
));
SidebarInput.displayName = "SidebarInput";

const section = (slot: string, name: string, base: string) => {
  const C = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} data-slot={`sidebar-${slot}`} data-sidebar={slot} className={cn(base, className)} {...props} />
  ));
  C.displayName = name;
  return C;
};

/** Top area (brand, workspace switcher, search). */
export const SidebarHeader = section("header", "SidebarHeader", "flex flex-col gap-2 p-2");
/** Bottom area (account, settings). */
export const SidebarFooter = section("footer", "SidebarFooter", "flex flex-col gap-2 p-2");
/** Scrollable middle area holding SidebarGroups. */
export const SidebarContent = section(
  "content",
  "SidebarContent",
  "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
);
/** A titled section of the sidebar. */
export const SidebarGroup = section("group", "SidebarGroup", "relative flex w-full min-w-0 flex-col p-2");
/** The body of a SidebarGroup. */
export const SidebarGroupContent = section("group-content", "SidebarGroupContent", "w-full text-sm");

/** Hairline between sidebar sections. */
export const SidebarSeparator = React.forwardRef<HTMLDivElement, SeparatorProps>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    data-slot="sidebar-separator"
    data-sidebar="separator"
    className={cn("mx-2 w-auto bg-border", className)}
    {...props}
  />
));
SidebarSeparator.displayName = "SidebarSeparator";

export interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the child element (e.g. a CollapsibleTrigger) instead of a div. */
  asChild?: boolean;
}

/** Small heading for a SidebarGroup; hidden when collapsed to icons. */
export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = (asChild ? Slot : "div") as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="sidebar-group-label"
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none ring-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export interface SidebarActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child element instead of a button. */
  asChild?: boolean;
}

/** Small icon button in a group's header (e.g. "Add project"). Give it an aria-label. */
export const SidebarGroupAction = React.forwardRef<HTMLButtonElement, SidebarActionProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="sidebar-group-action"
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-none ring-ring transition-transform hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 md:after:hidden",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarGroupAction.displayName = "SidebarGroupAction";

/** A list of navigation items. */
export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

/** One entry in a SidebarMenu (an `<li>`). */
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export type SidebarMenuButtonVariant = "default" | "outline";
export type SidebarMenuButtonSize = "default" | "sm" | "lg";

const menuButtonBase =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-ring transition-[width,height,padding] group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:hover:text-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0";
const menuButtonVariants: Record<SidebarMenuButtonVariant, string> = {
  default: "hover:bg-accent hover:text-accent-foreground",
  outline: "bg-background shadow-[0_0_0_1px_hsl(var(--nx-border))] hover:bg-accent hover:text-accent-foreground",
};
const menuButtonSizes: Record<SidebarMenuButtonSize, string> = {
  default: "h-8 text-sm",
  sm: "h-7 text-xs",
  lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
};

/** Class string for a sidebar menu button, for building your own (e.g. a dropdown trigger). */
export function sidebarMenuButtonVariants({
  variant = "default",
  size = "default",
  className,
}: { variant?: SidebarMenuButtonVariant; size?: SidebarMenuButtonSize; className?: string } = {}) {
  return cn(menuButtonBase, menuButtonVariants[variant], menuButtonSizes[size], className);
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child (an `<a>` or router Link) with button styles. */
  asChild?: boolean;
  /** Highlights the current page. Also sets aria-current="page". */
  isActive?: boolean;
  variant?: SidebarMenuButtonVariant;
  size?: SidebarMenuButtonSize;
  /** Label shown beside the button when the sidebar is collapsed to icons. */
  tooltip?: React.ReactNode;
}

/** The clickable row of a SidebarMenuItem: icon + label. Use asChild to render a link. */
export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
    const { isMobile, state } = useSidebar();
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    const tipId = React.useId();
    const [tipAt, setTipAt] = React.useState<{ top: number; left: number } | null>(null);
    const showTip = !!tooltip && state === "collapsed" && !isMobile;
    // Fixed positioning escapes the collapsed rail's overflow-hidden content area.
    const place = (e: React.SyntheticEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setTipAt({ top: r.top + r.height / 2, left: r.right + 8 });
    };
    const button = (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        aria-current={isActive ? "page" : undefined}
        aria-describedby={showTip && tipAt ? tipId : undefined}
        className={sidebarMenuButtonVariants({ variant, size, className })}
        {...props}
        {...(showTip
          ? {
              onPointerEnter: (e: React.PointerEvent<HTMLElement>) => (props.onPointerEnter?.(e as never), place(e)),
              onPointerLeave: (e: React.PointerEvent<HTMLElement>) => (props.onPointerLeave?.(e as never), setTipAt(null)),
              onFocus: (e: React.FocusEvent<HTMLElement>) => (props.onFocus?.(e as never), place(e)),
              onBlur: (e: React.FocusEvent<HTMLElement>) => (props.onBlur?.(e as never), setTipAt(null)),
            }
          : {})}
      />
    );
    if (!showTip) return button;
    return (
      <>
        {button}
        <span
          id={tipId}
          role="tooltip"
          hidden={!tipAt}
          style={tipAt ?? undefined}
          className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1.5 text-xs text-background shadow-md animate-nx-fade-in"
        >
          {tooltip}
        </span>
      </>
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export interface SidebarMenuActionProps extends SidebarActionProps {
  /** Only show while the item is hovered or focused (desktop). */
  showOnHover?: boolean;
}

/** Icon button at the end of a menu item (e.g. "More"). Give it an aria-label. */
export const SidebarMenuAction = React.forwardRef<HTMLButtonElement, SidebarMenuActionProps>(
  ({ asChild = false, showOnHover = false, className, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="sidebar-menu-action"
        data-sidebar="menu-action"
        className={cn(
          "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-none ring-ring transition-transform hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 md:after:hidden",
          "peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          showOnHover &&
            "peer-data-[active=true]/menu-button:text-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarMenuAction.displayName = "SidebarMenuAction";

/** A count at the end of a menu item (e.g. unread items). */
export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-foreground",
        "peer-hover/menu-button:text-accent-foreground peer-data-[active=true]/menu-button:text-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

export interface SidebarMenuSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show an icon placeholder. */
  showIcon?: boolean;
}

/** Loading placeholder for a menu item. */
export const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, SidebarMenuSkeletonProps>(
  ({ showIcon = false, className, ...props }, ref) => {
    // A stable width between 50% and 90%, varied per item.
    const id = React.useId();
    const width = `${50 + ([...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 40)}%`;
    return (
      <div
        ref={ref}
        data-slot="sidebar-menu-skeleton"
        data-sidebar="menu-skeleton"
        className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
        {...props}
      >
        {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
        <Skeleton className="h-4 flex-1" style={{ maxWidth: width }} data-sidebar="menu-skeleton-text" />
      </div>
    );
  },
);
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

/** A nested list under a menu item. */
export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

/** One entry in a SidebarMenuSub. */
export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />
  ),
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

export interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child (e.g. a router Link) instead of an `<a>`. */
  asChild?: boolean;
  size?: "sm" | "md";
  /** Highlights the current page. Also sets aria-current="page". */
  isActive?: boolean;
}

/** The link of a SidebarMenuSubItem. */
export const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, SidebarMenuSubButtonProps>(
  ({ asChild = false, size = "md", isActive = false, className, ...props }, ref) => {
    const Comp = (asChild ? Slot : "a") as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="sidebar-menu-sub-button"
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-foreground outline-none ring-ring hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-accent-foreground",
          "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
          size === "sm" ? "text-xs" : "text-sm",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
