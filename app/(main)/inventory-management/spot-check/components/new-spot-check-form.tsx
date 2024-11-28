"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { SpotCheckDetails } from "../types"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package } from "lucide-react"

interface InventoryItem {
  id: string
  code: string
  name: string
  category: string
  subcategory: string
  unit: string
  value: number
  lastCountDate: Date | null
  location: string
  stockLevel: number
}

const formSchema = z.object({
  counterId: z.string({
    required_error: "Please select a counter",
  }),
  departmentId: z.string({
    required_error: "Please select a department",
  }),
  storeId: z.string({
    required_error: "Please select a store",
  }),
  countDate: z.date({
    required_error: "Please select a count date",
  }),
  selectionType: z.enum(["random", "highValue"], {
    required_error: "Please select an item selection method",
  }),
  itemCount: z.number({
    required_error: "Please enter the number of items",
  }).min(1, "Must select at least 1 item").max(100, "Maximum 100 items"),
  minimumPrice: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Store {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface Counter {
  id: string
  name: string
}

interface NewSpotCheckFormProps {
  stores: Store[]
  departments: Department[]
  counters: Counter[]
  onSubmit: (details: SpotCheckDetails) => void
}

function generateCountId(): string {
  const timestamp = new Date().getTime()
  const random = Math.floor(Math.random() * 1000)
  return `SC-${timestamp}-${random}`
}

// Mock items with different categories, values, and attributes
const mockItems: InventoryItem[] = [
  // High Value Items - Kitchen Equipment
  {
    id: "KE001",
    code: "KE-001",
    name: "Commercial Food Processor",
    category: "Kitchen Equipment",
    subcategory: "Food Preparation",
    unit: "unit",
    value: 2500.00,
    lastCountDate: new Date('2024-02-15'),
    location: "Main Kitchen",
    stockLevel: 2
  },
  {
    id: "KE002",
    code: "KE-002",
    name: "Industrial Stand Mixer",
    category: "Kitchen Equipment",
    subcategory: "Baking Equipment",
    unit: "unit",
    value: 3200.00,
    lastCountDate: new Date('2024-01-20'),
    location: "Pastry Kitchen",
    stockLevel: 1
  },
  
  // Medium Value Items - Smallwares
  {
    id: "SW001",
    code: "SW-001",
    name: "Professional Knife Set",
    category: "Smallwares",
    subcategory: "Kitchen Tools",
    unit: "set",
    value: 850.00,
    lastCountDate: new Date('2024-03-01'),
    location: "Main Kitchen",
    stockLevel: 5
  },
  {
    id: "SW002",
    code: "SW-002",
    name: "Stainless Steel Pots Set",
    category: "Smallwares",
    subcategory: "Cookware",
    unit: "set",
    value: 650.00,
    lastCountDate: new Date('2024-02-28'),
    location: "Main Kitchen",
    stockLevel: 3
  },

  // Regular Items - F&B Dry Goods
  {
    id: "FD001",
    code: "FD-001",
    name: "Premium Basmati Rice",
    category: "F&B",
    subcategory: "Dry Goods",
    unit: "kg",
    value: 45.00,
    lastCountDate: new Date('2024-03-10'),
    location: "Dry Store",
    stockLevel: 250
  },
  {
    id: "FD002",
    code: "FD-002",
    name: "Extra Virgin Olive Oil",
    category: "F&B",
    subcategory: "Oils & Vinegars",
    unit: "liter",
    value: 35.00,
    lastCountDate: new Date('2024-03-05'),
    location: "Dry Store",
    stockLevel: 100
  },

  // Perishables
  {
    id: "FP001",
    code: "FP-001",
    name: "Premium Beef Tenderloin",
    category: "F&B",
    subcategory: "Meat",
    unit: "kg",
    value: 120.00,
    lastCountDate: new Date('2024-03-15'),
    location: "Cold Room",
    stockLevel: 45
  },
  {
    id: "FP002",
    code: "FP-002",
    name: "Norwegian Salmon",
    category: "F&B",
    subcategory: "Seafood",
    unit: "kg",
    value: 85.00,
    lastCountDate: new Date('2024-03-15'),
    location: "Cold Room",
    stockLevel: 30
  },

  // Housekeeping Items
  {
    id: "HK001",
    code: "HK-001",
    name: "Luxury Bath Towels",
    category: "Housekeeping",
    subcategory: "Linens",
    unit: "piece",
    value: 25.00,
    lastCountDate: new Date('2024-02-20'),
    location: "Linen Room",
    stockLevel: 500
  },
  {
    id: "HK002",
    code: "HK-002",
    name: "Premium Bed Sheets",
    category: "Housekeeping",
    subcategory: "Linens",
    unit: "piece",
    value: 45.00,
    lastCountDate: new Date('2024-02-25'),
    location: "Linen Room",
    stockLevel: 300
  }
]

// Function to filter items based on criteria
function filterItems(criteria: FormValues): InventoryItem[] {
  let filteredItems = [...mockItems]

  // Filter by department
  if (criteria.departmentId) {
    const departmentMap: { [key: string]: string[] } = {
      '1': ['F&B', 'Kitchen Equipment', 'Smallwares'],
      '2': ['Housekeeping'],
      '3': ['Maintenance'],
    }
    const allowedCategories = departmentMap[criteria.departmentId] || []
    filteredItems = filteredItems.filter(item => allowedCategories.includes(item.category))
  }

  // Filter by store location
  if (criteria.storeId) {
    const locationMap: { [key: string]: string[] } = {
      '1': ['Main Kitchen', 'Pastry Kitchen'],
      '2': ['Dry Store'],
      '3': ['Cold Room'],
      '4': ['Linen Room'],
      '5': ['Equipment Store']
    }
    const allowedLocations = locationMap[criteria.storeId] || []
    filteredItems = filteredItems.filter(item => allowedLocations.includes(item.location))
  }

  // Apply selection criteria
  if (criteria.selectionType === 'highValue') {
    const minPrice = criteria.minimumPrice || 500 // Default minimum for high value items
    filteredItems = filteredItems.filter(item => item.value >= minPrice)
  }

  // Sort by different criteria based on selection type
  if (criteria.selectionType === 'highValue') {
    filteredItems.sort((a, b) => b.value - a.value)
  } else {
    // For random selection, shuffle the array
    filteredItems = filteredItems.sort(() => Math.random() - 0.5)
  }

  // Limit to requested number of items
  return filteredItems.slice(0, criteria.itemCount || 10)
}

export function NewSpotCheckForm({
  stores,
  departments,
  counters,
  onSubmit,
}: NewSpotCheckFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countDate: new Date(),
      selectionType: "random",
      itemCount: 10,
    },
  })

  const fetchSelectedItems = async (values: FormValues) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    const items = filterItems(values)
    setSelectedItems(items)
    return items
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      console.log("Form values:", values)

      // Validate required fields
      if (!values.counterId || !values.departmentId || !values.storeId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        })
        return
      }

      // Fetch selected items based on criteria
      const items = await fetchSelectedItems(values)

      const details: SpotCheckDetails = {
        countId: generateCountId(),
        counter: counters.find(c => c.id === values.counterId)?.name || "",
        department: departments.find(d => d.id === values.departmentId)?.name || "",
        store: stores.find(s => s.id === values.storeId)?.name || "",
        date: values.countDate,
        selectedItems: items.map(item => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.category,
          expectedQuantity: 0,
          unit: item.unit
        }))
      }

      console.log("Submitting details:", details)
      await onSubmit(details)
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create spot check. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add effect to update selected items when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only fetch items if relevant fields change
      if (["itemCount", "selectionType", "minimumPrice", "departmentId", "storeId"].includes(name || "")) {
        const values = form.getValues()
        if (values.itemCount && values.selectionType && values.departmentId && values.storeId) {
          fetchSelectedItems(values)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New Spot Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="counterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a counter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {counters.map((counter) => (
                          <SelectItem key={counter.id} value={counter.id}>
                            {counter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Count Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selectionType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Item Selection Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="random" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Random Selection
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="highValue" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            High Value Items
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemCount"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Number of Items</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        onChange={e => onChange(Number(e.target.value))}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Select how many items to include in the spot check (1-100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("selectionType") === "highValue" && (
                <FormField
                  control={form.control}
                  name="minimumPrice"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Minimum Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Enter minimum price"
                          onChange={e => onChange(Number(e.target.value))}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Only include items with price above this value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Creating..." : "Create Spot Check"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Selected Items</CardTitle>
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} items
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] px-4">
            {selectedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Package className="h-8 w-8 mb-4 opacity-50" />
                <p className="text-sm">No items selected yet</p>
                <p className="text-sm">Items will appear here after setting up the spot check criteria</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {selectedItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.code}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${item.value.toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category: </span>
                        {item.category}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location: </span>
                        {item.location}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock: </span>
                        {item.stockLevel} {item.unit}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Count: </span>
                        {item.lastCountDate ? new Date(item.lastCountDate).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 