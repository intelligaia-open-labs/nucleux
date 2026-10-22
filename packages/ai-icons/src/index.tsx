import * as React from "react";
import { RefreshCw, WandSparkles, Wrench } from "lucide-react";
import { cn } from "@nucleux/utils";
import { aiColorClasses } from "@nucleux/color";

/* -------------------------------------------------------------------------- */
/* Glyphs                                                                      */
/* -------------------------------------------------------------------------- */

export type AiGlyphProps = React.SVGProps<SVGSVGElement>;

/** Decorative unless the caller names it. */
function glyphA11y(props: AiGlyphProps) {
  const named = props["aria-label"] != null || props["aria-labelledby"] != null;
  return named ? { role: "img" as const } : { "aria-hidden": true as const };
}

/**
 * The four-point AI sparkle — the reserved mark for "this runs AI" (generate).
 * The same drawing appears on the agent avatar and the disclosure chip.
 * Decorative (`aria-hidden`) unless given an `aria-label`.
 */
export const AiSparkleIcon = React.forwardRef<SVGSVGElement, AiGlyphProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    width={16}
    height={16}
    fill="currentColor"
    focusable="false"
    data-ai-glyph="sparkle"
    className={cn("size-4 shrink-0", className)}
    {...glyphA11y(props)}
    {...props}
  >
    <path d="M12 3c.6 4.8 3.2 7.4 9 9-5.8 1.6-8.4 4.2-9 9-.6-4.8-3.2-7.4-9-9 5.8-1.6 8.4-4.2 9-9z" />
  </svg>
));
AiSparkleIcon.displayName = "AiSparkleIcon";

/**
 * The "generated with AI" mark: a content outline carrying the sparkle. Used
 * only on content AI wrote or changed, never on controls.
 */
export const AiGeneratedIcon = React.forwardRef<SVGSVGElement, AiGlyphProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    width={16}
    height={16}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinejoin="round"
    focusable="false"
    data-ai-glyph="generated"
    className={cn("size-4 shrink-0", className)}
    {...glyphA11y(props)}
    {...props}
  >
    <path d="M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path
      d="M12 6.5c.3 2.2 1.3 3.2 3.5 3.5-2.2.3-3.2 1.3-3.5 3.5-.3-2.2-1.3-3.2-3.5-3.5 2.2-.3 3.2-1.3 3.5-3.5z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
));
AiGeneratedIcon.displayName = "AiGeneratedIcon";

export interface AiWorkingIconProps extends AiGlyphProps {
  /** Hold the mark still (it only turns while work is happening). */
  still?: boolean;
}

/**
 * The "agent working" mark: a turning arc. The only AI mark that moves, and
 * only while work is happening; it holds still under reduced motion.
 */
