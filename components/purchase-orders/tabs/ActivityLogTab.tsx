import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface ActivityLogEntry {
  date: string
  user: string
  action: string
  details: string
}

interface PurchaseOrderData {
  activityLog?: ActivityLogEntry[]
}

interface ActivityLogTabProps {
  poData?: PurchaseOrderData
}

// Mock data for when no data is provided
const mockActivityLog: ActivityLogEntry[] = [
  {
    date: "2023-07-15",
    user: "John Smith",
    action: "Created",
    details: "Purchase Order created"
  },
  {
    date: "2023-07-16",
    user: "Jane Doe",
    action: "Updated",
    details: "Added 3 items to the order"
  },
  {
    date: "2023-07-17",
    user: "Admin User",
    action: "Approved",
    details: "Purchase Order approved"
  }
];

export default function ActivityLogTab({ poData }: ActivityLogTabProps) {
  // Use provided data or fallback to mock data
  const activityLog = poData?.activityLog || mockActivityLog;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Filter by Date</Label>
          <Input type="date" />
        </div>
        <div>
          <Label>Filter by User</Label>
          <Input placeholder="Enter username" />
        </div>
        <div>
          <Label>Filter by Action</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button className="mt-6">Export Activity Log</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLog.map((activity: ActivityLogEntry, index: number) => (
            <TableRow key={index}>
              <TableCell>{activity.date}</TableCell>
              <TableCell>{activity.user}</TableCell>
              <TableCell>{activity.action}</TableCell>
              <TableCell>{activity.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
