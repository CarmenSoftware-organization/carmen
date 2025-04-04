"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, XCircle, Filter, Download, Upload } from "lucide-react"
import StatusBadge from "@/components/ui/custom-status-badge"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"

interface Consumption {
  id: string
  date: string
  type: "food" | "beverage" | "other"
  location: string
  items: number
  amount: number
  status: "posted" | "pending" | "failed"
}

const data: Consumption[] = [
  {
    id: "1",
    date: "2024-03-08",
    status: "pending",
    type: "food",
    location: "Main Store",
    items: 12,
    amount: 450.00,
  },
  {
    id: "2",
    date: "2024-03-08",
    status: "posted",
    type: "beverage",
    location: "Branch 1",
    items: 3,
    amount: 75.50,
  },
]

export default function ConsumptionsPage() {
  return (
    <div className="flex-1 space-y-4 px-2 py-4 md:px-4 md:py-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">POS Consumptions</h2>
        <div className="flex items-center space-x-2">
          <Button>Refresh</Button>
          <Button variant="secondary">Export</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Consumptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Consumptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$525.50</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Consumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  )
} 