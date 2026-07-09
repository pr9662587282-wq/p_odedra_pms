import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("group/calendar bg-background p-2", className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),

        nav: cn(
          "absolute inset-x-0 top-0 flex w-full justify-between",
          defaultClassNames.nav,
        ),

        button_previous: cn(
          "p-2 rounded hover:bg-gray-200",
          defaultClassNames.button_previous,
        ),

        button_next: cn(
          "p-2 rounded hover:bg-gray-200",
          defaultClassNames.button_next,
        ),

        month_caption: cn(
          "flex justify-center",
          defaultClassNames.month_caption,
        ),

        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),

        weekdays: cn("flex w-full", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 text-center text-xs font-medium text-muted-foreground py-1",
          defaultClassNames.weekday,
        ),

        week: cn("flex w-full mt-1", defaultClassNames.week),

        day: cn("flex-1 text-center", defaultClassNames.day),

        today: cn("bg-muted text-foreground", defaultClassNames.today),
        outside: cn("text-muted-foreground", defaultClassNames.outside),
        disabled: cn("opacity-50", defaultClassNames.disabled),

        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={className} {...props} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={className} {...props} />;
          }
          return <ChevronDownIcon className={className} {...props} />;
        },

        DayButton: (props) => <CalendarDayButton locale={locale} {...props} />,

        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, locale, ...props }) {
  const ref = React.useRef(null);
  const defaultClassNames = getDefaultClassNames();

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      className={cn(
        "w-full h-8 flex items-center justify-center text-sm rounded-md",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
