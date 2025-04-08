'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the departments object
const departments: Record<string, string[]> = {
  operations: ["Store Operations", "Logistics", "Warehouse"],
  finance: ["Accounting", "Treasury", "Audit"],
  hr: ["Recruitment", "Training", "Employee Relations"],
  corporate: ["Legal", "Marketing", "IT"]
}

interface User {
  id?: string
  name: string
  email: string
  businessUnit: string
  roles: string[]
  locations: string[]
  workflows: string[]
  department: string
  hodStatus: boolean
  hodDepartments: string[]
  inviteStatus?: string
  lastLogin?: string
  accountStatus: string
}

interface UserFormDialogProps {
  user?: User
  onSubmit: (user: Omit<User, "id">) => Promise<void>
  trigger?: React.ReactNode
}

export function UserFormDialog({
  user,
  onSubmit,
  trigger,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState<User>(
    user || {
      name: "",
      email: "",
      businessUnit: "",
      roles: [],
      locations: [],
      workflows: [],
      department: "",
      hodStatus: false,
      hodDepartments: [],
      accountStatus: "active",
    }
  )
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      setOpen(false)
    } catch (error) {
      console.error("Form submission failed:", error)
    }
  }

  const handleMultiSelect = (field: keyof User, value: string) => {
    const currentValues = formData[field] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    setFormData({ ...formData, [field]: newValues })
  }

  const removeItem = (field: keyof User, value: string) => {
    const currentValues = formData[field] as string[]
    setFormData({
      ...formData,
      [field]: currentValues.filter((v) => v !== value),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {user ? "Edit User" : "Add New User"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {user
                ? "Update user information and permissions."
                : "Create a new user account with appropriate permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <Tabs defaultValue="basic" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="access">Access Control</TabsTrigger>
                <TabsTrigger value="status">Account Status</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessUnit">Business Unit</Label>
                      <Select
                        value={formData.businessUnit}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            businessUnit: value,
                            department: "",
                          })
                        }
                      >
                        <SelectTrigger id="businessUnit">
                          <SelectValue placeholder="Select business unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          setFormData({ ...formData, department: value })
                        }
                        disabled={!formData.businessUnit}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.businessUnit &&
                            departments[
                              formData.businessUnit as keyof typeof departments
                            ].map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="access" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => removeItem("roles", role)}
                            className="ml-1 hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Locations</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.locations.map((location) => (
                        <Badge
                          key={location}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => removeItem("locations", location)}
                            className="ml-1 hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Workflows</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.workflows.map((workflow) => (
                        <Badge
                          key={workflow}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {workflow}
                          <button
                            type="button"
                            onClick={() => removeItem("workflows", workflow)}
                            className="ml-1 hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hodStatus"
                      checked={formData.hodStatus}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hodStatus: checked })
                      }
                    />
                    <Label htmlFor="hodStatus">Head of Department</Label>
                  </div>

                  {formData.hodStatus && (
                    <div className="space-y-2">
                      <Label>HOD Departments</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.hodDepartments.map((dept) => (
                          <Badge
                            key={dept}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {dept}
                            <button
                              type="button"
                              onClick={() => removeItem("hodDepartments", dept)}
                              className="ml-1 hover:text-destructive"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountStatus">Account Status</Label>
                    <Select
                      value={formData.accountStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, accountStatus: value })
                      }
                    >
                      <SelectTrigger id="accountStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            Pending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {user && user.lastLogin && (
                    <div className="space-y-2">
                      <Label>Last Login</Label>
                      <p className="text-sm text-gray-500">{user.lastLogin}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 