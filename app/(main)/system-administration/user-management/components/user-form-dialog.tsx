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
import { Card } from "@/components/ui/card"
import { User, UserIcon } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission failed:", error)
    } finally {
      setIsLoading(false)
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
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {user ? "Edit User" : "Add New User"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              <DialogTitle>
                {user ? "Edit User" : "Add New User"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {user
                ? "Update user information and access rights"
                : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>

          <Card className="p-6 mt-4">
            <div className="space-y-6">
              {/* Business Unit Selection */}
              <div className="space-y-2">
                <Label htmlFor="businessUnit">Business Unit</Label>
                <Select
                  value={formData.businessUnit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, businessUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <Select
                      value=""
                      onValueChange={(value) => handleMultiSelect("roles", value)}
                    >
                      <SelectTrigger>
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
                          className="cursor-pointer"
                          onClick={() => removeItem("roles", role)}
                        >
                          {role} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Workflows</Label>
                    <Select
                      value=""
                      onValueChange={(value) => handleMultiSelect("workflows", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflows" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approval">Approval</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="publish">Publish</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.workflows.map((workflow) => (
                        <Badge
                          key={workflow}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeItem("workflows", workflow)}
                        >
                          {workflow} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Locations</Label>
                    <Select
                      value=""
                      onValueChange={(value) => handleMultiSelect("locations", value)}
                    >
                      <SelectTrigger>
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
                          className="cursor-pointer"
                          onClick={() => removeItem("locations", location)}
                        >
                          {location} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* HOD Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hod"
                    checked={formData.hodStatus}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hodStatus: checked })
                    }
                  />
                  <Label htmlFor="hod">Head of Department</Label>
                </div>

                {formData.hodStatus && (
                  <div className="space-y-2 ml-6">
                    <Label>Department Head Of</Label>
                    <Select
                      value=""
                      onValueChange={(value) => handleMultiSelect("hodDepartments", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.hodDepartments.map((dept) => (
                        <Badge
                          key={dept}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeItem("hodDepartments", dept)}
                        >
                          {dept} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : user ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 