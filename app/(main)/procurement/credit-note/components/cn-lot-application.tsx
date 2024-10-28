'use client'

import { Box, Calculator, ChevronDown, Clock, CreditCard, Package, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CnLotApplication({ grnDetails = {} }) {
  const [selectedLots, setSelectedLots] = useState(['LOT001']);

  const getOrdinalValue = (number : any) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = number % 100;
    return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  return (
    <div className="space-y-6">
      {/* Product Information Section */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
          </div>
        </div> */}

        <div className="p-4">
          {/* Basic Product Details */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-500">Product Name</label>
              <div className="mt-1">
                <div className="text-sm font-medium">Product A - Standard Grade</div>
                <div className="text-xs text-gray-500 mt-1">Product Description: Standard Grade Raw Material</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Unit of Measure</label>
              <div className="mt-1">
                <div className="text-sm">Each</div>
                <div className="text-xs text-gray-500 mt-1">Base UOM: Each | Pack: 1</div>
              </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-500">GRN Number</label>
            <div className="mt-1 text-sm">{grnDetails.number}</div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-500">GRN Date</label>
            <div className="mt-1 text-sm">{grnDetails.date}</div>
            </div>
            
          </div>

          {/* Cost Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Cost Information
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs text-blue-700">Last Purchase Price</label>
                <div className="mt-1 text-sm font-medium">$50.00</div>
              </div>
              <div>
                <label className="block text-xs text-blue-700">Standard Cost</label>
                <div className="mt-1 text-sm font-medium">$48.50</div>
              </div>
              <div>
                <label className="block text-xs text-blue-700">Moving Average Cost</label>
                <div className="mt-1 text-sm font-medium">$49.25</div>
              </div>
            </div>
          </div>

          {/* GRN Details */}
          {/* <div className="mt-6 p-4 border-t">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">GRN Number</label>
                <div className="mt-1 text-sm">{grnDetails.number}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">GRN Date</label>
                <div className="mt-1 text-sm">{grnDetails.date}</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Reference Lot Section */}
      <Card className="space-y-6">
        <CardHeader>
          <CardTitle>Reference Lots</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot Number</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Original Qty</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>LOT001</TableCell>
                <TableCell>23-10-2024 14:30</TableCell>
                <TableCell>1000</TableCell>
                <TableCell>500</TableCell>
                <TableCell>$50.00</TableCell>
                <TableCell>18%</TableCell>
                <TableCell>Warehouse A - Rack 3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>LOT002</TableCell>
                <TableCell>23-10-2024 16:45</TableCell>
                <TableCell>800</TableCell>
                <TableCell>300</TableCell>
                <TableCell>$50.00</TableCell>
                <TableCell>18%</TableCell>
                <TableCell>Warehouse B - Rack 1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Lot Application */}
      <Card>
        <CardHeader>
          <CardTitle>Lot Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                onClick={() => {}}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Auto Apply
              </button>
              <button 
                className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center"
                onClick={() => {}}
              >
                <Calculator className="w-4 h-4 mr-1" />
                Calculate Impact
              </button>
            </div>
          </div>

          {/* Lot Application Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>Lot Number</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead>Tax Rate</TableHead>
                <TableHead className="text-right">Original Value</TableHead>
                <TableHead className="text-right">New Value</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">Tax Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Lot 1 */}
              <TableRow>
                <TableCell>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedLots.includes('LOT001')}
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">LOT001</div>
                  <div className="text-sm text-gray-500">23-10-2024 14:30</div>
                  <div className="text-sm text-gray-500">{getOrdinalValue(1)} Receipt</div>
                  <div className="text-sm text-gray-500">Warehouse A - Rack 3</div>
                </TableCell>
                <TableCell>500</TableCell>
                <TableCell>18%</TableCell>
                <TableCell className="text-right">$25,000.00</TableCell>
                <TableCell className="text-right">$22,500.00</TableCell>
                <TableCell className="text-right text-red-600">-$2,500.00</TableCell>
                <TableCell className="text-right text-red-600">-$450.00</TableCell>
              </TableRow>

              {/* Lot 2 */}
              <TableRow>
                <TableCell>
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedLots.includes('LOT002')}
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">LOT002</div>
                  <div className="text-sm text-gray-500">23-10-2024 16:45</div>
                  <div className="text-sm text-gray-500">{getOrdinalValue(2)} Receipt</div>
                  <div className="text-sm text-gray-500">Warehouse B - Rack 1</div>
                </TableCell>
                <TableCell>300</TableCell>
                <TableCell>18%</TableCell>
                <TableCell className="text-right">$15,000.00</TableCell>
                <TableCell className="text-right">$13,500.00</TableCell>
                <TableCell className="text-right text-red-600">-$1,500.00</TableCell>
                <TableCell className="text-right text-red-600">-$270.00</TableCell>
              </TableRow>
            </TableBody>
            <tfoot>
              <TableRow>
                <TableCell colSpan={3} className="font-medium">
                  Total Impact
                </TableCell>
                <TableCell className="text-right font-medium">$40,000.00</TableCell>
                <TableCell className="text-right font-medium">$36,000.00</TableCell>
                <TableCell className="text-right font-medium text-red-600">-$4,000.00</TableCell>
                <TableCell className="text-right font-medium text-red-600">-$720.00</TableCell>
              </TableRow>
            </tfoot>
          </Table>

          {/* Summary Calculations */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Application Summary</h4>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="block text-xs text-gray-500">Applied To</label>
                <div className="mt-1 text-sm font-medium">2 Lots</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Total Quantity</label>
                <div className="mt-1 text-sm font-medium">
                  800 units
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Base Impact</label>
                <div className="mt-1 text-sm font-medium text-red-600">-$4,000.00</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Total Impact</label>
                <div className="mt-1 text-sm font-medium text-red-600">-$4,720.00</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}