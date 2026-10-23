import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";
import { Md3Menu, Md3MenuItem } from "@nucleux/md3-menu";
import { Md3TextField } from "@nucleux/md3-text-field";
import type {
  HandwritingInputMode,
  HandwritingInputProps,
  HandwritingInputStatus,
  HandwritingPoint,
  HandwritingRecognition,
  HandwritingStroke,
  HandwritingWord,
} from "@nucleux/handwriting";
import { AlertCircle, Eraser, Keyboard, PenLine, RotateCcw, ScanText, Undo2, X } from "lucide-react";

// Same API as the shadcn twin: the props and data shapes are the twin's own types.
export type Md3HandwritingInputProps = HandwritingInputProps;
export type {
  HandwritingInputVariant as Md3HandwritingInputVariant,
  HandwritingInputConvert as Md3HandwritingInputConvert,
  HandwritingInputMode as Md3HandwritingInputMode,
  HandwritingInputStatus as Md3HandwritingInputStatus,
  HandwritingPoint,
  HandwritingStroke,
  HandwritingWord,
  HandwritingRecognition,
  HandwritingRecognizeRequest,
  HandwritingAcceptDetail,
} from "@nucleux/handwriting";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const wordsText = (words: HandwritingWord[]) => words.map((w) => w.text).join(" ");

