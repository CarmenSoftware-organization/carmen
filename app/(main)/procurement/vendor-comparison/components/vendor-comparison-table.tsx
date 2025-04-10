"use client"

import React, { useState, useEffect } from "react"
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Award, Truck, DollarSign, Star } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export interface Vendor {
  id: string
  name: string
  totalPrice: number
  delivery: {
    days: number
    reliability: "high" | "medium" | "low"
  }
  rating: number
  qualityScore: number
  preferred: boolean
  previousOrders: number
  inStock: boolean
}

export interface VendorComparisonItem {
  prId: string
  prNumber: string
  selectedItems: {
    id: string
    name: string
    quantity: number
    vendors: Vendor[]
  }[]
}

// Mock data
const mockVendorComparisons: Record<string, VendorComparisonItem> = {
  "pr-001": {
    prId: "pr-001",
    prNumber: "PR-2023-001",
    selectedItems: [
      {
        id: "item1",
        name: "Fresh Vegetables",
        quantity: 50,
        vendors: [
          {
            id: "v1",
            name: "Premium Foods Co.",
            totalPrice: 750,
            delivery: { days: 2, reliability: "high" },
            rating: 4.8,
            qualityScore: 9.5,
            preferred: true,
            previousOrders: 27,
            inStock: true
          },
          {
            id: "v2",
            name: "Wholesale Foods",
            totalPrice: 700,
            delivery: { days: 3, reliability: "medium" },
            rating: 4.2,
            qualityScore: 8.7,
            preferred: false,
            previousOrders: 14,
            inStock: true
          },
          {
            id: "v3",
            name: "Budget Suppliers",
            totalPrice: 650,
            delivery: { days: 5, reliability: "medium" },
            rating: 3.9,
            qualityScore: 7.6,
            preferred: false,
            previousOrders: 5,
            inStock: false
          }
        ]
      },
      {
        id: "item2",
        name: "Meat Assortment",
        quantity: 25,
        vendors: [
          {
            id: "v4",
            name: "Premium Meats Inc.",
            totalPrice: 500,
            delivery: { days: 1, reliability: "high" },
            rating: 4.9,
            qualityScore: 9.8,
            preferred: true,
            previousOrders: 35,
            inStock: true
          },
          {
            id: "v5",
            name: "Wholesale Butchery",
            totalPrice: 480,
            delivery: { days: 2, reliability: "high" },
            rating: 4.7,
            qualityScore: 9.2,
            preferred: false,
            previousOrders: 22,
            inStock: true
          }
        ]
      }
    ]
  },
  "pr-002": {
    prId: "pr-002",
    prNumber: "PR-2023-002",
    selectedItems: [
      {
        id: "item3",
        name: "Premium Spirits",
        quantity: 10,
        vendors: [
          {
            id: "v6",
            name: "Luxury Spirits Wholesale",
            totalPrice: 450,
            delivery: { days: 3, reliability: "high" },
            rating: 4.4,
            qualityScore: 9.1,
            preferred: true,
            previousOrders: 18,
            inStock: true
          },
          {
            id: "v7",
            name: "Global Beverage Imports",
            totalPrice: 475,
            delivery: { days: 5, reliability: "medium" },
            rating: 4.6,
            qualityScore: 9.3,
            preferred: false,
            previousOrders: 12,
            inStock: true
          }
        ]
      },
      {
        id: "item4",
        name: "Wine Selection",
        quantity: 15,
        vendors: [
          {
            id: "v8",
            name: "Fine Wine Merchants",
            totalPrice: 300,
            delivery: { days: 3, reliability: "high" },
            rating: 4.7,
            qualityScore: 9.5,
            preferred: true,
            previousOrders: 23,
            inStock: true
          },
          {
            id: "v9",
            name: "Vineyard Direct Imports",
            totalPrice: 285,
            delivery: { days: 5, reliability: "medium" },
            rating: 4.5,
            qualityScore: 9.2,
            preferred: false,
            previousOrders: 16,
            inStock: false
          }
        ]
      }
    ]
  },
  "pr-003": {
    prId: "pr-003",
    prNumber: "PR-2023-003",
    selectedItems: [
      {
        id: "item5",
        name: "Cleaning Supplies",
        quantity: 30,
        vendors: [
          {
            id: "v10",
            name: "Commercial Cleaning Supplies",
            totalPrice: 247.5,
            delivery: { days: 2, reliability: "high" },
            rating: 4.4,
            qualityScore: 8.8,
            preferred: true,
            previousOrders: 19,
            inStock: true
          },
          {
            id: "v11",
            name: "Janitorial Warehouse",
            totalPrice: 240,
            delivery: { days: 3, reliability: "medium" },
            rating: 4.2,
            qualityScore: 8.5,
            preferred: false,
            previousOrders: 10,
            inStock: true
          }
        ]
      },
      {
        id: "item6",
        name: "Linens",
        quantity: 20,
        vendors: [
          {
            id: "v12",
            name: "Hospitality Linens Co.",
            totalPrice: 178,
            delivery: { days: 3, reliability: "high" },
            rating: 4.5,
            qualityScore: 9.0,
            preferred: true,
            previousOrders: 25,
            inStock: true
          },
          {
            id: "v13",
            name: "Premium Linen Supply",
            totalPrice: 185,
            delivery: { days: 2, reliability: "high" },
            rating: 4.7,
            qualityScore: 9.2,
            preferred: false,
            previousOrders: 15,
            inStock: true
          }
        ]
      }
    ]
  }
}

