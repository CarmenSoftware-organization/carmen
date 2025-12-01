'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Plus,
  PlusCircle,
  Pencil,
  Trash2,
  MoreHorizontal,
  AlertTriangle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Budget item interface
interface BudgetItem {
  id: string;
  location: string;
  category: string;
  totalBudget: number;
  softCommitmentDeptHead: number;
  softCommitmentPO: number;
  hardCommitment: number;
  availableBudget: number;
  currentPRAmount: number;
  status: 'Over Budget' | 'Within Budget' | 'Near Limit';
}

// Form data interface
interface BudgetFormData {
  location: string;
  category: string;
  totalBudget: string;
  softCommitmentDeptHead: string;
  softCommitmentPO: string;
  hardCommitment: string;
  currentPRAmount: string;
}

// Location options for dropdown
const locationOptions = [
  { value: "Front Office", label: "Front Office" },
  { value: "Accounting", label: "Accounting" },
  { value: "HouseKeeping", label: "HouseKeeping" },
  { value: "Kitchen", label: "Kitchen" },
  { value: "Restaurant", label: "Restaurant" },
  { value: "Engineering", label: "Engineering" },
  { value: "IT", label: "IT" },
  { value: "HR", label: "HR" },
  { value: "Sales", label: "Sales" },
  { value: "Marketing", label: "Marketing" },
]

