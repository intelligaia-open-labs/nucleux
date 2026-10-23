import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3Checkbox } from "@nucleux/md3-checkbox";
import { Md3CircularProgress } from "@nucleux/md3-progress";
import { Md3Switch } from "@nucleux/md3-switch";
import { ChevronRight, Plug } from "lucide-react";
import type {
  ConnectorProps,
  ConnectorListProps,
  ConnectorScopePickerProps,
  ConnectorLivePillProps,
  ConnectorStatus,
  ConnectorScope,
  ConnectorVariant,
  ConnectorScopePickerVariant,
} from "@nucleux/connectors";

// API parity: every props type comes from the shadcn twin, so switching
// families is an import change and nothing else.
export type { ConnectorStatus, ConnectorScope } from "@nucleux/connectors";
export type Md3ConnectorProps = ConnectorProps;
export type Md3ConnectorListProps = ConnectorListProps;
export type Md3ConnectorScopePickerProps = ConnectorScopePickerProps;
export type Md3ConnectorLivePillProps = ConnectorLivePillProps;
/** Alias of `ConnectorStatus` under the family prefix. */
export type Md3ConnectorStatus = ConnectorStatus;
/** Alias of `ConnectorScope` under the family prefix. */
export type Md3ConnectorScope = ConnectorScope;
/** "card" or "row". */
export type Md3ConnectorVariant = ConnectorVariant;
/** "card" or "plain". */
export type Md3ConnectorScopePickerVariant = ConnectorScopePickerVariant;

type Status = Md3ConnectorStatus;

const statusText: Record<Exclude<Status, "disconnected">, string> = {
  connecting: "Connecting…",
  connected: "Connected",
  expired: "Sign-in expired",
  error: "Couldn't connect",
};

/** A status word with a dot beside it — colour reinforces the word, never replaces it. */
function StatusWord({ tone, children }: { tone: "primary" | "tertiary" | "error"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium tracking-[0.03em]",
        tone === "primary" && "text-md-primary",
        tone === "tertiary" && "text-md-tertiary",
        tone === "error" && "text-md-error",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          tone === "primary" && "bg-md-primary",
          tone === "tertiary" && "bg-md-tertiary",
          tone === "error" && "bg-md-error",
        )}
      />
      {children}
    </span>
  );
}

/**
 * Material 3 connector card: enables an external tool or data connector for
 * the agent. Same API and behaviour as `Connector` from `@nucleux/connectors`
 * — icon, name, what it unlocks, a filled Connect button, the scope list in
 * plain verbs before the handoff (each line marked with a chevron at reduced
 * emphasis, because it is only being asked for), the sign-in account once
 * connected, and a status word announced politely (Connecting…, Connected,
 * Sign-in expired with Reconnect, Couldn't connect). Built on an outlined
 * Md3Card that arrives with a short fade-and-rise (none under reduced motion);
 * state colour sits in a dot beside the word, and the outline takes the
 * tertiary or error role for expired and failed sign-ins. `variant="row"` is
 * the compact list row: logo, name and description, and a text-button Connect.
 */
