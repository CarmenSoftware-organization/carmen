'use client'

// Vendor Entry Sample Page
// Simple clean interface for vendor price entry as per design.md

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Plus,
  Minus,
  Check,
  Save,
  Send,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductItem {
  code: string
  description: string
  unit: string
  basePrice?: number
  leadTime?: number
  moqTiers?: Array<{
    moq: number
    price: number
    leadTime: number
  }>
}

export default function VendorEntrySamplePage() {
  const [currency, setCurrency] = useState('BHT')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [priceData, setPriceData] = useState<Record<string, ProductItem>>({})
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [submissionMethod, setSubmissionMethod] = useState<'online' | 'upload' | 'email'>('online')

  // Sample products based on design.md
  const sampleProducts: ProductItem[] = [
    { code: 'ELEC-001', description: 'USB Cable Type-C', unit: 'Each' },
    { code: 'ELEC-002', description: 'USB Cable Type-A', unit: 'Each' },
    { code: 'ELEC-003', description: 'HDMI Cable 2.0', unit: 'Each' },
    { code: 'ELEC-004', description: 'HDMI Cable 4K', unit: 'Each' },
    { code: 'ELEC-005', description: 'Network Cable Cat6', unit: 'Each' },
    { code: 'ELEC-006', description: 'Network Cable Cat7', unit: 'Each' },
    { code: 'ELEC-007', description: 'Power Cable 3-Pin', unit: 'Each' },
    { code: 'ELEC-008', description: 'Extension Cable 5m', unit: 'Each' },
    { code: 'PWR-001', description: 'Laptop Charger 65W', unit: 'Each' },
    { code: 'PWR-002', description: 'Laptop Charger 90W', unit: 'Each' },
    { code: 'PWR-003', description: 'USB Charger 20W', unit: 'Each' },
    { code: 'PWR-004', description: 'USB Charger 45W', unit: 'Each' },
    { code: 'PWR-005', description: 'Power Bank 10000mAh', unit: 'Each' },
    { code: 'ACC-001', description: 'Wireless Mouse', unit: 'Each' },
    { code: 'ACC-002', description: 'USB Hub 4-Port', unit: 'Each' },
    { code: 'ACC-003', description: 'Webcam HD', unit: 'Each' },
    { code: 'ACC-004', description: 'Mouse Pad', unit: 'Each' },
    { code: 'ACC-005', description: 'Cable Organizer', unit: 'Pack' },
    { code: 'ACC-006', description: 'Screen Cleaner', unit: 'Each' },
    { code: 'ACC-007', description: 'Keyboard Wireless', unit: 'Each' }
  ]

  const getCurrencySymbol = (curr: string) => {
    const symbols = { 'BHT': '฿', 'USD': '$', 'CNY': '¥', 'SGD': 'S$' }
    return symbols[curr as keyof typeof symbols] || curr
  }

  const filteredProducts = sampleProducts.filter(product =>
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updatePrice = (code: string, field: string, value: any) => {
    setPriceData(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value
      }
    }))
  }

  const addMOQTier = (code: string) => {
    setPriceData(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        moqTiers: [
          ...(prev[code]?.moqTiers || []),
          { moq: 0, price: 0, leadTime: 5 }
        ]
      }
    }))
  }

  const removeMOQTier = (code: string, index: number) => {
    setPriceData(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        moqTiers: prev[code]?.moqTiers?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const toggleExpanded = (code: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(code)) {
        newSet.delete(code)
      } else {
        newSet.add(code)
      }
      return newSet
    })
  }

  const getCompletedCount = () => {
    return Object.values(priceData).filter(item => item.basePrice && item.basePrice > 0).length
  }

  const isExpanded = (code: string) => expandedItems.has(code)

  const handleDownloadTemplate = () => {
    // Create comprehensive Excel template with instructions
    const csvContent = [
      '# Request for Pricing Template - Electronics & Accessories',
      '# Instructions: Fill in the pricing information for each product',
      '# - Base Price: Minimum order quantity (MOQ 1) pricing',
      '# - Lead Time: Days required for delivery',
      '# - MOQ Tiers: Volume pricing for larger quantities',
      '# - Currency: All prices should be in ' + currency,
      '#',
      'Code,Description,Unit,Base Price (MOQ 1),Lead Time (Days),MOQ Tier 1,Price Tier 1,Lead Time 1,MOQ Tier 2,Price Tier 2,Lead Time 2,MOQ Tier 3,Price Tier 3,Lead Time 3,Notes',
      ...sampleProducts.map(product => 
        `${product.code},"${product.description}",${product.unit},,5,100,,5,500,,7,1000,,10,`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `price-template-electronics-${currency}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // Simulate processing uploaded file
      processUploadedFile(file)
    }
  }

  const processUploadedFile = (file: File) => {
    // Simulate Excel file processing
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n')
      
      // Find the header line (skip comment lines starting with #)
      let headerLineIndex = -1
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith('#') && lines[i].includes('Code')) {
          headerLineIndex = i
          break
        }
      }
      
      if (headerLineIndex === -1) return
      
      const headers = lines[headerLineIndex].split(',')
      const newPriceData: Record<string, ProductItem> = {}
      
      // Process data lines
      lines.slice(headerLineIndex + 1).forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const values = line.split(',')
          const code = values[0]?.trim()
          const basePrice = parseFloat(values[3]) || 0
          const leadTime = parseInt(values[4]) || 0
          
          if (code && basePrice > 0) {
            // Parse MOQ tiers
            const moqTiers = []
            for (let i = 5; i < values.length - 1; i += 3) {
              const moq = parseInt(values[i]) || 0
              const price = parseFloat(values[i + 1]) || 0
              const tierLeadTime = parseInt(values[i + 2]) || 0
              
              if (moq > 0 && price > 0) {
                moqTiers.push({ moq, price, leadTime: tierLeadTime })
              }
            }
            
            // Find the product in sampleProducts array
            const product = sampleProducts.find(p => p.code === code)
            if (!product) return // Skip if product not found
            
            newPriceData[code] = {
              code,
              description: product.description,
              unit: product.unit,
              basePrice,
              leadTime,
              moqTiers: moqTiers.length > 0 ? moqTiers : undefined
            }
          }
        }
      })
      
      setPriceData(prev => ({ ...prev, ...newPriceData }))
      
      // Auto-expand items that have MOQ tiers
      Object.keys(newPriceData).forEach(code => {
        if (newPriceData[code].moqTiers && newPriceData[code].moqTiers!.length > 0) {
          setExpandedItems(prev => new Set([...prev, code]))
        }
      })
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Price Submission Portal - Vendor A</h1>
            <p className="text-muted-foreground">Electronics & Accessories Request for Pricing</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Currency:</span>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BHT">BHT</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">Status: DRAFT</Badge>
            <Badge variant="secondary">Progress: {getCompletedCount()}/{sampleProducts.length}</Badge>
          </div>
        </div>
        
        {/* Submission Method Selector */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">Choose your submission method:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="submission-method"
                  value="online"
                  checked={submissionMethod === 'online'}
                  onChange={() => setSubmissionMethod('online')}
                  className="w-4 h-4"
                />
                <span className="text-sm">🖥️ Enter Prices Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="submission-method"
                  value="upload"
                  checked={submissionMethod === 'upload'}
                  onChange={() => setSubmissionMethod('upload')}
                  className="w-4 h-4"
                />
                <span className="text-sm">📊 Upload Excel File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="submission-method"
                  value="email"
                  checked={submissionMethod === 'email'}
                  onChange={() => setSubmissionMethod('email')}
                  className="w-4 h-4"
                />
                <span className="text-sm">📧 Email Submission</span>
              </label>
            </div>
          </div>
        </div>

        {/* Template Options */}
        <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Excel Template Options:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Excel
            </Button>
            {uploadedFile && (
              <span className="text-sm text-green-600">
                ✓ {uploadedFile.name} uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Price Entry Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium">
            <div className="col-span-2">Code</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Lead</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        <div className="divide-y">
          {filteredProducts.map((product) => {
            const productData = priceData[product.code] || {}
            const hasPrice = productData.basePrice && productData.basePrice > 0
            const hasMOQTiers = productData.moqTiers && productData.moqTiers.length > 0
            
            return (
              <div key={product.code} className="bg-white">
                {/* Main row */}
                <div className="px-4 py-3 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="font-mono text-sm">{product.code}</span>
                    </div>
                    <div className="col-span-4">
                      <div>
                        <div className="font-medium text-sm">{product.description}</div>
                        {hasMOQTiers && !isExpanded(product.code) && (
                          <div className="text-xs text-muted-foreground">
                            ({productData.moqTiers?.length || 0} price tiers)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm">{product.unit}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCurrencySymbol(currency)}</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={productData.basePrice || ''}
                          onChange={(e) => updatePrice(product.code, 'basePrice', parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          placeholder="5"
                          value={productData.leadTime || ''}
                          onChange={(e) => updatePrice(product.code, 'leadTime', parseInt(e.target.value) || 0)}
                          className="w-12 h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">d</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toggleExpanded(product.code)
                            if (!isExpanded(product.code) && !hasMOQTiers) {
                              addMOQTier(product.code)
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded(product.code) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                        {hasPrice && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded MOQ tiers */}
                {isExpanded(product.code) && (
                  <div className="px-4 pb-3 bg-gray-50">
                    {productData.moqTiers?.map((tier, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 ml-8">
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">MOQ:</span>
                            <Input
                              type="number"
                              placeholder="100"
                              value={tier.moq || ''}
                              onChange={(e) => {
                                const newTiers = [...(productData.moqTiers || [])]
                                newTiers[index] = { ...tier, moq: parseInt(e.target.value) || 0 }
                                updatePrice(product.code, 'moqTiers', newTiers)
                              }}
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <span className="text-sm text-muted-foreground">{product.description}</span>
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm">{product.unit}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{getCurrencySymbol(currency)}</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={tier.price || ''}
                              onChange={(e) => {
                                const newTiers = [...(productData.moqTiers || [])]
                                newTiers[index] = { ...tier, price: parseFloat(e.target.value) || 0 }
                                updatePrice(product.code, 'moqTiers', newTiers)
                              }}
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-1">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              placeholder="5"
                              value={tier.leadTime || ''}
                              onChange={(e) => {
                                const newTiers = [...(productData.moqTiers || [])]
                                newTiers[index] = { ...tier, leadTime: parseInt(e.target.value) || 0 }
                                updatePrice(product.code, 'moqTiers', newTiers)
                              }}
                              className="w-12 h-8 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">d</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addMOQTier(product.code)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMOQTier(product.code, index)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            {tier.price > 0 && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-sm text-muted-foreground text-center">
        * All prices shown are for MOQ: 1 unit
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {getCompletedCount()} of {sampleProducts.length} items completed
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Submit Prices
          </Button>
        </div>
      </div>
    </div>
  )
}