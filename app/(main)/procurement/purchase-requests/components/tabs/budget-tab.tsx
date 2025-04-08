"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PurchaseRequest } from "@/lib/types"

interface BudgetTabProps {
  purchaseRequest: PurchaseRequest
}

export function BudgetTab({ purchaseRequest }: BudgetTabProps) {
  const hasBudgetInfo = purchaseRequest.items?.some(
    (item) => item.budgetCode || item.department || item.budgetAmount
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Information</CardTitle>
      </CardHeader>
      <CardContent>
        {!purchaseRequest.items || !hasBudgetInfo ? (
          <div className="text-center text-muted-foreground py-4">
            No budget information available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Budget Amount</TableHead>
                <TableHead className="text-right">Used Amount</TableHead>
                <TableHead className="text-right">Remaining Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseRequest.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.budgetCode || "N/A"}</TableCell>
                  <TableCell>{item.department || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {item.budgetAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.usedAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.remainingAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export const ResponsiveBudgetScreen = BudgetTab;