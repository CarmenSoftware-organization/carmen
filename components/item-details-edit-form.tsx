import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
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
import { toast } from 'sonner'

'use client'

interface FormData {
  id: string
  name: string
  description: string
  quantity: number
  image?: string
  status: string
  location: string
  unit: string
  quantityRequested: number
  quantityApproved: number
  deliveryDate: string
  deliveryPoint: string
  currency: string
  vendorItemCode: string
  comment: string
  createdBy: string
  createdDate: string
  price: number
  inventoryInfo: {
    onHand: number
    onOrdered: number
    reorderLevel: number
    restockLevel: number
    averageMonthlyUsage: number
    lastPrice: number
    lastOrderDate: string
    lastVendor: string
  }
}

interface ItemDetailsEditFormProps {
  initialData: FormData
  onSave: (data: FormData) => void
  onCancel: () => void
  onDelete: () => void
}

type FormMode = 'add' | 'edit' | 'view'

interface FormFieldProps {
  id: keyof FormData
  label: string
  required?: boolean
  tooltip?: string
  children: React.ReactNode
  smallText?: string
  baseValue?: string | number
}

const sampleItemData: FormData = {
  id: "ITEM-123456",
  status: 'Accepted',
  location: "FB: Food & Beverage",
  name: "Premium Coffee Beans",
  description: "Organic, fair-trade coffee beans (1kg bag)",
  quantity: 50,
  unit: "Bag",
  quantityRequested: 50,
  quantityApproved: 45,
  deliveryDate: "2023-08-15",
  deliveryPoint: "2: Main Kitchen",
  currency: "USD",
  vendorItemCode: "GCS-PREM-COF-1KG",
  comment: "High-demand item. Consider increasing regular order quantity.",
  image: "https://example.com/images/premium-coffee-beans.jpg",
  createdBy: "Sarah Johnson",
  createdDate: "2023-06-01",
  price: 15.99,
  inventoryInfo: {
    onHand: 75,
    onOrdered: 50,
    reorderLevel: 30,
    restockLevel: 200,
    averageMonthlyUsage: 100,
    lastPrice: 15.99,
    lastOrderDate: "2023-07-10",
    lastVendor: "Global Coffee Suppliers Ltd."
  }
}

export function ItemDetailsEditForm({ initialData, onSave, onCancel, onDelete }: ItemDetailsEditFormProps) {
  const [mode, setMode] = useState<FormMode>(initialData ? 'view' : 'add')
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    initialData?.deliveryDate ? parse(initialData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined
  )
  const [image, setImage] = useState<string | undefined>(initialData?.image)
  const [formData, setFormData] = useState<FormData>({
    ...initialData,
    image: initialData.image || undefined
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormData(initialData)
    setDeliveryDate(initialData?.deliveryDate ? parse(initialData.deliveryDate, 'yyyy-MM-dd', new Date()) : undefined)
    setImage(initialData?.image || undefined)
  }, [initialData])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please upload an image file"
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File too large", {
          description: "Image must be less than 5MB"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const submissionData: FormData = {
      ...formData,
      deliveryDate: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : formData.deliveryDate,
      image: image
    }

    try {
      onSave(submissionData)
      setMode('view')
      toast.success("Item details updated", {
        description: "The item details have been updated successfully."
      })
    } catch (error) {
      console.error('Error updating item details:', error)
      toast.error("Error updating item details", {
        description: "There was a problem updating the item details."
      })
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleCheckboxChange = (checked: boolean | string, field: keyof FormData) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: typeof checked === 'boolean' ? checked : checked === 'true'
    }))
  }

  const FormField = ({ id, label, required = false, tooltip, children, smallText, baseValue }: FormFieldProps) => (
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
        <div className="mt-1 text-sm">{String(formData[id])}</div>
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
                            setFormData((prevData: typeof initialData) => ({ ...prevData, deliveryDate: date ? format(date, 'yyyy-MM-dd') : '' }))
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
                    onValueChange={(value) => setFormData((prevData: typeof initialData) => ({ ...prevData, currency: value }))}
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
              <FormField id="image" label="Image Attachment" tooltip="Upload an image of the item (max 5MB)">
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
                  <div className="mt-2 relative w-[320px] h-[240px]">
                    <Image
                      src={image}
                      alt="Item preview"
                      fill
                      sizes="(max-width: 320px) 100vw, 320px"
                      className="rounded-md object-contain"
                      priority={false}
                    />
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
              setImage(initialData?.image || undefined)
            }}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}