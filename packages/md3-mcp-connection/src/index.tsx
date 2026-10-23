import * as React from "react";
import { cn } from "@nucleux/utils";
import { Md3Button } from "@nucleux/md3-button";
import { Md3CircularProgress } from "@nucleux/md3-progress";
import { Md3Radio, Md3RadioGroup } from "@nucleux/md3-radio";
import { Md3Switch } from "@nucleux/md3-switch";
import { Check, ChevronDown, Circle, Server, X } from "lucide-react";
import type {
  McpConnectionActionPreviewProps,
  McpConnectionActionStatus,
  McpConnectionPermissionProps,
  McpConnectionPermissionValue,
  McpConnectionProps,
  McpConnectionStage,
  McpConnectionStatus,
  McpConnectionToolAvailability,
  McpConnectionToolProps,
  McpConnectionToolRisk,
  McpConnectionToolsProps,
  McpConnectionToolsVariant,
} from "@nucleux/mcp-connection";
import { mcpCallParts } from "@nucleux/mcp-connection";

// Types come from the shadcn twin so the two families stay call-compatible.
export type Md3McpConnectionProps = McpConnectionProps;
export type Md3McpConnectionToolProps = McpConnectionToolProps;
export type Md3McpConnectionToolsProps = McpConnectionToolsProps;
export type Md3McpConnectionPermissionProps = McpConnectionPermissionProps;
export type Md3McpConnectionActionPreviewProps = McpConnectionActionPreviewProps;
export type Md3McpConnectionStatus = McpConnectionStatus;
export type Md3McpConnectionStage = McpConnectionStage;
export type Md3McpConnectionToolRisk = McpConnectionToolRisk;
export type Md3McpConnectionToolAvailability = McpConnectionToolAvailability;
export type Md3McpConnectionPermissionValue = McpConnectionPermissionValue;
export type Md3McpConnectionActionStatus = McpConnectionActionStatus;
/** "grouped" or "compact". */
export type Md3McpConnectionToolsVariant = McpConnectionToolsVariant;
export type { McpConnectionToolInfo } from "@nucleux/mcp-connection";

// Wording copied from @nucleux/mcp-connection (internal there) so both families say the same words.
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

const stateLayer =
  "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";
/** M3 emphasized-decelerate entrance, used for the approval gate so it arrives on its own easing. */
const gateEnter =
  "animate-nx-fade-in [animation-duration:400ms] [animation-timing-function:cubic-bezier(0.05,0.7,0.1,1)] motion-reduce:animate-none";

const McpContext = React.createContext<{ name?: React.ReactNode; status?: McpConnectionStatus }>({});

/**
 * Material 3 twin of McpConnection: an outlined card for a Model Context
 * Protocol server with its name, address and status (a ring while it can't be
 * used, a filled disc when it can, and always a word), the three named
 * establishment steps — reach, sign in, discover — resolving one at a time so
 * a failure names the step that broke, the signed-in account and its scopes as
 * small outlined chips, and Connect / Disconnect / Try again as M3 buttons. It
 * takes exactly the props of `McpConnection`; the app owns all networking and
 * moves `status` and `stage`. With `emptyTitle` / `emptyDescription` the
 * disconnected card is the empty state, with a filled Connect button
 * (`connectLabel`) under the text.
 */
