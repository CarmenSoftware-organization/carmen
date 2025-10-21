# Permission Management

> **Status:** ✅ Production Ready
> **Module:** System Administration
> **Pages:** 12
> **Last Updated:** 2025-01-17

---

## Overview

The Permission Management feature provides a comprehensive access control system for Carmen ERP using a hybrid approach combining **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)**. This dual-strategy system offers both simplicity and granular control for managing user permissions across all ERP modules.

### Key Capabilities

1. **Advanced Policy Management** - Create fine-grained access policies using ABAC
2. **Role Management** - Define and manage user roles with hierarchical structures
3. **Subscription Management** - Control feature access through subscription tiers
4. **Visual Policy Builder** - User-friendly wizard for creating complex policies
5. **Real-time Enforcement** - Immediate policy evaluation and access control
6. **Audit Trail** - Comprehensive logging of all permission changes

### Who Uses This Feature

- **System Administrators**: Configure and manage the entire permission system
- **Security Officers**: Define security policies and monitor access
- **Department Managers**: Manage roles and permissions within their departments
- **Compliance Officers**: Monitor and enforce access control policies

---

## Feature Architecture

### System Components

```
Permission Management
├── Policies (ABAC)
│   ├── Policy List
│   ├── Policy Builder (Visual Wizard)
│   ├── Policy Editor (Advanced)
│   ├── Policy Testing
│   └── Simple Policy Creator
├── Roles (RBAC)
│   ├── Role List
│   ├── Role Form (Create/Edit)
│   ├── Role Detail View
│   └── User Assignment
└── Subscriptions
    ├── Package Selection
    ├── Resource Activation
    ├── Billing & Payment
    └── Usage Analytics
```

### Navigation Hierarchy

**Main Route:** `/system-administration/permission-management`

#### Sub-Routes:
- **Policies**: `/permission-management/policies`
  - List View: `/policies`
  - Simple Creator: `/policies/simple`
  - Advanced Builder: `/policies/builder`
  - Policy Demo: `/policies/demo`
  - Policy Detail: `/policies/[id]`
  - Policy Edit: `/policies/[id]/edit`

- **Roles**: `/permission-management/roles`
  - List View: `/roles`
  - Create Role: `/roles/new`
  - Role Detail: `/roles/[id]`
  - Role Edit: `/roles/edit/[id]`

- **Subscriptions**: `/permission-management/subscription`
  - Package View: `/subscription` (default)
  - Multiple Subscriptions: `/subscriptions`

---

## Core Functionality

### 1. Policy Management (ABAC)

**Purpose**: Fine-grained access control using attributes and conditions

#### Features:
- **Visual Policy Builder**: Step-by-step wizard for creating complex policies
- **Policy Types**: Support for both RBAC-based and attribute-based policies
- **Priority System**: Policies evaluated based on configurable priority levels (0-1000)
- **Effect Types**: `Permit`, `Deny`, `Conditional Permit`
- **Resource Targeting**: Policies can target specific resources, actions, and conditions
- **Advanced Filters**: Filter by effect, status, resource type, priority, and date range

#### Policy Components:
```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  effect: 'permit' | 'deny';
  enabled: boolean;
  priority: number;
  resources: ResourceSelector[];
  actions: string[];
  conditions?: PolicyCondition[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### User Workflows:
1. **Create Policy**: Policies → New Policy → Policy Builder Wizard → Review → Save
2. **Edit Policy**: Policies → Select Policy → Edit → Modify → Save
3. **Test Policy**: Policies → Select Policy → Test → Enter Test Parameters → View Results
4. **Clone Policy**: Policies → Select Policy → Clone → Modify → Save
5. **Toggle Status**: Policies → Select Policy → Enable/Disable

### 2. Role Management (RBAC)

**Purpose**: Organize permissions into reusable role templates

#### Features:
- **Hierarchical Roles**: Parent-child role relationships with permission inheritance
- **Permission Assignment**: Attach multiple permissions to a single role
- **User Assignment**: Assign roles to users individually or in bulk
- **Role Templates**: Pre-defined role templates for common positions
- **Bulk Operations**: Export, import, and bulk delete roles
- **View Modes**: Toggle between table and card views

#### Role Components:
```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  hierarchy: number;
  permissions: string[];
  parentRoles?: string[];
  isSystemRole: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### User Workflows:
1. **Create Role**: Roles → Create Role → Fill Form → Add Permissions → Save
2. **Edit Role**: Roles → Select Role → Edit → Modify → Save
3. **View Role**: Roles → Select Role → View Details
4. **Assign Users**: Roles → Select Role → Assign Users → Select Users → Save
5. **Duplicate Role**: Roles → Select Role → Duplicate → Modify → Save

### 3. Subscription Management

