"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Star,
} from "lucide-react"
import {
  UserLocationAssignment,
  LocationUserRole,
  LocationPermission,
  LOCATION_ROLE_LABELS,
} from "@/lib/types/location-management"

interface UsersTabProps {
  locationId: string
  assignments: UserLocationAssignment[]
  isEditing: boolean
}

// Mock available users to assign
const availableUsers = [
  { id: 'user-007', name: 'Alex Turner', email: 'alex.t@company.com' },
  { id: 'user-008', name: 'Emma Davis', email: 'emma.d@company.com' },
  { id: 'user-009', name: 'Chris Lee', email: 'chris.l@company.com' },
]

const allPermissions: { id: LocationPermission; label: string; description: string }[] = [
  { id: 'location:view', label: 'View Location', description: 'View location details' },
  { id: 'location:edit', label: 'Edit Location', description: 'Edit location settings' },
  { id: 'inventory:view', label: 'View Inventory', description: 'View inventory levels' },
  { id: 'inventory:receive', label: 'Receive Stock', description: 'Receive incoming stock' },
  { id: 'inventory:issue', label: 'Issue Stock', description: 'Issue stock from location' },
  { id: 'inventory:adjust', label: 'Adjust Inventory', description: 'Make inventory adjustments' },
  { id: 'inventory:transfer', label: 'Transfer Stock', description: 'Transfer between locations' },
  { id: 'count:view', label: 'View Counts', description: 'View physical count data' },
  { id: 'count:participate', label: 'Participate in Counts', description: 'Enter count data' },
  { id: 'count:finalize', label: 'Finalize Counts', description: 'Approve and finalize counts' },
  { id: 'shelf:manage', label: 'Manage Shelves', description: 'Add/edit/delete shelves' },
]

export function UsersTab({ locationId, assignments, isEditing }: UsersTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<UserLocationAssignment | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<LocationUserRole>('viewer')
  const [selectedPermissions, setSelectedPermissions] = useState<LocationPermission[]>([])

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add the user assignment
    setShowAddDialog(false)
    setSelectedUserId('')
    setSelectedRole('viewer')
    setSelectedPermissions([])
  }

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the user assignment
    setEditingAssignment(null)
  }

  const handleRemoveUser = (assignment: UserLocationAssignment) => {
    if (window.confirm(`Are you sure you want to remove ${assignment.userName} from this location?`)) {
      // In a real app, this would remove the assignment
    }
  }

  const togglePermission = (permission: LocationPermission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  // Filter out already assigned users
  const unassignedUsers = availableUsers.filter(
    user => !assignments.some(a => a.userId === user.id)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Users</CardTitle>
            <CardDescription>
              Users who have access to this location
            </CardDescription>
          </div>
          {isEditing && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button disabled={unassignedUsers.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleAddUser}>
                  <DialogHeader>
                    <DialogTitle>Assign User to Location</DialogTitle>
                    <DialogDescription>
                      Select a user and configure their role and permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role at Location</Label>
                        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as LocationUserRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(LOCATION_ROLE_LABELS).map(([role, label]) => (
                              <SelectItem key={role} value={role}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                        {allPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <div className="grid gap-0.5">
                              <Label htmlFor={permission.id} className="text-sm font-normal">
                                {permission.label}
                              </Label>
                              <span className="text-xs text-muted-foreground">
                                {permission.description}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!selectedUserId}>
                      Assign User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users assigned to this location</p>
              {isEditing && unassignedUsers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First User
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  {isEditing && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LOCATION_ROLE_LABELS[assignment.roleAtLocation]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {assignment.permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm.split(':')[1]}
                          </Badge>
                        ))}
                        {assignment.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{assignment.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.isPrimary && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.assignedAt.toLocaleDateString()}
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAssignment(assignment)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveUser(assignment)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={(open) => !open && setEditingAssignment(null)}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Edit User Assignment</DialogTitle>
              <DialogDescription>
                Update role and permissions for {editingAssignment?.userName}
              </DialogDescription>
            </DialogHeader>
            {editingAssignment && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role at Location</Label>
                  <Select defaultValue={editingAssignment.roleAtLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOCATION_ROLE_LABELS).map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                    {allPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`edit-${permission.id}`}
                          defaultChecked={editingAssignment.permissions.includes(permission.id)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={`edit-${permission.id}`} className="text-sm font-normal">
                            {permission.label}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {permission.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