export const Md3McpConnection = React.forwardRef<HTMLElement, Md3McpConnectionProps>(
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
          className={cn(
            // nucleux.in's panel: white card, outline-variant hairline, 16px corners, text in the page's sans.
            "font-sans",
            "flex flex-col overflow-hidden rounded-md-lg border border-md-outline-variant bg-md-surface-container-lowest text-md-on-surface",
            className,
          )}
          {...props}
        >
          <div className={cn("flex items-center gap-2.5 px-4 pt-4", empty ? "pb-3" : "pb-4")}>
            <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-md-surface-container-high text-[10.5px] font-bold tracking-[0.04em] text-md-on-surface-variant [&_svg]:size-5">
              {icon ?? <Server aria-hidden="true" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 id={titleId} className="truncate text-[14px] font-[650] leading-[1.55]">
                {name}
              </h3>
              {(address || meta) && (
                <p className="truncate text-sm tracking-[0.25px] text-md-on-surface-variant">
                  {address && <span className="font-mono text-xs">{address}</span>}
                  {address && meta && " · "}
                  {meta}
                </p>
              )}
            </div>
            <span
              role="status"
              aria-live="polite"
              className={cn(
                "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-md-surface-container-highest px-2.5 text-[11.5px] font-semibold",
                usable && "text-md-primary",
                status === "error" && "text-md-error",
                (status === "disconnected" || status === "connecting") && "text-md-on-surface",
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
            <ol
              aria-label="Connection steps"
              className="flex flex-col gap-2 border-t border-md-outline-variant px-4 py-3 text-sm tracking-[0.25px]"
            >
              {stageOrder.map((s, i) => {
                const failed = status === "error" && i === current;
                const done = i < current;
                const active = status === "connecting" && i === current;
                const word = failed ? "failed" : done ? "done" : active ? "in progress" : "waiting";
                return (
                  <li
                    key={s}
                    data-step-state={word}
                    style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
                    className={cn(
                      "flex items-center gap-3 animate-nx-fade-in motion-reduce:animate-none",
                      failed
                        ? "text-md-error"
                        : done || active
                          ? "text-md-on-surface"
                          : "text-md-on-surface-variant",
                    )}
                  >
                    <span className="inline-flex size-5 items-center justify-center [&_svg]:size-5" aria-hidden="true">
                      {failed ? (
                        <X />
                      ) : done ? (
                        <Check className="text-md-primary" />
                      ) : active ? (
                        <Md3CircularProgress size={18} strokeWidth={2.5} className="motion-reduce:animate-none" />
                      ) : (
                        <Circle className="!size-3" />
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
              {emptyTitle != null && <p className="text-[13px] font-semibold leading-[1.55]">{emptyTitle}</p>}
              {emptyDescription != null && (
                <p className="text-[12.5px] leading-[1.55] text-md-on-surface-variant">{emptyDescription}</p>
              )}
              {onConnect && (
                <Md3Button onClick={onConnect} className="mt-2 h-8 px-4 tracking-[0.1px]">
                  {connectLabel}
                </Md3Button>
              )}
            </div>
          )}

          {status === "error" && error && (
            <p className="mx-4 mb-3 rounded-md-sm bg-md-surface-container-high px-3 py-2 text-sm tracking-[0.25px] text-md-error">
              {error}
            </p>
          )}

          {usable && (account || scopes?.length) && (
            <div className="flex flex-col gap-2 border-t border-md-outline-variant px-4 py-3">
              {account && (
                <p className="text-sm tracking-[0.25px] text-md-on-surface-variant">Signed in: {account}</p>
              )}
              {scopes && scopes.length > 0 && (
                <ul aria-label="Granted scopes" className="flex flex-wrap gap-2">
                  {scopes.map((scope, i) => (
                    <li
                      key={i}
                      className="inline-flex h-6 items-center rounded-md-sm border border-md-outline-variant px-2 text-xs font-medium tracking-[0.5px] text-md-on-surface"
                    >
                      {scope}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {children && <div className="flex flex-col gap-3 border-t border-md-outline-variant p-4">{children}</div>}

          {footer && (
            <div className="flex justify-end gap-2 border-t border-md-outline-variant px-4 py-3">
              {status === "disconnected" && onConnect && <Md3Button onClick={onConnect}>{connectLabel}</Md3Button>}
              {status === "connecting" && onDisconnect && (
                <Md3Button variant="text" onClick={onDisconnect}>
                  Cancel
                </Md3Button>
              )}
              {status === "error" && stage === "authenticate" && onAuthenticate ? (
                <Md3Button onClick={onAuthenticate}>Sign in again</Md3Button>
              ) : (
                status === "error" && onRetry && <Md3Button onClick={onRetry}>Try again</Md3Button>
              )}
              {(status === "connected" || status === "error") && onDisconnect && (
                <Md3Button variant="text" onClick={onDisconnect}>
                  {status === "error" ? "Remove" : "Disconnect"}
                </Md3Button>
              )}
            </div>
          )}
        </section>
      </McpContext.Provider>
    );
  },
);
Md3McpConnection.displayName = "Md3McpConnection";

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !React.isValidElement(v) && !Array.isArray(v);

/**
 * Material 3 twin of McpConnectionTool: one tool as an M3 list row — human
 * name, the server's id in code, its description and its availability as a
 * word (Allowed, Approval required, Off). The row is an expansion panel that
 * reveals the input schema behind it, with an on-surface state layer and a
 * rotating chevron. An optional Md3Switch turns the tool on or off. A failed
 * call shows on this row only; the connection is never greyed out for it.
 */
export const Md3McpConnectionTool = React.forwardRef<HTMLLIElement, Md3McpConnectionToolProps>(
  ({ tool, onEnabledChange, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const baseId = React.useId();
    const triggerId = `${baseId}-trigger`;
    const contentId = `${baseId}-content`;
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
        className={cn("font-md", "flex items-start gap-2 py-1 pl-1 pr-3", !enabled && "opacity-[0.72]", className)}
        {...props}
      >
        <div className="min-w-0 flex-1" data-state={open ? "open" : "closed"}>
          <button
            type="button"
            id={triggerId}
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "relative flex w-full items-start gap-2 overflow-hidden rounded-md-sm px-3 py-2 text-left outline-none",
              "focus-visible:ring-2 focus-visible:ring-md-primary",
              stateLayer,
            )}
          >
            <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium tracking-[0.1px] text-md-on-surface">{title}</span>
                <code className="font-mono text-xs text-md-primary">{tool.id}</code>
              </span>
              {tool.description && (
                <span className="text-xs tracking-[0.4px] text-md-on-surface-variant">{tool.description}</span>
              )}
              <span
                className={cn(
                  "text-xs font-medium tracking-[0.5px]",
                  availability === "allowed" && "text-md-primary",
                  availability === "ask" && "text-md-on-surface",
                  availability === "off" && "text-md-on-surface-variant",
                )}
              >
                {availabilityWord[availability]}
              </span>
              {tool.error && (
                <span className="text-xs tracking-[0.4px] text-md-error">Last call failed: {tool.error}</span>
              )}
            </span>
            <ChevronDown
              aria-hidden
              className={cn(
                "relative mt-0.5 size-5 shrink-0 text-md-on-surface-variant transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </button>
          {open && (
            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className="animate-nx-fade-in px-3 pb-2 pt-1 text-sm text-md-on-surface-variant motion-reduce:animate-none"
            >
              {tool.schema == null ? (
                <p className="text-xs">No input schema declared.</p>
              ) : isPlainObject(tool.schema) ? (
                <pre className="max-h-48 overflow-auto rounded-md-sm bg-md-surface-container-high p-3 font-mono text-xs text-md-on-surface">
                  {JSON.stringify(tool.schema, null, 2)}
                </pre>
              ) : (
                (tool.schema as React.ReactNode)
              )}
            </div>
          )}
        </div>
        {onEnabledChange && (
          <Md3Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label={`${titleText} — ${riskLabel[risk]}`}
            className="mt-2"
          />
        )}
      </li>
    );
  },
);
Md3McpConnectionTool.displayName = "Md3McpConnectionTool";

/**
 * Material 3 twin of McpConnectionTools: the capability list grouped least
 * dangerous first — Reads only, Changes things, Destructive — on a
 * surface-container card, so reading down the list is reading up a risk
 * ladder. Risk is carried by grouping and words first; colour is spent only
 * on the Destructive band. Ends with the sentence that keeps the list honest:
 * names and descriptions come from the server, not from this product.
 */
export const Md3McpConnectionTools = React.forwardRef<HTMLDivElement, Md3McpConnectionToolsProps>(
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
        className={cn("font-md", "overflow-hidden rounded-md-md bg-md-surface-container-low text-md-on-surface", className)}
        {...props}
      >
        <p id={headingId} className="px-4 pb-1 pt-3 text-sm font-medium tracking-[0.1px] text-md-on-surface">
          {title ?? (name ? <>{name} · {count}</> : `Tools · ${count}`)}
        </p>
        {variant === "compact" && (
          <ul aria-labelledby={headingId} className="flex flex-col pb-2">
            {tools.map((tool) => {
              const enabled = tool.enabled ?? true;
              const titleText = typeof tool.title === "string" ? tool.title : tool.id;
              return (
                <li key={tool.id} data-risk={tool.risk ?? "read"} className={cn("flex items-center gap-3 px-4 py-2", !enabled && "opacity-[0.72]")}>
                  <code className="shrink-0 rounded-md-xs bg-md-secondary-container px-1.5 py-0.5 font-mono text-xs text-md-on-secondary-container">
                    {tool.id}
                  </code>
                  {tool.description && (
                    <span className="min-w-0 flex-1 text-sm tracking-[0.25px] text-md-on-surface-variant">{tool.description}</span>
                  )}
                  {onToolEnabledChange && (
                    <Md3Switch
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
          <div key={risk} data-risk={risk} className="border-b border-md-outline-variant py-1 last:border-b-0">
            <p
              id={`${headingId}-${risk}`}
              className={cn(
                "px-4 pt-2 text-xs font-medium tracking-[0.5px]",
                risk === "destructive" ? "text-md-error" : "text-md-on-surface-variant",
              )}
            >
              {riskLabel[risk]} <span className="font-normal">· {riskNote[risk]}</span>
            </p>
            <ul aria-labelledby={`${headingId}-${risk}`} className="flex flex-col">
              {items.map((tool) => (
                <Md3McpConnectionTool
                  key={tool.id}
                  tool={tool}
                  onEnabledChange={onToolEnabledChange ? (on) => onToolEnabledChange(tool.id, on) : undefined}
                />
              ))}
            </ul>
          </div>
        ))}
        {trustNote !== null && (
          <p className="border-t border-md-outline-variant bg-md-surface-container px-4 py-2 text-xs tracking-[0.4px] text-md-on-surface-variant">
            {trustNote ??
              "Tool names and descriptions come from the server, not from this product. Enable only what you recognise."}
          </p>
        )}
      </div>
    );
  },
);
Md3McpConnectionTools.displayName = "Md3McpConnectionTools";

/**
 * Material 3 twin of McpConnectionPermission: the agent's trust budget as an
 * Md3RadioGroup — "Always", "Just this once" or "Don't allow" — each option a
 * full-width row with a state layer, the chosen one on secondary-container.
 * For a destructive subject the card takes an error outline and "Always" is
 * not offered.
 */
export const Md3McpConnectionPermission = React.forwardRef<HTMLDivElement, Md3McpConnectionPermissionProps>(
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
          "font-md",
          "flex flex-col gap-2 rounded-md-md border bg-md-surface p-3 text-md-on-surface",
          risk === "destructive" ? "border-md-error" : "border-md-outline-variant",
          className,
        )}
        {...props}
      >
        <p id={headingId} className="px-1 text-sm font-medium tracking-[0.1px]">
          {title ?? (
            <>
              Allow {agentName} to use {subject}?
            </>
          )}
        </p>
        <Md3RadioGroup
          aria-labelledby={headingId}
          value={value ?? undefined}
          defaultValue={defaultValue}
          onValueChange={(v) => onValueChange?.(v as McpConnectionPermissionValue)}
          className="gap-1"
        >
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                "relative flex cursor-pointer items-center gap-1 overflow-hidden rounded-md-sm pr-3 text-sm tracking-[0.25px] transition-colors motion-reduce:transition-none",
                "before:pointer-events-none before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08]",
                "has-[[aria-checked=true]]:bg-md-secondary-container has-[[aria-checked=true]]:font-medium has-[[aria-checked=true]]:text-md-on-secondary-container",
                opt === "never" ? "text-md-on-surface-variant" : "text-md-on-surface",
              )}
            >
              <Md3Radio value={opt} aria-labelledby={`${headingId}-${opt}`} />
              <span id={`${headingId}-${opt}`} className="relative">
                {text[opt]}
              </span>
            </label>
          ))}
        </Md3RadioGroup>
      </div>
    );
  },
);
Md3McpConnectionPermission.displayName = "Md3McpConnectionPermission";

/** The call as code, one argument per line: the server in primary, keys in tertiary. */
function CallCode({ tool, args }: { tool: string; args?: Record<string, unknown> }) {
  const call = mcpCallParts(tool, args);
  return (
    <>
      {call.server && (
        <>
          <span className="text-md-primary">{call.server}</span>.
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
              <span className="text-md-tertiary">{k}</span>: <span className="text-md-on-surface-variant">{v}</span>
              {i < call.args.length - 1 ? "," : ""}
            </React.Fragment>
          ))}
          {"\n})"}
        </>
      )}
    </>
  );
}

/**
 * Material 3 twin of McpConnectionActionPreview: the approval gate. Before the
 * agent runs a tool the call is shown — name, arguments, expected effect —
 * with Approve, Edit and Never allow, then it reports running, the result, or
 * the tool's own error (which is not a server outage). A routine write asks on
 * a tonal secondary-container ground; the error container is spent only on a
 * destructive call. The gate enters on M3's emphasized-decelerate easing so it
 * isn't scrolled past, and doesn't animate under reduced motion.
 */
export const Md3McpConnectionActionPreview = React.forwardRef<HTMLElement, Md3McpConnectionActionPreviewProps>(
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
          "font-md",
          "flex flex-col gap-3 rounded-md-lg p-4",
          gateEnter,
          destructive
            ? "bg-md-error-container text-md-on-error-container"
            : "bg-md-secondary-container text-md-on-secondary-container",
          className,
        )}
        {...props}
      >
        <h4 id={titleId} className="text-sm font-medium tracking-[0.1px]">
          {title ?? (destructive ? "Destructive action" : "Proposed action")}
        </h4>
        <code className="block whitespace-pre-wrap break-words rounded-md-sm bg-md-surface p-3 font-mono text-xs text-md-on-surface">
          <CallCode tool={tool} args={args} />
        </code>
        {effect && <p className="text-sm tracking-[0.25px]">{effect}</p>}
        <div role="status" aria-live="polite" className="text-sm tracking-[0.25px] empty:hidden">
          {status === "running" && (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="inline-flex">
                <Md3CircularProgress size={16} strokeWidth={2} className="motion-reduce:animate-none" />
              </span>
              Running {tool}…
            </span>
          )}
          {status === "done" && (
            <span className="inline-flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{result ?? "Done."}</span>
            </span>
          )}
          {status === "error" && (
            <span className="font-medium">
              This call failed{error ? <>: {error}</> : "."} The server is still connected.
            </span>
          )}
        </div>
        {(status === "pending" || status === "error") && (onApprove || onEdit || onDeny) && (
          <div className="flex flex-wrap gap-2">
            {onApprove && (
              <Md3Button onClick={onApprove} className={cn(destructive && "bg-md-error text-md-on-error")}>
                {status === "error" ? "Try again" : approveLabel}
              </Md3Button>
            )}
            {onEdit && (
              <Md3Button variant="outlined" onClick={onEdit} className="bg-md-surface">
                {editLabel}
              </Md3Button>
            )}
            {onDeny && (
              <Md3Button
                variant="text"
                onClick={onDeny}
                className={destructive ? "text-md-on-error-container" : "text-md-on-secondary-container"}
              >
                {denyLabel}
              </Md3Button>
            )}
          </div>
        )}
      </section>
    );
  },
);
Md3McpConnectionActionPreview.displayName = "Md3McpConnectionActionPreview";
