"use client"

import { mockLocations } from '../../data/mock-locations'
import { notFound, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Edit, CheckCircle2, XCircle } from 'lucide-react'
import clsx from 'clsx'
import { Badge } from '@/components/ui/badge'

interface LocationViewPageProps {
  params: { id: string }
}

export default function LocationViewPage({ params }: LocationViewPageProps) {
  const router = useRouter()
  const location = mockLocations.find(l => l.id === params.id)
  if (!location) return notFound()

  return (
    <div className="max-w-2xl mx-auto mt-10 px-2 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Location Details</h1>
            <div className="text-lg font-semibold text-primary mt-1">
              {location.code} — {location.name}
            </div>
          </div>
        </div>
        <Button variant="outline" size="icon" aria-label="Edit" onClick={() => router.push(`/system-administration/location-management/${location.id}/edit`)}>
          <Edit className="h-5 w-5" />
        </Button>
      </div>
      <Card className="p-6 bg-background border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Group 1: Type, EOP, Active */}
          <div>
            <div className="mb-2">
              <span className="font-medium">Type:</span>
              <span className="ml-2 text-muted-foreground">{location.type}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium">EOP:</span>
              <span className="ml-2 text-muted-foreground">{location.eop}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {location.isActive ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
              )}
            </div>
          </div>
          {/* Group 2: Department, Delivery Point */}
          <div>
            <div className="mb-2">
              <span className="font-medium">Department:</span>
              <span className="ml-2 text-muted-foreground">{location.department}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium">Delivery Point:</span>
              <span className="ml-2 text-muted-foreground">{location.deliveryPoint}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 