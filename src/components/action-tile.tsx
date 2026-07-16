import * as React from "react";
import { cn } from "../lib/utils";

export interface ActionTileProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** Icon shown in the accent container at the top of the tile. */
  icon: React.ReactNode;
  /** Tile title. */
  title: React.ReactNode;
  /** Supporting description below the title. */
  description?: React.ReactNode;
}

/**
 * A large, selectable action card — icon in an accent container, a title, and a
 * short description. Used for entry points like "Record a meeting" /
 * "Upload a recording" / "Paste a link".
 */
export const ActionTile = React.forwardRef<HTMLButtonElement, ActionTileProps>(
  ({ icon, title, description, type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "group flex h-full w-full flex-col items-start gap-4 rounded-xl border border-border bg-background p-6 text-left transition-colors hover:border-brand/40 hover:bg-brand-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-lg bg-brand-muted text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-base font-medium text-foreground">{title}</span>
        {description && (
          <span className="text-sm leading-5 text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  ),
);
ActionTile.displayName = "ActionTile";
