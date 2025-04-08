import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'


interface GRNData {
  id: string;
  number: string;
  date: string;
  invoiceNumber: string;
  amount: number;
}

interface GRNSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (grn: GRNData) => void
  vendorId: string
}

export function GRNSelection({ isOpen, onClose, onSelect, vendorId }: GRNSelectionProps) {
  const [grnList, setGrnList] = useState<GRNData[]>([])
  const [filteredGrnList, setFilteredGrnList] = useState<GRNData[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Mock function to load GRNs
  const loadGRNs = async () => {
    // TODO: Replace with actual API call
    const mockGRNs: GRNData[] = [
      {
        id: '1',
        number: 'GRN-001',
        date: '2024-03-25',
        invoiceNumber: 'INV-001',
        amount: 1500.00
      },
      {
        id: '2',
        number: 'GRN-002',
        date: '2024-03-24',
        invoiceNumber: 'INV-002',
        amount: 2300.50
      }
    ]
    setGrnList(mockGRNs)
    setFilteredGrnList(mockGRNs)
  }

  useEffect(() => {
    loadGRNs()
  }, [vendorId]) // Add vendorId as dependency since we'll need to reload when it changes

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = grnList.filter(grn => 
      grn.number.toLowerCase().includes(term) || 
      grn.invoiceNumber.toLowerCase().includes(term)
    )
    setFilteredGrnList(filtered)
  }

  const handleGRNSelect = (grn: GRNData) => {
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
