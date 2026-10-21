import * as React from "react";
import { cn, Slot } from "@nucleux/utils";
import type {
  AiColorDotProps,
  AiColorHighlightProps,
  AiColorProps,
  AiColorToken,
  AiColorVariant,
  AiColorWorkingRingProps,
} from "@nucleux/color";

export type Md3AiColorProps = AiColorProps;
export type Md3AiColorHighlightProps = AiColorHighlightProps;
export type Md3AiColorDotProps = AiColorDotProps;
export type Md3AiColorWorkingRingProps = AiColorWorkingRingProps;
export type Md3AiColorToken = AiColorToken;
export type Md3AiColorVariant = AiColorVariant;

/**
 * The reserved AI accent in Material 3 colour roles — the same keys as
 * `aiColorClasses` in `@nucleux/color`, mapped onto `md-primary` (presence
 * and state) and `md-primary-container` (the agent's ground). Spend these
 * only on AI-touched UI so the role keeps meaning "the agent". `working` is
 * the one moving treatment and holds still under reduced motion. The other
 * Material AI packages (md3-ai-icons, md3-agent-avatar, md3-name,
 * md3-disclosure) read from this object so the accent stays one accent.
 */
export const md3AiColorClasses = {
  /** Accent text / glyph colour (`md-primary`). Use on marks, not on body copy. */
  text: "text-md-primary",
  /** Solid accent fill (dots, carets, small marks). */
  fill: "bg-md-primary",
  /** The agent's ground behind AI content (`md-primary-container`). */
  surface: "bg-md-primary-container text-md-on-primary-container",
  /** Accent edge. */
  border: "border-md-primary",
  /** Accent ring colour. */
  ring: "ring-md-primary",
  /** The "AI is working" motion — pulses, and holds still under reduced motion. */
  working: "animate-pulse motion-reduce:animate-none",
} as const satisfies Record<AiColorToken, string>;

const variantClasses: Record<AiColorVariant, string> = {
  // A coloured edge on streaming / AI-touched copy, on a quiet container.
  "accent-border":
    "rounded-r-md-md border-l-[3px] border-md-primary bg-md-surface-container-low px-4 py-3 text-md-on-surface",
  // "Presence, not decoration": M3 has no glow, so the active region takes a primary outline.
  "soft-glow": "rounded-md-lg border-2 border-md-primary bg-md-surface p-4 text-md-on-surface",
  // The agent's own ground — the agent bubble shape (small trailing-bottom corner).
  "background-tint":
    "rounded-md-lg rounded-bl-md-xs bg-md-primary-container px-4 py-3 text-md-on-primary-container",
};

const labelTone: Record<AiColorVariant, string> = {
  "accent-border": "text-md-primary",
  "soft-glow": "text-md-primary",
  "background-tint": "text-md-on-primary-container",
};

/**
 * A surface painted with the reserved AI role, so machine output and live AI
 * activity are recognisable at a glance — the Material 3 twin of `AiColor`
 * with the same API. `accent-border` puts a primary edge on streaming copy,
 * `soft-glow` becomes the M3 presence outline around a region the agent is
 * working in, and `background-tint` sets content on the agent's
 * primary-container ground. `working` adds the moving treatment; the
 * `label` words always travel with the colour, in a polite live region.
 */
export const Md3AiColor = React.forwardRef<HTMLDivElement, Md3AiColorProps>(
  (
    { variant = "accent-border", working = false, label, asChild = false, className, children, ...props },
    ref,
  ) => {
    const labelNode =
      label != null ? (
        <span
          role="status"
          className={cn(
            "flex items-center gap-2 text-sm font-medium tracking-[0.1px]",
            labelTone[variant],
            variant === "accent-border" ? "mt-2" : "mb-2",
          )}
        >
          <Md3AiColorDot pulse={working} className={variant === "background-tint" ? "bg-md-on-primary-container" : undefined} />
          {label}
        </span>
      ) : null;

    const classes = cn("relative text-sm leading-5", variantClasses[variant], className);

    if (asChild) {
      return (
        <Slot ref={ref} data-variant={variant} aria-busy={working || undefined} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <div ref={ref} data-variant={variant} aria-busy={working || undefined} className={classes} {...props}>
        {working && (
          <Md3AiColorWorkingRing
            className={cn(variant === "accent-border" && "rounded-l-none", variant === "soft-glow" && "-inset-0.5")}
          />
        )}
        {variant !== "accent-border" && labelNode}
        <div>
          {children}
          {working && variant === "accent-border" && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-md-primary animate-nx-caret-blink motion-reduce:animate-none"
            />
          )}
        </div>
        {variant === "accent-border" && labelNode}
      </div>
    );
  },
);
Md3AiColor.displayName = "Md3AiColor";

/**
 * An inline `<mark>` on the agent's primary-container ground for the words in
 * an AI response the agent wants to draw attention to ("Acme Corp is the
 * most urgent"). The Material 3 twin of `AiColorHighlight`.
 */
export const Md3AiColorHighlight = React.forwardRef<HTMLElement, Md3AiColorHighlightProps>(
  ({ className, ...props }, ref) => (
    <mark
      ref={ref}
      className={cn(
        "rounded-md-xs bg-md-primary-container px-0.5 font-medium text-md-on-primary-container",
        className,
      )}
      {...props}
    />
  ),
);
Md3AiColorHighlight.displayName = "Md3AiColorHighlight";

/**
 * A small `md-primary` dot that marks AI presence or activity — the Material
 * 3 twin of `AiColorDot`. Decorative (`aria-hidden`): it never travels
 * alone, so always put words beside it.
 */
export const Md3AiColorDot = React.forwardRef<HTMLSpanElement, Md3AiColorDotProps>(
  ({ pulse = false, className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full bg-md-primary",
        pulse && md3AiColorClasses.working,
        className,
      )}
      {...props}
    />
  ),
);
Md3AiColorDot.displayName = "Md3AiColorDot";

/**
 * The AI "working" treatment as a decorative overlay: a pulsing `md-primary`
 * ring that fills its positioned parent and follows its corner radius — the
 * Material 3 twin of `AiColorWorkingRing`. Put it inside a `relative`
 * element while work happens and remove it the moment work stops. Holds
 * still under reduced motion.
 */
export const Md3AiColorWorkingRing = React.forwardRef<HTMLSpanElement, Md3AiColorWorkingRingProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="ai-working-ring"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-md-primary/50",
        md3AiColorClasses.working,
        className,
      )}
      {...props}
    />
  ),
);
Md3AiColorWorkingRing.displayName = "Md3AiColorWorkingRing";
