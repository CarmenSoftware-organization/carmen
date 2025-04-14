import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "./components/overview"
import { PerformanceMetrics } from "./components/performance-metrics"
import { InventoryStatus } from "./components/inventory-status"
import { SupplierAnalytics } from "./components/supplier-analytics"
import { CostCenter } from "./components/cost-center"
import { ActiveOrders } from "./components/active-orders"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Hotel Supply Chain Dashboard</h2>
      </div>
      <div className="grid gap-4">
        <Overview />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <PerformanceMetrics />
          <InventoryStatus />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <SupplierAnalytics />
          <div className="grid gap-4">
            <CostCenter />
            <ActiveOrders />
          </div>
        </div>
      </div>
    </div>
  )
}