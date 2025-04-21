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
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
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

export function LocationsTab({ 
  isEditing,
  locations = [],
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation 
}: LocationsTabProps) {
  const [selectedLocation, setSelectedLocation] = React.useState('')
  const [minQuantity, setMinQuantity] = React.useState('')
  const [maxQuantity, setMaxQuantity] = React.useState('')
  const [reorderPoint, setReorderPoint] = React.useState('')
  const [parLevel, setParLevel] = React.useState('')

  const handleAddLocation = () => {
    if (!selectedLocation) return

    const location = availableLocations.find(loc => loc.id === selectedLocation)
    if (!location) return

    const newAssignment: LocationAssignment = {
      id: `${location.id}-${Date.now()}`,
      locationId: location.id,
      locationName: location.name,
      locationCode: location.code,
      minQuantity: Number(minQuantity) || 0,
      maxQuantity: Number(maxQuantity) || 0,
      reorderPoint: Number(reorderPoint) || 0,
      parLevel: Number(parLevel) || 0
    }

    onAddLocation?.(newAssignment)
    
    // Reset form
    setSelectedLocation('')
    setMinQuantity('')
    setMaxQuantity('')
    setReorderPoint('')
    setParLevel('')
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
            <div className="grid grid-cols-6 gap-4">
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
                  <TableCell colSpan={isEditing ? 6 : 5} className="text-center text-muted-foreground">
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