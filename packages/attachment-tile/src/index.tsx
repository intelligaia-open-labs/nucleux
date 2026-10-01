import * as React from "react";
import { cn } from "@nucleux/utils";
import { FileText, X } from "lucide-react";

export interface AttachmentTileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** File or attachment name. */
  name: React.ReactNode;
  /** Metadata line, e.g. `"PDF · 240 KB"`. */
  meta?: React.ReactNode;
  /** Image URL — renders a thumbnail tile instead of a document chip. */
  thumbnail?: string;
  /** Doctype icon for the document chip. Defaults to a document glyph. */
  icon?: React.ReactNode;
  /** Called when the remove control is used. Hidden if omitted. */
  onRemove?: () => void;
}

/**
 * A removable preview of a file or image attached as context to an agent turn —
 * document chip or image thumbnail. The multimodal-context affordance.
 * Source: Figma "Context Expansion / File Attachment".
 */
export const AttachmentTile = React.forwardRef<HTMLDivElement, AttachmentTileProps>(
  ({ name, meta, thumbnail, icon, onRemove, className, ...props }, ref) => {
    const remove = onRemove && (
      <button
        type="button"
        aria-label={`Remove ${typeof name === "string" ? name : "attachment"}`}
        onClick={onRemove}
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5",
          thumbnail && "absolute right-1 top-1 bg-background/80 backdrop-blur",
        )}
      >
        <X aria-hidden="true" />
      </button>
    );

    if (thumbnail) {
      return (
        <div
          ref={ref}
          className={cn("relative size-16 overflow-hidden rounded-lg border border-border bg-muted", className)}
          {...props}
        >
          <img
            src={thumbnail}
            alt={typeof name === "string" ? name : ""}
            className="size-full object-cover"
          />
          {remove}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex max-w-64 items-center gap-2.5 rounded-lg border border-border bg-background py-2 pl-2.5 pr-2",
          className,
        )}
        {...props}
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          {icon ?? <FileText aria-hidden="true" />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{name}</span>
          {meta && <span className="truncate text-xs text-muted-foreground">{meta}</span>}
        </span>
        {remove}
      </div>
    );
  },
);
AttachmentTile.displayName = "AttachmentTile";

export interface AttachmentTrayProps extends React.HTMLAttributes<HTMLDivElement> {}

/** A wrapping row of {@link AttachmentTile}s, shown above the composer. */
export const AttachmentTray = React.forwardRef<HTMLDivElement, AttachmentTrayProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-start gap-2", className)} {...props} />
  ),
);
AttachmentTray.displayName = "AttachmentTray";
