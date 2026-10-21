import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Input } from "@nucleux/input";
import { Textarea } from "@nucleux/textarea";
import { Spinner } from "@nucleux/spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@nucleux/dropdown-menu";
import { AlertCircle, Eraser, Keyboard, PenLine, RotateCcw, ScanText, Undo2 } from "lucide-react";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type HandwritingInputVariant = "draw-pad" | "live-ocr" | "annotation-stroke";

/** `"review"` recognises when asked; `"auto"` recognises after a pause in writing. Uncertain words always stop for a look. */
export type HandwritingInputConvert = "review" | "auto";

export type HandwritingInputMode = "draw" | "type";

export type HandwritingInputStatus = "idle" | "recognizing" | "recognized" | "error";

export interface HandwritingPoint {
  /** CSS pixels from the pad's left edge. */
  x: number;
  /** CSS pixels from the pad's top edge. */
  y: number;
  /** Pointer pressure 0–1 (0.5 for devices without pressure). */
  pressure: number;
  /** Event timestamp in ms. */
  t: number;
}

export interface HandwritingStroke {
  /** `"pen"`, `"touch"` or `"mouse"`. */
  pointerType: string;
  points: HandwritingPoint[];
}

export interface HandwritingWord {
  text: string;
  /** Marks a word the recogniser was unsure of; it must be settled before adding. */
  uncertain?: boolean;
  /** Likely readings for this word, best first. */
  alternatives?: string[];
}

export interface HandwritingRecognition {
  /** The reading as one string. */
  text: string;
  /** Whole-text candidate readings, best first. */
  alternatives?: string[];
  /** Optional word-level reading; enables per-word uncertainty. */
  words?: HandwritingWord[];
}

export interface HandwritingRecognizeRequest {
  strokes: HandwritingStroke[];
  /** Pad size in CSS pixels. */
  width: number;
  height: number;
  /** Rasterise the ink (browser only) for image-based recognisers. */
  toImage: (type?: string) => Promise<Blob | null>;
}

export interface HandwritingAcceptDetail {
  /** Whether the text came from ink or from the typing fallback. */
  source: "handwriting" | "typed";
  /** The original ink, so it can travel with the message. */
  strokes: HandwritingStroke[];
  /** The recogniser's reading before the person's corrections. */
  recognition?: HandwritingRecognition;
}

export interface HandwritingInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** `"draw-pad"` (default) writing pad, `"live-ocr"` reading streams under the ink, `"annotation-stroke"` ink drawn over `children`. */
  variant?: HandwritingInputVariant;
  /** The app's recogniser — never built in. Gets the strokes (and a rasteriser) and returns text plus alternatives. */
  onRecognize?: (request: HandwritingRecognizeRequest) => Promise<HandwritingRecognition> | HandwritingRecognition;
  /** When to recognise. Defaults to `"auto"` for `"live-ocr"`, `"review"` otherwise. */
  convert?: HandwritingInputConvert;
  /** Pause in ms before auto recognition. Defaults to 900. */
  autoDelay?: number;
  /** Called with the confirmed text — the person's choice, never a silent reading. Nothing is sent. */
  onAccept?: (text: string, detail: HandwritingAcceptDetail) => void;
  /** Strokes (controlled). */
  strokes?: HandwritingStroke[];
  /** Initial strokes (uncontrolled). */
  defaultStrokes?: HandwritingStroke[];
  /** Called whenever a stroke is added, undone or cleared. */
  onStrokesChange?: (strokes: HandwritingStroke[]) => void;
  /** A reading to show initially (e.g. restored state). */
  defaultRecognition?: HandwritingRecognition;
  /** `"draw"` (default) or `"type"` — the keyboard fallback. */
  defaultMode?: HandwritingInputMode;
  /** Base ink width in CSS pixels; pen pressure scales it. */
  strokeWidth?: number;
  /** Accessible name of the pad. */
  label?: string;
  /** Hint shown on the empty pad. */
  placeholder?: React.ReactNode;
  /** Shown while recognising. */
  statusText?: React.ReactNode;
  /** Shown when the writing could not be read. */
  failureText?: React.ReactNode;
  /** Label of the confirm button. */
  acceptLabel?: React.ReactNode;
  /** Label for the typing fallback field. */
  typingLabel?: string;
  disabled?: boolean;
  /** Content the ink is drawn over (`"annotation-stroke"`). */
  children?: React.ReactNode;
}

