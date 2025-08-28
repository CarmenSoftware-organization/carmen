"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  FileText, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Crown,
  Shield,
  Building,
  Users,
  Mail,
  MapPin
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mockRoles, mockDepartments, mockLocations } from '@/lib/mock-data/permission-roles'

interface User {
  id: string
  name: string
  email: string
  businessUnit: string
  department: string
  roles: string[]
  primaryRole?: string
  hodStatus: boolean
  inviteStatus?: string
  lastLogin?: string
  accountStatus: string
  approvalLimit?: {
    amount: number
    currency: string
  }
  clearanceLevel?: string
  locations?: string[]
  effectivePermissions?: string[]
  departments?: string[]
  specialPermissions?: string[]
  delegatedAuthorities?: string[]
  effectiveFrom?: Date
  effectiveTo?: Date
  isHod?: boolean
  businessUnitName?: string
}

interface UserCardViewProps {
  data: User[]
  selectedItems: string[]
  onSelectItem: (id: string) => void
  onSelectAll: () => void
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserCardView({
  data,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete
}: UserCardViewProps) {
  const getRoleName = (roleId: string) => {
    const role = mockRoles.find(r => r.id === roleId);
    return role?.name || roleId;
  }

  const getDepartmentName = (deptId: string) => {
    const dept = mockDepartments.find(d => d.id === deptId || d.name === deptId);
    return dept?.name || deptId;
  }

  const getLocationName = (locId: string) => {
    const location = mockLocations.find(l => l.id === locId);
    return location?.name || locId;
  }

  const getPrimaryRoleBadge = (user: User) => {
    if (!user.primaryRole) return <Badge variant="secondary">No Primary Role</Badge>;
    const role = mockRoles.find(r => r.id === user.primaryRole);
    if (!role) return <Badge variant="secondary">Unknown Role</Badge>;

    const hierarchy = role.hierarchy || 0;
    if (hierarchy >= 900) return <Badge className="bg-red-100 text-red-800"><Crown className="h-3 w-3 mr-1" />Executive</Badge>;
    if (hierarchy >= 700) return <Badge className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1" />Management</Badge>;
    if (hierarchy >= 400) return <Badge className="bg-green-100 text-green-800"><Building className="h-3 w-3 mr-1" />Supervisor</Badge>;
    return <Badge className="bg-gray-100 text-gray-800"><Users className="h-3 w-3 mr-1" />Staff</Badge>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspended</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={selectedItems.length === data.length && data.length > 0}
          onCheckedChange={onSelectAll}
          aria-label="Select all users"
        />
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Select all users ({selectedItems.length} of {data.length} selected)
        </label>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((user) => (
          <Card key={user.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.includes(user.id)}
                    onCheckedChange={() => onSelectItem(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{user.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(user)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit user
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-4">
              {/* Business Unit & Department */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {user.businessUnitName || user.businessUnit}
                </div>
                <div className="flex items-center text-sm">
                  <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>{getDepartmentName(user.department)}</span>
                </div>
              </div>

              {/* Primary Role */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Primary Role</div>
                <div className="flex items-center gap-2">
                  {getPrimaryRoleBadge(user)}
                </div>
              </div>

              {/* All Roles */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">All Roles</div>
                <div className="flex flex-wrap gap-1">
                  {user.roles.slice(0, 3).map(roleId => (
                    <Badge key={roleId} variant="outline" className="text-xs">
                      {getRoleName(roleId)}
                    </Badge>
                  ))}
                  {user.roles.length > 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-help">
                            +{user.roles.length - 3} more
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {user.roles.slice(3).map(roleId => (
                              <div key={roleId}>{getRoleName(roleId)}</div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Permissions</div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">
                      {user.effectivePermissions?.length || 0} permissions
                    </span>
                  </div>
                  {user.approvalLimit && (
                    <div className="text-xs text-muted-foreground">
                      Approval Limit: {user.approvalLimit.currency} {user.approvalLimit.amount.toLocaleString()}
                    </div>
                  )}
                  {user.clearanceLevel && (
                    <Badge variant="secondary" className="text-xs">
                      {user.clearanceLevel}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Locations */}
              {user.locations && user.locations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Locations</div>
                  <div className="flex flex-wrap gap-1">
                    {user.locations.slice(0, 2).map(locId => (
                      <div key={locId} className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{getLocationName(locId)}</span>
                      </div>
                    ))}
                    {user.locations.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{user.locations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getStatusBadge(user.accountStatus)}
                {(user.hodStatus || user.isHod) && (
                  <Badge variant="outline" className="text-xs">
                    HOD
                  </Badge>
                )}
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => onView(user)}>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}