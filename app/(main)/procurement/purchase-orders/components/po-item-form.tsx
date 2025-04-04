'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"

type FormMode = 'add' | 'view' | 'edit'

interface ItemFormProps {
  initialMode?: FormMode
  onClose: () => void
}

export function PurchaseOrderItemFormComponent({ initialMode = 'view', onClose }: ItemFormProps) {
  const [mode, setMode] = useState<FormMode>(initialMode)
  const [formData, setFormData] = useState({
    name: 'Laptop Computer',
    description: 'High-performance laptop with 16GB RAM, 512GB SSD, and 15" display',
    itemOrderUnit: 'Unit',
    baseUnit: 'Piece',
    convRate: 1,
    approvedQty: 10.000,
    baseApprovedQty: 10.000,
    receivedQty: 8.000,
    baseReceivedQty: 8.000,
    foc: 1.000,
    baseFocQty: 1.000,
    cancelQty: 1.000,
    baseCancelQty: 1.000,
    pricePerUnit: 1200.00,
    basePricePerUnit: 1200.00,
    total: 12000.00,
    baseTotal: 12000.00,
    netAmount: 11400.00,
    baseNetAmount: 11400.00,
    baseQty: 10.000,
    discPercentage: 5,
    discAmount: 600.00,
    baseDiscAmount: 600.00,
    taxRate: 7,
    taxAmount: 798.00,
    baseTaxAmount: 798.00,
    totalAmount: 12198.00,
    baseTotalAmount: 12198.00,
    comment: '',
    attachedFile: null as File | null
  })

  const [adjustments, setAdjustments] = useState({
    discount: true,
    tax: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: keyof typeof adjustments) => {
    setAdjustments(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handleModeChange = () => {
    setMode('edit')
  }

  const handleCancel = () => {
    setMode('view')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, attachedFile: file }))
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatNumber = (value: number, decimals: number) => {
    return value.toFixed(decimals)
  }

  const getDisplayValue = (value: string | number | File | null, decimals?: number): string => {
    if (value === null) return '';
    if (typeof value === 'number' && decimals !== undefined) return formatNumber(value, decimals);
    if (typeof value === 'string') return value;
    if (value instanceof File) return value.name;
    return String(value);
  }

  const renderField = (label: string, name: keyof typeof formData, type: string = 'text', baseField?: keyof typeof formData, convRate?: boolean, suffix?: string, decimals?: number) => {
    const value = formData[name]
    const baseValue = baseField ? formData[baseField] : null
    const convRateValue = convRate ? formData.convRate : null
    const displayValue = getDisplayValue(value, decimals)
    const displayBaseValue = baseValue !== null ? getDisplayValue(baseValue, decimals) : null

    if (mode === 'view') {
      return (
        <div className="mb-4">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="mt-1 text-base">{displayValue}{suffix}</div>
          {baseValue && (
            <div className="text-xs text-gray-500 mt-0.5">
              Base: {displayBaseValue}
              {convRateValue && ` (Conv: ${convRateValue})`}
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="mb-4">
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <div className="relative mt-1">
          {type === 'textarea' ? (
            <Textarea
              id={name}
              name={name}
              value={typeof value === 'string' ? value : ''}
              onChange={handleInputChange}
              className="w-full min-h-[100px]"
            />
          ) : (
            <Input
              type={type}
              id={name}
              name={name}
              value={displayValue}
              onChange={handleInputChange}
              className="w-full"
            />
          )}
          {suffix && <span className="absolute right-3 top-1/2 transform -translate-y-1/2">{suffix}</span>}
        </div>
        {baseValue && (
          <div className="text-xs text-gray-500 mt-1">
            Base: {displayBaseValue}
            {convRateValue && ` (Conv: ${convRateValue})`}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[90vw] w-full mx-auto p-8 bg-white rounded-lg shadow-lg relative my-8">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Button>

      <form className="grid grid-cols-12 gap-6 mt-8">
        <div className="col-span-12 flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Item Details</h3>
          {mode === 'view' && (
            <Button onClick={handleModeChange} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>

        <div className="col-span-3">
          {renderField('Name', 'name')}
        </div>
        <div className="col-span-9">
          {renderField('Description', 'description', 'textarea')}
        </div>
        
        <div className="col-span-2">{renderField('Order Unit', 'itemOrderUnit', 'text', 'baseUnit', true)}</div>
        <div className="col-span-2">{renderField('Approved Qty', 'approvedQty', 'number', 'baseApprovedQty', false, '', 3)}</div>
        <div className="col-span-2">{renderField('Received Qty', 'receivedQty', 'number', 'baseReceivedQty', false, '', 3)}</div>
        <div className="col-span-2">{renderField('FOC', 'foc', 'number', 'baseFocQty', false, '', 3)}</div>
        <div className="col-span-2">{renderField('Cancel Qty', 'cancelQty', 'number', 'baseCancelQty', false, '', 3)}</div>
        <div className="col-span-2">{renderField('Price per Unit', 'pricePerUnit', 'number', 'basePricePerUnit', false, '', 2)}</div>

        <div className="col-span-6">
          <h4 className="text-lg font-medium mb-3">Comment</h4>
          <Textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Add your comment here..."
            className="w-full"
            rows={5}
          />
          
          <h4 className="text-lg font-medium mt-6 mb-3">File Attachment</h4>
          <div className="flex items-center space-x-3">
            <Button type="button" onClick={triggerFileUpload} variant="outline" size="lg">
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <span className="text-sm text-gray-500">
              {formData.attachedFile ? formData.attachedFile.name : 'No file chosen'}
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="col-span-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium mb-4">Financial Summary</h4>
            <div className="grid grid-cols-3 gap-y-4">
              <div className="col-span-2 flex items-center">Net Amount</div>
              <div className="col-span-1 text-right">{renderField('', 'netAmount', 'number', 'baseNetAmount', false, '', 2)}</div>
              
              <div className="col-span-1">
                <div className="flex items-center">
                  <Checkbox
                    id="adjDiscount"
                    checked={adjustments.discount}
                    onCheckedChange={() => handleCheckboxChange('discount')}
                  />
                  <label htmlFor="adjDiscount" className="ml-2 text-sm font-medium">Discount</label>
                </div>
              </div>
              <div className="col-span-1">{renderField('', 'discPercentage', 'number', undefined, undefined, '%')}</div>
              <div className="col-span-1 text-right">{renderField('', 'discAmount', 'number', 'baseDiscAmount', false, '', 2)}</div>
              
              <div className="col-span-1">
                <div className="flex items-center">
                  <Checkbox
                    id="adjTax"
                    checked={adjustments.tax}
                    onCheckedChange={() => handleCheckboxChange('tax')}
                  />
                  <label htmlFor="adjTax" className="ml-2 text-sm font-medium">Tax</label>
                </div>
              </div>
              <div className="col-span-1">{renderField('', 'taxRate', 'number', undefined, undefined, '%')}</div>
              <div className="col-span-1 text-right">{renderField('', 'taxAmount', 'number', 'baseTaxAmount', false, '', 2)}</div>
              
              <div className="col-span-2 flex items-center font-bold">Total Amount</div>
              <div className="col-span-1 text-right font-bold">{renderField('', 'totalAmount', 'number', 'baseTotalAmount', false, '', 2)}</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex justify-between items-center mt-6 pt-6 border-t">
          <div className="space-x-3">
            {mode === 'edit' && (
              <>
                <Button type="submit" size="lg">Save Changes</Button>
                <Button type="button" variant="outline" size="lg" onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </div>
          <div className="space-x-3">
            <Button variant="outline">On Hand</Button>
            <Button variant="outline">On Order</Button>
            <Button variant="outline">PR Details</Button>
          </div>
        </div>
      </form>
    </div>
  )
}