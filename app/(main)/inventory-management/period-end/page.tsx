'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PeriodEndRecord {
  id: string
  period: string
  startDate: Date
  endDate: Date
  status: 'open' | 'in_progress' | 'closed'
  completedBy?: string
  completedAt?: Date
  notes?: string
}

const mockPeriodEndRecords: PeriodEndRecord[] = [
  {
    id: "PE-2024-01",
    period: "January 2024",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    status: 'closed',
    completedBy: "John Doe",
    completedAt: new Date(2024, 1, 2),
    notes: "All reconciliations completed"
  },
  {
    id: "PE-2024-02",
    period: "February 2024",
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 1, 29),
    status: 'in_progress',
    notes: "Physical count in progress"
  },
  {
    id: "PE-2024-03",
    period: "March 2024",
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2024, 2, 31),
    status: 'open'
  }
]

export default function PeriodEndPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()

  const getStatusBadge = (status: PeriodEndRecord['status']) => {
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
      <Badge className={statusStyles[status]}>
        {statusLabels[status]}
      </Badge>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Period End</h2>
          <p className="text-muted-foreground">
            Manage your inventory period end closings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button>Start New Period</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period End Records</CardTitle>
          <CardDescription>
            View and manage your inventory period end records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed By</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPeriodEndRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/inventory-management/period-end/${record.id}`)}
                >
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{format(record.startDate, "PP")}</TableCell>
                  <TableCell>{format(record.endDate, "PP")}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{record.completedBy || "-"}</TableCell>
                  <TableCell>
                    {record.completedAt ? format(record.completedAt, "PP") : "-"}
                  </TableCell>
                  <TableCell>{record.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
