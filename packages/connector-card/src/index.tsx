import * as React from "react";
import { cn } from "@nucleux/utils";
import { Plug, Check } from "lucide-react";

export interface ConnectorCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Connector name, e.g. `"GitHub"`. */
  name: React.ReactNode;
  /** What the connector gives the agent access to. */
  description?: React.ReactNode;
  /** Connector logo/icon. Defaults to a plug glyph. */
  icon?: React.ReactNode;
  /** Whether the connector is already connected. */
  connected?: boolean;
  /** Called to connect. Renders the connect button when set and not connected. */
  onConnect?: () => void;
  /** Called to disconnect. Renders a manage/disconnect control when connected. */
  onDisconnect?: () => void;
  connectLabel?: React.ReactNode;
  disconnectLabel?: React.ReactNode;
}

/**
 * A card to enable an external tool or data connector for the agent — icon,
 * name, what it unlocks, and a connect action.
 * Source: Figma "Context Expansion / Connector suggestion card".
 */
export const ConnectorCard = React.forwardRef<HTMLDivElement, ConnectorCardProps>(
  (
    {
      name,
      description,
      icon,
      connected = false,
      onConnect,
      onDisconnect,
      connectLabel = "Connect",
      disconnectLabel = "Disconnect",
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-background p-4",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:size-5">
        {icon ?? <Plug aria-hidden="true" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      {connected ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success [&_svg]:size-3.5">
            <Check aria-hidden="true" />
            Connected
          </span>
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {disconnectLabel}
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex shrink-0 items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {connectLabel}
        </button>
      )}
    </div>
  ),
);
ConnectorCard.displayName = "ConnectorCard";
