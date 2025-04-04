'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CameraIcon } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function EditProfile() {
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
    signature: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Here you would typically send the formData to your backend
    console.log('Form submitted:', formData)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-background dark:bg-gray-800 border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground dark:text-gray-100">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24 border dark:border-gray-600">
                <AvatarImage src={formData.profilePicture} alt={formData.username} />
                <AvatarFallback className="bg-muted dark:bg-gray-700 text-foreground dark:text-gray-100 text-2xl font-semibold">
                  {getInitials(`${formData.firstName} ${formData.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <Button 
                type="button" 
                variant="secondary" 
                className={cn(
                  "bg-primary hover:bg-primary/90",
                  "text-primary-foreground",
                  "dark:bg-gray-700 dark:hover:bg-gray-600",
                  "dark:text-gray-100"
                )}
                onClick={triggerFileInput}
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                Change Picture
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* ... (rest of the form fields remain the same) ... */}

            <div className="flex justify-end">
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}