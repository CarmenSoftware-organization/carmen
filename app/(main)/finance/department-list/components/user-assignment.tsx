'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronRight, ChevronLeft } from 'lucide-react'
import { User } from '@/lib/types'
import { mockUsers, mockDepartments } from '@/lib/mock-data'

interface UserAssignmentProps {
  assignedUserIds: string[]
  onAssignedUsersChange: (userIds: string[]) => void
}

export function UserAssignment({ assignedUserIds, onAssignedUsersChange }: UserAssignmentProps) {
  const [availableSearch, setAvailableSearch] = useState('')
  const [assignedSearch, setAssignedSearch] = useState('')
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])

  // Helper function to get user's assigned departments
  const getUserDepartments = (userId: string) => {
    return mockDepartments.filter(dept =>
      dept.assignedUsers?.includes(userId)
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

  // Helper function to get user initials
  const getUserInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Helper function to get avatar color based on user ID
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    ]
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
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
    const userDepartments = getUserDepartments(user.id)
    const primaryDepartment = userDepartments[0] // Show first department as primary

    return (
      <label
        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors border ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
        }`}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(user.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          {/* User Name with Avatar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor(user.id)}`}>
              <span className="text-sm font-medium">
                {getUserInitials(user.name)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.name}
            </p>
          </div>

          {/* User Details with Icons */}
          <div className="ml-10 space-y-1">
            {/* Role/Position */}
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                {user.primaryRole?.name || user.roles?.[0]?.name || 'No role assigned'}
              </span>
            </div>

            {/* Department */}
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-500 truncate">
                {primaryDepartment?.name || 'No department'}
              </span>
            </div>

            {/* Additional departments as badges (if more than one) */}
            {userDepartments.length > 1 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {userDepartments.slice(1).map(dept => (
                  <Badge
                    key={dept.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {dept.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </label>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
      {/* Assigned Users Pane (Left - Currently Assigned) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Assigned Users
            </h3>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
              <Checkbox
                checked={selectedAssigned.length === filteredAssigned.length && filteredAssigned.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAssigned(filteredAssigned.map(u => u.id))
                  } else {
                    setSelectedAssigned([])
                  }
                }}
                className="h-3.5 w-3.5"
              />
              Select All
            </label>
          </div>
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
        <div className="p-3 space-y-1 h-96 overflow-y-auto">
          {filteredAssigned.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No data found
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

      {/* Action Buttons (Center) */}
      <div className="flex flex-col items-center justify-center gap-3">
        <Button
          type="button"
          size="icon"
          onClick={handleAssign}
          disabled={selectedAvailable.length === 0}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={handleRemove}
          disabled={selectedAssigned.length === 0}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Available Users Pane (Right) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Available Users
            </h3>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
              <Checkbox
                checked={selectedAvailable.length === filteredAvailable.length && filteredAvailable.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAvailable(filteredAvailable.map(u => u.id))
                  } else {
                    setSelectedAvailable([])
                  }
                }}
                className="h-3.5 w-3.5"
              />
              Select All
            </label>
          </div>
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
        <div className="p-3 space-y-1 h-96 overflow-y-auto">
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
    </div>
  )
}
