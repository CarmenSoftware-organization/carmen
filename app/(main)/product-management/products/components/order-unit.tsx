import React, { useState } from 'react';
import { Scale, Plus, Pencil, Save, X, AlertCircle, TrashIcon, ArrowLeftRight } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox"
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

interface OrderUnit {
  orderUnit: string;
  factor: number;
  description: string;
  isDefault: boolean;
  isInverse: boolean;
}

const productInfo = {
  code: 'PRD001',
  name: 'Product A - Standard Grade',
  inventoryUnit: 'KG',
  orderUnits: [
    {
      orderUnit: 'BOX',
      factor: 12.5,
      description: 'Standard Box',
      isDefault: true,
      isInverse: false
    },
    {
      orderUnit: 'CASE',
      factor: 75.0,
      description: 'Full Case',
      isDefault: false,
      isInverse: false
    },
    {
      orderUnit: 'PALLET',
      factor: 900.0,
      description: 'Standard Pallet',
      isDefault: false,
      isInverse: false
    }
  ]
};

export interface OrderUnitTabProps {
  isEditing: boolean
}

export function OrderUnitTab({ isEditing }: OrderUnitTabProps) {
  const [units, setUnits] = useState<OrderUnit[]>(productInfo.orderUnits)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddingUnit, setIsAddingUnit] = useState(false)
  const [newUnit, setNewUnit] = useState<OrderUnit>({
    orderUnit: '',
    factor: 1,
    description: '',
    isDefault: false,
    isInverse: false
  })

  const handleDefaultChange = (unitCode: string) => {
    if (!isEditing) return;
    setUnits(units.map(unit => ({
      ...unit,
      isDefault: unit.orderUnit === unitCode
    })));
  };

  const handleDeleteUnit = (unitCode: string) => {
    if (!isEditing) return;
    if (window.confirm('Are you sure you want to delete this unit?')) {
      setUnits(units.filter(unit => unit.orderUnit !== unitCode));
    }
  };

  const handleDirectionChange = (unitCode: string) => {
    if (!isEditing) return;
    setUnits(units.map(unit => ({
      ...unit,
      isInverse: unit.orderUnit === unitCode ? !unit.isInverse : unit.isInverse
    })));
  };

  const handleDescriptionChange = (unitCode: string, value: string) => {
    if (!isEditing) return;
    setUnits(units.map(unit => 
      unit.orderUnit === unitCode ? { ...unit, description: value } : unit
    ));
  };

  const handleFactorChange = (unitCode: string, value: number) => {
    if (!isEditing) return;
    setUnits(units.map(unit => 
      unit.orderUnit === unitCode ? { ...unit, factor: value } : unit
    ));
  };

  const getConversionText = (unit: OrderUnit) => {
    if (unit.isInverse) {
      return `1 KG = ${(1/unit.factor).toFixed(5)} ${unit.orderUnit}`;
    }
    return `1 ${unit.orderUnit} = ${unit.factor.toFixed(1)} KG`;
  };

  const getCalculationText = (unit: OrderUnit) => {
    if (unit.isInverse) {
      return `Qty × ${(1/unit.factor).toFixed(5)}`;
    }
    return `Qty × ${unit.factor.toFixed(1)}`;
  };

  const handleAddNewClick = () => {
    setIsAddingUnit(true)
  }

  const handleCancelAdd = () => {
    setIsAddingUnit(false)
    setNewUnit({
      orderUnit: '',
      factor: 1,
      description: '',
      isDefault: false,
      isInverse: false
    })
  }

  const handleSaveNewUnit = () => {
    if (!newUnit.orderUnit || !newUnit.description) return

    setUnits(prev => [...prev, newUnit])
    handleCancelAdd()
  }

  const handleNewUnitChange = (field: keyof OrderUnit, value: any) => {
    setNewUnit(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Order Units</h2>
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
              <TableHead className="w-[150px]">Order Unit</TableHead>
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
              <TableRow key={unit.orderUnit} className="hover:bg-muted/50">
                <TableCell className="font-medium">{unit.orderUnit}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={unit.description}
                      onChange={(e) => handleDescriptionChange(unit.orderUnit, e.target.value)}
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
                        onChange={(e) => handleFactorChange(unit.orderUnit, parseFloat(e.target.value))}
                        className="w-32 text-right"
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
                      onCheckedChange={() => handleDefaultChange(unit.orderUnit)}
                      disabled={!isEditing}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Button
                      variant={unit.isInverse ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleDirectionChange(unit.orderUnit)}
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
                      onClick={() => handleDeleteUnit(unit.orderUnit)}
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
                  <Select 
                    value={newUnit.orderUnit}
                    onValueChange={(value) => handleNewUnitChange('orderUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAG">BAG</SelectItem>
                      <SelectItem value="BOX">BOX</SelectItem>
                      <SelectItem value="CASE">CASE</SelectItem>
                      <SelectItem value="PALLET">PALLET</SelectItem>
                      <SelectItem value="PACK">PACK</SelectItem>
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
                      className="relative"
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveNewUnit}
                      disabled={!newUnit.orderUnit || !newUnit.description}
                      className="hover:text-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelAdd}
                      className="hover:text-destructive"
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