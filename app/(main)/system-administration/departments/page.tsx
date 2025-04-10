"use client"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import DepartmentDialog from "@/components/departments/department-dialog"

// Types
interface Department {
  id: string
  code: string
  name: string
  accountCode: string
  head: {
    id: string
    name: string
    email: string
  } | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Mock data for departments
const mockDepartments: Department[] = [
  {
    id: "1",
    code: "FIN-001",
    name: "Finance Department",
    accountCode: "DEPT-FIN-001",
    head: {
      id: "101",
      name: "Jennifer Wilson",
      email: "j.wilson@example.com"
    },
    isActive: true,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-08-22")
  },
  {
    id: "2",
    code: "HR-001",
    name: "Human Resources",
    accountCode: "DEPT-HR-001",
    head: {
      id: "102",
      name: "Michael Johnson",
      email: "m.johnson@example.com"
    },
    isActive: true,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-09-18")
  },
  {
    id: "3",
    code: "IT-001",
    name: "Information Technology",
    accountCode: "DEPT-IT-001",
    head: {
      id: "103",
      name: "Sarah Chen",
      email: "s.chen@example.com"
    },
    isActive: true,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-07-12")
  },
  {
    id: "4",
    code: "OPS-001",
    name: "Operations",
    accountCode: "DEPT-OPS-001",
    head: null,
    isActive: false,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-10-05")
  },
  {
    id: "5",
    code: "MKT-001",
    name: "Marketing",
    accountCode: "DEPT-MKT-001",
    head: {
      id: "105",
      name: "David Rodriguez",
      email: "d.rodriguez@example.com"
    },
    isActive: true,
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-08-30")
  }
]

export default function DepartmentManagementPage() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.head?.name && dept.head.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle department selection
  const toggleSelectDepartment = (id: string) => {
    setSelectedDepartments(prev => 
      prev.includes(id)
        ? prev.filter(deptId => deptId !== id)
        : [...prev, id]
    )
  }

  // Handle select all departments
  const toggleSelectAll = () => {
    if (selectedDepartments.length === filteredDepartments.length) {
      setSelectedDepartments([])
    } else {
      setSelectedDepartments(filteredDepartments.map(dept => dept.id))
    }
  }

  // Handle department creation/editing
  const handleSaveDepartment = (department: Partial<Department>) => {
    if (currentDepartment) {
      // Update existing department
      setDepartments(prev => 
        prev.map(dept => 
          dept.id === currentDepartment.id 
            ? { ...dept, ...department, updatedAt: new Date() } as Department
            : dept
        )
      )
      toast({
        title: "Department updated",
        description: `${department.name} has been updated successfully.`,
        open: true
      })
    } else {
      // Create new department
      const newDepartment: Department = {
        id: Math.random().toString(36).substring(2, 9),
        code: department.code || "",
        name: department.name || "",
        accountCode: department.accountCode || "",
        head: department.head || null,
        isActive: department.isActive !== undefined ? department.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setDepartments(prev => [...prev, newDepartment])
      toast({
        title: "Department created",
        description: `${department.name} has been created successfully.`,
        open: true
      })
    }
    setCurrentDepartment(null)
    setDialogOpen(false)
  }

  // Handle department deletion
  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id))
    setSelectedDepartments(prev => prev.filter(deptId => deptId !== id))
    toast({
      title: "Department deleted",
      description: `The department has been removed.`,
      open: true
    })
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedDepartments.length === 0) return
    
    setDepartments(prev => 
      prev.filter(dept => !selectedDepartments.includes(dept.id))
    )
    setSelectedDepartments([])
    toast({
      title: "Departments deleted",
      description: `${selectedDepartments.length} departments have been deleted.`
    })
  }

  // Open dialog for editing
  const handleEditDepartment = (department: Department) => {
    setCurrentDepartment(department)
    setDialogOpen(true)
  }

  // Open dialog for creating
  const handleAddDepartment = () => {
    setCurrentDepartment(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <Button onClick={handleAddDepartment}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            {selectedDepartments.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={
                      filteredDepartments.length > 0 &&
                      selectedDepartments.length === filteredDepartments.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedDepartments.includes(department.id)}
                        onCheckedChange={() => toggleSelectDepartment(department.id)}
                      />
                    </TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.accountCode}</TableCell>
                    <TableCell>
                      {department.head ? (
                        <div className="flex flex-col">
                          <span>{department.head.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {department.head.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? "default" : "outline"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {department.updatedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteDepartment(department.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={currentDepartment}
        onSave={handleSaveDepartment}
      />
    </div>
  )
} 