import * as React from "react";
import { cn } from "@nucleux/utils";
import { AgentAvatar } from "@nucleux/agent-avatar";

export type AgentNameVariant = "wordmark" | "name-status" | "name-avatar-lockup" | "introduction";

export interface AgentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The agent's proper name — short (≤ 12 characters), pronounceable, capitalised the same everywhere. Not a real person's name. */
  name: string;
  /**
   * `wordmark` (the name in product type, for headers and brand contexts),
   * `name-status` (the name with what the agent is doing now) or
   * `name-avatar-lockup` (mark + name, for attribution rows and signatures).
   * `introduction` is the first appearance: the mark, the name with an
   * "AI agent" label, the role (`descriptor`), then one sentence (`children`)
   * saying who runs it, what it does and that it is not a person.
   * Default `name-avatar-lockup`.
   */
  variant?: AgentNameVariant;
  /** What the agent is, in product words: "Intelligaia agent", "Meeting Intelligence Agent". Defaults to "AI agent". On compact surfaces it stays in the accessible name. */
  descriptor?: React.ReactNode;
  /**
   * `name-status`: what the agent is doing, as a verb phrase — "drafting",
   * "thinking". Rendered as "Aria is drafting" in a polite live region.
   * Omit for an idle agent ("Aria").
   */
  status?: string;
  /** `name-status`: show the working dots after the words. Defaults to `true` when `status` is set. */
  working?: boolean;
  /** Previous name after a rename, shown as "formerly Aria" for a while. */
  formerName?: string;
  /** Image for the agent mark (`name-status`, `name-avatar-lockup`). */
  avatarSrc?: string;
  /** Glyph for the agent mark when there is no image. Defaults to the reserved AI sparkle. */
  avatarGlyph?: React.ReactNode;
  /** `introduction`: the label beside the name that says what kind of thing this is. Default "AI agent". */
  aiLabel?: string;
}

function WorkingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="size-[5px] rounded-full bg-muted-foreground animate-pulse [animation-duration:1.4s] motion-reduce:animate-none"
        />
      ))}
    </span>
  );
}

/**
 * The agent's name, presented consistently so it can be referred to,
 * talked to and remembered ("Ask Aria to summarise this"). Three variants:
 * `wordmark`, `name-status` (a raised pill reading "Aria is drafting" with
 * working dots, announced politely) and
 * `name-avatar-lockup` (the AgentAvatar mark with name and descriptor), plus
 * `introduction`, the first-appearance card that says it is an AI agent.
 * The descriptor keeps the name honest by saying what the agent is.
 */
export const AgentName = React.forwardRef<HTMLDivElement, AgentNameProps>(
  (
    {
      name,
      variant = "name-avatar-lockup",
      descriptor = "AI agent",
      status,
      working,
      formerName,
      avatarSrc,
      avatarGlyph,
      aiLabel = "AI agent",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const former = formerName ? (
      <span className="text-xs text-muted-foreground">formerly {formerName}</span>
    ) : null;

    if (variant === "wordmark") {
      return (
        <div ref={ref} data-variant={variant} className={cn("flex flex-col", className)} {...props}>
          <span className="font-serif text-3xl font-medium italic tracking-tight text-foreground">{name}</span>
          <span className="mt-1 text-xs text-muted-foreground">
            {descriptor}
            {former && <> · {former}</>}
          </span>
        </div>
      );
    }

    if (variant === "introduction") {
      return (
        <div
          ref={ref}
          data-variant={variant}
          className={cn("rounded-xl border border-border bg-background p-5 text-foreground shadow-sm", className)}
          {...props}
        >
          <div className="flex items-center gap-3">
            <AgentAvatar name={name} src={avatarSrc} glyph={avatarGlyph} size="lg" shape="rounded" decorative />
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="text-base font-semibold">{name}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {aiLabel}
                </span>
                {former}
              </span>
              <span className="text-sm text-muted-foreground">{descriptor}</span>
            </div>
          </div>
          {children != null && <p className="mb-0 mt-4 text-sm leading-6">{children}</p>}
        </div>
      );
    }

    if (variant === "name-status") {
      const isWorking = working ?? status != null;
      return (
        <div
          ref={ref}
          data-variant={variant}
          className={cn(
            "inline-flex w-max items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5 text-[13px] leading-[1.55] text-foreground shadow-sm",
            className,
          )}
          {...props}
        >
          <AgentAvatar
            name={name}
            src={avatarSrc}
            glyph={avatarGlyph}
            size="sm"
            decorative
            className="[&>*]:size-[22px] [&>*]:bg-foreground [&>*]:bg-none [&>*]:text-[11px] [&>*]:text-background"
          />
          <span role="status" aria-live="polite">
            {status ? `${name} is ${status}` : name}
            <span className="sr-only">, {descriptor}</span>
          </span>
          {isWorking && <WorkingDots />}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-variant={variant}
        className={cn(
          "inline-flex w-max items-center gap-2.5 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3.5",
          className,
        )}
        {...props}
      >
        <AgentAvatar name={name} src={avatarSrc} glyph={avatarGlyph} size="md" decorative />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">
            {descriptor}
            {former && <> · {former}</>}
          </span>
        </span>
      </div>
    );
  },
);
AgentName.displayName = "AgentName";
