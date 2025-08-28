// Mock Roles for Carmen ERP Permission Management
// Comprehensive role definitions for hospitality operations

import { Role, Department, Location } from '@/lib/types';

// ============================================================================
// Core Role Definitions (20+ hospitality-specific roles)
// ============================================================================

export const mockRoles: Role[] = [
  // Executive Level
  {
    id: 'role-001',
    name: 'System Administrator',
    description: 'Full system access with complete administrative privileges',
    permissions: ['*'], // All permissions
    hierarchy: 1,
    isSystem: true
  },
  {
    id: 'role-002',
    name: 'General Manager',
    description: 'Overall property operations management with full business access',
    permissions: [
      'purchase_request:*', 'purchase_order:*', 'budget:*', 'financial_report:*',
      'user:create', 'user:update', 'user:assign_role', 'workflow:configure'
    ],
    hierarchy: 2,
    isSystem: false,
    parentRoles: ['role-001'] // Inherits from System Administrator
  },
  {
    id: 'role-003',
    name: 'Finance Director',
    description: 'Financial operations oversight and budget management authority',
    permissions: [
      'purchase_request:approve_finance', 'purchase_order:approve_finance',
      'invoice:*', 'payment:*', 'budget:*', 'financial_report:*',
      'journal_entry:*', 'exchange_rate:manage'
    ],
    hierarchy: 3,
    isSystem: false,
    parentRoles: ['role-002'] // Inherits from General Manager
  },

  // Management Level
  {
    id: 'role-004',
    name: 'Procurement Manager',
    description: 'Procurement operations management and vendor relationships',
    permissions: [
      'purchase_request:*', 'purchase_order:*', 'vendor:*', 'vendor_quotation:*',
      'goods_receipt_note:approve', 'credit_note:*', 'procurement_report:*'
    ],
    hierarchy: 4,
    isSystem: false,
    parentRoles: ['role-002'] // Inherits from General Manager
  },
  {
    id: 'role-005',
    name: 'Department Manager',
    description: 'Department operations management with approval authority',
    permissions: [
      'purchase_request:create', 'purchase_request:approve_department',
      'department_budget:view', 'department_report:*',
      'inventory_item:view_stock', 'recipe:view'
    ],
    hierarchy: 4,
    isSystem: false
  },
  {
    id: 'role-006',
    name: 'Warehouse Manager',
    description: 'Inventory and warehouse operations management',
    permissions: [
      'inventory_item:*', 'stock_adjustment:*', 'stock_count:*',
      'goods_receipt_note:*', 'stock_transfer:*', 'physical_count:*',
      'wastage_report:create', 'inventory_report:*'
    ],
    hierarchy: 4,
    isSystem: false
  },
  {
    id: 'role-007',
    name: 'Executive Chef',
    description: 'Culinary operations and recipe management authority',
    permissions: [
      'recipe:*', 'menu_item:*', 'recipe_category:*', 'cuisine_type:*',
      'production_order:*', 'batch_production:*', 'quality_control:*',
      'recipe_report:*'
    ],
    hierarchy: 4,
    isSystem: false
  },

  // Supervisory Level
  {
    id: 'role-008',
    name: 'Financial Manager',
    description: 'Financial operations and accounting management',
    permissions: [
      'invoice:*', 'payment:create', 'payment:approve',
      'journal_entry:*', 'account_code:*', 'financial_report:view'
    ],
    hierarchy: 5,
    isSystem: false
  },
  {
    id: 'role-009',
    name: 'Purchasing Agent',
    description: 'Purchase order processing and vendor coordination',
    permissions: [
      'purchase_order:create', 'purchase_order:update', 'purchase_order:send',
      'vendor:view', 'vendor_quotation:create', 'goods_receipt_note:create'
    ],
    hierarchy: 6,
    isSystem: false
  },
  {
    id: 'role-010',
    name: 'Inventory Supervisor',
    description: 'Inventory control and stock management oversight',
    permissions: [
      'inventory_item:view_stock', 'stock_adjustment:create', 'stock_count:execute',
      'physical_count:*', 'spot_check:*', 'inventory_report:view'
    ],
    hierarchy: 6,
    isSystem: false
  },

  // Operational Level
  {
    id: 'role-011',
    name: 'Kitchen Staff',
    description: 'Kitchen operations and recipe access for food preparation',
    permissions: [
      'recipe:view', 'recipe:print', 'menu_item:view',
      'production_order:view', 'batch_production:update_status',
      'wastage_report:create'
    ],
    hierarchy: 7,
    isSystem: false
  },
  {
    id: 'role-012',
    name: 'Warehouse Staff',
    description: 'Warehouse operations and inventory handling',
    permissions: [
      'inventory_item:view_stock', 'goods_receipt_note:create',
      'stock_transfer:execute', 'physical_count:participate',
      'stock_adjustment:suggest'
    ],
    hierarchy: 7,
    isSystem: false
  },
  {
    id: 'role-013',
    name: 'Store Staff',
    description: 'Store operations and customer service',
    permissions: [
      'store_requisition:create', 'inventory_item:view_availability',
      'wastage_report:create', 'product:view'
    ],
    hierarchy: 7,
    isSystem: false
  },

  // Specialized Roles
  {
    id: 'role-014',
    name: 'Quality Controller',
    description: 'Quality assurance and compliance monitoring',
    permissions: [
      'quality_control:*', 'vendor:rate_quality', 'batch_production:quality_check',
      'audit_log:view', 'compliance_report:*'
    ],
    hierarchy: 5,
    isSystem: false
  },
  {
    id: 'role-015',
    name: 'Auditor',
    description: 'Internal audit and compliance verification',
    permissions: [
      'audit_log:view', 'financial_report:audit', 'compliance_report:*',
      'user:view_activity', 'workflow:audit'
    ],
    hierarchy: 3,
    isSystem: false
  },
  {
    id: 'role-016',
    name: 'Analyst',
    description: 'Data analysis and business intelligence',
    permissions: [
      'report:*', 'analytics:*', 'dashboard:advanced',
      'data_export:*', 'business_intelligence:*'
    ],
    hierarchy: 5,
    isSystem: false
  },

  // System Roles
  {
    id: 'role-017',
    name: 'IT Support',
    description: 'Technical support and system maintenance',
    permissions: [
      'user:view', 'user:reset_password', 'system:backup',
      'configuration:view', 'audit_log:technical'
    ],
    hierarchy: 4,
    isSystem: false
  },
  {
    id: 'role-018',
    name: 'Accountant',
    description: 'Accounting operations and financial record keeping',
    permissions: [
      'invoice:view', 'payment:view', 'journal_entry:create',
      'account_code:view', 'financial_report:generate'
    ],
    hierarchy: 6,
    isSystem: false
  },

  // Entry Level
  {
    id: 'role-019',
    name: 'Intern',
    description: 'Limited access for training and learning purposes',
    permissions: [
      'dashboard:view', 'report:view', 'product:view', 'recipe:view'
    ],
    hierarchy: 8,
    isSystem: false
  },
  {
    id: 'role-020',
    name: 'Contractor',
    description: 'Limited access for external service providers',
    permissions: [
      'inventory_item:view_public', 'vendor:view_own_profile',
      'purchase_order:view_assigned'
    ],
    hierarchy: 8,
    isSystem: false
  }
];

