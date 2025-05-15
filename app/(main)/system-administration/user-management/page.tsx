"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BulkActions } from "./components/bulk-actions"
import { UserFormDialog } from "./components/user-form-dialog"
import { 
  PlusCircle, 
  X, 
  UserPlus, 
  Search, 
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
}

interface User {
  id: string
  name: string
  email: string
  businessUnit: string
  department: string
  roles: string[]
  hodStatus: boolean
  inviteStatus?: string
  lastLogin?: string
  accountStatus: string
}

const FILTER_FIELDS = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Business Unit", value: "businessUnit" },
  { label: "Department", value: "department" },
  { label: "Role", value: "roles" },
  { label: "HOD Status", value: "hodStatus" },
  { label: "Invite Status", value: "inviteStatus" },
  { label: "Account Status", value: "accountStatus" },
]

const FILTER_OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "notEquals" },
  { label: "Is empty", value: "isEmpty" },
  { label: "Is not empty", value: "isNotEmpty" },
]

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    businessUnit: "Sales",
    department: "Enterprise Sales",
    roles: ["sales_manager", "user"],
    hodStatus: true,
    inviteStatus: "accepted",
    lastLogin: "2024-02-20T10:00:00Z",
    accountStatus: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    businessUnit: "Engineering",
    department: "Frontend",
    roles: ["developer", "user"],
    hodStatus: false,
    inviteStatus: "accepted",
    lastLogin: "2024-02-19T15:30:00Z",
    accountStatus: "active",
  },
]

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const addFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: FILTER_FIELDS[0].value,
      operator: FILTER_OPERATORS[0].value,
      value: "",
    }
    setFilterConditions([...filterConditions, newCondition])
  }

  const removeFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter((condition) => condition.id !== id))
  }

  const updateFilterCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string
  ) => {
    setFilterConditions(
      filterConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    )
  }

  const handleBulkAction = async (action: string, data: any) => {
    // Implement bulk action logic here
    console.log("Bulk action:", action, data, "for users:", selectedUsers)
  }

  const handleUserSubmit = async (userData: Omit<User, "id">) => {
    // In a real application, this would be an API call
    router.push("/system-administration/user-management/new")
  }

  const applyFilters = (user: User) => {
    return filterConditions.every((condition) => {
      const fieldValue = user[condition.field as keyof User]
      
      switch (condition.operator) {
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(condition.value.toLowerCase())
        case "equals":
          return String(fieldValue).toLowerCase() === condition.value.toLowerCase()
        case "notEquals":
          return String(fieldValue).toLowerCase() !== condition.value.toLowerCase()
        case "isEmpty":
          return !fieldValue || String(fieldValue).trim() === ""
        case "isNotEmpty":
          return fieldValue && String(fieldValue).trim() !== ""
        default:
          return true
      }
    })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || user.accountStatus === statusFilter
    const matchesAdvancedFilters = filterConditions.length === 0 || applyFilters(user)
    return matchesSearch && matchesStatus && matchesAdvancedFilters
  })

  const handleDelete = async (userId: string) => {
    // In a real application, this would be an API call
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId))
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleView = (userId: string) => {
    router.push(`/system-administration/user-management/${userId}?mode=view`)
  }

  const handleEdit = (userId: string) => {
    router.push(`/system-administration/user-management/${userId}?mode=edit`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={() => router.push("/system-administration/user-management/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-[300px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[160px]">
                {/* <Filter className="h-4 w-4 mr-2" /> */}
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    All Status
                  </div>
                </SelectItem>
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
                    <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                    Suspended
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More Filters {filterConditions.length > 0 && `(${filterConditions.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4" align="end">
                <div className="space-y-4">
                  <div className="font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </div>
                  {filterConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center gap-2">
                      <Select
                        value={condition.field}
                        onValueChange={(value) =>
                          updateFilterCondition(condition.id, "field", value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateFilterCondition(condition.id, "operator", value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPERATORS.map((operator) => (
                            <SelectItem key={operator.value} value={operator.value}>
                              {operator.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!["isEmpty", "isNotEmpty"].includes(condition.operator) && (
                        <Input
                          value={condition.value}
                          onChange={(e) =>
                            updateFilterCondition(
                              condition.id,
                              "value",
                              e.target.value
                            )
                          }
                          className="flex-1"
                          placeholder="Value"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilterCondition(condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={addFilterCondition}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center">
          <BulkActions
            selectedCount={selectedUsers.length}
            onAction={handleBulkAction}
          />
        </div>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="font-bold text-base py-3">Username</TableHead>
              <TableHead className="font-bold text-base py-3">Email</TableHead>
              <TableHead className="font-bold text-base py-3">Role</TableHead>
              <TableHead className="font-bold text-base py-3">Status</TableHead>
              <TableHead className="font-bold text-base py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, idx) => (
              <TableRow key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/50'}>
                <TableCell className="font-semibold text-primary py-3 align-middle">{user.name}</TableCell>
                <TableCell className="py-3 align-middle">{user.email}</TableCell>
                <TableCell className="py-3 align-middle">{user.roles.join(', ')}</TableCell>
                <TableCell className="py-3 align-middle">
                  <Badge className={`bg-${user.accountStatus === 'active' ? 'green' : user.accountStatus === 'inactive' ? 'gray' : 'yellow'}-100 text-${user.accountStatus === 'active' ? 'green-800' : user.accountStatus === 'inactive' ? 'gray-600' : 'yellow-800'} border-${user.accountStatus === 'active' ? 'green-200' : user.accountStatus === 'inactive' ? 'gray-200' : 'yellow-200'}`}>
                    {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-1 py-3 align-middle justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="View" onClick={() => handleView(user.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => handleEdit(user.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 