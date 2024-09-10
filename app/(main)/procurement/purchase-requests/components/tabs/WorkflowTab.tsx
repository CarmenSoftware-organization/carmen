// File: tabs/WorkflowTab.tsx
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const WorkflowTab: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead>Approver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Comments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Department Head Approval</TableCell>
          <TableCell>Jane Smith</TableCell>
          <TableCell>
            <Badge variant="success">Approved</Badge>
          </TableCell>
          <TableCell>2023-07-16</TableCell>
          <TableCell>Approved as per department policy</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Finance Manager Approval</TableCell>
          <TableCell>Mike Johnson</TableCell>
          <TableCell>
            <Badge variant="secondary">Pending</Badge>
          </TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
