"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart3,
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  Boxes,
} from "lucide-react"

// Mock data for demonstration
const activeCounts = [
  {
    id: "1",
    zone: "Kitchen",
    counter: "John Doe",
    startTime: "10:30 AM",
    itemsTotal: 25,
    itemsCounted: 18,
    progress: 72,
  },
  {
    id: "2",
    zone: "Storage",
    counter: "Jane Smith",
    startTime: "11:15 AM",
    itemsTotal: 40,
    itemsCounted: 12,
    progress: 30,
  },
]

const pendingReviews = [
  {
    id: "1",
    date: "2024-01-19",
    zone: "Housekeeping",
    counter: "Mike Johnson",
    variances: 3,
    status: "Pending Review",
  },
  {
    id: "2",
    date: "2024-01-19",
    zone: "Kitchen",
    counter: "Sarah Williams",
    variances: 5,
    status: "Pending Approval",
  },
]

const latestActivities = [
  {
    id: "1",
    time: "12:45 PM",
    action: "Count Completed",
    user: "John Doe",
    details: "Kitchen inventory count completed with 2 variances",
  },
  {
    id: "2",
    time: "11:30 AM",
    action: "Count Started",
    user: "Jane Smith",
    details: "Started storage area spot check",
  },
  {
    id: "3",
    time: "10:15 AM",
    action: "Variance Approved",
    user: "Admin User",
    details: "Approved kitchen inventory variances",
  },
]

const stats = [
  {
    title: "Active Counters",
    value: "4",
    icon: Users,
  },
  {
    title: "Items Counted Today",
    value: "245",
    icon: Boxes,
  },
  {
    title: "Pending Reviews",
    value: "8",
    icon: ClipboardList,
  },
]

export default function SpotCheckDashboard() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Spot Check Dashboard"
          description="Monitor active counts, review pending variances, and track spot check activities"
        />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Counts */}
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Active Counts</CardTitle>
              <CardDescription>Currently ongoing spot checks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-6">
                  {activeCounts.map((count) => (
                    <div key={count.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{count.zone}</h4>
                          <p className="text-sm text-muted-foreground">
                            {count.counter}
                          </p>
                        </div>
                        <Badge variant="outline" className="font-normal">
                          {count.progress}% Complete
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Started {count.startTime}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Items Counted: {count.itemsCounted}/{count.itemsTotal}</span>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4">
                <Button className="w-full" variant="outline">
                  View All Active Counts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Counts awaiting review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-6">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{review.zone}</h4>
                          <p className="text-sm text-muted-foreground">
                            {review.counter}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {review.variances} Variances
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {review.date}
                      </div>
                      <Badge variant="outline" className="font-normal">
                        {review.status}
                      </Badge>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4">
                <Button className="w-full" variant="outline">
                  Review All Pending
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Latest Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Activities</CardTitle>
              <CardDescription>Recent spot check actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-6">
                  {latestActivities.map((activity) => (
                    <div key={activity.id} className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {activity.action === "Count Completed" ? (
                            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center bg-green-100 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                            </Badge>
                          ) : activity.action === "Count Started" ? (
                            <Badge variant="default" className="h-6 w-6 p-0 flex items-center justify-center">
                              <PlayCircle className="h-4 w-4" />
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-4 w-4" />
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.user}
                          </p>
                          <p className="text-sm">{activity.details}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
