"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PRDetailTemplate } from "../components/templates/PRDetailTemplate"
import { Button } from "@/components/ui/button"
import { PurchaseRequest } from "@/lib/types"
import { PRTemplate } from "@/lib/types/pr-template"; // Added import for PRTemplate
import { samplePRData } from "../../purchase-requests/components/sampleData"
import { mockTemplateItems } from "../types/template-items"
import { ItemsTab } from "../components/ItemsTab"

// Create a sample template based on the ID
const getTemplateById = (id: string): PurchaseRequest => {
  return {
    ...samplePRData,
    id,
    refNumber: `TPL-${id}`,
    description: `Template ${id}`,
  }
}

export default function PRTemplateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams?.get("mode") as "view" | "edit" | "add") || "view"
  const [formData, setFormData] = useState<PurchaseRequest>(
    getTemplateById(params.id)
  )

  const handleModeChange = (newMode: "view" | "edit") => {
    router.push(`/procurement/purchase-request-templates/${params.id}?mode=${newMode}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    handleModeChange("view")
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
      content: <ItemsTab items={mockTemplateItems} mode={mode} />
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

  const actions = (
    <>
      <Button variant="outline" onClick={() => console.log("Set as Default")}>
        Set as Default
      </Button>
      <Button variant="outline" onClick={() => console.log("Clone Template")}>
        Clone Template
      </Button>
     </>
   )
 
   // Adapt formData (PurchaseRequest) to fit PRTemplate structure
   const templateForDetail: PRTemplate = {
     id: formData.id,
     name: formData.description || `Template ${params.id}`, // Use description or fallback for name
     description: formData.description,
     type: 'template', // Assuming 'template' type
     items: [], // Placeholder, PRDetailTemplate doesn't render items directly
     createdAt: formData.date || new Date(), // Use PR date or fallback
     updatedAt: new Date(), // Placeholder
     createdBy: formData.requestor?.id || 'system', // Use requestor ID or fallback
     // Optional PRTemplate fields can be added here if needed
   };
 
   // Ensure mode is only 'view' or 'edit'
   const validMode = (mode === 'edit' ? 'edit' : 'view');
 
   return (
     <PRDetailTemplate
       mode={validMode} // Pass validated mode
       template={templateForDetail} // Pass the adapted object
       // Removed invalid props: title, formData, onModeChange, onSubmit, onInputChange, onFormDataChange, tabs, actions, backUrl
       // onSave is optional and not needed for view mode primarily
       // If mode is 'edit', onSave might be needed, but the component handles its own save button logic internally based on mode.
     />
   )
 }
