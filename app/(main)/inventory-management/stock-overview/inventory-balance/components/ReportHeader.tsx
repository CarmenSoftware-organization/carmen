"use client"

import { useState } from "react"
import { Download, FileDown, Printer, Share2, RefreshCw, ListFilter, BarChart4 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BalanceReportParams } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"

interface ReportHeaderProps {
  params: BalanceReportParams
  onViewChange: (view: 'CATEGORY' | 'PRODUCT' | 'LOT') => void
  onValuationMethodChange: (method: 'FIFO' | 'WEIGHTED_AVERAGE') => void
  onShowLotsChange: (showLots: boolean) => void
}

export function ReportHeader({
  params,
  onViewChange,
  onValuationMethodChange,
  onShowLotsChange,
}: ReportHeaderProps) {
  // Handle show lots toggle
  const handleShowLotsChange = (checked: boolean) => {
    onShowLotsChange(checked)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Select 
          value={params.viewType} 
          onValueChange={(value) => onViewChange(value as 'CATEGORY' | 'PRODUCT' | 'LOT')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CATEGORY">By Category</SelectItem>
            <SelectItem value="PRODUCT">By Product</SelectItem>
            <SelectItem value="LOT">By Lot</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={params.valuationMethod} 
          onValueChange={(value) => onValuationMethodChange(value as 'FIFO' | 'WEIGHTED_AVERAGE')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Valuation Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIFO">FIFO</SelectItem>
            <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/inventory-management/stock-overview/stock-cards">
            <BarChart4 className="h-4 w-4 mr-2" />
            Stock Cards
          </Link>
        </Button>
        
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-lots" 
            checked={params.showLots}
            onCheckedChange={handleShowLotsChange}
          />
          <Label htmlFor="show-lots">Show Lots</Label>
        </div>
      </div>
    </>
  )
} 
