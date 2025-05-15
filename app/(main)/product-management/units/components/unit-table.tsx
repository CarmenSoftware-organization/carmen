"use client"

import { useState, useEffect, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Edit, MoreVertical, ArrowUpDown, Trash2 } from "lucide-react"
import { Unit } from "./unit-list"
import StatusBadge from "@/components/ui/custom-status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UnitTableProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  selectedItems: string[]
  onSelectItems: (itemIds: string[]) => void
}

export function UnitTable({ units, onEdit, selectedItems, onSelectItems }: UnitTableProps) {
  const [sortField, setSortField] = useState<keyof Unit>("code")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null)

  const handleSort = (field: keyof Unit) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedUnits = [...units].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (!aValue || !bValue) return 0
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === "asc"
        ? (aValue === bValue ? 0 : aValue ? -1 : 1)
        : (aValue === bValue ? 0 : aValue ? 1 : -1)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    return 0
  })

  const handleDelete = async (unit: Unit) => {
    // TODO: Implement delete functionality
    console.log("Delete unit:", unit)
    setUnitToDelete(null)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectItems(sortedUnits.map(unit => unit.id))
    } else {
      onSelectItems([])
    }
  }

  const handleSelectOne = (checked: boolean, unitId: string) => {
    if (checked) {
      onSelectItems([...selectedItems, unitId])
    } else {
      onSelectItems(selectedItems.filter(id => id !== unitId))
    }
  }

  const isAllSelected = sortedUnits.length > 0 && selectedItems.length === sortedUnits.length
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < sortedUnits.length

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // @ts-ignore - indeterminate is a DOM property but not in the types
      selectAllCheckboxRef.current.indeterminate = isPartiallySelected
    }
  }, [isPartiallySelected])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12 py-3">
              <Checkbox 
                ref={selectAllCheckboxRef}
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                className="ml-3"
              />
            </TableHead>
            <TableHead 
              className="py-3 font-medium cursor-pointer"
              onClick={() => handleSort("code")}
            >
              <div className="flex items-center gap-1">
                Code
                {sortField === "code" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="py-3 font-medium cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Name
                {sortField === "name" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="py-3 font-medium cursor-pointer"
              onClick={() => handleSort("type")}
            >
              <div className="flex items-center gap-1">
                Type
                {sortField === "type" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="py-3 font-medium cursor-pointer"
              onClick={() => handleSort("isActive")}
            >
              <div className="flex items-center gap-1">
                Status
                {sortField === "isActive" && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="py-3 text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUnits.map((unit) => (
            <TableRow 
              key={unit.id}
              className="group hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <TableCell className="py-4 pl-4">
                <Checkbox 
                  checked={selectedItems.includes(unit.id)}
                  onCheckedChange={(checked) => handleSelectOne(checked as boolean, unit.id)}
                  aria-label={`Select ${unit.name}`}
                />
              </TableCell>
              <TableCell className="py-4 font-medium">{unit.code}</TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span>{unit.name}</span>
                  {unit.description && (
                    <span className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {unit.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">{unit.type}</TableCell>
              <TableCell className="py-4">
                <StatusBadge status={unit.isActive ? "Active" : "Inactive"} />
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex justify-end items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(unit)}
                    className="h-8 w-8 rounded-full"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(unit)}
                    className="h-8 w-8 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(unit)}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(unit)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setUnitToDelete(unit)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the unit &quot;{unitToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(unitToDelete!)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 