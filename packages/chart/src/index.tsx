import * as React from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@nucleux/utils";

export interface ChartSeriesConfig {
  label?: React.ReactNode;
  /** CSS color; exposed to children as `var(--color-<key>)`. */
  color?: string;
}
export type ChartConfig = Record<string, ChartSeriesConfig>;

/** Re-exported recharts Tooltip — pair with {@link ChartTooltipContent}. */
export const ChartTooltip = Tooltip;
/** Re-exported recharts Legend — pair with {@link ChartLegendContent}. */
export const ChartLegend = Legend;

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  /** A single recharts chart element (BarChart, LineChart, …). */
  children: React.ReactElement;
}

/**
 * Wraps a recharts chart in a responsive, token-aware container. Each config key
 * becomes a `--color-<key>` CSS variable for series `fill`/`stroke`.
 */
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, style, ...props }, ref) => {
    const colorVars = React.useMemo(() => {
      const vars: Record<string, string> = {};
      for (const [key, cfg] of Object.entries(config)) {
        if (cfg.color) vars[`--color-${key}`] = cfg.color;
      }
      return vars;
    }, [config]);

    return (
      <div
        ref={ref}
        data-chart=""
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-text]:fill-muted-foreground",
          className,
        )}
        style={{ ...colorVars, ...style }}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: React.ReactNode;
  config?: ChartConfig;
}

/** A tokenized tooltip body for recharts. Pass to `<ChartTooltip content={…} />`. */
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, config }, ref) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        ref={ref}
        className="min-w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md"
      >
        {label != null && <div className="mb-1 font-medium text-foreground">{label}</div>}
        <div className="flex flex-col gap-1">
          {payload.map((item, i) => {
            const key = String(item.dataKey ?? item.name ?? i);
            const name = config?.[key]?.label ?? item.name ?? key;
            return (
              <div key={i} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-[2px]"
                    style={{ background: item.color ?? `var(--color-${key})` }}
                  />
                  {name}
                </span>
                <span className="font-medium tabular-nums text-foreground">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

interface LegendPayloadItem {
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

export interface ChartLegendContentProps {
  payload?: LegendPayloadItem[];
  config?: ChartConfig;
}

/** A tokenized legend for recharts. Pass to `<ChartLegend content={…} />`. */
export const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ payload, config }, ref) => {
    if (!payload?.length) return null;
    return (
      <div ref={ref} className="flex flex-wrap items-center justify-center gap-4 pt-3">
        {payload.map((item, i) => {
          const key = String(item.dataKey ?? item.value ?? i);
          const name = config?.[key]?.label ?? item.value ?? key;
          return (
            <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                aria-hidden
                className="h-2 w-2 rounded-[2px]"
                style={{ background: item.color ?? `var(--color-${key})` }}
              />
              {name}
            </span>
          );
        })}
      </div>
    );
  },
);
ChartLegendContent.displayName = "ChartLegendContent";
