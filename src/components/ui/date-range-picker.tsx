
import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onChange?: (date: DateRange | undefined) => void;
  value?: DateRange;
}

export function DatePickerWithRange({
  className,
  onChange,
  value,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value || {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    }
  );

  // Обработчик изменения даты
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  // Форматирование диапазона дат для отображения
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) {
      return "Выберите период";
    }

    if (range.from && range.to) {
      // Полный диапазон
      return `${format(range.from, "dd MMM", { locale: ru })} - ${format(range.to, "dd MMM yyyy", { locale: ru })}`;
    } else if (range.from) {
      // Только начальная дата
      return `С ${format(range.from, "dd MMM yyyy", { locale: ru })}`;
    } else if (range.to) {
      // Только конечная дата
      return `По ${format(range.to, "dd MMM yyyy", { locale: ru })}`;
    }

    return "Выберите период";
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={ru}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
