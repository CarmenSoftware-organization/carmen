# Policies Management (ABAC)

> **Feature:** Permission Management > Policies
> **Pages:** 7
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

The Policies Management sub-feature provides an advanced Attribute-Based Access Control (ABAC) system for Carmen ERP. Unlike traditional role-based permissions, ABAC policies enable fine-grained access control based on user attributes, resource attributes, environmental context, and custom conditions.

### Key Features

1. **Visual Policy Builder** - Step-by-step wizard for creating complex policies
2. **Simple Policy Creator** - Quick creation for basic allow/deny rules
3. **Policy Testing** - Simulate policy evaluation with test scenarios
4. **Priority-Based Evaluation** - Deterministic policy resolution using priorities
5. **Advanced Filtering** - Filter by effect, status, resource type, priority, date
6. **Policy Cloning** - Duplicate existing policies for quick creation

### ABAC vs RBAC

**Role-Based (RBAC)**:
- Simple: User → Role → Permissions
- Static: Permissions fixed per role
- Coarse-grained: All-or-nothing access

**Attribute-Based (ABAC)**:
- Dynamic: User attributes + Resource attributes + Context → Decision
- Flexible: Conditions can consider time, location, department
- Fine-grained: Precise control (e.g., "approve if amount < $5000 AND department = 'procurement'")

---

## Page Structure

### 1. Policy List Page
**Route:** `/system-administration/permission-management/policies`

#### Components:
- **Header Section**: Title, description, type toggle
- **Action Buttons**: Simple Creator, Advanced Builder, Filters
- **Policy Type Toggle**: Switch between RBAC and ABAC policies
- **Filters Panel**: Advanced filtering interface
- **Policy List**: Table view with sorting and pagination

#### Features:
- **Policy Type Filter**: Toggle between role-based and attribute-based policies
- **Search**: Full-text search in policy name and description
- **Advanced Filters**:
  - Effect (Permit, Deny, All)
  - Status (Enabled, Disabled, All)
  - Resource Types (multi-select)
  - Priority Range (0-1000 slider)
  - Created Date Range
  - Categories (multi-select)
- **Saved Filter Presets**: Save and load common filter combinations
- **Bulk Actions**: Enable/disable multiple policies

#### Policy List Columns:
- **Name**: Policy name with effect badge
- **Description**: Brief description
- **Priority**: Numeric priority (0-1000)
- **Effect**: Permit/Deny badge
- **Status**: Enabled/Disabled toggle
- **Resources**: Resource types targeted
- **Created**: Creation date
- **Actions**: View, Edit, Test, Clone, Delete

#### User Actions:
- **Create Policy**: Opens simple creator or advanced builder
- **View Policy**: Navigate to detail page
- **Edit Policy**: Navigate to builder in edit mode
- **Test Policy**: Open testing dialog
- **Clone Policy**: Duplicate with modifications
- **Toggle Status**: Enable/disable policy
- **Delete Policy**: Remove policy (with confirmation)

### 2. Simple Policy Creator
**Route:** `/system-administration/permission-management/policies/simple`

#### Purpose
Quick creation of basic allow/deny policies without complex conditions.

#### Form Fields:
- **Basic Information**
  - Policy Name (required)
  - Description (optional)
  - Effect (Permit/Deny, required)
  - Priority (0-1000, default: 500)

- **Who** (Subject)
  - All Users
  - Specific Roles (multi-select)
  - Specific Users (multi-select)
  - Department (select)

- **What** (Resource)
  - Resource Type (select: Purchase Request, Order, Inventory, etc.)
  - All Resources of Type
  - Specific Resources (ID pattern)

- **When** (Context) - Optional
  - Time-based (business hours, specific dates)
  - Location-based (specific locations)
  - Custom attributes

- **Actions**
  - Select actions (read, write, approve, delete, etc.)
  - All actions on resource

#### Workflow:
1. Enter policy name and effect
2. Select who the policy applies to
3. Select what resources are affected
4. Choose which actions are permitted/denied
5. Add optional time/location conditions
6. Review generated policy
7. Save and enable

#### Generated Policy:
The simple creator generates a standard ABAC policy that can be further customized in the advanced builder.

### 3. Advanced Policy Builder
**Route:** `/system-administration/permission-management/policies/builder`

#### Purpose
Full-featured policy creation wizard with support for complex conditions, multiple resources, and advanced attribute matching.

#### Wizard Steps:

