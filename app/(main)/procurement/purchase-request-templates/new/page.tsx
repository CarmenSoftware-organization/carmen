"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PRDetailTemplate } from "../components/templates/PRDetailTemplate"
import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage } from "@/lib/types"
import { mockTemplateItems } from "../types/template-items"
import { ItemsTab } from "../components/ItemsTab"

// Create an empty template with default values
const getEmptyTemplate = (): PurchaseRequest => {
  return {
    id: "",
    refNumber: "",
    date: new Date(),
    vendor: "",
    vendorId: 0,
    type: PRType.GeneralPurchase,
    deliveryDate: new Date(),
    description: "",
    requestorId: "",
    requestor: {
      name: "",
      id: "",
      department: ""
    },
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.requester,
    location: "",
    department: "",
    jobCode: "",
    estimatedTotal: 0,
    currency: "USD",
    baseCurrencyCode: "USD",
    baseSubTotalPrice: 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    netAmount: 0,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 0,
    totalAmount: 0,
    items: []
  }
}

export default function PRTemplateNewPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PurchaseRequest>(getEmptyTemplate())

  const handleModeChange = (newMode: "view" | "edit") => {
    if (newMode === "view") {
      router.push("/procurement/purchase-request-templates")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    router.push("/procurement/purchase-request-templates")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFormDataChange = (data: Partial<PurchaseRequest>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }))
  }

  const tabs = [
    {
      label: "Items",
      content: <ItemsTab items={mockTemplateItems} mode="edit" />
    },
    {
      label: "Budgets",
      content: <div>Budgets Tab Content</div>
    },
    {
      label: "Activity",
      content: <div>Activity Tab Content</div>
    }
  ]

  return (
    <PRDetailTemplate
      mode="edit"
      template={{
        id: formData.id,
        name: formData.description || "New Template",
        description: formData.description || "",
        type: 'template',
        category: formData.department || "",
        department: formData.department,
        createdBy: formData.requestor?.name || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      }}
      onSave={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
    />
  )
} 