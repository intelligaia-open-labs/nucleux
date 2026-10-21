import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Checkbox } from "@nucleux/checkbox";
import { Spinner } from "@nucleux/spinner";
import { Switch } from "@nucleux/switch";
import { Plug, Check } from "lucide-react";

/** Connection state. `expired` is the sign-in people meet most often: connected once, needs signing in again. */
export type ConnectorStatus = "disconnected" | "connecting" | "connected" | "expired" | "error";

export interface ConnectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Connector name, e.g. `"GitHub"`. */
  name: React.ReactNode;
  /** What the connector gives the agent access to. */
  description?: React.ReactNode;
  /** Connector logo/icon. Defaults to a plug glyph. */
  icon?: React.ReactNode;
  /** Whether the connector is already connected. Shorthand for `status="connected"`. */
  connected?: boolean;
  /** Full connection state; overrides `connected` when set. */
  status?: ConnectorStatus;
  /** Called to connect. Renders the connect button when set and not connected. */
  onConnect?: () => void;
  /** Called to disconnect. Renders a manage/disconnect control when connected. */
  onDisconnect?: () => void;
  /** Called to sign in again when `status` is `"expired"` or `"error"`. Falls back to `onConnect`. */
  onReconnect?: () => void;
  /** Label for the connect action. Defaults to a localized "Connect". */
  connectLabel?: React.ReactNode;
  /** Label for the disconnect action. Defaults to a localized "Disconnect". */
  disconnectLabel?: React.ReactNode;
  /** What the agent will be able to do, in plain verbs — shown before the handoff, e.g. `["Read files in folders you choose", "Search file names"]`. */
  scopes?: React.ReactNode[];
  /** Who the sign-in is with, e.g. `"sam@acme.com"`. Shown once connected. */
  account?: React.ReactNode;
  /** What went wrong, when `status` is `"error"`. */
  error?: React.ReactNode;
}

const statusText: Record<Exclude<ConnectorStatus, "disconnected">, string> = {
  connecting: "Connecting…",
  connected: "Connected",
  expired: "Sign-in expired",
  error: "Couldn't connect",
};

/**
 * A card to enable an external tool or data connector for the agent — icon,
 * name, what it unlocks, and a connect action. Before connecting it can list
 * the scopes in plain verbs (never over-grant); once connected it says who the
 * sign-in is with and that access can be withdrawn. Status is a word, announced
 * politely: Connecting…, Connected, Sign-in expired (with Reconnect), Couldn't
 * connect. Group several in a ConnectorList; narrow access with
 * ConnectorScopePicker; show live reads with ConnectorLivePill.
 * Source: Figma "Context Expansion / Connector suggestion card".
 */
export const Connector = React.forwardRef<HTMLDivElement, ConnectorProps>(
  (
    {
      name,
      description,
      icon,
      connected = false,
      status: statusProp,
      onConnect,
      onDisconnect,
      onReconnect,
      connectLabel = "Connect",
      disconnectLabel = "Disconnect",
      scopes,
      account,
      error,
      className,
      ...props
    },
    ref,
  ) => {
    const status: ConnectorStatus = statusProp ?? (connected ? "connected" : "disconnected");
    const reconnect = onReconnect ?? onConnect;
    return (
      <div
        ref={ref}
        data-status={status}
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-border bg-background p-4",
          status === "expired" && "border-warning/50",
          status === "error" && "border-destructive/50",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:size-5">
            {icon ?? <Plug aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">{name}</span>
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </div>
          <span role="status" aria-live="polite" className="contents">
            {status === "connected" && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success [&_svg]:size-3.5">
                <Check aria-hidden="true" />
                Connected
              </span>
            )}
            {status === "connecting" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <Spinner aria-hidden="true" role={undefined} className="size-3.5 motion-reduce:animate-none" />
                {statusText.connecting}
              </span>
            )}
            {status === "expired" && (
              <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                {statusText.expired}
              </span>
            )}
            {status === "error" && (
              <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                {statusText.error}
              </span>
            )}
          </span>
          {status === "connected" && onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {disconnectLabel}
            </button>
          )}
          {status === "disconnected" && (
            <button
              type="button"
              onClick={onConnect}
              className="inline-flex shrink-0 items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {connectLabel}
            </button>
          )}
          {(status === "expired" || status === "error") && reconnect && (
            <Button size="sm" variant="secondary" onClick={reconnect} className="shrink-0">
              {status === "expired" ? "Reconnect" : "Try again"}
            </Button>
          )}
        </div>
        {status === "error" && error && <p className="text-xs text-destructive">{error}</p>}
        {status === "expired" && (
          <p className="text-xs text-muted-foreground">
            Nothing was lost — sign in again{account ? <> as {account}</> : null} to keep reading from {name}.
          </p>
        )}
        {(status === "disconnected" || status === "connecting") && scopes && scopes.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground">If you connect, the agent can:</p>
            <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              {scopes.map((scope, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                  {scope}
                </li>
              ))}
            </ul>
          </div>
        )}
        {status === "connected" && account && (
          <p className="text-xs text-muted-foreground">
            Signed in as {account}. You can disconnect at any time.
          </p>
        )}
      </div>
    );
  },
);
Connector.displayName = "Connector";

