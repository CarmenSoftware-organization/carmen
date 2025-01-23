'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CameraIcon } from 'lucide-react'

export function EditProfile() {
  const [formData, setFormData] = useState({
    profilePicture: '',
    username: 'johndoe',
    email: 'johndoe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['User', 'Manager'],
    businessUnits: ['HQ', 'Branch 1', 'Branch 2'],
    language: 'English',
    timezone: 'UTC',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Card className="p-6 mx-auto bg-background">
      <CardHeader >
        <CardTitle className="text-3xl font-bold">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.profilePicture} alt={formData.username} />
              <AvatarFallback>{formData.firstName[0]}{formData.lastName[0]}</AvatarFallback>
            </Avatar>
            <Button variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
              <CameraIcon className="w-4 h-4 mr-2" />
              Change Picture
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} onChange={handleInputChange} disabled className="bg-gray-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2">
                {formData.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="bg-blue-100 text-blue-800">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Units</Label>
              <div className="flex flex-wrap gap-2">
                {formData.businessUnits.map((unit) => (
                  <Badge key={unit} variant="secondary" className="bg-blue-100 text-blue-800">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleSelectChange(value, 'language')}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleSelectChange(value, 'timezone')}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">EST</SelectItem>
                  <SelectItem value="PST">PST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}