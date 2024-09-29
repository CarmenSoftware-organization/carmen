'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockRelatedPRItems = [
  {
    id: 'PR001',
    prNumber: 'PR-2024-001',
    department: 'Human Resources',
    requestedQuantity: 10,
    approvedQuantity: 8,
    requestDate: '2024-09-15',
    jobCode: 'HR-001',
  },
  {
    id: 'PR002',
    prNumber: 'PR-2024-002',
    department: 'IT',
    requestedQuantity: 20,
    approvedQuantity: 20,
    requestDate: '2024-09-16',
    jobCode: 'IT-003',
  },
  {
    id: 'PR003',
    prNumber: 'PR-2024-003',
    department: 'Marketing',
    requestedQuantity: 15,
    approvedQuantity: 10,
    requestDate: '2024-09-17',
    jobCode: 'MKT-002',
  },
]

export function PrItemsTable() {
  return (
    <div className="container mx-auto py-10">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Office Chair</h3>
        <p className="text-muted-foreground">Ergonomic office chair with lumbar support</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PR Number</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Requested Qty</TableHead>
            <TableHead className="text-right">Approved Qty</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Job Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRelatedPRItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.prNumber}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell className="text-right">{item.requestedQuantity}</TableCell>
              <TableCell className="text-right">{item.approvedQuantity}</TableCell>
              <TableCell>{item.requestDate}</TableCell>
              <TableCell>{item.jobCode}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}