'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BulkActions, BulkActionData } from "./components/bulk-actions"
import { EnhancedFilter, FilterCondition, SavedFilter } from "./components/enhanced-filter"
import { StatusBadge } from "./components/status-badge"
import { UserCard } from "./components/user-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  LayoutGrid,
  LayoutList,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  businessUnit: string
  department: string
  roles: string[]
  hodStatus: boolean
  inviteStatus?: string
  lastLogin?: string | null
  accountStatus: string
}

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
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    businessUnit: "Finance",
    department: "Accounting",
    roles: ["finance_manager", "user"],
    hodStatus: true,
    inviteStatus: "pending",
    lastLogin: "2024-02-15T09:45:00Z",
    accountStatus: "active",
  },
  {
    id: "4",
    name: "Emily Williams",
    email: "emily.williams@example.com",
    businessUnit: "Marketing",
    department: "Digital Marketing",
    roles: ["marketing_specialist", "user"],
    hodStatus: false,
    inviteStatus: "sent",
    lastLogin: "2024-02-18T14:20:00Z",
    accountStatus: "inactive",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    businessUnit: "Operations",
    department: "Supply Chain",
    roles: ["operations_manager", "user"],
    hodStatus: true,
    inviteStatus: "accepted",
    lastLogin: "2024-02-17T11:30:00Z",
    accountStatus: "active",
  },
  {
    id: "6",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    businessUnit: "Human Resources",
    department: "Talent Acquisition",
    roles: ["hr_specialist", "user"],
    hodStatus: false,
    inviteStatus: "expired",
    lastLogin: null,
    accountStatus: "suspended",
  },
  {
    id: "7",
    name: "James Wilson",
    email: "james.wilson@example.com",
    businessUnit: "IT",
    department: "Infrastructure",
    roles: ["it_admin", "user"],
    hodStatus: false,
    inviteStatus: "accepted",
    lastLogin: "2024-02-16T16:15:00Z",
    accountStatus: "active",
  },
  {
    id: "8",
    name: "Jessica Taylor",
    email: "jessica.taylor@example.com",
    businessUnit: "Customer Support",
    department: "Technical Support",
    roles: ["support_lead", "user"],
    hodStatus: true,
    inviteStatus: "accepted",
    lastLogin: "2024-02-14T10:10:00Z",
    accountStatus: "active",
  },
]

