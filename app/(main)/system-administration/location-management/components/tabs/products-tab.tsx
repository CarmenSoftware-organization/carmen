"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Search,
  AlertTriangle,
  X,
  ChevronDown,
  Check,
  Layers,
} from "lucide-react"
import { ProductLocationAssignment, Shelf, StorageZoneType } from "@/lib/types/location-management"
import { mockProducts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ProductsTabProps {
  locationId: string
  assignments: ProductLocationAssignment[]
  shelves: Shelf[]
  isEditing: boolean
  onShelvesChange?: (shelves: Shelf[]) => void
}

// New shelf form state
interface NewShelfForm {
  code: string
  name: string
}

export function ProductsTab({ locationId, assignments, shelves, isEditing, onShelvesChange }: ProductsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ProductLocationAssignment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedShelfId, setSelectedShelfId] = useState('')
  const [editShelfId, setEditShelfId] = useState('')

  // Local shelves state for adding new shelves
  const [localShelves, setLocalShelves] = useState<Shelf[]>(shelves)

  // Add shelf popover states
  const [showAddShelfPopover, setShowAddShelfPopover] = useState(false)
  const [showEditAddShelfPopover, setShowEditAddShelfPopover] = useState(false)
  const [newShelfForm, setNewShelfForm] = useState<NewShelfForm>({
    code: '',
    name: ''
  })

  // Shelf selector popover states
  const [shelfSelectorOpen, setShelfSelectorOpen] = useState(false)
  const [editShelfSelectorOpen, setEditShelfSelectorOpen] = useState(false)

  // Filter assigned products based on search
  const filteredAssignments = assignments.filter(a =>
    a.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get unassigned products from centralized mock data
  const unassignedProducts = useMemo(() => {
    const assignedIds = assignments.map(a => a.productId)
    return mockProducts.filter(p =>
      p.isActive &&
      !assignedIds.includes(p.id)
    )
  }, [assignments])

  // Filter products for selection based on search
  const filteredProductsForSelection = useMemo(() => {
    if (!productSearchQuery) return unassignedProducts
    const query = productSearchQuery.toLowerCase()
    return unassignedProducts.filter(p =>
      p.productName.toLowerCase().includes(query) ||
      p.productCode.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [unassignedProducts, productSearchQuery])

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add the product assignment
    setShowAddDialog(false)
    setSelectedProductId('')
    setSelectedShelfId('')
    setProductSearchQuery('')
  }

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the product assignment
    setEditingAssignment(null)
    setEditShelfId('')
  }

  const handleRemoveProduct = (assignment: ProductLocationAssignment) => {
    if (window.confirm(`Are you sure you want to remove "${assignment.productName}" from this location?`)) {
      // In a real app, this would remove the assignment
    }
  }

  const handleOpenEditDialog = (assignment: ProductLocationAssignment) => {
    setEditingAssignment(assignment)
    setEditShelfId(assignment.shelfId || '')
  }

  const handleCloseEditDialog = () => {
    setEditingAssignment(null)
    setEditShelfId('')
    setShowEditAddShelfPopover(false)
    resetNewShelfForm()
  }

  const handleCloseAddDialog = () => {
    setShowAddDialog(false)
    setSelectedProductId('')
    setSelectedShelfId('')
    setProductSearchQuery('')
    setShowAddShelfPopover(false)
    resetNewShelfForm()
  }

  const resetNewShelfForm = () => {
    setNewShelfForm({
      code: '',
      name: ''
    })
  }

  const handleAddNewShelf = (forEdit: boolean = false) => {
    if (!newShelfForm.code || !newShelfForm.name) return

    const newShelf: Shelf = {
      id: `shelf-new-${Date.now()}`,
      locationId,
      code: newShelfForm.code.toUpperCase(),
      name: newShelfForm.name,
      zoneType: StorageZoneType.DRY, // Default zone type
      sortOrder: localShelves.length + 1, // Append to end
      isActive: true,
      createdAt: new Date(),
      createdBy: 'Current User'
    }

    const updatedShelves = [...localShelves, newShelf]
    setLocalShelves(updatedShelves)
    onShelvesChange?.(updatedShelves)

    // Auto-select the newly created shelf
    if (forEdit) {
      setEditShelfId(newShelf.id)
      setShowEditAddShelfPopover(false)
    } else {
      setSelectedShelfId(newShelf.id)
      setShowAddShelfPopover(false)
    }

    resetNewShelfForm()
  }

  const isLowStock = (assignment: ProductLocationAssignment) => {
    return assignment.currentQuantity !== undefined &&
      assignment.currentQuantity <= assignment.reorderPoint
  }

  // Get selected product details
  const selectedProduct = mockProducts.find(p => p.id === selectedProductId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Products</CardTitle>
            <CardDescription>
              Products stored at this location with inventory parameters
            </CardDescription>
          </div>
          {isEditing && (
            <Dialog open={showAddDialog} onOpenChange={(open) => !open ? handleCloseAddDialog() : setShowAddDialog(true)}>
              <DialogTrigger asChild>
                <Button disabled={unassignedProducts.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleAddProduct}>
                  <DialogHeader>
                    <DialogTitle>Add Product to Location</DialogTitle>
                    <DialogDescription>
                      Search and select a product, then set inventory parameters
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Product Search and Selection */}
                    <div className="space-y-2">
                      <Label>Search Products</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, code, or category..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        {productSearchQuery && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                            onClick={() => setProductSearchQuery('')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Product Selection List */}
                    <div className="space-y-2">
                      <Label>Select Product {selectedProduct && <span className="text-primary">- {selectedProduct.productName}</span>}</Label>
                      <div className="border rounded-md max-h-[200px] overflow-y-auto">
                        {filteredProductsForSelection.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            {productSearchQuery ? 'No products match your search' : 'No products available to assign'}
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredProductsForSelection.slice(0, 20).map((product) => (
                              <div
                                key={product.id}
                                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                                  selectedProductId === product.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                                }`}
                                onClick={() => setSelectedProductId(product.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{product.productName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {product.productCode} | {product.baseUnit}
                                    </div>
                                  </div>
                                  {product.tags && product.tags.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {product.tags[0]}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {filteredProductsForSelection.length > 20 && (
                              <div className="p-2 text-center text-xs text-muted-foreground">
                                Showing 20 of {filteredProductsForSelection.length} products. Refine your search.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shelf">Default Shelf</Label>
                      <Popover open={shelfSelectorOpen} onOpenChange={setShelfSelectorOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={shelfSelectorOpen}
                            className="w-full justify-between font-normal"
                          >
                            {selectedShelfId && selectedShelfId !== 'none'
                              ? localShelves.find(s => s.id === selectedShelfId)?.name || 'Select shelf...'
                              : 'Select shelf (optional)'}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <div className="border-b p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-primary"
                              onClick={() => setShowAddShelfPopover(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Shelf
                            </Button>
                          </div>

                          {showAddShelfPopover ? (
                            <div className="p-3 space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Layers className="h-4 w-4" />
                                Create New Shelf
                              </div>
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Code</Label>
                                  <Input
                                    placeholder="e.g., A1"
                                    className="h-8 uppercase text-sm"
                                    value={newShelfForm.code}
                                    onChange={(e) => setNewShelfForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    placeholder="e.g., Shelf A1"
                                    className="h-8 text-sm"
                                    value={newShelfForm.name}
                                    onChange={(e) => setNewShelfForm(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setShowAddShelfPopover(false)
                                    resetNewShelfForm()
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={!newShelfForm.code || !newShelfForm.name}
                                  onClick={() => handleAddNewShelf(false)}
                                >
                                  Add Shelf
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="max-h-[200px] overflow-y-auto">
                              <div
                                className={cn(
                                  "flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50",
                                  (!selectedShelfId || selectedShelfId === 'none') && "bg-primary/10"
                                )}
                                onClick={() => {
                                  setSelectedShelfId('none')
                                  setShelfSelectorOpen(false)
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", (!selectedShelfId || selectedShelfId === 'none') ? "opacity-100" : "opacity-0")} />
                                <span className="text-muted-foreground">No shelf assigned</span>
                              </div>
                              {localShelves.map((shelf) => (
                                <div
                                  key={shelf.id}
                                  className={cn(
                                    "flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50",
                                    selectedShelfId === shelf.id && "bg-primary/10"
                                  )}
                                  onClick={() => {
                                    setSelectedShelfId(shelf.id)
                                    setShelfSelectorOpen(false)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", selectedShelfId === shelf.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{shelf.name}</div>
                                    <div className="text-xs text-muted-foreground">{shelf.code}</div>
                                  </div>
                                </div>
                              ))}
                              {localShelves.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No shelves available. Add one above.
                                </div>
                              )}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minQty">Min Qty</Label>
                        <Input
                          id="minQty"
                          type="number"
                          min={0}
                          defaultValue={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxQty">Max Qty</Label>
                        <Input
                          id="maxQty"
                          type="number"
                          min={0}
                          defaultValue={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reorderPoint">Reorder Point</Label>
                        <Input
                          id="reorderPoint"
                          type="number"
                          min={0}
                          defaultValue={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parLevel">PAR Level</Label>
                        <Input
                          id="parLevel"
                          type="number"
                          min={0}
                          defaultValue={0}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!selectedProductId}>
                      Add Product
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assigned products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? 'No products match your search' : 'No products assigned to this location'}</p>
              {isEditing && !searchQuery && unassignedProducts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead className="text-right">PAR</TableHead>
                  <TableHead>Status</TableHead>
                  {isEditing && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {assignment.productName}
                          {isLowStock(assignment) && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {assignment.productCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assignment.categoryName}
                    </TableCell>
                    <TableCell>
                      {assignment.shelfName || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {assignment.currentQuantity !== undefined
                        ? `${assignment.currentQuantity} ${assignment.baseUnit}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {assignment.minQuantity}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {assignment.maxQuantity}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {assignment.reorderPoint}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {assignment.parLevel}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isStocked ? 'Stocked' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(assignment)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Parameters
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveProduct(assignment)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent>
          <form onSubmit={handleEditProduct}>
            <DialogHeader>
              <DialogTitle>Edit Product Parameters</DialogTitle>
              <DialogDescription>
                Update inventory parameters for {editingAssignment?.productName}
              </DialogDescription>
            </DialogHeader>
            {editingAssignment && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editShelf">Default Shelf</Label>
                  <Popover open={editShelfSelectorOpen} onOpenChange={setEditShelfSelectorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={editShelfSelectorOpen}
                        className="w-full justify-between font-normal"
                      >
                        {editShelfId && editShelfId !== 'none'
                          ? localShelves.find(s => s.id === editShelfId)?.name || 'Select shelf...'
                          : 'Select shelf (optional)'}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <div className="border-b p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-primary"
                          onClick={() => setShowEditAddShelfPopover(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Shelf
                        </Button>
                      </div>

                      {showEditAddShelfPopover ? (
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Layers className="h-4 w-4" />
                            Create New Shelf
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Code</Label>
                              <Input
                                placeholder="e.g., A1"
                                className="h-8 uppercase text-sm"
                                value={newShelfForm.code}
                                onChange={(e) => setNewShelfForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Name</Label>
                              <Input
                                placeholder="e.g., Shelf A1"
                                className="h-8 text-sm"
                                value={newShelfForm.name}
                                onChange={(e) => setNewShelfForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowEditAddShelfPopover(false)
                                resetNewShelfForm()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={!newShelfForm.code || !newShelfForm.name}
                              onClick={() => handleAddNewShelf(true)}
                            >
                              Add Shelf
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[200px] overflow-y-auto">
                          <div
                            className={cn(
                              "flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50",
                              (!editShelfId || editShelfId === 'none') && "bg-primary/10"
                            )}
                            onClick={() => {
                              setEditShelfId('none')
                              setEditShelfSelectorOpen(false)
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", (!editShelfId || editShelfId === 'none') ? "opacity-100" : "opacity-0")} />
                            <span className="text-muted-foreground">No shelf assigned</span>
                          </div>
                          {localShelves.map((shelf) => (
                            <div
                              key={shelf.id}
                              className={cn(
                                "flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50",
                                editShelfId === shelf.id && "bg-primary/10"
                              )}
                              onClick={() => {
                                setEditShelfId(shelf.id)
                                setEditShelfSelectorOpen(false)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", editShelfId === shelf.id ? "opacity-100" : "opacity-0")} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{shelf.name}</div>
                                <div className="text-xs text-muted-foreground">{shelf.code}</div>
                              </div>
                            </div>
                          ))}
                          {localShelves.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No shelves available. Add one above.
                            </div>
                          )}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMinQty">Min Qty</Label>
                    <Input
                      id="editMinQty"
                      type="number"
                      min={0}
                      defaultValue={editingAssignment.minQuantity}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMaxQty">Max Qty</Label>
                    <Input
                      id="editMaxQty"
                      type="number"
                      min={0}
                      defaultValue={editingAssignment.maxQuantity}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editReorderPoint">Reorder Point</Label>
                    <Input
                      id="editReorderPoint"
                      type="number"
                      min={0}
                      defaultValue={editingAssignment.reorderPoint}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editParLevel">PAR Level</Label>
                    <Input
                      id="editParLevel"
                      type="number"
                      min={0}
                      defaultValue={editingAssignment.parLevel}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
