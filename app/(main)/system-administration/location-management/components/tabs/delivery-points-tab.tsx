"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  MapPin,
  Phone,
  Mail,
  Star,
} from "lucide-react"
import { DeliveryPoint } from "@/lib/types/location-management"

interface DeliveryPointsTabProps {
  locationId: string
  deliveryPoints: DeliveryPoint[]
  isEditing: boolean
}

export function DeliveryPointsTab({ locationId, deliveryPoints, isEditing }: DeliveryPointsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPoint, setEditingPoint] = useState<DeliveryPoint | null>(null)

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

  const handleDeleteDeliveryPoint = (point: DeliveryPoint) => {
    if (window.confirm(`Are you sure you want to delete delivery point "${point.name}"?`)) {
      // In a real app, this would delete the delivery point
    }
  }

  const formatOperatingHours = (point: DeliveryPoint) => {
    if (!point.operatingHours) return '-'
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
    const hours = point.operatingHours[days[0]]
    if (!hours || hours.isClosed) return 'Closed'
    return `${hours.open} - ${hours.close}`
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Delivery Points</CardTitle>
            <CardDescription>
              Configure delivery addresses and receiving instructions
            </CardDescription>
          </div>
          {isEditing && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Delivery Point
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleAddDeliveryPoint}>
                  <DialogHeader>
                    <DialogTitle>Add Delivery Point</DialogTitle>
                    <DialogDescription>
                      Configure a new delivery address for this location
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

                    {/* Address */}
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Address Line 1" required />
                        <Input placeholder="Address Line 2 (optional)" />
                        <Input placeholder="City" required />
                        <Input placeholder="Postal Code" required />
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
                        <Label>Primary Delivery Point</Label>
                        <p className="text-sm text-muted-foreground">
                          Set as the default delivery address
                        </p>
                      </div>
                      <Switch id="isPrimary" />
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
          )}
        </CardHeader>
        <CardContent>
          {deliveryPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No delivery points configured</p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Delivery Point
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {deliveryPoints.map((point) => (
                <Card key={point.id} className="overflow-hidden">
                  <div className="flex items-start justify-between p-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{point.name}</h4>
                        {point.code && (
                          <Badge variant="outline" className="font-mono">
                            {point.code}
                          </Badge>
                        )}
                        {point.isPrimary && (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                        <Badge variant={point.isActive ? "default" : "secondary"}>
                          {point.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p>{point.address.addressLine1}</p>
                              {point.address.addressLine2 && (
                                <p>{point.address.addressLine2}</p>
                              )}
                              <p>
                                {point.address.city}, {point.address.postalCode}
                              </p>
                              <p>{point.address.country}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {point.contactName && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Contact:</span>
                              <span>{point.contactName}</span>
                            </div>
                          )}
                          {point.contactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{point.contactPhone}</span>
                            </div>
                          )}
                          {point.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{point.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {point.deliveryInstructions && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Instructions:</span>{' '}
                          <span>{point.deliveryInstructions}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-muted-foreground">Hours:</span>
                        <span>{formatOperatingHours(point)}</span>
                        {point.maxVehicleSize && (
                          <>
                            <span className="text-muted-foreground">|</span>
                            <span>Max: {getVehicleSizeLabel(point.maxVehicleSize)}</span>
                          </>
                        )}
                        {point.hasDockLeveler && (
                          <Badge variant="outline" className="text-xs">
                            Dock Leveler
                          </Badge>
                        )}
                        {point.hasForklift && (
                          <Badge variant="outline" className="text-xs">
                            Forklift
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isEditing && (
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
                            onClick={() => handleDeleteDeliveryPoint(point)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Label>Address</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input defaultValue={editingPoint.address.addressLine1} required />
                    <Input defaultValue={editingPoint.address.addressLine2} />
                    <Input defaultValue={editingPoint.address.city} required />
                    <Input defaultValue={editingPoint.address.postalCode} required />
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

                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <Label>Primary Delivery Point</Label>
                    <p className="text-sm text-muted-foreground">
                      Set as the default delivery address
                    </p>
                  </div>
                  <Switch id="editIsPrimary" defaultChecked={editingPoint.isPrimary} />
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
    </div>
  )
}
