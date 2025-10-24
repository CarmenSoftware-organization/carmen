'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  List, 
  LayoutGrid,
  Eye,
  Building,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react"
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { useVendors, useDeleteVendor, useBulkUpdateVendorStatus } from '@/lib/hooks'
import { type VendorFilters, type PaginationParams } from '@/lib/api'
import { type Vendor, type VendorStatus } from '@/lib/types/vendor'
import { toast } from 'sonner'

interface VendorListProps {
  initialFilters?: VendorFilters
  showCreateButton?: boolean
  compact?: boolean
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Vendors' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'blacklisted', label: 'Blacklisted' },
  { value: 'under_review', label: 'Under Review' }
]

const BUSINESS_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'consultant', label: 'Consultant' }
]

export function ModernVendorList({ 
  initialFilters = {},
  showCreateButton = true,
  compact = false
}: VendorListProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all')
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Build filters
  const filters: VendorFilters = useMemo(() => {
    const combined: VendorFilters = {
      ...initialFilters
    }

    if (searchQuery.trim()) {
      combined.search = searchQuery.trim()
    }

    if (statusFilter !== 'all') {
      combined.status = [statusFilter as VendorStatus]
    }

    if (businessTypeFilter !== 'all') {
      combined.businessType = [businessTypeFilter as any]
    }

    return combined
  }, [initialFilters, searchQuery, statusFilter, businessTypeFilter])

  // Pagination parameters
  const pagination: PaginationParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    sortBy: 'name',
    sortOrder: 'asc'
  }), [currentPage, pageSize])

  // API hooks
  const { 
    data: vendorData, 
    isLoading, 
    error,
    refetch 
  } = useVendors(filters, pagination)

  const deleteVendorMutation = useDeleteVendor()
  const bulkUpdateStatusMutation = useBulkUpdateVendorStatus()

  // Data from API response
  const vendors = vendorData?.vendors || []
  const totalCount = vendorData?.total || 0
  const totalPages = vendorData?.totalPages || 0

  // Handle vendor selection
  const handleSelectVendor = (vendorId: string, selected: boolean) => {
    const newSelection = new Set(selectedVendors)
    if (selected) {
      newSelection.add(vendorId)
    } else {
      newSelection.delete(vendorId)
    }
    setSelectedVendors(newSelection)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedVendors(new Set(vendors.map(v => v.id)))
    } else {
      setSelectedVendors(new Set())
    }
  }

  // Handle delete actions
  const handleDeleteVendor = (vendorId: string) => {
    setVendorToDelete(vendorId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!vendorToDelete) return

    try {
      await deleteVendorMutation.mutateAsync(vendorToDelete)
      setDeleteDialogOpen(false)
      setVendorToDelete(null)
      // Remove from selection if it was selected
      const newSelection = new Set(selectedVendors)
      newSelection.delete(vendorToDelete)
      setSelectedVendors(newSelection)
    } catch (error) {
      console.error('Failed to delete vendor:', error)
    }
  }

  // Handle bulk actions
  const handleBulkStatusUpdate = async (status: VendorStatus) => {
    if (selectedVendors.size === 0) return

    try {
      await bulkUpdateStatusMutation.mutateAsync({
        vendorIds: Array.from(selectedVendors),
        status
      })
      setSelectedVendors(new Set()) // Clear selection
    } catch (error) {
      console.error('Failed to update vendor statuses:', error)
    }
  }

  // Render status badge
  const renderStatusBadge = (status?: string) => {
    const statusConfig = {
      active: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary', icon: Clock, color: 'text-gray-600' },
      suspended: { variant: 'destructive', icon: AlertTriangle, color: 'text-orange-600' },
      blacklisted: { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      under_review: { variant: 'outline', icon: Clock, color: 'text-yellow-600' }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        {status?.replace('_', ' ').toUpperCase() || 'INACTIVE'}
      </Badge>
    )
  }

  // Render vendor card
  const renderVendorCard = (vendor: Vendor) => (
    <Card key={vendor.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {vendor.companyName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {vendor.businessType || 'Not specified'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {renderStatusBadge(vendor.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/vendor-management/manage-vendors/${vendor.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/vendor-management/manage-vendors/${vendor.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteVendor(vendor.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          {vendor.contacts?.[0]?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{vendor.contacts[0].email}</span>
            </div>
          )}
          {vendor.contacts?.[0]?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{vendor.contacts[0].phone}</span>
            </div>
          )}
          {vendor.addresses?.[0] && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">
                {vendor.addresses[0].city}, {vendor.addresses[0].country}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render table row
  const renderVendorRow = (vendor: Vendor) => (
    <TableRow key={vendor.id} className="hover:bg-muted/50">
      <TableCell className="w-12">
        <input
          type="checkbox"
          checked={selectedVendors.has(vendor.id)}
          onChange={(e) => handleSelectVendor(vendor.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      </TableCell>
      <TableCell>
        <div className="font-medium">{vendor.companyName}</div>
        <div className="text-sm text-muted-foreground">
          {vendor.businessType || 'Not specified'}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {vendor.contacts?.[0]?.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{vendor.contacts[0].email}</span>
            </div>
          )}
          {vendor.contacts?.[0]?.phone && (
            <div className="flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" />
              <span>{vendor.contacts[0].phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {vendor.addresses?.[0] && (
          <div className="text-sm">
            <div>{vendor.addresses[0].city}</div>
            <div className="text-muted-foreground">{vendor.addresses[0].country}</div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {renderStatusBadge(vendor.status)}
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {vendor.establishmentDate && new Date(vendor.establishmentDate).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/vendor-management/manage-vendors/${vendor.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vendor-management/manage-vendors/${vendor.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteVendor(vendor.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  // Actions for the template
  const actions = (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-[300px]"
        />
      </div>

      {/* Filters */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BUSINESS_TYPE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* View mode toggle */}
      <div className="flex items-center border rounded-md">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('table')}
          className="rounded-r-none"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'card' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('card')}
          className="rounded-l-none"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedVendors.size > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions ({selectedVendors.size})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
              Mark as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')}>
              Mark as Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('suspended')}>
              Suspend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Export */}
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      {/* Create button */}
      {showCreateButton && (
        <Button asChild>
          <Link href="/vendor-management/manage-vendors/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Link>
        </Button>
      )}
    </div>
  )

  // Content based on view mode
  const content = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading vendors...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Vendors</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load vendor data'}
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )
    }

    if (vendors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Vendors Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || businessTypeFilter !== 'all'
              ? 'No vendors match your current filters.'
              : 'Get started by adding your first vendor.'}
          </p>
          {showCreateButton && (
            <Button asChild>
              <Link href="/vendor-management/manage-vendors/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Link>
            </Button>
          )}
        </div>
      )
    }

    if (viewMode === 'card') {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendors.map(renderVendorCard)}
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedVendors.size === vendors.length && vendors.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map(renderVendorRow)}
        </TableBody>
      </Table>
    )
  }

  return (
    <>
      <ListPageTemplate
        title="Vendors"
        actionButtons={actions}
        content={
          <>
            {content()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} vendors
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        }
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteVendorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteVendorMutation.isPending}
            >
              {deleteVendorMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ModernVendorList