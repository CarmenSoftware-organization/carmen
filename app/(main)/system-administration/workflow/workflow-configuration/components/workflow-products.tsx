'use client'
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Plus, Save, X, ChevronRight, ChevronDown, Package, Folder } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  code: string
  category: string
  subCategory?: string
  itemGroup?: string
  isAssigned?: boolean
}

interface TreeNode {
  id: string
  name: string
  type: 'category' | 'subCategory' | 'itemGroup' | 'product'
  children?: TreeNode[]
  isSelected?: boolean
  isExpanded?: boolean
  isIndeterminate?: boolean
  product?: Product
}

interface WorkflowProductsProps {
  products: Product[]
  isEditing: boolean
  onSave: (products: Product[]) => void
}

const mockProducts: Product[] = [
  // Guest Room Supplies
  { id: 1, name: "Bath Towels", code: "BTH", category: "Guest Room Supplies", subCategory: "Linens", itemGroup: "Towels" },
  { id: 2, name: "Bed Sheets", code: "BDS", category: "Guest Room Supplies", subCategory: "Linens", itemGroup: "Bedding" },
  { id: 3, name: "Pillows", code: "PLW", category: "Guest Room Supplies", subCategory: "Linens", itemGroup: "Bedding" },
  { id: 4, name: "Toiletries Set", code: "TLT", category: "Guest Room Supplies", subCategory: "Amenities", itemGroup: "Bathroom" },
  { id: 5, name: "Coffee & Tea Set", code: "CTS", category: "Guest Room Supplies", subCategory: "Amenities", itemGroup: "Refreshments" },
  { id: 6, name: "Room Slippers", code: "SLP", category: "Guest Room Supplies", subCategory: "Amenities", itemGroup: "Comfort" },

  // Cleaning & Maintenance
  { id: 7, name: "All-Purpose Cleaner", code: "APC", category: "Cleaning & Maintenance", subCategory: "Cleaning Supplies", itemGroup: "Chemicals" },
  { id: 8, name: "Glass Cleaner", code: "GLC", category: "Cleaning & Maintenance", subCategory: "Cleaning Supplies", itemGroup: "Chemicals" },
  { id: 9, name: "Disinfectant", code: "DSF", category: "Cleaning & Maintenance", subCategory: "Cleaning Supplies", itemGroup: "Chemicals" },
  { id: 10, name: "Vacuum Bags", code: "VCB", category: "Cleaning & Maintenance", subCategory: "Equipment Supplies", itemGroup: "Accessories" },
  { id: 11, name: "Mop Heads", code: "MPH", category: "Cleaning & Maintenance", subCategory: "Equipment Supplies", itemGroup: "Accessories" },
  { id: 12, name: "Cleaning Cloths", code: "CCL", category: "Cleaning & Maintenance", subCategory: "Equipment Supplies", itemGroup: "Accessories" },

  // Kitchen & F&B
  { id: 13, name: "Cooking Oil", code: "OIL", category: "Kitchen & F&B", subCategory: "Dry Goods", itemGroup: "Cooking" },
  { id: 14, name: "Rice", code: "RCE", category: "Kitchen & F&B", subCategory: "Dry Goods", itemGroup: "Staples" },
  { id: 15, name: "Coffee Beans", code: "CFB", category: "Kitchen & F&B", subCategory: "Beverages", itemGroup: "Coffee" },
  { id: 16, name: "Tea Bags", code: "TEA", category: "Kitchen & F&B", subCategory: "Beverages", itemGroup: "Tea" },
  { id: 17, name: "Kitchen Towels", code: "KTW", category: "Kitchen & F&B", subCategory: "Kitchen Supplies", itemGroup: "Cleaning" },
  { id: 18, name: "Food Containers", code: "CNT", category: "Kitchen & F&B", subCategory: "Kitchen Supplies", itemGroup: "Storage" },

  // Office Supplies
  { id: 19, name: "Printer Paper", code: "PPR", category: "Office Supplies", subCategory: "Paper Products", itemGroup: "Printing" },
  { id: 20, name: "Ink Cartridges", code: "INK", category: "Office Supplies", subCategory: "Printing Supplies", itemGroup: "Consumables" },
  { id: 21, name: "Pens", code: "PEN", category: "Office Supplies", subCategory: "Writing Supplies", itemGroup: "Stationery" },
  { id: 22, name: "Notebooks", code: "NTB", category: "Office Supplies", subCategory: "Writing Supplies", itemGroup: "Stationery" },
  { id: 23, name: "File Folders", code: "FLD", category: "Office Supplies", subCategory: "Filing", itemGroup: "Organization" },
  { id: 24, name: "Staplers", code: "STP", category: "Office Supplies", subCategory: "Desktop Items", itemGroup: "Tools" },

  // Engineering & Maintenance
  { id: 25, name: "Light Bulbs", code: "LBL", category: "Engineering & Maintenance", subCategory: "Electrical", itemGroup: "Lighting" },
  { id: 26, name: "Air Filters", code: "AFT", category: "Engineering & Maintenance", subCategory: "HVAC", itemGroup: "Filters" },
  { id: 27, name: "Paint", code: "PNT", category: "Engineering & Maintenance", subCategory: "Building Materials", itemGroup: "Finishing" },
  { id: 28, name: "Plumbing Parts", code: "PLM", category: "Engineering & Maintenance", subCategory: "Plumbing", itemGroup: "Repairs" },

  // Safety & Security
  { id: 29, name: "First Aid Kits", code: "FAK", category: "Safety & Security", subCategory: "Safety Equipment", itemGroup: "Medical" },
  { id: 30, name: "Fire Extinguishers", code: "FEX", category: "Safety & Security", subCategory: "Fire Safety", itemGroup: "Equipment" },
  { id: 31, name: "Safety Signs", code: "SGN", category: "Safety & Security", subCategory: "Signage", itemGroup: "Information" },
  { id: 32, name: "Security Badges", code: "BDG", category: "Safety & Security", subCategory: "Access Control", itemGroup: "ID" }
]

