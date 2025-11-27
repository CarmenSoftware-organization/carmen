# Page Content: Create Pricelist Template Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Pricelist Templates
- **Page**: Create Template (Staff-Facing)
- **Route**: `/vendor-management/templates/new`
- **Version**: 2.0.0
- **Last Updated**: 2025-11-25
- **Owner**: UX/Content Team
- **Status**: Updated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation - reduced from 6 steps to 3 |
| 1.0.0 | 2025-11-23 | System | Initial version based on UC-PT v1.0, BR-PT v1.0 |

---

## Overview

**Page Purpose**: Multi-step wizard for creating new pricelist templates to standardize vendor price collection.

**User Personas**: Procurement Manager, Procurement Staff

**Related Documents**:
- [Business Requirements](../BR-pricelist-templates.md) - FR-PT-001, FR-PT-002
- [Technical Specification](../TS-pricelist-templates.md)

---

## Page Layout

**Container**: max-w-6xl mx-auto with space-y-6
**Structure**: Header, Progress Steps Card, Step Content Card, Navigation Buttons

---

## Page Header

### Back Button
**Icon**: ChevronLeft
**Style**: variant="ghost"
**Action**: router.back()

### Page Title
**Text**: Create Pricelist Template
**Style**: text-2xl font-semibold

### Page Description
**Text**: Build a template for collecting vendor pricing information
**Style**: text-muted-foreground

### Header Action Buttons
| Button Label | Purpose | Style | Icon |
|--------------|---------|-------|------|
| Preview | Open template preview modal | Secondary (outline) | Eye |
| Save Draft | Save template as draft | Secondary (outline) | Save |
| Submit Template | Save and activate template | Primary (green when enabled, disabled when validation fails) | None |

**Submit Button Conditions**:
- Enabled when: `name` has value AND (`categories.length > 0` OR `specificItems.length > 0`)
- Style when enabled: `bg-green-600 hover:bg-green-700 text-white`

---

## Progress Steps

### Step Indicator Card
**Layout**: Horizontal flex with connectors between steps
**Container**: Card with CardContent p-6

### Steps Configuration
| Step | Title | Description | Icon |
|------|-------|-------------|------|
| 1 | Basic Information | Template name, description, and basic settings | FileText |
| 2 | Product Selection | Choose which products to include in the template | Package |
| 3 | Settings & Notifications | Configure template settings and notifications | Bell |

### Step Visual States
| State | Circle Style | Text Style |
|-------|--------------|------------|
| Active | border-blue-500 bg-blue-50 text-blue-600 | text-blue-600 |
| Completed | border-green-500 bg-green-50 text-green-600 | text-green-600 |
| Pending | border-gray-200 bg-gray-50 text-gray-400 | text-gray-500 |

### Step Connector Line
**Width**: flex-1 h-px mx-4
**Color**: bg-green-500 when previous step completed, bg-gray-200 otherwise

---

## Step 1: Basic Information

### Step Card Header
**Title**: Basic Information
**Description**: Template name, description, and basic settings

### Form Fields

#### Template Name *
**Label**: Template Name *
**Type**: Input (text)
**Placeholder**: Enter template name
**Required**: Yes
**Validation**: Must have non-empty trimmed value to proceed

#### Description
**Label**: Description
**Type**: Textarea
**Placeholder**: Enter template description
**Rows**: 3
**Required**: No

#### Instructions for Vendors
**Label**: Instructions for Vendors
**Type**: Textarea
**Placeholder**: Enter instructions that will be shown to vendors
**Rows**: 4
**Required**: No

#### Two-Column Grid (md:grid-cols-2 gap-4)

**Validity Period (days)**
**Label**: Validity Period (days)
**Type**: Input (number)
**Default**: 90
**Min**: 1
**Max**: 365

**Default Currency**
**Label**: Default Currency
**Type**: Select dropdown
**Options**:
| Value | Label |
|-------|-------|
| BHT | Thai Baht (BHT) |
| USD | US Dollar (USD) |
| CNY | Chinese Yuan (CNY) |
| SGD | Singapore Dollar (SGD) |

**Default**: BHT

### Step 1 Validation
**Can proceed when**: `name` field has non-empty trimmed value

---

## Step 2: Product Selection

### Step Card Header
**Title**: Product Selection
**Description**: Choose which products to include in the template

### Content
**Component**: ProductSelectionComponent
**Props**:
- `productSelection`: Current selection state
- `onChange`: Update product selection in form state

### ProductSelection Data Structure
```typescript
interface ProductSelection {
  categories: string[]      // Selected category IDs
  subcategories: string[]   // Selected subcategory IDs
  itemGroups: string[]      // Selected item group IDs
  specificItems: string[]   // Selected specific product IDs
}
```

### Step 2 Validation
**Can proceed when**: `categories.length > 0` OR `specificItems.length > 0`

---

## Step 3: Settings & Notifications

### Step Card Header
**Title**: Settings & Notifications
**Description**: Configure template settings and notifications

