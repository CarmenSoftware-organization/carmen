import { Metadata } from "next"
import { StockCardList } from "./components/stock-card-list"
import { QuickFilters } from "./components/quick-filters"


export const metadata: Metadata = {
  title: "Stock Card | Inventory Overview",
  description: "View and manage stock cards for inventory items",
}

export default function StockCardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stock Card</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your inventory items
          </p>
        </div>
      </div>
      <QuickFilters />
      <StockCardList />
    </div>
  )
} 