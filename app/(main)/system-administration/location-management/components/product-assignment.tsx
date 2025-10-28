'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight, Package, ChevronDown, ChevronRight as ChevronRightIcon, Folder, List, FolderTree } from 'lucide-react'
import { Product } from '@/lib/types'
import { mockProducts } from '@/lib/mock-data'

interface ProductAssignmentProps {
  assignedProductIds: string[]
  onAssignedProductsChange: (productIds: string[]) => void
}

interface CategoryGroup {
  categoryId: string
  categoryName: string
  products: Product[]
  isExpanded: boolean
}

export function ProductAssignment({ assignedProductIds, onAssignedProductsChange }: ProductAssignmentProps) {
  const [viewMode, setViewMode] = useState<'product' | 'category'>('product')
  const [availableSearch, setAvailableSearch] = useState('')
  const [assignedSearch, setAssignedSearch] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Group products by category
  const groupProductsByCategory = (products: Product[]): CategoryGroup[] => {
    const grouped = products.reduce((acc, product) => {
      const categoryId = product.categoryId || 'uncategorized'
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName: categoryId, // We'll use categoryId as name for now
          products: [],
          isExpanded: expandedCategories.has(categoryId)
        }
      }
      acc[categoryId].products.push(product)
      return acc
    }, {} as Record<string, CategoryGroup>)

    return Object.values(grouped).sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }

  // Split products into available and assigned
  const availableProducts = useMemo(() => {
    return mockProducts.filter(product => !assignedProductIds.includes(product.id))
  }, [assignedProductIds])

  const assignedProducts = useMemo(() => {
    return mockProducts.filter(product => assignedProductIds.includes(product.id))
  }, [assignedProductIds])

  // Filter products based on search
  const filteredAvailable = useMemo(() => {
    if (!availableSearch) return availableProducts
    const query = availableSearch.toLowerCase()
    return availableProducts.filter(product =>
      product.productCode.toLowerCase().includes(query) ||
      product.productName.toLowerCase().includes(query)
    )
  }, [availableProducts, availableSearch])

  const filteredAssigned = useMemo(() => {
    if (!assignedSearch) return assignedProducts
    const query = assignedSearch.toLowerCase()
    return assignedProducts.filter(product =>
      product.productCode.toLowerCase().includes(query) ||
      product.productName.toLowerCase().includes(query)
    )
  }, [assignedProducts, assignedSearch])

  // Group products by category for category mode
  const availableCategories = useMemo(() => {
    return groupProductsByCategory(filteredAvailable)
  }, [filteredAvailable, expandedCategories])

  const assignedCategories = useMemo(() => {
    return groupProductsByCategory(filteredAssigned)
  }, [filteredAssigned, expandedCategories])

  // Handle product assignment (move to assigned)
  const handleAssign = () => {
    const newAssigned = [...assignedProductIds, ...selectedAvailable]
    onAssignedProductsChange(newAssigned)
    setSelectedAvailable([])
  }

  // Handle product removal (move to available)
  const handleRemove = () => {
    const newAssigned = assignedProductIds.filter(id => !selectedAssigned.includes(id))
    onAssignedProductsChange(newAssigned)
    setSelectedAssigned([])
  }

  // Toggle selection in available list
  const toggleAvailableSelection = (productId: string) => {
    setSelectedAvailable(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Toggle selection in assigned list
  const toggleAssignedSelection = (productId: string) => {
    setSelectedAssigned(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const ProductListItem = ({
    product,
    isSelected,
    onToggle
  }: {
    product: Product
    isSelected: boolean
    onToggle: (productId: string) => void
  }) => {
    return (
      <label
        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors border ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
        }`}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(product.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          {/* Product Code */}
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {product.productCode}
            </p>
          </div>

          {/* Product Name */}
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate ml-6 mb-1">
            {product.productName}
          </p>

          {/* Product Details */}
          <div className="ml-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="truncate">{product.categoryId || 'No category'}</span>
            <span className="mx-1">•</span>
            <span>{product.baseUnit}</span>
          </div>
        </div>
      </label>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={viewMode === 'product' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('product')}
        >
          <List className="h-4 w-4 mr-2" />
          Product Mode
        </Button>
        <Button
          type="button"
          variant={viewMode === 'category' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('category')}
        >
          <FolderTree className="h-4 w-4 mr-2" />
          Category Mode
        </Button>
      </div>

      {/* Product Mode View */}
      {viewMode === 'product' && (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* Assigned Products Pane (Left) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Assigned Products
                </h3>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                  <Checkbox
                    checked={selectedAssigned.length === filteredAssigned.length && filteredAssigned.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAssigned(filteredAssigned.map(p => p.id))
                      } else {
                        setSelectedAssigned([])
                      }
                    }}
                    className="h-3.5 w-3.5"
                  />
                  Select All
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search assigned..."
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="p-3 space-y-1 h-96 overflow-y-auto">
              {filteredAssigned.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No products assigned
                </p>
              ) : (
                filteredAssigned.map(product => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    isSelected={selectedAssigned.includes(product.id)}
                    onToggle={toggleAssignedSelection}
                  />
                ))
              )}
            </div>
          </div>

          {/* Action Buttons (Center) */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Button
              type="button"
              size="icon"
              onClick={handleAssign}
              disabled={selectedAvailable.length === 0}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleRemove}
              disabled={selectedAssigned.length === 0}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Available Products Pane (Right) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Available Products
                </h3>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                  <Checkbox
                    checked={selectedAvailable.length === filteredAvailable.length && filteredAvailable.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAvailable(filteredAvailable.map(p => p.id))
                      } else {
                        setSelectedAvailable([])
                      }
                    }}
                    className="h-3.5 w-3.5"
                  />
                  Select All
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="p-3 space-y-1 h-96 overflow-y-auto">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No products available
                </p>
              ) : (
                filteredAvailable.map(product => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    isSelected={selectedAvailable.includes(product.id)}
                    onToggle={toggleAvailableSelection}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Mode View */}
      {viewMode === 'category' && (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* Assigned Products by Category (Left) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Assigned Products
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search assigned..."
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="p-3 space-y-1 h-96 overflow-y-auto">
              {assignedCategories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No products assigned
                </p>
              ) : (
                assignedCategories.map(category => (
                  <div key={category.categoryId} className="space-y-1">
                    {/* Category Header */}
                    <div
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => toggleCategory(category.categoryId)}
                    >
                      {expandedCategories.has(category.categoryId) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <Folder className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.categoryName}
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.products.length}
                      </Badge>
                    </div>

                    {/* Category Products */}
                    {expandedCategories.has(category.categoryId) && (
                      <div className="ml-6 space-y-1">
                        {category.products.map(product => (
                          <label
                            key={product.id}
                            className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors border ${
                              selectedAssigned.includes(product.id)
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Checkbox
                              checked={selectedAssigned.includes(product.id)}
                              onCheckedChange={() => toggleAssignedSelection(product.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {product.productName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {product.productCode}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons (Center) */}
          <div className="flex flex-col items-center justify-center gap-3">
            <Button
              type="button"
              size="icon"
              onClick={handleAssign}
              disabled={selectedAvailable.length === 0}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleRemove}
              disabled={selectedAssigned.length === 0}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Available Products by Category (Right) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Available Products
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="p-3 space-y-1 h-96 overflow-y-auto">
              {availableCategories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No products available
                </p>
              ) : (
                availableCategories.map(category => (
                  <div key={category.categoryId} className="space-y-1">
                    {/* Category Header */}
                    <div
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => toggleCategory(category.categoryId)}
                    >
                      {expandedCategories.has(category.categoryId) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <Folder className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.categoryName}
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category.products.length}
                      </Badge>
                    </div>

                    {/* Category Products */}
                    {expandedCategories.has(category.categoryId) && (
                      <div className="ml-6 space-y-1">
                        {category.products.map(product => (
                          <label
                            key={product.id}
                            className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors border ${
                              selectedAvailable.includes(product.id)
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Checkbox
                              checked={selectedAvailable.includes(product.id)}
                              onCheckedChange={() => toggleAvailableSelection(product.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {product.productName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {product.productCode}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