export const Md3Connector = React.forwardRef<HTMLDivElement, Md3ConnectorProps>(
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
      variant = "card",
      detail,
      className,
      ...props
    },
    ref,
  ) => {
    const status: Status = statusProp ?? (connected ? "connected" : "disconnected");
    const reconnect = onReconnect ?? onConnect;
    if (variant === "row") {
      return (
        <div
          ref={ref}
          data-status={status}
          className={cn(
            "font-md",
            "flex min-h-[72px] items-center gap-4 rounded-md-md border bg-md-surface-container-low py-2 pl-4 pr-2 text-md-on-surface",
            status === "expired" ? "border-md-tertiary" : status === "error" ? "border-md-error" : "border-md-outline-variant",
            className,
          )}
          {...props}
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center text-md-on-surface [&_svg]:size-7">
            {icon ?? <Plug aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-base leading-6 tracking-[0.009em]">{name}</span>
            {description && <span className="truncate text-sm leading-5 text-md-on-surface-variant">{description}</span>}
          </div>
          <span role="status" aria-live="polite" className="contents">
            {status === "connected" && (
              <StatusWord tone="primary">
                {statusText.connected}
                {detail ? <> · {detail}</> : null}
              </StatusWord>
            )}
            {status === "connecting" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-md-on-surface-variant">
                <Md3CircularProgress aria-hidden="true" role={undefined} aria-label={undefined} size={16} strokeWidth={2} className="motion-reduce:animate-none" />
                {statusText.connecting}
              </span>
            )}
            {status === "expired" && <StatusWord tone="tertiary">{statusText.expired}</StatusWord>}
            {status === "error" && <StatusWord tone="error">{statusText.error}</StatusWord>}
          </span>
          {status === "connected" && onDisconnect && (
            <Md3Button variant="text" onClick={onDisconnect} className="shrink-0">
              {disconnectLabel}
            </Md3Button>
          )}
          {status === "disconnected" && (
            <Md3Button variant="text" onClick={onConnect} className="shrink-0">
              {connectLabel}
            </Md3Button>
          )}
          {(status === "expired" || status === "error") && reconnect && (
            <Md3Button variant="text" onClick={reconnect} className="shrink-0">
              {status === "expired" ? "Reconnect" : "Try again"}
            </Md3Button>
          )}
        </div>
      );
    }
    return (
      <Md3Card
        ref={ref}
        variant="outlined"
        data-status={status}
        className={cn(
          "font-md",
          "flex flex-col gap-3 bg-md-surface-container-low p-4",
          "animate-nx-fade-in motion-reduce:animate-none",
          status === "expired" && "border-md-tertiary",
          status === "error" && "border-md-error",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md-sm bg-md-secondary-container text-md-on-secondary-container [&_svg]:size-6">
            {icon ?? <Plug aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-base font-medium tracking-[0.009em] text-md-on-surface">{name}</span>
            {description && <span className="text-sm text-md-on-surface-variant">{description}</span>}
          </div>
          <span role="status" aria-live="polite" className="contents">
            {status === "connected" && <StatusWord tone="primary">{statusText.connected}</StatusWord>}
            {status === "connecting" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-md-on-surface-variant">
                <Md3CircularProgress
                  aria-hidden="true"
                  role={undefined}
                  aria-label={undefined}
                  size={16}
                  strokeWidth={2}
                  className="motion-reduce:animate-none"
                />
                {statusText.connecting}
              </span>
            )}
            {status === "expired" && <StatusWord tone="tertiary">{statusText.expired}</StatusWord>}
            {status === "error" && <StatusWord tone="error">{statusText.error}</StatusWord>}
          </span>
          {status === "connected" && onDisconnect && (
            <Md3Button variant="text" onClick={onDisconnect} className="shrink-0">
              {disconnectLabel}
            </Md3Button>
          )}
          {status === "disconnected" && (
            <Md3Button variant="filled" onClick={onConnect} className="shrink-0">
              {connectLabel}
            </Md3Button>
          )}
          {(status === "expired" || status === "error") && reconnect && (
            <Md3Button variant="tonal" onClick={reconnect} className="shrink-0">
              {status === "expired" ? "Reconnect" : "Try again"}
            </Md3Button>
          )}
        </div>
        {status === "error" && error && <p className="text-sm text-md-error">{error}</p>}
        {status === "expired" && (
          <p className="text-sm text-md-on-surface-variant">
            Nothing was lost — sign in again{account ? <> as {account}</> : null} to keep reading from {name}.
          </p>
        )}
        {(status === "disconnected" || status === "connecting") && scopes && scopes.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-md-outline-variant pt-3">
            <p className="text-sm font-medium text-md-on-surface">If you connect, the agent can:</p>
            <ul className="flex flex-col gap-1 text-sm text-md-on-surface-variant">
              {scopes.map((scope, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-md-on-surface-variant opacity-[0.72]" />
                  {scope}
                </li>
              ))}
            </ul>
          </div>
        )}
        {status === "connected" && account && (
          <p className="text-sm text-md-on-surface-variant">
            Signed in as {account}. You can disconnect at any time.
          </p>
        )}
      </Md3Card>
    );
  },
);
Md3Connector.displayName = "Md3Connector";

/**
 * Material 3 connector list: available services with their status and a
 * connect button, one per row. Same API as `ConnectorList` — wrap
 * Md3Connector cards; each child becomes a list item, with an 8dp gap between
 * the outlined cards. `grouped` puts `variant="row"` connectors in one
 * outlined container divided by hairlines, and `showLabel` shows the label
 * above it ("Available sources").
 */
