import * as React from "react";
import { cn } from "@nucleux/utils";

export type Md3ButtonGroupVariant = "standard" | "connected";
export type Md3ButtonGroupSize = "xs" | "sm" | "md" | "lg" | "xl";
export type Md3ButtonGroupShape = "round" | "square";
export type Md3ButtonGroupSelectionMode = "none" | "single" | "multiple";
export type Md3ButtonGroupItemVariant = "filled" | "tonal" | "elevated" | "outlined" | "text";

interface ButtonGroupContextValue {
  variant: Md3ButtonGroupVariant;
  size: Md3ButtonGroupSize;
  shape: Md3ButtonGroupShape;
  buttonVariant: Md3ButtonGroupItemVariant;
  selectable: boolean;
  value: string[];
  toggle: (v: string) => void;
}
const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(null);

export interface Md3ButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** `standard` keeps each button's own shape; `connected` joins them with 2px gaps and small inner corners. */
  variant?: Md3ButtonGroupVariant;
  /** Button size applied to every item: XS 32px, S 40px, M 56px, L 96px, XL 136px tall. */
  size?: Md3ButtonGroupSize;
  /** Default shape of the buttons. Selected toggle buttons morph to the other shape. */
  shape?: Md3ButtonGroupShape;
  /** Colour style applied to items that don't set their own `variant`. */
  buttonVariant?: Md3ButtonGroupItemVariant;
  /** `none` for plain action buttons, `single`/`multiple` to make items with a `value` toggle. */
  selectionMode?: Md3ButtonGroupSelectionMode;
  /** When true, the last selected item can't be deselected. */
  selectionRequired?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  /** Called with a string in `single` mode ("" when cleared) and a string array in `multiple` mode. */
  onValueChange?: (value: string | string[]) => void;
}

const asArray = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const gaps: Record<Md3ButtonGroupSize, string> = {
  xs: "gap-[18px]",
  sm: "gap-3",
  md: "gap-2",
  lg: "gap-2",
  xl: "gap-2",
};

/**
 * A Material 3 Expressive button group: an invisible container that spaces related
 * buttons and adjusts their shape. The `standard` variant keeps each button's shape
 * and widens a button while it is pressed; the `connected` variant (the successor to
 * segmented buttons) joins buttons with 2px gaps, small inner corners and fully
 * rounded outer corners. Set `selectionMode` to turn items with a `value` into
 * single- or multi-select toggle buttons whose shape morphs when selected.
 * Compose with Md3ButtonGroupItem.
 */
export const Md3ButtonGroup = React.forwardRef<HTMLDivElement, Md3ButtonGroupProps>(
  (
    {
      variant = "standard",
      size = "sm",
      shape = "round",
      buttonVariant = "filled",
      selectionMode = "none",
      selectionRequired = false,
      value,
      defaultValue,
      onValueChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const multiple = selectionMode === "multiple";
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<string[]>(asArray(defaultValue));
    const current = isControlled ? asArray(value) : internal;

    const toggle = (v: string) => {
      let next: string[];
      if (multiple) next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      else next = current[0] === v ? [] : [v];
      if (selectionRequired && next.length === 0) return;
      if (!isControlled) setInternal(next);
      onValueChange?.(multiple ? next : (next[0] ?? ""));
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "font-md",
          "inline-flex items-center",
          variant === "connected" ? "gap-0.5" : gaps[size],
          className,
        )}
        {...props}
      >
        <ButtonGroupContext.Provider
          value={{
            variant,
            size,
            shape,
            buttonVariant,
            selectable: selectionMode !== "none",
            value: current,
            toggle,
          }}
        >
          {children}
        </ButtonGroupContext.Provider>
      </div>
    );
  },
);
Md3ButtonGroup.displayName = "Md3ButtonGroup";

export interface Md3ButtonGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Identifies the item for selection. Items without a value act as plain buttons. */
  value?: string;
  /** Colour style; defaults to the group's `buttonVariant`. */
  variant?: Md3ButtonGroupItemVariant;
  /** Leading icon. Pass an icon with no children (and an `aria-label`) for an icon button. */
  icon?: React.ReactNode;
}

const sizes: Record<
  Md3ButtonGroupSize,
  { base: string; label: string; labelPressed: string; iconOnly: string; iconOnlyPressed: string }
> = {
  xs: { base: "h-8 gap-1 text-sm [&_svg]:size-5", label: "px-3", labelPressed: "motion-safe:active:px-4", iconOnly: "w-8", iconOnlyPressed: "motion-safe:active:w-[37px]" },
  sm: { base: "h-10 gap-2 text-sm [&_svg]:size-5", label: "px-4", labelPressed: "motion-safe:active:px-5", iconOnly: "w-10", iconOnlyPressed: "motion-safe:active:w-[46px]" },
  md: { base: "h-14 gap-2 text-base [&_svg]:size-6", label: "px-6", labelPressed: "motion-safe:active:px-8", iconOnly: "w-14", iconOnlyPressed: "motion-safe:active:w-16" },
  lg: { base: "h-24 gap-3 text-2xl [&_svg]:size-8", label: "px-12", labelPressed: "motion-safe:active:px-14", iconOnly: "w-24", iconOnlyPressed: "motion-safe:active:w-[110px]" },
  xl: { base: "h-[136px] gap-4 text-[32px] [&_svg]:size-10", label: "px-16", labelPressed: "motion-safe:active:px-[72px]", iconOnly: "w-[136px]", iconOnlyPressed: "motion-safe:active:w-[156px]" },
};

const squareRadius: Record<Md3ButtonGroupSize, string> = {
  xs: "rounded-md-md",
  sm: "rounded-md-md",
  md: "rounded-md-lg",
  lg: "rounded-md-xl",
  xl: "rounded-md-xl",
};

