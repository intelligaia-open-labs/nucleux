import * as React from "react";
import { Bot, Cog, User, Wrench } from "lucide-react";
import { cn } from "../lib/utils";
import type { MessageRole } from "../lib/types";

const roleIcon: Record<MessageRole, React.ComponentType<{ className?: string }>> = {
  user: User,
  assistant: Bot,
  system: Cog,
  tool: Wrench,
};

/** Derive up-to-two-letter initials from a display name. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Role used to pick a default icon and styling when no image/initials given. */
  role?: MessageRole;
  /** Optional image URL; takes precedence over initials and the role icon. */
  src?: string;
  /** Explicit initials. If omitted, derived from `name`. */
  initials?: string;
  /** Display name — used to derive initials and the default aria-label. */
  name?: string;
  /** Corner style. `rounded` suits entity/person avatars, `circle` suits chat. */
  shape?: "circle" | "rounded";
  /** Accessible label / alt text. */
  alt?: string;
}

/** Avatar for a conversation participant or entity — image, initials, or role icon. */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { role = "assistant", src, initials, name, shape = "circle", alt, className, children, ...props },
    ref,
  ) => {
    const Icon = roleIcon[role] ?? Bot;
    const resolvedInitials = initials ?? (name ? initialsFromName(name) : undefined);
    const label = alt ?? name ?? `${role} avatar`;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center overflow-hidden text-xs font-semibold",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : resolvedInitials
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children ??
          (src ? (
            <img src={src} alt={label} className="size-full object-cover" />
          ) : resolvedInitials ? (
            <span>{resolvedInitials}</span>
          ) : (
            <Icon className="size-4" />
          ))}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
