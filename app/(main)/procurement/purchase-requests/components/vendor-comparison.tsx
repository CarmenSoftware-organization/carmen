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
          
{/* 
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>
             
              <div>
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={newVendor.unitPrice}
                  onChange={(e) => setNewVendor({ ...newVendor, unitPrice: e.target.value })}
                  placeholder="Enter unit price"
                />
              </div>
              <div>
                <Label htmlFor="orderUnit">Order Unit</Label>
                <Select
                  value={newVendor.orderUnit}
                  onValueChange={(value) => setNewVendor({ ...newVendor, orderUnit: value })}
                >
                  <SelectTrigger id="orderUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="m">Meters (m)</SelectItem>
                    <SelectItem value="ft">Feet (ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="requestQty">Request Qty</Label>
                <Input
                  id="requestQty"
                  // value={newVendor.requestQty}
                  // onChange={(e) => setNewVendor({ ...newVendor, requestQty: e.target.value })
                  placeholder="Enter request quantity"
                />
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="approvedQty">Approved Qty</Label>
                <Input
                  id="approvedQty"
                //  value={newVendor.name}
                //  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Enter order quantity"
                />
              </div>
            </div>
            <Button onClick={handleAddNewVendor} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add New Vendor
            </Button>
          </div> */}
        {/* </CardContent>

      </Card> */}
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