# Department Management

> **Feature:** Finance > Department Management
> **Pages:** 1
> **Status:** ✅ Production Ready

---

## Overview

Department Management provides organizational structure configuration for Carmen ERP, enabling cost center tracking, departmental hierarchy, budget allocation, and expense categorization. This feature integrates with Account Code Mapping to ensure proper GL account assignment by department.

### Key Capabilities

1. **Department CRUD** - Create, edit, and manage departments
2. **Head of Department** - Assign multiple department heads
3. **Account Code Linking** - Link departments to default GL accounts
4. **Active Status Management** - Enable/disable departments
5. **Search & Filter** - Quick department lookup

---

## Page Structure

**Route:** `/finance/department-list`

---

## Data Model

```typescript
interface Department {
  // Identity
  code: string; // Department code (2-4 characters)
  name: string; // Department name/description

  // Leadership
  heads: string[]; // Array of email addresses for department heads

  // User Assignment
  assignedUsers?: string[]; // Array of user IDs assigned to this department

  // Financial
  accountCode: string; // Default GL account code for department expenses
  costCenter?: string; // Cost center code
  budget?: Money; // Annual or period budget

  // Configuration
  active: boolean; // Is department active?

  // Hierarchy
  parentDepartment?: string; // Parent department code
  level?: number; // Hierarchy level (1 = top level)

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

// Example Departments
const departments: Department[] = [
  {
    code: "AC",
    name: "Finance / Accounting",
    heads: ["finance.head@example.com"],
    accountCode: "1",
    active: true
  },
  {
    code: "AD",
    name: "Administrator",
    heads: ["admin1@example.com", "admin2@example.com"],
    accountCode: "",
    active: true
  },
  {
    code: "FB",
    name: "Food and Beverage",
    heads: ["fb.manager@example.com"],
    accountCode: "",
    active: false
  },
  {
    code: "HR",
    name: "Human Resources",
    heads: ["hr.director@example.com"],
    accountCode: "",
    active: true
  }
];
```

---

## Features & Functionality

### 1. Department List View

**Columns:**
- **Code**: Department code (badge display)
- **Name**: Full department name
- **Head of Department**: Email(s) of department head(s)
- **Account Code**: Linked GL account
- **Active**: Status checkbox (display only)
- **Actions**: Edit/Delete buttons

**Features:**
- Sortable columns
- Search by code or name
- Real-time filtering
- Responsive table design
- Badge styling for codes

### 2. Department Creation/Edit Form

**Form Fields:**

**Basic Information:**
- **Code** (required): 2-4 character unique code
- **Name** (required): Full department name
- **Account Code** (optional): Default GL account
- **Active**: Checkbox for status

**Department Heads:**
- List of assigned heads (email addresses)
- Add new head (email input + Add button)
- Remove existing head (Remove button per entry)
- Multiple heads supported

**User Assignment:**
- Enhanced dual-panel interface for assigning users to department
- Visual hierarchy showing user avatar, name, role, and current departments
- Three-column layout with chevron buttons for assignment/removal
- Search and filter capabilities
- Select All functionality for bulk operations

**Form Actions:**
- Save: Create or update department
- Cancel: Close without saving

### 2.1. Enhanced User Assignment Interface

**Overview:**
The department edit form includes an enhanced user assignment component that provides a visual, intuitive way to manage which users are assigned to each department.