const pressedRadius: Record<Md3ButtonGroupSize, string> = {
  xs: "active:rounded-md-sm",
  sm: "active:rounded-md-sm",
  md: "active:rounded-md-md",
  lg: "active:rounded-md-lg",
  xl: "active:rounded-md-lg",
};

const innerRadius: Record<Md3ButtonGroupSize, string> = {
  xs: "rounded-md-xs",
  sm: "rounded-md-sm",
  md: "rounded-md-sm",
  lg: "rounded-md-lg",
  xl: "rounded-[20px]",
};

const outerRadius: Record<Md3ButtonGroupShape, Record<Md3ButtonGroupSize, string>> = {
  round: {
    xs: "first:rounded-l-full last:rounded-r-full",
    sm: "first:rounded-l-full last:rounded-r-full",
    md: "first:rounded-l-full last:rounded-r-full",
    lg: "first:rounded-l-full last:rounded-r-full",
    xl: "first:rounded-l-full last:rounded-r-full",
  },
  square: {
    xs: "first:rounded-l-md-md last:rounded-r-md-md",
    sm: "first:rounded-l-md-md last:rounded-r-md-md",
    md: "first:rounded-l-md-lg last:rounded-r-md-lg",
    lg: "first:rounded-l-md-xl last:rounded-r-md-xl",
    xl: "first:rounded-l-md-xl last:rounded-r-md-xl",
  },
};

/** Colours for plain action buttons (same as Md3Button). */
const actionColors: Record<Md3ButtonGroupItemVariant, string> = {
  filled: "bg-md-primary text-md-on-primary hover:shadow-md-1",
  tonal: "bg-md-secondary-container text-md-on-secondary-container hover:shadow-md-1",
  elevated: "bg-md-surface-container-low text-md-primary shadow-md-1 hover:shadow-md-2",
  outlined: "border border-md-outline bg-transparent text-md-primary",
  text: "bg-transparent text-md-primary",
};

/** Colours for toggle buttons: [unselected, selected]. */
const toggleColors: Record<Md3ButtonGroupItemVariant, [string, string]> = {
  filled: ["bg-md-surface-container text-md-on-surface-variant", "bg-md-primary text-md-on-primary"],
  tonal: [
    "bg-md-secondary-container text-md-on-secondary-container",
    "bg-md-secondary text-md-on-secondary",
  ],
  elevated: [
    "bg-md-surface-container-low text-md-primary shadow-md-1 hover:shadow-md-2",
    "bg-md-primary text-md-on-primary shadow-md-1 hover:shadow-md-2",
  ],
  outlined: [
    "border border-md-outline-variant bg-transparent text-md-on-surface-variant",
    "border border-md-inverse-surface bg-md-inverse-surface text-md-inverse-on-surface",
  ],
  text: ["bg-transparent text-md-primary", "bg-md-secondary-container text-md-on-secondary-container"],
};

/**
 * A button inside a {@link Md3ButtonGroup}. Takes its size and shape from the group;
 * when the group is selectable and the item has a `value`, it is a toggle button
 * exposing `aria-pressed`. Icon-only items (an `icon` and no children) need an
 * `aria-label`.
 */
export const Md3ButtonGroupItem = React.forwardRef<HTMLButtonElement, Md3ButtonGroupItemProps>(
  ({ value, variant, icon, className, children, onClick, type = "button", ...props }, ref) => {
    const ctx = React.useContext(ButtonGroupContext);
    if (!ctx) throw new Error("Md3ButtonGroupItem must be used within a Md3ButtonGroup");
    const toggleable = ctx.selectable && value !== undefined;
    const selected = toggleable && ctx.value.includes(value);
    const iconOnly = icon != null && (children == null || children === false);
    const s = sizes[ctx.size];
    const colorVariant = variant ?? ctx.buttonVariant;

    let shapeClasses: string;
    if (ctx.variant === "connected") {
      shapeClasses = selected ? "rounded-full" : cn(innerRadius[ctx.size], outerRadius[ctx.shape][ctx.size]);
    } else {
      // Selected toggle buttons morph between round and square.
      const round = (ctx.shape === "round") !== selected;
      shapeClasses = cn(round ? "rounded-full" : squareRadius[ctx.size], pressedRadius[ctx.size]);
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={toggleable ? selected : props["aria-pressed"]}
        data-state={toggleable ? (selected ? "on" : "off") : undefined}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented && toggleable) ctx.toggle(value);
        }}
        className={cn(
          "font-md",
          // Layout + typography
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-medium",
          s.base,
          iconOnly ? s.iconOnly : s.label,
          // Standard groups widen the pressed button (no movement under reduced motion)
          ctx.variant === "standard" && (iconOnly ? s.iconOnlyPressed : s.labelPressed),
          ctx.variant === "connected" && "flex-1",
          // Shape morph + colour change
          "transition-[border-radius,padding,width,background-color,color,box-shadow] duration-200 ease-out",
          "motion-reduce:transition-[background-color,color,box-shadow]",
          shapeClasses,
          toggleable ? toggleColors[colorVariant][selected ? 1 : 0] : actionColors[colorVariant],
          // State layer (Material 3): on-color overlay at 8% hover / 12% focus+press
          "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
          // Focus ring + disabled
          "outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
          "disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none",
          className,
        )}
        {...props}
      >
        {icon && <span className="relative inline-flex shrink-0">{icon}</span>}
        {!iconOnly && children != null && <span className="relative">{children}</span>}
      </button>
    );
  },
);
Md3ButtonGroupItem.displayName = "Md3ButtonGroupItem";
