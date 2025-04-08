'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowList } from "./components/workflow-list"
import { WorkflowTemplates } from "./components/workflow-templates"
import { sampleWorkflows } from "./data/mockData"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function WorkflowConfigurationPage() {
  return (
    <Suspense>
      <WorkflowConfigurationContent />
    </Suspense>
  )
}

function WorkflowConfigurationContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'workflow'

  const workflows = sampleWorkflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.type,
    status: workflow.status || "Active",
    lastModified: new Date().toISOString(),
  }))

  // Get notification templates from the first workflow as initial templates
  const initialTemplates = sampleWorkflows[0]?.notificationTemplates || []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workflow">
          <WorkflowList workflows={workflows} />
        </TabsContent>
        <TabsContent value="templates">
          <WorkflowTemplates 
            templates={initialTemplates}
            isEditing={true}
            onSave={(templates) => console.log('Templates saved:', templates)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

