'use client'

// VendorForm Component - Phase 1 Task 2
// Comprehensive form component for creating and editing vendors

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  User,
  CreditCard,
  Settings,
  Plus,
  Trash2
} from 'lucide-react'
import { Vendor, ValidationResult } from '../types'
import { vendorService } from '../lib/services/vendor-service'
import { vendorValidationService } from '../lib/services/vendor-validation'

// Validation schema
const vendorSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name must be less than 100 characters'),
  contactEmail: z.string().email('Invalid email format'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),
  status: z.enum(['active', 'inactive']).optional(),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN']),
  paymentTerms: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  businessType: z.string().optional(),
  companyRegistration: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
})

type VendorFormData = z.infer<typeof vendorSchema>

interface VendorFormProps {
  vendor?: Vendor
  onSave: (vendor: Vendor) => void
  onCancel: () => void
  isLoading?: boolean
  userId: string
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
]

const BUSINESS_TYPES = [
  'Technology', 'Manufacturing', 'Agriculture', 'Transportation', 'Energy', 
  'Research', 'Pharmaceuticals', 'Food Distribution', 'Materials Science', 
  'Marine Research', 'Construction', 'Healthcare', 'Education', 'Finance'
]

const CERTIFICATIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'GDPR Compliant', 
  'FDA Approved', 'CE Marking', 'FCC Certified', 'OSHA Compliant'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
]

