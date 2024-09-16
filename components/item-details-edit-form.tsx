'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { format, parse } from "date-fns"
import { Calendar as CalendarIcon, X, HelpCircle, Upload, Users, BarChart2, Package, TruckIcon, Edit, Trash2, Plus } from "lucide-react"

type ItemDetailsFormProps = {
  onSave: (formData: FormData) => void
  onCancel: () => void
  onDelete?: () => void
  initialData?: any
}

type FormMode = 'add' | 'edit' | 'view'

const sampleItemData = {
  location: "FB: Food & Beverage",
  name: "Premium Coffee Beans",
  description: "Organic, fair-trade coffee beans (1kg bag)",
  unit: "Bag",
  quantityRequested: 50,
  quantityApproved: 45,
  deliveryDate: "2023-08-15",
  deliveryPoint: "2: Main Kitchen",
  currency: "USD",
  currencyRate: 1.0,
  price: 15.99,
  foc: 2,
  netAmount: 767.52,
  adjustment: true,
  discountAmount: 38.38,
  taxAmount: 72.91,
  totalAmount: 802.05,
  vendor: "Global Coffee Suppliers Ltd.",
  vendorItemCode: "GCS-PREM-COF-1KG",
  comment: "High-demand item. Consider increasing regular order quantity.",
  image: "https://example.com/images/premium-coffee-beans.jpg",
  createdBy: "Sarah Johnson",
  createdDate: "2023-06-01",
  lastModifiedBy: "Mike Thompson",
  lastModifiedDate: "2023-07-10",
  itemCategory: "Food & Beverage",
  itemSubcategory: "Coffee & Tea",
  inventoryInfo: {
    onHand: 75,
    onOrdered: 100,
    reorderLevel: 30,
    restockLevel: 200,
    averageMonthlyUsage: 120,
    lastPrice: 15.50,
    lastOrderDate: "2023-05-15",
    lastVendor: "Global Coffee Suppliers Ltd."
  }
}

