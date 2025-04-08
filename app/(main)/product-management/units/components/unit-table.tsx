"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Unit } from "./unit-list"

interface UnitTableProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  selectedItems: string[]
  onSelectItems: (items: string[]) => void
}

export function UnitTable({ units, onEdit, selectedItems, onSelectItems }: UnitTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Unit
    direction: "asc" | "desc"
  }>({
    key: "code",
    direction: "asc",
  })

  const handleSort = (key: keyof Unit) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    })
  }

  const sortedUnits = [...units].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === bValue) return 0
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const compareResult = 
      typeof aValue === "string" 
        ? (aValue as string).localeCompare(bValue as string)
        : (aValue as number | boolean) > (bValue as number | boolean) ? 1 : -1

    return sortConfig.direction === "asc" ? compareResult : -compareResult
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectItems(units.map((unit) => unit.id))
    } else {
      onSelectItems([])
    }
  }

  const handleSelectOne = (checked: boolean, unitId: string) => {
    if (checked) {
      onSelectItems([...selectedItems, unitId])
    } else {
      onSelectItems(selectedItems.filter((id) => id !== unitId))
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INVENTORY":
        return "bg-blue-100 text-blue-800"
      case "ORDER":
        return "bg-green-100 text-green-800"
      case "RECIPE":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedItems.length === units.length && units.length > 0}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("code")}
            >
              Code {sortConfig.key === "code" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("type")}
            >
              Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("isActive")}
            >
              Status {sortConfig.key === "isActive" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUnits.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(unit.id)}
                  onCheckedChange={(checked) =>
                    handleSelectOne(checked as boolean, unit.id)
                  }
                  aria-label={`Select ${unit.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{unit.code}</TableCell>
              <TableCell>{unit.name}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getTypeColor(unit.type)}
                >
                  {unit.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {unit.description || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={unit.isActive ? "default" : "secondary"}
                >
                  {unit.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(unit)}
                      className="cursor-pointer"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 