**Step 1: Policy Information**
- Name (required, unique)
- Description (optional)
- Category (select from predefined or custom)
- Tags (comma-separated)
- Priority (0-1000)
- Effect (Permit/Deny)

**Step 2: Resource Selection**
- Resource Types (multi-select with search)
- Resource Filters:
  - Specific IDs (comma-separated)
  - ID Patterns (wildcards: `purchase-*`, `order-2024-*`)
  - Attribute Filters (JSON-based)
- Resource Preview (shows matching resources)

**Step 3: Action Selection**
- Browse action categories
- Select specific actions
- Define action scope (own, department, all)
- Custom action patterns

**Step 4: Subject Definition**
- User Attributes:
  - Roles (multi-select)
  - Departments (multi-select)
  - Locations (multi-select)
  - Custom user attributes
- Attribute Operators (equals, in, matches, exists)

**Step 5: Conditions (Optional)**
- Time Conditions:
  - Business hours only
  - Specific date ranges
  - Day of week restrictions
- Location Conditions:
  - Specific locations
  - Location attributes
- Resource Conditions:
  - Amount thresholds
  - Status requirements
  - Ownership checks
- Context Conditions:
  - Request source (web, mobile, API)
  - IP address restrictions
  - Custom context attributes

**Step 6: Review & Test**
- Policy Summary (all settings)
- Visual Policy Flow Diagram
- Test Scenarios:
  - Define test users
  - Define test resources
  - Define test actions
  - View evaluation results
- Policy JSON Preview
- Validation Results

**Step 7: Save & Activate**
- Enable immediately or save as draft
- Schedule activation (future date)
- Set expiration date (optional)
- Add activation notes

#### Features:
- **Drag & Drop**: Reorder conditions
- **Copy/Paste**: Duplicate condition groups
- **Templates**: Pre-built policy templates
- **Import/Export**: JSON policy import/export
- **Version History**: Track policy changes
- **Conflict Detection**: Warn about conflicting policies

### 4. Policy Demo Page
**Route:** `/system-administration/permission-management/policies/demo`

#### Purpose
Interactive demonstration of policy evaluation with pre-configured examples.

#### Sections:
- **Example Policies**: Pre-configured policies showing common patterns
- **Interactive Testing**: Live policy evaluation simulator
- **Use Case Scenarios**: Real-world examples with explanations
- **Tutorial**: Step-by-step guide to ABAC concepts

#### Demo Scenarios:
1. **Department-Based Access**
   - "Allow procurement staff to create purchase requests"
   - Shows role + department condition

2. **Amount-Based Approval**
   - "Allow department managers to approve orders under $5000"
   - Shows role + amount threshold condition

3. **Time-Based Access**
   - "Allow inventory adjustments only during business hours"
   - Shows time-based condition

4. **Location-Based Access**
   - "Allow stock transfers only within assigned locations"
   - Shows location attribute condition

5. **Complex Multi-Condition**
   - "Allow senior staff to approve high-value orders outside business hours"
   - Shows multiple conditions combined

#### Interactive Features:
- Modify demo policies
- Add custom test cases
- View evaluation logs
- Export demo policies for use

### 5. Policy Detail Page
**Route:** `/system-administration/permission-management/policies/[id]`

#### Sections:

**Policy Overview**
- Name, description, effect badge
- Priority level indicator
- Status toggle (enabled/disabled)
- Created/updated metadata
- Edit button

**Statistics Cards**
- Evaluation Count (total evaluations)
- Permit Rate (% of permit outcomes)
- Last Evaluated (timestamp)
- Affected Resources (count)

**Policy Configuration**
- Resources Targeted
  - Resource types list
  - Resource patterns
  - Attribute filters
- Actions Permitted/Denied
  - Action list with scopes
- Conditions Applied
  - User conditions
  - Resource conditions
  - Time conditions
  - Context conditions

**Evaluation History**
- Recent evaluations table
- User, resource, action, outcome
- Condition results breakdown
- Timestamp and duration
- Filter by outcome (permit/deny)

**Impact Analysis**
- Affected Users (count + list)
- Affected Resources (count + list)
- Conflicting Policies (warnings)
- Policy Dependencies

**Activity Timeline**
- Policy changes (created, updated, enabled/disabled)
- Evaluation statistics over time
- Notable events (e.g., high denial rate)

#### User Actions:
- Edit policy (navigate to builder)
- Test policy (open test dialog)
- Clone policy
- Enable/disable toggle
- Delete policy
- View raw JSON
- Export policy

