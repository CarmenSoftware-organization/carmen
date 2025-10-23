'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"
import { PurchaseOrderItem } from '@/lib/types'
import { GoodsReceiveNoteTable } from '@/app/(main)/procurement/purchase-orders/components/tabs/goods-receive-note-table'

type FormMode = 'view' | 'edit' | 'add'

interface ItemFormProps {
  initialMode: FormMode
  onClose: () => void
  initialData?: PurchaseOrderItem
}

// Extended form data type that includes UI-specific fields
interface ExtendedFormData extends PurchaseOrderItem {
  comment: string;
  attachedFile: File | null;
}

export function PurchaseOrderItemFormComponent({ initialMode = 'view', onClose, initialData }: ItemFormProps) {
  const [mode, setMode] = useState<FormMode>(initialMode)

  // Create default form data with proper typing
  const defaultFormData: ExtendedFormData = initialData ? {
    ...initialData,
    comment: initialData.notes || '',
    attachedFile: null
  } : {
    id: '',
    orderId: '',
    lineNumber: 0,
    itemName: 'Laptop Computer',
    description: 'High-performance laptop with 16GB RAM, 512GB SSD, and 15" display',
    orderedQuantity: 10,
    receivedQuantity: 8,
    pendingQuantity: 2,
    unit: 'Unit',
    unitPrice: { amount: 1200.00, currency: 'USD' },
    discount: 5,
    discountAmount: { amount: 600.00, currency: 'USD' },
    lineTotal: { amount: 12000.00, currency: 'USD' },
    taxRate: 7,
    taxAmount: { amount: 798.00, currency: 'USD' },
    deliveryDate: new Date(),
    status: 'pending' as const,
    comment: '',
    attachedFile: null
  }

  const [formData, setFormData] = useState<ExtendedFormData>(defaultFormData)

  const [adjustments, setAdjustments] = useState({
    discount: true,
    tax: false
  })

  const [showGRNTable, setShowGRNTable] = useState(false)

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
    const file = e.target.files?.[0] ?? undefined
    // setFormData(prev => ({ ...prev, attachedFile: file }))
  }

  function triggerFileUpload() {
    fileInputRef.current?.click()
  }

  const formatNumber = (value: number, decimals: number) => {
    return value.toFixed(decimals)
  }

  const handleGoodsReceivedClick = () => {
    setShowGRNTable(true)
  }

  const renderField = (label: string, name: keyof ExtendedFormData, type: string = 'text', baseField?: keyof ExtendedFormData, convRate?: boolean, suffix?: string, decimals?: number) => {
    const value = formData[name]
    const baseValue = baseField ? formData[baseField] : null
    const formattedValue = typeof value === 'number' && decimals !== undefined ? formatNumber(value, decimals) : value
    const formattedBaseValue = typeof baseValue === 'number' && decimals !== undefined ? formatNumber(baseValue, decimals) : baseValue

    if (mode === 'view') {
      return (
        <div className="mb-2">
          <Label className="text-sm font-medium">{label}</Label>
          {/* <div className="mt-0.5">{formattedValue}{suffix}</div> */}
          {baseValue && (
            <div className="text-xs text-gray-500">
              {/* {formattedBaseValue} */}
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="mb-2">
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              id={name}
              name={name}
              value={value as string}
              onChange={handleInputChange}
              className="mt-0.5 w-full"
            />
          ) : (
            <Input
              type={type}
              id={name}
              name={name}
              value={formattedValue as string}
              onChange={handleInputChange}
              className="mt-0.5 w-full"
            />
          )}
          {suffix && <span className="absolute right-3 top-1/2 transform -translate-y-1/2">{suffix}</span>}
        </div>
        {baseValue && (
          <div className="text-xs text-gray-500 mt-0.5">
            {/* {formattedBaseValue} */}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto p-6 bg-white rounded-lg shadow-lg relative my-8">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>

      <form className="grid grid-cols-6 gap-4 mt-8">
        <div className="col-span-6 flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Item Details</h3>
          {mode === 'view' && (
            <Button onClick={handleModeChange} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </div>

        <div className="col-span-1">
          {renderField('Name', 'itemName')}
        </div>
        <div className="col-span-5">
          {renderField('Description', 'description', 'textarea')}
        </div>

        {/* <div className="col-span-1">{renderField('Order Unit', 'itemOrderUnit', 'text', 'baseUnit', true)}</div>
        <div className="col-span-1">{renderField('Approved Qty', 'approvedQty', 'number', 'baseApprovedQty', false, '', 3)}</div>
        <div className="col-span-1">{renderField('Received Qty', 'receivedQty', 'number', 'baseReceivedQty', false, '', 3)}</div>
        <div className="col-span-1">{renderField('FOC', 'foc', 'number', 'baseFocQty', false, '', 3)}</div>
        <div className="col-span-1">{renderField('Cancel Qty', 'cancelQty', 'number', 'baseCancelQty', false, '', 3)}</div>
        <div className="col-span-1">{renderField('Price per Unit', 'pricePerUnit', 'number', 'basePricePerUnit', false, '', 2)}</div> */}

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
              {mode === 'view' ? (
                <div className="mt-0.5">{typeof formData.lineTotal === 'object' ? formData.lineTotal.amount.toFixed(2) : formData.lineTotal}</div>
              ) : (
                <Input
                  type="number"
                  value={typeof formData.lineTotal === 'object' ? formData.lineTotal.amount : formData.lineTotal}
                  readOnly
                  className="text-right"
                />
              )}
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
            <div className="col-span-1">{renderField('', 'discount', 'number', undefined, undefined, '%')}</div>
            <div className="col-span-1 text-right">
              {mode === 'view' ? (
                <div className="mt-0.5">{typeof formData.discountAmount === 'object' ? formData.discountAmount.amount.toFixed(2) : formData.discountAmount}</div>
              ) : (
                <Input
                  type="number"
                  value={typeof formData.discountAmount === 'object' ? formData.discountAmount.amount : formData.discountAmount}
                  readOnly
                  className="text-right"
                />
              )}
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
              {mode === 'view' ? (
                <div className="mt-0.5">{typeof formData.taxAmount === 'object' ? formData.taxAmount.amount.toFixed(2) : formData.taxAmount}</div>
              ) : (
                <Input
                  type="number"
                  value={typeof formData.taxAmount === 'object' ? formData.taxAmount.amount : formData.taxAmount}
                  readOnly
                  className="text-right"
                />
              )}
            </div>

            <div className="col-span-2">Total Amount</div>
            <div className="col-span-1 text-right">
              {mode === 'view' ? (
                <div className="mt-0.5">{typeof formData.lineTotal === 'object' ? formData.lineTotal.amount.toFixed(2) : formData.lineTotal}</div>
              ) : (
                <Input
                  type="number"
                  value={typeof formData.lineTotal === 'object' ? formData.lineTotal.amount : formData.lineTotal}
                  readOnly
                  className="text-right"
                />
              )}
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
              {/* {formData.attachedFile ? formData.attachedFile.name : 'No file chosen'} */}
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="col-span-6 flex justify-between items-center mt-6">
          <div className="space-x-2">
            {mode === 'edit' && (
              <>
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm">On Hand</Button>
            <Button variant="outline" size="sm">On Order</Button>
            <Button variant="outline" size="sm">PR Details</Button>
            <Button variant="outline" size="sm" onClick={handleGoodsReceivedClick}>Goods Received</Button>
          </div>
        </div>
      </form>

      {showGRNTable && (
        <div className="mt-8">
          <GoodsReceiveNoteTable />
        </div>
      )}
    </div>
  )
}