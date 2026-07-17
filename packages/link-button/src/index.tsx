import * as React from "react";
import { cn } from "@nucleux/utils";

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Icon before the label. */
  leftIcon?: React.ReactNode;
  /** Icon after the label (e.g. an arrow for "Learn More"). */
  rightIcon?: React.ReactNode;
}

/**
 * A link-styled action — underlined, semibold text with optional icons. Renders
 * an `<a>` when `href` is provided, otherwise a `<button>` for in-app actions.
 */
export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, leftIcon, rightIcon, className, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-foreground underline decoration-from-font underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
      className,
    );
    const content = (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );

    if (href) {
      return (
        <a ref={ref} href={href} className={classes} {...props}>
          {content}
        </a>
      );
    }
    return (
      <button
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
LinkButton.displayName = "LinkButton";
