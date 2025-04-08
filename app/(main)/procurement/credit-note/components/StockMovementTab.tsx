import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StockMovement } from '@/lib/types'


interface StockMovementTabProps {
  movements?: StockMovement[]
}

export function StockMovementTab({ movements = [] }: StockMovementTabProps) {
  if (movements.length === 0) {
    return <div>No stock movements available.</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Stock Movements</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Lot Number</TableHead>
            <TableHead>Inventory Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Extra Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement, index) => (
            <TableRow key={movement.id || index}>
              <TableCell>{movement.toLocation}</TableCell>
              <TableCell>
                <div>{movement.itemName}</div>
                <div className="text-sm text-gray-500">{movement.itemDescription}</div>
              </TableCell>
              <TableCell>{movement.lotNumber}</TableCell>
              <TableCell>{movement.unit}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>{movement.cost}</TableCell>
              <TableCell>{movement.totalCost}</TableCell>
              <TableCell>{movement.netAmount}</TableCell>
              <TableCell>{movement.extraCost}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
