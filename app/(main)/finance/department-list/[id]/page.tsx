"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DepartmentForm } from "@/components/departments/department-form"
import { Department } from "@/components/departments/department-dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Mock function to fetch department by ID
const fetchDepartment = (id: number): Department | undefined => {
  // This would be replaced with a real API call in production
  const mockDepartments = [
    { 
      id: 1, 
      code: "AC", 
      name: "Finance / Accounting", 
      heads: [{ id: 1, name: "John Doe", email: "finance.head@example.com" }], 
      accountCode: "ACCT-001", 
      isActive: true 
    },
    { 
      id: 2, 
      code: "AD", 
      name: "Administrator", 
      heads: [
        { id: 2, name: "Jane Smith", email: "admin1@example.com" },
        { id: 3, name: "Bob Johnson", email: "admin2@example.com" }
      ], 
      accountCode: "ACCT-002", 
      isActive: true 
    },
    { 
      id: 3, 
      code: "FB", 
      name: "Food and Beverage", 
      heads: [{ id: 4, name: "Alice Brown", email: "fb.manager@example.com" }], 
      accountCode: "ACCT-003", 
      isActive: false 
    },
    { 
      id: 4, 
      code: "HR", 
      name: "Human Resources", 
      heads: [{ id: 5, name: "Charlie Davis", email: "hr.director@example.com" }], 
      accountCode: "ACCT-004", 
      isActive: true 
    },
  ]
  
  return mockDepartments.find(dept => dept.id === id)
}

export default function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      toast.error("Invalid department ID")
      router.push("/finance/department-list")
      return
    }
    
    const dept = fetchDepartment(id)
    if (dept) {
      setDepartment(dept)
    } else {
      toast.error("Department not found")
      router.push("/finance/department-list")
    }
    
    setLoading(false)
  }, [params.id, router])
  
  const handleSubmit = async (data: Department) => {
    try {
      // In a real app, this would be an API call
      console.log("Updating department:", data)
      
      // Update the local state
      setDepartment(data)
      
      // Show success toast
      toast.success("Department updated", {
        description: `${data.name} has been successfully updated.`
      })
    } catch (error) {
      console.error("Error updating department:", error)
      
      // Show error toast
      toast.error("Error", {
        description: "Failed to update department. Please try again."
      })
    }
  }
  
  const handleDelete = async (departmentId: number) => {
    try {
      // In a real app, this would be an API call
      console.log("Deleting department:", departmentId)
      
      // Show success toast
      toast.success("Department deleted", {
        description: "Department has been successfully deleted."
      })
      
      // Navigate back to department list
      router.push("/finance/department-list")
    } catch (error) {
      console.error("Error deleting department:", error)
      
      // Show error toast
      toast.error("Error", {
        description: "Failed to delete department. Please try again."
      })
    }
  }
  
  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/finance/department-list">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Departments
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold">Department Details</h1>
      
      {department && (
        <DepartmentForm 
          department={department}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
} 