export const Md3ConnectorList = React.forwardRef<HTMLDivElement, Md3ConnectorListProps>(
  ({ label = "Connected services", showLabel = false, grouped = false, className, children, ...props }, ref) => {
    const headingId = React.useId();
    const list = (
      <div
        ref={showLabel ? undefined : ref}
        role="list"
        aria-label={showLabel ? undefined : label}
        aria-labelledby={showLabel ? headingId : undefined}
        className={cn(
          "font-md",
          "flex flex-col",
          grouped
            ? "divide-y divide-md-outline-variant overflow-hidden rounded-md-lg border border-md-outline-variant bg-md-surface-container-low [&>[role=listitem]>*]:rounded-none [&>[role=listitem]>*]:border-0"
            : "gap-2",
          !showLabel && className,
        )}
        {...(showLabel ? {} : props)}
      >
        {React.Children.map(children, (child) =>
          child == null || child === false ? null : <div role="listitem">{child}</div>,
        )}
      </div>
    );
    if (!showLabel) return list;
    return (
      <div ref={ref} className={cn("font-md", "flex flex-col gap-2", className)} {...props}>
        <p id={headingId} className="text-sm leading-5 tracking-[0.25px] text-md-on-surface-variant">
          {label}
        </p>
        {list}
      </div>
    );
  },
);
Md3ConnectorList.displayName = "Md3ConnectorList";

/**
 * Material 3 scope picker: exactly what the agent can read — workspace,
 * channel, folder, repo — granular rather than all-or-nothing, starting from
 * nothing. Same API and behaviour as `ConnectorScopePicker`: a group named by
 * its heading, one Md3Checkbox per scope (granted labels in on-surface, the
 * rest in on-surface-variant), and write access as a separate Md3Switch below
 * a divider.
 */
export const Md3ConnectorScopePicker = React.forwardRef<HTMLDivElement, Md3ConnectorScopePickerProps>(
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
      variant = "card",
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
        className={cn(
          "font-md",
          "flex flex-col gap-1 text-md-on-surface",
          variant === "card" && "rounded-md-md border border-md-outline-variant bg-md-surface-container-low p-4",
          className,
        )}
        {...props}
      >
        <p
          id={headingId}
          className={cn(
            "text-sm tracking-[0.006em]",
            variant === "plain" ? "text-md-on-surface-variant" : "font-medium text-md-on-surface",
          )}
        >
          {title ?? <>{agentName} can read from:</>}
        </p>
        <ul className="-mx-2 flex flex-col">
          {scopes.map((scope) => {
            const on = granted.includes(scope.id);
            const labelId = `${headingId}-${scope.id}`;
            return (
              <li key={scope.id}>
                <label className="flex cursor-pointer items-center gap-1 text-sm">
                  <Md3Checkbox checked={on} onCheckedChange={(c) => set(scope.id, c)} aria-labelledby={labelId} />
                  <span id={labelId} className={cn(on ? "text-md-on-surface" : "text-md-on-surface-variant")}>
                    {scope.label}
                    {scope.description && (
                      <span className="text-xs text-md-on-surface-variant"> · {scope.description}</span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {(allowWrite !== undefined || onAllowWriteChange) && (
          <div className="mt-1 flex items-center justify-between gap-4 border-t border-md-outline-variant pt-3">
            <span id={`${headingId}-write`} className="text-sm text-md-on-surface">
              {writeLabel}
            </span>
            <Md3Switch
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
Md3ConnectorScopePicker.displayName = "Md3ConnectorScopePicker";

/**
 * Material 3 live source pill: a tonal chip (8dp corner, secondary container)
 * with a pulsing primary dot that shows the agent is reading from a connector
 * right now ("Reading 12 docs from Drive…"), announced politely. Same API as
 * `ConnectorLivePill`; pass children to word it yourself. The pulse stops
 * under reduced motion.
 */
export const Md3ConnectorLivePill = React.forwardRef<HTMLSpanElement, Md3ConnectorLivePillProps>(
  ({ source, count, noun = "docs", className, children, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        "font-md",
        "inline-flex h-8 items-center gap-2 rounded-md-sm bg-md-secondary-container px-3 text-sm font-medium tracking-[0.006em] text-md-on-secondary-container",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-md-primary animate-pulse motion-reduce:animate-none" />
      {children ?? (
        <>
          Reading{count != null ? ` ${count} ${noun}` : ""}
          {source ? <> from {source}</> : null}…
        </>
      )}
    </span>
  ),
);
Md3ConnectorLivePill.displayName = "Md3ConnectorLivePill";
