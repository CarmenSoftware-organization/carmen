'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { BalanceReport, BalanceReportParams, LocationBalance, CategoryBalance, ProductBalance } from '../types'

interface BalanceTableProps {
  params: BalanceReportParams
  report: BalanceReport
  isLoading?: boolean
}

export function BalanceTable({ params, report, isLoading = false }: BalanceTableProps) {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const toggleLocation = (locationId: string) => {
    const newExpanded = new Set(expandedLocations)
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId)
    } else {
      newExpanded.add(locationId)
    }
    setExpandedLocations(newExpanded)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const renderProductRow = (product: ProductBalance) => {
    const isExpanded = expandedProducts.has(product.id)
    const stockStatus = product.totals.quantity < product.thresholds.minimum
      ? 'low'
      : product.totals.quantity > product.thresholds.maximum
      ? 'high'
      : 'normal'

    const statusColor = {
      low: 'bg-red-100 text-red-800',
      normal: 'bg-green-100 text-green-800',
      high: 'bg-yellow-100 text-yellow-800'
    }[stockStatus]

    return (
      <TableRow key={product.id} className="hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              onClick={() => toggleProduct(product.id)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {product.name}
          </div>
        </TableCell>
        <TableCell>{product.code}</TableCell>
        <TableCell>{product.totals.quantity} {product.unit}</TableCell>
        <TableCell>
          <Badge variant="outline" className={statusColor}>
            {stockStatus}
          </Badge>
        </TableCell>
      </TableRow>
    )
  }

  const renderCategoryRow = (category: CategoryBalance) => {
    const isExpanded = expandedCategories.has(category.id)

    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-muted/50">
          <TableCell colSpan={4} className="font-medium">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8"
                onClick={() => toggleCategory(category.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {category.name}
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && category.products.map(renderProductRow)}
      </React.Fragment>
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.locations.map((location) => {
            const isExpanded = expandedLocations.has(location.id)

            return (
              <React.Fragment key={location.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell colSpan={4} className="font-medium">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => toggleLocation(location.id)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      {location.name}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && location.categories.map(renderCategoryRow)}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 
