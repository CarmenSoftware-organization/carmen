// Policy Templates for Carmen ERP ABAC Policy Builder
// Pre-built policy templates for common hospitality ERP scenarios

import { AttributeCondition, Operator, LogicalOperator, EffectType } from '@/lib/types/permissions';

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isSystem: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  
  // Template conditions
  subjectConditions: AttributeCondition[];
  resourceConditions: AttributeCondition[];
  actionConditions: string[];
  environmentConditions: AttributeCondition[];
  
  // Policy metadata
  effect: EffectType;
  logicalOperator: LogicalOperator;
  priority: number;
  
  // Usage guidance
  usageScenarios: string[];
  customizationNotes: string[];
  complianceNotes?: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

// ============================================================================
// Common Access Control Templates
// ============================================================================

export const commonPolicyTemplates: PolicyTemplate[] = [
  {
    id: 'dept-access-control',
    name: 'Department Access Control',
    description: 'Users can only access resources in their department',
    category: 'access_control',
    tags: ['department', 'isolation', 'basic', 'security'],
    isSystem: true,
    difficulty: 'beginner',
    estimatedSetupTime: '5 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.department.name',
        operator: Operator.IN,
        value: ['procurement', 'kitchen', 'finance', 'housekeeping']
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.ownerDepartment',
        operator: Operator.EQUALS,
        value: '{{subject.department.name}}'
      }
    ],
    actionConditions: ['read', 'view', 'list'],
    environmentConditions: [],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 100,
    
    usageScenarios: [
      'Prevent cross-department data access',
      'Ensure data isolation between departments',
      'Implement basic organizational access control'
    ],
    customizationNotes: [
      'Add specific departments based on your organization',
      'Include additional actions as needed',
      'Consider adding exceptions for management roles'
    ],
    riskAssessment: {
      level: 'low',
      factors: ['Basic access control', 'Department-based isolation']
    }
  },

  {
    id: 'role-hierarchy-access',
    name: 'Role-Based Permissions',
    description: 'Actions based on user role hierarchy',
    category: 'access_control',
    tags: ['role', 'hierarchy', 'rbac', 'permissions'],
    isSystem: true,
    difficulty: 'intermediate',
    estimatedSetupTime: '10 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['admin', 'manager', 'staff']
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.dataClassification',
        operator: Operator.NOT_EQUALS,
        value: 'top_secret'
      }
    ],
    actionConditions: ['read', 'create', 'update'],
    environmentConditions: [],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 200,
    
    usageScenarios: [
      'Implement role-based access control',
      'Create hierarchical permission structure',
      'Manage access based on job functions'
    ],
    customizationNotes: [
      'Define your organization\'s role hierarchy',
      'Map actions to appropriate roles',
      'Consider adding role-specific exceptions'
    ],
    riskAssessment: {
      level: 'medium',
      factors: ['Role-based permissions', 'Hierarchical access']
    }
  },

  {
    id: 'business-hours-restriction',
    name: 'Business Hours Access',
    description: 'Restrict actions to business hours only',
    category: 'temporal',
    tags: ['time', 'business_hours', 'restriction', 'schedule'],
    isSystem: true,
    difficulty: 'beginner',
    estimatedSetupTime: '3 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.accountStatus',
        operator: Operator.EQUALS,
        value: 'active'
      }
    ],
    resourceConditions: [],
    actionConditions: ['create', 'update', 'delete', 'approve'],
    environmentConditions: [
      {
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 150,
    
    usageScenarios: [
      'Prevent after-hours system modifications',
      'Enforce business hour work policies',
      'Reduce security risks during off-hours'
    ],
    customizationNotes: [
      'Define your business hours in system settings',
      'Add exceptions for emergency situations',
      'Consider different hours for different roles'
    ],
    riskAssessment: {
      level: 'low',
      factors: ['Time-based access control', 'Business policy enforcement']
    }
  }
];

// ============================================================================
// Financial & Approval Templates
// ============================================================================

