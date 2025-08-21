import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface GoodsReceiveNoteItemsBulkActionsProps {
  selectedItems: string[]
  onBulkAction: (action: string) => void
}

export function GoodsReceiveNoteItemsBulkActions({ selectedItems, onBulkAction }: GoodsReceiveNoteItemsBulkActionsProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-muted/30 border rounded-lg px-4 py-3 mb-4">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
      </span>
      <Button 
        onClick={() => onBulkAction('delete')} 
        variant="destructive" 
        size="sm"
        className="h-8"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  )
}