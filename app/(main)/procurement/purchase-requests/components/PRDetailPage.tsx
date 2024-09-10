// File: PRDetailPage.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileIcon, PrinterIcon, DownloadIcon, ShareIcon, PencilIcon, CheckCircleIcon, XCircleIcon, RotateCcwIcon } from 'lucide-react'
import { PRHeader } from './PRHeader'
import { PRForm } from './PRForm'
import { ItemsTab } from './tabs/ItemsTab'
import { DetailsTab } from './tabs/DetailsTab'
import { BudgetsTab } from './tabs/BudgetsTab'
import { WorkflowTab } from './tabs/WorkflowTab'
import { AttachmentsTab } from './tabs/AttachmentsTab'
import { ActivityTab } from './tabs/ActivityTab'
import { PurchaseRequest, WorkflowAction, PRType, DocumentStatus, WorkflowStatus, WorkflowStage } from '@/types/types'
import { getBadgeVariant, handleDocumentAction, getNextWorkflowStage, getPreviousWorkflowStage } from './utils'
import { samplePRData } from './sampleData'

export default function PRDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAddMode = searchParams?.get('mode') === 'add'

  const [mode, setMode] = useState<'view' | 'edit' | 'add'>(isAddMode ? 'add' : 'view')
  const [formData, setFormData] = useState<PurchaseRequest>(isAddMode ? getEmptyPurchaseRequest() : samplePRData)

  useEffect(() => {
    if (isAddMode) {
      setMode('add')
      setFormData(getEmptyPurchaseRequest())
    }
  }, [isAddMode])

  const handleModeChange = (newMode: 'view' | 'edit') => setMode(newMode)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    if (mode === 'add') {
      // Here you would typically save the new PR to your backend
      console.log('New PR created:', formData)
      router.push('/procurement/purchase-requests') // Redirect back to the list
    } else {
      setMode('view')
    }
  }

  const handleWorkflowAction = (action: WorkflowAction) => {
    console.log(`Workflow action: ${action}`)
    setFormData(prev => ({
      ...prev,
      status: action === 'approve' ? DocumentStatus.InProgress : 
              action === 'reject' ? DocumentStatus.Rejected : 
              prev.status,
      workflowStatus: action === 'approve' ? WorkflowStatus.approved : 
                      action === 'reject' ? WorkflowStatus.rejected : 
                      WorkflowStatus.pending,
      currentWorkflowStage: action === 'approve' ? getNextWorkflowStage(prev.currentWorkflowStage) :
                            action === 'reject' ? WorkflowStage.requester :
                            action === 'sendBack' ? getPreviousWorkflowStage(prev.currentWorkflowStage) :
                            prev.currentWorkflowStage
    }))
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader className="flex flex-col space-y-4">
          <PRHeader
            title={mode === 'add' ? "Create New Purchase Request" : "Purchase Request Details"}
            mode={mode}
            onModeChange={handleModeChange}
            onDocumentAction={handleDocumentAction}
          />
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              {['currentWorkflowStage', 'workflowStatus', 'status'].map(key => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <Badge variant={getBadgeVariant(String(formData[key as keyof PurchaseRequest]))} className="text-sm">
                    {String(formData[key as keyof PurchaseRequest])}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <PRForm formData={formData} setFormData={setFormData} isDisabled={mode === 'view'} />
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              {['items', 'details', 'budgets', 'workflow', 'attachments', 'activity'].map(tab => (
                <TabsTrigger key={tab} value={tab}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</TabsTrigger>
              ))}
            </TabsList>
            <form onSubmit={handleSubmit}>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <TabsContent value="items"><ItemsTab /></TabsContent>
                <TabsContent value="details"><DetailsTab formData={formData} setFormData={setFormData} isDisabled={mode === 'view'} /></TabsContent>
                <TabsContent value="budgets"><BudgetsTab /></TabsContent>
                <TabsContent value="workflow"><WorkflowTab /></TabsContent>
                <TabsContent value="attachments"><AttachmentsTab /></TabsContent>
                <TabsContent value="activity"><ActivityTab /></TabsContent>
              </ScrollArea>
              {(mode === 'edit' || mode === 'add') && (
                <Button type="submit" className="mt-6">
                  {mode === 'add' ? 'Create Purchase Request' : 'Update'}
                </Button>
              )}
            </form>
          </Tabs>
        </CardContent>
        {mode !== 'add' && (
          <CardFooter className="flex justify-end space-x-2">
            {[
              { action: 'approve', icon: CheckCircleIcon, color: 'green' },
              { action: 'reject', icon: XCircleIcon, color: 'red' },
              { action: 'sendBack', icon: RotateCcwIcon, color: 'yellow' }
            ].map(({ action, icon: Icon, color }) => (
              <Button key={action} onClick={() => handleWorkflowAction(action as WorkflowAction)} variant="outline" size="sm" className={`bg-${color}-500 text-white hover:bg-${color}-600`}>
                <Icon className="mr-2 h-4 w-4" />
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function getEmptyPurchaseRequest(): PurchaseRequest {
  return {
    id: '',
    refNumber: '',
    date: new Date().toISOString().split('T')[0],
    type: PRType.GeneralPurchase,
    description: '',
    requestorId: '',
    requestor: {
      name: '',
      id: '',
      department: ''
    },
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.requester,
    location: '',
    department: '',
    jobCode: '',
    estimatedTotal: 0,
    items: [],
    attachments: [],
    comments: [],
    budget: {
      totalBudget: 0,
      availableBudget: 0,
      allocatedBudget: 0
    },
    approvalHistory: []
  }
}