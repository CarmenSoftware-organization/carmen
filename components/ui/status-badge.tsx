"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "inactive":
      case "voided":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
} 