// Mock filter presets
const mockPresets: SavedFilter[] = [
  {
    id: "preset1",
    name: "Active Users",
    conditions: [
      {
        id: "cond1",
        field: "accountStatus",
        operator: "equals",
        value: "active",
      },
    ],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "preset2",
    name: "Pending Invites",
    conditions: [
      {
        id: "cond2",
        field: "inviteStatus",
        operator: "equals",
        value: "pending",
      },
    ],
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
]

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(mockPresets)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkAction = async <T extends keyof BulkActionData>(action: T, data?: BulkActionData[T]) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      switch (action) {
        case "invite":
          // Handle invite action
          console.log("Inviting users:", data)
          break
        case "status":
          if (data && "status" in data) {
            setUsers(users.map(user => 
              selectedUsers.includes(user.id) 
                ? { ...user, accountStatus: String(data.status) } 
                : user
            ))
          }
          break
        case "role":
          // Handle role assignment
          console.log("Assigning roles:", data)
          break
        case "department":
          // Handle department assignment
          console.log("Assigning department:", data)
          break
        case "delete":
          setUsers(users.filter(user => !selectedUsers.includes(user.id)))
          setSelectedUsers([])
          break
        default:
          throw new Error(`Unsupported action: ${String(action)}`)
      }
    } catch (error) {
      console.error("Error performing bulk action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (user: User) => {
    if (filterConditions.length === 0) return true;
    
    let result = true;
    let currentOperator: 'AND' | 'OR' | undefined = undefined;
    
    for (let i = 0; i < filterConditions.length; i++) {
      const condition = filterConditions[i];
      const fieldValue = user[condition.field as keyof User];
      
      // Evaluate the current condition
      let conditionResult = true;
      
      switch (condition.operator) {
        case "contains":
          conditionResult = String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
          break;
        case "equals":
          conditionResult = String(fieldValue).toLowerCase() === String(condition.value).toLowerCase();
          break;
        case "notEquals":
          conditionResult = String(fieldValue).toLowerCase() !== String(condition.value).toLowerCase();
          break;
        case "isEmpty":
          conditionResult = !fieldValue || String(fieldValue).trim() === "";
          break;
        case "isNotEmpty":
          conditionResult = !!fieldValue && String(fieldValue).trim() !== "";
          break;
        case "greaterThan":
          conditionResult = Number(fieldValue) > Number(condition.value);
          break;
        case "lessThan":
          conditionResult = Number(fieldValue) < Number(condition.value);
          break;
        case "in":
          if (Array.isArray(condition.value)) {
            conditionResult = condition.value.includes(String(fieldValue));
          } else if (typeof condition.value === 'string') {
            const values = condition.value.split(',').map(v => v.trim().toLowerCase());
            conditionResult = values.includes(String(fieldValue).toLowerCase());
          }
          break;
        case "between":
          if (Array.isArray(condition.value) && condition.value.length === 2) {
            const [min, max] = condition.value;
            conditionResult = Number(fieldValue) >= Number(min) && Number(fieldValue) <= Number(max);
          } else if (typeof condition.value === 'string') {
            const [min, max] = condition.value.split(',').map(v => Number(v.trim()));
            conditionResult = Number(fieldValue) >= min && Number(fieldValue) <= max;
          }
          break;
        default:
          conditionResult = true;
      }
      
      // Apply the logical operator
      if (i === 0) {
        result = conditionResult;
      } else if (currentOperator === 'AND') {
        result = result && conditionResult;
      } else if (currentOperator === 'OR') {
        result = result || conditionResult;
      }
      
      // Store the operator for the next iteration
      currentOperator = condition.logicalOperator;
    }
    
    return result;
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAdvancedFilters = filterConditions.length === 0 || applyFilters(user)
    return matchesSearch && matchesAdvancedFilters
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (userId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In a real application, this would be an API call
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId))
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
    
    setIsLoading(false)
  }

  const handleView = (userId: string) => {
    router.push(`/system-administration/user-management/${userId}?mode=view`)
  }

  const handleEdit = (userId: string) => {
    router.push(`/system-administration/user-management/${userId}?mode=edit`)
  }

  const handleFilterChange = (conditions: FilterCondition[]) => {
    setFilterConditions(conditions)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSaveFilter = (filter: SavedFilter) => {
    setSavedFilters([...savedFilters, filter])
  }

  const handleDeleteSavedFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(filter => filter.id !== id))
  }

  const handleToggleDefaultFilter = (id: string) => {
    setSavedFilters(savedFilters.map(filter => 
      filter.id === id 
        ? { ...filter, isDefault: !filter.isDefault } 
        : filter
    ))
  }

  const handleSelectUser = (userId: string, isSelected: boolean | string | string[] | null | undefined) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSelectAllUsers = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const exportData = (format: 'csv' | 'excel') => {
    // In a real application, this would trigger a download
    console.log(`Exporting data in ${format} format`, filteredUsers)
    alert(`Exporting ${filteredUsers.length} users in ${format} format`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6 px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user accounts, permissions, and access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportData('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => router.push("/system-administration/user-management/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page when search changes
                  }}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <EnhancedFilter
                  filterConditions={filterConditions}
                  onFilterChange={handleFilterChange}
                  savedFilters={savedFilters}
                  onSaveFilter={handleSaveFilter}
                  onDeleteSavedFilter={handleDeleteSavedFilter}
                  onToggleDefaultFilter={handleToggleDefaultFilter}
                />
                <div className="border-l h-8 mx-2" />
                <div className="bg-muted rounded-md p-1">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("table")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-muted/50 border rounded-lg p-6 flex items-center">
            <div className="ml-2 mr-4">
              <Checkbox
                checked={
                  filteredUsers.length > 0 &&
                  filteredUsers.every((user) => selectedUsers.includes(user.id))
                }
                onCheckedChange={handleSelectAllUsers}
                className="mr-2"
              />
              <span className="text-sm font-medium">{selectedUsers.length} selected</span>
            </div>
            <BulkActions
              selectedCount={selectedUsers.length}
              onAction={handleBulkAction}
            />
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-white rounded-lg border">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-6">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setFilterConditions([])
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : viewMode === "table" ? (
            // Table View
            <div className="px-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/75">
                    <TableHead className="w-12 py-3 font-medium text-gray-600">
                      <Checkbox
                        checked={
                          paginatedUsers.length > 0 &&
                          paginatedUsers.every((user) => selectedUsers.includes(user.id))
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([
                              ...selectedUsers,
                              ...paginatedUsers
                                .filter((user) => !selectedUsers.includes(user.id))
                                .map((user) => user.id),
                            ])
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter(
                                (id) => !paginatedUsers.find((user) => user.id === id)
                              )
                            )
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Name</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Email</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Department</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Roles</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                    <TableHead className="py-3 font-medium text-gray-600">Last Login</TableHead>
                    <TableHead className="w-24 py-3 font-medium text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="group hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => handleView(user.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            handleSelectUser(user.id, checked as boolean)
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-1">{user.businessUnit}</span>
                          <span className="text-xs mx-1">•</span>
                          <span>{user.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.slice(0, 2).map((role) => (
                            <Badge 
                              key={role} 
                              variant="outline" 
                              className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                            >
                              {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          ))}
                          {user.roles.length > 2 && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                              +{user.roles.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={user.accountStatus} type="account" />
                          {user.inviteStatus && (
                            <StatusBadge status={user.inviteStatus} type="invite" size="sm" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(user.id)}>
                                <Search className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.includes(user.id)}
                    onSelect={handleSelectUser}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-2">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      // Add ellipsis
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        )
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 