// Category options for dropdown
const categoryOptions = [
  { value: "Computer", label: "Computer" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Furniture", label: "Furniture" },
  { value: "Equipment", label: "Equipment" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Utilities", label: "Utilities" },
  { value: "Travel", label: "Travel" },
  { value: "Training", label: "Training" },
  { value: "Marketing", label: "Marketing" },
  { value: "Other", label: "Other" },
]

// Initial budget data
const initialBudgetData: BudgetItem[] = [
  {
    id: "1",
    location: "Front Office",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 1000.00,
    softCommitmentPO: 3000.00,
    hardCommitment: 2000.00,
    availableBudget: 14000.00,
    currentPRAmount: 15000.00,
    status: "Over Budget",
  },
  {
    id: "2",
    location: "Accounting",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 13000.00,
    status: "Within Budget",
  },
  {
    id: "3",
    location: "HouseKeeping",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 10000.00,
    status: "Within Budget",
  },
]

// Empty form data
const emptyFormData: BudgetFormData = {
  location: "",
  category: "",
  totalBudget: "",
  softCommitmentDeptHead: "0",
  softCommitmentPO: "0",
  hardCommitment: "0",
  currentPRAmount: "",
}

export function ResponsiveBudgetScreen() {
  // State management
  const [budgetData, setBudgetData] = useState<BudgetItem[]>(initialBudgetData)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ field: string, direction: 'asc' | 'desc' } | null>(null)

  // Dialog states
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<BudgetItem | null>(null)

  // Form state
  const [formData, setFormData] = useState<BudgetFormData>(emptyFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate budget status
  const calculateStatus = (availableBudget: number, currentPRAmount: number): BudgetItem['status'] => {
    if (currentPRAmount > availableBudget) {
      return "Over Budget"
    }
    const utilizationRate = (currentPRAmount / availableBudget) * 100
    if (utilizationRate >= 80) {
      return "Near Limit"
    }
    return "Within Budget"
  }

  // Calculate available budget
  const calculateAvailableBudget = (
    totalBudget: number,
    softCommitmentDeptHead: number,
    softCommitmentPO: number,
    hardCommitment: number
  ): number => {
    return totalBudget - softCommitmentDeptHead - softCommitmentPO - hardCommitment
  }

  // Filter budget data based on search term
  const filteredData = useMemo(() => {
    return budgetData.filter(item =>
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [budgetData, searchTerm])

  // Sort budget data based on sort config
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortConfig) return 0

      const aValue = a[sortConfig.field as keyof typeof a]
      const bValue = b[sortConfig.field as keyof typeof b]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })
  }, [filteredData, sortConfig])

  // Calculate totals
  const totals = useMemo(() => {
    return budgetData.reduce((acc, item) => ({
      totalRequest: acc.totalRequest + item.currentPRAmount,
      totalAvailable: acc.totalAvailable + item.availableBudget,
      totalBudget: acc.totalBudget + item.totalBudget,
    }), { totalRequest: 0, totalAvailable: 0, totalBudget: 0 })
  }, [budgetData])

  const handleSort = (field: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.field === field) {
        return { field, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    return sortConfig.direction === 'asc'
      ? <ArrowUpDown className="h-4 w-4 ml-1 rotate-180" />
      : <ArrowUpDown className="h-4 w-4 ml-1" />
  }

  const renderSortableHeader = (field: string, label: string) => (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => handleSort(field)}
    >
      {label}
      {getSortIcon(field)}
    </div>
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const getBudgetStatusBadge = (status: string) => {
    if (status === "Over Budget") {
      return <Badge variant="destructive">{status}</Badge>
    }
    if (status === "Near Limit") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100">{status}</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100">{status}</Badge>
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof BudgetFormData, string>> = {}

    if (!formData.location) {
      errors.location = "Location is required"
    }
    if (!formData.category) {
      errors.category = "Category is required"
    }
    if (!formData.totalBudget || parseFloat(formData.totalBudget) <= 0) {
      errors.totalBudget = "Total budget must be greater than 0"
    }
    if (!formData.currentPRAmount || parseFloat(formData.currentPRAmount) < 0) {
      errors.currentPRAmount = "Current PR amount must be 0 or greater"
    }
    if (parseFloat(formData.softCommitmentDeptHead) < 0) {
      errors.softCommitmentDeptHead = "Soft commitment must be 0 or greater"
    }
    if (parseFloat(formData.softCommitmentPO) < 0) {
      errors.softCommitmentPO = "Soft commitment must be 0 or greater"
    }
    if (parseFloat(formData.hardCommitment) < 0) {
      errors.hardCommitment = "Hard commitment must be 0 or greater"
    }

    // Check for duplicate location + category combination (except when editing same item)
    const isDuplicate = budgetData.some(item =>
      item.location === formData.location &&
      item.category === formData.category &&
      item.id !== editingItem?.id
    )
    if (isDuplicate) {
      errors.location = "This location and category combination already exists"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle opening add dialog
  const handleAdd = () => {
    setEditingItem(null)
    setFormData(emptyFormData)
    setFormErrors({})
    setIsAddEditDialogOpen(true)
  }

  // Handle opening edit dialog
  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      location: item.location,
      category: item.category,
      totalBudget: item.totalBudget.toString(),
      softCommitmentDeptHead: item.softCommitmentDeptHead.toString(),
      softCommitmentPO: item.softCommitmentPO.toString(),
      hardCommitment: item.hardCommitment.toString(),
      currentPRAmount: item.currentPRAmount.toString(),
    })
    setFormErrors({})
    setIsAddEditDialogOpen(true)
  }

  // Handle opening delete dialog
  const handleDeleteClick = (item: BudgetItem) => {
    setDeletingItem(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle form submission (Create/Update)
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const totalBudget = parseFloat(formData.totalBudget)
    const softCommitmentDeptHead = parseFloat(formData.softCommitmentDeptHead) || 0
    const softCommitmentPO = parseFloat(formData.softCommitmentPO) || 0
    const hardCommitment = parseFloat(formData.hardCommitment) || 0
    const currentPRAmount = parseFloat(formData.currentPRAmount)
    const availableBudget = calculateAvailableBudget(totalBudget, softCommitmentDeptHead, softCommitmentPO, hardCommitment)
    const status = calculateStatus(availableBudget, currentPRAmount)

    if (editingItem) {
      // Update existing item
      setBudgetData(prev => prev.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              location: formData.location,
              category: formData.category,
              totalBudget,
              softCommitmentDeptHead,
              softCommitmentPO,
              hardCommitment,
              availableBudget,
              currentPRAmount,
              status,
            }
          : item
      ))
      toast.success("Budget updated successfully")
    } else {
      // Create new item
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        location: formData.location,
        category: formData.category,
        totalBudget,
        softCommitmentDeptHead,
        softCommitmentPO,
        hardCommitment,
        availableBudget,
        currentPRAmount,
        status,
      }
      setBudgetData(prev => [...prev, newItem])
      toast.success("Budget added successfully")
    }

    setIsSubmitting(false)
    setIsAddEditDialogOpen(false)
    setEditingItem(null)
    setFormData(emptyFormData)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setBudgetData(prev => prev.filter(item => item.id !== deletingItem.id))
    toast.success("Budget deleted successfully")

    setIsSubmitting(false)
    setIsDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  // Handle form field change
  const handleFieldChange = (field: keyof BudgetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Budget Allocation</h2>
                <p className="text-sm text-muted-foreground">Manage budget allocation for purchase requests</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search budgets..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 px-2.5">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  onClick={handleAdd}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">{renderSortableHeader('location', 'Location')}</TableHead>
                      <TableHead className="font-semibold">{renderSortableHeader('category', 'Budget Category')}</TableHead>
                      <TableHead className="font-semibold text-right">{renderSortableHeader('totalBudget', 'Total Budget')}</TableHead>
                      <TableHead className="font-semibold text-right" colSpan={2}>
                        <div className="text-right">Soft Commitment</div>
                        <div className="grid grid-cols-2 text-xs font-medium mt-1">
                          <div className="text-right pr-2">Dept. Head</div>
                          <div className="text-right">PO</div>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-right">{renderSortableHeader('hardCommitment', 'Hard Commitment')}</TableHead>
                      <TableHead className="font-semibold text-right">{renderSortableHeader('availableBudget', 'Available Budget')}</TableHead>
                      <TableHead className="font-semibold text-right">{renderSortableHeader('currentPRAmount', 'Current PR Amount')}</TableHead>
                      <TableHead className="font-semibold text-center">{renderSortableHeader('status', 'Status')}</TableHead>
                      <TableHead className="font-semibold text-center w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>No budget items match your search</p>
                            {searchTerm && (
                              <Button
                                variant="link"
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedData.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/20 group transition-colors">
                          <TableCell className="font-medium">{row.location}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.totalBudget)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.softCommitmentDeptHead)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.softCommitmentPO)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(row.hardCommitment)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.availableBudget)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(row.currentPRAmount)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {getBudgetStatusBadge(row.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(row)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-50" />
                  <p>No budget items match your search</p>
                  {searchTerm && (
                    <Button
                      variant="link"
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                sortedData.map((row) => (
                  <Card key={row.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium">{row.location}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getBudgetStatusBadge(row.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(row)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(row)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{row.category}</p>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Total Budget:</div>
                        <div className="text-sm font-medium text-right">{formatCurrency(row.totalBudget)}</div>

                        <div className="text-sm font-medium text-muted-foreground">Soft Commitment (Dept Head):</div>
                        <div className="text-sm text-right">{formatCurrency(row.softCommitmentDeptHead)}</div>

                        <div className="text-sm font-medium text-muted-foreground">Soft Commitment (PO):</div>
                        <div className="text-sm text-right">{formatCurrency(row.softCommitmentPO)}</div>

                        <div className="text-sm font-medium text-muted-foreground">Hard Commitment:</div>
                        <div className="text-sm text-right">{formatCurrency(row.hardCommitment)}</div>

                        <div className="text-sm font-medium text-muted-foreground border-t pt-2 mt-1">Available Budget:</div>
                        <div className="text-sm font-bold text-right border-t pt-2 mt-1">{formatCurrency(row.availableBudget)}</div>

                        <div className="text-sm font-medium text-muted-foreground">Current PR Amount:</div>
                        <div className="text-sm font-bold text-right">{formatCurrency(row.currentPRAmount)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Budget Summary */}
            <Card className="bg-muted/20 border border-muted/30">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Total budget allocation for this purchase request:
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Request</p>
                      <p className="text-base font-semibold">{formatCurrency(totals.totalRequest)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Available</p>
                      <p className="text-base font-semibold">{formatCurrency(totals.totalAvailable)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-base font-semibold">{formatCurrency(totals.totalAvailable - totals.totalRequest)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      {totals.totalRequest > totals.totalAvailable ? (
                        <Badge variant="destructive">Over Budget</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100">Within Budget</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Update the budget allocation details below.'
                : 'Fill in the budget allocation details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleFieldChange('location', value)}
              >
                <SelectTrigger className={formErrors.location ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.location && (
                <p className="text-sm text-destructive">{formErrors.location}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleFieldChange('category', value)}
              >
                <SelectTrigger className={formErrors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && (
                <p className="text-sm text-destructive">{formErrors.category}</p>
              )}
            </div>

            {/* Total Budget */}
            <div className="grid gap-2">
              <Label htmlFor="totalBudget">Total Budget <span className="text-destructive">*</span></Label>
              <Input
                id="totalBudget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.totalBudget}
                onChange={(e) => handleFieldChange('totalBudget', e.target.value)}
                className={formErrors.totalBudget ? 'border-destructive' : ''}
              />
              {formErrors.totalBudget && (
                <p className="text-sm text-destructive">{formErrors.totalBudget}</p>
              )}
            </div>

            {/* Soft Commitments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="softCommitmentDeptHead">Soft Commitment (Dept Head)</Label>
                <Input
                  id="softCommitmentDeptHead"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.softCommitmentDeptHead}
                  onChange={(e) => handleFieldChange('softCommitmentDeptHead', e.target.value)}
                  className={formErrors.softCommitmentDeptHead ? 'border-destructive' : ''}
                />
                {formErrors.softCommitmentDeptHead && (
                  <p className="text-sm text-destructive">{formErrors.softCommitmentDeptHead}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="softCommitmentPO">Soft Commitment (PO)</Label>
                <Input
                  id="softCommitmentPO"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.softCommitmentPO}
                  onChange={(e) => handleFieldChange('softCommitmentPO', e.target.value)}
                  className={formErrors.softCommitmentPO ? 'border-destructive' : ''}
                />
                {formErrors.softCommitmentPO && (
                  <p className="text-sm text-destructive">{formErrors.softCommitmentPO}</p>
                )}
              </div>
            </div>

            {/* Hard Commitment */}
            <div className="grid gap-2">
              <Label htmlFor="hardCommitment">Hard Commitment</Label>
              <Input
                id="hardCommitment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.hardCommitment}
                onChange={(e) => handleFieldChange('hardCommitment', e.target.value)}
                className={formErrors.hardCommitment ? 'border-destructive' : ''}
              />
              {formErrors.hardCommitment && (
                <p className="text-sm text-destructive">{formErrors.hardCommitment}</p>
              )}
            </div>

            {/* Current PR Amount */}
            <div className="grid gap-2">
              <Label htmlFor="currentPRAmount">Current PR Amount <span className="text-destructive">*</span></Label>
              <Input
                id="currentPRAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.currentPRAmount}
                onChange={(e) => handleFieldChange('currentPRAmount', e.target.value)}
                className={formErrors.currentPRAmount ? 'border-destructive' : ''}
              />
              {formErrors.currentPRAmount && (
                <p className="text-sm text-destructive">{formErrors.currentPRAmount}</p>
              )}
            </div>

            {/* Available Budget Preview */}
            {formData.totalBudget && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Calculated Available Budget:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      calculateAvailableBudget(
                        parseFloat(formData.totalBudget) || 0,
                        parseFloat(formData.softCommitmentDeptHead) || 0,
                        parseFloat(formData.softCommitmentPO) || 0,
                        parseFloat(formData.hardCommitment) || 0
                      )
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingItem ? 'Update Budget' : 'Add Budget')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Budget
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget allocation for{' '}
              <span className="font-semibold">{deletingItem?.location}</span> -{' '}
              <span className="font-semibold">{deletingItem?.category}</span>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
