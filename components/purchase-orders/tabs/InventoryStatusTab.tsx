import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function InventoryStatusTab({ poData }: { poData: any }) {
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
          <Input value={poData.items?.reduce((sum: number, item: any) => sum + item.currentStock, 0) || 0} readOnly />
        </div>
        <div>
          <Label>Total On Order</Label>
          <Input value={poData.items?.reduce((sum: number, item: any) => sum + item.onOrder, 0) || 0} readOnly />
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
          {poData.items && poData.items.map((item: any, index: number) => (
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