const wordsText = (words: HandwritingWord[]) => words.map((w) => w.text).join(" ");

/**
 * Handwriting input: a pointer-driven writing pad (pen pressure aware) whose ink
 * the app's own recogniser (`onRecognize`) reads into text. The reading appears
 * under the ink, never over it; words the recogniser was unsure of are marked
 * with “?” and must be settled from their alternatives before Add to message is
 * enabled, and the reading stays editable. Undo stroke, Clear, Retry and a
 * Type-instead keyboard fallback are always available, and nothing is sent when
 * writing finishes. Variants: draw-pad, live-ocr, annotation-stroke.
 */
export const HandwritingInput = React.forwardRef<HTMLDivElement, HandwritingInputProps>(
  (
    {
      variant = "draw-pad",
      onRecognize,
      convert,
      autoDelay = 900,
      onAccept,
      strokes: strokesProp,
      defaultStrokes,
      onStrokesChange,
      defaultRecognition,
      defaultMode = "draw",
      strokeWidth = variant === "annotation-stroke" ? 3 : 2.5,
      label = "Handwriting pad",
      placeholder,
      statusText = "Recognising your writing…",
      failureText = "Couldn’t recognise this writing.",
      acceptLabel = "Add to message",
      typingLabel = "Type your request",
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const mode = convert ?? (variant === "live-ocr" ? "auto" : "review");
    const isAnnotation = variant === "annotation-stroke";

    const [internalStrokes, setInternalStrokes] = React.useState<HandwritingStroke[]>(defaultStrokes ?? []);
    const strokes = strokesProp ?? internalStrokes;
    const [inputMode, setInputMode] = React.useState<HandwritingInputMode>(defaultMode);
    const [status, setStatus] = React.useState<HandwritingInputStatus>(defaultRecognition ? "recognized" : "idle");
    const [recognition, setRecognition] = React.useState<HandwritingRecognition | null>(defaultRecognition ?? null);
    const [words, setWords] = React.useState<HandwritingWord[] | null>(defaultRecognition?.words ?? null);
    const [editedText, setEditedText] = React.useState<string | null>(null);
    const [typed, setTyped] = React.useState("");
    const [announcement, setAnnouncement] = React.useState("");

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const padRef = React.useRef<HTMLDivElement>(null);
    const drawing = React.useRef<HandwritingStroke | null>(null);
    const requestId = React.useRef(0);
    const strokesRef = React.useRef(strokes);
    strokesRef.current = strokes;
    const resultId = React.useId();
    const resultInputRef = React.useRef<HTMLInputElement>(null);

    const setStrokes = (next: HandwritingStroke[]) => {
      if (strokesProp === undefined) setInternalStrokes(next);
      onStrokesChange?.(next);
    };

    // ---- drawing -----------------------------------------------------------
    const widthFor = (stroke: HandwritingStroke, p: HandwritingPoint) =>
      stroke.pointerType === "pen" && p.pressure > 0 ? strokeWidth * (0.4 + p.pressure * 1.2) : strokeWidth;

    const noCanvas = React.useRef(false);
    const getContext = () => {
      const canvas = canvasRef.current;
      if (!canvas || noCanvas.current) return null;
      let ctx: CanvasRenderingContext2D | null = null;
      try {
        ctx = canvas.getContext("2d");
      } catch {
        ctx = null;
      }
      if (!ctx) {
        noCanvas.current = true; // e.g. a non-rendering environment
        return null;
      }
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const color = typeof getComputedStyle === "function" ? getComputedStyle(canvas).color : "";
      ctx.strokeStyle = color || "currentColor";
      ctx.fillStyle = ctx.strokeStyle;
      return ctx;
    };

    const drawSegment = (ctx: CanvasRenderingContext2D, stroke: HandwritingStroke, a: HandwritingPoint, b: HandwritingPoint) => {
      ctx.lineWidth = widthFor(stroke, b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const drawDot = (ctx: CanvasRenderingContext2D, stroke: HandwritingStroke, p: HandwritingPoint) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, widthFor(stroke, p) / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const redraw = React.useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = getContext();
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const stroke of strokesRef.current) {
        const pts = stroke.points;
        if (pts.length === 1) drawDot(ctx, stroke, pts[0]);
        for (let i = 1; i < pts.length; i++) drawSegment(ctx, stroke, pts[i - 1], pts[i]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strokeWidth]);

    // Keep the backing store matched to the pad size (crisp on HiDPI).
    React.useEffect(() => {
      const pad = padRef.current;
      const canvas = canvasRef.current;
      if (!pad || !canvas || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        const rect = pad.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        redraw();
      });
      ro.observe(pad);
      return () => ro.disconnect();
    }, [redraw, inputMode]);

    const hasDrawn = React.useRef(false);
    useIsomorphicLayoutEffect(() => {
      if (strokes.length === 0 && !hasDrawn.current) return;
      hasDrawn.current = true;
      redraw();
    }, [strokes, redraw]);

    const pointFrom = (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent): HandwritingPoint => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: (e.clientX ?? 0) - rect.left,
        y: (e.clientY ?? 0) - rect.top,
        pressure: typeof e.pressure === "number" && e.pressure > 0 ? e.pressure : 0.5,
        t: e.timeStamp ?? Date.now(),
      };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled || status === "recognizing") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      const stroke: HandwritingStroke = { pointerType: e.pointerType || "mouse", points: [pointFrom(e)] };
      drawing.current = stroke;
      const ctx = getContext();
      if (ctx) drawDot(ctx, stroke, stroke.points[0]);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const stroke = drawing.current;
      if (!stroke) return;
      const native = e.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
      const events = native.getCoalescedEvents?.() ?? [];
      const ctx = getContext();
      for (const ev of events.length ? events : [native]) {
        const p = pointFrom(ev);
        const prev = stroke.points[stroke.points.length - 1];
        stroke.points.push(p);
        if (ctx) drawSegment(ctx, stroke, prev, p);
      }
    };

    const endStroke = () => {
      const stroke = drawing.current;
      if (!stroke) return;
      drawing.current = null;
      setStrokes([...strokesRef.current, stroke]);
    };

    // ---- recognition -------------------------------------------------------
    const toImage = (type = "image/png") =>
      new Promise<Blob | null>((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas || typeof canvas.toBlob !== "function") return resolve(null);
        try {
          canvas.toBlob((blob) => resolve(blob), type);
        } catch {
          resolve(null);
        }
      });

    const applyRecognition = (result: HandwritingRecognition) => {
      setRecognition(result);
      setWords(result.words ?? null);
      setEditedText(null);
      setStatus("recognized");
      const unsure = result.words?.filter((w) => w.uncertain).length ?? 0;
      setAnnouncement(
        `Recognised: ${result.words ? wordsText(result.words) : result.text}.` +
          (unsure ? ` ${unsure} ${unsure === 1 ? "word needs" : "words need"} checking.` : ""),
      );
    };

    const recognize = async () => {
      if (!onRecognize || strokesRef.current.length === 0) return;
      const id = ++requestId.current;
      setStatus("recognizing");
      setAnnouncement(typeof statusText === "string" ? statusText : "Recognising your writing…");
      const rect = padRef.current?.getBoundingClientRect();
      try {
        const result = await onRecognize({
          strokes: strokesRef.current,
          width: rect?.width ?? 0,
          height: rect?.height ?? 0,
          toImage,
        });
        if (id !== requestId.current) return;
        applyRecognition(result);
      } catch {
        if (id !== requestId.current) return;
        setStatus("error");
        setAnnouncement(typeof failureText === "string" ? failureText : "Couldn’t recognise this writing.");
      }
    };

    // New ink makes an old reading stale: auto mode re-reads after a pause,
    // review mode drops the reading until the person asks again.
    const prevStrokes = React.useRef(strokes);
    React.useEffect(() => {
      if (prevStrokes.current === strokes) return;
      prevStrokes.current = strokes;
      requestId.current += 1;
      if (strokes.length === 0) {
        setStatus("idle");
        setRecognition(null);
        setWords(null);
        setEditedText(null);
        return;
      }
      if (mode === "auto" && onRecognize) {
        const timer = setTimeout(() => void recognize(), autoDelay);
        return () => clearTimeout(timer);
      }
      setStatus("idle");
      setRecognition(null);
      setWords(null);
      setEditedText(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strokes]);

    // ---- result ------------------------------------------------------------
    const unsettled = editedText === null && !!words?.some((w) => w.uncertain);
    const resultText = editedText ?? (words ? wordsText(words) : (recognition?.text ?? ""));

    const settleWord = (index: number, text: string) => {
      if (!words) return;
      const next = words.map((w, i) => (i === index ? { text, uncertain: false } : w));
      setWords(next);
      const left = next.filter((w) => w.uncertain).length;
      // The word buttons go away once everything is settled — keep focus in the reading.
      if (!left) requestAnimationFrame(() => resultInputRef.current?.focus());
      setAnnouncement(`“${text}” chosen.${left ? ` ${left} still to check.` : " Ready to add."}`);
    };

    const reset = () => {
      requestId.current += 1;
      setStrokes([]);
      setStatus("idle");
      setRecognition(null);
      setWords(null);
      setEditedText(null);
    };

    const accept = () => {
      if (inputMode === "type") {
        const text = typed.trim();
        if (!text) return;
        onAccept?.(text, { source: "typed", strokes: [] });
        setTyped("");
      } else {
        const text = resultText.trim();
        if (!text || unsettled) return;
        onAccept?.(text, { source: "handwriting", strokes, recognition: recognition ?? undefined });
        reset();
      }
      setAnnouncement("Added to message.");
    };

    const undoStroke = () => setStrokes(strokes.slice(0, -1));

    const setRef = (node: HTMLDivElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const emptyHint =
      placeholder ?? (isAnnotation ? "Draw on the content to mark what you mean" : "Draw or write…");

    const typeToggle = (
      <Button
        variant="ghost"
        size="sm"
        leftIcon={
          inputMode === "draw" ? (
            <Keyboard className="size-4" aria-hidden="true" />
          ) : (
            <PenLine className="size-4" aria-hidden="true" />
          )
        }
        onClick={() => setInputMode(inputMode === "draw" ? "type" : "draw")}
        disabled={disabled}
      >
        {inputMode === "draw" ? "Type instead" : "Write instead"}
      </Button>
    );

    return (
      <div
        ref={setRef}
        role="group"
        aria-label={isAnnotation ? "Annotation input" : "Handwriting input"}
        data-variant={variant}
        data-status={status}
        className={cn("flex flex-col gap-3", className)}
        {...props}
      >
        {inputMode === "type" ? (
          <Textarea
            aria-label={typingLabel}
            placeholder={typingLabel}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={disabled}
            rows={3}
          />
        ) : (
          <div
            ref={padRef}
            className={cn(
              "relative overflow-hidden rounded-xl",
              isAnnotation
                ? "min-h-40 border border-border"
                : "h-44 border border-dashed border-border bg-background",
              variant === "live-ocr" && "h-36 border-solid",
              disabled && "opacity-50",
            )}
            aria-busy={status === "recognizing" || undefined}
          >
            {isAnnotation && children}
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`${label}${strokes.length ? ` — ${strokes.length} ${strokes.length === 1 ? "stroke" : "strokes"}` : " — empty"}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              className={cn(
                "absolute inset-0 size-full touch-none",
                disabled ? "cursor-not-allowed" : "cursor-crosshair",
                isAnnotation ? "text-destructive" : "text-foreground",
              )}
            />
            {strokes.length === 0 && (
              <p
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute text-xs text-muted-foreground",
                  isAnnotation
                    ? "bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 font-medium"
                    : "inset-x-0 bottom-3 text-center",
                )}
              >
                {emptyHint}
              </p>
            )}
            {isAnnotation && status === "recognized" && resultText && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm"
              >
                “{resultText}”
              </span>
            )}
            {status === "recognizing" && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-pulse bg-brand-muted/30 motion-reduce:animate-none"
              />
            )}
          </div>
        )}

        {/* Reading — under the ink, never over it. */}
        {inputMode === "draw" && status === "recognizing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="text-brand motion-reduce:animate-none" aria-hidden="true" />
            {statusText}
          </div>
        )}

        {inputMode === "draw" && status === "error" && (
          <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {failureText} Your writing is kept.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
                onClick={() => void recognize()}
              >
                Retry
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                Rewrite
              </Button>
            </div>
          </div>
        )}

        {inputMode === "draw" && status === "recognized" && recognition && (
          <div
            id={resultId}
            className="flex flex-col gap-2 rounded-lg bg-brand-muted/40 px-3 py-2"
            data-slot="handwriting-result"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {isAnnotation ? "Read as an instruction" : "Recognised"}
            </span>
            {unsettled && words ? (
              <>
                <p className="flex flex-wrap items-center gap-1 text-sm text-foreground">
                  {words.map((w, i) =>
                    w.uncertain ? (
                      <DropdownMenu key={i}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            aria-label={`${w.text} — uncertain, choose the right word`}
                            className="h-7 border-dashed px-2 text-destructive underline decoration-dotted underline-offset-4"
                          >
                            {w.text}
                            <span aria-hidden="true">?</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Did you write…</DropdownMenuLabel>
                          {[w.text, ...(w.alternatives ?? [])]
                            .filter((t, j, all) => all.indexOf(t) === j)
                            .map((alt) => (
                              <DropdownMenuItem key={alt} onSelect={() => settleWord(i, alt)}>
                                {alt}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span key={i}>{w.text}</span>
                    ),
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Check the words marked “?” to add this to your message.{" "}
                  <Button variant="link" size="sm" className="text-xs" onClick={() => setEditedText(resultText)}>
                    Edit text instead
                  </Button>
                </p>
              </>
            ) : (
              <Input
                ref={resultInputRef}
                aria-label="Recognised text"
                value={resultText}
                onChange={(e) => setEditedText(e.target.value)}
                disabled={disabled}
                className="bg-background"
              />
            )}
            {!unsettled && recognition.alternatives && recognition.alternatives.length > 0 && (
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Other readings">
                <span className="text-xs text-muted-foreground">Other readings:</span>
                {recognition.alternatives.map((alt) => (
                  <Button
                    key={alt}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 font-medium"
                    aria-pressed={resultText === alt}
                    onClick={() => setEditedText(alt)}
                  >
                    {alt}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {inputMode === "draw" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Undo2 className="size-4" aria-hidden="true" />}
                onClick={undoStroke}
                disabled={disabled || strokes.length === 0 || status === "recognizing"}
              >
                Undo stroke
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Eraser className="size-4" aria-hidden="true" />}
                onClick={reset}
                disabled={disabled || strokes.length === 0}
              >
                Clear
              </Button>
            </>
          )}
          {typeToggle}
          <span className="flex-1" />
          {inputMode === "draw" && onRecognize && (status !== "recognized" || mode === "review") && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ScanText className="size-4" aria-hidden="true" />}
              onClick={() => void recognize()}
              disabled={disabled || strokes.length === 0 || status === "recognizing"}
            >
              Recognise
            </Button>
          )}
          <Button
            variant="cta"
            size="sm"
            onClick={accept}
            disabled={
              disabled ||
              (inputMode === "type" ? !typed.trim() : status !== "recognized" || unsettled || !resultText.trim())
            }
            aria-describedby={inputMode === "draw" && status === "recognized" ? resultId : undefined}
          >
            {acceptLabel}
          </Button>
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    );
  },
);
HandwritingInput.displayName = "HandwritingInput";