export function VendorComparisonTable({ prId }: { prId?: string }) {
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({})
  const [sortCriteria, setSortCriteria] = useState<'price' | 'delivery' | 'rating' | 'quality'>('price')
  const [comparisonData, setComparisonData] = useState<VendorComparisonItem | null>(null)
  
  // Load the comparison data for the specific PR ID
  useEffect(() => {
    if (prId && mockVendorComparisons[prId]) {
      setComparisonData(mockVendorComparisons[prId])
    } else if (prId) {
      // If PR ID is provided but not found in mock data
      toast.error(`No vendor data found for PR ID: ${prId}`)
    } else {
      // Default to first PR if none specified (for demo purposes)
      const firstPrId = Object.keys(mockVendorComparisons)[0]
      setComparisonData(mockVendorComparisons[firstPrId])
    }
  }, [prId])
  
  const handleSelectVendor = (itemId: string, vendorId: string) => {
    setSelectedVendors({
      ...selectedVendors,
      [itemId]: vendorId
    })
    
    // Get vendor details
    const item = comparisonData?.selectedItems.find(i => i.id === itemId)
    const vendor = item?.vendors.find(v => v.id === vendorId)
    
    if (vendor && item) {
      toast.success(`Selected ${vendor.name} for ${item.name}`)
    }
  }
  
  // Get sorted vendors for an item
  const getSortedVendors = (vendors: Vendor[]) => {
    return [...vendors].sort((a, b) => {
      switch (sortCriteria) {
        case 'price':
          return a.totalPrice - b.totalPrice
        case 'delivery':
          return a.delivery.days - b.delivery.days
        case 'rating':
          return b.rating - a.rating
        case 'quality':
          return b.qualityScore - a.qualityScore
        default:
          return 0
      }
    })
  }
  
  if (!comparisonData) {
    return <div className="p-8 text-center">Loading vendor comparison data...</div>
  }

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Vendor Options for PR: {comparisonData.prNumber}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Sort by:</span>
          <Select value={sortCriteria} onValueChange={(value: 'price' | 'delivery' | 'rating' | 'quality') => setSortCriteria(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="delivery">Delivery Time</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {comparisonData.selectedItems.map(item => {
        const vendors = getSortedVendors(item.vendors)
        const selectedVendorId = selectedVendors[item.id]
        
        // Find vendors with best attributes for highlighting
        const bestPrice = Math.min(...vendors.map(v => v.totalPrice))
        const bestDelivery = Math.min(...vendors.map(v => v.delivery.days))
        const bestRating = Math.max(...vendors.map(v => v.rating))
        const bestQuality = Math.max(...vendors.map(v => v.qualityScore))
        
        return (
          <Card key={item.id} className="mb-8 border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {item.name} (Qty: {item.quantity})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map(vendor => {
                    const isSelected = selectedVendorId === vendor.id
                    
                    // Check if this vendor has best attributes
                    const hasBestPrice = vendor.totalPrice === bestPrice
                    const hasBestDelivery = vendor.delivery.days === bestDelivery
                    const hasBestRating = vendor.rating === bestRating
                    const hasBestQuality = vendor.qualityScore === bestQuality
                    
                    return (
                      <TableRow 
                        key={vendor.id} 
                        className={isSelected ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <input 
                            type="radio" 
                            name={`vendor-${item.id}`} 
                            checked={isSelected} 
                            onChange={() => handleSelectVendor(item.id, vendor.id)} 
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.previousOrders} previous orders
                            {vendor.preferred && (
                              <Badge variant="outline" className="ml-2">Preferred</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={hasBestPrice ? "text-green-600 font-medium" : ""}>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                            ${vendor.totalPrice.toLocaleString()}
                            {hasBestPrice && <span className="ml-1 text-xs text-green-600">✓ Best</span>}
                          </div>
                        </TableCell>
                        <TableCell className={hasBestDelivery ? "text-amber-600 font-medium" : ""}>
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-1 text-muted-foreground" />
                            {vendor.delivery.days} days
                            {hasBestDelivery && <span className="ml-1 text-xs text-amber-600">✓ Best</span>}
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${
                                vendor.delivery.reliability === "high" 
                                  ? "text-green-500" 
                                  : vendor.delivery.reliability === "medium"
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            >
                              {vendor.delivery.reliability}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className={hasBestRating ? "text-blue-600 font-medium" : ""}>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-muted-foreground" />
                            {vendor.rating.toFixed(1)}/5
                            {hasBestRating && <span className="ml-1 text-xs text-blue-600">✓ Best</span>}
                          </div>
                        </TableCell>
                        <TableCell className={hasBestQuality ? "text-purple-600 font-medium" : ""}>
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-1 text-muted-foreground" />
                            {vendor.qualityScore.toFixed(1)}/10
                            {hasBestQuality && <span className="ml-1 text-xs text-purple-600">✓ Best</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vendor.inStock ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> In Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                              <Clock className="w-3 h-3 mr-1" /> Backorder
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Vendor Selections</Button>
      </div>
    </div>
  )
} 