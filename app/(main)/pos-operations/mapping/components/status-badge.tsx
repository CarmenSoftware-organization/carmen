'use client'

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type StatusType = 
  | "active"
  | "inactive"
  | "pending"
  | "error"
  | "success"
  | "warning"

interface StatusBadgeProps {
  status: StatusType
  children?: ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const variants = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        variants[status]
      )}
    >
      {children || status}
    </Badge>
  )
} 