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
import { Edit2, Trash2 } from "lucide-react"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* ... */}
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  ref={selectAllCheckboxRef}
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("code")}
              >
                Code
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("isActive")}
              >
                Status
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(unit.id)}
                    onCheckedChange={(checked) => handleSelectOne(checked as boolean, unit.id)}
                    aria-label={`Select ${unit.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{unit.code}</TableCell>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.type}</TableCell>
                <TableCell>
                  <StatusBadge status={unit.isActive ? "Active" : "Inactive"} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(unit)}
                      className="hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUnitToDelete(unit)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the unit &quot;{unitToDelete?.name}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unitToDelete && handleDelete(unitToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 