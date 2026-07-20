import * as React from "react";
import { cn } from "@nucleux/utils";

export interface FollowUpAssumption {
  /** Leading label, e.g. "Assumed:". */
  label?: React.ReactNode;
  /** The assumed value, e.g. "Q3". */
  value: React.ReactNode;
  /** Trailing hint, e.g. "tap to change". */
  hint?: React.ReactNode;
}

export interface FollowUpProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The AI answer text. Ignored if `children` is provided. */
  answer?: React.ReactNode;
  /** The stated assumption; rendered as an editable chip. */
  assumption?: FollowUpAssumption;
  /** Called when the assumption chip is activated (to change the assumption). */
  onChangeAssumption?: () => void;
}

/**
 * An AI answer that surfaces the assumption it made, with a chip to change it —
 * for when a response would otherwise silently guess missing intent.
 * Source: Figma "AIUX / Follow Up".
 */
export const FollowUp = React.forwardRef<HTMLDivElement, FollowUpProps>(
  ({ answer, assumption, onChangeAssumption, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-4 rounded-lg border border-border bg-background p-6", className)}
      {...props}
    >
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-4">
        <div className="text-base leading-relaxed text-foreground">{children ?? answer}</div>
        {assumption && (
          <button
            type="button"
            onClick={onChangeAssumption}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-border bg-background px-4 py-2 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {assumption.label && <span className="text-muted-foreground">{assumption.label}</span>}
            <span className="font-semibold text-foreground">{assumption.value}</span>
            {assumption.hint && <span className="text-muted-foreground">{assumption.hint}</span>}
          </button>
        )}
      </div>
    </div>
  ),
);
FollowUp.displayName = "FollowUp";