### 6. Policy Edit Page
**Route:** `/system-administration/permission-management/policies/[id]/edit`

#### Features:
- Same wizard interface as advanced builder
- Pre-populated with existing policy data
- Change tracking (highlights modified fields)
- Version comparison (before/after diff)
- Rollback option
- Test before saving

#### Edit Modes:
- **Full Edit**: Modify all policy aspects
- **Quick Edit**: Modify priority, status, or description only
- **Condition Edit**: Modify only conditions without changing targeting

#### Validation:
- Name uniqueness check (excluding self)
- Priority conflict detection
- Condition syntax validation
- Impact analysis before save
- Test evaluation with sample data

### 7. Policy Testing Interface
**Accessible from**: Policy list actions, policy detail page, builder wizard

#### Testing Workflow:

**Step 1: Define Test Context**
- **User Context**:
  - Select user or define attributes manually
  - Role, department, location
  - Custom user attributes

- **Resource Context**:
  - Select resource or define attributes
  - Resource type, ID, status
  - Custom resource attributes

- **Action Context**:
  - Action name (e.g., "approve", "delete")
  - Action scope

- **Environment Context**:
  - Current time (or custom time)
  - Location
  - Request source
  - IP address

**Step 2: Run Evaluation**
- Click "Test Policy"
- View evaluation process step-by-step
- See which conditions matched/failed

**Step 3: View Results**
- **Outcome**: PERMIT or DENY with explanation
- **Evaluation Path**: Which conditions were checked
- **Condition Results**: Each condition's result with details
- **Evaluation Time**: Performance metrics
- **Recommendation**: Suggestions if result unexpected

#### Test Features:
- **Batch Testing**: Test multiple scenarios at once
- **Save Test Cases**: Save common test scenarios
- **Compare Results**: Test before/after policy changes
- **Export Results**: Export test results to CSV

---

## Data Model

```typescript
interface Policy {
  // Identity
  id: string;
  name: string;
  description: string;

  // Effect
  effect: EffectType; // 'permit' | 'deny'
  enabled: boolean;
  priority: number; // 0-1000

  // Targeting
  resources: ResourceSelector[];
  actions: ActionSelector[];
  subjects?: SubjectSelector[];
  conditions?: PolicyCondition[];

  // Classification
  category?: string;
  tags?: string[];
  version: number;

  // Schedule
  activeFrom?: Date;
  activeUntil?: Date;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;

  // Statistics
  evaluationCount: number;
  permitCount: number;
  denyCount: number;
  lastEvaluatedAt?: Date;
}

interface ResourceSelector {
  type: ResourceType;
  id?: string;
  pattern?: string; // Wildcard pattern
  attributes?: AttributeMatcher[];
}

interface ActionSelector {
  name: string; // 'read', 'write', 'approve', etc.
  scope?: ActionScope; // 'own', 'department', 'all'
}

interface SubjectSelector {
  type: 'user' | 'role' | 'department';
  id?: string;
  attributes?: AttributeMatcher[];
}

interface PolicyCondition {
  type: ConditionType;
  operator: ComparisonOperator;
  path?: string; // JSON path for attribute
  value: any;
  negate?: boolean; // Invert condition result
}

enum ConditionType {
  USER_ATTRIBUTE = 'user_attribute',
  RESOURCE_ATTRIBUTE = 'resource_attribute',
  CONTEXT_ATTRIBUTE = 'context_attribute',
  TIME_BASED = 'time_based',
  LOCATION_BASED = 'location_based',
  AMOUNT_BASED = 'amount_based',
  STATUS_BASED = 'status_based'
}

enum ComparisonOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'not_in',
  MATCHES = 'matches', // Regex
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists'
}

interface AttributeMatcher {
  path: string;
  operator: ComparisonOperator;
  value: any;
}
```

---

## Policy Evaluation Engine

### Evaluation Algorithm

