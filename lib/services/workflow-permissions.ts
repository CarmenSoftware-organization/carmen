import { WorkflowRoleType } from '@/app/(main)/system-administration/workflow/workflow-configuration/types/workflow';
import { FieldPermissions } from '@/lib/utils/field-permissions';

/**
 * Get field permissions based on workflow role types
 * This replaces the hardcoded role-based permission system
 */
export function getWorkflowFieldPermissions(workflowRoles: WorkflowRoleType[]): FieldPermissions {
  const permissions: FieldPermissions = {
    location: false,
    product: false,
    comment: false,
    requestQty: false,
    requestUnit: false,
    requiredDate: false,
    approvedQty: false,
    vendor: false,
    price: false,
    orderUnit: false,
    refNumber: false,
    date: false,
    type: false,
    requestor: false,
    department: false,
    description: false,
  };

  // Apply permissions based on workflow roles
  if (workflowRoles.includes('requester')) {
    permissions.location = true;
    permissions.product = true;
    permissions.comment = true;
    permissions.requestQty = true;
    permissions.requestUnit = true;
    permissions.requiredDate = true;
    // PR Header permissions for requestor
    permissions.refNumber = true;
    permissions.date = true;
    permissions.type = true;
    permissions.requestor = true;
    permissions.department = true;
    permissions.description = true;
  }

  if (workflowRoles.includes('approver')) {
    permissions.comment = true;
    permissions.approvedQty = true;
  }

  if (workflowRoles.includes('purchaser')) {
    permissions.comment = true;
    permissions.approvedQty = true;
    permissions.vendor = true;
    permissions.price = true;
    permissions.orderUnit = true;
  }

  if (workflowRoles.includes('reviewer')) {
    permissions.comment = true;
  }

  return permissions;
}

/**
 * Check if user can view financial information based on workflow roles
 * This replaces the hardcoded role name checking
 */
export function canViewWorkflowFinancialInfo(workflowRoles: WorkflowRoleType[]): boolean {
  // Only requesters cannot view financial info in workflow context
  // If user has any role other than just 'requester', they can view financial info
  if (workflowRoles.length === 0) {
    return false; // No workflow roles assigned
  }

  if (workflowRoles.length === 1 && workflowRoles[0] === 'requester') {
    return false; // Only requester role
  }

  return true; // Has approver, purchaser, or reviewer roles
}

/**
 * Check if user can edit a specific field based on workflow roles
 */
export function canEditWorkflowField(fieldName: keyof FieldPermissions, workflowRoles: WorkflowRoleType[]): boolean {
  const permissions = getWorkflowFieldPermissions(workflowRoles);
  return permissions[fieldName];
}

/**
 * Get user's primary workflow role for display purposes
 */
export function getPrimaryWorkflowRole(workflowRoles: WorkflowRoleType[]): WorkflowRoleType | null {
  if (workflowRoles.length === 0) return null;

  // Priority order: purchaser > approver > reviewer > requester
  const rolePriority: Record<WorkflowRoleType, number> = {
    purchaser: 4,
    approver: 3,
    reviewer: 2,
    requester: 1
  };

  return workflowRoles.reduce((highest, current) => {
    return rolePriority[current] > rolePriority[highest] ? current : highest;
  });
}

/**
 * Get human-readable role names for display
 */
export function getWorkflowRoleDisplayName(roleType: WorkflowRoleType): string {
  const displayNames: Record<WorkflowRoleType, string> = {
    requester: 'Requestor',
    purchaser: 'Purchasing Staff',
    approver: 'Approver',
    reviewer: 'Reviewer'
  };

  return displayNames[roleType];
}