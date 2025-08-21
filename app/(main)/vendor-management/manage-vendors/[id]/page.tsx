'use client'

import { Suspense, useState } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import DetailPageTemplate from '@/components/templates/DetailPageTemplate'
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, 
         AlertDialogAction } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MapPin, Phone, Award, Calendar, FileText, ChevronLeft, Printer } from "lucide-react"
import { Vendor } from '../../types'
import { mockVendors } from '../../lib/mock-data'
import { updateVendor, deleteVendor } from '../actions'
import { vendorService } from '../../lib/services/vendor-service'
import VendorDeletionDialog from '../../components/VendorDeletionDialog'
import VendorPricelistsSection from './sections/vendor-pricelists-section'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<VendorDetailSkeleton />}>
      <VendorDetail id={params.id} />
    </Suspense>
  )
}

function VendorDetail({ id }: { id: string }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(mockVendors.find(v => v.id === id) || null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (!vendor) return notFound()

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => setIsEditing(false)

  const handleSave = async () => {
    if (!vendor) return

    const result = await updateVendor(vendor)
    
    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : "Failed to update vendor"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Vendor updated successfully"
    })
    
    setIsEditing(false)
    router.refresh()
  }

  const handleDeleteClick = () => {
    setDeletionDialogOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!vendor) return

    const result = await deleteVendor(vendor.id)
    
    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : "Failed to delete vendor"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Vendor deleted successfully"
    })
    router.push('/vendor-management/manage-vendors')
  }

  const handleFieldChange = (name: string, value: any) => {
    setVendor(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }

  const handleStatusToggle = async (checked: boolean) => {
    if (!vendor) return
    
    const newStatus: 'active' | 'inactive' = checked ? 'active' : 'inactive'
    const updatedVendor = { ...vendor, status: newStatus }
    
    try {
      setVendor(updatedVendor)
      // In a real app, you would call an API here
      // await updateVendorStatus(vendor.id, newStatus)
      
      toast({
        title: "Status Updated",
        description: `Vendor has been marked as ${newStatus}.`,
      })
    } catch (error) {
      // Revert the change if API call fails
      setVendor(vendor)
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const actionButtons = (
    <>
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleEdit}
            className="bg-primary hover:bg-primary/90"
          >
            Edit Vendor
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteClick}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Delete Vendor
          </Button>
        </div>
      )}
    </>
  )

  // Get primary address and contact
  const primaryAddress = vendor.address
  const primaryContact = { 
    email: vendor.contactEmail, 
    phone: vendor.contactPhone
  }

  // Custom title component with back button, company name, and status
  const customTitle = (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => router.push('/vendor-management/manage-vendors')}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Back to vendor list"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      <h1 className="text-2xl font-semibold">{vendor.name}</h1>
      <Badge 
        variant="secondary"
        className={`text-xs px-2 py-1 ${
          vendor.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
        }`}
      >
        {vendor.status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
      <Switch
        id="vendor-status"
        checked={vendor.status === 'active'}
        onCheckedChange={handleStatusToggle}
        disabled={isEditing}
      />
    </div>
  )

  const content = (
    <>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Address</p>
                    <p className="text-sm text-muted-foreground">
                      {primaryAddress ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postalCode}` : "No address provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {primaryContact ? `${primaryContact.email} (${primaryContact.phone})` : "No contact provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Registration & Tax</p>
                    <p className="text-sm text-muted-foreground">
                      Reg: {vendor.companyRegistration || 'N/A'} | Tax ID: {vendor.taxId || 'N/A'}
                      {vendor.taxRate !== undefined && (
                        <span className="ml-2 inline-flex items-center">
                          | Tax: {vendor.taxRate}%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Established</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-3 mb-2">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Vendor Rating</p>
                <p className="text-2xl font-bold">{(vendor.performanceMetrics.qualityScore/20).toFixed(1)}/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricelists">Price Lists</TabsTrigger>
          <TabsTrigger value="contacts">Contacts & Addresses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
              <CardDescription>General information about the vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <p className="text-sm text-muted-foreground">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <p className="text-sm text-muted-foreground">{vendor.contactEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Type</label>
                  <p className="text-sm text-muted-foreground">{vendor.businessType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax configuration section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Tax identification and rate configuration for this vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax ID</label>
                  <Input
                    placeholder="Enter Tax ID"
                    value={vendor.taxId || ''}
                    onChange={e => isEditing && handleFieldChange('taxId', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Profile</label>
                  {isEditing ? (
                    <Select 
                      value={vendor.taxProfile || ''} 
                      onValueChange={value => {
                        handleFieldChange('taxProfile', value)
                        // Auto-set tax rate based on profile
                        if (value === 'none-vat') {
                          handleFieldChange('taxRate', 0)
                        } else if (value === 'vat') {
                          handleFieldChange('taxRate', 7)
                        } else if (value === 'gst') {
                          handleFieldChange('taxRate', 10)
                        } else if (value === 'sales-tax') {
                          handleFieldChange('taxRate', 8.5)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none-vat">None VAT</SelectItem>
                        <SelectItem value="vat">VAT (Thailand)</SelectItem>
                        <SelectItem value="gst">GST (Singapore/Australia)</SelectItem>
                        <SelectItem value="sales-tax">Sales Tax (USA)</SelectItem>
                        <SelectItem value="custom">Custom Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {vendor.taxProfile === 'none-vat' ? 'None VAT' : 
                         vendor.taxProfile === 'vat' ? 'VAT (Thailand)' :
                         vendor.taxProfile === 'gst' ? 'GST (Singapore/Australia)' :
                         vendor.taxProfile === 'sales-tax' ? 'Sales Tax (USA)' :
                         vendor.taxProfile === 'custom' ? 'Custom Rate' :
                         'Not set'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={vendor.taxRate || ''}
                      onChange={e => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {vendor.taxRate !== undefined ? `${vendor.taxRate}%` : 'Not set'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Registration</label>
                  {isEditing ? (
                    <Input
                      placeholder="Enter registration number"
                      value={vendor.companyRegistration || ''}
                      onChange={e => handleFieldChange('companyRegistration', e.target.value)}
                      disabled={!isEditing}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{vendor.companyRegistration || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Primary Address</CardTitle>
                    <CardDescription>Main location of the vendor</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {primaryAddress && (
                  <div className="space-y-2">
                    <p><span className="font-medium">Address:</span> {primaryAddress.street}</p>
                    <p><span className="font-medium">City:</span> {primaryAddress.city}</p>
                    <p><span className="font-medium">State:</span> {primaryAddress.state}</p>
                    <p><span className="font-medium">Postal Code:</span> {primaryAddress.postalCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Primary Contact</CardTitle>
                    <CardDescription>Main point of contact</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {primaryContact && (
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {primaryContact.email}</p>
                    <p><span className="font-medium">Phone:</span> {primaryContact.phone || 'Not provided'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        
        {/* Contacts & Addresses Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Addresses</CardTitle>
                  <CardDescription>All registered addresses for this vendor</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline">
                    Add Address
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">
                    {vendor.address ? `${vendor.address.street}, ${vendor.address.city}, ${vendor.address.state} ${vendor.address.postalCode}, ${vendor.address.country}` : 'No address provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Contacts</CardTitle>
                  <CardDescription>All contacts associated with this vendor</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline">
                    Add Contact
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <p className="text-sm text-muted-foreground">{vendor.contactEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <p className="text-sm text-muted-foreground">{vendor.contactPhone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Certifications</CardTitle>
                  <CardDescription>Vendor certifications and compliance documents</CardDescription>
                </div>
                {isEditing && (
                  <Button size="sm" variant="outline">
                    Add Certification
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Certifications</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendor.certifications?.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    )) || <p className="text-sm text-muted-foreground">No certifications</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Lists Tab */}
        <TabsContent value="pricelists">
          <VendorPricelistsSection vendorId={id} vendorName={vendor.name} />
        </TabsContent>
        
      </Tabs>

      <VendorDeletionDialog 
        vendor={vendor}
        isOpen={deletionDialogOpen}
        onClose={() => setDeletionDialogOpen(false)}
        onDeleted={handleDeleteConfirmed}
      />
    </>
  )

  return (
    <DetailPageTemplate
      title={customTitle}
      actionButtons={actionButtons}
      content={content}
    />
  )
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button and title skeleton */}
      <div className="flex items-center mb-6">
        <Skeleton className="h-6 w-6 rounded-full mr-4" />
        <Skeleton className="h-8 w-[250px]" />
      </div>
      
      {/* Summary Card Skeleton */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-[400px] mb-4" />
      
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
