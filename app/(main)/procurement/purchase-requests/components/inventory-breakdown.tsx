"use client"

import { StatusBadge } from "@/components/ui/status-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InventoryLocation {
  location: string
  quantityOnHand: number
  units: string
  par: number
  reorderPoint: number
  minStock: number
  maxStock: number
}

interface InventoryBreakdownProps {
  isOpen?: boolean
  onClose?: () => void
  itemData: {
    name: string
    description: string
    status: string
  }
  inventoryData: InventoryLocation[]
}

export default function InventoryBreakdown({ 
  isOpen, 
  onClose, 
  itemData,
  inventoryData 
}: InventoryBreakdownProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inventory Breakdown</DialogTitle>
        </DialogHeader>
        <div className="mb-6 bg-muted p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{itemData.name}</h2>
            <StatusBadge status={itemData.status} />
          </div>
          <p className="text-gray-600">{itemData.description}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="text-nowrap">
              <TableHead className="w-[180px]">Location</TableHead>
              <TableHead>Quantity On Hand</TableHead>
              <TableHead>Inv. Units</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Max Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow className="text-nowrap" key={item.location}>
                <TableCell className="font-medium">{item.location}</TableCell>
                <TableCell>{item.quantityOnHand}</TableCell>
                <TableCell>{item.units}</TableCell>
                <TableCell>{item.par}</TableCell>
                <TableCell>{item.reorderPoint}</TableCell>
                <TableCell>{item.minStock}</TableCell>
                <TableCell>{item.maxStock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}