'use client'

// Add Pricelist Page
// Simplified form based on the edit pricelist structure

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  User,
  AlertCircle,
  Package,
  DollarSign
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
import { toast } from 'sonner'
import { VendorPricelist, PricelistItem, MOQPricing } from '../../types'
import { mockVendors } from '../../lib/mock-data'

interface NewPricelistFormData {
  pricelistNumber: string
  vendorId: string
  currency: string
  validFrom: string
  validTo: string
  submissionNotes: string
  items: PricelistItem[]
}

export default function AddPricelistPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<NewPricelistFormData>({
    pricelistNumber: '',
    vendorId: '',
    currency: 'USD',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    submissionNotes: '',
    items: []
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [newItem, setNewItem] = useState<Partial<PricelistItem>>({
    productName: '',
    productCode: '',
    productDescription: '',
    category: '',
    subcategory: '',
    currency: formData.currency,
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

  // Check for copied pricelist data on component mount
  useEffect(() => {
    const copiedData = sessionStorage.getItem('copiedPricelistData')
    if (copiedData) {
      try {
        const parsed = JSON.parse(copiedData)
        setFormData(prev => ({
          ...prev,
          pricelistNumber: '', // Keep empty for new pricelist
          vendorId: parsed.vendorId || '',
          currency: parsed.currency || 'USD',
          validFrom: parsed.validFrom || prev.validFrom,
          validTo: parsed.validTo || prev.validTo,
          submissionNotes: `Copied from pricelist: ${parsed.pricelistNumber || 'Original'}`,
          items: parsed.items || []
        }))
        
        // Clear the session storage after use
        sessionStorage.removeItem('copiedPricelistData')
        
        toast.success(`Pre-populated with data from "${parsed.name}"`)
      } catch (error) {
        console.error('Error parsing copied data:', error)
        sessionStorage.removeItem('copiedPricelistData')
      }
    }
  }, [])

  const selectedVendor = mockVendors.find(v => v.id === formData.vendorId)

  const updateFormData = (field: keyof NewPricelistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateItem = (itemId: string, field: keyof PricelistItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, [field]: value, lastModified: new Date() }
          : item
      )
    }))
  }

  const handleUpdatePricing = (itemId: string, pricingIndex: number, field: keyof MOQPricing, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
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
      )
    }))
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

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, pricing: [...item.pricing, newTier], lastModified: new Date() }
          : item
      )
    }))
  }

  const handleRemovePricingTier = (itemId: string, pricingIndex: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              pricing: item.pricing.filter((_, index) => index !== pricingIndex),
              lastModified: new Date()
            }
          : item
      )
    }))
  }

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const handleAddItem = () => {
    if (!newItem.productName || !newItem.productCode) {
      toast.error('Product name and code are required')
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
      currency: formData.currency,
      leadTime: newItem.pricing?.[0]?.leadTime || 1,
      notes: newItem.notes || '',
      customFieldValues: {},
      status: 'draft',
      qualityScore: 85,
      lastModified: new Date()
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))

    setNewItem({
      productName: '',
      productCode: '',
      productDescription: '',
      category: '',
      subcategory: '',
      currency: formData.currency,
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

    toast.success('Item added successfully')
  }

  const handleSave = async (shouldSubmit = false) => {
    if (!formData.vendorId) {
      toast.error('Please select a vendor')
      return
    }

    if (!formData.validFrom || !formData.validTo) {
      toast.error('Please set validity dates')
      return
    }

    setIsSaving(true)
    try {
      const pricelistId = `pl-${Date.now()}`
      const pricelistNumber = formData.pricelistNumber || `PL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      const newPricelist: Partial<VendorPricelist> = {
        id: pricelistId,
        pricelistNumber,
        vendorId: formData.vendorId,
        currency: formData.currency,
        status: shouldSubmit ? 'submitted' : 'draft',
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        submissionNotes: formData.submissionNotes,
        items: formData.items,
        createdAt: new Date(),
        updatedAt: new Date(),
        completionPercentage: 0,
        qualityScore: 0,
        totalItems: formData.items.length,
        completedItems: formData.items.length,
        version: 1
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(shouldSubmit ? 'Pricelist has been submitted' : 'Pricelist created successfully')
      
      // Redirect to the newly created pricelist
      router.push(`/vendor-management/pricelists/${pricelistId}`)

    } catch (error) {
      console.error('Error creating pricelist:', error)
      toast.error('Failed to create pricelist. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Create New Pricelist</h1>
              <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Create a new pricelist for vendor submission
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            size="sm"
            onClick={() => handleSave(true)}
            disabled={isSaving || !formData.vendorId}
          >
            Create & Submit
          </Button>
        </div>
      </div>

      {/* Creation Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Creating New Pricelist</div>
              <div className="text-sm text-blue-700">
                Fill in the basic information and add product items to create a complete pricelist.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Details */}
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
                value={formData.pricelistNumber}
                onChange={(e) => updateFormData('pricelistNumber', e.target.value)}
                placeholder="Leave empty to auto-generate"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => updateFormData('currency', value)}
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
                value={formData.validFrom}
                onChange={(e) => updateFormData('validFrom', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo}
                onChange={(e) => updateFormData('validTo', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select 
                value={formData.vendorId} 
                onValueChange={(value) => updateFormData('vendorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {mockVendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVendor && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{selectedVendor.contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span>{selectedVendor.preferredCurrency}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.submissionNotes}
            onChange={(e) => updateFormData('submissionNotes', e.target.value)}
            placeholder="Add any notes or instructions for this pricelist..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Items ({formData.items.length})</CardTitle>
            <Button 
              size="sm"
              onClick={() => setShowAddItemDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet</p>
              <p className="text-sm">Click &quot;Add Item&quot; to start building your pricelist</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.items.map((item) => (
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
                                <Label className="text-xs">Unit Price ({formData.currency})</Label>
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
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Label className="text-xs">Unit Price ({formData.currency})</Label>
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