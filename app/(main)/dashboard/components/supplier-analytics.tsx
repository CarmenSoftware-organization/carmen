'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const suppliers = [
  {
    name: "Fresh Foods Co.",
    reliability: 98,
    deliveryTime: 1.2,
    qualityScore: 4.8,
    status: "Excellent",
  },
  {
    name: "Global Dairy Ltd.",
    reliability: 92,
    deliveryTime: 1.5,
    qualityScore: 4.5,
    status: "Good",
  },
  {
    name: "Premium Meats Inc.",
    reliability: 95,
    deliveryTime: 1.3,
    qualityScore: 4.7,
    status: "Excellent",
  },
  {
    name: "Organic Produce LLC",
    reliability: 88,
    deliveryTime: 1.8,
    qualityScore: 4.2,
    status: "Fair",
  },
  {
    name: "Quality Beverages Co.",
    reliability: 94,
    deliveryTime: 1.4,
    qualityScore: 4.6,
    status: "Good",
  },
]

export function SupplierAnalytics() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Reliability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.4%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.4 days</div>
            <p className="text-xs text-muted-foreground">-0.2 days from average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6/5.0</div>
            <p className="text-xs text-muted-foreground">+0.1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Top Suppliers Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Reliability</TableHead>
                <TableHead className="text-right">Delivery Time</TableHead>
                <TableHead className="text-right">Quality Score</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.name}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-right">{supplier.reliability}%</TableCell>
                  <TableCell className="text-right">{supplier.deliveryTime} days</TableCell>
                  <TableCell className="text-right">{supplier.qualityScore}/5.0</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        supplier.status === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : supplier.status === "Good"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 