import * as React from "react";
import { cn } from "@nucleux/utils";
import { Badge } from "@nucleux/badge";
import { Radio, RadioGroup } from "@nucleux/radio-group";
import { Switch } from "@nucleux/switch";
import { Check, ChevronDown, Sparkles } from "lucide-react";

/** Layout from the spec: a compact dropdown, tradeoff cards, or an auto-route toggle that reveals the picker. */
export type ModelSelectionVariant = "dropdown" | "tradeoff" | "auto-route";

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
  /** The model auto-route is using now, shown as "currently: …". */
  routedModel?: React.ReactNode;
  /** Who routes, for the description. Defaults to `"Aria"`. */
  agentName?: React.ReactNode;
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
}

/** The composer-anchored dropdown (listbox) used by the "dropdown" and "auto-route" variants. */
function ModelDropdown({ models, current, select, label, className }: PickerProps) {
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

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4"
      >
        <Sparkles className="text-brand" aria-hidden="true" />
        <span>{selected?.label ?? "Select model"}</span>
        <ChevronDown className={cn("text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKeyDown}
          className="absolute z-50 mt-1 flex min-w-64 flex-col gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-md animate-nx-fade-in motion-reduce:animate-none"
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

/**
 * Lets the user pick the model for the task. `variant="dropdown"` (default) is
 * a composer-anchored listbox (arrow keys, Home/End, Escape returns focus);
 * `"tradeoff"` lays models out as radio cards with speed, quality and cost in
 * human terms; `"auto-route"` defaults to letting the agent route per task,
 * shows which model it is using, and reveals the picker when switched off.
 * Recommended and unavailable models are marked in words; an unavailable model
 * keeps its row and says what answers instead.
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

    if (variant === "tradeoff") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
          <p id={headingId} className="sr-only">
            {label}
          </p>
          <RadioGroup
            aria-labelledby={headingId}
            value={current}
            onValueChange={select}
            className="gap-1.5"
          >
            {models.map((model) => {
              const id = `${headingId}-${model.value}`;
              const line = tradeoffLine(model);
              return (
                <label
                  key={model.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:bg-accent",
                    "has-[[aria-checked=true]]:border-brand has-[[aria-checked=true]]:bg-brand-muted/40",
                    model.disabled && "cursor-not-allowed opacity-60 hover:bg-background",
                  )}
                >
                  <Radio value={model.value} disabled={model.disabled} aria-labelledby={id} />
                  <span id={id} className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {model.label}
                      {model.recommended && <RecommendedBadge />}
                    </span>
                    {(line ?? model.description) && (
                      <span className="text-xs text-muted-foreground">{line ?? model.description}</span>
                    )}
                    {model.disabled && model.unavailableReason && (
                      <span className="text-xs text-foreground">{model.unavailableReason}</span>
                    )}
                  </span>
                  {model.cost && (
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">{model.cost}</span>
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </div>
      );
    }

    if (variant === "auto-route") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
            <div className="flex min-w-0 flex-col">
              <span id={autoLabelId} className="text-sm font-semibold text-foreground">
                Auto-route
              </span>
              <span className="text-xs text-muted-foreground">{agentName} picks the model per task</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {auto && routedModel && (
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  currently: {routedModel}
                </span>
              )}
              <Switch checked={auto} onCheckedChange={setAuto} aria-labelledby={autoLabelId} />
            </div>
          </div>
          {!auto && <ModelDropdown models={models} current={current} select={select} label={label} />}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("relative inline-block", className)} {...props}>
        <ModelDropdown models={models} current={current} select={select} label={label} />
      </div>
    );
  },
);
ModelSelection.displayName = "ModelSelection";
