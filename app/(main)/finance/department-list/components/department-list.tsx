'use client'

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Pencil, Plus, Search, Trash2, User } from "lucide-react"
import { Department } from "@/components/departments/department-dialog"
import DepartmentDialog from "@/components/departments/department-dialog"
import { toast } from "sonner"
import { UserType } from "@/components/departments/user-search"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AdvancedFilter } from "./advanced-filter"
import { BaseFilter } from "@/lib/utils/filter-storage"

const initialDepartments: Department[] = [
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

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(initialDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [activeFilters, setActiveFilters] = useState<BaseFilter<Department>[]>([])

  const applySearchFilter = (term: string) => {
    setSearchTerm(term)
    if (!term) {
      applyAdvancedFilters(activeFilters)
      return
    }
    
    const searchResults = departments.filter(
      (dept) =>
        dept.code.toLowerCase().includes(term.toLowerCase()) ||
        dept.name.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredDepartments(searchResults)
  }

  const applyAdvancedFilters = (filters: BaseFilter<Department>[]) => {
    setActiveFilters(filters)
    
    if (filters.length === 0) {
      // If there are no filters but there is a search term, just apply search
      if (searchTerm) {
        applySearchFilter(searchTerm)
      } else {
        // No filters and no search term, show all
        setFilteredDepartments(departments)
      }
      return
    }
    
    // Start with departments filtered by search term if it exists
    let results = searchTerm ? 
      departments.filter(dept => 
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : 
      [...departments]
    
    // Apply each filter
    filters.forEach(filter => {
      results = results.filter(dept => {
        const field = filter.field as keyof Department
        const fieldValue = dept[field]
        const filterValue = filter.value
        
        switch (filter.operator) {
          case 'equals':
            if (field === 'isActive') {
              if (typeof fieldValue === 'boolean') {
                return fieldValue === (filterValue === 'true')
              }
              return false
            }
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase() === String(filterValue).toLowerCase()
            }
            if (typeof fieldValue === 'number' && !isNaN(Number(filterValue))) {
              return fieldValue === Number(filterValue)
            }
            return false
          
          case 'contains':
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase().includes(String(filterValue).toLowerCase())
            }
            if (field === 'heads' && Array.isArray(fieldValue)) {
              return (fieldValue as UserType[]).some(head => 
                head.name.toLowerCase().includes(String(filterValue).toLowerCase()) ||
                head.email.toLowerCase().includes(String(filterValue).toLowerCase())
              )
            }
            return false
          
          default:
            return true
        }
      })
    })
    
    setFilteredDepartments(results)
  }

  const clearFilters = () => {
    setActiveFilters([])
    if (searchTerm) {
      applySearchFilter(searchTerm)
    } else {
      setFilteredDepartments(departments)
    }
  }

  const openEditModal = (department?: Department) => {
    if (department) {
      setEditingDepartment({ ...department })
    } else {
      setEditingDepartment({
        code: "",
        name: "",
        accountCode: "",
        isActive: true,
        heads: []
      })
    }
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingDepartment(null)
  }

  const handleSave = (updatedDepartment: Department) => {
    if (updatedDepartment.id) {
      // Update existing department
      const updatedDepartments = departments.map((dept) =>
        dept.id === updatedDepartment.id ? updatedDepartment : dept
      )
      setDepartments(updatedDepartments)
      applyAdvancedFilters(activeFilters) // Re-apply filters
      toast.success("Department updated", {
        description: `${updatedDepartment.name} has been successfully updated.`
      })
    } else {
      // Add new department with a generated ID
      const newDepartment = {
        ...updatedDepartment,
        id: Math.max(0, ...departments.map(d => d.id || 0)) + 1
      }
      const newDepartments = [...departments, newDepartment]
      setDepartments(newDepartments)
      applyAdvancedFilters(activeFilters) // Re-apply filters
      toast.success("Department created", {
        description: `${updatedDepartment.name} has been successfully created.`
      })
    }
    closeEditModal()
  }

  const handleDelete = (id: number) => {
    const departmentToDelete = departments.find(dept => dept.id === id)
    const newDepartments = departments.filter((dept) => dept.id !== id)
    setDepartments(newDepartments)
    applyAdvancedFilters(activeFilters) // Re-apply filters
    toast.success("Department deleted", {
      description: departmentToDelete ? `${departmentToDelete.name} has been removed.` : "Department has been removed."
    })
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Department Management</h2>
          <Button onClick={() => openEditModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center w-full sm:w-64">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => applySearchFilter(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <AdvancedFilter 
            onApplyFilters={applyAdvancedFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] px-6 py-3">Code</TableHead>
              <TableHead className="px-6 py-3">Name</TableHead>
              <TableHead className="px-6 py-3">Head of Department</TableHead>
              <TableHead className="px-6 py-3">Account Code</TableHead>
              <TableHead className="px-6 py-3">Active</TableHead>
              <TableHead className="px-6 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline">{dept.code}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">{dept.name}</TableCell>
                  <TableCell className="px-6 py-4">
                    {dept.heads && dept.heads.length > 0 ? (
                      <div className="space-y-1">
                        {dept.heads.map((head, index) => (
                          <div key={index} className="flex items-center space-x-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{head.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">None assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">{dept.accountCode}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Checkbox checked={dept.isActive} disabled />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/finance/department-list/${dept.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FileText className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(dept)}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(dept.id as number)}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Department</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DepartmentDialog 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        department={editingDepartment}
        onSave={handleSave}
      />
    </div>
  )
}