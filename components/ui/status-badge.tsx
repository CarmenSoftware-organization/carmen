import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  superseded: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" // Added: for price lists
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusKey = status.toLowerCase() as keyof typeof statusStyles
  const statusStyle = statusStyles[statusKey] || statusStyles.inactive

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border-transparent",
        statusStyle,
        className
      )}
    >
      {status}
    </Badge>
  )
} 