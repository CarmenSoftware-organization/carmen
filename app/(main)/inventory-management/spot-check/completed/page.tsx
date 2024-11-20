"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Clock, 
  Layers, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Building2,
  User,
  Eye,
  Download,
  Calendar,
  Search
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for completed counts
const completedCounts = [
  {
    id: "CNT-20240419-xyz89",
    counter: "John Doe",
    department: "F&B",
    startTime: "2024-04-19 09:00",
    completedTime: "2024-04-19 10:30",
    duration: "1h 30m",
    locations: ["Main Kitchen", "Dry Store"],
    totalItems: 45,
    completedItems: 45,
    matches: 40,
    variances: 5,
    accuracy: 88.9,
    status: "completed",
    notes: "Regular spot check completed with minor variances"
  },
  {
    id: "CNT-20240418-uvw67",
    counter: "Jane Smith",
    department: "Housekeeping",
    startTime: "2024-04-18 14:00",
    completedTime: "2024-04-18 15:15",
    duration: "1h 15m",
    locations: ["Linen Room", "Storage Room"],
    totalItems: 30,
    completedItems: 30,
    matches: 28,
    variances: 2,
    accuracy: 93.3,
    status: "completed",
    notes: "Monthly inventory verification"
  }
]

export default function CompletedCountsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "bg-green-500/10 text-green-500"
    if (accuracy >= 85) return "bg-yellow-500/10 text-yellow-500"
    return "bg-red-500/10 text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Completed Counts</h1>
          <p className="text-muted-foreground">
            View and analyze completed inventory counts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, counter, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {completedCounts.map((count) => (
          <Card key={count.id} className="hover:bg-accent/5 transition-colors">
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{count.id}</h2>
                      <Badge className={getAccuracyColor(count.accuracy)}>
                        {count.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {count.counter}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {count.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/inventory-management/spot-check/completed/${count.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Completed {count.completedTime}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {count.duration}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="h-4 w-4" />
                      Locations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {count.locations.map((loc) => (
                        <Badge key={loc} variant="secondary">
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Counted</span>
                      <span className="font-medium">
                        {count.completedItems}/{count.totalItems}
                      </span>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Matches
                      </span>
                      <span>{count.matches}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Variances
                      </span>
                      <span>{count.variances}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Notes</span>
                      <span className="text-right text-xs max-w-[200px] truncate">
                        {count.notes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 