```typescript
function evaluatePolicy(
  policy: Policy,
  context: EvaluationContext
): EvaluationResult {
  // Step 1: Check if policy is enabled
  if (!policy.enabled) {
    return { decision: 'not_applicable', reason: 'Policy disabled' };
  }

  // Step 2: Check schedule
  if (!isWithinSchedule(policy, context.timestamp)) {
    return { decision: 'not_applicable', reason: 'Outside active schedule' };
  }

  // Step 3: Match resources
  if (!matchesResources(policy.resources, context.resource)) {
    return { decision: 'not_applicable', reason: 'Resource not matched' };
  }

  // Step 4: Match actions
  if (!matchesActions(policy.actions, context.action)) {
    return { decision: 'not_applicable', reason: 'Action not matched' };
  }

  // Step 5: Match subjects (if defined)
  if (policy.subjects && !matchesSubjects(policy.subjects, context.user)) {
    return { decision: 'not_applicable', reason: 'Subject not matched' };
  }

  // Step 6: Evaluate conditions
  if (policy.conditions && !evaluateConditions(policy.conditions, context)) {
    return { decision: 'deny', reason: 'Conditions not met' };
  }

  // All checks passed
  return {
    decision: policy.effect === 'permit' ? 'permit' : 'deny',
    reason: `Policy ${policy.name} applied`,
    policyId: policy.id,
    priority: policy.priority
  };
}
```

### Priority-Based Resolution

When multiple policies match:

1. **Sort by Priority**: Highest priority first (1000 → 0)
2. **First Explicit Decision Wins**: First permit or deny ends evaluation
3. **Default Deny**: If no policies match, deny access
4. **Deny Overrides**: At same priority, deny overrides permit

### Condition Evaluation

All conditions in a policy must evaluate to `true` for the policy to apply (AND logic).

For OR logic between conditions, create multiple policies.

**Example**:
```typescript
// Policy: "Allow if (amount < 5000) AND (department = 'procurement')"
conditions: [
  { type: 'resource_attribute', path: 'amount', operator: 'lt', value: 5000 },
  { type: 'user_attribute', path: 'department', operator: 'eq', value: 'procurement' }
]
```

---

## Component Architecture

### PolicyList Component
**File:** `components/permissions/policy-manager/policy-list.tsx`

**Props**:
- `policyType`: 'rbac' | 'abac'
- `onPolicyTypeChange`: Callback for type toggle
- `onCreatePolicy`, `onEditPolicy`, `onViewPolicy`, `onTestPolicy`, `onClonePolicy`, `onToggleStatus`: Action callbacks

**Features**:
- Policy type toggle tabs
- Search and filtering
- Sortable table
- Quick actions menu
- Status toggle switches

### PolicyFiltersComponent
**File:** `components/permissions/policy-manager/policy-filters.tsx`

**Props**:
- `filters`: Current filter state
- `onFiltersChange`: Callback with new filters
- `onSavePreset`, `onLoadPreset`: Preset management
- `savedPresets`: Array of saved presets

**Features**:
- Advanced filter panel
- Filter presets
- Clear all filters
- Active filter badges

### PolicyBuilderWizard
**File:** `components/permissions/policy-builder-wizard.tsx`

**Props**:
- `open`: Dialog open state
- `onOpenChange`: Dialog state callback
- `policy`: Optional existing policy for editing
- `onSave`: Callback with policy data

**Features**:
- Multi-step wizard
- Step validation
- Progress indicator
- Back/Next navigation
- Save as draft
- Test before save

---

## API Integration

### Endpoints

#### GET /api/policies
```typescript
// List policies with filters
Query: {
  effect?: 'permit' | 'deny';
  status?: 'enabled' | 'disabled';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

Response: {
  policies: Policy[];
  total: number;
}
```

#### POST /api/policies
```typescript
// Create new policy
Body: {
  name: string;
  description?: string;
  effect: 'permit' | 'deny';
  priority: number;
  resources: ResourceSelector[];
  actions: ActionSelector[];
  subjects?: SubjectSelector[];
  conditions?: PolicyCondition[];
}

Response: Policy
```

#### GET /api/policies/:id
```typescript
// Get policy details
Response: {
  policy: Policy;
  evaluationStats: {
    totalEvaluations: number;
    permitRate: number;
    avgEvaluationTime: number;
  };
  impactAnalysis: {
    affectedUsers: number;
    affectedResources: number;
  };
}
```

#### PUT /api/policies/:id
```typescript
// Update policy
Body: Partial<Policy>
Response: Policy
```

#### DELETE /api/policies/:id
```typescript
// Delete policy
Response: 204 No Content
```

#### POST /api/policies/:id/test
```typescript
// Test policy evaluation
Body: {
  user: UserContext;
  resource: ResourceContext;
  action: string;
  context?: Record<string, any>;
}

Response: {
  result: 'permit' | 'deny' | 'not_applicable';
  reason: string;
  conditionResults: ConditionResult[];
  evaluationTime: number;
}
```

