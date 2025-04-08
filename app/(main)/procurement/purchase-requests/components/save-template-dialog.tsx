"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookmarkIcon, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PurchaseRequest } from "@/lib/types"
import { PRTemplate, TemplateItem } from "@/lib/types/pr-template"

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: PRTemplate) => void
  purchaseRequest: PurchaseRequest
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
  purchaseRequest,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")

  const handleSave = () => {
    const template: PRTemplate = {
      id: crypto.randomUUID(),
      name: templateName,
      description,
      type: "template",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      items: purchaseRequest.items?.map(item => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        itemCode: "",
        description: item.description,
        uom: item.unit,
        quantity: item.quantityRequested,
        unitPrice: item.price,
        currency: item.currency,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
        deliveryPoint: item.deliveryPoint,
        location: item.location,
        unit: item.unit,
        quantityRequested: item.quantityRequested,
        quantityApproved: item.quantityApproved,
        deliveryDate: item.deliveryDate,
        currencyRate: item.currencyRate,
        price: item.price,
        foc: item.foc,
        taxIncluded: item.taxIncluded,
        adjustments: item.adjustments,
        vendor: item.vendor,
        pricelistNumber: item.pricelistNumber,
        comment: item.comment,
        itemCategory: item.itemCategory,
        itemSubcategory: item.itemSubcategory,
        inventoryInfo: item.inventoryInfo,
        accountCode: item.accountCode,
        jobCode: item.jobCode,
        baseSubTotalPrice: item.baseSubTotalPrice,
        subTotalPrice: item.subTotalPrice,
        baseNetAmount: item.baseNetAmount,
        netAmount: item.netAmount,
        baseDiscAmount: item.baseDiscAmount,
        discountAmount: item.discountAmount,
        baseTaxAmount: item.baseTaxAmount,
        taxAmount: item.taxAmount,
        baseTotalAmount: item.baseTotalAmount,
        totalAmount: item.totalAmount
      })) || []
    }
    onSave(template)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5" />
            Save as Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description"
            />
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm">
                <p className="font-medium">Items to be saved:</p>
                <p className="text-muted-foreground">
                  {purchaseRequest.items?.length || 0} items will be saved in this template
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 