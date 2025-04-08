"use client"

import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BulkActionsProps {
  selectedItems: string[]
  onAction: (action: 'approve' | 'reject' | 'delete') => void
}

export function BulkActions({ selectedItems, onAction }: BulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedItems.length} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onAction('approve')}>
            Approve Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('reject')}>
            Reject Selected
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onAction('delete')}
            className="text-red-600"
          >
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 