'use client'

// Excel Template Customizer Component
// Phase 2 Task 5 - Template customization options

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Settings, 
  FileSpreadsheet, 
  Info,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PricelistTemplate } from '../../types'
import { generateExcelTemplate, ExcelTemplateConfig } from '../lib/excel-generator'
import { downloadExcelTemplate, validateTemplate, getDownloadStats } from '../lib/excel-download-service'
import { toast } from '@/components/ui/use-toast'

interface ExcelTemplateCustomizerProps {
  template: PricelistTemplate
  isOpen: boolean
  onClose: () => void
}

export default function ExcelTemplateCustomizer({ 
  template, 
  isOpen, 
  onClose 
}: ExcelTemplateCustomizerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [config, setConfig] = useState<ExcelTemplateConfig>({
    includeInstructions: true,
    includeProductHierarchy: true,
    includeSampleData: false,
    templateFormat: 'standard',
    currency: template.defaultCurrency || 'BHT',
    allowMultiMOQ: template.allowMultiMOQ || false,
    requireLeadTime: template.requireLeadTime || false
  })

  const updateConfig = (key: keyof ExcelTemplateConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
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

      // Show warnings if any
      if (validation.warnings.length > 0) {
        toast({
          title: 'Template Warnings',
          description: validation.warnings.join(', '),
          variant: 'default',
        })
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

      onClose()
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

  const getConfigurationScore = (): number => {
    let score = 0
    if (config.includeInstructions) score += 25
    if (config.includeProductHierarchy) score += 25
    if (config.includeSampleData) score += 20
    if (config.allowMultiMOQ) score += 15
    if (config.requireLeadTime) score += 15
    return score
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Customize Excel Template
              </DialogTitle>
              <DialogDescription>
                Configure how the Excel template will be generated for "{template.name}"
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateFormat">Format Style</Label>
                  <Select
                    value={config.templateFormat}
                    onValueChange={(value) => updateConfig('templateFormat', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard - Balanced format with all features</SelectItem>
                      <SelectItem value="compact">Compact - Minimal format for quick entry</SelectItem>
                      <SelectItem value="detailed">Detailed - Extended format with additional fields</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={config.currency}
                    onValueChange={(value) => updateConfig('currency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BHT">Thai Baht (BHT)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                      <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Excel Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}