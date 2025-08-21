'use client'

import { Input } from '@/components/ui/input'
import { Calendar, Hash, Building2, Store, FileText } from 'lucide-react'

interface HeaderInfoProps {
  requisition: any // Replace with proper type
  isEditMode: boolean
  onHeaderUpdate: (field: string, value: string) => void
}

export function HeaderInfo({ requisition, isEditMode, onHeaderUpdate }: HeaderInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Requisition */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Hash className="h-4 w-4" />
          <span>Requisition</span>
        </div>
        <p className="font-medium">{requisition.refNo}</p>
      </div>
      
      {/* Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Date</span>
        </div>
        <p className="font-medium">{requisition.date}</p>
      </div>
      
      {/* Expected Delivery */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Expected Delivery</span>
        </div>
        {isEditMode ? (
          <Input
            type="date"
            value={requisition.expectedDeliveryDate}
            onChange={(e) => onHeaderUpdate('expectedDeliveryDate', e.target.value)}
            className="h-8"
          />
        ) : (
          <p className="font-medium">{requisition.expectedDeliveryDate}</p>
        )}
      </div>
      
      {/* ... Add other fields similarly ... */}
    </div>
  )
} 