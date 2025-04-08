'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    saleFrequency: 'All' | 'High' | 'Medium' | 'Low'
    lastSale: 'All' | 'Last 7 days' | 'Last 30 days' | 'Last 90 days'
  }
  onApplyFilters: (filters: FilterDialogProps['filters']) => void
}

export function FilterDialog({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sale Frequency Filter */}
          <div className="space-y-4">
            <Label>Sale Frequency</Label>
            <RadioGroup
              value={localFilters.saleFrequency}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  saleFrequency: value as typeof localFilters.saleFrequency,
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="frequency-all" />
                <Label htmlFor="frequency-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="High" id="frequency-high" />
                <Label htmlFor="frequency-high">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="frequency-medium" />
                <Label htmlFor="frequency-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Low" id="frequency-low" />
                <Label htmlFor="frequency-low">Low</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Last Sale Filter */}
          <div className="space-y-4">
            <Label>Last Sale</Label>
            <RadioGroup
              value={localFilters.lastSale}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  lastSale: value as typeof localFilters.lastSale,
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="sale-all" />
                <Label htmlFor="sale-all">All Time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Last 7 days" id="sale-week" />
                <Label htmlFor="sale-week">Last 7 Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Last 30 days" id="sale-month" />
                <Label htmlFor="sale-month">Last 30 Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Last 90 days" id="sale-quarter" />
                <Label htmlFor="sale-quarter">Last 90 Days</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 