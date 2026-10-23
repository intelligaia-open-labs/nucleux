import * as React from "react";
import { cn } from "@nucleux/utils";
import type { AgentNameProps, AgentNameVariant } from "@nucleux/name";
import { Md3AgentAvatar } from "@nucleux/md3-agent-avatar";

export type Md3AgentNameProps = AgentNameProps;
export type Md3AgentNameVariant = AgentNameVariant;

// Copied from @nucleux/name (internal there): three dots that rise in turn
// while the agent works — here in md-primary — still under reduced motion.
function WorkingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-[3px]">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="size-[5px] rounded-full bg-md-primary animate-nx-typing motion-reduce:animate-none"
        />
      ))}
    </span>
  );
}

/**
 * The agent's name in Material 3 — the twin of `AgentName`, with the same
 * API. Typography does the work: `wordmark` sets the name in headline type
 * with its role in body-small on-surface-variant; `name-status` is a
 * surface-container pill that reads "Aria is drafting" in a polite live
 * region, followed by the working dots; `name-avatar-lockup` puts the
 * Md3AgentAvatar beside the name (title-small) and its role, on an outlined
 * container; `introduction` is the first appearance on a surface-container-low
 * card — mark, name, an outlined "AI agent" label, the role, then one
 * sentence. The descriptor keeps the name honest by saying what it is.
 */
export const Md3AgentName = React.forwardRef<HTMLDivElement, Md3AgentNameProps>(
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
      <span className="text-xs text-md-on-surface-variant">formerly {formerName}</span>
    ) : null;

    if (variant === "wordmark") {
      return (
        <div ref={ref} data-variant={variant} className={cn("font-md", "flex flex-col", className)} {...props}>
          <span className="text-[28px] font-normal leading-9 text-md-on-surface">{name}</span>
          <span className="mt-0.5 text-xs tracking-[0.4px] text-md-on-surface-variant">
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
          className={cn(
            "font-md",
            "flex flex-col gap-4 rounded-md-md bg-md-surface p-5 leading-normal text-md-on-surface",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            <Md3AgentAvatar name={name} src={avatarSrc} glyph={avatarGlyph} size="lg" shape="circle" decorative />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="m-0 flex gap-2 text-base font-medium leading-6 tracking-[0.15px]">
                {name}
                <span className="block">
                  <span className="inline-flex h-6 items-center rounded-full px-2.5 py-1 text-xs font-medium leading-4 tracking-[0.15px] text-md-tertiary shadow-[inset_0_0_0_1px_hsl(var(--nx-md-outline-variant))]">
                    {aiLabel}
                  </span>
                </span>
                {former}
              </p>
              <p className="m-0 text-xs leading-4 tracking-[0.4px] text-md-on-surface-variant">{descriptor}</p>
            </div>
          </div>
          {children != null && <p className="m-0 text-sm leading-5 tracking-[0.25px]">{children}</p>}
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
            "font-md",
            "inline-flex w-max items-center gap-2.5 rounded-full bg-md-surface-container-high py-2 pl-2 pr-4 text-sm font-medium tracking-[0.1px] text-md-on-surface",
            className,
          )}
          {...props}
        >
          <Md3AgentAvatar name={name} src={avatarSrc} glyph={avatarGlyph} size="sm" decorative />
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
          "font-md",
          "inline-flex w-max items-center gap-3 rounded-full border border-md-outline-variant bg-md-surface py-1.5 pl-1.5 pr-4",
          className,
        )}
        {...props}
      >
        <Md3AgentAvatar name={name} src={avatarSrc} glyph={avatarGlyph} size="md" decorative />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium tracking-[0.1px] text-md-on-surface">{name}</span>
          <span className="text-xs tracking-[0.4px] text-md-on-surface-variant">
            {descriptor}
            {former && <> · {former}</>}
          </span>
        </span>
      </div>
    );
  },
);
Md3AgentName.displayName = "Md3AgentName";
