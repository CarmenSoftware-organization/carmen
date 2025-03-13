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

  return (
    <>
      <PRListTemplate
        title="Purchase Request Templates"
        data={templates}
        selectedItems={selectedItems}
        currentPage={currentPage}
        itemsPerPage={7}
        onPageChange={setCurrentPage}
        onSearch={handleSearch}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
        fieldConfigs={fieldConfigs}
        customActions={customActions}
        advancedFilter={
          <AdvancedFilter 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            filterFields={filterFields}
          />
        }
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