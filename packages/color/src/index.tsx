import * as React from "react";
import { cn, Slot } from "@nucleux/utils";

/**
 * The reserved AI accent, as Tailwind classes on the preset's `brand` tokens.
 * Spend these only on AI-touched UI so the colour keeps meaning "the agent".
 * `working` is the one moving treatment: a gentle pulse that stops under
 * reduced motion. Other Nucleux AI packages (ai-icons, agent-avatar, name,
 * disclosure) read from this object so the accent stays one accent.
 */
export const aiColorClasses = {
  /** Accent text / glyph colour. Use on marks, not on body copy. */
  text: "text-brand",
  /** Solid accent fill (dots, carets, small marks). */
  fill: "bg-brand",
  /** Faint accent surface behind AI content. */
  surface: "bg-brand-muted",
  /** Accent edge. */
  border: "border-brand",
  /** Accent ring colour. */
  ring: "ring-brand",
  /** The "AI is working" motion — pulses, and holds still under reduced motion. */
  working: "animate-pulse motion-reduce:animate-none",
} as const;

export type AiColorToken = keyof typeof aiColorClasses;

export type AiColorVariant = "accent-border" | "soft-glow" | "background-tint";

const variantClasses: Record<AiColorVariant, string> = {
  "accent-border":
    "rounded-r-md border-l-[3px] border-brand bg-gradient-to-r from-brand-muted to-transparent px-4 py-3",
  "soft-glow": "rounded-lg bg-background px-4 py-3 shadow-lg shadow-brand/20 ring-[3px] ring-brand/15",
  "background-tint": "rounded-lg bg-brand-muted px-4 py-3",
};

export interface AiColorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Treatment: `accent-border` (a coloured edge on streaming / AI-touched
   * copy), `soft-glow` (a halo around an active AI region) or
   * `background-tint` (a faint fill behind a whole AI-generated region).
   */
  variant?: AiColorVariant;
  /**
   * The AI is working in this region right now: adds the working treatment
   * (a pulsing accent ring, plus a streaming caret on `accent-border`) and
   * sets `aria-busy`. Holds still under reduced motion.
   */
  working?: boolean;
  /**
   * The words that travel with the colour — "Streaming", "Aria suggests".
   * Rendered in a polite live region so a change (e.g. "Streaming" →
   * "Done") is announced. Colour is never the only signal.
   */
  label?: React.ReactNode;
  /** Apply the treatment to the single child element instead of a wrapper `<div>`. */
  asChild?: boolean;
}

/**
 * A surface painted with the reserved AI accent, so machine output and live
 * AI activity are recognisable at a glance in a dense layout. Three
 * treatments — `accent-border`, `soft-glow`, `background-tint` — and a
 * `working` state that adds the one moving treatment. Always pair it with
 * words (`label`); the colour speeds reading up but never carries meaning alone.
 */
export const AiColor = React.forwardRef<HTMLDivElement, AiColorProps>(
  (
    { variant = "accent-border", working = false, label, asChild = false, className, children, ...props },
    ref,
  ) => {
    const labelNode =
      label != null ? (
        <span
          role="status"
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground",
            variant === "accent-border" ? "mt-1.5" : "mb-1.5",
          )}
        >
          <AiColorDot pulse={working} />
          {label}
        </span>
      ) : null;

    const classes = cn(
      "relative text-sm leading-5 text-foreground",
      variantClasses[variant],
      className,
    );

    const ring = working ? (
      <AiColorWorkingRing className={variant === "accent-border" ? "rounded-l-none" : undefined} />
    ) : null;

    if (asChild) {
      return (
        <Slot ref={ref} data-variant={variant} aria-busy={working || undefined} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <div ref={ref} data-variant={variant} aria-busy={working || undefined} className={classes} {...props}>
        {ring}
        {variant !== "accent-border" && labelNode}
        <div>
          {children}
          {working && variant === "accent-border" && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-brand animate-nx-caret-blink motion-reduce:animate-none"
            />
          )}
        </div>
        {variant === "accent-border" && labelNode}
      </div>
    );
  },
);
AiColor.displayName = "AiColor";

export type AiColorHighlightProps = React.HTMLAttributes<HTMLElement>;

/**
 * An inline `<mark>` in the AI accent for the words in an AI response that
 * the agent wants to draw attention to ("Acme Corp is the most urgent").
 */
export const AiColorHighlight = React.forwardRef<HTMLElement, AiColorHighlightProps>(
  ({ className, ...props }, ref) => (
    <mark
      ref={ref}
      className={cn("rounded-sm bg-brand-muted px-0.5 font-medium text-foreground", className)}
      {...props}
    />
  ),
);
AiColorHighlight.displayName = "AiColorHighlight";

export interface AiColorDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pulse while the agent is working (holds still under reduced motion). */
  pulse?: boolean;
}

/**
 * A small accent dot that marks AI presence or activity. Decorative
 * (`aria-hidden`): it never travels alone — always put words beside it.
 */
export const AiColorDot = React.forwardRef<HTMLSpanElement, AiColorDotProps>(
  ({ pulse = false, className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("inline-block size-1.5 shrink-0 rounded-full bg-brand", pulse && aiColorClasses.working, className)}
      {...props}
    />
  ),
);
AiColorDot.displayName = "AiColorDot";

export type AiColorWorkingRingProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * The AI "working" treatment as a decorative overlay: a pulsing accent ring
 * that fills its positioned parent and follows its corner radius. Put it
 * inside a `relative` element (a surface, an avatar) while work happens and
 * remove it the moment work stops. Holds still under reduced motion.
 */
export const AiColorWorkingRing = React.forwardRef<HTMLSpanElement, AiColorWorkingRingProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="ai-working-ring"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-brand/50",
        aiColorClasses.working,
        className,
      )}
      {...props}
    />
  ),
);
AiColorWorkingRing.displayName = "AiColorWorkingRing";
