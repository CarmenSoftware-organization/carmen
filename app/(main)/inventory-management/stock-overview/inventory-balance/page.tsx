"use client"

import { useState } from 'react'
import { ReportHeader } from './components/ReportHeader'
import { FilterPanel } from './components/FilterPanel'
import { BalanceTable } from './components/BalanceTable'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import type { BalanceReport, BalanceReportParams } from './types'

export default function InventoryBalancePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<BalanceReport>({
    locations: [],
    totals: {
      quantity: 0,
      value: 0
    }
  })
  
  const [params, setParams] = useState<BalanceReportParams>({
    asOfDate: new Date().toISOString().split('T')[0],
    locationRange: { from: '', to: '' },
    categoryRange: { from: '', to: '' },
    productRange: { from: '', to: '' },
    viewType: 'PRODUCT',
    valuationMethod: 'FIFO',
    showLots: false,
  })

  const handleViewChange = (viewType: 'CATEGORY' | 'PRODUCT' | 'LOT') => {
    setParams(prev => ({ ...prev, viewType }))
  }

  const handleValuationMethodChange = (valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE') => {
    setParams(prev => ({ ...prev, valuationMethod }))
  }

  const handleFilterChange = (filterUpdates: Partial<BalanceReportParams>) => {
    setParams(prev => ({ ...prev, ...filterUpdates }))
  }

  return (
    <div className="space-y-4 p-8">
      <Card>
        <CardContent className="pt-6">
          <ReportHeader 
            params={params}
            onViewChange={handleViewChange}
            onValuationMethodChange={handleValuationMethodChange}
          />
          <Separator className="my-4" />
          <FilterPanel 
            params={params} 
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="balance" className="w-full">
            <TabsList>
              <TabsTrigger value="balance">Balance Report</TabsTrigger>
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
              Movement History Content
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
