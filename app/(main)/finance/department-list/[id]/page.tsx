'use client'

import { useParams, useRouter } from 'next/navigation'
import { mockDepartments } from '@/lib/mock-data'
import { DepartmentDetail } from '../components/department-detail'

export default function DepartmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = params.id as string

  // Find department
  const department = mockDepartments.find(dept => dept.id === departmentId)

  // Handle not found
  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Department Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The department you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/finance/department-list')}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Department List
        </button>
      </div>
    )
  }

  const handleEdit = () => {
    router.push(`/finance/department-list/${departmentId}/edit`)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete department:', departmentId)
      router.push('/finance/department-list')
    }
  }

  return (
    <div className="px-6 pt-6">
      <DepartmentDetail
        department={department}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
