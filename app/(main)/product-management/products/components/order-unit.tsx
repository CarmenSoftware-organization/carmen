import React, { useState } from 'react';
import { Scale, Plus, Pencil, Save, X, AlertCircle, TrashIcon } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

const productInfo = {
  code: 'PRD001',
  name: 'Product A - Standard Grade',
  inventoryUnit: 'EACH',
  orderUnits: [
    {
      orderUnit: 'BOX',
      factor: 24,
      description: 'Standard Box',
      weight: 12.5,
      weightUnit: 'KG',
      dimensions: '40x30x20',
      barcode: '12345678',
      isDefault: true
    },
    {
      orderUnit: 'CASE',
      factor: 144,
      description: 'Full Case',
      weight: 75.0,
      weightUnit: 'KG',
      dimensions: '120x80x100',
      barcode: '87654321',
      isDefault: false
    },
    {
      orderUnit: 'PALLET',
      factor: 1728,
      description: 'Standard Pallet',
      weight: 900.0,
      weightUnit: 'KG',
      dimensions: '120x100x150',
      barcode: '11223344',
      isDefault: false
    }
  ]
};

export default function OrderUnitTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);

  const handleDefaultChange = (orderUnit: string, checked: boolean) => {
    // Here you would update the state and make an API call
    console.log(`Setting ${orderUnit} as default: ${checked}`);
  };

  const handleDeleteUnit = (unitCode: string) => {
    if (!isEditing) return;
    if (window.confirm('Are you sure you want to delete this unit?')) {
      // Here you would make an API call to delete the unit
      console.log(`Deleting unit: ${unitCode}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-900">Order Units</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Inventory Unit:</span>
              <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {productInfo.inventoryUnit}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-500">Product Code</label>
              <div className="mt-1 text-sm font-medium">{productInfo.code}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Product Name</label>
              <div className="mt-1 text-sm font-medium">{productInfo.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Units Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">Order Units</h3>
          <div className="flex items-center space-x-4">
            <button
              className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Order Unit
            </button>
            <button
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-left bg-gray-50">Order Unit</th>
                <th className="px-4 py-2 text-right bg-gray-50">Factor</th>
                <th className="px-4 py-2 text-left bg-gray-50">Description</th>
                <th className="px-4 py-2 text-right bg-gray-50">Weight</th>
                <th className="px-4 py-2 text-left bg-gray-50">Dimensions</th>
                <th className="px-4 py-2 text-left bg-gray-50">Barcode</th>
                <th className="px-4 py-2 text-center bg-gray-50">Default</th>
                <th className="px-4 py-2 text-right bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productInfo.orderUnits.map((unit) => (
                <tr key={unit.orderUnit} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {unit.orderUnit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-1">
                      <span className="text-sm tabular-nums text-right">
                        {unit.factor.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {productInfo.inventoryUnit}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{unit.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm tabular-nums text-right block">
                      {unit.weight} {unit.weightUnit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{unit.dimensions}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-500">{unit.barcode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={unit.isDefault}
                        onCheckedChange={(checked) => handleDefaultChange(unit.orderUnit, checked as boolean)}
                        disabled={!isEditing}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end space-x-2">
                      {isEditing && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUnit(unit.orderUnit)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Calculator */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-900">Order Quantity Calculator</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Order Qty</label>
              <input
                type="number"
                className="w-32 p-2 border rounded-lg text-right"
                defaultValue="1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Order Unit</label>
              <select className="w-32 p-2 border rounded-lg">
                {productInfo.orderUnits.map(unit => (
                  <option key={unit.orderUnit} value={unit.orderUnit}>
                    {unit.orderUnit}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <span className="text-gray-500">=</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Inventory Quantity</label>
              <div className="text-lg font-medium tabular-nums">
                24 {productInfo.inventoryUnit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Order Unit Information</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Order units are used for purchasing and receiving</li>
              <li>• Default order unit will be used for automatic PO generation</li>
              <li>• Factor shows how many inventory units are in one order unit</li>
              <li>• Weight and dimensions are used for shipping calculations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}