export const financialPolicyTemplates: PolicyTemplate[] = [
  {
    id: 'purchase-approval-workflow',
    name: 'Purchase Approval Workflow',
    description: 'Multi-level approval for high-value transactions',
    category: 'financial',
    tags: ['approval', 'workflow', 'financial', 'procurement'],
    isSystem: true,
    difficulty: 'advanced',
    estimatedSetupTime: '15 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['purchasing-staff', 'department-manager', 'financial-manager']
      },
      {
        attribute: 'subject.approvalLimit.amount',
        operator: Operator.GREATER_THAN,
        value: '{{resource.totalValue.amount}}'
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.resourceType',
        operator: Operator.EQUALS,
        value: 'purchase_request'
      },
      {
        attribute: 'resource.totalValue.amount',
        operator: Operator.GREATER_THAN,
        value: 1000
      }
    ],
    actionConditions: ['approve_purchase_request'],
    environmentConditions: [
      {
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 300,
    
    usageScenarios: [
      'Implement approval workflows for large purchases',
      'Ensure financial controls and oversight',
      'Prevent unauthorized high-value transactions'
    ],
    customizationNotes: [
      'Set approval limits based on organizational policy',
      'Define escalation paths for different amounts',
      'Add additional approval criteria as needed'
    ],
    complianceNotes: [
      'Meets SOX compliance requirements',
      'Supports audit trail requirements',
      'Enforces segregation of duties'
    ],
    riskAssessment: {
      level: 'high',
      factors: ['Financial controls', 'Multi-level approval', 'High-value transactions']
    }
  },

  {
    id: 'budget-monitoring',
    name: 'Budget Access Control',
    description: 'Users can view budget information for their department only',
    category: 'financial',
    tags: ['budget', 'department', 'financial', 'visibility'],
    isSystem: true,
    difficulty: 'intermediate',
    estimatedSetupTime: '8 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.department.name',
        operator: Operator.IN,
        value: ['procurement', 'kitchen', 'finance', 'housekeeping']
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.resourceType',
        operator: Operator.IN,
        value: ['budget', 'financial_report']
      },
      {
        attribute: 'resource.ownerDepartment',
        operator: Operator.EQUALS,
        value: '{{subject.department.name}}'
      },
      {
        attribute: 'resource.dataClassification',
        operator: Operator.EQUALS,
        value: 'internal'
      }
    ],
    actionConditions: ['view', 'monitor_budget'],
    environmentConditions: [],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 250,
    
    usageScenarios: [
      'Control access to budget information',
      'Implement department-based financial visibility',
      'Protect sensitive financial data'
    ],
    customizationNotes: [
      'Add finance managers with cross-department access',
      'Consider read-only vs full access levels',
      'Add time-based restrictions if needed'
    ],
    complianceNotes: [
      'Supports financial data protection',
      'Meets confidentiality requirements'
    ],
    riskAssessment: {
      level: 'medium',
      factors: ['Financial data access', 'Department isolation']
    }
  }
];

// ============================================================================
// Security & Compliance Templates
// ============================================================================