// ============================================================================
// Department Definitions
// ============================================================================

export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'Administration',
    code: 'ADMIN',
    manager: 'user-002', // General Manager
    costCenter: 'CC-001'
  },
  {
    id: 'dept-002',
    name: 'Procurement',
    code: 'PROC',
    manager: 'user-004', // Procurement Manager
    costCenter: 'CC-002'
  },
  {
    id: 'dept-003',
    name: 'Kitchen Operations',
    code: 'KITCHEN',
    manager: 'user-007', // Executive Chef
    costCenter: 'CC-003'
  },
  {
    id: 'dept-004',
    name: 'Warehouse',
    code: 'WAREHOUSE',
    manager: 'user-006', // Warehouse Manager
    costCenter: 'CC-004'
  },
  {
    id: 'dept-005',
    name: 'Finance',
    code: 'FIN',
    manager: 'user-003', // Finance Director
    costCenter: 'CC-005'
  },
  {
    id: 'dept-006',
    name: 'Food & Beverage',
    code: 'F&B',
    manager: 'user-005', // Department Manager
    costCenter: 'CC-006'
  },
  {
    id: 'dept-007',
    name: 'Housekeeping',
    code: 'HK',
    manager: 'user-005', // Department Manager
    costCenter: 'CC-007'
  },
  {
    id: 'dept-008',
    name: 'Maintenance',
    code: 'MAINT',
    manager: 'user-005', // Department Manager
    costCenter: 'CC-008'
  }
];

// ============================================================================
// Location Definitions
// ============================================================================

