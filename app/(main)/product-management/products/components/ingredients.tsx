"use client"

import React, { useState } from 'react';
import { Scale, Plus, Pencil, Save, X, AlertCircle, TrashIcon, ArrowLeftRight, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface IngredientUnit {
  ingredientUnit: string;
  factor: number;
  description: string;
  isDefault: boolean;
  isInverse: boolean;
}

const initialUnits: IngredientUnit[] = [
  {
    ingredientUnit: "KG",
    factor: 1,
    description: "Kilogram",
    isDefault: true,
    isInverse: true
  },
  {
    ingredientUnit: "G",
    factor: 0.001,
    description: "Gram",
    isDefault: false,
    isInverse: true
  }
]

export interface IngredientUnitTabProps {
  isEditing: boolean
}

export function IngredientUnitTab({ isEditing }: IngredientUnitTabProps) {
  const [units, setUnits] = useState<IngredientUnit[]>(initialUnits)
  const [isAddingUnit, setIsAddingUnit] = useState(false)
  const [newUnit, setNewUnit] = useState<IngredientUnit>({
    ingredientUnit: "",
    factor: 0,
    description: "",
    isDefault: false,
    isInverse: true
  })

  const handleDefaultChange = (unitCode: string) => {
    setUnits(prev => prev.map(unit => ({
      ...unit,
      isDefault: unit.ingredientUnit === unitCode
    })))
  }

  const handleDeleteUnit = (unitCode: string) => {
    setUnits(prev => prev.filter(unit => unit.ingredientUnit !== unitCode))
  }

  const handleDirectionChange = (unitCode: string) => {
    setUnits(prev => prev.map(unit => 
      unit.ingredientUnit === unitCode 
        ? { ...unit, isInverse: !unit.isInverse }
        : unit
    ))
  }

  const handleDescriptionChange = (unitCode: string, value: string) => {
    setUnits(prev => prev.map(unit =>
      unit.ingredientUnit === unitCode
        ? { ...unit, description: value }
        : unit
    ))
  }

  const handleFactorChange = (unitCode: string, value: number) => {
    setUnits(prev => prev.map(unit =>
      unit.ingredientUnit === unitCode
        ? { ...unit, factor: value }
        : unit
    ))
  }

  const getConversionText = (unit: IngredientUnit) => {
    if (unit.isInverse) {
      return `1 KG = ${(1 / unit.factor).toFixed(5)} ${unit.ingredientUnit}`
    }
    return `1 ${unit.ingredientUnit} = ${unit.factor.toFixed(5)} KG`
  }

  const getCalculationText = (unit: IngredientUnit) => {
    if (unit.isInverse) {
      return `Qty × ${(1 / unit.factor).toFixed(5)}`
    }
    return `Qty × ${unit.factor.toFixed(5)}`
  }

  const handleAddNewClick = () => {
    setIsAddingUnit(true)
  }

  const handleCancelAdd = () => {
    setIsAddingUnit(false)
    setNewUnit({
      ingredientUnit: "",
      factor: 0,
      description: "",
      isDefault: false,
      isInverse: true
    })
  }

  const handleSaveNewUnit = () => {
    if (!newUnit.ingredientUnit || !newUnit.factor) return

    setUnits(prev => [...prev, newUnit])
    handleCancelAdd()
  }

  const handleNewUnitChange = (field: keyof IngredientUnit, value: IngredientUnit[keyof IngredientUnit]) => {
    setNewUnit(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Ingredient Units</h2>
        {isEditing && !isAddingUnit && (
          <Button variant="outline" size="sm" onClick={handleAddNewClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[150px]">Unit</TableHead>
              <TableHead className="w-[250px]">Description</TableHead>
              <TableHead className="w-[180px] text-right">Conversion Factor</TableHead>
              <TableHead className="w-[120px] text-center">Default</TableHead>
              <TableHead className="w-[120px] text-center">Direction</TableHead>
              <TableHead>Conversion</TableHead>
              {isEditing && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.ingredientUnit} className="hover:bg-muted/50">
                <TableCell className="font-medium">{unit.ingredientUnit}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={unit.description}
                      onChange={(e) => handleDescriptionChange(unit.ingredientUnit, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    unit.description
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                      <Input
                        type="number"
                        value={unit.factor}
                        onChange={(e) => handleFactorChange(unit.ingredientUnit, parseFloat(e.target.value))}
                        className="w-32 text-right"
                        min={0.00001}
                        step={0.00001}
                      />
                      <span className="text-muted-foreground">KG</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      {unit.factor} <span className="text-muted-foreground">KG</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={unit.isDefault}
                      onCheckedChange={() => handleDefaultChange(unit.ingredientUnit)}
                      disabled={!isEditing}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button
                      variant={unit.isInverse ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleDirectionChange(unit.ingredientUnit)}
                      disabled={!isEditing}
                      className="relative"
                    >
                      <ArrowLeftRight 
                        className={`h-4 w-4 transition-transform duration-200 ${unit.isInverse ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{getConversionText(unit)}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCalculationText(unit)}
                    </div>
                  </div>
                </TableCell>
                {isEditing && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUnit(unit.ingredientUnit)}
                      className="hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {isEditing && isAddingUnit && (
              <TableRow>
                <TableCell>
                  <Select value={newUnit.ingredientUnit} onValueChange={(value) => handleNewUnitChange('ingredientUnit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G">Gram (G)</SelectItem>
                      <SelectItem value="KG">Kilogram (KG)</SelectItem>
                      <SelectItem value="LB">Pound (LB)</SelectItem>
                      <SelectItem value="OZ">Ounce (OZ)</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    value={newUnit.description}
                    onChange={(e) => handleNewUnitChange('description', e.target.value)}
                    placeholder="Enter description"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Input 
                      type="number" 
                      value={newUnit.factor}
                      onChange={(e) => handleNewUnitChange('factor', parseFloat(e.target.value))}
                      className="w-32 text-right"
                      min={0.00001}
                      step={0.00001}
                    />
                    <span className="text-muted-foreground">KG</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={newUnit.isDefault}
                      onCheckedChange={(checked) => handleNewUnitChange('isDefault', checked)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button 
                      variant={newUnit.isInverse ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleNewUnitChange('isInverse', !newUnit.isInverse)}
                    >
                      <ArrowLeftRight 
                        className={`h-4 w-4 transition-transform duration-200 ${newUnit.isInverse ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{getConversionText(newUnit)}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCalculationText(newUnit)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleSaveNewUnit}
                      disabled={!newUnit.ingredientUnit || !newUnit.factor}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCancelAdd}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}