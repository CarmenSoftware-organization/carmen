'use client'

import { MovementRecord } from "@/app/(main)/inventory-management/stock-overview/stock-card/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MovementHistoryProps {
  movements: MovementRecord[]
}

export function MovementHistory({ movements }: MovementHistoryProps) {
  const getMovementTypeColor = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    switch (type) {
      case 'IN':
        return 'bg-green-500/10 text-green-500'
      case 'OUT':
        return 'bg-red-500/10 text-red-500'
      case 'ADJUSTMENT':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Document No</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {format(new Date(movement.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getMovementTypeColor(movement.transactionType)}
                >
                  {movement.transactionType}
                </Badge>
              </TableCell>
              <TableCell>{movement.reference}</TableCell>
              <TableCell>{movement.referenceType}</TableCell>
              <TableCell>{movement.locationName}</TableCell>
              <TableCell className="text-right">
                {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
              </TableCell>
              <TableCell className="text-right">
                {movement.unitCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </TableCell>
              <TableCell className="text-right">
                {movement.valueChange.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </TableCell>
            </TableRow>
          ))}
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No movements found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 