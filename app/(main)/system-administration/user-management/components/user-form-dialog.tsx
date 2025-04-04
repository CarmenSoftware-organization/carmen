"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

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
  const [open, setOpen] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
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
                  <Label htmlFor="roles">Roles</Label>
                  <Select
                    onValueChange={(value) => handleMultiSelect("roles", value)}
                  >
                    <SelectTrigger id="roles">
                      <SelectValue placeholder="Select roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="cursor-pointer pr-1.5"
                      >
                        {role}
                        <button
                          onClick={() => removeItem("roles", role)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locations">Assigned Locations</Label>
                  <Select
                    onValueChange={(value) =>
                      handleMultiSelect("locations", value)
                    }
                  >
                    <SelectTrigger id="locations">
                      <SelectValue placeholder="Select locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hq">Headquarters</SelectItem>
                      <SelectItem value="branch1">Branch 1</SelectItem>
                      <SelectItem value="branch2">Branch 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.locations.map((location) => (
                      <Badge
                        key={location}
                        variant="secondary"
                        className="cursor-pointer pr-1.5"
                      >
                        {location}
                        <button
                          onClick={() => removeItem("locations", location)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hodStatus">Head of Department</Label>
                    <Switch
                      id="hodStatus"
                      checked={formData.hodStatus}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          hodStatus: checked,
                          hodDepartments: checked
                            ? formData.hodDepartments
                            : [],
                        });
                      }}
                    />
                  </div>

                  {formData.hodStatus && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="hodDepartments">
                        Department Head Of
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          handleMultiSelect("hodDepartments", value)
                        }
                      >
                        <SelectTrigger id="hodDepartments">
                          <SelectValue placeholder="Select departments" />
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.hodDepartments.map((dept) => (
                          <Badge
                            key={dept}
                            variant="secondary"
                            className="cursor-pointer pr-1.5"
                          >
                            {dept}
                            <button
                              onClick={() => removeItem("hodDepartments", dept)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                      <SelectValue placeholder="Select account status" />
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
                      <SelectItem value="suspended">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          Suspended
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteStatus">Invite Status</Label>
                  <Select
                    value={formData.inviteStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, inviteStatus: value })
                    }
                  >
                    <SelectTrigger id="inviteStatus">
                      <SelectValue placeholder="Select invite status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {user ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 