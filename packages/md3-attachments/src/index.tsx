import * as React from "react";
import { cn, Slot } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LinearProgress } from "@nucleux/md3-progress";
import { formatFileSize } from "@nucleux/attachments";
import type {
  AttachmentsProps,
  AttachmentsItemProps,
  AttachmentsTrayProps,
  AttachmentsTriggerProps,
  AttachmentsDropZoneProps,
  AttachmentsNoteProps,
  AttachmentsVariant,
  AttachmentsStatus,
  AttachmentsRejection,
  AttachmentsFile,
} from "@nucleux/attachments";
import { File as FileIcon, FileImage, FileSpreadsheet, FileText, Paperclip, Plus, RotateCw, X } from "lucide-react";

// ── API parity: every type comes from the shadcn twin ────────────────────────
export type Md3AttachmentsProps = AttachmentsProps;
export type Md3AttachmentsItemProps = AttachmentsItemProps;
export type Md3AttachmentsTrayProps = AttachmentsTrayProps;
export type Md3AttachmentsTriggerProps = AttachmentsTriggerProps;
export type Md3AttachmentsDropZoneProps = AttachmentsDropZoneProps;
export type Md3AttachmentsNoteProps = AttachmentsNoteProps;
export type Md3AttachmentsVariant = AttachmentsVariant;
export type Md3AttachmentsStatus = AttachmentsStatus;
export type {
  AttachmentsFile,
  AttachmentsRejection,
  AttachmentsRejectionReason,
} from "@nucleux/attachments";
export { formatFileSize } from "@nucleux/attachments";

interface Md3AttachmentsContextValue {
  items: AttachmentsFile[];
  variant: AttachmentsVariant;
  disabled: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  addFiles: (files: File[]) => void;
  openPicker: () => void;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}

const Md3AttachmentsContext = React.createContext<Md3AttachmentsContextValue | null>(null);
const useMd3Attachments = () => React.useContext(Md3AttachmentsContext);

// Copied from @nucleux/attachments (internal there): the accept-rule check.
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    );
}

// Copied from @nucleux/attachments (internal there): icon by MIME type / extension.
function iconFor(type?: string, name?: string) {
  const t = type ?? "";
  if (t.startsWith("image/")) return <FileImage aria-hidden="true" />;
  if (t.includes("csv") || t.includes("sheet") || /\.(csv|xlsx?)$/i.test(name ?? ""))
    return <FileSpreadsheet aria-hidden="true" />;
  if (t.includes("pdf") || t.startsWith("text/") || t.includes("document")) return <FileText aria-hidden="true" />;
  return <FileIcon aria-hidden="true" />;
}

// Copied from @nucleux/attachments: the state as a word, always shown first.
const statusWord: Record<AttachmentsStatus, string> = {
  uploading: "Uploading",
  processing: "Reading",
  ready: "Ready",
  error: "Couldn't attach",
};

/**
 * Material 3 Attachments: adds files, photos and documents to what the agent
 * can read for this message. Same API and behaviour as `Attachments` from
 * `@nucleux/attachments`: the root holds the attached items, checks type, size
 * and count limits before anything uploads (and names the limit in an
 * error-container alert), owns the hidden file picker, and announces progress
 * politely ("2 files attached, 1 still being read"). Compose it with
 * Md3AttachmentsTray, Md3AttachmentsTrigger, Md3AttachmentsDropZone and
 * Md3AttachmentsNote. Networking stays with the app: upload in `onFilesAdded`,
 * then pass each item's `status` and `progress` back in `items`.
 */
