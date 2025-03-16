"use client"

import { useState } from "react"
import { CalendarIcon, SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { BalanceReportParams } from "../types"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface FilterPanelProps {
  params: BalanceReportParams
  onFilterChange: (params: Partial<BalanceReportParams>) => void
  isLoading: boolean
}

export function FilterPanel({
  params,
  onFilterChange,
  isLoading,
}: FilterPanelProps) {
  // Local state for filter values before applying
  const [dateValue, setDateValue] = useState<Date | undefined>(
    params.asOfDate ? new Date(params.asOfDate) : undefined
  )
  const [locationFrom, setLocationFrom] = useState(params.locationRange.from)
  const [locationTo, setLocationTo] = useState(params.locationRange.to)
  const [categoryFrom, setCategoryFrom] = useState(params.categoryRange.from)
  const [categoryTo, setCategoryTo] = useState(params.categoryRange.to)
  const [productFrom, setProductFrom] = useState(params.productRange.from)
  const [productTo, setProductTo] = useState(params.productRange.to)
  const [valuationMethod, setValuationMethod] = useState(params.valuationMethod)

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      asOfDate: dateValue?.toISOString().substring(0, 10) || new Date().toISOString().substring(0, 10),
      locationRange: {
        from: locationFrom,
        to: locationTo,
      },
      categoryRange: {
        from: categoryFrom,
        to: categoryTo,
      },
      productRange: {
        from: productFrom,
        to: productTo,
      },
      valuationMethod: valuationMethod as 'FIFO' | 'WEIGHTED_AVERAGE',
    })
  }

  // Reset filters
  const resetFilters = () => {
    setDateValue(new Date())
    setLocationFrom("")
    setLocationTo("")
    setCategoryFrom("")
    setCategoryTo("")
    setProductFrom("")
    setProductTo("")
    setValuationMethod('FIFO')
    
    onFilterChange({
      asOfDate: new Date().toISOString().substring(0, 10),
      locationRange: {
        from: "",
        to: "",
      },
      categoryRange: {
        from: "",
        to: "",
      },
      productRange: {
        from: "",
        to: "",
      },
      valuationMethod: 'FIFO',
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            As of Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={setDateValue}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Valuation Method */}
        <div className="space-y-2">
          <Label htmlFor="valuation-method" className="text-sm font-medium">
            Valuation Method
          </Label>
          <Select
            value={valuationMethod}
            onValueChange={(value) => setValuationMethod(value as 'FIFO' | 'WEIGHTED_AVERAGE')}
          >
            <SelectTrigger id="valuation-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIFO">FIFO</SelectItem>
              <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Empty space for alignment */}
        <div></div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Location Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="From"
              value={locationFrom}
              onChange={(e) => setLocationFrom(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="To"
              value={locationTo}
              onChange={(e) => setLocationTo(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Category Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="From"
              value={categoryFrom}
              onChange={(e) => setCategoryFrom(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="To"
              value={categoryTo}
              onChange={(e) => setCategoryTo(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Product Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Product Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="From"
              value={productFrom}
              onChange={(e) => setProductFrom(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="To"
              value={productTo}
              onChange={(e) => setProductTo(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetFilters}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button 
          size="sm"
          onClick={applyFilters}
          disabled={isLoading}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
} 
