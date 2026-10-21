import * as React from "react";
import { ArrowUp, Maximize2, Minimize2, Square } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useComposerHeight } from "./use-composer-height";

export interface Md3AgentComposerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit"
> {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  loading?: boolean;
  onStop?: () => void;
  /** Lines the field grows to before it scrolls. Defaults to 8. */
  maxLines?: number;
  /** An explicit ceiling in px before the field scrolls; when set it replaces the `maxLines` ceiling. */
  maxHeight?: number;
  /**
   * Once the text overflows the ceiling, show an Expand icon button in the
   * field's top-right corner; expanded, the field grows to most of the
   * available height, and Collapse (or sending, which empties the field)
   * brings it back. Defaults to true.
   */
  expandable?: boolean;
  disabled?: boolean;
}

// A 32px standard icon button with the M3 state layer.
const expandBtn =
  "absolute right-0 top-0 inline-flex size-8 items-center justify-center overflow-hidden rounded-full text-md-on-surface-variant outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] active:before:opacity-[0.12] motion-reduce:before:transition-none";

const sendBtn =
  "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-md-primary text-md-on-primary outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] active:before:opacity-[0.12] disabled:opacity-[0.38] disabled:before:opacity-0";

/**
 * A Material Design 3 agent task composer — a tonal surface with an auto-growing
 * prompt field, a toolbar, and a filled send/stop button with a state layer.
 * The field grows to eight lines (`maxLines`) and then scrolls; past that an
 * Expand icon button gives the request most of the available height, and
 * sending collapses it again. Enter submits, Shift+Enter newlines.
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
      maxLines = 8,
      maxHeight,
      expandable = true,
      disabled,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

    const fieldId = React.useId();
    const { expanded, showToggle, toggle } = useComposerHeight(innerRef, {
      value,
      maxLines,
      maxHeight,
      enabled: true,
      expandable,
      fallbackLineHeight: 20,
    });

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
        data-expanded={expanded || undefined}
        {...props}
      >
        <div className="relative flex w-full">
          <textarea
            ref={innerRef}
            id={fieldId}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={typeof placeholder === "string" ? placeholder : "Message"}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full resize-none bg-transparent px-1 text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant disabled:opacity-50",
              showToggle && "pr-10",
            )}
          />
          {showToggle && (
            <button
              type="button"
              onClick={toggle}
              aria-label={expanded ? "Collapse" : "Expand"}
              aria-expanded={expanded}
              aria-controls={fieldId}
              className={expandBtn}
            >
              {expanded ? (
                <Minimize2 aria-hidden="true" className="relative size-5" />
              ) : (
                <Maximize2 aria-hidden="true" className="relative size-5" />
              )}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">{leftActions}</div>
          <div className="flex items-center gap-2">
            {rightActions}
            {loading ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className={sendBtn}
              >
                <Square className="relative size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                aria-label="Send"
                className={sendBtn}
              >
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
