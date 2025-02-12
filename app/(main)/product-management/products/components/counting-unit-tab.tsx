'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { mockProductUnits, CountingUnit } from '../data/mock-product-units'

interface CountingUnitTabProps {
  isEditing?: boolean
  baseInventoryUnit?: string
}

export default function CountingUnitTab({ 
  isEditing = false, 
  baseInventoryUnit = mockProductUnits.baseProduct.baseInventoryUnit 
}: CountingUnitTabProps) {
  const [countingUnit, setCountingUnit] = useState<CountingUnit>({
    ...mockProductUnits.countingUnits,
    baseUnit: baseInventoryUnit
  })
  const [newPackUnit, setNewPackUnit] = useState('')
  const [newQuantity, setNewQuantity] = useState('')

  const baseUnitLabel = baseInventoryUnit.charAt(0).toUpperCase() + baseInventoryUnit.slice(1)

  const handlePrecisionChange = (value: string) => {
    setCountingUnit(prev => ({
      ...prev,
      countPrecision: value
    }))
  }

  const handleAddPackDefinition = () => {
    if (!newPackUnit || !newQuantity) return

    const quantity = parseFloat(newQuantity)
    const newPack = {
      packUnit: newPackUnit,
      quantity,
      baseUnitEquivalent: quantity
    }

    setCountingUnit(prev => ({
      ...prev,
      packDefinitions: [...prev.packDefinitions, newPack]
    }))

    setNewPackUnit('')
    setNewQuantity('')
  }

  const handleRemovePackDefinition = (index: number) => {
    setCountingUnit(prev => ({
      ...prev,
      packDefinitions: prev.packDefinitions.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Counting Unit</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Unit</Label>
              <div className="p-2 border rounded-md bg-muted">
                {baseUnitLabel}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Count Precision</Label>
              <Select 
                value={countingUnit.countPrecision} 
                onValueChange={handlePrecisionChange}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select precision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {baseUnitLabel}</SelectItem>
                  <SelectItem value="0.1">0.1 {baseUnitLabel}</SelectItem>
                  <SelectItem value="0.01">0.01 {baseUnitLabel}</SelectItem>
                  <SelectItem value="0.001">0.001 {baseUnitLabel}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pack/Bundle Definitions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Pack Unit</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-left py-2">Base Unit Equivalent</th>
                {isEditing && <th className="text-left py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {countingUnit.packDefinitions.map((pack, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{pack.packUnit}</td>
                  <td className="py-2 text-right">{pack.quantity.toFixed(3)} {baseUnitLabel}</td>
                  <td className="py-2">1 {pack.packUnit} = {pack.baseUnitEquivalent.toFixed(3)} {baseUnitLabel}</td>
                  {isEditing && (
                    <td className="py-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemovePackDefinition(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {isEditing && (
                <tr className="border-b">
                  <td className="py-2">
                    <Select value={newPackUnit} onValueChange={setNewPackUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pack unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sack">Sack (50 {baseUnitLabel})</SelectItem>
                        <SelectItem value="Bag">Bag (25 {baseUnitLabel})</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2">
                    <Input 
                      type="number" 
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder={`Enter quantity in ${baseUnitLabel}`}
                      step="0.001"
                      className="text-right"
                    />
                  </td>
                  <td className="py-2">
                    {newPackUnit && newQuantity ? 
                      `1 ${newPackUnit} = ${parseFloat(newQuantity).toFixed(3)} ${baseUnitLabel}` : 
                      '-'
                    }
                  </td>
                  <td className="py-2">
                    <Button 
                      onClick={handleAddPackDefinition}
                      disabled={!newPackUnit || !newQuantity}
                    >
                      Add
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
} 