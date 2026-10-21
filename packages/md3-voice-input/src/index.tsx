import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";
import type { VoiceInputProps } from "@nucleux/voice-input";
import { AlertCircle, Check, Mic, Pause, Play, RotateCcw, Square, X } from "lucide-react";

// Same API as the shadcn twin: the props and unions are the twin's own types.
export type Md3VoiceInputProps = VoiceInputProps;
export type {
  VoiceInputState as Md3VoiceInputState,
  VoiceInputVariant as Md3VoiceInputVariant,
} from "@nucleux/voice-input";

const BAR_COUNT = 24;

/** The level meter: secondary bars — the human's colour, because only a person can turn the mic on. */
function Waveform({ paused = false }: { paused?: boolean }) {
  return (
    <div className="relative flex h-8 flex-1 items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] flex-1 rounded-full bg-md-secondary transition-opacity duration-300 motion-reduce:animate-none",
            paused ? "opacity-[0.38]" : "animate-nx-typing",
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

/**
 * The soft, low-contrast gradient behind the bar while the microphone is on.
 * Pause dims it; it is gone the moment voice ends. Still under reduced motion.
 */
function VoiceGlow({ state }: { state: NonNullable<VoiceInputProps["state"]> }) {
  const on = state === "recording" || state === "paused" || state === "transcribing";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-r from-md-secondary-container via-md-primary-container to-md-tertiary-container",
        "transition-opacity duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
        state === "recording" && "animate-pulse [animation-duration:3s] motion-reduce:animate-none",
        on ? (state === "paused" ? "opacity-20" : "opacity-50") : "opacity-0",
      )}
    />
  );
}

const textOf = (node: React.ReactNode, fallback: string) =>
  typeof node === "string" || typeof node === "number" ? String(node) : fallback;

/**
 * Material 3 voice input: speech as an input method into the composer — a mic
 * trigger, a clearly lit capturing state (secondary waveform or pulsing error
 * stop button, clock, live words over a soft gradient that answers the voice),
 * Pause/Resume, Cancel and Stop, then a transcribing state with the MD3 loading
 * indicator. Stop never sends: the transcript goes to the field for the person
 * to review. State is announced through a polite live region and every
 * animation stops under reduced motion. Shares its API with `VoiceInput` from
 * `@nucleux/voice-input`. Variants: waveform, mic-button, transcript-stream.
 */