export const mockLocations: Location[] = [
  {
    id: 'loc-001',
    name: 'Main Hotel',
    type: 'hotel',
    address: '123 Hospitality Ave, Tourist District',
    coordinates: { latitude: 40.7589, longitude: -73.9851 }
  },
  {
    id: 'loc-002',
    name: 'Main Restaurant',
    type: 'restaurant',
    address: '125 Hospitality Ave, Tourist District',
    coordinates: { latitude: 40.7591, longitude: -73.9853 },
    parentLocation: 'loc-001'
  },
  {
    id: 'loc-003',
    name: 'Central Kitchen',
    type: 'kitchen',
    address: '127 Hospitality Ave, Tourist District',
    coordinates: { latitude: 40.7593, longitude: -73.9855 },
    parentLocation: 'loc-001'
  },
  {
    id: 'loc-004',
    name: 'Main Warehouse',
    type: 'warehouse',
    address: '500 Storage Blvd, Industrial Zone',
    coordinates: { latitude: 40.7234, longitude: -73.9967 }
  },
  {
    id: 'loc-005',
    name: 'Branch Restaurant',
    type: 'restaurant',
    address: '789 Downtown Street, Business District',
    coordinates: { latitude: 40.7505, longitude: -73.9934 }
  },
  {
    id: 'loc-006',
    name: 'Corporate Office',
    type: 'office',
    address: '456 Business Plaza, Financial District',
    coordinates: { latitude: 40.7074, longitude: -74.0113 }
  }
];

// ============================================================================
// Role Assignment Utilities
// ============================================================================

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  departments: string[];
  locations: string[];
}

export const mockRoleAssignments: RoleAssignment[] = [
  {
    userId: 'user-001',
    roleId: 'role-001', // System Administrator
    assignedAt: new Date('2024-01-01'),
    assignedBy: 'system',
    departments: ['dept-001'],
    locations: ['loc-001', 'loc-002', 'loc-003', 'loc-004', 'loc-005', 'loc-006']
  },
  {
    userId: 'user-002',
    roleId: 'role-002', // General Manager
    assignedAt: new Date('2024-01-01'),
    assignedBy: 'user-001',
    departments: ['dept-001'],
    locations: ['loc-001', 'loc-002', 'loc-003']
  },
  {
    userId: 'user-003',
    roleId: 'role-003', // Finance Director
    assignedAt: new Date('2024-01-01'),
    assignedBy: 'user-002',
    departments: ['dept-005'],
    locations: ['loc-001', 'loc-006']
  },
  {
    userId: 'user-004',
    roleId: 'role-004', // Procurement Manager
    assignedAt: new Date('2024-01-01'),
    assignedBy: 'user-002',
    departments: ['dept-002'],
    locations: ['loc-001', 'loc-004']
  },
  {
    userId: 'user-005',
    roleId: 'role-005', // Department Manager
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'user-002',
    departments: ['dept-006'],
    locations: ['loc-002']
  }
];

// ============================================================================
// Role Hierarchy Utilities
// ============================================================================

export function getRoleHierarchy(): Record<string, string[]> {
  return {
    'role-001': [], // System Administrator (top level)
    'role-002': ['role-001'], // General Manager
    'role-003': ['role-002'], // Finance Director
    'role-004': ['role-002'], // Procurement Manager
    'role-005': ['role-002'], // Department Manager
    'role-006': ['role-004'], // Warehouse Manager
    'role-007': ['role-005'], // Executive Chef
    'role-008': ['role-003'], // Financial Manager
    'role-009': ['role-004'], // Purchasing Agent
    'role-010': ['role-006'], // Inventory Supervisor
    'role-011': ['role-007'], // Kitchen Staff
    'role-012': ['role-006'], // Warehouse Staff
    'role-013': ['role-005'], // Store Staff
    'role-014': ['role-002'], // Quality Controller
    'role-015': ['role-003'], // Auditor
    'role-016': ['role-002'], // Analyst
    'role-017': ['role-001'], // IT Support
    'role-018': ['role-008'], // Accountant
    'role-019': [], // Intern (entry level)
    'role-020': [] // Contractor (external)
  };
}

export function getInheritedPermissions(roleId: string): string[] {
  const hierarchy = getRoleHierarchy();
  const role = mockRoles.find(r => r.id === roleId);
  
  if (!role) return [];
  
  const permissions = new Set(role.permissions);
  const parentRoles = hierarchy[roleId] || [];
  
  for (const parentRoleId of parentRoles) {
    const parentPermissions = getInheritedPermissions(parentRoleId);
    parentPermissions.forEach(perm => permissions.add(perm));
  }
  
  return Array.from(permissions);
}

export function getUserRoles(userId: string): Role[] {
  const assignments = mockRoleAssignments.filter(a => a.userId === userId);
  return assignments.map(a => mockRoles.find(r => r.id === a.roleId)).filter(Boolean) as Role[];
}

export function getUserDepartments(userId: string): Department[] {
  const assignments = mockRoleAssignments.filter(a => a.userId === userId);
  const deptIds = assignments.flatMap(a => a.departments);
  return mockDepartments.filter(d => deptIds.includes(d.id));
}

export function getUserLocations(userId: string): Location[] {
  const assignments = mockRoleAssignments.filter(a => a.userId === userId);
  const locIds = assignments.flatMap(a => a.locations);
  return mockLocations.filter(l => locIds.includes(l.id));
}