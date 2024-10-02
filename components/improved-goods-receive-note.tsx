'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, HelpCircle } from "lucide-react"

const mockData = {
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

export function GoodsReceiveNoteComponent() {
  const [mode, setMode] = React.useState<Mode>("view")
  const [formData, setFormData] = React.useState(mockData)
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
            <Badge variant="destructive" className="px-2 py-1 text-sm font-medium">{formData.status}</Badge>
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
        <div className="grid grid-cols-6 gap-4 mb-4">
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
            <Label htmlFor="invoice-date" className="text-sm font-medium">Invoice Date</Label>
            <Input
              id="invoice-date"
              name="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={handleInputChange}
              readOnly={!isEditable}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice" className="text-sm font-medium">Invoice#</Label>
            <Input
              id="invoice"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              readOnly={!isEditable}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-invoice-date" className="text-sm font-medium">Tax Invoice Date</Label>
            <Input
              id="tax-invoice-date"
              name="taxInvoiceDate"
              type="date"
              value={formData.taxInvoiceDate}
              onChange={handleInputChange}
              readOnly={!isEditable}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-invoice" className="text-sm font-medium">Tax Invoice#</Label>
            <Input
              id="tax-invoice"
              name="taxInvoiceNumber"
              value={formData.taxInvoiceNumber}
              onChange={handleInputChange}
              readOnly={!isEditable}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2 col-span-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
            {isDescriptionExpanded && (
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiver" className="text-sm font-medium">Receiver</Label>
            <Select
              value={formData.receiver}
              onValueChange={(value) => handleSelectChange("receiver", value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="receiver" className="h-8 text-sm">
                <SelectValue placeholder="Select receiver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.receiver}>{formData.receiver}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor" className="text-sm font-medium">Vendor</Label>
            <Select
              value={formData.vendor}
              onValueChange={(value) => handleSelectChange("vendor", value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="vendor" className="h-8 text-sm">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.vendor}>{formData.vendor}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleSelectChange("location", value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="location" className="h-8 text-sm">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.location}>{formData.location}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleSelectChange("currency", value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="currency" className="h-8 text-sm">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.currency}>{formData.currency}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consignment"
                      checked={formData.isConsignment}
                      onCheckedChange={(checked) => handleCheckboxChange("isConsignment", checked as boolean)}
                      disabled={!isEditable}
                    />
                    <Label htmlFor="consignment" className="text-sm font-medium flex items-center">
                      Consignment
                      <HelpCircle className="w-4 h-4 ml-1" />
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Goods sent for sale with the expectation of future payment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cash"
                checked={formData.isCash}
                onCheckedChange={(checked) => handleCheckboxChange("isCash", checked as boolean)}
                disabled={!isEditable}
              />
              <Label htmlFor="cash" className="text-sm font-medium">Cash</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cash-book" className="text-sm font-medium">Cash Book</Label>
            <Select
              value={formData.cashBook}
              onValueChange={(value) => handleSelectChange("cashBook", value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="cash-book" className="h-8 text-sm w-full">
                <SelectValue placeholder="Select cash book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.cashBook}>{formData.cashBook}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
            <TabsTrigger value="extra-costs" className="flex-1">Extra Costs</TabsTrigger>
            <TabsTrigger value="stock-movement" className="flex-1">Stock Movement</TabsTrigger>
            <TabsTrigger value="comments-attachments" className="flex-1">Comments & Attachments</TabsTrigger>
            <TabsTrigger value="activity-log" className="flex-1">Activity Log</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )
}