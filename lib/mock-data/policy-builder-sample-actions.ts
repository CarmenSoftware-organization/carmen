// Sample Actions for Carmen ERP ABAC Policy Builder
// Comprehensive action definitions for hospitality ERP operations

export interface ActionDefinition {
  action: string;
  displayName: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval?: boolean;
  auditRequired?: boolean;
  tags: string[];
}

// ============================================================================
// Procurement Module Actions
// ============================================================================

const procurementActions: ActionDefinition[] = [
  // Purchase Request Actions
  {
    action: 'create_purchase_request',
    displayName: 'Create Purchase Request',
    description: 'Create new purchase request for items or services',
    category: 'procurement',
    riskLevel: 'low',
    auditRequired: true,
    tags: ['procurement', 'purchase', 'create', 'request']
  },
  {
    action: 'submit_purchase_request',
    displayName: 'Submit Purchase Request',
    description: 'Submit purchase request for approval',
    category: 'procurement',
    riskLevel: 'medium',
    requiresApproval: false,
    auditRequired: true,
    tags: ['procurement', 'purchase', 'submit', 'workflow']
  },
  {
    action: 'approve_purchase_request',
    displayName: 'Approve Purchase Request',
    description: 'Approve purchase request for processing',
    category: 'procurement',
    riskLevel: 'high',
    requiresApproval: false,
    auditRequired: true,
    tags: ['procurement', 'purchase', 'approve', 'workflow', 'decision']
  },
  {
    action: 'reject_purchase_request',
    displayName: 'Reject Purchase Request',
    description: 'Reject purchase request with reason',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'purchase', 'reject', 'workflow', 'decision']
  },
  {
    action: 'modify_purchase_request',
    displayName: 'Modify Purchase Request',
    description: 'Edit existing purchase request details',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'purchase', 'modify', 'edit']
  },
  {
    action: 'cancel_purchase_request',
    displayName: 'Cancel Purchase Request',
    description: 'Cancel pending purchase request',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'purchase', 'cancel']
  },
  {
    action: 'view_purchase_request',
    displayName: 'View Purchase Request',
    description: 'View purchase request details and status',
    category: 'procurement',
    riskLevel: 'low',
    tags: ['procurement', 'purchase', 'view', 'read']
  },

  // Purchase Order Actions
  {
    action: 'generate_purchase_order',
    displayName: 'Generate Purchase Order',
    description: 'Create purchase order from approved request',
    category: 'procurement',
    riskLevel: 'high',
    auditRequired: true,
    tags: ['procurement', 'order', 'generate', 'create']
  },
  {
    action: 'send_purchase_order',
    displayName: 'Send Purchase Order',
    description: 'Send purchase order to vendor',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'order', 'send', 'vendor']
  },
  {
    action: 'receive_purchase_order',
    displayName: 'Receive Purchase Order Response',
    description: 'Process vendor response to purchase order',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'order', 'receive', 'vendor']
  },
  {
    action: 'dispute_purchase_order',
    displayName: 'Dispute Purchase Order',
    description: 'Raise dispute on purchase order terms',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'order', 'dispute']
  },
  {
    action: 'track_purchase_order',
    displayName: 'Track Purchase Order',
    description: 'Monitor purchase order status and delivery',
    category: 'procurement',
    riskLevel: 'low',
    tags: ['procurement', 'order', 'track', 'monitor']
  },

  // Goods Received Note (GRN) Actions
  {
    action: 'create_grn',
    displayName: 'Create Goods Received Note',
    description: 'Create GRN for received goods',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'grn', 'create', 'receiving']
  },
  {
    action: 'verify_grn',
    displayName: 'Verify GRN',
    description: 'Verify goods against purchase order',
    category: 'procurement',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['procurement', 'grn', 'verify', 'quality']
  },
  {
    action: 'reconcile_grn',
    displayName: 'Reconcile GRN',
    description: 'Reconcile GRN with invoice and PO',
    category: 'procurement',
    riskLevel: 'high',
    auditRequired: true,
    tags: ['procurement', 'grn', 'reconcile', 'finance']
  },
  {
    action: 'archive_grn',
    displayName: 'Archive GRN',
    description: 'Archive completed GRN records',
    category: 'procurement',
    riskLevel: 'low',
    auditRequired: true,
    tags: ['procurement', 'grn', 'archive']
  }
];

