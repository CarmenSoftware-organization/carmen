// Mock Policies for Carmen ERP Permission Management
// Pre-configured policies covering 37+ common hospitality scenarios

import { Policy, PolicyTarget, Rule, Expression, Obligation, Advice, EffectType, Operator, LogicalOperator } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

// ============================================================================
// Procurement Policies (8 policies)
// ============================================================================

export const procurementPolicies: Policy[] = [
  {
    id: 'pol-proc-001',
    name: 'PR Creation by Department Staff',
    description: 'Department staff can create purchase requests for their assigned departments within budget limits',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-005', 'role-011', 'role-012', 'role-013'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST }
      ],
      actions: ['create_draft', 'add_items', 'submit_for_approval']
    },
    rules: [
      {
        id: 'rule-proc-001-1',
        description: 'Same department and within budget',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'subject.department.id',
              operator: Operator.EQUALS,
              value: 'resource.ownerDepartment'
            },
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 5000
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-proc-001',
        type: 'audit',
        attributes: { logLevel: 'INFO', category: 'PROCUREMENT_CREATE' },
        description: 'Log PR creation for audit trail'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-request', 'creation', 'department']
  },

  {
    id: 'pol-proc-002',
    name: 'PR Approval - Department Level',
    description: 'Department managers can approve PRs from their department up to $10,000',
    priority: 110,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.EQUALS, value: 'role-005' }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST }
      ],
      actions: ['approve_department']
    },
    rules: [
      {
        id: 'rule-proc-002-1',
        description: 'Same department and within approval limit',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'subject.department.id',
              operator: Operator.EQUALS,
              value: 'resource.ownerDepartment'
            },
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 10000
            },
            {
              type: 'simple',
              attribute: 'resource.documentStatus.status',
              operator: Operator.EQUALS,
              value: 'pending_department_approval'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-proc-002',
        type: 'notification',
        attributes: { 
          recipients: ['finance-team'], 
          template: 'pr_approved_dept',
          priority: 'normal'
        },
        description: 'Notify finance team of department approval'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-request', 'approval', 'department-manager']
  },

  {
    id: 'pol-proc-003',
    name: 'PR Approval - Finance Level',
    description: 'Finance managers can approve PRs between $5,000-$25,000',
    priority: 120,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-003', 'role-008'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST }
      ],
      actions: ['approve_finance']
    },
    rules: [
      {
        id: 'rule-proc-003-1',
        description: 'Within finance approval range',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: 5000
            },
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 25000
            },
            {
              type: 'simple',
              attribute: 'resource.documentStatus.status',
              operator: Operator.EQUALS,
              value: 'pending_finance_approval'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-request', 'approval', 'finance']
  },

  {
    id: 'pol-proc-004',
    name: 'PR Approval - GM Level',
    description: 'General Manager can approve PRs over $25,000',
    priority: 130,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.EQUALS, value: 'role-002' }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST }
      ],
      actions: ['approve_gm', 'approve_final']
    },
    rules: [
      {
        id: 'rule-proc-004-1',
        description: 'High value PR requiring GM approval',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.totalValue.amount',
              operator: Operator.GREATER_THAN,
              value: 25000
            },
            {
              type: 'simple',
              attribute: 'resource.documentStatus.status',
              operator: Operator.EQUALS,
              value: 'pending_gm_approval'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-proc-004',
        type: 'approval',
        attributes: { 
          requiresSecondApproval: false,
          escalationRequired: true,
          boardNotification: true
        },
        description: 'High-value approval requires board notification'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-request', 'approval', 'general-manager', 'high-value']
  },

  {
    id: 'pol-proc-005',
    name: 'PO Creation from Approved PR',
    description: 'Procurement staff can create POs from fully approved PRs',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-009'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_ORDER }
      ],
      actions: ['create', 'convert_from_pr']
    },
    rules: [
      {
        id: 'rule-proc-005-1',
        description: 'PR must be fully approved',
        condition: {
          type: 'simple',
          attribute: 'resource.parentResource.documentStatus.status',
          operator: Operator.EQUALS,
          value: 'approved'
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-order', 'creation', 'procurement-staff']
  },

  {
    id: 'pol-proc-006',
    name: 'PO Modification by Procurement Team',
    description: 'Procurement team can modify POs before vendor confirmation',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-009'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_ORDER }
      ],
      actions: ['update', 'modify_quantities', 'change_vendors']
    },
    rules: [
      {
        id: 'rule-proc-006-1',
        description: 'PO not yet confirmed by vendor',
        condition: {
          type: 'simple',
          attribute: 'resource.documentStatus.status',
          operator: Operator.IN,
          value: ['draft', 'sent', 'pending_vendor_confirmation']
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['purchase-order', 'modification', 'procurement-team']
  },

  {
    id: 'pol-proc-007',
    name: 'GRN Creation by Warehouse Staff',
    description: 'Warehouse staff can create Goods Receipt Notes for incoming deliveries',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-006', 'role-012'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.GOODS_RECEIPT_NOTE }
      ],
      actions: ['create', 'record_receipt', 'quality_check']
    },
    rules: [
      {
        id: 'rule-proc-007-1',
        description: 'Valid PO exists and location match',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.parentResource.documentStatus.status',
              operator: Operator.EQUALS,
              value: 'confirmed'
            },
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['goods-receipt-note', 'warehouse', 'receiving']
  },

  {
    id: 'pol-proc-008',
    name: 'Credit Note Processing',
    description: 'Finance and procurement managers can process credit notes',
    priority: 110,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-003', 'role-004', 'role-008'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.CREDIT_NOTE }
      ],
      actions: ['create', 'approve', 'process']
    },
    rules: [
      {
        id: 'rule-proc-008-1',
        description: 'Valid GRN with discrepancies or returns',
        condition: {
          type: 'simple',
          attribute: 'resource.reason',
          operator: Operator.IN,
          value: ['quality_issue', 'quantity_discrepancy', 'damaged_goods', 'return']
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-proc-008',
        type: 'audit',
        attributes: { 
          logLevel: 'INFO',
          category: 'CREDIT_NOTE_PROCESSING',
          requiresApproval: true
        },
        description: 'Credit note processing requires audit trail'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'procurement',
    tags: ['credit-note', 'finance', 'procurement']
  }
];

// ============================================================================
// Inventory Policies (7 policies)
// ============================================================================

export const inventoryPolicies: Policy[] = [
  {
    id: 'pol-inv-001',
    name: 'Stock View by Location',
    description: 'Staff can view stock levels for their assigned locations only',
    priority: 80,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-011', 'role-012', 'role-013'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.INVENTORY_ITEM }
      ],
      actions: ['view_stock', 'view_availability']
    },
    rules: [
      {
        id: 'rule-inv-001-1',
        description: 'Location access restriction',
        condition: {
          type: 'simple',
          attribute: 'resource.location',
          operator: Operator.IN,
          value: 'subject.locations'
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['inventory', 'view', 'location-based']
  },

  {
    id: 'pol-inv-002',
    name: 'Stock Adjustment by Warehouse Manager',
    description: 'Warehouse managers can perform stock adjustments with approval workflow',
    priority: 120,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.EQUALS, value: 'role-006' }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.STOCK_ADJUSTMENT }
      ],
      actions: ['create', 'approve', 'execute']
    },
    rules: [
      {
        id: 'rule-inv-002-1',
        description: 'Warehouse manager for assigned locations',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations'
            },
            {
              type: 'simple',
              attribute: 'resource.adjustmentValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 5000
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-inv-002',
        type: 'approval',
        attributes: { 
          requiresSecondApproval: true,
          approver: 'general-manager',
          thresholdAmount: 5000
        },
        description: 'High-value adjustments require GM approval'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['stock-adjustment', 'warehouse-manager', 'approval']
  },

  {
    id: 'pol-inv-003',
    name: 'Physical Count Initiation',
    description: 'Warehouse managers and supervisors can initiate physical inventory counts',
    priority: 110,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-006', 'role-010'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PHYSICAL_COUNT }
      ],
      actions: ['create', 'initiate', 'assign_counters']
    },
    rules: [
      {
        id: 'rule-inv-003-1',
        description: 'Location assignment and business hours',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations'
            },
            {
              type: 'simple',
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: true
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['physical-count', 'warehouse', 'initiation']
  },

  {
    id: 'pol-inv-004',
    name: 'Spot Check Execution',
    description: 'Warehouse staff can execute spot checks for quality control',
    priority: 90,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-012', 'role-014'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.SPOT_CHECK }
      ],
      actions: ['create', 'execute', 'record_results']
    },
    rules: [
      {
        id: 'rule-inv-004-1',
        description: 'Location access during work hours',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations'
            },
            {
              type: 'simple',
              attribute: 'subject.onDuty',
              operator: Operator.EQUALS,
              value: true
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['spot-check', 'quality-control', 'warehouse-staff']
  },

  {
    id: 'pol-inv-005',
    name: 'Wastage Reporting',
    description: 'Kitchen and warehouse staff can report wastage and damages',
    priority: 85,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-011', 'role-012', 'role-013'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.WASTAGE_REPORT }
      ],
      actions: ['create', 'report_wastage', 'document_loss']
    },
    rules: [
      {
        id: 'rule-inv-005-1',
        description: 'Staff can report wastage in their work areas',
        condition: {
          type: 'simple',
          attribute: 'resource.location',
          operator: Operator.IN,
          value: 'subject.locations'
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-inv-005',
        type: 'notification',
        attributes: { 
          recipients: ['warehouse-manager', 'finance-manager'],
          template: 'wastage_reported',
          priority: 'normal'
        },
        description: 'Notify management of wastage reports'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['wastage', 'reporting', 'staff']
  },

  {
    id: 'pol-inv-006',
    name: 'Stock Transfer Between Locations',
    description: 'Authorized staff can transfer stock between approved locations',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-006', 'role-010', 'role-012'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.STOCK_TRANSFER }
      ],
      actions: ['create', 'execute', 'receive']
    },
    rules: [
      {
        id: 'rule-inv-006-1',
        description: 'Transfer between authorized locations',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.sourceLocation',
              operator: Operator.IN,
              value: 'subject.locations'
            },
            {
              type: 'simple',
              attribute: 'resource.destinationLocation',
              operator: Operator.IN,
              value: 'subject.locations'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['stock-transfer', 'location', 'warehouse']
  },

  {
    id: 'pol-inv-007',
    name: 'Fractional Inventory Management',
    description: 'Kitchen staff can manage fractional inventory for recipe costing',
    priority: 90,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-007', 'role-011'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.FRACTIONAL_INVENTORY }
      ],
      actions: ['view', 'record_usage', 'calculate_cost']
    },
    rules: [
      {
        id: 'rule-inv-007-1',
        description: 'Kitchen locations and recipe-related items',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.location',
              operator: Operator.IN,
              value: 'subject.locations'
            },
            {
              type: 'simple',
              attribute: 'resource.itemCategory',
              operator: Operator.IN,
              value: ['ingredient', 'consumable']
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'inventory',
    tags: ['fractional-inventory', 'kitchen', 'recipe-costing']
  }
];

// ============================================================================
// Vendor Policies (5 policies)
// ============================================================================

export const vendorPolicies: Policy[] = [
  {
    id: 'pol-vnd-001',
    name: 'Vendor Creation and Activation',
    description: 'Procurement managers can create and activate new vendors',
    priority: 120,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-009'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.VENDOR }
      ],
      actions: ['create', 'activate', 'update_profile']
    },
    rules: [
      {
        id: 'rule-vnd-001-1',
        description: 'Complete vendor profile required',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.profileCompleteness',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: 80
            },
            {
              type: 'simple',
              attribute: 'resource.complianceStatus',
              operator: Operator.EQUALS,
              value: 'compliant'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    obligations: [
      {
        id: 'obl-vnd-001',
        type: 'audit',
        attributes: { 
          logLevel: 'INFO',
          category: 'VENDOR_MANAGEMENT',
          requiresApproval: true
        },
        description: 'New vendor activation requires audit trail'
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'vendor',
    tags: ['vendor', 'creation', 'procurement']
  },

  {
    id: 'pol-vnd-002',
    name: 'Price List Management',
    description: 'Procurement staff can manage vendor price lists and contracts',
    priority: 110,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-009'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.VENDOR_PRICE_LIST }
      ],
      actions: ['create', 'update', 'approve', 'activate']
    },
    rules: [
      {
        id: 'rule-vnd-002-1',
        description: 'Active vendor with valid contract',
        condition: {
          type: 'composite',
          logicalOperator: LogicalOperator.AND,
          expressions: [
            {
              type: 'simple',
              attribute: 'resource.vendor.status',
              operator: Operator.EQUALS,
              value: 'active'
            },
            {
              type: 'simple',
              attribute: 'resource.contractStatus',
              operator: Operator.EQUALS,
              value: 'valid'
            }
          ]
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'vendor',
    tags: ['price-list', 'contract', 'procurement']
  },

  {
    id: 'pol-vnd-003',
    name: 'RFQ Campaign Management',
    description: 'Procurement team can create and manage Request for Quotation campaigns',
    priority: 100,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-009'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.VENDOR_CAMPAIGN }
      ],
      actions: ['create', 'send_rfq', 'compare_quotes', 'select_vendor']
    },
    rules: [
      {
        id: 'rule-vnd-003-1',
        description: 'Minimum 3 vendors for competitive bidding',
        condition: {
          type: 'simple',
          attribute: 'resource.participatingVendors.length',
          operator: Operator.GREATER_THAN_OR_EQUAL,
          value: 3
        }
      }
    ],
    effect: EffectType.PERMIT,
    advice: [
      {
        id: 'adv-vnd-003',
        type: 'best_practice',
        message: 'Consider including at least 3 vendors for competitive pricing',
        attributes: { category: 'procurement_best_practice' }
      }
    ],
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'vendor',
    tags: ['rfq', 'campaign', 'competitive-bidding']
  },

  {
    id: 'pol-vnd-004',
    name: 'Vendor Performance Review',
    description: 'Quality controllers and procurement managers can review vendor performance',
    priority: 95,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.IN, value: ['role-004', 'role-014'] }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.VENDOR }
      ],
      actions: ['rate_performance', 'review_quality', 'update_rating']
    },
    rules: [
      {
        id: 'rule-vnd-004-1',
        description: 'Completed transactions required for rating',
        condition: {
          type: 'simple',
          attribute: 'resource.completedTransactions',
          operator: Operator.GREATER_THAN,
          value: 0
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'vendor',
    tags: ['performance', 'review', 'quality']
  },

  {
    id: 'pol-vnd-005',
    name: 'Vendor Portal Access',
    description: 'Vendors can access their dedicated portal areas',
    priority: 70,
    enabled: true,
    target: {
      subjects: [
        { attribute: 'role.id', operator: Operator.EQUALS, value: 'role-020' }
      ],
      resources: [
        { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.VENDOR_PORTAL }
      ],
      actions: ['view_profile', 'update_info', 'view_orders', 'submit_quotes']
    },
    rules: [
      {
        id: 'rule-vnd-005-1',
        description: 'Vendor can only access own profile',
        condition: {
          type: 'simple',
          attribute: 'resource.vendorId',
          operator: Operator.EQUALS,
          value: 'subject.vendorId'
        }
      }
    ],
    effect: EffectType.PERMIT,
    version: '1.0',
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    category: 'vendor',
    tags: ['portal', 'vendor-access', 'self-service']
  }
];

// Export all policy collections
export const allMockPolicies: Policy[] = [
  ...procurementPolicies,
  ...inventoryPolicies,
  ...vendorPolicies
];

// ============================================================================
// Policy Templates and Generators
// ============================================================================

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Omit<Policy, 'id' | 'createdAt' | 'createdBy'>;
}

export const policyTemplates: PolicyTemplate[] = [
  {
    id: 'tpl-dept-access',
    name: 'Department-Based Access',
    description: 'Template for department-restricted resource access',
    category: 'access-control',
    template: {
      name: 'Department Access Template',
      description: 'Restrict access to department resources',
      priority: 100,
      enabled: true,
      target: {
        subjects: [],
        resources: [],
        actions: ['view', 'create', 'update']
      },
      rules: [
        {
          id: 'tpl-rule-dept',
          description: 'Same department access',
          condition: {
            type: 'simple',
            attribute: 'subject.department.id',
            operator: Operator.EQUALS,
            value: 'resource.ownerDepartment'
          }
        }
      ],
      effect: EffectType.PERMIT,
      version: '1.0',
      category: 'access-control',
      tags: ['department', 'template']
    }
  },
  {
    id: 'tpl-approval-workflow',
    name: 'Approval Workflow',
    description: 'Template for multi-level approval processes',
    category: 'workflow',
    template: {
      name: 'Approval Workflow Template',
      description: 'Multi-level approval process',
      priority: 110,
      enabled: true,
      target: {
        subjects: [],
        resources: [],
        actions: ['approve']
      },
      rules: [
        {
          id: 'tpl-rule-approval',
          description: 'Approval authority check',
          condition: {
            type: 'simple',
            attribute: 'subject.approvalLimit.amount',
            operator: Operator.GREATER_THAN_OR_EQUAL,
            value: 'resource.totalValue.amount'
          }
        }
      ],
      effect: EffectType.PERMIT,
      obligations: [
        {
          id: 'tpl-obl-approval',
          type: 'notification',
          attributes: { template: 'approval_notification' },
          description: 'Notify stakeholders of approval'
        }
      ],
      version: '1.0',
      category: 'workflow',
      tags: ['approval', 'workflow', 'template']
    }
  }
];

// Policy search and filter utilities
export function searchPolicies(query: string): Policy[] {
  const searchTerm = query.toLowerCase();
  return allMockPolicies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm) ||
    policy.description.toLowerCase().includes(searchTerm) ||
    policy.category?.toLowerCase().includes(searchTerm) ||
    policy.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

export function getPoliciesByCategory(category: string): Policy[] {
  return allMockPolicies.filter(policy => policy.category === category);
}

export function getPoliciesByResource(resourceType: ResourceType): Policy[] {
  return allMockPolicies.filter(policy =>
    policy.target.resources?.some(resource =>
      resource.value === resourceType
    )
  );
}

export function getActivePolicies(): Policy[] {
  return allMockPolicies.filter(policy => policy.enabled);
}