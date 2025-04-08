import { WorkflowStage } from '@/lib/types'

// File: utils.ts

export const getBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" => {
  switch (status) {
    case 'Approved':
    case 'approved':
      return 'success';
    case 'Rejected':
    case 'rejected':
      return 'destructive';
    case 'Draft':
      return 'outline';
    case 'Submitted':
    case 'pending':
      return 'secondary';
    default:
      return 'default';
  }
};

export const handleDocumentAction = (action: 'print' | 'download' | 'share') => {
  console.log(`Document action: ${action}`)
  switch (action) {
    case 'print':
      window.print()
      break
    case 'download':
    case 'share':
      console.log(`${action} functionality to be implemented`)
      break
  }
}

export const getNextWorkflowStage = (currentStage: WorkflowStage): WorkflowStage => {
  const stages = Object.values(WorkflowStage)
  const currentIndex = stages.indexOf(currentStage)
  return stages[currentIndex + 1] || WorkflowStage.completed
}

export const getPreviousWorkflowStage = (currentStage: WorkflowStage): WorkflowStage => {
  const stages = Object.values(WorkflowStage)
  const currentIndex = stages.indexOf(currentStage)
  return stages[currentIndex - 1] || WorkflowStage.requester
}
