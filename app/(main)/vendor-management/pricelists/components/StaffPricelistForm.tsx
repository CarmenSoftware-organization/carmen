'use client'

// Reusable Staff Pricelist Form Component
// Shared form logic for creating and editing pricelists by staff

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Trash2,
  Search,
  Package,
  User,
  AlertCircle
} from 'lucide-react'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { VendorPricelist, PricelistItem, MOQPricing } from '../../types'
import { mockProducts, mockVendors } from '../../lib/mock-data'

interface StaffPricelistFormProps {
  pricelist: VendorPricelist
  onUpdate: (updatedPricelist: VendorPricelist) => void
  onSave: (status?: 'draft' | 'submitted' | 'approved') => Promise<void>
  isLoading?: boolean
  mode: 'create' | 'edit'
}

interface ProductSearchResult {
  id: string
  name: string
  code: string
  category: string
  subcategory: string
}

export default function StaffPricelistForm({ 
  pricelist, 
  onUpdate, 
  onSave, 
  isLoading = false,
  mode 
}: StaffPricelistFormProps) {
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [newItem, setNewItem] = useState<Partial<PricelistItem>>({
    productName: '',
    productCode: '',
    productDescription: '',
    category: '',
    subcategory: '',
    currency: pricelist.currency,
    pricing: [{
      id: '',
      moq: 1,
      unit: 'pieces',
      unitPrice: 0,
      conversionFactor: 1,
      leadTime: 1,
      notes: ''
    }],
    notes: '',
    status: 'draft'
  })

  const vendor = mockVendors.find(v => v.id === pricelist.vendorId)

  // Product search functionality
  const searchProducts = (): ProductSearchResult[] => {
    return mockProducts
      .filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(productSearchTerm.toLowerCase())
      )
      .map(product => ({
        id: product.id,
        name: product.name,
        code: product.id.toUpperCase(),
        category: product.category,
        subcategory: product.subcategory
      }))
      .slice(0, 10) // Limit results
  }

  const handleUpdatePricelist = (field: keyof VendorPricelist, value: any) => {
    const updatedPricelist = {
      ...pricelist,
      [field]: value,
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleUpdateItem = (itemId: string, field: keyof PricelistItem, value: any) => {
    const updatedPricelist = {
      ...pricelist,
      items: pricelist.items.map(item =>
        item.id === itemId
          ? { ...item, [field]: value, lastModified: new Date() }
          : item
      ),
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleUpdatePricing = (itemId: string, pricingIndex: number, field: keyof MOQPricing, value: any) => {
    const updatedPricelist = {
      ...pricelist,
      items: pricelist.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              pricing: item.pricing.map((pricing, index) =>
                index === pricingIndex
                  ? { ...pricing, [field]: value }
                  : pricing
              ),
              lastModified: new Date()
            }
          : item
      ),
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleAddPricingTier = (itemId: string) => {
    const newTier: MOQPricing = {
      id: Date.now().toString(),
      moq: 1,
      unit: 'pieces',
      unitPrice: 0,
      conversionFactor: 1,
      leadTime: 1,
      notes: ''
    }

    const updatedPricelist = {
      ...pricelist,
      items: pricelist.items.map(item =>
        item.id === itemId
          ? { ...item, pricing: [...item.pricing, newTier], lastModified: new Date() }
          : item
      ),
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleRemovePricingTier = (itemId: string, pricingIndex: number) => {
    const updatedPricelist = {
      ...pricelist,
      items: pricelist.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              pricing: item.pricing.filter((_, index) => index !== pricingIndex),
              lastModified: new Date()
            }
          : item
      ),
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleRemoveItem = (itemId: string) => {
    const updatedPricelist = {
      ...pricelist,
      items: pricelist.items.filter(item => item.id !== itemId),
      totalItems: pricelist.totalItems - 1,
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)
  }

  const handleSelectProduct = (product: ProductSearchResult) => {
    setNewItem({
      productName: product.name,
      productCode: product.code,
      productDescription: `${product.name} from ${product.category}`,
      category: product.category,
      subcategory: product.subcategory,
      currency: pricelist.currency,
      pricing: [{
        id: '',
        moq: 1,
        unit: 'pieces',
        unitPrice: 0,
        conversionFactor: 1,
        leadTime: 1,
        notes: ''
      }],
      notes: '',
      status: 'draft'
    })
    setShowProductSearch(false)
    setShowAddItemDialog(true)
  }

  const handleAddItem = () => {
    if (!newItem.productName || !newItem.productCode) {
      toast({
        title: 'Validation Error',
        description: 'Product name and code are required',
        variant: 'destructive'
      })
      return
    }

    const item: PricelistItem = {
      id: Date.now().toString(),
      productId: newItem.productCode?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '',
      productCode: newItem.productCode || '',
      productName: newItem.productName || '',
      productDescription: newItem.productDescription || '',
      category: newItem.category || 'general',
      subcategory: newItem.subcategory || 'general',
      pricing: newItem.pricing || [],
      currency: pricelist.currency,
      leadTime: newItem.pricing?.[0]?.leadTime || 1,
      notes: newItem.notes || '',
      customFieldValues: {},
      status: 'draft',
      qualityScore: 85,
      lastModified: new Date()
    }

    const updatedPricelist = {
      ...pricelist,
      items: [...pricelist.items, item],
      totalItems: pricelist.totalItems + 1,
      updatedAt: new Date()
    }
    onUpdate(updatedPricelist)

    // Reset form
    setNewItem({
      productName: '',
      productCode: '',
      productDescription: '',
      category: '',
      subcategory: '',
      currency: pricelist.currency,
      pricing: [{
        id: '',
        moq: 1,
        unit: 'pieces',
        unitPrice: 0,
        conversionFactor: 1,
        leadTime: 1,
        notes: ''
      }],
      notes: '',
      status: 'draft'
    })
    setShowAddItemDialog(false)

    toast({
      title: 'Item Added',
      description: 'New item has been added to the pricelist'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Staff Action Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Staff Override Mode</div>
              <div className="text-sm text-blue-700">
                You are {mode === 'create' ? 'creating' : 'editing'} this pricelist on behalf of {vendor?.name || 'the vendor'}. 
                All changes will be logged for audit purposes.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricelist Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pricelistNumber">Pricelist Number</Label>
              <Input
                id="pricelistNumber"
                value={pricelist.pricelistNumber}
                onChange={(e) => handleUpdatePricelist('pricelistNumber', e.target.value)}
                disabled={mode === 'edit'}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={pricelist.currency} 
                onValueChange={(value) => handleUpdatePricelist('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BHT">BHT</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={pricelist.status} 
                onValueChange={(value) => handleUpdatePricelist('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={pricelist.validFrom.toISOString().split('T')[0]}
                onChange={(e) => handleUpdatePricelist('validFrom', new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                type="date"
                value={pricelist.validTo.toISOString().split('T')[0]}
                onChange={(e) => handleUpdatePricelist('validTo', new Date(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium">{vendor?.name || 'Unknown Vendor'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{vendor?.contactEmail || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating:</span>
              <span className="font-medium">{((vendor?.performanceMetrics?.qualityScore || 0) / 20).toFixed(1)}/5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Items ({pricelist.items.length})</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setShowProductSearch(true)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowAddItemDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pricelist.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No items in this pricelist</div>
                <p className="text-xs mt-1">Add items using the buttons above</p>
              </div>
            ) : (
              pricelist.items.map((item) => (
                <Card key={item.id} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.productCode} • {item.category}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Product Name</Label>
                          <Input
                            value={item.productName}
                            onChange={(e) => handleUpdateItem(item.id, 'productName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Product Code</Label>
                          <Input
                            value={item.productCode}
                            onChange={(e) => handleUpdateItem(item.id, 'productCode', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={item.productDescription}
                          onChange={(e) => handleUpdateItem(item.id, 'productDescription', e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Pricing Tiers */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-base font-medium">Pricing Tiers</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPricingTier(item.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Tier
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {item.pricing.map((pricing, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg bg-gray-50">
                              <div>
                                <Label className="text-xs">MOQ</Label>
                                <Input
                                  type="number"
                                  value={pricing.moq}
                                  onChange={(e) => handleUpdatePricing(item.id, index, 'moq', parseInt(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Unit</Label>
                                <Input
                                  value={pricing.unit}
                                  onChange={(e) => handleUpdatePricing(item.id, index, 'unit', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Unit Price ({pricelist.currency})</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={pricing.unitPrice}
                                  onChange={(e) => handleUpdatePricing(item.id, index, 'unitPrice', parseFloat(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Lead Time (days)</Label>
                                <Input
                                  type="number"
                                  value={pricing.leadTime || 1}
                                  onChange={(e) => handleUpdatePricing(item.id, index, 'leadTime', parseInt(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Notes</Label>
                                <Input
                                  value={pricing.notes || ''}
                                  onChange={(e) => handleUpdatePricing(item.id, index, 'notes', e.target.value)}
                                />
                              </div>
                              <div className="flex items-end">
                                {item.pricing.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePricingTier(item.id, index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Item Notes</Label>
                        <Textarea
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Search Dialog */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Products</DialogTitle>
            <DialogDescription>
              Search for existing products to add to this pricelist
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name or ID..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchProducts().map((product) => (
                <div
                  key={product.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.code} • {product.category} › {product.subcategory}</div>
                </div>
              ))}
              {productSearchTerm && searchProducts().length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm">No products found</div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductSearch(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new product item to this pricelist
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newProductName">Product Name *</Label>
                <Input
                  id="newProductName"
                  value={newItem.productName}
                  onChange={(e) => setNewItem(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="newProductCode">Product Code *</Label>
                <Input
                  id="newProductCode"
                  value={newItem.productCode}
                  onChange={(e) => setNewItem(prev => ({ ...prev, productCode: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="newProductDescription">Description</Label>
              <Textarea
                id="newProductDescription"
                value={newItem.productDescription}
                onChange={(e) => setNewItem(prev => ({ ...prev, productDescription: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newCategory">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newSubcategory">Subcategory</Label>
                <Input
                  id="newSubcategory"
                  value={newItem.subcategory}
                  onChange={(e) => setNewItem(prev => ({ ...prev, subcategory: e.target.value }))}
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-base font-medium mb-3 block">Initial Pricing</Label>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">MOQ</Label>
                  <Input
                    type="number"
                    value={newItem.pricing?.[0]?.moq || 1}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      pricing: [{
                        ...prev.pricing![0],
                        moq: parseInt(e.target.value)
                      }]
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Input
                    value={newItem.pricing?.[0]?.unit || 'pieces'}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      pricing: [{
                        ...prev.pricing![0],
                        unit: e.target.value
                      }]
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit Price ({pricelist.currency})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.pricing?.[0]?.unitPrice || 0}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      pricing: [{
                        ...prev.pricing![0],
                        unitPrice: parseFloat(e.target.value)
                      }]
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Lead Time (days)</Label>
                  <Input
                    type="number"
                    value={newItem.pricing?.[0]?.leadTime || 1}
                    onChange={(e) => setNewItem(prev => ({
                      ...prev,
                      pricing: [{
                        ...prev.pricing![0],
                        leadTime: parseInt(e.target.value)
                      }]
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}