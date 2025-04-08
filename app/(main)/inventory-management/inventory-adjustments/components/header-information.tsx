'use client'

import { Calendar, FileText, Hash, ArrowDownUp } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HeaderInformationProps {
  data: {
    id: string
    date: string
    type: string
    location: string
    locationCode: string
    department: string
    reason: string
    description?: string
  }
  isEditMode: boolean
  onUpdate: (field: string, value: string) => void
}

export function HeaderInformation({ data, isEditMode, onUpdate }: HeaderInformationProps) {
  const getMovementTypeDisplay = (type: string) => {
    return type === 'IN' ? 'Stock In' : 'Stock Out'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Reference Number */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          <span>Adjustment Number</span>
        </div>
        <p className="font-medium">{data.id}</p>
      </div>
      
      {/* Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Date</span>
        </div>
        {isEditMode ? (
          <Input
            type="date"
            value={data.date}
            onChange={(e) => onUpdate('date', e.target.value)}
            className="h-8"
          />
        ) : (
          <p className="font-medium">{data.date}</p>
        )}
      </div>
      
      {/* Movement Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowDownUp className="h-4 w-4" />
          <span>Movement Type</span>
        </div>
        <p className="font-medium">{getMovementTypeDisplay(data.type)}</p>
      </div>
      
      
      {/* Reason */}
      <div className="space-y-2 col-span-2 lg:col-span-1 xl:col-span-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Reason</span>
        </div>
        <p className="font-medium col-span-2 no-wrap">{data.reason}</p>
      </div>
      
      {/* Description - Spans full width */}
      <div className="col-span-full space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Description</span>
        </div>
        {isEditMode ? (
          <Input
            value={data.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="h-8"
          />
        ) : (
          <p className="font-medium">{data.description}</p>
        )}
      </div>
    </div>
  )
}