export const securityPolicyTemplates: PolicyTemplate[] = [
  {
    id: 'location-based-security',
    name: 'Location-Based Access',
    description: 'IP address restrictions for sensitive operations',
    category: 'security',
    tags: ['location', 'ip', 'security', 'network'],
    isSystem: true,
    difficulty: 'intermediate',
    estimatedSetupTime: '10 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.accountStatus',
        operator: Operator.EQUALS,
        value: 'active'
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.dataClassification',
        operator: Operator.IN,
        value: ['confidential', 'restricted']
      }
    ],
    actionConditions: ['view', 'update', 'export_data'],
    environmentConditions: [
      {
        attribute: 'environment.isInternalNetwork',
        operator: Operator.EQUALS,
        value: true
      },
      {
        attribute: 'environment.requestIP',
        operator: Operator.STARTS_WITH,
        value: '192.168.'
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 400,
    
    usageScenarios: [
      'Restrict access to internal network only',
      'Prevent remote access to sensitive data',
      'Implement location-based security controls'
    ],
    customizationNotes: [
      'Configure your organization\'s IP ranges',
      'Add VPN exceptions if needed',
      'Consider device-based restrictions'
    ],
    complianceNotes: [
      'Supports data protection regulations',
      'Meets network security requirements'
    ],
    riskAssessment: {
      level: 'high',
      factors: ['Network security', 'Location restrictions', 'Data protection']
    }
  },

  {
    id: 'emergency-access',
    name: 'Emergency Override',
    description: 'Override policies for emergency situations',
    category: 'security',
    tags: ['emergency', 'override', 'security', 'exception'],
    isSystem: true,
    difficulty: 'advanced',
    estimatedSetupTime: '12 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['admin', 'department-manager', 'financial-manager']
      },
      {
        attribute: 'subject.clearanceLevel',
        operator: Operator.IN,
        value: ['confidential', 'restricted']
      }
    ],
    resourceConditions: [],
    actionConditions: ['read', 'update', 'approve', 'override'],
    environmentConditions: [
      {
        attribute: 'environment.emergencyMode',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 500,
    
    usageScenarios: [
      'Provide emergency access during crises',
      'Allow policy overrides for urgent situations',
      'Maintain business continuity during emergencies'
    ],
    customizationNotes: [
      'Define what constitutes an emergency',
      'Set up emergency mode activation procedures',
      'Add additional audit requirements'
    ],
    complianceNotes: [
      'Enhanced audit logging required',
      'Emergency access must be time-limited',
      'Post-emergency review mandatory'
    ],
    riskAssessment: {
      level: 'critical',
      factors: ['Emergency override', 'Policy exceptions', 'Elevated privileges']
    }
  },

  {
    id: 'audit-trail-requirements',
    name: 'Compliance Audit Trail',
    description: 'Enhanced logging for compliance-sensitive operations',
    category: 'compliance',
    tags: ['audit', 'compliance', 'logging', 'sox'],
    isSystem: true,
    difficulty: 'intermediate',
    estimatedSetupTime: '8 minutes',
    
    subjectConditions: [],
    resourceConditions: [
      {
        attribute: 'resource.requiresAudit',
        operator: Operator.EQUALS,
        value: true
      }
    ],
    actionConditions: ['create', 'update', 'delete', 'approve', 'process_payment'],
    environmentConditions: [
      {
        attribute: 'environment.auditMode',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 350,
    
    usageScenarios: [
      'Ensure compliance with audit requirements',
      'Track all financial and sensitive operations',
      'Support regulatory compliance'
    ],
    customizationNotes: [
      'Define which resources require audit trails',
      'Configure audit log retention periods',
      'Set up automated compliance reports'
    ],
    complianceNotes: [
      'Meets SOX audit requirements',
      'Supports GDPR compliance',
      'Industry-specific compliance ready'
    ],
    riskAssessment: {
      level: 'medium',
      factors: ['Compliance requirements', 'Audit logging', 'Regulatory oversight']
    }
  }
];

// ============================================================================
// Hospitality-Specific Templates
// ============================================================================

export const hospitalityPolicyTemplates: PolicyTemplate[] = [
  {
    id: 'kitchen-access-control',
    name: 'Kitchen Staff Recipe Access',
    description: 'Allow kitchen staff to view/modify recipes during business hours',
    category: 'hospitality',
    tags: ['kitchen', 'recipe', 'staff', 'business_hours'],
    isSystem: false,
    difficulty: 'beginner',
    estimatedSetupTime: '5 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['chef', 'kitchen-staff']
      },
      {
        attribute: 'subject.department.name',
        operator: Operator.EQUALS,
        value: 'kitchen'
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.resourceType',
        operator: Operator.EQUALS,
        value: 'recipe'
      }
    ],
    actionConditions: ['view_recipe', 'modify_recipe'],
    environmentConditions: [
      {
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 200,
    
    usageScenarios: [
      'Control kitchen staff access to recipes',
      'Prevent unauthorized recipe modifications',
      'Ensure recipes are updated during appropriate hours'
    ],
    customizationNotes: [
      'Add specific kitchen roles based on your hierarchy',
      'Consider adding approval requirements for recipe changes',
      'Include seasonal menu restrictions if applicable'
    ],
    riskAssessment: {
      level: 'low',
      factors: ['Recipe management', 'Kitchen operations', 'Business hour restrictions']
    }
  },

  {
    id: 'vendor-portal-access',
    name: 'Vendor Portal Access',
    description: 'External vendors can submit invoices for their contracts only',
    category: 'hospitality',
    tags: ['vendor', 'portal', 'external', 'invoice'],
    isSystem: false,
    difficulty: 'advanced',
    estimatedSetupTime: '20 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.EQUALS,
        value: 'vendor'
      },
      {
        attribute: 'subject.accountStatus',
        operator: Operator.EQUALS,
        value: 'active'
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.resourceType',
        operator: Operator.IN,
        value: ['invoice', 'purchase_order']
      },
      {
        attribute: 'resource.owner',
        operator: Operator.EQUALS,
        value: '{{subject.userId}}'
      }
    ],
    actionConditions: ['create_invoice', 'view', 'update'],
    environmentConditions: [
      {
        attribute: 'environment.isInternalNetwork',
        operator: Operator.EQUALS,
        value: false
      },
      {
        attribute: 'environment.authenticationMethod',
        operator: Operator.EQUALS,
        value: 'sso'
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 300,
    
    usageScenarios: [
      'Allow vendors to submit invoices through portal',
      'Restrict vendors to their own contracts only',
      'Provide secure external access for vendors'
    ],
    customizationNotes: [
      'Configure vendor SSO integration',
      'Set up contract-based access controls',
      'Add document upload restrictions'
    ],
    complianceNotes: [
      'External access requires enhanced security',
      'Vendor actions should be heavily audited',
      'Data isolation between vendors is critical'
    ],
    riskAssessment: {
      level: 'high',
      factors: ['External access', 'Vendor portal', 'Document submission', 'Data isolation']
    }
  },

  {
    id: 'manager-override',
    name: 'Manager Override',
    description: 'Managers can override standard restrictions during emergencies',
    category: 'hospitality',
    tags: ['manager', 'override', 'emergency', 'escalation'],
    isSystem: false,
    difficulty: 'intermediate',
    estimatedSetupTime: '10 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['department-manager', 'financial-manager']
      },
      {
        attribute: 'subject.seniority',
        operator: Operator.GREATER_THAN,
        value: 2
      }
    ],
    resourceConditions: [],
    actionConditions: ['override', 'emergency_access', 'approve', 'escalate'],
    environmentConditions: [
      {
        attribute: 'environment.emergencyMode',
        operator: Operator.EQUALS,
        value: true
      },
      {
        attribute: 'environment.isHoliday',
        operator: Operator.EQUALS,
        value: true
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 450,
    
    usageScenarios: [
      'Provide manager escalation paths',
      'Handle emergency situations flexibly',
      'Allow experienced managers to override policies'
    ],
    customizationNotes: [
      'Define what constitutes an override situation',
      'Set minimum seniority requirements',
      'Add post-override reporting requirements'
    ],
    complianceNotes: [
      'Override actions must be logged',
      'Post-override review required',
      'Justification must be documented'
    ],
    riskAssessment: {
      level: 'high',
      factors: ['Manager override', 'Emergency access', 'Policy exceptions']
    }
  },

  {
    id: 'seasonal-menu-updates',
    name: 'Seasonal Menu Management',
    description: 'Allow menu modifications only during designated planning periods',
    category: 'hospitality',
    tags: ['menu', 'seasonal', 'planning', 'chef'],
    isSystem: false,
    difficulty: 'intermediate',
    estimatedSetupTime: '12 minutes',
    
    subjectConditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['chef', 'menu-manager']
      }
    ],
    resourceConditions: [
      {
        attribute: 'resource.resourceType',
        operator: Operator.IN,
        value: ['recipe', 'menu']
      }
    ],
    actionConditions: ['modify_recipe', 'approve_menu_change', 'create'],
    environmentConditions: [
      {
        attribute: 'environment.currentTime',
        operator: Operator.GREATER_THAN,
        value: '2024-02-01'
      },
      {
        attribute: 'environment.currentTime',
        operator: Operator.LESS_THAN,
        value: '2024-02-15'
      }
    ],

    effect: EffectType.PERMIT,
    logicalOperator: LogicalOperator.AND,
    priority: 275,
    
    usageScenarios: [
      'Control when menu changes can be made',
      'Implement seasonal menu planning cycles',
      'Prevent unauthorized menu modifications'
    ],
    customizationNotes: [
      'Set up seasonal planning periods',
      'Add approval workflows for menu changes',
      'Consider cost impact restrictions'
    ],
    riskAssessment: {
      level: 'medium',
      factors: ['Menu planning', 'Seasonal restrictions', 'Chef permissions']
    }
  }
];

