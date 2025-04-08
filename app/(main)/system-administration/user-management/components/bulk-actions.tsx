'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import {
  UserPlus2,
  UserCog,
  UserX2,
  Users,
  Building2
} from "lucide-react"

export type BulkActionData = {
  invite?: { emails: string[] }
  status?: { status: 'active' | 'inactive' | 'suspended' }
  role?: { roleIds: string[] }
  department?: { departmentId: string }
  delete?: never
}

interface BulkActionsProps {
  selectedCount: number
  onAction: <T extends keyof BulkActionData>(action: T, data?: BulkActionData[T]) => Promise<void>
}

export function BulkActions({
  selectedCount,
  onAction,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-sm text-muted-foreground mr-2">
        {selectedCount} users selected
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => onAction("invite")}
      >
        <UserPlus2 className="h-4 w-4" />
        Send Invites
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => onAction("status")}
      >
        <UserCog className="h-4 w-4" />
        Update Status
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => onAction("role")}
      >
        <Users className="h-4 w-4" />
        Assign Roles
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => onAction("department")}
      >
        <Building2 className="h-4 w-4" />
        Assign Department
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-destructive hover:text-destructive"
        onClick={() => onAction("delete")}
      >
        <UserX2 className="h-4 w-4" />
        Delete Users
      </Button>
    </div>
  )
} 