import * as React from "react";
import { cn } from "@nucleux/utils";
import { Mic, X, Check, Loader2 } from "lucide-react";

export type VoiceInputState = "idle" | "recording" | "transcribing";

export interface VoiceInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current state of the dictation flow. */
  state?: VoiceInputState;
  /** Elapsed time label while recording, e.g. `"0:12"`. */
  duration?: React.ReactNode;
  /** Transcribed text shown once available. */
  transcript?: React.ReactNode;
  /** Called from the idle mic button to start recording. */
  onStart?: () => void;
  /** Called to cancel/discard the recording. */
  onCancel?: () => void;
  /** Called to stop recording and confirm. */
  onConfirm?: () => void;
}

const BAR_COUNT = 24;

function Waveform() {
  return (
    <div className="flex h-8 flex-1 items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className="w-0.5 flex-1 rounded-full bg-info/70 animate-nx-typing"
          style={{
            height: `${30 + ((i * 37) % 60)}%`,
            animationDelay: `${(i % 6) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * A composer in a live-dictation state — mic trigger, animated waveform while
 * recording, and a transcribing state — for voice input to the agent.
 * Source: Figma "Expressive Input / Voice Input".
 */
export const VoiceInput = React.forwardRef<HTMLDivElement, VoiceInputProps>(
  ({ state = "idle", duration, transcript, onStart, onCancel, onConfirm, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-full border border-border bg-background px-3 py-2",
        className,
      )}
      role="group"
      aria-label="Voice input"
      {...props}
    >
      {state === "idle" && (
        <>
          <button
            type="button"
            aria-label="Start dictation"
            onClick={onStart}
            className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
          >
            <Mic aria-hidden="true" />
          </button>
          <span className="flex-1 text-sm text-muted-foreground">Tap to speak</span>
        </>
      )}

      {state === "recording" && (
        <>
          <button
            type="button"
            aria-label="Cancel dictation"
            onClick={onCancel}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
          >
            <X aria-hidden="true" />
          </button>
          <Waveform />
          {duration && <span className="text-sm tabular-nums text-muted-foreground">{duration}</span>}
          <button
            type="button"
            aria-label="Stop and use recording"
            onClick={onConfirm}
            className="inline-flex size-9 items-center justify-center rounded-full bg-info text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
          >
            <Check aria-hidden="true" />
          </button>
        </>
      )}

      {state === "transcribing" && (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="flex-1 truncate text-sm text-muted-foreground">
            {transcript ?? "Transcribing…"}
          </span>
        </>
      )}
    </div>
  ),
);
VoiceInput.displayName = "VoiceInput";
