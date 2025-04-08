import React, { useState } from 'react'
import { Scale, Plus, Pencil, Save, X, AlertCircle, TrashIcon, ArrowLeftRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { toast } from 'sonner'

'use client'


interface StockCountUnit {
  countUnit: string
  factor: number
  description: string
  isDefault: boolean
  isInverse: boolean
}

export interface StockCountTabProps {
  isEditing: boolean
}

export function StockCountTab({ isEditing = false }: StockCountTabProps) {
  const [stockCountUnits, setStockCountUnits] = useState<StockCountUnit[]>([
    {
      countUnit: "KG",
      factor: 1,
      description: "Kilogram",
      isDefault: true,
      isInverse: false
    },
    {
      countUnit: "G",
      factor: 0.001,
      description: "Gram",
      isDefault: false,
      isInverse: false
    }
  ])

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newUnit, setNewUnit] = useState<StockCountUnit>({
    countUnit: '',
    factor: 0,
    description: '',
    isDefault: false,
    isInverse: false
  })

  const [validationErrors, setValidationErrors] = useState<{
    countUnit?: string
    factor?: string
    description?: string
  }>({})

  const handleDefaultChange = (unitCode: string) => {
    setStockCountUnits(units => units.map(unit => ({
      ...unit,
      isDefault: unit.countUnit === unitCode
    })))
  }

  const handleDeleteUnit = (unitCode: string) => {
    if (stockCountUnits.find(u => u.countUnit === unitCode)?.isDefault) {
      toast.error("Cannot delete default unit", {
        description: "Please set another unit as default first"
      })
      return
    }
    setStockCountUnits(units => units.filter(unit => unit.countUnit !== unitCode))
  }

  const handleDirectionChange = (unitCode: string) => {
    setStockCountUnits(units => units.map(unit => 
      unit.countUnit === unitCode 
        ? { ...unit, isInverse: !unit.isInverse }
        : unit
    ))
  }

  const handleDescriptionChange = (unitCode: string, value: string) => {
    setStockCountUnits(units => units.map(unit => 
      unit.countUnit === unitCode 
        ? { ...unit, description: value }
        : unit
    ))
  }

  const handleFactorChange = (unitCode: string, value: number) => {
    setStockCountUnits(units => units.map(unit => 
      unit.countUnit === unitCode 
        ? { ...unit, factor: value }
        : unit
    ))
  }

  const getConversionText = (unit: StockCountUnit) => {
    const defaultUnit = stockCountUnits.find(u => u.isDefault)?.countUnit || 'KG'
    return `1 ${defaultUnit} = ${unit.factor.toFixed(6)} ${unit.countUnit}`
  }

  const getCalculationText = (unit: StockCountUnit) => {
    return `Qty × ${unit.factor.toFixed(6)}`
  }

  const handleAddNewClick = () => {
    setIsAddingNew(true)
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewUnit({
      countUnit: '',
      factor: 0,
      description: '',
      isDefault: false,
      isInverse: false
    })
    setValidationErrors({})
  }

  const validateNewUnit = (): boolean => {
    const errors: typeof validationErrors = {}
    
    if (!newUnit.countUnit.trim()) {
      errors.countUnit = 'Unit name is required'
    } else if (stockCountUnits.some(unit => unit.countUnit === newUnit.countUnit)) {
      errors.countUnit = 'Unit name must be unique'
    }

    if (!newUnit.factor) {
      errors.factor = 'Factor is required'
    } else if (newUnit.factor <= 0) {
      errors.factor = 'Factor must be positive'
    }

    if (!newUnit.description.trim()) {
      errors.description = 'Description is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveNewUnit = () => {
    if (!validateNewUnit()) return

    setStockCountUnits(units => [...units, newUnit])
    handleCancelAdd()
    toast.success("Unit added successfully", {
      description: `${newUnit.countUnit} has been added to the stock count units.`
    })
  }

  const handleNewUnitChange = (field: keyof StockCountUnit, value: StockCountUnit[keyof StockCountUnit]) => {
    setNewUnit(prev => ({ ...prev, [field]: value }))
    // Clear validation error for the field being changed
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stock Count Units</h2>
        {isEditing && !isAddingNew && (
          <Button onClick={handleAddNewClick} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Conversion Factor</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Conversion</TableHead>
            {isEditing && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockCountUnits.map((unit) => (
            <TableRow key={unit.countUnit}>
              <TableCell>{unit.countUnit}</TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={unit.description}
                    onChange={(e) => handleDescriptionChange(unit.countUnit, e.target.value)}
                  />
                ) : (
                  unit.description
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={unit.factor}
                    onChange={(e) => handleFactorChange(unit.countUnit, parseFloat(e.target.value))}
                    step="0.000001"
                    className="text-right"
                  />
                ) : (
                  unit.factor
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={unit.isDefault}
                  onCheckedChange={() => handleDefaultChange(unit.countUnit)}
                  disabled={!isEditing || unit.isDefault}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDirectionChange(unit.countUnit)}
                  disabled={!isEditing}
                  className="p-0"
                >
                  <ArrowLeftRight className={`w-4 h-4 transition-transform ${unit.isInverse ? 'rotate-180' : ''}`} />
                </Button>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{getConversionText(unit)}</div>
                  <div className="text-gray-500">{getCalculationText(unit)}</div>
                </div>
              </TableCell>
              {isEditing && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUnit(unit.countUnit)}
                    disabled={unit.isDefault}
                  >
                    <TrashIcon className="w-4 h-4 text-black" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {isAddingNew && (
            <TableRow>
              <TableCell>
                <Input
                  value={newUnit.countUnit}
                  onChange={(e) => handleNewUnitChange('countUnit', e.target.value as StockCountUnit['countUnit'])}
                  placeholder="Enter unit"
                  className={validationErrors.countUnit ? 'border-red-500' : ''}
                />
                {validationErrors.countUnit && (
                  <div className="text-red-500 text-sm">{validationErrors.countUnit}</div>
                )}
              </TableCell>
              <TableCell>
                <Input
                  value={newUnit.description}
                  onChange={(e) => handleNewUnitChange('description', e.target.value as StockCountUnit['description'])}
                  placeholder="Enter description"
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <div className="text-red-500 text-sm">{validationErrors.description}</div>
                )}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newUnit.factor}
                  onChange={(e) => handleNewUnitChange('factor', parseFloat(e.target.value) as StockCountUnit['factor'])}
                  step="0.000001"
                  placeholder="Enter factor"
                  className={`text-right ${validationErrors.factor ? 'border-red-500' : ''}`}
                />
                {validationErrors.factor && (
                  <div className="text-red-500 text-sm">{validationErrors.factor}</div>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={newUnit.isDefault}
                  onCheckedChange={(checked) => handleNewUnitChange('isDefault', checked as StockCountUnit['isDefault'])}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNewUnitChange('isInverse', !newUnit.isInverse as StockCountUnit['isInverse'])}
                  className="p-0"
                >
                  <ArrowLeftRight className={`w-4 h-4 transition-transform ${newUnit.isInverse ? 'rotate-180' : ''}`} />
                </Button>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500">
                  Preview will show after saving
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveNewUnit}
                      disabled={!newUnit.countUnit || !newUnit.description}
                      className="hover:text-green-600"
                    >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button                
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelAdd}
                      className="hover:text-destructive"
                      >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 