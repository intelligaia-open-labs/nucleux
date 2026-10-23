import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import {
  fileMatchesAccept,
  type VisualInputProps,
  type VisualInputRejection,
  type VisualInputRejectionReason,
  type VisualInputSource,
  type VisualInputFile,
} from "@nucleux/visual-input";
import {
  AlertCircle,
  Camera,
  ImageIcon,
  ImageUp,
  Paperclip,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

// Same API as the shadcn twin: the props and data shapes are the twin's own types.
export type Md3VisualInputProps = VisualInputProps;
export type {
  VisualInputVariant as Md3VisualInputVariant,
  VisualInputSource as Md3VisualInputSource,
  VisualInputFileStatus as Md3VisualInputFileStatus,
  VisualInputRejectionReason as Md3VisualInputRejectionReason,
  VisualInputFile,
  VisualInputRejection,
} from "@nucleux/visual-input";
/** Whether a file matches an `<input accept>` string — shared with `@nucleux/visual-input`. */
export { fileMatchesAccept };

const MB = 1024 * 1024;

// Copied from @nucleux/visual-input (internal there) so messages read identically.
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / MB;
  return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
}

let fileCounter = 0;
const canPreview = () => typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

/**
 * Material 3 visual input: lets people add an image, screenshot or photo as
 * context to their ask — drag-and-drop onto a dashed MD3 drop zone, paste from
 * the clipboard, browse, or camera capture (`<input capture>`). Each visual
 * rises in as a removable card with a real preview, limits are checked with
 * plain-language errors in an error-container alert, and nothing is ever sent:
 * the app pairs the files with the words and sends on the person's command.
 * Shares its API and validation (`fileMatchesAccept`) with `VisualInput` from
 * `@nucleux/visual-input`. Variants: drag-drop, paste-chip, camera-capture.
 */
