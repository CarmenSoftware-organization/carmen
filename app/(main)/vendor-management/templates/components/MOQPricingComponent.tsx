'use client'

// MOQ Pricing Component
// Phase 2 Task 5 - Multi-MOQ template structure support

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Minus, 
  DollarSign, 
  Package, 
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOQPricing } from '../../types'

interface MOQPricingComponentProps {
  pricing: MOQPricing[]
  currency: string
  requireLeadTime: boolean
  onChange: (pricing: MOQPricing[]) => void
  productId: string
  productName: string
}

const CURRENCY_SYMBOLS = {
  'BHT': '฿',
  'USD': '$',
  'CNY': '¥',
  'SGD': 'S$'
} as const

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'cases', label: 'Cases' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (mL)' }
]

export default function MOQPricingComponent({
  pricing,
  currency,
  requireLeadTime,
  onChange,
  productId,
  productName
}: MOQPricingComponentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency

  const validatePricing = (pricingData: MOQPricing[]): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    pricingData.forEach((tier, index) => {
      const prefix = `tier-${index}`

      // Validate MOQ
      if (!tier.moq || tier.moq <= 0) {
        newErrors[`${prefix}-moq`] = 'MOQ must be greater than 0'
      }

      // Validate unit price
      if (!tier.unitPrice || tier.unitPrice <= 0) {
        newErrors[`${prefix}-price`] = 'Unit price must be greater than 0'
      }

      // Validate unit
      if (!tier.unit || tier.unit.trim() === '') {
        newErrors[`${prefix}-unit`] = 'Unit is required'
      }

      // Validate lead time if required
      if (requireLeadTime && (!tier.leadTime || tier.leadTime <= 0)) {
        newErrors[`${prefix}-leadTime`] = 'Lead time must be greater than 0'
      }

      // Validate MOQ progression (each tier should have higher MOQ than previous)
      if (index > 0) {
        const prevTier = pricingData[index - 1]
        if (tier.moq <= prevTier.moq) {
          newErrors[`${prefix}-moq`] = 'MOQ must be higher than previous tier'
        }
      }
    })

    return newErrors
  }

  const updateTier = (index: number, field: keyof MOQPricing, value: any) => {
    const updatedPricing = [...pricing]
    updatedPricing[index] = {
      ...updatedPricing[index],
      [field]: value
    }

    // Clear error for this field
    const errorKey = `tier-${index}-${field}`
    if (errors[errorKey]) {
      const newErrors = { ...errors }
      delete newErrors[errorKey]
      setErrors(newErrors)
    }

    onChange(updatedPricing)
  }

  const addTier = () => {
    const newTier: MOQPricing = {
      id: Date.now().toString(),
      moq: pricing.length > 0 ? pricing[pricing.length - 1].moq + 100 : 100,
      unit: pricing.length > 0 ? pricing[pricing.length - 1].unit : 'kg',
      unitPrice: 0,
      leadTime: requireLeadTime ? 7 : undefined,
      notes: ''
    }

    onChange([...pricing, newTier])
  }

  const removeTier = (index: number) => {
    if (pricing.length > 1) {
      const updatedPricing = pricing.filter((_, i) => i !== index)
      onChange(updatedPricing)
      
      // Clear errors for removed tier
      const newErrors = { ...errors }
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`tier-${index}-`)) {
          delete newErrors[key]
        }
      })
      setErrors(newErrors)
    }
  }

  const validateAll = () => {
    const newErrors = validatePricing(pricing)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getTierSavings = (index: number): number => {
    if (index === 0) return 0
    const baseTier = pricing[0]
    const currentTier = pricing[index]
    if (!baseTier?.unitPrice || !currentTier?.unitPrice) return 0
    return ((baseTier.unitPrice - currentTier.unitPrice) / baseTier.unitPrice) * 100
  }

  const getDiscountBadgeColor = (savings: number): string => {
    if (savings >= 15) return 'bg-green-100 text-green-800'
    if (savings >= 10) return 'bg-blue-100 text-blue-800'
    if (savings >= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          MOQ Pricing Structure
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Configure multiple pricing tiers for {productName}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricing.map((tier, index) => {
          const savings = getTierSavings(index)
          
          return (
            <Card key={tier.id} className={`${index === 0 ? 'border-blue-200' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      Tier {index + 1}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="text-blue-600">
                        Base Price
                      </Badge>
                    )}
                    {savings > 0 && (
                      <Badge className={getDiscountBadgeColor(savings)}>
                        {savings.toFixed(1)}% savings
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pricing.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTier(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* MOQ */}
                  <div>
                    <Label htmlFor={`moq-${index}`}>
                      Minimum Order Quantity *
                    </Label>
                    <Input
                      id={`moq-${index}`}
                      type="number"
                      value={tier.moq}
                      onChange={(e) => updateTier(index, 'moq', parseInt(e.target.value) || 0)}
                      className={`mt-1 ${errors[`tier-${index}-moq`] ? 'border-red-500' : ''}`}
                      placeholder="Enter MOQ"
                      min="1"
                    />
                    {errors[`tier-${index}-moq`] && (
                      <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[`tier-${index}-moq`]}
                      </div>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <Label htmlFor={`unit-${index}`}>
                      Unit *
                    </Label>
                    <Select
                      value={tier.unit}
                      onValueChange={(value) => updateTier(index, 'unit', value)}
                    >
                      <SelectTrigger className={`mt-1 ${errors[`tier-${index}-unit`] ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`tier-${index}-unit`] && (
                      <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[`tier-${index}-unit`]}
                      </div>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <Label htmlFor={`price-${index}`}>
                      Unit Price ({currencySymbol}) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        value={tier.unitPrice}
                        onChange={(e) => updateTier(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className={`mt-1 pl-10 ${errors[`tier-${index}-price`] ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                        min="0.01"
                      />
                    </div>
                    {errors[`tier-${index}-price`] && (
                      <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[`tier-${index}-price`]}
                      </div>
                    )}
                  </div>

                  {/* Lead Time */}
                  {requireLeadTime && (
                    <div>
                      <Label htmlFor={`leadTime-${index}`}>
                        Lead Time (Days) *
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`leadTime-${index}`}
                          type="number"
                          value={tier.leadTime || ''}
                          onChange={(e) => updateTier(index, 'leadTime', parseInt(e.target.value) || 0)}
                          className={`mt-1 pl-10 ${errors[`tier-${index}-leadTime`] ? 'border-red-500' : ''}`}
                          placeholder="7"
                          min="1"
                        />
                      </div>
                      {errors[`tier-${index}-leadTime`] && (
                        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors[`tier-${index}-leadTime`]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conversion Factor */}
                  <div>
                    <Label htmlFor={`conversion-${index}`}>
                      Conversion Factor
                    </Label>
                    <Input
                      id={`conversion-${index}`}
                      type="number"
                      step="0.01"
                      value={tier.conversionFactor || ''}
                      onChange={(e) => updateTier(index, 'conversionFactor', parseFloat(e.target.value) || undefined)}
                      className="mt-1"
                      placeholder="1.0"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Optional: For unit conversion (e.g., 1 box = 12 pieces)
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor={`notes-${index}`}>
                    Notes
                  </Label>
                  <Input
                    id={`notes-${index}`}
                    value={tier.notes || ''}
                    onChange={(e) => updateTier(index, 'notes', e.target.value)}
                    className="mt-1"
                    placeholder="Additional notes for this pricing tier"
                  />
                </div>

                {/* Tier Summary */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Tier {index + 1} Summary
                  </div>
                  <div className="text-xs text-gray-600">
                    Order {tier.moq.toLocaleString()} {tier.unit} or more at {currencySymbol}{tier.unitPrice.toFixed(2)} per {tier.unit}
                    {requireLeadTime && tier.leadTime && ` with ${tier.leadTime} day lead time`}
                  </div>
                  {savings > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Save {savings.toFixed(1)}% compared to base price
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add New Tier Button */}
        {pricing.length < 5 && (
          <Button
            variant="outline"
            onClick={addTier}
            className="w-full border-dashed border-2 h-12"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Pricing Tier
          </Button>
        )}

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Please fix the following errors:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Pricing Tips */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Info className="h-4 w-4" />
              <span className="font-medium">Pricing Tips:</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Higher MOQ tiers should offer better unit prices to incentivize larger orders</li>
              <li>• Consider your storage capacity and cash flow when setting MOQ levels</li>
              <li>• Lead times may vary by quantity - larger orders might need more preparation time</li>
              <li>• Use conversion factors for products sold in different units (e.g., cases vs. individual items)</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}