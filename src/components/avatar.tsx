import * as React from "react";
import { Bot, User, Wrench, Cog } from "lucide-react";
import { cn } from "../lib/utils";
import type { MessageRole } from "../lib/types";

const roleIcon: Record<MessageRole, React.ComponentType<{ className?: string }>> = {
  user: User,
  assistant: Bot,
  system: Cog,
  tool: Wrench,
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Role used to pick a default icon and styling. */
  role?: MessageRole;
  /** Optional image URL; falls back to the role icon when absent. */
  src?: string;
  /** Accessible label / alt text. */
  alt?: string;
}

/** Small circular avatar for a conversation participant. */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ role = "assistant", src, alt, className, children, ...props }, ref) => {
    const Icon = roleIcon[role] ?? Bot;
    return (
      <div
        ref={ref}
        role="img"
        aria-label={alt ?? `${role} avatar`}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children ??
          (src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ""} className="size-full object-cover" />
          ) : (
            <Icon className="size-4" />
          ))}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
