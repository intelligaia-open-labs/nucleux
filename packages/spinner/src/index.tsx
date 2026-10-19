import * as React from "react";
import { Loader2, type LucideProps } from "lucide-react";
import { cn } from "@nucleux/utils";

export type SpinnerProps = LucideProps;

/**
 * An animated loading indicator: a spinning lucide Loader2 icon, 16px by
 * default (resize with `className="size-6"`, recolour with a text colour).
 * It carries `role="status"` and `aria-label="Loading"` so assistive tech
 * announces it; override `aria-label` to describe what is loading. Drop it
 * inside a Button, Badge or Empty to show work in progress.
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(({ className, ...props }, ref) => (
  <Loader2
    ref={ref}
    role="status"
    aria-label="Loading"
    data-slot="spinner"
    className={cn("size-4 animate-spin", className)}
    {...props}
  />
));
Spinner.displayName = "Spinner";