### Layout
**Structure**: Two-column grid (md:grid-cols-2 gap-6) + Full-width notification card

---

### Card 1: Pricing Options

**Card Title**: Pricing Options (text-lg)

#### Allow Multiple MOQ Levels
**Type**: Switch toggle
**Label**: Allow Multiple MOQ Levels
**Description**: Vendors can provide different prices for different quantities
**Default**: true

#### Require Lead Time
**Type**: Switch toggle
**Label**: Require Lead Time
**Description**: Vendors must specify delivery lead times
**Default**: true

---

### Card 2: Limits & Controls

**Card Title**: Limits & Controls (text-lg)

#### Max Items per Submission
**Label**: Max Items per Submission
**Type**: Input (number)
**Default**: 1000
**Min**: 1
**Max**: 10000

#### Supported Currencies
**Label**: Supported Currencies
**Type**: Checkbox group
**Options**: Same as Default Currency options
**Layout**: Vertical stack (space-y-2)
**Default**: ['BHT'] selected

---

### Card 3: Notification Settings (Full Width)

**Card Title**: Notification Settings (text-lg)

#### Send Reminders
**Type**: Switch toggle
**Label**: Send Reminders
**Description**: Automatically send reminder emails to vendors
**Default**: true

#### Conditional Fields (shown when sendReminders = true)
**Layout**: Two-column grid (md:grid-cols-2 gap-4)

**Reminder Days Before Deadline**
**Type**: Checkbox group
**Options**: 14 days, 7 days, 3 days, 1 day
**Layout**: Horizontal flex with gap-2
**Default**: [7, 3, 1] selected

**Escalation After (days)**
**Label**: Escalation After (days)
**Type**: Input (number)
**Default**: 14
**Min**: 1
**Max**: 90

---

## Navigation Footer

### Navigation Buttons
**Layout**: flex justify-between

| Button | Position | Style | Action | Disabled When |
|--------|----------|-------|--------|---------------|
| Previous | Left | variant="outline" | Go to previous step | currentStep === 0 |
| Next | Right | Default | Go to next step | currentStep === last OR validation fails |

---

## Template Preview Modal

### Trigger
**Button**: Preview button in header

### Component
**Name**: TemplatePreview
**Props**:
- `template`: Current form data cast as PricelistTemplate
- `onClose`: Function to close modal

### Modal Content
Displays preview of how the template will appear to vendors.

---

## Form Data Structure

### Initial State
```typescript
{
  name: '',
  description: '',
  productSelection: {
    categories: [],
    subcategories: [],
    itemGroups: [],
    specificItems: []
  },
  customFields: [],
  instructions: '',
  validityPeriod: 90,
  status: 'draft',
  allowMultiMOQ: true,
  requireLeadTime: true,
  defaultCurrency: 'BHT',
  supportedCurrencies: ['BHT'],
  maxItemsPerSubmission: 1000,
  notificationSettings: {
    sendReminders: true,
    reminderDays: [7, 3, 1],
    escalationDays: 14
  }
}
```

---

## Save Actions

### Save as Draft
**Trigger**: "Save Draft" button click
**Status**: Sets status to 'draft'
**Validation**: None required (can save incomplete)
**Success Message**: Template saved as draft
**Redirect**: `/vendor-management/templates`

### Submit Template (Activate)
**Trigger**: "Submit Template" button click
**Status**: Sets status to 'active'
**Validation Required**:
1. Template name must have non-empty value
2. Product selection must have at least one category or specific item

**Validation Error Messages**:
| Condition | Error Message |
|-----------|---------------|
| No name | Template name is required to activate template |
| No products | Product selection is required to activate template |

**Success Message**: Template created and activated
**Redirect**: `/vendor-management/templates`

---

## Status Messages (Toasts)

### Success Messages
| Trigger | Title | Description |
|---------|-------|-------------|
| Save draft | Success | Template saved as draft |
| Activate | Success | Template created and activated |

### Error Messages
| Trigger | Title | Description |
|---------|-------|-------------|
| Validation fail (name) | Validation Error | Template name is required to activate template |
| Validation fail (products) | Validation Error | Product selection is required to activate template |
| Save failed | Error | Failed to save template |

---

## Responsive Behavior

### Desktop (>768px)
- Two-column grids display side by side
- Full step indicator visible
- Form fields at comfortable width

### Mobile (<768px)
- Grid columns stack vertically
- Step indicator may compress
- Full-width form fields

---

## Navigation

### Entry Points
- List page "Create Template" button
- Direct URL: `/vendor-management/templates/new`

### Exit Points
| Action | Destination |
|--------|-------------|
| Back button | Previous page (router.back()) |
| Save Draft | `/vendor-management/templates` |
| Submit Template | `/vendor-management/templates` |

---

## Accessibility

- Form labels associated with inputs via htmlFor/id
- Required fields marked with asterisk (*)
- Switch toggles keyboard accessible
- Step progress communicated visually with colors and icons

---

**Document End**
