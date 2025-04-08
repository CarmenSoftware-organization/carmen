import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


interface InventoryItem {
  description: string
  currentStock: number
  onOrder: number
  reorderPoint: number
  restockLevel: number
}

interface PurchaseOrderData {
  items?: InventoryItem[]
}

interface InventoryStatusTabProps {
  poData?: PurchaseOrderData
}

// Mock data for when no data is provided
const mockInventoryData: PurchaseOrderData = {
  items: [
    {
      description: "Office Paper A4",
      currentStock: 250,
      onOrder: 500,
      reorderPoint: 100,
      restockLevel: 500
    },
    {
      description: "Printer Ink Cartridges",
      currentStock: 15,
      onOrder: 30,
      reorderPoint: 10,
      restockLevel: 50
    },
    {
      description: "Staples (Box)",
      currentStock: 45,
      onOrder: 0,
      reorderPoint: 20,
      restockLevel: 100
    }
  ]
};

export default function InventoryStatusTab({ poData }: InventoryStatusTabProps) {
  // Use provided data or fallback to mock data
  const inventoryData = poData || mockInventoryData;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Total Items</Label>
          <Input value={inventoryData.items?.length || 0} readOnly />
        </div>
        <div>
          <Label>Total Current Stock</Label>
          <Input value={inventoryData.items?.reduce((sum: number, item: InventoryItem) => sum + item.currentStock, 0) || 0} readOnly />
        </div>
        <div>
          <Label>Total On Order</Label>
          <Input value={inventoryData.items?.reduce((sum: number, item: InventoryItem) => sum + item.onOrder, 0) || 0} readOnly />
        </div>
        <div>
          <Button className="mt-6">Refresh Inventory Status</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>On Order</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Restock Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryData.items && inventoryData.items.map((item: InventoryItem, index: number) => (
            <TableRow key={index}>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.currentStock}</TableCell>
              <TableCell>{item.onOrder}</TableCell>
              <TableCell>{item.reorderPoint}</TableCell>
              <TableCell>{item.restockLevel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
