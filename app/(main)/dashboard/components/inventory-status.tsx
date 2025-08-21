'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const inventoryItems = [
  {
    name: "Fresh Produce",
    stock: 85,
    reorderPoint: 20,
    maxStock: 100,
    status: "Optimal",
  },
  {
    name: "Dairy Products",
    stock: 30,
    reorderPoint: 25,
    maxStock: 100,
    status: "Warning",
  },
  {
    name: "Meat & Poultry",
    stock: 60,
    reorderPoint: 30,
    maxStock: 100,
    status: "Optimal",
  },
  {
    name: "Dry Goods",
    stock: 15,
    reorderPoint: 20,
    maxStock: 100,
    status: "Critical",
  },
  {
    name: "Beverages",
    stock: 75,
    reorderPoint: 25,
    maxStock: 100,
    status: "Optimal",
  },
]

export function InventoryStatus() {
  return (
    <div className="grid gap-4">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {inventoryItems.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.stock} units in stock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      item.status === "Critical"
                        ? "text-red-500"
                        : item.status === "Warning"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress
                  value={(item.stock / item.maxStock) * 100}
                  className={`h-2 ${
                    item.status === "Critical"
                      ? "[&>div]:bg-red-500"
                      : item.status === "Warning"
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-green-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {Math.round((item.stock / item.maxStock) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3</div>
            <p className="text-xs text-muted-foreground">Items below reorder point</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">8</div>
            <p className="text-xs text-muted-foreground">Items expiring in 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">All items in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">2</div>
            <p className="text-xs text-muted-foreground">Items above max level</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 