function buildProductTree(products: Product[]): TreeNode[] {
  const categories = new Map<string, TreeNode>()
  const subCategories = new Map<string, TreeNode>()
  const itemGroups = new Map<string, TreeNode>()

  products.forEach(product => {
    // Create category node if it doesn't exist
    if (!categories.has(product.category)) {
      categories.set(product.category, {
        id: `category-${product.category}`,
        name: product.category,
        type: 'category',
        children: [],
        isExpanded: true,
        isSelected: false,
      })
    }

    // Create subcategory node if it doesn't exist
    const subCategoryKey = `${product.category}-${product.subCategory}`
    if (!subCategories.has(subCategoryKey) && product.subCategory) {
      subCategories.set(subCategoryKey, {
        id: `subcategory-${subCategoryKey}`,
        name: product.subCategory,
        type: 'subCategory',
        children: [],
        isExpanded: true,
        isSelected: false,
      })
      categories.get(product.category)?.children?.push(subCategories.get(subCategoryKey)!)
    }

    // Create item group node if it doesn't exist
    const itemGroupKey = `${subCategoryKey}-${product.itemGroup}`
    if (!itemGroups.has(itemGroupKey) && product.itemGroup) {
      itemGroups.set(itemGroupKey, {
        id: `itemgroup-${itemGroupKey}`,
        name: product.itemGroup,
        type: 'itemGroup',
        children: [],
        isExpanded: true,
        isSelected: false,
      })
      subCategories.get(subCategoryKey)?.children?.push(itemGroups.get(itemGroupKey)!)
    }

    // Add product to its item group
    const productNode: TreeNode = {
      id: `product-${product.id}`,
      name: product.name,
      type: 'product',
      isSelected: product.isAssigned,
      product: product,
    }
    itemGroups.get(itemGroupKey)?.children?.push(productNode)
  })

  return Array.from(categories.values())
}

