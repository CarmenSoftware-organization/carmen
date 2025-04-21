'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  name: string
}

interface ActivityLogEntry {
  id: string
  userId: string
  activityDate: Date
  activityType: string
  details: string
}

interface ActivityLogProps {
  activities: ActivityLogEntry[]
  users: User[]
}

export function ActivityLog({
  activities,
  users
}: ActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Filter by User</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All activities</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="STATUS_CHANGE">Status Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              type="search"
              placeholder="Search activities..."
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const user = users.find(u => u.id === activity.userId)
              
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    {activity.activityDate.toLocaleString()}
                  </TableCell>
                  <TableCell>{user?.name || 'Unknown User'}</TableCell>
                  <TableCell>{activity.activityType}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 