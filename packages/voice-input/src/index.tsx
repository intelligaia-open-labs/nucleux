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
  /**
   * `"transcript-stream"`: the small heading over the words. Defaults to
   * `"Live transcript"` in `VoiceInput` (none in `Md3VoiceInput`); `null` hides it.
   */
  transcriptLabel?: React.ReactNode;
  /**
   * `"transcript-stream"`: how to stop, after the listening label in the status
   * line ("Aria is listening · tap to stop"). Defaults to `"tap to stop"` in
   * `VoiceInput` (none in `Md3VoiceInput`); `null` hides it.
   */
  stopHint?: React.ReactNode;
}

/** Bar heights (px) of the transcript panel's level meter, as on nucleux.in. */
export const VOICE_INPUT_LEVELS = [18, 28, 14, 34, 22, 30, 12, 26, 32, 16, 24, 20, 28, 14, 30, 18, 22];

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
 * reduced motion. Variants: waveform, mic-button, transcript-stream (a panel:
 * "Live transcript" over the words, a level meter with the clock and a lit
 * mic that stops, and a status line, "Aria is listening · tap to stop").
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
      transcriptLabel = "Live transcript",
      stopHint = "tap to stop",
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
      const paused = state === "paused";
      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col overflow-hidden rounded-[14px] border border-border bg-background leading-[1.55]",
            (state === "idle" || state === "error") && "px-4 py-3",
            className,
          )}
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
              <div className="px-[1.125rem] pb-3 pt-4">
                {transcriptLabel != null && (
                  <p className="mb-2 text-[0.625rem] font-semibold uppercase leading-[1.55] tracking-[0.1em] text-faint">
                    {transcriptLabel}
                  </p>
                )}
                <p className="min-h-5 text-[13px] leading-5 text-foreground">
                  {transcript}
                  {interimTranscript && (
                    <>
                      {transcript ? " " : null}
                      <span className="italic text-faint">{interimTranscript}</span>
                    </>
                  )}
                  {capturing && (
                    <span
                      aria-hidden="true"
                      className="ml-px inline-block h-[13px] w-0.5 rounded-[1px] bg-brand align-middle animate-nx-caret-blink motion-reduce:animate-none"
                    />
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-border px-[1.125rem] py-3">
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
                    <div className="flex h-9 flex-1 items-center gap-[3px]" aria-hidden="true">
                      {VOICE_INPUT_LEVELS.map((h, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-[3px] rounded-full bg-brand motion-reduce:animate-none",
                            paused ? "opacity-40" : "animate-nx-typing",
                          )}
                          style={{ height: h, animationDelay: `${i * 60}ms` }}
                        />
                      ))}
                    </div>
                    {duration && <span className="shrink-0 text-[11px] tabular-nums text-faint">{duration}</span>}
                    {pauseButton}
                    {onCancel && cancelButton}
                    <button
                      type="button"
                      aria-label="Stop and use recording"
                      onClick={onConfirm}
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-3.5",
                        paused
                          ? "bg-muted text-foreground hover:bg-accent"
                          : "bg-destructive text-destructive-foreground ring-4 ring-destructive/20 hover:bg-destructive/90",
                      )}
                    >
                      <Mic aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
              {state !== "transcribing" && (
                <p className="flex items-center gap-[5px] border-t border-border bg-[hsl(var(--nx-ink-25))] px-[1.125rem] py-2 text-[10.5px] leading-[1.55] text-faint">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 shrink-0 rounded-full", paused ? "bg-muted-foreground/40" : "bg-destructive")}
                  />
                  {paused ? "Paused" : listeningLabel}
                  {stopHint != null && !paused && <> · {stopHint}</>}
                </p>
              )}
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
