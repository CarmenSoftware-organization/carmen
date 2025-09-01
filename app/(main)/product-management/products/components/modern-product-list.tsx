'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Upload,
  MoreVertical, 
  Edit, 
  Trash2, 
  List, 
  LayoutGrid,
  Eye,
  Package,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  ImageIcon,
  ShoppingCart,
  Zap
} from "lucide-react"
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { useProducts, useDeleteProduct, useBulkUpdateProductStatus } from '@/lib/hooks'
import { type ProductFilters, type PaginationParams } from '@/lib/api'
import { type Product, type ProductStatus, type ProductType } from '@/lib/types/product'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductListProps {
  initialFilters?: ProductFilters
  showCreateButton?: boolean
  compact?: boolean
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'discontinued', label: 'Discontinued' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'draft', label: 'Draft' }
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'finished_good', label: 'Finished Good' },
  { value: 'semi_finished', label: 'Semi-Finished' },
  { value: 'service', label: 'Service' },
  { value: 'asset', label: 'Asset' },
  { value: 'consumable', label: 'Consumable' }
]

export function ModernProductList({ 
  initialFilters = {},
  showCreateButton = true,
  compact = false
}: ProductListProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Build filters
  const filters: ProductFilters = useMemo(() => {
    const combined: ProductFilters = {
      ...initialFilters
    }

    if (searchQuery.trim()) {
      combined.search = searchQuery.trim()
    }

    if (statusFilter !== 'all') {
      combined.status = [statusFilter as ProductStatus]
    }

    if (typeFilter !== 'all') {
      combined.productType = [typeFilter as ProductType]
    }

    return combined
  }, [initialFilters, searchQuery, statusFilter, typeFilter])

  // Pagination parameters
  const pagination: PaginationParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    sortBy: 'product_name',
    sortOrder: 'asc'
  }), [currentPage, pageSize])

  // API hooks
  const { 
    data: productData, 
    isLoading, 
    error,
    refetch 
  } = useProducts(filters, pagination)

  const deleteProductMutation = useDeleteProduct()
  const bulkUpdateStatusMutation = useBulkUpdateProductStatus()

  // Data from API response
  const products = productData?.products || []
  const totalCount = productData?.total || 0
  const totalPages = productData?.totalPages || 0

  // Handle product selection
  const handleSelectProduct = (productId: string, selected: boolean) => {
    const newSelection = new Set(selectedProducts)
    if (selected) {
      newSelection.add(productId)
    } else {
      newSelection.delete(productId)
    }
    setSelectedProducts(newSelection)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(new Set(products.map(p => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }

  // Handle delete actions
  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProductMutation.mutateAsync(productToDelete)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      // Remove from selection if it was selected
      const newSelection = new Set(selectedProducts)
      newSelection.delete(productToDelete)
      setSelectedProducts(newSelection)
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  // Handle bulk actions
  const handleBulkStatusUpdate = async (status: ProductStatus) => {
    if (selectedProducts.size === 0) return

    try {
      await bulkUpdateStatusMutation.mutateAsync({
        productIds: Array.from(selectedProducts),
        status
      })
      setSelectedProducts(new Set()) // Clear selection
    } catch (error) {
      console.error('Failed to update product statuses:', error)
    }
  }

  // Render status badge
  const renderStatusBadge = (status?: string) => {
    const statusConfig = {
      active: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      inactive: { variant: 'secondary', icon: Clock, color: 'text-gray-600' },
      discontinued: { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      pending_approval: { variant: 'outline', icon: Clock, color: 'text-yellow-600' },
      draft: { variant: 'outline', icon: Edit, color: 'text-blue-600' }
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

  // Render type badge
  const renderTypeBadge = (type?: string) => {
    const typeConfig = {
      raw_material: { variant: 'outline', color: 'text-blue-600', icon: Package },
      finished_good: { variant: 'default', color: 'text-green-600', icon: ShoppingCart },
      semi_finished: { variant: 'secondary', color: 'text-orange-600', icon: Zap },
      service: { variant: 'outline', color: 'text-purple-600', icon: BarChart3 },
      asset: { variant: 'secondary', color: 'text-gray-600', icon: Package },
      consumable: { variant: 'outline', color: 'text-red-600', icon: Zap }
    } as const

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.finished_good
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        {type?.replace('_', ' ').toUpperCase() || 'FINISHED GOOD'}
      </Badge>
    )
  }

  // Render product card
  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.productName}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {product.productName}
                </CardTitle>
                <CardDescription className="text-sm">
                  {product.productCode}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {renderStatusBadge(product.status)}
              {renderTypeBadge(product.productType)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/product-management/products/${product.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/product-management/products/${product.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          {product.description && (
            <p className="text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">
              {product.standardCost 
                ? formatCurrency(product.standardCost.amount, product.standardCost.currencyCode)
                : 'N/A'
              }
            </span>
          </div>
          {product.baseUnit && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Unit:</span>
              <span>{product.baseUnit}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Render table row
  const renderProductRow = (product: Product) => (
    <TableRow key={product.id} className="hover:bg-muted/50">
      <TableCell className="w-12">
        <input
          type="checkbox"
          checked={selectedProducts.has(product.id)}
          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.productName}
              width={32}
              height={32}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium">{product.productName}</div>
            <div className="text-sm text-muted-foreground">{product.productCode}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {renderStatusBadge(product.status)}
          {renderTypeBadge(product.productType)}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {product.category?.name || 'Uncategorized'}
          {product.subcategory && (
            <div className="text-muted-foreground">{product.subcategory.name}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {product.standardCost 
            ? formatCurrency(product.standardCost.amount, product.standardCost.currencyCode)
            : 'N/A'
          }
        </div>
        {product.baseUnit && (
          <div className="text-sm text-muted-foreground">per {product.baseUnit}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {product.createdAt && new Date(product.createdAt).toLocaleDateString()}
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
              <Link href={`/product-management/products/${product.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/product-management/products/${product.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteProduct(product.id)}
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
          placeholder="Search products..."
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

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map(option => (
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
      {selectedProducts.size > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions ({selectedProducts.size})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>
              Mark as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('inactive')}>
              Mark as Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('discontinued')}>
              Mark as Discontinued
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Import */}
      <Button variant="outline" size="sm" asChild>
        <Link href="/product-management/products/import">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Link>
      </Button>

      {/* Export */}
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      {/* Create button */}
      {showCreateButton && (
        <Button asChild>
          <Link href="/product-management/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
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
          <span className="ml-2">Loading products...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Failed to load product data'}
          </p>
          <Button onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )
    }

    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No products match your current filters.'
              : 'Get started by adding your first product.'}
          </p>
          {showCreateButton && (
            <Button asChild>
              <Link href="/product-management/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          )}
        </div>
      )
    }

    if (viewMode === 'card') {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(renderProductCard)}
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
                checked={selectedProducts.size === products.length && products.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status & Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(renderProductRow)}
        </TableBody>
      </Table>
    )
  }

  return (
    <>
      <ListPageTemplate
        title="Products"
        subtitle={`${totalCount} products`}
        actions={actions}
        compact={compact}
      >
        {content()}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
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
      </ListPageTemplate>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProductMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
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

export default ModernProductList