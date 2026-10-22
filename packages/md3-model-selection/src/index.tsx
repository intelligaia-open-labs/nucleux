import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Radio, Md3RadioGroup } from "@nucleux/md3-radio";
import { Md3Switch } from "@nucleux/md3-switch";
import { Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import type {
  ModelOption,
  ModelSelectionPicker,
  ModelSelectionProps,
  ModelSelectionTrigger,
  ModelSelectionVariant,
} from "@nucleux/model-selection";

/** Same props as `ModelSelection` from `@nucleux/model-selection` — switch families by changing the import. */
export type Md3ModelSelectionProps = ModelSelectionProps;
/** Same variants as the shadcn twin: `"dropdown"`, `"tradeoff"`, `"auto-route"`. */
export type Md3ModelSelectionVariant = ModelSelectionVariant;
/** Same trigger styles as the twin: `"button"` or the composer's `"chip"` (`Md3OpenInputModelChip`, "Balanced High"). */
export type Md3ModelSelectionTrigger = ModelSelectionTrigger;
/** Same auto-route pickers as the twin: `"dropdown"` or `"list"`. */
export type Md3ModelSelectionPicker = ModelSelectionPicker;
export type { ModelOption };

/** "Fastest · Best quality" from whichever tradeoff facts are given (same as the twin). */
function tradeoffLine(m: ModelOption): React.ReactNode {
  const parts = [m.speed, m.quality].filter((p) => p != null && p !== "");
  if (!parts.length) return null;
  return parts.map((p, i) => (
    <React.Fragment key={i}>
      {i > 0 && " · "}
      {p}
    </React.Fragment>
  ));
}

/** A tag, not a colour: the recommendation reads in words (M3 label-small, outlined, small shape). */
const RecommendedTag = () => (
  <span className="inline-flex h-5 items-center rounded-md-xs border border-md-outline-variant px-1.5 text-[11px] font-medium leading-4 tracking-[0.5px] text-md-primary">
    Recommended
  </span>
);

interface PickerProps {
  models: ModelOption[];
  current: string | undefined;
  select: (value: string) => void;
  label: string;
  className?: string;
  trigger?: ModelSelectionTrigger;
  triggerDetail?: React.ReactNode;
  menuSide?: "top" | "bottom";
}

/** The composer-anchored M3 menu (listbox) used by the "dropdown" and "auto-route" variants. */
function Md3ModelDropdown({ models, current, select, label, className, trigger = "button", triggerDetail, menuSide = "bottom" }: PickerProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  const close = React.useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const options = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);

  // Focus the selected option (or the first available) when the menu opens.
  React.useEffect(() => {
    if (!open) return;
    const all = options();
    (all.find((o) => o.getAttribute("aria-selected") === "true") ?? all[0])?.focus();
  }, [open]);

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const all = options();
    const i = all.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => all[(n + all.length) % all.length]?.focus();
    if (e.key === "ArrowDown") (e.preventDefault(), go(i + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), go(i - 1));
    else if (e.key === "Home") (e.preventDefault(), go(0));
    else if (e.key === "End") (e.preventDefault(), go(all.length - 1));
    else if (e.key === "Tab") close(false);
  };

  const selected = models.find((m) => m.value === current);
  const triggerProps = {
    // The chip shows the model, so its name carries it too ("Model: Balanced").
    "aria-label": trigger === "chip" && typeof selected?.label === "string" ? `${label}: ${selected.label}` : label,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    onClick: () => setOpen((o) => !o),
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
        e.preventDefault();
        setOpen(true);
      }
    },
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {trigger === "chip" ? (
        <Md3OpenInputModelChip
          ref={triggerRef}
          name={selected?.label ?? "Select model"}
          detail={triggerDetail}
          {...triggerProps}
        />
      ) : (
        <Md3Button
          ref={triggerRef}
          variant="text"
          icon={<Sparkles aria-hidden="true" />}
          {...triggerProps}
          className="h-8 gap-1.5 [&_svg]:size-4"
        >
          <span className="inline-flex items-center gap-1">
            {selected?.label ?? "Select model"}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "text-md-on-surface-variant transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </span>
        </Md3Button>
      )}
      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKeyDown}
          className={cn(
            "absolute z-50 flex min-w-[17.5rem] max-w-[22rem] flex-col rounded-md-xs bg-md-surface-container py-2 text-md-on-surface shadow-md-2 animate-nx-fade-in motion-reduce:animate-none",
            menuSide === "top" ? "bottom-full mb-1" : "top-full mt-1",
            trigger === "chip" && "right-0 w-[20rem]",
          )}
        >
          {models.map((model) => {
            const active = model.value === current;
            const line = tradeoffLine(model);
            return (
              <button
                key={model.value}
                type="button"
                role="option"
                aria-selected={active}
                aria-disabled={model.disabled || undefined}
                tabIndex={-1}
                onClick={() => {
                  if (model.disabled) return;
                  select(model.value);
                  close(true);
                }}
                className={cn(
                  "relative flex min-h-12 w-full items-start gap-3 overflow-hidden px-3 py-2.5 text-left outline-none",
                  "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] motion-reduce:before:transition-none",
                  active && "bg-md-secondary-container text-md-on-secondary-container",
                  model.disabled
                    ? "cursor-not-allowed"
                    : "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
                )}
              >
                <span
                  className={cn(
                    "relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center [&_svg]:size-5",
                    active ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
                    model.disabled && "opacity-[0.38]",
                  )}
                >
                  {active ? <Check aria-hidden="true" /> : model.icon}
                </span>
                <span className="relative flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "flex flex-wrap items-center gap-2 text-sm font-medium leading-5 tracking-[0.1px]",
                      model.disabled && "opacity-[0.38]",
                    )}
                  >
                    {model.label}
                    {model.recommended && <RecommendedTag />}
                  </span>
                  {model.description && (
                    <span
                      className={cn(
                        "text-xs leading-4 tracking-[0.4px]",
                        active ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
                        model.disabled && "opacity-[0.38]",
                      )}
                    >
                      {model.description}
                    </span>
                  )}
                  {line && (
                    <span
                      className={cn(
                        "text-xs leading-4 tracking-[0.4px]",
                        active ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
                        model.disabled && "opacity-[0.38]",
                      )}
                    >
                      {line}
                    </span>
                  )}
                  {model.disabled && model.unavailableReason && (
                    <span className="mt-0.5 text-xs leading-4 tracking-[0.4px] text-md-on-surface">
                      {model.unavailableReason}
                    </span>
                  )}
                </span>
                {model.cost && (
                  <span
                    className={cn(
                      "relative shrink-0 text-xs font-medium leading-4 text-md-on-surface-variant",
                      model.disabled && "opacity-[0.38]",
                    )}
                  >
                    {model.cost}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ListProps extends PickerProps {
  headingId: string;
}

/** The tradeoff list: outlined M3 radio cards, the chosen one on secondary-container. */
function Md3ModelList({ models, current, select, label, headingId }: ListProps) {
  return (
    <>
      <p id={headingId} className="sr-only">
        {label}
      </p>
      <Md3RadioGroup aria-labelledby={headingId} value={current} onValueChange={select} className="gap-2">
        {models.map((model) => {
          const id = `${headingId}-${model.value}`;
          const line = tradeoffLine(model);
          const active = model.value === current;
          return (
            <label
              key={model.value}
              className={cn(
                "relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-md-md border py-1 pl-1 pr-4 transition-colors duration-200 motion-reduce:transition-none",
                "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] motion-reduce:before:transition-none",
                active
                  ? "border-md-primary bg-md-secondary-container text-md-on-secondary-container"
                  : "border-md-outline-variant bg-md-surface text-md-on-surface",
                model.disabled ? "cursor-not-allowed" : "hover:before:opacity-[0.08]",
              )}
            >
              <Md3Radio value={model.value} disabled={model.disabled} aria-labelledby={id} className="shrink-0" />
              <span id={id} className={cn("relative flex min-w-0 flex-1 flex-col py-2", model.disabled && "opacity-[0.38]")}>
                <span className="flex flex-wrap items-center gap-2 text-base font-medium leading-6 tracking-[0.15px]">
                  {model.label}
                  {model.recommended && <RecommendedTag />}
                </span>
                {(line ?? model.description) && (
                  <span
                    className={cn(
                      "text-sm leading-5 tracking-[0.25px]",
                      active ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
                    )}
                  >
                    {line ?? model.description}
                  </span>
                )}
                {model.disabled && model.unavailableReason && (
                  <span className="text-xs leading-4 text-md-on-surface">{model.unavailableReason}</span>
                )}
              </span>
              {model.cost && (
                <span
                  className={cn(
                    "relative shrink-0 text-sm font-medium tracking-[0.1px]",
                    active ? "text-md-on-secondary-container" : "text-md-on-surface-variant",
                    model.disabled && "opacity-[0.38]",
                  )}
                >
                  {model.cost}
                </span>
              )}
            </label>
          );
        })}
      </Md3RadioGroup>
    </>
  );
}

/**
 * The Material 3 twin of `ModelSelection`: lets the user pick the model for the
 * task with the same props, callbacks, keyboard model and accessible names.
 * `variant="dropdown"` (default) is a small text-button trigger in the composer
 * opening an M3 menu listbox (arrow keys, Home/End, Escape returns focus) where
 * the selected row takes a secondary-container wash and a tick; `"tradeoff"`
 * lays models out as outlined M3 radio cards with speed, quality and cost in
 * human terms; `"auto-route"` puts an M3 switch first, shows the model it is
 * using now, and reveals the picker when switched off. Recommended and
 * unavailable models are marked in words; an unavailable model keeps its row and
 * says what answers instead. With `trigger="chip"` the trigger is the
 * composer's own model chip (`Md3OpenInputModelChip`, "Balanced High"), so the
 * whole component goes in `Md3OpenInput`'s `model` slot.
 */
export const Md3ModelSelection = React.forwardRef<HTMLDivElement, Md3ModelSelectionProps>(
  (
    {
      models,
      value,
      defaultValue,
      onValueChange,
      label = "Model",
      variant = "dropdown",
      autoRoute,
      defaultAutoRoute = true,
      onAutoRouteChange,
      routedModel,
      agentName = "Aria",
      trigger = "button",
      triggerDetail,
      menuSide = "bottom",
      picker = "dropdown",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue ?? models[0]?.value);
    const current = value !== undefined ? value : internal;
    const select = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    const [autoInternal, setAutoInternal] = React.useState(defaultAutoRoute);
    const auto = autoRoute !== undefined ? autoRoute : autoInternal;
    const setAuto = (on: boolean) => {
      if (autoRoute === undefined) setAutoInternal(on);
      onAutoRouteChange?.(on);
    };
    const autoLabelId = React.useId();
    const headingId = React.useId();

    const list = (
      <Md3ModelList models={models} current={current} select={select} label={label} headingId={headingId} />
    );
    const dropdown = (
      <Md3ModelDropdown
        models={models}
        current={current}
        select={select}
        label={label}
        trigger={trigger}
        triggerDetail={triggerDetail}
        menuSide={menuSide}
      />
    );

    if (variant === "tradeoff") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
          {list}
        </div>
      );
    }

    if (variant === "auto-route") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
          <div className="flex items-center justify-between gap-4 rounded-md-md bg-md-surface-container-low px-4 py-3 text-md-on-surface">
            <div className="flex min-w-0 flex-col">
              <span id={autoLabelId} className="text-base font-medium leading-6 tracking-[0.15px]">
                Auto-route
              </span>
              <span className="text-sm leading-5 tracking-[0.25px] text-md-on-surface-variant">
                {agentName} picks the model per task
                {auto && routedModel && (
                  <>
                    {" · "}
                    <span aria-live="polite">currently {routedModel}</span>
                  </>
                )}
              </span>
            </div>
            <Md3Switch checked={auto} onCheckedChange={setAuto} aria-labelledby={autoLabelId} className="shrink-0" />
          </div>
          {picker === "list" ? (
            <Md3ModelList
              models={models}
              current={current}
              select={(next) => {
                select(next);
                if (auto) setAuto(false);
              }}
              label={label}
              headingId={headingId}
            />
          ) : (
            !auto && dropdown
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("relative inline-block", className)} {...props}>
        {dropdown}
      </div>
    );
  },
);
Md3ModelSelection.displayName = "Md3ModelSelection";
