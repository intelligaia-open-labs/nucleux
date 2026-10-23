import * as React from "react";
import { cn } from "@nucleux/utils";
import { Avatar } from "@nucleux/avatar";
import { AiColorWorkingRing, aiColorClasses } from "@nucleux/color";
import { useAiGlyph } from "@nucleux/ai-icons";

export type AgentAvatarSize = "sm" | "md" | "lg" | "xl";
export type AgentAvatarShape = "circle" | "rounded";
export type AgentAvatarStatus = "online" | "offline" | "working";

const sizeClasses: Record<AgentAvatarSize, string> = {
  sm: "size-6 text-[10px] [&_svg]:size-3.5",
  md: "size-8 text-xs [&_svg]:size-4",
  lg: "size-10 text-base [&_svg]:size-5",
  xl: "size-11 text-base [&_svg]:size-5",
};

const dotSizes: Record<AgentAvatarSize, string> = {
  sm: "size-2 border",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "size-3 border-2",
};

const dotColors: Record<AgentAvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  working: cn(aiColorClasses.fill, aiColorClasses.working),
};

const statusWords: Record<AgentAvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  working: "Working",
};

export interface AgentAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The agent's name ("Aria"). Part of the accessible name: "Aria, AI agent". */
  name: string;
  /** An approved, non-photographic mark image. Never a photo or a human face. */
  src?: string;
  /** What to draw inside the mark when there is no `src`: the reserved AI sparkle by default, or a letter ("A"). */
  glyph?: React.ReactNode;
  /** 24 / 32 / 40 / 44 px — the same drawing at every size. `xl` is the header-chip size. */
  size?: AgentAvatarSize;
  /** `circle` (default) or `rounded` square — use `rounded` when people in the same list are circles. */
  shape?: AgentAvatarShape;
  /**
   * The agent is working (the `animated-mark` variant): the working ring
   * pulses on the mark itself and stops the moment work stops. Still under
   * reduced motion; the words carry it.
   */
  working?: boolean;
  /**
   * Live state shown as a dot on the mark (the `status-aware` variant):
   * `online`, `offline` or `working`. The dot never travels alone — its
   * words are announced in a polite live region (see `statusLabel`).
   */
  status?: AgentAvatarStatus;
  /** Words for the state ("Online · ready", "Generating…"). Defaults to Online / Offline / Working. */
  statusLabel?: string;
  /** What kind of thing this is, appended to the name: "AI agent" by default. */
  descriptor?: string;
  /** Hide the mark from assistive tech when the name is already written beside it (e.g. in an AgentName lockup). */
  decorative?: boolean;
}

/**
 * The agent's visual identity: one stable, non-photographic mark — the
 * reserved AI sparkle, an approved image or a letter — that represents the
 * AI wherever a "from" attribution exists. Three variants by props: the
 * plain `circular-mark`, the `animated-mark` (`working`, using the AI
 * working treatment from `@nucleux/color`) and the `status-aware` mark
 * (`status`, a dot plus announced words). Built on Avatar.
 */
export const AgentAvatar = React.forwardRef<HTMLSpanElement, AgentAvatarProps>(
  (
    {
      name,
      src,
      glyph,
      size = "md",
      shape = "circle",
      working = false,
      status,
      statusLabel,
      descriptor = "AI agent",
      decorative = false,
      className,
      ...props
    },
    ref,
  ) => {
    const Sparkle = useAiGlyph("ai-action");
    const isWorking = working || status === "working";
    const words = statusLabel ?? (status ? statusWords[status] : isWorking ? statusWords.working : undefined);
    const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

    return (
      <span
        ref={ref}
        data-shape={shape}
        data-status={status}
        aria-hidden={decorative || undefined}
        className={cn("relative inline-flex shrink-0", radius, className)}
        {...props}
      >
        <Avatar
          role="assistant"
          shape={shape}
          src={src}
          alt={`${name}, ${descriptor}`}
          aria-hidden={decorative || undefined}
          className={cn(
            // nucleux.in: a 135° ink gradient (ink-950 → ink-600) carrying a white mark.
            "bg-[linear-gradient(135deg,hsl(var(--nx-ink-950)),hsl(var(--nx-ink-600)))] font-semibold text-[hsl(var(--nx-ink-0))]",
            sizeClasses[size],
          )}
        >
          {src ? undefined : (glyph ?? <Sparkle className="text-brand-muted" />)}
        </Avatar>
        {isWorking && <AiColorWorkingRing className="-inset-[3px]" />}
        {status && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-background",
              dotSizes[size],
              dotColors[status],
            )}
          />
        )}
        {!decorative && (
          <span role="status" className="sr-only">
            {words ?? ""}
          </span>
        )}
      </span>
    );
  },
);
AgentAvatar.displayName = "AgentAvatar";
