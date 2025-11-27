# Page Content: Pricelist Templates List Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Pricelist Templates
- **Page**: Template List (Staff-Facing)
- **Route**: `/vendor-management/templates`
- **Version**: 2.0.0
- **Last Updated**: 2025-11-25
- **Owner**: UX/Content Team
- **Status**: Updated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0.0 | 2025-11-23 | System | Initial version based on UC-PT v1.0, BR-PT v1.0 |

---

## Overview

**Page Purpose**: Display all pricelist templates with filtering, sorting, and search capabilities for procurement staff to create, manage, and track standardized pricing templates.

**User Personas**: Procurement Manager, Procurement Staff, Finance Manager, Department Manager

**Related Documents**:
- [Business Requirements](../BR-pricelist-templates.md) - BR-PT-001 to BR-PT-003
- [Technical Specification](../TS-pricelist-templates.md)
- [Data Dictionary](../DD-pricelist-templates.md)
- [Flow Diagrams](../FD-pricelist-templates.md)

---

## Page Layout

The page is contained within a single Card component with header and content sections.

---

## Page Header (Inside Card)

### Page Title
**Text**: Pricelist Templates
**Style**: text-2xl font-bold text-gray-900
**Location**: Top left inside CardHeader

### Page Description
**Text**: Create and manage templates for vendor requests for pricing
**Style**: text-sm text-gray-600
**Location**: Below title

### Action Buttons (Header Right)
| Button Label | Purpose | Style | Icon |
|--------------|---------|-------|------|
| Export | Export templates | Secondary (outline, size-sm) | Download |
| Create Template | Navigate to create template page | Primary (bg-blue-600, size-sm) | Plus |

---

## Filter Section

### Search Bar
**Placeholder Text**: Search templates...
**Location**: Left side of filter row
**Width**: max-w-lg with flex-1
**Icon**: Search icon on left (pl-10)
**Functionality**: Filters templates by name, description, and category names

### Status Filter Dropdown
| Option | Filter Criteria |
|--------|-----------------|
| All Status | No status filter applied |
| Active | status = 'active' |
| Draft | status = 'draft' |
| Inactive | status = 'inactive' |

**Default**: All Status

### Additional Filter Buttons
| Button Label | Purpose | Style |
|--------------|---------|-------|
| Saved Filters | Access saved filter combinations | Secondary (outline, size-sm) |
| Add Filters | Open advanced filters | Secondary (outline, size-sm) with Filter icon |

**Note**: Both buttons currently show toast notifications indicating features will be available in future release.

### View Toggle
**Location**: Right side of filter row
**Style**: Grouped buttons with border rounded-lg

| View Option | Icon | State Indicator |
|-------------|------|-----------------|
| Table View | List | variant="default" when active, "ghost" when inactive |
| Card View | Grid | variant="default" when active, "ghost" when inactive |

---

## Data Display

### Table View

#### Table Headers
| Column Header | Sortable | Width | Content |
|---------------|----------|-------|---------|
| Name | No | - | Template name |
| Status | No | - | Status badge |
| Description | No | max-w-[300px] | Template description (truncated) |
| Validity Period | No | - | Number of days |
| Created | No | - | Creation date |
| Updated | No | - | Last update date |
| Actions | No | w-[50px] | Action menu |

#### Column Content Formats

**Name Column**:
```
Kitchen Equipment - Monthly Pricing
```
- **Style**: font-medium

**Status Column**:
| Status Value | Badge Style | Display Text |
|--------------|-------------|--------------|
| active | bg-green-100 text-green-800 | Active |
| draft | bg-yellow-100 text-yellow-800 | Draft |
| inactive | bg-gray-100 text-gray-800 | Inactive |

**Description Column**:
- **Style**: max-w-[300px] truncate
- Shows full description on hover

**Validity Period Column**:
```
90 days
```

**Created/Updated Columns**:
- **Format**: MMM DD, YYYY (e.g., "Jan 15, 2024")
- Uses Intl.DateTimeFormat with 'en-US' locale

**Actions Column**:
- **Icon**: MoreHorizontal (3 dots)
- **Style**: variant="ghost" size="sm"
- Opens dropdown menu on click

---

### Card View

**Layout**: 3 columns on desktop (lg), 2 on tablet (md), 1 on mobile
**Gap**: gap-6

