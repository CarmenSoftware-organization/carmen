'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Contact } from "../types"

interface PrimaryContactSectionProps {
  contact: Contact | null
  isEditing: boolean
  onFieldChange: (name: string, value: string) => void
}

export function PrimaryContactSection({
  contact,
  isEditing,
  onFieldChange,
}: PrimaryContactSectionProps) {
  if (!contact) return null

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-sm font-medium">{contact.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Phone</p>
          <p className="text-sm font-medium">{contact.phone}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{contact.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Position</p>
          <p className="text-sm font-medium">{contact.position}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={contact.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={contact.phone}
          onChange={(e) => onFieldChange("phone", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={contact.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={contact.position}
          onChange={(e) => onFieldChange("position", e.target.value)}
        />
      </div>
    </div>
  )
} 