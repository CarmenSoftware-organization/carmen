import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActivityLogTab({ poData }: { poData: any }) {
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
          {poData.activityLog && poData.activityLog.map((activity: any, index: number) => (
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
