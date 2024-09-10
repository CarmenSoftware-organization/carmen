'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CameraIcon, Trash2Icon } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

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

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 2
        ctx.strokeStyle = '#000000'
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setFormData({ ...formData, signature: canvas.toDataURL() })
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setFormData({ ...formData, signature: '' })
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profilePicture} alt={formData.username} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-2xl font-semibold">
                  {getInitials(`${formData.firstName} ${formData.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600" onClick={triggerFileInput}>
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
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}