**Purpose**: Control feature access based on subscription tiers

#### Features:
- **Package Selector**: Browse and compare subscription packages
- **Resource Activation**: Enable/disable specific features within subscription limits
- **Billing Management**: Manage payment methods and billing information
- **Usage Analytics**: Monitor resource usage and quota consumption
- **Package Comparison**: Side-by-side comparison of subscription tiers

#### Subscription Components:
```typescript
interface Subscription {
  id: string;
  packageType: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  resources: ResourceLimits;
  usage: ResourceUsage;
  billingInfo: BillingInformation;
  startDate: Date;
  renewalDate: Date;
}
```

#### User Workflows:
1. **Select Package**: Subscription → Packages → Compare → Select → Confirm
2. **Manage Resources**: Subscription → Resources → Toggle Features → Set Limits → Save
3. **Update Billing**: Subscription → Billing → Update Payment Method → Save
4. **View Analytics**: Subscription → Analytics → Select Date Range → Export Data

---

## User Interface

### Main Landing Page

**Route:** `/system-administration/permission-management`

#### Components:
- **Page Header**: Title, description, and icon
- **Tab Navigation**: Three main tabs (Policies, Roles, Subscription)
- **Tab Content**: Dynamic content based on active tab

#### Layout:
```
┌─────────────────────────────────────────────────────┐
│ 🛡️ Permission Management                            │
│ Comprehensive access control system...              │
│                                                     │
│ [Policies] [Roles] [Subscription]                  │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │                                             │   │
│ │         Active Tab Content                  │   │
│ │                                             │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Policy Management View

#### Features:
- **Search & Filter Bar**: Quick search with advanced filtering
- **Policy Type Toggle**: Switch between RBAC and ABAC policies
- **Action Buttons**: New Policy (Simple/Advanced), Filters
- **Policy List**: Table view with columns for name, effect, status, priority
- **Policy Cards**: Visual cards with key information and quick actions

#### Actions:
- View Policy Details
- Edit Policy
- Test Policy
- Clone Policy
- Toggle Enable/Disable
- Delete Policy

### Role Management View

#### Features:
- **View Mode Toggle**: Switch between table and card views
- **Search & Sort**: Search roles by name, sort by hierarchy
- **Action Buttons**: Create Role, Settings
- **Role List/Cards**: Display roles with key metrics
- **Quick Actions**: View, Edit, Assign Users, Duplicate, Delete

#### Data Display:
- Role Name & Description
- Hierarchy Level
- Permission Count
- User Count
- Creation Date
- Status Badge

### Subscription Management View

#### Tabs:
1. **Packages**: Compare and select subscription packages
2. **Resources**: Activate/deactivate features and set limits
3. **Billing**: Manage payment methods and view invoices
4. **Analytics**: View usage statistics and trends

#### Features:
- Package Comparison Cards
- Resource Toggle Switches
- Usage Progress Bars
- Billing Information Forms
- Usage Charts & Graphs

---

## Technical Details

### Components Used

#### UI Components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button`, `Badge`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Dialog`, `DialogContent`, `Sheet`, `SheetContent`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`
- `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`

#### Custom Components:
- `PolicyList` - Displays list of policies with filtering
- `PolicyFiltersComponent` - Advanced filtering interface
- `PolicyBuilderWizard` - Visual policy creation wizard
- `RoleList` - Displays role list/cards with actions
- `RoleForm` - Create/edit role form with validation
- `RoleDataTable` - Table view for roles
- `RoleCardView` - Card view for roles
- `PackageSelector` - Subscription package selection
- `ResourceActivation` - Feature activation interface
- `BillingPaymentInfo` - Billing management
- `UsageAnalytics` - Usage statistics and charts

### State Management

#### Zustand Stores:
- `useRoleStore`: Manages role data and operations
  - `roles`: Array of roles
  - `addRole(data)`: Create new role
  - `updateRole(id, data)`: Update existing role
  - `getRole(id)`: Retrieve role by ID
  - `deleteRole(id)`: Delete role

#### Local State:
- `useState` for component-level state
- View mode toggles (table/card)
- Dialog open/close states
- Filter states
- Selected items

### Data Models

#### Policy Type:
```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  effect: 'permit' | 'deny';
  enabled: boolean;
  priority: number;
  resources: ResourceSelector[];
  actions: string[];
  conditions?: PolicyCondition[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Role Type:
```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  hierarchy: number;
  permissions: string[];
  parentRoles?: string[];
  isSystemRole: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Subscription Type:
```typescript
interface Subscription {
  id: string;
  packageType: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  resources: ResourceLimits;
  usage: ResourceUsage;
  billingInfo: BillingInformation;
  startDate: Date;
  renewalDate: Date;
}
```

### API Endpoints

