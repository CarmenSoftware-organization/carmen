'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Scissors,
  Combine,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
  Calculator
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  FractionalStock,
  FractionalItem,
  ConversionRecord,
  PortionSize
} from '@/lib/types/fractional-inventory'

interface ConversionOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  stock: FractionalStock | null
  item: FractionalItem | null
  operationType: 'split' | 'combine'
  onConfirm: (operation: ConversionOperation) => Promise<boolean>
}

interface ConversionOperation {
  type: 'split' | 'combine'
  stockId: string
  quantity: number
  portionSizeId?: string
  targetWholeUnits?: number
  reason?: string
  notes?: string
}

export function ConversionOperationsModal({
  isOpen,
  onClose,
  stock,
  item,
  operationType,
  onConfirm
}: ConversionOperationsModalProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedPortionSize, setSelectedPortionSize] = useState<string>('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ConversionPreview | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  interface ConversionPreview {
    beforeState: {
      wholeUnits: number
      portions: number
      value: number
    }
    afterState: {
      wholeUnits: number
      portions: number
      value: number
    }
    impact: {
      portionChange: number
      valueChange: number
      wasteGenerated: number
      conversionCost: number
      efficiency: number
      timeRequired: number
    }
    risks: string[]
    recommendations: string[]
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && stock && item) {
      setQuantity(1)
      setSelectedPortionSize(item.defaultPortionId || item.availablePortions[0]?.id || '')
      setReason('')
      setNotes('')
      setValidationErrors([])
      calculatePreview(1, item.defaultPortionId || item.availablePortions[0]?.id || '')
    }
  }, [isOpen, stock, item])

  // Recalculate preview when inputs change
  useEffect(() => {
    if (stock && item) {
      calculatePreview(quantity, selectedPortionSize)
    }
  }, [quantity, selectedPortionSize, stock, item])

  const calculatePreview = (qty: number, portionSizeId: string) => {
    if (!stock || !item || qty <= 0) {
      setPreview(null)
      return
    }

    const errors: string[] = []
    
    if (operationType === 'split') {
      // Splitting: whole units -> portions
      if (qty > stock.wholeUnitsAvailable) {
        errors.push(`Only ${stock.wholeUnitsAvailable} whole units available`)
      }

      const portionSize = item.availablePortions.find(p => p.id === portionSizeId)
      if (!portionSize) {
        errors.push('Invalid portion size selected')
        setValidationErrors(errors)
        return
      }

      const portionsCreated = qty * portionSize.portionsPerWhole
      const wasteGenerated = qty * (item.wastePercentage / 100)
      const actualPortionsCreated = Math.floor(portionsCreated * (1 - (item.wastePercentage / 100)))
      const conversionCost = qty * (item.conversionCostPerUnit || 0)
      const efficiency = actualPortionsCreated / portionsCreated

      // Calculate values
      const beforeValue = stock.wholeUnitsAvailable * item.baseCostPerUnit + 
                         stock.totalPortionsAvailable * (item.baseCostPerUnit / portionSize.portionsPerWhole)
      const afterValue = (stock.wholeUnitsAvailable - qty) * item.baseCostPerUnit + 
                        (stock.totalPortionsAvailable + actualPortionsCreated) * (item.baseCostPerUnit / portionSize.portionsPerWhole)

      const risks: string[] = []
      const recommendations: string[] = []

      if (efficiency < 0.9) {
        risks.push('High waste percentage expected')
        recommendations.push('Consider improving preparation process')
      }

      if (stock.qualityGrade === 'FAIR' || stock.qualityGrade === 'POOR') {
        risks.push('Source quality is degraded')
        recommendations.push('Use portions immediately after conversion')
      }

      if (stock.expiresAt && new Date(stock.expiresAt).getTime() < Date.now() + (2 * 60 * 60 * 1000)) {
        risks.push('Source will expire soon')
        recommendations.push('Prioritize this conversion')
      }

      setPreview({
        beforeState: {
          wholeUnits: stock.wholeUnitsAvailable,
          portions: stock.totalPortionsAvailable,
          value: beforeValue
        },
        afterState: {
          wholeUnits: stock.wholeUnitsAvailable - qty,
          portions: stock.totalPortionsAvailable + actualPortionsCreated,
          value: afterValue - conversionCost
        },
        impact: {
          portionChange: actualPortionsCreated,
          valueChange: afterValue - beforeValue - conversionCost,
          wasteGenerated,
          conversionCost,
          efficiency,
          timeRequired: qty * 5 // 5 minutes per unit estimate
        },
        risks,
        recommendations
      })

    } else {
      // Combining: portions -> whole units
      const portionSize = item.availablePortions.find(p => p.id === selectedPortionSize) ||
                          item.availablePortions.find(p => p.id === item.defaultPortionId) ||
                          item.availablePortions[0]
      
      if (!portionSize) {
        errors.push('No valid portion size found')
        setValidationErrors(errors)
        return
      }

      const portionsNeeded = qty * portionSize.portionsPerWhole
      if (portionsNeeded > stock.totalPortionsAvailable) {
        errors.push(`Only ${stock.totalPortionsAvailable} portions available (need ${portionsNeeded})`)
      }

      const wasteGenerated = portionsNeeded * (item.wastePercentage / 100)
      const actualWholeUnits = Math.floor((portionsNeeded - wasteGenerated) / portionSize.portionsPerWhole)
      const remainingPortions = (portionsNeeded - wasteGenerated) % portionSize.portionsPerWhole
      const conversionCost = qty * (item.conversionCostPerUnit || 0)
      const efficiency = (actualWholeUnits * portionSize.portionsPerWhole + remainingPortions) / portionsNeeded

      const beforeValue = stock.wholeUnitsAvailable * item.baseCostPerUnit + 
                         stock.totalPortionsAvailable * (item.baseCostPerUnit / portionSize.portionsPerWhole)
      const afterValue = (stock.wholeUnitsAvailable + actualWholeUnits) * item.baseCostPerUnit + 
                        (stock.totalPortionsAvailable - portionsNeeded + remainingPortions) * (item.baseCostPerUnit / portionSize.portionsPerWhole)

      const risks: string[] = []
      const recommendations: string[] = []

      if (stock.totalPortionsAvailable < portionsNeeded * 1.2) {
        risks.push('Using most available portions')
        recommendations.push('Confirm no immediate orders need these portions')
      }

      if (remainingPortions > 0) {
        recommendations.push(`Will have ${remainingPortions} portions remaining after combine`)
      }

      setPreview({
        beforeState: {
          wholeUnits: stock.wholeUnitsAvailable,
          portions: stock.totalPortionsAvailable,
          value: beforeValue
        },
        afterState: {
          wholeUnits: stock.wholeUnitsAvailable + actualWholeUnits,
          portions: stock.totalPortionsAvailable - portionsNeeded + remainingPortions,
          value: afterValue - conversionCost
        },
        impact: {
          portionChange: remainingPortions - portionsNeeded,
          valueChange: afterValue - beforeValue - conversionCost,
          wasteGenerated,
          conversionCost,
          efficiency,
          timeRequired: qty * 3 // 3 minutes per unit estimate
        },
        risks,
        recommendations
      })
    }

    setValidationErrors(errors)
  }

  const handleConfirm = async () => {
    if (!stock || !item || validationErrors.length > 0) return

    setLoading(true)

    const operation: ConversionOperation = {
      type: operationType,
      stockId: stock.id,
      quantity,
      portionSizeId: operationType === 'split' ? selectedPortionSize : undefined,
      targetWholeUnits: operationType === 'combine' ? quantity : undefined,
      reason: reason || undefined,
      notes: notes || undefined
    }

    try {
      const success = await onConfirm(operation)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMaxQuantity = () => {
    if (!stock || !item) return 1

    if (operationType === 'split') {
      return stock.wholeUnitsAvailable
    } else {
      const portionSize = item.availablePortions.find(p => p.id === selectedPortionSize) ||
                          item.availablePortions[0]
      if (!portionSize) return 1
      return Math.floor(stock.totalPortionsAvailable / portionSize.portionsPerWhole)
    }
  }

  if (!stock || !item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operationType === 'split' ? (
              <Scissors className="h-5 w-5 text-blue-500" />
            ) : (
              <Combine className="h-5 w-5 text-green-500" />
            )}
            {operationType === 'split' ? 'Split Item into Portions' : 'Combine Portions into Whole Units'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Item: {item.itemName}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current State:</span>
                <Badge className="ml-2">{stock.currentState}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Quality:</span>
                <Badge variant="outline" className="ml-2">{stock.qualityGrade}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Whole Units:</span>
                <span className="ml-2 font-medium">{stock.wholeUnitsAvailable}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Portions:</span>
                <span className="ml-2 font-medium">{stock.totalPortionsAvailable}</span>
              </div>
            </div>
          </div>

          {/* Operation Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">
                  {operationType === 'split' ? 'Whole Units to Split' : 'Whole Units to Create'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={getMaxQuantity()}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {getMaxQuantity()}
                </p>
              </div>

              {operationType === 'split' && (
                <div>
                  <Label htmlFor="portionSize">Portion Size</Label>
                  <select
                    id="portionSize"
                    className="w-full border rounded-md px-3 py-2 bg-white"
                    value={selectedPortionSize}
                    onChange={(e) => setSelectedPortionSize(e.target.value)}
                  >
                    {item.availablePortions.map((portion) => (
                      <option key={portion.id} value={portion.id}>
                        {portion.name} ({portion.portionsPerWhole} per whole)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Meet lunch rush demand, Customer order..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this conversion..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {preview && validationErrors.length === 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Conversion Preview
              </h4>

              {/* Before/After Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-2">Before</h5>
                  <div className="space-y-1 text-sm">
                    <div>Whole Units: {preview.beforeState.wholeUnits}</div>
                    <div>Portions: {preview.beforeState.portions}</div>
                    <div>Value: ฿{preview.beforeState.value.toFixed(2)}</div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-700 mb-2">After</h5>
                  <div className="space-y-1 text-sm">
                    <div>Whole Units: {preview.afterState.wholeUnits}</div>
                    <div>Portions: {preview.afterState.portions}</div>
                    <div>Value: ฿{preview.afterState.value.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-3">Impact Analysis</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Portion Change:</span>
                    <span className={`font-medium ${preview.impact.portionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.impact.portionChange > 0 ? '+' : ''}{preview.impact.portionChange}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value Change:</span>
                    <span className={`font-medium ${preview.impact.valueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ฿{preview.impact.valueChange.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste Generated:</span>
                    <span className="font-medium">{preview.impact.wasteGenerated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Cost:</span>
                    <span className="font-medium">฿{preview.impact.conversionCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className={`font-medium ${preview.impact.efficiency > 0.9 ? 'text-green-600' : 'text-orange-600'}`}>
                      {(preview.impact.efficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Required:</span>
                    <span className="font-medium">{preview.impact.timeRequired}min</span>
                  </div>
                </div>

                {/* Efficiency Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Conversion Efficiency</span>
                    <span>{(preview.impact.efficiency * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={preview.impact.efficiency * 100} 
                    className={`h-2 ${preview.impact.efficiency > 0.9 ? 'bg-green-100' : 'bg-orange-100'}`}
                  />
                </div>
              </div>

              {/* Risks and Recommendations */}
              {(preview.risks.length > 0 || preview.recommendations.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preview.risks.length > 0 && (
                    <Alert className="border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertDescription>
                        <p className="font-medium text-orange-700 mb-1">Risks</p>
                        <ul className="text-sm space-y-1">
                          {preview.risks.map((risk, index) => (
                            <li key={index}>• {risk}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {preview.recommendations.length > 0 && (
                    <Alert className="border-blue-200">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertDescription>
                        <p className="font-medium text-blue-700 mb-1">Recommendations</p>
                        <ul className="text-sm space-y-1">
                          {preview.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={loading || validationErrors.length > 0}
              className="min-w-24"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : operationType === 'split' ? (
                <Scissors className="h-4 w-4 mr-2" />
              ) : (
                <Combine className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}