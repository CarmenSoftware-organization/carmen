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
  approvedQuantity,
  userRole
}: { 
  currentPricelistNumber?: string, 
  selectedVendor?: string,
  onPricelistSelect?: (vendor: string, pricelistNumber: string, unitPrice: number) => void,
  itemName?: string,
  itemDescription?: string,
  itemUnit?: string,
  itemStatus?: string,
  requestedQuantity?: number,
  approvedQuantity?: number,
  userRole?: string
}) {
  // Get item-specific vendor data or fall back to sample data
  const itemVendorData = itemName ? getVendorOptionsForItem(itemName) : null;
  
  // Fallback vendor options if no specific data found for the item
  const fallbackVendorOptions = [
    {
      vendorId: 100,
      vendorName: "Premium Food Supplier Inc.",
      isPreferred: true,
      rating: 4.5,
      priceListNumber: "PL-2024-PREMIUM-001",
      priceListName: "Premium Products",
      unitPrice: 3200.00,
      currency: "USD",
      minQuantity: 1,
      orderUnit: "pcs",
      validFrom: "01/01/2024",
      validTo: "31/12/2024",
      leadTime: 5,
      notes: "High quality, reliable supplier"
    },
    {
      vendorId: 101,
      vendorName: "Budget Supply Co.",
      isPreferred: false,
      rating: 4.1,
      priceListNumber: "PL-2024-BUDGET-001",
      priceListName: "Budget Options",
      unitPrice: 2850.00,
      currency: "USD",
      minQuantity: 2,
      orderUnit: "pcs",
      validFrom: "01/01/2024",
      validTo: "31/12/2024",
      leadTime: 7,
      notes: "Cost-effective alternative"
    },
    {
      vendorId: 102,
      vendorName: "Global Trade Partners",
      isPreferred: false,
      rating: 4.3,
      priceListNumber: "PL-2024-GLOBAL-001",
      priceListName: "International Supply",
      unitPrice: 3050.00,
      currency: "EUR",
      minQuantity: 1,
      orderUnit: "pcs",
      validFrom: "01/01/2024",
      validTo: "31/12/2024",
      leadTime: 10,
      notes: "International shipping available"
    }
  ];
  
  const vendorOptions = itemVendorData?.vendorOptions || fallbackVendorOptions;
  
  // Determine user permissions
  const isPurchaser = userRole === 'Purchasing Staff' || userRole === 'Purchaser';
  const isApprover = userRole === 'Department Manager' || 
                    userRole === 'Financial Manager' ||
                    userRole === 'Approver';
  const canSelectPricelist = isPurchaser && onPricelistSelect;
  
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
  
  // Debug: Log vendor comparison permissions
  console.log('VendorComparison permissions:', {
    userRole,
    isPurchaser,
    isApprover,
    onPricelistSelectProvided: !!onPricelistSelect,
    canSelectPricelist,
    vendorOptionsCount: vendorOptions.length,
    filteredOptionsCount: filteredVendorOptions.length
  });
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
      <div className="mb-3 bg-white/80 border border-gray-200 p-3 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-0.5">{itemData.name}</h2>
            <p className="text-gray-500 text-xs">{itemData.description}</p>
          </div>
          <StatusBadge status={itemData.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-gray-50/60 p-1.5 rounded border border-gray-100 text-right">
            <span className="text-xs font-medium text-gray-500 tracking-wide">Requested</span>
            <div className="text-xs font-semibold text-gray-700">{itemData.requestedQuantity} {itemData.unit}</div>
          </div>
          <div className="bg-gray-50/60 p-1.5 rounded border border-gray-100 text-right">
            <span className="text-xs font-medium text-gray-500 tracking-wide">Approved</span>
            <div className="text-xs font-semibold text-gray-700">{itemData.approvedQuantity} {itemData.unit}</div>
          </div>
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="mb-3 bg-blue-50/50 border border-blue-200 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <History className="h-3 w-3 text-blue-600" />
          <h3 className="text-xs font-semibold text-gray-800">Purchase History</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/80 p-1.5 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Vendor</span>
            <div className="text-xs font-medium text-gray-900 mt-0.5">Seasonal Gourmet Supplies</div>
          </div>
          <div className="bg-white/80 p-1.5 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Purchase Date</span>
            <div className="text-xs font-medium text-gray-900 mt-0.5">15/02/2024</div>
          </div>
          <div className="bg-white/80 p-1.5 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Last Price</span>
            <div className="text-xs font-medium text-gray-900 mt-0.5">4,150.00 EUR</div>
          </div>
          <div className="bg-white/80 p-1.5 rounded border border-blue-100">
            <span className="text-xs font-medium text-gray-500 block">Unit</span>
            <div className="text-xs font-medium text-gray-900 mt-0.5">kg</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                {canSelectPricelist && (
                  <TableHead className="w-[50px] text-center font-semibold text-gray-700 text-xs py-2">Select</TableHead>
                )}
                <TableHead className="font-semibold text-gray-700 text-xs py-2">Vendor</TableHead>
                <TableHead className="w-[60px] text-center font-semibold text-gray-700 text-xs py-2">Preferred</TableHead>
                <TableHead className="w-[60px] text-center font-semibold text-gray-700 text-xs py-2">Rating</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-2">Description</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-gray-700 text-xs py-2">Valid Period</TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-700 text-xs py-2">Price List #</TableHead>
                <TableHead className="w-[60px] text-center font-semibold text-gray-700 text-xs py-2">Currency</TableHead>
                <TableHead className="w-[90px] text-right font-semibold text-gray-700 text-xs py-2">Unit Price</TableHead>
                <TableHead className="w-[80px] text-right font-semibold text-gray-700 text-xs py-2">Min. Qty</TableHead>
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
                    {canSelectPricelist && (
                      <TableCell className="text-center py-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handlePricelistSelection(option.priceListNumber)}
                          className="mx-auto h-3 w-3"
                        />
                      </TableCell>
                    )}
                    <TableCell className="py-2">
                      <div className="text-xs font-medium text-gray-900">{option.vendorName}</div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      {option.isPreferred && (
                        <div className="flex justify-center">
                          <Check className="w-3 h-3 text-green-600 bg-green-100 rounded-full p-0.5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-semibold px-1 py-0.5 rounded text-xs min-w-[30px]">
                        {option.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs font-medium text-gray-700">{option.priceListName}</div>
                      {option.notes && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={option.notes}>{option.notes}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-900">{option.validFrom}</div>
                        <div className="text-xs text-gray-500">to</div>
                        <div className="text-xs font-medium text-gray-900">{option.validTo}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="font-mono text-xs font-medium text-gray-800">{option.priceListNumber}</span>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="text-xs font-medium text-gray-900">{option.currency || "USD"}</div>
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="font-semibold text-sm text-gray-900">{option.unitPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">per {option.orderUnit}</div>
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="text-xs font-medium text-gray-900">{option.minQuantity}</div>
                      <div className="text-xs text-gray-500">{option.orderUnit}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {canSelectPricelist && (
        <div className="mt-4 p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600">
              {selectedPricelist ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Vendor & pricelist selected</span>
                </span>
              ) : (
                "Select a vendor and pricelist combination"
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelSelection} 
                disabled={selectedPricelist === null}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs h-7 px-3"
              >
                Clear Selection
              </Button>
              <Button 
                size="sm"
                onClick={handleSelectPricelist} 
                disabled={selectedPricelist === null}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-7 px-4"
              >
                {selectedPricelist ? "Select This Vendor" : "Choose Vendor & Pricelist"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!canSelectPricelist && (
        <div className="mt-4 p-3 bg-blue-50 border-t border-blue-200 rounded-b-lg">
          <div className="flex items-center justify-center gap-2">
            <div className="text-xs text-blue-700 font-medium">
              View-only mode - Vendor comparison for approval review
            </div>
          </div>
        </div>
      )}
    </>
  )
}