"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, FileText, Edit, Trash2 } from "lucide-react"
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
import { mockRoles, mockDepartments } from '@/lib/mock-data/permission-roles'
import { Crown, Shield, Building, Users } from "lucide-react"

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

interface UserColumnsProps {
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const createUserColumns = ({ onView, onEdit, onDelete }: UserColumnsProps): ColumnDef<User>[] => [
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
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="text-xs text-muted-foreground">{user.businessUnitName || user.businessUnit}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "primaryRole",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Primary Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      
      const getRoleName = (roleId: string) => {
        const role = mockRoles.find(r => r.id === roleId);
        return role?.name || roleId;
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

      if (!user.primaryRole) {
        return <Badge variant="secondary">No Primary Role</Badge>
      }

      return (
        <div className="flex items-center gap-2">
          {getPrimaryRoleBadge(user)}
          <span className="text-sm truncate max-w-[150px]">{getRoleName(user.primaryRole)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "roles",
    header: "All Roles",
    cell: ({ row }) => {
      const user = row.original
      const getRoleName = (roleId: string) => {
        const role = mockRoles.find(r => r.id === roleId);
        return role?.name || roleId;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {user.roles.slice(0, 2).map(roleId => (
            <Badge key={roleId} variant="outline" className="text-xs">
              {getRoleName(roleId)}
            </Badge>
          ))}
          {user.roles.length > 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs cursor-help">
                    +{user.roles.length - 2} more
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {user.roles.slice(2).map(roleId => (
                      <div key={roleId}>{getRoleName(roleId)}</div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {(user.departments || [user.department]).slice(0, 2).map(deptId => {
            const dept = mockDepartments.find(d => d.id === deptId || d.name === deptId)
            return (
              <Badge key={deptId} variant="outline" className="text-xs">
                {dept?.code || deptId}
              </Badge>
            )
          })}
          {(user.departments || []).length > 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs cursor-help">
                    +{(user.departments?.length || 1) - 2} more
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {user.departments?.slice(2).map(deptId => {
                      const dept = mockDepartments.find(d => d.id === deptId)
                      return <div key={deptId}>{dept?.name || deptId}</div>
                    })}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "effectivePermissions",
    header: "Permissions",
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">
              {user.effectivePermissions?.length || 0} permissions
            </span>
          </div>
          {user.approvalLimit && (
            <div className="text-xs text-muted-foreground">
              Limit: {user.approvalLimit.currency} {user.approvalLimit.amount.toLocaleString()}
            </div>
          )}
          {user.clearanceLevel && (
            <Badge variant="secondary" className="text-xs">
              {user.clearanceLevel}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "accountStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      
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

      return getStatusBadge(user.accountStatus)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original

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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]