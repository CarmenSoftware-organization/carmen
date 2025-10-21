'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, ChevronLeft } from 'lucide-react'
import { User } from '@/lib/types'
import { mockUsers } from '@/lib/mock-data'
import { mockLocations } from '../data/mock-locations'

interface UserAssignmentProps {
  assignedUserIds: string[]
  onAssignedUsersChange: (userIds: string[]) => void
}

export function UserAssignment({ assignedUserIds, onAssignedUsersChange }: UserAssignmentProps) {
  const [availableSearch, setAvailableSearch] = useState('')
  const [assignedSearch, setAssignedSearch] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])

  // Helper function to get user's assigned locations
  const getUserLocations = (userId: string) => {
    return mockLocations.filter(loc =>
      loc.assignedUsers?.includes(userId)
    )
  }

  // Split users into available and assigned
  const availableUsers = useMemo(() => {
    return mockUsers.filter(user => !assignedUserIds.includes(user.id))
  }, [assignedUserIds])

  const assignedUsers = useMemo(() => {
    return mockUsers.filter(user => assignedUserIds.includes(user.id))
  }, [assignedUserIds])

  // Filter users based on search
  const filteredAvailable = useMemo(() => {
    if (!availableSearch) return availableUsers
    const query = availableSearch.toLowerCase()
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }, [availableUsers, availableSearch])

  const filteredAssigned = useMemo(() => {
    if (!assignedSearch) return assignedUsers
    const query = assignedSearch.toLowerCase()
    return assignedUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }, [assignedUsers, assignedSearch])

  // Handle user assignment (move to assigned)
  const handleAssign = () => {
    const newAssigned = [...assignedUserIds, ...selectedAvailable]
    onAssignedUsersChange(newAssigned)
    setSelectedAvailable([])
  }

  // Handle user removal (move to available)
  const handleRemove = () => {
    const newAssigned = assignedUserIds.filter(id => !selectedAssigned.includes(id))
    onAssignedUsersChange(newAssigned)
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

  const UserListItem = ({
    user,
    isSelected,
    onToggle
  }: {
    user: User
    isSelected: boolean
    onToggle: (userId: string) => void
  }) => {
    const userLocations = getUserLocations(user.id)

    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => onToggle(user.id)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(user.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
          {userLocations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {userLocations.map(loc => (
                <Badge
                  key={loc.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {loc.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Users Pane */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Available Users
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No users available
              </p>
            ) : (
              filteredAvailable.map(user => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isSelected={selectedAvailable.includes(user.id)}
                  onToggle={toggleAvailableSelection}
                />
              ))
            )}
          </div>
        </div>

        {/* Assigned Users Pane */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Assigned Users ({assignedUserIds.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search assigned..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
            {filteredAssigned.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No users assigned
              </p>
            ) : (
              filteredAssigned.map(user => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isSelected={selectedAssigned.includes(user.id)}
                  onToggle={toggleAssignedSelection}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAssign}
          disabled={selectedAvailable.length === 0}
        >
          <ChevronRight className="h-4 w-4 mr-1" />
          Assign ({selectedAvailable.length})
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={selectedAssigned.length === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Remove ({selectedAssigned.length})
        </Button>
      </div>
    </div>
  )
}
