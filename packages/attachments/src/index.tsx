import * as React from "react";
import { cn } from "@nucleux/utils";
import { Attachment, AttachmentGroup } from "@nucleux/attachment";
import { Button, type ButtonProps } from "@nucleux/button";
import { Progress } from "@nucleux/progress";
import { File as FileIcon, FileImage, FileSpreadsheet, FileText, Paperclip, Plus, RotateCw } from "lucide-react";

/** Tray layout: compact pills above the composer, or richer cards with a thumbnail. */
export type AttachmentsVariant = "file-chip" | "preview-card";

/**
 * Lifecycle of one attachment. Uploading and reading are separate states:
 * a file that has uploaded but not been read is not yet in context.
 */
export type AttachmentsStatus = "uploading" | "processing" | "ready" | "error";

/** Why a file was refused before upload. */
export type AttachmentsRejectionReason = "type" | "size" | "count";

/** One attached file, as the app tracks it. */
export interface AttachmentsFile {
  /** Stable id. */
  id: string;
  /** File name, e.g. `"Q2-renewals.csv"`. */
  name: string;
  /** Size in bytes, shown in human terms. */
  size?: number;
  /** MIME type, used to pick an icon. */
  type?: string;
  /** Extra detail once read, e.g. `"34 pages"`. */
  meta?: React.ReactNode;
  /** Image URL shown as the preview card's thumbnail. */
  thumbnail?: string;
  /** Where the file is. Defaults to `"ready"`. */
  status?: AttachmentsStatus;
  /** Upload progress 0–100 while `"uploading"`. Omit when there is no real number. */
  progress?: number;
  /** Why it failed, when `status` is `"error"`. */
  error?: React.ReactNode;
}

/** A file refused before upload, with the limit in the message. */
export interface AttachmentsRejection {
  file: File;
  reason: AttachmentsRejectionReason;
  /** Human sentence naming the limit, e.g. `"budget.xlsx is over the 20 MB limit."`. */
  message: string;
}

interface AttachmentsContextValue {
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

const AttachmentsContext = React.createContext<AttachmentsContextValue | null>(null);
const useAttachments = () => React.useContext(AttachmentsContext);

/** Formats bytes as `48 KB`, `1.2 MB`. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 10 || Number.isInteger(n) ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

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

function iconFor(type?: string, name?: string) {
  const t = type ?? "";
  if (t.startsWith("image/")) return <FileImage aria-hidden="true" />;
  if (t.includes("csv") || t.includes("sheet") || /\.(csv|xlsx?)$/i.test(name ?? ""))
    return <FileSpreadsheet aria-hidden="true" />;
  if (t.includes("pdf") || t.startsWith("text/") || t.includes("document")) return <FileText aria-hidden="true" />;
  return <FileIcon aria-hidden="true" />;
}

const statusWord: Record<AttachmentsStatus, string> = {
  uploading: "Uploading",
  processing: "Reading",
  ready: "Ready",
  error: "Couldn't attach",
};

export interface AttachmentsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  /** The attached files and their states (the app owns uploading and reading). */
  items?: AttachmentsFile[];
  /** Tray layout. Defaults to `"file-chip"`. */
  variant?: AttachmentsVariant;
  /** Called with files that passed the limits; start uploading them here. */
  onFilesAdded?: (files: File[]) => void;
  /** Called with files refused before upload (wrong type, too big, too many). */
  onFilesRejected?: (rejections: AttachmentsRejection[]) => void;
  /** Called when a file's remove control is used. */
  onRemove?: (id: string) => void;
  /** Called from a failed file's Retry. */
  onRetry?: (id: string) => void;
  /** Accepted types, as for `<input accept>`: `".pdf,.csv,image/*"`. */
  accept?: string;
  /** Most files allowed at once, counting those already attached. */
  maxFiles?: number;
  /** Largest file allowed, in bytes. */
  maxSize?: number;
  /** Turns off adding (the tray still shows and removes). */
  disabled?: boolean;
  /** Accessible name of the region. Defaults to `"Attached to this message"`. */
  label?: string;
}

/**
 * Adds files, photos and documents to what the agent can read for this
 * message. The root holds the attached items, checks type, size and count
 * limits before anything uploads (and says which limit, in an alert), owns the
 * hidden file picker, and announces progress politely ("2 files attached, 1
 * still being read"). Compose it with AttachmentsTray (the chips or preview
 * cards, built on `@nucleux/attachment`), AttachmentsTrigger (the add button),
 * AttachmentsDropZone (drag and drop) and AttachmentsNote (what removal does).
 * Networking stays with the app: upload in `onFilesAdded`, then pass each
 * item's `status` and `progress` back in `items`.
 */
