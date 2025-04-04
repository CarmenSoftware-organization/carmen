"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PRDetailTemplate } from "../components/templates/PRDetailTemplate"
import { Button } from "@/components/ui/button"
import { PurchaseRequest } from "@/lib/types"
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

  return (
    <PRDetailTemplate
      mode={mode}
      title={`Template: ${formData.description}`}
      formData={formData}
      onModeChange={handleModeChange}
      onSubmit={handleSubmit}
      onInputChange={handleInputChange}
      onFormDataChange={handleFormDataChange}
      tabs={tabs}
      actions={actions}
      backUrl="/procurement/purchase-request-templates"
    />
  )
} 