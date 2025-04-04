"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Clock, Mail } from "lucide-react"

interface StatusBadgeProps {
  status: string
  type: "account" | "invite"
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, type, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (type === "account") {
      switch (status.toLowerCase()) {
        case "active":
          return {
            icon: <CheckCircle2 className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Active",
            variant: "success" as const,
          }
        case "inactive":
          return {
            icon: <XCircle className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Inactive",
            variant: "secondary" as const,
          }
        case "suspended":
          return {
            icon: <AlertCircle className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Suspended",
            variant: "warning" as const,
          }
        default:
          return {
            icon: <XCircle className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: status.charAt(0).toUpperCase() + status.slice(1),
            variant: "secondary" as const,
          }
      }
    } else {
      // Invite status
      switch (status.toLowerCase()) {
        case "accepted":
          return {
            icon: <CheckCircle2 className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Accepted",
            variant: "success" as const,
          }
        case "pending":
          return {
            icon: <Clock className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Pending",
            variant: "warning" as const,
          }
        case "sent":
          return {
            icon: <Mail className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Sent",
            variant: "default" as const,
          }
        case "expired":
          return {
            icon: <XCircle className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: "Expired",
            variant: "destructive" as const,
          }
        default:
          return {
            icon: <Mail className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />,
            label: status.charAt(0).toUpperCase() + status.slice(1),
            variant: "secondary" as const,
          }
      }
    }
  }

  const { icon, label, variant } = getStatusConfig()

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
      case "warning":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "destructive":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
      case "default":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
      case "secondary":
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const sizeClasses = size === "sm" 
    ? "text-xs py-0 px-1.5 h-5" 
    : size === "lg" 
      ? "text-sm py-1 px-3 h-7" 
      : "text-xs py-0.5 px-2 h-6"

  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${getVariantClasses()} ${sizeClasses} flex items-center`}
    >
      {icon}
      {label}
    </Badge>
  )
} 