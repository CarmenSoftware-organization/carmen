"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, Star, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
    id: "1",
    name: "Vendor A",
    isPreferred: true,
    rating: 4.5,
    priceList: [
      { itemCode: "ITEM-001", price: 100, lastUpdated: "2024-03-01" },
      { itemCode: "ITEM-002", price: 150, lastUpdated: "2024-03-01" },
    ],
    performance: {
      deliveryTime: 2,
      qualityScore: 95,
      responseTime: 24,
    },
  },
  {
    id: "2",
    name: "Vendor B",
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
]

export function VendorComparison() {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Delivery Time (days)</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Response Time (hrs)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  {vendor.name}
                  {vendor.isPreferred && (
                    <Badge variant="secondary" className="ml-2">
                      Preferred
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {vendor.isPreferred ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {vendor.rating}
                    <Star className="h-4 w-4 ml-1 text-yellow-500" />
                  </div>
                </TableCell>
                <TableCell>{vendor.performance.deliveryTime}</TableCell>
                <TableCell>{vendor.performance.qualityScore}%</TableCell>
                <TableCell>{vendor.performance.responseTime}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVendor(vendor.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}