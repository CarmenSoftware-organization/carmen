"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Package } from "lucide-react"
import type { User, OrderItem } from "../types/roles"

interface AddItemModalProps {
  currentUser: User
  onAddItem: (item: Omit<OrderItem, "id">) => void
}

const hotelLocations = [
  "Main Hotel Store",
  "Restaurant Store",
  "Housekeeping Store",
  "Bar Store",
  "Front Desk Store",
  "Kitchen Store",
  "Laundry Store",
  "Maintenance Store",
  "Conference Room Store",
  "Spa Store",
]

const orderUnits = [
  "Piece",
  "Set",
  "Box",
  "Pack",
  "Bottle",
  "Case",
  "Roll",
  "Bag",
  "Carton",
  "Dozen",
  "Each",
  "Gallon",
  "Liter",
  "Pound",
  "Kilogram",
]

const sampleProducts = [
  {
    name: "Bed Linens Set",
    description: "Premium cotton bed linens with pillowcases",
    sku: "BLS-PREM-001",
    price: 89.99,
    vendor: "Luxury Linens Co.",
  },
  {
    name: "Wine Glasses",
    description: "Crystal wine glasses for fine dining",
    sku: "WG-CRYST-024",
    price: 125.5,
    vendor: "Crystal Glassware Ltd.",
  },
  {
    name: "Vacuum Cleaner",
    description: "Commercial grade vacuum cleaner",
    sku: "VC-COMM-300",
    price: 299.99,
    vendor: "CleanTech Solutions",
  },
  {
    name: "Premium Whiskey",
    description: "Single malt whiskey for hotel bar",
    sku: "WH-SNGL-750",
    price: 89.99,
    vendor: "Premium Spirits Inc.",
  },
  {
    name: "Key Cards",
    description: "RFID hotel key cards with magnetic stripe",
    sku: "KC-RFID-100",
    price: 24.99,
    vendor: "SecureAccess Systems",
  },
  {
    name: "Chef Knives Set",
    description: "Professional chef knife set with storage block",
    sku: "CK-PROF-SET8",
    price: 189.99,
    vendor: "Professional Kitchen Supply",
  },
]

export default function AddItemModal({ currentUser, onAddItem }: AddItemModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    product: "",
    productDescription: "",
    sku: "",
    orderUnit: "Piece",
    invUnit: "Piece",
    requestQuantity: 1,
    currency: "USD",
    price: 0,
    vendor: "",
    vendorCode: "",
    vendorContact: "",
  })

  const handleProductSelect = (productName: string) => {
    const selectedProduct = sampleProducts.find((p) => p.name === productName)
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        product: selectedProduct.name,
        productDescription: selectedProduct.description,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        vendor: selectedProduct.vendor,
        vendorCode: `${selectedProduct.vendor.split(" ")[0].toUpperCase()}-001`,
        vendorContact: `orders@${selectedProduct.vendor.toLowerCase().replace(/\s+/g, "")}.com`,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newItem: Omit<OrderItem, "id"> = {
      location: formData.location,
      product: formData.product,
      productDescription: formData.productDescription,
      sku: formData.sku,
      orderUnit: formData.orderUnit,
      invUnit: formData.invUnit,
      requestQuantity: formData.requestQuantity,
      onOrderQuantity: Math.floor(Math.random() * 20) + 5, // Random for demo
      onOrderInvUnit: Math.floor(Math.random() * 20) + 5,
      approvedQuantity: 0,
      onHandQuantity: Math.floor(Math.random() * 15) + 1, // Random for demo
      onHandInvUnit: Math.floor(Math.random() * 15) + 1,
      currency: formData.currency,
      baseCurrency: "USD",
      price: formData.price,
      lastPrice: formData.price,
      baseCurrencyPrice: formData.price,
      baseCurrencyLastPrice: formData.price,
      total: formData.requestQuantity * formData.price,
      baseCurrencyTotal: formData.requestQuantity * formData.price,
      conversionRate: 1.0,
      status: "pending",
      requestorId: currentUser.id,
      requestorName: currentUser.name,
      department: currentUser.department || "General",
      requestDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      vendor: formData.vendor,
      vendorCode: formData.vendorCode,
      vendorContact: formData.vendorContact,
    }

    onAddItem(newItem)
    setOpen(false)

    // Reset form
    setFormData({
      location: "",
      product: "",
      productDescription: "",
      sku: "",
      orderUnit: "Piece",
      invUnit: "Piece",
      requestQuantity: 1,
      currency: "USD",
      price: 0,
      vendor: "",
      vendorCode: "",
      vendorContact: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Item Request
          </DialogTitle>
          <DialogDescription>
            Create a new procurement request. Fill in the details below and submit for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location and Product Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {hotelLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select value={formData.product} onValueChange={handleProductSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type product" />
                </SelectTrigger>
                <SelectContent>
                  {sampleProducts.map((product) => (
                    <SelectItem key={product.name} value={product.name}>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productDescription">Product Description *</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, productDescription: e.target.value }))}
                placeholder="Detailed description of the product"
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU/Item Code *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g., BLS-PREM-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderUnit">Order Unit *</Label>
                <Select
                  value={formData.orderUnit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, orderUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invUnit">Inventory Unit *</Label>
                <Select
                  value={formData.invUnit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, invUnit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestQuantity">Request Quantity *</Label>
              <Input
                id="requestQuantity"
                type="number"
                min="1"
                value={formData.requestQuantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, requestQuantity: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Unit Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vendor Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))}
                  placeholder="Vendor company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorCode">Vendor Code</Label>
                <Input
                  id="vendorCode"
                  value={formData.vendorCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorCode: e.target.value }))}
                  placeholder="e.g., LLC-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorContact">Vendor Contact</Label>
                <Input
                  id="vendorContact"
                  value={formData.vendorContact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorContact: e.target.value }))}
                  placeholder="email@vendor.com"
                />
              </div>
            </div>
          </div>

          {/* Total Calculation */}
          {formData.price > 0 && formData.requestQuantity > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${(formData.requestQuantity * formData.price).toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
