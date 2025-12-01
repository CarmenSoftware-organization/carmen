"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Package,
  ChevronDown,
  Check,
  Plus,
  Layers,
  Trash2,
  FolderTree,
  Folder,
  FolderOpen,
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

// Category mapping for display names
const categoryNames: Record<string, string> = {
  'cat-oils': 'Oils & Fats',
  'cat-vegetables': 'Vegetables',
  'cat-dry-goods': 'Dry Goods',
  'cat-herbs': 'Herbs & Spices',
  'food-beverage': 'Food & Beverage',
  'supplies': 'Supplies',
  'equipment': 'Equipment',
}

// Subcategory (tag[0]) mapping for display names
const subcategoryNames: Record<string, string> = {
  'oils': 'Cooking Oils',
  'vegetables': 'Fresh Vegetables',
  'dry-goods': 'Dry Goods',
  'herbs': 'Fresh Herbs',
  'meat-poultry': 'Meat & Poultry',
  'seafood': 'Seafood',
  'produce': 'Produce',
  'dairy': 'Dairy Products',
  'cleaning': 'Cleaning Supplies',
  'disposables': 'Disposable Items',
  'kitchen': 'Kitchen Equipment',
  'furniture': 'Furniture',
}

// Item group (tag[1]) mapping for display names
const itemGroupNames: Record<string, string> = {
  'cooking': 'Cooking',
  'fresh': 'Fresh Items',
  'baking': 'Baking',
  'beef-cuts': 'Beef Cuts',
  'poultry-fresh': 'Fresh Poultry',
  'fresh-fish': 'Fresh Fish',
  'shellfish': 'Shellfish',
  'fruits': 'Fruits',
  'milk-cream': 'Milk & Cream',
  'cheese': 'Cheese',
  'detergents': 'Detergents',
  'paper-products': 'Paper Products',
  'plastic-items': 'Plastic Items',
  'prep-equipment': 'Prep Equipment',
  'dining-furniture': 'Dining Furniture',
}

// Tree node structure
interface TreeNode {
  id: string
  name: string
  type: 'category' | 'subcategory' | 'itemGroup' | 'product'
  children?: TreeNode[]
  productId?: string
  product?: typeof mockProducts[0]
}

