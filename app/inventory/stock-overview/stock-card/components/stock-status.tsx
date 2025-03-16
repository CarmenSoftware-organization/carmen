import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Location, StockStatus as StockStatusType } from "../types"

interface StockStatusProps {
  locations: Location[]
  currentStock: StockStatusType
}

export function StockStatus({ locations, currentStock }: StockStatusProps) {
  const totalStock = locations.reduce((sum, loc) => sum + loc.stockOnHand, 0)
  const maxStock = currentStock.maxStock || totalStock * 1.2

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
                  {totalStock} / {maxStock}
                </span>
              </div>
              <Progress value={(totalStock / maxStock) * 100} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-yellow-500">
                  Reorder Point
                </span>
                <p className="text-2xl font-bold">
                  {currentStock.reorderPoint || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-red-500">
                  Min Stock
                </span>
                <p className="text-2xl font-bold">
                  {currentStock.minStock || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-green-500">
                  Max Stock
                </span>
                <p className="text-2xl font-bold">
                  {currentStock.maxStock || 'N/A'}
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