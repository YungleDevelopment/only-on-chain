import React, { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  onRangeChange: (range: DateRange | undefined) => void;
  initialRange?: DateRange;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeChange,
  initialRange,
  className = "",
}) => {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  const handleRangeSelect = (range: DateRange | undefined) => {
    setRange(range);
    onRangeChange(range);
  };

  return (
    <div className={`bg-[var(--color-bg-dark)] rounded-lg ${className}`}>
      <style>
        {`
          .rdp {
            --rdp-cell-size: 40px;
            --rdp-accent-color: white;
            --rdp-background-color: white;
            --rdp-accent-color-dark: white;
            --rdp-background-color-dark: white;
            --rdp-outline: 2px solid white;
            --rdp-outline-selected: 2px solid white;
            margin: 0;
          }
          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            background-color: white;
            color: black;
          }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: rgba(255, 255, 255, 0.1);
          }
          .rdp-day_range_middle {
            background-color: rgba(43, 128, 255, 0.2);
          }
          .rdp-day_today {
            border: 1px solid white;
            font-weight: bold;
          }
          .rdp-range_start .rdp-day_button {
            background-color: white;
            color: black;
          }
          .rdp-range_end .rdp-day_button {
            background-color: white;
            color: black;
          }
          .rdp-day {
            color: white;
          }
          .rdp-range_middle {
            color: black;
          }
          .rdp-caption, .rdp-head_cell {
            color: white;
            font-weight: bold;
          }
          .rdp-nav_button {
            color: white !important;
            background-color: transparent !important;
          }
          .rdp-caption_label {
            font-size: 1rem;
            font-weight: bold;
            color: white;
          }
          .rdp-head_cell {
            font-size: 0.875rem;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.8);
          }
          .rdp-day_outside {
            color: rgba(255, 255, 255, 0.4);
          }
          th {
            color: white;
          }
          .rdp-chevron {
            fill: white;
          }
        `}
      </style>
      <DayPicker
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={handleRangeSelect}
        numberOfMonths={1}
        className="bg-[var(--color-bg-dark)]"
        showOutsideDays
        fixedWeeks
        modifiersClassNames={{
          selected: "bg-[var(--color-primary-tw)] text-white",
          today: "border border-[var(--color-primary-tw)] font-medium",
        }}
      />
    </div>
  );
};

export default DateRangePicker;
