'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { mockRecipes } from "@/app/data/mock-recipes"

interface ComponentSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (component: {
    id: string
    name: string
    sku: string
    unit: string
    costPerUnit: number
  }) => void
}

export function ComponentSearchDialog({
  isOpen,
  onClose,
  onSelect,
}: ComponentSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredComponents = mockRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (recipe: typeof mockRecipes[0]) => {
    onSelect({
      id: recipe.id,
      name: recipe.name,
      sku: recipe.sku,
      unit: recipe.unit,
      costPerUnit: recipe.costPerPortion,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Component</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Results Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.length > 0 ? (
                filteredComponents.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>{recipe.name}</TableCell>
                    <TableCell>{recipe.sku}</TableCell>
                    <TableCell>{recipe.unit}</TableCell>
                    <TableCell>${recipe.costPerPortion.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelect(recipe)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No components found matching your search."
                      : "Start typing to search for components."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
} 