// ============================================================================
// Template Categories
// ============================================================================

export const templateCategories = [
  {
    category: 'access_control',
    displayName: 'Access Control',
    description: 'Basic access control and permission templates',
    icon: 'Lock',
    color: 'blue'
  },
  {
    category: 'financial',
    displayName: 'Financial Controls',
    description: 'Financial approval and budget control templates',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    category: 'security',
    displayName: 'Security & Compliance',
    description: 'Security policies and compliance templates',
    icon: 'Shield',
    color: 'red'
  },
  {
    category: 'temporal',
    displayName: 'Time-Based Policies',
    description: 'Time and schedule-based access control',
    icon: 'Clock',
    color: 'purple'
  },
  {
    category: 'hospitality',
    displayName: 'Hospitality Operations',
    description: 'Industry-specific hospitality templates',
    icon: 'Hotel',
    color: 'orange'
  },
  {
    category: 'compliance',
    displayName: 'Regulatory Compliance',
    description: 'Templates for regulatory and audit compliance',
    icon: 'FileCheck',
    color: 'gray'
  }
];

// ============================================================================
// Combined Export
// ============================================================================

export const allPolicyTemplates: PolicyTemplate[] = [
  ...commonPolicyTemplates,
  ...financialPolicyTemplates,
  ...securityPolicyTemplates,
  ...hospitalityPolicyTemplates
];

// Helper functions
export function getTemplatesByCategory(category: string): PolicyTemplate[] {
  return allPolicyTemplates.filter(template => template.category === category);
}

export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): PolicyTemplate[] {
  return allPolicyTemplates.filter(template => template.difficulty === difficulty);
}

export function searchTemplates(query: string): PolicyTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return allPolicyTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getSystemTemplates(): PolicyTemplate[] {
  return allPolicyTemplates.filter(template => template.isSystem);
}

export function getCustomTemplates(): PolicyTemplate[] {
  return allPolicyTemplates.filter(template => !template.isSystem);
}