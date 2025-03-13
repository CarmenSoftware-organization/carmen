"use client"

import { useState } from "react"
import { TemplateItemsTable } from "./template-items-table"
import { ItemFormDialog } from "./item-form-dialog"
import { TemplateItem } from "../types/template-items"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ItemsTabProps {
  items: TemplateItem[]
  mode: "view" | "edit" | "add"
}

export function ItemsTab({ items: initialItems, mode }: ItemsTabProps) {
  const [items, setItems] = useState<TemplateItem[]>(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleAddItem = () => {
    setSelectedItem(null)
    setFormOpen(true)
  }

  const handleEditItem = (item: TemplateItem) => {
    setSelectedItem(item)
    setFormOpen(true)
  }

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = (data: Partial<TemplateItem>) => {
    if (selectedItem) {
      // Edit existing item
      setItems(items.map(item => 
        item.id === selectedItem.id ? { ...item, ...data } : item
      ))
    } else {
      // Add new item
      setItems([...items, data as TemplateItem])
    }
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="p-4">
      <TemplateItemsTable
        items={items}
        mode={mode}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedItem || undefined}
        mode={selectedItem ? "edit" : "add"}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              from the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 