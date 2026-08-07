import * as React from "react";
import { cn } from "@nucleux/utils";
import {
  RotateCw,
  Maximize2,
  Minimize2,
  Briefcase,
  List,
  MessageCircleQuestion,
} from "lucide-react";

export interface RewriteAction {
  /** Stable id passed to `onAction`. */
  id: string;
  /** Item label. */
  label: React.ReactNode;
  /** Leading icon. */
  icon?: React.ReactNode;
}

/** The default set of rewrite/transform actions offered on an AI response. */
export const defaultRewriteActions: RewriteAction[] = [
  { id: "retry", label: "Try again", icon: <RotateCw aria-hidden="true" /> },
  { id: "expand", label: "Make longer", icon: <Maximize2 aria-hidden="true" /> },
  { id: "concise", label: "Make concise", icon: <Minimize2 aria-hidden="true" /> },
  { id: "professional", label: "Make it professional", icon: <Briefcase aria-hidden="true" /> },
  { id: "bullets", label: "Convert to bullet points", icon: <List aria-hidden="true" /> },
  { id: "follow-up", label: "Ask a follow-up", icon: <MessageCircleQuestion aria-hidden="true" /> },
];

export interface RewriteMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Actions to list. Defaults to {@link defaultRewriteActions}. */
  actions?: RewriteAction[];
  /** Called with the action id when an item is chosen. */
  onAction?: (id: string) => void;
  /** Optional heading above the list. */
  label?: React.ReactNode;
}

/**
 * A menu of model-driven rewrite and transform actions on an AI response —
 * retry, expand, make concise, restyle, convert to bullets.
 * Source: Figma "Refinement / Contextual transform".
 */
export const RewriteMenu = React.forwardRef<HTMLDivElement, RewriteMenuProps>(
  ({ actions = defaultRewriteActions, onAction, label, className, ...props }, ref) => (
    <div
      ref={ref}
      role="menu"
      aria-label={typeof label === "string" ? label : "Rewrite"}
      className={cn(
        "flex w-56 flex-col gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-md",
        className,
      )}
      {...props}
    >
      {label && (
        <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          role="menuitem"
          onClick={() => onAction?.(action.id)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground"
        >
          {action.icon}
          <span className="flex-1">{action.label}</span>
        </button>
      ))}
    </div>
  ),
);
RewriteMenu.displayName = "RewriteMenu";
