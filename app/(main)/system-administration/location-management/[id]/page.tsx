'use client'

import { useParams, useRouter } from 'next/navigation'
import { mockLocations } from '../data/mock-locations'
import { LocationDetail } from '../components/location-detail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locationId = params.id as string

  // Find location
  const location = mockLocations.find(loc => loc.id === locationId)

  // Handle not found
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Location Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The location you're looking for doesn't exist or has been deleted.
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

  const handleEdit = () => {
    router.push(`/system-administration/location-management/${locationId}/edit`)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the location "${location.name}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete location:', locationId)
      router.push('/system-administration/location-management')
    }
  }

  return (
    <div className="px-6 pt-6">
      <LocationDetail
        location={location}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
