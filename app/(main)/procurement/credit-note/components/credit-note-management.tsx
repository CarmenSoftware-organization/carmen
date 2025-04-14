'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, Plus, Download, Printer, ChevronLeft, ChevronRight, ChevronDown, FileText, PencilLine, Trash2, LayoutGrid, List, ArrowUpDown, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/ui/custom-status-badge'
import { CreditNote } from '@/lib/types/credit-note'
import { staticCreditNotes } from '@/lib/mock/static-credit-notes'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CreditNoteManagement() {
  const router = useRouter()
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(staticCreditNotes)
  const [filterStatus, setFilterStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotes, setSelectedNotes] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card')
  const itemsPerPage = viewMode === 'card' ? 9 : 10 // Show 9 cards (3x3 grid) or 10 table rows

  // Add sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CreditNote | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc'
  })

  const handleCreateCreditNote = () => {
    console.log('Creating new credit note')
    router.push('/procurement/credit-note/new')
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
    router.push(`/procurement/credit-note/${id}`)
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

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    console.log(`Performing bulk ${action} on credit notes: ${selectedNotes.join(', ')}`)
    if (action === 'delete') {
      setCreditNotes(creditNotes.filter(note => !selectedNotes.includes(note.id)))
    } else {
      setCreditNotes(creditNotes.map(note => 
        selectedNotes.includes(note.id) ? { ...note, status: action === 'approve' ? 'Approved' : 'Rejected' } : note
      ))
    }
    setSelectedNotes([])
  }

  const filteredCreditNotes = creditNotes
    .filter(note => filterStatus === 'All' || note.status === filterStatus)
    .filter(note => 
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const totalPages = Math.ceil(filteredCreditNotes.length / itemsPerPage)
  const paginatedCreditNotes = filteredCreditNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Sorting handler
  const handleSort = (key: keyof CreditNote) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Sort the filtered notes
  const sortedNotes = React.useMemo(() => {
    if (!sortConfig.key) return paginatedCreditNotes

    return [...paginatedCreditNotes].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [paginatedCreditNotes, sortConfig])

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
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md overflow-hidden mr-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none h-8 px-2"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">Table View</span>
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-none h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Card View</span>
                </Button>
              </div>
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
              <Button onClick={() => handleBulkAction('approve')}>
                Approve Selected ({selectedNotes.length})
              </Button>
              <Button onClick={() => handleBulkAction('reject')} variant="secondary">
                Reject Selected ({selectedNotes.length})
              </Button>
              <Button onClick={() => handleBulkAction('delete')} variant="destructive">
                Delete Selected ({selectedNotes.length})
              </Button>
            </div>
          )}

          {/* Credit note list */}
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCreditNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm"
                >
                  <CardContent className="p-0">
                    {/* Card Header */}
                    <div className="p-4 pb-3 bg-muted/30 border-b">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedNotes.includes(note.id)}
                            onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-primary">{note.refNumber}</h3>
                            <p className="text-sm text-muted-foreground">{new Date(note.createdDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StatusBadge status={note.status} />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm line-clamp-2">{note.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Vendor</p>
                          <p className="text-sm font-medium">{note.vendorName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Doc.#</p>
                          <p className="text-sm font-medium">{note.docNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Doc. Date</p>
                          <p className="text-sm">{new Date(note.docDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Net Amount</p>
                          <p className="text-sm">${note.netAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-base font-semibold">${note.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(note.id)}
                            className="h-8 w-8 rounded-full hover:bg-secondary"
                          >
                            <span className="sr-only">View Details</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(note.id)}
                            className="h-8 w-8 rounded-full hover:bg-secondary"
                          >
                            <span className="sr-only">Edit</span>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-secondary"
                              >
                                <span className="sr-only">More options</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(note.id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(note.id)}>
                                <PencilLine className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(note.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedNotes.length === paginatedCreditNotes.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="-ml-3 h-8 data-[state=selected]:bg-muted"
                          onClick={() => handleSort('refNumber')}
                        >
                          Ref Number
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Doc. Number</TableHead>
                    <TableHead>Doc. Date</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                    <TableHead className="text-right">Tax Amount</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNotes.map((note) => (
                    <TableRow key={note.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedNotes.includes(note.id)}
                          onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{note.refNumber}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="truncate">{note.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={note.status} />
                      </TableCell>
                      <TableCell>{note.vendorName}</TableCell>
                      <TableCell>{note.docNumber}</TableCell>
                      <TableCell>{new Date(note.docDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${note.netAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${note.taxAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${note.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(note.id)}
                            className="h-8 w-8 rounded-full hover:bg-secondary"
                          >
                            <span className="sr-only">View Details</span>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(note.id)}
                            className="h-8 w-8 rounded-full hover:bg-secondary"
                          >
                            <span className="sr-only">Edit</span>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-secondary"
                              >
                                <span className="sr-only">More options</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(note.id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(note.id)}>
                                <PencilLine className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(note.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCreditNotes.length)} of {filteredCreditNotes.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
