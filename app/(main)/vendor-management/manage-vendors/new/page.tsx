'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ChevronLeft, Plus, X, Upload, Building, User, MapPin, Phone, Mail, FileText, Award, Globe, DollarSign } from 'lucide-react'
import { Vendor } from '../../types'
import { vendorService } from '../../lib/services/vendor-service'

interface VendorFormData {
  name: string
  contactEmail: string
  contactPhone: string
  website: string
  businessType: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  companyRegistration: string
  taxId: string
  taxProfile: string
  preferredCurrency: string
  paymentTerms: string
  status: 'active' | 'inactive'
  certifications: string[]
  languages: string[]
  notes: string
}

const initialFormData: VendorFormData = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  businessType: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  },
  companyRegistration: '',
  taxId: '',
  taxProfile: '',
  preferredCurrency: 'BHT',
  paymentTerms: '',
  status: 'active',
  certifications: [],
  languages: [],
  notes: ''
}

const businessTypes = [
  'Food & Beverage',
  'Hospitality Supplies',
  'Cleaning Services',
  'Linen Services',
  'Technology',
  'Furniture & Fixtures',
  'Security Services',
  'Maintenance Services',
  'Marketing & Advertising',
  'Professional Services',
  'Transportation',
  'Other'
]

const currencies = [
  'BHT', 'USD', 'CNY', 'SGD'
]

const paymentTermsOptions = [
  'Net 30', 'Net 60', 'Net 90', '2/10 Net 30', '1/15 Net 45', 'Due on Receipt', 'COD'
]

const commonCertifications = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'HACCP', 'FDA Approved', 'OSHA Compliant',
  'Green Certified', 'Fair Trade', 'Organic Certified', 'Halal Certified', 'Kosher Certified'
]

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
]

export default function NewVendorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<VendorFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newCertification, setNewCertification] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VendorFormData] as object),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification('')
    }
  }

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required'
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }
    if (!formData.businessType) newErrors.businessType = 'Business type is required'
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required'
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required'
    if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const vendorData = {
        ...formData,
        createdBy: 'current-user-id', // This should come from auth context
        performanceMetrics: {
          responseRate: 0,
          averageResponseTime: 0,
          qualityScore: 0,
          onTimeDeliveryRate: 0,
          totalCampaigns: 0,
          completedSubmissions: 0,
          averageCompletionTime: 0
        }
      }

      // Create vendor through service
      const result = await vendorService.createVendor(vendorData, 'current-user-id')

      if (result.success) {
        toast({
          title: "Success",
          description: "Vendor created successfully!"
        })
        router.push('/vendor-management/manage-vendors')
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create vendor'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create vendor. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/vendor-management/manage-vendors')
  }

  return (
    <div className="container mx-auto py-4 px-12">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={handleCancel}
          className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to vendor list"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold">Create New Vendor</h1>
      </div>

      {/* Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Vendor Information
          </CardTitle>
          <CardDescription>
            Fill out the vendor details below. Required fields are marked with an asterisk (*)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Address</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                    <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Contact & Address Tab */}
            <TabsContent value="contact" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    placeholder="123 Main Street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className={errors['address.street'] ? 'border-red-500' : ''}
                  />
                  {errors['address.street'] && <p className="text-sm text-red-500">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={errors['address.city'] ? 'border-red-500' : ''}
                    />
                    {errors['address.city'] && <p className="text-sm text-red-500">{errors['address.city']}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className={errors['address.country'] ? 'border-red-500' : ''}
                  />
                  {errors['address.country'] && <p className="text-sm text-red-500">{errors['address.country']}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Business Details Tab */}
            <TabsContent value="business" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyRegistration">Company Registration</Label>
                  <Input
                    id="companyRegistration"
                    placeholder="REG123456789"
                    value={formData.companyRegistration}
                    onChange={(e) => handleInputChange('companyRegistration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="12-3456789"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxProfile">Tax Profile</Label>
                  <Select value={formData.taxProfile} onValueChange={(value) => handleInputChange('taxProfile', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none-vat">None VAT (0%)</SelectItem>
                      <SelectItem value="vat">VAT (7%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                  <Select value={formData.preferredCurrency} onValueChange={(value) => handleInputChange('preferredCurrency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermsOptions.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-6 mt-6">
              {/* Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </h3>
                
                <div className="flex gap-2">
                  <Select value={newCertification} onValueChange={setNewCertification}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select or enter certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCertifications.map(cert => (
                        <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map(cert => (
                    <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Languages
                </h3>
                
                <div className="flex gap-2">
                  <Select value={newLanguage} onValueChange={setNewLanguage}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select or enter language" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.languages.map(lang => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeLanguage(lang)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the vendor..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}