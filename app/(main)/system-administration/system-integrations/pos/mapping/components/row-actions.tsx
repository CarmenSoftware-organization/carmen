"use client"

import {
  Edit,
  Trash2,
  History,
  MoreHorizontal,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type ActionType = "edit" | "delete" | "history" | "link" | "test"

interface RowActionsProps {
  onAction: (action: ActionType) => void
  availableActions?: ActionType[]
  disabled?: boolean
}

export function RowActions({
  onAction,
  availableActions = ["edit", "delete", "history"],
  disabled = false,
}: RowActionsProps) {
  const actionIcons = {
    edit: <Edit className="mr-2 h-4 w-4" />,
    delete: <Trash2 className="mr-2 h-4 w-4" />,
    history: <History className="mr-2 h-4 w-4" />,
    link: <LinkIcon className="mr-2 h-4 w-4" />,
    test: <PlayCircle className="mr-2 h-4 w-4" />,
  }

  const actionLabels = {
    edit: "Edit",
    delete: "Delete",
    history: "View History",
    link: "View Details",
    test: "Test Mapping",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.map((action, index) => (
          <DropdownMenuItem
            key={action}
            onClick={() => onAction(action)}
            className="cursor-pointer"
          >
            {actionIcons[action]}
            {actionLabels[action]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 