'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Location } from '../data/mock-locations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAssignment } from './user-assignment'
import { ProductAssignment } from './product-assignment'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, X } from 'lucide-react'

const locationSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  type: z.enum(['Direct', 'Inventory', 'Consignment']),
  eop: z.enum(['true', 'false']),
  deliveryPoint: z.string().min(1, 'Delivery point is required'),
  isActive: z.boolean(),
})

type LocationFormData = z.infer<typeof locationSchema>

interface LocationEditFormProps {
  location?: Location
  onSave: (location: Partial<Location>) => void
  onCancel: () => void
}

export function LocationEditForm({ location, onSave, onCancel }: LocationEditFormProps) {
  const router = useRouter()
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    location?.assignedUsers || []
  )
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>(
    location?.assignedProducts || []
  )
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: location?.code || '',
      name: location?.name || '',
      type: location?.type || 'Inventory',
      eop: (location?.eop ? 'true' : 'false') as 'true' | 'false',
      deliveryPoint: location?.deliveryPoint || '',
      isActive: location?.isActive ?? true,
    },
  })

  const type = watch('type')
  const eop = watch('eop')
  const isActive = watch('isActive')

  const onSubmit = (data: LocationFormData) => {
    const updatedLocation: Partial<Location> = {
      ...data,
      eop: data.eop,
      assignedUsers: assignedUserIds,
      assignedProducts: assignedProductIds,
    }

    if (location?.id) {
      updatedLocation.id = location.id
    }

    onSave(updatedLocation)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Location Code *</Label>
            <Input
              id="code"
              {...register('code')}
              className="mt-1"
              placeholder="e.g., NYC001"
              disabled={!!location?.id} // Disable editing code for existing locations
            />
            {errors.code && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
              placeholder="Enter location name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue('type', value as 'Direct' | 'Inventory' | 'Consignment')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Consignment">Consignment</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="eop">Physical Count (Required)</Label>
            <Select
              value={eop}
              onValueChange={(value) => setValue('eop', value as 'true' | 'false')}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.eop && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.eop.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="deliveryPoint">Delivery Point *</Label>
            <Input
              id="deliveryPoint"
              {...register('deliveryPoint')}
              className="mt-1"
              placeholder="e.g., Loading Dock A"
            />
            {errors.deliveryPoint && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.deliveryPoint.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked as boolean)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>
      </div>

      {/* Assignment Section with Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'products')}>
          <TabsList className="mb-4">
            <TabsTrigger value="users">User Assignment</TabsTrigger>
            <TabsTrigger value="products">Product Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserAssignment
              assignedUserIds={assignedUserIds}
              onAssignedUsersChange={setAssignedUserIds}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductAssignment
              assignedProductIds={assignedProductIds}
              onAssignedProductsChange={setAssignedProductIds}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Location
        </Button>
      </div>
    </form>
  )
}
