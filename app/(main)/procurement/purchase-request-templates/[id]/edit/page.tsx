"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PRDetailTemplate } from "../../components/templates/PRDetailTemplate"
import { PurchaseRequest } from "@/lib/types"
import { PRTemplate } from "@/lib/types/pr-template" // Corrected import path if needed, ensuring it's imported
import { samplePRData } from "../../../purchase-requests/components/sampleData"
import { mockTemplateItems } from "../../types/template-items"
import { ItemsTab } from "../../components/ItemsTab"

// Create a sample template based on the ID
const getTemplateById = (id: string): PurchaseRequest => {
  return {
    ...samplePRData,
    id,
    refNumber: `TPL-${id}`,
    description: `Template ${id}`,
  }
}

export default function PRTemplateEditPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [formData, setFormData] = useState<PurchaseRequest>(
    getTemplateById(params.id)
  )

  const handleModeChange = (newMode: "view" | "edit") => {
    if (newMode === "view") {
      router.push(`/procurement/purchase-request-templates/${params.id}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    router.push(`/procurement/purchase-request-templates/${params.id}`)
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
 
   return (
     <PRDetailTemplate
       mode="edit"
       template={templateForDetail} // Pass the adapted object
       onSave={(updatedTemplate) => {
         console.log("Saving template:", updatedTemplate);
         // Update parent state based on changes in the template component
         handleFormDataChange({ description: updatedTemplate.description });
         // Potentially update other formData fields based on updatedTemplate
         router.push(`/procurement/purchase-request-templates/${params.id}`); // Navigate after save
       }}
     />
   )
 }
