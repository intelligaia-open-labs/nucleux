import * as React from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "../lib/utils";

export interface AgentComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** Controlled textarea value. */
  value: string;
  onValueChange: (value: string) => void;
  /** Called with the trimmed value on submit (Enter or send). */
  onSubmit: (value: string) => void;
  placeholder?: string;
  /** Toolbar content on the left (e.g. attach button). */
  leftActions?: React.ReactNode;
  /** Toolbar content on the right of the input, before the send button (e.g. model picker, mic). */
  rightActions?: React.ReactNode;
  /** Show the agent as busy — swaps send for a stop button. */
  loading?: boolean;
  onStop?: () => void;
  /** Max auto-grow height in px. */
  maxHeight?: number;
  /** Disable input + send. */
  disabled?: boolean;
}

/**
 * An agent task composer — a card with an auto-growing prompt field and a
 * toolbar (left actions, right actions, and a send/stop button). Enter submits,
 * Shift+Enter inserts a newline. Source: Figma "Agentic".
 */
export const AgentComposer = React.forwardRef<HTMLTextAreaElement, AgentComposerProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      placeholder = "Describe a task, workflow or goal…",
      leftActions,
      rightActions,
      loading = false,
      onStop,
      maxHeight = 200,
      disabled,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    const canSend = value.trim().length > 0 && !disabled;
    const submit = () => {
      if (canSend) onSubmit(value.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-input bg-background p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring",
          className,
        )}
        {...props}
      >
        <textarea
          ref={innerRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={typeof placeholder === "string" ? placeholder : "Message"}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-[inherit] w-full resize-none bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">{leftActions}</div>
          <div className="flex items-center gap-2">
            {rightActions}
            {loading ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                aria-label="Send"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
AgentComposer.displayName = "AgentComposer";
