import * as React from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface Md3AgentComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  loading?: boolean;
  onStop?: () => void;
  maxHeight?: number;
  disabled?: boolean;
}

const sendBtn =
  "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-md-primary text-md-on-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] active:before:opacity-[0.12] disabled:opacity-[0.38] disabled:before:opacity-0";

/**
 * A Material Design 3 agent task composer — a tonal surface with an auto-growing
 * prompt field, a toolbar, and a filled send/stop button with a state layer.
 * Enter submits, Shift+Enter newlines. Same API as {@link AgentComposer}.
 */
export const Md3AgentComposer = React.forwardRef<HTMLTextAreaElement, Md3AgentComposerProps>(
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
          "flex flex-col gap-3 rounded-md-xl bg-md-surface-container-high p-3 focus-within:ring-2 focus-within:ring-md-primary",
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
          className="max-h-[inherit] w-full resize-none bg-transparent px-1 text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">{leftActions}</div>
          <div className="flex items-center gap-2">
            {rightActions}
            {loading ? (
              <button type="button" onClick={onStop} aria-label="Stop generating" className={sendBtn}>
                <Square className="relative size-3.5 fill-current" />
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={!canSend} aria-label="Send" className={sendBtn}>
                <ArrowUp className="relative size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);
Md3AgentComposer.displayName = "Md3AgentComposer";
