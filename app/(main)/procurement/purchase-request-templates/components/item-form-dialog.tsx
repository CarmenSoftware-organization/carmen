"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TemplateItem } from "../types/template-items"
import { CurrencyCode } from "@/lib/types"

const formSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  description: z.string().min(1, "Description is required"),
  uom: z.string().min(1, "UOM is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  budgetCode: z.string().min(1, "Budget code is required"),
  accountCode: z.string().min(1, "Account code is required"),
  department: z.string().min(1, "Department is required"),
  taxCode: z.string().min(1, "Tax code is required"),
  currency: z.nativeEnum(CurrencyCode),
  currencyRate: z.number().min(0.01, "Exchange rate must be positive"),
  taxIncluded: z.boolean().default(false),
  discountRate: z.number().min(0, "Discount rate must be non-negative"),
  taxRate: z.number().min(0, "Tax rate must be non-negative"),
  adjustments: z.object({
    discount: z.boolean().default(false),
    tax: z.boolean().default(false),
  }).default({
    discount: false,
    tax: false,
  }),
})

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<TemplateItem>) => void
  initialData?: TemplateItem
  mode: "add" | "edit"
}

export function ItemFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ItemFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      itemCode: "",
      description: "",
      uom: "",
      quantity: 0,
      unitPrice: 0,
      budgetCode: "",
      accountCode: "",
      department: "",
      taxCode: "",
      currency: CurrencyCode.USD,
      currencyRate: 1,
      taxIncluded: false,
      discountRate: 0,
      taxRate: 0,
      adjustments: {
        discount: false,
        tax: false,
      },
    },
  })

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    baseAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    const quantity = form.watch('quantity') || 0
    const unitPrice = form.watch('unitPrice') || 0
    const discountRate = form.watch('discountRate') || 0
    const taxRate = form.watch('taxRate') || 0

    const baseAmount = quantity * unitPrice
    const discountAmount = baseAmount * (discountRate / 100)
    const netAmount = baseAmount - discountAmount
    const taxAmount = netAmount * (taxRate / 100)
    const totalAmount = netAmount + taxAmount

    setCalculatedAmounts({
      baseAmount,
      discountAmount,
      netAmount,
      taxAmount,
      totalAmount,
    })
  }, [
    form.watch('quantity'),
    form.watch('unitPrice'),
    form.watch('discountRate'),
    form.watch('taxRate')
  ])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const totalAmount = calculatedAmounts.totalAmount
    onSubmit({
      ...values,
      totalAmount,
      id: initialData?.id || Date.now().toString(),
    })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Item" : "Edit Item"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="h-8 text-sm resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Quantity and UOM */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quantity and UOM</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="uom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UOM</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select UOM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="EA">EA</SelectItem>
                            <SelectItem value="BTL">BTL</SelectItem>
                            <SelectItem value="CTN">CTN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="h-8 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Pricing Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={CurrencyCode.USD}>USD</SelectItem>
                              <SelectItem value={CurrencyCode.EUR}>EUR</SelectItem>
                              <SelectItem value={CurrencyCode.GBP}>GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currencyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exch. Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxIncluded"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start justify-end h-[68px]">
                          <FormLabel>Tax Included</FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name="adjustments.discount"
                        render={({ field }) => (
                          <FormItem className="flex items-end gap-2">
                            <div>
                              <FormLabel>Adj.</FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountRate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Disc. Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name="adjustments.tax"
                        render={({ field }) => (
                          <FormItem className="flex items-end gap-2">
                            <div>
                              <FormLabel>Adj.</FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Calculated Amounts */}
                  <div className="grid grid-cols-4 gap-4 bg-muted p-4 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Base Amount</p>
                      <p className="text-lg">{calculatedAmounts.baseAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Discount</p>
                      <p className="text-lg">{calculatedAmounts.discountAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tax</p>
                      <p className="text-lg">{calculatedAmounts.taxAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-lg font-bold">{calculatedAmounts.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Code</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8 text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kitchen">Kitchen</SelectItem>
                            <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select tax code" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VAT7">VAT 7%</SelectItem>
                            <SelectItem value="VAT0">VAT 0%</SelectItem>
                            <SelectItem value="EXEMPT">Exempt</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
            {mode === "add" ? "Add Item" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 