import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import type {
  SuggestedPromptItem,
  SuggestedPromptProps,
  SuggestedPromptsAfterSelect,
  SuggestedPromptsProps,
  SuggestedPromptsVariant,
  SuggestedPromptTone,
} from "@nucleux/suggested-prompts";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3IconButton } from "@nucleux/md3-icon-button";

/** Props of {@link Md3SuggestedPrompts} — identical to `SuggestedPromptsProps`. */
export type Md3SuggestedPromptsProps = SuggestedPromptsProps;
/** Props of {@link Md3SuggestedPrompt} — identical to `SuggestedPromptProps`. */
export type Md3SuggestedPromptProps = SuggestedPromptProps;
/** "chip-row", "card-list", "contextual-tooltip" or "card-grid". */
export type Md3SuggestedPromptsVariant = SuggestedPromptsVariant;
/** Colour of a card-grid prompt's icon tile and tag. */
export type Md3SuggestedPromptTone = SuggestedPromptTone;
/** "keep", "mark" or "remove". */
export type Md3SuggestedPromptsAfterSelect = SuggestedPromptsAfterSelect;
export type { SuggestedPromptItem };

const VariantContext = React.createContext<SuggestedPromptsVariant>("chip-row");

// M3 has no warning/success roles: tones map onto the container roles.
const toneTile: Record<SuggestedPromptTone, string> = {
  brand: "bg-md-primary-container text-md-on-primary-container",
  info: "bg-md-secondary-container text-md-on-secondary-container",
  success: "bg-md-tertiary-container text-md-on-tertiary-container",
  warning: "bg-md-tertiary-container text-md-on-tertiary-container",
  destructive: "bg-md-error-container text-md-on-error-container",
};
const toneText: Record<SuggestedPromptTone, string> = {
  brand: "text-md-primary",
  info: "text-md-secondary",
  success: "text-md-tertiary",
  warning: "text-md-tertiary",
  destructive: "text-md-error",
};

const stateLayer =
  "before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.10] active:before:opacity-[0.10] motion-reduce:before:transition-none";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-md-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface";

/**
 * One Material 3 suggested prompt — the same API as `SuggestedPrompt`. In a
 * chip row it is an outlined M3 suggestion chip (`Md3Chip`, 32dp, small
 * corner, 18dp leading icon in primary) whose hover is a solid surface fill;
 * in a card list it is an outlined, actionable M3 card with a title and one
 * supporting line; in a contextual tooltip it is a compact text action. A
 * chosen prompt (`selected`) takes the secondary container and `aria-pressed`.
 */
export const Md3SuggestedPrompt = React.forwardRef<HTMLButtonElement, Md3SuggestedPromptProps>(
  ({ type = "button", icon, description, selected, tag, tone = "brand", className, children, ...props }, ref) => {
    const variant = React.useContext(VariantContext);
    // Md3Chip omits the DOM `onSelect` handler (it has no meaning on a button), so it is not forwarded to the chip.
    const { onSelect: _onSelect, ...chipProps } = props;
    const pressed = selected === undefined ? undefined : selected;
    const state = selected ? "selected" : undefined;

    if (variant === "chip-row") {
      return (
        <Md3Chip
          ref={ref}
          type={type}
          variant="suggestion"
          icon={icon}
          selected={!!selected}
          aria-pressed={pressed}
          data-state={state}
          className={cn(
            "h-auto min-h-8 max-w-full gap-2 whitespace-normal py-1.5 text-left tracking-[0.1px] transition-[background-color,border-color] duration-200 motion-reduce:transition-none",
            icon ? "pl-2 pr-4" : "px-4",
            selected
              ? "[&_svg]:text-md-on-secondary-container"
              : "border-md-outline-variant hover:bg-md-surface-container-high hover:before:opacity-0 focus-visible:before:opacity-[0.10] active:before:opacity-[0.10] [&_svg]:text-md-primary",
            className,
          )}
          {...chipProps}
        >
          {children}
        </Md3Chip>
      );
    }

    if (variant === "card-grid") {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={pressed}
          data-state={state}
          className={cn(
            "relative flex h-full w-full items-start gap-3 overflow-hidden rounded-md-md border p-3 text-left transition-colors duration-200 motion-reduce:transition-none",
            stateLayer,
            focusRing,
            selected
              ? "border-transparent bg-md-secondary-container text-md-on-secondary-container"
              : "border-md-outline-variant bg-md-surface text-md-on-surface",
            className,
          )}
          {...props}
        >
          {icon && (
            <span
              aria-hidden="true"
              className={cn("relative grid size-8 shrink-0 place-items-center rounded-md-sm [&_svg]:size-[18px]", toneTile[tone])}
            >
              {icon}
            </span>
          )}
          <span className="relative flex min-w-0 flex-col">
            <span className="text-sm font-medium leading-5 tracking-[0.1px]">{children}</span>
            {description != null && <span className="text-sm text-md-on-surface-variant">{description}</span>}
            {tag != null && (
              <span className={cn("mt-1 text-[11px] font-medium uppercase leading-4 tracking-[0.5px]", toneText[tone])}>
                {tag}
              </span>
            )}
          </span>
        </button>
      );
    }

    if (variant === "card-list") {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={pressed}
          data-state={state}
          className={cn(
            "relative flex w-full items-start gap-3 overflow-hidden rounded-md-md border px-4 py-3 text-left text-sm transition-colors duration-200 motion-reduce:transition-none [&_svg]:mt-0.5 [&_svg]:size-5 [&_svg]:shrink-0",
            stateLayer,
            focusRing,
            selected
              ? "border-transparent bg-md-secondary-container text-md-on-secondary-container [&_svg]:text-md-on-secondary-container"
              : "border-md-outline-variant bg-md-surface text-md-on-surface [&_svg]:text-md-primary",
            className,
          )}
          {...props}
        >
          {icon && <span className="relative flex">{icon}</span>}
          {description != null ? (
            <span className="relative flex min-w-0 flex-col gap-0.5">
              <span className="text-base font-medium leading-6 tracking-[0.15px]">{children}</span>
              <span className={cn("text-sm", selected ? "opacity-80" : "text-md-on-surface-variant")}>{description}</span>
            </span>
          ) : (
            <span className="relative text-base font-medium leading-6 tracking-[0.15px]">{children}</span>
          )}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={pressed}
        data-state={state}
        className={cn(
          "relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-full px-3 text-sm font-medium tracking-[0.1px] text-md-primary [&_svg]:size-[18px]",
          stateLayer,
          focusRing,
          className,
        )}
        {...props}
      >
        {icon && <span className="relative flex">{icon}</span>}
        <span className="relative">{children}</span>
      </button>
    );
  },
);
Md3SuggestedPrompt.displayName = "Md3SuggestedPrompt";

