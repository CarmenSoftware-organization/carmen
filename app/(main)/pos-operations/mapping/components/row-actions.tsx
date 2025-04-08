'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type ActionType = "edit" | "delete" | "view" | "history" | "test"

interface RowActionsProps {
  onAction: (type: ActionType) => void
  availableActions?: ActionType[]
}

export function RowActions({ onAction, availableActions = ["view", "edit", "delete"] }: RowActionsProps) {
  const actionLabels: Record<ActionType, string> = {
    view: "View details",
    edit: "Edit",
    delete: "Delete",
    history: "View History",
    test: "Test Mapping"
  }

  const actionClasses: Record<ActionType, string> = {
    view: "",
    edit: "",
    delete: "text-red-600",
    history: "text-blue-600",
    test: "text-green-600"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {availableActions.map((action, index) => (
          <>
            {index > 0 && action === "delete" && <DropdownMenuSeparator />}
            <DropdownMenuItem
              key={action}
              onClick={() => onAction(action)}
              className={actionClasses[action]}
            >
              {actionLabels[action]}
            </DropdownMenuItem>
          </>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 