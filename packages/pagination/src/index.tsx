import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  count: number;
  onPageChange: (page: number) => void;
  /** How many page buttons to show around the current page. */
  siblingCount?: number;
}

const DOTS = "dots";

/** Build the page-number sequence, inserting "dots" where pages are skipped. */
function usePageRange(page: number, count: number, siblingCount: number): (number | typeof DOTS)[] {
  return React.useMemo(() => {
    const total = siblingCount * 2 + 5; // first, last, current, 2 dots
    if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);

    const left = Math.max(page - siblingCount, 1);
    const right = Math.min(page + siblingCount, count);
    const showLeftDots = left > 2;
    const showRightDots = right < count - 1;
    const range: (number | typeof DOTS)[] = [1];

    if (showLeftDots) range.push(DOTS);
    for (let i = showLeftDots ? left : 2; i <= (showRightDots ? right : count - 1); i++) range.push(i);
    if (showRightDots) range.push(DOTS);
    range.push(count);
    return range;
  }, [page, count, siblingCount]);
}

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

/** Page navigation with previous/next controls and truncated page numbers. */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, count, onPageChange, siblingCount = 1, className, ...props }, ref) => {
    const pages = usePageRange(page, count, siblingCount);
    const go = (p: number) => {
      if (p >= 1 && p <= count && p !== page) onPageChange(p);
    };

    return (
      <nav ref={ref} role="navigation" aria-label="Pagination" className={cn("flex items-center gap-1", className)} {...props}>
        <button
          type="button"
          className={cn(itemBase, "gap-1 hover:bg-muted")}
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === DOTS ? (
            <span key={`dots-${i}`} aria-hidden className={cn(itemBase, "text-muted-foreground")}>
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              aria-label={`Go to page ${p}`}
              onClick={() => go(p)}
              className={cn(
                itemBase,
                p === page ? "border border-input bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className={cn(itemBase, "gap-1 hover:bg-muted")}
          onClick={() => go(page + 1)}
          disabled={page >= count}
          aria-label="Go to next page"
        >
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
