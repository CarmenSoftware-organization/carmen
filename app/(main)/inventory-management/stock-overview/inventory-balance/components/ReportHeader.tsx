"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, FileDown, Printer, Share2 } from "lucide-react"
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

interface ReportHeaderProps {
  params: BalanceReportParams
  onViewChange: (view: 'CATEGORY' | 'PRODUCT' | 'LOT') => void
  onValuationMethodChange: (method: 'FIFO' | 'WEIGHTED_AVERAGE') => void
}

export function ReportHeader({
  params,
  onViewChange,
  onValuationMethodChange,
}: ReportHeaderProps) {
  const [showLots, setShowLots] = useState(params.showLots)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Handle show lots toggle
  const handleShowLotsChange = (checked: boolean) => {
    setShowLots(checked)
    // We would update the parent component here
  }

  // Get location range text
  const getLocationRangeText = () => {
    const { from, to } = params.locationRange
    if (!from && !to) return "All Locations"
    if (from && !to) return `From: ${from}`
    if (!from && to) return `To: ${to}`
    return `${from} - ${to}`
  }

  // Get category range text
  const getCategoryRangeText = () => {
    const { from, to } = params.categoryRange
    if (!from && !to) return "All Categories"
    if (from && !to) return `From: ${from}`
    if (!from && to) return `To: ${to}`
    return `${from} - ${to}`
  }

  // Get product range text
  const getProductRangeText = () => {
    const { from, to } = params.productRange
    if (!from && !to) return "All Products"
    if (from && !to) return `From: ${from}`
    if (!from && to) return `To: ${to}`
    return `${from} - ${to}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/inventory-management/stock-overview">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Stock Overview</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Balance Report</h1>
            <p className="text-sm text-muted-foreground">
              As of {formatDate(params.asOfDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Export to Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Export to CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-8">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="font-medium mr-1">Date:</span>
            <span>{formatDate(params.asOfDate)}</span>
          </div>
          <div>
            <span className="font-medium mr-1">Location:</span>
            <span>{getLocationRangeText()}</span>
          </div>
          <div>
            <span className="font-medium mr-1">Category:</span>
            <span>{getCategoryRangeText()}</span>
          </div>
          <div>
            <span className="font-medium mr-1">Product:</span>
            <span>{getProductRangeText()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="valuation-method" className="text-sm whitespace-nowrap">
              Valuation:
            </Label>
            <Select
              value={params.valuationMethod}
              onValueChange={(value) => onValuationMethodChange(value as any)}
            >
              <SelectTrigger id="valuation-method" className="h-8 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO</SelectItem>
                <SelectItem value="WEIGHTED_AVERAGE">Weighted Avg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-lots"
              checked={showLots}
              onCheckedChange={handleShowLotsChange}
            />
            <Label htmlFor="show-lots" className="text-sm">
              Show Lots
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
} 
