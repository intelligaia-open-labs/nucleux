import * as React from "react";
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
  groupLabel,
  onDone,
}: ConsentControlsProps) {
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        {policyHref && (
          <span className="mr-auto">
            <PolicyLink href={policyHref}>{policyLabel}</PolicyLink>
          </span>
        )}
        <Button variant="secondary" onClick={() => done(onDeny)}>
          {denyLabel}
        </Button>
        {secondaryLabel && (
          <Button variant="secondary" onClick={() => done(() => onSecondary?.(selectedIds))}>
            {secondaryLabel}
          </Button>
        )}
        <Button onClick={() => done(() => onAllow?.(selectedIds))}>
          {allowLabel ?? (permissions.length > 0 ? "Allow selected" : "Allow")}
        </Button>
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
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      data-variant="inline-card"
      className={cn(
        "flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-lg",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