export const Md3Attachments = React.forwardRef<HTMLDivElement, Md3AttachmentsProps>(
  (
    {
      items = [],
      variant = "file-chip",
      onFilesAdded,
      onFilesRejected,
      onRemove,
      onRetry,
      accept,
      maxFiles,
      maxSize,
      disabled = false,
      label = "Attached to this message",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [rejections, setRejections] = React.useState<AttachmentsRejection[]>([]);

    const addFiles = React.useCallback(
      (files: File[]) => {
        if (disabled || files.length === 0) return;
        const ok: File[] = [];
        const refused: AttachmentsRejection[] = [];
        let room = maxFiles != null ? Math.max(0, maxFiles - items.length) : Infinity;
        for (const file of files) {
          if (!matchesAccept(file, accept)) {
            refused.push({ file, reason: "type", message: `${file.name} isn't a supported file type.` });
          } else if (maxSize != null && file.size > maxSize) {
            refused.push({ file, reason: "size", message: `${file.name} is over the ${formatFileSize(maxSize)} limit.` });
          } else if (room <= 0) {
            refused.push({ file, reason: "count", message: `${file.name} wasn't added: up to ${maxFiles} files per message.` });
          } else {
            ok.push(file);
            room--;
          }
        }
        setRejections(refused);
        if (refused.length) onFilesRejected?.(refused);
        if (ok.length) onFilesAdded?.(ok);
      },
      [disabled, maxFiles, items.length, accept, maxSize, onFilesRejected, onFilesAdded],
    );

    const openPicker = React.useCallback(() => {
      if (!disabled) inputRef.current?.click();
    }, [disabled]);

    const reading = items.filter((i) => i.status === "uploading" || i.status === "processing").length;
    const failed = items.filter((i) => i.status === "error").length;
    const summary = items.length
      ? [
          `${items.length} ${items.length === 1 ? "file" : "files"} attached`,
          reading ? `${reading} still being read` : "",
          failed ? `${failed} couldn't be attached` : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    return (
      <Md3AttachmentsContext.Provider
        value={{ items, variant, disabled, accept, maxFiles, maxSize, addFiles, openPicker, onRemove, onRetry }}
      >
        <div
          ref={ref}
          role="group"
          aria-label={label}
          data-variant={variant}
          className={cn("flex flex-col gap-2 text-md-on-surface", className)}
          {...props}
        >
          {children}
          {rejections.length > 0 && (
            <div
              role="alert"
              className="flex items-start justify-between gap-2 rounded-md-sm bg-md-error-container py-1 pl-4 pr-1 text-sm text-md-on-error-container"
            >
              <ul className="flex flex-col gap-0.5 py-1.5">
                {rejections.map((r, i) => (
                  <li key={i}>{r.message}</li>
                ))}
              </ul>
              <Md3Button
                variant="text"
                onClick={() => setRejections([])}
                className="h-8 shrink-0 px-3 text-md-on-error-container"
              >
                Dismiss
              </Md3Button>
            </div>
          )}
          <span role="status" aria-live="polite" className="sr-only">
            {summary}
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple={maxFiles !== 1}
            accept={accept}
            hidden
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>
      </Md3AttachmentsContext.Provider>
    );
  },
);
Md3Attachments.displayName = "Md3Attachments";

/**
 * One attached file in Material 3: an input-chip-shaped object (or an
 * outlined preview card) whose meta line starts with the state as a word
 * (Uploading, Reading, Ready, Couldn't attach). A hairline Md3LinearProgress
 * runs along its bottom edge while uploading (determinate) or reading
 * (indeterminate, a static half track under reduced motion). Readiness is
 * marked in primary, a failure in the error container, and a failed file
 * stays listed with Retry. The remove control is named for the file.
 */
export const Md3AttachmentsItem = React.forwardRef<HTMLDivElement, Md3AttachmentsItemProps>(
  ({ file, variant: variantProp, onRemove: onRemoveProp, onRetry: onRetryProp, className, ...props }, ref) => {
    const ctx = useMd3Attachments();
    const variant = variantProp ?? ctx?.variant ?? "file-chip";
    const onRemove = onRemoveProp ?? ctx?.onRemove;
    const onRetry = onRetryProp ?? ctx?.onRetry;
    const status = file.status ?? "ready";
    const isCard = variant === "preview-card";
    const busy = status === "uploading" || status === "processing";
    const isError = status === "error";
    const indeterminate = status === "processing" || file.progress == null;

    const detail = [
      file.size != null ? formatFileSize(file.size) : null,
      status === "ready" && isCard ? "Loaded into context" : null,
    ].filter(Boolean);

    return (
      <div
        ref={ref}
        data-status={status}
        className={cn(
          "relative animate-nx-fade-in motion-reduce:animate-none",
          isCard ? "flex w-full" : "inline-flex",
          className,
        )}
        {...props}
      >
        <div
          aria-busy={busy || undefined}
          className={cn(
            "relative flex min-w-0 items-center overflow-hidden border transition-colors motion-reduce:transition-none",
            isCard
              ? "w-full gap-3 rounded-md-md p-3"
              : "max-w-72 gap-2 rounded-md-sm py-1 pl-1 pr-1",
            isError
              ? "border-md-error bg-md-error-container text-md-on-error-container"
              : "border-md-outline-variant bg-md-surface-container-low text-md-on-surface",
          )}
        >
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center overflow-hidden",
              isCard ? "size-12 rounded-md-sm [&_svg]:size-6" : "size-7 rounded-md-xs [&_svg]:size-4",
              isError
                ? "bg-md-surface-container-low text-md-error"
                : "bg-md-secondary-container text-md-on-secondary-container",
            )}
          >
            {isCard && file.thumbnail ? (
              <img src={file.thumbnail} alt="" className="size-full object-cover" />
            ) : (
              iconFor(file.type, file.name)
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium tracking-[0.1px]">{file.name}</span>
            <span
              className={cn(
                "flex min-w-0 flex-wrap items-center gap-x-1 text-xs tracking-[0.4px]",
                isError ? "text-md-on-error-container" : "text-md-on-surface-variant",
              )}
            >
              <span className={cn("font-medium", status === "ready" && "text-md-primary")}>
                {statusWord[status]}
                {status === "uploading" && file.progress != null ? ` ${Math.round(file.progress)}%` : ""}
              </span>
              {isError && file.error ? <span className="truncate">· {file.error}</span> : null}
              {!isError && detail.length > 0 ? <span className="truncate">· {detail.join(" · ")}</span> : null}
              {status === "ready" && file.meta ? <span className="truncate">· {file.meta}</span> : null}
              {isError && onRetry && (
                <>
                  <span aria-hidden="true">·</span>
                  <Md3Button
                    variant="text"
                    onClick={() => onRetry(file.id)}
                    aria-label={`Retry ${file.name}`}
                    icon={<RotateCw aria-hidden="true" />}
                    className="h-6 gap-1 px-2 text-xs text-md-on-error-container [&_svg]:size-3.5"
                  >
                    Retry
                  </Md3Button>
                </>
              )}
            </span>
          </span>
          {onRemove && (
            <Md3IconButton
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(file.id)}
              className={cn(
                "h-8 w-8 shrink-0 [&_svg]:size-[18px]",
                isError ? "text-md-on-error-container" : "text-md-on-surface-variant",
              )}
            >
              <X aria-hidden="true" />
            </Md3IconButton>
          )}
          {busy && (
            <Md3LinearProgress
              value={status === "uploading" && file.progress != null ? file.progress : undefined}
              aria-label={`${statusWord[status]} ${file.name}`}
              className={cn(
                "absolute bottom-0 h-0.5 w-auto rounded-none bg-transparent",
                isCard ? "inset-x-3" : "inset-x-3",
                "motion-reduce:[&>div]:animate-none",
                indeterminate && "motion-reduce:[&>div]:!w-1/2",
              )}
            />
          )}
        </div>
      </div>
    );
  },
);
Md3AttachmentsItem.displayName = "Md3AttachmentsItem";

/**
 * Material 3 tray: the visible list of what is in context, pinned above the
 * composer — a wrapping row of chips or a stack of preview cards. Extra
 * children (custom Md3AttachmentsItems) are added as list items. Renders
 * nothing when there is nothing to show.
 */
export const Md3AttachmentsTray = React.forwardRef<HTMLDivElement, Md3AttachmentsTrayProps>(
  ({ items: itemsProp, className, children, ...props }, ref) => {
    const ctx = useMd3Attachments();
    const items = itemsProp ?? ctx?.items ?? [];
    const isCard = (ctx?.variant ?? "file-chip") === "preview-card";
    if (!items.length && !children) return null;
    return (
      <div
        ref={ref}
        role="list"
        aria-label="Attached files"
        className={cn(
          "flex gap-2",
          isCard ? "flex-col flex-nowrap items-stretch" : "flex-wrap items-start",
          className,
        )}
        {...props}
      >
        {items.map((file) => (
          <div role="listitem" key={file.id} className={cn(isCard && "w-full")}>
            <Md3AttachmentsItem file={file} />
          </div>
        ))}
        {React.Children.map(children, (child) =>
          child == null || child === false ? null : (
            <div role="listitem" className={cn(isCard && "w-full")}>
              {child}
            </div>
          ),
        )}
      </div>
    );
  },
);
Md3AttachmentsTray.displayName = "Md3AttachmentsTray";

type TwinButtonVariant = NonNullable<AttachmentsTriggerProps["variant"]>;

const iconVariant: Record<TwinButtonVariant, "standard" | "filled" | "tonal" | "outlined"> = {
  primary: "filled",
  cta: "filled",
  secondary: "outlined",
  ghost: "standard",
  destructive: "filled",
  link: "standard",
};

const buttonVariant: Record<TwinButtonVariant, "filled" | "tonal" | "elevated" | "outlined" | "text"> = {
  primary: "filled",
  cta: "filled",
  secondary: "outlined",
  ghost: "text",
  destructive: "filled",
  link: "text",
};

/**
 * Material 3 add control that opens the file picker. Icon-only by default (a
 * standard Md3IconButton named "Attach file", for the composer); pass children
 * for a labelled Md3Button with a leading plus. Takes the twin's button props;
 * `variant` maps onto the nearest Material 3 emphasis.
 */
export const Md3AttachmentsTrigger = React.forwardRef<HTMLButtonElement, Md3AttachmentsTriggerProps>(
  (
    {
      children,
      variant = "ghost",
      color: _color,
      size,
      asChild = false,
      leftIcon,
      rightIcon,
      onClick,
      disabled,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const ctx = useMd3Attachments();
    const iconOnly = children == null;
    const isDisabled = disabled ?? ctx?.disabled;
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) ctx?.openPicker();
    };
    const danger = variant === "destructive" && "bg-md-error text-md-on-error";

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          aria-label={ariaLabel}
          onClick={handleClick as unknown as React.MouseEventHandler<HTMLElement>}
          className={cn(
            "relative inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-md-primary",
            className,
          )}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }

    if (iconOnly) {
      return (
        <Md3IconButton
          ref={ref}
          variant={iconVariant[variant]}
          aria-label={ariaLabel ?? "Attach file"}
          disabled={isDisabled}
          onClick={handleClick}
          className={cn(
            size === "icon-sm" || size === "sm" ? "h-8 w-8 [&_svg]:size-5" : undefined,
            size === "icon-lg" || size === "lg" ? "h-12 w-12" : undefined,
            danger,
            className,
          )}
          {...props}
        >
          <Paperclip aria-hidden="true" />
        </Md3IconButton>
      );
    }

    return (
      <Md3Button
        ref={ref}
        variant={buttonVariant[variant]}
        aria-label={ariaLabel}
        disabled={isDisabled}
        onClick={handleClick}
        icon={leftIcon ?? <Plus aria-hidden="true" />}
        className={cn(size === "sm" && "h-8 px-4", size === "lg" && "h-12", danger, className)}
        {...props}
      >
        {children}
        {rightIcon && <span className="ml-2 inline-flex align-middle">{rightIcon}</span>}
      </Md3Button>
    );
  },
);
Md3AttachmentsTrigger.displayName = "Md3AttachmentsTrigger";

