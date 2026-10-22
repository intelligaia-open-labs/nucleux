import * as React from "react";
import { cn } from "@nucleux/utils";
import {
  AiGeneratedIcon,
  AiIconProvider,
  defaultAiIconLegendTerms,
  AiRegenerateIcon,
  AiSparkleIcon,
  AiToolIcon,
  AiWandIcon,
  AiWorkingIcon,
  useAiGlyph,
} from "@nucleux/ai-icons";
import type {
  AiGlyphProps,
  AiIconLegendProps,
  AiIconProps,
  AiIconProviderProps,
  AiIconRole,
  AiIconsProps,
  AiIconsSize,
  AiIconsTone,
  AiIconsVariant,
  AiWorkingIconProps,
} from "@nucleux/ai-icons";
import { md3AiColorClasses } from "@nucleux/md3-color";

/* -------------------------------------------------------------------------- */
/* Shared vocabulary                                                           */
/* -------------------------------------------------------------------------- */

// The reserved glyph set, the role → glyph mapping and the product-wide
// provider are non-visual and shared with `@nucleux/ai-icons`, so a meaning
// keeps one mark across both families (and one `AiIconProvider` choice
// applies to both).
export type { AiIconRole, AiGlyphName, AiIconGlyphs } from "@nucleux/ai-icons";
export { aiGlyphs, defaultAiIconGlyphs, useAiGlyph } from "@nucleux/ai-icons";

export type Md3AiGlyphProps = AiGlyphProps;
export type Md3AiWorkingIconProps = AiWorkingIconProps;
export type Md3AiIconProviderProps = AiIconProviderProps;
export type Md3AiIconProps = AiIconProps;
export type Md3AiIconsProps = AiIconsProps;
export type Md3AiIconsVariant = AiIconsVariant;
export type Md3AiIconsSize = AiIconsSize;
export type Md3AiIconsTone = AiIconsTone;
export type Md3AiIconLegendProps = AiIconLegendProps;
export type { AiIconLegendTerm } from "@nucleux/ai-icons";
export { defaultAiIconLegendTerms } from "@nucleux/ai-icons";

function md3Glyph<P extends Md3AiGlyphProps>(
  Glyph: React.ComponentType<P & React.RefAttributes<SVGSVGElement>>,
  displayName: string,
) {
  const Md3Glyph = React.forwardRef<SVGSVGElement, P>((props, ref) => (
    <Glyph {...(props as P)} ref={ref} />
  ));
  Md3Glyph.displayName = displayName;
  return Md3Glyph;
}

/**
 * The four-point AI sparkle (Material's star_shine role) — the reserved mark
 * for "this runs AI". It draws `AiSparkleIcon`, so the agent mark, the
 * disclosure chip and every AI control show it byte-for-byte alike in both
 * families. Decorative unless given an `aria-label`.
 */
export const Md3AiSparkleIcon = md3Glyph<Md3AiGlyphProps>(AiSparkleIcon, "Md3AiSparkleIcon");
/** The "generated with AI" mark (Material's chat_info role) — only on content AI wrote or changed. */
export const Md3AiGeneratedIcon = md3Glyph<Md3AiGlyphProps>(AiGeneratedIcon, "Md3AiGeneratedIcon");
/** The "agent working" mark (Material's progress_activity role): the only mark that turns, only while work happens, and still under reduced motion. */
export const Md3AiWorkingIcon = md3Glyph<Md3AiWorkingIconProps>(AiWorkingIcon, "Md3AiWorkingIcon");
/** The "transform" mark (wand_shine): AI actions that change something the user already has. */
export const Md3AiWandIcon = md3Glyph<Md3AiGlyphProps>(AiWandIcon, "Md3AiWandIcon");
/** The "regenerate" mark: run the same AI action again. */
export const Md3AiRegenerateIcon = md3Glyph<Md3AiGlyphProps>(AiRegenerateIcon, "Md3AiRegenerateIcon");
/** The "tool use" mark (Material's build role): on the lines that say which tool the agent used. */
export const Md3AiToolIcon = md3Glyph<Md3AiGlyphProps>(AiToolIcon, "Md3AiToolIcon");

/**
 * Sets the approved glyph for each AI role once for the whole product. It
 * feeds the same context as `AiIconProvider`, so one choice reaches both the
 * shadcn and the Material 3 components.
 */
export function Md3AiIconProvider(props: Md3AiIconProviderProps) {
  return <AiIconProvider {...props} />;
}
Md3AiIconProvider.displayName = "Md3AiIconProvider";

/* -------------------------------------------------------------------------- */
/* Md3AiIcon — a meaning, with its mark and its words                          */
/* -------------------------------------------------------------------------- */

const roleClasses: Record<AiIconRole, string> = {
  "ai-action": "text-md-on-surface [&>svg]:text-md-primary",
  "agent-working":
    "text-md-on-surface-variant [&>svg]:text-md-primary animate-nx-fade-in motion-reduce:animate-none",
  "tool-use":
    "text-md-on-surface-variant [&>svg]:text-md-on-surface-variant animate-nx-fade-in motion-reduce:animate-none",
  // An outlined M3 assist chip carrying the generated mark.
  "generated-content":
    "h-6 rounded-md-sm border border-md-outline-variant bg-transparent px-2 text-xs font-medium tracking-[0.5px] text-md-on-surface [&>svg]:size-3.5 [&>svg]:text-md-primary",
};

/**
 * One AI meaning drawn with its reserved mark and its words, in Material 3
 * roles — the twin of `AiIcon`. The AI-action mark carries `md-primary`;
 * generated content sits in an outlined assist chip; the working line turns
 * its mark and announces its words politely; working and tool lines rise in
 * and hold still under reduced motion. For a control that runs AI use
 * `Md3Iconography`.
 */
