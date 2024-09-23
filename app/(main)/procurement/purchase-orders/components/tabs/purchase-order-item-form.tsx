'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type FormMode = 'view' | 'edit' | 'add'

interface Item {
  id: string
  code: string
  description: string
  orderedQuantity: number
  orderUnit: string
  baseQuantity: number
  baseUnit: string
  baseReceivingQty: number
  receivedQuantity: number
  remainingQuantity: number
  unitPrice: number
  totalPrice: number
  status: 'Not Received' | 'Partially Received' | 'Fully Received'
  isFOC: boolean
  name: string
  itemOrderUnit: string
  approvedQty: number
  baseApprovedQty: number
  foc: number
  baseFocQty: number
  cancelQty: number
  baseCancelQty: number
  pricePerUnit: number
  basePricePerUnit: number
  netAmount: number
  baseNetAmount: number
  discPercentage: number
  discAmount: number
  baseDiscAmount: number
  taxRate: number
  taxAmount: number
  baseTaxAmount: number
  totalAmount: number
  baseTotalAmount: number
  comment: string
  attachedFile: File | null
}

interface ItemFormProps {
  initialMode: FormMode
  onClose: () => void
  initialData?: Item
  onSubmit?: (item: Item) => void
  isOpen: boolean
}

const sampleItem: Item = {
  id: '1',
  code: 'ITEM001',
  description: 'Sample Item Description',
  orderedQuantity: 10,
  orderUnit: 'pcs',
  baseQuantity: 10,
  baseUnit: 'pcs',
  baseReceivingQty: 0,
  receivedQuantity: 0,
  remainingQuantity: 10,
  unitPrice: 100,
  totalPrice: 1000,
  status: 'Not Received',
  isFOC: false,
  name: 'Sample Item',
  itemOrderUnit: 'pcs',
  approvedQty: 10,
  baseApprovedQty: 10,
  foc: 0,
  baseFocQty: 0,
  cancelQty: 0,
  baseCancelQty: 0,
  pricePerUnit: 100,
  basePricePerUnit: 100,
  netAmount: 1000,
  baseNetAmount: 1000,
  discPercentage: 0,
  discAmount: 0,
  baseDiscAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  baseTaxAmount: 0,
  totalAmount: 1000,
  baseTotalAmount: 1000,
  comment: '',
  attachedFile: null
}

