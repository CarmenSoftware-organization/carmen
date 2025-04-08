'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, HelpCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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
        </div>
      </CardContent>
    </Card>
  )
} 