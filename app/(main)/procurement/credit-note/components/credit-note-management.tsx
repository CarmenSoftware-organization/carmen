'use client'

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"  // Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, Plus, Download, Printer, ChevronLeft, ChevronRight, ChevronDown, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/ui/custom-status-badge'

// Mock data for demonstration
const mockCreditNotes = Array(50).fill(null).map((_, index) => ({
  id: index + 1,
  date: `2023-07-${String(index + 1).padStart(2, '0')}`,
  description: `Credit Note ${index + 1}`,
  refNumber: `CN${String(index + 1).padStart(3, '0')}`,
  vendor: `Supplier ${String.fromCharCode(65 + (index % 26))}`,
  docNumber: `INV${index + 123}`,
  docDate: `2023-06-${String(index + 1).padStart(2, '0')}`,
  amount: Math.round(Math.random() * 1000 * 100) / 100,
  status: ['Committed', 'Saved', 'Voided'][index % 3],
}))

export function CreditNoteManagement() {
  const router = useRouter()
  const [creditNotes, setCreditNotes] = useState(mockCreditNotes)
  const [filterStatus, setFilterStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotes, setSelectedNotes] = useState<number[]>([])
  const [sortField, setSortField] = useState<keyof typeof mockCreditNotes[0] | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  const handleCreateCreditNote = () => {
    console.log('Creating new credit note')
  }

  const handleFilterChange = (value: string) => {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handleViewDetails = (id: number) => {
    console.log(`Viewing details of credit note ${id}`)
    router.push(`/procurement/credit-note/${id}`);
  }

  const handleEdit = (id: number) => {
    console.log(`Editing credit note ${id}`)
  }

  const handleDelete = (id: number) => {
    console.log(`Deleting credit note ${id}`)
    setCreditNotes(creditNotes.filter(note => note.id !== id))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(paginatedCreditNotes.map(note => note.id))
    } else {
      setSelectedNotes([])
    }
  }

  const handleSelectNote = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedNotes([...selectedNotes, id])
    } else {
      setSelectedNotes(selectedNotes.filter(noteId => noteId !== id))
    }
  }

  const handleBulkCommit = () => {
    console.log(`Committing credit notes: ${selectedNotes.join(', ')}`)
    setCreditNotes(creditNotes.map(note => 
      selectedNotes.includes(note.id) ? { ...note, status: 'Committed' } : note
    ))
    setSelectedNotes([])
  }

  const handleBulkDelete = () => {
    console.log(`Deleting credit notes: ${selectedNotes.join(', ')}`)
    setCreditNotes(creditNotes.filter(note => !selectedNotes.includes(note.id)))
    setSelectedNotes([])
  }

  const handleSort = (field: keyof typeof mockCreditNotes[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredCreditNotes = creditNotes
    .filter(note => filterStatus === 'All' || note.status === filterStatus)
    .filter(note => 
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const sortedAndFilteredCreditNotes = useMemo(() => {
    let result = filteredCreditNotes

    if (sortField) {
      result = [...result].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [filteredCreditNotes, sortField, sortDirection])

  const totalPages = Math.ceil(sortedAndFilteredCreditNotes.length / itemsPerPage)
  const paginatedCreditNotes = sortedAndFilteredCreditNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="mx-auto py-0">
      <Card className="p-0">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 pt-4">
          <CardTitle className="text-xl lg:text-2xl font-bold">Credit Notes</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" onClick={handleCreateCreditNote}><Plus className="mr-2 h-4 w-4" /> New Credit Note</Button>
            <Button variant="outline" ><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button variant="outline" ><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="w-full sm:w-1/2 flex space-x-2">
              <Input 
                placeholder="Search credit notes..." 
                className="w-full" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Button variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {filterStatus}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handleFilterChange('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('Committed')}>Committed</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('Saved')}>Saved</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFilterChange('Voided')}>Voided</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" /> More Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem>
                    Date Range
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Vendor
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Amount Range
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Bulk actions */}
          {selectedNotes.length > 0 && (
            <div className="flex justify-start mb-4 space-x-2">
              <Button onClick={handleBulkCommit}>
                Commit Selected ({selectedNotes.length})
              </Button>
              <Button onClick={handleBulkDelete} variant="destructive">
                Delete Selected ({selectedNotes.length})
              </Button>
            </div>
          )}

          {/* Credit note list */}
          <div className="space-y-2">
            {paginatedCreditNotes.map((note) => (
              <Card key={note.id} className="overflow-hidden p-0 hover:bg-secondary">
                <div className="py-2 px-4">
                  <div className="flex justify-between items-center mb-0">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                      />
                      <StatusBadge status={note.status} />
                      <h3 className="text-sm md:text-base font-semibold">{note.description}</h3>
                      <span className="text-xs text-muted-foreground">({note.refNumber})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" aria-label="View credit note" onClick={() => handleViewDetails(note.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Edit credit note" onClick={() => handleEdit(note.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete credit note" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 md:gap-2">
                    {[
                      { label: 'Date', value: note.date },
                      { label: 'Vendor', value: note.vendor },
                      { label: 'Doc.#', value: note.docNumber },
                      { label: 'Doc. Date', value: note.docDate },
                      { label: 'Amount', value: `$${note.amount.toFixed(2)}` },
                      { label: 'Status', value: note.status },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto font-medium text-muted-foreground uppercase text-xxs"
                          onClick={() => handleSort(label.toLowerCase() as keyof typeof note)}
                        >
                          {label}
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedAndFilteredCreditNotes.length)} of {sortedAndFilteredCreditNotes.length} results
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}