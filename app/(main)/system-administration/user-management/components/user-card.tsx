"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "./status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Building,
  Mail,
  Clock,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Shield,
} from "lucide-react"

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    businessUnit: string
    department: string
    roles: string[]
    hodStatus: boolean
    inviteStatus?: string
    lastLogin?: string | null
    accountStatus: string
  }
  isSelected: boolean
  onSelect: (userId: string, isSelected: boolean) => void
  onView: (userId: string) => void
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
}

export function UserCard({
  user,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: UserCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-0">
        <div className="flex items-center p-4 border-b">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(user.id, !!checked)}
            className="mr-3"
          />
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{user.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(user.id)}>
                <Search className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs">
              <Building className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="text-muted-foreground">Department:</span>
              <span className="ml-1 font-medium">{user.department}</span>
            </div>
            <StatusBadge status={user.accountStatus} type="account" size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last login:</span>
              <span className="ml-1 font-medium">{formatDate(user.lastLogin)}</span>
            </div>
            {user.inviteStatus && (
              <StatusBadge status={user.inviteStatus} type="invite" size="sm" />
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.roles.map((role) => (
              <div
                key={role}
                className="inline-flex items-center text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
              >
                <Shield className="h-3 w-3 mr-1" />
                {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 