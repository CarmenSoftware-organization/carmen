"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit,
  Calendar,
  User,
  Building2,
  DollarSign,
} from "lucide-react"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest } from "@/lib/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface PurchaseRequestsCardViewProps {
  data: PurchaseRequest[]
  selectedItems: string[]
  onSelectItem: (id: string) => void
  onSelectAll: () => void
  onView?: (pr: PurchaseRequest) => void
  onEdit?: (pr: PurchaseRequest) => void
  onApprove?: (pr: PurchaseRequest) => void
  onReject?: (pr: PurchaseRequest) => void
  onDelete?: (pr: PurchaseRequest) => void
}

export function PurchaseRequestsCardView({
  data,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}: PurchaseRequestsCardViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case "requester":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "departmentHeadApproval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "financeApproval":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatStageDisplay = (stage: string) => {
    return stage.replace(/([A-Z])/g, ' $1').trim()
  }

  if (data.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No purchase requests found</h3>
          <p className="text-sm mb-4">
            Get started by creating your first purchase request.
          </p>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Create Purchase Request
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with select all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onCheckedChange={onSelectAll}
            aria-label="Select all purchase requests"
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length > 0 
              ? `${selectedItems.length} of ${data.length} selected`
              : `${data.length} purchase requests`
            }
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((pr) => (
          <Card
            key={pr.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md cursor-pointer",
              selectedItems.includes(pr.id) && "ring-2 ring-primary ring-offset-2",
              hoveredCard === pr.id && "shadow-lg"
            )}
            onMouseEnter={() => setHoveredCard(pr.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onView?.(pr)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.includes(pr.id)}
                    onCheckedChange={() => onSelectItem(pr.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${pr.refNumber}`}
                  />
                  <div>
                    <h3 className="font-semibold text-primary leading-none">
                      {pr.refNumber}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(pr.date, "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
                <StatusBadge status={pr.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <p className="text-sm line-clamp-2 text-muted-foreground">
                  {pr.description}
                </p>
              </div>

              {/* Type and Stage */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {pr.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border", getWorkflowStageColor(pr.currentWorkflowStage))}
                >
                  {formatStageDisplay(pr.currentWorkflowStage)}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground">
                    <User className="mr-1 h-3 w-3" />
                    <span className="text-xs">Requestor</span>
                  </div>
                  <div className="font-medium truncate">
                    {pr.requestor.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="mr-1 h-3 w-3" />
                    <span className="text-xs">Department</span>
                  </div>
                  <div className="font-medium truncate">
                    {pr.department}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs">Total Amount</span>
                </div>
                <div className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(pr.totalAmount)} {pr.currency}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onView?.(pr)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(pr)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove?.(pr)
                      }}
                      className="text-green-600 focus:text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onReject?.(pr)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(pr)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}