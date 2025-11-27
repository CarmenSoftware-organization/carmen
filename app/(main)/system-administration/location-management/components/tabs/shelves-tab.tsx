"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
} from "lucide-react"
import { Shelf } from "@/lib/types/location-management"

interface ShelvesTabProps {
  locationId: string
  shelves: Shelf[]
  isEditing: boolean
}

export function ShelvesTab({ locationId, shelves, isEditing }: ShelvesTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null)

  const handleAddShelf = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add the shelf
    setShowAddDialog(false)
  }

  const handleEditShelf = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the shelf
    setEditingShelf(null)
  }

  const handleDeleteShelf = (shelf: Shelf) => {
    if (window.confirm(`Are you sure you want to delete shelf "${shelf.name}"?`)) {
      // In a real app, this would delete the shelf
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Storage Shelves</CardTitle>
            <CardDescription>
              Manage storage areas and shelves within this location
            </CardDescription>
          </div>
          {isEditing && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shelf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddShelf}>
                  <DialogHeader>
                    <DialogTitle>Add New Shelf</DialogTitle>
                    <DialogDescription>
                      Create a new storage shelf for this location
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shelfCode">Shelf Code</Label>
                        <Input
                          id="shelfCode"
                          placeholder="e.g., A1"
                          className="uppercase"
                          maxLength={20}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shelfName">Name</Label>
                        <Input
                          id="shelfName"
                          placeholder="e.g., Shelf A1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Shelf</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {shelves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No shelves configured for this location</p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Shelf
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  {isEditing && <TableHead className="w-[80px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.map((shelf) => (
                  <TableRow key={shelf.id}>
                    <TableCell className="font-mono font-medium">
                      {shelf.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{shelf.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={shelf.isActive ? "default" : "secondary"}>
                        {shelf.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingShelf(shelf)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteShelf(shelf)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Shelf Dialog */}
      <Dialog open={!!editingShelf} onOpenChange={(open) => !open && setEditingShelf(null)}>
        <DialogContent>
          <form onSubmit={handleEditShelf}>
            <DialogHeader>
              <DialogTitle>Edit Shelf</DialogTitle>
              <DialogDescription>
                Update shelf details
              </DialogDescription>
            </DialogHeader>
            {editingShelf && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editShelfCode">Shelf Code</Label>
                    <Input
                      id="editShelfCode"
                      defaultValue={editingShelf.code}
                      className="uppercase"
                      maxLength={20}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editShelfName">Name</Label>
                    <Input
                      id="editShelfName"
                      defaultValue={editingShelf.name}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingShelf(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
