"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { User, UserRole } from "../types/roles"

interface RoleSelectorProps {
  currentUser: User
  onUserChange: (user: User) => void
}

const mockUsers: User[] = [
  { id: "1", name: "John Smith", role: "requestor", department: "Housekeeping" },
  { id: "2", name: "Sarah Johnson", role: "requestor", department: "Food & Beverage" },
  { id: "3", name: "Mike Wilson", role: "department-manager", department: "Housekeeping" },
  { id: "4", name: "Lisa Brown", role: "department-manager", department: "Food & Beverage" },
  { id: "5", name: "David Chen", role: "purchasing-staff" },
  { id: "6", name: "Emma Davis", role: "purchasing-staff" },
]

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "requestor":
      return "bg-blue-100 text-blue-800"
    case "department-manager":
      return "bg-purple-100 text-purple-800"
    case "purchasing-staff":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case "requestor":
      return "Requestor"
    case "department-manager":
      return "Department Manager"
    case "purchasing-staff":
      return "Purchasing Staff"
    default:
      return role
  }
}

export default function RoleSelector({ currentUser, onUserChange }: RoleSelectorProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
      <div className="flex items-center gap-2">
        <span className="font-medium">Current User:</span>
        <Select
          value={currentUser.id}
          onValueChange={(userId) => {
            const user = mockUsers.find((u) => u.id === userId)
            if (user) onUserChange(user)
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <span>{user.name}</span>
                  <Badge className={getRoleBadgeColor(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                  {user.department && <span className="text-sm text-gray-500">({user.department})</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Badge className={getRoleBadgeColor(currentUser.role)}>{getRoleDisplayName(currentUser.role)}</Badge>
      {currentUser.department && <span className="text-sm text-gray-600">Department: {currentUser.department}</span>}
    </div>
  )
}
