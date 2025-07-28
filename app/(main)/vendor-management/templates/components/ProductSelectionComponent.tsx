'use client'

// Product Selection Component for Pricelist Templates
// Phase 2 Task 4 - Build product selection component with category/subcategory filtering

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  X, 
  Package, 
  Filter,
  ChevronDown,
  ChevronRight,
  Check,
  Settings,
  ShoppingCart
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ProductSelection, ProductInstance } from '../../types'
import { mockCategories, mockProducts } from '../../lib/mock-data'

interface ProductSelectionComponentProps {
  productSelection: ProductSelection
  onChange: (selection: ProductSelection) => void
}

interface ProductOrderUnit {
  productId: string
  orderUnit: string
}

interface ProductMOQTier {
  id: string
  instanceId: string  // Changed from productId to instanceId
  moq: number
  unit: string
  notes?: string
}

// Helper function to generate unique instance ID
const generateInstanceId = (productId: string, unit: string): string => {
  return `${productId}-${unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

export default function ProductSelectionComponent({ productSelection, onChange }: ProductSelectionComponentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['food-beverage'])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [expandedItemGroups, setExpandedItemGroups] = useState<string[]>([])
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)
  // State to track order units for each selected product (legacy support)
  const [productOrderUnits, setProductOrderUnits] = useState<Record<string, string>>({})
  // State to track MOQ tiers for each instance
  const [instanceMOQTiers, setInstanceMOQTiers] = useState<Record<string, ProductMOQTier[]>>({})
  // State to track expanded instances (showing MOQ tiers)
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set())
  // State for Add Product dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [addFilteredProducts, setAddFilteredProducts] = useState(mockProducts)
  const [selectedProductForUnit, setSelectedProductForUnit] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string>('')

  useEffect(() => {
    // Filter products based on search term
    const filtered = mockProducts.filter(product => {
      const category = mockCategories.find(cat => cat.id === product.category)
      const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
      const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
      
      return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (product.itemGroup && product.itemGroup.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (category?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (subcategory?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (itemGroup?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    })
    setFilteredProducts(filtered)
  }, [searchTerm])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const toggleItemGroup = (itemGroupId: string) => {
    setExpandedItemGroups(prev =>
      prev.includes(itemGroupId)
        ? prev.filter(id => id !== itemGroupId)
        : [...prev, itemGroupId]
    )
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const category = mockCategories.find(cat => cat.id === categoryId)
    
    if (checked) {
      // When selecting a category, automatically select all its subcategories, item groups, and items
      const categorySubcategories = category?.subcategories.map(sub => sub.id) || []
      const categoryItemGroups = category?.subcategories.flatMap(sub => sub.itemGroups?.map(ig => ig.id) || []) || []
      const categoryItems = mockProducts.filter(product => product.category === categoryId).map(product => product.id)

      onChange({
        ...productSelection,
        categories: [...productSelection.categories, categoryId],
        subcategories: [...new Set([...productSelection.subcategories, ...categorySubcategories])],
        itemGroups: [...new Set([...productSelection.itemGroups, ...categoryItemGroups])],
        specificItems: [...new Set([...productSelection.specificItems, ...categoryItems])]
      })
    } else {
      // When deselecting a category, remove it and all its related subcategories, item groups, and items
      const categorySubcategories = category?.subcategories.map(sub => sub.id) || []
      const categoryItemGroups = category?.subcategories.flatMap(sub => sub.itemGroups?.map(ig => ig.id) || []) || []
      const categoryItems = mockProducts.filter(product => product.category === categoryId).map(product => product.id)

      onChange({
        ...productSelection,
        categories: productSelection.categories.filter(id => id !== categoryId),
        subcategories: productSelection.subcategories.filter(id => !categorySubcategories.includes(id)),
        itemGroups: productSelection.itemGroups.filter(id => !categoryItemGroups.includes(id)),
        specificItems: productSelection.specificItems.filter(id => !categoryItems.includes(id))
      })
    }
  }

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    // Find the subcategory and its item groups
    let subcategory = null
    let parentCategory = null
    
    for (const category of mockCategories) {
      const foundSubcategory = category.subcategories.find(sub => sub.id === subcategoryId)
      if (foundSubcategory) {
        subcategory = foundSubcategory
        parentCategory = category
        break
      }
    }

    if (checked) {
      // When selecting a subcategory, automatically select all its item groups and items
      const subcategoryItemGroups = subcategory?.itemGroups?.map(ig => ig.id) || []
      const subcategoryItems = mockProducts.filter(product => product.subcategory === subcategoryId).map(product => product.id)

      onChange({
        ...productSelection,
        subcategories: [...productSelection.subcategories, subcategoryId],
        itemGroups: [...new Set([...productSelection.itemGroups, ...subcategoryItemGroups])],
        specificItems: [...new Set([...productSelection.specificItems, ...subcategoryItems])]
      })
    } else {
      // When deselecting a subcategory, remove it and all its related item groups and items
      const subcategoryItemGroups = subcategory?.itemGroups?.map(ig => ig.id) || []
      const subcategoryItems = mockProducts.filter(product => product.subcategory === subcategoryId).map(product => product.id)

      // Also remove parent category if it was selected
      const parentCategoryId = parentCategory?.id
      const shouldRemoveParentCategory = parentCategoryId && productSelection.categories.includes(parentCategoryId)

      onChange({
        ...productSelection,
        categories: shouldRemoveParentCategory ? productSelection.categories.filter(id => id !== parentCategoryId) : productSelection.categories,
        subcategories: productSelection.subcategories.filter(id => id !== subcategoryId),
        itemGroups: productSelection.itemGroups.filter(id => !subcategoryItemGroups.includes(id)),
        specificItems: productSelection.specificItems.filter(id => !subcategoryItems.includes(id))
      })
    }
  }

  const handleItemGroupChange = (itemGroupId: string, checked: boolean) => {
    // Find the item group and its parent subcategory/category
    let itemGroup = null
    let parentSubcategory = null
    let parentCategory = null
    
    for (const category of mockCategories) {
      for (const subcategory of category.subcategories) {
        const foundItemGroup = subcategory.itemGroups?.find(ig => ig.id === itemGroupId)
        if (foundItemGroup) {
          itemGroup = foundItemGroup
          parentSubcategory = subcategory
          parentCategory = category
          break
        }
      }
      if (itemGroup) break
    }

    if (checked) {
      // When selecting an item group, automatically select all its items
      const itemGroupItems = mockProducts.filter(product => product.itemGroup === itemGroupId).map(product => product.id)

      onChange({
        ...productSelection,
        itemGroups: [...productSelection.itemGroups, itemGroupId],
        specificItems: [...new Set([...productSelection.specificItems, ...itemGroupItems])]
      })
    } else {
      // When deselecting an item group, remove it and all its items
      const itemGroupItems = mockProducts.filter(product => product.itemGroup === itemGroupId).map(product => product.id)

      // Also remove parent category and subcategory if they were selected
      const parentCategoryId = parentCategory?.id
      const parentSubcategoryId = parentSubcategory?.id
      const shouldRemoveParentCategory = parentCategoryId && productSelection.categories.includes(parentCategoryId)
      const shouldRemoveParentSubcategory = parentSubcategoryId && productSelection.subcategories.includes(parentSubcategoryId)

      onChange({
        ...productSelection,
        categories: shouldRemoveParentCategory ? productSelection.categories.filter(id => id !== parentCategoryId) : productSelection.categories,
        subcategories: shouldRemoveParentSubcategory ? productSelection.subcategories.filter(id => id !== parentSubcategoryId) : productSelection.subcategories,
        itemGroups: productSelection.itemGroups.filter(id => id !== itemGroupId),
        specificItems: productSelection.specificItems.filter(id => !itemGroupItems.includes(id))
      })
    }
  }

  const handleSpecificItemChange = (productId: string, checked: boolean) => {
    const product = mockProducts.find(p => p.id === productId)
    
    if (checked) {
      onChange({
        ...productSelection,
        specificItems: [...productSelection.specificItems, productId]
      })
    } else {
      // When deselecting an item, also remove its parent hierarchy if they were selected
      const parentCategoryId = product?.category
      const parentSubcategoryId = product?.subcategory
      const parentItemGroupId = product?.itemGroup
      
      const shouldRemoveParentCategory = parentCategoryId && productSelection.categories.includes(parentCategoryId)
      const shouldRemoveParentSubcategory = parentSubcategoryId && productSelection.subcategories.includes(parentSubcategoryId)
      const shouldRemoveParentItemGroup = parentItemGroupId && productSelection.itemGroups.includes(parentItemGroupId)

      onChange({
        ...productSelection,
        categories: shouldRemoveParentCategory ? productSelection.categories.filter(id => id !== parentCategoryId) : productSelection.categories,
        subcategories: shouldRemoveParentSubcategory ? productSelection.subcategories.filter(id => id !== parentSubcategoryId) : productSelection.subcategories,
        itemGroups: shouldRemoveParentItemGroup ? productSelection.itemGroups.filter(id => id !== parentItemGroupId) : productSelection.itemGroups,
        specificItems: productSelection.specificItems.filter(id => id !== productId)
      })
    }
  }


  const getSelectedCount = () => {
    return productSelection.categories.length + 
           productSelection.subcategories.length + 
           productSelection.itemGroups.length + 
           productSelection.specificItems.length
  }

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(cat => cat.id === categoryId)?.name || categoryId
  }

  const getSubcategoryName = (subcategoryId: string) => {
    for (const category of mockCategories) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId)
      if (subcategory) return subcategory.name
    }
    return subcategoryId
  }

  const getItemGroupName = (itemGroupId: string) => {
    for (const category of mockCategories) {
      for (const subcategory of category.subcategories) {
        const itemGroup = subcategory.itemGroups?.find(ig => ig.id === itemGroupId)
        if (itemGroup) return itemGroup.name
      }
    }
    return itemGroupId
  }

  const getProductName = (productId: string) => {
    return mockProducts.find(prod => prod.id === productId)?.name || productId
  }

  // Helper functions for mixed-state checkbox logic
  const getCategorySelectionState = (categoryId: string) => {
    const category = mockCategories.find(cat => cat.id === categoryId)
    if (!category) return 'unchecked'
    
    // If category is explicitly selected, return checked
    if (productSelection.categories.includes(categoryId)) return 'checked'
    
    // Check if any subcategories or products in this category are selected
    const categoryProducts = mockProducts.filter(p => p.category === categoryId)
    const selectedProducts = categoryProducts.filter(p => productSelection.specificItems.includes(p.id))
    const selectedSubcategories = category.subcategories.filter(sub => productSelection.subcategories.includes(sub.id))
    const selectedItemGroups = category.subcategories.flatMap(sub => sub.itemGroups || []).filter(ig => productSelection.itemGroups.includes(ig.id))
    
    if (selectedProducts.length > 0 || selectedSubcategories.length > 0 || selectedItemGroups.length > 0) {
      // Check if all products are selected
      const allProductsSelected = categoryProducts.every(p => productSelection.specificItems.includes(p.id))
      return allProductsSelected ? 'checked' : 'indeterminate'
    }
    
    return 'unchecked'
  }

  const getSubcategorySelectionState = (subcategoryId: string) => {
    // If subcategory is explicitly selected, return checked
    if (productSelection.subcategories.includes(subcategoryId)) return 'checked'
    
    // Check if any item groups or products in this subcategory are selected
    const subcategoryProducts = mockProducts.filter(p => p.subcategory === subcategoryId)
    const selectedProducts = subcategoryProducts.filter(p => productSelection.specificItems.includes(p.id))
    
    // Find subcategory to check item groups
    let subcategory = null
    for (const category of mockCategories) {
      const found = category.subcategories.find(sub => sub.id === subcategoryId)
      if (found) {
        subcategory = found
        break
      }
    }
    
    const selectedItemGroups = subcategory?.itemGroups?.filter(ig => productSelection.itemGroups.includes(ig.id)) || []
    
    if (selectedProducts.length > 0 || selectedItemGroups.length > 0) {
      // Check if all products are selected
      const allProductsSelected = subcategoryProducts.every(p => productSelection.specificItems.includes(p.id))
      return allProductsSelected ? 'checked' : 'indeterminate'
    }
    
    return 'unchecked'
  }

  const getItemGroupSelectionState = (itemGroupId: string) => {
    // If item group is explicitly selected, return checked
    if (productSelection.itemGroups.includes(itemGroupId)) return 'checked'
    
    // Check if any products in this item group are selected
    const itemGroupProducts = mockProducts.filter(p => p.itemGroup === itemGroupId)
    const selectedProducts = itemGroupProducts.filter(p => productSelection.specificItems.includes(p.id))
    
    if (selectedProducts.length > 0) {
      // Check if all products are selected
      const allProductsSelected = itemGroupProducts.every(p => productSelection.specificItems.includes(p.id))
      return allProductsSelected ? 'checked' : 'indeterminate'
    }
    
    return 'unchecked'
  }

  const getResolvedProductInstances = (): ProductInstance[] => {
    const instances: ProductInstance[] = []
    const legacyProductIds = new Set<string>()
    
    // Add products from selected categories (as legacy products)
    productSelection.categories.forEach(categoryId => {
      mockProducts.filter(p => p.category === categoryId).forEach(p => legacyProductIds.add(p.id))
    })
    
    // Add products from selected subcategories (as legacy products)
    productSelection.subcategories.forEach(subcategoryId => {
      mockProducts.filter(p => p.subcategory === subcategoryId).forEach(p => legacyProductIds.add(p.id))
    })
    
    // Add products from selected item groups (as legacy products)
    productSelection.itemGroups.forEach(itemGroupId => {
      mockProducts.filter(p => p.itemGroup === itemGroupId).forEach(p => legacyProductIds.add(p.id))
    })
    
    // Add legacy specific items (as instances with default units)
    productSelection.specificItems.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId)
      if (product) {
        const unit = productOrderUnits[productId] || product.defaultOrderUnit
        const instanceId = generateInstanceId(productId, unit)
        instances.push({
          id: instanceId,
          productId: productId,
          orderUnit: unit,
          displayName: `${product.name} (${unit})`
        })
      }
    })
    
    // Add new product instances
    if (productSelection.productInstances) {
      instances.push(...productSelection.productInstances)
    }
    
    // Convert legacy category/subcategory/itemGroup selections to instances
    legacyProductIds.forEach(productId => {
      const product = mockProducts.find(p => p.id === productId)
      if (product && !instances.some(inst => inst.productId === productId)) {
        const unit = product.defaultOrderUnit
        const instanceId = generateInstanceId(productId, unit)
        instances.push({
          id: instanceId,
          productId: productId,
          orderUnit: unit,
          displayName: `${product.name} (${unit})`
        })
      }
    })
    
    return instances
  }

  // Legacy function for backward compatibility
  const getResolvedProducts = () => {
    const instances = getResolvedProductInstances()
    const productMap = new Map<string, any>()
    
    instances.forEach(instance => {
      const product = mockProducts.find(p => p.id === instance.productId)
      if (product && !productMap.has(instance.productId)) {
        productMap.set(instance.productId, {
          ...product,
          instances: instances.filter(inst => inst.productId === instance.productId)
        })
      }
    })
    
    return Array.from(productMap.values())
  }

  const handleOrderUnitChange = (productId: string, orderUnit: string) => {
    setProductOrderUnits(prev => ({
      ...prev,
      [productId]: orderUnit
    }))
  }

  const getProductOrderUnit = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    return productOrderUnits[productId] || product?.defaultOrderUnit || 'piece'
  }

  // Initialize order units for newly selected products
  useEffect(() => {
    const resolvedProducts = getResolvedProducts()
    const newOrderUnits = { ...productOrderUnits }
    let hasChanges = false

    resolvedProducts.forEach(product => {
      if (!newOrderUnits[product.id]) {
        newOrderUnits[product.id] = product.defaultOrderUnit
        hasChanges = true
      }
    })

    // Remove order units for products that are no longer selected
    Object.keys(newOrderUnits).forEach(productId => {
      if (!resolvedProducts.find(p => p.id === productId)) {
        delete newOrderUnits[productId]
        hasChanges = true
      }
    })

    if (hasChanges) {
      setProductOrderUnits(newOrderUnits)
    }
  }, [productSelection])

  // Filter products in add dialog
  useEffect(() => {
    const filtered = mockProducts.filter(product => {
      const category = mockCategories.find(cat => cat.id === product.category)
      const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
      const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
      
      return product.name.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
             product.category.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
             product.subcategory.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
             (product.itemGroup && product.itemGroup.toLowerCase().includes(addSearchTerm.toLowerCase())) ||
             (category?.name.toLowerCase().includes(addSearchTerm.toLowerCase())) ||
             (subcategory?.name.toLowerCase().includes(addSearchTerm.toLowerCase())) ||
             (itemGroup?.name.toLowerCase().includes(addSearchTerm.toLowerCase()))
    })
    setAddFilteredProducts(filtered)
  }, [addSearchTerm])

  const handleAddProduct = (productId: string, selectedUnit?: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return
    
    const unit = selectedUnit || product.defaultOrderUnit
    const instanceId = generateInstanceId(productId, unit)
    
    // Check if this exact product+unit combination already exists
    const existingInstances = productSelection.productInstances || []
    const instanceExists = existingInstances.some(inst => inst.id === instanceId)
    
    if (!instanceExists) {
      const newInstance: ProductInstance = {
        id: instanceId,
        productId: productId,
        orderUnit: unit,
        displayName: `${product.name} (${unit})`
      }
      
      onChange({
        ...productSelection,
        productInstances: [...existingInstances, newInstance]
      })
    }
    
    setIsAddDialogOpen(false)
    setAddSearchTerm('')
  }

  const handleRemoveProduct = (productId: string) => {
    // Remove from specific items
    const newSpecificItems = productSelection.specificItems.filter(id => id !== productId)
    
    // Also need to check if this product is part of any selected categories/subcategories/item groups
    // and potentially remove those selections if this was the only product
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return

    onChange({
      ...productSelection,
      specificItems: newSpecificItems
    })

    // Remove from order units state
    const newOrderUnits = { ...productOrderUnits }
    delete newOrderUnits[productId]
    setProductOrderUnits(newOrderUnits)

    // Remove from legacy MOQ tiers state (if any)
    // This is handled by handleRemoveInstance now
  }

  const toggleInstanceExpanded = (instanceId: string) => {
    const newExpanded = new Set(expandedInstances)
    if (newExpanded.has(instanceId)) {
      newExpanded.delete(instanceId)
    } else {
      newExpanded.add(instanceId)
      // Initialize with first MOQ tier if none exist
      if (!instanceMOQTiers[instanceId] || instanceMOQTiers[instanceId].length === 0) {
        addMOQTier(instanceId)
      }
    }
    setExpandedInstances(newExpanded)
  }

  const addMOQTier = (instanceId: string) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.id === instanceId)
    if (!instance) return

    const existingTiers = instanceMOQTiers[instanceId] || []
    const lastTierMOQ = existingTiers.length > 0 ? existingTiers[existingTiers.length - 1].moq : 0
    
    // Smart defaults based on unit type
    let defaultMOQ = 1
    const orderUnit = instance.orderUnit
    
    if (lastTierMOQ > 0) {
      // Add reasonable increment based on existing value
      if (lastTierMOQ < 10) {
        defaultMOQ = lastTierMOQ + 1
      } else if (lastTierMOQ < 100) {
        defaultMOQ = lastTierMOQ + 10
      } else {
        defaultMOQ = lastTierMOQ + 100
      }
    } else {
      // Set smart defaults based on unit type
      if (['g', 'ml', 'oz'].includes(orderUnit)) {
        defaultMOQ = 100  // Smaller units need higher quantities
      } else if (['kg', 'L', 'lb'].includes(orderUnit)) {
        defaultMOQ = 1    // Larger units can start smaller
      } else if (['piece', 'box', 'pack'].includes(orderUnit)) {
        defaultMOQ = 10   // Count-based units
      } else {
        defaultMOQ = 1    // Default fallback
      }
    }

    const newTier: ProductMOQTier = {
      id: `${instanceId}-${Date.now()}`,
      instanceId,
      moq: defaultMOQ,
      unit: orderUnit,
      notes: ''
    }

    setInstanceMOQTiers(prev => ({
      ...prev,
      [instanceId]: [...(prev[instanceId] || []), newTier]
    }))
  }

  const removeMOQTier = (instanceId: string, tierIndex: number) => {
    setInstanceMOQTiers(prev => ({
      ...prev,
      [instanceId]: (prev[instanceId] || []).filter((_, index) => index !== tierIndex)
    }))
  }

  const updateMOQTier = (instanceId: string, tierIndex: number, field: keyof ProductMOQTier, value: any) => {
    setInstanceMOQTiers(prev => {
      const tiers = [...(prev[instanceId] || [])]
      if (tiers[tierIndex]) {
        tiers[tierIndex] = { ...tiers[tierIndex], [field]: value }
      }
      return {
        ...prev,
        [instanceId]: tiers
      }
    })
  }

  const getInstanceMOQTiers = (instanceId: string) => {
    return instanceMOQTiers[instanceId] || []
  }

  // Legacy function for backward compatibility
  const getProductMOQTiers = (productId: string) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.productId === productId)
    return instance ? getInstanceMOQTiers(instance.id) : []
  }

  // Bridge functions for UI compatibility
  const toggleProductExpanded = (productId: string) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.productId === productId)
    if (instance) {
      toggleInstanceExpanded(instance.id)
    }
  }

  // Legacy expanded state for UI compatibility
  const expandedProducts = {
    has: (productId: string) => {
      const instances = getResolvedProductInstances()
      const instance = instances.find(inst => inst.productId === productId)
      return instance ? expandedInstances.has(instance.id) : false
    }
  }

  // Bridge function for MOQ tier operations
  const addMOQTierForProduct = (productId: string) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.productId === productId)
    if (instance) {
      addMOQTier(instance.id)
    }
  }

  const removeMOQTierForProduct = (productId: string, tierIndex: number) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.productId === productId)
    if (instance) {
      removeMOQTier(instance.id, tierIndex)
    }
  }

  const updateMOQTierForProduct = (productId: string, tierIndex: number, field: keyof ProductMOQTier, value: any) => {
    const instances = getResolvedProductInstances()
    const instance = instances.find(inst => inst.productId === productId)
    if (instance) {
      updateMOQTier(instance.id, tierIndex, field, value)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Selection Summary */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Product Selection</h3>
          {getResolvedProducts().length > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              {getResolvedProducts().length} products selected
            </Badge>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Selection Interface */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories, products, or item groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Unified Category → Product Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Product Categories & Items
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Select categories, subcategories, item groups, or individual products
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {mockCategories.map(category => {
                  const categoryProducts = mockProducts.filter(p => p.category === category.id)
                  const filteredCategoryProducts = categoryProducts.filter(product => {
                    if (!searchTerm) return true
                    const subcategory = category.subcategories.find(sub => sub.id === product.subcategory)
                    const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
                    
                    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subcategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           itemGroup?.name.toLowerCase().includes(searchTerm.toLowerCase())
                  })
                  
                  // Skip categories with no matching products when searching
                  if (searchTerm && filteredCategoryProducts.length === 0) return null
                  
                  return (
                    <div key={category.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <Collapsible
                        open={expandedCategories.includes(category.id)}
                        onOpenChange={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center space-x-2 flex-1 cursor-pointer hover:bg-blue-50 p-2 rounded-lg -m-2 transition-colors">
                              {expandedCategories.includes(category.id) ? (
                                <ChevronDown className="h-4 w-4 text-blue-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Checkbox
                                checked={getCategorySelectionState(category.id) === 'checked'}
                                onCheckedChange={(checked) => {
                                  handleCategoryChange(category.id, checked === true)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-slate-900">{category.name}</div>
                                <div className="text-xs text-slate-500">
                                  {categoryProducts.length} products, {category.subcategories.length} subcategories
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="mt-2">
                          <div className="pl-4 space-y-2">
                            {category.subcategories.map(subcategory => {
                              const subcategoryProducts = categoryProducts.filter(p => p.subcategory === subcategory.id)
                              const filteredSubcategoryProducts = filteredCategoryProducts.filter(p => p.subcategory === subcategory.id)
                              
                              // Skip subcategories with no matching products when searching
                              if (searchTerm && filteredSubcategoryProducts.length === 0) return null
                              
                              return (
                                <div key={subcategory.id} className="space-y-2">
                                  <Collapsible
                                    open={expandedSubcategories.includes(subcategory.id)}
                                    onOpenChange={() => toggleSubcategory(subcategory.id)}
                                  >
                                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-emerald-100">
                                          {expandedSubcategories.includes(subcategory.id) ? (
                                            <ChevronDown className="h-3 w-3 text-emerald-600" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                          )}
                                        </Button>
                                      </CollapsibleTrigger>
                                      <div className="w-5 h-5 flex items-center justify-center">
                                        <Checkbox
                                          checked={getSubcategorySelectionState(subcategory.id) === 'checked'}
                                          onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked === true)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-slate-800">{subcategory.name}</div>
                                        <div className="text-xs text-slate-500">
                                          {subcategoryProducts.length} products
                                          {subcategory.itemGroups && subcategory.itemGroups.length > 0 && 
                                            `, ${subcategory.itemGroups.length} groups`
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  
                                    <CollapsibleContent className="mt-2">
                                      {/* Item Groups with Products */}
                                      {subcategory.itemGroups && subcategory.itemGroups.length > 0 && (
                                        <div className="pl-4 space-y-1">
                                          {subcategory.itemGroups.map(itemGroup => {
                                            const itemGroupProducts = subcategoryProducts.filter(p => p.itemGroup === itemGroup.id)
                                            const filteredItemGroupProducts = filteredSubcategoryProducts.filter(p => p.itemGroup === itemGroup.id)
                                            
                                            // Skip item groups with no matching products when searching
                                            if (searchTerm && filteredItemGroupProducts.length === 0) return null
                                            
                                            return (
                                              <div key={itemGroup.id} className="border border-slate-200 rounded-lg bg-white shadow-sm">
                                                <Collapsible
                                                  open={expandedItemGroups.includes(itemGroup.id)}
                                                  onOpenChange={() => toggleItemGroup(itemGroup.id)}
                                                >
                                                  <div className="flex items-center justify-between p-3 hover:bg-amber-50 transition-colors">
                                                    <div className="flex items-center space-x-2 flex-1">
                                                      <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-amber-100">
                                                          {expandedItemGroups.includes(itemGroup.id) ? (
                                                            <ChevronDown className="h-3 w-3 text-amber-600" />
                                                          ) : (
                                                            <ChevronRight className="h-3 w-3 text-slate-400" />
                                                          )}
                                                        </Button>
                                                      </CollapsibleTrigger>
                                                      <div className="w-4 h-4 flex items-center justify-center">
                                                        <Checkbox
                                                          checked={getItemGroupSelectionState(itemGroup.id) === 'checked'}
                                                          onCheckedChange={(checked) => handleItemGroupChange(itemGroup.id, checked === true)}
                                                          className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                                        />
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-xs text-slate-700">{itemGroup.name}</div>
                                                        <div className="text-xs text-slate-500">
                                                          {itemGroupProducts.length} {itemGroupProducts.length === 1 ? 'product' : 'products'}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <CollapsibleContent>
                                                    <div className="px-3 pb-3 border-t border-slate-100 bg-slate-50/50">
                                                      <div className="py-2 space-y-1">
                                                        {(searchTerm ? filteredItemGroupProducts : itemGroupProducts).map(product => (
                                                          <div key={product.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                                                            <div className="w-3 h-3 flex items-center justify-center">
                                                              <Checkbox
                                                                checked={productSelection.specificItems.includes(product.id)}
                                                                onCheckedChange={(checked) => handleSpecificItemChange(product.id, checked === true)}
                                                                className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                                                              />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                              <div className="font-medium text-xs text-slate-700">{product.name}</div>
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  </CollapsibleContent>
                                                </Collapsible>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      
                                      {/* Products without item groups */}
                                      {subcategoryProducts.filter(p => !p.itemGroup).length > 0 && (
                                        <div className="pl-4 space-y-1">
                                          <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                                            <div className="w-1 h-3 bg-slate-300 rounded"></div>
                                            Other Products
                                          </div>
                                          {subcategoryProducts
                                            .filter(p => !p.itemGroup)
                                            .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(product => (
                                            <div key={product.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                                              <div className="w-3 h-3 flex items-center justify-center">
                                                <Checkbox
                                                  checked={productSelection.specificItems.includes(product.id)}
                                                  onCheckedChange={(checked) => handleSpecificItemChange(product.id, checked === true)}
                                                  className="data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700"
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-xs text-slate-700">{product.name}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              )
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Selected Items List */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Selected Items ({getResolvedProducts().length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Items that will be included in your template
                  </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Add Products to Template
                      </DialogTitle>
                      <DialogDescription>
                        Search and add individual products to your template
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, category, or item group..."
                        value={addSearchTerm}
                        onChange={(e) => setAddSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Product List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                      {addFilteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <div className="text-sm">No products found</div>
                          <div className="text-xs mt-1">Try adjusting your search terms</div>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {addFilteredProducts.slice(0, 50).map(product => {
                            const category = mockCategories.find(cat => cat.id === product.category)
                            const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
                            const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
                            const existingInstances = getResolvedProductInstances()
                            const productInstances = existingInstances.filter(inst => inst.productId === product.id)
                            const isAlreadySelected = productInstances.length > 0
                            
                            return (
                              <div key={product.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-slate-900">{product.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                                      {category?.name} → {subcategory?.name}
                                      {itemGroup?.name && ` → ${itemGroup.name}`}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">
                                      ID: {product.id} | Default unit: {product.defaultOrderUnit}
                                    </div>
                                  </div>
                                  <div className="ml-3 flex flex-col gap-2">
                                    {productInstances.length > 0 && (
                                      <div className="text-xs text-slate-500">
                                        Added with: {productInstances.map(inst => inst.orderUnit).join(', ')}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Select
                                        value={selectedUnit || product.defaultOrderUnit}
                                        onValueChange={setSelectedUnit}
                                      >
                                        <SelectTrigger className="h-7 w-16 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {product.availableOrderUnits.map((unit: string) => (
                                            <SelectItem key={unit} value={unit} className="text-xs">
                                              {unit}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant={productInstances.some(inst => inst.orderUnit === (selectedUnit || product.defaultOrderUnit)) ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          const unitToUse = selectedUnit || product.defaultOrderUnit
                                          handleAddProduct(product.id, unitToUse)
                                          setSelectedUnit('')
                                        }}
                                        disabled={productInstances.some(inst => inst.orderUnit === (selectedUnit || product.defaultOrderUnit))}
                                      >
                                        {productInstances.some(inst => inst.orderUnit === (selectedUnit || product.defaultOrderUnit)) ? (
                                          <>
                                            <Check className="h-4 w-4 mr-1" />
                                            Added
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          {addFilteredProducts.length > 50 && (
                            <div className="p-4 text-center text-sm text-muted-foreground bg-slate-50">
                              Showing first 50 results. Use search to narrow down.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {getResolvedProducts().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No products selected</div>
                    <div className="text-xs mt-1">Select categories or products from the left</div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getResolvedProducts().map(product => {
                      const category = mockCategories.find(cat => cat.id === product.category)
                      const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
                      const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
                      
                      return (
                        <div key={product.id} className="p-4 hover:bg-slate-50 transition-colors border-l-2 border-l-green-500">
                          <div className="space-y-3">
                            {/* Product Info Row */}
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-sm text-slate-900">{product.name}</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleProductExpanded(product.id)}
                                    className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
                                  >
                                    {expandedProducts.has(product.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  {getProductMOQTiers(product.id).length > 0 && (
                                    <Badge variant="secondary" className="text-xs h-5">
                                      &gt; 0 MOQ tiers
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 truncate">
                                  {category?.name} → {subcategory?.name}
                                  {itemGroup?.name && ` → ${itemGroup.name}`}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  ID: {product.id}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Order Unit Selection Row */}
                            <div className="flex items-center gap-2 pl-5">
                              <Settings className="h-4 w-4 text-slate-400" />
                              <span className="text-xs text-slate-600 font-medium">Order Unit:</span>
                              <Select
                                value={getProductOrderUnit(product.id)}
                                onValueChange={(value) => handleOrderUnitChange(product.id, value)}
                              >
                                <SelectTrigger className="h-7 w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {product.availableOrderUnits.map((unit: string) => (
                                    <SelectItem key={unit} value={unit} className="text-xs">
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-slate-400">
                                (default: {product.defaultOrderUnit})
                              </span>
                            </div>

                            {/* MOQ Tiers Section */}
                            {expandedProducts.has(product.id) && (
                              <div className="pl-5 space-y-2 border-l-2 border-l-blue-200 ml-1">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-800">MOQ Tiers</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMOQTierForProduct(product.id)}
                                    className="h-6 w-6 p-0 text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {getProductMOQTiers(product.id).map((tier, index) => (
                                  <div key={tier.id} className="flex items-center gap-2 bg-blue-50 p-2 rounded border">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-slate-600">MOQ:</span>
                                      <Input
                                        type="number"
                                        value={tier.moq}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value)
                                          if (value > 0 || e.target.value === '') {
                                            updateMOQTierForProduct(product.id, index, 'moq', value || 0)
                                          }
                                        }}
                                        className="h-6 w-16 text-xs"
                                        min="0.01"
                                        step="0.01"
                                      />
                                      {tier.moq <= 0 && (
                                        <span className="text-xs text-red-500 ml-1">Must be &gt; 0</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-slate-600">Unit:</span>
                                      <Select
                                        value={tier.unit}
                                        onValueChange={(value: string) => updateMOQTierForProduct(product.id, index, 'unit', value)}
                                      >
                                        <SelectTrigger className="h-6 w-16 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {product.availableOrderUnits.map((unit: string) => (
                                            <SelectItem key={unit} value={unit} className="text-xs">
                                              {unit}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Input
                                      placeholder="Notes (optional)"
                                      value={tier.notes || ''}
                                      onChange={(e) => updateMOQTierForProduct(product.id, index, 'notes', e.target.value)}
                                      className="h-6 text-xs flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMOQTierForProduct(product.id, index)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                
                                {getProductMOQTiers(product.id).length === 0 && (
                                  <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded border border-dashed">
                                    Click + to add MOQ tiers for this product
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary Card */}
          {getResolvedProducts().length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-900">
                        {getResolvedProducts().length} products selected
                      </div>
                      <div className="text-xs text-green-700">
                        Ready for template creation
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600 text-white px-3 py-1 text-xs font-medium">
                    {getResolvedProducts().length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

         </div>
       </div>

    </div>
  )
}