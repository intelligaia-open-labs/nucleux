import * as React from "react";
import { cn } from "@nucleux/utils";
import { Check, ChevronDown, Sparkles } from "lucide-react";

export interface ModelOption {
  /** Stable value passed to `onValueChange`. */
  value: string;
  /** Display label, e.g. `"Nebula 5.5 Instant"`. */
  label: React.ReactNode;
  /** Supporting line under the label. */
  description?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

export interface ModelSelectorProps
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
}

/**
 * A composer-anchored dropdown for choosing which model handles the generation.
 * Source: Figma "Context Expansion / Model Selection".
 */
export const ModelSelector = React.forwardRef<HTMLDivElement, ModelSelectorProps>(
  ({ models, value, defaultValue, onValueChange, label = "Model", className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [internal, setInternal] = React.useState<string | undefined>(defaultValue ?? models[0]?.value);
    const current = value !== undefined ? value : internal;
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    const selected = models.find((m) => m.value === current);
    const select = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    };

    return (
      <div ref={rootRef} className={cn("relative inline-block", className)} {...props}>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4"
        >
          <Sparkles className="text-brand" aria-hidden="true" />
          <span>{selected?.label ?? "Select model"}</span>
          <ChevronDown className={cn("text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        {open && (
          <div
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 flex min-w-64 flex-col gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-md"
          >
            {models.map((model) => {
              const active = model.value === current;
              return (
                <button
                  key={model.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(model.value)}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center text-brand [&_svg]:size-4">
                    {active ? <Check aria-hidden="true" /> : model.icon}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{model.label}</span>
                    {model.description && (
                      <span className="text-xs text-muted-foreground">{model.description}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
ModelSelector.displayName = "ModelSelector";
