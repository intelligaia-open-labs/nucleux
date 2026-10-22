import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";

/** Layout of the set, from the spec's variants. */
export type SuggestedPromptsVariant = "chip-row" | "card-list" | "contextual-tooltip" | "card-grid";

/** Colour of a card-grid prompt's icon tile and category tag. */
export type SuggestedPromptTone = "brand" | "info" | "success" | "warning" | "destructive";

/** What happens to the set after a suggestion is chosen. */
export type SuggestedPromptsAfterSelect = "keep" | "mark" | "remove";

/** A suggestion as data: a short title and, optionally, the fuller prompt it stands for. */
export interface SuggestedPromptItem {
  /** Stable id. Defaults to `prompt ?? title`. */
  id?: string;
  /** The short, scannable action ("Find unresolved decisions"). */
  title: string;
  /** The fuller prompt placed in the composer. Defaults to `title`. */
  prompt?: string;
  /** One supporting line (shown in the card list). */
  description?: string;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** A short category under the prompt in the card grid ("Ideation", "Code"). */
  tag?: string;
  /** Colour of the card grid's icon tile and tag. Defaults to `"brand"`. */
  tone?: SuggestedPromptTone;
}

const toneTile: Record<SuggestedPromptTone, string> = {
  brand: "bg-brand/15 text-brand",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};
const toneText: Record<SuggestedPromptTone, string> = {
  brand: "text-brand",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const VariantContext = React.createContext<SuggestedPromptsVariant>("chip-row");

const promptClasses: Record<SuggestedPromptsVariant, string> = {
  "chip-row":
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-accent [&_svg]:size-4",
  "card-list":
    "flex w-full items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm hover:bg-accent [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:text-brand",
  "contextual-tooltip":
    "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-background hover:bg-background/15 [&_svg]:size-3.5",
  "card-grid":
    "flex h-full w-full items-start gap-2.5 rounded-xl border-[1.5px] border-border bg-muted/40 p-2.5 text-left transition hover:-translate-y-px hover:border-muted-foreground hover:bg-background hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
};

/** A single suggestion — a secondary-styled action button. */
export interface SuggestedPromptProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional classes merged onto the chip. */
  className?: string;
  /** Button type. Defaults to "button". */
  type?: "button" | "submit" | "reset";
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Supporting line under the label (used by the card list). */
  description?: React.ReactNode;
  /** Marks the chosen suggestion (`aria-pressed`). */
  selected?: boolean;
  /** Category under the label (used by the card grid). */
  tag?: React.ReactNode;
  /** Colour of the card grid's icon tile and tag. Defaults to `"brand"`. */
  tone?: SuggestedPromptTone;
}

/**
 * One suggested prompt: a pill in a chip row, a titled card in a card list,
 * or a compact action inside a contextual tooltip, depending on the
 * surrounding SuggestedPrompts' `variant`. It is a plain button, so it is
 * keyboard reachable; `selected` marks the chosen one with `aria-pressed`.
 */
