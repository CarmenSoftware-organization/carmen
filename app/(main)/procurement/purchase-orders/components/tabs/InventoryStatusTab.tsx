import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PurchaseOrder, PurchaseOrderItem } from '@/lib/types'

interface InventoryStatusTabProps {
  poData: PurchaseOrder;
}

interface InventoryItemInfo {
  currentStock: number;
  onOrder: number;
  reorderPoint: number;
  restockLevel: number;
}

export default function InventoryStatusTab({ poData }: InventoryStatusTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Total Items</Label>
          <Input value={poData.items?.length || 0} readOnly />
        </div>
        <div>
          <Label>Total Current Stock</Label>
          <Input value={poData.items?.reduce((sum: number, item: PurchaseOrderItem) => 
            sum + (item.inventoryInfo?.onHand || 0), 0) || 0} readOnly />
        </div>
        <div>
          <Label>Total On Order</Label>
          <Input value={poData.items?.reduce((sum: number, item: PurchaseOrderItem) => 
            sum + (item.inventoryInfo?.onOrdered || 0), 0) || 0} readOnly />
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
          {poData.items && poData.items.map((item: PurchaseOrderItem, index: number) => (
            <TableRow key={index}>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.inventoryInfo?.onHand || 0}</TableCell>
              <TableCell>{item.inventoryInfo?.onOrdered || 0}</TableCell>
              <TableCell>{item.inventoryInfo?.reorderLevel || 0}</TableCell>
              <TableCell>{item.inventoryInfo?.restockLevel || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
