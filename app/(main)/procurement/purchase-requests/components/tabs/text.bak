import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Plus, X } from 'lucide-react'
import { ItemDetailsEditForm } from '../item-details-edit-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Sample data structure for items
interface Item {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  total: number
}

const sampleItems: Item[] = [
  { id: '1', name: 'Item 1', quantity: 5, unit: 'pcs', price: 10, total: 50 },
  { id: '2', name: 'Item 2', quantity: 3, unit: 'kg', price: 15, total: 45 },
  // Add more sample items as needed
]

export function ItemsTab() {
  const [items, setItems] = useState<Item[]>(sampleItems)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'add'>('view')

  const openItemForm = (item: Item | null, mode: 'view' | 'edit' | 'add') => {
    setSelectedItem(item)
    setFormMode(mode)
    setIsEditFormOpen(true)
  }

  const closeItemForm = () => {
    setSelectedItem(null)
    setIsEditFormOpen(false)
    setFormMode('view')
  }

  const handleSave = (formData: FormData) => {
    // Handle saving the form data
    console.log('Saving item:', formData)
    closeItemForm()
    // You would typically update the items state here with the new/updated item
  }

  const handleModeChange = (newMode: 'view' | 'edit' | 'add') => {
    setFormMode(newMode)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Items</h2>
        <Button onClick={() => openItemForm(null, 'add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.price.toFixed(2)}</TableCell>
              <TableCell>{item.total.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => openItemForm(item, 'view')}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openItemForm(item, 'edit')}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Item' : formMode === 'edit' ? 'Edit Item' : 'View Item'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={closeItemForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <ItemDetailsEditForm
            onSave={handleSave}
            onCancel={closeItemForm}
            initialData={selectedItem}
            mode={formMode}
            onModeChange={handleModeChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}