'use client'

import { StockCard } from "@/app/(main)/inventory-management/stock-overview/stock-card/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AnalyticsProps {
  data: StockCard
}

export function Analytics({ data }: AnalyticsProps) {
  // Calculate metrics
  const turnoverRate = data.movements.length > 0 ? 
    data.movements.filter(m => m.transactionType === "OUT").length / data.currentStock.totalStock : 0

  const daysInStock = data.movements.length > 0 ? 
    Math.round((new Date().getTime() - new Date(data.movements[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0

  const stockAccuracy = 98 // This would be calculated based on actual vs expected stock levels

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Trends</CardTitle>
          <CardDescription>Historical stock level analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Stock trend chart will be implemented here
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Movement Patterns</CardTitle>
            <CardDescription>Transaction type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Movement pattern chart will be implemented here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value Analysis</CardTitle>
            <CardDescription>Cost and value trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Value analysis chart will be implemented here
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>Performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Turnover Rate
              </span>
              <p className="text-2xl font-bold">{turnoverRate.toFixed(1)}x</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Days in Stock
              </span>
              <p className="text-2xl font-bold">{daysInStock}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Stock Accuracy
              </span>
              <p className="text-2xl font-bold">{stockAccuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 