**Interface Layout:**
```
┌────────────────────────────────────────────────────┐
│  Assigned Users        [<] [>]    Available Users  │
│  ┌─────────────────┐           ┌─────────────────┐│
│  │ 🔵 John Smith   │           │ 🟢 Jane Doe     ││
│  │ 📋 Manager      │           │ 📋 Staff        ││
│  │ 🏢 Finance      │           │ 🏢 Operations   ││
│  └─────────────────┘           └─────────────────┘│
└────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Visual Hierarchy:**
   - **Color-coded avatar**: Shows user initials on colored background (7 color variations)
   - **Name**: Prominent display of user's full name
   - **Role/Position**: Secondary display with briefcase icon
   - **Department**: Current department assignment with building icon
   - **Additional departments**: Badge display for users in multiple departments

2. **Three-Column Layout:**
   - **Left Panel**: "Assigned Users" - Users currently assigned to this department
   - **Center**: Action buttons with chevron icons
   - **Right Panel**: "Available Users" - Users not yet assigned to this department

3. **Assignment Actions:**
   - **ChevronLeft (←)**: Move selected users from Available to Assigned
   - **ChevronRight (→)**: Remove selected users from Assigned to Available
   - **Buttons disabled** when no users are selected

4. **Search & Filter:**
   - Search by user name or email in both panels
   - Real-time filtering as you type
   - Independent search for each panel

5. **Bulk Selection:**
   - **Select All checkbox** in each panel header
   - Select individual users with checkboxes
   - Visual feedback for selected users (blue highlight)

6. **Panel Features:**
   - Equal height panels (384px) with scrolling
   - Empty state messages when no data
   - User count display
   - Hover states for better UX

**User Experience:**
1. Search for users in either panel
2. Select one or more users using checkboxes
3. Use Select All to select all visible users
4. Click chevron button to assign/remove selected users
5. Changes saved when form is submitted

### 3. Search Functionality

**Search Features:**
- Search icon indicator
- Real-time filtering
- Search across:
  - Department code
  - Department name
- Case-insensitive matching
- Clear search capability

### 4. Department Operations

**Create Department:**
1. Click "New Department" button
2. Fill in department code
3. Enter department name
4. Add account code (optional)
5. Set active status
6. Add department head(s)
7. Save

**Edit Department:**
1. Click Edit icon in Actions column
2. Modify fields as needed
3. Add/remove department heads
4. Save changes

**Delete Department:**
1. Click Delete icon in Actions column
2. Confirm deletion
3. Department removed (if no dependencies)

---

## Business Rules

### Department Validation

1. **Unique Code**: Department codes must be unique across organization
2. **Code Format**: 2-4 uppercase alphanumeric characters
3. **Name Required**: Department name is mandatory
4. **Head Email Validation**: Email addresses must be valid format
5. **Delete Protection**: Cannot delete department with:
   - Active transactions
   - Assigned employees
   - Child departments (if hierarchy enabled)

### Department Configuration

1. **Active Status**: Only active departments available for new transactions
2. **Default Account**: Optional default GL account for department expenses
3. **Multiple Heads**: Departments can have multiple heads
4. **Head Notifications**: Department heads receive relevant notifications

### Hierarchy Rules (If Implemented)

1. **Parent Department**: Can assign parent for hierarchy
2. **Circular Prevention**: Cannot create circular hierarchy
3. **Level Calculation**: Automatic level calculation based on parents
4. **Rollup**: Budget/expenses can roll up to parent departments

---

## Integration Points

### Account Code Mapping

**Department → GL Account:**
```
Department Code → Default Account Code → GL Posting
```

**Mapping Priority:**
```
1. Specific category/item mapping
2. Department default account
3. Store default account
```

### User Management

**Department Assignment:**
- Users assigned to primary department
- Secondary department assignments
- Department-based permissions
- Department head role assignment

### Expense Tracking

**Department Expenses:**
```
Purchase Order → Department Code → Budget Tracking
Vendor Invoice → Department → Cost Center Posting
```

### Budget Management

**Budget Allocation:**
- Annual budget per department
- Periodic budget (monthly/quarterly)
- Budget vs. actual tracking
- Variance reporting

### Reporting

**Department Reports:**
- Expense by department
- Budget variance by department
- Headcount by department
- Performance metrics by department

---

## API Endpoints

```http
# Department Management
GET /api/finance/departments
POST /api/finance/departments
GET /api/finance/departments/:code
PUT /api/finance/departments/:code
DELETE /api/finance/departments/:code

# Department Hierarchy
GET /api/finance/departments/hierarchy
GET /api/finance/departments/:code/children
GET /api/finance/departments/:code/parent

# Department Heads
POST /api/finance/departments/:code/heads
DELETE /api/finance/departments/:code/heads/:email

# Department Budget
GET /api/finance/departments/:code/budget
PUT /api/finance/departments/:code/budget