export const Md3VisualInput = React.forwardRef<HTMLDivElement, Md3VisualInputProps>(
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
    const allowed: VisualInputSource[] =
      sources ?? (isCamera ? ["camera", "upload"] : ["upload", "paste"]);
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
        accepted.push({
          id: `nx-md3-visual-${fileCounter}`,
          file,
          previewUrl,
          source,
          status: "ready",
        });
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
      // Focus would be lost with the removed card — move it to a stable control.
      requestAnimationFrame(() => {
        const root = rootRef.current;
        const next = root?.querySelector<HTMLElement>("[data-visual-input-focus]") ?? root;
        next?.focus();
      });
    };

    const openUpload = () => !disabled && uploadRef.current?.click();
    const openCamera = () => !disabled && cameraRef.current?.click();

    const onInputChange =
      (source: VisualInputSource) => (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files ?? []), source);
        e.target.value = "";
      };

    const hasFiles = (e: React.DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

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
      hint ??
      `${accept === "image/*" ? "Images" : accept.replace(/,/g, ", ")} · up to ${formatFileSize(maxSize)}`;

    const isPill = variant === "paste-chip";

    const chips = files.length > 0 && (
      <div role="list" aria-label="Attached visuals" className="flex flex-wrap items-start gap-2">
        {files.map((f) => {
          const meta =
            f.status === "error" ? (
              <span className="text-md-error">{f.error ?? "Couldn’t use this file."}</span>
            ) : f.status === "reading" ? (
              "Reading…"
            ) : (
              formatFileSize(f.file.size)
            );
          return (
            <div
              role="listitem"
              key={f.id}
              data-status={f.status ?? "ready"}
              className={cn(
                // The card rises into the composer from below (M3 emphasized decelerate).
                "relative inline-flex max-w-64 items-center gap-2.5 overflow-hidden border text-md-on-surface",
                "animate-nx-fade-in motion-reduce:animate-none",
                isPill
                  ? "rounded-full bg-md-surface-container-high py-1 pl-1 pr-1.5"
                  : "rounded-md-md bg-md-surface-container-low py-2 pl-2 pr-1.5",
                f.status === "error" ? "border-md-error" : "border-md-outline-variant",
              )}
            >
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center overflow-hidden bg-md-secondary-container text-md-on-secondary-container [&_svg]:size-4",
                  isPill ? "size-7 rounded-full" : "size-10 rounded-md-sm",
                )}
              >
                {f.previewUrl ? (
                  <img src={f.previewUrl} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium tracking-[0.1px]">{f.file.name}</span>
                {(!isPill || (f.status && f.status !== "ready")) && (
                  <span className="truncate text-xs text-md-on-surface-variant">{meta}</span>
                )}
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.file.name}`}
                onClick={() => removeFile(f.id)}
                className={cn(
                  "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-md-on-surface-variant [&_svg]:size-[18px]",
                  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-['']",
                  "hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
                )}
              >
                <X className="relative" aria-hidden="true" />
              </button>
              {f.status === "reading" && (
                // A slow, low-contrast sheen while the agent reads the visual.
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 animate-pulse bg-md-primary/[0.08] motion-reduce:hidden"
                />
              )}
            </div>
          );
        })}
      </div>
    );

    const status = (
      <>
        {files.length > 0 && seeText && (
          <p className="text-xs text-md-on-surface-variant">{seeText}</p>
        )}
        {errors.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md-md bg-md-error-container px-3 py-2 text-sm text-md-on-error-container"
          >
            <AlertCircle className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
            <ul className="flex-1 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
            <Md3IconButton
              aria-label="Dismiss errors"
              onClick={() => setErrors([])}
              className="-my-1.5 -mr-1.5 size-8 text-md-on-error-container [&_svg]:size-[18px]"
            >
              <X aria-hidden="true" />
            </Md3IconButton>
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
        <div
          {...rootProps}
          className={cn("font-md", "flex flex-col gap-2 text-md-on-surface outline-none", className)}
        >
          {chips}
          {children}
          {(canUpload || canCamera || label !== null || dragging) && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full text-xs text-md-on-surface-variant transition-colors duration-200 motion-reduce:transition-none",
                dragging && "bg-md-primary/[0.08] text-md-on-surface ring-2 ring-md-primary",
              )}
            >
              {canUpload && (
                <Md3IconButton
                  aria-label="Attach image"
                  onClick={openUpload}
                  disabled={disabled}
                  data-visual-input-focus=""
                  className="[&_svg]:size-5"
                >
                  <Paperclip aria-hidden="true" />
                </Md3IconButton>
              )}
              {canCamera && (
                <Md3IconButton
                  aria-label={cameraLabel}
                  onClick={openCamera}
                  disabled={disabled}
                  className="[&_svg]:size-5"
                >
                  <Camera aria-hidden="true" />
                </Md3IconButton>
              )}
              <span>
                {label ??
                  (dragging
                    ? "Drop to attach"
                    : canPaste
                      ? "Paste or drop a screenshot"
                      : "Attach an image")}
              </span>
            </div>
          )}
          {status}
          {hiddenInputs}
        </div>
      );
    }

    if (isCamera) {
      const photo = files[0];
      return (
        <div
          {...rootProps}
          className={cn("font-md", "flex flex-col gap-3 text-md-on-surface outline-none", className)}
        >
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-md-lg bg-md-inverse-surface",
              dragging && "ring-2 ring-md-primary",
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
                  className="absolute inset-[24%] rounded-md-sm border-2 border-md-inverse-primary"
                />
                <p className="absolute inset-x-0 bottom-3 px-4 text-center text-xs text-md-inverse-on-surface">
                  {photo
                    ? photo.file.name
                    : (label ?? "Point your camera at what you want to ask about")}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            {photo ? (
              <>
                {canCamera && (
                  <Md3Button
                    variant="tonal"
                    icon={<RotateCcw aria-hidden="true" />}
                    onClick={openCamera}
                    disabled={disabled}
                    data-visual-input-focus=""
                  >
                    Retake
                  </Md3Button>
                )}
                <Md3Button
                  variant="text"
                  icon={<Trash2 aria-hidden="true" />}
                  onClick={() => removeFile(photo.id)}
                  disabled={disabled}
                >
                  Remove
                </Md3Button>
              </>
            ) : (
              <>
                {canCamera && (
                  <Md3IconButton
                    aria-label={cameraLabel}
                    onClick={openCamera}
                    disabled={disabled}
                    data-visual-input-focus=""
                    className="size-14 border-4 border-md-primary bg-md-surface text-md-primary shadow-md-1 transition-transform duration-200 active:scale-95 motion-reduce:transition-none"
                  >
                    <Camera aria-hidden="true" />
                  </Md3IconButton>
                )}
                {canUpload && (
                  <Md3Button variant="text" onClick={openUpload} disabled={disabled}>
                    Upload instead
                  </Md3Button>
                )}
              </>
            )}
          </div>
          {cameraText && !photo && (
            <p className="text-center text-xs text-md-on-surface-variant">{cameraText}</p>
          )}
          {photo?.status === "error" && (
            <p className="text-center text-xs text-md-error">
              {photo.error ?? "Couldn’t use this photo."}
            </p>
          )}
          {children}
          {status}
          {hiddenInputs}
        </div>
      );
    }

    return (
      <div
        {...rootProps}
        className={cn("font-md", "flex flex-col gap-3 text-md-on-surface outline-none", className)}
      >
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            if (canUpload) openUpload();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-md-lg border-[1.5px] border-dashed border-md-outline bg-md-surface-container-low px-5 py-7 text-center text-md-on-surface-variant",
            "transition-colors duration-200 motion-reduce:transition-none",
            canUpload && !disabled && "cursor-pointer hover:bg-md-surface-container",
            dragging && "border-solid border-md-primary bg-md-primary/[0.07] text-md-on-surface",
            disabled && "opacity-[0.38]",
          )}
        >
          <span className="mb-1 inline-flex size-12 items-center justify-center rounded-full bg-md-secondary-container text-md-on-secondary-container [&_svg]:size-6">
            <ImageUp aria-hidden="true" />
          </span>
          <p className="text-base font-medium text-md-on-surface">
            {dragging
              ? "Drop to attach"
              : (label ?? (canPaste ? "Drop an image or paste a screenshot" : "Drop an image"))}
          </p>
          <p className="text-xs">{hintText}</p>
          {(canUpload || canCamera) && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {canUpload && (
                <Md3Button
                  variant="tonal"
                  onClick={openUpload}
                  disabled={disabled}
                  data-visual-input-focus=""
                >
                  {browseLabel}
                </Md3Button>
              )}
              {canCamera && (
                <Md3Button
                  variant="text"
                  icon={<Camera aria-hidden="true" />}
                  onClick={openCamera}
                  disabled={disabled}
                >
                  {cameraLabel}
                </Md3Button>
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
Md3VisualInput.displayName = "Md3VisualInput";
