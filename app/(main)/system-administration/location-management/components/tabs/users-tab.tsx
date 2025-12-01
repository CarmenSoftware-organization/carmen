"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Users,
} from "lucide-react"
import {
  UserLocationAssignment,
} from "@/lib/types/location-management"

interface UsersTabProps {
  locationId: string
  assignments: UserLocationAssignment[]
  isEditing: boolean
}

// Mock available users (all users in the system)
const allSystemUsers = [
  { id: 'user-001', name: 'John Smith', email: 'john.smith@company.com', department: 'Operations' },
  { id: 'user-002', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Kitchen' },
  { id: 'user-003', name: 'Michael Brown', email: 'michael.b@company.com', department: 'Warehouse' },
  { id: 'user-004', name: 'Emily Davis', email: 'emily.d@company.com', department: 'Front of House' },
  { id: 'user-005', name: 'James Wilson', email: 'james.w@company.com', department: 'Management' },
  { id: 'user-006', name: 'Jessica Martinez', email: 'jessica.m@company.com', department: 'Kitchen' },
  { id: 'user-007', name: 'Alex Turner', email: 'alex.t@company.com', department: 'Operations' },
  { id: 'user-008', name: 'Emma Davis', email: 'emma.d@company.com', department: 'Management' },
  { id: 'user-009', name: 'Chris Lee', email: 'chris.l@company.com', department: 'Warehouse' },
  { id: 'user-010', name: 'Amanda White', email: 'amanda.w@company.com', department: 'Front of House' },
  { id: 'user-011', name: 'David Kim', email: 'david.k@company.com', department: 'Kitchen' },
  { id: 'user-012', name: 'Lisa Chen', email: 'lisa.c@company.com', department: 'Operations' },
]

export function UsersTab({ locationId, assignments, isEditing }: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])

  // Local state for assigned users (in real app, this would be managed via API)
  const [localAssignedUserIds, setLocalAssignedUserIds] = useState<string[]>(
    assignments.map(a => a.userId)
  )

  // Filter available users (not assigned to this location)
  const availableUsers = useMemo(() => {
    return allSystemUsers.filter(user => !localAssignedUserIds.includes(user.id))
  }, [localAssignedUserIds])

  // Get assigned users with full details
  const assignedUsers = useMemo(() => {
    return allSystemUsers.filter(user => localAssignedUserIds.includes(user.id))
  }, [localAssignedUserIds])

  // Filter by search query
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers
    const query = searchQuery.toLowerCase()
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    )
  }, [availableUsers, searchQuery])

  const filteredAssigned = useMemo(() => {
    if (!searchQuery.trim()) return assignedUsers
    const query = searchQuery.toLowerCase()
    return assignedUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    )
  }, [assignedUsers, searchQuery])

  // Toggle selection in available list
  const toggleAvailableSelection = (userId: string) => {
    if (!isEditing) return
    setSelectedAvailable(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Toggle selection in assigned list
  const toggleAssignedSelection = (userId: string) => {
    if (!isEditing) return
    setSelectedAssigned(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Bulk select all available users (filtered)
  const selectAllAvailable = () => {
    if (!isEditing) return
    const allIds = filteredAvailable.map(u => u.id)
    setSelectedAvailable(allIds)
  }

  // Bulk deselect all available users
  const deselectAllAvailable = () => {
    setSelectedAvailable([])
  }

  // Bulk select all assigned users (filtered)
  const selectAllAssigned = () => {
    if (!isEditing) return
    const allIds = filteredAssigned.map(u => u.id)
    setSelectedAssigned(allIds)
  }

  // Bulk deselect all assigned users
  const deselectAllAssigned = () => {
    setSelectedAssigned([])
  }

  // Check if all available are selected
  const isAllAvailableSelected = filteredAvailable.length > 0 &&
    filteredAvailable.every(u => selectedAvailable.includes(u.id))

  // Check if some available are selected
  const isSomeAvailableSelected = filteredAvailable.some(u => selectedAvailable.includes(u.id))

  // Check if all assigned are selected
  const isAllAssignedSelected = filteredAssigned.length > 0 &&
    filteredAssigned.every(u => selectedAssigned.includes(u.id))

  // Check if some assigned are selected
  const isSomeAssignedSelected = filteredAssigned.some(u => selectedAssigned.includes(u.id))

  // Move selected users from available to assigned
  const assignUsers = () => {
    setLocalAssignedUserIds(prev => [...prev, ...selectedAvailable])
    setSelectedAvailable([])
  }

  // Move selected users from assigned to available
  const unassignUsers = () => {
    setLocalAssignedUserIds(prev => prev.filter(id => !selectedAssigned.includes(id)))
    setSelectedAssigned([])
  }

  // User item component with checkbox
  const UserItem = ({
    user,
    isSelected,
    onToggle
  }: {
    user: typeof allSystemUsers[0]
    isSelected: boolean
    onToggle: () => void
  }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
        isSelected
          ? 'bg-primary/5 border-primary/30'
          : 'hover:bg-muted border-transparent'
      } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle()}
        disabled={!isEditing}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{user.email}</div>
        <div className="text-sm text-muted-foreground truncate">
          {user.name}, {user.department}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
        {/* Available Users Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Available Users
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredAvailable.length})
                </span>
              </CardTitle>
              {isEditing && filteredAvailable.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllAvailableSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                          isSomeAvailableSelected && !isAllAvailableSelected
                      }
                    }}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllAvailable()
                      } else {
                        deselectAllAvailable()
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No users match your search' : 'All users are assigned'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map(user => (
                    <UserItem
                      key={user.id}
                      user={user}
                      isSelected={selectedAvailable.includes(user.id)}
                      onToggle={() => toggleAvailableSelection(user.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Transfer Buttons */}
        <div className="flex md:flex-col gap-2 justify-center items-center py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={assignUsers}
            disabled={!isEditing || selectedAvailable.length === 0}
            title="Assign selected users"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={unassignUsers}
            disabled={!isEditing || selectedAssigned.length === 0}
            title="Remove selected users"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Assigned Users Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Assigned Users
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredAssigned.length})
                </span>
              </CardTitle>
              {isEditing && filteredAssigned.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllAssignedSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate =
                          isSomeAssignedSelected && !isAllAssignedSelected
                      }
                    }}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllAssigned()
                      } else {
                        deselectAllAssigned()
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredAssigned.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No users match your search' : 'No users assigned to this location'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssigned.map(user => (
                    <UserItem
                      key={user.id}
                      user={user}
                      isSelected={selectedAssigned.includes(user.id)}
                      onToggle={() => toggleAssignedSelection(user.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary */}
      {isEditing && (selectedAvailable.length > 0 || selectedAssigned.length > 0) && (
        <div className="text-sm text-muted-foreground text-center">
          {selectedAvailable.length > 0 && (
            <span>
              {selectedAvailable.length} user{selectedAvailable.length > 1 ? 's' : ''} selected to assign
            </span>
          )}
          {selectedAvailable.length > 0 && selectedAssigned.length > 0 && ' • '}
          {selectedAssigned.length > 0 && (
            <span>
              {selectedAssigned.length} user{selectedAssigned.length > 1 ? 's' : ''} selected to remove
            </span>
          )}
        </div>
      )}
    </div>
  )
}
