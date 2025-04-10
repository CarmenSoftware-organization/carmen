'use client'

import { Progress } from "@/components/ui/progress"
import { StockCard } from "@/app/(main)/inventory-management/stock-overview/stock-card/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
<<<<<<< HEAD
=======
import { Progress } from "@/components/ui/progress"
import { Location, StockStatus as StockStatusType } from "../types"
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)

interface StockStatusProps {
  locations: StockCard['locations']
  currentStock: StockCard['currentStock']
  minStock: number
  maxStock: number
  reorderPoint?: number
}

<<<<<<< HEAD
export function StockStatus({ locations, currentStock, minStock, maxStock, reorderPoint }: StockStatusProps) {
  const totalStock = currentStock.totalStock
  const effectiveMaxStock = Math.max(totalStock * 1.2, maxStock)
=======
export function StockStatus({ locations, currentStock }: StockStatusProps) {
  const totalStock = locations.reduce((sum, loc) => sum + loc.stockOnHand, 0)
  const maxStock = currentStock.maxStock || totalStock * 1.2
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>Current stock levels and thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Stock</span>
                <span className="text-sm text-muted-foreground">
                  {totalStock} / {effectiveMaxStock}
                </span>
              </div>
              <Progress value={(totalStock / effectiveMaxStock) * 100} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-yellow-500">
                  Reorder Point
                </span>
                <p className="text-2xl font-bold">
<<<<<<< HEAD
                  {reorderPoint || 'N/A'}
=======
                  {currentStock.reorderPoint || 'N/A'}
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-red-500">
                  Min Stock
                </span>
                <p className="text-2xl font-bold">
<<<<<<< HEAD
                  {minStock || 'N/A'}
=======
                  {currentStock.minStock || 'N/A'}
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-green-500">
                  Max Stock
                </span>
                <p className="text-2xl font-bold">
<<<<<<< HEAD
                  {maxStock || 'N/A'}
=======
                  {currentStock.maxStock || 'N/A'}
>>>>>>> parent of 08bc5ce (feat: enhance stock card functionality with loading states and new types)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Breakdown</CardTitle>
          <CardDescription>Stock distribution across locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {location.stockOnHand}
                  </span>
                </div>
                <Progress 
                  value={(location.stockOnHand / totalStock) * 100} 
                  className="h-2"
                />
                <div className="grid grid-cols-2 gap-4 pt-1 text-sm text-muted-foreground">
                  <div>
                    Reserved: {location.reservedStock}
                  </div>
                  <div className="text-right">
                    Available: {location.availableStock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 