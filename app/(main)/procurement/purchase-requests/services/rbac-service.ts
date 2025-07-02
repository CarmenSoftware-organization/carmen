// RBAC Service for Purchase Request Management
export interface RoleConfiguration {
  widgetAccess: {
    myPR: boolean;
    myApproval: boolean;
    myOrder: boolean;
  };
  visibilitySetting: 'location' | 'department' | 'full';
}

export interface User {
  id: number;
  name: string;
  role: string;
  department: string;
  assignedWorkflowStages: string[];
}

export interface WorkflowStage {
  id: number;
  name: string;
  assignedUsers: number[];
}

export interface PurchaseRequestPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canSendBack: boolean;
  canSubmit: boolean;
  availableActions: WorkflowAction[];
}

export type WorkflowAction = 'approve' | 'reject' | 'sendBack' | 'submit' | 'edit' | 'delete';

export class PRRBACService {
  
  /**
   * Get user's role configuration
   */
  static getRoleConfiguration(userRole: string): RoleConfiguration {
    const roleConfigs: Record<string, RoleConfiguration> = {
      'Requester': {
        widgetAccess: { myPR: true, myApproval: false, myOrder: false },
        visibilitySetting: 'department'
      },
      'Department Head': {
        widgetAccess: { myPR: true, myApproval: true, myOrder: false },
        visibilitySetting: 'department'
      },
      'Finance Manager': {
        widgetAccess: { myPR: true, myApproval: true, myOrder: false },
        visibilitySetting: 'full'
      },
      'Purchasing Staff': {
        widgetAccess: { myPR: true, myApproval: true, myOrder: true },
        visibilitySetting: 'full'
      },
      'General Manager': {
        widgetAccess: { myPR: true, myApproval: true, myOrder: false },
        visibilitySetting: 'full'
      },
      'System Administrator': {
        widgetAccess: { myPR: true, myApproval: true, myOrder: true },
        visibilitySetting: 'full'
      }
    };

    return roleConfigs[userRole] || roleConfigs['Requester'];
  }

  /**
   * Check if user can perform specific action on PR
   */
  static canPerformAction(
    user: User, 
    pr: any, 
    action: WorkflowAction
  ): boolean {
    // Admin can do everything
    if (user.role === 'System Administrator') {
      return true;
    }

    // Check ownership for certain actions
    if (['edit', 'delete', 'submit'].includes(action)) {
      if (pr.requestorId !== user.id && user.role !== 'System Administrator') {
        return false;
      }
    }

    // Check status-based permissions
    switch (action) {
      case 'edit':
        return pr.status === 'Draft' || pr.status === 'Rejected';
      
      case 'delete':
        return pr.status === 'Draft' && pr.requestorId === user.id;
      
      case 'submit':
        return pr.status === 'Draft' && pr.requestorId === user.id;
      
      case 'approve':
      case 'reject':
      case 'sendBack':
        return this.canApproveAtCurrentStage(user, pr);
      
      default:
        return false;
    }
  }

  /**
   * Check if user can approve at current workflow stage
   */
  static canApproveAtCurrentStage(user: User, pr: any): boolean {
    // Check if user is assigned to current workflow stage
    if (!user.assignedWorkflowStages.includes(pr.currentWorkflowStage)) {
      return false;
    }

    // Check if PR is in actionable status
    return ['Submitted', 'In Progress'].includes(pr.status);
  }

  /**
   * Get available workflow actions for user and PR
   */
  static getAvailableActions(user: User, pr: any): WorkflowAction[] {
    const actions: WorkflowAction[] = [];

    // Check each possible action
    const possibleActions: WorkflowAction[] = ['approve', 'reject', 'sendBack', 'edit', 'delete', 'submit'];
    
    possibleActions.forEach(action => {
      if (this.canPerformAction(user, pr, action)) {
        actions.push(action);
      }
    });

    return actions;
  }

  /**
   * Get user's assigned workflow stages
   */
  static getUserAssignedStages(userId: number): string[] {
    // This would typically come from the workflow configuration
    // For now, return mock data based on user role
    const mockStageAssignments: Record<number, string[]> = {
      1: [], // Requester
      2: ['Department Approval'], // Department Head
      3: ['Finance Review'], // Finance Manager
      4: ['Purchasing Review'], // Purchasing Staff
      5: ['Final Approval'], // General Manager
      999: ['Department Approval', 'Finance Review', 'Purchasing Review', 'Final Approval'] // Admin
    };

    return mockStageAssignments[userId] || [];
  }

  /**
   * Check if user has widget access
   */
  static hasWidgetAccess(user: User, widget: keyof RoleConfiguration['widgetAccess']): boolean {
    const roleConfig = this.getRoleConfiguration(user.role);
    return roleConfig.widgetAccess[widget];
  }

  /**
   * Get workflow action button configuration
   */
  static getWorkflowActionButtons(user: User, pr: any) {
    const availableActions = this.getAvailableActions(user, pr);
    
    const buttonConfigs = {
      approve: {
        label: 'Approve',
        icon: 'CheckCircle',
        variant: 'default' as const,
        description: 'Approve this purchase request'
      },
      reject: {
        label: 'Reject',
        icon: 'XCircle',
        variant: 'destructive' as const,
        description: 'Reject this purchase request'
      },
      sendBack: {
        label: 'Send Back',
        icon: 'RotateCcw',
        variant: 'outline' as const,
        description: 'Send back for revision'
      },
      edit: {
        label: 'Edit',
        icon: 'Edit',
        variant: 'outline' as const,
        description: 'Edit purchase request'
      },
      delete: {
        label: 'Delete',
        icon: 'Trash',
        variant: 'destructive' as const,
        description: 'Delete purchase request'
      },
      submit: {
        label: 'Submit',
        icon: 'Send',
        variant: 'default' as const,
        description: 'Submit for approval'
      }
    };

    return availableActions.map(action => ({
      action,
      ...buttonConfigs[action]
    }));
  }

  /**
   * Validate item-level action permissions
   */
  static canPerformItemAction(
    user: User, 
    item: any, 
    action: 'approve' | 'reject' | 'review'
  ): boolean {
    switch (user.role) {
      case 'Department Head':
        return ['Pending', 'Review'].includes(item.status);
      
      case 'Purchasing Staff':
        return ['Approved', 'Review'].includes(item.status);
      
      case 'Requester':
        return action === 'review' && item.status === 'Pending';
      
      case 'System Administrator':
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Get available item actions for user and item
   */
  static getAvailableItemActions(user: User, item: any) {
    const actions: Array<{action: string, label: string, variant: string}> = [];

    if (this.canPerformItemAction(user, item, 'approve')) {
      actions.push({
        action: 'approve',
        label: 'Approve',
        variant: 'default'
      });
    }

    if (this.canPerformItemAction(user, item, 'reject')) {
      actions.push({
        action: 'reject',
        label: 'Reject',
        variant: 'destructive'
      });
    }

    if (this.canPerformItemAction(user, item, 'review')) {
      actions.push({
        action: 'review',
        label: 'Review',
        variant: 'outline'
      });
    }

    return actions;
  }
}