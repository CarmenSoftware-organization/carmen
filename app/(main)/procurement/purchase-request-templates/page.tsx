"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PRListTemplate } from "@/components/templates/PRListTemplate"
import { Button } from "@/components/ui/button"
import { PurchaseRequest, PRType, DocumentStatus } from "@/lib/types"
import { samplePRData } from "../purchase-requests/components/sampleData"
import { AdvancedFilter } from "@/components/ui/advanced-filter"
import { FilterType } from "@/lib/utils/filter-storage"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutGrid, List, FileText, PencilLine, Trash2, ChevronDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/components/ui/status-badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

// Create an array of sample templates based on the sample PR data
const templateData: PurchaseRequest[] = [
  { ...samplePRData, id: "template-001", refNumber: "TPL-2024-001", description: "Office Supplies Template" },
  { ...samplePRData, id: "template-002", refNumber: "TPL-2024-002", description: "Kitchen Equipment Template" },
  { ...samplePRData, id: "template-003", refNumber: "TPL-2024-003", description: "Housekeeping Supplies Template" },
  { ...samplePRData, id: "template-004", refNumber: "TPL-2024-004", description: "Maintenance Materials Template" },
  { ...samplePRData, id: "template-005", refNumber: "TPL-2024-005", description: "F&B Ingredients Template" },
]

export default function PRTemplatesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [activeFilters, setActiveFilters] = useState<FilterType<PurchaseRequest>[]>([])
  const [templates, setTemplates] = useState<PurchaseRequest[]>(templateData)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "General Purchase", value: PRType.GeneralPurchase },
    { label: "Asset Purchase", value: PRType.AssetPurchase },
  ]

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Draft", value: DocumentStatus.Draft },
    { label: "In Progress", value: DocumentStatus.InProgress },
    { label: "Completed", value: DocumentStatus.Completed },
  ]

  const fieldConfigs: Array<{
    label: string
    field: keyof PurchaseRequest | 'requestor.name'
    format?: (value: any) => string
  }> = [
    { 
      label: "Date", 
      field: "date",
      format: (value: Date) => value.toLocaleDateString()
    },
    { 
      label: "Type", 
      field: "type" 
    },
    { 
      label: "Requestor", 
      field: "requestor.name" 
    },
    { 
      label: "Department", 
      field: "department" 
    },
    { 
      label: "Amount", 
      field: "totalAmount",
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      label: "Workflow Stage", 
      field: "currentWorkflowStage" 
    }
  ]

  const customActions = (
    <>
      <Button 
        variant="outline" 
        onClick={() => {
          if (selectedItems.length > 0) {
            // Implement bulk delete
            toast({
              title: "Bulk delete",
              description: `${selectedItems.length} templates selected for deletion`,
            })
          }
        }}
      >
        Delete Selected
      </Button>
      <Button variant="outline">Clone Selected</Button>
      <Button variant="outline">Set as Default</Button>
    </>
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? templates.map(item => item.id) : [])
  }

  const handleView = (id: string) => {
    try {
      router.push(`/procurement/purchase-request-templates/${id}?mode=view`)
    } catch (error) {
      console.error("Error handling view:", error)
      toast({
        title: "Error",
        description: "There was a problem viewing the template.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (id: string) => {
    try {
      router.push(`/procurement/purchase-request-templates/${id}?mode=edit`)
    } catch (error) {
      console.error("Error handling edit:", error)
      toast({
        title: "Error",
        description: "There was a problem editing the template.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (templateToDelete) {
      // In a real app, this would be an API call
      setTemplates(templates.filter(template => template.id !== templateToDelete))
      
      // If the deleted item was selected, remove it from selection
      setSelectedItems(prev => prev.filter(id => id !== templateToDelete))
      
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully.",
      })
      
      setTemplateToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleCreateNew = () => {
    try {
      router.push("/procurement/purchase-request-templates/new?mode=add")
    } catch (error) {
      console.error("Error handling create new:", error)
      toast({
        title: "Error",
        description: "There was a problem creating a new template.",
        variant: "destructive"
      })
    }
  }

  const handleApplyFilters = (filters: FilterType<PurchaseRequest>[]) => {
    setActiveFilters(filters)
    setCurrentPage(1)
    // In a real implementation, you would filter the data based on these filters
    console.log("Applied filters:", filters)
  }

  const handleClearFilters = () => {
    setActiveFilters([])
  }

  const filterFields = [
    { value: 'refNumber' as keyof PurchaseRequest, label: 'Template Number' },
    { value: 'description' as keyof PurchaseRequest, label: 'Description' },
    { value: 'type' as keyof PurchaseRequest, label: 'Type' },
    { value: 'status' as keyof PurchaseRequest, label: 'Status' },
    { value: 'department' as keyof PurchaseRequest, label: 'Department' },
    { value: 'totalAmount' as keyof PurchaseRequest, label: 'Total Amount' }
  ]

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden hover:bg-secondary/10 transition-colors">
          <CardHeader className="p-5 pb-3 bg-muted/30 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(template.id)}
                  onChange={() => handleSelectItem(template.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <h3 className="text-lg font-semibold text-primary">{template.description}</h3>
                  <p className="text-sm text-muted-foreground">{template.refNumber}</p>
                </div>
              </div>
              <Badge variant="outline">{template.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Department</p>
                <p className="text-sm font-medium">{template.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Requestor</p>
                <p className="text-sm font-medium">{template.requestor.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
                <p className="text-sm font-medium">${template.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Workflow Stage</p>
                <p className="text-sm font-medium">{template.currentWorkflowStage}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-border/50 space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleView(template.id)}
                className="h-8 w-8 rounded-full"
              >
                <span className="sr-only">View</span>
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(template.id)}
                className="h-8 w-8 rounded-full"
              >
                <span className="sr-only">Edit</span>
                <PencilLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(template.id)}
                className="h-8 w-8 rounded-full"
              >
                <span className="sr-only">Delete</span>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedItems.length === templates.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Requestor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(template.id)}
                  onCheckedChange={() => handleSelectItem(template.id)}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{template.description}</p>
                  <p className="text-sm text-muted-foreground">{template.refNumber}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{template.type}</Badge>
              </TableCell>
              <TableCell>{template.department}</TableCell>
              <TableCell>{template.requestor.name}</TableCell>
              <TableCell className="text-right font-medium">
                ${template.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{template.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(template.id)}
                    className="h-8 w-8 rounded-full"
                  >
                    <span className="sr-only">View</span>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template.id)}
                    className="h-8 w-8 rounded-full"
                  >
                    <span className="sr-only">Edit</span>
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <span className="sr-only">More options</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const viewToggle = (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('table')}
        className="rounded-none h-8 px-2"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Table View</span>
      </Button>
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('card')}
        className="rounded-none h-8 px-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Card View</span>
      </Button>
    </div>
  )

  return (
    <>
      <PRListTemplate
        title="Purchase Request Templates"
        data={templates}
        selectedItems={selectedItems}
        currentPage={currentPage}
        itemsPerPage={10}
        onPageChange={setCurrentPage}
        onSearch={handleSearch}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        customActions={customActions}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        fieldConfigs={fieldConfigs}
        advancedFilter={
          <AdvancedFilter 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            filterFields={filterFields}
          />
        }
        viewToggle={viewToggle}
        viewMode={viewMode}
        tableView={renderTableView()}
        cardView={renderCardView()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 