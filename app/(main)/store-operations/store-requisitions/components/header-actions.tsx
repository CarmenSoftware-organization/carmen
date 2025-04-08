"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit2, Printer, XCircle } from 'lucide-react'

interface HeaderActionsProps {
  status: string
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  onBack: () => void
  onPrint?: () => void
  onVoid?: () => void
}

export function HeaderActions({ 
  status,
  isEditMode,
  setIsEditMode,
  onBack,
  onPrint,
  onVoid
}: HeaderActionsProps): React.ReactElement {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Store Requisition Details</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {status}
        </span>
        <div className="flex items-center gap-2">
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit2 className="h-4 w-4" />
            {isEditMode ? 'Cancel Edit' : 'Edit'}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-600"
            onClick={onVoid}
          >
            <XCircle className="h-4 w-4" />
            Void
          </Button>
        </div>
      </div>
    </div>
  )
} 