import * as React from "react";
import { cn } from "@nucleux/utils";
import { Button, type ButtonProps } from "@nucleux/button";
import { Input, type InputProps } from "@nucleux/input";
import { Textarea, type TextareaProps } from "@nucleux/textarea";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A bordered wrapper that joins a text control with addons (icons, text,
 * buttons, kbd hints) so they read as one input. The group draws the border,
 * shows the focus ring when its control is focused, and turns destructive when
 * the control has `aria-invalid`. Set `data-disabled="true"` to dim the addons.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full items-center rounded-md border border-input bg-background shadow-sm outline-none transition-[color,box-shadow]",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Alignment-driven layout.
        "[&:has(>[data-align=inline-start])>input]:pl-2",
        "[&:has(>[data-align=inline-end])>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col [&:has(>[data-align=block-start])>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col [&:has(>[data-align=block-end])>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-destructive/20",

        className,
      )}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

const addonAligns: Record<InputGroupAddonAlign, string> = {
  "inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
  "inline-end": "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
  "block-start":
    "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [&.border-b]:pb-3",
  "block-end":
    "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [&.border-t]:pt-3",
};

/** Class string for an {@link InputGroupAddon} with the given alignment. */
export function inputGroupAddonVariants({
  align = "inline-start",
  className,
}: { align?: InputGroupAddonAlign; className?: string } = {}): string {
  return cn(
    "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-4",
    addonAligns[align],
    className,
  );
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Where the addon sits: "inline-start" (default, before the control),
   * "inline-end" (after it), "block-start" (a row above) or "block-end" (a row below).
   */
  align?: InputGroupAddonAlign;
}

/**
 * An icon, text, kbd hint or button attached to an {@link InputGroup}.
 * Clicking anywhere on the addon except a button focuses the group's control.
 */
export const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", onClick, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={inputGroupAddonVariants({ align, className })}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if ((e.target as HTMLElement).closest("button")) return;
        const group = e.currentTarget.parentElement;
        const control =
          group?.querySelector<HTMLElement>("[data-slot=input-group-control]") ??
          group?.querySelector<HTMLElement>("input, textarea");
        control?.focus();
      }}
      {...props}
    />
  ),
);
InputGroupAddon.displayName = "InputGroupAddon";

export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";

const buttonSizeMap: Record<InputGroupButtonSize, ButtonProps["size"]> = {
  xs: "sm",
  sm: "sm",
  "icon-xs": "icon-sm",
  "icon-sm": "icon-sm",
};

const buttonSizeClasses: Record<InputGroupButtonSize, string> = {
  xs: "h-6 gap-1 rounded-sm px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
  sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
  "icon-xs": "size-6 rounded-sm p-0 has-[>svg]:p-0",
  "icon-sm": "size-8 rounded-md p-0 has-[>svg]:p-0",
};

/** Class string for an {@link InputGroupButton} of the given size. */
export function inputGroupButtonVariants({
  size = "xs",
  className,
}: { size?: InputGroupButtonSize; className?: string } = {}): string {
  return cn("flex items-center gap-2 text-sm shadow-none", buttonSizeClasses[size], className);
}

export interface InputGroupButtonProps extends Omit<ButtonProps, "size"> {
  /** Compact sizes for use inside an addon: "xs" (default), "sm", "icon-xs", "icon-sm". Icon sizes need an `aria-label`. */
  size?: InputGroupButtonSize;
}

/**
 * A compact Nucleux `Button` sized to sit inside an {@link InputGroupAddon}.
 * Defaults to `variant="ghost"` and `type="button"`.
 */
export const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ className, type = "button", variant = "ghost", size = "xs", ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      data-size={size}
      variant={variant}
      size={buttonSizeMap[size]}
      className={inputGroupButtonVariants({ size, className })}
      {...props}
    />
  ),
);
InputGroupButton.displayName = "InputGroupButton";

export type InputGroupTextProps = React.HTMLAttributes<HTMLSpanElement>;

/** Muted inline text inside an addon, such as a unit, prefix or counter. */
export const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  ),
);
InputGroupText.displayName = "InputGroupText";

const controlReset =
  "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

export type InputGroupInputProps = InputProps;

/**
 * The Nucleux `Input` of an {@link InputGroup}, with its own border and focus
 * ring removed because the group draws them. `invalid` / `aria-invalid` still
 * work and turn the whole group destructive.
 */
export const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      data-slot="input-group-control"
      className={cn(controlReset, "border-0", className)}
      {...props}
    />
  ),
);
InputGroupInput.displayName = "InputGroupInput";

export type InputGroupTextareaProps = TextareaProps;

/**
 * The Nucleux `Textarea` of an {@link InputGroup}, with its own border, ring
 * and resize handle removed because the group draws the frame.
 */
export const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, InputGroupTextareaProps>(
  ({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      data-slot="input-group-control"
      className={cn(controlReset, "resize-none border-0 py-3", className)}
      {...props}
    />
  ),
);
InputGroupTextarea.displayName = "InputGroupTextarea";
