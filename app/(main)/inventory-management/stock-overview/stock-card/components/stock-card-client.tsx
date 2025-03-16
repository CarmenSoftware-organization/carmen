'use client'

import { QuickFilters } from "./quick-filters"
import { StockCardList } from "./stock-card-list"

export function StockCardClient() {
  return (
    <>
      <QuickFilters />
      <StockCardList />
    </>
  )
} 