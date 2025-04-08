'use client'

import { useState } from "react"
import { QuickFilters } from "./quick-filters"
import { StockCardList } from "./stock-card-list"

const filterOptions = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "excess_stock", label: "Excess Stock" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" }
]

export function StockCardClient() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  return (
    <>
      <QuickFilters 
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
      />
      <StockCardList />
    </>
  )
} 