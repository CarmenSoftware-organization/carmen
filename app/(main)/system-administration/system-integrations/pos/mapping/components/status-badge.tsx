'use client'

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type StatusType = 
  | "active"
  | "inactive"
  | "pending"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "mapped"
  | "unmapped"
  | "custom"

interface StatusBadgeProps {
  status: StatusType
  children?: ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "mapped":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "unmapped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "custom":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
} 