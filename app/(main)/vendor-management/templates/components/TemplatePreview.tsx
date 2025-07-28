'use client'

// Template Preview Component
// Phase 2 Task 4 - Template preview functionality

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Eye,
  Package,
  Settings,
  Clock,
  Globe,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Search,
  Save,
  Send
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PricelistTemplate } from '../../types'
import { generateExcelTemplate, ExcelTemplateConfig } from '../lib/excel-generator'
import { downloadExcelTemplate, validateTemplate, getDownloadStats } from '../lib/excel-download-service'
import { toast } from '@/components/ui/use-toast'
import ExcelTemplateCustomizer from './ExcelTemplateCustomizer'
import { resolveProductsWithInfo } from '../../lib/product-utils'

interface TemplatePreviewProps {
  template: PricelistTemplate
  onClose: () => void
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showCustomizer, setShowCustomizer] = React.useState(false)
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const handleGenerateExcel = async () => {
    setIsGenerating(true)
    try {
      const config: ExcelTemplateConfig = {
        includeInstructions: true,
        includeProductHierarchy: true,
        includeSampleData: true,
        templateFormat: 'standard',
        currency: template.defaultCurrency || 'BHT',
        allowMultiMOQ: template.allowMultiMOQ || false,
        requireLeadTime: template.requireLeadTime || false
      }

      // Generate template
      const result = await generateExcelTemplate(template, config)
      
      // Validate template
      const validation = validateTemplate(result)
      if (!validation.isValid) {
        toast({
          title: 'Template Validation Failed',
          description: validation.errors.join(', '),
          variant: 'destructive',
        })
        return
      }

      // Download template
      const downloadResult = await downloadExcelTemplate(result, {
        format: 'excel'
      })

      if (downloadResult.success) {
        const stats = getDownloadStats(result)
        toast({
          title: 'Excel Template Generated',
          description: `Template "${downloadResult.filename}" downloaded successfully. Size: ${stats.estimatedSize}`,
        })
      } else {
        throw new Error(downloadResult.error || 'Download failed')
      }

    } catch (error) {
      console.error('Error generating Excel template:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate Excel template. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{template.name || 'Untitled Template'}</DialogTitle>
              <DialogDescription>
                Preview how this template will appear to vendors
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Template Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">Product Selection</div>
                    <div className="text-xs text-muted-foreground">
                      {template.productSelection?.categories?.length || 0} categories,{' '}
                      {template.productSelection?.subcategories?.length || 0} subcategories,{' '}
                      {template.productSelection?.itemGroups?.length || 0} item groups,{' '}
                      {template.productSelection?.specificItems?.length || 0} specific items
                    </div>
                  </div>
                </div>


                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium">Validity Period</div>
                    <div className="text-xs text-muted-foreground">
                      {template.validityPeriod || 90} days
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">Currency</div>
                    <div className="text-xs text-muted-foreground">
                      {template.defaultCurrency || 'BHT'} ({template.supportedCurrencies?.length || 1} supported)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Instructions */}
          {template.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions for Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="whitespace-pre-wrap text-sm">{template.instructions}</div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Sample Vendor Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Vendor Form Preview</CardTitle>
              <div className="text-sm text-muted-foreground">
                This shows how vendors will experience the pricing form based on your template configuration
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Portal Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{template.name || 'Price Submission Portal'}</h3>
                      <p className="text-muted-foreground">Vendor Price Submission Portal</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Currency:</span>
                        <Badge variant="outline">{template.defaultCurrency || 'BHT'}</Badge>
                      </div>
                      <Badge variant="outline" className="text-green-700 bg-green-50">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview Mode
                      </Badge>
                      <Badge variant="secondary">Progress: 2/6</Badge>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {template.instructions && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-blue-900 mb-1">Pricing Instructions</div>
                        <div className="text-sm text-blue-800 whitespace-pre-wrap">{template.instructions}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter items..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-sm"
                    disabled
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
                    {(() => {
                      if (!template.productSelection) return null;
                      
                      const resolvedProducts = resolveProductsWithInfo(template.productSelection);
                      const sampleProducts = resolvedProducts.slice(0, 3);
                      
                      if (sampleProducts.length === 0) {
                        return (
                          <div className="p-6 text-center">
                            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-600">No products selected in template</p>
                          </div>
                        );
                      }

                      return sampleProducts.map((productInfo, index) => {
                        const hasPrice = index === 0; // First item has price for demo
                        const isExpanded = index === 1 && template.allowMultiMOQ; // Second item expanded for MOQ demo
                        
                        return (
                          <div key={productInfo.product.id} className="bg-white">
                            {/* Main row */}
                            <div className="px-4 py-3 hover:bg-gray-50">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2">
                                  <span className="font-mono text-sm">{productInfo.product.id.toUpperCase()}</span>
                                </div>
                                <div className="col-span-4">
                                  <div>
                                    <div className="font-medium text-sm">{productInfo.product.name}</div>
                                    {isExpanded && (
                                      <div className="text-xs text-muted-foreground">(2 price tiers)</div>
                                    )}
                                  </div>
                                </div>
                                <div className="col-span-1">
                                  <span className="text-sm">{productInfo.product.defaultOrderUnit || 'Each'}</span>
                                </div>
                                <div className="col-span-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">{template.defaultCurrency || 'BHT'}</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={hasPrice ? "15.50" : ""}
                                      className="w-20 h-8 text-sm border rounded px-2"
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      placeholder="5"
                                      value={hasPrice ? "7" : ""}
                                      className="w-12 h-8 text-sm border rounded px-1 text-center"
                                      disabled
                                    />
                                    <span className="text-xs text-muted-foreground">d</span>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      disabled
                                    >
                                      {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                    {hasPrice && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded MOQ tiers for second item */}
                            {isExpanded && (
                              <div className="px-4 pb-3 bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-center py-2 ml-8">
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm text-muted-foreground">MOQ:</span>
                                      <input
                                        type="number"
                                        placeholder="100"
                                        value="100"
                                        className="w-20 h-8 text-sm border rounded px-2"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-4">
                                    <span className="text-sm text-muted-foreground">{productInfo.product.name}</span>
                                  </div>
                                  <div className="col-span-1">
                                    <span className="text-sm">{productInfo.product.defaultOrderUnit || 'Each'}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm">{template.defaultCurrency || 'BHT'}</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value="12.80"
                                        className="w-20 h-8 text-sm border rounded px-2"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-1">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        placeholder="5"
                                        value="5"
                                        className="w-12 h-8 text-sm border rounded px-1 text-center"
                                        disabled
                                      />
                                      <span className="text-xs text-muted-foreground">d</span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    2 of 6 items completed
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button size="sm" disabled>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Prices
                    </Button>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500 italic">
                  📋 This is a preview of the vendor experience. Actual portal includes full functionality.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCustomizer(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize Template
          </Button>
          <Button 
            onClick={handleGenerateExcel}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Excel Template'}
          </Button>
        </div>

        {/* Excel Template Customizer */}
        <ExcelTemplateCustomizer
          template={template}
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
        />
      </DialogContent>
    </Dialog>
  )
}