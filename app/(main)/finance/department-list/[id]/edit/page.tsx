'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockDepartments } from '@/lib/mock-data'
import { Department } from '@/lib/types'
import { DepartmentEditForm } from '../../components/department-edit-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function DepartmentEditPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.id as string

  // Find department
  const department = departmentId !== 'new'
    ? mockDepartments.find(dept => dept.id === departmentId)
    : undefined

  // Handle not found for edit
  if (departmentId !== 'new' && !department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Department Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The department you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link href="/finance/department-list">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Department List
          </Button>
        </Link>
      </div>
    )
  }

  const handleSave = (updatedDepartment: Partial<Department>) => {
    // TODO: Implement save functionality with API
    console.log('Saving department:', updatedDepartment)

    // Navigate back to detail page or list
    if (departmentId === 'new') {
      router.push('/finance/department-list')
    } else {
      router.push(`/finance/department-list/${departmentId}`)
    }
  }

  const handleCancel = () => {
    if (departmentId === 'new') {
      router.push('/finance/department-list')
    } else {
      router.push(`/finance/department-list/${departmentId}`)
    }
  }

  return (
    <div className="space-y-6 px-6 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={departmentId === 'new' ? '/finance/department-list' : `/finance/department-list/${departmentId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {departmentId === 'new' ? 'New Department' : `Edit ${department?.name}`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {departmentId === 'new'
              ? 'Create a new department and assign users'
              : 'Update department information and user assignments'}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <DepartmentEditForm
        department={department}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
