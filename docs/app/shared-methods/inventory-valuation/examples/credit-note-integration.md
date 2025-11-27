# Credit Note Integration - Complete Example

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## Overview

This example demonstrates how to integrate the centralized Inventory Valuation Service into credit note processing for accurate return costing.

## Use Case

When processing a credit note (vendor return), we need to calculate the cost of returned inventory based on the system's configured costing method (FIFO or Periodic Average).

## Step-by-Step Integration

### Step 1: Import Required Services

```typescript
// File: app/(main)/procurement/credit-note/components/inventory.tsx

import { InventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { InventorySettingsService } from '@/lib/services/settings/inventory-settings-service'
import type { CreditNote, CreditNoteItem } from '@/lib/types'
```

### Step 2: Initialize Services

```typescript
const valuationService = new InventoryValuationService()
const settingsService = new InventorySettingsService()
```

### Step 3: Get System Costing Method

```typescript
async function getCostingMethod(): Promise<'FIFO' | 'PERIODIC_AVERAGE'> {
  const method = await settingsService.getDefaultCostingMethod()
  return method
}
```

### Step 4: Calculate Credit Note Item Cost

```typescript
async function calculateCreditNoteItemCost(
  item: CreditNoteItem,
  creditNoteDate: Date
): Promise<CreditNoteItemCost> {
  try {
    // Call centralized valuation service
    const valuation = await valuationService.calculateInventoryValuation(
      item.itemId,
      item.quantity,
      creditNoteDate
    )

    return {
      itemId: item.itemId,
      quantity: item.quantity,
      unitCost: valuation.unitCost,
      totalCost: valuation.totalValue,
      method: valuation.method,

      // FIFO-specific data
      layersConsumed: valuation.layersConsumed,

      // Periodic Average-specific data
      period: valuation.period,
      averageCost: valuation.averageCost,

      calculatedAt: valuation.calculatedAt
    }
  } catch (error) {
    console.error('Cost calculation failed:', error)
    throw new Error(`Unable to calculate cost for item ${item.itemId}`)
  }
}
```

### Step 5: Display Cost Information in UI

#### Component Structure

```typescript
'use client'

import { useState, useEffect } from 'react'
import { CostingMethod } from '@/lib/types'

interface CreditNoteCostDisplayProps {
  creditNote: CreditNote
  items: CreditNoteItem[]
}

export function CreditNoteCostDisplay({
  creditNote,
  items
}: CreditNoteCostDisplayProps) {
  const [costingMethod, setCostingMethod] = useState<CostingMethod>('FIFO')
  const [itemCosts, setItemCosts] = useState<Map<string, CreditNoteItemCost>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCosts() {
      setLoading(true)

      // Get costing method
      const method = await getCostingMethod()
      setCostingMethod(method)

      // Calculate costs for all items
      const costs = new Map()
      for (const item of items) {
        const cost = await calculateCreditNoteItemCost(item, creditNote.date)
        costs.set(item.itemId, cost)
      }

      setItemCosts(costs)
      setLoading(false)
    }

    loadCosts()
  }, [creditNote, items])

  if (loading) {
    return <div>Calculating costs...</div>
  }

  return (
    <div className="space-y-4">
      {/* Costing Method Indicator */}
      <CostingMethodBadge method={costingMethod} />

      {/* Item Costs Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Quantity</th>
              <th className="p-2 text-right">Unit Cost</th>
              <th className="p-2 text-right">Total Cost</th>
              {costingMethod === 'FIFO' && (
                <th className="p-2 text-left">Layers</th>
              )}
              {costingMethod === 'PERIODIC_AVERAGE' && (
                <th className="p-2 text-left">Period</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const cost = itemCosts.get(item.itemId)
              if (!cost) return null

              return (
                <tr key={item.itemId} className="border-t">
                  <td className="p-2">{item.itemName}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">${cost.unitCost.toFixed(4)}</td>
                  <td className="p-2 text-right">${cost.totalCost.toFixed(2)}</td>

                  {costingMethod === 'FIFO' && (
                    <td className="p-2">
                      <FIFOLayersDisplay layers={cost.layersConsumed} />
                    </td>
                  )}

                  {costingMethod === 'PERIODIC_AVERAGE' && (
                    <td className="p-2">
                      {cost.period && formatPeriod(cost.period)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Total Summary */}
      <div className="flex justify-end">
        <div className="text-lg font-semibold">
          Total Credit: ${calculateTotalCost(itemCosts).toFixed(2)}
        </div>
      </div>
    </div>
  )
}
```