// ============================================================================
// Vendor Management Actions
// ============================================================================

const vendorActions: ActionDefinition[] = [
  {
    action: 'register_vendor',
    displayName: 'Register Vendor',
    description: 'Register new vendor in the system',
    category: 'vendor',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['vendor', 'register', 'create', 'onboarding']
  },
  {
    action: 'evaluate_vendor',
    displayName: 'Evaluate Vendor',
    description: 'Conduct vendor performance evaluation',
    category: 'vendor',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['vendor', 'evaluate', 'performance', 'quality']
  },
  {
    action: 'blacklist_vendor',
    displayName: 'Blacklist Vendor',
    description: 'Add vendor to blacklist due to poor performance',
    category: 'vendor',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['vendor', 'blacklist', 'restrict', 'compliance']
  },
  {
    action: 'certify_vendor',
    displayName: 'Certify Vendor',
    description: 'Grant certification to vendor for quality standards',
    category: 'vendor',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['vendor', 'certify', 'quality', 'compliance']
  },
  {
    action: 'update_vendor_profile',
    displayName: 'Update Vendor Profile',
    description: 'Modify vendor information and details',
    category: 'vendor',
    riskLevel: 'low',
    auditRequired: true,
    tags: ['vendor', 'update', 'profile', 'edit']
  },
  {
    action: 'negotiate_vendor_terms',
    displayName: 'Negotiate Vendor Terms',
    description: 'Negotiate pricing and contract terms with vendor',
    category: 'vendor',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['vendor', 'negotiate', 'terms', 'contract']
  }
];

// ============================================================================
// Inventory Management Actions
// ============================================================================

const inventoryActions: ActionDefinition[] = [
  // Stock Management Actions
  {
    action: 'adjust_stock',
    displayName: 'Adjust Stock Levels',
    description: 'Adjust inventory quantities for items',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'stock', 'adjust', 'quantity']
  },
  {
    action: 'transfer_stock',
    displayName: 'Transfer Stock',
    description: 'Transfer stock between locations or departments',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'stock', 'transfer', 'location']
  },
  {
    action: 'count_stock',
    displayName: 'Count Stock',
    description: 'Perform physical inventory count',
    category: 'inventory',
    riskLevel: 'low',
    auditRequired: true,
    tags: ['inventory', 'stock', 'count', 'audit']
  },
  {
    action: 'reserve_stock',
    displayName: 'Reserve Stock',
    description: 'Reserve inventory items for specific orders',
    category: 'inventory',
    riskLevel: 'low',
    tags: ['inventory', 'stock', 'reserve', 'allocation']
  },
  {
    action: 'allocate_stock',
    displayName: 'Allocate Stock',
    description: 'Allocate stock to departments or orders',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'stock', 'allocate', 'assignment']
  },

  // Item Management Actions
  {
    action: 'add_inventory_item',
    displayName: 'Add Inventory Item',
    description: 'Add new item to inventory catalog',
    category: 'inventory',
    riskLevel: 'low',
    auditRequired: true,
    tags: ['inventory', 'item', 'add', 'catalog']
  },
  {
    action: 'categorize_item',
    displayName: 'Categorize Item',
    description: 'Assign categories and classifications to items',
    category: 'inventory',
    riskLevel: 'low',
    tags: ['inventory', 'item', 'categorize', 'classify']
  },
  {
    action: 'price_item',
    displayName: 'Set Item Price',
    description: 'Set or update item pricing information',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'item', 'price', 'financial']
  },
  {
    action: 'discontinue_item',
    displayName: 'Discontinue Item',
    description: 'Mark item as discontinued or obsolete',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'item', 'discontinue', 'lifecycle']
  },

  // Warehouse Operations
  {
    action: 'receive_goods',
    displayName: 'Receive Goods',
    description: 'Process incoming goods at warehouse',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'warehouse', 'receive', 'goods']
  },
  {
    action: 'pick_items',
    displayName: 'Pick Items',
    description: 'Pick items from warehouse for orders',
    category: 'inventory',
    riskLevel: 'low',
    tags: ['inventory', 'warehouse', 'pick', 'fulfillment']
  },
  {
    action: 'pack_items',
    displayName: 'Pack Items',
    description: 'Pack picked items for shipment',
    category: 'inventory',
    riskLevel: 'low',
    tags: ['inventory', 'warehouse', 'pack', 'fulfillment']
  },
  {
    action: 'ship_items',
    displayName: 'Ship Items',
    description: 'Process shipment of packed items',
    category: 'inventory',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['inventory', 'warehouse', 'ship', 'fulfillment']
  }
];