export const Attachments = React.forwardRef<HTMLDivElement, AttachmentsProps>(
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
            refused.push({
              file,
              reason: "size",
              message: `${file.name} is over the ${formatFileSize(maxSize)} limit.`,
            });
          } else if (room <= 0) {
            refused.push({
              file,
              reason: "count",
              message: `${file.name} wasn't added: up to ${maxFiles} files per message.`,
            });
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
      <AttachmentsContext.Provider
        value={{ items, variant, disabled, accept, maxFiles, maxSize, addFiles, openPicker, onRemove, onRetry }}
      >
        <div
          ref={ref}
          role="group"
          aria-label={label}
          data-variant={variant}
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          {children}
          {rejections.length > 0 && (
            <div role="alert" className="flex items-start justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <ul className="flex flex-col gap-0.5">
                {rejections.map((r, i) => (
                  <li key={i}>{r.message}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setRejections([])}
                className="shrink-0 rounded font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Dismiss
              </button>
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
      </AttachmentsContext.Provider>
    );
  },
);
Attachments.displayName = "Attachments";

export interface AttachmentsItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  /** The file to show. */
  file: AttachmentsFile;
  /** Layout; defaults to the parent's `variant`, else `"file-chip"`. */
  variant?: AttachmentsVariant;
  /** Remove handler; defaults to the parent's `onRemove`. */
  onRemove?: (id: string) => void;
  /** Retry handler for a failed file; defaults to the parent's `onRetry`. */
  onRetry?: (id: string) => void;
}

/**
 * One attached file, built on `Attachment`: the state comes first as a word
 * (Uploading, Reading, Ready, Couldn't attach) followed by size and detail; a
 * hairline progress bar runs along its bottom edge while uploading
 * (determinate) or reading (indeterminate); a failed file stays listed with
 * Retry. The remove control is always named for the file.
 */
export const AttachmentsItem = React.forwardRef<HTMLDivElement, AttachmentsItemProps>(
  ({ file, variant: variantProp, onRemove: onRemoveProp, onRetry: onRetryProp, className, ...props }, ref) => {
    const ctx = useAttachments();
    const variant = variantProp ?? ctx?.variant ?? "file-chip";
    const onRemove = onRemoveProp ?? ctx?.onRemove;
    const onRetry = onRetryProp ?? ctx?.onRetry;
    const status = file.status ?? "ready";
    const isCard = variant === "preview-card";
    const busy = status === "uploading" || status === "processing";

    const detail = [
      file.size != null ? formatFileSize(file.size) : null,
      status === "ready" && isCard ? "Loaded into context" : null,
    ].filter(Boolean);

    const meta = (
      <>
        <span
          className={cn(
            "font-medium",
            status === "ready" && "text-brand",
            status === "error" && "text-destructive",
          )}
        >
          {statusWord[status]}
          {status === "uploading" && file.progress != null ? ` ${Math.round(file.progress)}%` : ""}
        </span>
        {status === "error" && file.error ? <> · {file.error}</> : null}
        {status !== "error" && detail.length > 0 ? <> · {detail.join(" · ")}</> : null}
        {status === "ready" && file.meta ? <> · {file.meta}</> : null}
        {status === "error" && onRetry && (
          <>
            {" · "}
            <Button
              variant="link"
              onClick={() => onRetry(file.id)}
              aria-label={`Retry ${file.name}`}
              className="h-auto text-xs font-medium text-destructive"
            >
              <RotateCw aria-hidden="true" className="size-3" />
              Retry
            </Button>
          </>
        )}
      </>
    );

    const icon =
      isCard && file.thumbnail ? (
        <img src={file.thumbnail} alt="" className="size-full rounded-md object-cover" />
      ) : (
        iconFor(file.type, file.name)
      );

    return (
      <div
        ref={ref}
        data-status={status}
        className={cn("relative animate-nx-fade-in motion-reduce:animate-none", isCard ? "flex w-full" : "inline-flex", className)}
        {...props}
      >
        <Attachment
          name={file.name}
          meta={meta}
          icon={icon}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          aria-busy={busy || undefined}
          className={cn(
            !isCard && "rounded-full py-1 pl-1 pr-2 [&>span:first-child]:size-6 [&>span:first-child]:rounded-full",
            isCard && "w-full max-w-none gap-3 rounded-xl p-2.5 [&>span:first-child]:size-12 [&>span:first-child]:overflow-hidden [&>span:first-child>svg]:size-5",
            status === "error" && "border-destructive/40 bg-destructive/5",
          )}
        />
        {busy && (
          <Progress
            size="sm"
            value={status === "uploading" ? file.progress : undefined}
            aria-label={`${statusWord[status]} ${file.name}`}
            className={cn(
              "absolute bottom-0 h-0.5 rounded-none bg-transparent",
              isCard ? "inset-x-3" : "inset-x-4",
            )}
            indicatorClassName={cn(
              "bg-brand",
              (status === "processing" || file.progress == null) && "motion-reduce:w-1/2 motion-reduce:animate-none",
            )}
          />
        )}
      </div>
    );
  },
);
AttachmentsItem.displayName = "AttachmentsItem";

export interface AttachmentsTrayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Items to show; defaults to the parent's `items`. */
  items?: AttachmentsFile[];
}

