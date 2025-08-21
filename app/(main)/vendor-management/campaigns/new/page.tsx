'use client'

// New Request for Pricing Creation Wizard
// Phase 3: Request for Pricing Planning & Setup

import React, { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronLeft,
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  Mail,
  AlertCircle,
  Search
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockTemplates, mockVendors } from '../../lib/mock-data'
import { useRouter, useSearchParams } from 'next/navigation'

function NewRequestForPricingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const duplicateFrom = searchParams.get('duplicateFrom')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    vendorIds: [] as string[],
    priority: 'normal',
    startDate: '',
    endDate: '',
    reminderDays: [7, 3, 1],
    requireManagerApproval: false,
    tags: [] as string[]
  })
  
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  const [vendorStatusFilter, setVendorStatusFilter] = useState<string>('all')

  // Pre-populate template if coming from template page
  useEffect(() => {
    if (templateId) {
      updateFormData('templateId', templateId)
      // Auto-advance to step 3 if template is pre-selected
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    }
  }, [templateId])

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Template Selection', icon: FileText },
    { id: 3, title: 'Vendor Selection', icon: Users },
    { id: 4, title: 'Review & Launch', icon: CheckCircle }
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleVendor = (vendorId: string) => {
    setFormData(prev => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(vendorId)
        ? prev.vendorIds.filter(id => id !== vendorId)
        : [...prev.vendorIds, vendorId]
    }))
  }

  const toggleAllVendors = () => {
    const filteredVendors = getFilteredVendors()
    const allSelected = filteredVendors.every(vendor => formData.vendorIds.includes(vendor.id))
    
    if (allSelected) {
      // Deselect all filtered vendors
      setFormData(prev => ({
        ...prev,
        vendorIds: prev.vendorIds.filter(id => !filteredVendors.find(v => v.id === id))
      }))
    } else {
      // Select all filtered vendors
      const newVendorIds = [...formData.vendorIds]
      filteredVendors.forEach(vendor => {
        if (!newVendorIds.includes(vendor.id)) {
          newVendorIds.push(vendor.id)
        }
      })
      setFormData(prev => ({ ...prev, vendorIds: newVendorIds }))
    }
  }

  const getFilteredVendors = () => {
    return mockVendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                           vendor.contactEmail.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                           (vendor.companyRegistration && vendor.companyRegistration.toLowerCase().includes(vendorSearchTerm.toLowerCase()))
      const matchesStatus = vendorStatusFilter === 'all' || vendor.status === vendorStatusFilter
      return matchesSearch && matchesStatus
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Simulate campaign creation
    console.log('Creating campaign:', formData)
    router.push('/vendor-management/campaigns')
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.description && formData.startDate && formData.endDate
      case 2: return formData.templateId
      case 3: return formData.vendorIds.length > 0
      case 4: return true
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Request for Pricing Name</Label>
              <Input
                id="name"
                placeholder="Enter request for pricing name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this request for pricing"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Template</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the pricelist template for this request for pricing
              </p>
              <div className="grid gap-4">
                {mockTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-colors ${
                      formData.templateId === template.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => updateFormData('templateId', template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.templateId === template.id 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {template.validityPeriod} days valid
                            </Badge>
                            <Badge variant="outline">
                              {template.defaultCurrency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        const filteredVendors = getFilteredVendors()
        const allFilteredSelected = filteredVendors.length > 0 && filteredVendors.every(vendor => formData.vendorIds.includes(vendor.id))
        
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Vendors</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose vendors to invite to this request for pricing
              </p>
              
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors by name, email, or company..."
                    value={vendorSearchTerm}
                    onChange={(e) => setVendorSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={vendorStatusFilter} onValueChange={setVendorStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bulk Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allFilteredSelected}
                    onChange={toggleAllVendors}
                    className="mr-2"
                  />
                  <Label className="text-sm font-medium">
                    Select All ({filteredVendors.length} vendors)
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredVendors.length} of {mockVendors.length} vendors shown
                </div>
              </div>
              
              {/* Vendor List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredVendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>No vendors found</div>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredVendors.map((vendor) => (
                      <Card 
                        key={vendor.id} 
                        className={`cursor-pointer transition-colors ${
                          formData.vendorIds.includes(vendor.id) ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleVendor(vendor.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={formData.vendorIds.includes(vendor.id)}
                              onChange={() => toggleVendor(vendor.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.contactEmail}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.companyRegistration || 'Company registration not available'}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                                  {vendor.status}
                                </Badge>
                                <Badge variant="outline">
                                  {vendor.performanceMetrics.responseRate}% response rate
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Selection Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Selected: {formData.vendorIds.length} vendors
                </div>
                {formData.vendorIds.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, vendorIds: [] }))}
                  >
                    Clear All
                  </Button>
                )}
              </div>
              {formData.vendorIds.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {formData.vendorIds.map(id => {
                    const vendor = mockVendors.find(v => v.id === id)
                    return vendor?.name
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Request for Pricing Summary</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Request for Pricing Name</Label>
                    <div className="text-sm">{formData.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className="mt-1">{formData.priority}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="text-sm">{formData.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Template</Label>
                    <div className="text-sm">
                      {mockTemplates.find(t => t.id === formData.templateId)?.name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vendors</Label>
                    <div className="text-sm">{formData.vendorIds.length} selected</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <div className="text-sm">{formData.startDate}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <div className="text-sm">{formData.endDate}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Ready to Launch</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Once launched, invitations will be sent to all selected vendors automatically.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">New Request for Pricing</h1>
          <p className="text-muted-foreground">Create a new request for pricing</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className={`ml-2 text-sm ${
                  currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <Mail className="h-4 w-4 mr-2" />
              Launch Request for Pricing
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewRequestForPricingPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewRequestForPricingPageContent />
    </Suspense>
  )
}