"use client"

import { useState, useEffect } from "react"
import { Loader2, MapPin } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface LocationMapping {
  id: string
  posLocationId: string
  posLocationName: string
  posLocationCode?: string
  carmenLocationId: string
  carmenLocationName: string
  carmenLocationType: string
  isActive: boolean
  syncEnabled: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
  notes?: string
}

interface CarmenLocation {
  id: string
  name: string
  type: string
  code: string
  department?: string
}

interface LocationEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: LocationMapping | null
  onSave: (updatedMapping: Partial<LocationMapping>) => void
}

export function LocationEditDrawer({
  open,
  onOpenChange,
  mapping,
  onSave,
}: LocationEditDrawerProps) {
  const [selectedCarmenLocation, setSelectedCarmenLocation] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Mock Carmen locations
  const carmenLocations: CarmenLocation[] = [
    {
      id: "loc-001",
      name: "Main Kitchen",
      type: "Production",
      code: "MK-001",
      department: "Kitchen Operations",
    },
    {
      id: "loc-002",
      name: "Central Store",
      type: "Storage",
      code: "CS-001",
      department: "Inventory Management",
    },
    {
      id: "loc-003",
      name: "Restaurant Floor",
      type: "Service",
      code: "RF-001",
      department: "Front of House",
    },
    {
      id: "loc-004",
      name: "Bar & Beverage",
      type: "Service",
      code: "BB-001",
      department: "Bar Operations",
    },
    {
      id: "loc-005",
      name: "Cold Storage",
      type: "Storage",
      code: "CST-001",
      department: "Inventory Management",
    },
  ]

  const locationTypes = ["Production", "Storage", "Service", "Distribution", "Other"]

  // Initialize form with mapping data
  useEffect(() => {
    if (mapping) {
      setSelectedCarmenLocation(mapping.carmenLocationId)
      setIsActive(mapping.isActive)
      setSyncEnabled(mapping.syncEnabled)
      setNotes(mapping.notes || "")
    }
  }, [mapping])

  const selectedLocation = carmenLocations.find(l => l.id === selectedCarmenLocation)

  const handleSave = async () => {
    if (!selectedCarmenLocation || !mapping) return

    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const location = carmenLocations.find(l => l.id === selectedCarmenLocation)

    const updatedMapping: Partial<LocationMapping> = {
      carmenLocationId: selectedCarmenLocation,
      carmenLocationName: location?.name || mapping.carmenLocationName,
      carmenLocationType: location?.type || mapping.carmenLocationType,
      isActive,
      syncEnabled,
      notes: notes.trim() || undefined,
    }

    onSave(updatedMapping)
    setIsSaving(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Location Mapping</SheetTitle>
          <SheetDescription>
            Update the location mapping for {mapping?.posLocationName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* POS Location Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">POS Location</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{mapping?.posLocationName}</p>
                    <p className="text-sm text-muted-foreground">
                      {mapping?.posLocationCode ? `Code: ${mapping.posLocationCode}` : `ID: ${mapping?.posLocationId}`}
                    </p>
                  </div>
                </div>
                <Badge variant={mapping?.isActive ? "default" : "secondary"}>
                  {mapping?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Carmen Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="carmen-location">Carmen Location</Label>
            <Select value={selectedCarmenLocation} onValueChange={setSelectedCarmenLocation}>
              <SelectTrigger id="carmen-location">
                <SelectValue placeholder="Select Carmen location" />
              </SelectTrigger>
              <SelectContent>
                {locationTypes.map((type) => {
                  const locationsOfType = carmenLocations.filter(l => l.type === type)
                  if (locationsOfType.length === 0) return null

                  return (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {type}
                      </div>
                      {locationsOfType.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </SelectItem>
                      ))}
                    </div>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Location Details</span>
                  <Badge variant="outline">{selectedLocation.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Code:</p>
                    <p className="font-medium">{selectedLocation.code}</p>
                  </div>
                  {selectedLocation.department && (
                    <div>
                      <p className="text-muted-foreground">Department:</p>
                      <p className="font-medium">{selectedLocation.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Mapping Status</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Inactive mappings will not be used for transaction processing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sync">Auto-Sync</Label>
              <Select
                value={syncEnabled ? "enabled" : "disabled"}
                onValueChange={(value) => setSyncEnabled(value === "enabled")}
              >
                <SelectTrigger id="sync">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Enable automatic synchronization of inventory between POS and Carmen
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or comments about this location mapping..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Mapping Summary */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mapping Summary</Label>
            <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">POS Location:</span>
                <span className="font-medium">{mapping?.posLocationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carmen Location:</span>
                <span className="font-medium">
                  {selectedLocation?.name || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location Type:</span>
                <span className="font-medium">
                  {selectedLocation?.type || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={isActive ? "default" : "secondary"} className="h-5">
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto-Sync:</span>
                <Badge variant={syncEnabled ? "default" : "outline"} className="h-5">
                  {syncEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedCarmenLocation || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Mapping"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
