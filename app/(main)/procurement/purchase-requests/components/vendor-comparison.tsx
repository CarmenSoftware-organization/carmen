"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import StatusBadge from "@/components/ui/custom-status-badge"

// Mock data for vendors including preferred status, price lists, and ratings
const initialVendors = [
  { 
    id: 1, 
    name: "Vendor A", 
    isPreferred: true,
    rating: 4.5,
    priceLists: [
      { id: 1, name: "Standard", unitPrice: 10, minQuantity: 100, orderUnit: "pcs", isPreferred: true },
      { id: 2, name: "Premium", unitPrice: 12, minQuantity: 50, orderUnit: "pcs", isPreferred: false }
    ]
  },
  { 
    id: 2, 
    name: "Vendor B", 
    isPreferred: false,
    rating: 3.8,
    priceLists: [
      { id: 3, name: "Basic", unitPrice: 11, minQuantity: 50, orderUnit: "pcs", isPreferred: false },
      { id: 4, name: "Bulk", unitPrice: 9, minQuantity: 200, orderUnit: "pcs",  isPreferred: true }
    ]
  },
  { 
    id: 3, 
    name: "Vendor C", 
    isPreferred: false,
    rating: 4.2,
    priceLists: [
      { id: 5, name: "Standard", unitPrice: 9.5, minQuantity: 200, orderUnit: "pcs",  isPreferred: true }
    ]
  },
]

// Sample item data
const itemData = {
  name: "Organic Quinoa",
  description: "Premium organic white quinoa grains",
  status: "Accepted",
  requestedQuantity: 500,
  approvedQuantity: 450,
  unit: "Kg"
}

export default function VendorComparison() {
  const [vendors, setVendors] = useState(initialVendors)
  const [newVendor, setNewVendor] = useState({
    name: "",
    rating: "",
    priceName: "",
    unitPrice: "",
    minQuantity: "",
    orderUnit: "pcs",
  })
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const handleAddNewVendor = () => {
    if (newVendor.name && newVendor.rating && newVendor.priceName && newVendor.unitPrice && newVendor.minQuantity ) {
      const newVendorObj = {
        id: vendors.length + 1,
        name: newVendor.name,
        isPreferred: false,
        rating: parseFloat(newVendor.rating),
        priceLists: [
          {
            id: Date.now(),
            name: newVendor.priceName,
            unitPrice: parseFloat(newVendor.unitPrice),
            minQuantity: parseInt(newVendor.minQuantity),
            orderUnit: newVendor.orderUnit,
            isPreferred: true
          }
        ]
      }
      setVendors([...vendors, newVendorObj])
      setNewVendor({
        name: "",
        rating: "",
        priceName: "",
        unitPrice: "",
        minQuantity: "",
        orderUnit: "pcs",
      })
    }
  }

  const handleVendorSelection = (vendorId: number) => {
    setSelectedVendor(prevSelected => prevSelected === vendorId ? null : vendorId)
  }

  const handleCancelSelection = () => {
    setSelectedVendor(null)
  }

  const handleSelectVendor = () => {
    if (selectedVendor) {
      console.log(`Vendor with ID ${selectedVendor} has been selected.`)
      // Here you would typically do something with the selected vendor,
      // such as updating the UI or sending the selection to a parent component
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Vendor Comparison</h1>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{itemData.name}</h2>
          <StatusBadge status={itemData.status} />
        </div>
        <p className="text-gray-600 mb-2">{itemData.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Requested: {itemData.requestedQuantity} {itemData.unit}</span>
          <span>Approved: {itemData.approvedQuantity} {itemData.unit}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Preferred Vendor</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Pref. List</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Min. Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.flatMap((vendor) =>
              vendor.priceLists.map((priceList, index) => (
                <TableRow key={`${vendor.id}-${priceList.id}`}>
                  {index === 0 && (
                    <TableCell rowSpan={vendor.priceLists.length} className="align-top">
                      <Checkbox
                        checked={selectedVendor === vendor.id}
                        onCheckedChange={() => handleVendorSelection(vendor.id)}
                      />
                    </TableCell>
                  )}
                  {index === 0 ? (
                    <>
                      <TableCell rowSpan={vendor.priceLists.length} className="align-top">
                        {vendor.name}
                      </TableCell>
                      <TableCell rowSpan={vendor.priceLists.length} className="align-top">
                        {vendor.isPreferred && <Check className="w-4 h-4 text-green-500" />}
                      </TableCell>
                      <TableCell rowSpan={vendor.priceLists.length} className="align-top">
                        {renderRating(vendor.rating)}
                      </TableCell>
                    </>
                  ) : null}
                  <TableCell>{priceList.name}</TableCell>
                  <TableCell>
                    {priceList.isPreferred && <Check className="w-4 h-4 text-green-500" />}
                  </TableCell>
                  <TableCell>${priceList.unitPrice.toFixed(2)} / {priceList.orderUnit}</TableCell>
                  <TableCell>{priceList.minQuantity} {priceList.orderUnit}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <DialogFooter>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancelSelection} disabled={selectedVendor === null}>
            Cancel
          </Button>
          <Button onClick={handleSelectVendor} disabled={selectedVendor === null}>
            Select
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}