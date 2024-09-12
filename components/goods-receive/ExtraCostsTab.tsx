import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GoodsReceiveNoteMode, ExtraCost, CostType } from '@/lib/types'

interface ExtraCostsTabProps {
  mode: GoodsReceiveNoteMode
  initialCosts: ExtraCost[]
  onCostsChange: (costs: ExtraCost[]) => void
}

export function ExtraCostsTab({ mode, initialCosts, onCostsChange }: ExtraCostsTabProps) {
  const [costs, setCosts] = useState<ExtraCost[]>(initialCosts)
  const [newCostType, setNewCostType] = useState<CostType>('shipping')
  const [newCostAmount, setNewCostAmount] = useState('')

  const addCost = () => {
    if (newCostAmount) {
      const newCost: ExtraCost = {
        id: Date.now().toString(),
        type: newCostType,
        amount: parseFloat(newCostAmount)
      }
      const updatedCosts = [...costs, newCost]
      setCosts(updatedCosts)
      onCostsChange(updatedCosts)
      setNewCostAmount('')
    }
  }

  const deleteCost = (id: string) => {
    const updatedCosts = costs.filter(cost => cost.id !== id)
    setCosts(updatedCosts)
    onCostsChange(updatedCosts)
  }

  const totalExtraCost = costs.reduce((sum, cost) => sum + cost.amount, 0)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Extra Costs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cost Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell>{cost.type}</TableCell>
              <TableCell>{cost.amount.toFixed(2)}</TableCell>
              <TableCell>
                {mode !== 'view' && (
                  <Button variant="destructive" size="sm" onClick={() => deleteCost(cost.id)}>
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {mode !== 'view' && (
            <TableRow>
              <TableCell>
                <Select value={newCostType} onValueChange={(value: CostType) => setNewCostType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="handling">Handling</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button onClick={addCost}>Add</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4">
        <p className="font-semibold">Total Extra Cost: {totalExtraCost.toFixed(2)}</p>
      </div>
    </div>
  )
}