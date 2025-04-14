'use client'

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jul",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

const costCenterStats = {
  totalSpent: "$45,231.89",
  monthlyBudget: "$50,000.00",
  remainingBudget: "$4,768.11",
  percentageUsed: "90.46%"
}

export function CostCenter() {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Cost Center Overview</h3>
          <p className="text-sm text-muted-foreground">
            Monthly spending trends and budget utilization
          </p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">{costCenterStats.totalSpent}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Monthly Budget</p>
            <p className="text-2xl font-bold">{costCenterStats.monthlyBudget}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold">{costCenterStats.remainingBudget}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Budget Used</p>
            <p className="text-2xl font-bold">{costCenterStats.percentageUsed}</p>
          </div>
        </div>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Bar
                dataKey="total"
                fill="#adfa1d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
} 