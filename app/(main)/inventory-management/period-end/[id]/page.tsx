'use client'

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ChevronLeft, Calendar, CheckCircle2, ClipboardList } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PeriodEndDetail {
  id: string
  period: string
  startDate: Date
  endDate: Date
  status: 'open' | 'in_progress' | 'closed'
  completedBy?: string
  completedAt?: Date
  notes?: string
  tasks: {
    id: string
    name: string
    status: 'pending' | 'completed'
    completedBy?: string
    completedAt?: Date
  }[]
  adjustments: {
    id: string
    type: string
    amount: number
    reason: string
    status: string
    createdBy: string
    createdAt: Date
  }[]
}

const mockPeriodEndDetail: PeriodEndDetail = {
  id: "PE-2024-02",
  period: "February 2024",
  startDate: new Date(2024, 1, 1),
  endDate: new Date(2024, 1, 29),
  status: 'in_progress',
  notes: "Physical count in progress",
  tasks: [
    {
      id: "TASK-001",
      name: "Complete Physical Count",
      status: 'completed',
      completedBy: "Jane Smith",
      completedAt: new Date(2024, 1, 25)
    },
    {
      id: "TASK-002",
      name: "Reconcile Inventory Adjustments",
      status: 'pending'
    },
    {
      id: "TASK-003",
      name: "Review Variances",
      status: 'pending'
    },
    {
      id: "TASK-004",
      name: "Post Period End Entries",
      status: 'pending'
    }
  ],
  adjustments: [
    {
      id: "ADJ-001",
      type: "Physical Count Variance",
      amount: -1250.75,
      reason: "Count discrepancy in main warehouse",
      status: "pending",
      createdBy: "John Doe",
      createdAt: new Date(2024, 1, 26)
    },
    {
      id: "ADJ-002",
      type: "Damaged Goods Write-off",
      amount: -750.00,
      reason: "Storm damage to storage area",
      status: "approved",
      createdBy: "Jane Smith",
      createdAt: new Date(2024, 1, 24)
    }
  ]
}

export default function PeriodEndDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  const getStatusBadge = (status: PeriodEndDetail['status']) => {
    const statusStyles = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      closed: "bg-green-100 text-green-800"
    }
    const statusLabels = {
      open: "Open",
      in_progress: "In Progress",
      closed: "Closed"
    }
    return (
      <Badge className={cn(statusStyles[status])}>
        {statusLabels[status]}
      </Badge>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => router.push('/inventory-management/period-end')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">
              Period End - {mockPeriodEndDetail.period}
            </h2>
            {getStatusBadge(mockPeriodEndDetail.status)}
          </div>
          <p className="text-muted-foreground">
            {format(mockPeriodEndDetail.startDate, "PP")} - {format(mockPeriodEndDetail.endDate, "PP")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel Period End</Button>
          <Button>Complete Period End</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Information</CardTitle>
            <CardDescription>Details about the current period end process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Period ID</span>
              <span className="font-medium">{mockPeriodEndDetail.id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{format(mockPeriodEndDetail.startDate, "PP")}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{format(mockPeriodEndDetail.endDate, "PP")}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <span>{getStatusBadge(mockPeriodEndDetail.status)}</span>
            </div>
            {mockPeriodEndDetail.completedBy && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Completed By</span>
                <span className="font-medium">{mockPeriodEndDetail.completedBy}</span>
              </div>
            )}
            {mockPeriodEndDetail.completedAt && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Completed At</span>
                <span className="font-medium">
                  {format(mockPeriodEndDetail.completedAt, "PP")}
                </span>
              </div>
            )}
            {mockPeriodEndDetail.notes && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-medium">{mockPeriodEndDetail.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>Required tasks for period end completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPeriodEndDetail.tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border",
                    task.status === 'completed' ? "bg-green-50" : ""
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={cn(
                        "h-5 w-5",
                        task.status === 'completed'
                          ? "text-green-500"
                          : "text-gray-300"
                      )}
                    />
                    <span className="font-medium">{task.name}</span>
                  </div>
                  {task.status === 'completed' && (
                    <div className="text-sm text-muted-foreground">
                      Completed by {task.completedBy}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="adjustments" className="w-full">
        <TabsList>
          <TabsTrigger value="adjustments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Adjustments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="adjustments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Period End Adjustments</CardTitle>
              <CardDescription>
                View all adjustments made during this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPeriodEndDetail.adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="font-medium">
                        {adjustment.id}
                      </TableCell>
                      <TableCell>{adjustment.type}</TableCell>
                      <TableCell className="text-right">
                        {adjustment.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={adjustment.status === 'approved' ? 'default' : 'secondary'}
                        >
                          {adjustment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{adjustment.createdBy}</TableCell>
                      <TableCell>{format(adjustment.createdAt, "PP")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
