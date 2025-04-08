'use client'

import { InventoryAdjustmentDetail } from "../components/inventory-adjustment-detail"

// Mock data for demonstration
const mockAdjustment: {
  id: string
  date: string
  type: string
  status: string
  location: string
  locationCode: string
  department: string
  reason: string
  description: string
  items: {
    id: string
    productName: string
    sku: string
    description?: string
    location: string
    locationCode: string
    uom: string
    requiredQuantity: number
    approvedQuantity: number
    issuedQuantity: number
    price: number
    status: 'pending' | 'approved' | 'rejected' | 'completed'
    onHand: number
    onOrder: number
    lastPrice?: number
    lastVendor?: string
    lots: {
      id: string
      lotNumber: string
      quantity: number
      uom: string
    }[]
    unitCost: number
    totalCost: number
  }[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
  }
} = {
  id: "ADJ-2024-001",
  date: "2024-01-15",
  type: "Physical Count",
  status: "Pending",
  location: "Main Warehouse",
  locationCode: "WH-001",
  department: "Warehouse",
  reason: "Physical Count Variance",
  description: "Adjustment based on physical count results",
  items: [
    {
      id: "ITEM-001",
      productName: "Product A",
      sku: "SKU-001",
      description: "Product A Description",
      location: "Main Warehouse",
      locationCode: "WH-001",
      uom: "PCS",
      requiredQuantity: 100,
      approvedQuantity: 100,
      issuedQuantity: 0,
      price: 10.50,
      status: "pending",
      onHand: 95,
      onOrder: 0,
      lots: [
        {
          id: "LOT-001",
          lotNumber: "L001",
          quantity: 50,
          uom: "PCS"
        }
      ],
      unitCost: 10.50,
      totalCost: 1050.00
    }
  ],
  totals: {
    inQty: 100,
    outQty: 0,
    totalCost: 1050.00
  }
}

export default function InventoryAdjustmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // In a real application, you would fetch the data based on params.id
  // For now, we'll use mock data
  const data = { ...mockAdjustment, id: params.id }

  return (
    <div className="flex flex-col gap-4 p-4">
      <InventoryAdjustmentDetail data={data} />
    </div>
  )
}
