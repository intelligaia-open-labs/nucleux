import * as React from "react";
import { cn } from "@nucleux/utils";
import type { OpenInputProps } from "@nucleux/open-input";
import { Md3OpenInput } from "@nucleux/md3-open-input";

export interface Md3AgentComposerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit">,
    Pick<
      OpenInputProps,
      "onAdd" | "addLabel" | "add" | "model" | "onVoice" | "voiceLabel" | "sendVariant" | "layout"
    > {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  /** Controls at the toolbar's left (after the + from `onAdd`), e.g. a Request settings button. */
  leftActions?: React.ReactNode;
  /** Controls at the toolbar's right, before the mic and send (e.g. scaffold chips, a model chip). */
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

/**
 * A Material Design 3 agent task composer — the nucleux.in M3 composer (it is
 * `Md3OpenInput`, so the two always look the same): an outlined bar on the
 * surface with the prompt field on top and a toolbar under it — `leftActions`
 * (after an optional "+" from `onAdd`), then `rightActions`, the `model` chip,
 * a mic from `onVoice` and a round filled send/stop button. Pass
 * `layout="auto"` for the one-row bar that stacks once the request wraps. The
 * field grows to eight lines (`maxLines`) and then scrolls; past that an
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
      onAdd,
      addLabel,
      add,
      model,
      onVoice,
      voiceLabel,
      sendVariant,
      layout = "stacked",
      className,
      ...props
    },
    ref,
  ) => (
    <div className="font-md" {...props}>
      <Md3OpenInput
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        aria-label={typeof placeholder === "string" ? placeholder : "Message"}
        sendLabel="Send"
        loading={loading}
        onStop={onStop}
        maxLines={maxLines}
        maxHeight={maxHeight}
        expandable={expandable}
        disabled={disabled}
        onAdd={onAdd}
        addLabel={addLabel}
        add={add}
        actions={leftActions}
        model={
          rightActions != null || model != null ? (
            <>
              {rightActions}
              {model}
            </>
          ) : undefined
        }
        onVoice={onVoice}
        voiceLabel={voiceLabel}
        sendVariant={sendVariant}
        layout={layout}
        className={cn(className)}
      />
    </div>
  ),
);
Md3AgentComposer.displayName = "Md3AgentComposer";
