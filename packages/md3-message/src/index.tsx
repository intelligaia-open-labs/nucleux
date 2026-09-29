import * as React from "react";
import { Bot, Cog, User, Wrench } from "lucide-react";
import { cn } from "@nucleux/utils";
import type { MessageRole } from "@nucleux/utils";
import { StreamingText } from "@nucleux/streaming-text";

export interface Md3MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who authored the message. */
  role: MessageRole;
  /** Message text. Ignored if `children` is provided. */
  content?: string;
  /** True while the assistant is still streaming this message. */
  streaming?: boolean;
  /** Hide the avatar (e.g. for consecutive same-role messages). */
  hideAvatar?: boolean;
  /** Custom node rendered in place of the default avatar. */
  avatar?: React.ReactNode;
}

const roleIcon: Record<MessageRole, React.ComponentType<{ className?: string }>> = {
  user: User,
  assistant: Bot,
  system: Cog,
  tool: Wrench,
};

/**
 * A Material Design 3 chat message row: a tonal avatar and a role-aware bubble
 * with MD3 shape and surface roles. Same API as {@link Message}.
 */
export const Md3Message = React.forwardRef<HTMLDivElement, Md3MessageProps>(
  ({ role, content, streaming = false, hideAvatar = false, avatar, className, children, ...props }, ref) => {
    const isUser = role === "user";
    const Icon = roleIcon[role] ?? Bot;

    return (
      <div
        ref={ref}
        data-role={role}
        className={cn(
          "flex w-full animate-nx-fade-in gap-3",
          isUser ? "flex-row-reverse" : "flex-row",
          className,
        )}
        {...props}
      >
        {!hideAvatar &&
          (avatar ?? (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-md-primary-container text-md-on-primary-container [&_svg]:size-5">
              <Icon />
            </span>
          ))}
        <div className={cn("flex min-w-0 max-w-[80%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
          <div
            className={cn(
              "rounded-md-xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "rounded-br-md-xs bg-md-primary text-md-on-primary"
                : "rounded-bl-md-xs bg-md-surface-container-high text-md-on-surface",
              (role === "system" || role === "tool") &&
                "rounded-md-xl border border-md-outline-variant bg-transparent text-md-on-surface-variant",
            )}
          >
            {children ?? <StreamingText text={content ?? ""} streaming={streaming} />}
          </div>
        </div>
      </div>
    );
  },
);
Md3Message.displayName = "Md3Message";