#### Costing Method Badge Component

```typescript
function CostingMethodBadge({ method }: { method: CostingMethod }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <InfoIcon className="h-5 w-5 text-blue-600" />
      <div>
        <div className="font-medium text-sm">
          Costing Method: {method === 'FIFO' ? 'FIFO (First-In-First-Out)' : 'Periodic Average'}
        </div>
        <div className="text-xs text-muted-foreground">
          {method === 'FIFO'
            ? 'Using oldest inventory layers first'
            : 'Using monthly average cost'}
        </div>
      </div>
    </div>
  )
}
```

#### FIFO Layers Display

```typescript
function FIFOLayersDisplay({
  layers
}: {
  layers?: FIFOLayerConsumption[]
}) {
  if (!layers || layers.length === 0) {
    return <span className="text-muted-foreground text-sm">No layers</span>
  }

  return (
    <div className="space-y-1">
      {layers.map((layer, index) => (
        <div key={layer.layerId} className="text-xs">
          <span className="font-medium">{layer.lotNumber}</span>
          {': '}
          <span>{layer.quantityConsumed} units @ ${layer.unitCost.toFixed(4)}</span>
          {' = '}
          <span className="font-semibold">${layer.totalCost.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
```

#### Period Display (Periodic Average)

```typescript
function formatPeriod(period: Date): string {
  return period.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}
```

### Step 6: Save Credit Note with Calculated Costs

```typescript
async function saveCreditNote(creditNote: CreditNote, items: CreditNoteItem[]) {
  // Calculate costs for all items
  const itemsWithCosts = await Promise.all(
    items.map(async (item) => {
      const cost = await calculateCreditNoteItemCost(item, creditNote.date)

      return {
        ...item,
        unitCost: cost.unitCost,
        totalCost: cost.totalCost,
        costingMethod: cost.method,

        // Store method-specific data
        ...(cost.method === 'FIFO' && {
          layersConsumed: cost.layersConsumed
        }),
        ...(cost.method === 'PERIODIC_AVERAGE' && {
          period: cost.period,
          averageCost: cost.averageCost
        })
      }
    })
  )

  // Calculate total
  const totalCost = itemsWithCosts.reduce((sum, item) => sum + item.totalCost, 0)

  // Save to database
  const saved = await db.creditNote.create({
    data: {
      ...creditNote,
      totalCost,
      items: {
        create: itemsWithCosts
      }
    }
  })

  return saved
}
```

## Complete Working Example

### Component File

```typescript
// app/(main)/procurement/credit-note/components/credit-note-cost-calculator.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { InventorySettingsService } from '@/lib/services/settings/inventory-settings-service'
import type { CreditNote, CreditNoteItem, CostingMethod } from '@/lib/types'

interface Props {
  creditNote: CreditNote
  items: CreditNoteItem[]
  onCostsCalculated: (costs: Map<string, number>) => void
}

export function CreditNoteCostCalculator({ creditNote, items, onCostsCalculated }: Props) {
  const [costingMethod, setCostingMethod] = useState<CostingMethod>('FIFO')
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateAllCosts = async () => {
    setCalculating(true)
    setError(null)

    try {
      // Initialize services
      const valuationService = new InventoryValuationService()
      const settingsService = new InventorySettingsService()

      // Get costing method
      const method = await settingsService.getDefaultCostingMethod()
      setCostingMethod(method)

      // Calculate costs for all items
      const costsMap = new Map<string, number>()

      for (const item of items) {
        const valuation = await valuationService.calculateInventoryValuation(
          item.itemId,
          item.quantity,
          creditNote.date
        )

        costsMap.set(item.itemId, valuation.totalValue)
      }

      // Callback with results
      onCostsCalculated(costsMap)

    } catch (err) {
      console.error('Cost calculation failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setCalculating(false)
    }
  }

  useEffect(() => {
    if (items.length > 0) {
      calculateAllCosts()
    }
  }, [creditNote.id, items])

  if (calculating) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Calculating costs using {costingMethod}...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive">
        <div className="text-destructive">
          <AlertTriangleIcon className="h-4 w-4 inline mr-2" />
          Error: {error}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={calculateAllCosts}
        >
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
        <span className="font-medium">
          Costs calculated using {costingMethod}
        </span>
      </div>
    </Card>
  )
}
```

### Usage in Parent Component

