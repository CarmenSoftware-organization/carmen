"use client"

import { useState, useMemo } from 'react'
import { mockLocations, Location } from '../data/mock-locations'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Edit, Trash2, Table as TableIcon, LayoutGrid, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface SortConfig {
  field: keyof Location
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  search: string
  active: string
  type: string
}

function LocationList() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' })
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [filters, setFilters] = useState<FilterConfig>({
    search: '',
    active: 'all',
    type: 'all'
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null)

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const types = Array.from(new Set(mockLocations.map(loc => loc.type))).sort()
    return { types }
  }, [])

  const handleSort = (field: keyof Location) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleDelete = (id: string) => {
    setDeleteLocationId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deleteLocationId) {
      toast.success('Location deleted successfully')
      setDeleteDialogOpen(false)
      setDeleteLocationId(null)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      active: 'all',
      type: 'all'
    })
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockLocations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           location.type.toLowerCase().includes(filters.search.toLowerCase()) ||
                           location.code.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesActive = filters.active === 'all' || location.isActive.toString() === filters.active
      const matchesType = filters.type === 'all' || location.type === filters.type

      return matchesSearch && matchesActive && matchesType
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [mockLocations, sortConfig, filters])

  const hasActiveFilters = filters.active !== 'all' || filters.type !== 'all'

  const SortIcon = ({ field }: { field: keyof Location }) => {
    if (sortConfig.field !== field) return null
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Header Row - Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">Manage your business locations and their configurations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/system-administration/location-management/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Location
            </Button>
          </Link>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Search and View Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Input
          placeholder="Search locations..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="flex-1 max-w-sm"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {/* Quick Filters */}
          <Select value={filters.active} onValueChange={(value) => setFilters(prev => ({ ...prev, active: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filterOptions.types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}

          {/* View Toggle Buttons */}
          <TooltipProvider>
            <div className="flex gap-1 border rounded bg-muted">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Table View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Card View</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center gap-1">
                    Code
                    {sortConfig.field === 'code' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {sortConfig.field === 'name' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortConfig.field === 'type' && (
                      sortConfig.direction === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>EOP</TableHead>
                <TableHead>Delivery Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.code}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.type}</TableCell>
                  <TableCell>{location.eop === 'true' ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{location.deliveryPoint}</TableCell>
                  <TableCell>
                    <Badge variant={location.isActive ? 'default' : 'secondary'}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/system-administration/location-management/${location.id}/view`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/system-administration/location-management/${location.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(location.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Table Footer */}
          <div className="flex items-center justify-between px-2 py-4 border-t bg-muted/30">
            <span className="text-sm text-muted-foreground">
              Showing {filteredAndSortedData.length} of {mockLocations.length} records
            </span>
            <div className="text-sm text-muted-foreground">
              {/* Future pagination controls can go here */}
            </div>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedData.map((location) => (
            <Card key={location.id} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.code}</p>
                  </div>
                  <Badge variant={location.isActive ? 'default' : 'secondary'}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div>{location.type}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">EOP:</span>
                    <div>{location.eop === 'true' ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Delivery Point:</span>
                  <div>{location.deliveryPoint}</div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Link href={`/system-administration/location-management/${location.id}/view`}>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/system-administration/location-management/${location.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(location.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default LocationList 