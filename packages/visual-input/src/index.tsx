import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Attachment, AttachmentGroup } from "@nucleux/attachment";
import { AlertCircle, Camera, ImageIcon, ImageUp, Paperclip, RotateCcw, Trash2, X } from "lucide-react";

export type VisualInputVariant = "drag-drop" | "paste-chip" | "camera-capture";

/** Where a visual can come from. Only the sources you list are offered. */
export type VisualInputSource = "upload" | "paste" | "camera";

/** Per-file state, set by the app while it reads or uploads the visual. */
export type VisualInputFileStatus = "ready" | "reading" | "error";

export interface VisualInputFile {
  /** Stable id, generated when the file is added. */
  id: string;
  /** The underlying file. */
  file: File;
  /** Object URL used for the thumbnail (images only, browser only). */
  previewUrl?: string;
  /** How the file arrived. */
  source?: VisualInputSource;
  /** `"reading"` shows a quiet working treatment; `"error"` shows `error` in the destructive tone. */
  status?: VisualInputFileStatus;
  /** Message shown when `status` is `"error"`, e.g. `"Couldn't read this image."`. */
  error?: string;
}

export type VisualInputRejectionReason = "type" | "size" | "count";

export interface VisualInputRejection {
  file: File;
  reason: VisualInputRejectionReason;
  /** The human-readable message shown in the error list. */
  message: string;
}

export interface VisualInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** `"drag-drop"` (default) dashed drop zone, `"paste-chip"` chips above a composer, `"camera-capture"` viewfinder with a shutter. */
  variant?: VisualInputVariant;
  /** Sources offered. Defaults to upload + paste (+ camera for `"camera-capture"`). */
  sources?: VisualInputSource[];
  /** Accepted types, in `<input accept>` syntax. Defaults to `"image/*"`. */
  accept?: string;
  /** Largest accepted file in bytes. Defaults to 20 MB. */
  maxSize?: number;
  /** Most files held at once. Defaults to 4 (1 for `"camera-capture"`). */
  maxFiles?: number;
  /** Allow more than one file. Defaults to `true` except for `"camera-capture"`. */
  multiple?: boolean;
  /** Which camera `capture` asks for on mobile. Defaults to `"environment"`. */
  capture?: "user" | "environment";
  /** The attached files (controlled). */
  files?: VisualInputFile[];
  /** Initial files (uncontrolled). */
  defaultFiles?: VisualInputFile[];
  /** Called with the next list whenever files are added or removed. Nothing is ever sent. */
  onFilesChange?: (files: VisualInputFile[]) => void;
  /** Called with files that were refused (wrong type, too large, too many). */
  onReject?: (rejections: VisualInputRejection[]) => void;
  /** Main line of the drop zone. */
  label?: React.ReactNode;
  /** Secondary line, e.g. `"PNG, JPG, PDF · up to 20 MB"`. Derived from `accept`/`maxSize` when omitted. */
  hint?: React.ReactNode;
  /** Accessible name of the whole region. Defaults to `"Image input"`. */
  regionLabel?: string;
  /** Line shown once something is attached, e.g. `"Aria will see this when you send"`. */
  seeText?: React.ReactNode;
  /** Explains camera access before anything is captured (camera variant). */
  cameraText?: React.ReactNode;
  /** Says what can be used when a type is refused, e.g. `"Aria can read PNG, JPG and HEIC."`. */
  unsupportedText?: string;
  /** Label of the browse button. */
  browseLabel?: string;
  /** Label of the camera button. */
  cameraLabel?: string;
  /** Disable every source. */
  disabled?: boolean;
  /** Slot rendered under the previews — typically the composer the visual is paired with. */
  children?: React.ReactNode;
}

const MB = 1024 * 1024;

/** Format a byte count as `"240 KB"` / `"2.4 MB"`. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / MB;
  return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
}

/** Whether `file` matches an `<input accept>` string. */
export function fileMatchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

let fileCounter = 0;
const canPreview = () => typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

