'use client'

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowHeader } from "./workflow-header"
import { WorkflowGeneral } from "./workflow-general"
import { WorkflowStages } from "./workflow-stages"
import { WorkflowRouting } from "./workflow-routing"
import { sampleWorkflows } from "../data/mockData"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Workflow } from "../types/workflow"
import { WorkflowProducts } from "./workflow-products"

interface WorkflowDetailProps {
  workflowId: string
}

export function WorkflowDetail({ workflowId }: WorkflowDetailProps) {
  const [workflow, setWorkflow] = useState<Workflow | undefined>(sampleWorkflows.find(w => w.id === workflowId))
  const [isEditing, setIsEditing] = useState(false)

  if (!workflow) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Workflow not found. Please check the provided workflow ID: {workflowId}
        </AlertDescription>
      </Alert>
    )
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = (updatedWorkflow: Partial<Workflow>) => {
    setWorkflow({ ...workflow, ...updatedWorkflow })
    setIsEditing(false)
  }

  const stageNames = workflow.stages.map(stage => stage.name)

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/system-administration/workflow/workflow-configuration">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workflows
        </Link>
      </Button>
      <WorkflowHeader workflow={workflow} isEditing={isEditing} onEditToggle={handleEditToggle} onSave={handleSave} />
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <WorkflowGeneral workflow={workflow} isEditing={isEditing} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="stages">
          <WorkflowStages stages={workflow.stages} isEditing={isEditing} onSave={(stages) => handleSave({ stages })} />
        </TabsContent>
        <TabsContent value="routing">
          <WorkflowRouting 
            rules={workflow.routingRules || []} 
            stages={stageNames} 
            isEditing={isEditing}
            onSave={(routingRules) => handleSave({ routingRules })} 
          />
        </TabsContent>
        <TabsContent value="products">
          <WorkflowProducts 
            products={workflow.products || []} 
            isEditing={isEditing}
            onSave={(products) => handleSave({ products })} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

