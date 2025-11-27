"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  MoreVertical,
  Search,
  Edit,
  Trash2,
  List,
  Grid,
} from "lucide-react"

// Import mock data and types
import { mockUnits } from "@/lib/mock-data/units"
import { Unit } from "@/lib/types"

export function UnitListImproved() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Filter and search units
  const filteredUnits = useMemo(() => {
    return mockUnits.filter(unit => {
      const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && unit.isActive) ||
        (statusFilter === "inactive" && !unit.isActive)

      const matchesType = typeFilter === "all" || unit.category === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchTerm, statusFilter, typeFilter])

  const handleEdit = useCallback((unit: Unit) => {
    // For now, just show a toast. In a real app, this would navigate to edit page
    toast({
      title: "Edit Unit",
      description: `Editing unit: ${unit.name}`,
    })
  }, [])

  const handleDelete = useCallback((unit: Unit) => {
    // For now, just show a toast. In a real app, this would delete the unit
    toast({
      title: "Delete Unit",
      description: `Deleted unit: ${unit.name}`,
      variant: "destructive",
    })
  }, [])


  return (
    <div className="space-y-6">

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="relative flex-1 sm:flex-initial sm:w-80">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 px-2 text-xs w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 px-2 text-xs w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INVENTORY">Inventory</SelectItem>
              <SelectItem value="ORDER">Order</SelectItem>
              <SelectItem value="RECIPE">Recipe</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle - positioned at far right */}
          <div className="flex items-center border rounded-md ml-auto">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2 rounded-r-none border-0"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              title="Table view"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2 rounded-l-none border-0"
              onClick={() => setViewMode('cards')}
              aria-label="Card view"
              title="Card view"
            >
              <Grid className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-xs text-muted-foreground">
        Showing {filteredUnits.length} of {mockUnits.length} units
      </div>

      {/* Data Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs py-2">Symbol</TableHead>
                <TableHead className="font-semibold text-xs py-2">Name</TableHead>
                <TableHead className="font-semibold text-xs py-2">Category</TableHead>
                <TableHead className="font-semibold text-xs py-2">Status</TableHead>
                <TableHead className="font-semibold text-xs py-2 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No units found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-2 text-xs font-medium">{unit.symbol}</TableCell>
                    <TableCell className="py-2 text-xs">{unit.name}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize">
                        {unit.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        variant={unit.isActive ? "default" : "secondary"}
                        className={cn(
                          "text-xs px-2 py-0.5",
                          unit.isActive ? "bg-green-100 text-green-800" : ""
                        )}
                      >
                        {unit.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(unit)}>
                            <Edit className="h-3 w-3 mr-2" />
                            <span className="text-xs">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(unit)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            <span className="text-xs">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No units found matching your criteria
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <Card key={unit.id} className="hover:bg-muted/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{unit.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{unit.symbol}</p>
                    </div>
                    <Badge
                      variant={unit.isActive ? "default" : "secondary"}
                      className={cn(
                        "text-xs px-2 py-0.5",
                        unit.isActive ? "bg-green-100 text-green-800" : ""
                      )}
                    >
                      {unit.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize">
                        {unit.category}
                      </Badge>
                    </div>
                    <div className="flex justify-end pt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(unit)}>
                            <Edit className="h-3 w-3 mr-2" />
                            <span className="text-xs">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(unit)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            <span className="text-xs">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}