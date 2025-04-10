"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, Star, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// --- Mock Data --- 
interface Vendor {
  id: string
  name: string
  isPreferred: boolean
  rating: number
  priceList: {
    itemCode: string
    price: number
    lastUpdated: string
  }[]
  performance: {
    deliveryTime: number
    qualityScore: number
    responseTime: number
  }
}

const mockVendors: Vendor[] = [
  {
    id: "V001",
    name: "Supplier Alpha",
    isPreferred: true,
    rating: 4.5,
    priceList: [
      { itemCode: "ITEM-001", price: 100, lastUpdated: "2024-03-01" },
      { itemCode: "ITEM-002", price: 155, lastUpdated: "2024-03-01" },
      { itemCode: "ITEM-003", price: 210, lastUpdated: "2024-03-01" },
    ],
    performance: {
      deliveryTime: 2,
      qualityScore: 95,
      responseTime: 24,
    },
  },
  {
    id: "V002",
    name: "Vendor Bravo",
    isPreferred: false,
    rating: 3.8,
    priceList: [
      { itemCode: "ITEM-001", price: 110, lastUpdated: "2024-02-28" },
      { itemCode: "ITEM-002", price: 145, lastUpdated: "2024-02-28" },
    ],
    performance: {
      deliveryTime: 3,
      qualityScore: 88,
      responseTime: 48,
    },
  },
   {
    id: "V003",
    name: "Charlie Supplies",
    isPreferred: false,
    rating: 4.1,
    priceList: [
      { itemCode: "ITEM-001", price: 98, lastUpdated: "2024-03-05" },
      { itemCode: "ITEM-002", price: 150, lastUpdated: "2024-03-05" },
      { itemCode: "ITEM-003", price: 205, lastUpdated: "2024-03-05" },
    ],
    performance: {
      deliveryTime: 2,
      qualityScore: 92,
      responseTime: 36,
    },
  },
]

interface PRItem {
  id: string;
  itemCode: string;
  name: string;
  quantity: number;
  uom: string;
}

const mockPR = {
  id: "PR-00451",
  requester: "Alice Johnson",
  department: "Housekeeping",
  date: "2024-07-15",
  items: [
    { id: "PRL-1", itemCode: "ITEM-001", name: "Standard Pillow Case", quantity: 200, uom: "Each" },
    { id: "PRL-2", itemCode: "ITEM-002", name: "Bath Towel Set", quantity: 150, uom: "Set" },
    { id: "PRL-3", itemCode: "ITEM-003", name: "Shampoo Bottle (Travel Size)", quantity: 500, uom: "Bottle" },
  ] as PRItem[],
};

// --- Component --- 

export function VendorComparison() {
  // State to hold selections: { itemCode: vendorId | null }
  const [selections, setSelections] = useState<Record<string, string | null>>(() => 
    mockPR.items.reduce((acc, item) => ({ ...acc, [item.itemCode]: null }), {})
  );

  const handleSelect = (itemCode: string, vendorId: string) => {
    setSelections(prev => ({
      ...prev,
      [itemCode]: prev[itemCode] === vendorId ? null : vendorId, // Toggle selection
    }));
  };

  // Helper to find vendor price for an item
  const getVendorPrice = (vendor: Vendor, itemCode: string): number | null => {
    const priceEntry = vendor.priceList.find(p => p.itemCode === itemCode);
    return priceEntry ? priceEntry.price : null;
  };

  // Find the lowest price for an item across all vendors
  const getLowestPriceInfo = (itemCode: string): { vendorId: string, price: number } | null => {
     let lowestPrice: number | null = null;
     let lowestVendorId: string | null = null;

     mockVendors.forEach(vendor => {
       const price = getVendorPrice(vendor, itemCode);
       if (price !== null && (lowestPrice === null || price < lowestPrice)) {
         lowestPrice = price;
         lowestVendorId = vendor.id;
       }
     });

     if (lowestVendorId && lowestPrice !== null) {
       return { vendorId: lowestVendorId, price: lowestPrice };
     }
     return null;
  }

  return (
    <div className="space-y-6">
      {/* PR Context Header */}
       <Card>
        <CardHeader>
          <CardTitle>Comparing Vendors for Purchase Request: {mockPR.id}</CardTitle>
          <CardDescription>
            Requested by {mockPR.requester} ({mockPR.department}) on {mockPR.date}
          </CardDescription>
        </CardHeader>
      </Card> 

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                {/* Item Details Columns */}
                <TableHead className="py-3 font-medium text-gray-600 sticky left-0 bg-gray-50/75 z-10 w-[150px]">Item Code</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 sticky left-[150px] bg-gray-50/75 z-10 w-[250px]">Item Name</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right w-[100px]">Quantity</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 w-[80px]">UoM</TableHead>
                {/* Vendor Price Columns */}
                {mockVendors.map((vendor) => (
                  <TableHead key={vendor.id} className="py-3 font-medium text-gray-600 text-center min-w-[180px]">
                    {vendor.name}
                    {vendor.isPreferred && <Badge variant="secondary" className="ml-2 text-xs">Pref.</Badge>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPR.items.map((item) => {
                 const lowestPriceInfo = getLowestPriceInfo(item.itemCode);
                 return (
                  <TableRow key={item.id} className="group hover:bg-gray-50/50">
                    {/* Sticky Item Details */}
                    <TableCell className="font-medium sticky left-0 bg-white group-hover:bg-gray-50/50 z-10">{item.itemCode}</TableCell>
                    <TableCell className="sticky left-[150px] bg-white group-hover:bg-gray-50/50 z-10">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    {/* Vendor Price Cells */}
                    {mockVendors.map((vendor) => {
                      const price = getVendorPrice(vendor, item.itemCode);
                      const isSelected = selections[item.itemCode] === vendor.id;
                      const isLowest = lowestPriceInfo?.vendorId === vendor.id;
                      return (
                        <TableCell key={`${item.id}-${vendor.id}`} className="text-center">
                          {price !== null ? (
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "w-full justify-center h-10", // Ensure button fills cell
                                isLowest && !isSelected && "border-green-500 border-2", // Highlight lowest
                                isSelected && "bg-blue-600 hover:bg-blue-700"
                              )}
                              onClick={() => handleSelect(item.itemCode, vendor.id)}
                            >
                              ${price.toFixed(2)}
                              {isSelected && <Check className="ml-2 h-4 w-4" />}
                              {isLowest && !isSelected && <Star className="ml-2 h-4 w-4 text-green-600" />}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                 );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Buttons (Placeholder) */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Selections</Button>
        <Button>Create Purchase Order(s)</Button>
      </div>
    </div>
  )
}