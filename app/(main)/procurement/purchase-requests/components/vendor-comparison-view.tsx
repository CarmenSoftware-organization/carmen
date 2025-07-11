"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import StatusBadge from "@/components/ui/custom-status-badge"
import { getVendorOptionsForItem, getCurrentVendorOption, type ItemVendorOption } from "./item-vendor-data"

export default function VendorComparisonView({ 
  currentPricelistNumber,
  itemName,
  itemDescription,
  itemUnit,
  itemStatus,
  requestedQuantity,
  approvedQuantity
}: { 
  currentPricelistNumber?: string,
  itemName?: string,
  itemDescription?: string,
  itemUnit?: string,
  itemStatus?: string,
  requestedQuantity?: number,
  approvedQuantity?: number
}) {
  // Get item-specific vendor data or fall back to sample data
  const itemVendorData = itemName ? getVendorOptionsForItem(itemName) : null;
  const vendorOptions = itemVendorData?.vendorOptions || [];
  
  // Debug logging
  console.log('VendorComparisonView DEBUG:');
  console.log('- itemName:', itemName);
  console.log('- currentPricelistNumber:', currentPricelistNumber);
  console.log('- itemVendorData:', itemVendorData);
  console.log('- vendorOptions length:', vendorOptions.length);
  console.log('- vendorOptions:', vendorOptions);
  
  // Sample item data fallback
  const itemData = {
    name: itemName || "Organic Quinoa",
    description: itemDescription || "Premium organic white quinoa grains", 
    status: itemStatus || "Approved",
    requestedQuantity: requestedQuantity || 500,
    approvedQuantity: approvedQuantity || 450,
    unit: itemUnit || "Kg"
  }
  const renderRating = (rating: number) => {
    return (
      <div className="text-sm font-medium text-gray-800">
        {rating.toFixed(1)}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 bg-white/80 border border-gray-200 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{itemData.name}</h2>
            <p className="text-gray-500 text-xs">{itemData.description}</p>
            {currentPricelistNumber && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-500">Current:</span>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{currentPricelistNumber}</span>
              </div>
            )}
          </div>
          <StatusBadge status={itemData.status} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-gray-50/60 p-2 rounded border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requested</span>
            <div className="text-sm font-semibold text-gray-700">{itemData.requestedQuantity} {itemData.unit}</div>
          </div>
          <div className="bg-gray-50/60 p-2 rounded border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approved</span>
            <div className="text-sm font-semibold text-gray-700">{itemData.approvedQuantity} {itemData.unit}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700">Vendor</TableHead>
                <TableHead className="w-[80px] text-center font-semibold text-gray-700">Preferred</TableHead>
                <TableHead className="w-[80px] text-center font-semibold text-gray-700">Rating</TableHead>
                <TableHead className="font-semibold text-gray-700">Description</TableHead>
                <TableHead className="w-[140px] text-center font-semibold text-gray-700">Valid Period</TableHead>
                <TableHead className="font-semibold text-gray-700">Price List #</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Unit Price</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Min. Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorOptions.map((option, index) => {
                const isCurrentPricelist = currentPricelistNumber === option.priceListNumber;
                console.log('Comparing:', currentPricelistNumber, '===', option.priceListNumber, '=', isCurrentPricelist);
                const rowClassName = isCurrentPricelist 
                  ? "bg-blue-50 border-l-4 border-l-blue-500" 
                  : "opacity-70 hover:opacity-90";
                
                return (
                  <TableRow key={`${option.vendorId}-${option.priceListNumber}`} className={`${rowClassName} transition-colors`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`font-medium ${isCurrentPricelist ? 'text-gray-900' : 'text-gray-700'}`}>{option.vendorName}</div>
                        {isCurrentPricelist && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {option.isPreferred && (
                        <div className="flex justify-center">
                          <Check className={`w-5 h-5 ${isCurrentPricelist ? 'text-green-600' : 'text-gray-400'} bg-green-100 rounded-full p-1`} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center justify-center ${isCurrentPricelist ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-600'} font-semibold px-2 py-1 rounded text-sm min-w-[40px]`}>
                        {option.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${isCurrentPricelist ? 'text-gray-700' : 'text-gray-600'}`}>{option.priceListName}</div>
                      {option.notes && (
                        <div className={`text-xs mt-1 ${isCurrentPricelist ? 'text-gray-500' : 'text-gray-500'}`}>{option.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${isCurrentPricelist ? 'text-gray-900' : 'text-gray-600'}`}>{option.validFrom}</div>
                        <div className="text-xs text-gray-500 my-1">to</div>
                        <div className={`text-xs font-medium ${isCurrentPricelist ? 'text-gray-900' : 'text-gray-600'}`}>{option.validTo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-medium ${isCurrentPricelist ? 'text-gray-800' : 'text-gray-600'}`}>{option.priceListNumber}</span>
                        {isCurrentPricelist && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`${isCurrentPricelist ? 'font-semibold text-lg text-gray-900' : 'font-medium text-gray-700'}`}>${option.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">per {option.orderUnit}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-medium ${isCurrentPricelist ? 'text-gray-900' : 'text-gray-700'}`}>{option.minQuantity}</div>
                      <div className="text-xs text-gray-500">{option.orderUnit}</div>
                      {option.leadTime && (
                        <div className={`text-xs mt-1 ${isCurrentPricelist ? 'text-blue-600' : 'text-blue-500'}`}>{option.leadTime} days</div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-center items-center">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Current pricelist selection</span>
          </div>
        </div>
      </div>
    </>
  )
}