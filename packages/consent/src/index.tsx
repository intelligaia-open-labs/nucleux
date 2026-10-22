import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@nucleux/dialog";
import { Switch } from "@nucleux/switch";
import { RichCheckboxGroup, RichCheckboxOption } from "./permission-options";

export interface ConsentPermission {
  /** Stable id returned in `onAllow`. */
  id: string;
  /** Permission label. */
  label: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Whether it starts granted. Leave unset — nothing should be preselected. */
  defaultChecked?: boolean;
}

/** One line of what the agent will be able to do (or what it can't), shown read-only. */
export interface ConsentScopeItem {
  /** Leading icon ("Read" → an eye, "Can't edit" → a block sign). Decorative. */
  icon?: React.ReactNode;
  /** What it covers ("Read files and folders your account can open"). */
  label: React.ReactNode;
  /** Supporting line. */
  description?: React.ReactNode;
}

/** The request itself, shared by `Consent` and `ConsentDialog`. */
export interface ConsentRequestProps {
  /** Heading of the consent card. */
  title: React.ReactNode;
  /** The one-line summary: what is asked, why, and what happens next. */
  description?: React.ReactNode;
  /** The permissions the user can grant, each separately. Omit for a single yes/no request. */
  permissions?: ConsentPermission[];
  /** Label for the deny button. */
  denyLabel?: string;
  /** Called when the user denies all permissions. */
  onDeny?: () => void;
  /** Optional middle action, e.g. "Always Allow". */
  secondaryLabel?: string;
  /** Called with the selected permission ids when the secondary action runs. */
  onSecondary?: (selectedIds: string[]) => void;
  /** Label for the allow button. Defaults to "Allow selected" with permissions, "Allow" without. */
  allowLabel?: string;
  /** Called with the ids of the granted permissions. */
  onAllow?: (selectedIds: string[]) => void;
  /** Link to the full policy. The spec requires one wherever consent is asked. */
  policyHref?: string;
  /** Text of the policy link. Default "Read our privacy policy". */
  policyLabel?: React.ReactNode;
  /** `inline-card`: the logo of the app or source being asked about (Google Drive, GitHub). */
  icon?: React.ReactNode;
  /** `inline-card`: a small label above the title ("Access request", "AI action"). */
  badge?: React.ReactNode;
  /** What the agent will be able to do if allowed, as a read-only list (the scope). */
  scope?: ConsentScopeItem[];
  /** Heading of the scope list ("What Aria will be able to do"). */
  scopeLabel?: React.ReactNode;
  /** What happens next if they agree ("If you continue: Google Drive asks you to confirm…"). */
  outcome?: React.ReactNode;
  /** More about the request (account, activity, how to turn it off), behind a "Review details" toggle. */
  details?: React.ReactNode;
  /** Label of the details toggle. Default "Review details". */
  detailsLabel?: string;
}

export interface ConsentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    ConsentRequestProps {}

type ConsentControlsProps = Pick<
  ConsentProps,
  | "permissions"
  | "denyLabel"
  | "onDeny"
  | "secondaryLabel"
  | "onSecondary"
  | "allowLabel"
  | "onAllow"
  | "policyHref"
  | "policyLabel"
  | "scope"
  | "scopeLabel"
  | "outcome"
  | "details"
  | "detailsLabel"
> & { groupLabel: string; onDone?: () => void };

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-fit text-sm font-medium text-foreground underline underline-offset-2 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </a>
  );
}

// Equal weight: both answers are the same size and type; only the fill differs.
const actionClass = "px-4 text-xs font-medium";

