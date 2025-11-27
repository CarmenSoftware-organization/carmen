# Workflow Management

> **Feature:** System Administration > Workflow
> **Pages:** 4
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

Workflow Management provides comprehensive approval workflow configuration for Carmen ERP, enabling organizations to define multi-step approval processes for purchase requests, orders, inventory adjustments, and other business transactions.

### Key Features

1. **Workflow Configuration** - Define multi-stage approval workflows
2. **Role Assignment** - Assign approval roles to workflow stages
3. **Conditional Routing** - Route approvals based on conditions
4. **Escalation Rules** - Auto-escalate overdue approvals
5. **Notification Settings** - Configure approval notifications
6. **Template Library** - Pre-built workflow templates

---

## Page Structure

### 1. Workflow Home
**Route:** `/system-administration/workflow`

Dashboard showing:
- Active workflows count
- Pending approvals
- Quick access to configuration
- Quick access to role assignment

### 2. Workflow Configuration
**Route:** `/system-administration/workflow/workflow-configuration`

#### Features:
- Workflow list (table/card view)
- Create new workflow
- Edit existing workflows
- Enable/disable workflows
- Workflow templates

#### Workflow List Columns:
- Name
- Type (Purchase Request, Purchase Order, etc.)
- Stages Count
- Active Status
- Actions

### 3. Workflow Detail/Edit
**Route:** `/system-administration/workflow/workflow-configuration/[id]`

#### Configuration Tabs:

**General Settings**
- Workflow Name
- Workflow Type
- Description
- Active Status

**Stages Configuration**
- Stage Name
- Sequence Order
- Required Approvers Count
- Timeout (hours)
- Auto-escalate

**Routing Rules**
- Condition-based routing
- Amount thresholds
- Department-specific routing
- Role-based routing

**Notifications**
- Email notifications
- Slack/Teams integration
- Notification templates
- Escalation notifications

**Products/Filters** (Optional)
- Apply workflow to specific products
- Apply to specific categories
- Apply to specific vendors

### 4. Role Assignment
**Route:** `/system-administration/workflow/role-assignment`

#### Features:
- Assign roles to workflow stages
- Assign users to approval roles
- Department-specific assignments
- Hierarchy-based assignments

#### Configuration Panel:
- Select Workflow
- Select Stage
- Assign Roles
- Assign Users
- Set Department Scope

---

## Data Model

```typescript
interface Workflow {
  id: string;
  name: string;
  type: WorkflowType;
  description?: string;
  isActive: boolean;

  stages: WorkflowStage[];
  routing: RoutingRule[];
  notifications: NotificationSettings;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStage {
  id: string;
  name: string;
  sequence: number;
  requiredApprovers: number; // Minimum approvers needed
  timeout: number; // Hours before escalation
  escalateTo?: string; // User/Role ID
  roles: string[]; // Role IDs that can approve
}

interface RoutingRule {
  condition: string; // e.g., "amount > 5000"
  targetStage: string;
}

enum WorkflowType {
  PURCHASE_REQUEST = 'Purchase Request',
  PURCHASE_ORDER = 'Purchase Order',
  INVENTORY_ADJUSTMENT = 'Inventory Adjustment',
  TRANSFER = 'Transfer',
  PRODUCTION_ORDER = 'Production Order',
  CREDIT_NOTE = 'Credit Note'
}
```

---

## Business Rules

1. **Sequential Approval**: Stages must be approved in sequence
2. **Minimum Approvers**: Each stage requires minimum number of approvals
3. **Timeout Escalation**: Auto-escalate after timeout period
4. **Role Validation**: Only assigned roles can approve
5. **Withdrawal**: Requester can withdraw before first approval

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
