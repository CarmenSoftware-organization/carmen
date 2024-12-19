"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  User,
  Building2,
  Users,
  Mail,
  Briefcase,
  UserCog,
  ArrowLeft,
  Save,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  UserCircle,
  ScrollText
} from "lucide-react"

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

export default function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const isNewUser = params.id === "new"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessUnit: "",
    department: "",
    roles: [] as string[],
    hodStatus: false,
    inviteStatus: "pending",
    accountStatus: "inactive",
  })

  const handleSave = async () => {
    // In a real application, this would be an API call
    console.log("Saving user:", formData)
    router.push("/system-administration/user-management")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/system-administration/user-management")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">
                {isNewUser ? "Add New User" : "Edit User"}
              </h1>
            </div>
            <p className="text-gray-500">
              {isNewUser
                ? "Create a new user account"
                : "Update user account details"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/system-administration/user-management")}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>User's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>User's position and department information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Business Unit
                </label>
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
                  <SelectTrigger>
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
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Assigned Department
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                  disabled={!formData.businessUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned department" />
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
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>User's roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Roles
                </label>
                <Select
                  value={formData.roles[0] || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roles: [value] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  HOD Status
                </label>
                <Select
                  value={formData.hodStatus ? "yes" : "no"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hodStatus: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HOD status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Account Status
              </CardTitle>
              <CardDescription>User's account and invitation status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Account Status
                </label>
                <Select
                  value={formData.accountStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, accountStatus: value })
                  }
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invite Status
                </label>
                <Select
                  value={formData.inviteStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, inviteStatus: value })
                  }
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 