// ============================================================================
// Finance Module Actions
// ============================================================================

const financeActions: ActionDefinition[] = [
  // Invoice Actions
  {
    action: 'create_invoice',
    displayName: 'Create Invoice',
    description: 'Create new invoice for goods or services',
    category: 'finance',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['finance', 'invoice', 'create', 'billing']
  },
  {
    action: 'approve_invoice',
    displayName: 'Approve Invoice',
    description: 'Approve invoice for payment processing',
    category: 'finance',
    riskLevel: 'high',
    requiresApproval: false,
    auditRequired: true,
    tags: ['finance', 'invoice', 'approve', 'payment']
  },
  {
    action: 'dispute_invoice',
    displayName: 'Dispute Invoice',
    description: 'Raise dispute on invoice details or amounts',
    category: 'finance',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['finance', 'invoice', 'dispute']
  },
  {
    action: 'pay_invoice',
    displayName: 'Process Invoice Payment',
    description: 'Process payment for approved invoice',
    category: 'finance',
    riskLevel: 'critical',
    requiresApproval: true,
    auditRequired: true,
    tags: ['finance', 'invoice', 'pay', 'payment', 'critical']
  },
  {
    action: 'reconcile_invoice',
    displayName: 'Reconcile Invoice',
    description: 'Reconcile invoice with purchase order and GRN',
    category: 'finance',
    riskLevel: 'high',
    auditRequired: true,
    tags: ['finance', 'invoice', 'reconcile', 'validation']
  },

  // Budget Actions
  {
    action: 'allocate_budget',
    displayName: 'Allocate Budget',
    description: 'Allocate budget to departments or projects',
    category: 'finance',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['finance', 'budget', 'allocate', 'planning']
  },
  {
    action: 'monitor_budget',
    displayName: 'Monitor Budget',
    description: 'Monitor budget utilization and variances',
    category: 'finance',
    riskLevel: 'low',
    tags: ['finance', 'budget', 'monitor', 'track']
  },
  {
    action: 'adjust_budget',
    displayName: 'Adjust Budget',
    description: 'Make adjustments to allocated budgets',
    category: 'finance',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['finance', 'budget', 'adjust', 'modify']
  },
  {
    action: 'freeze_budget',
    displayName: 'Freeze Budget',
    description: 'Freeze budget to prevent further spending',
    category: 'finance',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['finance', 'budget', 'freeze', 'control']
  },

  // Reporting Actions
  {
    action: 'generate_financial_report',
    displayName: 'Generate Financial Report',
    description: 'Generate financial reports and statements',
    category: 'finance',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['finance', 'report', 'generate', 'analytics']
  },
  {
    action: 'export_financial_data',
    displayName: 'Export Financial Data',
    description: 'Export financial data to external systems',
    category: 'finance',
    riskLevel: 'high',
    auditRequired: true,
    tags: ['finance', 'export', 'data', 'integration']
  },
  {
    action: 'schedule_report',
    displayName: 'Schedule Report',
    description: 'Schedule automatic report generation',
    category: 'finance',
    riskLevel: 'low',
    tags: ['finance', 'report', 'schedule', 'automation']
  },
  {
    action: 'share_report',
    displayName: 'Share Report',
    description: 'Share financial reports with stakeholders',
    category: 'finance',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['finance', 'report', 'share', 'distribution']
  }
];

// ============================================================================
// User & System Administration Actions
// ============================================================================