export function ItemDetailsEditForm({ onSave, onCancel, onDelete, initialData = sampleItemData }: ItemDetailsFormProps) {
  const [mode, setMode] = useState<FormMode>(initialData ? 'view' : 'add')
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    initialData?.deliveryDate ? parse(initialData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined
  )
  const [image, setImage] = useState<string | null>(initialData?.image || null)
  const [formData, setFormData] = useState(initialData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormData(initialData)
    setDeliveryDate(initialData?.deliveryDate ? parse(initialData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined)
    setImage(initialData?.image || null)
  }, [initialData])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formDataToSubmit = new FormData(event.currentTarget)
    if (deliveryDate) {
      formDataToSubmit.set('deliveryDate', format(deliveryDate, 'yyyy-MM-dd'))
    }
    onSave(formDataToSubmit)
    setMode('view')
  }

  const FormField = ({ id, label, required = false, tooltip, children, smallText, baseValue }: any) => (
    <div>
      <div className="flex items-center space-x-2">
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {mode === 'view' ? (
        <div className="mt-1 text-sm">{formData[id] || 'N/A'}</div>
      ) : (
        children
      )}
      {smallText && <div className="text-xs text-muted-foreground mt-1">{smallText}</div>}
      {baseValue && <div className="text-xs text-muted-foreground mt-1">Base: {baseValue}</div>}
    </div>
  )

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{mode === 'add' ? 'Add New Item' : 'Item Details'}</CardTitle>
        {mode === 'view' && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setMode('edit')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
        {mode === 'add' && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Vendor</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField id="location" label="Location" required tooltip="The location where this item is stored">
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="name" label="Name" required tooltip="Name of the item">
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="description" label="Description" required tooltip="Brief description of the item">
                  <Input 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField 
                  id="unit" 
                  label="Unit" 
                  required 
                  tooltip="Unit of measurement for this item"
                  smallText="Base: Kg | 1 Bag = 0.5 Kg"
                >
                  <Input 
                    id="unit" 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField 
                  id="quantityRequested" 
                  label="Quantity Requested" 
                  required 
                  tooltip="Amount of items requested"
                  smallText="5 Kg"
                >
                  <Input 
                    id="quantityRequested" 
                    name="quantityRequested" 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={formData.quantityRequested} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField 
                  id="quantityApproved" 
                  label="Quantity Approved" 
                  tooltip="Amount of items approved (if different from requested)"
                  smallText="4.5 Kg"
                >
                  <Input 
                    id="quantityApproved" 
                    name="quantityApproved" 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={formData.quantityApproved} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="deliveryDate" label="Delivery Date" required tooltip="Expected date of delivery">
                  {mode === 'view' ? (
                    <div>{deliveryDate ? format(deliveryDate, "PPP") : 'Not set'}</div>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={(date) => {
                            setDeliveryDate(date)
                            setFormData(prevData => ({ ...prevData, deliveryDate: date ? format(date, 'yyyy-MM-dd') : '' }))
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </FormField>
                <FormField id="deliveryPoint" label="Delivery Point" tooltip="Specific location for delivery">
                  <Input 
                    id="deliveryPoint" 
                    name="deliveryPoint" 
                    value={formData.deliveryPoint} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
              </div>
              
              {/* Inventory Information */}
              <div className="bg-muted p-4 rounded-md mt-6">
                <h3 className="font-semibold mb-2 text-sm">Inventory Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="font-medium">On Hand</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.onHand} Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">On Ordered</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.onOrdered} Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Reorder Level</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.reorderLevel} Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Restock Level</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.restockLevel} Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Average Monthly Usage</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.averageMonthlyUsage} Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Price</p>
                    <p className="text-muted-foreground">${formData.inventoryInfo?.lastPrice} per Kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Order Date</p>
                    <p className="text-muted-foreground">{formData.inventoryInfo?.lastOrderDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Vendor</p>
                    <p className="text-mute d-foreground">{formData.inventoryInfo?.lastVendor}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button type="button" variant="outline" disabled={mode === 'view'}>
                  <Package className="mr-2 h-4 w-4" />
                  On Hand
                </Button>
                <Button type="button" variant="outline" disabled={mode === 'view'}>
                  <TruckIcon className="mr-2 h-4 w-4" />
                  On Order
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField id="currency" label="Currency" required tooltip="Currency for pricing" baseValue="USD">
                  <Select 
                    name="currency" 
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prevData => ({ ...prevData, currency: value }))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB - Thai Baht</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField id="currencyRate" label="Currency Rate" tooltip="Exchange rate if applicable" baseValue="1.000000">
                  <Input 
                    id="currencyRate" 
                    name="currencyRate" 
                    type="number" 
                    step="0.000001" 
                    value={formData.currencyRate} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="price" label="Price" required tooltip="Price per unit" baseValue="$5.99">
                  <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={handleInputChange}
                    required 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="foc" label="FOC Quantity" tooltip="Free of Charge quantity" baseValue="0">
                  <Input 
                    id="foc" 
                    name="foc" 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={formData.foc} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="netAmount" label="Net Amount" tooltip="Net amount before discounts and taxes" baseValue="$59.90">
                  <Input 
                    id="netAmount" 
                    name="netAmount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.netAmount} 
                    onChange={handleInputChange}
                    readOnly 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="adjustment" label="Adjustment" tooltip="Check if price adjustment is needed">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="adjustment" 
                      name="adjustment" 
                      checked={formData.adjustment}
                      onCheckedChange={(checked) => setFormData(prevData => ({ ...prevData, adjustment: checked }))}
                      disabled={mode === 'view'} 
                    />
                    <Label htmlFor="adjustment">Price Adjustment</Label>
                  </div>
                </FormField>
                <FormField id="discountAmount" label="Discount Amount" tooltip="Total discount amount" baseValue="$0.00">
                  <Input 
                    id="discountAmount" 
                    name="discountAmount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.discountAmount} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="taxAmount" label="Tax Amount" tooltip="Total tax amount" baseValue="$4.19">
                  <Input 
                    id="taxAmount" 
                    name="taxAmount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.taxAmount} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="totalAmount" label="Total Amount" tooltip="Final total amount" baseValue="$64.09">
                  <Input 
                    id="totalAmount" 
                    name="totalAmount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.totalAmount} 
                    onChange={handleInputChange}
                    readOnly 
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="vendor" label="Vendor" tooltip="Current vendor for this item">
                  <Input 
                    id="vendor" 
                    name="vendor" 
                    value={formData.vendor} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
                <FormField id="vendorItemCode" label="Vendor Item Code" tooltip="Vendor's code for this item">
                  <Input 
                    id="vendorItemCode" 
                    name="vendorItemCode" 
                    value={formData.vendorItemCode} 
                    onChange={handleInputChange}
                    disabled={mode === 'view'} 
                  />
                </FormField>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button type="button" variant="outline" disabled={mode === 'view'}>
                  <Users className="mr-2 h-4 w-4" />
                  Allocate Vendor
                </Button>
                <Button type="button" variant="outline" disabled={mode === 'view'}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Vendor Comparison
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="additional" className="space-y-4">
              <FormField id="comment" label="Comment" tooltip="Any additional notes or comments">
                <Textarea 
                  id="comment" 
                  name="comment" 
                  placeholder="Add any additional notes here" 
                  value={formData.comment} 
                  onChange={handleInputChange}
                  disabled={mode === 'view'} 
                />
              </FormField>
              <FormField id="image" label="Image Attachment" tooltip="Upload an image of the item">
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  )}
                  {image && mode !== 'view' && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {image && (
                  <div className="mt-2">
                    <img src={image} alt="Attached" className="max-w-xs h-auto rounded-md" />
                  </div>
                )}
              </FormField>
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Created By</p>
                    <p className="text-muted-foreground">{formData.createdBy}</p>
                  </div>
                  <div>
                    <p className="font-medium">Created Date</p>
                    <p className="text-muted-foreground">{formData.createdDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Modified By</p>
                    <p className="text-muted-foreground">{formData.lastModifiedBy}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Modified Date</p>
                    <p className="text-muted-foreground">{formData.lastModifiedDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Item Category</p>
                    <p className="text-muted-foreground">{formData.itemCategory}</p>
                  </div>
                  <div>
                    <p className="font-medium">Item Subcategory</p>
                    <p className="text-muted-foreground">{formData.itemSubcategory}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        {mode === 'view' ? (
          <Button variant="outline" onClick={() => setMode('edit')}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => {
              setMode('view')
              setFormData(initialData)
              setDeliveryDate(initialData?.deliveryDate ? parse(initialData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined)
              setImage(initialData?.image || null)
            }}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>Save</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}