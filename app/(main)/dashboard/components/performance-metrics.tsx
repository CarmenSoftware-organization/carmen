'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  {
    revenue: 400,
    expenses: 300,
    profit: 100,
  },
  {
    revenue: 450,
    expenses: 320,
    profit: 130,
  },
  {
    revenue: 480,
    expenses: 350,
    profit: 130,
  },
  {
    revenue: 470,
    expenses: 340,
    profit: 130,
  },
  {
    revenue: 540,
    expenses: 380,
    profit: 160,
  },
  {
    revenue: 580,
    expenses: 400,
    profit: 180,
  },
  {
    revenue: 600,
    expenses: 410,
    profit: 190,
  },
]

export function PerformanceMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Order Fulfillment Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98.5%</div>
          <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  strokeWidth={2}
                  dataKey="profit"
                  style={{ stroke: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Supplier On-Time Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">92.3%</div>
          <p className="text-xs text-muted-foreground">-0.4% from last week</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  strokeWidth={2}
                  dataKey="revenue"
                  style={{ stroke: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">99.1%</div>
          <p className="text-xs text-muted-foreground">+0.2% from last week</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  strokeWidth={2}
                  dataKey="expenses"
                  style={{ stroke: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 