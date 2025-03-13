"use client"

import { useState } from "react"
import { CalendarIcon, SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { BalanceReportParams } from "../types"

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
    })
  }

  // Clear a single filter
  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "date":
        setDateValue(new Date())
        onFilterChange({
          asOfDate: new Date().toISOString().substring(0, 10),
        })
        break
      case "location":
        setLocationFrom("")
        setLocationTo("")
        onFilterChange({
          locationRange: {
            from: "",
            to: "",
          },
        })
        break
      case "category":
        setCategoryFrom("")
        setCategoryTo("")
        onFilterChange({
          categoryRange: {
            from: "",
            to: "",
          },
        })
        break
      case "product":
        setProductFrom("")
        setProductTo("")
        onFilterChange({
          productRange: {
            from: "",
            to: "",
          },
        })
        break
      default:
        break
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Date Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="date" className="text-sm font-medium">
              As of Date
            </Label>
            {dateValue && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => clearFilter("date")}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
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

        <Separator />

        {/* Location Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            {(locationFrom || locationTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => clearFilter("location")}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="location-from" className="w-12 text-xs whitespace-nowrap">
                From:
              </Label>
              <Input
                id="location-from"
                value={locationFrom}
                onChange={(e) => setLocationFrom(e.target.value)}
                placeholder="Location code"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="location-to" className="w-12 text-xs whitespace-nowrap">
                To:
              </Label>
              <Input
                id="location-to"
                value={locationTo}
                onChange={(e) => setLocationTo(e.target.value)}
                placeholder="Location code"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            {(categoryFrom || categoryTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => clearFilter("category")}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="category-from" className="w-12 text-xs whitespace-nowrap">
                From:
              </Label>
              <Input
                id="category-from"
                value={categoryFrom}
                onChange={(e) => setCategoryFrom(e.target.value)}
                placeholder="Category code"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="category-to" className="w-12 text-xs whitespace-nowrap">
                To:
              </Label>
              <Input
                id="category-to"
                value={categoryTo}
                onChange={(e) => setCategoryTo(e.target.value)}
                placeholder="Category code"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Product Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="product" className="text-sm font-medium">
              Product
            </Label>
            {(productFrom || productTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => clearFilter("product")}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-1">
              <Label htmlFor="product-from" className="w-12 text-xs whitespace-nowrap">
                From:
              </Label>
              <Input
                id="product-from"
                value={productFrom}
                onChange={(e) => setProductFrom(e.target.value)}
                placeholder="Product code"
                className="h-8"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="product-to" className="w-12 text-xs whitespace-nowrap">
                To:
              </Label>
              <Input
                id="product-to"
                value={productTo}
                onChange={(e) => setProductTo(e.target.value)}
                placeholder="Product code"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={applyFilters}
            className="flex-1"
            disabled={isLoading}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
