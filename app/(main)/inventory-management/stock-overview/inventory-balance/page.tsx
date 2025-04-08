'use client'

import React, { useEffect, useState } from 'react'
import { ReportHeader } from './components/ReportHeader'
import { FilterPanel } from './components/FilterPanel'
import { BalanceTable } from './components/BalanceTable'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { BalanceReport, BalanceReportParams } from './types'
import { formatCurrency, formatNumber } from './utils'
import { mockBalanceReport } from './mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { MovementHistory } from './components/MovementHistory'

const initialParams: BalanceReportParams = {
  asOfDate: new Date().toISOString().split('T')[0],
  locationRange: { from: '', to: '' },
  categoryRange: { from: '', to: '' },
  productRange: { from: '', to: '' },
  viewType: 'CATEGORY',
  valuationMethod: 'WEIGHTED_AVERAGE',
  showLots: false
}

export default function InventoryBalancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [report, setReport] = useState<BalanceReport>(mockBalanceReport)
  const [params, setParams] = useState<BalanceReportParams>(initialParams)

  // Load mock data with a simulated delay
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setReport(mockBalanceReport)
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleViewChange = (viewType: 'CATEGORY' | 'PRODUCT' | 'LOT') => {
    setParams(prev => ({ ...prev, viewType }))
  }

  const handleValuationMethodChange = (valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE') => {
    setParams(prev => ({ ...prev, valuationMethod }))
  }

  const handleShowLotsChange = (showLots: boolean) => {
    setParams(prev => ({ ...prev, showLots }))
  }

  const handleFilterChange = (updates: Partial<BalanceReportParams>) => {
    setIsLoading(true)
    setParams(prev => ({ ...prev, ...updates }))

    // Simulate API call
    setTimeout(() => {
      setReport(mockBalanceReport)
      setIsLoading(false)
    }, 800)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Render loading skeleton for summary cards
  const renderSummaryCardSkeleton = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header with Summary Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Balance Report</h1>
          <p className="text-sm text-muted-foreground">
            As of {formatDate(params.asOfDate)}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <ReportHeader 
            params={params}
            onViewChange={handleViewChange}
            onValuationMethodChange={handleValuationMethodChange}
            onShowLotsChange={handleShowLotsChange}
          />
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {renderSummaryCardSkeleton()}
            {renderSummaryCardSkeleton()}
            {renderSummaryCardSkeleton()}
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{formatNumber(report.totals.quantity)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-semibold">#</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(report.totals.value)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xl font-semibold">$</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Valuation Method</p>
                    <p className="text-2xl font-bold">{params.valuationMethod === 'FIFO' ? 'FIFO' : 'Weighted Avg'}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 text-xl font-semibold">V</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Filters Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <FilterPanel 
                      params={params}
                      onFilterChange={handleFilterChange}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Tabs defaultValue="balance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="balance">Balance</TabsTrigger>
                <TabsTrigger value="movement">Movement History</TabsTrigger>
              </TabsList>

              <TabsContent value="balance">
                <BalanceTable 
                  params={params}
                  report={report}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="movement">
                <MovementHistory isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
