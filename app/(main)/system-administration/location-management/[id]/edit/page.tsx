"use client"

import { mockLocations } from '../../data/mock-locations'
import { notFound, useRouter } from 'next/navigation'
import { LocationDetailForm } from '../../components/location-detail-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface LocationEditPageProps {
  params: { id: string }
}

export default function LocationEditPage({ params }: LocationEditPageProps) {
  const router = useRouter()
  const location = mockLocations.find(l => l.id === params.id)
  if (!location) return notFound()

  function handleSubmit() {
    toast.success('Location updated!')
    router.back()
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
        <h1 className="text-2xl font-bold">Edit Location</h1>
      </div>
      <Card className="p-6 bg-background border rounded-lg shadow-sm">
        <LocationDetailForm
          initialValues={location}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  )
} 