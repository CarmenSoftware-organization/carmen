# Permission Management - Technical Specification

> **Version:** 1.0.0
> **Status:** Production Ready
> **Last Updated:** 2025-01-17

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [API Specifications](#api-specifications)
5. [Security & Compliance](#security--compliance)
6. [Performance Requirements](#performance-requirements)
7. [Integration Points](#integration-points)

---

## System Overview

### Purpose

The Permission Management system provides enterprise-grade access control for Carmen ERP through a hybrid RBAC/ABAC approach, enabling both simple role-based permissions and complex attribute-based policies.

### Key Design Decisions

1. **Hybrid RBAC/ABAC**: Combines simplicity of roles with flexibility of attribute-based policies
2. **Priority-Based Evaluation**: Deterministic policy evaluation using priority levels
3. **Real-Time Enforcement**: Sub-100ms policy evaluation for all requests
4. **Subscription Integration**: Feature gating based on subscription tiers
5. **Audit-First Design**: Comprehensive logging of all permission changes

### System Boundaries

**In Scope**:
- Policy creation, management, and evaluation
- Role definition and assignment
- Subscription-based feature gating
- Permission audit logging
- Policy testing and simulation

**Out of Scope**:
- User authentication (handled by auth module)
- Session management (handled by auth module)
- Billing and payment processing (handled by finance module)
- User provisioning (handled by user management)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  PolicyList  │  RoleList  │  SubscriptionManager           │
└──────┬────────────┬────────────────┬────────────────────────┘
       │            │                │
       ▼            ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  PolicyService │ RoleService │ SubscriptionService          │
└──────┬─────────────┬──────────────┬──────────────────────────┘
       │             │              │
       ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│   PolicyStore  │  RoleStore  │  SubscriptionStore           │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Frontend Components

**PolicyList**:
- Display policies in table/card view
- Filter and search policies
- Handle policy CRUD operations
- Trigger policy builder wizard

**RoleList**:
- Display roles in table/card view
- Manage role assignments
- Handle role CRUD operations
- User assignment interface

**SubscriptionManager**:
- Package comparison and selection
- Resource activation management
- Billing information management
- Usage analytics display

#### Application Services

**PolicyService**:
- Policy evaluation engine
- Policy CRUD operations
- Policy validation
- Policy testing and simulation
- Conflict resolution

**RoleService**:
- Role CRUD operations
- Permission inheritance calculation
- User-role assignment
- Role hierarchy validation

**SubscriptionService**:
- Subscription package management
- Resource limit enforcement
- Usage tracking
- Billing status monitoring

#### Data Stores

**PolicyStore** (Zustand):
- Policy state management
- Policy caching
- Optimistic updates
- Real-time sync

**RoleStore** (Zustand):
- Role state management
- Role caching
- Permission aggregation
- Hierarchy calculation

**SubscriptionStore** (Zustand):
- Subscription state
- Resource usage tracking
- Limit enforcement
- Usage analytics

---

## Data Models

### Policy Model

```typescript
interface Policy {
  // Identity
  id: string;
  name: string;
  description: string;

  // Effect
  effect: EffectType; // 'permit' | 'deny'
  enabled: boolean;
  priority: number; // 0-1000, higher = evaluated first

  // Targeting
  resources: ResourceSelector[];
  actions: ActionSelector[];
  conditions?: PolicyCondition[];

  // Metadata
  category?: string;
  tags?: string[];
  version: number;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;

  // Statistics
  evaluationCount: number;
  lastEvaluatedAt?: Date;
}

interface ResourceSelector {
  type: ResourceType;
  id?: string; // Specific resource ID or pattern
  pattern?: string; // Wildcard pattern (e.g., "purchase-*")
  attributes?: Record<string, any>;
}

interface ActionSelector {
  name: string; // e.g., "read", "write", "approve"
  scope?: string; // e.g., "own", "department", "all"
}

interface PolicyCondition {
  type: ConditionType;
  operator: ComparisonOperator;
  value: any;
  path?: string; // JSON path for nested attributes
}

enum EffectType {
  PERMIT = 'permit',
  DENY = 'deny'
}

enum ConditionType {
  USER_ATTRIBUTE = 'user_attribute',
  RESOURCE_ATTRIBUTE = 'resource_attribute',
  CONTEXT_ATTRIBUTE = 'context_attribute',
  TIME_BASED = 'time_based',
  LOCATION_BASED = 'location_based'
}

enum ComparisonOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  IN = 'in',
  NOT_IN = 'not_in',
  MATCHES = 'matches', // Regex
  EXISTS = 'exists'
}
```

### Role Model

```typescript
interface Role {
  // Identity
  id: string;
  name: string;
  description: string;

  // Hierarchy
  hierarchy: number; // 0-100, higher = more privileged
  parentRoles: string[]; // IDs of parent roles

  // Permissions
  permissions: string[]; // Array of permission strings
  inheritedPermissions?: string[]; // Computed from parents

  // Classification
  type: RoleType; // 'system' | 'custom' | 'department'
  department?: string; // Department scope (optional)
  location?: string; // Location scope (optional)

  // Status
  isSystemRole: boolean; // Cannot be modified if true
  isActive: boolean;

  // Statistics
  userCount: number; // Number of users with this role

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

enum RoleType {
  SYSTEM = 'system',       // Pre-defined, cannot delete
  CUSTOM = 'custom',       // User-created
  DEPARTMENT = 'department' // Scoped to department
}
```

### Subscription Model

```typescript
interface Subscription {
  // Identity
  id: string;
  organizationId: string;

  // Package
  packageType: PackageType;
  packageName: string;

  // Status
  status: SubscriptionStatus;
  billingCycle: BillingCycle;

  // Resources
  resources: ResourceLimits;
  usage: ResourceUsage;

  // Billing
  billingInfo: BillingInformation;
  paymentMethod: PaymentMethod;

  // Dates
  startDate: Date;
  renewalDate: Date;
  trialEndDate?: Date;
  suspendedAt?: Date;
  cancelledAt?: Date;

  // Metadata
  notes?: string;
  customLimits?: Record<string, number>;
}

enum PackageType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

interface ResourceLimits {
  users: number;
  locations: number;
  storage: number; // GB
  apiCalls: number; // per month
  features: string[]; // Enabled feature IDs
}

interface ResourceUsage {
  users: number;
  locations: number;
  storage: number;
  apiCalls: number;
  lastUpdated: Date;
}

interface BillingInformation {
  company: string;
  email: string;
  address: Address;
  taxId?: string;
  currency: string;
}

interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'invoice';
  cardLast4?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}
```

---

## API Specifications

### Policy Endpoints

#### List Policies
```http
GET /api/policies
Query Parameters:
  - effect: string (optional) - Filter by effect type
  - status: string (optional) - Filter by enabled status
  - category: string (optional) - Filter by category
  - search: string (optional) - Search in name/description
  - limit: number (optional, default: 50)
  - offset: number (optional, default: 0)

Response: 200 OK
{
  "policies": Policy[],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### Create Policy
```http
POST /api/policies
Request Body:
{
  "name": string,
  "description": string,
  "effect": EffectType,
  "priority": number,
  "resources": ResourceSelector[],
  "actions": ActionSelector[],
  "conditions": PolicyCondition[] (optional)
}

Response: 201 Created
{
  "policy": Policy
}

Errors:
  - 400: Invalid policy data
  - 409: Policy name already exists
  - 403: Insufficient permissions
```

#### Get Policy Details
```http
GET /api/policies/:id

Response: 200 OK
{
  "policy": Policy,
  "evaluationHistory": EvaluationStats
}

Errors:
  - 404: Policy not found
  - 403: Insufficient permissions
```

#### Update Policy
```http
PUT /api/policies/:id
Request Body: Partial<Policy>

Response: 200 OK
{
  "policy": Policy
}

Errors:
  - 400: Invalid update data
  - 404: Policy not found
  - 409: Conflict (e.g., name already exists)
  - 403: Insufficient permissions
```

#### Delete Policy
```http
DELETE /api/policies/:id

Response: 204 No Content

Errors:
  - 404: Policy not found
  - 403: Insufficient permissions
  - 409: Policy in use (provide override flag)
```

#### Test Policy
```http
POST /api/policies/:id/test
Request Body:
{
  "user": UserContext,
  "resource": ResourceContext,
  "action": string,
  "context": Record<string, any>
}

Response: 200 OK
{
  "result": 'permit' | 'deny',
  "matchedConditions": ConditionResult[],
  "evaluationTime": number, // milliseconds
  "explanation": string
}
```

### Role Endpoints

#### List Roles
```http
GET /api/roles
Query Parameters:
  - hierarchy: string (optional) - Filter by hierarchy level
  - department: string (optional) - Filter by department
  - type: string (optional) - Filter by role type
  - search: string (optional) - Search in name/description
  - limit: number (optional, default: 50)
  - offset: number (optional, default: 0)

Response: 200 OK
{
  "roles": Role[],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### Create Role
```http
POST /api/roles
Request Body:
{
  "name": string,
  "description": string,
  "hierarchy": number,
  "permissions": string[],
  "parentRoles": string[] (optional),
  "department": string (optional)
}

Response: 201 Created
{
  "role": Role
}

Errors:
  - 400: Invalid role data
  - 409: Role name already exists
  - 403: Insufficient permissions
```

#### Get Role Details
```http
GET /api/roles/:id

Response: 200 OK
{
  "role": Role,
  "users": User[], // Users with this role
  "effectivePermissions": string[] // Including inherited
}
```

#### Update Role
```http
PUT /api/roles/:id
Request Body: Partial<Role>

Response: 200 OK
{
  "role": Role
}

Errors:
  - 400: Invalid update data
  - 404: Role not found
  - 409: Circular hierarchy detected
  - 403: Insufficient permissions or system role
```

#### Delete Role
```http
DELETE /api/roles/:id

Response: 204 No Content

Errors:
  - 404: Role not found
  - 403: Insufficient permissions or system role
  - 409: Role assigned to users (provide force flag)
```

#### Assign Users to Role
```http
POST /api/roles/:id/assign
Request Body:
{
  "userIds": string[]
}

Response: 200 OK
{
  "assigned": number,
  "failed": number,
  "errors": AssignmentError[]
}
```

### Subscription Endpoints

#### Get Subscription
```http
GET /api/subscriptions

Response: 200 OK
{
  "subscription": Subscription,
  "availablePackages": Package[],
  "usage": ResourceUsage
}
```

#### Update Package
```http
PUT /api/subscriptions/package
Request Body:
{
  "packageType": PackageType,
  "billingCycle": BillingCycle
}

Response: 200 OK
{
  "subscription": Subscription,
  "prorationAmount": number,
  "effectiveDate": Date
}

Errors:
  - 400: Invalid package
  - 402: Payment required
  - 403: Insufficient permissions
```

#### Toggle Resource
```http
POST /api/subscriptions/resources
Request Body:
{
  "resourceId": string,
  "enabled": boolean
}

Response: 200 OK
{
  "subscription": Subscription
}

Errors:
  - 400: Resource not available in package
  - 403: Insufficient permissions
```

#### Update Billing Info
```http
PUT /api/subscriptions/billing
Request Body: BillingInformation

Response: 200 OK
{
  "subscription": Subscription
}
```

---

## Security & Compliance

### Authentication Requirements

All Permission Management endpoints require:
- Valid authentication token
- Active user session
- MFA verification for sensitive operations (policy delete, role delete)

### Authorization Matrix

| Operation | Required Permission | Additional Checks |
|-----------|-------------------|-------------------|
| List Policies | `view_policies` | - |
| Create Policy | `manage_policies` | - |
| Edit Policy | `manage_policies` | Owner or Admin |
| Delete Policy | `manage_policies` | MFA required |
| Test Policy | `test_policies` | - |
| List Roles | `view_roles` | - |
| Create Role | `manage_roles` | Hierarchy check |
| Edit Role | `manage_roles` | Cannot edit higher hierarchy |
| Delete Role | `manage_roles` | MFA required, not system role |
| Assign Users | `assign_roles` | Department scope check |
| View Subscription | `view_subscription` | - |
| Manage Subscription | `manage_subscription` | Organization admin only |

### Audit Logging

All permission changes are logged with:
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string; // e.g., "policy:123"
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress: string;
  userAgent: string;
}

enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  ENABLE = 'enable',
  DISABLE = 'disable'
}
```

### Data Encryption

- **At Rest**: All sensitive data encrypted using AES-256
- **In Transit**: TLS 1.3 minimum for all API communications
- **Secrets**: Payment methods and API keys encrypted with separate key

---

## Performance Requirements

### Response Time Targets

| Operation | Target | Maximum |
|-----------|--------|---------|
| Policy Evaluation | <50ms | <100ms |
| List Policies | <200ms | <500ms |
| Create Policy | <500ms | <1s |
| List Roles | <200ms | <500ms |
| Permission Check | <10ms | <50ms |
| Subscription Check | <50ms | <100ms |

### Scalability Targets

- Support 10,000+ concurrent users
- Handle 100,000+ policy evaluations per second
- Store 50,000+ policies per organization
- Manage 10,000+ roles per organization

### Caching Strategy

1. **Policy Cache**:
   - TTL: 5 minutes
   - Invalidation: On policy update/delete
   - Size: 1000 most-used policies per organization

2. **Role Cache**:
   - TTL: 10 minutes
   - Invalidation: On role update/delete/assignment
   - Size: All roles (typically <1000 per org)

3. **Permission Cache**:
   - TTL: User session duration
   - Invalidation: On role assignment change
   - Size: Per-user effective permissions

---

## Integration Points

### User Management Integration

Permission system integrates with user management for:
- User context in policy evaluation
- Role assignment to users
- Permission inheritance calculation
- User attribute access

### Audit System Integration

All permission changes are sent to central audit system:
- Real-time event streaming
- Compliance report generation
- Security incident correlation
- Access pattern analysis

### Billing System Integration

Subscription management integrates with billing:
- Package change events
- Usage metering data
- Payment status updates
- Invoice generation triggers

### Notification System Integration

Sends notifications for:
- Policy violations
- Subscription limit warnings
- Renewal reminders
- Feature activation confirmations

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-17
**Status:** Production Ready
