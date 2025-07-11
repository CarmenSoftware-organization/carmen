"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/custom-dialog"
import StatusBadge from "@/components/ui/custom-status-badge"
import { getVendorOptionsForItem, getCurrentVendorOption, type ItemVendorOption } from "./item-vendor-data"

export default function VendorComparison({ 
  currentPricelistNumber, 
  selectedVendor, 
  onPricelistSelect,
  itemName,
  itemDescription,
  itemUnit,
  itemStatus,
  requestedQuantity,
  approvedQuantity
}: { 
  currentPricelistNumber?: string, 
  selectedVendor?: string,
  onPricelistSelect?: (vendor: string, pricelistNumber: string, unitPrice: number) => void,
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
  
  // Sample item data fallback
  const itemData = {
    name: itemName || "Organic Quinoa",
    description: itemDescription || "Premium organic white quinoa grains", 
    status: itemStatus || "Approved",
    requestedQuantity: requestedQuantity || 500,
    approvedQuantity: approvedQuantity || 450,
    unit: itemUnit || "Kg"
  }
  
  // Filter vendor options based on context:
  // - If onPricelistSelect is provided (purchasing mode): show all vendor options for selection
  // - If selectedVendor is provided (expanded panel view): show only that vendor's options
  // - Otherwise: show all vendor options for comparison
  const filteredVendorOptions = onPricelistSelect 
    ? vendorOptions // Purchasing mode: show all vendor options for selection
    : selectedVendor 
    ? vendorOptions.filter(option => option.vendorName === selectedVendor)
    : vendorOptions
  const [newVendor, setNewVendor] = useState({
    name: "",
    rating: "",
    priceName: "",
    unitPrice: "",
    minQuantity: "",
    orderUnit: "pcs",
    priceListNumber: "",
    validFrom: "",
    validTo: "",
  })
  const [selectedPricelist, setSelectedPricelist] = useState<string | null>(currentPricelistNumber || null)

  const renderRating = (rating: number) => {
    return (
      <div className="text-sm font-medium text-gray-800">
        {rating.toFixed(1)}
      </div>
    )
  }

  const handleAddNewVendor = () => {
    if (newVendor.name && newVendor.rating && newVendor.priceName && newVendor.unitPrice && newVendor.minQuantity && newVendor.priceListNumber && newVendor.validFrom && newVendor.validTo) {
      // Note: This would need to be integrated with the item-vendor-data system
      // For now, this is a placeholder for adding new vendor options
      console.log("Add new vendor option:", newVendor);
      setNewVendor({
        name: "",
        rating: "",
        priceName: "",
        unitPrice: "",
        minQuantity: "",
        orderUnit: "pcs",
        priceListNumber: "",
        validFrom: "",
        validTo: "",
      })
    }
  }

  const handlePricelistSelection = (priceListNumber: string) => {
    setSelectedPricelist(prevSelected => prevSelected === priceListNumber ? null : priceListNumber)
  }

  const handleCancelSelection = () => {
    setSelectedPricelist(null)
  }

  const handleSelectPricelist = () => {
    if (selectedPricelist && onPricelistSelect) {
      // Find the selected vendor option
      const selectedOption = filteredVendorOptions.find(option => option.priceListNumber === selectedPricelist);

      if (selectedOption) {
        onPricelistSelect(
          selectedOption.vendorName,
          selectedOption.priceListNumber,
          selectedOption.unitPrice
        );
      }
    }
  }

  return (
    <>
      <div className="mb-4 bg-white/80 border border-gray-200 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{itemData.name}</h2>
            <p className="text-gray-500 text-xs">{itemData.description}</p>
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

      {/* Price History Section */}
      <div className="mb-4 bg-blue-50/50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Price History</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/80 p-2 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Vendor</span>
            <div className="text-sm font-medium text-gray-900 mt-0.5">Seasonal Gourmet Supplies</div>
          </div>
          <div className="bg-white/80 p-2 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Purchase Date</span>
            <div className="text-sm font-medium text-gray-900 mt-0.5">15/02/2024</div>
          </div>
          <div className="bg-white/80 p-2 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Price</span>
            <div className="text-sm font-medium text-gray-900 mt-0.5">$4,150.00</div>
          </div>
          <div className="bg-white/80 p-2 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Unit</span>
            <div className="text-sm font-medium text-gray-900 mt-0.5">kg</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[60px] text-center font-semibold text-gray-700">Select</TableHead>
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
              {filteredVendorOptions.map((option, index) => {
                const isCurrentPricelist = currentPricelistNumber === option.priceListNumber;
                const isSelected = selectedPricelist === option.priceListNumber;
                const rowClassName = isCurrentPricelist 
                  ? "bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100" 
                  : isSelected 
                  ? "bg-green-50 border-l-4 border-l-green-500 hover:bg-green-100" 
                  : "hover:bg-gray-50";
                
                return (
                  <TableRow key={`${option.vendorId}-${option.priceListNumber}`} className={`${rowClassName} transition-colors`}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePricelistSelection(option.priceListNumber)}
                        className="mx-auto"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{option.vendorName}</div>
                        {isCurrentPricelist && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {option.isPreferred && (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-600 bg-green-100 rounded-full p-1" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-semibold px-2 py-1 rounded text-sm min-w-[40px]">
                        {option.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-700">{option.priceListName}</div>
                      {option.notes && (
                        <div className="text-xs text-gray-500 mt-1">{option.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-900">{option.validFrom}</div>
                        <div className="text-xs text-gray-500 my-1">to</div>
                        <div className="text-xs font-medium text-gray-900">{option.validTo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-800">{option.priceListNumber}</span>
                        {isCurrentPricelist && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
                            In Use
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold text-lg text-gray-900">${option.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">per {option.orderUnit}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-gray-900">{option.minQuantity}</div>
                      <div className="text-xs text-gray-500">{option.orderUnit}</div>
                      {option.leadTime && (
                        <div className="text-xs text-blue-600 mt-1">{option.leadTime} days</div>
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
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedPricelist ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Pricelist selected</span>
              </span>
            ) : (
              "Select a pricelist to compare and choose"
            )}
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleCancelSelection} 
              disabled={selectedPricelist === null}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Clear Selection
            </Button>
            <Button 
              onClick={handleSelectPricelist} 
              disabled={selectedPricelist === null}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              {selectedPricelist ? "Confirm Selection" : "Select Pricelist"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}