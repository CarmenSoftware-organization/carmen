# Roles Management

> **Feature:** Permission Management > Roles
> **Pages:** 4
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

The Roles Management sub-feature provides a comprehensive interface for creating, managing, and assigning user roles within Carmen ERP. Roles serve as containers for permissions, enabling administrators to group related permissions and assign them to users efficiently.

### Key Features

1. **Role Creation & Editing** - Define roles with custom permissions and hierarchy
2. **Hierarchical Structure** - Support parent-child role relationships with inheritance
3. **User Assignment** - Assign roles to users individually or in bulk
4. **Dual View Modes** - Switch between table and card views
5. **System Roles** - Pre-defined roles that cannot be modified
6. **Permission Inheritance** - Child roles automatically inherit parent permissions

---

## Page Structure

### 1. Role List Page
**Route:** `/system-administration/permission-management/roles`

#### Components:
- **Header Section**: Title, description, action buttons
- **View Toggle**: Switch between table and card views
- **Search & Filter**: Search by name, filter by department/hierarchy
- **Bulk Actions**: Export, delete multiple roles
- **Action Buttons**: Create Role, Settings

#### Features:
- Sortable columns (name, hierarchy, users, created date)
- Quick actions menu for each role
- User count indicators
- System role badges
- Status indicators

#### User Actions:
- **Create**: Opens role creation form
- **View**: Navigate to role detail page
- **Edit**: Opens role edit form
- **Duplicate**: Clone existing role
- **Assign Users**: Open user assignment dialog
- **Delete**: Remove role (with confirmation)
- **Export**: Export selected roles to CSV/Excel

### 2. Create Role Page
**Route:** `/system-administration/permission-management/roles/new`

#### Form Fields:
- **Basic Information**
  - Name (required)
  - Description (optional)
  - Department (optional)

- **Hierarchy**
  - Hierarchy Level (0-100, required)
  - Parent Roles (multi-select, optional)

- **Permissions**
  - Permission Categories (expandable tree)
  - Individual Permissions (checkboxes)
  - Search Permissions (filter)

- **Advanced**
  - System Role (checkbox, admin only)
  - Active Status (toggle)

#### Validation Rules:
- Name must be unique
- Hierarchy level cannot be higher than current user's role
- Parent roles must have higher hierarchy
- At least one permission must be selected
- Cannot create circular hierarchy

#### User Workflow:
1. Fill basic information
2. Set hierarchy level
3. Select parent roles (optional)
4. Choose permissions from tree
5. Review and save
6. Confirmation message with role ID

### 3. Role Detail Page
**Route:** `/system-administration/permission-management/roles/[id]`

#### Sections:
- **Role Overview**
  - Name, description, status
  - Hierarchy level indicator
  - Created/updated metadata
  - Edit button

- **Statistics Cards**
  - User Count
  - Permission Count
  - Parent Roles Count
  - Inheritance Depth

- **Permissions List**
  - Grouped by category
  - Inherited permissions marked
  - Source role for inherited permissions

- **Assigned Users**
  - Table of users with this role
  - Quick user actions
  - Bulk unassign

- **Activity Timeline**
  - Recent changes to role
  - User assignments/unassignments
  - Permission modifications

#### User Actions:
- Edit role details
- Assign/unassign users
- View permission details
- View role hierarchy
- Delete role

### 4. Edit Role Page
**Route:** `/system-administration/permission-management/roles/edit/[id]`

#### Features:
- Pre-populated form with existing role data
- Same validation as create form
- Change tracking (highlights modified fields)
- Version comparison (before/after)
- Audit trail of changes

#### Special Handling:
- **System Roles**: Read-only mode, no editing allowed
- **Active Roles**: Warning when modifying roles with users
- **Hierarchy Changes**: Validation to prevent circular dependencies
- **Permission Removal**: Warning when removing permissions that users rely on

---

## Data Model

```typescript
interface Role {
  // Identity
  id: string;
  name: string;
  description: string;

  // Hierarchy
  hierarchy: number; // 0-100
  parentRoles: string[]; // Parent role IDs

  // Permissions
  permissions: string[];
  inheritedPermissions?: string[]; // Computed

  // Classification
  type: 'system' | 'custom' | 'department';
  department?: string;
  location?: string;

  // Status
  isSystemRole: boolean;
  isActive: boolean;

  // Statistics
  userCount: number;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
```

---

## Component Architecture

### RoleDataTable Component
**File:** `components/permissions/role-manager/role-data-table.tsx`

**Purpose**: Displays roles in table format with sorting, filtering, and pagination

**Props**:
- `columns`: Column definitions
- `data`: Array of roles
- `viewMode`: 'table' | 'card'
- `onViewModeChange`: Callback for view mode toggle
- `cardView`: React node for card view

**Features**:
- Column sorting
- Multi-column filtering
- Row selection
- Pagination
- Bulk actions

### RoleCardView Component
**File:** `components/permissions/role-manager/role-card-view.tsx`

**Purpose**: Displays roles as cards with visual hierarchy indicators

**Props**:
- `data`: Array of roles
- `selectedItems`: Array of selected role IDs
- `onSelectItem`: Callback for item selection
- `onSelectAll`: Callback for select all
- `onView`, `onEdit`, `onDelete`, `onDuplicate`, `onAssignUsers`: Action callbacks

**Features**:
- Visual hierarchy representation
- User count badges
- System role indicators
- Quick action menu
- Multi-select mode

### RoleForm Component
**File:** `components/permissions/role-manager/role-form.tsx`

**Purpose**: Form for creating and editing roles

**Props**:
- `role`: Optional existing role for editing
- `onSave`: Callback with form data
- `onCancel`: Callback for cancellation
- `isLoading`: Loading state

