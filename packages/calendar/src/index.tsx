import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@nucleux/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * A month calendar / date grid built on react-day-picker, restyled with Nucleux
 * tokens. Supports single, multiple, and range selection via the `mode` prop.
 */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const navButton =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-transparent p-0 text-foreground opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none disabled:opacity-30";
  const dayButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal text-foreground transition-colors hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-foreground",
        nav: "flex items-center gap-1",
        nav_button: navButton,
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: dayButton,
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
