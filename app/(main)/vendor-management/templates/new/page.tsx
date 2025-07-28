'use client'

// Pricelist Template Builder - Create New Template
// Phase 2 Task 4 - Create pricelist template builder

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Plus, 
  X, 
  Settings,
  Package,
  FileText,
  Clock,
  Globe,
  Bell
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { PricelistTemplate, ProductSelection } from '../../types'
import ProductSelectionComponent from '../components/ProductSelectionComponent'
import TemplatePreview from '../components/TemplatePreview'

const CURRENCY_OPTIONS = [
  { value: 'BHT', label: 'Thai Baht (BHT)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState<Partial<PricelistTemplate>>({
    name: '',
    description: '',
    productSelection: {
      categories: [],
      subcategories: [],
      itemGroups: [],
      specificItems: []
    },
    customFields: [],
    instructions: '',
    validityPeriod: 90,
    status: 'draft',
    allowMultiMOQ: true,
    requireLeadTime: true,
    defaultCurrency: 'BHT',
    supportedCurrencies: ['BHT'],
    maxItemsPerSubmission: 1000,
    notificationSettings: {
      sendReminders: true,
      reminderDays: [7, 3, 1],
      escalationDays: 14
    }
  })

  const steps = [
    {
      title: 'Basic Information',
      description: 'Template name, description, and basic settings',
      icon: FileText
    },
    {
      title: 'Product Selection',
      description: 'Choose which products to include in the template',
      icon: Package
    },
    {
      title: 'Settings & Notifications',
      description: 'Configure template settings and notifications',
      icon: Bell
    }
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as object),
        [field]: value
      }
    }))
  }

  const handleSave = async (status: 'draft' | 'active' = 'draft') => {
    try {
      // Validate required fields for activation
      if (status === 'active') {
        if (!formData.name?.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Template name is required to activate template',
            variant: 'destructive',
          })
          return
        }
        
        if (!formData.productSelection?.categories.length && !formData.productSelection?.specificItems.length) {
          toast({
            title: 'Validation Error',
            description: 'Product selection is required to activate template',
            variant: 'destructive',
          })
          return
        }
      }

      const templateData: PricelistTemplate = {
        id: Date.now().toString(),
        name: formData.name || '',
        description: formData.description,
        productSelection: formData.productSelection!,
        customFields: [], // Empty array since custom fields step was removed
        instructions: formData.instructions || '',
        validityPeriod: formData.validityPeriod || 90,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        allowMultiMOQ: formData.allowMultiMOQ || false,
        requireLeadTime: formData.requireLeadTime || false,
        defaultCurrency: formData.defaultCurrency || 'BHT',
        supportedCurrencies: formData.supportedCurrencies || ['BHT'],
        maxItemsPerSubmission: formData.maxItemsPerSubmission,
        notificationSettings: formData.notificationSettings!
      }

      // Here you would save to the API
      console.log('Saving template:', templateData)
      
      toast({
        title: 'Success',
        description: `Template ${status === 'active' ? 'created and activated' : 'saved as draft'}`,
      })

      router.push('/vendor-management/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.name.trim().length > 0
      case 1:
        return formData.productSelection?.categories.length! > 0 || 
               formData.productSelection?.specificItems.length! > 0
      case 2:
        return true
      default:
        return false
    }
  }

  const canActivateTemplate = () => {
    return formData.name?.trim() && 
           (formData.productSelection?.categories.length! > 0 || formData.productSelection?.specificItems.length! > 0)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter template description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions for Vendors</Label>
              <Textarea
                id="instructions"
                value={formData.instructions || ''}
                onChange={(e) => updateFormData('instructions', e.target.value)}
                placeholder="Enter instructions that will be shown to vendors"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validityPeriod">Validity Period (days)</Label>
                <Input
                  id="validityPeriod"
                  type="number"
                  value={formData.validityPeriod || 90}
                  onChange={(e) => updateFormData('validityPeriod', parseInt(e.target.value))}
                  className="mt-1"
                  min="1"
                  max="365"
                />
              </div>

              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={formData.defaultCurrency} 
                  onValueChange={(value) => updateFormData('defaultCurrency', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <ProductSelectionComponent
            productSelection={formData.productSelection!}
            onChange={(selection) => updateFormData('productSelection', selection)}
          />
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowMultiMOQ">Allow Multiple MOQ Levels</Label>
                      <p className="text-sm text-muted-foreground">
                        Vendors can provide different prices for different quantities
                      </p>
                    </div>
                    <Switch
                      id="allowMultiMOQ"
                      checked={formData.allowMultiMOQ}
                      onCheckedChange={(checked) => updateFormData('allowMultiMOQ', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireLeadTime">Require Lead Time</Label>
                      <p className="text-sm text-muted-foreground">
                        Vendors must specify delivery lead times
                      </p>
                    </div>
                    <Switch
                      id="requireLeadTime"
                      checked={formData.requireLeadTime}
                      onCheckedChange={(checked) => updateFormData('requireLeadTime', checked)}
                    />
                  </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Limits & Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxItems">Max Items per Submission</Label>
                    <Input
                      id="maxItems"
                      type="number"
                      value={formData.maxItemsPerSubmission || 1000}
                      onChange={(e) => updateFormData('maxItemsPerSubmission', parseInt(e.target.value))}
                      className="mt-1"
                      min="1"
                      max="10000"
                    />
                  </div>

                  <div>
                    <Label>Supported Currencies</Label>
                    <div className="mt-2 space-y-2">
                      {CURRENCY_OPTIONS.map(currency => (
                        <div key={currency.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`currency-${currency.value}`}
                            checked={formData.supportedCurrencies?.includes(currency.value)}
                            onChange={(e) => {
                              const currencies = formData.supportedCurrencies || []
                              if (e.target.checked) {
                                updateFormData('supportedCurrencies', [...currencies, currency.value])
                              } else {
                                updateFormData('supportedCurrencies', currencies.filter(c => c !== currency.value))
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`currency-${currency.value}`} className="text-sm">
                            {currency.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sendReminders">Send Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send reminder emails to vendors
                    </p>
                  </div>
                  <Switch
                    id="sendReminders"
                    checked={formData.notificationSettings?.sendReminders}
                    onCheckedChange={(checked) => 
                      updateNestedFormData('notificationSettings', 'sendReminders', checked)
                    }
                  />
                </div>

                {formData.notificationSettings?.sendReminders && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Reminder Days Before Deadline</Label>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {[14, 7, 3, 1].map(day => (
                          <div key={day} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id={`reminder-${day}`}
                              checked={formData.notificationSettings?.reminderDays.includes(day)}
                              onChange={(e) => {
                                const days = formData.notificationSettings?.reminderDays || []
                                if (e.target.checked) {
                                  updateNestedFormData('notificationSettings', 'reminderDays', [...days, day].sort((a, b) => b - a))
                                } else {
                                  updateNestedFormData('notificationSettings', 'reminderDays', days.filter(d => d !== day))
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`reminder-${day}`} className="text-sm">
                              {day} day{day > 1 ? 's' : ''}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="escalationDays">Escalation After (days)</Label>
                      <Input
                        id="escalationDays"
                        type="number"
                        value={formData.notificationSettings?.escalationDays || 14}
                        onChange={(e) => 
                          updateNestedFormData('notificationSettings', 'escalationDays', parseInt(e.target.value))
                        }
                        className="mt-1"
                        min="1"
                        max="90"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Create Pricelist Template</h1>
          <p className="text-muted-foreground">
            Build a template for collecting vendor pricing information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('active')}
            disabled={!canActivateTemplate()}
            className={canActivateTemplate() ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
          >
            Submit Template
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 
                        isCompleted ? 'border-green-500 bg-green-50 text-green-600' : 
                        'border-gray-200 bg-gray-50 text-gray-400'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-[120px]">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-px mx-4 transition-colors
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1 || !canProceedToNextStep()}
        >
          Next
        </Button>
      </div>

      {/* Template Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={formData as PricelistTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}