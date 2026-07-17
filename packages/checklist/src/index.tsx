import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface ChecklistItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Whether the step is completed (shows a filled check + strikes the title). */
  done?: boolean;
  /** Step title. */
  title: React.ReactNode;
  /** Supporting description. */
  description?: React.ReactNode;
  /** Trailing action, e.g. a <Button>Connect</Button>. */
  action?: React.ReactNode;
}

/** A single step in a {@link Checklist}. */
export const ChecklistItem = React.forwardRef<HTMLLIElement, ChecklistItemProps>(
  ({ done = false, title, description, action, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("flex items-start gap-4 px-6 py-4", className)}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
          done
            ? "bg-success text-success-foreground"
            : "border-2 border-muted-foreground/30 bg-transparent",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-sm font-medium",
            done ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {title}
        </span>
        {description && (
          <span className="text-sm leading-5 text-muted-foreground">{description}</span>
        )}
      </div>

      {action && <div className="shrink-0 self-center">{action}</div>}
    </li>
  ),
);
ChecklistItem.displayName = "ChecklistItem";

export interface ChecklistProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Show hairline dividers between items. */
  divided?: boolean;
}

/** Vertical list of onboarding / progress steps. Compose with {@link ChecklistItem}. */
export const Checklist = React.forwardRef<HTMLUListElement, ChecklistProps>(
  ({ divided = false, className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(divided && "divide-y divide-border", className)}
      {...props}
    />
  ),
);
Checklist.displayName = "Checklist";
