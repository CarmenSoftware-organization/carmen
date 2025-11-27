// Workflow Decision Engine - Priority-Based Logic for PR Approval
import { PurchaseRequestItem, PRStatus } from "@/lib/types";

export interface WorkflowDecision {
  canSubmit: boolean;
  action: 'approve' | 'reject' | 'return' | 'blocked';
  buttonText: string;
  buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary';
  buttonColor?: string;
  reason: string;
  itemsSummary: {
    approved: number;
    rejected: number;
    review: number;
    pending: number;
    total: number;
  };
}

export interface ItemWorkflowState {
  canApprove: boolean;
  canReject: boolean;
  canReview: boolean;
  canComment: boolean;
  availableActions: string[];
}

export class WorkflowDecisionEngine {
  
  /**
   * Analyze PR items and determine the overall workflow decision
   * Priority logic: All Rejected → Reject, Any Review → Return, Any Pending → Block, Any Approved → Approve
   */
  static analyzeWorkflowState(items: PurchaseRequestItem[]): WorkflowDecision {
    const summary = this.getItemsSummary(items);
    
    // Priority 1: All items rejected
    if (summary.rejected === summary.total && summary.total > 0) {
      return {
        canSubmit: true,
        action: 'reject',
        buttonText: 'Submit & Reject',
        buttonVariant: 'destructive',
        reason: 'All items have been rejected',
        itemsSummary: summary
      };
    }
    
    // Priority 2: Any items marked for review
    if (summary.review > 0) {
      return {
        canSubmit: true,
        action: 'return',
        buttonText: 'Submit & Return',
        buttonVariant: 'outline',
        buttonColor: 'text-orange-600 border-orange-600 hover:bg-orange-50',
        reason: `${summary.review} item(s) marked for review`,
        itemsSummary: summary
      };
    }
    
    // Priority 3: Any items still pending (blocks submission)
    if (summary.pending > 0) {
      return {
        canSubmit: false,
        action: 'blocked',
        buttonText: 'Review Required',
        buttonVariant: 'secondary',
        reason: `${summary.pending} item(s) still pending review`,
        itemsSummary: summary
      };
    }
    
    // Priority 4: Any items approved (can proceed)
    if (summary.approved > 0) {
      return {
        canSubmit: true,
        action: 'approve',
        buttonText: 'Submit & Approve',
        buttonVariant: 'default',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        reason: `${summary.approved} item(s) approved for procurement`,
        itemsSummary: summary
      };
    }
    
    // Default: No items or all items in unknown state
    return {
      canSubmit: false,
      action: 'blocked',
      buttonText: 'No Items',
      buttonVariant: 'secondary',
      reason: 'No items available for approval',
      itemsSummary: summary
    };
  }
  
  /**
   * Get summary count of items by status
   */
  static getItemsSummary(items: PurchaseRequestItem[]) {
    const summary = {
      approved: 0,
      rejected: 0,
      review: 0,
      pending: 0,
      total: items.length
    };
    
    items.forEach(item => {
      switch (item.status) {
        case PRStatus.Approved:
          summary.approved++;
          break;
        case PRStatus.Cancelled:
          summary.rejected++;
          break;
        case PRStatus.InProgress:
          summary.review++;
          break;
        case PRStatus.Draft:
        default:
          summary.pending++;
          break;
      }
    });
    
    return summary;
  }
  
  /**
   * Check what actions are available for a specific item based on user role and item status
   */
  static getItemWorkflowState(
    item: PurchaseRequestItem, 
    userRole: string, 
    workflowStage: string
  ): ItemWorkflowState {
    const state: ItemWorkflowState = {
      canApprove: false,
      canReject: false,
      canReview: false,
      canComment: false, // No users can comment
      availableActions: []
    };
    
    // Only allow actions on Pending or Review status items
    if (![PRStatus.Draft, PRStatus.InProgress].includes(item.status)) {
      // No users can add comments
      state.availableActions = ['history'];
      return state;
    }
    
    // Department Manager permissions
    if (['Department Manager', 'Department Head'].includes(userRole)) {
      state.canApprove = true;
      state.canReject = true;
      state.canReview = true;
      state.availableActions = ['approve', 'reject', 'review', 'history'];
    }
    
    // Financial Manager permissions
    if (['Financial Manager', 'Finance Manager'].includes(userRole)) {
      state.canApprove = true;
      state.canReject = true;
      state.canReview = true;
      state.availableActions = ['approve', 'reject', 'review', 'history'];
    }
    
    // Purchasing Staff permissions
    if (['Purchasing Staff', 'Purchaser'].includes(userRole)) {
      state.canApprove = true;
      state.canReject = true;
      state.canReview = true;
      state.availableActions = ['approve', 'reject', 'review', 'history'];
    }
    
    // Approver permissions
    if (['Approver'].includes(userRole)) {
      state.canApprove = true;
      state.canReject = true;
      state.canReview = true;
      state.availableActions = ['approve', 'reject', 'review', 'history'];
    }
    
    // Requestor can only mark for review on pending items
    if (['Staff', 'Requestor'].includes(userRole) && item.status === PRStatus.Draft) {
      state.canReview = true;
      state.availableActions = ['review', 'history'];
    }
    
    // System Administrator has all permissions
    if (userRole === 'System Administrator') {
      state.canApprove = true;
      state.canReject = true;
      state.canReview = true;
      state.availableActions = ['approve', 'reject', 'review', 'history'];
    }
    
    return state;
  }
  
  /**
   * Validate if user can perform a workflow action on the entire PR
   */
  static canPerformPRAction(
    userRole: string, 
    workflowStage: string, 
    action: 'approve' | 'reject' | 'return'
  ): boolean {
    // Requestors cannot perform PR-level workflow actions
    if (['Staff', 'Requestor'].includes(userRole)) {
      return false;
    }
    
    // Approvers can perform workflow actions
    if (['Department Manager', 'Financial Manager', 'Purchasing Staff', 'System Administrator'].includes(userRole)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get formatted summary text for UI display
   */
  static getWorkflowSummaryText(decision: WorkflowDecision): string {
    const { itemsSummary } = decision;
    const parts = [];
    
    if (itemsSummary.approved > 0) {
      parts.push(`${itemsSummary.approved} Approved`);
    }
    if (itemsSummary.rejected > 0) {
      parts.push(`${itemsSummary.rejected} Rejected`);
    }
    if (itemsSummary.review > 0) {
      parts.push(`${itemsSummary.review} Review`);
    }
    if (itemsSummary.pending > 0) {
      parts.push(`${itemsSummary.pending} Pending`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No items';
  }
  
  /**
   * Determine next workflow stage based on decision
   */
  static getNextWorkflowStage(
    currentStage: string, 
    decision: WorkflowDecision
  ): string {
    switch (decision.action) {
      case 'approve':
        // Progress to next stage
        if (currentStage === 'departmentHeadApproval') {
          return 'financialApproval';
        }
        if (currentStage === 'financialApproval') {
          return 'purchasing';
        }
        if (currentStage === 'purchasing') {
          return 'completed';
        }
        return currentStage;
        
      case 'reject':
        return 'rejected';
        
      case 'return':
        // Send back to previous stage or requester
        if (currentStage === 'financialApproval') {
          return 'departmentHeadApproval';
        }
        return 'requester';
        
      default:
        return currentStage;
    }
  }
}