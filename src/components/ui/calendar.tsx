import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * The class names below are react-day-picker v9 names.
 *
 * They used to be v8's — head_row, head_cell, row, cell, day, caption,
 * nav_button_previous, day_selected and so on — while the installed library is
 * v9, which renamed every one of them. v9 does not warn about keys it does not
 * recognise; it simply drops them. So the calendar rendered with none of its
 * layout: the weekday header lost its per-column width and the seven Romanian
 * abbreviations collapsed into one run of letters, "lumamijovisâdu", which is
 * what a visitor saw above the dates.
 *
 * If this ever looks wrong again, check the library's UI enum
 * (node_modules/react-day-picker/dist/cjs/UI.d.ts) against these keys before
 * anything else — a silent rename is the likeliest cause.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10",
        ),
        month_grid: "w-full border-collapse",
        // The header row and its cells have to match the day grid column for
        // column, or the weekday letters bunch up against each other.
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-11 sm:w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        // 44px touch target on phones, back to the tighter 36px grid from sm:
        // up so desktop density is unchanged.
        day: "h-11 w-11 sm:h-9 sm:w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 w-11 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        range_end: "day-range-end",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