export interface ConnectorListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name. Defaults to `"Connected services"`. */
  label?: string;
}

/**
 * The connector list: available services with their status and a connect
 * button, one per row. Wrap Connector cards; each child becomes a list item.
 */
export const ConnectorList = React.forwardRef<HTMLDivElement, ConnectorListProps>(
  ({ label = "Connected services", className, children, ...props }, ref) => (
    <div ref={ref} role="list" aria-label={label} className={cn("flex flex-col gap-2", className)} {...props}>
      {React.Children.map(children, (child) =>
        child == null || child === false ? null : <div role="listitem">{child}</div>,
      )}
    </div>
  ),
);
ConnectorList.displayName = "ConnectorList";

/** One thing the agent could read: a channel, folder, repo or branch. */
export interface ConnectorScope {
  /** Stable id. */
  id: string;
  /** Label, e.g. `"#renewals"`. */
  label: React.ReactNode;
  /** Optional detail, e.g. `"412 messages"`. */
  description?: React.ReactNode;
}

export interface ConnectorScopePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "defaultValue" | "onChange"> {
  /** The scopes on offer. */
  scopes: ConnectorScope[];
  /** Granted scope ids (controlled). */
  value?: string[];
  /** Initial grant (uncontrolled). Defaults to none — least privilege. */
  defaultValue?: string[];
  /** Called with the granted ids. */
  onValueChange?: (ids: string[]) => void;
  /** Who reads. Defaults to `"Aria"`. */
  agentName?: React.ReactNode;
  /** Heading override. Defaults to `"<agent> can read from:"`. */
  title?: React.ReactNode;
  /** Write access, asked separately (controlled). Renders the write switch when this or `onAllowWriteChange` is set. */
  allowWrite?: boolean;
  /** Called when write access is switched. */
  onAllowWriteChange?: (on: boolean) => void;
  /** Label for the write switch. Defaults to `"Also allow changes (create, edit, post)"`. */
  writeLabel?: React.ReactNode;
}

/**
 * The scope picker: exactly what the agent can read — workspace, channel,
 * folder, repo — granular rather than all-or-nothing, starting from nothing.
 * Write access, when offered, is a separate and visible question.
 */
export const ConnectorScopePicker = React.forwardRef<HTMLDivElement, ConnectorScopePickerProps>(
  (
    {
      scopes,
      value,
      defaultValue = [],
      onValueChange,
      agentName = "Aria",
      title,
      allowWrite,
      onAllowWriteChange,
      writeLabel = "Also allow changes (create, edit, post)",
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const granted = value !== undefined ? value : internal;
    const headingId = React.useId();
    const set = (id: string, on: boolean) => {
      const next = on ? [...granted, id] : granted.filter((g) => g !== id);
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={headingId}
        className={cn("flex flex-col gap-2 rounded-xl border border-border bg-background p-3", className)}
        {...props}
      >
        <p id={headingId} className="text-sm font-semibold text-foreground">
          {title ?? <>{agentName} can read from:</>}
        </p>
        <ul className="flex flex-col gap-1.5">
          {scopes.map((scope) => {
            const on = granted.includes(scope.id);
            const labelId = `${headingId}-${scope.id}`;
            return (
              <li key={scope.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={on} onCheckedChange={(c) => set(scope.id, c)} aria-labelledby={labelId} />
                  <span id={labelId} className={cn(on ? "text-foreground" : "text-muted-foreground")}>
                    {scope.label}
                    {scope.description && <span className="text-xs text-muted-foreground"> · {scope.description}</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {(allowWrite !== undefined || onAllowWriteChange) && (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
            <span id={`${headingId}-write`} className="text-sm text-foreground">
              {writeLabel}
            </span>
            <Switch
              size="sm"
              checked={allowWrite ?? false}
              onCheckedChange={onAllowWriteChange}
              aria-labelledby={`${headingId}-write`}
            />
          </div>
        )}
      </div>
    );
  },
);
ConnectorScopePicker.displayName = "ConnectorScopePicker";

export interface ConnectorLivePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The connector being read, e.g. `"Drive"`. */
  source?: React.ReactNode;
  /** How many items are being read. */
  count?: number;
  /** Noun for `count`. Defaults to `"docs"`. */
  noun?: string;
}

/**
 * The live source pill: a pulsing chip that shows the agent is reading from a
 * connector right now ("Reading 12 docs from Drive…"), announced politely.
 * Pass children to word it yourself. The pulse stops under reduced motion.
 */
export const ConnectorLivePill = React.forwardRef<HTMLSpanElement, ConnectorLivePillProps>(
  ({ source, count, noun = "docs", className, children, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-brand/50 bg-brand-muted/50 px-3 py-1 text-xs font-semibold text-brand",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-brand animate-pulse motion-reduce:animate-none" />
      {children ?? (
        <>
          Reading{count != null ? ` ${count} ${noun}` : ""}
          {source ? <> from {source}</> : null}…
        </>
      )}
    </span>
  ),
);
ConnectorLivePill.displayName = "ConnectorLivePill";
