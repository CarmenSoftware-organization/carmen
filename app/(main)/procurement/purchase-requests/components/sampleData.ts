import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage } from '@/lib/types'

export const samplePRData: PurchaseRequest = {
  id: 'sample-pr-001',
  refNumber: 'PR-2023-001',
  date: new Date('2023-01-01'),
  type: PRType.GeneralPurchase,
  description: 'Sample purchase request for office supplies',
  requestorId: 'user-001',
  requestor: {
    name: 'John Doe',
    id: 'user-001',
    department: 'Administration'
  },
  status: DocumentStatus.Draft,
  workflowStatus: WorkflowStatus.pending,
  currentWorkflowStage: WorkflowStage.requester,
  location: 'Head Office',
  department: 'Administration',
  jobCode: 'JOB-001',
  estimatedTotal: 1500,
  vendor: 'Office Supplies Co.',
  vendorId: 1,
  deliveryDate: new Date('2023-01-15')
}