"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/context/simple-user-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Check,
  ClipboardCheck,
  Dice5,
  Filter,
  MapPin,
  Package,
  Plus,
  Search,
  Shuffle,
  Trash2,
  User,
  X,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Building
} from "lucide-react"
import {
  SpotCheckType,
  SpotCheckFormData,
  SpotCheckItem
} from "../types"
import { mockInventoryItems } from "@/lib/mock-data/inventory"

// Mock data for locations, departments, and users
const mockLocations = [
  { id: "loc-main-kitchen", name: "Main Kitchen" },
  { id: "loc-cold-storage", name: "Cold Storage" },
  { id: "loc-dry-storage", name: "Dry Storage" },
  { id: "loc-pastry", name: "Pastry Kitchen" },
  { id: "loc-bar", name: "Main Bar" },
  { id: "loc-wine-cellar", name: "Wine Cellar" },
  { id: "loc-receiving", name: "Receiving Dock" },
  { id: "loc-banquet", name: "Banquet Kitchen" }
]

const mockDepartments = [
  { id: "dept-kitchen", name: "Kitchen Operations" },
  { id: "dept-storage", name: "Storage & Logistics" },
  { id: "dept-beverage", name: "Beverage & Bar" },
  { id: "dept-pastry", name: "Pastry & Bakery" },
  { id: "dept-banquet", name: "Banquet Operations" }
]

const mockUsers = [
  { id: "user-001", name: "John Smith" },
  { id: "user-002", name: "Sarah Johnson" },
  { id: "user-003", name: "Mike Chen" },
  { id: "user-004", name: "Emily Davis" },
  { id: "user-005", name: "Robert Wilson" }
]

// Type configuration
const typeConfig: Record<SpotCheckType, { label: string; description: string; icon: React.ReactNode }> = {
  "random": {
    label: "Random Spot Check",
    description: "Randomly selected items for verification",
    icon: <Dice5 className="h-5 w-5" />
  },
  "targeted": {
    label: "Targeted Check",
    description: "Specific items flagged for investigation",
    icon: <Filter className="h-5 w-5" />
  },
  "high-value": {
    label: "High-Value Items",
    description: "Items above a specified value threshold",
    icon: <DollarSign className="h-5 w-5" />
  },
  "variance-based": {
    label: "Variance Investigation",
    description: "Items with historical variance issues",
    icon: <AlertTriangle className="h-5 w-5" />
  },
  "cycle-count": {
    label: "Cycle Count",
    description: "Scheduled periodic counting by category",
    icon: <BarChart3 className="h-5 w-5" />
  }
}

// Generate mock items for selection
const generateMockItems = () => {
  const categories = ['Grains & Cereals', 'Oils & Fats', 'Spices', 'Stocks & Sauces', 'Pasta & Noodles', 'Beverages', 'Dairy', 'Frozen Foods']
  const units = ['kg', 'L', 'pcs', 'bags', 'bottles', 'packs', 'boxes', 'tins']
  const locations = ['Main Store A1', 'Main Store A2', 'Cold Storage B1', 'Dry Storage C1', 'Kitchen Prep D1', 'Bar Storage E1']

  return Array.from({ length: 50 }, (_, i) => ({
    id: `item-${String(i + 1).padStart(3, '0')}`,
    itemCode: `INV-${String(1000 + i).substring(1)}`,
    itemName: [
      'Basmati Rice Premium', 'Olive Oil Extra Virgin', 'Black Pepper Ground',
      'Chicken Stock Powder', 'Pasta Penne', 'Jasmine Rice', 'Vegetable Oil',
      'Paprika Sweet', 'Beef Stock Cubes', 'Spaghetti', 'Coconut Milk',
      'Garlic Powder', 'Fish Sauce', 'Soy Sauce Dark', 'Tomato Paste',
      'Flour All Purpose', 'Sugar White', 'Salt Sea', 'Cumin Ground',
      'Turmeric Powder', 'Coriander Seeds', 'Cardamom Pods', 'Bay Leaves',
      'Thyme Dried', 'Oregano Dried', 'Basil Dried', 'Rosemary Dried',
      'Chili Flakes', 'Cinnamon Sticks', 'Vanilla Extract', 'Lemon Juice',
      'Wine Vinegar', 'Balsamic Vinegar', 'Mayonnaise', 'Mustard Dijon',
      'Ketchup', 'Hot Sauce', 'Worcestershire Sauce', 'Sesame Oil',
      'Peanut Oil', 'Butter Unsalted', 'Cream Heavy', 'Milk Full Fat',
      'Eggs Large', 'Cheese Parmesan', 'Cheese Cheddar', 'Mozzarella',
      'Bacon Strips', 'Ham Sliced', 'Salmon Fillet'
    ][i % 50],
    category: categories[i % categories.length],
    unit: units[i % units.length],
    location: locations[i % locations.length],
    systemQuantity: Math.floor(Math.random() * 100) + 10,
    value: Number((Math.random() * 500 + 20).toFixed(2)),
    lastCountDate: new Date(Date.now() - Math.random() * 86400000 * 60)
  }))
}