export const Md3AiIcon = React.forwardRef<HTMLSpanElement, Md3AiIconProps>(
  ({ role, label, showLabel = true, className, ...props }, ref) => {
    const Glyph = useAiGlyph(role);
    return (
      <span
        ref={ref}
        data-ai-role={role}
        role={role === "agent-working" ? "status" : undefined}
        aria-live={role === "agent-working" ? "polite" : undefined}
        className={cn("inline-flex items-center gap-1.5 text-sm", roleClasses[role], className)}
        {...props}
      >
        <Glyph />
        <span className={showLabel ? undefined : "sr-only"}>{label}</span>
      </span>
    );
  },
);
Md3AiIcon.displayName = "Md3AiIcon";

/* -------------------------------------------------------------------------- */
/* Md3AiIcons — the AI presence mark                                           */
/* -------------------------------------------------------------------------- */

const sizeClasses: Record<AiIconsSize, string> = {
  sm: "size-6 rounded-md-sm text-xs [&>svg]:size-3.5",
  md: "size-8 rounded-md-sm text-sm [&>svg]:size-4",
  lg: "size-10 rounded-md-md text-base [&>svg]:size-5",
};

/**
 * The AI presence mark in Material 3 — the twin of `AiIcons`. `sparkle` is
 * the reserved glyph in a tile (`solid`: the agent's primary-container
 * ground; `outline`: an outline-variant edge); `thinking-orb` is the active
 * state, a primary orb that pulses (still under reduced motion — pair it
 * with words); `branded-mark` carries your product's own letter or shape on
 * the primary role. Never a photo or a human face.
 */
export const Md3AiIcons = React.forwardRef<HTMLSpanElement, Md3AiIconsProps>(
  ({ variant = "sparkle", size = "md", tone = "solid", label, glyph, className, ...props }, ref) => {
    const Sparkle = useAiGlyph("ai-action");
    const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };
    const base = "inline-grid shrink-0 place-items-center font-medium";

    if (variant === "thinking-orb") {
      return (
        <span
          ref={ref}
          data-variant={variant}
          className={cn(
            base,
            sizeClasses[size],
            "rounded-full bg-md-primary ring-4 ring-md-primary-container",
            md3AiColorClasses.working,
            className,
          )}
          {...a11y}
          {...props}
        />
      );
    }

    const toneClasses =
      tone === "solid"
        ? "bg-md-primary-container text-md-primary"
        : "border border-md-outline-variant bg-md-surface text-md-primary";

    if (variant === "branded-mark") {
      const content = glyph ?? (label ? label.charAt(0).toLowerCase() : <Sparkle />);
      return (
        <span
          ref={ref}
          data-variant={variant}
          className={cn(
            base,
            sizeClasses[size],
            tone === "solid" ? "bg-md-primary text-md-on-primary" : toneClasses,
            className,
          )}
          {...a11y}
          {...props}
        >
          {content}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        data-variant={variant}
        className={cn(base, sizeClasses[size], toneClasses, className)}
        {...a11y}
        {...props}
      >
        <Sparkle />
      </span>
    );
  },
);
Md3AiIcons.displayName = "Md3AiIcons";

/* -------------------------------------------------------------------------- */
/* Md3AiIconLegend — the icon language, written down                            */
/* -------------------------------------------------------------------------- */

// Copied from @nucleux/ai-icons (internal there): the approved glyph for a
// role, drawn still — the legend never animates.
function AiLegendGlyph({ role, className }: { role: AiIconRole; className?: string }) {
  const Glyph = useAiGlyph(role);
  return role === "agent-working" ? <AiWorkingIcon still className={className} /> : <Glyph className={className} />;
}

/**
 * The product's icon language in Material 3 — the twin of `AiIconLegend`.
 * An overline heading, then one row per AI meaning: its mark in md-primary
 * at 24, 20 and 16 px, the name in body-large and what it tells people in
 * on-surface-variant, between outline-variant rules. The meaning in use
 * (`current`) sits on surface-container with a primary leading edge.
 */
export const Md3AiIconLegend = React.forwardRef<HTMLElement, Md3AiIconLegendProps>(
  ({ heading = "Icon language", terms = defaultAiIconLegendTerms, current, className, ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} className={cn("text-md-on-surface", className)} {...props}>
        <h3
          id={headingId}
          className="mb-3 mt-0 text-xs font-medium uppercase tracking-[1.5px] text-md-on-surface-variant"
        >
          {heading}
        </h3>
        <ul className="m-0 list-none border-t border-md-outline-variant p-0">
          {terms.map((term) => {
            const here = term.role === current;
            return (
              <li
                key={term.role}
                aria-current={here || undefined}
                className={cn(
                  "flex items-center gap-3 border-b border-l-4 border-b-md-outline-variant py-3 pl-3 pr-2",
                  here ? "border-l-md-primary bg-md-surface-container" : "border-l-transparent",
                )}
              >
                <span aria-hidden="true" className="flex w-[5rem] shrink-0 items-center gap-2 text-md-primary">
                  <AiLegendGlyph role={term.role} className="size-6" />
                  <AiLegendGlyph role={term.role} className="size-5" />
                  <AiLegendGlyph role={term.role} className="size-4" />
                </span>
                <span className="w-44 shrink-0 text-base tracking-[0.15px]">{term.name}</span>
                <span className="text-sm tracking-[0.25px] text-md-on-surface-variant">{term.meaning}</span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);
Md3AiIconLegend.displayName = "Md3AiIconLegend";
