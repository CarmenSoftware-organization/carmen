import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, TrashIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LocationAssignment {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  shelfId: string
  shelfName: string
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
}

interface Shelf {
  id: string
  name: string
  code: string
  locationId: string
}

interface LocationsTabProps {
  isEditing: boolean
  locations?: LocationAssignment[]
  onAddLocation?: (location: LocationAssignment) => void
  onUpdateLocation?: (id: string, updates: Partial<LocationAssignment>) => void
  onRemoveLocation?: (id: string) => void
}

// Mock data for available locations
const availableLocations = [
  { id: 'LOC1', name: 'Main Kitchen', code: 'MK-001' },
  { id: 'LOC2', name: 'Dry Storage', code: 'DS-001' },
  { id: 'LOC3', name: 'Cold Storage', code: 'CS-001' },
  { id: 'LOC4', name: 'Bar Storage', code: 'BS-001' },
  { id: 'LOC5', name: 'Prep Kitchen', code: 'PK-001' },
]

// Mock data for available shelves per location
const availableShelves: Shelf[] = [
  // Main Kitchen shelves
  { id: 'SH1-1', name: 'Shelf A1', code: 'MK-A1', locationId: 'LOC1' },
  { id: 'SH1-2', name: 'Shelf A2', code: 'MK-A2', locationId: 'LOC1' },
  { id: 'SH1-3', name: 'Shelf B1', code: 'MK-B1', locationId: 'LOC1' },
  // Dry Storage shelves
  { id: 'SH2-1', name: 'Rack 1', code: 'DS-R1', locationId: 'LOC2' },
  { id: 'SH2-2', name: 'Rack 2', code: 'DS-R2', locationId: 'LOC2' },
  { id: 'SH2-3', name: 'Rack 3', code: 'DS-R3', locationId: 'LOC2' },
  { id: 'SH2-4', name: 'Floor Storage', code: 'DS-FL', locationId: 'LOC2' },
  // Cold Storage shelves
  { id: 'SH3-1', name: 'Freezer Shelf 1', code: 'CS-F1', locationId: 'LOC3' },
  { id: 'SH3-2', name: 'Freezer Shelf 2', code: 'CS-F2', locationId: 'LOC3' },
  { id: 'SH3-3', name: 'Chiller Shelf 1', code: 'CS-C1', locationId: 'LOC3' },
  { id: 'SH3-4', name: 'Chiller Shelf 2', code: 'CS-C2', locationId: 'LOC3' },
  // Bar Storage shelves
  { id: 'SH4-1', name: 'Top Shelf', code: 'BS-T1', locationId: 'LOC4' },
  { id: 'SH4-2', name: 'Middle Shelf', code: 'BS-M1', locationId: 'LOC4' },
  { id: 'SH4-3', name: 'Bottom Shelf', code: 'BS-B1', locationId: 'LOC4' },
  // Prep Kitchen shelves
  { id: 'SH5-1', name: 'Prep Station 1', code: 'PK-P1', locationId: 'LOC5' },
  { id: 'SH5-2', name: 'Prep Station 2', code: 'PK-P2', locationId: 'LOC5' },
]

export function LocationsTab({
  isEditing,
  locations = [],
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation
}: LocationsTabProps) {
  const [selectedLocation, setSelectedLocation] = React.useState('')
  const [selectedShelf, setSelectedShelf] = React.useState('')
  const [minQuantity, setMinQuantity] = React.useState('')
  const [maxQuantity, setMaxQuantity] = React.useState('')
  const [reorderPoint, setReorderPoint] = React.useState('')
  const [parLevel, setParLevel] = React.useState('')

  // Get shelves for the selected location
  const shelvesForSelectedLocation = React.useMemo(() => {
    if (!selectedLocation) return []
    return availableShelves.filter(shelf => shelf.locationId === selectedLocation)
  }, [selectedLocation])

  // Reset shelf when location changes
  React.useEffect(() => {
    setSelectedShelf('')
  }, [selectedLocation])

  const handleAddLocation = () => {
    if (!selectedLocation) return

    const location = availableLocations.find(loc => loc.id === selectedLocation)
    if (!location) return

    const shelf = availableShelves.find(s => s.id === selectedShelf)

    const newAssignment: LocationAssignment = {
      id: `${location.id}-${Date.now()}`,
      locationId: location.id,
      locationName: location.name,
      locationCode: location.code,
      shelfId: shelf?.id || '',
      shelfName: shelf?.name || '',
      minQuantity: Number(minQuantity) || 0,
      maxQuantity: Number(maxQuantity) || 0,
      reorderPoint: Number(reorderPoint) || 0,
      parLevel: Number(parLevel) || 0
    }

    onAddLocation?.(newAssignment)

    // Reset form
    setSelectedLocation('')
    setSelectedShelf('')
    setMinQuantity('')
    setMaxQuantity('')
    setReorderPoint('')
    setParLevel('')
  }

  // Helper function to get shelves for a specific location
  const getShelvesForLocation = (locationId: string) => {
    return availableShelves.filter(shelf => shelf.locationId === locationId)
  }

  const unassignedLocations = availableLocations.filter(
    loc => !locations.some(assignment => assignment.locationId === loc.id)
  )

  return (
    <div className="space-y-6">
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Add Location Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              <div className="col-span-2">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedLocations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedShelf}
                  onValueChange={setSelectedShelf}
                  disabled={!selectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shelf" />
                  </SelectTrigger>
                  <SelectContent>
                    {shelvesForSelectedLocation.map(shelf => (
                      <SelectItem key={shelf.id} value={shelf.id}>
                        {shelf.name} ({shelf.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Min Qty"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max Qty"
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Reorder Point"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                />
              </div>
              <div>
                <Button
                  onClick={handleAddLocation}
                  disabled={!selectedLocation}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assigned Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Shelf (Storage)</TableHead>
                <TableHead className="text-right">Min Qty</TableHead>
                <TableHead className="text-right">Max Qty</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">PAR Level</TableHead>
                {isEditing && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assignment.locationName}</div>
                      <div className="text-sm text-muted-foreground">{assignment.locationCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        value={assignment.shelfId || ''}
                        onValueChange={(value) => {
                          const shelf = availableShelves.find(s => s.id === value)
                          onUpdateLocation?.(assignment.id, {
                            shelfId: value,
                            shelfName: shelf?.name || ''
                          })
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select shelf" />
                        </SelectTrigger>
                        <SelectContent>
                          {getShelvesForLocation(assignment.locationId).map(shelf => (
                            <SelectItem key={shelf.id} value={shelf.id}>
                              {shelf.name} ({shelf.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        {assignment.shelfName ? (
                          <>
                            <div className="font-medium">{assignment.shelfName}</div>
                            <div className="text-sm text-muted-foreground">
                              {availableShelves.find(s => s.id === assignment.shelfId)?.code || ''}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.minQuantity}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { minQuantity: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.minQuantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.maxQuantity}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { maxQuantity: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.maxQuantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.reorderPoint}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { reorderPoint: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.reorderPoint
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={assignment.parLevel}
                        onChange={(e) => onUpdateLocation?.(assignment.id, { parLevel: Number(e.target.value) })}
                        className="w-24 ml-auto"
                      />
                    ) : (
                      assignment.parLevel
                    )}
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveLocation?.(assignment.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {locations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isEditing ? 7 : 6} className="text-center text-muted-foreground">
                    No locations assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 