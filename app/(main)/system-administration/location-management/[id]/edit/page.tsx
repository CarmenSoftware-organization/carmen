'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockLocations, Location } from '../../data/mock-locations'
import { LocationEditForm } from '../../components/location-edit-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LocationEditPage() {
  const params = useParams()
  const router = useRouter()
  const locationId = params.id as string

  // Find location
  const location = locationId !== 'new'
    ? mockLocations.find(loc => loc.id === locationId)
    : undefined

  // Handle not found for edit
  if (locationId !== 'new' && !location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Location Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The location you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link href="/system-administration/location-management">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Location List
          </Button>
        </Link>
      </div>
    )
  }

  const handleSave = (updatedLocation: Partial<Location>) => {
    // TODO: Implement save functionality with API
    console.log('Saving location:', updatedLocation)

    // Navigate back to detail page or list
    if (locationId === 'new') {
      router.push('/system-administration/location-management')
    } else {
      router.push(`/system-administration/location-management/${locationId}`)
    }
  }

  const handleCancel = () => {
    if (locationId === 'new') {
      router.push('/system-administration/location-management')
    } else {
      router.push(`/system-administration/location-management/${locationId}`)
    }
  }

  return (
    <div className="space-y-6 px-6 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={locationId === 'new' ? '/system-administration/location-management' : `/system-administration/location-management/${locationId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {locationId === 'new' ? 'New Location' : `Edit ${location?.name}`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {locationId === 'new'
              ? 'Create a new location and assign users'
              : 'Update location information and user assignments'}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <LocationEditForm
        location={location}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
