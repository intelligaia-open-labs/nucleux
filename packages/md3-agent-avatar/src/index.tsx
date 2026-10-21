import * as React from "react";
import { cn } from "@nucleux/utils";
import type { AgentAvatarProps, AgentAvatarShape, AgentAvatarSize, AgentAvatarStatus } from "@nucleux/agent-avatar";
import { useAiGlyph } from "@nucleux/md3-ai-icons";
import { md3AiColorClasses } from "@nucleux/md3-color";
import { Md3CircularProgress } from "@nucleux/md3-progress";

export type Md3AgentAvatarProps = AgentAvatarProps;
export type Md3AgentAvatarSize = AgentAvatarSize;
export type Md3AgentAvatarShape = AgentAvatarShape;
export type Md3AgentAvatarStatus = AgentAvatarStatus;

// Same three sizes as the twin (24 / 32 / 40): one drawing at every size.
const sizeClasses: Record<AgentAvatarSize, string> = {
  sm: "size-6 text-[11px] [&_svg]:size-3.5",
  md: "size-8 text-xs [&_svg]:size-4",
  lg: "size-10 text-base [&_svg]:size-5",
};

const ringSize: Record<AgentAvatarSize, number> = { sm: 32, md: 40, lg: 48 };

const dotSizes: Record<AgentAvatarSize, string> = {
  sm: "size-2 border",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
};

const dotColors: Record<AgentAvatarStatus, string> = {
  online: "bg-md-tertiary",
  offline: "bg-md-outline",
  working: cn(md3AiColorClasses.fill, md3AiColorClasses.working),
};

const statusWords: Record<AgentAvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  working: "Working",
};

/**
 * The agent's visual identity in Material 3 — the twin of `AgentAvatar`,
 * with the same API. One stable, non-photographic mark: the reserved AI
 * sparkle in `md-primary` on the agent's `md-primary-container` ground (or
 * an approved image, or a letter), named "<name>, AI agent". `working` puts
 * an indeterminate Md3CircularProgress ring on the mark itself, which stops
 * the moment work stops and holds still under reduced motion; `status` adds
 * a dot whose words are announced in a polite live region. Use
 * `shape="rounded"` where people in the same list are circles.
 */
export const Md3AgentAvatar = React.forwardRef<HTMLSpanElement, Md3AgentAvatarProps>(
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
    const radius = shape === "circle" ? "rounded-full" : "rounded-md-md";
    const label = `${name}, ${descriptor}`;

    return (
      <span
        ref={ref}
        data-shape={shape}
        data-status={status}
        aria-hidden={decorative || undefined}
        className={cn("relative inline-flex shrink-0", radius, className)}
        {...props}
      >
        <span
          role="img"
          aria-label={label}
          aria-hidden={decorative || undefined}
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden bg-md-primary-container font-medium text-md-on-primary-container",
            radius,
            sizeClasses[size],
          )}
        >
          {src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            (glyph ?? <Sparkle className="text-md-primary" />)
          )}
        </span>
        {isWorking && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Md3CircularProgress
              aria-hidden="true"
              size={ringSize[size]}
              strokeWidth={2}
              className="motion-reduce:animate-none"
            />
          </span>
        )}
        {status && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-md-surface",
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
Md3AgentAvatar.displayName = "Md3AgentAvatar";
