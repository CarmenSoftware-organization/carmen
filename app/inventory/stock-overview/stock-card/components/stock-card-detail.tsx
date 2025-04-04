import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { StockCard } from "@/app/(main)/inventory-management/stock-overview/types"
import { MovementHistory } from "./movement-history"
import { StockStatus } from "./stock-status"
import { Analytics } from "./analytics"

interface StockCardDetailProps {
  data: StockCard
}

export function StockCardDetail({ data }: StockCardDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.itemName}</h1>
          <p className="text-muted-foreground">
            {data.itemCode} • {data.uom}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export</Button>
          <Button variant="outline">Print</Button>
          <Button>Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock on Hand</CardTitle>
            <CardDescription>Total quantity across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.currentStock.totalStock}</div>
            <p className="text-muted-foreground">{data.uom}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value on Hand</CardTitle>
            <CardDescription>Total stock value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.currentStock.valueOnHand.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Cost</CardTitle>
            <CardDescription>Per unit cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.currentStock.averageCost.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </div>
            <p className="text-muted-foreground">per {data.uom}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="w-full">
        <TabsList>
          <TabsTrigger value="movements">Movement History</TabsTrigger>
          <TabsTrigger value="status">Stock Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="movements">
          <MovementHistory movements={data.movements} />
        </TabsContent>
        <TabsContent value="status">
          <StockStatus locations={data.locations} currentStock={data.currentStock} />
        </TabsContent>
        <TabsContent value="analytics">
          <Analytics data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 