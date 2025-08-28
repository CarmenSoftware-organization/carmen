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
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Settings,
  Trash2,
  Crown,
  Shield,
  Briefcase,
  User,
  Users,
  UserPlus,
  Lock
} from "lucide-react"
import { Role } from '@/lib/types/permissions'

interface RoleCardViewProps {
  data: Role[]
  selectedItems: string[]
  onSelectItem: (id: string) => void
  onSelectAll: () => void
  onView: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onDuplicate: (role: Role) => void
  onAssignUsers: (role: Role) => void
}

export function RoleCardView({
  data,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onAssignUsers
}: RoleCardViewProps) {
  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('Director') || roleName.includes('GM')) {
      return <Crown className="h-4 w-4 text-amber-500" />;
    } else if (roleName.includes('Manager')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else if (roleName.includes('Chef') || roleName.includes('Head')) {
      return <Briefcase className="h-4 w-4 text-green-500" />;
    } else if (roleName.includes('Admin')) {
      return <Users className="h-4 w-4 text-purple-500" />;
    } else {
      return <User className="h-4 w-4 text-gray-500" />;
    }
  }

  const getRolePriorityBadge = (hierarchy?: number) => {
    const priority = hierarchy || 0;
    
    if (priority >= 900) {
      return <Badge variant="destructive" className="text-xs">Executive</Badge>;
    } else if (priority >= 700) {
      return <Badge variant="default" className="text-xs">Management</Badge>;
    } else if (priority >= 400) {
      return <Badge className="text-xs bg-orange-100 text-orange-800">Supervisor</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Staff</Badge>;
    }
  }

  const getStatusBadge = (role: Role) => {
    const hasPermissions = role.permissions && role.permissions.length > 0
    if (hasPermissions) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={selectedItems.length === data.length && data.length > 0}
          onCheckedChange={onSelectAll}
          aria-label="Select all roles"
        />
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Select all roles ({selectedItems.length} of {data.length} selected)
        </label>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((role) => {
          const userCount = role.id.length % 25 + 1 // Mock user count based on role ID
          const permissionCount = role.permissions?.length || 0
          const inheritedCount = role.parentRoles?.length || 0
          
          return (
            <Card key={role.id} className="relative hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedItems.includes(role.id)}
                      onCheckedChange={() => onSelectItem(role.id)}
                      aria-label={`Select ${role.name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(role.name)}
                        <h3 className="font-semibold text-base truncate">{role.name}</h3>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="truncate">ID: {role.id}</span>
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
                      <DropdownMenuItem onClick={() => onView(role)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignUsers(role)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(role)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        className="text-destructive focus:text-destructive"
                        disabled={userCount > 0 || role.isSystem}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                {/* Description */}
                {role.description && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Description</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                  </div>
                )}

                {/* Hierarchy Level */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Hierarchy Level</div>
                  <div className="flex items-center gap-2">
                    {getRolePriorityBadge(role.hierarchy)}
                    <span className="text-xs text-muted-foreground">Level: {role.hierarchy || 0}</span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Permissions</div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Lock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{permissionCount} direct permissions</span>
                    </div>
                    {inheritedCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        + {inheritedCount} inherited from parent roles
                      </div>
                    )}
                  </div>
                </div>

                {/* User Assignment */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Users</div>
                  <div className="flex items-center text-sm">
                    <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{userCount} assigned users</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStatusBadge(role)}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(role)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roles found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}