const userAdminActions: ActionDefinition[] = [
  // User Management Actions
  {
    action: 'create_user',
    displayName: 'Create User Account',
    description: 'Create new user account in the system',
    category: 'user_admin',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'user', 'create', 'account']
  },
  {
    action: 'deactivate_user',
    displayName: 'Deactivate User',
    description: 'Deactivate user account and access',
    category: 'user_admin',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'user', 'deactivate', 'security']
  },
  {
    action: 'reset_password',
    displayName: 'Reset User Password',
    description: 'Reset user password for security or access',
    category: 'user_admin',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['admin', 'user', 'password', 'security']
  },
  {
    action: 'assign_role',
    displayName: 'Assign User Role',
    description: 'Assign or modify user roles and permissions',
    category: 'user_admin',
    riskLevel: 'critical',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'user', 'role', 'permissions', 'critical']
  },
  {
    action: 'modify_permissions',
    displayName: 'Modify Permissions',
    description: 'Modify user permissions and access rights',
    category: 'user_admin',
    riskLevel: 'critical',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'user', 'permissions', 'security', 'critical']
  },

  // System Configuration Actions
  {
    action: 'backup_system',
    displayName: 'Backup System',
    description: 'Create system backup of data and configuration',
    category: 'system_admin',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['admin', 'system', 'backup', 'maintenance']
  },
  {
    action: 'restore_system',
    displayName: 'Restore System',
    description: 'Restore system from backup',
    category: 'system_admin',
    riskLevel: 'critical',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'system', 'restore', 'recovery', 'critical']
  },
  {
    action: 'configure_system',
    displayName: 'Configure System',
    description: 'Modify system configuration and settings',
    category: 'system_admin',
    riskLevel: 'high',
    requiresApproval: true,
    auditRequired: true,
    tags: ['admin', 'system', 'configure', 'settings']
  },
  {
    action: 'monitor_system',
    displayName: 'Monitor System',
    description: 'Monitor system performance and health',
    category: 'system_admin',
    riskLevel: 'low',
    tags: ['admin', 'system', 'monitor', 'performance']
  },

  // Audit Actions
  {
    action: 'view_audit_logs',
    displayName: 'View Audit Logs',
    description: 'Access and review system audit logs',
    category: 'audit',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['admin', 'audit', 'logs', 'compliance']
  },
  {
    action: 'export_compliance_report',
    displayName: 'Export Compliance Report',
    description: 'Export compliance and audit reports',
    category: 'audit',
    riskLevel: 'high',
    auditRequired: true,
    tags: ['admin', 'audit', 'compliance', 'export']
  },
  {
    action: 'generate_audit_report',
    displayName: 'Generate Audit Report',
    description: 'Generate comprehensive audit reports',
    category: 'audit',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['admin', 'audit', 'report', 'compliance']
  }
];

// ============================================================================
// Hospitality-Specific Actions
// ============================================================================

const hospitalityActions: ActionDefinition[] = [
  // Kitchen Operations
  {
    action: 'view_recipe',
    displayName: 'View Recipe',
    description: 'View recipe details and ingredients',
    category: 'kitchen',
    riskLevel: 'low',
    tags: ['kitchen', 'recipe', 'view', 'cooking']
  },
  {
    action: 'modify_recipe',
    displayName: 'Modify Recipe',
    description: 'Edit recipe ingredients and instructions',
    category: 'kitchen',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['kitchen', 'recipe', 'modify', 'cooking']
  },
  {
    action: 'approve_menu_change',
    displayName: 'Approve Menu Change',
    description: 'Approve changes to restaurant menu',
    category: 'kitchen',
    riskLevel: 'medium',
    requiresApproval: false,
    auditRequired: true,
    tags: ['kitchen', 'menu', 'approve', 'restaurant']
  },

  // Front Office Operations
  {
    action: 'manage_reservations',
    displayName: 'Manage Reservations',
    description: 'Create and manage guest reservations',
    category: 'front_office',
    riskLevel: 'low',
    tags: ['front_office', 'reservation', 'guest', 'booking']
  },
  {
    action: 'process_checkin',
    displayName: 'Process Check-in',
    description: 'Process guest check-in procedures',
    category: 'front_office',
    riskLevel: 'low',
    tags: ['front_office', 'checkin', 'guest', 'arrival']
  },
  {
    action: 'process_checkout',
    displayName: 'Process Check-out',
    description: 'Process guest check-out and billing',
    category: 'front_office',
    riskLevel: 'medium',
    auditRequired: true,
    tags: ['front_office', 'checkout', 'guest', 'billing']
  },

  // Housekeeping Operations
  {
    action: 'update_room_status',
    displayName: 'Update Room Status',
    description: 'Update room cleaning and availability status',
    category: 'housekeeping',
    riskLevel: 'low',
    tags: ['housekeeping', 'room', 'status', 'cleaning']
  },
  {
    action: 'report_maintenance',
    displayName: 'Report Maintenance Issue',
    description: 'Report room or facility maintenance issues',
    category: 'housekeeping',
    riskLevel: 'low',
    tags: ['housekeeping', 'maintenance', 'report', 'facility']
  }
];

