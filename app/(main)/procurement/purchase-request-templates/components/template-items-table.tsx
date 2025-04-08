"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { TemplateItem } from "../types/template-items"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TemplateItemsTableProps {
  items: TemplateItem[]
  mode: "view" | "edit" | "add"
  onAddItem?: () => void
  onEditItem?: (item: TemplateItem) => void
  onDeleteItem?: (item: TemplateItem) => void
}

export function TemplateItemsTable({
  items,
  mode,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: TemplateItemsTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {mode !== "view" && (
                  <div className="flex gap-2">
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
                      onClick={() => onDeleteItem?.(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mode !== "view" && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAddItem}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      )}
    </div>
  )
} 