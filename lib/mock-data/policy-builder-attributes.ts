// Mock Attribute Definitions for Carmen ERP ABAC Policy Builder

import { AttributeDefinition, AttributeCategory } from '@/lib/types/policy-builder';
import { Operator } from '@/lib/types/permissions';

// ============================================================================
// Subject Attributes
// ============================================================================

const subjectAttributes: AttributeDefinition[] = [
  // Identity Attributes
  {
    path: 'subject.userId',
    name: 'userId',
    displayName: 'User ID',
    description: 'Unique identifier for the user',
    dataType: 'string',
    category: 'subject',
    examples: ['user123', 'john.doe', 'admin001'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['identity', 'core']
  },
  {
    path: 'subject.username',
    name: 'username',
    displayName: 'Username',
    description: 'User login name',
    dataType: 'string',
    category: 'subject',
    examples: ['john.doe', 'admin', 'chef.maria'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.STARTS_WITH, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['identity', 'authentication']
  },
  {
    path: 'subject.email',
    name: 'email',
    displayName: 'Email Address',
    description: 'User email address',
    dataType: 'string',
    category: 'subject',
    examples: ['john@example.com', 'admin@carmen.com', 'chef@restaurant.com'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.ENDS_WITH, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['identity', 'contact']
  },

  // Role and Permission Attributes
  {
    path: 'subject.role.name',
    name: 'role',
    displayName: 'Primary Role',
    description: 'User primary role in the system',
    dataType: 'string',
    category: 'subject',
    examples: ['purchasing-staff', 'financial-manager', 'chef', 'counter', 'admin'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['authorization', 'role', 'core']
  },
  {
    path: 'subject.roles',
    name: 'roles',
    displayName: 'All Roles',
    description: 'All roles assigned to the user',
    dataType: 'array',
    category: 'subject',
    examples: [['purchasing-staff', 'department-manager'], ['chef', 'inventory-manager']],
    validOperators: [Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['authorization', 'role']
  },

  // Organizational Attributes
  {
    path: 'subject.department.name',
    name: 'department',
    displayName: 'Department',
    description: 'User department',
    dataType: 'string',
    category: 'subject',
    examples: ['procurement', 'kitchen', 'finance', 'housekeeping', 'front-office'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['organization', 'core']
  },
  {
    path: 'subject.location.name',
    name: 'location',
    displayName: 'Location',
    description: 'User primary location',
    dataType: 'string',
    category: 'subject',
    examples: ['Main Hotel', 'Restaurant', 'Warehouse', 'Central Kitchen'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['organization', 'location']
  },

  // Employment Attributes
  {
    path: 'subject.employeeType',
    name: 'employeeType',
    displayName: 'Employee Type',
    description: 'Type of employment',
    dataType: 'string',
    category: 'subject',
    examples: ['full-time', 'part-time', 'contractor', 'temporary', 'intern'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['employment', 'hr']
  },
  {
    path: 'subject.seniority',
    name: 'seniority',
    displayName: 'Years of Service',
    description: 'Number of years employed',
    dataType: 'number',
    category: 'subject',
    examples: [0.5, 2, 5, 10, 15],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    isRequired: false,
    isSystem: true,
    tags: ['employment', 'experience']
  },
  {
    path: 'subject.clearanceLevel',
    name: 'clearanceLevel',
    displayName: 'Security Clearance',
    description: 'Security clearance level',
    dataType: 'string',
    category: 'subject',
    examples: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN, Operator.GREATER_THAN, Operator.LESS_THAN],
    isRequired: false,
    isSystem: true,
    tags: ['security', 'clearance']
  },

  // Financial Attributes
  {
    path: 'subject.approvalLimit.amount',
    name: 'approvalLimit',
    displayName: 'Approval Limit',
    description: 'Maximum amount user can approve',
    dataType: 'number',
    category: 'subject',
    examples: [1000, 5000, 25000, 100000, 500000],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    isRequired: false,
    isSystem: true,
    tags: ['financial', 'approval', 'limit']
  },

  // Status Attributes
  {
    path: 'subject.accountStatus',
    name: 'accountStatus',
    displayName: 'Account Status',
    description: 'Current status of user account',
    dataType: 'string',
    category: 'subject',
    examples: ['active', 'suspended', 'locked', 'inactive', 'pending'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['status', 'security']
  },
  {
    path: 'subject.onDuty',
    name: 'onDuty',
    displayName: 'On Duty',
    description: 'Whether user is currently on duty',
    dataType: 'boolean',
    category: 'subject',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['status', 'schedule']
  }
];

// ============================================================================
// Resource Attributes
// ============================================================================

const resourceAttributes: AttributeDefinition[] = [
  // Identity Attributes
  {
    path: 'resource.resourceId',
    name: 'resourceId',
    displayName: 'Resource ID',
    description: 'Unique identifier for the resource',
    dataType: 'string',
    category: 'resource',
    examples: ['pr-001', 'po-123', 'inv-456', 'vendor-789'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN, Operator.STARTS_WITH],
    isRequired: true,
    isSystem: true,
    tags: ['identity', 'core']
  },
  {
    path: 'resource.resourceType',
    name: 'resourceType',
    displayName: 'Resource Type',
    description: 'Type of resource being accessed',
    dataType: 'string',
    category: 'resource',
    examples: ['purchase_request', 'purchase_order', 'inventory_item', 'vendor', 'recipe', 'grn'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['type', 'core']
  },
  {
    path: 'resource.resourceName',
    name: 'resourceName',
    displayName: 'Resource Name',
    description: 'Human-readable name of the resource',
    dataType: 'string',
    category: 'resource',
    examples: ['Kitchen Equipment PR', 'Fresh Vegetables Order', 'Premium Vendor Profile'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.STARTS_WITH, Operator.ENDS_WITH],
    isRequired: false,
    isSystem: true,
    tags: ['identity', 'display']
  },

  // Ownership and Classification
  {
    path: 'resource.owner',
    name: 'owner',
    displayName: 'Resource Owner',
    description: 'User who owns or created this resource',
    dataType: 'string',
    category: 'resource',
    examples: ['john.doe', 'chef.maria', 'manager.alex'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['ownership', 'security']
  },
  {
    path: 'resource.ownerDepartment',
    name: 'ownerDepartment',
    displayName: 'Owner Department',
    description: 'Department that owns this resource',
    dataType: 'string',
    category: 'resource',
    examples: ['procurement', 'kitchen', 'finance', 'inventory'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['ownership', 'organization']
  },
  {
    path: 'resource.dataClassification',
    name: 'dataClassification',
    displayName: 'Data Classification',
    description: 'Security classification of the resource',
    dataType: 'string',
    category: 'resource',
    examples: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: true,
    isSystem: true,
    tags: ['security', 'classification']
  },

  // Status and Workflow
  {
    path: 'resource.documentStatus.status',
    name: 'documentStatus',
    displayName: 'Document Status',
    description: 'Current status of the document',
    dataType: 'string',
    category: 'resource',
    examples: ['draft', 'pending_approval', 'approved', 'rejected', 'cancelled', 'completed'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['status', 'workflow']
  },
  {
    path: 'resource.workflowStage',
    name: 'workflowStage',
    displayName: 'Workflow Stage',
    description: 'Current stage in workflow process',
    dataType: 'string',
    category: 'resource',
    examples: ['created', 'department_review', 'finance_review', 'final_approval', 'processing'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['workflow', 'process']
  },
  {
    path: 'resource.priority',
    name: 'priority',
    displayName: 'Priority Level',
    description: 'Priority level of the resource',
    dataType: 'string',
    category: 'resource',
    examples: ['low', 'normal', 'high', 'urgent', 'critical'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['priority', 'workflow']
  },

  // Financial Attributes
  {
    path: 'resource.totalValue.amount',
    name: 'totalValue',
    displayName: 'Total Value',
    description: 'Total monetary value of the resource',
    dataType: 'number',
    category: 'resource',
    examples: [100, 1000, 5000, 25000, 100000],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    isRequired: false,
    isSystem: true,
    tags: ['financial', 'value']
  },
  {
    path: 'resource.budgetCategory',
    name: 'budgetCategory',
    displayName: 'Budget Category',
    description: 'Budget category for this resource',
    dataType: 'string',
    category: 'resource',
    examples: ['food_beverage', 'equipment', 'supplies', 'maintenance', 'marketing'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['financial', 'budget']
  },

  // Compliance Attributes
  {
    path: 'resource.requiresAudit',
    name: 'requiresAudit',
    displayName: 'Requires Audit',
    description: 'Whether this resource requires audit trail',
    dataType: 'boolean',
    category: 'resource',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['compliance', 'audit']
  }
];

// ============================================================================
// Environment Attributes
// ============================================================================

const environmentAttributes: AttributeDefinition[] = [
  // Time Attributes
  {
    path: 'environment.currentTime',
    name: 'currentTime',
    displayName: 'Current Time',
    description: 'Current date and time of the request',
    dataType: 'date',
    category: 'environment',
    examples: ['2024-01-15T10:30:00Z', '2024-06-20T14:45:00Z'],
    validOperators: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    isRequired: true,
    isSystem: true,
    tags: ['time', 'temporal']
  },
  {
    path: 'environment.dayOfWeek',
    name: 'dayOfWeek',
    displayName: 'Day of Week',
    description: 'Current day of the week',
    dataType: 'string',
    category: 'environment',
    examples: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['time', 'schedule']
  },
  {
    path: 'environment.isBusinessHours',
    name: 'isBusinessHours',
    displayName: 'Business Hours',
    description: 'Whether request is during business hours',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['time', 'business']
  },
  {
    path: 'environment.isHoliday',
    name: 'isHoliday',
    displayName: 'Holiday',
    description: 'Whether current date is a holiday',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['time', 'holiday']
  },

  // Location Attributes
  {
    path: 'environment.requestIP',
    name: 'requestIP',
    displayName: 'Request IP Address',
    description: 'IP address from which request originated',
    dataType: 'string',
    category: 'environment',
    examples: ['192.168.1.100', '10.0.0.50', '172.16.0.25'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.STARTS_WITH, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['network', 'security']
  },
  {
    path: 'environment.isInternalNetwork',
    name: 'isInternalNetwork',
    displayName: 'Internal Network',
    description: 'Whether request is from internal network',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['network', 'security']
  },
  {
    path: 'environment.facility',
    name: 'facility',
    displayName: 'Facility',
    description: 'Physical facility from which request originated',
    dataType: 'string',
    category: 'environment',
    examples: ['main_hotel', 'restaurant_branch_1', 'warehouse_central', 'office_hq'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['location', 'physical']
  },

  // Device and Session Attributes
  {
    path: 'environment.deviceType',
    name: 'deviceType',
    displayName: 'Device Type',
    description: 'Type of device making the request',
    dataType: 'string',
    category: 'environment',
    examples: ['desktop', 'mobile', 'tablet', 'api', 'system'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['device', 'access']
  },
  {
    path: 'environment.authenticationMethod',
    name: 'authenticationMethod',
    displayName: 'Authentication Method',
    description: 'Method used to authenticate the user',
    dataType: 'string',
    category: 'environment',
    examples: ['password', 'sso', 'mfa', 'biometric', 'api_key', 'service_account'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['authentication', 'security']
  },
  {
    path: 'environment.sessionAge',
    name: 'sessionAge',
    displayName: 'Session Age (minutes)',
    description: 'How long user has been logged in',
    dataType: 'number',
    category: 'environment',
    examples: [5, 30, 120, 480, 1440],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    isRequired: false,
    isSystem: true,
    tags: ['session', 'time']
  },

  // System State Attributes
  {
    path: 'environment.systemLoad',
    name: 'systemLoad',
    displayName: 'System Load',
    description: 'Current system load level',
    dataType: 'string',
    category: 'environment',
    examples: ['low', 'normal', 'high', 'critical'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['system', 'performance']
  },
  {
    path: 'environment.maintenanceMode',
    name: 'maintenanceMode',
    displayName: 'Maintenance Mode',
    description: 'Whether system is in maintenance mode',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['system', 'maintenance']
  },
  {
    path: 'environment.emergencyMode',
    name: 'emergencyMode',
    displayName: 'Emergency Mode',
    description: 'Whether system is in emergency mode',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['system', 'emergency']
  },

  // Security Attributes
  {
    path: 'environment.threatLevel',
    name: 'threatLevel',
    displayName: 'Threat Level',
    description: 'Current security threat level',
    dataType: 'string',
    category: 'environment',
    examples: ['low', 'medium', 'high', 'critical'],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
    isRequired: false,
    isSystem: true,
    tags: ['security', 'threat']
  },
  {
    path: 'environment.auditMode',
    name: 'auditMode',
    displayName: 'Audit Mode',
    description: 'Whether system is in audit mode',
    dataType: 'boolean',
    category: 'environment',
    examples: [true, false],
    validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
    isRequired: false,
    isSystem: true,
    tags: ['audit', 'compliance']
  }
];

// ============================================================================
// Action Attributes
// ============================================================================

const actionDefinitions = [
  // CRUD Operations
  { action: 'create', displayName: 'Create', description: 'Create new resources', category: 'crud' },
  { action: 'read', displayName: 'Read/View', description: 'View or read resources', category: 'crud' },
  { action: 'update', displayName: 'Update/Edit', description: 'Modify existing resources', category: 'crud' },
  { action: 'delete', displayName: 'Delete', description: 'Delete resources', category: 'crud' },

  // Approval Operations
  { action: 'approve', displayName: 'Approve', description: 'Approve requests or documents', category: 'approval' },
  { action: 'reject', displayName: 'Reject', description: 'Reject requests or documents', category: 'approval' },
  { action: 'submit_for_approval', displayName: 'Submit for Approval', description: 'Submit documents for approval', category: 'approval' },
  { action: 'cancel_approval', displayName: 'Cancel Approval', description: 'Cancel pending approval', category: 'approval' },

  // Procurement Operations
  { action: 'place_order', displayName: 'Place Order', description: 'Place purchase orders', category: 'procurement' },
  { action: 'receive_goods', displayName: 'Receive Goods', description: 'Process goods receipt', category: 'procurement' },
  { action: 'process_invoice', displayName: 'Process Invoice', description: 'Process vendor invoices', category: 'procurement' },
  { action: 'negotiate_price', displayName: 'Negotiate Price', description: 'Negotiate prices with vendors', category: 'procurement' },

  // Inventory Operations
  { action: 'adjust_stock', displayName: 'Adjust Stock', description: 'Adjust inventory quantities', category: 'inventory' },
  { action: 'transfer_stock', displayName: 'Transfer Stock', description: 'Transfer stock between locations', category: 'inventory' },
  { action: 'conduct_count', displayName: 'Conduct Count', description: 'Perform physical inventory counts', category: 'inventory' },
  { action: 'write_off', displayName: 'Write Off', description: 'Write off damaged or expired items', category: 'inventory' },

  // Financial Operations
  { action: 'process_payment', displayName: 'Process Payment', description: 'Process payments to vendors', category: 'financial' },
  { action: 'view_financial_reports', displayName: 'View Financial Reports', description: 'Access financial reports', category: 'financial' },
  { action: 'manage_budget', displayName: 'Manage Budget', description: 'Manage department budgets', category: 'financial' },

  // System Administration
  { action: 'manage_users', displayName: 'Manage Users', description: 'Create and manage user accounts', category: 'admin' },
  { action: 'configure_system', displayName: 'Configure System', description: 'Configure system settings', category: 'admin' },
  { action: 'view_audit_logs', displayName: 'View Audit Logs', description: 'Access system audit logs', category: 'admin' },

  // Export/Import Operations
  { action: 'export_data', displayName: 'Export Data', description: 'Export data to external systems', category: 'data' },
  { action: 'import_data', displayName: 'Import Data', description: 'Import data from external sources', category: 'data' },
  { action: 'backup_data', displayName: 'Backup Data', description: 'Create data backups', category: 'data' }
];

// ============================================================================
// Organized Category Structure
// ============================================================================

export const attributeCategories: AttributeCategory[] = [
  {
    category: 'subject',
    displayName: 'Subject (Who)',
    description: 'Attributes about the user making the request',
    icon: 'User',
    attributes: subjectAttributes
  },
  {
    category: 'resource',
    displayName: 'Resource (What)',
    description: 'Attributes about the resource being accessed',
    icon: 'FileText',
    attributes: resourceAttributes
  },
  {
    category: 'environment',
    displayName: 'Environment (When/Where)',
    description: 'Attributes about the context of the request',
    icon: 'Globe',
    attributes: environmentAttributes
  },
  {
    category: 'action',
    displayName: 'Actions (How)',
    description: 'Operations that can be performed on resources',
    icon: 'Zap',
    attributes: []
  }
];

// ============================================================================
// Exports
// ============================================================================

export { subjectAttributes, resourceAttributes, environmentAttributes, actionDefinitions };

export const allAttributes: AttributeDefinition[] = [
  ...subjectAttributes,
  ...resourceAttributes,
  ...environmentAttributes
];

// Helper functions
export function getAttributesByCategory(category: 'subject' | 'resource' | 'environment' | 'action'): AttributeDefinition[] {
  return allAttributes.filter(attr => attr.category === category);
}

export function getAttributeByPath(path: string): AttributeDefinition | undefined {
  return allAttributes.find(attr => attr.path === path);
}

export function searchAttributes(query: string): AttributeDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return allAttributes.filter(attr => 
    attr.name.toLowerCase().includes(lowercaseQuery) ||
    attr.displayName.toLowerCase().includes(lowercaseQuery) ||
    attr.description.toLowerCase().includes(lowercaseQuery) ||
    (attr.tags && attr.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
}

export function getAttributesByTag(tag: string): AttributeDefinition[] {
  return allAttributes.filter(attr => attr.tags && attr.tags.includes(tag));
}