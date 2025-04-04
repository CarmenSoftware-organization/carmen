'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Upload } from "lucide-react"
import { PurchaseOrderItem } from '@/lib/types'
import { GoodsReceiveNoteTable } from '@/app/(main)/procurement/purchase-orders/components/tabs/goods-receive-note-table'

type FormMode = 'view' | 'edit' | 'add'

interface ItemFormProps {
  initialMode: FormMode
  onClose: () => void
  initialData?: PurchaseOrderItem
}

interface FormData {
  id?: string;
  name: string;
  description: string;
  itemOrderUnit: string;
  baseUnit: string;
  convRate: number;
  approvedQty: number;
  baseApprovedQty: number;
  receivedQty: number;
  baseReceivedQty: number;
  foc: number;
  baseFocQty: number;
  cancelQty: number;
  baseCancelQty: number;
  pricePerUnit: number;
  basePricePerUnit: number;
  totalAmount: number;
  baseTotalAmount: number;
  netAmount: number;
  baseNetAmount: number;
  baseQty: number;
  discountRate: number;
  discountAmount: number;
  baseDiscAmount: number;
  taxRate: number;
  taxAmount: number;
  baseTaxAmount: number;
  comment: string;
  attachedFile: File | null;
  // Additional fields from PurchaseOrderItem
  orderedQuantity?: number;
  orderUnit?: string;
  baseQuantity?: number;
  baseReceivingQty?: number;
}

export function PurchaseOrderItemFormComponent({ initialMode = 'view', onClose, initialData }: ItemFormProps) {
  const [mode, setMode] = useState<FormMode>(initialMode)
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      // Map initialData to FormData structure
      const mappedData: FormData = {
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
        itemOrderUnit: initialData.orderUnit || '',
        baseUnit: initialData.baseUnit,
        convRate: initialData.convRate,
        approvedQty: 0,
        baseApprovedQty: 0,
        receivedQty: 0,
        baseReceivedQty: 0,
        foc: 0,
        baseFocQty: 0,
        cancelQty: 0,
        baseCancelQty: 0,
        pricePerUnit: 0,
        basePricePerUnit: 0,
        totalAmount: 0,
        baseTotalAmount: 0,
        netAmount: 0,
        baseNetAmount: 0,
        baseQty: initialData.baseQuantity || 0,
        discountRate: 0,
        discountAmount: 0,
        baseDiscAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        baseTaxAmount: 0,
        comment: '',
        attachedFile: null,
        // Optional fields from PurchaseOrderItem
        orderedQuantity: initialData.orderedQuantity,
        orderUnit: initialData.orderUnit,
        baseQuantity: initialData.baseQuantity,
        baseReceivingQty: initialData.baseReceivingQty
      }
      return mappedData
    }
    return {
      name: 'Laptop Computer',
      description: 'High-performance laptop with 16GB RAM, 512GB SSD, and 15" display',
      itemOrderUnit: 'Unit',
      baseUnit: 'Piece',
      convRate: 1.2,
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
      totalAmount: 12000.00,
      baseTotalAmount: 12000.00,
      netAmount: 11400.00,
      baseNetAmount: 11400.00,
      baseQty: 10.000,
      discountRate: 5,
      discountAmount: 600.00,
      baseDiscAmount: 600.00,
      taxRate: 7,
      taxAmount: 798.00,
      baseTaxAmount: 798.00,
      comment: '',
      attachedFile: null
    }
  })

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
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachedFile: file
      }))
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatNumber = (value: number, decimals: number) => {
    return value.toFixed(decimals)
  }

  const handleGoodsReceivedClick = () => {
    setShowGRNTable(true)
  }

  const renderField = (label: string, name: keyof FormData, type: string = 'text', decimals?: number) => {
    const value = formData[name]
    const formattedValue = typeof value === 'number' && decimals !== undefined ? formatNumber(value, decimals) : value

    if (mode === 'view') {
      return (
        <div className="mb-2">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="mt-0.5">
            {typeof formattedValue === 'string' || typeof formattedValue === 'number' 
              ? formattedValue 
              : null}
          </div>
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
        </div>
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
          {renderField('Name', 'name')}
        </div>
        <div className="col-span-5">
          {renderField('Description', 'description', 'textarea')}
        </div>

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
            <div className="col-span-1 text-right">{renderField('', 'netAmount', 'number', 2)}</div>
            
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
            <div className="col-span-1">{renderField('', 'discountRate', 'number')}</div>
            <div className="col-span-1 text-right">{renderField('', 'discountAmount', 'number', 2)}</div>
            
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
            <div className="col-span-1">{renderField('', 'taxRate', 'number')}</div>
            <div className="col-span-1 text-right">{renderField('', 'taxAmount', 'number', 2)}</div>
            
            <div className="col-span-2">Total Amount</div>
            <div className="col-span-1 text-right">{renderField('', 'totalAmount', 'number', 2)}</div>
          </div>
        </div>

        <div className="col-span-6">
          <h4 className="text-lg font-medium mt-3 mb-1">File Attachment</h4>
          <div className="flex items-center space-x-2">
            <Button type="button" onClick={triggerFileUpload} variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <span className="text-sm text-gray-500">
              {formData.attachedFile?.name || 'No file chosen'}
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