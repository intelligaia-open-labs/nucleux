import * as React from "react";
import { cn, Slot } from "@nucleux/utils";
import { Separator, type SeparatorProps } from "@nucleux/separator";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm";
export type ItemMediaVariant = "default" | "icon" | "image";

const ItemGroupContext = React.createContext(false);

export type ItemGroupProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A vertical list of Items, exposed to assistive tech as a list
 * (`role="list"`). Items rendered inside get `role="listitem"`; an Item
 * using `asChild` (e.g. a link) keeps its child's role and is wrapped in a
 * layout-neutral (`display: contents`) listitem.
 * Put an ItemSeparator between Items for dividing rules.
 */
export const ItemGroup = React.forwardRef<HTMLDivElement, ItemGroupProps>(({ className, ...props }, ref) => (
  <ItemGroupContext.Provider value={true}>
    <div ref={ref} role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />
  </ItemGroupContext.Provider>
));
ItemGroup.displayName = "ItemGroup";

export type ItemSeparatorProps = SeparatorProps;

/** A horizontal rule between Items in an ItemGroup. */
export const ItemSeparator = React.forwardRef<HTMLDivElement, ItemSeparatorProps>(({ className, ...props }, ref) => (
  <Separator ref={ref} data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />
));
ItemSeparator.displayName = "ItemSeparator";

const itemBase =
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a&]:transition-colors hover:[a&]:bg-accent/50";

const itemVariantClasses: Record<ItemVariant, string> = {
  default: "bg-transparent",
  outline: "border-border",
  muted: "bg-muted/50",
};

const itemSizeClasses: Record<ItemSize, string> = {
  default: "gap-4 p-4",
  sm: "gap-2.5 px-4 py-3",
};

/** Returns the Item class string for a variant and size (shadcn's `itemVariants` cva helper). */
export function itemVariants({
  variant = "default",
  size = "default",
  className,
}: { variant?: ItemVariant | null; size?: ItemSize | null; className?: string } = {}) {
  return cn(itemBase, itemVariantClasses[variant ?? "default"], itemSizeClasses[size ?? "default"], className);
}

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" (transparent), "outline" (bordered) or "muted" (soft fill). */
  variant?: ItemVariant;
  /** "default" (roomy) or "sm" (compact). */
  size?: ItemSize;
  /** Render the single child (e.g. an `<a>` or router Link) as the row, making it clickable with a hover tint. */
  asChild?: boolean;
}

/**
 * A flexible row for lists, settings and search results: media on the
 * left, title and description in the middle, actions on the right.
 * Compose ItemMedia, ItemContent (ItemTitle, ItemDescription), ItemActions,
 * and optionally ItemHeader / ItemFooter spanning the full width. Use
 * `asChild` with an `<a>` to make the whole row a link; group rows in an
 * ItemGroup.
 */
export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const inGroup = React.useContext(ItemGroupContext);
    const shared = {
      "data-slot": "item",
      "data-variant": variant,
      "data-size": size,
      className: itemVariants({ variant, size, className }),
    };
    if (asChild) {
      const el = <Slot ref={ref} {...shared} {...props} />;
      // A link or button can't also be a listitem, so inside an ItemGroup it
      // gets a layout-neutral listitem wrapper to keep the list valid.
      return inGroup ? (
        <div role="listitem" data-slot="item-listitem" className="contents">
          {el}
        </div>
      ) : (
        el
      );
    }
    return <div ref={ref} role={inGroup ? "listitem" : undefined} {...shared} {...props} />;
  },
);
Item.displayName = "Item";

const itemMediaBase =
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none";

const itemMediaVariantClasses: Record<ItemMediaVariant, string> = {
  default: "bg-transparent",
  icon: "size-8 rounded-sm border border-border bg-muted [&_svg:not([class*='size-'])]:size-4",
  image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
};

/** Returns the ItemMedia class string for a variant. */
export function itemMediaVariants({
  variant = "default",
  className,
}: { variant?: ItemMediaVariant | null; className?: string } = {}) {
  return cn(itemMediaBase, itemMediaVariantClasses[variant ?? "default"], className);
}

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" (as-is, e.g. an Avatar), "icon" (icon in a bordered muted tile) or "image" (40px cover thumbnail). */
  variant?: ItemMediaVariant;
}

/** The leading icon, avatar or thumbnail; aligns to the top when the Item has a description. */
export const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-media"
      data-variant={variant}
      className={itemMediaVariants({ variant, className })}
      {...props}
    />
  ),
);
ItemMedia.displayName = "ItemMedia";

export type ItemContentProps = React.HTMLAttributes<HTMLDivElement>;

/** The flexible middle column holding ItemTitle and ItemDescription. */
export const ItemContent = React.forwardRef<HTMLDivElement, ItemContentProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-content"
    className={cn("flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)}
    {...props}
  />
));
ItemContent.displayName = "ItemContent";

export type ItemTitleProps = React.HTMLAttributes<HTMLDivElement>;

/** The row's primary label; can hold an inline Badge or icon. */
export const ItemTitle = React.forwardRef<HTMLDivElement, ItemTitleProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-title"
    className={cn("flex w-fit items-center gap-2 text-sm font-medium leading-snug", className)}
    {...props}
  />
));
ItemTitle.displayName = "ItemTitle";

export type ItemDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

/** Secondary muted text under the title, clamped to two lines; links inside are underlined. */
export const ItemDescription = React.forwardRef<HTMLParagraphElement, ItemDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-balance text-sm font-normal leading-normal text-muted-foreground",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  ),
);
ItemDescription.displayName = "ItemDescription";

export type ItemActionsProps = React.HTMLAttributes<HTMLDivElement>;

/** Trailing buttons or controls for the row. */
export const ItemActions = React.forwardRef<HTMLDivElement, ItemActionsProps>(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />
));
ItemActions.displayName = "ItemActions";

export type ItemHeaderProps = React.HTMLAttributes<HTMLDivElement>;

/** A full-width row above the main content (e.g. a cover image or a title with a menu). */
export const ItemHeader = React.forwardRef<HTMLDivElement, ItemHeaderProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-header"
    className={cn("flex basis-full items-center justify-between gap-2", className)}
    {...props}
  />
));
ItemHeader.displayName = "ItemHeader";

export type ItemFooterProps = React.HTMLAttributes<HTMLDivElement>;

/** A full-width row below the main content (e.g. metadata or secondary actions). */
export const ItemFooter = React.forwardRef<HTMLDivElement, ItemFooterProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-footer"
    className={cn("flex basis-full items-center justify-between gap-2", className)}
    {...props}
  />
));
ItemFooter.displayName = "ItemFooter";
