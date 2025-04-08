'use client'

import React from 'react'
import { Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BalanceReportParams } from '../types'

interface ReportHeaderProps {
  params: BalanceReportParams
  onViewChange: (viewType: 'CATEGORY' | 'PRODUCT' | 'LOT') => void
  onValuationMethodChange: (valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE') => void
  onShowLotsChange: (showLots: boolean) => void
}

export function ReportHeader({ params, onViewChange, onValuationMethodChange, onShowLotsChange }: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Balance Report</h1>
        <p className="text-muted-foreground mt-1">View and analyze your current inventory balances</p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Select Date Range
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
} 
