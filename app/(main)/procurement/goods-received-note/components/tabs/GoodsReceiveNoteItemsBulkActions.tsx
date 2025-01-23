import React from 'react'
import { Button } from '@/components/ui/button'

interface GoodsReceiveNoteItemsBulkActionsProps {
  selectedItems: string[]
  onBulkAction: (action: string) => void
}

export function GoodsReceiveNoteItemsBulkActions({ selectedItems, onBulkAction }: GoodsReceiveNoteItemsBulkActionsProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium">{selectedItems.length} item(s) selected</span>
      <Button onClick={() => onBulkAction('delete')} variant="destructive" size="sm">
        Delete
      </Button>
      <Button onClick={() => onBulkAction('changeQuantity')} variant="secondary" size="sm">
        Change Quantity
      </Button>
      <Button onClick={() => onBulkAction('changePrice')} variant="secondary" size="sm">
        Change Price
      </Button>
    </div>
  )
}