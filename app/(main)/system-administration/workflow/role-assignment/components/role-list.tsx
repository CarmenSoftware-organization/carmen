import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { mockRoles, mockUsers } from '@/lib/mock-data'
import { Role } from '@/lib/types'

interface RoleListProps {
  selectedRoleId: string | null
  onSelectRole: (id: string) => void
}

// Map users to their roles (in a real app, this would come from the backend)
const userRoleMap: Record<string, string[]> = {
  '1': ['1', '2', '3', '4'],
  '2': ['5', '6'],
  '3': ['7', '8', '9', '10'],
  '4': ['11', '12'],
  '5': ['13'],
}

export function RoleList({ selectedRoleId, onSelectRole }: RoleListProps) {
  const [localRoles, setLocalRoles] = useState(mockRoles)

  // Helper function to get user count for a role
  const getRoleUserCount = (roleId: string): number => {
    return userRoleMap[roleId]?.length || 0
  }

  const addNewRole = () => {
    const newRole: Role = {
      id: String(localRoles.length + 1),
      name: `New Role ${localRoles.length + 1}`,
      description: "Description pending",
      permissions: [],
    }
    setLocalRoles([...localRoles, newRole])
    onSelectRole(newRole.id)
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {localRoles.map((role) => (
            <Card
              key={role.id}
              className={`p-4 cursor-pointer transition-colors ${
                role.id === selectedRoleId ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectRole(role.id)}
            >
              <h3 className="font-bold">{role.name}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
              <p className="text-sm text-blue-600 mt-2">{getRoleUserCount(role.id)} users</p>
            </Card>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline" onClick={addNewRole}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Role
        </Button>
      </CardContent>
    </Card>
  )
}

