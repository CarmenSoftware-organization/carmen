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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vendor } from './types'
import { MOCK_VENDORS } from '../data/mock'
import { updateVendor } from '../actions'
import { BasicInfoSection } from './sections/basic-info-section'
import { AddressesSection } from './sections/addresses-section'
import { ContactsSection } from './sections/contacts-section'
import { EnvironmentalProfile } from './sections/environmental-profile'
import { CertificationsSection } from './sections/certifications-section'

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

  const content = (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <BasicInfoSection
              vendor={vendor}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <EnvironmentalProfile 
              vendorId={id}
              environmentalData={vendor.environmentalImpact}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Addresses</CardTitle>
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
              <CardTitle className="text-lg font-medium">Contacts</CardTitle>
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

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Certifications</CardTitle>
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
      </div>

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
      title={`Vendor: ${vendor.companyName}`}
      actionButtons={actionButtons}
      content={content}
      backLink="/vendor-management/manage-vendors"
    />
  )
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-[300px]" />
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
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
        ))}
      </div>
    </div>
  )
}
