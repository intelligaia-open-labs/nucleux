import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Tooltip, type TooltipSide } from "@nucleux/tooltip";

/**
 * Where the caveat sits.
 * - `below-input` — a quiet caption under the composer, seen before anything is sent (default).
 * - `output-footer` — a filled note under output that will be acted on (sent, published,
 *   deployed); can carry next steps in `actions`.
 * For the third spec variant, `info-tooltip`, wrap the generate control in `CaveatTooltip`.
 */
export type CaveatVariant = "below-input" | "output-footer";

export interface CaveatProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Placement style. Default `below-input`. */
  variant?: CaveatVariant;
  /** Leading icon. Defaults to an info glyph. Pass `null` to omit. */
  icon?: React.ReactNode;
  /**
   * Next steps that remove the reason for the caveat — "Review sources",
   * "Reconnect". Shown after the text; use small Buttons or links.
   */
  actions?: React.ReactNode;
  /**
   * Why the limitation matters for this result ("Themes raised only in those
   * two calls are missing"). When given, the note stacks: the limitation, this
   * line under it, then the `actions` on their own row.
   */
  detail?: React.ReactNode;
}

const DEFAULT_TEXT = "AI can make mistakes. Verify important information.";

/** nucleux.in's caveat mark: an "i" in a circle. */
const InfoMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * A short, calm reminder that AI output can be wrong and should be checked —
 * or, better, the specific limitation of this result ("2 of 8 interviews
 * could not be opened"). Caption-size and muted, never alarming or
 * apologetic, once per surface. `below-input` sits under the composer;
 * `output-footer` sits under output that will be acted on and can offer
 * next steps; with a `detail` line the note stacks (limitation, why it
 * matters, then the next steps). Rendered as a `note`.
 */
export const Caveat = React.forwardRef<HTMLParagraphElement, CaveatProps>(
  ({ variant = "below-input", icon, actions, detail, className, children, ...props }, ref) => {
    const glyph = icon === undefined ? <InfoMark /> : icon;
    if (detail != null) {
      return (
        <p
          ref={ref}
          role="note"
          data-variant={variant}
          className={cn(
            "flex w-full flex-col gap-2 text-sm [&_svg]:shrink-0",
            variant === "output-footer" &&
              "mt-2.5 rounded-lg border border-border bg-muted/60 px-3.5 py-3",
            className,
          )}
          {...props}
        >
          <span className="flex items-start gap-2.5 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:text-muted-foreground">
            {glyph}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium text-foreground">{children ?? DEFAULT_TEXT}</span>
              <span className="text-muted-foreground">{detail}</span>
            </span>
          </span>
          {actions && (
            <span className="ml-5 inline-flex flex-wrap items-center gap-1.5 [&_svg]:size-3.5">
              {actions}
            </span>
          )}
        </p>
      );
    }
    return (
      <p
        ref={ref}
        role="note"
        data-variant={variant}
        className={cn(
          "items-center [&_svg]:shrink-0",
          variant === "output-footer"
            ? "mt-2.5 flex w-full flex-wrap gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-2 text-xs text-foreground/80 [&_svg]:size-3.5"
            : "inline-flex gap-[5px] text-[11px] leading-[1.55] text-faint [&_svg]:size-[11px]",
          className,
        )}
        {...props}
      >
        {glyph}
        <span>{children ?? DEFAULT_TEXT}</span>
        {actions && (
          <span className="ml-auto inline-flex flex-wrap items-center gap-1.5">{actions}</span>
        )}
      </p>
    );
  },
);
Caveat.displayName = "Caveat";

export interface CaveatTooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  /** The caveat. Default "Output may be inaccurate". */
  content?: React.ReactNode;
  /** Side of the trigger. Default `top`. */
  side?: TooltipSide;
  /** Show the info glyph in the tooltip. Default `true`. */
  showIcon?: boolean;
  /** The AI action the caveat rides on — a single focusable element (e.g. an `Iconography` or Button). */
  children: React.ReactElement;
}

/**
 * The `info-tooltip` caveat: the reminder rides the generate control,
 * shown on hover and keyboard focus without ever being in the way, and
 * linked to the control with `aria-describedby` so screen readers hear it too.
 */
export const CaveatTooltip = React.forwardRef<HTMLSpanElement, CaveatTooltipProps>(
  (
    { content = "Output may be inaccurate", side = "top", showIcon = true, children, ...props },
    ref,
  ) => {
    const id = React.useId();
    const childProps = children.props as { "aria-describedby"?: string };
    const trigger = React.cloneElement(children, {
      "aria-describedby": [childProps["aria-describedby"], id].filter(Boolean).join(" "),
    } as Record<string, unknown>);
    return (
      <Tooltip
        ref={ref}
        side={side}
        content={
          <span id={id} className="inline-flex items-center gap-1.5 [&_svg]:size-3">
            {showIcon && <Info aria-hidden="true" />}
            {content}
          </span>
        }
        {...props}
      >
        {trigger}
      </Tooltip>
    );
  },
);
CaveatTooltip.displayName = "CaveatTooltip";
