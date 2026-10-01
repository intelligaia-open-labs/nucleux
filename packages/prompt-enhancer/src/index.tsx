import * as React from "react";
import { cn } from "@nucleux/utils";
import { Sparkles } from "lucide-react";

export interface PromptEnhancerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** One-tap rewrite-intent chips, e.g. "Make it professional". */
  suggestions?: string[];
  /** Called when the main enhance pill is activated. */
  onEnhance?: () => void;
  /** Called with the chosen intent when a suggestion chip is activated. */
  onSelect?: (suggestion: string) => void;
  /** Label on the enhance pill. Defaults to `"Enhance prompt"`. */
  label?: React.ReactNode;
}

/**
 * A sparkle "enhance" pill plus one-tap rewrite intents for the user's draft —
 * one-click AI improvement of a prompt before it's sent.
 * Source: Figma "Prompt Scaffolds / Prompt Enhancer".
 */
export const PromptEnhancer = React.forwardRef<HTMLDivElement, PromptEnhancerProps>(
  ({ suggestions = [], onEnhance, onSelect, label = "Enhance prompt", className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      <button
        type="button"
        onClick={onEnhance}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-muted/60 px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
      >
        <Sparkles aria-hidden="true" />
        {label}
      </button>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect?.(suggestion)}
          className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {suggestion}
        </button>
      ))}
    </div>
  ),
);
PromptEnhancer.displayName = "PromptEnhancer";