/**
 * Visual input: lets people add images, screenshots or photos as context to their
 * ask — drag-and-drop, paste from the clipboard, browse, or camera capture
 * (`<input capture>`). Each visual lands as a removable chip with a real preview,
 * type/size/count limits are checked with plain-language errors in a live region,
 * and nothing is ever sent: the app pairs the files with the text prompt and
 * sends on the person's command. Variants: drag-drop, paste-chip, camera-capture.
 */
export const VisualInput = React.forwardRef<HTMLDivElement, VisualInputProps>(
  (
    {
      variant = "drag-drop",
      sources,
      accept = "image/*",
      maxSize = 20 * MB,
      maxFiles,
      multiple,
      capture = "environment",
      files: filesProp,
      defaultFiles,
      onFilesChange,
      onReject,
      label,
      hint,
      regionLabel = "Image input",
      seeText = "Attached to your next message — nothing is sent until you send.",
      cameraText,
      unsupportedText,
      browseLabel = "Browse files",
      cameraLabel = "Take photo",
      disabled = false,
      className,
      children,
      onPaste,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      ...props
    },
    ref,
  ) => {
    const isCamera = variant === "camera-capture";
    const allowed = sources ?? (isCamera ? ["camera", "upload"] : ["upload", "paste"]);
    const canUpload = allowed.includes("upload");
    const canPaste = allowed.includes("paste");
    const canCamera = allowed.includes("camera");
    const isMultiple = multiple ?? !isCamera;
    const limit = isMultiple ? (maxFiles ?? 4) : 1;

    const [internal, setInternal] = React.useState<VisualInputFile[]>(defaultFiles ?? []);
    const files = filesProp ?? internal;
    const [errors, setErrors] = React.useState<VisualInputRejection[]>([]);
    const [announcement, setAnnouncement] = React.useState("");
    const [dragging, setDragging] = React.useState(false);
    const dragDepth = React.useRef(0);
    const uploadRef = React.useRef<HTMLInputElement>(null);
    const cameraRef = React.useRef<HTMLInputElement>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const created = React.useRef(new Set<string>());
    const errorsId = React.useId();

    // Revoke object URLs we created once their file is gone, and on unmount.
    React.useEffect(() => {
      const live = new Set(files.map((f) => f.previewUrl));
      created.current.forEach((url) => {
        if (!live.has(url)) {
          URL.revokeObjectURL(url);
          created.current.delete(url);
        }
      });
    }, [files]);
    React.useEffect(
      () => () => {
        created.current.forEach((url) => URL.revokeObjectURL(url));
        created.current.clear();
      },
      [],
    );

    const commit = (next: VisualInputFile[]) => {
      if (filesProp === undefined) setInternal(next);
      onFilesChange?.(next);
    };

    const describeRejection = (file: File, reason: VisualInputRejectionReason) => {
      if (reason === "type")
        return `${file.name} can’t be attached. ${unsupportedText ?? "Choose an image file instead."}`;
      if (reason === "size") return `${file.name} is larger than ${formatFileSize(maxSize)}.`;
      return `Only ${limit} ${limit === 1 ? "file" : "files"} can be attached — ${file.name} was left out.`;
    };

    const addFiles = (list: File[], source: VisualInputSource) => {
      if (disabled || list.length === 0) return;
      const rejected: VisualInputRejection[] = [];
      const accepted: VisualInputFile[] = [];
      const room = isMultiple ? limit - files.length : 1;
      for (const file of list) {
        let reason: VisualInputRejectionReason | null = null;
        if (!fileMatchesAccept(file, accept)) reason = "type";
        else if (file.size > maxSize) reason = "size";
        else if (accepted.length >= room) reason = "count";
        if (reason) {
          rejected.push({ file, reason, message: describeRejection(file, reason) });
          continue;
        }
        let previewUrl: string | undefined;
        if (file.type.startsWith("image/") && canPreview()) {
          previewUrl = URL.createObjectURL(file);
          created.current.add(previewUrl);
        }
        fileCounter += 1;
        accepted.push({ id: `nx-visual-${fileCounter}`, file, previewUrl, source, status: "ready" });
      }
      setErrors(rejected);
      if (rejected.length) onReject?.(rejected);
      if (accepted.length) {
        commit(isMultiple ? [...files, ...accepted] : accepted);
        setAnnouncement(`${accepted.map((f) => f.file.name).join(", ")} attached.`);
      }
    };

    const removeFile = (id: string) => {
      const target = files.find((f) => f.id === id);
      commit(files.filter((f) => f.id !== id));
      if (target) setAnnouncement(`${target.file.name} removed.`);
      // Focus would be lost with the removed chip — move it to a stable control.
      requestAnimationFrame(() => {
        const root = rootRef.current;
        const next = root?.querySelector<HTMLElement>("[data-visual-input-focus]") ?? root;
        next?.focus();
      });
    };

    const openUpload = () => !disabled && uploadRef.current?.click();
    const openCamera = () => !disabled && cameraRef.current?.click();

    const onInputChange = (source: VisualInputSource) => (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files ?? []), source);
      e.target.value = "";
    };

    const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const dropHandlers = canUpload
      ? {
          onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
            onDragEnter?.(e);
            if (disabled || !hasFiles(e)) return;
            e.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          },
          onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
            onDragOver?.(e);
            if (disabled || !hasFiles(e)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          },
          onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
            onDragLeave?.(e);
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
          },
          onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            onDrop?.(e);
            dragDepth.current = 0;
            setDragging(false);
            if (disabled) return;
            e.preventDefault();
            addFiles(Array.from(e.dataTransfer?.files ?? []), "upload");
          },
        }
      : { onDragEnter, onDragOver, onDragLeave, onDrop };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      onPaste?.(e);
      if (e.defaultPrevented || !canPaste || disabled) return;
      const pasted = Array.from(e.clipboardData?.files ?? []);
      if (pasted.length === 0) return; // plain text paste continues as normal
      e.preventDefault();
      addFiles(pasted, "paste");
    };

    const hintText =
      hint ?? `${accept === "image/*" ? "Images" : accept.replace(/,/g, ", ")} · up to ${formatFileSize(maxSize)}`;

    const chips = files.length > 0 && (
      <AttachmentGroup role="list" aria-label="Attached visuals">
        {files.map((f) => (
          <div role="listitem" key={f.id}>
            <Attachment
              name={f.file.name}
              meta={
                f.status === "error" ? (
                  <span className="text-destructive">{f.error ?? "Couldn’t use this file."}</span>
                ) : f.status === "reading" ? (
                  "Reading…"
                ) : (
                  formatFileSize(f.file.size)
                )
              }
              icon={
                f.previewUrl ? (
                  <img src={f.previewUrl} alt="" className="size-full rounded-md object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" />
                )
              }
              onRemove={() => removeFile(f.id)}
              data-status={f.status ?? "ready"}
              className={cn(
                variant === "paste-chip" && "rounded-full py-1 pl-1",
                f.status === "error" && "border-destructive/60",
                f.status === "reading" && "animate-pulse motion-reduce:animate-none",
              )}
            />
          </div>
        ))}
      </AttachmentGroup>
    );

    const status = (
      <>
        {files.length > 0 && seeText && <p className="text-xs text-muted-foreground">{seeText}</p>}
        {errors.length > 0 && (
          <div
            id={errorsId}
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <ul className="flex-1 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
            <button
              type="button"
              aria-label="Dismiss errors"
              onClick={() => setErrors([])}
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
            >
              <X aria-hidden="true" />
            </button>
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </>
    );

    const hiddenInputs = (
      <>
        {canUpload && (
          <input
            ref={uploadRef}
            type="file"
            accept={accept}
            multiple={isMultiple}
            hidden
            tabIndex={-1}
            disabled={disabled}
            onChange={onInputChange("upload")}
          />
        )}
        {canCamera && (
          <input
            ref={cameraRef}
            type="file"
            accept={accept.includes("image") ? "image/*" : accept}
            capture={capture}
            hidden
            tabIndex={-1}
            disabled={disabled}
            onChange={onInputChange("camera")}
          />
        )}
      </>
    );

    const setRoot = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const rootProps = {
      ref: setRoot,
      role: "group" as const,
      "aria-label": regionLabel,
      "aria-disabled": disabled || undefined,
      "data-variant": variant,
      "data-dragging": dragging || undefined,
      tabIndex: -1,
      onPaste: handlePaste,
      ...dropHandlers,
      ...props,
    };

    if (variant === "paste-chip") {
      return (
        <div {...rootProps} className={cn("flex flex-col gap-2 outline-none", className)}>
          {chips}
          {children}
          <div
            className={cn(
              "flex items-center gap-1 rounded-lg text-xs text-muted-foreground transition-colors",
              dragging && "bg-brand-muted/50 text-foreground ring-2 ring-brand",
            )}
          >
            {canUpload && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Attach image"
                onClick={openUpload}
                disabled={disabled}
                data-visual-input-focus=""
              >
                <Paperclip className="size-4" aria-hidden="true" />
              </Button>
            )}
            {canCamera && (
              <Button variant="ghost" size="icon-sm" aria-label={cameraLabel} onClick={openCamera} disabled={disabled}>
                <Camera className="size-4" aria-hidden="true" />
              </Button>
            )}
            <span>{label ?? (dragging ? "Drop to attach" : canPaste ? "Paste or drop a screenshot" : "Attach an image")}</span>
          </div>
          {status}
          {hiddenInputs}
        </div>
      );
    }

    if (isCamera) {
      const photo = files[0];
      return (
        <div {...rootProps} className={cn("flex flex-col gap-3 outline-none", className)}>
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted",
              dragging && "ring-2 ring-brand",
            )}
          >
            {photo?.previewUrl ? (
              <img
                src={photo.previewUrl}
                alt={`Captured photo: ${photo.file.name}`}
                className="size-full object-cover"
              />
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-[22%] rounded-lg border-2 border-brand/80"
                />
                <p className="absolute inset-x-0 bottom-3 px-4 text-center text-xs text-muted-foreground">
                  {photo ? photo.file.name : (label ?? "Point your camera at what you want to ask about")}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            {photo ? (
              <>
                {canCamera && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
                    onClick={openCamera}
                    disabled={disabled}
                    data-visual-input-focus=""
                  >
                    Retake
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                  onClick={() => removeFile(photo.id)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </>
            ) : (
              <>
                {canCamera && (
                  <Button
                    variant="secondary"
                    aria-label={cameraLabel}
                    onClick={openCamera}
                    disabled={disabled}
                    data-visual-input-focus=""
                    className="size-14 rounded-full border-4 border-brand p-0"
                  >
                    <Camera className="size-5" aria-hidden="true" />
                  </Button>
                )}
                {canUpload && (
                  <Button variant="ghost" size="sm" onClick={openUpload} disabled={disabled}>
                    Upload instead
                  </Button>
                )}
              </>
            )}
          </div>
          {cameraText && !photo && <p className="text-center text-xs text-muted-foreground">{cameraText}</p>}
          {photo?.status === "error" && (
            <p className="text-center text-xs text-destructive">{photo.error ?? "Couldn’t use this photo."}</p>
          )}
          {children}
          {status}
          {hiddenInputs}
        </div>
      );
    }

    return (
      <div {...rootProps} className={cn("flex flex-col gap-3 outline-none", className)}>
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            if (canUpload) openUpload();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-6 text-center transition-colors",
            canUpload && !disabled && "cursor-pointer hover:bg-muted/70",
            dragging && "border-brand bg-brand-muted/50",
            disabled && "opacity-50",
          )}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm [&_svg]:size-5">
            <ImageUp aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-foreground">
            {dragging ? "Drop to attach" : (label ?? (canPaste ? "Drop an image or paste a screenshot" : "Drop an image"))}
          </p>
          <p className="text-xs text-muted-foreground">{hintText}</p>
          {(canUpload || canCamera) && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              {canUpload && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openUpload}
                  disabled={disabled}
                  data-visual-input-focus=""
                >
                  {browseLabel}
                </Button>
              )}
              {canCamera && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Camera className="size-4" aria-hidden="true" />}
                  onClick={openCamera}
                  disabled={disabled}
                >
                  {cameraLabel}
                </Button>
              )}
            </div>
          )}
        </div>
        {chips}
        {children}
        {status}
        {hiddenInputs}
      </div>
    );
  },
);
VisualInput.displayName = "VisualInput";
