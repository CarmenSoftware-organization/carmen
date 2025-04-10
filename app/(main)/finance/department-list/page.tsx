import { DepartmentList } from './components/department-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function DepartmentListPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Management</h1>
        <Link href="/finance/department-list/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Department
          </Button>
        </Link>
      </div>
      
      <DepartmentList />
    </div>
  )
}