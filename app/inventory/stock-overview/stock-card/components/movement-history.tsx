import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Movement } from "../types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface MovementHistoryProps {
  movements: Movement[]
}

export function MovementHistory({ movements }: MovementHistoryProps) {
  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'GRN':
        return 'bg-green-500/10 text-green-500'
      case 'ISSUE':
        return 'bg-red-500/10 text-red-500'
      case 'TRANSFER':
        return 'bg-blue-500/10 text-blue-500'
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
            <TableRow key={movement.transactionId}>
              <TableCell>
                {format(new Date(movement.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getMovementTypeColor(movement.type)}
                >
                  {movement.type}
                </Badge>
              </TableCell>
              <TableCell>{movement.documentNo}</TableCell>
              <TableCell>{movement.reference}</TableCell>
              <TableCell>{movement.location}</TableCell>
              <TableCell className="text-right">
                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
              </TableCell>
              <TableCell className="text-right">
                {movement.unitCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </TableCell>
              <TableCell className="text-right">
                {movement.totalCost.toLocaleString('en-US', {
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