import * as React from "react";
import { cn } from "@nucleux/utils";
import { Play, Pause } from "lucide-react";

export interface AudioMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether audio is currently playing (controls the play/pause glyph + animation). */
  playing?: boolean;
  /** Duration or elapsed label, e.g. `"0:42"`. */
  duration?: React.ReactNode;
  /** Transcript excerpt shown below the player. */
  transcript?: React.ReactNode;
  /** Called when the play/pause control is used. */
  onPlayToggle?: () => void;
}

const BARS = [40, 70, 55, 90, 60, 35, 75, 50, 85, 45, 65, 30, 80, 55, 70, 40, 60, 50];

/**
 * A player for AI-generated spoken output — play/pause, a waveform, duration,
 * and an optional transcript.
 * Source: Figma "Output & Processing / Audio player output".
 */
export const AudioMessage = React.forwardRef<HTMLDivElement, AudioMessageProps>(
  ({ playing = false, duration, transcript, onPlayToggle, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 rounded-xl border border-border bg-background p-3", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          aria-pressed={playing}
          onClick={onPlayToggle}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-info text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <div className="flex h-8 flex-1 items-center gap-0.5" aria-hidden="true">
          {BARS.map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-1 flex-1 rounded-full bg-info/60",
                playing && "animate-nx-typing",
              )}
              style={{ height: `${h}%`, animationDelay: `${(i % 6) * 90}ms` }}
            />
          ))}
        </div>
        {duration && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{duration}</span>}
      </div>
      {transcript && <p className="text-sm leading-relaxed text-muted-foreground">{transcript}</p>}
    </div>
  ),
);
AudioMessage.displayName = "AudioMessage";
