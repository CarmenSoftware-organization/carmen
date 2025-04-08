'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { roles } from "../data/mockData"

interface RoleListProps {
  selectedRoleId: number | null
  onSelectRole: (id: number) => void
}

export function RoleList({ selectedRoleId, onSelectRole }: RoleListProps) {
  const [localRoles, setLocalRoles] = useState(roles)

  const addNewRole = () => {
    const newRole = {
      id: localRoles.length + 1,
      name: `New Role ${localRoles.length + 1}`,
      description: "Description pending",
      userCount: 0,
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
              <p className="text-sm text-blue-600 mt-2">{role.userCount} users</p>
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