export const Md3VoiceInput = React.forwardRef<HTMLDivElement, Md3VoiceInputProps>(
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
      <Md3IconButton
        aria-label="Start dictation"
        onClick={onStart}
        className="shrink-0 bg-md-surface-container-high text-md-on-surface-variant transition-transform duration-200 active:scale-[0.92] motion-reduce:transition-none [&_svg]:size-5"
      >
        <Mic aria-hidden="true" />
      </Md3IconButton>
    );

    const cancelButton = (
      <Md3IconButton aria-label="Cancel dictation" onClick={onCancel} className="shrink-0 [&_svg]:size-5">
        <X aria-hidden="true" />
      </Md3IconButton>
    );

    const pauseButton =
      state === "paused"
        ? onResume && (
            <Md3IconButton aria-label="Resume dictation" onClick={onResume} className="shrink-0 [&_svg]:size-5">
              <Play aria-hidden="true" />
            </Md3IconButton>
          )
        : onPause && (
            <Md3IconButton aria-label="Pause dictation" onClick={onPause} className="shrink-0 [&_svg]:size-5">
              <Pause aria-hidden="true" />
            </Md3IconButton>
          );

    const transcribing = (
      <>
        <Md3LoadingIndicator size={28} aria-hidden="true" className="relative shrink-0" />
        <span className="relative flex-1 truncate text-sm text-md-on-surface-variant">
          {transcript ?? "Transcribing…"}
        </span>
      </>
    );

    const error = (
      <>
        <AlertCircle className="relative size-5 shrink-0 text-md-error" aria-hidden="true" />
        <span className="relative flex-1 truncate text-sm text-md-error">{errorText}</span>
        {onRetry && (
          <Md3Button variant="text" icon={<RotateCcw aria-hidden="true" />} onClick={onRetry}>
            Retry
          </Md3Button>
        )}
        {onCancel && cancelButton}
      </>
    );

    if (variant === "transcript-stream") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex flex-col gap-2 overflow-hidden rounded-md-lg border bg-md-surface px-4 py-3 text-md-on-surface transition-colors duration-200",
            capturing ? "border-md-secondary" : "border-md-outline-variant",
            className,
          )}
          role="group"
          aria-label="Voice input"
          data-state={state}
          data-variant={variant}
          {...props}
        >
          <VoiceGlow state={state} />
          {state === "idle" ? (
            <div className="relative flex items-center gap-3">
              {startButton}
              <span className="flex-1 text-sm text-md-on-surface-variant">{idleLabel}</span>
            </div>
          ) : state === "error" ? (
            <div className="relative flex items-center gap-2">{error}</div>
          ) : (
            <>
              <p className="relative min-h-5 text-base leading-6 text-md-on-surface">
                {transcript}
                {interimTranscript && (
                  <>
                    {transcript ? " " : null}
                    <span className="italic text-md-on-surface-variant">{interimTranscript}</span>
                  </>
                )}
                {capturing && (
                  <span
                    aria-hidden="true"
                    className="ml-px inline-block h-4 w-0.5 translate-y-0.5 bg-md-primary animate-nx-caret-blink motion-reduce:animate-none"
                  />
                )}
              </p>
              <div className="relative flex items-center gap-1">
                {state === "transcribing" ? (
                  <>
                    <Md3LoadingIndicator size={24} aria-hidden="true" className="shrink-0" />
                    <span className="flex-1 text-xs text-md-on-surface-variant">Transcribing…</span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "inline-flex size-6 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5",
                        state === "paused"
                          ? "bg-md-surface-container-high text-md-on-surface-variant"
                          : "bg-md-secondary-container text-md-on-secondary-container",
                      )}
                    >
                      <Mic aria-hidden="true" />
                    </span>
                    <span className="ml-1 flex-1 text-xs text-md-on-surface-variant">
                      {state === "paused" ? "Paused" : listeningLabel}
                      {duration && <span className="tabular-nums"> · {duration}</span>}
                    </span>
                    {pauseButton}
                    {onCancel && cancelButton}
                    <Md3Button variant="filled" onClick={onConfirm} icon={<Check aria-hidden="true" />} className="ml-1">
                      Stop
                    </Md3Button>
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
          "relative flex items-center gap-3 overflow-hidden rounded-full border bg-md-surface px-3 py-2 text-md-on-surface transition-colors duration-200",
          capturing ? "border-md-secondary" : "border-md-outline-variant",
          className,
        )}
        role="group"
        aria-label="Voice input"
        data-state={state}
        data-variant={variant}
        {...props}
      >
        <VoiceGlow state={state} />

        {state === "idle" && (
          <>
            {startButton}
            <span className="relative flex-1 text-sm text-md-on-surface-variant">{idleLabel}</span>
          </>
        )}

        {capturing && variant === "waveform" && (
          <>
            {cancelButton}
            <Waveform paused={state === "paused"} />
            {duration && (
              <span className="relative text-sm tabular-nums text-md-on-surface-variant">{duration}</span>
            )}
            {pauseButton}
            <Md3IconButton
              variant="filled"
              aria-label="Stop and use recording"
              onClick={onConfirm}
              className="shrink-0 [&_svg]:size-5"
            >
              <Check aria-hidden="true" />
            </Md3IconButton>
          </>
        )}

        {capturing && variant === "mic-button" && (
          <>
            {cancelButton}
            <span className="relative flex flex-1 items-center gap-2 text-sm text-md-on-surface">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full bg-md-error",
                  state === "recording" ? "animate-pulse motion-reduce:animate-none" : "opacity-[0.38]",
                )}
              />
              {state === "paused" ? "Paused" : listeningLabel}
              {duration && <span className="tabular-nums text-md-on-surface-variant">· {duration}</span>}
            </span>
            {pauseButton}
            <Md3IconButton
              aria-label="Stop and use recording"
              onClick={onConfirm}
              className={cn(
                "shrink-0 bg-md-error text-md-on-error [&_svg]:size-4",
                state === "recording" && "animate-pulse motion-reduce:animate-none",
              )}
            >
              <Square className="fill-current" aria-hidden="true" />
            </Md3IconButton>
          </>
        )}

        {state === "transcribing" && transcribing}
        {state === "error" && error}
        {liveRegion}
      </div>
    );
  },
);
Md3VoiceInput.displayName = "Md3VoiceInput";
