'use client'

// PricelistProductEditingComponent - Adapted from ProductSelectionComponent
// Focuses on price input for pre-selected products from template

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Package,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Search,
  DollarSign
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  PricelistProductEditingProps, 
  PricelistMOQTier, 
  PricelistProductWithStatus,
  PricelistEditingProgress
} from '../types/PricelistEditingTypes'
import { ProductInstance, Certification } from '../../types'
import { 
  validateProductPricing, 
  calculateProductCompletionStatus, 
  validatePricelist,
  getSmartLeadTimeDefault
} from '../utils/PriceValidation'
import { mockProducts, mockCategories } from '../../lib/mock-data'
import { fetchCertifications } from '@/app/lib/data'

export default function PricelistProductEditingComponent({
  preSelectedProducts = [],
  existingPriceData,
  currency,
  onPriceDataChange,
  onValidationChange,
  readonly = false,
  allowProductSelection = false
}: PricelistProductEditingProps) {
  // State for product selection and pricing data
  const [selectedProducts, setSelectedProducts] = useState<ProductInstance[]>(preSelectedProducts)
  const [productPricing, setProductPricing] = useState<Record<string, PricelistMOQTier[]>>({})
  const [productNotes, setProductNotes] = useState<Record<string, string>>({})
  const [productCertifications, setProductCertifications] = useState<Record<string, string[]>>({})
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [productSearch, setProductSearch] = useState<string>("")
  const [certifications, setCertifications] = useState<Certification[]>([])
  
  // State for multi-unit management
  const [productUnits, setProductUnits] = useState<Record<string, string[]>>({}) // productId -> selected units
  
  // State for Add Product modal
  const [showProductModal, setShowProductModal] = useState<boolean>(false)
  const [modalProductSearch, setModalProductSearch] = useState<string>("")
  const [activeModalTab, setActiveModalTab] = useState<string>("quick-select")
  const [modalSelectedProducts, setModalSelectedProducts] = useState<Set<string>>(new Set())
  const [modalExpandedCategories, setModalExpandedCategories] = useState<string[]>([])
  const [modalExpandedSubcategories, setModalExpandedSubcategories] = useState<string[]>([])
  
  // State for hierarchical product selection
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['food-beverage'])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [expandedItemGroups, setExpandedItemGroups] = useState<string[]>([])

  useEffect(() => {
    async function loadCertifications() {
      const fetchedCertifications = await fetchCertifications();
      setCertifications(fetchedCertifications);
    }
    loadCertifications();
  }, []);

