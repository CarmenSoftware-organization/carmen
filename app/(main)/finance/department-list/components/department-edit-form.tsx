'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Department, User } from '@/lib/types'
import { mockUsers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAssignment } from './user-assignment'
import { Save, X } from 'lucide-react'

const departmentSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  manager: z.string().optional(),
  costCenter: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentEditFormProps {
  department?: Department
  onSave: (department: Partial<Department>) => void
  onCancel: () => void
}

export function DepartmentEditForm({ department, onSave, onCancel }: DepartmentEditFormProps) {
  const router = useRouter()
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    department?.assignedUsers || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: department?.code || '',
      name: department?.name || '',
      description: department?.description || '',
      manager: department?.manager || '',
      costCenter: department?.costCenter || '',
      status: department?.status || 'active',
    },
  })

  const status = watch('status')

  const onSubmit = (data: DepartmentFormData) => {
    const updatedDepartment: Partial<Department> = {
      ...data,
      assignedUsers: assignedUserIds,
    }

    if (department?.id) {
      updatedDepartment.id = department.id
    }

    onSave(updatedDepartment)
  }

  // Get list of users who can be managers
  const availableManagers = useMemo(() => {
    return mockUsers.filter(user =>
      user.roles && user.roles.some(role =>
        role.name.toLowerCase().includes('manager') ||
        role.name.toLowerCase().includes('director') ||
        role.name.toLowerCase().includes('head')
      )
    )
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
              placeholder="Enter department name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Department Code *</Label>
            <Input
              id="code"
              {...register('code')}
              className="mt-1"
              placeholder="e.g., FIN, PROC"
              disabled={!!department?.id} // Disable editing code for existing departments
            />
            {errors.code && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="mt-1"
              placeholder="Enter department description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manager">Head of Department</Label>
            <Select
              value={watch('manager')}
              onValueChange={(value) => setValue('manager', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select head of department" />
              </SelectTrigger>
              <SelectContent>
                {availableManagers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.manager && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.manager.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="costCenter">Cost Center</Label>
            <Input
              id="costCenter"
              {...register('costCenter')}
              className="mt-1"
              placeholder="e.g., CC-001"
            />
            {errors.costCenter && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.costCenter.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="status"
              checked={status === 'active'}
              onCheckedChange={(checked) =>
                setValue('status', checked ? 'active' : 'inactive')
              }
            />
            <Label htmlFor="status" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>
      </div>

      {/* User Assignment Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Assignment
        </h3>
        <UserAssignment
          assignedUserIds={assignedUserIds}
          onAssignedUsersChange={setAssignedUserIds}
        />
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
          Save Department
        </Button>
      </div>
    </form>
  )
}
