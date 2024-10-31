import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

// Mock data
const inventoryData = {
  totalStock: {
    onHand: 3300,
    onOrder: 500
  },
  locations: [
    {
      code: 'WH-001',
      name: 'Main Warehouse',
      type: 'Primary',
      onHand: 1500,
      onOrder: 500,
      minimum: 1000,
      maximum: 3000,
      reorderPoint: 1200,
      parLevel: 2000
    },
    {
      code: 'WH-002',
      name: 'Secondary Warehouse',
      type: 'Secondary',
      onHand: 1000,
      onOrder: 0,
      minimum: 800,
      maximum: 2000,
      reorderPoint: 1000,
      parLevel: 1500
    },
    {
      code: 'WH-003',
      name: 'Distribution Center',
      type: 'Distribution',
      onHand: 800,
      onOrder: 0,
      minimum: 500,
      maximum: 1500,
      reorderPoint: 600,
      parLevel: 1000
    }
  ],
  aggregateSettings: {
    minimum: 2300,
    maximum: 6500,
    reorderPoint: 2800,
    parLevel: 4500
  }
};

export default function ProductInventoryTab() {
  return (
    <div className="space-y-6">
      {/* Total Stock Summary */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-900">Total Stock Position</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-500">On Hand</label>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-right">
                {inventoryData.totalStock.onHand.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">On Order</label>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-right">
                {inventoryData.totalStock.onOrder.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium text-gray-900">Stock by Location</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="px-4 py-2 bg-gray-50 text-left">Location</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">On Hand</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">On Order</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">Minimum</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">Maximum</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">Reorder</th>
                  <th className="px-4 py-2 bg-gray-50 text-right">PAR</th>
                  <th className="px-4 py-2 bg-gray-50 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryData.locations.map((location) => {
                  const isLow = location.onHand < location.minimum;
                  const isHigh = location.onHand > location.maximum;
                  const needsReorder = location.onHand < location.reorderPoint;
                  
                  return (
                    <tr key={location.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.code}</div>
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.onHand.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.onOrder.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.minimum.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.maximum.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.reorderPoint.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {location.parLevel.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLow && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            Below Min
                          </span>
                        )}
                        {needsReorder && !isLow && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            Reorder
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            Over Max
                          </span>
                        )}
                        {!isLow && !isHigh && !needsReorder && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3 text-sm">Total All Locations</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.totalStock.onHand.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.totalStock.onOrder.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.aggregateSettings.minimum.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.aggregateSettings.maximum.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.aggregateSettings.reorderPoint.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {inventoryData.aggregateSettings.parLevel.toLocaleString()}
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Status Indicators</h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <span className="text-gray-600">Below Minimum Level</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                <span className="text-gray-600">Reorder Point Reached</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <span className="text-gray-600">Exceeds Maximum Level</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-gray-600">Normal Stock Level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}