/** Permission list + equal-weight actions + policy link, shared by Consent and ConsentDialog. */
function ConsentControls({
  permissions = [],
  denyLabel = "Not now",
  onDeny,
  secondaryLabel,
  onSecondary,
  allowLabel,
  onAllow,
  policyHref,
  policyLabel = "Read our privacy policy",
  scope = [],
  scopeLabel,
  outcome,
  details,
  detailsLabel = "Review details",
  groupLabel,
  onDone,
}: ConsentControlsProps) {
  const detailsId = React.useId();
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [granted, setGranted] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(permissions.map((p) => [p.id, !!p.defaultChecked])),
  );
  const selectedIds = permissions.filter((p) => granted[p.id]).map((p) => p.id);
  const done = (fn?: () => void) => {
    fn?.();
    onDone?.();
  };

  return (
    <>
      {permissions.length > 0 && (
        <RichCheckboxGroup label={groupLabel}>
          {permissions.map((p) => (
            <RichCheckboxOption
              key={p.id}
              label={p.label}
              description={p.description}
              checked={!!granted[p.id]}
              onCheckedChange={(v) => setGranted((prev) => ({ ...prev, [p.id]: v }))}
            />
          ))}
        </RichCheckboxGroup>
      )}

      {scope.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {scopeLabel && <p className="text-xs font-semibold text-foreground">{scopeLabel}</p>}
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {scope.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                {item.icon && (
                  <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-muted-foreground [&_svg]:size-4">
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0">
                  {item.label}
                  {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {outcome && <p className="text-xs text-muted-foreground [&_b]:text-foreground [&_strong]:text-foreground">{outcome}</p>}

      {details && (
        <div className="flex flex-col gap-1.5">
          <Button
            variant="link"
            size="sm"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((o) => !o)}
            leftIcon={detailsOpen ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            className="h-auto self-start px-0 text-xs"
          >
            {detailsLabel}
          </Button>
          <div id={detailsId} hidden={!detailsOpen} className="text-xs text-muted-foreground">
            {details}
          </div>
        </div>
      )}

      {/* Allow first, then the equal-weight way out — as on nucleux.in. */}
      <div className="flex flex-wrap items-center gap-2">
        <Button className={actionClass} onClick={() => done(() => onAllow?.(selectedIds))}>
          {allowLabel ?? (permissions.length > 0 ? "Allow selected" : "Allow")}
        </Button>
        {secondaryLabel && (
          <Button variant="secondary" className={actionClass} onClick={() => done(() => onSecondary?.(selectedIds))}>
            {secondaryLabel}
          </Button>
        )}
        <Button variant="secondary" className={actionClass} onClick={() => done(onDeny)}>
          {denyLabel}
        </Button>
        {policyHref && (
          <span className="ml-auto">
            <PolicyLink href={policyHref}>{policyLabel}</PolicyLink>
          </span>
        )}
      </div>
    </>
  );
}

/**
 * The `inline-card` consent: a request embedded in the flow at the moment
 * the agent needs access — a title, a one-line summary, granular
 * permissions to grant separately, Not now / Allow of equal weight and a
 * link to the full policy. No dark patterns: nothing should be
 * preselected and neither answer costs the person their work. For the
 * blocking first-run version use `ConsentDialog`; for the standing control
 * in privacy settings use `ConsentToggle`.
 */
export const Consent = React.forwardRef<HTMLDivElement, ConsentProps>(
  (
    {
      title,
      description,
      permissions,
      denyLabel,
      onDeny,
      secondaryLabel,
      onSecondary,
      allowLabel,
      onAllow,
      policyHref,
      policyLabel,
      icon,
      badge,
      scope,
      scopeLabel,
      outcome,
      details,
      detailsLabel,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-variant="inline-card"
      className={cn(
        "flex w-full max-w-md flex-col gap-3.5 rounded-lg border border-border bg-background p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background [&_svg]:size-4"
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          {badge && (
            <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {badge}
            </span>
          )}
          <h2 className="text-[15px] font-semibold leading-snug text-foreground">{title}</h2>
          {description && <p className="text-xs leading-[17px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <ConsentControls
        permissions={permissions}
        denyLabel={denyLabel}
        onDeny={onDeny}
        secondaryLabel={secondaryLabel}
        onSecondary={onSecondary}
        allowLabel={allowLabel}
        onAllow={onAllow}
        policyHref={policyHref}
        policyLabel={policyLabel}
        scope={scope}
        scopeLabel={scopeLabel}
        outcome={outcome}
        details={details}
        detailsLabel={detailsLabel}
        groupLabel={typeof title === "string" ? title : "Permissions"}
      />
    </div>
  ),
);
Consent.displayName = "Consent";

export interface ConsentDialogProps extends ConsentRequestProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called with `false` after the person answers (the dialog cannot be dismissed without an answer). */
  onOpenChange: (open: boolean) => void;
  /** Class overrides for the dialog panel. */
  className?: string;
}

/**
 * The `blocking-modal` consent: a centred dialog the person must answer
 * before continuing — used the first time data leaves the device. Escape
 * and the backdrop do not close it; Allow and Not now both do, after
 * calling `onAllow` / `onDeny`. Focus moves into the dialog when it opens.
 */
export function ConsentDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  permissions,
  icon: _icon,
  badge: _badge,
  ...rest
}: ConsentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} dismissible={false} className={className}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <ConsentControls
        {...rest}
        permissions={permissions}
        groupLabel={typeof title === "string" ? title : "Permissions"}
        onDone={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
ConsentDialog.displayName = "ConsentDialog";

export interface ConsentToggleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onChange" | "defaultChecked"> {
  /** What the setting allows ("Help improve Aria with my data"). The switch's accessible name. */
  title: React.ReactNode;
  /** Supporting line ("Anonymised. Opt out anytime."). The switch's description. */
  description?: React.ReactNode;
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when uncontrolled. Default off. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disable the switch. */
  disabled?: boolean;
}

/**
 * The `settings-toggle` consent: the standing, least urgent control in
 * privacy settings, once consent is no longer novel. A Switch labelled by
 * its title and described by its supporting line — one click to grant or
 * take it back.
 */
export const ConsentToggle = React.forwardRef<HTMLDivElement, ConsentToggleProps>(
  ({ title, description, checked, defaultChecked, onCheckedChange, disabled, className, ...props }, ref) => {
    const id = React.useId();
    return (
      <div
        ref={ref}
        data-variant="settings-toggle"
        className={cn("flex items-center gap-4 py-2.5", className)}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <div id={`${id}-title`} className="text-sm font-semibold text-foreground">
            {title}
          </div>
          {description && (
            <div id={`${id}-desc`} className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        <Switch
          aria-labelledby={`${id}-title`}
          aria-describedby={description ? `${id}-desc` : undefined}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    );
  },
);
ConsentToggle.displayName = "ConsentToggle";