/** The “?” word: a button that opens its alternatives in an MD3 menu. */
function UncertainWord({
  word,
  onChoose,
}: {
  word: HandwritingWord;
  onChoose: (text: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const choices = [word.text, ...(word.alternatives ?? [])].filter((t, j, all) => all.indexOf(t) === j);

  React.useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(i + step + items.length) % items.length]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      items[e.key === "Home" ? 0 : items.length - 1]?.focus();
    }
  };

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${word.text} — uncertain, choose the right word`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "relative inline-flex h-8 items-center gap-0.5 overflow-hidden rounded-md-sm px-1.5 text-sm text-md-on-surface",
          "underline decoration-md-error decoration-dotted decoration-2 underline-offset-4",
          "before:absolute before:inset-0 before:bg-md-primary before:opacity-0 before:transition-opacity before:content-['']",
          "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
          "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
          "transition-transform duration-200 active:scale-95 motion-reduce:transition-none",
        )}
      >
        <span className="relative">{word.text}</span>
        <span aria-hidden="true" className="relative font-semibold text-md-error no-underline">
          ?
        </span>
      </button>
      {open && (
        <Md3Menu
          ref={menuRef}
          id={menuId}
          aria-label="Did you write…"
          onKeyDown={onMenuKeyDown}
          className="absolute left-0 top-full z-50 mt-1 animate-nx-fade-in motion-reduce:animate-none"
        >
          <span aria-hidden="true" className="block px-3 pb-1 pt-1 text-xs font-medium text-md-on-surface-variant">
            Did you write…
          </span>
          {choices.map((alt) => (
            <Md3MenuItem
              key={alt}
              tabIndex={-1}
              onClick={() => {
                onChoose(alt);
                setOpen(false);
              }}
            >
              {alt}
            </Md3MenuItem>
          ))}
        </Md3Menu>
      )}
    </span>
  );
}

/**
 * Material 3 handwriting input: a pointer-driven writing pad (pen pressure
 * aware) whose ink the app's own recogniser (`onRecognize`) reads into text.
 * The reading appears under the ink, never over it; words the recogniser was
 * unsure of carry a dotted underline and a “?” in the error tone and must be
 * settled from their alternatives (an MD3 menu) before Add to message is
 * enabled, and the reading stays editable in an MD3 text field. Undo stroke,
 * Clear, Retry and a Type-instead fallback are always available, a slow sheen
 * crosses the pad while it is read (still under reduced motion), and nothing is
 * sent when writing finishes. Shares its API with `HandwritingInput` from
 * `@nucleux/handwriting`. Variants: draw-pad, live-ocr, annotation-stroke.
 */
export const Md3HandwritingInput = React.forwardRef<HTMLDivElement, Md3HandwritingInputProps>(
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
      padLabel,
      compact = false,
      onClose,
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

    // ---- drawing (copied from @nucleux/handwriting, where it is internal) ---
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
    // Compact: once there is a reading, the one-line result carries the accept button.
    const banner =
      compact && inputMode === "draw" && status === "recognized" && !!recognition && !unsettled && editedText === null;
    const showToolbar = !banner;

    const setRef = (node: HTMLDivElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const emptyHint =
      placeholder ?? (isAnnotation ? "Draw on the content to mark what you mean" : "Draw or write…");

    return (
      <div
        ref={setRef}
        role="group"
        aria-label={isAnnotation ? "Annotation input" : "Handwriting input"}
        data-variant={variant}
        data-status={status}
        className={cn("font-md", "flex flex-col gap-3 text-md-on-surface", className)}
        {...props}
      >
        {(padLabel != null || (compact && (inputMode === "draw" || onClose))) && (
          <div className="-mb-1 flex items-center gap-2">
            <PenLine aria-hidden="true" className="size-5 shrink-0 text-md-primary" />
            <p className="flex-1 text-sm font-medium tracking-[0.1px] text-md-on-surface-variant">{padLabel}</p>
            {compact && inputMode === "draw" && (
              <>
                <Md3IconButton
                  aria-label="Undo stroke"
                  onClick={undoStroke}
                  disabled={disabled || strokes.length === 0 || status === "recognizing"}
                  className="[&_svg]:size-5"
                >
                  <Undo2 aria-hidden="true" />
                </Md3IconButton>
                <Md3IconButton
                  aria-label="Clear"
                  onClick={reset}
                  disabled={disabled || strokes.length === 0}
                  className="[&_svg]:size-5"
                >
                  <Eraser aria-hidden="true" />
                </Md3IconButton>
              </>
            )}
            {compact && onClose && (
              <Md3IconButton aria-label="Close handwriting" onClick={onClose} className="[&_svg]:size-5">
                <X aria-hidden="true" />
              </Md3IconButton>
            )}
          </div>
        )}

        {inputMode === "type" ? (
          <textarea
            aria-label={typingLabel}
            placeholder={typingLabel}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={disabled}
            rows={3}
            className={cn(
              "w-full resize-none rounded-md-xs border border-md-outline bg-transparent px-4 py-3 text-base text-md-on-surface outline-none transition-colors",
              "placeholder:text-md-on-surface-variant focus:border-2 focus:border-md-primary focus:px-[15px] focus:py-[11px]",
              "disabled:cursor-not-allowed disabled:opacity-[0.38]",
            )}
          />
        ) : (
          <div
            ref={padRef}
            className={cn(
              "relative overflow-hidden rounded-md-lg",
              isAnnotation
                ? "min-h-40 border border-md-outline-variant"
                : compact
                  ? "h-28 rounded-b-md-xs border-b border-md-outline-variant bg-md-surface-container-low"
                  : "h-44 border-[1.5px] border-dashed border-md-outline bg-md-surface-container-low",
              variant === "live-ocr" && "h-36 border border-solid border-md-outline-variant",
              disabled && "opacity-[0.38]",
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
                isAnnotation ? "text-md-error" : "text-md-on-surface",
              )}
            />
            {compact && !isAnnotation && (
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[49%] border-t border-md-outline-variant" />
            )}
            {strokes.length === 0 && (
              <p
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute text-md-on-surface-variant",
                  isAnnotation
                    ? "bottom-2 right-2 rounded-full bg-md-surface-container-high px-2.5 py-1 text-xs font-medium"
                    : compact
                      ? "left-4 top-[23%] text-base"
                      : "inset-x-0 bottom-3 text-center text-xs",
                )}
              >
                {emptyHint}
              </p>
            )}
            {isAnnotation && status === "recognized" && resultText && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-md-surface-container-high px-2.5 py-1 text-xs font-medium text-md-on-surface shadow-md-1"
              >
                “{resultText}”
              </span>
            )}
            {status === "recognizing" && (
              // A slow, low-contrast sheen while the ink is read; the ink stays visible beneath it.
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-pulse bg-md-primary/[0.08] motion-reduce:animate-none"
              />
            )}
          </div>
        )}

        {/* Reading — under the ink, never over it. */}
        {inputMode === "draw" && status === "recognizing" && (
          <div className="flex items-center gap-2 text-sm text-md-on-surface-variant">
            <Md3LoadingIndicator size={24} aria-hidden="true" />
            {statusText}
          </div>
        )}

        {inputMode === "draw" && status === "error" && (
          <div className="flex flex-col gap-2 rounded-md-md bg-md-error-container px-3 py-2.5 text-md-on-error-container">
            <p className="flex items-center gap-2 text-sm">
              <AlertCircle className="size-[18px] shrink-0" aria-hidden="true" />
              {failureText} Your writing is kept.
            </p>
            <div className="flex flex-wrap gap-2">
              <Md3Button variant="filled" icon={<RotateCcw aria-hidden="true" />} onClick={() => void recognize()}>
                Retry
              </Md3Button>
              <Md3Button variant="text" onClick={reset} className="text-md-on-error-container">
                Rewrite
              </Md3Button>
            </div>
          </div>
        )}

        {banner && (
          <div
            id={resultId}
            data-slot="handwriting-result"
            className="flex items-center gap-3 rounded-md-md bg-md-secondary-container py-2 pl-4 pr-2 text-md-on-secondary-container"
          >
            <p className="min-w-0 flex-1 text-sm font-medium">
              {isAnnotation ? "Read as" : "Recognised"}: “{resultText}”
            </p>
            <Md3Button variant="filled" onClick={accept} disabled={disabled || !resultText.trim()}>
              {acceptLabel}
            </Md3Button>
          </div>
        )}

        {inputMode === "draw" && status === "recognized" && recognition && !banner && (
          <div
            id={resultId}
            className="flex flex-col gap-2 border-t border-md-outline-variant pt-3"
            data-slot="handwriting-result"
          >
            <span className="text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">
              {isAnnotation ? "Read as an instruction" : "Recognised"}
            </span>
            {unsettled && words ? (
              <>
                <div className="flex flex-wrap items-center gap-1 text-base text-md-on-surface">
                  {words.map((w, i) =>
                    w.uncertain ? (
                      <UncertainWord key={i} word={w} onChoose={(text) => settleWord(i, text)} />
                    ) : (
                      <span key={i} className="animate-nx-fade-in motion-reduce:animate-none">
                        {w.text}
                      </span>
                    ),
                  )}
                </div>
                <p className="text-xs text-md-on-surface-variant">
                  Check the words marked “?” to add this to your message.{" "}
                  <button
                    type="button"
                    onClick={() => setEditedText(resultText)}
                    className="rounded-md-xs font-medium text-md-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-md-primary"
                  >
                    Edit text instead
                  </button>
                </p>
              </>
            ) : (
              <Md3TextField
                ref={resultInputRef}
                label="Recognised text"
                value={resultText}
                onChange={(e) => setEditedText(e.target.value)}
                disabled={disabled}
              />
            )}
            {!unsettled && recognition.alternatives && recognition.alternatives.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Other readings">
                <span className="text-xs text-md-on-surface-variant">Other readings:</span>
                {recognition.alternatives.map((alt) => (
                  <Md3Chip key={alt} variant="filter" selected={resultText === alt} onClick={() => setEditedText(alt)}>
                    {alt}
                  </Md3Chip>
                ))}
              </div>
            )}
          </div>
        )}

        {showToolbar && (
        <div className="flex flex-wrap items-center gap-1">
          {inputMode === "draw" && !compact && (
            <>
              <Md3Button
                variant="text"
                icon={<Undo2 aria-hidden="true" />}
                onClick={undoStroke}
                disabled={disabled || strokes.length === 0 || status === "recognizing"}
              >
                Undo stroke
              </Md3Button>
              <Md3Button
                variant="text"
                icon={<Eraser aria-hidden="true" />}
                onClick={reset}
                disabled={disabled || strokes.length === 0}
              >
                Clear
              </Md3Button>
            </>
          )}
          <Md3Button
            variant="text"
            icon={inputMode === "draw" ? <Keyboard aria-hidden="true" /> : <PenLine aria-hidden="true" />}
            onClick={() => setInputMode(inputMode === "draw" ? "type" : "draw")}
            disabled={disabled}
          >
            {inputMode === "draw" ? "Type instead" : "Write instead"}
          </Md3Button>
          <span className="flex-1" />
          {inputMode === "draw" && onRecognize && (status !== "recognized" || mode === "review") && (
            <Md3Button
              variant={compact ? "filled" : "tonal"}
              icon={<ScanText aria-hidden="true" />}
              onClick={() => void recognize()}
              disabled={disabled || strokes.length === 0 || status === "recognizing"}
            >
              Recognise
            </Md3Button>
          )}
          {!(compact && inputMode === "draw" && status !== "recognized") && (
            <Md3Button
              variant="filled"
              onClick={accept}
              disabled={
                disabled ||
                (inputMode === "type" ? !typed.trim() : status !== "recognized" || unsettled || !resultText.trim())
              }
              aria-describedby={inputMode === "draw" && status === "recognized" ? resultId : undefined}
            >
              {acceptLabel}
            </Md3Button>
          )}
        </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    );
  },
);
Md3HandwritingInput.displayName = "Md3HandwritingInput";
