"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface UnitMapping {
  id: string
  posUnitId: string
  posUnitName: string
  carmenUnitId: string
  carmenUnitName: string
  conversionRate: number
  unitType: string
  baseUnit: string
  isActive: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
}

interface CarmenUnit {
  id: string
  name: string
  abbreviation: string
  type: string
}

interface UnitEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: UnitMapping | null
  onSave: (updatedMapping: Partial<UnitMapping>) => void
}

export function UnitEditDrawer({
  open,
  onOpenChange,
  mapping,
  onSave,
}: UnitEditDrawerProps) {
  const [selectedCarmenUnit, setSelectedCarmenUnit] = useState("")
  const [conversionRate, setConversionRate] = useState("1")
  const [unitType, setUnitType] = useState("weight")
  const [baseUnit, setBaseUnit] = useState("gram")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Mock Carmen units
  const carmenUnits: CarmenUnit[] = [
    { id: "unit-001", name: "Gram", abbreviation: "g", type: "weight" },
    { id: "unit-002", name: "Kilogram", abbreviation: "kg", type: "weight" },
    { id: "unit-003", name: "Milliliter", abbreviation: "ml", type: "volume" },
    { id: "unit-004", name: "Liter", abbreviation: "l", type: "volume" },
    { id: "unit-005", name: "Piece", abbreviation: "pc", type: "count" },
    { id: "unit-006", name: "Dozen", abbreviation: "dz", type: "count" },
  ]

  const unitTypes = ["weight", "volume", "count", "custom"]

  const baseUnits = {
    weight: ["gram", "kilogram", "pound", "ounce"],
    volume: ["milliliter", "liter", "gallon", "fluid ounce"],
    count: ["piece", "dozen", "box"],
    custom: ["custom"],
  }

  // Initialize form with mapping data
  useEffect(() => {
    if (mapping) {
      setSelectedCarmenUnit(mapping.carmenUnitId)
      setConversionRate(mapping.conversionRate.toString())
      setUnitType(mapping.unitType)
      setBaseUnit(mapping.baseUnit)
      setIsActive(mapping.isActive)
    }
  }, [mapping])

  // Calculate conversion preview
  const calculateConversion = () => {
    const rate = parseFloat(conversionRate) || 1
    const examples = [
      { posQty: 1, carmenQty: rate },
      { posQty: 10, carmenQty: rate * 10 },
      { posQty: 100, carmenQty: rate * 100 },
    ]
    return examples
  }

  const conversions = calculateConversion()
  const selectedUnit = carmenUnits.find(u => u.id === selectedCarmenUnit)

  const handleSave = async () => {
    if (!selectedCarmenUnit || !mapping) return

    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const unit = carmenUnits.find(u => u.id === selectedCarmenUnit)

    const updatedMapping: Partial<UnitMapping> = {
      carmenUnitId: selectedCarmenUnit,
      carmenUnitName: unit?.name || mapping.carmenUnitName,
      conversionRate: parseFloat(conversionRate),
      unitType,
      baseUnit,
      isActive,
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
          <SheetTitle>Edit Unit Mapping</SheetTitle>
          <SheetDescription>
            Update the unit conversion mapping for {mapping?.posUnitName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* POS Unit Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">POS Unit</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{mapping?.posUnitName}</p>
                  <p className="text-sm text-muted-foreground">
                    POS ID: {mapping?.posUnitId}
                  </p>
                </div>
                <Badge variant={mapping?.isActive ? "default" : "secondary"}>
                  {mapping?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Carmen Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="carmen-unit">Carmen Unit</Label>
            <Select value={selectedCarmenUnit} onValueChange={setSelectedCarmenUnit}>
              <SelectTrigger id="carmen-unit">
                <SelectValue placeholder="Select Carmen unit" />
              </SelectTrigger>
              <SelectContent>
                {carmenUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation}) - {unit.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conversion Rate */}
          <div className="space-y-2">
            <Label htmlFor="conversion-rate">Conversion Rate</Label>
            <Input
              id="conversion-rate"
              type="number"
              min="0.001"
              step="0.001"
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
              placeholder="1.000"
            />
            <p className="text-xs text-muted-foreground">
              1 {mapping?.posUnitName} = {conversionRate} {selectedUnit?.name || "Carmen unit"}
            </p>
          </div>

          {/* Unit Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit-type">Unit Type</Label>
              <Select value={unitType} onValueChange={setUnitType}>
                <SelectTrigger id="unit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-unit">Base Unit</Label>
              <Select value={baseUnit} onValueChange={setBaseUnit}>
                <SelectTrigger id="base-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseUnits[unitType as keyof typeof baseUnits].map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Toggle */}
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
          </div>

          <Separator />

          {/* Conversion Preview */}
          {selectedUnit && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Conversion Preview</Label>
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium mb-2">
                  Conversion Examples:
                </p>
                {conversions.map((conv, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {conv.posQty} {mapping?.posUnitName}
                    </span>
                    <span className="font-medium">
                      = {conv.carmenQty.toFixed(3)} {selectedUnit.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedCarmenUnit || isSaving}
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
