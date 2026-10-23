import * as React from "react";
import { Md3IconButton, type Md3IconButtonProps } from "@nucleux/md3-icon-button";
import { cn } from "@nucleux/utils";

export type Md3ToolbarType = "docked" | "floating";
export type Md3ToolbarOrientation = "horizontal" | "vertical";
export type Md3ToolbarColor = "standard" | "vibrant";

interface ToolbarContextValue {
  color: Md3ToolbarColor;
}
const ToolbarContext = React.createContext<ToolbarContextValue>({ color: "standard" });

export interface Md3ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `docked` spans the width of its container (replaces the bottom app bar); `floating` is a pill above content. */
  type?: Md3ToolbarType;
  /** Layout of a floating toolbar. Docked toolbars are always horizontal. */
  orientation?: Md3ToolbarOrientation;
  /** `standard` uses surface-container; `vibrant` uses primary-container for more emphasis. */
  color?: Md3ToolbarColor;
  /** Whether arrow keys wrap from the last control to the first and back. */
  loop?: boolean;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const ITEM_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="combobox"]',
  "[data-md3-toolbar-item]",
].join(",");

/** Focusable controls of the toolbar, skipping disabled ones and anything inside a popup (menu, dialog, listbox). */
const getItems = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter((el) => {
    if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return false;
    if ((el as HTMLInputElement).type === "hidden") return false;
    const popup = el.parentElement?.closest('[role="menu"], [role="dialog"], [role="listbox"], [role="toolbar"]');
    return !popup || popup === root;
  });

const isTextEntry = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    (el.tagName === "INPUT" &&
      !["button", "checkbox", "radio", "submit", "reset", "image"].includes((el as HTMLInputElement).type)));

const containers: Record<Md3ToolbarColor, string> = {
  standard: "bg-md-surface-container text-md-on-surface-variant",
  vibrant: "bg-md-primary-container text-md-on-primary-container",
};

/**
 * A Material 3 Expressive toolbar for actions related to the current page. The
 * `docked` type spans the bottom (or top) of the screen at 64px tall and replaces
 * the bottom app bar; the `floating` type is an elevated, fully rounded container
 * that floats over content in a horizontal or vertical orientation and pairs well
 * with an Md3Fab placed beside it. Both come in standard and vibrant colours. It
 * implements the WAI-ARIA toolbar pattern: one Tab stop, with arrow keys (Left/Right,
 * or Up/Down when vertical), Home and End moving focus between its controls.
 * Give it an `aria-label`, and use Md3ToolbarIconButton for colour-matched icon buttons.
 */
export const Md3Toolbar = React.forwardRef<HTMLDivElement, Md3ToolbarProps>(
  (
    {
      type = "docked",
      orientation: orientationProp = "horizontal",
      color = "standard",
      loop = true,
      className,
      children,
      onKeyDown,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const orientation = type === "docked" ? "horizontal" : orientationProp;
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const active = React.useRef(0);

    // Roving tabindex: exactly one control is in the Tab order.
    const sync = React.useCallback(() => {
      const root = rootRef.current;
      if (!root) return;
      const items = getItems(root);
      if (items.length === 0) return;
      if (active.current >= items.length) active.current = items.length - 1;
      items.forEach((el, i) => {
        el.tabIndex = i === active.current ? 0 : -1;
      });
    }, []);

    useIsomorphicLayoutEffect(sync);

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || typeof MutationObserver === "undefined") return;
      const observer = new MutationObserver(sync);
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "aria-disabled"],
      });
      return () => observer.disconnect();
    }, [sync]);

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      const root = rootRef.current;
      if (!root) return;
      const index = getItems(root).indexOf(e.target as HTMLElement);
      if (index >= 0 && index !== active.current) {
        active.current = index;
        sync();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      const root = rootRef.current;
      if (e.defaultPrevented || !root) return;
      const items = getItems(root);
      const index = items.indexOf(e.target as HTMLElement);
      if (index < 0) return;

      const rtl = getComputedStyle(root).direction === "rtl";
      const horizontal = orientation === "horizontal";
      const nextKey = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
      const prevKey = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
      // Leave caret movement to text fields.
      if (horizontal && isTextEntry(e.target) && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;

      let next: number;
      if (e.key === nextKey) next = index + 1 >= items.length ? (loop ? 0 : index) : index + 1;
      else if (e.key === prevKey) next = index - 1 < 0 ? (loop ? items.length - 1 : index) : index - 1;
      else if (e.key === "Home" && !isTextEntry(e.target)) next = 0;
      else if (e.key === "End" && !isTextEntry(e.target)) next = items.length - 1;
      else return;

      e.preventDefault();
      active.current = next;
      sync();
      items[next].focus();
    };

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="toolbar"
        aria-orientation={orientation}
        data-type={type}
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={cn(
          "font-md",
          "flex items-center",
          containers[color],
          type === "docked" && "h-16 w-full justify-evenly gap-2 px-4",
          type === "floating" && "inline-flex gap-1 rounded-full shadow-md-3",
          type === "floating" && (orientation === "horizontal" ? "h-16 px-2" : "w-16 flex-col py-2"),
          className,
        )}
        {...props}
      >
        <ToolbarContext.Provider value={{ color }}>{children}</ToolbarContext.Provider>
      </div>
    );
  },
);
Md3Toolbar.displayName = "Md3Toolbar";

export type Md3ToolbarIconButtonProps = Omit<Md3IconButtonProps, "variant">;

const iconButtonColors: Record<Md3ToolbarColor, [string, string]> = {
  standard: ["text-md-on-surface-variant", "bg-md-secondary-container text-md-on-secondary-container"],
  vibrant: ["text-md-on-primary-container", "bg-md-surface-container text-md-on-surface"],
};

/**
 * An Md3IconButton coloured for the surrounding Md3Toolbar (standard or vibrant).
 * Set `selected` for a toggled action; it then shows a contrasting container and
 * exposes `aria-pressed`.
 */
export const Md3ToolbarIconButton = React.forwardRef<HTMLButtonElement, Md3ToolbarIconButtonProps>(
  ({ selected = false, className, ...props }, ref) => {
    const { color } = React.useContext(ToolbarContext);
    return (
      <Md3IconButton
        ref={ref}
        variant="standard"
        selected={selected}
        className={cn("font-md", "h-12 w-12", iconButtonColors[color][selected ? 1 : 0], className)}
        {...props}
      />
    );
  },
);
Md3ToolbarIconButton.displayName = "Md3ToolbarIconButton";