# Department Reporting
GET /api/finance/departments/:code/expenses
GET /api/finance/departments/:code/budget-variance
```

---

## User Guide

### Creating a New Department

1. Navigate to Department List
2. Click "New Department" button
3. Enter department code (e.g., "IT")
4. Enter department name (e.g., "Information Technology")
5. (Optional) Enter account code
6. Check "Active" if department should be active
7. Add department head email(s):
   - Enter email in input field
   - Click "Add" button
   - Repeat for multiple heads
8. Click "Save"

### Editing an Existing Department

1. Find department in list (use search if needed)
2. Click Edit icon in Actions column
3. Modify desired fields
4. To change heads:
   - Click "Remove" next to existing heads to delete
   - Add new heads using email input and "Add" button
5. Click "Save" to apply changes
6. Click "Cancel" to discard changes

### Deleting a Department

1. Find department in list
2. Click Delete icon in Actions column
3. Confirm deletion in dialog
4. Department will be deleted if no dependencies exist

**Note:** Cannot delete departments with:
- Active transactions
- Assigned users
- Budget allocations
- Child departments

### Searching for Departments

1. Use search box at top of page
2. Type department code or name
3. List filters automatically as you type
4. Clear search to show all departments

---

## Troubleshooting

### Issue: Cannot Delete Department
**Cause**: Department has dependencies (transactions, users, budgets)
**Solution**: Deactivate department instead or reassign dependencies first

### Issue: Duplicate Department Code
**Cause**: Code already exists in system
**Solution**: Use a different code or edit existing department

### Issue: Head Email Not Saving
**Cause**: Invalid email format
**Solution**: Verify email format is valid (user@domain.com)

### Issue: Department Not Appearing in Dropdowns
**Cause**: Department is inactive
**Solution**: Edit department and set Active status to checked

---

## Best Practices

### Department Design

1. **Meaningful Codes**: Use intuitive 2-4 character codes
2. **Consistent Naming**: Follow naming conventions
3. **Active Management**: Deactivate unused departments instead of deleting
4. **Documentation**: Maintain department descriptions
5. **Hierarchy Planning**: Plan department structure before creating

### Department Heads

1. **Multiple Heads**: Assign backup/secondary heads for coverage
2. **Email Accuracy**: Verify email addresses are correct
3. **Role Alignment**: Ensure heads have appropriate system permissions
4. **Notification Setup**: Configure notifications for department heads
5. **Regular Review**: Review and update head assignments quarterly

### Account Code Integration

1. **Default Accounts**: Set default accounts for departments
2. **Expense Categories**: Map common expense categories to departments
3. **Budget Alignment**: Align account codes with budget structure
4. **GL Reconciliation**: Regular reconciliation of department expenses
5. **Cost Center Mapping**: Map departments to GL cost centers

### Data Quality

1. **Regular Audit**: Review department list quarterly
2. **Inactive Cleanup**: Deactivate unused departments
3. **Head Validation**: Verify department heads are current
4. **Account Updates**: Update account codes as GL changes
5. **Budget Maintenance**: Keep budget allocations current

---

## Reporting

### Available Reports

1. **Department List Report**:
   - All departments with details
   - Active vs. inactive count
   - Department hierarchy view

2. **Department Expense Report**:
   - Expenses by department
   - Period comparison
   - Budget variance

3. **Department Headcount Report**:
   - Employees by department
   - Head assignments
   - Staffing levels

4. **Budget vs. Actual Report**:
   - Department budget tracking
   - Variance analysis
   - Trend visualization

---

## Future Enhancements

**Planned Features:**
- Department hierarchy visualization
- Drag-and-drop hierarchy management
- Budget workflow and approvals
- Department dashboard with KPIs
- Automated head notifications
- Department tags/categories
- Custom fields per department
- Department templates
- Inter-department transfers
- Department consolidation tools

---

## Technical Implementation

### Components

**User Assignment Component** (`user-assignment.tsx`):
- Reusable component for department-user relationships
- Props:
  - `assignedUserIds: string[]` - Currently assigned user IDs
  - `onAssignedUsersChange: (userIds: string[]) => void` - Callback for changes
- Features:
  - Dual-panel layout with independent search
  - Visual user cards with avatar, role, and department
  - Bulk selection and assignment
  - Real-time filtering
  - Dark mode support

**Helper Functions**:
```typescript
getUserInitials(name: string): string // Returns user initials for avatar
getAvatarColor(userId: string): string // Returns consistent color class
getUserDepartments(userId: string): Department[] // Gets user's departments
```

**State Management**:
- Local state for search queries and selections
- useMemo hooks for filtering performance
- Optimized re-rendering with proper dependency arrays

### API Integration

**Department User Assignment:**
```http
PUT /api/finance/departments/:code
Body: {
  code: string
  name: string
  assignedUsers: string[]
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "IT",
    "name": "Information Technology",
    "assignedUsers": ["user-001", "user-002"],
    ...
  }
}
```

---

## Changelog

### Version 1.1.0 (2025-01-28)

**Added:**
- Enhanced user assignment interface with visual hierarchy
- Color-coded user avatars with initials
- Three-column layout with chevron button navigation
- Role and department display for each user
- Bulk selection with "Select All" functionality
- Independent search for Assigned and Available users panels
- Real-time filtering and empty state handling
- Dark mode support throughout interface

**Improved:**
- User experience for assigning users to departments
- Visual feedback for selected users
- Performance optimization with useMemo hooks

**Technical:**
- Added `assignedUsers` field to Department data model
- Created reusable UserAssignment component
- Implemented helper functions for avatar colors and user data

---

**Last Updated:** 2025-01-28
**Version:** 1.1.0
