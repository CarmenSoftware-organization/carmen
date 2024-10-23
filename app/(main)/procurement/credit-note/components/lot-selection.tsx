import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface Lot {
  id: string
  lotNumber: string
  receiveDate: string
  quantity: number
  expiryDate: string
}

interface LotSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedLots: Lot[]) => void
  availableLots: Lot[]
}

export function LotSelection({ isOpen, onClose, onSave, availableLots }: LotSelectionProps) {
  const [selectedLots, setSelectedLots] = useState<Lot[]>([])

  const handleLotSelection = (lot: Lot, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLots([...selectedLots, lot])
    } else {
      setSelectedLots(selectedLots.filter(l => l.id !== lot.id))
    }
  }

  const handleSave = () => {
    onSave(selectedLots)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Lots</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Lot Number</TableHead>
                <TableHead>Receive Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLots.some(l => l.id === lot.id)}
                      onCheckedChange={(checked) => handleLotSelection(lot, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>{lot.lotNumber}</TableCell>
                  <TableCell>{lot.receiveDate}</TableCell>
                  <TableCell>{lot.quantity}</TableCell>
                  <TableCell>{lot.expiryDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Apply Selected Lots</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
