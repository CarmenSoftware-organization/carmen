import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StockCard } from "../types"

interface AnalyticsProps {
  data: StockCard
}

export function Analytics({ data }: AnalyticsProps) {
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
              <p className="text-2xl font-bold">2.5x</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Days in Stock
              </span>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                Stock Accuracy
              </span>
              <p className="text-2xl font-bold">98%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 