import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Filter, UserPlus } from 'lucide-react'
import { mockUsers, mockRoles } from '@/lib/mock-data'
import { User, Role } from "../types/approver"

interface AssignedUsersProps {
  selectedRoleId: string | null
}

// Map users to their roles (in a real app, this would come from the backend)
const userRoleMap: Record<string, string[]> = {
  '1': ['1', '2', '3', '4'], // Requester role assigned to first 4 users
  '2': ['5', '6'], // Purchasing Staff role
  '3': ['7', '8', '9', '10'], // Department Head role
  '4': ['11', '12'], // Finance Manager role
  '5': ['13'], // General Manager role
}

export function AssignedUsers({ selectedRoleId }: AssignedUsersProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!selectedRoleId) {
      setFilteredUsers([])
      return
    }

    // Get user IDs assigned to the selected role
    const assignedUserIds = userRoleMap[selectedRoleId] || []
    
    // Filter users based on role and search term
    const roleUsers = mockUsers.filter(user => assignedUserIds.includes(user.id))
    const searchFiltered = roleUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredUsers(searchFiltered)
  }, [selectedRoleId, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilter = () => {
    console.log("Filter functionality to be implemented")
  }

  const handleAssignUsers = () => {
    console.log("Assign users functionality to be implemented")
  }

  const selectedRole = selectedRoleId ? mockRoles.find(role => role.id === selectedRoleId) : null

  if (!selectedRoleId) {
    return <div className="text-center p-4">Please select a role to view assigned users</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{selectedRole?.name} Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage users assigned to the {selectedRole?.name.toLowerCase()} role
          </p>
        </div>
        <Button onClick={handleAssignUsers}>
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Users
        </Button>
      </div>

      <div className="flex space-x-4">
        <Input
          className="flex-grow"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button variant="outline" onClick={handleFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total Users: {filteredUsers.length}</span>
            <Button variant="outline" size="sm">Bulk Actions</Button>
          </div>
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.department}{user.location ? ` • ${user.location}` : ''}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {userRoleMap[selectedRoleId]?.length || 0} users
        </span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  )
}

