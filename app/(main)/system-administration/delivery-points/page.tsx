"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  MapPin,
  Phone,
  Mail,
  ArrowUpDown,
  Star,
} from "lucide-react"
import { getAllDeliveryPoints } from "@/lib/mock-data/inventory-locations"
import { DeliveryPoint } from "@/lib/types/location-management"

type SortField = 'name' | 'code' | 'city' | 'isActive'
type SortDirection = 'asc' | 'desc'

export default function DeliveryPointsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPoint, setEditingPoint] = useState<DeliveryPoint | null>(null)
  const [deletingPoint, setDeletingPoint] = useState<DeliveryPoint | null>(null)

  // Get all delivery points
  const allDeliveryPoints = useMemo(() => getAllDeliveryPoints(), [])

  // Filter and sort delivery points
  const filteredDeliveryPoints = useMemo(() => {
    let result = [...allDeliveryPoints]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(dp =>
        dp.name.toLowerCase().includes(query) ||
        dp.code?.toLowerCase().includes(query) ||
        dp.address.city.toLowerCase().includes(query) ||
        dp.contactName?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(dp =>
        statusFilter === 'active' ? dp.isActive : !dp.isActive
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'isActive') {
        const aValue = a.isActive
        const bValue = b.isActive
        return sortDirection === 'asc'
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1)
      }

      let aValue: string
      let bValue: string

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'code':
          aValue = (a.code || '').toLowerCase()
          bValue = (b.code || '').toLowerCase()
          break
        case 'city':
          aValue = a.address.city.toLowerCase()
          bValue = b.address.city.toLowerCase()
          break
        default:
          return 0
      }

      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return result
  }, [allDeliveryPoints, searchQuery, statusFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleAddDeliveryPoint = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add the delivery point
    setShowAddDialog(false)
  }

  const handleEditDeliveryPoint = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the delivery point
    setEditingPoint(null)
  }

  const handleDeleteDeliveryPoint = () => {
    // In a real app, this would delete the delivery point
    setDeletingPoint(null)
  }

  const getVehicleSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      small_van: 'Small Van',
      large_van: 'Large Van',
      truck: 'Truck',
      semi_trailer: 'Semi-Trailer'
    }
    return labels[size] || size
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Points</h1>
          <p className="text-muted-foreground">
            Manage delivery addresses and receiving instructions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Point
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, city, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Points
            <Badge variant="secondary" className="ml-2">
              {filteredDeliveryPoints.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeliveryPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No delivery points found</p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Name</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="code">Code</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="city">City</SortButton>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Max Vehicle</TableHead>
                  <TableHead>
                    <SortButton field="isActive">Status</SortButton>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveryPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {point.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <div>
                          <div className="font-medium">{point.name}</div>
                          {point.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {point.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {point.code || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <div>{point.address.city}</div>
                          <div className="text-xs text-muted-foreground">
                            {point.address.postalCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {point.contactName ? (
                        <div className="text-sm">
                          <div>{point.contactName}</div>
                          {point.contactPhone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {point.contactPhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {point.maxVehicleSize ? (
                        <Badge variant="outline">
                          {getVehicleSizeLabel(point.maxVehicleSize)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={point.isActive ? "default" : "secondary"}>
                        {point.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingPoint(point)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingPoint(point)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Delivery Point Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddDeliveryPoint}>
            <DialogHeader>
              <DialogTitle>Add Delivery Point</DialogTitle>
              <DialogDescription>
                Create a new delivery address
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dpName">Name</Label>
                  <Input
                    id="dpName"
                    placeholder="e.g., Main Entrance"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpCode">Code</Label>
                  <Input
                    id="dpCode"
                    placeholder="e.g., DP-001"
                    className="uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dpDescription">Description</Label>
                <Textarea
                  id="dpDescription"
                  placeholder="Brief description of this delivery point..."
                  rows={2}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Address Line 1" required />
                  <Input placeholder="Address Line 2 (optional)" />
                  <Input placeholder="City" required />
                  <Input placeholder="Postal Code" required />
                  <Input placeholder="Country" defaultValue="Thailand" required />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input id="contactName" placeholder="Contact name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" placeholder="+66-xxx-xxx-xxxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input id="contactEmail" type="email" placeholder="email@example.com" />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  placeholder="Special instructions for deliveries..."
                  rows={2}
                />
              </div>

              {/* Logistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxVehicleSize">Max Vehicle Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small_van">Small Van</SelectItem>
                      <SelectItem value="large_van">Large Van</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="semi_trailer">Semi-Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dock Leveler</Label>
                  <div className="flex items-center h-10">
                    <Switch id="hasDockLeveler" />
                    <Label htmlFor="hasDockLeveler" className="ml-2 font-normal">
                      Available
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Forklift</Label>
                  <div className="flex items-center h-10">
                    <Switch id="hasForklift" />
                    <Label htmlFor="hasForklift" className="ml-2 font-normal">
                      Available
                    </Label>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this delivery point for use
                  </p>
                </div>
                <Switch id="isActive" defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Delivery Point</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Point Dialog */}
      <Dialog open={!!editingPoint} onOpenChange={(open) => !open && setEditingPoint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditDeliveryPoint}>
            <DialogHeader>
              <DialogTitle>Edit Delivery Point</DialogTitle>
              <DialogDescription>
                Update delivery point details
              </DialogDescription>
            </DialogHeader>
            {editingPoint && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDpName">Name</Label>
                    <Input
                      id="editDpName"
                      defaultValue={editingPoint.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDpCode">Code</Label>
                    <Input
                      id="editDpCode"
                      defaultValue={editingPoint.code}
                      className="uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDpDescription">Description</Label>
                  <Textarea
                    id="editDpDescription"
                    defaultValue={editingPoint.description}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input defaultValue={editingPoint.address.addressLine1} required />
                    <Input defaultValue={editingPoint.address.addressLine2} />
                    <Input defaultValue={editingPoint.address.city} required />
                    <Input defaultValue={editingPoint.address.postalCode} required />
                    <Input defaultValue={editingPoint.address.country} required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editContactName">Contact Name</Label>
                    <Input
                      id="editContactName"
                      defaultValue={editingPoint.contactName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editContactPhone">Phone</Label>
                    <Input
                      id="editContactPhone"
                      defaultValue={editingPoint.contactPhone}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editContactEmail">Email</Label>
                    <Input
                      id="editContactEmail"
                      type="email"
                      defaultValue={editingPoint.contactEmail}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDeliveryInstructions">Delivery Instructions</Label>
                  <Textarea
                    id="editDeliveryInstructions"
                    defaultValue={editingPoint.deliveryInstructions}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMaxVehicleSize">Max Vehicle Size</Label>
                    <Select defaultValue={editingPoint.maxVehicleSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small_van">Small Van</SelectItem>
                        <SelectItem value="large_van">Large Van</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="semi_trailer">Semi-Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dock Leveler</Label>
                    <div className="flex items-center h-10">
                      <Switch id="editHasDockLeveler" defaultChecked={editingPoint.hasDockLeveler} />
                      <Label htmlFor="editHasDockLeveler" className="ml-2 font-normal">
                        Available
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Forklift</Label>
                    <div className="flex items-center h-10">
                      <Switch id="editHasForklift" defaultChecked={editingPoint.hasForklift} />
                      <Label htmlFor="editHasForklift" className="ml-2 font-normal">
                        Available
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this delivery point for use
                    </p>
                  </div>
                  <Switch id="editIsActive" defaultChecked={editingPoint.isActive} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPoint(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPoint} onOpenChange={(open) => !open && setDeletingPoint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Point</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPoint?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeliveryPoint} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
