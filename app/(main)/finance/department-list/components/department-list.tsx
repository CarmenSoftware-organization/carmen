'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Edit, Plus, Search, Trash2, XIcon } from "lucide-react"

interface Department {
  code: string
  name: string
  heads: string[]
  accountCode: string
  active: boolean
}

const initialDepartments: Department[] = [
  { code: "AC", name: "Finance / Accounting", heads: ["finance.head@example.com"], accountCode: "1", active: true },
  { code: "AD", name: "Administrator", heads: ["admin1@example.com", "admin2@example.com"], accountCode: "", active: true },
  { code: "FB", name: "Food and Beverage", heads: ["fb.manager@example.com"], accountCode: "", active: false },
  { code: "HR", name: "Human Resources", heads: ["hr.director@example.com"], accountCode: "", active: true },
]

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [newHead, setNewHead] = useState("")
  const [selectedHeads, setSelectedHeads] = useState<string[]>([])

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openEditModal = (department?: Department) => {
    if (department) {
      setEditingDepartment({ ...department })
    } else {
      setEditingDepartment({ code: "", name: "", heads: [], accountCode: "", active: true })
    }
    setSelectedHeads([])
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingDepartment(null)
    setSelectedHeads([])
  }

  const handleSave = () => {
    if (editingDepartment) {
      const updatedDepartments = departments.map((dept) =>
        dept.code === editingDepartment.code ? editingDepartment : dept
      )
      if (!departments.find((dept) => dept.code === editingDepartment.code)) {
        updatedDepartments.push(editingDepartment)
      }
      setDepartments(updatedDepartments)
      closeEditModal()
    }
  }

  const addHead = () => {
    if (editingDepartment && newHead) {
      setEditingDepartment({
        ...editingDepartment,
        heads: [...editingDepartment.heads, newHead],
      })
      setNewHead("")
    }
  }

  const removeSelectedHeads = () => {
    if (editingDepartment) {
      setEditingDepartment({
        ...editingDepartment,
        heads: editingDepartment.heads.filter((head) => !selectedHeads.includes(head)),
      })
      setSelectedHeads([])
    }
  }

  const toggleHeadSelection = (head: string) => {
    setSelectedHeads((prev) =>
      prev.includes(head) ? prev.filter((h) => h !== head) : [...prev, head]
    )
  }

  const handleDelete = (code: string) => {
    setDepartments((prevDepartments) => prevDepartments.filter((dept) => dept.code !== code))
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Department List</h1>
        <Button onClick={() => openEditModal()}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          New Department
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
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
            {filteredDepartments.map((dept) => (
              <TableRow key={dept.code}>
                <TableCell className="px-6 py-4">
                  <Badge variant="outline">{dept.code}</Badge>
                </TableCell>
                <TableCell className="px-6 py-4">{dept.name}</TableCell>
                <TableCell className="px-6 py-4">
                  {dept.heads.map((head, index) => (
                    <div key={index}>{head}</div>
                  ))}
                </TableCell>
                <TableCell className="px-6 py-4">{dept.accountCode}</TableCell>
                <TableCell className="px-6 py-4">
                  <Checkbox checked={dept.active} disabled />
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(dept)}>
                      <Edit className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.code)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
            <DialogTitle>{editingDepartment?.code ? 'Edit Department' : 'New Department'}</DialogTitle>
            <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    <XIcon className="h-4 w-4" />
                  </Button>
                </DialogClose>
          </div>
          </DialogHeader>
          {editingDepartment && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={editingDepartment.code}
                    onChange={(e) => setEditingDepartment({ ...editingDepartment, code: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingDepartment.name}
                    onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountCode" className="text-right">
                    Account Code
                  </Label>
                  <Input
                    id="accountCode"
                    value={editingDepartment.accountCode}
                    onChange={(e) => setEditingDepartment({ ...editingDepartment, accountCode: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Active</Label>
                  <div className="col-span-3">
                    <Checkbox
                      checked={editingDepartment.active}
                      onCheckedChange={(checked) => setEditingDepartment({ ...editingDepartment, active: checked as boolean })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Heads</Label>
                  <div className="col-span-3">
                    {editingDepartment.heads.map((head, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input value={head} readOnly />
                        <Button type="button" size="sm" variant="outline" onClick={() => {
                          const newHeads = [...editingDepartment.heads];
                          newHeads.splice(index, 1);
                          setEditingDepartment({ ...editingDepartment, heads: newHeads });
                        }}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newHead}
                        onChange={(e) => setNewHead(e.target.value)}
                        placeholder="New head email"
                      />
                      <Button type="button" size="sm" onClick={addHead}>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}