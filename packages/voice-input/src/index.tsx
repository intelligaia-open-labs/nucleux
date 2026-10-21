import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { AlertCircle, Check, Loader2, Mic, Pause, Play, RotateCcw, Square, X } from "lucide-react";

/**
 * `"idle"` → `"recording"` (⇄ `"paused"`) → `"transcribing"`; `"error"` when the speech
 * could not be captured or trusted.
 */
export type VoiceInputState = "idle" | "recording" | "paused" | "transcribing" | "error";

/**
 * `"waveform"` (default) — the dictation bar with a live waveform;
 * `"mic-button"` — a compact tap-to-talk control with a clear stop state;
 * `"transcript-stream"` — a panel where the words appear as they are heard.
 */
export type VoiceInputVariant = "waveform" | "mic-button" | "transcript-stream";

export interface VoiceInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Presentation. Defaults to `"waveform"`. */
  variant?: VoiceInputVariant;
  /** Current state of the dictation flow. */
  state?: VoiceInputState;
  /** Elapsed time label while recording, e.g. `"0:12"`. */
  duration?: React.ReactNode;
  /** Transcribed text: the final words (shown while recording in `"transcript-stream"`, and once transcribing). */
  transcript?: React.ReactNode;
  /** Words still being heard (not final) — shown muted after `transcript`, with a caret. */
  interimTranscript?: React.ReactNode;
  /** Called from the idle mic button to start recording. */
  onStart?: () => void;
  /** Called to cancel/discard the recording. Typed text is untouched. */
  onCancel?: () => void;
  /** Called to stop recording and confirm. The transcript goes to the field for review — it never sends. */
  onConfirm?: () => void;
  /** Called to pause capture (mic off, progress kept). Renders a Pause control while recording. */
  onPause?: () => void;
  /** Called to resume a paused recording. */
  onResume?: () => void;
  /** Called from the error state to try again. */
  onRetry?: () => void;
  /** Label shown while idle. Defaults to `"Tap to speak"`. */
  idleLabel?: React.ReactNode;
  /** Label shown while capturing, e.g. `"Aria is listening"`. Defaults to `"Listening"`. */
  listeningLabel?: React.ReactNode;
  /** Message shown in the error state. Defaults to `"Couldn’t make out all of that."`. */
  errorText?: React.ReactNode;
}

const BAR_COUNT = 24;

