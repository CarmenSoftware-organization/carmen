'use client'
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Plus } from 'lucide-react'
import { WorkflowNotification, NotificationChannel, NotificationEventTrigger } from "../types/workflow"

interface WorkflowNotificationsProps {
  notifications: WorkflowNotification[]
  onSave: (notifications: WorkflowNotification[]) => void
}

export function WorkflowNotifications({ notifications: initialNotifications = [], onSave }: WorkflowNotificationsProps) {
  const [notifications, setNotifications] = useState<WorkflowNotification[]>(initialNotifications)
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const selectedNotification = notifications.find(notification => notification.id === selectedNotificationId)

  const handleNotificationSelect = (notificationId: number) => {
    setSelectedNotificationId(notificationId)
    setIsEditing(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedNotification) return

    const updatedNotifications = notifications.map(notification => {
      if (notification.id === selectedNotification.id) {
        return { ...notification, [e.target.id]: e.target.value }
      }
      return notification
    })
    setNotifications(updatedNotifications)
  }

  const handleSelectChange = (field: string, value: string) => {
    if (!selectedNotification) return

    const updatedNotifications = notifications.map(notification => {
      if (notification.id === selectedNotification.id) {
        return { ...notification, [field]: value }
      }
      return notification
    })
    setNotifications(updatedNotifications)
  }

  const handleChannelToggle = (channel: NotificationChannel, checked: boolean) => {
    if (!selectedNotification) return

    const updatedNotifications = notifications.map(notification => {
      if (notification.id === selectedNotification.id) {
        const updatedChannels = checked
          ? [...notification.channels, channel]
          : notification.channels.filter((c) => c !== channel)
        return { ...notification, channels: updatedChannels }
      }
      return notification
    })
    setNotifications(updatedNotifications)
  }

  const handleSaveNotification = () => {
    onSave(notifications)
    setSelectedNotificationId(null)
    setIsEditing(false)
  }

  const handleAddNotification = () => {
    const newNotification: WorkflowNotification = {
      id: Math.max(0, ...notifications.map(n => n.id)) + 1,
      event: "",
      eventTrigger: "onSubmit",
      description: "",
      recipients: [],
      channels: []
    }
    const updatedNotifications = [...notifications, newNotification]
    setNotifications(updatedNotifications)
    setSelectedNotificationId(newNotification.id)
    setIsEditing(true)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedNotificationId === notification.id 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleNotificationSelect(notification.id)}
              >
                <span className="flex-1">{notification.event || 'Unnamed Event'}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNotificationSelect(notification.id)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button className="w-full mt-4" onClick={handleAddNotification}>
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Template" : "Add New Template"}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedNotification ? (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="event">Template Name</Label>
                <Input 
                  id="event" 
                  value={selectedNotification.event} 
                  onChange={handleInputChange}
                  placeholder="Enter template name" 
                />
              </div>
              <div>
                <Label htmlFor="eventTrigger">Event Trigger</Label>
                <Select 
                  value={selectedNotification.eventTrigger} 
                  onValueChange={(value) => handleSelectChange('eventTrigger', value)}
                >
                  <SelectTrigger id="eventTrigger">
                    <SelectValue placeholder="Select event trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onApprove">On Approve</SelectItem>
                    <SelectItem value="onReject">On Reject</SelectItem>
                    <SelectItem value="onSendBack">On Send Back</SelectItem>
                    <SelectItem value="onSubmit">On Submit</SelectItem>
                    <SelectItem value="onSLA">On SLA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={selectedNotification.description || ''} 
                  onChange={handleInputChange}
                  placeholder="Enter event description" 
                />
              </div>
              <div>
                <Label>Notification Template</Label>
                <div className="space-y-2 mt-2">
                  <Input placeholder="Subject Line" />
                  <Textarea placeholder="Content" className="min-h-[100px]" />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">Insert Variable</Button>
                    <Button variant="outline" size="sm">Preview</Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedNotificationId(null)}>Cancel</Button>
                <Button onClick={handleSaveNotification}>
                  {isEditing ? "Update Template" : "Add Template"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-muted-foreground">Select a template to view or edit details</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

