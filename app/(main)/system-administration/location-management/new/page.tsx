"use client"

import { useRouter } from 'next/navigation'
import { LocationDetailForm } from '../components/location-detail-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function LocationNewPage() {
  const router = useRouter()

  function handleSubmit() {
    toast.success('Location created successfully!')
    router.push('/system-administration/location-management')
  }

  function handleCancel() {
    router.back()
  }

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Location</h1>
      </div>
      <Card className="p-6 bg-background border rounded-lg shadow-sm">
        <LocationDetailForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  )
} 