const allItems = generateMockItems()

export default function NewSpotCheckPage() {
  const router = useRouter()
  const { user } = useUser()

  // Form state
  const [step, setStep] = useState(1)
  const [checkType, setCheckType] = useState<SpotCheckType>("random")
  const [locationId, setLocationId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [selectionMethod, setSelectionMethod] = useState<"random" | "manual" | "category" | "value-based">("random")
  const [itemCount, setItemCount] = useState(10)
  const [minimumValue, setMinimumValue] = useState<number | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium")

  // Item selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showItemSelector, setShowItemSelector] = useState(false)

  // Get unique categories from items
  const categories = useMemo(() => {
    return [...new Set(allItems.map(item => item.category))].sort()
  }, [])

  // Filter available items
  const filteredItems = useMemo(() => {
    let items = [...allItems]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(item =>
        item.itemName.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term)
      )
    }

    if (categoryFilter !== "all") {
      items = items.filter(item => item.category === categoryFilter)
    }

    if (minimumValue && checkType === "high-value") {
      items = items.filter(item => item.value >= minimumValue)
    }

    return items
  }, [searchTerm, categoryFilter, minimumValue, checkType])

  // Get selected item details
  const selectedItemDetails = useMemo(() => {
    return allItems.filter(item => selectedItems.includes(item.id))
  }, [selectedItems])

  // Calculate total value of selected items
  const totalValue = useMemo(() => {
    return selectedItemDetails.reduce((sum, item) => sum + item.value, 0)
  }, [selectedItemDetails])

  // Auto-select random items
  const handleRandomSelection = () => {
    const shuffled = [...filteredItems].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(itemCount, shuffled.length))
    setSelectedItems(selected.map(item => item.id))
  }

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Select all filtered items
  const selectAllFiltered = () => {
    const filteredIds = filteredItems.map(item => item.id)
    setSelectedItems(prev => {
      const newSelection = new Set([...prev, ...filteredIds])
      return Array.from(newSelection)
    })
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([])
  }

  // Validate current step
  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return checkType !== undefined
      case 2:
        return locationId !== "" && departmentId !== "" && assignedTo !== ""
      case 3:
        return selectedItems.length > 0
      case 4:
        return reason.trim() !== ""
      default:
        return true
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    const formData: SpotCheckFormData = {
      checkType,
      locationId,
      departmentId,
      assignedTo,
      scheduledDate,
      dueDate: dueDate || null,
      selectionMethod,
      itemCount: selectedItems.length,
      minimumValue: minimumValue || null,
      categoryFilter: categoryFilter !== "all" ? categoryFilter : null,
      reason,
      notes,
      priority
    }

    console.log("Creating spot check:", formData)
    console.log("Selected items:", selectedItems)

    // Navigate to the spot check detail page (would be the newly created one)
    router.push("/inventory-management/spot-check")
  }

  // Navigate between steps
  const nextStep = () => {
    if (step < 4 && isStepValid(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Spot Check</h1>
          <p className="text-muted-foreground">Create a new inventory spot check</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Check Type" },
            { num: 2, label: "Assignment" },
            { num: 3, label: "Select Items" },
            { num: 4, label: "Review" }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s.num
                      ? "bg-primary text-primary-foreground"
                      : step > s.num
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  step === s.num ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {index < 3 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  step > s.num ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Select Check Type"}
            {step === 2 && "Assignment Details"}
            {step === 3 && "Select Items to Count"}
            {step === 4 && "Review & Create"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Choose the type of spot check you want to perform"}
            {step === 2 && "Specify the location, department, and assignee"}
            {step === 3 && "Select items to include in this spot check"}
            {step === 4 && "Review the details and create the spot check"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Check Type */}
          {step === 1 && (
            <div className="space-y-4">
              <RadioGroup
                value={checkType}
                onValueChange={(v) => setCheckType(v as SpotCheckType)}
                className="grid gap-4"
              >
                {Object.entries(typeConfig).map(([type, config]) => (
                  <div key={type}>
                    <RadioGroupItem
                      value={type}
                      id={type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        checkType === type
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        checkType === type ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      {checkType === type && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Separator />

              <div className="space-y-4">
                <Label>Priority Level</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as typeof priority)}
                  className="flex flex-wrap gap-4"
                >
                  {[
                    { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
                    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
                    { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
                    { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" }
                  ].map((p) => (
                    <div key={p.value} className="flex items-center">
                      <RadioGroupItem value={p.value} id={`priority-${p.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`priority-${p.value}`}
                        className={cn(
                          "px-4 py-2 rounded-full cursor-pointer transition-all",
                          priority === p.value
                            ? `${p.color} ring-2 ring-offset-2 ring-primary`
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {p.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Assignment */}
          {step === 2 && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {dept.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To *</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {u.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scheduled Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(scheduledDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => date && setScheduledDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Step 3: Item Selection */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Selection Method */}
              <div className="space-y-4">
                <Label>Selection Method</Label>
                <RadioGroup
                  value={selectionMethod}
                  onValueChange={(v) => setSelectionMethod(v as typeof selectionMethod)}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {[
                    { value: "random", label: "Random", icon: <Shuffle className="h-4 w-4" /> },
                    { value: "manual", label: "Manual", icon: <ClipboardCheck className="h-4 w-4" /> },
                    { value: "category", label: "By Category", icon: <Filter className="h-4 w-4" /> },
                    { value: "value-based", label: "By Value", icon: <DollarSign className="h-4 w-4" /> }
                  ].map((m) => (
                    <div key={m.value}>
                      <RadioGroupItem value={m.value} id={`method-${m.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`method-${m.value}`}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                          selectionMethod === m.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:bg-muted/50"
                        )}
                      >
                        {m.icon}
                        <span className="text-sm font-medium">{m.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Random Selection Options */}
              {selectionMethod === "random" && (
                <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="item-count">Number of Items</Label>
                    <Input
                      id="item-count"
                      type="number"
                      min={1}
                      max={50}
                      value={itemCount}
                      onChange={(e) => setItemCount(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <Button onClick={handleRandomSelection} className="gap-2">
                    <Shuffle className="h-4 w-4" />
                    Generate Random
                  </Button>
                </div>
              )}

              {/* Value-based Options */}
              {selectionMethod === "value-based" && (
                <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="min-value">Minimum Value ($)</Label>
                    <Input
                      id="min-value"
                      type="number"
                      min={0}
                      value={minimumValue || ""}
                      onChange={(e) => setMinimumValue(parseFloat(e.target.value) || undefined)}
                      placeholder="Enter minimum value"
                    />
                  </div>
                  <Button onClick={selectAllFiltered} variant="outline" className="gap-2">
                    <Check className="h-4 w-4" />
                    Select All Above
                  </Button>
                </div>
              )}

              {/* Category Filter */}
              {selectionMethod === "category" && (
                <div className="flex items-end gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={selectAllFiltered} variant="outline" className="gap-2">
                    <Check className="h-4 w-4" />
                    Select All in Category
                  </Button>
                </div>
              )}

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={clearSelection} disabled={selectedItems.length === 0}>
                  <X className="h-4 w-4 mr-1" />
                  Clear ({selectedItems.length})
                </Button>
              </div>

              {/* Item Selection Table */}
              <div className="rounded-md border">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer"
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => toggleItemSelection(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{item.location}</TableCell>
                          <TableCell className="text-right">
                            {item.systemQuantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${item.value.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedItems.length} items selected</span>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">${totalValue.toFixed(2)} total value</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Spot Check *</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for this spot check..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Separator />

              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Check Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{typeConfig[checkType].label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority</span>
                      <Badge variant="outline" className="capitalize">{priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{selectedItems.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium">${totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">
                        {mockLocations.find(l => l.id === locationId)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">
                        {mockDepartments.find(d => d.id === departmentId)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To</span>
                      <span className="font-medium">
                        {mockUsers.find(u => u.id === assignedTo)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-medium">{format(scheduledDate, "PPP")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Items Preview */}
              <div className="space-y-3">
                <h4 className="font-medium">Selected Items ({selectedItems.length})</h4>
                <div className="rounded-md border max-h-[200px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">System Qty</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItemDetails.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{item.itemName}</p>
                              <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {item.systemQuantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            ${item.value.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {selectedItemDetails.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                            +{selectedItemDetails.length - 5} more items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(step)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(step)}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Create Spot Check
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
