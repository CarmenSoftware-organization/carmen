import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"


export default function InventoryOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/inventory/overview/stock-card">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Stock Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View detailed stock information, movement history, and analytics for inventory items
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/overview/inventory-aging">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Inventory Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track the age of inventory items and identify slow-moving stock
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/overview/inventory-balance">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Inventory Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor current inventory levels and stock balances
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
} 