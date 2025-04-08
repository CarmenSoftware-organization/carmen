"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Warehouse, Store } from 'lucide-react'

interface Location {
  type: 'INV' | 'DIR'
  code: string
  name: string
  displayType: string
}

interface Lot {
  lotNo: string
  quantity: number
  uom: string
  totalCost: number
  extraCost: number
}

interface StockMovementItem {
  id: number
  productName: string
  sku: string
  uom: string
  beforeQty: number
  inQty: number
  outQty: number
  afterQty: number
  unitCost: number
  totalCost: number
  location: Location
  lots: Lot[]
}

interface MovementTotals {
  inQty: number
  outQty: number
  totalCost: number
  extraCost: number
  lotCount: number
}

interface MovementInfo {
  source: string
  sourceName: string
  destination: string
  destinationName: string
  type: string
}

interface StockMovement {
  id: number
  commitDate: string
  postingDate: string
  movementType: string
  sourceDocument: string
  store: string
  status: string
  items: StockMovementItem[]
  totals: MovementTotals
  movement: MovementInfo
}

interface StockMovementContentProps {
  onAddItem?: () => void
  onFilter?: () => void
  onPrint?: () => void
  onSearch?: (query: string) => void
}

// Mock data moved outside component
const mockMovements: StockMovement[] = [
  {
    id: 1,
    commitDate: '2024-01-15',
    postingDate: '2024-01-15', 
    movementType: 'CREDIT_NOTE',
    sourceDocument: 'CN-2024-001',
    store: 'WH-001',
    status: 'Posted',
    items: [
      {
        id: 1,
        productName: 'Coffee mate 450 g.',
        sku: 'BEV-CM450-001',
        uom: 'Bag',
        beforeQty: 200,
        inQty: 0,
        outQty: 50, // Negative for credit note returns
        afterQty: 150,
        unitCost: 125.00,
        totalCost: -6250.00, // Negative cost for returns
        location: {
          type: 'INV',
          code: 'WH-001',
          name: 'Main Warehouse',
          displayType: 'Inventory'
        },
        lots: [
          {
            lotNo: 'L20240115-001',
            quantity: -30, // Negative quantities for returns
            uom: 'Bag',
            totalCost: -3750.00,
            extraCost: 0
          },
          {
            lotNo: 'L20240115-002',
            quantity: -20,
            uom: 'Bag',
            totalCost: -2500.00,
            extraCost: 0
          }
        ]
      },
      {
        id: 2,
        productName: 'Heineken Beer 330ml',
        sku: 'BEV-HB330-002', 
        uom: 'Bottle',
        beforeQty: 470,
        inQty: 0,
        outQty: 120,
        afterQty: 350,
        unitCost: 85.00,
        totalCost: -10200.00,
        location: {
          type: 'DIR',
          code: 'FB-001',
          name: 'Pool Bar',
          displayType: 'Direct'
        },
        lots: [
          {
            lotNo: 'L20240115-003',
            quantity: -120,
            uom: 'Bottle',
            totalCost: -10200.00,
            extraCost: 0
          }
        ]
      },
      {
        id: 3,
        productName: 'Bath Towel Premium White',
        sku: 'HK-BT700-001',
        uom: 'Piece', 
        beforeQty: 250,
        inQty: 0,
        outQty: 50,
        afterQty: 200,
        unitCost: 450.00,
        totalCost: -22500.00,
        location: {
          type: 'DIR',
          code: 'HK-001',
          name: 'Housekeeping Store',
          displayType: 'Direct'
        },
        lots: [
          {
            lotNo: 'L20240115-004',
            quantity: -50,
            uom: 'Piece',
            totalCost: -22500.00,
            extraCost: 0
          }
        ]
      }
    ],
    totals: {
      inQty: 0,
      outQty: 220,
      totalCost: -38950.00, // Negative total cost
      extraCost: 0,
      lotCount: 4
    },
    movement: {
      source: 'Multiple',
      sourceName: 'Multiple Locations',
      destination: 'Supplier',
      destinationName: 'Thai Beverage Co.',
      type: 'Stock Return'
    }
  }
]