/**
 * The visible list of what is in context, pinned above the composer: a
 * wrapping row of chips (`AttachmentGroup`) or a stack of preview cards.
 * Extra children (custom AttachmentsItems) are added as list items. Renders
 * nothing when there is nothing to show.
 */
export const AttachmentsTray = React.forwardRef<HTMLDivElement, AttachmentsTrayProps>(
  ({ items: itemsProp, className, children, ...props }, ref) => {
    const ctx = useAttachments();
    const items = itemsProp ?? ctx?.items ?? [];
    const isCard = (ctx?.variant ?? "file-chip") === "preview-card";
    if (!items.length && !children) return null;
    return (
      <AttachmentGroup
        ref={ref}
        role="list"
        aria-label="Attached files"
        className={cn(isCard && "flex-col flex-nowrap items-stretch", className)}
        {...props}
      >
        {items.map((file) => (
          <div role="listitem" key={file.id} className={cn(isCard && "w-full")}>
            <AttachmentsItem file={file} />
          </div>
        ))}
        {React.Children.map(children, (child) =>
          child == null || child === false ? null : (
            <div role="listitem" className={cn(isCard && "w-full")}>
              {child}
            </div>
          ),
        )}
      </AttachmentGroup>
    );
  },
);
AttachmentsTray.displayName = "AttachmentsTray";

export type AttachmentsTriggerProps = ButtonProps;

/**
 * The add control that opens the file picker. Icon-only by default ("Attach
 * file", for the composer); pass children for a labelled button.
 */
export const AttachmentsTrigger = React.forwardRef<HTMLButtonElement, AttachmentsTriggerProps>(
  ({ children, variant = "ghost", size, onClick, disabled, ...props }, ref) => {
    const ctx = useAttachments();
    const iconOnly = children == null;
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size ?? (iconOnly ? "icon" : "sm")}
        aria-label={iconOnly ? "Attach file" : undefined}
        disabled={disabled ?? ctx?.disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx?.openPicker();
        }}
        leftIcon={iconOnly ? undefined : <Plus aria-hidden="true" className="size-4" />}
        {...props}
      >
        {iconOnly ? <Paperclip aria-hidden="true" className="size-4" /> : children}
      </Button>
    );
  },
);
AttachmentsTrigger.displayName = "AttachmentsTrigger";

export interface AttachmentsDropZoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Force the lit "drop to attach" state (it lights up on its own while a file is dragged over). */
  active?: boolean;
  /** Headline while dragging. Defaults to `"Drop to attach"`. */
  title?: React.ReactNode;
  /** Line under the headline, e.g. `"PDF, image, CSV, doc"`. Defaults to the limits in words. */
  description?: React.ReactNode;
  /** Label of the browse button in the idle box. Defaults to `"Choose files"`. */
  browseLabel?: React.ReactNode;
}

/**
 * A drag-and-drop target that lights up as a file is dragged in. Without
 * children it is a dashed box with a "Choose files" button (keyboard path).
 * With children it wraps them — a composer, a canvas — and covers them with
 * the drop overlay only while dragging. Dropped files go through the same
 * limits as the picker.
 */
export const AttachmentsDropZone = React.forwardRef<HTMLDivElement, AttachmentsDropZoneProps>(
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
    const ctx = useAttachments();
    const [dragging, setDragging] = React.useState(false);
    const depth = React.useRef(0);
    const lit = active ?? dragging;
    const hint =
      description ??
      ([
        ctx?.accept ? ctx.accept.split(",").map((s) => s.trim().replace(/^\./, "").replace("/*", "").toUpperCase()).join(", ") : "Any file",
        ctx?.maxSize != null ? `up to ${formatFileSize(ctx.maxSize)} each` : null,
        ctx?.maxFiles != null ? `${ctx.maxFiles} files max` : null,
      ]
        .filter(Boolean)
        .join(" · "));

    const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const overlay = (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-6 text-center",
          lit ? "border-brand bg-brand-muted/60" : "border-border bg-muted/40",
          children && "pointer-events-none absolute inset-0 z-10 bg-brand-muted/90",
        )}
      >
        <Paperclip aria-hidden="true" className={cn("mb-1 size-6", lit ? "text-brand" : "text-muted-foreground")} />
        <p className={cn("text-sm font-semibold", lit ? "text-brand" : "text-foreground")}>
          {lit ? title : "Drag files here"}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {!lit && !children && (
          <Button variant="secondary" size="sm" className="mt-2" disabled={ctx?.disabled} onClick={() => ctx?.openPicker()}>
            {browseLabel}
          </Button>
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
AttachmentsDropZone.displayName = "AttachmentsDropZone";

export type AttachmentsNoteProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * The sentence the remove control owes the person: attachments stay with this
 * conversation, and removing one is forward-only. Override the text via children.
 */
export const AttachmentsNote = React.forwardRef<HTMLParagraphElement, AttachmentsNoteProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children ??
        "Attached files stay with this conversation. Removing one takes it out of what comes next; it can't unwrite an answer it has already shaped."}
    </p>
  ),
);
AttachmentsNote.displayName = "AttachmentsNote";
