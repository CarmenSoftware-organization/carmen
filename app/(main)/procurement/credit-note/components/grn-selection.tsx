import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface GRNSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (grn: any) => void
  vendorId: string
}

export function GRNSelection({ isOpen, onClose, onSelect, vendorId }: GRNSelectionProps) {
  const [grnList, setGrnList] = useState<any[]>([])
  const [filteredGrnList, setFilteredGrnList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock GRN data - replace with actual API call
    const mockGRNs = [
      { id: '1', number: 'GRN20240101-001', date: '2024-01-01', invoiceNumber: 'INV001', amount: 10000 },
      { id: '2', number: 'GRN20240102-001', date: '2024-01-02', invoiceNumber: 'INV002', amount: 15000 },
      { id: '3', number: 'GRN20240103-001', date: '2024-01-03', invoiceNumber: 'INV003', amount: 20000 },
      { id: '4', number: 'GRN20240104-001', date: '2024-01-04', invoiceNumber: 'INV004', amount: 12000 },
      { id: '5', number: 'GRN20240105-001', date: '2024-01-05', invoiceNumber: 'INV005', amount: 18000 },
    ]
    setGrnList(mockGRNs)
    setFilteredGrnList(mockGRNs)
  }, [vendorId])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = grnList.filter(grn => 
      grn.number.toLowerCase().includes(term) || 
      grn.invoiceNumber.toLowerCase().includes(term)
    )
    setFilteredGrnList(filtered)
  }

  const handleGRNSelect = (grn: any) => {
    onSelect(grn)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select GRN</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search GRN or Invoice Number"
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrnList.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell>{grn.number}</TableCell>
                  <TableCell>{grn.date}</TableCell>
                  <TableCell>{grn.invoiceNumber}</TableCell>
                  <TableCell>{grn.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleGRNSelect(grn)}>Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