// Copied from @nucleux/suggested-prompts (internal there): normalise items and derive their ids.
const toItem = (item: string | SuggestedPromptItem): SuggestedPromptItem =>
  typeof item === "string" ? { title: item } : item;
const itemId = (item: SuggestedPromptItem) => item.id ?? item.prompt ?? item.title;

/**
 * The Material 3 set of ready-made prompts — the same API and behaviour as
 * `SuggestedPrompts`. Pass `items` (capped at `max`, 5 by default) and
 * `onSelect`, or compose {@link Md3SuggestedPrompt} children. The chip row
 * is a wrap of outlined M3 suggestion chips, the card list a stack of
 * outlined actionable cards with a supporting line, and the contextual tooltip
 * an M3 rich tooltip (surface container, medium corner, level-2 elevation)
 * that floats by a selection and dismisses on × or Escape. With `items` the
 * set is a labelled list; `afterSelect` keeps, marks (secondary container) or
 * removes the chosen prompt.
 */
export const Md3SuggestedPrompts = React.forwardRef<HTMLDivElement, Md3SuggestedPromptsProps>(
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
                ? "text-[11px] font-medium uppercase tracking-[0.5px] text-md-on-surface-variant"
                : "text-sm tracking-[0.25px] text-md-on-surface-variant",
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
          variant === "card-list" && "flex flex-col gap-2",
          isGrid && "grid grid-cols-1 gap-2 sm:grid-cols-2",
          isTooltip && "flex flex-wrap items-center gap-0.5",
        )}
      >
        {list.map((item) => {
          const id = itemId(item);
          return (
            <li key={id} className="max-w-full">
              <Md3SuggestedPrompt
                icon={item.icon ?? (isTooltip ? <Sparkles aria-hidden="true" /> : undefined)}
                description={item.description}
                tag={item.tag}
                tone={item.tone}
                selected={afterSelect === "mark" ? selectedId === id : undefined}
                onClick={() => choose(item)}
              >
                {item.title}
              </Md3SuggestedPrompt>
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
            isGrid && "flex flex-col gap-3",
            isTooltip &&
              "relative inline-flex items-center gap-1 rounded-md-md bg-md-surface-container px-1.5 py-1 text-md-on-surface-variant shadow-md-2 animate-nx-fade-in motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          {labelNode}
          {content}
          {isTooltip && onDismiss && (
            <Md3IconButton
              aria-label="Dismiss suggestion"
              onClick={onDismiss}
              className="size-8 [&_svg]:size-[18px]"
            >
              <X aria-hidden="true" />
            </Md3IconButton>
          )}
          {isTooltip && (
            <span aria-hidden="true" className="absolute -bottom-1 left-4 size-2 rotate-45 bg-md-surface-container" />
          )}
        </div>
      </VariantContext.Provider>
    );
  },
);
Md3SuggestedPrompts.displayName = "Md3SuggestedPrompts";
