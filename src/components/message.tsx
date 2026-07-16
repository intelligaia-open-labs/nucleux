import * as React from "react";
import { cn } from "../lib/utils";
import type { MessageRole } from "../lib/types";
import { Avatar } from "./avatar";
import { StreamingText } from "./streaming-text";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
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

/**
 * A single chat message row with an avatar and a role-aware bubble. Pass
 * `content` for plain streamed text, or `children` for rich content
 * (markdown, code blocks, tool calls, etc.).
 */
export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ role, content, streaming = false, hideAvatar = false, avatar, className, children, ...props }, ref) => {
    const isUser = role === "user";
    return (
      <div
        ref={ref}
        data-role={role}
        className={cn(
          "flex w-full gap-3 animate-nx-fade-in",
          isUser ? "flex-row-reverse" : "flex-row",
          className,
        )}
        {...props}
      >
        {!hideAvatar && (avatar ?? <Avatar role={role} />)}
        <div
          className={cn(
            "flex min-w-0 max-w-[80%] flex-col gap-2",
            isUser ? "items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
              role === "system" && "border border-dashed border-border bg-transparent text-muted-foreground",
            )}
          >
            {children ?? <StreamingText text={content ?? ""} streaming={streaming} />}
          </div>
        </div>
      </div>
    );
  },
);
Message.displayName = "Message";
