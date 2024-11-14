import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function StockMovementContent() {
  const [selectedMovement, setSelectedMovement] = useState(null);

  // Updated mock data to include extra costs
  const movements = [
    {
      id: 1,
      commitDate: '2024-01-15',
      postingDate: '2024-01-15',
      movementType: 'GOODS_RECEIPT',
      sourceDocument: 'GRN-2024-001',
      store: 'WH-001',
      status: 'Posted',
      items: [
        {
          id: 1,
          productName: 'Coffee mate 450 g.',
          sku: 'BEV-CM450-001',
          uom: 'Bag',
          beforeQty: 150,
          inQty: 50,
          outQty: 0,
          afterQty: 200,
          unitCost: 125.00,
          totalCost: 6250.00,
          extraCost: 312.50, // 5% of total cost as extra cost
          location: {
            type: 'INV',
            code: 'WH-001',
            name: 'Main Warehouse',
            displayType: 'Inventory'
          },
          lots: [
            {
              lotNo: 'L20240115-001',
              quantity: 30,
              uom: 'Bag',
              extraCost: 187.50 // Extra cost allocated to this lot
            },
            {
              lotNo: 'L20240115-002',
              quantity: 20,
              uom: 'Bag',
              extraCost: 125.00 // Extra cost allocated to this lot
            }
          ]
        },
        {
          id: 2,
          productName: 'Heineken Beer 330ml',
          sku: 'BEV-HB330-002',
          uom: 'Bottle',
          beforeQty: 350,
          inQty: 120,
          outQty: 0,
          afterQty: 470,
          unitCost: 85.00,
          totalCost: 10200.00,
          extraCost: 510.00, // 5% of total cost as extra cost
          location: {
            type: 'DIR',
            code: 'FB-001',
            name: 'Pool Bar',
            displayType: 'Direct'
          },
          lots: [
            {
              lotNo: 'L20240115-003',
              quantity: 120,
              uom: 'Bottle',
              extraCost: 510.00 // Extra cost allocated to this lot
            }
          ]
        }
      ],
      totals: {
        inQty: 170,
        outQty: 0,
        totalCost: 16450.00,
        extraCost: 822.50, // Total extra costs
        lotCount: 3
      },
      movement: {
        source: 'Supplier',
        sourceName: 'Thai Beverage Co.',
        destination: 'Multiple',
        destinationName: 'Multiple Locations',
        type: 'Stock Receipt'
      }
    }
  ];

  return (
    <div className="space-y-4 px-8">
      {/* Header with Add Item button on the right */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Stock Movements</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Print</Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="w-1/2">
          <Input
            placeholder="Search by location, product name, or lot number..."
            className="w-full"
          />
        </div>
      </div>

      {/* Movements Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movement Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">In</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Out</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map(movement => (
                  <React.Fragment key={movement.id}>
                    {/* Movement Header */}
                    <tr className="bg-gray-50">
                      <td colSpan={10} className="px-6 py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{movement.movementType}</span>
                            <span className="text-gray-400">|</span>
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
                    {movement.items.map(item => (
                      <React.Fragment key={item.id}>
                        {item.lots.map((lot, lotIndex) => (
                          <tr key={`${item.id}-${lot.lotNo}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {lotIndex === 0 ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-medium text-gray-900">{item.location.name}</div>
                                  <div className="flex gap-2 items-center">
                                    <div className="text-sm text-gray-500">{item.location.code}</div>
                                    <span className={`px-1.5 py-0.5 text-xs rounded ${
                                      item.location.type === 'INV' 
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {item.location.displayType}
                                    </span>
                                  </div>
                                </div>
                              ) : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {lotIndex === 0 ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                  <div className="text-sm text-gray-500">{item.sku}</div>
                                </div>
                              ) : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                Receipt
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{lot.lotNo}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.uom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 text-right">
                              {lot.quantity > 0 ? lot.quantity.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {lot.quantity < 0 ? Math.abs(lot.quantity).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.unitCost.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {(item.unitCost * lot.quantity).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {lot.extraCost.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* Movement Totals */}
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan={5} className="px-6 py-3 text-right">Totals:</td>
                      <td className="px-6 py-3 text-right text-green-700">{movement.totals.inQty.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">{movement.totals.outQty.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">-</td>
                      <td className="px-6 py-3 text-right">{movement.totals.totalCost.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">{movement.totals.extraCost.toLocaleString()}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StockMovementContent;