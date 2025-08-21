'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCircle2, 
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Eye
} from 'lucide-react'
import StatusBadge from '@/components/ui/custom-status-badge'
import { useToast } from '@/hooks/use-toast'

interface ApprovalStep {
  id: string
  level: string
  approver: string
  role: string
  status: 'pending' | 'approved' | 'rejected' | 'current'
  comments?: string
  approvedAt?: string
  isRequired: boolean
}

interface ApprovalWorkflowProps {
  requisitionId: string
  currentStatus: string
  approvalSteps: ApprovalStep[]
  currentUserRole: string
  onApprove: (stepId: string, comments: string) => void
  onReject: (stepId: string, comments: string) => void
  onSendBack: (stepId: string, comments: string) => void
}

export function ApprovalWorkflow({ 
  requisitionId, 
  currentStatus,
  approvalSteps, 
  currentUserRole,
  onApprove,
  onReject,
  onSendBack 
}: ApprovalWorkflowProps) {
  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const currentStep = approvalSteps.find(step => step.status === 'current')
  const canApprove = currentStep && (
    currentUserRole === currentStep.role || 
    currentUserRole === 'admin'
  )

  // Workflow Decision Engine - analyzes current state and determines available actions
  const getWorkflowDecision = () => {
    if (!currentStep) return { actions: [], blocked: true, reason: 'No current approval step' }
    
    // For Store Requisition workflow - simplified decision engine
    const actions = []
    
    // Basic approval actions always available for authorized users
    if (canApprove) {
      actions.push({
        type: 'approve',
        label: 'Approve',
        variant: 'default',
        className: 'bg-green-600 hover:bg-green-700',
        icon: 'CheckCircle2',
        description: 'Approve and move to next stage'
      })
      
      actions.push({
        type: 'sendback',
        label: 'Return',
        variant: 'outline',
        className: 'border-amber-300 text-amber-700 hover:bg-amber-50',
        icon: 'ChevronRight',
        description: 'Return for review and modifications'
      })
      
      actions.push({
        type: 'reject',
        label: 'Reject',
        variant: 'destructive',
        className: '',
        icon: 'XCircle',
        description: 'Reject with comments'
      })
    }
    
    return {
      actions,
      blocked: false,
      reason: actions.length > 0 ? 'Actions available' : 'No actions available for current user'
    }
  }

  const workflowDecision = getWorkflowDecision()

  const handleApprove = async () => {
    if (!currentStep) return
    
    setIsSubmitting(true)
    try {
      await onApprove(currentStep.id, comments)
      setComments('')
      
      // Check if this is the final approval step
      const remainingSteps = approvalSteps.filter(step => 
        step.status === 'pending' && step.id !== currentStep.id
      )
      
      const isLastStep = remainingSteps.length === 0
      
      toast({
        title: "Approval Successful",
        description: isLastStep 
          ? "Final approval completed. Requisition will proceed to processing." 
          : "Requisition approved and moved to next approval stage.",
      })
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve requisition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!currentStep) return
    
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide rejection reason in comments.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onReject(currentStep.id, comments)
      setComments('')
      toast({
        title: "Requisition Rejected",
        description: "Requisition has been rejected and returned to requester for revision.",
      })
    } catch (error) {
      toast({
        title: "Rejection Failed", 
        description: "Failed to reject requisition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendBack = async () => {
    if (!currentStep) return
    
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide reason for returning in comments.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSendBack(currentStep.id, comments)
      setComments('')
      toast({
        title: "Requisition Returned",
        description: "Requisition has been returned to requester for review and modifications.",
      })
    } catch (error) {
      toast({
        title: "Return Failed", 
        description: "Failed to return requisition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation helper for actions that require comments
  const requiresComments = (actionType: string) => {
    return actionType === 'reject' || actionType === 'sendback'
  }

  const validateAction = (actionType: string) => {
    if (requiresComments(actionType) && !comments.trim()) {
      toast({
        title: "Comments Required",
        description: `Please provide ${actionType === 'reject' ? 'rejection reason' : 'reason for returning'} in comments.`,
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />
      case 'current': return <Clock className="w-5 h-5 text-blue-600" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'current': return 'Pending'
      default: return 'Waiting'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium">Current Status</h4>
            <p className="text-sm text-muted-foreground">
              Requisition {requisitionId} - {currentStatus === 'In Process' ? 'Processing through approval workflow' : 'Under review'}
            </p>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Approval Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Approval Steps</h4>
            {currentStatus === 'In Process' && (
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                Active Workflow
              </div>
            )}
          </div>
          <div className="space-y-3">
            {approvalSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white">
                    {getStepIcon(step.status)}
                  </div>
                  {index < approvalSteps.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{step.level}</h5>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <UserCircle2 className="w-4 h-4" />
                        {step.approver} ({step.role})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        step.status === 'approved' ? 'default' :
                        step.status === 'rejected' ? 'destructive' :
                        step.status === 'current' ? 'secondary' : 'outline'
                      }>
                        {getStepStatus(step.status)}
                      </Badge>
                      {step.isRequired && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {step.comments && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <MessageSquare className="w-3 h-3" />
                        Comments:
                      </div>
                      <p>{step.comments}</p>
                    </div>
                  )}
                  
                  {step.approvedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.status === 'approved' ? 'Approved' : 'Rejected'} on {step.approvedAt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Decision Summary */}
        {!workflowDecision.blocked && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {workflowDecision.actions.length} action{workflowDecision.actions.length !== 1 ? 's' : ''} available
              </span>
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
              {workflowDecision.reason}
            </p>
          </div>
        )}

        {/* Action Section */}
        {canApprove && currentStep && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Action Required</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    Comments 
                    <span className="text-xs text-muted-foreground ml-1">
                      (Required for rejection and return actions)
                    </span>
                  </label>
                  <Textarea 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add your comments here... (Required for rejection/return)"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                {/* Action Guide */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                  <div className="font-medium mb-2">Action Guidelines:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Approve:</strong> Move requisition to next approval stage</li>
                    <li>• <strong>Return:</strong> Return to requester for modifications (requires comments)</li>
                    <li>• <strong>Reject:</strong> Permanently reject requisition (requires comments)</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {workflowDecision.actions.map((action) => {
                    const handleClick = () => {
                      // Validate action before proceeding
                      if (!validateAction(action.type)) {
                        return
                      }

                      switch (action.type) {
                        case 'approve':
                          handleApprove()
                          break
                        case 'sendback':
                          handleSendBack()
                          break
                        case 'reject':
                          handleReject()
                          break
                        default:
                          break
                      }
                    }

                    const IconComponent = action.icon === 'CheckCircle2' ? CheckCircle2 :
                                        action.icon === 'ChevronRight' ? ChevronRight :
                                        action.icon === 'XCircle' ? XCircle : CheckCircle2

                    const needsComments = requiresComments(action.type)
                    const hasComments = comments.trim().length > 0

                    return (
                      <Button 
                        key={action.type}
                        onClick={handleClick}
                        disabled={isSubmitting || (needsComments && !hasComments)}
                        variant={action.variant as any}
                        className={`${action.className} ${needsComments && !hasComments ? 'opacity-60' : ''}`}
                        title={needsComments ? 
                          (hasComments ? action.description : `${action.description} (Comments required)`) : 
                          action.description
                        }
                      >
                        <IconComponent className={`w-4 h-4 mr-2 ${action.icon === 'ChevronRight' ? 'rotate-180' : ''}`} />
                        {action.label}
                        {needsComments && !hasComments && (
                          <AlertTriangle className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info for non-approvers */}
        {!canApprove && currentStep && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Waiting for approval from {currentStep.approver} ({currentStep.role})
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}