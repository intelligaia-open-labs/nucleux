import * as React from "react";
import { cn } from "@nucleux/utils";

export interface MediaCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Card title. */
  title?: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Media node (image/video). Takes precedence over `image`. */
  media?: React.ReactNode;
  /** Image URL rendered as the media, when `media` isn't provided. */
  image?: string;
  /** Alt text for `image`. */
  imageAlt?: string;
  /** Layout: media on top (vertical) or beside the body (horizontal). */
  orientation?: "vertical" | "horizontal";
  /** Trailing content below the description (e.g. actions). */
  footer?: React.ReactNode;
}

/**
 * A media card — a media area (image/video) with a title, description, and
 * optional footer. Covers the "Card Variation" family from the design system
 * via `orientation` and the media slot. Source: Figma "Card Variation *".
 */
export const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
  (
    { title, description, media, image, imageAlt = "", orientation = "vertical", footer, className, children, ...props },
    ref,
  ) => {
    const horizontal = orientation === "horizontal";
    const hasMedia = media != null || image != null;
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-background shadow-sm",
          horizontal ? "flex flex-row" : "flex flex-col",
          className,
        )}
        {...props}
      >
        {hasMedia && (
          <div
            className={cn(
              "shrink-0 overflow-hidden bg-muted",
              horizontal ? "w-1/3" : "aspect-video w-full",
            )}
          >
            {media ??
              (image ? <img src={image} alt={imageAlt} className="size-full object-cover" /> : null)}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
          {title && <p className="text-base font-medium text-foreground">{title}</p>}
          {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {children}
          {footer && <div className="mt-3">{footer}</div>}
        </div>
      </div>
    );
  },
);
MediaCard.displayName = "MediaCard";
