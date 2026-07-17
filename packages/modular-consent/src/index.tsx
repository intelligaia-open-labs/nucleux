import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import { RichCheckboxGroup, RichCheckboxOption } from "@nucleux/rich-checkbox-group";

export interface ConsentPermission {
  /** Stable id returned in `onAllow`. */
  id: string;
  /** Permission label. */
  label: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Whether it starts granted. */
  defaultChecked?: boolean;
}

export interface ModularConsentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The permissions the user can grant. */
  permissions: ConsentPermission[];
  denyLabel?: string;
  onDeny?: () => void;
  /** Optional middle action, e.g. "Always Allow". */
  secondaryLabel?: string;
  onSecondary?: (selectedIds: string[]) => void;
  allowLabel?: string;
  /** Called with the ids of the granted permissions. */
  onAllow?: (selectedIds: string[]) => void;
}

/**
 * An agent permission/consent panel — a titled card with a checklist of
 * granular permissions and Deny / (Always Allow) / Allow actions. Built from
 * {@link RichCheckboxOption} + {@link Button}. Place inline or inside a Dialog.
 */
export const ModularConsent = React.forwardRef<HTMLDivElement, ModularConsentProps>(
  (
    {
      title,
      description,
      permissions,
      denyLabel = "Not now",
      onDeny,
      secondaryLabel,
      onSecondary,
      allowLabel = "Allow selected",
      onAllow,
      className,
      ...props
    },
    ref,
  ) => {
    const [granted, setGranted] = React.useState<Record<string, boolean>>(() =>
      Object.fromEntries(permissions.map((p) => [p.id, !!p.defaultChecked])),
    );
    const selectedIds = permissions.filter((p) => granted[p.id]).map((p) => p.id);

    return (
      <div
        ref={ref}
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

        <RichCheckboxGroup label={typeof title === "string" ? title : "Permissions"}>
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

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onDeny}>
            {denyLabel}
          </Button>
          {secondaryLabel && (
            <Button variant="secondary" onClick={() => onSecondary?.(selectedIds)}>
              {secondaryLabel}
            </Button>
          )}
          <Button onClick={() => onAllow?.(selectedIds)}>{allowLabel}</Button>
        </div>
      </div>
    );
  },
);
ModularConsent.displayName = "ModularConsent";
