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
import { PlusCircle, FileText, PencilLine, Trash2, MoreVertical } from "lucide-react"
import { TemplateItem } from "../types/template-items"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
          <Button onClick={onAddItem} size="sm" className="h-8">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Budget Code</TableHead>
              <TableHead>Account Code</TableHead>
              <TableHead>Department</TableHead>
              {mode !== "view" && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{item.itemCode}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.uom}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell>{item.budgetCode}</TableCell>
                <TableCell>{item.accountCode}</TableCell>
                <TableCell>{item.department}</TableCell>
                {mode !== "view" && (
                  <TableCell>
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditItem?.(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">View Details</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditItem?.(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Edit</span>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                          >
                            <span className="sr-only">More options</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEditItem?.(item)}
                            className="text-sm"
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditItem?.(item)}
                            className="text-sm"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteItem?.(item.id)}
                            className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 