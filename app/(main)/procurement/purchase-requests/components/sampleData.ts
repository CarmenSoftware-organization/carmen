import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage } from '@/types/types'

export const samplePRData: PurchaseRequest = {
    id: 'PR-2023-001',
    refNumber: 'REF-001-2023',
    date: '2023-07-20',
    type: PRType.GeneralPurchase,
    description: 'Office supplies and equipment for new hires',
    requestorId: 'EMP-001',
    requestor: {
        name: 'John Doe',
        id: 'EMP-001',
        department: 'IT Department'
    },
    status: DocumentStatus.Submitted,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.departmentHeadApproval,
    location: 'Headquarters',
    department: 'IT Department',
    jobCode: 'JOB-IT-23',
    estimatedTotal: 5000.00,
    items: [],
    attachments: [],
    approvalHistory: [],
    budget: {
        totalBudget: 0,
        availableBudget: 0,
        allocatedBudget: 0
    },
    comments: []
}