export default function PricelistProductEditingComponent({
  preSelectedProducts = [],
  existingPriceData,
  currency,
  onPriceDataChange,
  onValidationChange,
  readonly = false,
  allowProductSelection = false
}: PricelistProductEditingProps) {
  // State for product selection and pricing data
  const [selectedProducts, setSelectedProducts] = useState<ProductInstance[]>(preSelectedProducts)
  const [productPricing, setProductPricing] = useState<Record<string, PricelistMOQTier[]>>({})
  const [productNotes, setProductNotes] = useState<Record<string, string>>({})
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [productSearch, setProductSearch] = useState<string>("")
  
  // State for multi-unit management
  const [productUnits, setProductUnits] = useState<Record<string, string[]>>({}) // productId -> selected units
  
  // State for Add Product modal
  const [showProductModal, setShowProductModal] = useState<boolean>(false)
  const [modalProductSearch, setModalProductSearch] = useState<string>("")
  const [activeModalTab, setActiveModalTab] = useState<string>("quick-select")
  const [modalSelectedProducts, setModalSelectedProducts] = useState<Set<string>>(new Set())
  const [modalExpandedCategories, setModalExpandedCategories] = useState<string[]>([])
  const [modalExpandedSubcategories, setModalExpandedSubcategories] = useState<string[]>([])
  
  // State for hierarchical product selection
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['food-beverage'])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [expandedItemGroups, setExpandedItemGroups] = useState<string[]>([])
  
  // Initialize pricing data and unit tracking from existing pricelist or create empty structure
  useEffect(() => {
    const initialPricing: Record<string, PricelistMOQTier[]> = {}
    const initialNotes: Record<string, string> = {}
    const initialProductUnits: Record<string, string[]> = {}
    
    selectedProducts.forEach(instance => {
      // Track units per product
      if (!initialProductUnits[instance.productId]) {
        initialProductUnits[instance.productId] = []
      }
      if (!initialProductUnits[instance.productId].includes(instance.orderUnit)) {
        initialProductUnits[instance.productId].push(instance.orderUnit)
      }
      
      // Skip initialization if this instance already has pricing data to prevent overwriting user changes
      if (productPricing[instance.id] && productPricing[instance.id].length > 0) {
        return
      }
      
      const existingItem = existingPriceData?.find(item => 
        item.productId === instance.productId && 
        item.pricing.some(p => p.unit === instance.orderUnit)
      )
      
      if (existingItem) {
        // Convert existing pricing to our format
        initialPricing[instance.id] = existingItem.pricing.map((moq, index) => ({
          id: `${instance.id}-${index}`,
          instanceId: instance.id,
          moq: moq.moq,
          unit: moq.unit,
          unitPrice: moq.unitPrice,
          leadTime: moq.leadTime || getSmartLeadTimeDefault(moq.unit),
          notes: moq.notes
        }))
        initialNotes[instance.id] = existingItem.notes || ''
      } else {
        // Create default tier for new products - first tier always starts at MOQ 0
        initialPricing[instance.id] = [{
          id: `${instance.id}-0`,
          instanceId: instance.id,
          moq: 0, // First tier always starts at 0
          unit: instance.orderUnit,
          unitPrice: 0,
          leadTime: getSmartLeadTimeDefault(instance.orderUnit),
          notes: ''
        }]
        initialNotes[instance.id] = ''
      }
    })
    
    // Update product units tracking
    setProductUnits(prev => ({
      ...prev,
      ...initialProductUnits
    }))
    
    // Only update if we have new pricing data to add
    if (Object.keys(initialPricing).length > 0) {
      setProductPricing(prev => ({
        ...prev,
        ...initialPricing
      }))
    }
    
    // Only update if we have new notes to add
    if (Object.keys(initialNotes).length > 0) {
      setProductNotes(prev => ({
        ...prev,
        ...initialNotes
      }))
    }
  }, [selectedProducts, existingPriceData, productPricing])

  // Calculate products with status for validation - memoized for performance
  const getProductsWithStatus = React.useMemo((): PricelistProductWithStatus[] => {
    return selectedProducts.map(instance => {
      const product = mockProducts.find(p => p.id === instance.productId)
      const pricing = productPricing[instance.id] || []
      const validationResult = validateProductPricing(pricing)
      const completionStatus = calculateProductCompletionStatus(pricing)
      
      return {
        product: product || { id: instance.productId, name: 'Unknown Product' },
        instance,
        pricing,
        completionStatus,
        validationResult,
        notes: productNotes[instance.id] || ''
      }
    })
  }, [selectedProducts, productPricing, productNotes])

  // Calculate progress - memoized for performance
  const getProgress = React.useMemo((): PricelistEditingProgress => {
    const totalProducts = getProductsWithStatus.length
    const completedProducts = getProductsWithStatus.filter(p => p.completionStatus === 'completed').length
    const partialProducts = getProductsWithStatus.filter(p => p.completionStatus === 'partial').length
    const hasErrors = getProductsWithStatus.some(p => !p.validationResult.isValid)
    
    return {
      totalProducts,
      completedProducts,
      partialProducts,
      completionPercentage: totalProducts > 0 ? Math.round((completedProducts / totalProducts) * 100) : 0,
      hasErrors,
      canSubmit: completedProducts > 0 && !hasErrors
    }
  }, [getProductsWithStatus])


  // Function to notify parent of data changes
  const notifyDataChange = React.useCallback(() => {
    const pricelistItems = getProductsWithStatus
      .filter(p => p.pricing.length > 0)
      .map(p => ({
        id: `item-${p.instance.id}`,
        productId: p.instance.productId,
        productCode: p.product.code || p.product.id,
        productName: p.product.name,
        productDescription: p.product.description || '',
        category: p.product.category || 'general',
        subcategory: p.product.subcategory || 'general',
        pricing: p.pricing.map((tier) => ({
          id: tier.id,
          moq: tier.moq,
          unit: tier.unit,
          unitPrice: tier.unitPrice,
          conversionFactor: 1,
          leadTime: tier.leadTime,
          notes: tier.notes,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        })),
        currency,
        leadTime: Math.max(...p.pricing.map(t => t.leadTime)),
        notes: p.notes,
        customFieldValues: {},
        status: p.completionStatus === 'completed' ? 'approved' : 'draft' as 'draft' | 'submitted' | 'approved' | 'rejected',
        qualityScore: p.completionStatus === 'completed' ? 95 : 70,
        lastModified: new Date(),
        certifications: productCertifications[p.instance.id] || []
      }))

    onPriceDataChange(pricelistItems)
    
    // Notify validation status
    const overallValidation = validatePricelist(getProductsWithStatus)
    onValidationChange?.(overallValidation.isValid)
  }, [getProductsWithStatus, currency, onPriceDataChange, onValidationChange, productCertifications])

  // Notify parent when pricing data changes
  useEffect(() => {
    console.log('🟢 notifyDataChange useEffect triggered')
    notifyDataChange()
  }, [notifyDataChange])

  const toggleProductExpanded = (instanceId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(instanceId)) {
      newExpanded.delete(instanceId)
    } else {
      newExpanded.add(instanceId)
    }
    setExpandedProducts(newExpanded)
  }

  const addMOQTier = (instanceId: string) => {
    const existingTiers = productPricing[instanceId] || []
    const lastTier = existingTiers[existingTiers.length - 1]
    
    // Calculate next MOQ value - should be higher than the last tier
    let nextMOQ = 1 // Default minimum for additional tiers
    if (lastTier && lastTier.moq > 0) {
      nextMOQ = Math.max(lastTier.moq + 1, 1)
    }
    
    const newTier: PricelistMOQTier = {
      id: `${instanceId}-${Date.now()}`,
      instanceId,
      moq: nextMOQ,
      unit: lastTier?.unit || 'piece',
      unitPrice: 0,
      leadTime: getSmartLeadTimeDefault(lastTier?.unit || 'piece'),
      notes: ''
    }

    setProductPricing(prev => ({
      ...prev,
      [instanceId]: [...existingTiers, newTier]
    }))
  }

  const removeMOQTier = (instanceId: string, tierIndex: number) => {
    setProductPricing(prev => {
      const tiers = [...(prev[instanceId] || [])]
      tiers.splice(tierIndex, 1)
      return {
        ...prev,
        [instanceId]: tiers
      }
    })
    
    // Parent will be notified via useEffect when productPricing changes
  }

  const updateMOQTier = (instanceId: string, tierIndex: number, field: keyof PricelistMOQTier, value: any) => {
    setProductPricing(prev => {
      const tiers = [...(prev[instanceId] || [])]
      if (tiers[tierIndex]) {
        tiers[tierIndex] = { ...tiers[tierIndex], [field]: value }
      }
      return {
        ...prev,
        [instanceId]: tiers
      }
    })
    
    // Parent will be notified via useEffect when productPricing changes
  }


  // Unit selection functions

  const addUnitToProduct = (productId: string, unit: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return
    
    // Create new instance for this product-unit combination
    const instanceId = `${productId}-${unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    
    // Check if this combination already exists
    const existingInstance = selectedProducts.find(p => p.id === instanceId)
    if (existingInstance) return
    
    const newInstance: ProductInstance = {
      id: instanceId,
      productId,
      orderUnit: unit,
      displayName: `${product.name} (${unit})`
    }
    
    setSelectedProducts(prev => [...prev, newInstance])
    
    // Initialize pricing for the new unit
    const initialTier: PricelistMOQTier = {
      id: `${instanceId}-0`,
      instanceId,
      moq: 0, // First tier always starts at 0
      unit: unit,
      unitPrice: 0,
      leadTime: getSmartLeadTimeDefault(unit),
      notes: ''
    }
    
    setProductPricing(prev => ({
      ...prev,
      [instanceId]: [initialTier]
    }))
    
    // Update product units tracking
    setProductUnits(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), unit]
    }))
  }

  const removeUnitFromProduct = (productId: string, unit: string) => {
    const instanceId = `${productId}-${unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    
    // Remove from selected products
    setSelectedProducts(prev => prev.filter(p => p.id !== instanceId))
    
    // Clean up pricing data
    setProductPricing(prev => {
      const newPricing = { ...prev }
      delete newPricing[instanceId]
      return newPricing
    })
    
    // Clean up notes
    setProductNotes(prev => {
      const newNotes = { ...prev }
      delete newNotes[instanceId]
      return newNotes
    })
    
    // Update product units tracking
    setProductUnits(prev => ({
      ...prev,
      [productId]: (prev[productId] || []).filter(u => u !== unit)
    }))
  }


  const getAllUnitsForProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return []
    
    return product.availableOrderUnits || [product.defaultOrderUnit]
  }


  // Product selection functions
  const addProduct = (productId: string, orderUnit: string) => {
    const instanceId = `${productId}-${orderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    
    // Check if this product-unit combination already exists
    const existingInstance = selectedProducts.find(p => p.id === instanceId)
    if (existingInstance) {
      return // Already added
    }
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return
    
    const newInstance: ProductInstance = {
      id: instanceId,
      productId,
      orderUnit,
      displayName: `${product.name} (${orderUnit})`
    }
    
    setSelectedProducts(prev => [...prev, newInstance])
    
    // Auto-initialize with a default MOQ tier for better UX
    // This will be handled by the initialization useEffect
  }

  const removeProduct = (instanceId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== instanceId))
    
    // Clean up associated pricing and notes
    setProductPricing(prev => {
      const newPricing = { ...prev }
      delete newPricing[instanceId]
      return newPricing
    })
    setProductNotes(prev => {
      const newNotes = { ...prev }
      delete newNotes[instanceId]
      return newNotes
    })
    
    // Parent will be notified via useEffect when state changes
  }

  // Helper functions for managing expansion state
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

  // Filter products for search
  const filteredProducts = mockProducts.filter(product => {
    if (!productSearch.trim()) return true
    const category = mockCategories.find(cat => cat.id === product.category)
    const subcategory = category?.subcategories.find(sub => sub.id === product.subcategory)
    const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product.itemGroup)
    
    return product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
           product.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
           product.subcategory?.toLowerCase().includes(productSearch.toLowerCase()) ||
           (product.itemGroup && product.itemGroup.toLowerCase().includes(productSearch.toLowerCase())) ||
           (category?.name.toLowerCase().includes(productSearch.toLowerCase())) ||
           (subcategory?.name.toLowerCase().includes(productSearch.toLowerCase())) ||
           (itemGroup?.name.toLowerCase().includes(productSearch.toLowerCase()))
  })

  const getInstanceMOQTiers = (instanceId: string) => {
    return productPricing[instanceId] || []
  }

  // Helper functions for product selection modal
  const getFilteredProductsForModal = () => {
    return mockProducts.filter(product => {
      if (!modalProductSearch.trim()) return true
      const searchLower = modalProductSearch.toLowerCase()
      return product.name.toLowerCase().includes(searchLower) ||
             product.id.toLowerCase().includes(searchLower) ||
             product.category?.toLowerCase().includes(searchLower) ||
             product.subcategory?.toLowerCase().includes(searchLower)
    })
  }

  // Modal category management functions
  const toggleModalCategory = (categoryId: string) => {
    setModalExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleModalSubcategory = (subcategoryId: string) => {
    setModalExpandedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  // Modal bulk selection functions
  const selectAllInModalCategory = (categoryId: string, checked: boolean) => {
    const categoryProducts = mockProducts.filter(p => p.category === categoryId)
    setModalSelectedProducts(prev => {
      const newSet = new Set(prev)
      categoryProducts.forEach(product => {
        const productKey = `${product.id}-${product.defaultOrderUnit}`
        if (checked) {
          newSet.add(productKey)
        } else {
          newSet.delete(productKey)
        }
      })
      return newSet
    })
  }

  const selectAllInModalSubcategory = (categoryId: string, subcategoryId: string, checked: boolean) => {
    const subcategoryProducts = mockProducts.filter(p => p.category === categoryId && p.subcategory === subcategoryId)
    setModalSelectedProducts(prev => {
      const newSet = new Set(prev)
      subcategoryProducts.forEach(product => {
        const productKey = `${product.id}-${product.defaultOrderUnit}`
        if (checked) {
          newSet.add(productKey)
        } else {
          newSet.delete(productKey)
        }
      })
      return newSet
    })
  }

  // Check selection states for modal
  const isModalCategorySelected = (categoryId: string) => {
    const categoryProducts = mockProducts.filter(p => p.category === categoryId)
    const selectedCount = categoryProducts.filter(product => {
      const productKey = `${product.id}-${product.defaultOrderUnit}`
      return modalSelectedProducts.has(productKey)
    }).length
    return selectedCount === categoryProducts.length ? 'all' : selectedCount > 0 ? 'partial' : 'none'
  }

  const isModalSubcategorySelected = (categoryId: string, subcategoryId: string) => {
    const subcategoryProducts = mockProducts.filter(p => p.category === categoryId && p.subcategory === subcategoryId)
    const selectedCount = subcategoryProducts.filter(product => {
      const productKey = `${product.id}-${product.defaultOrderUnit}`
      return modalSelectedProducts.has(productKey)
    }).length
    return selectedCount === subcategoryProducts.length ? 'all' : selectedCount > 0 ? 'partial' : 'none'
  }

  const getSelectedUnitForProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    return product?.defaultOrderUnit || 'piece'
  }


  const isProductUnitCombinationSelected = (productId: string, unit: string) => {
    const instanceId = `${productId}-${unit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    return selectedProducts.some(p => p.id === instanceId)
  }


  const handleBulkAddFromModal = () => {
    modalSelectedProducts.forEach(productKey => {
      const [productId, unit] = productKey.split('-')
      if (!isProductUnitCombinationSelected(productId, unit)) {
        addProduct(productId, unit)
      }
    })
    
    // Clear modal selections and close
    setModalSelectedProducts(new Set())
    setShowProductModal(false)
  }

  const clearModalSelections = () => {
    setModalSelectedProducts(new Set())
  }

  // Bulk selection helpers
  const selectAllInCategory = (categoryId: string, checked: boolean) => {
    const categoryProducts = mockProducts.filter(p => p.category === categoryId)
    categoryProducts.forEach(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      const isSelected = selectedProducts.some(sp => sp.id === instanceId)
      
      if (checked && !isSelected) {
        addProduct(product.id, product.defaultOrderUnit)
      } else if (!checked && isSelected) {
        removeProduct(instanceId)
      }
    })
  }

  const selectAllInSubcategory = (categoryId: string, subcategoryId: string, checked: boolean) => {
    const subcategoryProducts = mockProducts.filter(p => p.category === categoryId && p.subcategory === subcategoryId)
    subcategoryProducts.forEach(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      const isSelected = selectedProducts.some(sp => sp.id === instanceId)
      
      if (checked && !isSelected) {
        addProduct(product.id, product.defaultOrderUnit)
      } else if (!checked && isSelected) {
        removeProduct(instanceId)
      }
    })
  }

  const selectAllInItemGroup = (categoryId: string, subcategoryId: string, itemGroupId: string, checked: boolean) => {
    const itemGroupProducts = mockProducts.filter(p => 
      p.category === categoryId && 
      p.subcategory === subcategoryId && 
      p.itemGroup === itemGroupId
    )
    itemGroupProducts.forEach(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      const isSelected = selectedProducts.some(sp => sp.id === instanceId)
      
      if (checked && !isSelected) {
        addProduct(product.id, product.defaultOrderUnit)
      } else if (!checked && isSelected) {
        removeProduct(instanceId)
      }
    })
  }

  const isCategorySelected = (categoryId: string) => {
    const categoryProducts = mockProducts.filter(p => p.category === categoryId)
    const selectedCount = categoryProducts.filter(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      return selectedProducts.some(sp => sp.id === instanceId)
    }).length
    return selectedCount === categoryProducts.length ? 'all' : selectedCount > 0 ? 'partial' : 'none'
  }

  const isSubcategorySelected = (categoryId: string, subcategoryId: string) => {
    const subcategoryProducts = mockProducts.filter(p => p.category === categoryId && p.subcategory === subcategoryId)
    const selectedCount = subcategoryProducts.filter(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      return selectedProducts.some(sp => sp.id === instanceId)
    }).length
    return selectedCount === subcategoryProducts.length ? 'all' : selectedCount > 0 ? 'partial' : 'none'
  }

  const isItemGroupSelected = (categoryId: string, subcategoryId: string, itemGroupId: string) => {
    const itemGroupProducts = mockProducts.filter(p => 
      p.category === categoryId && 
      p.subcategory === subcategoryId && 
      p.itemGroup === itemGroupId
    )
    const selectedCount = itemGroupProducts.filter(product => {
      const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      return selectedProducts.some(sp => sp.id === instanceId)
    }).length
    return selectedCount === itemGroupProducts.length ? 'all' : selectedCount > 0 ? 'partial' : 'none'
  }

  const progress = getProgress
  const productsWithStatus = getProductsWithStatus

  // Helper function to render pricing interface
  const renderPricingInterface = () => {
    return (
      <>
        {/* Single full-width column layout */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Selected Items ({productsWithStatus.length}) - Price Entry ({currency})
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Add pricing for each unit. First price tier starts at 0+ quantity.
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {progress.completedProducts} of {progress.totalProducts} completed ({progress.completionPercentage}%)
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsWithStatus.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No products selected</div>
                  <div className="text-xs mt-1">Products will appear here when added</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group products by productId to show units together */}
                  {(() => {
                    const productGroups = new Map<string, typeof productsWithStatus>()
                    productsWithStatus.forEach(productStatus => {
                      const productId = productStatus.instance.productId
                      if (!productGroups.has(productId)) {
                        productGroups.set(productId, [])
                      }
                      productGroups.get(productId)!.push(productStatus)
                    })

                    return Array.from(productGroups.entries()).map(([productId, productInstances]) => {
                      const firstInstance = productInstances[0]
                      const product = firstInstance.product
                      const allUnits = getAllUnitsForProduct(productId)
                      
                      return (
                        <Card key={productId} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              {/* Product Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-base">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.category} → {product.subcategory} • ID: {productId}
                                  </div>
                                </div>
                                
                                {/* Always show all units for selection */}
                                {!readonly && allUnits.length > 0 && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Available Units - Select to add pricing:
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {allUnits.map(unit => {
                                        const isSelected = productInstances.some(instance => instance.instance.orderUnit === unit)
                                        return (
                                          <label 
                                            key={unit} 
                                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                              isSelected 
                                                ? 'bg-blue-100 border border-blue-300' 
                                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                                            }`}
                                          >
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  addUnitToProduct(productId, unit)
                                                } else {
                                                  removeUnitFromProduct(productId, unit)
                                                }
                                              }}
                                            />
                                            <span className={`text-sm ${isSelected ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                                              {unit}
                                            </span>
                                          </label>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Selected Units Display */}
                              <div className="space-y-2">
                                {productInstances.map(productStatus => {
                                  const isExpanded = expandedProducts.has(productStatus.instance.id)
                                  const pricing = productStatus.pricing
                                  const firstTierPrice = pricing.length > 0 ? pricing[0].unitPrice : 0
                                  
                                  return (
                                    <div key={productStatus.instance.id} className="border rounded-lg bg-gray-50/50">
                                      {/* Unit Header with Inline Pricing */}
                                      <div className="flex items-center gap-4 p-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Unit:</span>
                                          <span className="text-sm text-blue-600 font-medium">{productStatus.instance.orderUnit}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">Base Price:</span>
                                          <div className="relative">
                                            <Input
                                              type="number"
                                              value={firstTierPrice || ''}
                                              onChange={(e) => updateMOQTier(productStatus.instance.id, 0, 'unitPrice', parseFloat(e.target.value) || 0)}
                                              className="h-8 w-24 text-sm pl-6"
                                              min="0.01"
                                              step="0.01"
                                              readOnly={readonly}
                                              placeholder="0.00"
                                            />
                                            <DollarSign className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-muted-foreground">({currency})</span>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleProductExpanded(productStatus.instance.id)}
                                          className="h-7 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                                          disabled={readonly}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add MOQ
                                        </Button>
                                        {pricing.length > 1 && (
                                          <span className="text-xs text-muted-foreground">
                                            +{pricing.length - 1} MOQ tier{pricing.length - 1 > 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {allowProductSelection && !readonly && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeUnitFromProduct(productId, productStatus.instance.orderUnit)}
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 ml-auto"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>

                                      {/* Expanded MOQ Tiers */}
                                      {isExpanded && (
                                        <div className="p-3 border-t bg-blue-50/30">
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-sm font-medium text-blue-800">
                                                Volume Pricing Tiers for {productStatus.instance.orderUnit}
                                              </Label>
                                              {!readonly && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => addMOQTier(productStatus.instance.id)}
                                                  className="h-7 text-blue-600 border-blue-300 hover:bg-blue-50"
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  Add Tier
                                                </Button>
                                              )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                              {pricing.map((tier, index) => (
                                                <div key={tier.id} className="grid grid-cols-10 gap-4 p-3 bg-white border rounded-lg items-center">
                                                  {/* MOQ Input (only for non-base tiers) */}
                                                  {index > 0 ? (
                                                    <div className="col-span-3">
                                                      <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Min Order Qty:</Label>
                                                        <Input
                                                          type="number"
                                                          value={tier.moq || ''}
                                                          onChange={(e) => updateMOQTier(productStatus.instance.id, index, 'moq', parseFloat(e.target.value) || 1)}
                                                          className="h-8 text-sm"
                                                          min="1"
                                                          step="1"
                                                          readOnly={readonly}
                                                          placeholder="1"
                                                        />
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className="col-span-3">
                                                      <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Tier Type:</Label>
                                                        <div className="text-sm font-medium text-green-600">Base Price</div>
                                                        <div className="text-xs text-gray-500">No minimum order</div>
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {/* Price Input */}
                                                  <div className="col-span-3">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-gray-600">Price:</Label>
                                                      <div className="relative">
                                                        <Input
                                                          type="number"
                                                          value={tier.unitPrice || ''}
                                                          onChange={(e) => updateMOQTier(productStatus.instance.id, index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                          className="h-8 text-sm pl-6"
                                                          min="0.01"
                                                          step="0.01"
                                                          readOnly={readonly}
                                                          placeholder="0.00"
                                                        />
                                                        <DollarSign className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                                                      </div>
                                                      <div className="text-xs text-gray-500">per {tier.unit}</div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Notes Input */}
                                                  <div className="col-span-3">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-gray-600">Notes:</Label>
                                                      <Input
                                                        value={tier.notes || ''}
                                                        onChange={(e) => updateMOQTier(productStatus.instance.id, index, 'notes', e.target.value)}
                                                        className="h-8 text-sm"
                                                        placeholder="Optional notes"
                                                        readOnly={readonly}
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="col-span-3">
                                                    <div className="space-y-1">
                                                      <Label className="text-xs text-gray-600">Certifications:</Label>
                                                      <Select
                                                        multiple
                                                        value={productCertifications[productStatus.instance.id] || []}
                                                        onValueChange={(values) => {
                                                          setProductCertifications(prev => ({
                                                            ...prev,
                                                            [productStatus.instance.id]: values
                                                          }))
                                                        }}
                                                      >
                                                        <SelectTrigger>
                                                          <SelectValue placeholder="Select certifications" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          {certifications.map(cert => (
                                                            <SelectItem key={cert.id} value={cert.id}>
                                                              {cert.name}
                                                            </SelectItem>
                                                          ))}
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* Remove Button */}
                                                  <div className="col-span-1 flex justify-end">
                                                    {!readonly && index > 0 && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeMOQTier(productStatus.instance.id, index)}
                                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                      >
                                                        <X className="h-3 w-3" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Validation Messages */}
                                      {!productStatus.validationResult.isValid && (
                                        <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-medium text-red-800">Validation Errors</span>
                                          </div>
                                          <ul className="text-xs text-red-700 space-y-1 pl-6">
                                            {productStatus.validationResult.errors.map((error, i) => (
                                              <li key={i}>• {error}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Helper function to render product selection interface
  const renderProductSelection = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Product Catalog with Simplified Categories */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories, products, or item groups..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Simplified Category List */}
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
            <CardContent className="p-4 space-y-2">
              {mockCategories.map(category => {
                const categoryProducts = filteredProducts.filter(p => p.category === category.id)
                
                // Skip categories with no matching products when searching
                if (productSearch && categoryProducts.length === 0) return null
                
                return (
                  <Collapsible
                    key={category.id}
                    open={expandedCategories.includes(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <Checkbox
                          checked={isCategorySelected(category.id) === 'all'}
                          onCheckedChange={(checked) => selectAllInCategory(category.id, checked as boolean)}
                          ref={(ref) => {
                            if (ref && isCategorySelected(category.id) === 'partial') {
                              (ref as any).indeterminate = true
                            }
                          }}
                          disabled={readonly}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {categoryProducts.length} products, {category.subcategories.length} subcategories
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="ml-6 space-y-2 pb-2">
                        {/* Subcategories */}
                        {category.subcategories.map(subcategory => {
                          const subcategoryProducts = categoryProducts.filter(p => p.subcategory === subcategory.id)
                          if (productSearch && subcategoryProducts.length === 0) return null
                          
                          return (
                            <Collapsible
                              key={subcategory.id}
                              open={expandedSubcategories.includes(subcategory.id)}
                              onOpenChange={() => toggleSubcategory(subcategory.id)}
                            >
                              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                <div className="flex items-center gap-2">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                      {expandedSubcategories.includes(subcategory.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                  
                                  <Checkbox
                                    checked={isSubcategorySelected(category.id, subcategory.id) === 'all'}
                                    onCheckedChange={(checked) => selectAllInSubcategory(category.id, subcategory.id, checked as boolean)}
                                    ref={(ref) => {
                                      if (ref && isSubcategorySelected(category.id, subcategory.id) === 'partial') {
                                        (ref as any).indeterminate = true
                                      }
                                    }}
                                    disabled={readonly}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                  
                                  <div>
                                    <div className="text-sm text-slate-700">{subcategory.name}</div>
                                    <div className="text-xs text-slate-500">{subcategoryProducts.length} products</div>
                                  </div>
                                </div>
                              </div>
                              
                              <CollapsibleContent>
                                <div className="ml-4 space-y-1">
                                  {/* Item Groups */}
                                  {subcategory.itemGroups && subcategory.itemGroups.map(itemGroup => {
                                    const itemGroupProducts = subcategoryProducts.filter(p => p.itemGroup === itemGroup.id)
                                    if (productSearch && itemGroupProducts.length === 0) return null
                                    
                                    return (
                                      <Collapsible
                                        key={itemGroup.id}
                                        open={expandedItemGroups.includes(itemGroup.id)}
                                        onOpenChange={() => toggleItemGroup(itemGroup.id)}
                                      >
                                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                          <div className="flex items-center gap-2">
                                            <CollapsibleTrigger asChild>
                                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                                {expandedItemGroups.includes(itemGroup.id) ? (
                                                  <ChevronDown className="h-3 w-3" />
                                                ) : (
                                                  <ChevronRight className="h-3 w-3" />
                                                )}
                                              </Button>
                                            </CollapsibleTrigger>
                                            
                                            <Checkbox
                                              checked={isItemGroupSelected(category.id, subcategory.id, itemGroup.id) === 'all'}
                                              onCheckedChange={(checked) => selectAllInItemGroup(category.id, subcategory.id, itemGroup.id, checked as boolean)}
                                              ref={(ref) => {
                                                if (ref && isItemGroupSelected(category.id, subcategory.id, itemGroup.id) === 'partial') {
                                                  (ref as any).indeterminate = true
                                                }
                                              }}
                                              disabled={readonly}
                                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            
                                            <div>
                                              <div className="text-sm text-slate-600">{itemGroup.name}</div>
                                              <div className="text-xs text-slate-400">{itemGroupProducts.length} products</div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <CollapsibleContent>
                                          <div className="ml-3 space-y-1">
                                            {/* Individual Products */}
                                            {itemGroupProducts.map(product => {
                                              const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                                              const isSelected = selectedProducts.some(sp => sp.id === instanceId)
                                              
                                              return (
                                                <div key={product.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded group">
                                                  <div className="flex items-center gap-2">
                                                    <Checkbox
                                                      checked={isSelected}
                                                      onCheckedChange={(checked) => {
                                                        if (checked) {
                                                          addProduct(product.id, product.defaultOrderUnit)
                                                        } else {
                                                          removeProduct(instanceId)
                                                        }
                                                      }}
                                                      disabled={readonly}
                                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <div>
                                                      <div className="text-sm text-slate-700">{product.name}</div>
                                                      <div className="text-xs text-slate-500">Default: {product.defaultOrderUnit}</div>
                                                    </div>
                                                  </div>
                                                  {isSelected && (
                                                    <Badge variant="secondary" className="text-xs h-5">
                                                      Selected
                                                    </Badge>
                                                  )}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    )
                                  })}
                                  
                                  {/* Direct subcategory products (no item group) */}
                                  {subcategoryProducts.filter(p => !p.itemGroup).map(product => {
                                    const instanceId = `${product.id}-${product.defaultOrderUnit.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                                    const isSelected = selectedProducts.some(sp => sp.id === instanceId)
                                    
                                    return (
                                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded group">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                addProduct(product.id, product.defaultOrderUnit)
                                              } else {
                                                removeProduct(instanceId)
                                              }
                                            }}
                                            disabled={readonly}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                          />
                                          <div>
                                            <div className="text-sm text-slate-700">{product.name}</div>
                                            <div className="text-xs text-slate-500">Default: {product.defaultOrderUnit}</div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <Badge variant="secondary" className="text-xs h-5">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Selected Products Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-sm font-medium">
                    Selected Items ({selectedProducts.length})
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={readonly}
                  onClick={() => {
                    console.log('🔴 Add Product button clicked!')
                    console.log('🔴 readonly:', readonly)
                    console.log('🔴 showProductModal before:', showProductModal)
                    setShowProductModal(true)
                    console.log('🔴 setShowProductModal(true) called')
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Select Product
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Items that will be included in your pricelist
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No products selected</div>
                  <div className="text-xs mt-1">Select products from the categories to add pricing</div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {selectedProducts.map((instance) => {
                    const product = mockProducts.find(p => p.id === instance.productId)
                    const category = mockCategories.find(cat => cat.id === product?.category)
                    const subcategory = category?.subcategories.find(sub => sub.id === product?.subcategory)
                    const itemGroup = subcategory?.itemGroups?.find(ig => ig.id === product?.itemGroup)
                    const isExpanded = expandedProducts.has(instance.id)
                    
                    return (
                      <div key={instance.id} className="border-b border-slate-100 last:border-b-0">
                        {/* Product Header - Collapsible */}
                        <div 
                          className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => toggleProductExpanded(instance.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <div className="font-medium text-sm text-slate-900">
                              {product?.name || instance.displayName}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {getInstanceMOQTiers(instance.id).length} MOQ tiers
                            </span>
                            {!readonly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeProduct(instance.id)
                                }}
                                className="h-4 w-4 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Product Details */}
                        {isExpanded && (
                          <div className="px-4 pb-3 bg-slate-50 border-t border-slate-200">
                            {/* Category Path */}
                            <div className="text-xs text-slate-500 py-2">
                              {category?.name} → {subcategory?.name}{itemGroup && ` → ${itemGroup.name}`}
                            </div>
                            <div className="text-xs text-slate-400 mb-3">
                              ID: {product?.id || instance.productId}
                            </div>
                            
                            {/* Order Unit Selection */}
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-600">Order Unit:</span>
                              <select 
                                className="text-xs border rounded px-2 py-1"
                                value={instance.orderUnit}
                                onChange={() => {
                                  // Update order unit logic would go here
                                }}
                                disabled={readonly}
                              >
                                {(product?.availableOrderUnits || [instance.orderUnit]).map(unit => (
                                  <option key={unit} value={unit}>{unit}</option>
                                ))}
                              </select>
                              <span className="text-xs text-slate-400">
                                (default: {product?.defaultOrderUnit || instance.orderUnit})
                              </span>
                            </div>
                            
                            {/* MOQ Tiers Section */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-3 w-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">MOQ Tiers</span>
                                {!readonly && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMOQTier(instance.id)}
                                    className="h-5 w-5 p-0 ml-auto text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {getInstanceMOQTiers(instance.id).map((tier, tierIndex) => (
                                  <div key={tier.id} className="bg-white p-2 rounded border border-slate-200">
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                      <div className="col-span-2">
                                        <span className="text-xs text-slate-600">MOQ:</span>
                                        {tierIndex === 0 ? (
                                          <div className="h-6 text-xs border rounded px-2 bg-gray-100 flex items-center text-gray-600 mt-1">
                                            &gt; 0
                                          </div>
                                        ) : (
                                          <Input
                                            type="number"
                                            value={tier.moq || ''}
                                            onChange={(e) => updateMOQTier(instance.id, tierIndex, 'moq', parseFloat(e.target.value) || 0.001)}
                                            className="h-6 text-xs mt-1"
                                            min="0.001"
                                            step="any"
                                            readOnly={readonly}
                                          />
                                        )}
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-xs text-slate-600">Price:</span>
                                        <Input
                                          type="number"
                                          value={tier.unitPrice || ''}
                                          onChange={(e) => updateMOQTier(instance.id, tierIndex, 'unitPrice', parseFloat(e.target.value) || 0)}
                                          className="h-6 text-xs mt-1"
                                          min="0"
                                          step="0.01"
                                          placeholder="0.00"
                                          readOnly={readonly}
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-xs text-slate-600">Unit:</span>
                                        <select
                                          value={tier.unit}
                                          onChange={(e) => updateMOQTier(instance.id, tierIndex, 'unit', e.target.value)}
                                          className="text-xs border rounded px-1 py-0.5 h-6 w-full mt-1"
                                          disabled={readonly}
                                        >
                                          {(product?.availableOrderUnits || [instance.orderUnit]).map(unit => (
                                            <option key={unit} value={unit}>{unit}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="col-span-1">
                                        <span className="text-xs text-slate-600">Days:</span>
                                        <Input
                                          type="number"
                                          value={tier.leadTime || ''}
                                          onChange={(e) => updateMOQTier(instance.id, tierIndex, 'leadTime', parseInt(e.target.value) || 0)}
                                          className="h-6 text-xs mt-1"
                                          min="0"
                                          placeholder="0"
                                          readOnly={readonly}
                                        />
                                      </div>
                                      <div className="col-span-4">
                                        <div className="flex items-end gap-2">
                                          <div className="flex-1">
                                            <span className="text-xs text-slate-600">Notes:</span>
                                            <Input
                                              value={tier.notes || ''}
                                              onChange={(e) => updateMOQTier(instance.id, tierIndex, 'notes', e.target.value)}
                                              className="h-6 text-xs mt-1"
                                              placeholder="Optional"
                                              readOnly={readonly}
                                            />
                                          </div>
                                          {!readonly && tierIndex > 0 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeMOQTier(instance.id, tierIndex)}
                                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Summary Card */}
          {selectedProducts.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm font-semibold text-green-800">
                        {selectedProducts.length} products selected
                      </div>
                      <div className="text-xs text-green-600">
                        Ready for pricing configuration
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    {selectedProducts.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Enhanced Product Selection Modal with Tabs
  const renderProductSelectionModal = () => {
    return (
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Select Products for Pricelist</DialogTitle>
                <DialogDescription>
                  Select products by category or search individually. Choose multiple products to add them all at once.
                </DialogDescription>
              </div>
              {modalSelectedProducts.size > 0 && (
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  {modalSelectedProducts.size} selected
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <Tabs value={activeModalTab} onValueChange={setActiveModalTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-select">Quick Select</TabsTrigger>
              <TabsTrigger value="search-browse">Search & Browse</TabsTrigger>
            </TabsList>
            
            {/* Quick Select Tab - Category Tree View */}
            <TabsContent value="quick-select" className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Select entire categories, subcategories, or individual products
                  </p>
                  {modalSelectedProducts.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearModalSelections}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {/* Category Tree */}
                <div className="border rounded-lg overflow-y-auto" style={{ height: '400px' }}>
                  <div className="p-4 space-y-2">
                    {mockCategories.map(category => {
                      const categoryProducts = mockProducts.filter(p => p.category === category.id)
                      const categorySelectionState = isModalCategorySelected(category.id)
                      
                      return (
                        <Collapsible
                          key={category.id}
                          open={modalExpandedCategories.includes(category.id)}
                          onOpenChange={() => toggleModalCategory(category.id)}
                        >
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  {modalExpandedCategories.includes(category.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              
                              <Checkbox
                                checked={categorySelectionState === 'all'}
                                onCheckedChange={(checked) => selectAllInModalCategory(category.id, checked as boolean)}
                                ref={(ref) => {
                                  if (ref && categorySelectionState === 'partial') {
                                    (ref as any).indeterminate = true
                                  }
                                }}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              
                              <div>
                                <div className="font-medium text-sm">{category.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {categoryProducts.length} products
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <CollapsibleContent>
                            <div className="ml-12 space-y-2 pb-2">
                              {/* Subcategories */}
                              {category.subcategories.map(subcategory => {
                                const subcategoryProducts = categoryProducts.filter(p => p.subcategory === subcategory.id)
                                const subcategorySelectionState = isModalSubcategorySelected(category.id, subcategory.id)
                                
                                return (
                                  <Collapsible
                                    key={subcategory.id}
                                    open={modalExpandedSubcategories.includes(subcategory.id)}
                                    onOpenChange={() => toggleModalSubcategory(subcategory.id)}
                                  >
                                    <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                      <div className="flex items-center gap-2">
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                            {modalExpandedSubcategories.includes(subcategory.id) ? (
                                              <ChevronDown className="h-3 w-3" />
                                            ) : (
                                              <ChevronRight className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </CollapsibleTrigger>
                                        
                                        <Checkbox
                                          checked={subcategorySelectionState === 'all'}
                                          onCheckedChange={(checked) => selectAllInModalSubcategory(category.id, subcategory.id, checked as boolean)}
                                          ref={(ref) => {
                                            if (ref && subcategorySelectionState === 'partial') {
                                              (ref as any).indeterminate = true
                                            }
                                          }}
                                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        
                                        <div>
                                          <div className="text-sm">{subcategory.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {subcategoryProducts.length} products
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <CollapsibleContent>
                                      <div className="ml-6 space-y-1">
                                        {/* Individual Products */}
                                        {subcategoryProducts.map(product => {
                                          const productKey = `${product.id}-${product.defaultOrderUnit}`
                                          const isSelected = modalSelectedProducts.has(productKey)
                                          
                                          return (
                                            <div key={product.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                                              <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                  setModalSelectedProducts(prev => {
                                                    const newSet = new Set(prev)
                                                    if (checked) {
                                                      newSet.add(productKey)
                                                    } else {
                                                      newSet.delete(productKey)
                                                    }
                                                    return newSet
                                                  })
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                              />
                                              <div>
                                                <div className="text-sm">{product.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  Default: {product.defaultOrderUnit}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                )
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Search & Browse Tab - Enhanced Search Interface */}
            <TabsContent value="search-browse" className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, category, or code..."
                    value={modalProductSearch}
                    onChange={(e) => setModalProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product List */}
                <div className="border rounded-lg overflow-y-auto" style={{ height: '400px' }}>
                  {getFilteredProductsForModal().length > 0 ? (
                    <div className="divide-y">
                      {getFilteredProductsForModal().map(product => {
                        const selectedUnit = getSelectedUnitForProduct(product.id)
                        const isAlreadySelected = isProductUnitCombinationSelected(product.id, selectedUnit)
                        const productKey = `${product.id}-${selectedUnit}`
                        const isModalSelected = modalSelectedProducts.has(productKey)
                        
                        return (
                          <div key={product.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Checkbox
                                checked={isModalSelected}
                                onCheckedChange={(checked) => {
                                  setModalSelectedProducts(prev => {
                                    const newSet = new Set(prev)
                                    if (checked) {
                                      newSet.add(productKey)
                                    } else {
                                      newSet.delete(productKey)
                                    }
                                    return newSet
                                  })
                                }}
                                disabled={isAlreadySelected}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {product.category} • {product.subcategory} • ID: {product.id}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-3">
                              {/* Unit Display */}
                              <span className="text-xs text-gray-600">Unit:</span>
                              <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                {selectedUnit}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No products found</div>
                      <div className="text-xs mt-1">Try adjusting your search terms</div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {modalSelectedProducts.size} product{modalSelectedProducts.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Cancel
                </Button>
                {modalSelectedProducts.size > 0 && (
                  <Button onClick={handleBulkAddFromModal}>
                    Select {modalSelectedProducts.size} Product{modalSelectedProducts.size !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!allowProductSelection) {
    // Original single-tab interface for template-based pricelists
    return (
      <>
        <div className="space-y-6">
          {/* Header with Progress */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Product Pricing</h3>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {progress.completedProducts} of {progress.totalProducts} completed
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={readonly}
                onClick={() => {
                  console.log('🔴 Template Add Product button clicked!')
                  console.log('🔴 readonly:', readonly)
                  console.log('🔴 showProductModal before:', showProductModal)
                  setShowProductModal(true)
                  console.log('🔴 setShowProductModal(true) called')
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Select Product
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {progress.completionPercentage}% complete
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          {renderPricingInterface()}
        </div>
        
        {/* Product Selection Modal */}
        {renderProductSelectionModal()}
      </>
    )
  }

  // Direct product selection interface - no tabs
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Product Selection ({selectedProducts.length} selected)</h3>
          </div>
        </div>
        
        {renderProductSelection()}
      </div>
      
      {/* Product Selection Modal */}
      {renderProductSelectionModal()}
    </>
  )
}
