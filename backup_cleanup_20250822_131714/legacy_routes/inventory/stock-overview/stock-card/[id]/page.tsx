import { Metadata } from "next"
import { StockCardDetail } from "../components/stock-card-detail"
import { notFound } from "next/navigation"
import { MovementType } from "../types"

interface StockCardDetailPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Stock Card Detail | Inventory Overview",
  description: "View detailed stock card information",
}

export default function StockCardDetailPage({ params }: StockCardDetailPageProps) {
  // In a real application, we would fetch the stock card data here
  // For now, we'll use mock data
  const stockCard = {
    id: params.id,
    itemId: params.id,
    itemCode: "ITEM-001",
    itemName: "Sample Item",
    category: "Food",
    uom: "KG",
    locations: [
      {
        id: "1",
        name: "Main Warehouse",
        stockOnHand: 100,
        reservedStock: 20,
        availableStock: 80,
      },
    ],
    movements: [
      {
        id: "1",
        date: new Date().toISOString(),
        type: "STOCK_IN" as MovementType,
        quantity: 100,
        unit: "KG",
        reference: "GRN-001",
        notes: "Initial stock"
      },
    ],
    currentStock: {
      totalStock: 100,
      valueOnHand: 1000,
      averageCost: 10,
      lastPurchaseDate: new Date().toISOString(),
      lastMovementDate: new Date().toISOString(),
    },
    minStock: 50,
    maxStock: 150
  }

  if (!stockCard) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <StockCardDetail data={stockCard} />
    </div>
  )
} 