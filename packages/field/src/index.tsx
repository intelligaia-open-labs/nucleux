import * as React from "react";
import { cn } from "@nucleux/utils";
import { Label } from "@nucleux/label";
import { Separator } from "@nucleux/separator";

export type FieldSetProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement>;

/**
 * A `<fieldset>` that groups related fields (for example a checkbox or radio
 * group) under one legend. Stacks its children vertically and tightens the gap
 * when it directly wraps a checkbox or radio group.
 */
export const FieldSet = React.forwardRef<HTMLFieldSetElement, FieldSetProps>(
  ({ className, ...props }, ref) => (
    <fieldset
      ref={ref}
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  ),
);
FieldSet.displayName = "FieldSet";

export type FieldLegendVariant = "legend" | "label";

export interface FieldLegendProps extends React.HTMLAttributes<HTMLLegendElement> {
  /** "legend" (default) renders a section heading; "label" renders at label size. */
  variant?: FieldLegendVariant;
}

/**
 * The caption of a {@link FieldSet}. Use `variant="label"` when the set reads
 * as a single question (such as a radio group) rather than a section.
 */
export const FieldLegend = React.forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ className, variant = "legend", ...props }, ref) => (
    <legend
      ref={ref}
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium text-foreground",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
FieldLegend.displayName = "FieldLegend";

export type FieldGroupProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A vertical stack of {@link Field}s. Nested field groups get a tighter gap.
 * Fields with `orientation="responsive"` switch to a row at the `md` breakpoint.
 */
export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field-group"
      className={cn(
        "group/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  ),
);
FieldGroup.displayName = "FieldGroup";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

const fieldOrientations: Record<FieldOrientation, string> = {
  vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
  horizontal: cn(
    "flex-row items-center",
    "[&>[data-slot=field-label]]:flex-auto",
    "has-[>[data-slot=field-content]]:items-start",
    "[&:has(>[data-slot=field-content])>[role=checkbox]]:mt-px [&:has(>[data-slot=field-content])>[role=radio]]:mt-px",
  ),
  responsive: cn(
    "flex-col md:flex-row md:items-center [&>*]:w-full md:[&>*]:w-auto [&>.sr-only]:w-auto",
    "md:[&>[data-slot=field-label]]:flex-auto",
    "md:has-[>[data-slot=field-content]]:items-start",
    "md:[&:has(>[data-slot=field-content])>[role=checkbox]]:mt-px md:[&:has(>[data-slot=field-content])>[role=radio]]:mt-px",
  ),
};

/** Class string for a {@link Field} with the given orientation (shadcn's `fieldVariants`). */
export function fieldVariants({
  orientation = "vertical",
  className,
}: { orientation?: FieldOrientation; className?: string } = {}): string {
  return cn(
    "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
    fieldOrientations[orientation],
    className,
  );
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Layout of label and control: "vertical" (default, stacked), "horizontal"
   * (side by side), or "responsive" (stacked, side by side from `md` up).
   */
  orientation?: FieldOrientation;
}

/**
 * One form field: a label, its control, and optional description and error,
 * wrapped in `role="group"`. Set `data-invalid` to tint it destructive and
 * `data-disabled` to dim its label.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={fieldVariants({ orientation, className })}
      {...props}
    />
  ),
);
Field.displayName = "Field";

export type FieldContentProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Stacks a label and description next to a control in a horizontal
 * {@link Field}, such as a checkbox or switch with helper text.
 */
export const FieldContent = React.forwardRef<HTMLDivElement, FieldContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)}
      {...props}
    />
  ),
);
FieldContent.displayName = "FieldContent";

export type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label>;

/**
 * The label of a {@link Field}, built on Nucleux `Label`; pair it with
 * `htmlFor`. When it wraps a whole `Field` it becomes a bordered, selectable
 * card that highlights when the control inside is checked.
 */
export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => (
    <Label
      ref={ref}
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border has-[>[data-slot=field]]:border-border [&>[data-slot=field]]:p-4",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
        className,
      )}
      {...props}
    />
  ),
);
FieldLabel.displayName = "FieldLabel";

export type FieldTitleProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A label-styled title that is not a `<label>`, for use inside a
 * {@link FieldContent} when the control is labelled some other way.
 */
export const FieldTitle = React.forwardRef<HTMLDivElement, FieldTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium leading-snug text-foreground group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
FieldTitle.displayName = "FieldTitle";

export type FieldDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * Helper text for a {@link Field}. Link it to the control with
 * `aria-describedby` so screen readers announce it.
 */
export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="field-description"
      className={cn(
        "text-sm font-normal leading-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 [&:nth-last-child(2)]:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  ),
);
FieldDescription.displayName = "FieldDescription";

export interface FieldSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional text shown centred on the rule, such as "Or continue with". */
  children?: React.ReactNode;
}

/** A horizontal rule between fields or groups, with optional centred text. */
export const FieldSeparator = React.forwardRef<HTMLDivElement, FieldSeparatorProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  ),
);
FieldSeparator.displayName = "FieldSeparator";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Validation errors, e.g. from react-hook-form or a schema. Messages are
   * deduplicated: one message renders as plain text, several as a list.
   * Ignored when `children` is given.
   */
  errors?: Array<{ message?: string } | undefined>;
}

/**
 * The validation message of a {@link Field}, announced with `role="alert"`.
 * Renders `children`, or the deduplicated `errors` messages, and nothing at
 * all when there is no error.
 */
export const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, children, errors, ...props }, ref) => {
    const content = React.useMemo(() => {
      if (children) return children;
      if (!errors?.length) return null;
      const messages = [
        ...new Set(errors.map((error) => error?.message).filter((m): m is string => !!m)),
      ];
      if (messages.length === 0) return null;
      if (messages.length === 1) return messages[0];
      return (
        <ul className="ml-4 flex list-disc flex-col gap-1">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      );
    }, [children, errors]);

    if (!content) return null;

    return (
      <div
        ref={ref}
        role="alert"
        data-slot="field-error"
        className={cn("text-sm font-normal text-destructive", className)}
        {...props}
      >
        {content}
      </div>
    );
  },
);
FieldError.displayName = "FieldError";
