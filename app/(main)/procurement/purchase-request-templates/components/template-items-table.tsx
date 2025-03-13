"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { TemplateItem } from "../types/template-items"

interface TemplateItemsTableProps {
  items: TemplateItem[]
  mode: "view" | "edit" | "add"
  onAddItem?: () => void
  onEditItem?: (item: TemplateItem) => void
  onDeleteItem?: (itemId: string) => void
}

export function TemplateItemsTable({
  items,
  mode,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: TemplateItemsTableProps) {
  return (
    <div className="space-y-4">
      {mode !== "view" && (
        <div className="flex justify-end">
          <Button onClick={onAddItem} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Budget Code</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>Department</TableHead>
            {mode !== "view" && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.itemCode}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.uom}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {item.unitPrice.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {item.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>{item.budgetCode}</TableCell>
              <TableCell>{item.accountCode}</TableCell>
              <TableCell>{item.department}</TableCell>
              {mode !== "view" && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditItem?.(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem?.(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 