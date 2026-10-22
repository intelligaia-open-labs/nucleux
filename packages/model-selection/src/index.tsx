import * as React from "react";
import { cn } from "@nucleux/utils";
import { Badge } from "@nucleux/badge";
import { Radio, RadioGroup } from "@nucleux/radio-group";
import { Switch } from "@nucleux/switch";
import { OpenInputModelChip } from "@nucleux/open-input";
import { Check, ChevronDown, Sparkles } from "lucide-react";

/** Layout from the spec: a compact dropdown, tradeoff cards, or an auto-route toggle that reveals the picker. */
export type ModelSelectionVariant = "dropdown" | "tradeoff" | "auto-route";

/**
 * How the dropdown's trigger is drawn. "button": a bordered button with a
 * sparkle, the model and a chevron. "chip": the composer's own model chip
 * (`OpenInputModelChip` / `Md3OpenInputModelChip`, "Sonnet ▾", "Balanced High")
 * — pass the whole `ModelSelection` to the composer's `model` slot.
 */
export type ModelSelectionTrigger = "button" | "chip";

/** Which picker accompanies the auto-route switch: a dropdown revealed when it is off, or the tradeoff list, always shown. */
export type ModelSelectionPicker = "dropdown" | "list";

export interface ModelOption {
  /** Stable value passed to `onValueChange`. */
  value: string;
  /** Display label, e.g. `"Nebula 5.5 Instant"`. */
  label: React.ReactNode;
  /** Supporting line under the label — what the model is *for*, e.g. `"Everyday tasks"`. */
  description?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Marks the suggested default with a "Recommended" badge. */
  recommended?: boolean;
  /** Speed in human terms, e.g. `"Fastest"`. */
  speed?: React.ReactNode;
  /** Quality in human terms, e.g. `"Best quality"`. */
  quality?: React.ReactNode;
  /** Cost in human terms, e.g. `"$$"` or `"Uses more of your allowance"`. */
  cost?: React.ReactNode;
  /** The option can't be chosen right now (allowance used up, not in your plan). The row stays. */
  disabled?: boolean;
  /** Why it is disabled and what answers instead, e.g. `"Limit reached until 3 pm — Sonnet answers instead"`. */
  unavailableReason?: React.ReactNode;
}

export interface ModelSelectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The available models. */
  models: ModelOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initial value (uncontrolled). */
  defaultValue?: string;
  /** Called when a model is chosen. */
  onValueChange?: (value: string) => void;
  /** Accessible label for the trigger. Defaults to `"Model"`. */
  label?: string;
  /** Layout. Defaults to `"dropdown"`. */
  variant?: ModelSelectionVariant;
  /** Auto-route on (controlled), for `variant="auto-route"`. */
  autoRoute?: boolean;
  /** Initial auto-route state (uncontrolled). Defaults to `true`: auto-route is the default. */
  defaultAutoRoute?: boolean;
  /** Called when auto-route is switched. */
  onAutoRouteChange?: (on: boolean) => void;
  /** The model auto-route is using now, shown as "currently …". */
  routedModel?: React.ReactNode;
  /** Who routes, for the description. Defaults to `"Aria"`. */
  agentName?: React.ReactNode;
  /** Trigger of the dropdown ("dropdown" and "auto-route" variants). Defaults to `"button"`. */
  trigger?: ModelSelectionTrigger;
  /** With `trigger="chip"`: the chip's quieter second value after the model, e.g. `"Instant"` or the effort `"High"`. */
  triggerDetail?: React.ReactNode;
  /** Which side of the trigger the menu opens on. Defaults to `"bottom"`; use `"top"` in a composer docked at the bottom. */
  menuSide?: "top" | "bottom";
  /**
   * `variant="auto-route"` only: `"dropdown"` (default) reveals a dropdown when
   * auto-route is switched off; `"list"` always shows the tradeoff list under
   * the switch, marking the model in use, and picking a row switches auto-route off.
   */
  picker?: ModelSelectionPicker;
}

/** "Fastest · Best quality · $$" from whichever tradeoff facts are given. */
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