#### Policies:
- `GET /api/policies` - List all policies
- `POST /api/policies` - Create new policy
- `GET /api/policies/:id` - Get policy details
- `PUT /api/policies/:id` - Update policy
- `DELETE /api/policies/:id` - Delete policy
- `POST /api/policies/:id/test` - Test policy evaluation

#### Roles:
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/:id` - Get role details
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/assign` - Assign users to role

#### Subscriptions:
- `GET /api/subscriptions` - Get subscription details
- `PUT /api/subscriptions/package` - Update package
- `POST /api/subscriptions/resources` - Toggle resource
- `PUT /api/subscriptions/billing` - Update billing info

---

## Business Rules

### Policy Evaluation

1. **Priority-Based Evaluation**: Policies evaluated in order of priority (highest first)
2. **Default Deny**: If no policy matches, access is denied by default
3. **Explicit Deny Wins**: Deny policies override permit policies of equal priority
4. **Condition Evaluation**: All conditions must be true for policy to apply
5. **Resource Matching**: Supports wildcards and pattern matching for resource targeting

### Role Hierarchy

1. **Inheritance**: Child roles inherit all permissions from parent roles
2. **Hierarchy Levels**: Higher hierarchy can manage lower hierarchy roles
3. **System Roles**: Cannot be deleted or modified (read-only)
4. **Permission Aggregation**: Users receive combined permissions from all assigned roles

### Subscription Limits

1. **Feature Gating**: Features disabled when subscription limits exceeded
2. **Soft Limits**: Warning notifications when approaching limits
3. **Hard Limits**: Features automatically disabled when limits reached
4. **Grace Period**: 7-day grace period for billing failures before suspension

---

## Security Considerations

### Authentication & Authorization

- All permission management operations require `manage_permissions` permission
- Policy testing requires `test_policies` permission
- Role assignment requires `assign_roles` permission
- Subscription management requires `manage_subscriptions` permission

### Audit Logging

All permission changes are logged with:
- User who made the change
- Timestamp of change
- Old value vs. new value
- Reason for change (optional)
- IP address of requester

### Data Validation

- Policy names must be unique
- Role hierarchy must not create circular dependencies
- Permission strings must match defined resource patterns
- Subscription changes validated against billing status

---

## User Guide

### Creating a Policy

**Step 1**: Navigate to Permission Management → Policies

**Step 2**: Click "New Policy" → Select creation method:
- **Simple Creator**: For basic allow/deny rules
- **Advanced Builder**: For complex attribute-based policies

**Step 3**: Fill in policy details:
- Name (required)
- Description (optional)
- Effect (Permit/Deny)
- Priority (0-1000)

**Step 4**: Define resource targeting:
- Select resource types
- Specify resource IDs or patterns
- Add conditions (optional)

**Step 5**: Review and save

### Managing Roles

**Creating a Role**:
1. Navigate to Roles → Create Role
2. Enter role name and description
3. Set hierarchy level
4. Select permissions from list
5. Choose parent roles (optional)
6. Save role

**Assigning Users**:
1. Navigate to Roles
2. Select role → Assign Users
3. Search and select users
4. Confirm assignment

### Managing Subscriptions

**Upgrading Package**:
1. Navigate to Subscription → Packages
2. Compare available packages
3. Select desired package
4. Review changes and costs
5. Confirm upgrade

**Managing Resources**:
1. Navigate to Subscription → Resources
2. Toggle features on/off
3. Adjust resource limits
4. Save changes

---

## Screenshots

See [screenshots directory](./screenshots/) for visual examples of:
- Permission Management dashboard
- Policy list view
- Policy builder wizard
- Role management interface
- Subscription package comparison
- Usage analytics dashboard

---

## Related Documentation

- [Roles Management](./sub-features/roles/README.md) - Detailed role management guide
- [Policies Management](./sub-features/policies/README.md) - ABAC policy creation guide
- [Subscriptions Management](./sub-features/subscriptions/README.md) - Subscription management guide
- [Permission Management API](../../06-api-reference/permission-api.md) - API reference
- [Security Best Practices](../../technical/security.md) - Security guidelines

---

## Troubleshooting

### Common Issues

**Issue**: Policy not applying
- **Solution**: Check policy priority and ensure it's enabled
- **Check**: Verify conditions are being met
- **Test**: Use policy testing feature to simulate evaluation

**Issue**: Role permissions not taking effect
- **Solution**: Clear user session and re-login
- **Check**: Verify role is assigned to user
- **Test**: Check role hierarchy for conflicts

**Issue**: Subscription features not activating
- **Solution**: Verify billing status is active
- **Check**: Ensure subscription renewal date is valid
- **Test**: Check usage limits haven't been exceeded

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
**Status:** Production Ready
