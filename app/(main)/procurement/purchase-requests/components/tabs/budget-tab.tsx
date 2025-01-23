'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const budgetData = [
  {
    location: "Front Office",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 1000.00,
    softCommitmentPO: 3000.00,
    hardCommitment: 2000.00,
    availableBudget: 14000.00,
    currentPRAmount: 15000.00,
  },
  {
    location: "Accounting",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 13000.00,
  },
  {
    location: "HouseKeeping",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 10000.00,
  },
]

export function ResponsiveBudgetScreen() {
  return (
    <div className="p-2 bg-white dark:bg-gray-800 ">
      {/* Table view for larger screens */}
      <div className="hidden md:block">
        <Table className="text-xs bg-white dark:bg-gray-800">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead className="font-medium py-1 px-2">Location</TableHead>
              <TableHead className="font-medium py-1 px-2">Budget Category</TableHead>
              <TableHead className="font-medium py-1 px-2">Total Budget</TableHead>
              <TableHead className="font-medium py-1 px-2" colSpan={2}>Soft Commitment</TableHead>
              <TableHead className="font-medium py-1 px-2">Hard Commitment</TableHead>
              <TableHead className="font-medium py-1 px-2">Available Budget</TableHead>
              <TableHead className="font-medium py-1 px-2">Current PR Amount</TableHead>
            </TableRow>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="font-medium py-1 px-2">Dept. Head Approve PR</TableHead>
              <TableHead className="font-medium py-1 px-2">PO</TableHead>
              <TableHead className="font-medium py-1 px-2">Actual GL</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetData.map((row, index) => (
              <TableRow key={index} className="border-b border-gray-200">
                <TableCell className="py-1 px-2">{row.location}</TableCell>
                <TableCell className="py-1 px-2">{row.category}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.totalBudget.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.softCommitmentDeptHead.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.softCommitmentPO.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.hardCommitment.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.availableBudget.toFixed(2)}</TableCell>
                <TableCell className="py-1 px-2 text-right">{row.currentPRAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Card view for mobile screens */}
      <div className="md:hidden space-y-4">
        {budgetData.map((row, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{row.location} - {row.category}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Total Budget:</div>
                <div className="text-right">{row.totalBudget.toFixed(2)}</div>
                <div className="font-medium">Soft Commitment (Dept. Head):</div>
                <div className="text-right">{row.softCommitmentDeptHead.toFixed(2)}</div>
                <div className="font-medium">Soft Commitment (PO):</div>
                <div className="text-right">{row.softCommitmentPO.toFixed(2)}</div>
                <div className="font-medium">Hard Commitment (Actual GL):</div>
                <div className="text-right">{row.hardCommitment.toFixed(2)}</div>
                <div className="font-medium">Available Budget:</div>
                <div className="text-right">{row.availableBudget.toFixed(2)}</div>
                <div className="font-medium">Current PR Amount:</div>
                <div className="text-right">{row.currentPRAmount.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}