#### POST /api/policies/:id/clone
```typescript
// Clone existing policy
Body: {
  name: string; // New policy name
  modifications?: Partial<Policy>;
}

Response: Policy
```

---

## Business Rules

### Policy Creation

1. **Name Uniqueness**: Policy names must be unique within organization
2. **Priority Range**: Priority must be 0-1000
3. **Resource Requirement**: At least one resource must be targeted
4. **Action Requirement**: At least one action must be defined
5. **Condition Syntax**: All conditions must have valid operators and values

### Policy Evaluation

1. **Enable Check**: Only enabled policies are evaluated
2. **Schedule Check**: Policy must be within active date range
3. **Priority Order**: Policies evaluated highest priority first
4. **First Match Wins**: First explicit decision (permit/deny) is final
5. **Default Deny**: No match = deny access

### Policy Modification

1. **Impact Warning**: Warn when modifying active policies
2. **Test Required**: Encourage testing before enabling
3. **Version Control**: Track all policy changes
4. **Rollback Support**: Allow reverting to previous versions

### Conflict Detection

1. **Same Priority**: Warn when policies have same priority
2. **Contradictory Effects**: Highlight conflicting permit/deny on same resources
3. **Overlapping Conditions**: Detect policies that might overlap
4. **Dead Policies**: Identify policies that never match due to higher priority policies

---

## User Guide

### Creating a Simple Policy

**Scenario**: Allow procurement staff to create purchase requests

**Steps**:
1. Navigate to Policies → Simple Creator
2. Enter policy name: "Procurement Create PR"
3. Select effect: Permit
4. Set priority: 500
5. Who: Select role "Procurement Staff"
6. What: Select resource type "Purchase Request"
7. Actions: Select "create"
8. Review and save
9. Enable policy

### Creating an Advanced Policy

**Scenario**: Allow managers to approve orders under $5000

**Steps**:
1. Navigate to Policies → Advanced Builder
2. **Step 1**: Name "Manager Small Order Approval", Priority 600, Effect Permit
3. **Step 2**: Resource type "Purchase Order"
4. **Step 3**: Action "approve"
5. **Step 4**: Subject role "Department Manager"
6. **Step 5**: Add condition:
   - Type: Resource Attribute
   - Path: "totalAmount"
   - Operator: Less Than
   - Value: 5000
7. **Step 6**: Test with sample orders
8. **Step 7**: Save and enable

### Testing a Policy

1. Navigate to policy detail page
2. Click "Test Policy" button
3. Select test user (or define attributes)
4. Select test resource
5. Enter action to test
6. Click "Evaluate"
7. Review results and explanation
8. Adjust policy if needed

---

## Troubleshooting

### Issue: Policy not applying

**Symptoms**: Expected permit/deny not happening

**Solutions**:
- Check policy is enabled
- Verify priority (higher priority policies may override)
- Test policy with exact user/resource combination
- Check condition values match actual data
- Review evaluation logs for details

### Issue: Conflicting policies

**Symptoms**: Unexpected deny or permit results

**Solutions**:
- Check policy priorities
- Look for same-priority policies with different effects
- Use policy testing to identify which policy is applying
- Adjust priorities to resolve conflicts
- Consider combining into single policy

### Issue: Policy evaluation slow

**Symptoms**: Performance degradation

**Solutions**:
- Review condition complexity
- Check for excessive wildcard patterns
- Optimize attribute matching
- Consider caching policy results
- Review evaluation logs for bottlenecks

---

## Best Practices

### Policy Design

1. **Start Simple**: Use simple creator before advanced builder
2. **Test First**: Always test before enabling
3. **Clear Names**: Use descriptive policy names
4. **Document**: Add detailed descriptions
5. **Use Categories**: Organize policies by category
6. **Set Priorities**: Use priority ranges by category (e.g., 800-900 for security policies)

### Performance

1. **Minimize Conditions**: Fewer conditions = faster evaluation
2. **Specific Targeting**: Narrow resource/action targeting
3. **Avoid Wildcards**: Use specific IDs when possible
4. **Enable Caching**: Let system cache policy results
5. **Regular Cleanup**: Remove unused policies

### Security

1. **Default Deny**: Never rely on absence of deny policies
2. **Explicit Permits**: Always use explicit permit policies
3. **Audit Trail**: Enable evaluation logging for sensitive resources
4. **Regular Review**: Review policies quarterly
5. **Least Privilege**: Start restrictive, loosen as needed

---

## Screenshots

See [screenshots directory](./screenshots/) for visual examples.

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
