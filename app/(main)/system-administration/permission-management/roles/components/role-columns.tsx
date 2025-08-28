"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Copy, Eye, Settings, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Role } from '@/lib/types/permissions'
import { Crown, Shield, Briefcase, User } from "lucide-react"

interface RoleColumnsProps {
  onView: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onDuplicate: (role: Role) => void
  onAssignUsers: (role: Role) => void
}

const getRoleIcon = (roleName: string) => {
  if (roleName.includes('Director') || roleName.includes('GM')) {
    return <Crown className="h-4 w-4 text-amber-500" />;
  } else if (roleName.includes('Manager')) {
    return <Shield className="h-4 w-4 text-blue-500" />;
  } else if (roleName.includes('Chef') || roleName.includes('Head')) {
    return <Briefcase className="h-4 w-4 text-green-500" />;
  } else if (roleName.includes('Admin')) {
    return <User className="h-4 w-4 text-purple-500" />;
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

export const createRoleColumns = ({ onView, onEdit, onDelete, onDuplicate, onAssignUsers }: RoleColumnsProps): ColumnDef<Role>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Role Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getRoleIcon(role.name)}
            <div className="font-medium text-foreground">{role.name}</div>
            {role.isSystem && (
              <Badge variant="outline" className="text-xs">
                System
              </Badge>
            )}
          </div>
          {role.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">{role.description}</div>
          )}
          <div className="text-xs text-muted-foreground">ID: {role.id}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "hierarchy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getRolePriorityBadge(role.hierarchy)}
          </div>
          <div className="text-xs text-muted-foreground">
            Level: {role.hierarchy || 0}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const role = row.original
      const permissionCount = role.permissions?.length || 0
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {permissionCount} permissions
          </div>
          {role.parentRoles && role.parentRoles.length > 0 && (
            <div className="text-xs text-muted-foreground">
              + {role.parentRoles.length} inherited
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "userCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Users
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original
      // Mock user count based on role ID for consistent server/client rendering
      const userCount = role.id.length % 25 + 1
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {userCount} users
          </div>
          <div className="text-xs text-muted-foreground">
            Active assignments
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const role = row.original
      const userCount = role.id.length % 25 + 1

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(role.id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy role ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
              Delete role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]