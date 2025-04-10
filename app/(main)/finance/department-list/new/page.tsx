"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DepartmentForm } from "@/components/departments/department-form"
import { Department } from "@/components/departments/department-dialog"
import { toast } from "sonner"

export default function NewDepartmentPage() {
  const router = useRouter()
  
  // Handle submission of new department
  const handleSubmit = async (data: Department) => {
    try {
      // In a real app, this would be an API call
      console.log("Creating new department:", data)
      
      // Show success toast
      toast.success("Department created", {
        description: `${data.name} has been successfully created.`,
      })
      
      // Navigate back to department list
      router.push("/finance/department-list")
    } catch (error) {
      console.error("Error creating department:", error)
      
      // Show error toast
      toast.error("Error", {
        description: "Failed to create department. Please try again.",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Department</h1>
      <DepartmentForm 
        onSubmit={handleSubmit}
        isNew={true}
      />
    </div>
  )
} 