import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

"use client"


// Mock data for vendors including preferred status, price lists, and ratings
const initialVendors = [
  { 
    id: 1, 
    name: "Vendor A", 
    isPreferred: true,
    rating: 4.5,
    priceLists: [
      { id: 1, name: "Standard", unitPrice: 10, minQuantity: 100, inventoryUnit: "pcs", bulkPrice: 9.5, isPreferred: true },
      { id: 2, name: "Premium", unitPrice: 12, minQuantity: 50, inventoryUnit: "pcs", bulkPrice: 11, isPreferred: false }
    ]
  },
  { 
    id: 2, 
    name: "Vendor B", 
    isPreferred: false,
    rating: 3.8,
    priceLists: [
      { id: 3, name: "Basic", unitPrice: 11, minQuantity: 50, inventoryUnit: "pcs", bulkPrice: 10, isPreferred: false },
      { id: 4, name: "Bulk", unitPrice: 9, minQuantity: 200, inventoryUnit: "pcs", bulkPrice: 8.5, isPreferred: true }
    ]
  },
  { 
    id: 3, 
    name: "Vendor C", 
    isPreferred: false,
    rating: 4.2,
    priceLists: [
      { id: 5, name: "Standard", unitPrice: 9.5, minQuantity: 200, inventoryUnit: "pcs", bulkPrice: 9, isPreferred: true }
    ]
  },
]

export function VendorComparisonComponent() {
  const [vendors, setVendors] = useState(initialVendors)
  const [newVendor, setNewVendor] = useState({
    name: "",
    rating: "",
    priceName: "",
    unitPrice: "",
    minQuantity: "",
    bulkPrice: "",
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
    if (newVendor.name && newVendor.rating && newVendor.priceName && newVendor.unitPrice && newVendor.minQuantity && newVendor.bulkPrice) {
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
            bulkPrice: parseFloat(newVendor.bulkPrice),
            inventoryUnit: "pcs",
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
        bulkPrice: "",
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
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelSelection} disabled={selectedVendor === null}>
              Cancel
            </Button>
            <Button onClick={handleSelectVendor} disabled={selectedVendor === null}>
              Select
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Preferred Vendor</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Price List</TableHead>
                  <TableHead>Preferred Price List</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Min. Quantity</TableHead>
                  <TableHead>Bulk Price</TableHead>
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
                      <TableCell>${priceList.unitPrice.toFixed(2)} / {priceList.inventoryUnit}</TableCell>
                      <TableCell>{priceList.minQuantity} {priceList.inventoryUnit}</TableCell>
                      <TableCell>${priceList.bulkPrice.toFixed(2)} / {priceList.inventoryUnit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <Label htmlFor="vendorRating">Vendor Rating</Label>
                <Input
                  id="vendorRating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newVendor.rating}
                  onChange={(e) => setNewVendor({ ...newVendor, rating: e.target.value })}
                  placeholder="Enter vendor rating (0-5)"
                />
              </div>
              <div>
                <Label htmlFor="priceName">Price List Name</Label>
                <Input
                  id="priceName"
                  value={newVendor.priceName}
                  onChange={(e) => setNewVendor({ ...newVendor, priceName: e.target.value })}
                  placeholder="Enter price list name"
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
                <Label htmlFor="minQuantity">Min. Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={newVendor.minQuantity}
                  onChange={(e) => setNewVendor({ ...newVendor, minQuantity: e.target.value })}
                  placeholder="Enter min quantity"
                />
              </div>
              <div>
                <Label htmlFor="bulkPrice">Bulk Price</Label>
                <Input
                  id="bulkPrice"
                  type="number"
                  value={newVendor.bulkPrice}
                  onChange={(e) => setNewVendor({ ...newVendor, bulkPrice: e.target.value })}
                  placeholder="Enter bulk price"
                />
              </div>
            </div>
            <Button onClick={handleAddNewVendor} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add New Vendor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}