function Waveform({ paused = false }: { paused?: boolean }) {
  return (
    <div className="flex h-8 flex-1 items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-0.5 flex-1 rounded-full bg-info/70 motion-reduce:animate-none",
            paused ? "opacity-40" : "animate-nx-typing",
          )}
          style={{
            height: `${30 + ((i * 37) % 60)}%`,
            animationDelay: `${(i % 6) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";

const textOf = (node: React.ReactNode, fallback: string) =>
  typeof node === "string" || typeof node === "number" ? String(node) : fallback;

/**
 * Voice input: speech as an input method into the composer — a mic trigger,
 * a clearly lit capturing state (waveform or pulsing stop button, clock, live
 * words), Pause/Resume, Cancel and Stop, then a transcribing state. Stop never
 * sends: the transcript goes to the field for the person to review. State is
 * announced through a polite live region and every animation stops under
 * reduced motion. Variants: waveform, mic-button, transcript-stream.
 * Source: Figma "Expressive Input / Voice Input".
 */
export const VoiceInput = React.forwardRef<HTMLDivElement, VoiceInputProps>(
  (
    {
      variant = "waveform",
      state = "idle",
      duration,
      transcript,
      interimTranscript,
      onStart,
      onCancel,
      onConfirm,
      onPause,
      onResume,
      onRetry,
      idleLabel = "Tap to speak",
      listeningLabel = "Listening",
      errorText = "Couldn’t make out all of that.",
      className,
      ...props
    },
    ref,
  ) => {
    const capturing = state === "recording" || state === "paused";
    const announcement =
      state === "recording"
        ? textOf(listeningLabel, "Listening")
        : state === "paused"
          ? "Paused"
          : state === "transcribing"
            ? "Transcribing"
            : state === "error"
              ? textOf(errorText, "Voice input failed")
              : "";

    const liveRegion = (
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    );

    const startButton = (
      <button
        type="button"
        aria-label="Start dictation"
        onClick={onStart}
        className={cn(iconButton, "bg-muted text-foreground hover:bg-accent")}
      >
        <Mic aria-hidden="true" />
      </button>
    );

    const cancelButton = (
      <button
        type="button"
        aria-label="Cancel dictation"
        onClick={onCancel}
        className={cn(iconButton, "text-muted-foreground hover:bg-accent hover:text-foreground")}
      >
        <X aria-hidden="true" />
      </button>
    );

    const pauseButton =
      state === "paused"
        ? onResume && (
            <Button variant="ghost" size="icon" aria-label="Resume dictation" onClick={onResume} className="rounded-full">
              <Play className="size-4" aria-hidden="true" />
            </Button>
          )
        : onPause && (
            <Button variant="ghost" size="icon" aria-label="Pause dictation" onClick={onPause} className="rounded-full">
              <Pause className="size-4" aria-hidden="true" />
            </Button>
          );

    const transcribing = (
      <>
        <Loader2
          className="size-4 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="flex-1 truncate text-sm text-muted-foreground">{transcript ?? "Transcribing…"}</span>
      </>
    );

    const error = (
      <>
        <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
        <span className="flex-1 truncate text-sm text-destructive">{errorText}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
        {onCancel && cancelButton}
      </>
    );

    if (variant === "transcript-stream") {
      return (
        <div
          ref={ref}
          className={cn("flex flex-col gap-2 rounded-xl border border-border bg-background px-4 py-3", className)}
          role="group"
          aria-label="Voice input"
          data-state={state}
          data-variant={variant}
          {...props}
        >
          {state === "idle" ? (
            <div className="flex items-center gap-3">
              {startButton}
              <span className="flex-1 text-sm text-muted-foreground">{idleLabel}</span>
            </div>
          ) : state === "error" ? (
            <div className="flex items-center gap-2">{error}</div>
          ) : (
            <>
              <p className="min-h-5 text-sm leading-5 text-foreground">
                {transcript}
                {interimTranscript && (
                  <>
                    {transcript ? " " : null}
                    <span className="italic text-muted-foreground">{interimTranscript}</span>
                  </>
                )}
                {capturing && (
                  <span
                    aria-hidden="true"
                    className="ml-px inline-block h-3.5 w-0.5 translate-y-0.5 bg-brand animate-nx-caret-blink motion-reduce:animate-none"
                  />
                )}
              </p>
              <div className="flex items-center gap-2">
                {state === "transcribing" ? (
                  <>
                    <Loader2
                      className="size-3.5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-xs text-muted-foreground">Transcribing…</span>
                  </>
                ) : (
                  <>
                    <Mic className={cn("size-3.5 shrink-0", state === "paused" ? "text-muted-foreground" : "text-destructive")} aria-hidden="true" />
                    <span className="flex-1 text-xs text-muted-foreground">
                      {state === "paused" ? "Paused" : listeningLabel}
                      {duration && <span className="tabular-nums"> · {duration}</span>}
                    </span>
                    {pauseButton}
                    {onCancel && cancelButton}
                    <Button variant="cta" size="sm" onClick={onConfirm} leftIcon={<Check className="size-4" aria-hidden="true" />}>
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
          {liveRegion}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-full border border-border bg-background px-3 py-2",
          className,
        )}
        role="group"
        aria-label="Voice input"
        data-state={state}
        data-variant={variant}
        {...props}
      >
        {state === "idle" && (
          <>
            {startButton}
            <span className="flex-1 text-sm text-muted-foreground">{idleLabel}</span>
          </>
        )}

        {capturing && variant === "waveform" && (
          <>
            {cancelButton}
            <Waveform paused={state === "paused"} />
            {duration && <span className="text-sm tabular-nums text-muted-foreground">{duration}</span>}
            {pauseButton}
            <button
              type="button"
              aria-label="Stop and use recording"
              onClick={onConfirm}
              className={cn(iconButton, "bg-info text-info-foreground hover:bg-info/90")}
            >
              <Check aria-hidden="true" />
            </button>
          </>
        )}

        {capturing && variant === "mic-button" && (
          <>
            {cancelButton}
            <span className="flex flex-1 items-center gap-2 text-sm text-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full bg-destructive",
                  state === "recording" ? "animate-pulse motion-reduce:animate-none" : "opacity-40",
                )}
              />
              {state === "paused" ? "Paused" : listeningLabel}
              {duration && <span className="tabular-nums text-muted-foreground">· {duration}</span>}
            </span>
            {pauseButton}
            <button
              type="button"
              aria-label="Stop and use recording"
              onClick={onConfirm}
              className={cn(
                iconButton,
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                state === "recording" && "animate-pulse motion-reduce:animate-none",
              )}
            >
              <Square className="fill-current" aria-hidden="true" />
            </button>
          </>
        )}

        {state === "transcribing" && transcribing}
        {state === "error" && error}
        {liveRegion}
      </div>
    );
  },
);
VoiceInput.displayName = "VoiceInput";