#### Template Card Structure
```
+---------------------------------------------+
| [Status Badge]              [Actions Menu]  |
|                                             |
| Template Name (text-lg font-semibold)       |
|                                             |
| Description (text-sm text-muted-foreground) |
| (line-clamp-2)                              |
|                                             |
| +---------------+  +------------------+     |
| | Validity      |  | Categories       |     |
| | 90 days       |  | 3 categories     |     |
| +---------------+  +------------------+     |
|                                             |
| +---------------+  +------------------+     |
| | Created       |  | Updated          |     |
| | Jan 15, 2024  |  | Jan 20, 2024     |     |
| +---------------+  +------------------+     |
|                                             |
| +-------------------------------------------+
| | FileSpreadsheet  "Template"  | Users  X items |
| +-------------------------------------------+
+---------------------------------------------+
```

**Card Sections**:
1. **Header Row**: Status badge (left) + Action menu dropdown (right)
2. **Title**: Template name (CardTitle, text-lg font-semibold, mb-2)
3. **Description**: 2-line truncated description (line-clamp-2)
4. **Stats Grid**: 2x2 grid showing:
   - Validity: `{validityPeriod} days`
   - Categories: `{productSelection.categories.length} categories`
   - Created: Formatted date
   - Updated: Formatted date
5. **Footer**: border-t with:
   - Left: FileSpreadsheet icon + "Template" text
   - Right: Users icon + `{productSelection.categories.length} items`

**Card Hover Effect**: hover:shadow-md transition-shadow

---

## Row/Card Actions

### Dropdown Menu Items
| Menu Item | Icon | Action | Destructive |
|-----------|------|--------|-------------|
| View | Eye | Navigate to `/vendor-management/templates/{id}` | No |
| Edit | Edit | Navigate to `/vendor-management/templates/{id}/edit` | No |
| Create Request for Pricing | Mail | Navigate to `/vendor-management/campaigns/new?templateId={id}` | No |
| Duplicate | Copy | Create copy of template with "(Copy)" suffix | No |
| Generate Excel | Download | Generate Excel template (toast notification) | No |
| Delete | Trash2 | Open delete confirmation dialog | Yes (text-red-600) |

---

## Empty State

### No Templates (No Filters Applied)
**Icon**: FileSpreadsheet (h-12 w-12, text-muted-foreground)
**Title**: No templates found
**Message**: Get started by creating your first pricelist template.
**Action Button**: Create Template (with Plus icon)

### No Templates (Filters Applied)
**Icon**: FileSpreadsheet (h-12 w-12, text-muted-foreground)
**Title**: No templates found
**Message**: No templates match your current filters.
**Action Button**: None (user should adjust filters)

---

## Loading State

### Page Loading
**Layout**: Same header structure with skeleton placeholders
**Animation**: animate-pulse class on placeholder elements
**Content**: 3 skeleton cards with:
- Gray rectangle for title (h-4 w-1/4)
- Gray rectangle for description (h-3 w-1/2)
- Gray rectangle for metadata (h-3 w-1/3)

---

## Dialogs/Modals

### Delete Template Confirmation Dialog

#### Dialog Header
**Title**: Delete Template
**Component**: AlertDialogTitle

#### Dialog Body
**Content**: AlertDialogDescription
```
Are you sure you want to delete "{template.name}"? This action cannot be undone.
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Cancel | AlertDialogCancel | Close dialog |
| Delete | AlertDialogAction (bg-red-600 hover:bg-red-700) | Execute delete and close |

---

## Status Messages (Toasts)

### Success Messages
| Trigger | Message |
|---------|---------|
| Template duplicated | Template duplicated successfully |
| Template deleted | Template deleted successfully |
| Excel generated | Excel template generated successfully |

### Error Messages
| Trigger | Message |
|---------|---------|
| Load failed | Failed to load templates |
| Duplicate failed | Failed to duplicate template |
| Delete failed | Failed to delete template |
| Excel generation failed | Failed to generate Excel template |

---

## Data Model Reference

### PricelistTemplate Interface
```typescript
interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions?: string
  validityPeriod: number
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: NotificationSettings
}
```

### ProductSelection Interface
```typescript
interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | View selected template (when row focused) |

---

## Responsive Behavior

### Desktop (>1024px)
- Full table view with all columns
- 3-column card view
- Horizontal filter bar

### Tablet (768-1024px)
- Full table view
- 2-column card view
- Horizontal filter bar

### Mobile (<768px)
- Table scrolls horizontally
- 1-column card view
- Filter controls stack vertically

---

## Navigation

### Entry Points
- Sidebar: Vendor Management > Pricelist Templates
- Direct URL: `/vendor-management/templates`

### Exit Points
| Action | Destination |
|--------|-------------|
| Create Template | `/vendor-management/templates/new` |
| View Template | `/vendor-management/templates/{id}` |
| Edit Template | `/vendor-management/templates/{id}/edit` |
| Create Request for Pricing | `/vendor-management/campaigns/new?templateId={id}` |
| Back button | Previous page (router.back()) |

---

**Document End**
