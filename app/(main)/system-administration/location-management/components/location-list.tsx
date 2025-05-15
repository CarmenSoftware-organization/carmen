"use client"

import { useState, useMemo } from 'react'
import { mockLocations, Location } from '../data/mock-locations'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Edit, Trash2, Table as TableIcon, LayoutGrid } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SortConfig {
  field: keyof Location
  direction: 'asc' | 'desc'
}

function LocationList() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'code', direction: 'asc' })
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  function handleSort(field: keyof Location) {
    setSortConfig(prev =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    )
  }

  const filteredLocations = useMemo(() => {
    let data = [...mockLocations]
    if (search.trim()) {
      data = data.filter(loc =>
        loc.code.toLowerCase().includes(search.toLowerCase()) ||
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.department.toLowerCase().includes(search.toLowerCase())
      )
    }
    data.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [search, sortConfig])

  function handleDelete(location: Location) {
    // <COMMENT> Stub: confirm delete
    alert(`Delete: ${location.name}`)
  }

  return (
    <div className="px-2 md:px-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Location Management</h2>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 border rounded bg-muted">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" aria-label="Table view" onClick={() => setViewMode('table')}>
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" aria-label="Card view" onClick={() => setViewMode('card')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="default">Create</Button>
          <Button variant="outline">Print</Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <input
          className="border rounded px-2 py-1 w-64"
          placeholder="Search locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-sm text-muted-foreground">
          Showing {filteredLocations.length} of {mockLocations.length} records
        </span>
      </div>
      {viewMode === 'table' ? (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-bold text-base py-3">Code</TableHead>
                <TableHead className="font-bold text-base py-3">Name</TableHead>
                <TableHead className="font-bold text-base py-3">Type</TableHead>
                <TableHead className="font-bold text-base py-3">EOP</TableHead>
                <TableHead className="font-bold text-base py-3">Delivery Point</TableHead>
                <TableHead className="font-bold text-base py-3">Department</TableHead>
                <TableHead className="font-bold text-base py-3">Active</TableHead>
                <TableHead className="font-bold text-base py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((loc, idx) => (
                <TableRow key={loc.id} className={clsx(!loc.isActive && 'opacity-60', idx % 2 === 0 ? 'bg-white' : 'bg-muted/50')}> 
                  <TableCell className="font-semibold text-primary py-3 align-middle">{loc.code}</TableCell>
                  <TableCell className="font-semibold text-foreground py-3 align-middle">{loc.name}</TableCell>
                  <TableCell className="py-3 align-middle">{loc.type}</TableCell>
                  <TableCell className="py-3 align-middle">{loc.eop}</TableCell>
                  <TableCell className="py-3 align-middle">{loc.deliveryPoint}</TableCell>
                  <TableCell className="py-3 align-middle">{loc.department}</TableCell>
                  <TableCell className="py-3 align-middle">
                    {loc.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center gap-1 py-3 align-middle justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="View" asChild>
                            <Link href={`/system-administration/location-management/${loc.id}/view`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Edit" asChild>
                            <Link href={`/system-administration/location-management/${loc.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map(loc => (
            <Card key={loc.id} className={clsx('p-4 flex flex-col justify-between', !loc.isActive && 'opacity-60')}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-primary">{loc.code}</div>
                  {loc.isActive ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                  )}
                </div>
                <div className="text-base font-semibold text-foreground mb-1">{loc.name}</div>
                <div className="text-sm text-muted-foreground mb-1"><span className="font-medium">Type:</span> {loc.type}</div>
                <div className="text-sm text-muted-foreground mb-1"><span className="font-medium">EOP:</span> {loc.eop}</div>
                <div className="text-sm text-muted-foreground mb-1"><span className="font-medium">Department:</span> {loc.department}</div>
                <div className="text-sm text-muted-foreground mb-1"><span className="font-medium">Delivery Point:</span> {loc.deliveryPoint}</div>
              </div>
              <div className="flex gap-1 mt-4 justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="View" asChild>
                        <Link href={`/system-administration/location-management/${loc.id}/view`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Edit" asChild>
                        <Link href={`/system-administration/location-management/${loc.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export { LocationList } 