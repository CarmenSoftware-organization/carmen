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
import { MapPin, Phone, Award, Calendar, FileText, ChevronLeft } from "lucide-react"
import { Vendor } from './types'
import { MOCK_VENDORS } from '../data/mock'
import { updateVendor } from '../actions'
import { BasicInfoSection } from './sections/basic-info-section'
import { AddressesSection } from './sections/addresses-section'
import { ContactsSection } from './sections/contacts-section'
import { EnvironmentalProfile } from './sections/environmental-profile'
import { CertificationsSection } from './sections/certifications-section'
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
  const [vendor, setVendor] = useState<Vendor | null>(MOCK_VENDORS[id] || null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (!vendor) return notFound()

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => setIsEditing(false)

  const handleSave = async () => {
    if (!vendor) return

    const result = await updateVendor(vendor)
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
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

  const handleDelete = async () => {
    try {
      // Mock delete success
      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      })
      router.push('/vendor-management/manage-vendors')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      })
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setVendor(prev => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
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
            onClick={handleEdit}
            className="bg-primary hover:bg-primary/90"
          >
            Edit Vendor
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleting(true)}
          >
            Delete Vendor
          </Button>
        </div>
      )}
    </>
  )

  // Get primary address and contact
  const primaryAddress = vendor.addresses.find(a => a.isPrimary) || vendor.addresses[0]
  const primaryContact = vendor.contacts.find(c => c.isPrimary) || vendor.contacts[0]

  const content = (
    <>
      {/* Header with back button and title - styled like Credit Note example */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/vendor-management/manage-vendors')}
          className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to vendor list"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold">{vendor.companyName}</h1>
        <div className="ml-3">
          <Badge variant={vendor.isActive ? "default" : "secondary"} className="text-sm">
            {vendor.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

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
                      {primaryAddress ? primaryAddress.addressLine : "No address provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Primary Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : "No contact provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Registration & Tax</p>
                    <p className="text-sm text-muted-foreground">
                      Reg: {vendor.businessRegistrationNumber} | Tax ID: {vendor.taxId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Established</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.establishmentDate}
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
                <p className="text-2xl font-bold">{vendor.rating}/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts & Addresses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
              <CardDescription>General information about the vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <BasicInfoSection
                vendor={vendor}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </CardContent>
          </Card>

          {/* Tax configuration section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tax configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Id</label>
                  <Input
                    placeholder="Enter Tax Id"
                    value={vendor.taxId || ''}
                    onChange={e => isEditing && handleFieldChange('taxId', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Profile</label>
                  <Select
                    value={vendor.taxProfile || 'standard'}
                    onValueChange={val => isEditing && handleFieldChange('taxProfile', val)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="reduced">Reduced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate (%)</label>
                  <Input
                    type="number"
                    placeholder="Enter rate"
                    value={vendor.taxRate ?? 10}
                    onChange={e => isEditing && handleFieldChange('taxRate', Number(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select
                    value={vendor.taxType || 'add'}
                    onValueChange={val => isEditing && handleFieldChange('taxType', val)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="include">Include</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <p><span className="font-medium">Address:</span> {primaryAddress.addressLine}</p>
                    <p><span className="font-medium">Postal Code:</span> {primaryAddress.postalCode}</p>
                    <p><span className="font-medium">Address Type:</span> {primaryAddress.addressType}</p>
                    <p><span className="font-medium">Primary:</span> {primaryAddress.isPrimary ? "Yes" : "No"}</p>
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
                    <p><span className="font-medium">Name:</span> {primaryContact.name}</p>
                    <p><span className="font-medium">Phone:</span> {primaryContact.phone}</p>
                    <p><span className="font-medium">Email:</span> {primaryContact.email}</p>
                    <p><span className="font-medium">Position:</span> {primaryContact.position}</p>
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
              <AddressesSection
                addresses={vendor.addresses}
                isEditing={isEditing}
                onAddressChange={handleFieldChange}
              />
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
              <ContactsSection
                contacts={vendor.contacts}
                isEditing={isEditing}
                onContactChange={handleFieldChange}
              />
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
              <CertificationsSection
                certifications={vendor.certifications}
                isEditing={isEditing}
                onCertificationChange={handleFieldChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Environmental Impact Tab */}
        <TabsContent value="environmental">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Environmental Impact</CardTitle>
                  <CardDescription>Environmental metrics and sustainability data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EnvironmentalProfile 
                vendorId={id}
                environmentalData={vendor.environmentalImpact}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  return (
    <DetailPageTemplate
      title={`Vendor Details`}
      actionButtons={actionButtons}
      content={content}
      backLink="/vendor-management/manage-vendors"
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
