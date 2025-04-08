import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterCriteria } from "../types"
import { QuickFilters } from "./quick-filters"


interface StockCardHeaderProps {
  onFilterChange?: (filters: Partial<FilterCriteria>) => void
  onSearch?: (term: string) => void
}

export function StockCardHeader({ onFilterChange, onSearch }: StockCardHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Card</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search items..."
            className="w-[300px]"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Button>
            Export
          </Button>
        </div>
      </div>
      <QuickFilters onFilterChange={onFilterChange} />
    </div>
  )
} 