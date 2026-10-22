import * as React from "react";
import { cn } from "@nucleux/utils";
import { Badge } from "@nucleux/badge";
import { Button } from "@nucleux/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@nucleux/collapsible";
import { Radio, RadioGroup } from "@nucleux/radio-group";
import { Spinner } from "@nucleux/spinner";
import { Switch } from "@nucleux/switch";
import { Check, Circle, Server, X } from "lucide-react";

/** Where the connection is. `connected` means reached, signed in *and* tools discovered. */
export type McpConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

/** The three establishment steps, which fail for different reasons and are fixed in different places. */
export type McpConnectionStage = "reach" | "authenticate" | "discover";

/** Risk band of a tool, from its annotations: reads only, changes things, or destructive. */
export type McpConnectionToolRisk = "read" | "write" | "destructive";

/** Whether the agent may call a tool without asking. */
export type McpConnectionToolAvailability = "allowed" | "ask" | "off";

/** The trust-budget answer for a tool: always, just this once, or never. */
export type McpConnectionPermissionValue = "always" | "once" | "never";

/** Lifecycle of one proposed tool call. */
export type McpConnectionActionStatus = "pending" | "running" | "done" | "error";

const stageOrder: McpConnectionStage[] = ["reach", "authenticate", "discover"];
const stageLabel: Record<McpConnectionStage, string> = {
  reach: "Reach server",
  authenticate: "Sign in",
  discover: "Discover tools",
};
const statusWord: Record<McpConnectionStatus, string> = {
  disconnected: "Not connected",
  connecting: "Connecting",
  connected: "Ready",
  error: "Can't connect",
};
const riskLabel: Record<McpConnectionToolRisk, string> = {
  read: "Reads only",
  write: "Changes things",
  destructive: "Destructive",
};
const riskNote: Record<McpConnectionToolRisk, string> = {
  read: "Looks things up; changes nothing",
  write: "Creates or edits items",
  destructive: "Deletes or overwrites; can't be undone",
};
const availabilityWord: Record<McpConnectionToolAvailability, string> = {
  allowed: "Allowed",
  ask: "Approval required",
  off: "Off",
};

const McpContext = React.createContext<{ name?: React.ReactNode; status?: McpConnectionStatus }>({});

export interface McpConnectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Server name, e.g. `"Linear MCP"`. */
  name: React.ReactNode;
  /** Address or transport line, e.g. `"https://mcp.linear.app/sse"`. */
  address?: React.ReactNode;
  /** Logo or mark. Defaults to a server glyph. */
  icon?: React.ReactNode;
  /** Connection state. Defaults to `"disconnected"`. */
  status?: McpConnectionStatus;
  /** The step in progress while `connecting`, or the one that failed on `error`. */
  stage?: McpConnectionStage;
  /** Why it failed, in words, when `status` is `"error"`. */
  error?: React.ReactNode;
  /** Short line after the name, e.g. `"4 tools · 3 resources"`. */
  meta?: React.ReactNode;
  /** Who the server is signed in as, e.g. `"OAuth · sam@acme.com"`. */
  account?: React.ReactNode;
  /** What the sign-in grants, in plain verbs, e.g. `["Read issues", "Create issues"]`. */
  scopes?: React.ReactNode[];
  /** Start connecting. Shows Connect while disconnected. */
  onConnect?: () => void;
  /** Disconnect. Shows Disconnect while connected (and Cancel while connecting). */
  onDisconnect?: () => void;
  /** Retry after a failure. Shows Try again on error. */
  onRetry?: () => void;
  /** Sign in again; offered instead of Try again when the sign-in step failed. */
  onAuthenticate?: () => void;
  /** Label of the Connect button. Defaults to `"Connect"`. */
  connectLabel?: React.ReactNode;
  /** Before anything is connected: a heading for the empty state, e.g. `"No MCP servers connected"`. With it (or `emptyDescription`) the Connect button sits under the text. */
  emptyTitle?: React.ReactNode;
  /** Before anything is connected: what connecting gives the agent. */
  emptyDescription?: React.ReactNode;
}

