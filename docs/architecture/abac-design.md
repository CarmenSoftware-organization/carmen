# ABAC (Attribute-Based Access Control) Design Document
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Carmen Hospitality ERP System

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [ABAC Core Concepts](#abac-core-concepts)
3. [System Architecture](#system-architecture)
4. [Attribute Definitions](#attribute-definitions)
5. [Resource Classification](#resource-classification)
6. [Action Definitions](#action-definitions)
7. [Policy Framework](#policy-framework)
8. [Implementation Guide](#implementation-guide)
9. [Migration Strategy](#migration-strategy)
10. [Security Considerations](#security-considerations)

## Executive Summary

This document outlines the design for an Attribute-Based Access Control (ABAC) system for the Carmen Hospitality ERP application. ABAC provides fine-grained access control by evaluating attributes of subjects (users), resources (data/operations), actions (operations), and environment (context) against defined policies.

### Key Benefits
- **Fine-grained control**: Access decisions based on multiple attributes
- **Dynamic authorization**: Real-time policy evaluation
- **Scalability**: Easier to manage than traditional RBAC as complexity grows
- **Flexibility**: Support for complex business rules and compliance requirements
- **Context-aware**: Decisions based on environmental factors (time, location, device)

## ABAC Core Concepts

### Components
```
┌─────────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────┐
│   Subject   │────▶│  Action  │────▶│  Resource  │────▶│ Environment │
│ (User/Role) │     │ (CRUD+)  │     │  (Entity)  │     │  (Context)  │
└─────────────┘     └──────────┘     └────────────┘     └─────────────┘
        │                  │                 │                    │
        └──────────────────┴─────────────────┴────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │ Policy Engine  │
                            └───────┬────────┘
                                    │
                            ┌───────▼────────┐
                            │ Access Decision│
                            │  (Permit/Deny) │
                            └────────────────┘
```

## System Architecture

### High-Level Architecture
```typescript
interface ABACSystem {
  // Core Components
  policyEngine: PolicyEngine;
  attributeResolver: AttributeResolver;
  policyRepository: PolicyRepository;
  auditLogger: AuditLogger;
  
  // Evaluation Context
  contextBuilder: ContextBuilder;
  cacheManager: CacheManager;
  
  // Integration Points
  userProvider: UserProvider;
  resourceProvider: ResourceProvider;
  environmentProvider: EnvironmentProvider;
}
```

### Policy Decision Point (PDP)
```typescript
class PolicyDecisionPoint {
  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    // 1. Build evaluation context
    const context = await this.buildContext(request);
    
    // 2. Retrieve applicable policies
    const policies = await this.findApplicablePolicies(context);
    
    // 3. Evaluate policies
    const results = await this.evaluatePolicies(policies, context);
    
    // 4. Combine results (deny-overrides, permit-overrides, etc.)
    const decision = this.combineResults(results);
    
    // 5. Audit the decision
    await this.auditDecision(request, decision);
    
    return decision;
  }
}
```

## Attribute Definitions

### Subject Attributes
```typescript
interface SubjectAttributes {
  // Identity
  userId: string;
  username: string;
  email: string;
  
  // Organizational
  role: Role;
  roles: Role[];                    // Multiple roles support
  department: Department;
  departments: Department[];         // Cross-department access
  location: Location;
  locations: Location[];            // Multi-location access
  
  // Employment
  employeeType: 'full-time' | 'part-time' | 'contractor' | 'temporary';
  seniority: number;                // Years of service
  clearanceLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Permissions & Capabilities
  assignedWorkflowStages: string[];
  delegatedAuthorities: string[];
  specialPermissions: string[];
  
  // Status
  accountStatus: 'active' | 'suspended' | 'locked' | 'inactive';
  onDuty: boolean;
  shiftTiming?: { start: Date; end: Date };
  
  // Financial
  approvalLimit?: Money;
  budgetAccess?: BudgetScope[];
}
```

### Resource Attributes
```typescript
interface ResourceAttributes {
  // Identity
  resourceId: string;
  resourceType: ResourceType;
  resourceName: string;
  
  // Ownership & Classification
  owner?: string;                   // User ID of owner
  ownerDepartment?: string;
  ownerLocation?: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Business Context
  documentStatus?: DocumentStatus;
  workflowStage?: string;
  approvalLevel?: number;
  
  // Financial
  totalValue?: Money;
  budgetCategory?: string;
  costCenter?: string;
  
  // Temporal
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  effectiveDate?: Date;
  
  // Compliance & Audit
  requiresAudit: boolean;
  regulatoryFlags?: string[];
  retentionPeriod?: number;        // Days
  
  // Relationships
  parentResource?: string;
  relatedResources?: string[];
  dependencies?: string[];
}
```

### Environmental Attributes
```typescript
interface EnvironmentAttributes {
  // Temporal
  currentTime: Date;
  dayOfWeek: string;
  isBusinessHours: boolean;
  isHoliday: boolean;
  
  // Location
  requestIP: string;
  requestLocation?: GeoLocation;
  isInternalNetwork: boolean;
  facility?: string;
  
  // Device & Session
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'api';
  deviceId?: string;
  sessionId: string;
  authenticationMethod: 'password' | 'sso' | 'mfa' | 'biometric';
  sessionAge: number;               // Minutes
  
  // System State
  systemLoad: 'low' | 'normal' | 'high' | 'critical';
  maintenanceMode: boolean;
  emergencyMode: boolean;
  
  // Risk & Compliance
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceMode?: string[];        // Active compliance requirements
  auditMode: boolean;
}
```

## Resource Classification

### Resource Types
```typescript
enum ResourceType {
  // Procurement
  PURCHASE_REQUEST = 'purchase_request',
  PURCHASE_ORDER = 'purchase_order',
  GOODS_RECEIPT_NOTE = 'grn',
  CREDIT_NOTE = 'credit_note',
  
  // Inventory
  INVENTORY_ITEM = 'inventory_item',
  STOCK_COUNT = 'stock_count',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_TRANSFER = 'stock_transfer',
  
  // Vendor
  VENDOR = 'vendor',
  VENDOR_PRICE_LIST = 'vendor_price_list',
  VENDOR_CONTRACT = 'vendor_contract',
  
  // Product
  PRODUCT = 'product',
  PRODUCT_CATEGORY = 'product_category',
  PRODUCT_SPECIFICATION = 'product_specification',
  
  // Recipe
  RECIPE = 'recipe',
  RECIPE_VARIANT = 'recipe_variant',
  MENU_ITEM = 'menu_item',
  
  // Financial
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  BUDGET = 'budget',
  JOURNAL_ENTRY = 'journal_entry',
  
  // Operations
  STORE_REQUISITION = 'store_requisition',
  WASTAGE_REPORT = 'wastage_report',
  PRODUCTION_ORDER = 'production_order',
  
  // System
  USER = 'user',
  ROLE = 'role',
  WORKFLOW = 'workflow',
  REPORT = 'report',
  CONFIGURATION = 'configuration'
}
```

### Resource Hierarchy
```typescript
interface ResourceHierarchy {
  // Define parent-child relationships
  hierarchy: {
    [ResourceType.PURCHASE_ORDER]: {
      parent: ResourceType.PURCHASE_REQUEST,
      children: [ResourceType.GOODS_RECEIPT_NOTE]
    },
    [ResourceType.GOODS_RECEIPT_NOTE]: {
      parent: ResourceType.PURCHASE_ORDER,
      children: [ResourceType.CREDIT_NOTE]
    },
    [ResourceType.PRODUCT]: {
      parent: ResourceType.PRODUCT_CATEGORY,
      children: [ResourceType.RECIPE]
    }
  };
}
```

## Action Definitions

### Standard Actions
```typescript
enum StandardAction {
  // Read Operations
  VIEW = 'view',
  LIST = 'list',
  SEARCH = 'search',
  EXPORT = 'export',
  
  // Write Operations
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  
  // Workflow Operations
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  RECALL = 'recall',
  
  // Special Operations
  ASSIGN = 'assign',
  DELEGATE = 'delegate',
  OVERRIDE = 'override',
  AUDIT = 'audit'
}
```

### Resource-Specific Actions
```typescript
interface ResourceActions {
  [ResourceType.PURCHASE_REQUEST]: [
    'create_draft',
    'submit_for_approval',
    'approve_department',
    'approve_finance',
    'approve_gm',
    'convert_to_po',
    'split_items',
    'add_items',
    'modify_quantities',
    'change_vendors'
  ];
  
  [ResourceType.INVENTORY_ITEM]: [
    'view_stock',
    'view_costs',
    'adjust_quantity',
    'transfer_stock',
    'perform_count',
    'write_off',
    'change_valuation',
    'view_movements'
  ];
  
  [ResourceType.RECIPE]: [
    'create_recipe',
    'modify_ingredients',
    'calculate_cost',
    'create_variant',
    'approve_recipe',
    'publish_recipe',
    'archive_recipe'
  ];
}
```

## Policy Framework

### Policy Structure
```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  
  // Target - When this policy applies
  target: {
    subjects?: AttributeCondition[];
    resources?: AttributeCondition[];
    actions?: string[];
    environment?: AttributeCondition[];
  };
  
  // Rules - Conditions that must be met
  rules: Rule[];
  
  // Effect - What happens when conditions are met
  effect: 'permit' | 'deny';
  
  // Obligations - Additional requirements
  obligations?: Obligation[];
  
  // Advice - Optional recommendations
  advice?: Advice[];
}
```

### Rule Definition
```typescript
interface Rule {
  id: string;
  description: string;
  
  // Condition expression
  condition: Expression;
  
  // Combining algorithm
  combiningAlgorithm?: 'all' | 'any' | 'majority';
}

interface Expression {
  type: 'simple' | 'composite';
  
  // For simple expressions
  attribute?: string;
  operator?: Operator;
  value?: any;
  
  // For composite expressions
  expressions?: Expression[];
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

enum Operator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  MATCHES = 'matches',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists'
}
```

### Example Policies

#### Policy 1: Department Manager PR Approval
```typescript
const departmentManagerPRApproval: Policy = {
  id: 'pol-001',
  name: 'Department Manager PR Approval',
  description: 'Department managers can approve PRs from their department up to $10,000',
  priority: 100,
  enabled: true,
  
  target: {
    subjects: [
      { attribute: 'role.id', operator: Operator.EQUALS, value: 'department-manager' }
    ],
    resources: [
      { attribute: 'resourceType', operator: Operator.EQUALS, value: ResourceType.PURCHASE_REQUEST }
    ],
    actions: ['approve_department']
  },
  
  rules: [
    {
      id: 'rule-001',
      description: 'Same department and within approval limit',
      condition: {
        type: 'composite',
        logicalOperator: 'AND',
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
            attribute: 'resource.documentStatus',
            operator: Operator.EQUALS,
            value: 'pending_approval'
          }
        ]
      }
    }
  ],
  
  effect: 'permit',
  
  obligations: [
    {
      id: 'obl-001',
      type: 'audit',
      attributes: {
        action: 'pr_approval',
        level: 'department'
      }
    }
  ]
};
```

#### Policy 2: Warehouse Staff Inventory Access
```typescript
const warehouseStaffInventoryAccess: Policy = {
  id: 'pol-002',
  name: 'Warehouse Staff Inventory Access',
  description: 'Warehouse staff can only manage inventory in their assigned locations during work hours',
  priority: 90,
  enabled: true,
  
  target: {
    subjects: [
      { attribute: 'role.id', operator: Operator.IN, value: ['warehouse-manager', 'staff'] },
      { attribute: 'department.code', operator: Operator.EQUALS, value: 'PROC' }
    ],
    resources: [
      { attribute: 'resourceType', operator: Operator.IN, value: [
        ResourceType.INVENTORY_ITEM,
        ResourceType.STOCK_COUNT,
        ResourceType.STOCK_ADJUSTMENT
      ]}
    ],
    actions: ['view_stock', 'adjust_quantity', 'perform_count']
  },
  
  rules: [
    {
      id: 'rule-002',
      description: 'Location match and business hours',
      condition: {
        type: 'composite',
        logicalOperator: 'AND',
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
  
  effect: 'permit'
};
```

#### Policy 3: Financial Data Access
```typescript
const financialDataAccess: Policy = {
  id: 'pol-003',
  name: 'Financial Data Access',
  description: 'Financial data visible only to authorized roles from secure locations',
  priority: 110,
  enabled: true,
  
  target: {
    resources: [
      { attribute: 'dataClassification', operator: Operator.IN, value: ['confidential', 'restricted'] },
      { attribute: 'resourceType', operator: Operator.IN, value: [
        ResourceType.INVOICE,
        ResourceType.PAYMENT,
        ResourceType.BUDGET,
        ResourceType.JOURNAL_ENTRY
      ]}
    ],
    actions: ['view', 'export']
  },
  
  rules: [
    {
      id: 'rule-003',
      description: 'Finance role or manager with secure access',
      condition: {
        type: 'composite',
        logicalOperator: 'AND',
        expressions: [
          {
            type: 'composite',
            logicalOperator: 'OR',
            expressions: [
              {
                type: 'simple',
                attribute: 'subject.role.id',
                operator: Operator.IN,
                value: ['financial-manager', 'admin']
              },
              {
                type: 'composite',
                logicalOperator: 'AND',
                expressions: [
                  {
                    type: 'simple',
                    attribute: 'subject.role.permissions',
                    operator: Operator.CONTAINS,
                    value: 'view_financial_reports'
                  },
                  {
                    type: 'simple',
                    attribute: 'subject.clearanceLevel',
                    operator: Operator.IN,
                    value: ['confidential', 'restricted']
                  }
                ]
              }
            ]
          },
          {
            type: 'composite',
            logicalOperator: 'OR',
            expressions: [
              {
                type: 'simple',
                attribute: 'environment.isInternalNetwork',
                operator: Operator.EQUALS,
                value: true
              },
              {
                type: 'simple',
                attribute: 'environment.authenticationMethod',
                operator: Operator.IN,
                value: ['mfa', 'biometric']
              }
            ]
          }
        ]
      }
    }
  ],
  
  effect: 'permit',
  
  obligations: [
    {
      id: 'obl-003',
      type: 'audit',
      attributes: {
        action: 'financial_data_access',
        sensitivity: 'high',
        includeData: true
      }
    }
  ]
};
```

#### Policy 4: Cross-Department Collaboration
```typescript
const crossDepartmentCollaboration: Policy = {
  id: 'pol-004',
  name: 'Cross-Department Collaboration',
  description: 'Enable read access to resources marked for collaboration',
  priority: 80,
  enabled: true,
  
  target: {
    resources: [
      { attribute: 'collaborationEnabled', operator: Operator.EQUALS, value: true }
    ],
    actions: ['view', 'list', 'comment']
  },
  
  rules: [
    {
      id: 'rule-004',
      description: 'Collaboration list includes user department',
      condition: {
        type: 'composite',
        logicalOperator: 'OR',
        expressions: [
          {
            type: 'simple',
            attribute: 'subject.department.id',
            operator: Operator.IN,
            value: 'resource.collaboratingDepartments'
          },
          {
            type: 'simple',
            attribute: 'subject.userId',
            operator: Operator.IN,
            value: 'resource.collaboratingUsers'
          }
        ]
      }
    }
  ],
  
  effect: 'permit'
};
```

## Implementation Guide

### Policy Evaluation Engine
```typescript
class PolicyEvaluationEngine {
  private policyRepository: PolicyRepository;
  private attributeResolver: AttributeResolver;
  private cache: CacheManager;
  
  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    // 1. Resolve all attributes
    const context = await this.resolveContext(request);
    
    // 2. Find applicable policies
    const policies = await this.findApplicablePolicies(context);
    
    // 3. Sort by priority
    const sortedPolicies = policies.sort((a, b) => b.priority - a.priority);
    
    // 4. Evaluate each policy
    const results: PolicyResult[] = [];
    for (const policy of sortedPolicies) {
      const result = await this.evaluatePolicy(policy, context);
      results.push(result);
      
      // Early termination for deny
      if (result.effect === 'deny' && this.useDenyOverrides) {
        break;
      }
    }
    
    // 5. Combine results
    return this.combineResults(results);
  }
  
  private async evaluatePolicy(
    policy: Policy,
    context: EvaluationContext
  ): Promise<PolicyResult> {
    // Check if policy target matches
    if (!this.matchTarget(policy.target, context)) {
      return { policyId: policy.id, effect: 'not_applicable' };
    }
    
    // Evaluate all rules
    const ruleResults = await Promise.all(
      policy.rules.map(rule => this.evaluateRule(rule, context))
    );
    
    // Combine rule results based on policy combining algorithm
    const allRulesPassed = ruleResults.every(r => r === true);
    
    if (allRulesPassed) {
      return {
        policyId: policy.id,
        effect: policy.effect,
        obligations: policy.obligations,
        advice: policy.advice
      };
    }
    
    return { policyId: policy.id, effect: 'not_applicable' };
  }
  
  private evaluateExpression(
    expr: Expression,
    context: EvaluationContext
  ): boolean {
    if (expr.type === 'simple') {
      const attrValue = this.getAttributeValue(expr.attribute!, context);
      return this.compareValues(attrValue, expr.operator!, expr.value);
    }
    
    // Composite expression
    const results = expr.expressions!.map(e => this.evaluateExpression(e, context));
    
    switch (expr.logicalOperator) {
      case 'AND':
        return results.every(r => r === true);
      case 'OR':
        return results.some(r => r === true);
      case 'NOT':
        return !results[0];
      default:
        return false;
    }
  }
}
```

### Context Builder
```typescript
class ContextBuilder {
  async buildContext(request: AccessRequest): Promise<EvaluationContext> {
    const [subject, resource, environment] = await Promise.all([
      this.resolveSubjectAttributes(request.userId),
      this.resolveResourceAttributes(request.resourceId, request.resourceType),
      this.resolveEnvironmentAttributes(request)
    ]);
    
    return {
      subject,
      resource,
      action: request.action,
      environment,
      metadata: {
        requestId: generateId(),
        timestamp: new Date(),
        source: request.source
      }
    };
  }
  
  private async resolveSubjectAttributes(userId: string): Promise<SubjectAttributes> {
    const user = await this.userService.getUser(userId);
    
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.context.currentRole,
      roles: user.availableRoles,
      department: user.context.currentDepartment,
      departments: user.availableDepartments,
      location: user.context.currentLocation,
      locations: user.availableLocations,
      employeeType: user.employeeType || 'full-time',
      seniority: this.calculateSeniority(user.createdAt),
      clearanceLevel: user.clearanceLevel || 'internal',
      assignedWorkflowStages: user.assignedWorkflowStages || [],
      delegatedAuthorities: user.delegatedAuthorities || [],
      specialPermissions: user.specialPermissions || [],
      accountStatus: user.accountStatus || 'active',
      onDuty: await this.checkOnDuty(user),
      shiftTiming: await this.getShiftTiming(user),
      approvalLimit: user.approvalLimit,
      budgetAccess: user.budgetAccess
    };
  }
}
```

### Permission Checking Service
```typescript
class PermissionService {
  private evaluationEngine: PolicyEvaluationEngine;
  private cache: CacheManager;
  
  async checkPermission(
    userId: string,
    resourceId: string,
    action: string,
    options?: CheckOptions
  ): Promise<PermissionResult> {
    // Check cache first
    const cacheKey = `${userId}:${resourceId}:${action}`;
    const cached = await this.cache.get(cacheKey);
    if (cached && !options?.skipCache) {
      return cached;
    }
    
    // Build request
    const request: AccessRequest = {
      userId,
      resourceId,
      action,
      resourceType: await this.detectResourceType(resourceId),
      source: options?.source || 'application'
    };
    
    // Evaluate
    const decision = await this.evaluationEngine.evaluate(request);
    
    // Process result
    const result: PermissionResult = {
      allowed: decision.effect === 'permit',
      reason: decision.reason,
      obligations: decision.obligations,
      advice: decision.advice
    };
    
    // Cache result
    if (result.allowed && options?.cacheDuration) {
      await this.cache.set(cacheKey, result, options.cacheDuration);
    }
    
    return result;
  }
  
  async checkBulkPermissions(
    userId: string,
    permissions: Array<{ resourceId: string; action: string }>
  ): Promise<Map<string, PermissionResult>> {
    const results = new Map<string, PermissionResult>();
    
    // Batch evaluate for performance
    const promises = permissions.map(async ({ resourceId, action }) => {
      const result = await this.checkPermission(userId, resourceId, action);
      results.set(`${resourceId}:${action}`, result);
    });
    
    await Promise.all(promises);
    return results;
  }
}
```

### React Hook Implementation
```typescript
// hooks/useABACPermission.ts
import { useUser } from '@/lib/context/user-context';
import { useState, useEffect } from 'react';

interface UseABACPermissionOptions {
  resourceId?: string;
  resourceType?: ResourceType;
  action: string;
  attributes?: Record<string, any>;
}

export function useABACPermission({
  resourceId,
  resourceType,
  action,
  attributes
}: UseABACPermissionOptions) {
  const { user } = useUser();
  const [permission, setPermission] = useState<PermissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setPermission({ allowed: false, reason: 'Not authenticated' });
      setLoading(false);
      return;
    }
    
    const checkPermission = async () => {
      try {
        const result = await permissionService.checkPermission(
          user.id,
          resourceId || 'global',
          action,
          { 
            resourceType,
            additionalAttributes: attributes 
          }
        );
        setPermission(result);
      } catch (error) {
        console.error('Permission check failed:', error);
        setPermission({ allowed: false, reason: 'Permission check failed' });
      } finally {
        setLoading(false);
      }
    };
    
    checkPermission();
  }, [user, resourceId, resourceType, action, attributes]);
  
  return {
    allowed: permission?.allowed || false,
    loading,
    reason: permission?.reason,
    obligations: permission?.obligations,
    advice: permission?.advice
  };
}

// Usage in component
function PurchaseRequestDetail({ prId }: { prId: string }) {
  const { allowed: canApprove, loading } = useABACPermission({
    resourceId: prId,
    resourceType: ResourceType.PURCHASE_REQUEST,
    action: 'approve_department'
  });
  
  if (loading) return <Skeleton />;
  
  return (
    <div>
      {canApprove && (
        <Button onClick={handleApprove}>
          Approve Request
        </Button>
      )}
    </div>
  );
}
```

## Migration Strategy

### Phase 1: Preparation (Week 1-2)
1. **Audit Current RBAC System**
   - Document all existing roles and permissions
   - Identify complex permission scenarios
   - Map current permissions to ABAC attributes

2. **Design Policy Repository**
   - Create policy storage schema
   - Implement policy management interface
   - Set up policy versioning

### Phase 2: Parallel Implementation (Week 3-6)
1. **Implement Core ABAC Components**
   - Policy engine
   - Attribute resolver
   - Context builder
   - Evaluation engine

2. **Create Initial Policies**
   - Convert RBAC rules to ABAC policies
   - Add new fine-grained policies
   - Test policy evaluation

### Phase 3: Integration (Week 7-8)
1. **Dual-Mode Operation**
   ```typescript
   class HybridPermissionService {
     async checkPermission(request: PermissionRequest): Promise<boolean> {
       // Check ABAC first
       const abacResult = await this.abac.check(request);
       
       // Fall back to RBAC if no ABAC policy found
       if (abacResult.status === 'no_policy') {
         return this.rbac.check(request);
       }
       
       return abacResult.allowed;
     }
   }
   ```

2. **Shadow Mode Testing**
   - Run ABAC in parallel with RBAC
   - Log discrepancies for review
   - Refine policies based on results

### Phase 4: Gradual Rollout (Week 9-12)
1. **Module-by-Module Migration**
   - Start with low-risk modules (reporting, read-only operations)
   - Progress to critical modules (procurement, finance)
   - Monitor and adjust policies

2. **User Group Migration**
   - Pilot with IT/Admin users
   - Expand to department managers
   - Full rollout to all users

### Phase 5: Optimization (Week 13-14)
1. **Performance Tuning**
   - Implement caching strategies
   - Optimize policy evaluation
   - Database indexing for attributes

2. **Policy Refinement**
   - Analyze access logs
   - Identify policy gaps
   - Consolidate redundant policies

## Security Considerations

### Policy Security
1. **Policy Tampering Protection**
   - Digital signatures on policies
   - Audit trail for policy changes
   - Version control with rollback capability

2. **Attribute Integrity**
   ```typescript
   class SecureAttributeResolver {
     async resolveAttributes(source: string): Promise<Attributes> {
       const attributes = await this.getAttributes(source);
       
       // Validate attribute integrity
       if (!this.validateSignature(attributes)) {
         throw new SecurityException('Attribute tampering detected');
       }
       
       // Check attribute freshness
       if (this.isStale(attributes)) {
         return this.refreshAttributes(source);
       }
       
       return attributes;
     }
   }
   ```

### Audit and Compliance
1. **Comprehensive Logging**
   ```typescript
   interface AuditLog {
     timestamp: Date;
     requestId: string;
     userId: string;
     resourceId: string;
     action: string;
     decision: 'permit' | 'deny';
     policiesEvaluated: string[];
     executionTime: number;
     clientInfo: ClientInfo;
     obligations: Obligation[];
   }
   ```

2. **Compliance Reporting**
   - Access pattern analysis
   - Policy effectiveness metrics
   - Anomaly detection
   - Regulatory compliance reports

### Performance Security
1. **DoS Protection**
   - Rate limiting on permission checks
   - Query complexity limits
   - Caching with TTL

2. **Resource Protection**
   ```typescript
   class RateLimiter {
     async checkLimit(userId: string): Promise<boolean> {
       const key = `rate:${userId}`;
       const count = await this.redis.incr(key);
       
       if (count === 1) {
         await this.redis.expire(key, 60); // 1 minute window
       }
       
       return count <= this.maxRequestsPerMinute;
     }
   }
   ```

## Monitoring and Metrics

### Key Performance Indicators
1. **Performance Metrics**
   - Average policy evaluation time
   - Cache hit ratio
   - Request throughput
   - Error rates

2. **Security Metrics**
   - Failed access attempts
   - Policy violations
   - Anomalous access patterns
   - Privilege escalation attempts

3. **Business Metrics**
   - Policy coverage
   - User satisfaction
   - Compliance rate
   - Administrative overhead reduction

### Monitoring Dashboard
```typescript
interface ABACMetrics {
  performance: {
    avgEvaluationTime: number;      // milliseconds
    cacheHitRatio: number;           // percentage
    requestsPerSecond: number;
    p95ResponseTime: number;
  };
  
  security: {
    deniedRequests: number;
    policyViolations: number;
    suspiciousPatterns: string[];
    activeThreats: Threat[];
  };
  
  operational: {
    totalPolicies: number;
    activePolicies: number;
    policyCoverage: number;          // percentage
    attributeSources: number;
  };
}
```

## Appendix

### A. Attribute Naming Convention
- Use dot notation for nested attributes: `user.department.name`
- Use underscore for multi-word attributes: `approval_limit`
- Prefix with namespace for custom attributes: `custom.vendor_rating`

### B. Policy Naming Convention
- Format: `[module]-[resource]-[action]-[constraint]`
- Example: `procurement-pr-approve-department-limit`

### C. Common Policy Patterns
1. **Ownership-based access**
2. **Hierarchical approval chains**
3. **Time-based restrictions**
4. **Location-based access**
5. **Delegation patterns**
6. **Emergency override**

### D. Troubleshooting Guide
1. **Permission Denied Issues**
   - Check policy evaluation logs
   - Verify attribute resolution
   - Review policy priorities

2. **Performance Issues**
   - Monitor cache effectiveness
   - Analyze policy complexity
   - Check attribute resolver performance

### E. Testing Framework
```typescript
describe('ABAC Policy Tests', () => {
  it('should allow department manager to approve PR within limit', async () => {
    const context = createContext({
      subject: { role: 'department-manager', department: 'F&B' },
      resource: { type: 'purchase_request', department: 'F&B', value: 5000 },
      action: 'approve_department'
    });
    
    const result = await engine.evaluate(context);
    expect(result.effect).toBe('permit');
  });
  
  it('should deny access outside business hours', async () => {
    const context = createContext({
      environment: { isBusinessHours: false },
      action: 'adjust_inventory'
    });
    
    const result = await engine.evaluate(context);
    expect(result.effect).toBe('deny');
  });
});
```

## Conclusion

This ABAC design provides a flexible, scalable, and secure access control system for the Carmen Hospitality ERP. The attribute-based approach enables fine-grained permissions while maintaining manageable complexity through well-defined policies and clear implementation patterns.

The migration strategy ensures a smooth transition from the existing RBAC system with minimal disruption to operations. Regular monitoring and optimization will ensure the system continues to meet evolving business requirements while maintaining high performance and security standards.