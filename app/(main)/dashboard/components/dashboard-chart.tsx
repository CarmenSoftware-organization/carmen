"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", orders: 186, spend: 45000, suppliers: 12 },
  { month: "Feb", orders: 305, spend: 52000, suppliers: 15 },
  { month: "Mar", orders: 237, spend: 48000, suppliers: 13 },
  { month: "Apr", orders: 273, spend: 61000, suppliers: 18 },
  { month: "May", orders: 209, spend: 55000, suppliers: 16 },
  { month: "Jun", orders: 214, spend: 59000, suppliers: 17 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
  spend: {
    label: "Spend (k)",
    color: "hsl(var(--chart-2))",
  },
  suppliers: {
    label: "Suppliers",
    color: "hsl(var(--chart-3))",
  },
}

export function DashboardChart() {
  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      {/* Orders Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Order Trends</CardTitle>
          <CardDescription>
            Monthly purchase orders over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="orders"
                type="natural"
                fill="var(--color-orders)"
                fillOpacity={0.4}
                stroke="var(--color-orders)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Spend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Spend Analysis</CardTitle>
          <CardDescription>
            Monthly procurement spend in thousands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="spend" fill="var(--color-spend)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Supplier Growth */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Supplier Network Growth</CardTitle>
          <CardDescription>
            Active suppliers and order volume correlation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="suppliers"
                type="monotone"
                stroke="var(--color-suppliers)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="orders"
                type="monotone"
                stroke="var(--color-orders)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}