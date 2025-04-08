"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TemplateItem } from "../types/template-items"
import { CurrencyCode } from "@/lib/types"

interface ItemFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: TemplateItem) => void
  item?: TemplateItem
  mode: "add" | "edit"
}

const itemSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  description: z.string().min(1, "Description is required"),
  uom: z.string().min(1, "UOM is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  budgetCode: z.string().min(1, "Budget code is required"),
  accountCode: z.string().min(1, "Account code is required"),
  department: z.string().min(1, "Department is required"),
  taxCode: z.string().min(1, "Tax code is required"),
  currency: z.nativeEnum(CurrencyCode)
})

type ItemFormValues = z.infer<typeof itemSchema>

export function ItemFormDialog({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
}: ItemFormDialogProps) {
  const form = useForm<ItemFormValues>({
    defaultValues: {
      itemCode: item?.itemCode || "",
      description: item?.description || "",
      uom: item?.uom || "",
      quantity: item?.quantity || 0,
      unitPrice: item?.unitPrice || 0,
      budgetCode: item?.budgetCode || "",
      accountCode: item?.accountCode || "",
      department: item?.department || "",
      taxCode: item?.taxCode || "",
      currency: item?.currency || CurrencyCode.USD
    },
  })

  const handleSubmit = (values: ItemFormValues) => {
    onSave({
      id: item?.id || crypto.randomUUID(),
      ...values,
      totalAmount: values.quantity * values.unitPrice
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Item" : "Edit Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemCode">Item Code</Label>
              <Input
                id="itemCode"
                {...form.register("itemCode")}
                placeholder="Enter item code"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter item description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uom">Unit of Measure</Label>
                <Input
                  id="uom"
                  {...form.register("uom")}
                  placeholder="Enter UOM"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...form.register("quantity", { valueAsNumber: true })}
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  {...form.register("unitPrice", { valueAsNumber: true })}
                  placeholder="Enter unit price"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  {...form.register("currency")}
                  placeholder="Enter currency"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetCode">Budget Code</Label>
                <Input
                  id="budgetCode"
                  {...form.register("budgetCode")}
                  placeholder="Enter budget code"
                />
              </div>
              <div>
                <Label htmlFor="accountCode">Account Code</Label>
                <Input
                  id="accountCode"
                  {...form.register("accountCode")}
                  placeholder="Enter account code"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...form.register("department")}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="taxCode">Tax Code</Label>
                <Input
                  id="taxCode"
                  {...form.register("taxCode")}
                  placeholder="Enter tax code"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 