function updateNodeSelection(node: TreeNode, isSelected: boolean): void {
  node.isSelected = isSelected
  node.isIndeterminate = false
  node.children?.forEach(child => updateNodeSelection(child, isSelected))
}

function updateParentSelection(nodes: TreeNode[]): boolean {
  if (nodes.length === 0) return false

  const selectedCount = nodes.filter(node => node.isSelected).length
  const indeterminateCount = nodes.filter(node => node.isIndeterminate).length

  if (selectedCount === nodes.length) {
    return true
  } else if (selectedCount === 0 && indeterminateCount === 0) {
    return false
  } else {
    return false // Parent will be marked indeterminate
  }
}

export function WorkflowProducts({ 
  products: initialProducts = [], 
  isEditing: parentIsEditing,
  onSave 
}: WorkflowProductsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [productTree, setProductTree] = useState<TreeNode[]>(() => {
    const allProducts = mockProducts.map(p => ({
      ...p,
      isAssigned: initialProducts.some(ip => ip.id === p.id)
    }))
    return buildProductTree(allProducts)
  })
  const [isProductEditing, setIsProductEditing] = useState(false)

  useEffect(() => {
    if (!parentIsEditing) {
      setIsProductEditing(false)
    }
  }, [parentIsEditing])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleNodeToggle = (node: TreeNode) => {
    node.isExpanded = !node.isExpanded
    setProductTree([...productTree])
  }

  const handleNodeSelect = (node: TreeNode) => {
    if (!isProductEditing) return

    const newIsSelected = !node.isSelected
    updateNodeSelection(node, newIsSelected)
    setProductTree([...productTree])
  }

  const handleSaveProducts = () => {
    const getSelectedProducts = (nodes: TreeNode[]): Product[] => {
      return nodes.flatMap(node => {
        if (node.type === 'product' && node.isSelected && node.product) {
          return [node.product]
        }
        return node.children ? getSelectedProducts(node.children) : []
      })
    }

    const selectedProducts = getSelectedProducts(productTree)
    onSave(selectedProducts)
    setIsProductEditing(false)
  }

  const handleCancelProducts = () => {
    const allProducts = mockProducts.map(p => ({
      ...p,
      isAssigned: initialProducts.some(ip => ip.id === p.id)
    }))
    setProductTree(buildProductTree(allProducts))
    setIsProductEditing(false)
  }

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isMatchingSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (node.type === 'product' && node.product?.code.toLowerCase().includes(searchTerm.toLowerCase()))

    if (searchTerm && !isMatchingSearch && !node.children?.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.type === 'product' && child.product?.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )) {
      return null
    }

    return (
      <div key={node.id} className={cn("py-1", level > 0 && "ml-6")}>
        <div className="flex items-center gap-2">
          {node.children && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => handleNodeToggle(node)}
            >
              {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          {!node.children && <div className="w-4" />}
          <Checkbox
            checked={node.isSelected}
            disabled={!isProductEditing}
            onCheckedChange={() => handleNodeSelect(node)}
            className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:opacity-80"
            {...(node.isIndeterminate && { 'data-state': 'indeterminate' })}
          />
          {node.type === 'product' ? (
            <Package className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm">
            {node.type === 'product' && node.product ? `${node.product.code} - ${node.name}` : node.name}
          </span>
        </div>
        {node.children && node.isExpanded && (
          <div className="mt-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assign Products</CardTitle>
          {parentIsEditing && !isProductEditing && (
            <Button variant="default" size="sm" onClick={() => setIsProductEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Products
            </Button>
          )}
          {isProductEditing && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancelProducts}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProducts}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Products</Label>
              <Input
                id="search"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="border rounded-md p-4">
              {productTree.map(node => renderTreeNode(node))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 