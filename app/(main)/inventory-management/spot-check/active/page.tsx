'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  Layers, 
  CheckCircle,
  AlertTriangle,
  Building2,
  User,
  PlayCircle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCountStore } from "@/lib/store/use-count-store"

export default function ActiveCountsPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const activeCounts = useCountStore((state) => state.activeCounts)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-500/10 text-blue-500">Pending</Badge>
      case "in-progress":
        return <Badge className="bg-green-500/10 text-green-500">In Progress</Badge>
      case "paused":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pending Counts</h1>
          <p className="text-muted-foreground">
            Start or resume your inventory counts
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {activeCounts
          .filter(count => filterStatus === "all" || count.status === filterStatus)
          .map((count) => (
            <Card key={count.id} className="hover:bg-accent/5 transition-colors">
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{count.id}</h2>
                        {getStatusBadge(count.status)}
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
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/inventory-management/spot-check/active/${count.id}`)}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {count.status === 'pending' ? 'Start Count' : 'Resume Count'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Started {count.startTime}
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
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {Math.round((count.completedItems / count.totalItems) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(count.completedItems / count.totalItems) * 100} 
                        className="h-2"
                      />
                      <div className="text-sm text-muted-foreground">
                        {count.completedItems} of {count.totalItems} items
                      </div>
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
                        <span className="text-muted-foreground">Pending</span>
                        <span>{count.pending}</span>
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