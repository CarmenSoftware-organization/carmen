'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, HelpCircle } from "lucide-react"

interface GoodsReceiveNoteData {
  id: string
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
  ref: string
  date: string
  invoiceDate: string
  invoiceNumber: string
  taxInvoiceDate: string
  taxInvoiceNumber: string
  description: string
  receiver: string
  vendor: string
  location: string
  currency: string
  isConsignment: boolean
  isCash: boolean
  cashBook: string
}

const mockData: GoodsReceiveNoteData = {
  id: "GRN004",
  status: "Pending",
  ref: "REF-2024-001",
  date: "2024-09-29",
  invoiceDate: "2024-09-29",
  invoiceNumber: "INV-2024-001",
  taxInvoiceDate: "2024-09-30",
  taxInvoiceNumber: "TAX-2024-001",
  description: "Quarterly stock replenishment for Q4",
  receiver: "Central Warehouse",
  vendor: "Global Supplies Co.",
  location: "Main Storage Facility",
  currency: "USD",
  isConsignment: false,
  isCash: true,
  cashBook: "General Cash Book",
}

type Mode = "view" | "edit" | "add"

export function ImprovedGoodsReceiveNoteNew() {
  const [mode, setMode] = React.useState<Mode>("view")
  const [formData, setFormData] = React.useState<GoodsReceiveNoteData>(mockData)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSave = () => {
    console.log("Saving data:", formData)
    setMode("view")
  }

  const handleCancel = () => {
    setFormData(mockData)
    setMode("view")
  }

  const isEditable = mode === "edit" || mode === "add"

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-col space-y-1.5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <CardTitle>Goods Receive Note: {formData.id}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={formData.status === 'Approved' ? 'default' : formData.status === 'Rejected' ? 'destructive' : 'secondary'} 
                   className="px-2 py-1 text-sm font-medium">
              {formData.status}
            </Badge>
            {mode === "view" && (
              <>
                <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </>
            )}
            {isEditable && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              Print
            </Button>
            <Button variant="outline" size="sm">
              Send
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General Information</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ref" className="text-sm font-medium">Ref#</Label>
                <Input
                  id="ref"
                  name="ref"
                  value={formData.ref}
                  onChange={handleInputChange}
                  readOnly={!isEditable}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  readOnly={!isEditable}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-sm font-medium">Vendor</Label>
                <Select
                  name="vendor"
                  value={formData.vendor}
                  onValueChange={(value) => handleSelectChange("vendor", value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Global Supplies Co.">Global Supplies Co.</SelectItem>
                    <SelectItem value="Local Distributors Ltd.">Local Distributors Ltd.</SelectItem>
                    <SelectItem value="Premium Goods Inc.">Premium Goods Inc.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Select
                  name="location"
                  value={formData.location}
                  onValueChange={(value) => handleSelectChange("location", value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Storage Facility">Main Storage Facility</SelectItem>
                    <SelectItem value="Secondary Warehouse">Secondary Warehouse</SelectItem>
                    <SelectItem value="Distribution Center">Distribution Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  readOnly={!isEditable}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Type</Label>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isCash"
                      checked={formData.isCash}
                      onCheckedChange={(checked) => handleCheckboxChange("isCash", checked as boolean)}
                      disabled={!isEditable}
                    />
                    <Label htmlFor="isCash" className="text-sm">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isConsignment"
                      checked={formData.isConsignment}
                      onCheckedChange={(checked) => handleCheckboxChange("isConsignment", checked as boolean)}
                      disabled={!isEditable}
                    />
                    <Label htmlFor="isConsignment" className="text-sm">Consignment</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="items">
            <div className="text-center py-8 text-sm text-muted-foreground">
              Items tab content will be implemented here
            </div>
          </TabsContent>
          <TabsContent value="financial">
            <div className="text-center py-8 text-sm text-muted-foreground">
              Financial details tab content will be implemented here
            </div>
          </TabsContent>
          <TabsContent value="attachments">
            <div className="text-center py-8 text-sm text-muted-foreground">
              Attachments tab content will be implemented here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 