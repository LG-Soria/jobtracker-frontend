"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react" // si querés: cambiá por react-icons

import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 ", className)}
    classNames={{
      months: "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",
      month: "space-y-4",

      // v9 renames
      month_caption: "flex  w-32 mx-auto justify-center pt-1 relative items-center",
      caption_label: "text-sm  font-medium",

        nav: "space-x-1 flex items-center",

        button_previous: cn(
          "absolute top-3 left-1 h-8 w-8 bg-surface p-0 inline-flex items-center justify-center rounded-input border border-border",
          "transition-colors duration-150 ease-out hover:bg-surface-muted focus:outline-none focus-visible:ring-0 focus-visible:border-primary"
        ),
        button_next: cn(
          "absolute top-3 right-1 h-8 w-8 bg-surface p-0 inline-flex items-center justify-center rounded-input border border-border",
          "transition-colors duration-150 ease-out hover:bg-surface-muted focus:outline-none focus-visible:ring-0 focus-visible:border-primary"
        ),

        month_grid: "w-full border-collapse space-y-1",

        weekdays: "flex",
        weekday: "text-ink-soft rounded-md w-9 font-normal text-[0.8rem]",

        week: "flex w-full mt-2",
        day: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",

        day_button: cn(
          "flex h-9 w-9 items-center justify-center p-0 font-normal",
          "rounded-input focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary",
          "hover:bg-surface-muted hover:text-ink transition-colors duration-150 ease-out"
        ),

        selected: "bg-primary rounded text-white hover:bg-primary hover:text-white",
        today: "bg-surface-muted rounded text-ink",
        outside: "text-ink-soft opacity-50",
        disabled: "text-ink-soft opacity-50",
        range_middle: "aria-selected:bg-surface-muted aria-selected:text-ink",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4 " {...chevronProps} />
          ) : (
            <ChevronRight className="h-4 w-4 " {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
