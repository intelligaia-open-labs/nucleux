import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@nucleux/utils";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface SelectContextValue {
  value: string | undefined;
  select: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  required: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
  labels: Map<string, React.ReactNode>;
  registerLabel: (value: string, label: React.ReactNode) => void;
}
const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect(component: string) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Select>`);
  return ctx;
}

export interface SelectProps {
  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Whether the list is open (controlled). */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the whole select. */
  disabled?: boolean;
  /** Mark as required in forms. */
  required?: boolean;
  /** Form field name; when set, the value is submitted with the form. */
  name?: string;
  children: React.ReactNode;
}

/**
 * A custom select: a trigger button showing the chosen option and a listbox of
 * SelectItems. Compose SelectTrigger (with SelectValue) and SelectContent.
 * Keyboard: Arrow keys, Home/End and typing a letter move between options;
 * Enter or Space chooses; Escape closes and returns focus to the trigger.
 * For a plain native `<select>`, use NativeSelect.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  required = false,
  name,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentValue = value !== undefined ? value : internalValue;
  const isOpen = open !== undefined ? open : internalOpen;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentId = React.useId();
  const [labels, setLabels] = React.useState<Map<string, React.ReactNode>>(() => new Map());

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );
  const select = React.useCallback(
    (next: string) => {
      if (value === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );
  const registerLabel = React.useCallback((v: string, label: React.ReactNode) => {
    setLabels((prev) => (prev.get(v) === label ? prev : new Map(prev).set(v, label)));
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen, setOpen]);

  return (
    <SelectContext.Provider
      value={{ value: currentValue, select, open: isOpen, setOpen, disabled, required, triggerRef, contentId, labels, registerLabel }}
    >
      <div ref={containerRef} className="relative inline-block w-full max-w-full" data-slot="select">
        {children}
        {name && <input type="hidden" name={name} value={currentValue ?? ""} />}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** "default" (h-9) or "sm" (h-8). */
  size?: "default" | "sm";
}

/** The button that shows the current value and opens the list. Put a SelectValue inside. */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ size = "default", className, children, onClick, onKeyDown, ...props }, ref) => {
    const { open, setOpen, disabled, required, triggerRef, contentId, value } = useSelect("SelectTrigger");
    return (
      <button
        ref={(node) => {
          (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={contentId}
        aria-required={required || undefined}
        disabled={disabled}
        data-slot="select-trigger"
        data-size={size}
        data-placeholder={value === undefined ? "" : undefined}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setOpen(!open);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || open) return;
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
          "data-[placeholder]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
          size === "sm" ? "h-8" : "h-9",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden className="size-4 opacity-50" />
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shown while nothing is selected. */
  placeholder?: React.ReactNode;
}

/** Shows the selected option's label (or the placeholder) inside SelectTrigger. */
export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { value, labels } = useSelect("SelectValue");
    return (
      <span ref={ref} data-slot="select-value" className={cn("truncate", className)} {...props}>
        {value !== undefined ? (labels.get(value) ?? value) : placeholder}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

const optionsOf = (list: HTMLElement) =>
  Array.from(list.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'));

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "popper" (default) places the list below the trigger, flipping above when there is no room. */
  position?: "popper" | "item-aligned";
  /** Horizontal alignment relative to the trigger. */
  align?: "start" | "center" | "end";
}

/**
 * The listbox of SelectItems. It stays mounted (hidden) while closed so the
 * trigger can show the chosen item's label.
 */
export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ position = "popper", align = "start", className, children, onKeyDown, ...props }, ref) => {
    const { open, setOpen, value, triggerRef, contentId } = useSelect("SelectContent");
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const typeahead = React.useRef({ text: "", timer: 0 as unknown as ReturnType<typeof setTimeout> });
    const [up, setUp] = React.useState(false);

    useIsomorphicLayoutEffect(() => {
      if (!open || !listRef.current || !triggerRef.current) return;
      const trigger = triggerRef.current.getBoundingClientRect();
      const { height } = listRef.current.getBoundingClientRect();
      setUp(trigger.bottom + 4 + height > window.innerHeight && trigger.top - 4 - height >= 0);
      const options = optionsOf(listRef.current);
      const selected = options.find((o) => o.dataset.value === value);
      (selected ?? options[0])?.focus();
    }, [open, value, triggerRef]);

    const close = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };

    return (
      <div
        ref={(node) => {
          listRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={contentId}
        role="listbox"
        tabIndex={-1}
        hidden={!open}
        data-slot="select-content"
        data-state={open ? "open" : "closed"}
        data-position={position}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || !listRef.current) return;
          const options = optionsOf(listRef.current);
          const i = options.indexOf(document.activeElement as HTMLElement);
          const focus = (n: number) => options[Math.max(0, Math.min(options.length - 1, n))]?.focus();
          if (e.key === "ArrowDown") (e.preventDefault(), focus(i + 1));
          else if (e.key === "ArrowUp") (e.preventDefault(), focus(i - 1));
          else if (e.key === "Home") (e.preventDefault(), focus(0));
          else if (e.key === "End") (e.preventDefault(), focus(options.length - 1));
          else if (e.key === "Escape") (e.preventDefault(), close());
          else if (e.key === "Tab") setOpen(false);
          else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && e.key !== " ") {
            const t = typeahead.current;
            clearTimeout(t.timer);
            t.text += e.key.toLowerCase();
            t.timer = setTimeout(() => (t.text = ""), 500);
            const start = i + (t.text.length === 1 ? 1 : 0);
            const ordered = [...options.slice(start), ...options.slice(0, start)];
            ordered.find((o) => (o.textContent ?? "").trim().toLowerCase().startsWith(t.text))?.focus();
          }
        }}
        className={cn(
          "absolute z-50 max-h-72 min-w-[8rem] w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-background p-1 text-foreground shadow-md outline-none animate-nx-fade-in",
          up ? "bottom-full mb-1" : "top-full mt-1",
          align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The value this option sets. */
  value: string;
  /** Not selectable. */
  disabled?: boolean;
  /** Plain-text label used in the trigger when the children are rich. */
  textValue?: string;
}

/** One option. Shows a check mark when selected. */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, disabled = false, textValue, className, children, onClick, onKeyDown, ...props }, ref) => {
    const { value: selected, select, setOpen, triggerRef, registerLabel } = useSelect("SelectItem");
    const isSelected = selected === value;
    React.useEffect(() => registerLabel(value, textValue ?? children), [value, textValue, children, registerLabel]);
    const choose = () => {
      if (disabled) return;
      select(value);
      setOpen(false);
      triggerRef.current?.focus();
    };
    return (
      <div
        ref={ref}
        role="option"
        tabIndex={-1}
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        data-slot="select-item"
        data-value={value}
        data-state={isSelected ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) choose();
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            choose();
          }
        }}
        onMouseMove={(e) => {
          if (!disabled && document.activeElement !== e.currentTarget) e.currentTarget.focus();
        }}
        className={cn(
          "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        <span className="absolute right-2 flex size-3.5 items-center justify-center" aria-hidden>
          {isSelected && <Check className="size-4" />}
        </span>
        <span className="flex items-center gap-2">{children}</span>
      </div>
    );
  },
);
SelectItem.displayName = "SelectItem";

/** Groups related options; pair with SelectLabel. */
export const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} role="group" data-slot="select-group" {...props} />,
);
SelectGroup.displayName = "SelectGroup";

/** Non-selectable heading for a SelectGroup. */
export const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="select-label" className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)} {...props} />
  ),
);
SelectLabel.displayName = "SelectLabel";

/** Hairline between groups (decorative: a listbox may only contain options and groups). */
export const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} aria-hidden data-slot="select-separator" className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)} {...props} />
  ),
);
SelectSeparator.displayName = "SelectSeparator";

/**
 * Kept for shadcn API parity. Nucleux's SelectContent scrolls natively, so
 * these render a small static affordance only when given children.
 */
export const SelectScrollUpButton = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
  children ? (
    <div data-slot="select-scroll-up-button" className={cn("flex items-center justify-center py-1", className)} {...props}>
      {children}
    </div>
  ) : null;
SelectScrollUpButton.displayName = "SelectScrollUpButton";

/** See SelectScrollUpButton. */
export const SelectScrollDownButton = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
  children ? (
    <div data-slot="select-scroll-down-button" className={cn("flex items-center justify-center py-1", className)} {...props}>
      {children}
    </div>
  ) : null;
SelectScrollDownButton.displayName = "SelectScrollDownButton";