export const AiWorkingIcon = React.forwardRef<SVGSVGElement, AiWorkingIconProps>(
  ({ still = false, className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      focusable="false"
      data-ai-glyph="working"
      className={cn("size-4 shrink-0", !still && "animate-spin motion-reduce:animate-none", className)}
      {...glyphA11y(props)}
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" opacity={0.25} />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
    </svg>
  ),
);
AiWorkingIcon.displayName = "AiWorkingIcon";

function lucideGlyph(Icon: React.ComponentType<AiGlyphProps>, name: string, displayName: string) {
  const Glyph = React.forwardRef<SVGSVGElement, AiGlyphProps>(({ className, ...props }, ref) => (
    <Icon
      ref={ref}
      focusable="false"
      data-ai-glyph={name}
      className={cn("size-4 shrink-0", className)}
      {...glyphA11y(props)}
      {...props}
    />
  ));
  Glyph.displayName = displayName;
  return Glyph;
}

/** The "transform" mark (wand): for AI actions that change something the user already has — rewrite, enhance, restyle. */
export const AiWandIcon = lucideGlyph(
  WandSparkles as unknown as React.ComponentType<AiGlyphProps>,
  "wand",
  "AiWandIcon",
);
/** The "regenerate" mark: run the same AI action again. */
export const AiRegenerateIcon = lucideGlyph(
  RefreshCw as unknown as React.ComponentType<AiGlyphProps>,
  "regenerate",
  "AiRegenerateIcon",
);
/** The "tool use" mark: on the lines that say which tool the agent used. */
export const AiToolIcon = lucideGlyph(Wrench as unknown as React.ComponentType<AiGlyphProps>, "tool", "AiToolIcon");

/* -------------------------------------------------------------------------- */
/* Roles and the approved glyph lists                                          */
/* -------------------------------------------------------------------------- */

/** The four AI meanings. Each has its own mark, used for that meaning only. */
export type AiIconRole = "ai-action" | "generated-content" | "agent-working" | "tool-use";

/** Every reserved glyph by name. */
export type AiGlyphName = "sparkle" | "wand" | "regenerate" | "generated" | "working" | "tool";

/**
 * Approved glyphs per role. The lists do not overlap, so two meanings can
 * never share a mark.
 */
export interface AiIconGlyphs {
  "ai-action"?: "sparkle" | "wand";
  "generated-content"?: "generated";
  "agent-working"?: "working";
  "tool-use"?: "tool";
}

/** The reserved glyph components, by name. */
export const aiGlyphs: Record<AiGlyphName, React.ComponentType<AiGlyphProps>> = {
  sparkle: AiSparkleIcon,
  wand: AiWandIcon,
  regenerate: AiRegenerateIcon,
  generated: AiGeneratedIcon,
  working: AiWorkingIcon,
  tool: AiToolIcon,
};

/** The default glyph for each role. */
export const defaultAiIconGlyphs: Required<AiIconGlyphs> = {
  "ai-action": "sparkle",
  "generated-content": "generated",
  "agent-working": "working",
  "tool-use": "tool",
};

const AiIconContext = React.createContext<Required<AiIconGlyphs>>(defaultAiIconGlyphs);

export interface AiIconProviderProps {
  /** Product-wide choice of approved glyph per role. Set once; unset roles keep the default. */
  glyphs?: AiIconGlyphs;
  children?: React.ReactNode;
}

/**
 * Sets the approved glyph for each AI role once for the whole product.
 * Every `AiIcon`, `AiIcons`, `Iconography` and `Disclosure` under it uses
 * the same choice, so a meaning keeps one mark everywhere.
 */
export function AiIconProvider({ glyphs, children }: AiIconProviderProps) {
  const value = React.useMemo(() => ({ ...defaultAiIconGlyphs, ...glyphs }), [glyphs]);
  return <AiIconContext.Provider value={value}>{children}</AiIconContext.Provider>;
}
AiIconProvider.displayName = "AiIconProvider";

/** The glyph component the nearest `AiIconProvider` approved for a role. */
export function useAiGlyph(role: AiIconRole): React.ComponentType<AiGlyphProps> {
  const glyphs = React.useContext(AiIconContext);
  return aiGlyphs[glyphs[role]];
}

/* -------------------------------------------------------------------------- */
/* AiIcon — a meaning, with its mark and its words                             */
/* -------------------------------------------------------------------------- */

export interface AiIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "role"> {
  /**
   * Which AI meaning this is: `ai-action` (a control runs AI),
   * `generated-content` (AI wrote this), `agent-working` (the agent is
   * working now — announced politely) or `tool-use` (the agent used a tool).
   */
  role: AiIconRole;
  /** The words that travel with the mark ("Rewrite", "Generated with AI", "Rewriting release note…"). Required: a mark is never alone. */
  label: React.ReactNode;
  /** Show the words visibly (default) or keep them for assistive tech only. */
  showLabel?: boolean;
}

const roleClasses: Record<AiIconRole, string> = {
  "ai-action": "text-foreground [&>svg]:text-brand",
  "agent-working": "text-foreground [&>svg]:text-brand",
  "tool-use": "text-muted-foreground",
  "generated-content":
    "rounded-full border border-brand/30 bg-background px-2 py-0.5 text-xs font-medium text-foreground [&>svg]:size-3.5 [&>svg]:text-brand",
};

/**
 * One AI meaning drawn with its reserved mark and its words. The product
 * names the meaning; the component maps it to the approved glyph (see
 * `AiIconProvider`). `agent-working` turns its mark and announces its words
 * in a polite live region; the rest are static. For a control that runs
 * AI, use `Iconography`, which puts the `ai-action` mark on a Button.
 */
export const AiIcon = React.forwardRef<HTMLSpanElement, AiIconProps>(
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
AiIcon.displayName = "AiIcon";

/* -------------------------------------------------------------------------- */
/* AiIcons — the AI presence mark                                              */
/* -------------------------------------------------------------------------- */

export type AiIconsVariant = "sparkle" | "thinking-orb" | "branded-mark";
export type AiIconsSize = "sm" | "md" | "lg";
export type AiIconsTone = "solid" | "outline";

const sizeClasses: Record<AiIconsSize, string> = {
  sm: "size-6 text-xs [&>svg]:size-3.5",
  md: "size-8 text-sm [&>svg]:size-4",
  lg: "size-10 text-lg [&>svg]:size-5",
};

export interface AiIconsProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * `sparkle` (the universal "AI" mark in a tile), `thinking-orb` (an
   * animated orb for active, listening or generating states) or
   * `branded-mark` (your product's own shape or letter).
   */
  variant?: AiIconsVariant;
  /** 24 / 32 / 40 px. */
  size?: AiIconsSize;
  /** `solid` (filled tile) or `outline` (bordered tile). Sparkle and branded mark only. */
  tone?: AiIconsTone;
  /** Accessible name. Omit when words sit beside the mark — it is then decorative. */
  label?: string;
  /** Content of the branded mark (a letter or your SVG). Defaults to the first letter of `label`, else the sparkle. */
  glyph?: React.ReactNode;
}

/**
 * The AI presence mark: one stable symbol that tells people the AI is here.
 * `sparkle` is the default; `thinking-orb` is the active state — a dark orb
 * with a soft halo that pulses
 * (still under reduced motion — pair it with words such as an `AiIcon`
 * `agent-working` line); `branded-mark` carries your product's own shape.
 * Never a photo or a human face.
 */
export const AiIcons = React.forwardRef<HTMLSpanElement, AiIconsProps>(
  ({ variant = "sparkle", size = "md", tone = "solid", label, glyph, className, ...props }, ref) => {
    const Sparkle = useAiGlyph("ai-action");
    const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };
    const base = "inline-grid shrink-0 place-items-center font-semibold";

    if (variant === "thinking-orb") {
      return (
        <span
          ref={ref}
          data-variant={variant}
          className={cn(
            base,
            "rounded-full bg-gradient-to-br from-primary/80 to-primary ring-4 ring-primary/10",
            aiColorClasses.working,
            sizeClasses[size],
            className,
          )}
          {...a11y}
          {...props}
        />
      );
    }

    const toneClasses =
      tone === "solid"
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-background text-foreground";

    if (variant === "branded-mark") {
      const content = glyph ?? (label ? label.charAt(0).toLowerCase() : <Sparkle />);
      return (
        <span
          ref={ref}
          data-variant={variant}
          className={cn(
            base,
            "rounded-[28%] font-serif italic",
            tone === "solid" ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground" : toneClasses,
            sizeClasses[size],
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
        className={cn(base, "rounded-[22%]", toneClasses, sizeClasses[size], className)}
        {...a11y}
        {...props}
      >
        <Sparkle />
      </span>
    );
  },
);
AiIcons.displayName = "AiIcons";

/* -------------------------------------------------------------------------- */
/* AiIconLegend — the icon language, written down                              */
/* -------------------------------------------------------------------------- */

export interface AiIconLegendTerm {
  /** The AI meaning this row explains. */
  role: AiIconRole;
  /** Its name — "AI action". */
  name: React.ReactNode;
  /** What it tells people — "Pressing this runs AI on something specific." */
  meaning: React.ReactNode;
}

/** The four meanings in the words nucleux.in uses. */
export const defaultAiIconLegendTerms: AiIconLegendTerm[] = [
  { role: "ai-action", name: "AI action", meaning: "Pressing this runs AI on something specific." },
  { role: "generated-content", name: "AI-generated content", meaning: "This content was created or changed by AI." },
  { role: "agent-working", name: "Agent working", meaning: "The agent is currently performing work." },
  { role: "tool-use", name: "Tool use", meaning: "The agent used another tool or system." },
];

export interface AiIconLegendProps extends React.HTMLAttributes<HTMLElement> {
  /** Heading. Default "Icon language". */
  heading?: React.ReactNode;
  /** The rows. Defaults to {@link defaultAiIconLegendTerms}. */
  terms?: AiIconLegendTerm[];
  /** The meaning in use on this screen; its row is highlighted and marked `aria-current`. */
  current?: AiIconRole;
}

/** The approved glyph for a role, drawn still (the legend never animates). */
function AiLegendGlyph({ role, className }: { role: AiIconRole; className?: string }) {
  const Glyph = useAiGlyph(role);
  return role === "agent-working" ? <AiWorkingIcon still className={className} /> : <Glyph className={className} />;
}

/**
 * The product's icon language, written down: each AI meaning with its mark
 * at 24, 20 and 16 px, its name and what it tells people. Put it in
 * onboarding, help or settings so the marks are learned once. Highlight the
 * meaning in use with `current`. Uses the glyphs the nearest
 * `AiIconProvider` approved.
 */
export const AiIconLegend = React.forwardRef<HTMLElement, AiIconLegendProps>(
  ({ heading = "Icon language", terms = defaultAiIconLegendTerms, current, className, ...props }, ref) => {
    const headingId = React.useId();
    return (
      <section ref={ref} aria-labelledby={headingId} className={cn("text-foreground", className)} {...props}>
        <h3 id={headingId} className="mb-3 mt-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </h3>
        <ul className="m-0 list-none border-t border-border p-0">
          {terms.map((term) => {
            const here = term.role === current;
            return (
              <li
                key={term.role}
                aria-current={here || undefined}
                className={cn(
                  "flex items-center gap-4 border-b border-l-[3px] border-b-border px-3 py-2.5 text-sm",
                  here ? "border-l-brand bg-muted" : "border-l-transparent",
                )}
              >
                <span aria-hidden="true" className="flex w-[5.5rem] shrink-0 items-center gap-2.5 text-brand">
                  <AiLegendGlyph role={term.role} className="size-6" />
                  <AiLegendGlyph role={term.role} className="size-5" />
                  <AiLegendGlyph role={term.role} className="size-4" />
                </span>
                <span className="w-40 shrink-0 font-medium">{term.name}</span>
                <span className="text-muted-foreground">{term.meaning}</span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);
AiIconLegend.displayName = "AiIconLegend";
