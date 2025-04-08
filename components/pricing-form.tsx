import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

"use client"


interface PricingFormData {
  currency: string
  exchangeRate: number
  price: number
  enableAdjustment: boolean
  discountRate: number
  overrideDiscount: number | null
  taxRate: number
  overrideTax: number | null
}

type FormMode = 'add' | 'edit' | 'view'

const initialFormData: PricingFormData = {
  currency: 'USD',
  exchangeRate: 1,
  price: 3.99,
  enableAdjustment: false,
  discountRate: 5,
  overrideDiscount: null,
  taxRate: 7,
  overrideTax: null
}

export function PricingFormComponent() {
  const [formData, setFormData] = useState<PricingFormData>(initialFormData)
  const [mode, setMode] = useState<FormMode>('view')

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    baseAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : parseFloat(value) || value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode)
    if (newMode === 'add') {
      setFormData(initialFormData)
    }
  }

  useEffect(() => {
    const quantity = 450 // Assuming 450 is the quantity as per the image calculations
    const baseAmount = formData.price * quantity
    const discountAmount = (formData.overrideDiscount !== null) 
      ? formData.overrideDiscount 
      : baseAmount * (formData.discountRate / 100)
    const netAmount = baseAmount - discountAmount
    const taxAmount = (formData.overrideTax !== null)
      ? formData.overrideTax
      : netAmount * (formData.taxRate / 100)
    const totalAmount = netAmount + taxAmount

    setCalculatedAmounts({
      baseAmount,
      discountAmount,
      netAmount,
      taxAmount,
      totalAmount
    })
  }, [formData])

  const isViewMode = mode === 'view'

  const formatAmount = (amount: number, currency: string) => {
    const baseAmount = amount / formData.exchangeRate
    return (
      <div className="flex items-center justify-end space-x-2">
        <span className="text-xs text-gray-500">USD {baseAmount.toFixed(2)}</span>
        <span>{currency}</span>
        <span className="tabular-nums">{amount.toFixed(2)}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end space-x-2 mb-4">
        <Button onClick={() => handleModeChange('view')} variant={mode === 'view' ? 'default' : 'outline'}>View</Button>
        <Button onClick={() => handleModeChange('edit')} variant={mode === 'edit' ? 'default' : 'outline'}>Edit</Button>
        <Button onClick={() => handleModeChange('add')} variant={mode === 'add' ? 'default' : 'outline'}>Add</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end space-x-4">
                <div className="w-1/4">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-1/4">
                  <Label htmlFor="exchangeRate">Exch. Rate</Label>
                  <Input
                    type="number"
                    id="exchangeRate"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
                <div className="w-2/4">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableAdjustment"
                  name="enableAdjustment"
                  checked={formData.enableAdjustment}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAdjustment: checked as boolean }))}
                  disabled={isViewMode}
                />
                <Label htmlFor="enableAdjustment">Enable adjustment</Label>
              </div>
              <div className="flex items-end space-x-4">
                <div className="w-1/4">
                  <Label htmlFor="discountRate">Disc. Rate (%)</Label>
                  <Input
                    type="number"
                    id="discountRate"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
                <div className="w-3/4">
                  <Label htmlFor="overrideDiscount">Override Discount</Label>
                  <Input
                    type="number"
                    id="overrideDiscount"
                    name="overrideDiscount"
                    value={formData.overrideDiscount ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter to override"
                    disabled={isViewMode}
                  />
                </div>
              </div>
              <div className="flex items-end space-x-4">
                <div className="w-1/4">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
                <div className="w-3/4">
                  <Label htmlFor="overrideTax">Override Tax</Label>
                  <Input
                    type="number"
                    id="overrideTax"
                    name="overrideTax"
                    value={formData.overrideTax ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter to override"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Calculated Amounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base Amount:</span>
                {formatAmount(calculatedAmounts.baseAmount, formData.currency)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Discount Amount:</span>
                {formatAmount(calculatedAmounts.discountAmount, formData.currency)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Net Amount:</span>
                {formatAmount(calculatedAmounts.netAmount, formData.currency)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tax Amount:</span>
                {formatAmount(calculatedAmounts.taxAmount, formData.currency)}
              </div>
              <div className="flex justify-between items-center font-medium">
                <span className="text-sm">Total Amount:</span>
                {formatAmount(calculatedAmounts.totalAmount, formData.currency)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 bg-gray-100 p-3 rounded-md flex justify-between items-center text-sm text-gray-600">
        <span>Last Price: $3.85 per Kg</span>
        <span>Last Order Date: 2023-05-15</span>
        <span>Last Vendor: Organic Supplies Inc.</span>
      </div>
    </div>
  )
}