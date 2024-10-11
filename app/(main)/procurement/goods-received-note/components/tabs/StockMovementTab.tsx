import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GoodsReceiveNoteMode, StockMovement } from '@/lib/types'

interface StockMovementTabProps {
  mode: GoodsReceiveNoteMode
  movements?: StockMovement[]
}

export function StockMovementTab({ mode, movements = [] }: StockMovementTabProps) {
  if (movements.length === 0) {
    return <div>No stock movements available.</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Stock Movements</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Quantity</TableHead>
            {/* <TableHead>From Location</TableHead> */}
            <TableHead>To Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{movement.itemName}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              {/* <TableCell>{movement.fromLocation}</TableCell> */}
              <TableCell>{movement.toLocation}</TableCell>
              <TableCell>{movement.date.toISOString().split('T')[0]}</TableCell>
              <TableCell>{movement.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}