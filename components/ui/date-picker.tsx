"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface DatePickerProps {
  date?: Date
  setDate?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export interface DateRangePickerProps {
  dateRange?: DateRange
  setDateRange?: (dateRange: DateRange | undefined) => void
  className?: string
  showPresets?: boolean
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  className,
  showPresets = true,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>("last7Days");

  const presets = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "last7Days" },
    { label: "Last 30 days", value: "last30Days" },
    { label: "This month", value: "thisMonth" },
    { label: "Custom range", value: "custom" },
  ]

  // Set default date range (last 7 days)
  React.useEffect(() => {
    if (!dateRange?.from && !dateRange?.to) {
      handlePresetChange("last7Days")
    }
  }, [dateRange])

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    
    if (value === "custom") {
      return
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const from = new Date(today)
    let to = new Date(today)
    
    if (value === "today") {
      // Range is just today
      to = new Date(today)
    } else if (value === "yesterday") {
      // Range is just yesterday
      from.setDate(from.getDate() - 1)
      to = new Date(from)
    } else if (value === "last7Days") {
      // Range is last 7 days
      from.setDate(from.getDate() - 6)
    } else if (value === "last30Days") {
      // Range is last 30 days
      from.setDate(from.getDate() - 29)
    } else if (value === "thisMonth") {
      // Range is current month
      from.setDate(1)
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    }
    
    if (setDateRange) {
      setDateRange({ from, to })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {showPresets && (
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {selectedPreset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
      
      {selectedPreset !== "custom" && dateRange?.from && dateRange?.to && (
        <div className="px-3 py-2 text-sm border rounded-md bg-muted/20">
          <span className="font-medium">Selected: </span>
          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
        </div>
      )}
    </div>
  )
}
