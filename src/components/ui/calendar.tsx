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
          "absolute top-3 left-1 h-8 w-8 bg-white p-0 inline-flex items-center justify-center rounded-md border border-slate-200",
          "transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        ),
        button_next: cn(
          "absolute top-3 right-1 h-8 w-8 bg-white p-0 inline-flex items-center justify-center rounded-md border border-slate-200",
          "transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        ),

        month_grid: "w-full border-collapse space-y-1",

        weekdays: "flex",
        weekday: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",

        week: "flex w-full mt-2",
        day: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",

        day_button: cn(
          "flex h-9 w-9 items-center justify-center p-0 font-normal",
          "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
          "hover:bg-slate-100 hover:text-slate-900 transition-colors"
        ),

        selected: "bg-slate-900 rounded text-white hover:bg-slate-900 hover:text-white",
        today: "bg-slate-100 rounded text-slate-900",
        outside: "text-slate-400 opacity-50",
        disabled: "text-slate-400 opacity-50",
        range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
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
