import * as React from "react";
import { cn } from "@nucleux/utils";
import { Clock, EyeOff } from "lucide-react";

export type PrivacyNoticeVariant = "temporary" | "incognito";

export interface PrivacyNoticeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which data-handling mode this notice describes. */
  variant?: PrivacyNoticeVariant;
  /** Leading icon. Defaults per variant. */
  icon?: React.ReactNode;
}

const defaults: Record<PrivacyNoticeVariant, { icon: React.ReactNode; text: string }> = {
  temporary: {
    icon: <Clock aria-hidden="true" />,
    text: "This chat won't appear in your history or update memory.",
  },
  incognito: {
    icon: <EyeOff aria-hidden="true" />,
    text: "Incognito chats aren't saved or added to memory.",
  },
};

/**
 * A subtle notice that a conversation is ephemeral or private — communicates
 * the agent's data-handling/memory state to the user.
 * Source: Figma "Privacy and Control / temporary & incognito notices".
 */
export const PrivacyNotice = React.forwardRef<HTMLDivElement, PrivacyNoticeProps>(
  ({ variant = "temporary", icon, className, children, ...props }, ref) => {
    const preset = defaults[variant];
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground [&_svg]:size-3.5",
          className,
        )}
        {...props}
      >
        {icon ?? preset.icon}
        <span>{children ?? preset.text}</span>
      </div>
    );
  },
);
PrivacyNotice.displayName = "PrivacyNotice";
