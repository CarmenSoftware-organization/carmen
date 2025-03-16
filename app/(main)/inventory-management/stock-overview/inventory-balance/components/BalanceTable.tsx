"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BalanceReport,
  BalanceReportParams,
  CategoryBalance,
  LocationBalance,
  ProductBalance,
  LotBalance
} from "../types"
import { formatCurrency, formatNumber } from "../utils"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Info } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BalanceTableProps {
  params: BalanceReportParams
  report: BalanceReport
  isLoading: boolean
}

export function BalanceTable({ params, report, isLoading }: BalanceTableProps) {
  const router = useRouter()
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({})

  const toggleLocation = (locationId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  // Handle navigation to Stock Card page
  const handleProductClick = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the expand/collapse
    router.push(`/inventory-management/stock-overview/stock-card?productId=${productId}`)
  }

  // Function to determine inventory status based on thresholds
  const getInventoryStatus = (product: ProductBalance) => {
    const { quantity } = product.totals
    const { minimum, maximum } = product.thresholds
    
    if (quantity <= minimum) return "low"
    if (quantity >= maximum) return "high"
    return "normal"
  }

  // Function to render inventory status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "low":
        return <Badge variant="destructive" className="ml-2">Low</Badge>
      case "high":
        return <Badge variant="outline" className="ml-2 bg-amber-500 text-amber-900">High</Badge>
      default:
        return <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Normal</Badge>
    }
  }

  const renderLotRow = (lot: LotBalance, productId: string) => (
    <TableRow key={`${productId}-${lot.lotNumber}`} className="bg-muted/20">
      <TableCell className="pl-12"></TableCell>
      <TableCell>
        <span className="text-xs font-medium">Lot: {lot.lotNumber}</span>
        {lot.expiryDate && (
          <span className="text-xs text-muted-foreground ml-2">
            Expires: {lot.expiryDate}
          </span>
        )}
      </TableCell>
      <TableCell></TableCell>
      <TableCell className="text-right">{formatNumber(lot.quantity)}</TableCell>
      <TableCell className="text-right">{formatCurrency(lot.unitCost)}</TableCell>
      <TableCell className="text-right">{formatCurrency(lot.value)}</TableCell>
    </TableRow>
  )

  const renderProductRow = (product: ProductBalance, categoryId: string) => {
    const isExpanded = expandedProducts[product.id]
    const inventoryStatus = getInventoryStatus(product)
    
    return (
      <>
        <TableRow 
          key={product.id} 
          className="hover:bg-muted/30 cursor-pointer"
          onClick={(e) => {
            if (params.showLots && product.lots.length > 0) {
              toggleProduct(product.id)
            } else {
              handleProductClick(product.id, e)
            }
          }}
          onDoubleClick={(e) => handleProductClick(product.id, e)}
        >
          <TableCell className="pl-8">
            {params.showLots && product.lots.length > 0 && (
              <span className="inline-block mr-2">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            )}
            {product.code}
          </TableCell>
          <TableCell className="flex items-center">
            {product.name}
            {renderStatusBadge(inventoryStatus)}
            {product.tracking.batch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Batch tracked item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </TableCell>
          <TableCell>{product.unit}</TableCell>
          <TableCell className="text-right font-medium">{formatNumber(product.totals.quantity)}</TableCell>
          <TableCell className="text-right">{formatCurrency(product.totals.averageCost)}</TableCell>
          <TableCell className="text-right font-medium">{formatCurrency(product.totals.value)}</TableCell>
        </TableRow>
        {isExpanded && params.showLots && product.lots.map(lot => renderLotRow(lot, product.id))}
      </>
    )
  }

  const renderCategoryRow = (category: CategoryBalance, locationId: string) => {
    const isExpanded = expandedCategories[category.id]
    
    return (
      <>
        <TableRow 
          key={category.id} 
          className="bg-muted/50 hover:bg-muted/60 cursor-pointer"
          onClick={() => toggleCategory(category.id)}
        >
          <TableCell className="pl-4">
            <span className="inline-block mr-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
            {category.code}
          </TableCell>
          <TableCell className="font-medium">{category.name}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right font-medium">{formatNumber(category.totals.quantity)}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right font-medium">{formatCurrency(category.totals.value)}</TableCell>
        </TableRow>
        {isExpanded && category.products.map(product => renderProductRow(product, category.id))}
      </>
    )
  }

  const renderLocationRow = (location: LocationBalance) => {
    const isExpanded = expandedLocations[location.id]
    
    return (
      <>
        <TableRow 
          key={location.id} 
          className="bg-muted hover:bg-muted/80 cursor-pointer"
          onClick={() => toggleLocation(location.id)}
        >
          <TableCell>
            <span className="inline-block mr-2">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
            <span className="font-semibold">{location.name}</span>
          </TableCell>
          <TableCell colSpan={2}></TableCell>
          <TableCell className="text-right font-semibold">{formatNumber(location.totals.quantity)}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right font-semibold">{formatCurrency(location.totals.value)}</TableCell>
        </TableRow>
        {isExpanded && location.categories.map(category => renderCategoryRow(category, location.id))}
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/75">
              <TableHead className="py-3 font-medium text-gray-600">Code</TableHead>
              <TableHead className="py-3 font-medium text-gray-600">Description</TableHead>
              <TableHead className="py-3 font-medium text-gray-600">Unit</TableHead>
              <TableHead className="py-3 font-medium text-gray-600 text-right">Quantity</TableHead>
              <TableHead className="py-3 font-medium text-gray-600 text-right">Unit Cost</TableHead>
              <TableHead className="py-3 font-medium text-gray-600 text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {report.locations.map(renderLocationRow)}
                <TableRow className="bg-primary/10 font-medium">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right font-bold">{formatNumber(report.totals.quantity)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(report.totals.value)}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
