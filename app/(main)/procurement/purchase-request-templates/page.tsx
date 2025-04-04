"use client"

import { useState } from "react"
import { PRListTemplate } from "@/components/templates/PRListTemplate"
import { DocumentStatus, PRType, PurchaseRequest, WorkflowStatus, WorkflowStage } from "@/lib/types"
import { AdvancedFilter } from "@/components/ui/advanced-filter"
import { FilterType } from "@/lib/utils/filter-storage"
import { format } from "date-fns"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PurchaseRequestTemplatesPage() {
  const router = useRouter()
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([
    {
      id: "1",
      refNumber: "PR-2024-001",
      date: new Date("2024-03-15"),
      vendor: "Office Supplies Co",
      vendorId: 1,
      type: PRType.GeneralPurchase,
      deliveryDate: new Date("2024-03-20"),
      description: "Office Supplies",
      requestorId: "user1",
      requestor: {
        name: "John Doe",
        id: "user1",
        department: "Administration"
      },
      status: DocumentStatus.Draft,
      workflowStatus: WorkflowStatus.pending,
      currentWorkflowStage: WorkflowStage.requester,
      location: "Main Office",
      department: "Administration",
      jobCode: "ADMIN-001",
      estimatedTotal: 1500.50,
      currency: "USD",
      baseCurrencyCode: "USD",
      baseSubTotalPrice: 1500.50,
      subTotalPrice: 1500.50,
      baseNetAmount: 1500.50,
      netAmount: 1500.50,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 1500.50,
      totalAmount: 1500.50,
      items: []
    }
  ])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const typeOptions = Object.values(PRType).map(type => ({
    label: type,
    value: type
  }))

  const statusOptions = Object.values(DocumentStatus).map(status => ({
    label: status,
    value: status
  }))

  const fieldConfigs = [
    {
      label: "PR Number",
      field: "refNumber" as const
    },
    {
      label: "Description",
      field: "description" as const
    },
    {
      label: "Type",
      field: "type" as const
    },
    {
      label: "Status",
      field: "status" as const
    },
    {
      label: "Total Amount",
      field: "totalAmount" as const,
      format: (value: unknown) => {
        if (typeof value === "number") {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
          }).format(value)
        }
        return String(value)
      }
    },
    {
      label: "Created Date",
      field: "date" as const,
      format: (value: unknown) => {
        if (value instanceof Date) {
          return format(value, "MMM dd, yyyy")
        }
        return String(value)
      }
    },
    {
      label: "Requestor",
      field: "requestor.name" as const
    }
  ]

  const handleApplyFilters = () => {
    console.log("Applying filters")
  }

  const handleClearFilters = () => {
    console.log("Clearing filters")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (term: string) => {
    console.log("Searching for:", term)
  }

  const handleTypeChange = (type: string) => {
    console.log("Changing type to:", type)
  }

  const handleStatusChange = (status: string) => {
    console.log("Changing status to:", status)
  }

  const handleSelectItem = (id: string) => {
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id]
    setSelectedItems(newSelectedItems)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? purchaseRequests.map(pr => pr.id) : [])
  }

  const handleView = (id: string) => {
    router.push(`/procurement/purchase-request-templates/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/procurement/purchase-request-templates/${id}/edit`)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting item:", id)
  }

  const handleCreateNew = () => {
    router.push('/procurement/purchase-request-templates/new')
  }

  return (
    <div className="container mx-auto py-6 px-9">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/procurement">Procurement</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/procurement/purchase-request-templates">PR Templates</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <PRListTemplate
          title="Purchase Request Templates"
          description="Manage and create templates for frequently used purchase requests to streamline your procurement process."
          data={purchaseRequests}
          selectedItems={selectedItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
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
          advancedFilter={
            <Button variant="outline" onClick={handleApplyFilters}>
              Advanced Filters
            </Button>
          }
        />
      </div>
    </div>
  )
} 