export function StockMovementContent({ 
  onAddItem,
  onFilter,
  onPrint,
  onSearch
}: StockMovementContentProps): React.ReactNode {
  const getLocationIcon = (type: 'INV' | 'DIR'): React.ReactNode => {
    return type === 'INV' ? <Warehouse className="h-4 w-4" /> : <Store className="h-4 w-4" />
  }

  const getLocationTypeLabel = (type: 'INV' | 'DIR'): string => {
    return type === 'INV' ? 'Inventory' : 'Consignment'
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearch?.(e.target.value)
  }

  return (
    <div className="space-y-4 px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Stock Movements</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onFilter}
            >
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPrint}
            >
              Print
            </Button>
          </div>
        </div>
        <Button 
          variant="default" 
          size="sm"
          onClick={onAddItem}
        >
          + Add Item
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-1/2">
          <Input
            placeholder="Search by location, product name, or lot number..."
            className="w-full"
            onChange={handleSearch}
          />
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot No.
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16"></div>
                        <span>STOCK</span>
                        <div className="w-16"></div>
                      </div>
                      <div className="flex justify-end gap-2 w-full border-t pt-1">
                        <div className="w-16 text-center">In</div>
                        <div className="w-16 text-center">Out</div>
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockMovements.map(movement => (
                  <React.Fragment key={movement.id}>
                    {/* Movement Header */}
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-2 py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">{movement.sourceDocument}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{movement.commitDate}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.movement.source} → {movement.movement.destination}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Movement Items */}
                    {movement.items.filter(item => ['INV', 'CON'].includes(item.location.type)).map(item => (
                      <React.Fragment key={item.id}>
                        {item.lots.map((lot, lotIndex) => (
                          <tr key={`${item.id}-${lot.lotNo}`} className="hover:bg-gray-50">
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.location.type === 'INV' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.location.name}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>{item.location.code}</span>
                                  <span className="text-gray-300">|</span>
                                  <div className="flex items-center gap-0.5">
                                    {getLocationIcon(item.location.type)}
                                    <span>{getLocationTypeLabel(item.location.type)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <div className="text-sm text-gray-900">
                                  {item.productName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.sku}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{lot.lotNo}</div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.uom}
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex justify-end gap-2">
                                <div className="w-16 text-center">
                                  {lot.quantity > 0 ? lot.quantity.toLocaleString() : '-'}
                                </div>
                                <div className="w-16 text-center">
                                  {lot.quantity < 0 ? Math.abs(lot.quantity).toLocaleString() : '-'}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {((lot.totalCost || 0) / (lot.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {(lot.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* Totals */}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        Total Items: {mockMovements.length}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex justify-end gap-2">
                          <div className="w-16 text-center">
                            {mockMovements.reduce((sum, m) => sum + (m.totals.inQty > 0 ? m.totals.inQty : 0), 0).toLocaleString()}
                          </div>
                          <div className="w-16 text-center">
                            {mockMovements.reduce((sum, m) => sum + (m.totals.outQty > 0 ? m.totals.outQty : 0), 0).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {mockMovements.reduce((sum, m) => sum + m.totals.totalCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {mockMovements.reduce((sum, m) => sum + m.totals.totalCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Total Stock In</div>
            <div className="text-2xl font-bold text-gray-900">
              +{movements.reduce((sum, m) => sum + m.totals.inQty, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Total Stock Out</div>
            <div className="text-2xl font-bold text-gray-900">
              {movements.reduce((sum, m) => sum + m.totals.outQty, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Total Cost</div>
            <div className="text-2xl font-bold">
              ${movements.reduce((sum, m) => sum + m.totals.totalCost, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-500">Total Lots</div>
            <div className="text-2xl font-bold">
              {movements.reduce((sum, m) => sum + m.totals.lotCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

export default StockMovementContent;