export const SuggestedPrompt = React.forwardRef<HTMLButtonElement, SuggestedPromptProps>(
  ({ type = "button", icon, description, selected, tag, tone = "brand", className, children, ...props }, ref) => {
    const variant = React.useContext(VariantContext);
    if (variant === "card-grid") {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={selected === undefined ? undefined : selected}
          data-state={selected ? "selected" : undefined}
          className={cn(
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            promptClasses["card-grid"],
            selected && "border-foreground bg-background shadow-sm",
            className,
          )}
          {...props}
        >
          {icon && (
            <span
              aria-hidden="true"
              className={cn("mt-px grid size-6 shrink-0 place-items-center rounded-md [&_svg]:size-3", toneTile[tone])}
            >
              {icon}
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="text-xs leading-4 text-foreground">{children}</span>
            {description != null && <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>}
            {tag != null && (
              <span className={cn("mt-1 text-[0.625rem] font-bold uppercase tracking-[0.07em]", toneText[tone])}>
                {tag}
              </span>
            )}
          </span>
        </button>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected === undefined ? undefined : selected}
        data-state={selected ? "selected" : undefined}
        className={cn(
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          promptClasses[variant],
          selected && variant !== "contextual-tooltip" && "border-brand/40 bg-brand-muted text-foreground",
          className,
        )}
        {...props}
      >
        {icon}
        {description != null && variant === "card-list" ? (
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-semibold text-foreground">{children}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);
SuggestedPrompt.displayName = "SuggestedPrompt";

export interface SuggestedPromptsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Convenience: render a suggestion per item and call `onSelect` on click. Strings or {@link SuggestedPromptItem}s. */
  items?: Array<string | SuggestedPromptItem>;
  /**
   * Called with the prompt text (the item's `prompt`, else its title) and the
   * item. Place it in the composer as editable text — never send it.
   */
  onSelect?: (value: string, item: SuggestedPromptItem) => void;
  /** "chip-row" (default), "card-list" or "contextual-tooltip". */
  variant?: SuggestedPromptsVariant;
  /** A short lead shown before the set ("Try asking:"); also names the list. */
  label?: React.ReactNode;
  /** The most items shown. Defaults to 5 (the spec's 3–5 cap). */
  max?: number;
  /**
   * After a choice: "keep" (default) leaves the set as is, "mark" keeps the
   * others in view with the chosen one marked, "remove" removes the chosen one.
   */
  afterSelect?: SuggestedPromptsAfterSelect;
  /** Controlled chosen item (its id) for `afterSelect="mark"`. */
  selectedId?: string | null;
  /** Shows a dismiss button (contextual tooltip) and is called when it is pressed or Escape is hit. */
  onDismiss?: () => void;
  /** Content at the end of the label row, e.g. a "Preset action" badge. */
  aside?: React.ReactNode;
}

const toItem = (item: string | SuggestedPromptItem): SuggestedPromptItem =>
  typeof item === "string" ? { title: item } : item;
const itemId = (item: SuggestedPromptItem) => item.id ?? item.prompt ?? item.title;

/**
 * A small set of ready-made prompts that answers "what do I type?" without
 * blocking free-form input. Pass `items` (capped at `max`, 5 by default,
 * ranked by the app) and `onSelect`, or compose {@link SuggestedPrompt}
 * children. `variant` picks a chip row, a card list with a supporting line
 * per prompt, a two-column card grid with a tinted icon tile and a category
 * tag per prompt (`tag`, `tone`), or a contextual tooltip that floats by a selection. With
 * `items` the set is a labelled list; `afterSelect` keeps, marks or removes
 * the chosen prompt.
 */
export const SuggestedPrompts = React.forwardRef<HTMLDivElement, SuggestedPromptsProps>(
  (
    {
      items,
      onSelect,
      variant = "chip-row",
      label,
      max = 5,
      afterSelect = "keep",
      selectedId: selectedIdProp,
      onDismiss,
      aside,
      className,
      children,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const [removed, setRemoved] = React.useState<string[]>([]);
    const [internalSelected, setInternalSelected] = React.useState<string | null>(null);
    const selectedId = selectedIdProp !== undefined ? selectedIdProp : internalSelected;

    const list = items
      ?.map(toItem)
      .filter((item) => !removed.includes(itemId(item)))
      .slice(0, Math.max(0, max));

    const choose = (item: SuggestedPromptItem) => {
      const id = itemId(item);
      if (afterSelect === "remove") setRemoved((r) => [...r, id]);
      if (afterSelect === "mark") setInternalSelected(id);
      onSelect?.(item.prompt ?? item.title, item);
    };

    const isTooltip = variant === "contextual-tooltip";
    const isGrid = variant === "card-grid";
    const labelText =
      label != null ? (
        <span
          id={labelId}
          className={cn(
            isTooltip
              ? "sr-only"
              : isGrid
                ? "text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground"
                : "text-sm text-muted-foreground",
            variant === "chip-row" && "self-center",
          )}
        >
          {label}
        </span>
      ) : null;
    const labelNode =
      aside != null && !isTooltip ? (
        <div className="flex w-full items-center justify-between gap-2">
          {labelText ?? <span />}
          {aside}
        </div>
      ) : (
        labelText
      );

    const content = list ? (
      <ul
        role="list"
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label != null ? undefined : "Suggested prompts"}
        className={cn(
          "m-0 list-none p-0",
          variant === "chip-row" && "flex flex-wrap gap-2",
          variant === "card-list" && "flex flex-col gap-1.5",
          isGrid && "grid grid-cols-1 gap-2 sm:grid-cols-2",
          isTooltip && "flex flex-wrap items-center gap-1",
        )}
      >
        {list.map((item) => {
          const id = itemId(item);
          return (
            <li key={id}>
              <SuggestedPrompt
                icon={item.icon ?? (isTooltip ? <Sparkles aria-hidden="true" /> : undefined)}
                description={item.description}
                tag={item.tag}
                tone={item.tone}
                selected={afterSelect === "mark" ? selectedId === id : undefined}
                onClick={() => choose(item)}
              >
                {item.title}
              </SuggestedPrompt>
            </li>
          );
        })}
      </ul>
    ) : (
      children
    );

    return (
      <VariantContext.Provider value={variant}>
        <div
          ref={ref}
          role={isTooltip ? "group" : undefined}
          aria-label={isTooltip && label == null ? "Suggestion" : undefined}
          aria-labelledby={isTooltip && label != null ? labelId : undefined}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (onDismiss && e.key === "Escape") onDismiss();
          }}
          className={cn(
            variant === "chip-row" && "flex flex-wrap items-center gap-2",
            variant === "card-list" && "flex flex-col gap-2",
            isGrid && "flex flex-col gap-2.5",
            isTooltip &&
              "relative inline-flex items-center gap-1 rounded-lg bg-foreground px-2 py-1.5 text-background shadow-md animate-nx-fade-in motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          {labelNode}
          {content}
          {isTooltip && onDismiss && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss suggestion"
              onClick={onDismiss}
              className="size-6 text-background hover:bg-background/15 [&_svg]:size-3.5"
            >
              <X aria-hidden="true" />
            </Button>
          )}
          {isTooltip && (
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-4 size-2 rotate-45 bg-foreground"
            />
          )}
        </div>
      </VariantContext.Provider>
    );
  },
);
SuggestedPrompts.displayName = "SuggestedPrompts";
