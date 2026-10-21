import * as React from "react";
import { cn } from "@nucleux/utils";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width / height ratio (e.g. 16/9). Defaults to 1 (square). */
  ratio?: number;
}

/** Constrains its children to a fixed width-to-height ratio. */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      {children}
    </div>
  ),
);
AspectRatio.displayName = "AspectRatio";
