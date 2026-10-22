import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";

/* ────────────────────────────────────────────────────────────
   Data + shared, non-visual logic (also used by @nucleux/md3-open-input)
   ──────────────────────────────────────────────────────────── */

/** One row of the Request settings menu: a setting that shapes the request (Mode, Tone, Style) or an action (Improve prompt). */
export interface RequestSettingsItem {
  /** Stable id passed to `onSelect`. The site's settings use "mode", "tone", "style" and "improve". */
  id: string;
  /** Row label, e.g. "Mode". */
  label: string;
  /** Leading 20px icon. */
  icon?: React.ReactNode;
  /** Current value shown on the right, e.g. "Plan" or "None". */
  value?: string;
  /** The setting is on: its value is emphasised, the control shows a dot and its name lists it. */
  set?: boolean;
  /** The row can't be chosen right now. */
  disabled?: boolean;
}

export interface RequestSettingsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The rows, in order (the site's order is Mode, Tone, Style, Improve prompt). */
  items: RequestSettingsItem[];
  /** Called with a row's id when it is chosen. The menu closes and focus returns to the control first. */
  onSelect?: (id: string) => void;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Initial menu state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the control and its menu. Defaults to "Request settings". */
  label?: string;
  /** Disables the control (e.g. while the agent works). */
  disabled?: boolean;
}

/** The site's order of request settings; rows with other ids keep their place after these. */
export const REQUEST_SETTINGS_ORDER = ["mode", "tone", "style", "improve"] as const;

/**
 * Merges a pattern's own row into the app's other settings: the own row
 * replaces any row with the same id, and the result follows the site's order
 * (Mode, Tone, Style, Improve prompt; other ids after, in their given order).
 */
export function mergeRequestSettingsItems(
  own: RequestSettingsItem,
  others: RequestSettingsItem[] = [],
): RequestSettingsItem[] {
  const all = [...others.filter((i) => i.id !== own.id), own];
  const rank = (id: string) => {
    const i = (REQUEST_SETTINGS_ORDER as readonly string[]).indexOf(id);
    return i < 0 ? REQUEST_SETTINGS_ORDER.length : i;
  };
  return all
    .map((item, i) => ({ item, i }))
    .sort((a, b) => rank(a.item.id) - rank(b.item.id) || a.i - b.i)
    .map((x) => x.item);
}

/** "Request settings" or "Request settings: Mode Plan, Tone Professional" — the labels and values of the rows that are set. */
export function requestSettingsLabel(label: string, items: RequestSettingsItem[]): string {
  const on = items.filter((i) => i.set).map((i) => (i.value ? `${i.label} ${i.value}` : i.label));
  return on.length ? `${label}: ${on.join(", ")}` : label;
}

/**
 * State, refs and keyboard model of the Request settings control, shared by
 * `RequestSettings` and `Md3RequestSettings`: controlled/uncontrolled open
 * state; opening moves focus to the first row; Arrow keys, Home and End move;
 * Enter/Space choose; Escape, Tab and an outside press close it, and Escape
 * (or an outside press while focus was in the menu) returns focus to the
 * control.
 */
export function useRequestSettings(
  { items, onSelect, open: openProp, defaultOpen = false, onOpenChange, label = "Request settings" }: RequestSettingsProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const latestOpen = React.useRef(open);
  latestOpen.current = open;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement);
  const menuId = `${React.useId()}-menu`;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  // Opening from the control moves focus to the first row (not on a default-open first render).
  const focusFirst = React.useRef(false);
  React.useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  const latestClose = React.useRef(setOpen);
  latestClose.current = setOpen;
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      const hadFocus = !!menuRef.current?.contains(document.activeElement);
      latestClose.current(false);
      if (hadFocus) buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const rows = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const list = rows();
    const i = list.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % list.length;
    else if (e.key === "ArrowUp") next = (i - 1 + list.length) % list.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = list.length - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
      return;
    } else if (e.key === "Tab") {
      close(false);
      return;
    }
    if (next < 0 || !list.length) return;
    e.preventDefault();
    list[next]?.focus();
  };

  const choose = (item: RequestSettingsItem) => {
    if (item.disabled) return;
    close(true);
    onSelect?.(item.id);
  };

  const anySet = items.some((i) => i.set);
  return {
    open,
    setOpen,
    rootRef,
    menuRef,
    anySet,
    label,
    name: requestSettingsLabel(label, items),
    buttonProps: {
      ref: buttonRef,
      type: "button" as const,
      "aria-haspopup": "menu" as const,
      "aria-expanded": open,
      "aria-controls": open ? menuId : undefined,
      onClick: () => {
        focusFirst.current = !latestOpen.current;
        setOpen(!latestOpen.current);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          focusFirst.current = true;
          if (!latestOpen.current) setOpen(true);
          else rows()[0]?.focus();
        }
      },
    },
    menuProps: {
      ref: menuRef,
      id: menuId,
      role: "menu" as const,
      "aria-label": label,
      onKeyDown: onMenuKeyDown,
    },
    itemProps: (item: RequestSettingsItem) => ({
      type: "button" as const,
      role: "menuitem" as const,
      "aria-haspopup": "dialog" as const,
      "aria-disabled": item.disabled || undefined,
      tabIndex: -1,
      onClick: () => choose(item),
    }),
  };
}

/* ────────────────────────────────────────────────────────────
   View
   ──────────────────────────────────────────────────────────── */

/**
 * The composer's Request settings control: one icon button (the tune icon)
 * placed right after +, whose menu lists how the request will be shaped —
 * Mode, Tone, Style — and Improve prompt, each row with its current value on
 * the right. None of them sits in the composer up front: a small dot on the
 * control and its accessible name ("Request settings: Mode Plan") say what is
 * on. Choosing a row closes the menu and calls `onSelect`, where the pattern
 * opens its own picker. The ref is the control's button, so a picker can
 * return focus to it.
 */
export const RequestSettings = React.forwardRef<HTMLButtonElement, RequestSettingsProps>((props, ref) => {
  const {
    items,
    onSelect: _onSelect,
    open: _open,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    label: _label,
    disabled,
    className,
    ...rest
  } = props;
  const rs = useRequestSettings(props, ref);
  return (
    <div ref={rs.rootRef} className={cn("relative inline-flex", className)} {...rest}>
      <Button
        {...rs.buttonProps}
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        aria-label={rs.name}
        className={cn("relative shrink-0 text-muted-foreground hover:text-foreground", rs.open && "bg-accent text-foreground")}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        {rs.anySet && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-1 top-1 size-2 rounded-full bg-primary ring-2 ring-background"
          />
        )}
      </Button>
      {rs.open && (
        <div
          {...rs.menuProps}
          className="absolute bottom-full left-0 z-50 mb-2 min-w-[15.5rem] rounded-lg border border-border bg-background p-1 text-left font-normal text-foreground shadow-md outline-none animate-nx-fade-in motion-reduce:animate-none"
        >
          {items.map((item) => (
            <button
              {...rs.itemProps(item)}
              key={item.id}
              className={cn(
                "flex w-full cursor-default select-none items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-accent focus:bg-accent motion-reduce:transition-none",
                item.disabled && "opacity-50 hover:bg-transparent",
              )}
            >
              <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center text-muted-foreground [&_svg]:size-4">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.value && (
                <span className={cn("ml-3 shrink-0 text-xs", item.set ? "font-semibold text-primary" : "text-muted-foreground")}>
                  {item.value}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
RequestSettings.displayName = "RequestSettings";