/**
 * Material 3 drag-and-drop target that lights up in primary-container as a
 * file is dragged in. Without children it is a dashed, large-shape box with a
 * tonal "Choose files" button (the keyboard path). With children it wraps
 * them — a composer, a canvas — and covers them with the drop overlay only
 * while dragging. Dropped files go through the same limits as the picker.
 */
export const Md3AttachmentsDropZone = React.forwardRef<HTMLDivElement, Md3AttachmentsDropZoneProps>(
  (
    {
      active,
      title = "Drop to attach",
      description,
      browseLabel = "Choose files",
      className,
      children,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      ...props
    },
    ref,
  ) => {
    const ctx = useMd3Attachments();
    const [dragging, setDragging] = React.useState(false);
    const depth = React.useRef(0);
    const lit = active ?? dragging;
    const hint =
      description ??
      [
        ctx?.accept
          ? ctx.accept
              .split(",")
              .map((s) => s.trim().replace(/^\./, "").replace("/*", "").toUpperCase())
              .join(", ")
          : "Any file",
        ctx?.maxSize != null ? `up to ${formatFileSize(ctx.maxSize)} each` : null,
        ctx?.maxFiles != null ? `${ctx.maxFiles} files max` : null,
      ]
        .filter(Boolean)
        .join(" · ");

    const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const overlay = (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-md-lg border-2 border-dashed p-6 text-center transition-colors duration-200 motion-reduce:transition-none",
          lit
            ? "border-md-primary bg-md-primary-container text-md-on-primary-container"
            : "border-md-outline-variant bg-md-surface-container-low text-md-on-surface",
          children && "pointer-events-none absolute inset-0 z-10",
        )}
      >
        <Paperclip
          aria-hidden="true"
          className={cn("mb-1 size-6", lit ? "text-md-on-primary-container" : "text-md-on-surface-variant")}
        />
        <p className="text-base font-medium tracking-[0.15px]">{lit ? title : "Drag files here"}</p>
        <p className={cn("text-xs", lit ? "text-md-on-primary-container" : "text-md-on-surface-variant")}>{hint}</p>
        {!lit && !children && (
          <Md3Button variant="tonal" className="mt-2" disabled={ctx?.disabled} onClick={() => ctx?.openPicker()}>
            {browseLabel}
          </Md3Button>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        data-active={lit || undefined}
        className={cn("relative", className)}
        onDragEnter={(e) => {
          onDragEnter?.(e);
          if (!hasFiles(e) || ctx?.disabled) return;
          e.preventDefault();
          depth.current++;
          setDragging(true);
        }}
        onDragOver={(e) => {
          onDragOver?.(e);
          if (!hasFiles(e) || ctx?.disabled) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(e) => {
          onDragLeave?.(e);
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          onDrop?.(e);
          if (!hasFiles(e)) return;
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          ctx?.addFiles(Array.from(e.dataTransfer.files));
        }}
        {...props}
      >
        {children}
        {(!children || lit) && overlay}
      </div>
    );
  },
);
Md3AttachmentsDropZone.displayName = "Md3AttachmentsDropZone";

/**
 * Material 3 note under the composer: the sentence the remove control owes
 * the person — attachments stay with this conversation, and removing one is
 * forward-only. Body-small in on-surface-variant; override the text via children.
 */
export const Md3AttachmentsNote = React.forwardRef<HTMLParagraphElement, Md3AttachmentsNoteProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs tracking-[0.4px] text-md-on-surface-variant", className)} {...props}>
      {children ??
        "Attached files stay with this conversation. Removing one takes it out of what comes next; it can't unwrite an answer it has already shaped."}
    </p>
  ),
);
Md3AttachmentsNote.displayName = "Md3AttachmentsNote";