// ============================================================================
// Action Categories and Risk Levels
// ============================================================================

export const actionCategories = [
  {
    category: 'procurement',
    displayName: 'Procurement',
    description: 'Purchase requests, orders, and vendor management',
    icon: 'ShoppingCart',
    color: 'blue'
  },
  {
    category: 'vendor',
    displayName: 'Vendor Management',
    description: 'Vendor registration, evaluation, and relationship management',
    icon: 'Users',
    color: 'green'
  },
  {
    category: 'inventory',
    displayName: 'Inventory Management',
    description: 'Stock management, warehouse operations, and item catalog',
    icon: 'Package',
    color: 'purple'
  },
  {
    category: 'finance',
    displayName: 'Finance',
    description: 'Invoicing, payments, budgets, and financial reporting',
    icon: 'DollarSign',
    color: 'yellow'
  },
  {
    category: 'user_admin',
    displayName: 'User Administration',
    description: 'User account management and permissions',
    icon: 'UserCog',
    color: 'red'
  },
  {
    category: 'system_admin',
    displayName: 'System Administration',
    description: 'System configuration, backup, and maintenance',
    icon: 'Settings',
    color: 'gray'
  },
  {
    category: 'audit',
    displayName: 'Audit & Compliance',
    description: 'Audit logs, compliance reports, and monitoring',
    icon: 'Shield',
    color: 'orange'
  },
  {
    category: 'kitchen',
    displayName: 'Kitchen Operations',
    description: 'Recipe management, menu changes, and cooking operations',
    icon: 'ChefHat',
    color: 'indigo'
  },
  {
    category: 'front_office',
    displayName: 'Front Office',
    description: 'Guest services, reservations, and reception',
    icon: 'Hotel',
    color: 'pink'
  },
  {
    category: 'housekeeping',
    displayName: 'Housekeeping',
    description: 'Room status, cleaning, and facility maintenance',
    icon: 'Home',
    color: 'teal'
  }
];

export const riskLevels = [
  {
    level: 'low',
    displayName: 'Low Risk',
    description: 'Read operations, basic views, and standard operations',
    color: 'green',
    examples: ['view', 'list', 'search', 'monitor']
  },
  {
    level: 'medium',
    displayName: 'Medium Risk',
    description: 'Write operations, modifications, and workflow actions',
    color: 'yellow',
    examples: ['create', 'update', 'modify', 'submit']
  },
  {
    level: 'high',
    displayName: 'High Risk',
    description: 'Administrative actions, approvals, and significant changes',
    color: 'orange',
    examples: ['approve', 'configure', 'allocate', 'negotiate']
  },
  {
    level: 'critical',
    displayName: 'Critical Risk',
    description: 'Financial transactions, security changes, and system-critical operations',
    color: 'red',
    examples: ['process_payment', 'assign_role', 'restore_system']
  }
];

// ============================================================================
// Combined Actions Export
// ============================================================================

export const allSampleActions: ActionDefinition[] = [
  ...procurementActions,
  ...vendorActions,
  ...inventoryActions,
  ...financeActions,
  ...userAdminActions,
  ...hospitalityActions
];

// Helper functions
export function getActionsByCategory(category: string): ActionDefinition[] {
  return allSampleActions.filter(action => action.category === category);
}

export function getActionsByRiskLevel(riskLevel: 'low' | 'medium' | 'high' | 'critical'): ActionDefinition[] {
  return allSampleActions.filter(action => action.riskLevel === riskLevel);
}

export function searchActions(query: string): ActionDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return allSampleActions.filter(action => 
    action.action.toLowerCase().includes(lowercaseQuery) ||
    action.displayName.toLowerCase().includes(lowercaseQuery) ||
    action.description.toLowerCase().includes(lowercaseQuery) ||
    action.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getActionsRequiringApproval(): ActionDefinition[] {
  return allSampleActions.filter(action => action.requiresApproval);
}

export function getActionsRequiringAudit(): ActionDefinition[] {
  return allSampleActions.filter(action => action.auditRequired);
}