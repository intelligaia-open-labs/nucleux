import * as React from "react";
import { cn } from "@nucleux/utils";
import type { IconographyIntent, IconographyProps } from "@nucleux/iconography";
import { Md3Button, type Md3ButtonVariant } from "@nucleux/md3-button";
import { Md3IconButton, type Md3IconButtonVariant } from "@nucleux/md3-icon-button";
import { Md3AiRegenerateIcon, Md3AiWandIcon, Md3AiWorkingIcon, useMd3AiGlyph } from "@nucleux/md3-ai-icons";

export type Md3IconographyProps = IconographyProps;
export type Md3IconographyIntent = IconographyIntent;

type TwinVariant = NonNullable<IconographyProps["variant"]>;
type TwinSize = NonNullable<IconographyProps["size"]>;
type TipSide = NonNullable<IconographyProps["tooltipSide"]>;

// The twin's Button variants, in M3 button roles.
const buttonVariant: Record<TwinVariant, Md3ButtonVariant> = {
  primary: "filled",
  cta: "filled",
  destructive: "filled",
  secondary: "tonal",
  ghost: "text",
  link: "text",
};
const iconButtonVariant: Record<TwinVariant, Md3IconButtonVariant> = {
  primary: "filled",
  cta: "filled",
  destructive: "filled",
  secondary: "tonal",
  ghost: "standard",
  link: "standard",
};
const variantExtra: Partial<Record<TwinVariant, string>> = {
  cta: "bg-md-tertiary text-md-on-tertiary",
  destructive: "bg-md-error text-md-on-error",
  link: "underline underline-offset-2",
};

// The twin's Button sizes, on the M3 button heights (32 / 40 / 56).
const sizeClasses: Record<TwinSize, string> = {
  sm: "h-8 px-4",
  md: "tracking-[0.1px]",
  lg: "h-14 px-7 text-base [&_svg]:size-6",
  "icon-sm": "size-8 [&_svg]:size-5",
  icon: "",
  "icon-lg": "size-14 [&_svg]:size-7",
};

const filledVariants = new Set<TwinVariant>(["primary", "cta", "destructive"]);

const tipSides: Record<TipSide, string> = {
  top: "bottom-full left-1/2 mb-1 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-1 -translate-x-1/2",
  left: "right-full top-1/2 mr-1 -translate-y-1/2",
  right: "left-full top-1/2 ml-1 -translate-y-1/2",
};

/**
 * A control that runs AI, drawn with the reserved AI mark for its intent —
 * sparkle to generate, refresh to regenerate, wand to transform — as a
 * Material 3 Md3Button (or an Md3IconButton with an M3 plain tooltip when
 * `iconOnly`). The twin of `Iconography`, with the same API: the mark
 * takes the button's on-colour on filled and tonal buttons and `md-primary`
 * on text buttons; hover, focus and
 * press are the buttons' own 8% / 12% state layers; while `working` the mark
 * swaps to the turning working mark, clicks are ignored and the words are
 * announced politely. Reserve it for actions that actually call a model.
 */
export const Md3Iconography = React.forwardRef<HTMLButtonElement, Md3IconographyProps>(
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
      color,
      variant = color ?? "primary",
      size,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const ActionGlyph = useMd3AiGlyph("ai-action");
    const Glyph = working
      ? Md3AiWorkingIcon
      : intent === "transform"
        ? Md3AiWandIcon
        : intent === "regenerate"
          ? Md3AiRegenerateIcon
          : ActionGlyph;
    const words = working ? (workingLabel ?? `${label}…`) : label;
    const fullName = `${words} with ${agentName}`;
    // Filled and tonal buttons draw the mark in their own on-colour; outlined and text ones in md-primary.
    const glyphClass = filledVariants.has(variant) || variant === "secondary" ? undefined : "text-md-primary";
    const resolvedSize = size ?? (iconOnly ? "icon" : "md");

    const shared = {
      ref,
      "data-ai-intent": intent,
      "aria-disabled": working || undefined,
      "aria-busy": working || undefined,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (working) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      className: cn(variantExtra[variant], sizeClasses[resolvedSize], working && "cursor-progress", className),
    };

    const glyph = <Glyph className={glyphClass} />;

    return (
      <>
        {iconOnly ? (
          <span className="group/tip relative inline-flex font-md">
            <Md3IconButton
              {...shared}
              {...props}
              variant={iconButtonVariant[variant]}
              aria-label={props["aria-label"] ?? fullName}
            >
              {glyph}
            </Md3IconButton>
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none invisible absolute z-50 whitespace-nowrap rounded-md-xs bg-md-inverse-surface px-2 py-1 text-xs tracking-[0.4px] text-md-inverse-on-surface opacity-0 transition-opacity duration-150 motion-reduce:transition-none",
                "group-hover/tip:visible group-hover/tip:opacity-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100",
                tipSides[tooltipSide],
              )}
            >
              {tooltip ?? fullName}
            </span>
          </span>
        ) : (
          <Md3Button {...shared} {...props} variant={buttonVariant[variant]} icon={glyph}>
            {words}
          </Md3Button>
        )}
        <span role="status" className="sr-only">
          {working ? words : ""}
        </span>
      </>
    );
  },
);
Md3Iconography.displayName = "Md3Iconography";
