'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ValueType as RechartsValueType } from 'recharts/types/component/DefaultTooltipContent'

// Sample data - replace with actual product environmental data
const carbonFootprintData = [
  { stage: 'Raw Materials', value: 250 },
  { stage: 'Manufacturing', value: 180 },
  { stage: 'Transportation', value: 120 },
  { stage: 'Usage', value: 300 },
  { stage: 'End of Life', value: 50 }
]

const monthlyImpactData = [
  { month: 'Jan', carbon: 120, water: 350, energy: 280 },
  { month: 'Feb', carbon: 110, water: 320, energy: 260 },
  { month: 'Mar', carbon: 130, water: 380, energy: 290 },
  { month: 'Apr', carbon: 125, water: 360, energy: 275 },
  { month: 'May', carbon: 115, water: 340, energy: 265 },
  { month: 'Jun', carbon: 135, water: 390, energy: 295 }
]

const COLORS = ['#0ea5e9', '#6366f1', '#7dd3fc', '#818cf8', '#a5b4fc']

const formatNumber = (value: RechartsValueType): string => {
  if (typeof value !== 'number') return '0'
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

const tooltipFormatter = (
  value: RechartsValueType,
  name: string
): [string, string] => {
  return [formatNumber(value as number), name]
}

export function EnvironmentImpactTab() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Carbon Footprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">900kg CO₂e</div>
            <p className="text-xs text-muted-foreground">
              Per unit produced
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Water Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,140L</div>
            <p className="text-xs text-muted-foreground">
              Per unit produced
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Energy Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,665 kWh</div>
            <p className="text-xs text-muted-foreground">
              Per unit produced
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon Footprint Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Carbon Footprint Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonFootprintData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {carbonFootprintData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Impact Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyImpactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="carbon" name="Carbon (kg CO₂e)" fill="#0ea5e9" />
                  <Bar dataKey="water" name="Water (L)" fill="#6366f1" />
                  <Bar dataKey="energy" name="Energy (kWh)" fill="#7dd3fc" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 