/**
 * A connection to a Model Context Protocol server: its name, address and
 * status (a ring while it can't be used, a filled dot when it can, and always
 * a word), the three named establishment steps — reach, sign in, discover —
 * that resolve one at a time so a failure says which one broke, the account
 * and scopes it is signed in with, and Connect / Disconnect / Try again. All
 * networking is the app's: it moves `status` and `stage` and handles the
 * callbacks. Put McpConnectionTools, McpConnectionPermission and
 * McpConnectionActionPreview inside as children. Before anything is connected,
 * `emptyTitle` / `emptyDescription` turn the card into its empty state with
 * the Connect button (`connectLabel`) under the text.
 */
export const McpConnection = React.forwardRef<HTMLElement, McpConnectionProps>(
  (
    {
      name,
      address,
      icon,
      status = "disconnected",
      stage,
      error,
      meta,
      account,
      scopes,
      onConnect,
      onDisconnect,
      onRetry,
      onAuthenticate,
      connectLabel = "Connect",
      emptyTitle,
      emptyDescription,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const usable = status === "connected";
    const empty = status === "disconnected" && (emptyTitle != null || emptyDescription != null);
    const footer =
      (status === "disconnected" && !!onConnect && !empty) ||
      (status === "connecting" && !!onDisconnect) ||
      (status === "error" && !!(onRetry || onAuthenticate || onDisconnect)) ||
      (status === "connected" && !!onDisconnect);
    const showSteps = status === "connecting" || status === "error";
    const current = stageOrder.indexOf(stage ?? "reach");

    return (
      <McpContext.Provider value={{ name, status }}>
        <section
          ref={ref}
          aria-labelledby={titleId}
          data-status={status}
          className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground", className)}
          {...props}
        >
          <div className="flex items-center gap-3 p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted [&_svg]:size-5">
              {icon ?? <Server aria-hidden="true" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 id={titleId} className="truncate text-sm font-semibold">
                {name}
              </h3>
              {(address || meta) && (
                <p className="truncate text-xs text-muted-foreground">
                  {address && <span className="font-mono">{address}</span>}
                  {address && meta && " · "}
                  {meta}
                </p>
              )}
            </div>
            <span
              role="status"
              aria-live="polite"
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                usable && "border-success/40 text-success",
                status === "error" && "border-destructive/40 text-destructive",
                (status === "disconnected" || status === "connecting") && "border-border text-muted-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full border-2 border-current",
                  usable && "bg-current",
                  status === "connecting" && "animate-pulse motion-reduce:animate-none",
                )}
              />
              {statusWord[status]}
            </span>
          </div>

          {showSteps && (
            <ol aria-label="Connection steps" className="flex flex-col gap-1.5 border-t border-border px-4 py-3 text-sm">
              {stageOrder.map((s, i) => {
                const failed = status === "error" && i === current;
                const done = i < current;
                const active = status === "connecting" && i === current;
                const word = failed ? "failed" : done ? "done" : active ? "in progress" : "waiting";
                return (
                  <li
                    key={s}
                    data-step-state={word}
                    className={cn(
                      "flex items-center gap-2 animate-nx-fade-in motion-reduce:animate-none",
                      failed ? "text-destructive" : done || active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <span className="inline-flex size-4 items-center justify-center [&_svg]:size-4" aria-hidden="true">
                      {failed ? (
                        <X />
                      ) : done ? (
                        <Check className="text-success" />
                      ) : active ? (
                        <Spinner aria-hidden="true" role={undefined} className="motion-reduce:animate-none" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </span>
                    {stageLabel[s]}
                    <span className="sr-only"> — {word}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {empty && (
            <div className="flex flex-col items-start gap-1 px-4 pb-4">
              {emptyTitle != null && <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>}
              {emptyDescription != null && <p className="text-sm text-muted-foreground">{emptyDescription}</p>}
              {onConnect && (
                <Button size="sm" onClick={onConnect} className="mt-2">
                  {connectLabel}
                </Button>
              )}
            </div>
          )}

          {status === "error" && error && (
            <p className="mx-4 mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          {usable && (account || scopes?.length) && (
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
              {account && <p className="text-xs text-muted-foreground">Signed in: {account}</p>}
              {scopes && scopes.length > 0 && (
                <ul aria-label="Granted scopes" className="flex flex-wrap gap-1.5">
                  {scopes.map((scope, i) => (
                    <li key={i}>
                      <Badge variant="outline">{scope}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {children && <div className="flex flex-col gap-3 border-t border-border p-4">{children}</div>}

          {footer && (
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              {status === "disconnected" && onConnect && (
                <Button size="sm" onClick={onConnect}>
                  {connectLabel}
                </Button>
              )}
              {status === "connecting" && onDisconnect && (
                <Button size="sm" variant="ghost" onClick={onDisconnect}>
                  Cancel
                </Button>
              )}
              {status === "error" && stage === "authenticate" && onAuthenticate ? (
                <Button size="sm" onClick={onAuthenticate}>
                  Sign in again
                </Button>
              ) : (
                status === "error" &&
                onRetry && (
                  <Button size="sm" onClick={onRetry}>
                    Try again
                  </Button>
                )
              )}
              {(status === "connected" || status === "error") && onDisconnect && (
                <Button size="sm" variant="ghost" onClick={onDisconnect}>
                  {status === "error" ? "Remove" : "Disconnect"}
                </Button>
              )}
            </div>
          )}
        </section>
      </McpContext.Provider>
    );
  },
);
McpConnection.displayName = "McpConnection";

/** One tool the server declared. */
export interface McpConnectionToolInfo {
  /** The tool's name on the server, e.g. `"create_issue"`. */
  id: string;
  /** Human name, e.g. `"Create issue"`. Defaults to `id`. */
  title?: React.ReactNode;
  /** What it does — as the server describes it. */
  description?: React.ReactNode;
  /** Risk band. Defaults to `"read"`. */
  risk?: McpConnectionToolRisk;
  /** Whether it is turned on. Defaults to `true`. */
  enabled?: boolean;
  /** When enabled: run without asking (`"allowed"`) or ask each time (`"ask"`). Defaults to `"ask"` for write and destructive tools, `"allowed"` for reads. */
  availability?: Exclude<McpConnectionToolAvailability, "off">;
  /** Input schema to inspect (shown as JSON), or any node. */
  schema?: Record<string, unknown> | React.ReactNode;
  /** The last call's error. Says the tool failed — not that the server is down. */
  error?: React.ReactNode;
}

export interface McpConnectionToolProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** The tool. */
  tool: McpConnectionToolInfo;
  /** Turn the tool on or off. Renders a switch when set. */
  onEnabledChange?: (enabled: boolean) => void;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !React.isValidElement(v) && !Array.isArray(v);

/**
 * One tool row: human name, the server's id in code, its description, and its
 * availability as a word (Allowed, Approval required, Off). The row expands to
 * inspect the input schema, which stays behind it rather than in it. An
 * optional switch turns the tool on or off. A failed call shows on this row
 * only — the connection is not greyed out for it.
 */
export const McpConnectionTool = React.forwardRef<HTMLLIElement, McpConnectionToolProps>(
  ({ tool, onEnabledChange, className, ...props }, ref) => {
    const risk = tool.risk ?? "read";
    const enabled = tool.enabled ?? true;
    const availability: McpConnectionToolAvailability = !enabled
      ? "off"
      : (tool.availability ?? (risk === "read" ? "allowed" : "ask"));
    const title = tool.title ?? tool.id;
    const titleText = typeof title === "string" ? title : tool.id;
    return (
      <li
        ref={ref}
        data-risk={risk}
        data-enabled={enabled}
        className={cn("flex items-start gap-3 px-3 py-2.5", !enabled && "opacity-70", className)}
        {...props}
      >
        <Collapsible className="min-w-0 flex-1">
          <CollapsibleTrigger className="items-start text-left">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-foreground">{title}</span>
                <code className="font-mono text-xs text-brand">{tool.id}</code>
              </span>
              {tool.description && (
                <span className="text-xs font-normal text-muted-foreground">{tool.description}</span>
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  availability === "allowed" && "text-success",
                  availability === "ask" && "text-foreground",
                  availability === "off" && "text-muted-foreground",
                )}
              >
                {availabilityWord[availability]}
              </span>
              {tool.error && (
                <span className="text-xs font-normal text-destructive">Last call failed: {tool.error}</span>
              )}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {tool.schema == null ? (
              <p className="text-xs">No input schema declared.</p>
            ) : isPlainObject(tool.schema) ? (
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 font-mono text-xs text-foreground">
                {JSON.stringify(tool.schema, null, 2)}
              </pre>
            ) : (
              (tool.schema as React.ReactNode)
            )}
          </CollapsibleContent>
        </Collapsible>
        {onEnabledChange && (
          <Switch
            size="sm"
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label={`${titleText} — ${riskLabel[risk]}`}
            className="mt-0.5"
          />
        )}
      </li>
    );
  },
);
McpConnectionTool.displayName = "McpConnectionTool";

/** "grouped" (default): tools in risk bands, each row with its name, availability and schema. "compact": one line per tool — its id and what it does. */
export type McpConnectionToolsVariant = "grouped" | "compact";

export interface McpConnectionToolsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The tools discovery turned up. */
  tools: McpConnectionToolInfo[];
  /** Heading. Defaults to `"<server> · N actions"`. */
  title?: React.ReactNode;
  /** Turn one tool on or off. Renders a switch per row when set. */
  onToolEnabledChange?: (id: string, enabled: boolean) => void;
  /** The sentence that keeps the list honest. Pass `null` to hide. */
  trustNote?: React.ReactNode;
  /** "grouped" (default) or "compact". */
  variant?: McpConnectionToolsVariant;
}

/**
 * The tool capability list: what the server says the agent can do, grouped
 * least dangerous first — Reads only, Changes things, Destructive — so reading
 * down the list is reading up a risk ladder. Ends with a reminder that names
 * and descriptions come from the server, not from this product.
 * `variant="compact"` lists one line per tool: its id and what it does.
 */
export const McpConnectionTools = React.forwardRef<HTMLDivElement, McpConnectionToolsProps>(
  ({ tools, title, onToolEnabledChange, trustNote, variant = "grouped", className, ...props }, ref) => {
    const { name } = React.useContext(McpContext);
    const headingId = React.useId();
    const count = `${tools.length} ${tools.length === 1 ? "action" : "actions"}`;
    const bands = (["read", "write", "destructive"] as const)
      .map((risk) => ({ risk, items: tools.filter((t) => (t.risk ?? "read") === risk) }))
      .filter((b) => b.items.length > 0);
    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={headingId}
        className={cn("overflow-hidden rounded-lg border border-border", className)}
        {...props}
      >
        <p id={headingId} className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
          {title ?? (name ? <>{name} · {count}</> : `Tools · ${count}`)}
        </p>
        {variant === "compact" && (
          <ul aria-labelledby={headingId} className="py-1">
            {tools.map((tool) => {
              const enabled = tool.enabled ?? true;
              const titleText = typeof tool.title === "string" ? tool.title : tool.id;
              return (
                <li key={tool.id} data-risk={tool.risk ?? "read"} className={cn("flex items-center gap-2 px-3 py-2", !enabled && "opacity-70")}>
                  <code className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 font-mono text-xs text-brand">{tool.id}</code>
                  {tool.description && <span className="min-w-0 flex-1 text-xs text-muted-foreground">{tool.description}</span>}
                  {onToolEnabledChange && (
                    <Switch
                      size="sm"
                      checked={enabled}
                      onCheckedChange={(on) => onToolEnabledChange(tool.id, on)}
                      aria-label={`${titleText} — ${riskLabel[tool.risk ?? "read"]}`}
                      className="ml-auto"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {variant === "grouped" && bands.map(({ risk, items }) => (
          <div key={risk} data-risk={risk} className="border-b border-border last:border-b-0">
            <p
              id={`${headingId}-${risk}`}
              className={cn(
                "px-3 pt-2 text-xs font-semibold",
                risk === "destructive" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {riskLabel[risk]} <span className="font-normal">· {riskNote[risk]}</span>
            </p>
            <ul aria-labelledby={`${headingId}-${risk}`} className="divide-y divide-border">
              {items.map((tool) => (
                <McpConnectionTool
                  key={tool.id}
                  tool={tool}
                  onEnabledChange={onToolEnabledChange ? (on) => onToolEnabledChange(tool.id, on) : undefined}
                />
              ))}
            </ul>
          </div>
        ))}
        {trustNote !== null && (
          <p className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {trustNote ?? "Tool names and descriptions come from the server, not from this product. Enable only what you recognise."}
          </p>
        )}
      </div>
    );
  },
);
McpConnectionTools.displayName = "McpConnectionTools";

export interface McpConnectionPermissionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "defaultValue"> {
  /** What is being allowed, e.g. `"Linear"` or `"git push"`. */
  subject: React.ReactNode;
  /** Who is asking. Defaults to `"Aria"`. */
  agentName?: React.ReactNode;
  /** Question override. Defaults to `"Allow <agent> to use <subject>?"`. */
  title?: React.ReactNode;
  /** Selected answer (controlled). */
  value?: McpConnectionPermissionValue;
  /** Initial answer (uncontrolled). */
  defaultValue?: McpConnectionPermissionValue;
  /** Called with the chosen answer. */
  onValueChange?: (value: McpConnectionPermissionValue) => void;
  /** Risk of the subject. `"destructive"` drops "Always": no blanket yes to an irreversible call. */
  risk?: McpConnectionToolRisk;
  /** Label overrides per answer. */
  labels?: Partial<Record<McpConnectionPermissionValue, React.ReactNode>>;
}

/**
 * The permission toggle: per-tool "Always", "Just this once" or "Don't allow"
 * — the agent's trust budget made explicit, as a radio group. For a
 * destructive subject "Always" is not offered.
 */
export const McpConnectionPermission = React.forwardRef<HTMLDivElement, McpConnectionPermissionProps>(
  (
    { subject, agentName = "Aria", title, value, defaultValue, onValueChange, risk = "write", labels, className, ...props },
    ref,
  ) => {
    const headingId = React.useId();
    const options: McpConnectionPermissionValue[] =
      risk === "destructive" ? ["once", "never"] : ["always", "once", "never"];
    const text: Record<McpConnectionPermissionValue, React.ReactNode> = {
      always: "Always · for this workspace",
      once: "Just this once",
      never: "Don't allow",
      ...labels,
    };
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 rounded-lg border p-3",
          risk === "destructive" ? "border-destructive/40 bg-destructive/5" : "border-border bg-background",
          className,
        )}
        {...props}
      >
        <p id={headingId} className="text-sm font-semibold text-foreground">
          {title ?? (
            <>
              Allow {agentName} to use {subject}?
            </>
          )}
        </p>
        <RadioGroup
          aria-labelledby={headingId}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(v) => onValueChange?.(v as McpConnectionPermissionValue)}
          className="gap-1.5"
        >
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-accent",
                "has-[[aria-checked=true]]:border-brand has-[[aria-checked=true]]:bg-brand-muted/50 has-[[aria-checked=true]]:font-medium",
                opt === "never" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              <Radio value={opt} aria-labelledby={`${headingId}-${opt}`} />
              <span id={`${headingId}-${opt}`}>{text[opt]}</span>
            </label>
          ))}
        </RadioGroup>
      </div>
    );
  },
);
McpConnectionPermission.displayName = "McpConnectionPermission";

/** Formats a call as `tool({ key: "value", … })`. */
/** A proposed call split for display: the server prefix, the tool, and each argument as JSON. */
export interface McpCallParts {
  /** `"linear"` in `"linear.create_issue"`; empty when the name has no prefix. */
  server: string;
  /** `"create_issue"`. */
  method: string;
  /** `[JSON key, JSON value]` pairs, e.g. `['"title"', '"Renewal flow broken"']`. */
  args: Array<[string, string]>;
}

/** Splits `tool` and `args` for the action preview, so each family can colour them. */
export function mcpCallParts(tool: string, args?: Record<string, unknown>): McpCallParts {
  const dot = tool.indexOf(".");
  return {
    server: dot > 0 ? tool.slice(0, dot) : "",
    method: dot > 0 ? tool.slice(dot + 1) : tool,
    args: Object.entries(args ?? {}).map(([k, v]) => [JSON.stringify(k), JSON.stringify(v)]),
  };
}

/** The call as code: `server.method({` / `  "key": value,` / `})`, the server in the accent, keys and values tinted. */
function CallCode({ tool, args }: { tool: string; args?: Record<string, unknown> }) {
  const call = mcpCallParts(tool, args);
  return (
    <>
      {call.server && (
        <>
          <span className="text-brand">{call.server}</span>.
        </>
      )}
      {call.method}
      {call.args.length === 0 ? (
        "()"
      ) : (
        <>
          {"({"}
          {call.args.map(([k, v], i) => (
            <React.Fragment key={k}>
              {"\n  "}
              <span className="text-warning">{k}</span>: <span className="text-success">{v}</span>
              {i < call.args.length - 1 ? "," : ""}
            </React.Fragment>
          ))}
          {"\n})"}
        </>
      )}
    </>
  );
}

export interface McpConnectionActionPreviewProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Qualified tool name, e.g. `"linear.create_issue"`. */
  tool: string;
  /** The arguments the agent wants to pass — shown before anything runs. */
  args?: Record<string, unknown>;
  /** Expected effect in plain words, e.g. `"Files a new bug in the Apollo team."`. */
  effect?: React.ReactNode;
  /** Risk of the call. `"destructive"` uses the destructive treatment and button. */
  risk?: McpConnectionToolRisk;
  /** Where the call is. Defaults to `"pending"` (waiting for approval). */
  status?: McpConnectionActionStatus;
  /** Result once `"done"`. */
  result?: React.ReactNode;
  /** The tool's error once `"error"` — the tool failed, the server is still connected. */
  error?: React.ReactNode;
  /** Heading. Defaults to `"Proposed action"` (or `"Destructive action"`). */
  title?: React.ReactNode;
  /** Approve the call as shown. Also offered as Try again after an error. */
  onApprove?: () => void;
  /** Change the arguments before running. */
  onEdit?: () => void;
  /** Refuse, and never allow this tool. */
  onDeny?: () => void;
  /** Label overrides. */
  approveLabel?: React.ReactNode;
  editLabel?: React.ReactNode;
  denyLabel?: React.ReactNode;
}

/**
 * The action preview: before the agent runs a tool, the call is shown —
 * name, arguments, expected effect — with Approve, Edit and Never allow. It
 * then reports running, the result, or the tool's own error (which is not a
 * server outage). A destructive call gets the destructive treatment; routine
 * writes ask on a calm surface so people keep reading them.
 */
export const McpConnectionActionPreview = React.forwardRef<HTMLElement, McpConnectionActionPreviewProps>(
  (
    {
      tool,
      args,
      effect,
      risk = "write",
      status = "pending",
      result,
      error,
      title,
      onApprove,
      onEdit,
      onDeny,
      approveLabel = "Approve",
      editLabel = "Edit",
      denyLabel = "Never allow",
      className,
      ...props
    },
    ref,
  ) => {
    const titleId = React.useId();
    const destructive = risk === "destructive";
    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        data-status={status}
        data-risk={risk}
        className={cn(
          "flex flex-col gap-2 rounded-lg border p-3 animate-nx-fade-in motion-reduce:animate-none",
          destructive ? "border-destructive/50 bg-destructive/5" : "border-brand/40 bg-brand-muted/40",
          className,
        )}
        {...props}
      >
        <h4
          id={titleId}
          className={cn("text-xs font-semibold uppercase tracking-wide", destructive ? "text-destructive" : "text-brand")}
        >
          {title ?? (destructive ? "Destructive action" : "Proposed action")}
        </h4>
        <code className="block whitespace-pre-wrap break-words rounded-md border border-border bg-background p-2.5 font-mono text-xs leading-[18px] text-foreground">
          <CallCode tool={tool} args={args} />
        </code>
        {effect && <p className="text-xs text-muted-foreground">{effect}</p>}
        <div role="status" aria-live="polite" className="text-xs empty:hidden">
          {status === "running" && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Spinner aria-hidden="true" role={undefined} className="size-3.5 motion-reduce:animate-none" />
              Running {tool}…
            </span>
          )}
          {status === "done" && (
            <span className="inline-flex items-start gap-1.5 text-foreground">
              <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span>{result ?? "Done."}</span>
            </span>
          )}
          {status === "error" && (
            <span className="text-destructive">
              This call failed{error ? <>: {error}</> : "."} The server is still connected.
            </span>
          )}
        </div>
        {(status === "pending" || status === "error") && (onApprove || onEdit || onDeny) && (
          <div className="flex flex-wrap gap-2">
            {onApprove && (
              <Button size="sm" variant={destructive ? "destructive" : "primary"} onClick={onApprove}>
                {status === "error" ? "Try again" : approveLabel}
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={onEdit}>
                {editLabel}
              </Button>
            )}
            {onDeny && (
              <Button size="sm" variant="secondary" onClick={onDeny} className="text-muted-foreground">
                {denyLabel}
              </Button>
            )}
          </div>
        )}
      </section>
    );
  },
);
McpConnectionActionPreview.displayName = "McpConnectionActionPreview";
