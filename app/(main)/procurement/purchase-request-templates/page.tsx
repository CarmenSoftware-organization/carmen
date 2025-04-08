"use client"

import { useState } from "react"
import { PRListTemplate } from "@/components/templates/PRListTemplate"
import { DocumentStatus, PRType, PurchaseRequest, WorkflowStatus, WorkflowStage } from "@/lib/types"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

export default function PurchaseRequestTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<PurchaseRequest[]>([])

  return (
    <div>
      <h1>PR Templates</h1>
    </div>
  )
} 