import * as React from "react";
import { cn } from "@nucleux/utils";
import { Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal } from "lucide-react";

export type FeedbackRating = "up" | "down";

export interface InlineFeedbackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current rating (controlled). */
  rating?: FeedbackRating | null;
  /** Initial rating (uncontrolled). */
  defaultRating?: FeedbackRating | null;
  /** Called when the user rates the response. */
  onRate?: (rating: FeedbackRating) => void;
  /** Called when the copy control is used. Hidden if omitted. */
  onCopy?: () => void;
  /** Called when the regenerate control is used. Hidden if omitted. */
  onRegenerate?: () => void;
  /** Called when the more-actions control is used. Hidden if omitted. */
  onMore?: () => void;
}

function Action({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
        pressed && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * A compact toolbar beneath an AI response: copy, rate (thumbs up/down) and
 * regenerate — the feedback + re-run affordances specific to generated output.
 * Source: Figma "Expressive Input / Inline Feedback Controls".
 */
export const InlineFeedback = React.forwardRef<HTMLDivElement, InlineFeedbackProps>(
  ({ rating, defaultRating = null, onRate, onCopy, onRegenerate, onMore, className, ...props }, ref) => {
    const [internal, setInternal] = React.useState<FeedbackRating | null>(defaultRating);
    const current = rating !== undefined ? rating : internal;
    const rate = (value: FeedbackRating) => {
      if (rating === undefined) setInternal(value);
      onRate?.(value);
    };
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Response feedback"
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {onCopy && (
          <Action label="Copy" onClick={onCopy}>
            <Copy aria-hidden="true" />
          </Action>
        )}
        <Action label="Good response" pressed={current === "up"} onClick={() => rate("up")}>
          <ThumbsUp aria-hidden="true" />
        </Action>
        <Action label="Bad response" pressed={current === "down"} onClick={() => rate("down")}>
          <ThumbsDown aria-hidden="true" />
        </Action>
        {onRegenerate && (
          <Action label="Regenerate" onClick={onRegenerate}>
            <RotateCw aria-hidden="true" />
          </Action>
        )}
        {onMore && (
          <Action label="More" onClick={onMore}>
            <MoreHorizontal aria-hidden="true" />
          </Action>
        )}
      </div>
    );
  },
);
InlineFeedback.displayName = "InlineFeedback";
