# Purchase Request Module - UI Flow Specification

## 1. Navigation Structure

### 1.1 Module Routes
```
/procurement/
├── purchase-requests/              # Main PR listing
│   ├── new                        # Create new PR
│   ├── [id]                       # PR detail view
│   │   ├── edit                   # Edit PR
│   │   └── print                  # Print view
├── my-approvals/                  # Approvals dashboard
├── templates/                     # PR templates
└── reports/                       # PR reporting
```

## 2. Page Specifications

### 2.1 PR List View (/procurement/purchase-requests)

#### Header Section
- Page title: "Purchase Requests"
- Action buttons:
  - "+ New Request" (primary)
  - "Import" (secondary)
  - "Export" (secondary)

#### Filter Panel
```
┌─────────────────────────────────┐
│ Search & Filters                │
├─────────────────────────────────┤
│ ┌─────────┐ ┌────────────────┐ │
│ │ Search  │ │ Date Range     │ │
│ └─────────┘ └────────────────┘ │
│ ┌─────────┐ ┌────────────────┐ │
│ │ Status  │ │ Department     │ │
│ └─────────┘ └────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Advanced Filters            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Data Grid
- Columns:
  - PR Number (sortable)
  - Date (sortable)
  - Requestor
  - Department
  - Total Amount (sortable)
  - Status (with badge)
  - Actions
- Features:
  - Column customization
  - Row selection
  - Bulk actions
  - Infinite scroll/pagination

### 2.2 PR Creation Flow (/procurement/purchase-requests/new)

#### Step 1: Basic Information
```
┌────────────────────────────────┐
│ Create Purchase Request        │
├────────────────────────────────┤
│ Department*: [Dropdown]        │
│ Request Type*: [Dropdown]      │
│ Currency*:    [Dropdown]       │
│ Due Date*:    [DatePicker]    │
│ Description:  [TextArea]       │
└────────────────────────────────┘
```

#### Step 2: Item Selection
```
┌────────────────────────────────┐
│ Items                          │
├────────────────────────────────┤
│ [Add Item] [Import] [Template] │
│ ┌──────────────────────────┐   │
│ │ Item Grid                │   │
│ │ - Product lookup         │   │
│ │ - Quantity              │   │
│ │ - Unit                  │   │
│ │ - Price                 │   │
│ │ - Total                 │   │
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

#### Step 3: Budget Allocation
```
┌────────────────────────────────┐
│ Budget Details                 │
├────────────────────────────────┤
│ Budget Category*: [Dropdown]   │
│ Cost Center*:    [Dropdown]    │
│                               │
│ Budget Summary                │
│ - Available: $10,000         │
│ - Required:  $2,500          │
│ - Remaining: $7,500          │
└────────────────────────────────┘
```

#### Step 4: Review & Submit
- Summary view
- Attachment upload
- Terms & conditions
- Submit button

### 2.3 PR Detail View (/procurement/purchase-requests/[id])

#### Header
```
┌────────────────────────────────┐
│ PR-2024-0001                   │
│ [Status Badge]                 │
│ [Edit] [Print] [More Actions ▼]│
└────────────────────────────────┘
```

#### Content Tabs
1. Details
   - Basic information
   - Items list
   - Total calculations
2. Approval Flow
   - Current status
   - Approval history
   - Next approvers
3. Attachments
   - Document list
   - Upload section
4. History
   - Audit trail
   - Comments
   - System logs

## 3. Component Library

### 3.1 Status Badges
```typescript
type PRStatus = 
  | 'Draft'
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

const statusColors = {
  Draft: 'gray',
  Pending: 'yellow',
  'Under Review': 'blue',
  Approved: 'green',
  Rejected: 'red',
  Cancelled: 'gray'
};
```

### 3.2 Action Buttons
- Primary actions (blue)
- Secondary actions (gray)
- Destructive actions (red)
- Icon buttons with tooltips

### 3.3 Form Components
- Input fields with validation
- Dropdowns with search
- Date pickers
- Number inputs with formatting
- File upload with preview

## 4. Interaction Patterns

### 4.1 Data Entry
- Real-time validation
- Auto-save drafts
- Keyboard navigation
- Tab order optimization

### 4.2 Error Handling
- Field-level validation
- Form-level validation
- Error messages
- Recovery options

### 4.3 Loading States
- Skeleton screens
- Progress indicators
- Loading overlays
- Optimistic updates

## 5. Responsive Design

### 5.1 Breakpoints
```css
sm: '640px'
md: '768px'
lg: '1024px'
xl: '1280px'
2xl: '1536px'
```

### 5.2 Mobile Adaptations
- Stack layouts
- Collapsible sections
- Touch-friendly controls
- Simplified tables

## 6. Accessibility Requirements

### 6.1 WCAG Compliance
- Color contrast ratios
- Keyboard navigation
- Screen reader support
- Focus management

### 6.2 Aria Labels
- Dynamic content updates
- Form controls
- Interactive elements
- Status messages

## 7. Performance Guidelines

### 7.1 Loading Performance
- Initial load < 2s
- Interaction response < 200ms
- Optimistic UI updates
- Progressive loading

### 7.2 Resource Management
- Image optimization
- Code splitting
- Cache management
- State management