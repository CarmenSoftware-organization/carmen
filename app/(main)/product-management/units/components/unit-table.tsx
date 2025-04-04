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
import { Edit2, Eye, Trash2 } from "lucide-react"
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

  const handleViewUnit = (unit: Unit) => {
    // In a real app, this would navigate to a detail view
    console.log("View unit:", unit)
  }

  const isAllSelected = sortedUnits.length > 0 && selectedItems.length === sortedUnits.length
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < sortedUnits.length

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // @ts-expect-error - indeterminate is a DOM property but not in the types
      selectAllCheckboxRef.current.indeterminate = isPartiallySelected
    }
  }, [isPartiallySelected])

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/75">
              <TableHead className="w-[50px] py-3 font-bold text-gray-600">
                <Checkbox
                  ref={selectAllCheckboxRef}
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead 
                className="py-3  font-bold text-gray-600 cursor-pointer"
                onClick={() => handleSort("code")}
              >
                Code
              </TableHead>
              <TableHead 
                className="py-3  font-bold text-gray-600 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name
              </TableHead>
              <TableHead 
                className="py-3  font-bold text-gray-600 cursor-pointer hidden md:table-cell"
                onClick={() => handleSort("description")}
              >
                Description
              </TableHead>
              <TableHead 
                className="py-3 font-bold text-gray-600 cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type
              </TableHead>
              <TableHead 
                className="py-3 font-bold text-gray-600 cursor-pointer"
                onClick={() => handleSort("isActive")}
              >
                Status
              </TableHead>
              <TableHead className="py-3 font-bold text-gray-600 text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUnits.length > 0 ? (
              sortedUnits.map((unit) => (
                <TableRow 
                  key={unit.id}
                  className="group hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => handleViewUnit(unit)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(unit.id)}
                      onCheckedChange={(checked) => handleSelectOne(checked as boolean, unit.id)}
                      aria-label={`Select ${unit.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>{unit.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {unit.description ? (
                      <span className="line-clamp-1">{unit.description}</span>
                    ) : (
                      <span className="text-gray-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                      {unit.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={unit.isActive ? "Active" : "Inactive"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUnit(unit);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(unit);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnitToDelete(unit);
                        }}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No units found.
                </TableCell>
              </TableRow>
            )}
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