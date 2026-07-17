import * as React from "react";
import { cn } from "@nucleux/utils";

export interface StreamingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text produced so far. */
  text: string;
  /** Show the blinking caret (typically true while tokens are still arriving). */
  streaming?: boolean;
}

/**
 * Renders streamed model output with an optional blinking caret. The caret is
 * a pure CSS animation (see the `nx-caret-blink` keyframe in the preset), so it
 * costs nothing while idle.
 */
export const StreamingText = React.forwardRef<HTMLSpanElement, StreamingTextProps>(
  ({ text, streaming = false, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        aria-live={streaming ? "polite" : undefined}
        className={cn("whitespace-pre-wrap break-words", className)}
        {...props}
      >
        {text}
        {streaming && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-current align-baseline animate-nx-caret-blink"
          />
        )}
      </span>
    );
  },
);
StreamingText.displayName = "StreamingText";
