'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'

type Department = {
  code: string
  name: string
  head: string
  accountCode: string
  active: boolean
}

const initialDepartments: Department[] = [
  { code: 'AC', name: 'Finance / Accounting', head: 'john@example.com', accountCode: '1', active: true },
  { code: 'AD', name: 'Administrator', head: 'admin1@example.com, admin2@example.com', accountCode: '', active: true },
  { code: 'FB', name: 'Food and Beverage', head: 'fb@example.com', accountCode: '', active: false },
  { code: 'HR', name: 'Human Resources', head: 'hr@example.com', accountCode: '', active: true },
]

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false)
  const [newDepartment, setNewDepartment] = useState<Department>({ code: '', name: '', head: '', accountCode: '', active: true })

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    setDepartments([...departments, newDepartment])
    setNewDepartment({ code: '', name: '', head: '', accountCode: '', active: true })
    setIsAddDepartmentOpen(false)
  }

  const handleEditDepartment = (code: string) => {
    console.log(`Edit department with code: ${code}`)
    // Implement edit functionality here
  }

  const handleDeleteDepartment = (code: string) => {
    console.log(`Delete department with code: ${code}`)
    // Implement delete functionality here
  }

  return (
    <div className="p-6 mx-auto  bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Department List</h1>
        <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newDepartment.code}
                  onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="head">Head of Department</Label>
                <Input
                  id="head"
                  value={newDepartment.head}
                  onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountCode">Account Code</Label>
                <Input
                  id="accountCode"
                  value={newDepartment.accountCode}
                  onChange={(e) => setNewDepartment({ ...newDepartment, accountCode: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newDepartment.active}
                  onChange={(e) => setNewDepartment({ ...newDepartment, active: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-primary"
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <Button type="submit">Add Department</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Head of Department</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.code}>
              <TableCell>{department.code}</TableCell>
              <TableCell>{department.name}</TableCell>
              <TableCell>{department.head}</TableCell>
              <TableCell>{department.accountCode}</TableCell>
              <TableCell>
                {department.active ? (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditDepartment(department.code)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(department.code)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}