**Features**:
- React Hook Form integration
- Zod validation
- Permission tree selector
- Parent role multi-select
- Real-time validation
- Auto-save draft

---

## State Management

### useRoleStore (Zustand)

```typescript
interface RoleStore {
  // State
  roles: Role[];
  selectedRole: Role | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoles: () => Promise<void>;
  addRole: (data: RoleFormData) => Role;
  updateRole: (id: string, data: Partial<Role>) => boolean;
  deleteRole: (id: string) => boolean;
  getRole: (id: string) => Role | undefined;
  assignUsers: (roleId: string, userIds: string[]) => Promise<void>;

  // Computed
  getEffectivePermissions: (roleId: string) => string[];
  getRoleHierarchy: (roleId: string) => Role[];
}
```

**Store Location:** `lib/stores/role-store.ts`

**Persistence**: LocalStorage (key: 'carmen-roles')

---

## API Integration

### Endpoints

#### GET /api/roles
List all roles with optional filters

**Query Parameters**:
- `department`: Filter by department
- `hierarchy`: Filter by hierarchy level
- `type`: Filter by role type
- `search`: Search term
- `limit`, `offset`: Pagination

**Response**:
```json
{
  "roles": Role[],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### POST /api/roles
Create a new role

**Request Body**:
```json
{
  "name": "Department Manager",
  "description": "Manages department operations",
  "hierarchy": 50,
  "permissions": ["view_users", "manage_inventory"],
  "parentRoles": ["staff"],
  "department": "procurement"
}
```

**Response**: `201 Created` with created role

#### GET /api/roles/:id
Get role details including effective permissions

**Response**:
```json
{
  "role": Role,
  "users": User[],
  "effectivePermissions": string[]
}
```

#### PUT /api/roles/:id
Update role details

**Request Body**: Partial<Role>

**Response**: `200 OK` with updated role

#### DELETE /api/roles/:id
Delete a role

**Query Parameters**:
- `force`: boolean - Force delete even if users assigned

**Response**: `204 No Content`

#### POST /api/roles/:id/assign
Assign users to role

**Request Body**:
```json
{
  "userIds": ["user1", "user2"]
}
```

**Response**:
```json
{
  "assigned": 2,
  "failed": 0,
  "errors": []
}
```

---

## Business Rules

### Role Creation

1. **Name Uniqueness**: Role names must be unique within organization
2. **Hierarchy Constraint**: User can only create roles with hierarchy ≤ own hierarchy - 10
3. **Parent Role Validation**: Parent roles must have hierarchy > child role
4. **Permission Requirement**: At least one permission must be assigned
5. **System Role Restriction**: Only super admins can create system roles

### Role Modification

1. **System Role Protection**: System roles cannot be edited or deleted
2. **Active Role Warning**: Warn when modifying roles with assigned users
3. **Hierarchy Change Validation**: Cannot create circular dependencies
4. **Permission Removal Impact**: Show users affected by permission removal

### Role Assignment

1. **Department Scope**: Users can only assign roles within their department
2. **Hierarchy Enforcement**: Users can only assign roles with hierarchy ≤ own hierarchy
3. **Multi-Role Support**: Users can have multiple roles (permissions aggregate)
4. **Conflict Detection**: Warn if role assignments create permission conflicts

### Permission Inheritance

1. **Automatic Inheritance**: Child roles inherit all parent permissions
2. **Transitive Inheritance**: Inheritance follows full hierarchy chain
3. **No Duplicate**: Inherited permissions don't duplicate direct permissions
4. **Real-time Update**: Permission changes propagate immediately

---

## User Guide

### Creating a Role

**Step 1: Navigate to Roles**
- Go to System Administration → Permission Management → Roles
- Click "Create Role" button

**Step 2: Fill Basic Information**
- Enter unique role name
- Add descriptive text
- Select department (optional)

**Step 3: Set Hierarchy**
- Choose hierarchy level (0-100)
- Higher number = more privileged
- Must be lower than your own role

**Step 4: Select Parent Roles** (Optional)
- Choose roles to inherit permissions from
- Parent roles must have higher hierarchy
- Can select multiple parents

**Step 5: Assign Permissions**
- Browse permission categories
- Check desired permissions
- Use search to find specific permissions
- Inherited permissions shown as read-only

**Step 6: Review and Save**
- Review all settings
- Click "Create Role"
- Confirmation message appears

### Editing a Role

1. Navigate to Roles list
2. Find role to edit
3. Click Edit action
4. Modify fields as needed
5. Save changes

**Note**: Cannot edit system roles

### Assigning Users to Role

**Method 1: From Role Detail**
1. Navigate to role detail page
2. Click "Assign Users" button
3. Search for users
4. Select users to assign
5. Click "Assign"

**Method 2: From Role List**
1. Click role action menu
2. Select "Assign Users"
3. Follow assignment dialog

---

## Troubleshooting

### Issue: Cannot create role

**Symptoms**: Create button disabled or error on save

**Solutions**:
- Check if you have `manage_roles` permission
- Verify hierarchy level is valid
- Ensure role name is unique
- Check for required fields

### Issue: Permission not taking effect

**Symptoms**: User doesn't have expected permissions

**Solutions**:
- Clear user session and re-login
- Verify role is assigned to user
- Check role is active
- Review permission inheritance chain

### Issue: Circular dependency error

**Symptoms**: Cannot save role with parent selection

**Solutions**:
- Check parent role hierarchy
- Remove circular parent selections
- Verify inheritance chain

### Issue: Cannot delete role

**Symptoms**: Delete action fails or disabled

**Solutions**:
- Check if role is assigned to users (unassign first)
- Verify role is not a system role
- Ensure you have delete permission
- Use force delete flag if necessary

---

## Screenshots

See [screenshots directory](./screenshots/) for visual examples.

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