export function PurchaseOrderItemFormComponent({ initialMode = 'view', onClose, initialData = sampleItem, onSubmit, isOpen }: ItemFormProps) {
  const [mode, setMode] = useState<FormMode>(initialMode)
  const [formData, setFormData] = useState<Item>(initialData)

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

  const renderField = (label: string, name: keyof Item, type: string = 'text', baseField?: keyof Item, convRate?: boolean, suffix?: string, decimals?: number) => {
    const value = formData[name]
    const baseValue = baseField ? formData[baseField] : null
    const formattedValue = typeof value === 'number' && decimals !== undefined ? formatNumber(value, decimals) : value
    const formattedBaseValue = typeof baseValue === 'number' && decimals !== undefined ? formatNumber(baseValue, decimals) : baseValue

    if (mode === 'view') {
      return (
        <div className="mb-1">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="mt-0.5 flex items-center">
            <span className="text-sm">{formattedValue}{suffix}</span>
            {baseValue && (
              <span className="text-xs text-gray-500 ml-1">
                ({formattedBaseValue}
                {convRate && ` Conv: ${(formData.baseQuantity / formData.orderedQuantity).toFixed(2)}`})
              </span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="mb-1">
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <div className="relative mt-0.5">
          {type === 'textarea' ? (
            <Textarea
              id={name}
              name={name}
              value={value as string}
              onChange={handleInputChange}
              className="w-full text-sm py-1"
              rows={2}
            />
          ) : (
            <Input
              type={type}
              id={name}
              name={name}
              value={formattedValue as string}
              onChange={handleInputChange}
              className="w-full text-sm py-1"
            />
          )}
          {suffix && <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm">{suffix}</span>}
        </div>
        {baseValue && (
          <div className="text-xs text-gray-500 mt-0.5">
            {formattedBaseValue}
            {convRate && ` (Conv: ${(formData.baseQuantity / formData.orderedQuantity).toFixed(2)})`}
          </div>
        )}
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'add' && onSubmit) {
      const newItem: Item = {
        ...formData,
        id: Date.now().toString(), // Generate a temporary ID
        receivedQuantity: 0,
        remainingQuantity: formData.orderedQuantity,
        status: 'Not Received',
      }
      onSubmit(newItem)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] max-w-[80vw] p-0 border-none bg-transparent">
        <div className="max-w-[1400px] w-full mx-auto p-4 bg-white rounded-lg shadow-lg relative my-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>

          <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-2 mt-4">
            <div className="col-span-6 flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Item Details</h3>
              {mode === 'view' && (
                <Button onClick={handleModeChange} variant="outline" size="sm">
                  Edit
                </Button>
              )}
            </div>

            <div className="col-span-1">
              {renderField('Name', 'name')}
            </div>
            <div className="col-span-5">
              {renderField('Description', 'description', 'textarea')}
            </div>
            <div className="col-span-1">{renderField('Order Unit', 'itemOrderUnit', 'text', 'baseUnit', true)}</div>
            <div className="col-span-1">{renderField('Approved Qty', 'approvedQty', 'number', 'baseApprovedQty', false, '', 3)}</div>
            <div className="col-span-1">{renderField('Received Qty', 'receivedQuantity', 'number', 'baseReceivingQty', false, '', 3)}</div>
            <div className="col-span-1">{renderField('FOC', 'foc', 'number', 'baseFocQty', false, '', 3)}</div>
            <div className="col-span-1">{renderField('Cancel Qty', 'cancelQty', 'number', 'baseCancelQty', false, '', 3)}</div>
            <div className="col-span-1">{renderField('Price per Unit', 'pricePerUnit', 'number', 'basePricePerUnit', false, '', 2)}</div>

            <div className="col-span-3">
              <h4 className="text-lg font-medium mt-3 mb-1">Comment</h4>
              <Textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Add your comment here..."
                className="w-full mt-1"
                rows={4}
              />
            </div>

            <div className="col-span-3 flex justify-end">
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="col-span-2">Net Amount</div>
                <div className="col-span-1 text-right">
                  {renderField('', 'netAmount', 'number', undefined, false, '', 2)}
                  <div className="text-xs text-gray-500">{formData.baseNetAmount?.toFixed(2)}</div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center">
                    <Checkbox
                      id="adjDiscount"
                      checked={adjustments.discount}
                      onCheckedChange={() => handleCheckboxChange('discount')}
                    />
                    <label htmlFor="adjDiscount" className="ml-2 text-sm">Discount</label>
                  </div>
                </div>
                <div className="col-span-1">{renderField('', 'discPercentage', 'number', undefined, undefined, '%')}</div>
                <div className="col-span-1 text-right">
                  {renderField('', 'discAmount', 'number', undefined, false, '', 2)}
                  <div className="text-xs text-gray-500">{formData.baseDiscAmount?.toFixed(2)}</div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center">
                    <Checkbox
                      id="adjTax"
                      checked={adjustments.tax}
                      onCheckedChange={() => handleCheckboxChange('tax')}
                    />
                    <label htmlFor="adjTax" className="ml-2 text-sm">Tax</label>
                  </div>
                </div>
                <div className="col-span-1">{renderField('', 'taxRate', 'number', undefined, undefined, '%')}</div>
                <div className="col-span-1 text-right">
                  {renderField('', 'taxAmount', 'number', undefined, false, '', 2)}
                  <div className="text-xs text-gray-500">{formData.baseTaxAmount?.toFixed(2)}</div>
                </div>
                
                <div className="col-span-2">Total Amount</div>
                <div className="col-span-1 text-right">
                  {renderField('', 'totalAmount', 'number', undefined, false, '', 2)}
                  <div className="text-xs text-gray-500">{formData.baseTotalAmount?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="col-span-6">
              <h4 className="text-lg font-medium mt-3 mb-1">File Attachment</h4>
              <div className="flex items-center space-x-2">
                <Button type="button" onClick={triggerFileUpload} variant="outline">
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

            <div className="col-span-6 flex justify-between items-center mt-4">
              <div className="space-x-2">
                {mode === 'edit' && (
                  <>
                    <Button type="submit" size="sm">Save Changes</Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                  </>
                )}
                {mode === 'add' && (
                  <Button type="submit" size="sm">Add Item</Button>
                )}
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">On Hand</Button>
                <Button variant="outline" size="sm">On Order</Button>
                <Button variant="outline" size="sm">PR Details</Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}