export function ProductsTab({ locationId, assignments, shelves, isEditing, onShelvesChange }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])

  // Local state for assigned products
  const [localAssignedProducts, setLocalAssignedProducts] = useState<ProductLocationAssignment[]>(assignments)

  // Track which assigned product cards are expanded
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  // Track which tree nodes are expanded
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<string[]>([])

  // Local shelves state
  const [localShelves, setLocalShelves] = useState<Shelf[]>(shelves)

  // Add shelf popover states - track per product
  const [shelfPopoverOpen, setShelfPopoverOpen] = useState<string | null>(null)
  const [showAddShelfFor, setShowAddShelfFor] = useState<string | null>(null)
  const [newShelfForm, setNewShelfForm] = useState<NewShelfForm>({
    code: '',
    name: ''
  })

  // Get assigned product IDs
  const assignedProductIds = useMemo(() => {
    return localAssignedProducts.map(a => a.productId)
  }, [localAssignedProducts])

  // Filter available products (not assigned to this location)
  const availableProducts = useMemo(() => {
    return mockProducts.filter(product =>
      product.isActive && !assignedProductIds.includes(product.id)
    )
  }, [assignedProductIds])

  // Filter by search query - Available
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts
    const query = searchQuery.toLowerCase()
    return availableProducts.filter(product =>
      product.productName.toLowerCase().includes(query) ||
      product.productCode.toLowerCase().includes(query) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [availableProducts, searchQuery])

  // Build tree structure from available products
  const productTree = useMemo(() => {
    const tree: TreeNode[] = []
    const categoryMap = new Map<string, TreeNode>()

    filteredAvailable.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      const subcategory = product.tags?.[0] || 'other'
      const itemGroup = product.tags?.[1] || 'general'

      // Get or create category node
      if (!categoryMap.has(categoryId)) {
        const categoryNode: TreeNode = {
          id: `cat-${categoryId}`,
          name: categoryNames[categoryId] || categoryId,
          type: 'category',
          children: []
        }
        categoryMap.set(categoryId, categoryNode)
        tree.push(categoryNode)
      }
      const categoryNode = categoryMap.get(categoryId)!

      // Get or create subcategory node
      const subcategoryId = `${categoryId}-${subcategory}`
      let subcategoryNode = categoryNode.children?.find(c => c.id === `sub-${subcategoryId}`)
      if (!subcategoryNode) {
        subcategoryNode = {
          id: `sub-${subcategoryId}`,
          name: subcategoryNames[subcategory] || subcategory,
          type: 'subcategory',
          children: []
        }
        categoryNode.children?.push(subcategoryNode)
      }

      // Get or create item group node
      const itemGroupId = `${subcategoryId}-${itemGroup}`
      let itemGroupNode = subcategoryNode.children?.find(c => c.id === `grp-${itemGroupId}`)
      if (!itemGroupNode) {
        itemGroupNode = {
          id: `grp-${itemGroupId}`,
          name: itemGroupNames[itemGroup] || itemGroup,
          type: 'itemGroup',
          children: []
        }
        subcategoryNode.children?.push(itemGroupNode)
      }

      // Add product node
      itemGroupNode.children?.push({
        id: `prod-${product.id}`,
        name: product.productName,
        type: 'product',
        productId: product.id,
        product: product
      })
    })

    return tree
  }, [filteredAvailable])

  // Filter by search query - Assigned
  const filteredAssigned = useMemo(() => {
    if (!searchQuery.trim()) return localAssignedProducts
    const query = searchQuery.toLowerCase()
    return localAssignedProducts.filter(assignment =>
      assignment.productName.toLowerCase().includes(query) ||
      assignment.productCode.toLowerCase().includes(query) ||
      assignment.categoryName.toLowerCase().includes(query)
    )
  }, [localAssignedProducts, searchQuery])

  // Get all product IDs under a tree node
  const getProductIdsUnderNode = (node: TreeNode): string[] => {
    if (node.type === 'product' && node.productId) {
      return [node.productId]
    }
    if (node.children) {
      return node.children.flatMap(child => getProductIdsUnderNode(child))
    }
    return []
  }

  // Check if all products under a node are selected
  const isNodeFullySelected = (node: TreeNode): boolean => {
    const productIds = getProductIdsUnderNode(node)
    return productIds.length > 0 && productIds.every(id => selectedAvailable.includes(id))
  }

  // Check if some (but not all) products under a node are selected
  const isNodePartiallySelected = (node: TreeNode): boolean => {
    const productIds = getProductIdsUnderNode(node)
    const selectedCount = productIds.filter(id => selectedAvailable.includes(id)).length
    return selectedCount > 0 && selectedCount < productIds.length
  }

  // Toggle selection for a tree node (selects/deselects all products under it)
  const toggleNodeSelection = (node: TreeNode) => {
    if (!isEditing) return

    const productIds = getProductIdsUnderNode(node)
    const allSelected = isNodeFullySelected(node)

    if (allSelected) {
      // Deselect all
      setSelectedAvailable(prev => prev.filter(id => !productIds.includes(id)))
    } else {
      // Select all
      setSelectedAvailable(prev => [...new Set([...prev, ...productIds])])
    }
  }

  // Toggle tree node expanded state
  const toggleTreeNode = (nodeId: string) => {
    setExpandedTreeNodes(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    )
  }

  // Toggle selection in available list (single product)
  const toggleAvailableSelection = (productId: string) => {
    if (!isEditing) return
    setSelectedAvailable(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Toggle expanded state for assigned product
  const toggleExpanded = (assignmentId: string) => {
    setExpandedProducts(prev =>
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    )
  }

  // Move selected products from available to assigned
  const assignProducts = () => {
    const productsToAssign = mockProducts.filter(p => selectedAvailable.includes(p.id))

    const newAssignments: ProductLocationAssignment[] = productsToAssign.map(product => ({
      id: `assignment-${Date.now()}-${product.id}`,
      productId: product.id,
      productCode: product.productCode,
      productName: product.productName,
      categoryName: product.tags?.[0] || 'General',
      baseUnit: product.baseUnit,
      locationId: locationId,
      minQuantity: 0,
      maxQuantity: 100,
      reorderPoint: 10,
      parLevel: 20,
      isActive: true,
      isStocked: true,
      assignedAt: new Date(),
      assignedBy: 'Current User'
    }))

    setLocalAssignedProducts(prev => [...prev, ...newAssignments])
    setSelectedAvailable([])

    // Auto-expand newly assigned products
    setExpandedProducts(prev => [...prev, ...newAssignments.map(a => a.id)])
  }

  // Remove a single product from assigned
  const unassignProduct = (assignmentId: string) => {
    setLocalAssignedProducts(prev =>
      prev.filter(assignment => assignment.id !== assignmentId)
    )
    setExpandedProducts(prev => prev.filter(id => id !== assignmentId))
  }

  // Update a specific field for an assigned product
  const updateProductField = (
    assignmentId: string,
    field: keyof ProductLocationAssignment,
    value: string | number | undefined
  ) => {
    setLocalAssignedProducts(prev =>
      prev.map(assignment => {
        if (assignment.id === assignmentId) {
          if (field === 'shelfId') {
            const shelf = localShelves.find(s => s.id === value)
            return {
              ...assignment,
              shelfId: value as string || undefined,
              shelfName: shelf?.name,
            }
          }
          return {
            ...assignment,
            [field]: value,
          }
        }
        return assignment
      })
    )
  }

  const resetNewShelfForm = () => {
    setNewShelfForm({
      code: '',
      name: ''
    })
  }

  const handleAddNewShelf = (forProductId: string) => {
    if (!newShelfForm.code || !newShelfForm.name) return

    const newShelf: Shelf = {
      id: `shelf-new-${Date.now()}`,
      locationId,
      code: newShelfForm.code.toUpperCase(),
      name: newShelfForm.name,
      zoneType: StorageZoneType.DRY,
      sortOrder: localShelves.length + 1,
      isActive: true,
      createdAt: new Date(),
      createdBy: 'Current User'
    }

    const updatedShelves = [...localShelves, newShelf]
    setLocalShelves(updatedShelves)
    onShelvesChange?.(updatedShelves)

    // Auto-select the newly created shelf for this product
    updateProductField(forProductId, 'shelfId', newShelf.id)
    setShowAddShelfFor(null)
    setShelfPopoverOpen(null)
    resetNewShelfForm()
  }

  // Expand all tree nodes
  const expandAllNodes = () => {
    const allNodeIds: string[] = []
    const collectNodeIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allNodeIds.push(node.id)
        if (node.children) {
          collectNodeIds(node.children)
        }
      })
    }
    collectNodeIds(productTree)
    setExpandedTreeNodes(allNodeIds)
  }

  // Collapse all tree nodes
  const collapseAllNodes = () => {
    setExpandedTreeNodes([])
  }

  // Tree Node Component
  const TreeNodeItem = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const isExpanded = expandedTreeNodes.includes(node.id)
    const isFullySelected = isNodeFullySelected(node)
    const isPartiallySelected = isNodePartiallySelected(node)
    const hasChildren = node.children && node.children.length > 0
    const isProduct = node.type === 'product'

    const getIcon = () => {
      if (isProduct) return <Package className="h-4 w-4 text-muted-foreground" />
      if (isExpanded) return <FolderOpen className="h-4 w-4 text-primary" />
      return <Folder className="h-4 w-4 text-muted-foreground" />
    }

    const getProductCount = (): number => {
      return getProductIdsUnderNode(node).length
    }

    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
            isProduct ? "hover:bg-muted/50" : "hover:bg-muted/30",
            depth > 0 && "ml-4"
          )}
        >
          {/* Expand/Collapse button for non-products */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => toggleTreeNode(node.id)}
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          ) : (
            <div className="w-5" />
          )}

          {/* Checkbox */}
          {isEditing && (
            <Checkbox
              checked={isFullySelected}
              ref={(ref) => {
                if (ref && isPartiallySelected) {
                  (ref as HTMLButtonElement).dataset.state = 'indeterminate'
                }
              }}
              className={cn(isPartiallySelected && "opacity-70")}
              onCheckedChange={() => {
                if (isProduct && node.productId) {
                  toggleAvailableSelection(node.productId)
                } else {
                  toggleNodeSelection(node)
                }
              }}
            />
          )}

          {/* Icon */}
          {getIcon()}

          {/* Name */}
          <span
            className={cn(
              "flex-1 text-sm cursor-pointer",
              isProduct ? "font-normal" : "font-medium"
            )}
            onClick={() => {
              if (isProduct && node.productId && isEditing) {
                toggleAvailableSelection(node.productId)
              } else if (hasChildren) {
                toggleTreeNode(node.id)
              }
            }}
          >
            {node.name}
          </span>

          {/* Count badge for non-products */}
          {!isProduct && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {getProductCount()}
            </span>
          )}

          {/* Product details */}
          {isProduct && node.product && (
            <span className="text-xs text-muted-foreground">
              {node.product.productCode} • {node.product.baseUnit}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l border-muted pl-2">
            {node.children?.map(child => (
              <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Assigned Product Card with inline details
  const AssignedProductCard = ({
    assignment,
    isExpanded,
    onToggleExpand
  }: {
    assignment: ProductLocationAssignment
    isExpanded: boolean
    onToggleExpand: () => void
  }) => (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className={cn(
        "rounded-md border transition-colors",
        isExpanded ? "bg-muted/30 border-primary/50" : "hover:bg-muted border-transparent"
      )}>
        {/* Header - always visible */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer">
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{assignment.productName}</div>
              <div className="text-sm text-muted-foreground truncate">
                {assignment.productCode} • {assignment.categoryName}
              </div>
            </div>
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  unassignProduct(assignment.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CollapsibleTrigger>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-3 border-t mt-1">
            {/* Product Info Row */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Unit:</span>{' '}
                <span className="font-medium">{assignment.baseUnit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Shelf:</span>{' '}
                <span className="font-medium">{assignment.shelfName || 'None'}</span>
              </div>
            </div>

            {/* Editable Fields */}
            {isEditing ? (
              <div className="space-y-3">
                {/* Shelf Selector */}
                <div className="space-y-1">
                  <Label className="text-xs">Shelf</Label>
                  <Popover
                    open={shelfPopoverOpen === assignment.id}
                    onOpenChange={(open) => {
                      setShelfPopoverOpen(open ? assignment.id : null)
                      if (!open) {
                        setShowAddShelfFor(null)
                        resetNewShelfForm()
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between font-normal h-8"
                      >
                        {assignment.shelfId
                          ? localShelves.find(s => s.id === assignment.shelfId)?.name || 'Select...'
                          : 'None'}
                        <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <div className="border-b p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-primary h-7 text-xs"
                          onClick={() => setShowAddShelfFor(assignment.id)}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add New Shelf
                        </Button>
                      </div>

                      {showAddShelfFor === assignment.id ? (
                        <div className="p-2 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Layers className="h-3 w-3" />
                            Create New Shelf
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Code (e.g., A1)"
                              className="h-7 uppercase text-xs"
                              value={newShelfForm.code}
                              onChange={(e) => setNewShelfForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            />
                            <Input
                              placeholder="Name (e.g., Shelf A1)"
                              className="h-7 text-xs"
                              value={newShelfForm.name}
                              onChange={(e) => setNewShelfForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="flex justify-end gap-1 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => {
                                setShowAddShelfFor(null)
                                resetNewShelfForm()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-6 text-xs px-2"
                              disabled={!newShelfForm.code || !newShelfForm.name}
                              onClick={() => handleAddNewShelf(assignment.id)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[150px] overflow-y-auto">
                          <div
                            className={cn(
                              "flex items-center px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-sm",
                              !assignment.shelfId && "bg-primary/10"
                            )}
                            onClick={() => {
                              updateProductField(assignment.id, 'shelfId', '')
                              setShelfPopoverOpen(null)
                            }}
                          >
                            <Check className={cn("mr-2 h-3 w-3", !assignment.shelfId ? "opacity-100" : "opacity-0")} />
                            <span className="text-muted-foreground">None</span>
                          </div>
                          {localShelves.map((shelf) => (
                            <div
                              key={shelf.id}
                              className={cn(
                                "flex items-center px-2 py-1.5 cursor-pointer hover:bg-muted/50 text-sm",
                                assignment.shelfId === shelf.id && "bg-primary/10"
                              )}
                              onClick={() => {
                                updateProductField(assignment.id, 'shelfId', shelf.id)
                                setShelfPopoverOpen(null)
                              }}
                            >
                              <Check className={cn("mr-2 h-3 w-3", assignment.shelfId === shelf.id ? "opacity-100" : "opacity-0")} />
                              <span>{shelf.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Quantity Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Min Qty</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8"
                      value={assignment.minQuantity}
                      onChange={(e) => updateProductField(assignment.id, 'minQuantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Qty</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8"
                      value={assignment.maxQuantity}
                      onChange={(e) => updateProductField(assignment.id, 'maxQuantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Reorder Point</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8"
                      value={assignment.reorderPoint}
                      onChange={(e) => updateProductField(assignment.id, 'reorderPoint', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PAR Level</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8"
                      value={assignment.parLevel}
                      onChange={(e) => updateProductField(assignment.id, 'parLevel', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Read-only view */
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Min Qty:</span>{' '}
                  <span className="font-medium">{assignment.minQuantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Qty:</span>{' '}
                  <span className="font-medium">{assignment.maxQuantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reorder:</span>{' '}
                  <span className="font-medium">{assignment.reorderPoint}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PAR:</span>{' '}
                  <span className="font-medium">{assignment.parLevel}</span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, code, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
        {/* Available Products Panel - Tree View */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Available Products
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredAvailable.length})
                </span>
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={expandAllNodes}
                >
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={collapseAllNodes}
                >
                  Collapse
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {productTree.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No products match your search' : 'All products are assigned'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {productTree.map(node => (
                    <TreeNodeItem key={node.id} node={node} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Transfer Buttons */}
        <div className="flex md:flex-col gap-2 justify-center items-center py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={assignProducts}
            disabled={!isEditing || selectedAvailable.length === 0}
            title="Assign selected products"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={true}
            title="Select products to remove using trash icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Assigned Products Panel with Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Assigned Products
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredAssigned.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {filteredAssigned.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No products match your search' : 'No products assigned to this location'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssigned.map(assignment => (
                    <AssignedProductCard
                      key={assignment.id}
                      assignment={assignment}
                      isExpanded={expandedProducts.includes(assignment.id)}
                      onToggleExpand={() => toggleExpanded(assignment.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary */}
      {isEditing && selectedAvailable.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {selectedAvailable.length} product{selectedAvailable.length > 1 ? 's' : ''} selected to assign
        </div>
      )}
    </div>
  )
}
