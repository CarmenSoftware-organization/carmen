"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Search,
  Users,
} from "lucide-react"
import { UserLocationAssignment } from "@/lib/types/location-management"

interface UsersTabProps {
  locationId: string
  assignments: UserLocationAssignment[]
  isEditing: boolean
  onAssignmentsChange?: (assignedUserIds: string[]) => void
}

// Mock available users - in real app, this would come from API
const allAvailableUsers = [
  { id: 'user-001', name: 'John Smith', email: 'john.smith@company.com' },
  { id: 'user-002', name: 'Sarah Johnson', email: 'sarah.j@company.com' },
  { id: 'user-003', name: 'Mike Chen', email: 'mike.c@company.com' },
  { id: 'user-004', name: 'Lisa Wong', email: 'lisa.w@company.com' },
  { id: 'user-005', name: 'Tom Brown', email: 'tom.b@company.com' },
  { id: 'user-006', name: 'James Wilson', email: 'james.w@company.com' },
  { id: 'user-007', name: 'Alex Turner', email: 'alex.t@company.com' },
  { id: 'user-008', name: 'Emma Davis', email: 'emma.d@company.com' },
  { id: 'user-009', name: 'Chris Lee', email: 'chris.l@company.com' },
  { id: 'user-010', name: 'Rachel Green', email: 'rachel.g@company.com' },
  { id: 'user-011', name: 'David Kim', email: 'david.k@company.com' },
  { id: 'user-012', name: 'Jennifer Lopez', email: 'jennifer.l@company.com' },
]

interface UserItem {
  id: string
  name: string
  email: string
}

export function UsersTab({ locationId, assignments, isEditing, onAssignmentsChange }: UsersTabProps) {
  // Convert assignments to user items for the assigned panel
  const initialAssignedUsers: UserItem[] = assignments.map(a => ({
    id: a.userId,
    name: a.userName,
    email: a.userEmail,
  }))

  const [assignedUsers, setAssignedUsers] = useState<UserItem[]>(initialAssignedUsers)
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
  const [globalSearch, setGlobalSearch] = useState('')

  // Notify parent when assigned users change
  useEffect(() => {
    onAssignmentsChange?.(assignedUsers.map(u => u.id))
  }, [assignedUsers, onAssignmentsChange])

  // Available users are those not in assigned list
  const availableUsers = useMemo(() => {
    return allAvailableUsers.filter(
      user => !assignedUsers.some(a => a.id === user.id)
    )
  }, [assignedUsers])

  // Filtered lists based on global search
  const filteredAvailable = useMemo(() => {
    if (!globalSearch) return availableUsers
    const search = globalSearch.toLowerCase()
    return availableUsers.filter(
      user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
    )
  }, [availableUsers, globalSearch])

  const filteredAssigned = useMemo(() => {
    if (!globalSearch) return assignedUsers
    const search = globalSearch.toLowerCase()
    return assignedUsers.filter(
      user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
    )
  }, [assignedUsers, globalSearch])

  // Move selected users from available to assigned
  const moveToAssigned = () => {
    const usersToMove = availableUsers.filter(u => selectedAvailable.includes(u.id))
    setAssignedUsers(prev => [...prev, ...usersToMove])
    setSelectedAvailable([])
  }

  // Move all available users to assigned
  const moveAllToAssigned = () => {
    setAssignedUsers(prev => [...prev, ...availableUsers])
    setSelectedAvailable([])
  }

  // Move selected users from assigned to available
  const moveToAvailable = () => {
    setAssignedUsers(prev => prev.filter(u => !selectedAssigned.includes(u.id)))
    setSelectedAssigned([])
  }

  // Move all assigned users to available
  const moveAllToAvailable = () => {
    setAssignedUsers([])
    setSelectedAssigned([])
  }

  // Toggle selection in available list
  const toggleAvailableSelection = (userId: string) => {
    setSelectedAvailable(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Toggle selection in assigned list
  const toggleAssignedSelection = (userId: string) => {
    setSelectedAssigned(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // View mode - simple list display
  if (!isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Users</CardTitle>
            <CardDescription>
              Users who have access to this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users assigned to this location</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Edit mode - two panel layout
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage User Assignments</CardTitle>
          <CardDescription>
            Select users from the available list and move them to assigned, or vice versa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Global Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-4 items-stretch">
            {/* Available Users Panel */}
            <div className="flex-1 border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Available Users</h3>
                  <Badge variant="secondary">{filteredAvailable.length}</Badge>
                </div>
              </div>
              <div className="h-[320px] overflow-y-auto p-2">
                {filteredAvailable.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {globalSearch ? 'No users match your search' : 'No available users'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredAvailable.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleAvailableSelection(user.id)}
                        className={`
                          p-2.5 rounded-md cursor-pointer transition-colors
                          ${selectedAvailable.includes(user.id)
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted/50 border border-transparent'
                          }
                        `}
                      >
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedAvailable.length > 0 && (
                <div className="p-2 border-t bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {selectedAvailable.length} selected
                  </p>
                </div>
              )}
            </div>

            {/* Arrow Buttons */}
            <div className="flex flex-col justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={moveAllToAssigned}
                disabled={availableUsers.length === 0}
                title="Move all to assigned"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={moveToAssigned}
                disabled={selectedAvailable.length === 0}
                title="Move selected to assigned"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={moveToAvailable}
                disabled={selectedAssigned.length === 0}
                title="Move selected to available"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={moveAllToAvailable}
                disabled={assignedUsers.length === 0}
                title="Move all to available"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Assigned Users Panel */}
            <div className="flex-1 border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Assigned Users</h3>
                  <Badge variant="default">{filteredAssigned.length}</Badge>
                </div>
              </div>
              <div className="h-[320px] overflow-y-auto p-2">
                {filteredAssigned.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {globalSearch ? 'No users match your search' : 'No assigned users'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredAssigned.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleAssignedSelection(user.id)}
                        className={`
                          p-2.5 rounded-md cursor-pointer transition-colors
                          ${selectedAssigned.includes(user.id)
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted/50 border border-transparent'
                          }
                        `}
                      >
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedAssigned.length > 0 && (
                <div className="p-2 border-t bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {selectedAssigned.length} selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