export default function VendorForm({ vendor, onSave, onCancel, isLoading, userId }: VendorFormProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [certifications, setCertifications] = useState<string[]>(vendor?.certifications || [])
  const [languages, setLanguages] = useState<string[]>(vendor?.languages || [])
  const [autoSave, setAutoSave] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset,
    getValues
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name || '',
      contactEmail: vendor?.contactEmail || '',
      contactPhone: vendor?.contactPhone || '',
      address: {
        street: vendor?.address?.street || '',
        city: vendor?.address?.city || '',
        state: vendor?.address?.state || '',
        postalCode: vendor?.address?.postalCode || '',
        country: vendor?.address?.country || '',
      },
      status: vendor?.status || 'active',
      preferredCurrency: (vendor?.preferredCurrency as any) || 'USD',
      paymentTerms: vendor?.paymentTerms || '',
      website: vendor?.website || '',
      businessType: vendor?.businessType || '',
      companyRegistration: vendor?.companyRegistration || '',
      taxId: vendor?.taxId || '',
      notes: vendor?.notes || '',
      certifications: vendor?.certifications || [],
      languages: vendor?.languages || []
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Real-time validation
  useEffect(() => {
    if (isDirty) {
      setHasChanges(true)
      validateForm()
    }
  }, [watchedValues, isDirty])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && isDirty && isValid) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [autoSave, hasChanges, isDirty, isValid, watchedValues])

  const validateForm = async () => {
    if (isValidating) return

    setIsValidating(true)
    try {
      const formData = getValues()
      const vendorData = {
        ...formData,
        certifications,
        languages
      }
      
      const result = await vendorValidationService.validateVendor(vendorData)
      setValidationResult(result)
    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleAutoSave = async () => {
    if (!vendor?.id) return // Only auto-save for existing vendors

    try {
      const formData = getValues()
      const vendorData = {
        ...formData,
        certifications,
        languages
      }

      await vendorService.updateVendor(vendor.id, vendorData, userId)
      setHasChanges(false)
      toast({
        title: "Auto-saved",
        description: "Your changes have been automatically saved.",
      })
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }

  const onSubmit = async (data: VendorFormData) => {
    try {
      const vendorData = {
        ...data,
        certifications,
        languages,
        createdBy: vendor?.createdBy || userId,
        status: data.status || 'active'
      }

      let result
      if (vendor?.id) {
        result = await vendorService.updateVendor(vendor.id, vendorData, userId)
      } else {
        result = await vendorService.createVendor(vendorData, userId)
      }

      if (result.success && result.data) {
        onSave(result.data)
        toast({
          title: vendor ? "Vendor updated" : "Vendor created",
          description: vendor ? "Vendor has been updated successfully." : "New vendor has been created successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to save vendor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const addCertification = (certification: string) => {
    if (certification && !certifications.includes(certification)) {
      setCertifications([...certifications, certification])
      setValue('certifications', [...certifications, certification])
    }
  }

  const removeCertification = (index: number) => {
    const newCertifications = certifications.filter((_, i) => i !== index)
    setCertifications(newCertifications)
    setValue('certifications', newCertifications)
  }

  const addLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      setLanguages([...languages, language])
      setValue('languages', [...languages, language])
    }
  }

  const removeLanguage = (index: number) => {
    const newLanguages = languages.filter((_, i) => i !== index)
    setLanguages(newLanguages)
    setValue('languages', newLanguages)
  }

  const getValidationIcon = () => {
    if (isValidating) return <AlertCircle className="h-4 w-4 animate-spin" />
    if (validationResult?.isValid) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (validationResult && !validationResult.isValid) return <AlertCircle className="h-4 w-4 text-red-600" />
    return <AlertCircle className="h-4 w-4 text-gray-400" />
  }

  const getValidationMessage = () => {
    if (isValidating) return "Validating..."
    if (validationResult?.isValid) return "All fields are valid"
    if (validationResult && !validationResult.isValid) {
      return `${validationResult.errors.length} validation error(s)`
    }
    return "Ready for validation"
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {vendor ? 'Edit Vendor' : 'Create New Vendor'}
          </h1>
          <p className="text-muted-foreground">
            {vendor ? 'Update vendor information and settings' : 'Add a new vendor to your system'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="auto-save">Auto-save</Label>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {validationResult && (
        <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center space-x-2">
            {getValidationIcon()}
            <div className="flex-1">
              <AlertDescription>
                {getValidationMessage()}
                {validationResult.qualityScore && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm">Quality Score:</span>
                    <Progress value={validationResult.qualityScore/20} className="w-32 h-2" />
                    <span className="text-sm font-medium">{(validationResult.qualityScore/20).toFixed(1)}/5</span>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Building className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact">
              <User className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="business">
              <CreditCard className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="name"
                          placeholder="Enter company name"
                          {...field}
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCurrency">Preferred Currency *</Label>
                    <Controller
                      name="preferredCurrency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.preferredCurrency && (
                      <p className="text-sm text-red-600">{errors.preferredCurrency.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="website"
                        placeholder="https://company.com"
                        {...field}
                      />
                    )}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Controller
                      name="contactEmail"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="contact@company.com"
                          {...field}
                        />
                      )}
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Controller
                      name="contactPhone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="contactPhone"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                        />
                      )}
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Address</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address.street">Street Address *</Label>
                    <Controller
                      name="address.street"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="address.street"
                          placeholder="123 Main Street"
                          {...field}
                        />
                      )}
                    />
                    {errors.address?.street && (
                      <p className="text-sm text-red-600">{errors.address.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.city">City *</Label>
                      <Controller
                        name="address.city"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="address.city"
                            placeholder="New York"
                            {...field}
                          />
                        )}
                      />
                      {errors.address?.city && (
                        <p className="text-sm text-red-600">{errors.address.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.state">State *</Label>
                      <Controller
                        name="address.state"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="address.state"
                            placeholder="NY"
                            {...field}
                          />
                        )}
                      />
                      {errors.address?.state && (
                        <p className="text-sm text-red-600">{errors.address.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.postalCode">Postal Code *</Label>
                      <Controller
                        name="address.postalCode"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="address.postalCode"
                            placeholder="10001"
                            {...field}
                          />
                        )}
                      />
                      {errors.address?.postalCode && (
                        <p className="text-sm text-red-600">{errors.address.postalCode.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.country">Country *</Label>
                      <Controller
                        name="address.country"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="address.country"
                            placeholder="United States"
                            {...field}
                          />
                        )}
                      />
                      {errors.address?.country && (
                        <p className="text-sm text-red-600">{errors.address.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Information Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Business Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyRegistration">Company Registration</Label>
                    <Controller
                      name="companyRegistration"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="companyRegistration"
                          placeholder="Company registration number"
                          {...field}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Controller
                      name="taxId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="taxId"
                          placeholder="Tax identification number"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Controller
                    name="paymentTerms"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="paymentTerms"
                        placeholder="Net 30 days, 2% discount for early payment..."
                        rows={3}
                        {...field}
                      />
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{cert}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addCertification}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATIONS.filter(cert => !certifications.includes(cert)).map((cert) => (
                        <SelectItem key={cert} value={cert}>
                          {cert}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter(lang => !languages.includes(lang)).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Additional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="notes"
                        placeholder="Additional notes about this vendor..."
                        rows={4}
                        {...field}
                      />
                    )}
                  />
                </div>

                {/* Validation Errors */}
                {validationResult && validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-red-600">Validation Errors</h3>
                    <div className="space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{error.field}:</strong> {error.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Warnings */}
                {validationResult && validationResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-yellow-600">Warnings</h3>
                    <div className="space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <Alert key={index} className="border-yellow-200 bg-yellow-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{warning.field}:</strong> {warning.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600">
                Unsaved changes
              </Badge>
            )}
            {autoSave && (
              <Badge variant="outline" className="text-green-600">
                Auto-save enabled
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isValidating || !isValid}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}