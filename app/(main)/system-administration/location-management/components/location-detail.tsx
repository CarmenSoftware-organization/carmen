'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Location } from '../data/mock-locations'
import { mockUsers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Trash2, MapPin, Package, TruckIcon } from 'lucide-react'

interface LocationDetailProps {
  location: Location
  onEdit: () => void
  onDelete: () => void
}

export function LocationDetail({ location, onEdit, onDelete }: LocationDetailProps) {
  const assignedUsers = useMemo(() => {
    if (!location.assignedUsers) return []
    return mockUsers.filter(user => location.assignedUsers?.includes(user.id))
  }, [location.assignedUsers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/system-administration/location-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {location.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Location Code: {location.code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location Code
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {location.code}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location Name
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {location.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type
              </label>
              <div className="mt-1">
                <Badge variant="outline">{location.type}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={location.isActive ? 'default' : 'secondary'}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Physical Count Required
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {location.eop === 'true' ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Delivery Point
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {location.deliveryPoint}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assigned Users ({assignedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedUsers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No users assigned to this location
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
