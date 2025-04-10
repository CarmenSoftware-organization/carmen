import { Metadata } from "next"
import { StockCardDetail } from "../components/stock-card-detail"
import { notFound } from "next/navigation"
<<<<<<< HEAD
import { MovementType, TransactionType } from "@/app/(main)/inventory-management/stock-overview/types"

=======
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)

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
    itemId: params.id,
    itemCode: "ITEM-001",
    itemName: "Sample Item",
    itemGroup: "Raw Materials",
    category: "Food",
    subCategory: "Vegetables",
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
<<<<<<< HEAD
        id: "1",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].substring(0, 8),
        reference: "GRN-001",
        referenceType: "Goods Receipt",
        locationId: "1",
        locationName: "Main Warehouse",
        transactionType: "IN" as TransactionType,
        reason: "Initial stock",
        lotNumber: "LOT-001",
        quantityBefore: 0,
        quantityAfter: 100,
        quantityChange: 100,
        unitCost: 10,
        valueBefore: 0,
        valueAfter: 1000,
        valueChange: 1000,
        username: "admin"
=======
        transactionId: "1",
        date: new Date(),
        type: "GRN",
        quantity: 100,
        unitCost: 10,
        totalCost: 1000,
        reference: "GRN-001",
        location: "Main Warehouse",
        documentNo: "GRN-001",
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)
      },
    ],
    currentStock: {
      totalStock: 100,
      valueOnHand: 1000,
      averageCost: 10,
      lastPurchaseDate: new Date(),
      lastMovementDate: new Date(),
      minStock: 50,
      maxStock: 150,
      reorderPoint: 75,
    },
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