```typescript
// app/(main)/procurement/credit-note/[id]/page.tsx

import { CreditNoteCostCalculator } from '../components/credit-note-cost-calculator'

export default function CreditNotePage({ params }: { params: { id: string } }) {
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null)
  const [items, setItems] = useState<CreditNoteItem[]>([])
  const [costs, setCosts] = useState<Map<string, number>>(new Map())

  const handleCostsCalculated = (calculatedCosts: Map<string, number>) => {
    setCosts(calculatedCosts)
    console.log('Costs calculated:', calculatedCosts)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1>Credit Note #{creditNote?.creditNoteNumber}</h1>

      {/* Cost Calculator Component */}
      {creditNote && items.length > 0 && (
        <CreditNoteCostCalculator
          creditNote={creditNote}
          items={items}
          onCostsCalculated={handleCostsCalculated}
        />
      )}

      {/* Rest of credit note form */}
      {/* ... */}
    </div>
  )
}
```

## Error Handling

### Handle Missing Receipts (Periodic Average)

```typescript
try {
  const valuation = await valuationService.calculateInventoryValuation(
    itemId,
    quantity,
    date
  )
} catch (error) {
  if (error.code === 'VAL_NO_RECEIPTS') {
    // Show warning to user
    toast.warning(
      `No receipts found for ${formatPeriod(date)}. Using fallback cost.`
    )

    // Use fallback cost (e.g., standard cost)
    const fallbackCost = item.standardCost || 0
    // ... use fallback
  } else {
    throw error
  }
}
```

### Handle Insufficient FIFO Layers

```typescript
try {
  const valuation = await valuationService.calculateInventoryValuation(
    itemId,
    quantity,
    date
  )
} catch (error) {
  if (error.code === 'VAL_INSUFFICIENT_LAYERS') {
    // Show error to user
    toast.error(
      `Insufficient inventory layers for ${item.itemName}. Check GRN receipts.`
    )

    // Prevent credit note from being saved
    return false
  }
}
```

## Testing

### Unit Test Example

```typescript
// __tests__/components/credit-note-cost-calculator.test.ts

import { render, waitFor } from '@testing-library/react'
import { CreditNoteCostCalculator } from '@/app/(main)/procurement/credit-note/components/credit-note-cost-calculator'
import { InventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { InventorySettingsService } from '@/lib/services/settings/inventory-settings-service'

// Mock services
jest.mock('@/lib/services/db/inventory-valuation-service')
jest.mock('@/lib/services/settings/inventory-settings-service')

describe('CreditNoteCostCalculator', () => {
  it('should calculate costs using FIFO method', async () => {
    // Setup mocks
    const mockSettings = new InventorySettingsService()
    mockSettings.getDefaultCostingMethod = jest.fn().mockResolvedValue('FIFO')

    const mockValuation = new InventoryValuationService()
    mockValuation.calculateInventoryValuation = jest.fn().mockResolvedValue({
      itemId: 'ITEM-1',
      quantity: 100,
      unitCost: 10.50,
      totalValue: 1050.00,
      method: 'FIFO',
      layersConsumed: [
        { layerId: 'L1', lotNumber: 'LOT001', quantityConsumed: 100, unitCost: 10.50, totalCost: 1050 }
      ]
    })

    const creditNote = { id: 'CN-1', date: new Date('2025-01-15') }
    const items = [{ itemId: 'ITEM-1', quantity: 100, itemName: 'Test Item' }]
    const onCostsCalculated = jest.fn()

    // Render component
    const { getByText } = render(
      <CreditNoteCostCalculator
        creditNote={creditNote}
        items={items}
        onCostsCalculated={onCostsCalculated}
      />
    )

    // Wait for calculation
    await waitFor(() => {
      expect(getByText(/Costs calculated using FIFO/)).toBeInTheDocument()
    })

    // Verify callback called with correct costs
    expect(onCostsCalculated).toHaveBeenCalledWith(
      new Map([['ITEM-1', 1050.00]])
    )
  })
})
```

---

## Summary

This integration example demonstrates:

✅ How to import and initialize the centralized valuation service
✅ How to retrieve the system costing method
✅ How to calculate credit note item costs
✅ How to display costs based on the costing method (FIFO vs Periodic Average)
✅ How to handle errors gracefully
✅ How to test the integration

**Key Benefits**:
- **Centralized logic**: All costing calculations in one service
- **Consistency**: Same method across all credit notes
- **Flexibility**: Easily switch between FIFO and Periodic Average
- **Maintainability**: Update costing logic in one place

---

**Version**: 1.0
**Last Updated**: 2025-11-02
**Maintained By**: Architecture Team
