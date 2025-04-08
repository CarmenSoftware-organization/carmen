import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "pending" | "processing" | "completed" | "failed"

interface StatusIndicatorProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200"
  },
  processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border-blue-200"
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200"
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200"
  }
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
} 