import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button, type ButtonProps } from "@nucleux/button";
import { Tooltip, type TooltipSide } from "@nucleux/tooltip";
import { AiRegenerateIcon, AiWandIcon, AiWorkingIcon, useAiGlyph } from "@nucleux/ai-icons";

/**
 * What the AI action does, which picks its reserved mark:
 * `generate` = sparkle, `regenerate` = refresh, `transform` = wand
 * (rewrite, enhance, restyle something the user already has).
 */
export type IconographyIntent = "generate" | "regenerate" | "transform";

export interface IconographyProps extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon" | "asChild"> {
  /** Which AI action this is; picks the mark. Default `generate`. */
  intent?: IconographyIntent;
  /** The verb — "Generate", "Rewrite", "Summarise". Always required: it is the visible label or the accessible name. */
  label: string;
  /**
   * Icon-only (the `sparkle-only` variant): the mark alone, named
   * "<label> with <agent>" and explained by a tooltip on hover and focus.
   */
  iconOnly?: boolean;
  /** Who runs it, used in the accessible name and tooltip ("Generate with Aria"). Defaults to "AI". */
  agentName?: string;
  /** Tooltip text for `iconOnly`. Defaults to "<label> with <agentName>". */
  tooltip?: string;
  /** Tooltip side for `iconOnly`. */
  tooltipSide?: TooltipSide;
  /**
   * The AI call is running: the mark swaps to the working mark, the words
   * become `workingLabel`, the button is `aria-disabled` and further clicks
   * are ignored, and the change is announced politely. Offer a Stop beside it.
   */
  working?: boolean;
  /** Words while working. Defaults to "<label>…" ("Generate" → "Generating…" is up to you). */
  workingLabel?: string;
}

const filledVariants = new Set(["primary", "cta", "destructive"]);

/**
 * A control that runs AI, drawn with the reserved AI mark for its intent —
 * sparkle to generate, refresh to regenerate, wand to transform — so people
 * learn which buttons trigger generation without explanatory text. Built
 * on Button; icon-only use gets an accessible name and a Tooltip. Reserve
 * it for actions that actually call a model: meaning collapses if every
 * button has a sparkle.
 */
export const Iconography = React.forwardRef<HTMLButtonElement, IconographyProps>(
  (
    {
      intent = "generate",
      label,
      iconOnly = false,
      agentName = "AI",
      tooltip,
      tooltipSide = "top",
      working = false,
      workingLabel,
      variant = "primary",
      size,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const ActionGlyph = useAiGlyph("ai-action");
    const Glyph = working
      ? AiWorkingIcon
      : intent === "transform"
        ? AiWandIcon
        : intent === "regenerate"
          ? AiRegenerateIcon
          : ActionGlyph;
    const words = working ? (workingLabel ?? `${label}…`) : label;
    const fullName = `${words} with ${agentName}`;
    const glyphClass = filledVariants.has(variant) ? undefined : "text-brand";

    const button = (
      <Button
        ref={ref}
        variant={variant}
        size={size ?? (iconOnly ? "icon" : "md")}
        data-ai-intent={intent}
        aria-label={iconOnly ? fullName : undefined}
        aria-disabled={working || undefined}
        aria-busy={working || undefined}
        onClick={(e) => {
          if (working) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        className={cn(working && "cursor-progress", className)}
        {...props}
      >
        <Glyph className={glyphClass} />
        {!iconOnly && <span>{words}</span>}
      </Button>
    );

    return (
      <>
        {iconOnly ? (
          <Tooltip content={tooltip ?? fullName} side={tooltipSide}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
        <span role="status" className="sr-only">
          {working ? words : ""}
        </span>
      </>
    );
  },
);
Iconography.displayName = "Iconography";
