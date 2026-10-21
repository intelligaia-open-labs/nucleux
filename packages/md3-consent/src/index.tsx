import * as React from "react";
import { cn } from "@nucleux/utils";
import type {
  ConsentDialogProps,
  ConsentPermission,
  ConsentProps,
  ConsentRequestProps,
  ConsentToggleProps,
} from "@nucleux/consent";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Checkbox } from "@nucleux/md3-checkbox";
import { Md3Dialog } from "@nucleux/md3-dialog";
import { Md3Switch } from "@nucleux/md3-switch";

export type { ConsentPermission } from "@nucleux/consent";
export type Md3ConsentProps = ConsentProps;
export type Md3ConsentRequestProps = ConsentRequestProps;
export type Md3ConsentDialogProps = ConsentDialogProps;
export type Md3ConsentToggleProps = ConsentToggleProps;

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

/** One permission as an M3 list row: a leading Md3Checkbox named by the label, described by the supporting line. */
function PermissionRow({
  permission,
  checked,
  onCheckedChange,
}: {
  permission: ConsentPermission;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = React.useId();
  return (
    <li className="border-b border-md-outline-variant last:border-b-0">
      <label className="flex cursor-pointer items-start gap-2 py-2">
        <Md3Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-labelledby={`${id}-label`}
          aria-describedby={permission.description ? `${id}-desc` : undefined}
          className="-my-1.5 -ml-2.5 shrink-0"
        />
        <span className="min-w-0 flex-1 pt-0.5">
          <span id={`${id}-label`} className="block text-sm font-medium tracking-[0.1px] text-md-on-surface">
            {permission.label}
          </span>
          {permission.description && (
            <span id={`${id}-desc`} className="block text-xs tracking-[0.4px] text-md-on-surface-variant">
              {permission.description}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}

/**
 * Permission list + equal-weight actions + policy link, shared by Md3Consent
 * and Md3ConsentDialog. The state logic is copied from `@nucleux/consent`
 * (internal there): nothing is preselected unless asked, and every answer
 * reports the granted ids.
 */
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
        <div role="group" aria-label={groupLabel}>
          <ul className="m-0 flex list-none flex-col p-0">
          {permissions.map((p) => (
            <PermissionRow
              key={p.id}
              permission={p}
              checked={!!granted[p.id]}
              onCheckedChange={(v) => setGranted((prev) => ({ ...prev, [p.id]: v }))}
            />
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {policyHref && (
          <span className="mr-auto">
            <a
              href={policyHref}
              className="rounded-md-xs text-sm font-medium text-md-primary underline underline-offset-2 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-md-primary"
            >
              {policyLabel}
            </a>
          </span>
        )}
        <Md3Button variant="outlined" onClick={() => done(onDeny)}>
          {denyLabel}
        </Md3Button>
        {secondaryLabel && (
          <Md3Button variant="outlined" onClick={() => done(() => onSecondary?.(selectedIds))}>
            {secondaryLabel}
          </Md3Button>
        )}
        <Md3Button variant="filled" onClick={() => done(() => onAllow?.(selectedIds))}>
          {allowLabel ?? (permissions.length > 0 ? "Allow selected" : "Allow")}
        </Md3Button>
      </div>
    </>
  );
}

/**
 * The `inline-card` consent in Material 3 — the twin of `Consent`, with the
 * same API. A request raised by the work itself on an extra-large-corner
 * surface container: a headline, a one-line summary, each permission as a
 * list row with its own Md3Checkbox (nothing preselected), Not now and
 * Allow as M3 buttons of equal size, and a link to the full policy. It rises
 * once on entry and then holds still — no colour that makes one answer look
 * safer. For the blocking first-run version use `Md3ConsentDialog`; for the
 * standing control in settings use `Md3ConsentToggle`.
 */
export const Md3Consent = React.forwardRef<HTMLDivElement, Md3ConsentProps>(
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
        "flex w-full max-w-md flex-col gap-4 rounded-md-xl border border-md-outline-variant bg-md-surface-container-low p-6 text-md-on-surface shadow-md-1 animate-nx-fade-in motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-[22px] font-normal leading-7 text-md-on-surface">{title}</h2>
        {description && <p className="text-sm tracking-[0.25px] text-md-on-surface-variant">{description}</p>}
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
Md3Consent.displayName = "Md3Consent";

/**
 * The `blocking-modal` consent in Material 3 — the twin of `ConsentDialog`,
 * built on Md3Dialog (scrim, extra-large corners, headline-small). The
 * person must answer before continuing: Escape and the scrim do not close
 * it; Allow and Not now both do, after calling `onAllow` / `onDeny`. Focus
 * moves into the dialog when it opens.
 */
export function Md3ConsentDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  permissions,
  ...rest
}: Md3ConsentDialogProps) {
  return (
    <Md3Dialog open={open} onOpenChange={onOpenChange} dismissible={false} headline={title} className={className}>
      <div className="flex flex-col gap-4">
        {description && <p className="tracking-[0.25px]">{description}</p>}
        <ConsentControls
          {...rest}
          permissions={permissions}
          groupLabel={typeof title === "string" ? title : "Permissions"}
          onDone={() => onOpenChange(false)}
        />
      </div>
    </Md3Dialog>
  );
}
Md3ConsentDialog.displayName = "Md3ConsentDialog";

/**
 * The `settings-toggle` consent in Material 3 — the twin of `ConsentToggle`.
 * A one-line M3 list row with a trailing Md3Switch, named by its title and
 * described by its supporting line: one click to grant or take it back.
 */
export const Md3ConsentToggle = React.forwardRef<HTMLDivElement, Md3ConsentToggleProps>(
  ({ title, description, checked, defaultChecked, onCheckedChange, disabled, className, ...props }, ref) => {
    const id = React.useId();
    return (
      <div ref={ref} data-variant="settings-toggle" className={cn("flex items-center gap-4 py-3", className)} {...props}>
        <div className="min-w-0 flex-1">
          <div id={`${id}-title`} className="text-base tracking-[0.5px] text-md-on-surface">
            {title}
          </div>
          {description && (
            <div id={`${id}-desc`} className="mt-0.5 text-sm tracking-[0.25px] text-md-on-surface-variant">
              {description}
            </div>
          )}
        </div>
        <Md3Switch
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
Md3ConsentToggle.displayName = "Md3ConsentToggle";
