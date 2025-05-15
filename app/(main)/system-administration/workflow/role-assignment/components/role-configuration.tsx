'use client'
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { roles } from "../data/mockData"
import { Role } from "../types/approver"
import type { RoleConfiguration } from "../types/approver"
import { Edit, Save, X } from "lucide-react"

interface RoleConfigurationProps {
  selectedRoleId: number | null
}

export function RoleConfiguration({ selectedRoleId }: RoleConfigurationProps) {
  const [configuration, setConfiguration] = useState<RoleConfiguration>(initialRoleConfiguration)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(role => role.id === selectedRoleId)
      if (role) {
        setSelectedRole(role)
        setConfiguration({
          name: role.name,
          description: role.description,
          widgetAccess: {
            myPR: true,
            myApproval: role.name !== "Requester",
            myOrder: role.name === "Purchasing Staff"
          },
          visibilitySetting: getDefaultVisibilitySetting(role.name)
        })
      }
    } else {
      setSelectedRole(null)
      setConfiguration(initialRoleConfiguration)
    }
    setIsEditing(false)
  }, [selectedRoleId])

  const getDefaultVisibilitySetting = (roleName: string): 'location' | 'department' | 'full' => {
    switch (roleName) {
      case 'General Manager':
        return 'full'
      case 'Finance Manager':
      case 'Department Head':
        return 'department'
      default:
        return 'location'
    }
  }

  const handleInputChange = (field: keyof RoleConfiguration, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleWidgetAccessChange = (widget: keyof RoleConfiguration['widgetAccess']) => {
    setConfiguration(prev => ({
      ...prev,
      widgetAccess: {
        ...prev.widgetAccess,
        [widget]: !prev.widgetAccess[widget]
      }
    }))
  }

  const handleVisibilityChange = (value: 'location' | 'department' | 'full') => {
    setConfiguration(prev => ({
      ...prev,
      visibilitySetting: value
    }))
  }

  const handleSave = () => {
    console.log("Saving configuration:", configuration)
    setIsEditing(false)
    // Here you would typically send this data to your backend
  }

  const handleCancel = () => {
    if (selectedRole) {
      setConfiguration({
        name: selectedRole.name,
        description: selectedRole.description,
        widgetAccess: {
          myPR: true,
          myApproval: selectedRole.name !== "Requester",
          myOrder: selectedRole.name === "Purchasing Staff"
        },
        visibilitySetting: getDefaultVisibilitySetting(selectedRole.name)
      })
    }
    setIsEditing(false)
  }

  if (!selectedRoleId) {
    return <div className="text-center p-4">Please select a role to configure</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{configuration.name}</h2>
          <p className="text-sm text-muted-foreground">Configure role settings and permissions</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Role
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={configuration.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={configuration.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Widget Access</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="myPR"
                checked={configuration.widgetAccess.myPR}
                onCheckedChange={() => handleWidgetAccessChange('myPR')}
                disabled={!isEditing}
              />
              <Label htmlFor="myPR">My Purchase Requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="myApproval"
                checked={configuration.widgetAccess.myApproval}
                onCheckedChange={() => handleWidgetAccessChange('myApproval')}
                disabled={!isEditing}
              />
              <Label htmlFor="myApproval">My Approvals</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="myOrder"
                checked={configuration.widgetAccess.myOrder}
                onCheckedChange={() => handleWidgetAccessChange('myOrder')}
                disabled={!isEditing}
              />
              <Label htmlFor="myOrder">My Orders</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Visibility Settings</h3>
          <RadioGroup 
            value={configuration.visibilitySetting} 
            onValueChange={(value: 'location' | 'department' | 'full') => handleVisibilityChange(value)}
            disabled={!isEditing}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="location" id="location" />
              <Label htmlFor="location">Location Only</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="department" id="department" />
              <Label htmlFor="department">Department Wide</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full">Full Access</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}

const initialRoleConfiguration: RoleConfiguration = {
  name: "",
  description: "",
  widgetAccess: {
    myPR: false,
    myApproval: false,
    myOrder: false
  },
  visibilitySetting: "location"
}

