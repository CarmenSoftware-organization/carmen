'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Building2,
  ArrowLeft,
  Save,
  Edit,
  X,
  MoreVertical,
  KeyRound,
  Send,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const businessUnits = ["Sales", "Engineering", "Marketing", "Finance", "HR"]
const departments = {
  Sales: ["Enterprise Sales", "SMB Sales", "Sales Operations"],
  Engineering: ["Frontend", "Backend", "DevOps", "QA"],
  Marketing: ["Digital Marketing", "Content", "Brand"],
  Finance: ["Accounting", "Treasury", "Tax"],
  HR: ["Recruitment", "Training", "Employee Relations"],
}
const roles = ["admin", "user", "manager", "developer", "sales_manager"]
const locations = ["HQ", "Branch 1", "Branch 2", "Branch 3", "Remote"]

// Mock data for demonstration
const mockUsers: Record<string, {
  id: string;
  name: string;
  email: string;
  businessUnit: string;
  department: string;
  roles: string[];
  locations: string[];
  hodStatus: boolean;
  hodDepartments: string[];
  inviteStatus: string;
  lastLogin: string;
  accountStatus: string;
  createdAt?: string;
}> = {
  "1": {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    businessUnit: "Sales",
    department: "Enterprise Sales",
    roles: ["sales_manager", "user"],
    locations: ["HQ", "Branch 1"],
    hodStatus: true,
    hodDepartments: ["Enterprise Sales", "SMB Sales"],
    inviteStatus: "accepted",
    lastLogin: "2024-02-20T10:00:00Z",
    accountStatus: "active",
    createdAt: "2023-01-15T08:30:00Z",
  },
  "2": {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    businessUnit: "Engineering",
    department: "Frontend",
    roles: ["developer", "user"],
    locations: ["HQ", "Remote"],
    hodStatus: true,
    hodDepartments: ["Frontend", "QA"],
    inviteStatus: "accepted",
    lastLogin: "2024-02-19T15:30:00Z",
    accountStatus: "active",
    createdAt: "2023-02-10T09:15:00Z",
  },
}

export default function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "view"
  const isNewUser = params.id === "new"
  const isViewMode = mode === "view" && !isNewUser
  const [formData, setFormData] = useState(() => {
    if (isNewUser) {
      return {
        name: "",
        email: "",
        businessUnit: "",
        department: "",
        roles: [],
        locations: [],
        hodStatus: false,
        hodDepartments: [],
        inviteStatus: "pending",
        accountStatus: "inactive",
        lastLogin: "",
        createdAt: new Date().toISOString(),
      }
    } else {
      return mockUsers[params.id] || {
        name: "",
        email: "",
        businessUnit: "",
        department: "",
        roles: [],
        locations: [],
        hodStatus: false,
        hodDepartments: [],
        inviteStatus: "pending",
        accountStatus: "inactive",
        lastLogin: "",
        createdAt: new Date().toISOString(),
      }
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      // In a real application, this would be an API call
      console.log("Saving user:", formData)
      // Navigate back to the list after successful save
      router.replace("/system-administration/user-management")
    } catch (error) {
      console.error("Error saving user:", error)
      // Handle error case
    }
  }

  const handleCancel = () => {
    // Navigate back to the list
    router.replace("/system-administration/user-management")
  }

  const handleMultiSelect = (field: "roles" | "locations" | "hodDepartments", value: string) => {
    const currentValues = formData[field] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]
    setFormData({ ...formData, [field]: newValues })
  }

  const removeItem = (field: "roles" | "locations" | "hodDepartments", value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((v) => v !== value)
    })
  }

  const handleResetPassword = () => {
    toast.success(`Password reset link sent to ${formData.email}`)
  }

  const handleResendInvite = () => {
    toast.success(`Invitation resent to ${formData.email}`)
  }

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
    if (confirmed) {
      toast.success("User deleted successfully")
      router.push("/system-administration/user-management")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{formData.name}</h1>
            <Badge
              variant={
                formData.accountStatus === "active"
                  ? "default"
                  : formData.accountStatus === "inactive"
                  ? "secondary"
                  : "destructive"
              }
              className="ml-2"
            >
              {formData.accountStatus.charAt(0).toUpperCase() +
                formData.accountStatus.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/system-administration/user-management/${params.id}?mode=edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleResetPassword()}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResendInvite()}>
                  <Send className="h-4 w-4 mr-2" />
                  Resend Invite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={""} />
                    <AvatarFallback className="text-2xl">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{formData.name}</h3>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span>{formData.department}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {formData.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={""}
                    onChange={(e) => handleInputChange(e)}
                    disabled={isViewMode}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="alternativeEmail">Alternative Email</Label>
                  <Input
                    id="alternativeEmail"
                    value={""}
                    onChange={(e) => handleInputChange(e)}
                    disabled={isViewMode}
                    placeholder="Enter alternative email"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange(e)}
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e)}
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
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
                      disabled={isViewMode}
                    >
                      <SelectTrigger id="businessUnit">
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                      disabled={isViewMode || !formData.businessUnit}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.businessUnit &&
                          departments[formData.businessUnit as keyof typeof departments].map(
                            (dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={""}
                      onChange={(e) => handleInputChange(e)}
                      disabled={isViewMode}
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={""}
                      onChange={(e) => handleInputChange(e)}
                      disabled={isViewMode}
                      placeholder="Enter employee ID"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="roles">Roles</Label>
                  {!isViewMode ? (
                    <Select
                      onValueChange={(value) => handleMultiSelect("roles", value)}
                    >
                      <SelectTrigger id="roles">
                        <SelectValue placeholder="Select role to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        {!isViewMode && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeItem("roles", role)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="locations">Assigned Locations</Label>
                  {!isViewMode ? (
                    <Select
                      onValueChange={(value) => handleMultiSelect("locations", value)}
                    >
                      <SelectTrigger id="locations">
                        <SelectValue placeholder="Select location to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.locations.map((location) => (
                      <Badge
                        key={location}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {location}
                        {!isViewMode && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeItem("locations", location)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountStatus">Account Status</Label>
                    <Select
                      value={formData.accountStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, accountStatus: value })
                      }
                      disabled={isViewMode}
                    >
                      <SelectTrigger id="accountStatus">
                        <SelectValue placeholder="Select account status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="inviteStatus">Invite Status</Label>
                    <Select
                      value={formData.inviteStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, inviteStatus: value })
                      }
                      disabled={isViewMode}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Last Login</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      {formData.lastLogin
                        ? new Date(formData.lastLogin).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Created At</Label>
                      <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                        {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 