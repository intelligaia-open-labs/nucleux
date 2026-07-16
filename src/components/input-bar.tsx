import * as React from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "../lib/utils";

export interface InputBarProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit" | "value" | "onChange"> {
  /** Controlled value of the input. */
  value: string;
  /** Called when the value changes. */
  onValueChange: (value: string) => void;
  /** Called with the trimmed value on submit (Enter or button). */
  onSubmit: (value: string) => void;
  /** Show the agent as busy — swaps the send button for a stop button. */
  loading?: boolean;
  /** Called when the stop button is pressed while `loading`. */
  onStop?: () => void;
  /** Max auto-grow height in px before scrolling. */
  maxHeight?: number;
}

/**
 * Auto-resizing chat composer. Enter submits, Shift+Enter inserts a newline.
 * While `loading`, the send button becomes a stop button wired to `onStop`.
 */
export const InputBar = React.forwardRef<HTMLTextAreaElement, InputBarProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      loading = false,
      onStop,
      maxHeight = 200,
      placeholder = "Message the agent…",
      className,
      disabled,
      ...props
    },
    forwardedRef,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

    // Auto-grow the textarea to fit its content, capped at maxHeight.
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    const canSend = value.trim().length > 0 && !disabled;

    const submit = () => {
      if (!canSend) return;
      onSubmit(value.trim());
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
          "flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring",
          className,
        )}
      >
        <textarea
          ref={innerRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-[inherit] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          {...props}
        />
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
            aria-label="Send message"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
InputBar.displayName = "InputBar";
