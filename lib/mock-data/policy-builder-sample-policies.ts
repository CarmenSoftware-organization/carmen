// Sample Policies for Carmen ERP ABAC Policy Builder
// Ready-to-use sample policies demonstrating real-world ABAC scenarios

import { Policy, Rule, AttributeCondition, Operator, LogicalOperator, EffectType } from '@/lib/types/permissions';
import { DocumentStatus } from '@/lib/types/common';

// ============================================================================
// Ready-to-Use Sample Policies
// ============================================================================

export const samplePolicies: Policy[] = [
  // 1. Kitchen Staff Recipe Access
  {
    id: 'policy-kitchen-recipe-access',
    name: 'Kitchen Staff Recipe Access',
    description: 'Allow kitchen staff to view and modify recipes during business hours',
    version: '1.0',
    priority: 200,
    enabled: true,
    category: 'hospitality',
    tags: ['kitchen', 'recipe', 'business-hours'],
    
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedBy: 'admin',
    updatedAt: new Date('2024-01-15'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-kitchen-staff',
        description: 'Kitchen staff during business hours',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['chef', 'kitchen-staff'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.department.name',
              operator: Operator.EQUALS,
              value: 'kitchen',
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.accountStatus',
              operator: Operator.EQUALS,
              value: 'active',
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.EQUALS,
              value: 'recipe',
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['view_recipe', 'modify_recipe'],
          environment: [
            {
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'simple',
          expression: 'subject.role.name IN [chef, kitchen-staff] AND subject.department.name == kitchen AND resource.resourceType == recipe AND environment.isBusinessHours == true'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'system-admin',
      approvedAt: new Date('2024-01-15'),
      comments: 'Standard kitchen operations policy'
    }
  },

  // 2. Purchase Request Approval Workflow
  {
    id: 'policy-purchase-approval',
    name: 'Purchase Request Approval Workflow',
    description: 'Require manager approval for purchase requests over $1000',
    version: '2.1',
    priority: 300,
    enabled: true,
    category: 'financial',
    tags: ['procurement', 'approval', 'financial-control'],
    
    createdBy: 'financial-manager',
    createdAt: new Date('2024-01-10'),
    updatedBy: 'financial-manager',
    updatedAt: new Date('2024-01-20'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-high-value-approval',
        description: 'Manager approval required for purchases over $1000',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['department-manager', 'financial-manager'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.approvalLimit.amount',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: 1000,
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.EQUALS,
              value: 'purchase_request',
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.totalValue.amount',
              operator: Operator.GREATER_THAN,
              value: 1000,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.documentStatus.status',
              operator: Operator.EQUALS,
              value: 'pending_approval',
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['approve_purchase_request'],
          environment: [
            {
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name IN [department-manager, financial-manager]) AND (subject.approvalLimit.amount >= resource.totalValue.amount) AND (resource.totalValue.amount > 1000) AND (environment.isBusinessHours == true)'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'system-admin',
      approvedAt: new Date('2024-01-20'),
      comments: 'Updated approval limits and added business hours restriction'
    }
  },

  // 3. Department Budget View
  {
    id: 'policy-department-budget-view',
    name: 'Department Budget Access',
    description: 'Users can view budget information for their department only',
    version: '1.0',
    priority: 250,
    enabled: true,
    category: 'financial',
    tags: ['budget', 'department', 'isolation'],
    
    createdBy: 'financial-manager',
    createdAt: new Date('2024-01-12'),
    updatedBy: 'financial-manager',
    updatedAt: new Date('2024-01-12'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-department-budget-access',
        description: 'Department budget visibility',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.accountStatus',
              operator: Operator.EQUALS,
              value: 'active',
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['budget', 'financial_report'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.ownerDepartment',
              operator: Operator.EQUALS,
              value: '{{subject.department.name}}',
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.dataClassification',
              operator: Operator.IN,
              value: ['internal', 'public'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['view', 'monitor_budget'],
          environment: []
        },
        
        condition: {
          type: 'simple',
          expression: 'subject.accountStatus == active AND resource.ownerDepartment == subject.department.name AND resource.resourceType IN [budget, financial_report]'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'financial-manager',
      approvedAt: new Date('2024-01-12'),
      comments: 'Standard department budget visibility policy'
    }
  },

  // 4. Admin System Access
  {
    id: 'policy-admin-maintenance-access',
    name: 'Admin System Access During Maintenance',
    description: 'System administrators can access configuration during maintenance windows',
    version: '1.2',
    priority: 400,
    enabled: true,
    category: 'system',
    tags: ['admin', 'maintenance', 'system'],
    
    createdBy: 'system-admin',
    createdAt: new Date('2024-01-08'),
    updatedBy: 'system-admin',
    updatedAt: new Date('2024-01-18'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-admin-maintenance',
        description: 'Admin access during maintenance',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.EQUALS,
              value: 'admin',
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.clearanceLevel',
              operator: Operator.IN,
              value: ['restricted', 'confidential'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['system_config', 'backup', 'maintenance'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['configure_system', 'backup_system', 'monitor_system'],
          environment: [
            {
              attribute: 'environment.maintenanceMode',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.OR
            },
            {
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: false,
              logicalOperator: LogicalOperator.OR
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name == admin) AND (subject.clearanceLevel IN [restricted, confidential]) AND (environment.maintenanceMode == true OR environment.isBusinessHours == false)'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'system-admin',
      approvedAt: new Date('2024-01-18'),
      comments: 'Added business hours exception for maintenance access'
    }
  },

  // 5. Vendor Invoice Submission
  {
    id: 'policy-vendor-invoice-submission',
    name: 'Vendor Invoice Portal Access',
    description: 'External vendors can submit invoices for their contracts only',
    version: '1.0',
    priority: 350,
    enabled: true,
    category: 'vendor',
    tags: ['vendor', 'external', 'invoice', 'portal'],
    
    createdBy: 'procurement-manager',
    createdAt: new Date('2024-01-14'),
    updatedBy: 'procurement-manager',
    updatedAt: new Date('2024-01-14'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-vendor-invoice-access',
        description: 'Vendor can submit invoices for their contracts',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.EQUALS,
              value: 'vendor',
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.accountStatus',
              operator: Operator.EQUALS,
              value: 'active',
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['invoice', 'purchase_order'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.owner',
              operator: Operator.EQUALS,
              value: '{{subject.userId}}',
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['create_invoice', 'view', 'update'],
          environment: [
            {
              attribute: 'environment.isInternalNetwork',
              operator: Operator.EQUALS,
              value: false,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'environment.authenticationMethod',
              operator: Operator.IN,
              value: ['sso', 'mfa'],
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name == vendor) AND (subject.accountStatus == active) AND (resource.owner == subject.userId) AND (environment.authenticationMethod IN [sso, mfa])'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'procurement-manager',
      approvedAt: new Date('2024-01-14'),
      comments: 'Vendor portal access with enhanced security requirements'
    }
  },

  // 6. Emergency Override Policy
  {
    id: 'policy-emergency-override',
    name: 'Emergency Override Access',
    description: 'Managers can override standard restrictions during emergencies',
    version: '1.1',
    priority: 500,
    enabled: true,
    category: 'emergency',
    tags: ['emergency', 'override', 'manager', 'exception'],
    
    createdBy: 'system-admin',
    createdAt: new Date('2024-01-05'),
    updatedBy: 'system-admin',
    updatedAt: new Date('2024-01-16'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-emergency-override',
        description: 'Emergency access for experienced managers',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['department-manager', 'financial-manager', 'admin'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.seniority',
              operator: Operator.GREATER_THAN,
              value: 2,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.clearanceLevel',
              operator: Operator.IN,
              value: ['confidential', 'restricted'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [],
          actions: ['override', 'emergency_access', 'approve', 'escalate'],
          environment: [
            {
              attribute: 'environment.emergencyMode',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.OR
            },
            {
              attribute: 'environment.isHoliday',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.OR
            },
            {
              attribute: 'environment.threatLevel',
              operator: Operator.IN,
              value: ['high', 'critical'],
              logicalOperator: LogicalOperator.OR
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name IN [department-manager, financial-manager, admin]) AND (subject.seniority > 2) AND (environment.emergencyMode == true OR environment.isHoliday == true OR environment.threatLevel IN [high, critical])'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'system-admin',
      approvedAt: new Date('2024-01-16'),
      comments: 'Added threat level conditions for enhanced emergency response'
    }
  },

  // 7. Compliance Audit Trail Policy
  {
    id: 'policy-compliance-audit-trail',
    name: 'Enhanced Audit Trail for Compliance',
    description: 'Enhanced logging for all financial and sensitive operations',
    version: '1.0',
    priority: 450,
    enabled: true,
    category: 'compliance',
    tags: ['audit', 'compliance', 'financial', 'sox'],
    
    createdBy: 'compliance-officer',
    createdAt: new Date('2024-01-11'),
    updatedBy: 'compliance-officer',
    updatedAt: new Date('2024-01-11'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-audit-trail-required',
        description: 'Enhanced logging for compliance-sensitive operations',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [],
          resources: [
            {
              attribute: 'resource.requiresAudit',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['purchase_order', 'invoice', 'budget', 'payment'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['create', 'update', 'delete', 'approve', 'process_payment', 'transfer_funds'],
          environment: [
            {
              attribute: 'environment.auditMode',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'simple',
          expression: 'resource.requiresAudit == true AND environment.auditMode == true'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'compliance-officer',
      approvedAt: new Date('2024-01-11'),
      comments: 'Mandatory audit trail for SOX compliance requirements'
    }
  },

  // 8. Seasonal Menu Updates Policy
  {
    id: 'policy-seasonal-menu-updates',
    name: 'Seasonal Menu Planning Window',
    description: 'Allow menu modifications only during designated planning periods',
    version: '1.0',
    priority: 275,
    enabled: true,
    category: 'hospitality',
    tags: ['menu', 'seasonal', 'planning', 'chef'],
    
    createdBy: 'head-chef',
    createdAt: new Date('2024-01-09'),
    updatedBy: 'head-chef',
    updatedAt: new Date('2024-01-09'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      {
        id: 'rule-seasonal-planning-window',
        description: 'Menu changes during planning periods only',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['chef', 'head-chef', 'menu-manager'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.department.name',
              operator: Operator.EQUALS,
              value: 'kitchen',
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['recipe', 'menu'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['modify_recipe', 'approve_menu_change', 'create'],
          environment: [
            {
              attribute: 'environment.currentTime',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: new Date('2024-02-01'),
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'environment.currentTime',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: new Date('2024-02-15'),
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name IN [chef, head-chef, menu-manager]) AND (subject.department.name == kitchen) AND (environment.currentTime >= "2024-02-01" AND environment.currentTime <= "2024-02-15")'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'head-chef',
      approvedAt: new Date('2024-01-09'),
      comments: 'Spring menu planning window - February 1-15, 2024'
    }
  }
];

// ============================================================================
// Complex Multi-Rule Policies
// ============================================================================

export const complexSamplePolicies: Policy[] = [
  // Complex Policy: Location-Based Financial Controls
  {
    id: 'policy-location-financial-controls',
    name: 'Location-Based Financial Transaction Controls',
    description: 'Multi-layered financial controls based on location, time, and user attributes',
    version: '2.0',
    priority: 400,
    enabled: true,
    category: 'financial',
    tags: ['financial', 'location', 'multi-rule', 'complex'],
    
    createdBy: 'financial-manager',
    createdAt: new Date('2024-01-13'),
    updatedBy: 'financial-manager',
    updatedAt: new Date('2024-01-19'),
    
    effect: EffectType.ALLOW,
    
    rules: [
      // Rule 1: High-value transactions from internal network
      {
        id: 'rule-internal-high-value',
        description: 'High-value transactions from internal network with manager approval',
        effect: EffectType.ALLOW,
        priority: 1,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['financial-manager', 'department-manager'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.approvalLimit.amount',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: 10000,
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.resourceType',
              operator: Operator.IN,
              value: ['payment', 'transfer'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.totalValue.amount',
              operator: Operator.GREATER_THAN,
              value: 10000,
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['process_payment', 'transfer_funds'],
          environment: [
            {
              attribute: 'environment.isInternalNetwork',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'environment.isBusinessHours',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name IN [financial-manager, department-manager]) AND (subject.approvalLimit.amount >= 10000) AND (resource.totalValue.amount > 10000) AND (environment.isInternalNetwork == true) AND (environment.isBusinessHours == true)'
        }
      },
      
      // Rule 2: Medium-value transactions with MFA
      {
        id: 'rule-medium-value-mfa',
        description: 'Medium-value transactions require MFA authentication',
        effect: EffectType.ALLOW,
        priority: 2,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['financial-manager', 'department-manager', 'purchasing-staff'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.approvalLimit.amount',
              operator: Operator.GREATER_THAN_OR_EQUAL,
              value: 1000,
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.totalValue.amount',
              operator: Operator.GREATER_THAN,
              value: 1000,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'resource.totalValue.amount',
              operator: Operator.LESS_THAN_OR_EQUAL,
              value: 10000,
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['process_payment', 'approve'],
          environment: [
            {
              attribute: 'environment.authenticationMethod',
              operator: Operator.IN,
              value: ['mfa', 'biometric'],
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.approvalLimit.amount >= 1000) AND (resource.totalValue.amount > 1000 AND resource.totalValue.amount <= 10000) AND (environment.authenticationMethod IN [mfa, biometric])'
        }
      },
      
      // Rule 3: Emergency override with enhanced logging
      {
        id: 'rule-emergency-financial-override',
        description: 'Emergency financial operations with enhanced audit requirements',
        effect: EffectType.ALLOW,
        priority: 3,
        
        target: {
          subjects: [
            {
              attribute: 'subject.role.name',
              operator: Operator.IN,
              value: ['admin', 'financial-manager'],
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'subject.clearanceLevel',
              operator: Operator.IN,
              value: ['restricted', 'confidential'],
              logicalOperator: LogicalOperator.AND
            }
          ],
          resources: [
            {
              attribute: 'resource.requiresAudit',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ],
          actions: ['override', 'emergency_payment', 'process_payment'],
          environment: [
            {
              attribute: 'environment.emergencyMode',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            },
            {
              attribute: 'environment.auditMode',
              operator: Operator.EQUALS,
              value: true,
              logicalOperator: LogicalOperator.AND
            }
          ]
        },
        
        condition: {
          type: 'complex',
          expression: '(subject.role.name IN [admin, financial-manager]) AND (subject.clearanceLevel IN [restricted, confidential]) AND (environment.emergencyMode == true) AND (environment.auditMode == true)'
        }
      }
    ],
    
    documentStatus: {
      status: 'approved' as DocumentStatus,
      approvedBy: 'financial-manager',
      approvedAt: new Date('2024-01-19'),
      comments: 'Comprehensive financial controls with location and authentication requirements'
    }
  }
];

// ============================================================================
// Sample Policy Categories
// ============================================================================

export const samplePolicyCategories = [
  {
    category: 'hospitality',
    displayName: 'Hospitality Operations',
    description: 'Restaurant, kitchen, and guest service policies',
    count: 2,
    color: 'orange'
  },
  {
    category: 'financial',
    displayName: 'Financial Controls',
    description: 'Budget, approval, and payment policies',
    count: 3,
    color: 'green'
  },
  {
    category: 'system',
    displayName: 'System Administration',
    description: 'System access and maintenance policies',
    count: 1,
    color: 'blue'
  },
  {
    category: 'vendor',
    displayName: 'Vendor Management',
    description: 'External vendor and partner policies',
    count: 1,
    color: 'purple'
  },
  {
    category: 'emergency',
    displayName: 'Emergency Access',
    description: 'Emergency override and exception policies',
    count: 1,
    color: 'red'
  },
  {
    category: 'compliance',
    displayName: 'Compliance & Audit',
    description: 'Regulatory and audit trail policies',
    count: 1,
    color: 'gray'
  }
];

// ============================================================================
// Combined Export
// ============================================================================

export const allSamplePolicies: Policy[] = [
  ...samplePolicies,
  ...complexSamplePolicies
];

// Helper functions
export function getSamplePoliciesByCategory(category: string): Policy[] {
  return allSamplePolicies.filter(policy => policy.category === category);
}

export function getEnabledSamplePolicies(): Policy[] {
  return allSamplePolicies.filter(policy => policy.enabled);
}

export function searchSamplePolicies(query: string): Policy[] {
  const lowercaseQuery = query.toLowerCase();
  return allSamplePolicies.filter(policy => 
    policy.name.toLowerCase().includes(lowercaseQuery) ||
    policy.description.toLowerCase().includes(lowercaseQuery) ||
    policy.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getSamplePoliciesByPriority(minPriority: number = 0): Policy[] {
  return allSamplePolicies
    .filter(policy => policy.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority);
}