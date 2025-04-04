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
import { PrimaryContactSection } from './sections/primary-contact-section'
import { PrimaryAddressSection } from './sections/primary-address-section'

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <Suspense fallback={<VendorDetailSkeleton />}>
          <VendorDetail id={params.id} />
        </Suspense>
      </div>
    </div>
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

  type FieldValue = string | number | boolean | object | null
  type FieldName = string

  const handleFieldChange = (name: FieldName, value: FieldValue) => {
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
      {/* Summary Card */}
      <Card className="border-none shadow-none bg-gray-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Address</p>
                    <p className="text-sm font-medium">
                      {primaryAddress ? primaryAddress.addressLine : "No address provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
                    <p className="text-sm font-medium">
                      {primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : "No contact provided"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration & Tax</p>
                    <p className="text-sm font-medium">
                      Reg: {vendor.businessRegistrationNumber} | Tax ID: {vendor.taxId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Established</p>
                    <p className="text-sm font-medium">
                      {vendor.establishmentDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Vendor Rating</p>
                <p className="text-2xl font-bold text-primary">{Number(vendor.rating).toFixed(2)}/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full justify-start bg-background">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts & Addresses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="px-6">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General information about the vendor</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <BasicInfoSection
                vendor={vendor}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="px-6">
                <CardTitle>Primary Address</CardTitle>
                <CardDescription>Main location of the vendor</CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <PrimaryAddressSection
                  address={primaryAddress}
                  isEditing={isEditing}
                  onFieldChange={(name, value) => {
                    const updatedAddresses = vendor.addresses.map(addr => 
                      addr.id === primaryAddress?.id ? { ...addr, [name]: value } : addr
                    )
                    handleFieldChange('addresses', updatedAddresses)
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="px-6">
                <CardTitle>Primary Contact</CardTitle>
                <CardDescription>Main point of contact</CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <PrimaryContactSection
                  contact={primaryContact}
                  isEditing={isEditing}
                  onFieldChange={(name, value) => {
                    const updatedContacts = vendor.contacts.map(contact => 
                      contact.id === primaryContact?.id ? { ...contact, [name]: value } : contact
                    )
                    handleFieldChange('contacts', updatedContacts)
                  }}
                />
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
      title={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/vendor-management/manage-vendors')}
            className="h-8 w-8 -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{vendor.companyName}</span>
            <Badge variant={vendor.isActive ? "default" : "secondary"}>
              {vendor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      }
      actionButtons={actionButtons}
      content={content}
    />
  )
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
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
