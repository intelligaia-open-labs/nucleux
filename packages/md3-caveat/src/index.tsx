import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { CaveatProps, CaveatTooltipProps, CaveatVariant } from "@nucleux/caveat";

export type Md3CaveatProps = CaveatProps;
export type Md3CaveatTooltipProps = CaveatTooltipProps;
export type Md3CaveatVariant = CaveatVariant;

type TipSide = NonNullable<CaveatTooltipProps["side"]>;

const DEFAULT_TEXT = "AI can make mistakes. Verify important information.";

/**
 * A short, calm note on what to check about an AI result — the Material 3
 * twin of `Caveat`, with the same API. Caution, not alarm: an outline info
 * mark in body-small on-surface-variant, never the error role. `below-input`
 * is a caption under the composer; `output-footer` gets a surface-container
 * ground so it separates from the output it qualifies, and can carry the
 * next steps that remove the reason for it; with a `detail` line it becomes
 * nucleux.in's tonal card (surface-container-highest, the limitation over why
 * it matters, then text-button next steps). Rendered as a `note`.
 */
export const Md3Caveat = React.forwardRef<HTMLParagraphElement, Md3CaveatProps>(
  ({ variant = "below-input", icon, actions, detail, className, children, ...props }, ref) => {
    const glyph = icon === undefined ? <Info aria-hidden="true" /> : icon;
    if (detail != null) {
      // The tonal card: limitation (body-large), why it matters (body-medium), then text-button next steps.
      return (
        <p
          ref={ref}
          role="note"
          data-variant={variant}
          className={cn(
            "font-md",
            "flex w-full flex-col gap-1.5 text-md-on-surface [&_svg]:shrink-0",
            variant === "output-footer" &&
              "mt-3.5 rounded-md-md bg-md-surface-container-highest px-4 pb-1.5 pt-3.5 animate-nx-fade-in motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          <span className="flex items-start gap-2.5 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:text-md-on-surface-variant">
            {glyph}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base leading-6 tracking-[0.15px]">{children ?? DEFAULT_TEXT}</span>
              <span className="text-sm leading-5 tracking-[0.25px] text-md-on-surface-variant">{detail}</span>
            </span>
          </span>
          {actions && <span className="ml-4 inline-flex flex-wrap items-center gap-1 [&_svg]:size-[1.125rem]">{actions}</span>}
        </p>
      );
    }
    return (
      <p
        ref={ref}
        role="note"
        data-variant={variant}
        className={cn(
          "font-md",
          "items-center gap-2 text-xs leading-4 tracking-[0.4px] text-md-on-surface-variant [&_svg]:size-3.5 [&_svg]:shrink-0",
          variant === "output-footer"
            ? "mt-3.5 flex w-full flex-wrap rounded-md-sm bg-md-surface-container px-3 py-2.5 animate-nx-fade-in motion-reduce:animate-none"
            : "inline-flex",
          className,
        )}
        {...props}
      >
        {glyph}
        <span>{children ?? DEFAULT_TEXT}</span>
        {actions && <span className="ml-auto inline-flex flex-wrap items-center gap-1">{actions}</span>}
      </p>
    );
  },
);
Md3Caveat.displayName = "Md3Caveat";

const tipSides: Record<TipSide, string> = {
  top: "bottom-full left-1/2 mb-1 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1 -translate-x-1/2",
  left: "right-full top-1/2 mr-1 -translate-y-1/2",
  right: "left-full top-1/2 ml-1 -translate-y-1/2",
};

/**
 * The `info-tooltip` caveat in Material 3 — the twin of `CaveatTooltip`. The
 * reminder rides the generate control as an M3 plain tooltip
 * (inverse-surface, extra-small corners) shown on hover and keyboard focus,
 * fading in over 150 ms (instantly under reduced motion), and it describes
 * the control through `aria-describedby` so screen readers hear it too.
 */
export const Md3CaveatTooltip = React.forwardRef<HTMLSpanElement, Md3CaveatTooltipProps>(
  ({ content = "Output may be inaccurate", side = "top", showIcon = true, children, className, ...props }, ref) => {
    const id = React.useId();
    const childProps = children.props as { "aria-describedby"?: string };
    const trigger = React.cloneElement(children, {
      "aria-describedby": [childProps["aria-describedby"], id].filter(Boolean).join(" "),
    } as Record<string, unknown>);
    return (
      <span ref={ref} className={cn("font-md", "group/caveat relative inline-flex", className)} {...props}>
        {trigger}
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none invisible absolute z-50 whitespace-nowrap rounded-md-xs bg-md-inverse-surface px-2 py-1 text-xs tracking-[0.4px] text-md-inverse-on-surface opacity-0 transition-opacity duration-150 motion-reduce:transition-none",
            "group-hover/caveat:visible group-hover/caveat:opacity-100 group-focus-within/caveat:visible group-focus-within/caveat:opacity-100",
            tipSides[side],
          )}
        >
          <span id={id} className="inline-flex items-center gap-1.5 [&_svg]:size-3">
            {showIcon && <Info aria-hidden="true" />}
            {content}
          </span>
        </span>
      </span>
    );
  },
);
Md3CaveatTooltip.displayName = "Md3CaveatTooltip";
