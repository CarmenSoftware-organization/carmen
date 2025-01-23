'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Warehouse, Store } from 'lucide-react';

interface StockMovement {
  id: number;
  lotNo: string;
  location: string;
  locationCode: string;
  locationType: string;
  product: string;
  productDescription: string;
  unit: string;
  quantity: number;
  subtotal: number;
  extraCost: number;
}

export default function StockMovementContent() {
  const movements: StockMovement[] = [
    {
      id: 1,
      lotNo: 'L20240115-001',
      location: 'Main Warehouse',
      locationCode: 'WH-MAIN',
      locationType: 'INV',
      product: 'Rice Jasmine 5kg',
      productDescription: 'Premium grade Thai jasmine rice, vacuum sealed',
      unit: 'Bag',
      quantity: 100,
      subtotal: 25000.00,
      extraCost: 500.00
    },
    {
      id: 2,
      lotNo: 'L20240115-002',
      location: 'Main Warehouse',
      locationCode: 'WH-MAIN',
      locationType: 'INV',
      product: 'Rice Jasmine 5kg',
      productDescription: 'Premium grade Thai jasmine rice, vacuum sealed',
      unit: 'Bag',
      quantity: 50,
      subtotal: 12500.00,
      extraCost: 250.00
    },
    {
      id: 3,
      lotNo: 'L20240115-003',
      location: 'Store 1',
      locationCode: 'ST-001',
      locationType: 'CON',
      product: 'Cooking Oil 2L',
      productDescription: 'Pure vegetable cooking oil, cholesterol-free',
      unit: 'Bottle',
      quantity: 200,
      subtotal: 16000.00,
      extraCost: 400.00
    }
  ];

  const totals = {
    quantity: movements.reduce((sum, m) => sum + m.quantity, 0),
    subtotal: movements.reduce((sum, m) => sum + m.subtotal, 0),
    extraCost: movements.reduce((sum, m) => sum + m.extraCost, 0)
  };

  const getLocationIcon = (type: string) => {
    return type === 'INV' ? <Warehouse className="h-4 w-4" /> : <Store className="h-4 w-4" />;
  };

  const getLocationTypeLabel = (type: string) => {
    return type === 'INV' ? 'Inventory' : 'Consignment';
  };

  return (
    <div className="space-y-4 px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Stock Movement</h2>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot No.
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Cost
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.locationType === 'INV' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {movement.location}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{movement.locationCode}</span>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-0.5">
                            {getLocationIcon(movement.locationType)}
                            <span>{getLocationTypeLabel(movement.locationType)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">
                          {movement.product}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movement.productDescription}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.lotNo}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.unit}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex justify-end gap-2">
                        <div className="w-16 text-center">
                          {movement.quantity > 0 ? movement.quantity.toLocaleString() : '-'}
                        </div>
                        <div className="w-16 text-center">
                          {movement.quantity < 0 ? Math.abs(movement.quantity).toLocaleString() : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col items-end">
                        <div>
                          {(movement.subtotal / movement.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {movement.extraCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {(movement.subtotal + movement.extraCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    Total Items: {movements.length}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex justify-end gap-2">
                      <div className="w-16 text-center">
                        {movements.reduce((sum, m) => sum + (m.quantity > 0 ? m.quantity : 0), 0).toLocaleString()}
                      </div>
                      <div className="w-16 text-center">
                        {movements.reduce((sum, m) => sum + (m.quantity < 0 ? Math.abs(m.quantity) : 0), 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {totals.extraCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(totals.subtotal + totals.extraCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}