const RecommendedBadge = () => (
  <Badge variant="outline" className="border-brand/40 px-1.5 py-0 text-[10px] uppercase tracking-wide text-brand">
    Recommended
  </Badge>
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

/** The composer-anchored dropdown (listbox) used by the "dropdown" and "auto-route" variants. */
function ModelDropdown({ models, current, select, label, className, trigger = "button", triggerDetail, menuSide = "bottom" }: PickerProps) {
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

  // Focus the selected option (or the first available) when the list opens.
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
    // The chip shows the model, so its name carries it too ("Model: Sonnet").
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
        <OpenInputModelChip
          ref={triggerRef}
          name={selected?.label ?? "Select model"}
          detail={triggerDetail}
          {...triggerProps}
        />
      ) : (
        <button
          ref={triggerRef}
          type="button"
          {...triggerProps}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4"
        >
          <Sparkles className="text-brand" aria-hidden="true" />
          <span>{selected?.label ?? "Select model"}</span>
          <ChevronDown className={cn("text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
      )}
      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKeyDown}
          className={cn(
            "absolute z-50 flex min-w-64 flex-col gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-md animate-nx-fade-in motion-reduce:animate-none",
            menuSide === "top" ? "bottom-full mb-1" : "top-full mt-1",
            trigger === "chip" && "right-0 w-80",
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
                  "flex items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline-none",
                  model.disabled ? "cursor-not-allowed opacity-60" : "hover:bg-accent focus-visible:bg-accent",
                  active && "bg-brand-muted/40",
                )}
              >
                <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center text-brand [&_svg]:size-4">
                  {active ? <Check aria-hidden="true" /> : model.icon}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {model.label}
                    {model.recommended && <RecommendedBadge />}
                  </span>
                  {model.description && <span className="text-xs text-muted-foreground">{model.description}</span>}
                  {line && <span className="text-xs text-muted-foreground">{line}</span>}
                  {model.disabled && model.unavailableReason && (
                    <span className="text-xs text-foreground">{model.unavailableReason}</span>
                  )}
                </span>
                {model.cost && <span className="shrink-0 text-xs font-semibold text-muted-foreground">{model.cost}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ModelListProps extends PickerProps {
  headingId: string;
}

/**
 * The tradeoff list: one bordered card of radio rows — a dot, the model and
 * what it is for, and speed over cost at the right. The chosen row is tinted
 * and its dot and cost take the warm accent (`warning`), as on nucleux.in.
 */
function ModelList({ models, current, select, label, headingId }: ModelListProps) {
  return (
    <>
      <p id={headingId} className="sr-only">
        {label}
      </p>
      <RadioGroup
        aria-labelledby={headingId}
        value={current}
        onValueChange={select}
        className="gap-0 overflow-hidden rounded-xl border border-border bg-background"
      >
        {models.map((model) => {
          const id = `${headingId}-${model.value}`;
          const active = model.value === current;
          const sub = model.description ?? model.quality;
          return (
            <label
              key={model.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 border-b border-border px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-accent/60",
                active && "bg-accent/60",
                model.disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
              )}
            >
              <Radio
                value={model.value}
                disabled={model.disabled}
                aria-labelledby={id}
                className={cn("size-2 border-0 shadow-none [&>span]:hidden", active ? "bg-warning" : "bg-border")}
              />
              <span id={id} className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    active ? "font-semibold text-foreground" : "text-foreground/80",
                  )}
                >
                  {model.label}
                  {model.recommended && <RecommendedBadge />}
                </span>
                {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                {model.disabled && model.unavailableReason && (
                  <span className="text-xs text-foreground">{model.unavailableReason}</span>
                )}
              </span>
              {(model.speed || model.cost) && (
                <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs">
                  {model.speed && <span className="text-muted-foreground">{model.speed}</span>}
                  {model.cost && (
                    <span className={cn("font-semibold", active ? "text-warning" : "text-muted-foreground")}>
                      {model.cost}
                    </span>
                  )}
                </span>
              )}
            </label>
          );
        })}
      </RadioGroup>
    </>
  );
}

/**
 * Lets the user pick the model for the task. `variant="dropdown"` (default) is
 * a composer-anchored listbox (arrow keys, Home/End, Escape returns focus);
 * `"tradeoff"` lays models out as radio cards with speed, quality and cost in
 * human terms; `"auto-route"` defaults to letting the agent route per task,
 * shows which model it is using, and reveals the picker when switched off.
 * Recommended and unavailable models are marked in words; an unavailable model
 * keeps its row and says what answers instead. With `trigger="chip"` the
 * dropdown's trigger is the composer's model chip ("Sonnet ▾"), so the whole
 * component goes in `OpenInput`'s `model` slot (`menuSide="top"` there).
 * Source: Figma "Context Expansion / Model Selection".
 */
export const ModelSelection = React.forwardRef<HTMLDivElement, ModelSelectionProps>(
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
      <ModelList models={models} current={current} select={select} label={label} headingId={headingId} />
    );
    const dropdown = (
      <ModelDropdown
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
        <div ref={ref} className={cn("flex flex-col gap-2.5", className)} {...props}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span id={autoLabelId} className="text-sm font-semibold text-foreground">
                Auto-route
              </span>
              <span className="text-xs text-muted-foreground">
                {agentName} picks the model per task
                {auto && routedModel && (
                  <>
                    {" · "}
                    <span aria-live="polite">currently {routedModel}</span>
                  </>
                )}
              </span>
            </div>
            <Switch checked={auto} onCheckedChange={setAuto} aria-labelledby={autoLabelId} className="shrink-0" />
          </div>
          {picker === "list" ? (
            <ModelList
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
ModelSelection.displayName = "ModelSelection";
