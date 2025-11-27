# PC-template-builder.md
# Page Content Specification: Pricelist Template Builder

**Document Version**: 1.0
**Last Updated**: 2025-01-23
**Page Route**: `/vendor-management/vendor-portal/templates`
**User Role**: Procurement Staff, Department Manager, Financial Manager
**Related Use Cases**: UC-VPP-001 (Create Pricelist Template), UC-VPP-002 (Edit Pricelist Template), UC-VPP-009 (Manage Templates)
**Related Technical Specs**: TS-VPP-001 (Template Builder), TS-VPP-002 (Template Validation)
**Related Data Dictionary**: DD-VPP-007 (PricelistTemplate), DD-VPP-008 (TemplateProduct)

---

## Table of Contents
1. [Page Overview](#page-overview)
2. [Page Header](#page-header)
3. [Template List View](#template-list-view)
4. [Template Creation/Edit Form](#template-creationedit-form)
5. [Product Selection Interface](#product-selection-interface)
6. [Template Settings](#template-settings)
7. [Template Preview](#template-preview)
8. [Dialogs and Modals](#dialogs-and-modals)
9. [Status Messages](#status-messages)
10. [Loading States](#loading-states)
11. [Empty States](#empty-states)
12. [Accessibility](#accessibility)
13. [Translator Notes](#translator-notes)
14. [Brand Voice Guidelines](#brand-voice-guidelines)
15. [Appendix](#appendix)

---

## Page Overview

### Purpose
The Pricelist Template Builder page allows procurement staff to create, manage, and configure reusable pricelist templates. These templates define which products to request pricing for in price collection campaigns, along with custom fields, MOQ requirements, and other specifications.

### User Goals
- Create new pricelist templates for different product categories or vendor types
- Select specific products or product groups to include in templates
- Configure template settings (validity periods, MOQ requirements, currencies, custom fields)
- Preview how the template will appear to vendors
- Manage existing templates (view, edit, duplicate, delete, activate/deactivate)
- Test templates before using them in campaigns

### Key Features
- Template list with search, filtering, and sorting
- Drag-and-drop product selection with category tree navigation
- Custom field builder for additional data collection
- Template preview with Excel download
- Template versioning and history tracking
- Bulk operations for template management
- Template import/export functionality

---

## Page Header

### Page Title
```
Pricelist Templates
```

### Breadcrumb Navigation
```
Home > Vendor Management > Vendor Portal > Pricelist Templates
```

### Page Description
```
Create and manage reusable pricelist templates for vendor price collection campaigns. Templates define which products to request pricing for, along with custom fields and requirements.
```

### Primary Actions

#### Action 1: Create Template Button
**Button Label**: `+ New Template`
**Button Style**: Primary button (blue background)
**Icon**: Plus icon
**Keyboard Shortcut**: `Alt + N`
**Action**: Opens template creation wizard
**Tooltip**: `Create a new pricelist template (Alt+N)`

#### Action 2: Import Template Button
**Button Label**: `Import Template`
**Button Style**: Secondary button (outlined)
**Icon**: Upload icon
**Action**: Opens template import dialog
**Tooltip**: `Import template from JSON file`

#### Action 3: More Actions Menu
**Button Label**: `⋮ More`
**Button Style**: Text button
**Dropdown Options**:
- `Export All Templates` - Download all templates as JSON
- `Bulk Edit Templates` - Edit multiple templates at once
- `Template Settings` - Configure default template settings
- `View Template Guide` - Open template creation guide

### Quick Filters Bar

#### Filter 1: Status Filter
**Label**: `Status`
**Type**: Toggle buttons
**Options**:
- `All` (default, shows badge count)
- `Active` (green dot indicator)
- `Inactive` (gray dot indicator)
- `Draft` (orange dot indicator)

**Example Display**:
```
Status:  [All (24)]  [Active (18)]  [Inactive (4)]  [Draft (2)]
```

#### Filter 2: Category Filter
**Label**: `Category`
**Type**: Multi-select dropdown
**Placeholder**: `All Categories`
**Options**: Dynamic list from product categories
- `Food & Beverage`
- `Kitchen Supplies`
- `Cleaning Supplies`
- `Packaging Materials`
- `Maintenance & Repairs`
- `Office Supplies`
- `Custom Categories...`

#### Filter 3: Last Modified Filter
**Label**: `Last Modified`
**Type**: Dropdown
**Options**:
- `Any time`
- `Today`
- `Last 7 days`
- `Last 30 days`
- `Last 90 days`
- `Custom date range...`

#### Filter 4: Created By Filter
**Label**: `Created By`
**Type**: Searchable dropdown
**Placeholder**: `All Users`
**Options**: Dynamic list of users who have created templates

### Search Bar
**Placeholder Text**: `Search templates by name, description, or product...`
**Icon**: Magnifying glass icon
**Keyboard Shortcut**: `Ctrl/Cmd + K`
**Search Behavior**: Real-time search with debounce (300ms)
**Clear Button**: X icon to clear search
**No Results Message**:
```
No templates found matching "{search term}"
Try different keywords or clear filters to see more results.
```

---

## Template List View

### View Toggle Options
**Toggle Group**:
- `Table View` (icon: table grid, default)
- `Card View` (icon: grid squares)
- `Compact View` (icon: list)

**User Preference**: Selection saved per user

### Table View Layout

#### Column Headers

| Column | Width | Sortable | Default Sort | Tooltip |
|--------|-------|----------|--------------|---------|
| Template Name | 25% | Yes | Ascending | Click to sort by name |
| Products | 10% | Yes | None | Number of products in template |
| Category | 15% | Yes | None | Primary product category |
| Status | 10% | No | None | Template status |
| Last Used | 12% | Yes | None | Last campaign using this template |
| Created By | 12% | Yes | None | User who created template |
| Modified | 10% | Yes | Descending | Last modification date |
| Actions | 6% | No | None | Template actions |

#### Column 1: Template Name
**Display Format**:
```
📋 Standard Food & Beverage Pricelist
    Products: 45 | Categories: 3 | Version 2.1
```

**Visual Elements**:
- Template icon (📋)
- Template name (bold, clickable link)
- Metadata row (smaller font, muted color)
- Hover state: Underline template name

**Click Action**: Navigate to template edit page

#### Column 2: Products
**Display Format**: `45 products`
**Tooltip**:
```
45 products selected
• Food Items: 20
• Beverages: 15
• Condiments: 10
```

**Visual Indicator**:
- Badge with product count
- Color coded by count:
  - < 10 products: Gray
  - 10-50 products: Blue
  - > 50 products: Purple

#### Column 3: Category
**Display Format**:
```
Food & Beverage
+2 more
```

**Tooltip**:
```
Categories:
• Food & Beverage
• Kitchen Supplies
• Packaging Materials
```

**Visual Elements**:
- Primary category displayed
- "+X more" for additional categories
- Category icon/color indicator

#### Column 4: Status
**Display Format**: Status badge with icon

**Status Types**:

**Active** (Green badge with checkmark):
```
✓ Active
```
**Tooltip**: `Currently in use, can be selected for campaigns`

**Inactive** (Gray badge with circle):
```
○ Inactive
```
**Tooltip**: `Not available for new campaigns, can be reactivated`

**Draft** (Orange badge with pencil):
```
✎ Draft
```
**Tooltip**: `Not finalized, requires review before use`

**Archived** (Dark gray badge with box):
```
📦 Archived
```
**Tooltip**: `Archived, not available for campaigns`

#### Column 5: Last Used
**Display Format**:
```
Campaign: Q1 2024 Food Pricing
2 days ago
```

**Visual Elements**:
- Campaign name (linked, truncated if too long)
- Relative time (e.g., "2 days ago", "Last week")
- Tooltip with full campaign details

**Empty State**:
```
Never used
```

#### Column 6: Created By
**Display Format**:
```
👤 John Smith
Procurement Dept.
```

**Visual Elements**:
- User avatar or initials icon
- User name (linked to user profile)
- Department name (smaller font, muted)

#### Column 7: Modified
**Display Format**:
```
23 Jan 2024
2:45 PM
```

**Tooltip**:
```
Last Modified:
23 Jan 2024 at 2:45 PM
by Sarah Johnson
Changes: Added 5 products
```

**Visual Elements**:
- Date on first line
- Time on second line
- Relative indicator for recent changes (e.g., "Updated today" badge)

#### Column 8: Actions
**Action Menu Button**: `⋮` (three vertical dots)

**Dropdown Menu Options**:

1. **Edit Template**
   - Icon: Pencil
   - Keyboard: `E`
   - Action: Open template editor

2. **Duplicate Template**
   - Icon: Copy
   - Keyboard: `D`
   - Action: Open duplicate dialog

3. **Preview Template**
   - Icon: Eye
   - Keyboard: `P`
   - Action: Open preview modal

4. **Download Excel**
   - Icon: Download
   - Keyboard: None
   - Action: Download template as Excel file

5. **View Usage**
   - Icon: Chart
   - Keyboard: None
   - Action: Show campaigns using this template

**Divider Line**

6. **Activate/Deactivate**
   - Icon: Toggle
   - Label: Dynamic (`Activate` or `Deactivate`)
   - Action: Toggle template status

7. **Archive Template**
   - Icon: Box
   - Keyboard: None
   - Action: Archive template (confirmation required)

**Divider Line**

8. **Delete Template**
   - Icon: Trash (red)
   - Keyboard: `Delete`
   - Style: Red text
   - Action: Delete template (confirmation required)
   - Disabled if: Template is in use by active campaigns

### Row Selection
**Selection Type**: Multi-select checkboxes in first column

**Bulk Actions Bar** (appears when rows selected):
```
┌─────────────────────────────────────────────────────────────┐
│  ☑ 3 templates selected                                      │
│                                                              │
│  [Activate]  [Deactivate]  [Archive]  [Export]  [Delete]   │
│                                           [Clear Selection]  │
└─────────────────────────────────────────────────────────────┘
```

**Bulk Actions**:
1. **Activate** - Activate selected templates
2. **Deactivate** - Deactivate selected templates
3. **Archive** - Archive selected templates (confirmation required)
4. **Export** - Export selected templates as JSON
5. **Delete** - Delete selected templates (confirmation required)

**Clear Selection Button**: `Clear Selection` (text button, right-aligned)

### Card View Layout

**Card Structure**:
```
┌────────────────────────────────────────┐
│ 📋 Standard Food & Beverage Pricelist │
│                                        │
│ ✓ Active                               │
│                                        │
│ 45 products • 3 categories             │
│ Food & Beverage, Kitchen Supplies      │
│                                        │
│ Last used: Q1 2024 Food Pricing        │
│ Modified: 23 Jan 2024                  │
│                                        │
│ Created by: John Smith                 │
│                                        │
│ [Edit]  [Duplicate]  [Preview]  [⋮]   │
└────────────────────────────────────────┘
```

**Card Hover State**:
- Subtle shadow elevation
- Border color change
- Scale slightly (1.02x)

**Card Click Area**: Entire card except action buttons

### Compact View Layout

**List Item Structure**:
```
📋 Standard Food & Beverage Pricelist  |  ✓ Active  |  45 products  |  Modified: 23 Jan 2024  |  [Edit] [⋮]
```

**Compact Mode Benefits**:
- View more templates per screen
- Faster scanning
- Less scrolling

### Pagination

**Pagination Controls** (bottom of list):
```
Showing 1-20 of 124 templates

[← Previous]  [1] [2] [3] ... [7]  [Next →]

Items per page: [20 ▾]  (Options: 10, 20, 50, 100)
```

**Keyboard Navigation**:
- `←` Previous page
- `→` Next page
- `Home` First page
- `End` Last page

---

## Template Creation/Edit Form

### Form Layout Options

**Two Layout Modes**:
1. **Wizard Mode** (Default for new templates) - Multi-step guided process
2. **Advanced Mode** (Default for editing) - All sections on one page with tabs

**Mode Toggle**:
```
Layout Mode:  ( ) Wizard Mode  (•) Advanced Mode
```

### Wizard Mode: Step Indicators

**Progress Bar**:
```
┌──────────────────────────────────────────────────────────────┐
│  Step 1 of 5: Template Information                           │
│                                                               │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  20%            │
│                                                               │
│  ✓ Template Info  →  Select Products  →  Settings  →  Custom Fields  →  Review │
└──────────────────────────────────────────────────────────────┘
```

### Step 1: Template Information

#### Section Header
**Title**: `Template Information`
**Description**: `Provide basic details about this pricelist template`

#### Form Fields

| Field Label | Type | Required | Width | Placeholder | Validation | Character Limit |
|-------------|------|----------|-------|-------------|------------|-----------------|
| Template Name | Text input | Yes | 100% | e.g., "Standard Food & Beverage Pricelist" | Unique name, 3-100 chars | 100 |
| Description | Textarea | No | 100% | Describe the purpose and scope of this template... | Max 500 chars | 500 |
| Template Code | Text input | No | 50% | e.g., "FB-STD-2024" | Alphanumeric with dashes | 20 |
| Primary Category | Dropdown | Yes | 50% | Select primary category | Required | N/A |
| Status | Dropdown | Yes | 50% | Select status | Required | N/A |
| Tags | Tag input | No | 100% | Add tags... | Max 10 tags | 20 per tag |

#### Field Details

**Template Name**:
- **Help Text**: `A clear, descriptive name for this template. This will be visible when creating campaigns.`
- **Example**: "Standard Food & Beverage Pricelist"
- **Validation Messages**:
  - Error: `Template name is required`
  - Error: `Template name must be at least 3 characters`
  - Error: `A template with this name already exists`
  - Success: `Template name is available ✓`

**Description**:
- **Help Text**: `Optional description to help staff understand when to use this template.`
- **Example**: "Use this template for quarterly food and beverage pricing requests from all F&B vendors."
- **Character Counter**: `0 / 500 characters`

**Template Code**:
- **Help Text**: `Optional unique code for internal reference and API integration.`
- **Example**: "FB-STD-2024"
- **Format Guide**: `Recommended format: CATEGORY-TYPE-YEAR (e.g., FB-STD-2024)`

**Primary Category**:
- **Help Text**: `Select the main product category this template focuses on.`
- **Dropdown Options**:
  - Food & Beverage
  - Kitchen Supplies
  - Cleaning Supplies
  - Packaging Materials
  - Maintenance & Repairs
  - Office Supplies
  - Multi-Category
  - Other

**Status**:
- **Help Text**: `Set the initial status. Active templates can be used in campaigns immediately.`
- **Dropdown Options**:
  - Draft (Save as draft, not ready for use)
  - Active (Ready for use in campaigns)
  - Inactive (Not available for new campaigns)

**Tags**:
- **Help Text**: `Add tags to organize and filter templates (press Enter or comma to add).`
- **Example Tags**: "food", "quarterly", "standard", "2024"
- **Tag Suggestions**: Popular tags appear as suggestions while typing

### Step 2: Select Products

#### Section Header
**Title**: `Select Products`
**Description**: `Choose which products to include in this template. Vendors will be asked to provide pricing for selected products.`

#### Product Selection Interface

**Layout**: Split view with category tree on left and product list on right

```
┌─────────────────────────────────────────────────────────────────┐
│  Product Categories (Left Panel)      Selected Products (Right) │
├───────────────────────┬─────────────────────────────────────────┤
│                       │                                         │
│  [Search categories]  │  [Search products]                      │
│                       │                                         │
│  ☐ All Categories     │  45 products selected                   │
│  ▼ ☑ Food & Beverage  │                                         │
│    ▼ ☑ Food Items     │  ┌──────────────────────────────────┐  │
│      ☑ Meat & Poultry │  │ ✓ Chicken Breast (Fresh)         │  │
│      ☑ Seafood        │  │   Base Unit: KG | Code: CHK-001  │  │
│      ☑ Produce        │  │   Category: Meat & Poultry       │  │
│    ▼ ☑ Beverages      │  │   [Remove]                       │  │
│      ☑ Soft Drinks    │  └──────────────────────────────────┘  │
│      ☑ Juices         │                                         │
│  ▼ ☐ Kitchen Supplies │  ┌──────────────────────────────────┐  │
│    ☐ Cookware         │  │ ✓ Salmon Fillet (Fresh)          │  │
│    ☐ Utensils         │  │   Base Unit: KG | Code: SLM-002  │  │
│                       │  │   Category: Seafood              │  │
│                       │  │   [Remove]                       │  │
│                       │  └──────────────────────────────────┘  │
│                       │                                         │
│  [+ Add Custom        │  ... (scrollable list)                  │
│     Category]         │                                         │
│                       │  [Clear All]  [Add All from Category]  │
└───────────────────────┴─────────────────────────────────────────┘
```

#### Left Panel: Category Tree

**Category Tree Controls**:
- **Search Box**: `Search categories...`
- **Expand/Collapse All**: Toggle button at top
- **Checkbox Behavior**:
  - Check category → Select all products in category
  - Partial check (indeterminate) → Some products selected
  - Uncheck category → Deselect all products

**Category Item Display**:
```
▼ ☑ Food & Beverage (120 products, 85 selected)
  ▼ ☑ Food Items (80 products, 60 selected)
    ☑ Meat & Poultry (20 products, 15 selected)
```

**Visual Indicators**:
- Expand/collapse arrow (▼/▶)
- Checkbox (☐/☑/☒ for indeterminate)
- Category name
- Product count in parentheses
- Selected count if partial

#### Right Panel: Selected Products

**Header**:
```
Selected Products: 45
[Sort by: Name ▾]  [Group by: Category ▾]  [Clear All]
```

**Sort Options**:
- Name (A-Z)
- Name (Z-A)
- Category
- Product Code
- Recently Added
- Custom Order (drag-and-drop)

**Group Options**:
- No Grouping
- By Category
- By Subcategory
- By Base Unit

**Product Card** (in selected list):
```
┌──────────────────────────────────────────┐
│ ✓ Chicken Breast (Fresh)                 │
│   Base Unit: KG | Code: CHK-001          │
│   Category: Meat & Poultry               │
│   [⋮ Options]  [Remove]                  │
└──────────────────────────────────────────┘
```

**Product Options Menu** (⋮):
- `Edit Product Details` - Modify product-specific settings for this template
- `Set Custom Label` - Override product name for this template
- `Mark as Required` - Vendors must provide pricing for this product
- `Set Default Unit` - Set default unit for pricing submission
- `Add Notes` - Add instructions for vendors about this product

**Drag-and-Drop Reordering**:
- Drag handle icon (⋮⋮) on left of each product card
- Visual indicator during drag (elevated shadow, reduced opacity)
- Drop zone highlights between products
- Auto-scroll when dragging near top/bottom

#### Quick Add Options

**Quick Add Panel** (collapsible, below category tree):
```
┌─────────────────────────────────────┐
│  Quick Add Products                  │
│                                      │
│  [Add by Product Code]               │
│  Enter codes: CHK-001, SLM-002...    │
│  [Add]                               │
│                                      │
│  [Import from CSV]                   │
│  Upload a CSV file with product codes│
│  [Choose File]                       │
│                                      │
│  [Copy from Template]                │
│  Select existing template:           │
│  [Template Dropdown ▾]  [Copy]       │
└─────────────────────────────────────┘
```

#### Product Selection Summary

**Summary Panel** (bottom of right panel):
```
┌─────────────────────────────────────────────────────────┐
│  Selection Summary                                       │
│                                                          │
│  Total Products: 45                                      │
│  Categories: 3                                           │
│  • Food & Beverage: 35 products                         │
│  • Kitchen Supplies: 8 products                         │
│  • Packaging Materials: 2 products                      │
│                                                          │
│  Required Products: 12                                   │
│  Optional Products: 33                                   │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Template Settings

#### Section Header
**Title**: `Template Settings`
**Description**: `Configure pricing requirements, units of measure, and other settings for this template.`

#### Settings Sections

**Section 1: Pricing Requirements**

| Setting | Type | Default | Description | Options/Range |
|---------|------|---------|-------------|---------------|
| Require Unit Price | Toggle | On | Vendors must provide unit price | On/Off |
| Require MOQ | Toggle | On | Vendors must specify minimum order quantity | On/Off |
| Allow MOQ Tiers | Toggle | On | Enable multi-tier MOQ pricing | On/Off |
| Max MOQ Tiers | Number | 5 | Maximum number of pricing tiers | 1-10 |
| Require FOC | Toggle | Off | Vendors must specify Free of Charge quantity | On/Off |
| Allow Price Notes | Toggle | On | Vendors can add notes to pricing | On/Off |

**Section 2: Currency & Validity**

| Setting | Type | Default | Description | Validation |
|---------|------|---------|-------------|------------|
| Allowed Currencies | Multi-select | USD, THB | Currencies vendors can use | At least 1 required |
| Default Currency | Dropdown | USD | Pre-selected currency in portal | Must be in allowed list |
| Require Validity Period | Toggle | On | Vendors must specify price validity dates | On/Off |
| Default Validity Days | Number | 90 | Default number of days for price validity | 1-365 days |
| Allow Open-Ended | Toggle | On | Allow prices without end date | On/Off |

**Section 3: Units of Measure**

| Setting | Type | Default | Description | Behavior |
|---------|------|---------|-------------|----------|
| Unit Mode | Radio | Product Default | How to handle units | See options below |
| Custom Unit List | Multi-select | - | Specific units to allow (if Custom mode) | Searchable dropdown |
| Require Unit Conversion | Toggle | Off | Vendors must provide conversion rates | On/Off |

**Unit Mode Options**:
- `Product Default` - Use each product's base unit only
- `Allow All Units` - Vendors can use any system unit
- `Custom Unit List` - Restrict to specific units selected below
- `Per-Product Configuration` - Set allowed units per product

**Section 4: Submission Requirements**

| Setting | Type | Default | Description | Impact |
|---------|------|---------|-------------|--------|
| Require All Products | Toggle | Off | Vendors must price all products | Campaign validation |
| Minimum Products | Number | 0 | Minimum products required | 0 = no minimum |
| Allow Partial Submission | Toggle | On | Save incomplete submissions | Draft vs complete |
| Require Attachments | Toggle | Off | Vendors must upload documents | Submission validation |
| Attachment Types | Multi-select | - | Allowed file types | PDF, Excel, Image |

**Section 5: Data Collection Options**

| Setting | Type | Default | Description | Usage |
|---------|------|---------|-------------|-------|
| Collect Brand Names | Toggle | Off | Ask for brand/manufacturer | Product detail |
| Collect Lead Time | Toggle | On | Ask for delivery lead time | Logistics |
| Collect MOQ Reason | Toggle | Off | Ask why MOQ is set | Vendor insight |
| Collect Stock Availability | Toggle | Off | Ask current stock status | Fulfillment |

### Step 4: Custom Fields

#### Section Header
**Title**: `Custom Fields`
**Description**: `Add custom fields to collect additional information from vendors beyond standard pricing data.`

#### Custom Fields Builder

**Interface Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Custom Fields (0 fields added)                                 │
│                                                                  │
│  [+ Add Custom Field]                                           │
│                                                                  │
│  No custom fields added yet. Add fields to collect additional   │
│  information from vendors.                                       │
└─────────────────────────────────────────────────────────────────┘
```

**After Adding Fields**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Custom Fields (3 fields added)                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Product Origin Country                                 │  │
│  │    Type: Dropdown | Required: Yes                         │  │
│  │    Options: Thailand, Vietnam, China, USA, Other          │  │
│  │    [Edit] [Move Up] [Move Down] [Delete]                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. Halal Certified                                        │  │
│  │    Type: Yes/No | Required: No                            │  │
│  │    Help Text: Is this product halal certified?            │  │
│  │    [Edit] [Move Up] [Move Down] [Delete]                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 3. Special Handling Instructions                          │  │
│  │    Type: Long Text | Required: No                         │  │
│  │    Max Length: 500 characters                             │  │
│  │    [Edit] [Move Up] [Move Down] [Delete]                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [+ Add Custom Field]                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Add/Edit Custom Field Dialog

**Dialog Title**: `Add Custom Field` or `Edit Custom Field`

**Dialog Fields**:

| Field Label | Type | Required | Description |
|-------------|------|----------|-------------|
| Field Label | Text | Yes | Display name for this field |
| Field Key | Text | Yes | Unique identifier (auto-generated, editable) |
| Field Type | Dropdown | Yes | Type of data to collect |
| Help Text | Text | No | Instructions shown to vendors |
| Required | Toggle | No | Whether vendors must fill this field |
| Apply To | Radio | Yes | All products or specific products |

**Field Type Options**:
- `Short Text` - Single line text input (e.g., brand name)
- `Long Text` - Multi-line text area (e.g., special instructions)
- `Number` - Numeric input (e.g., shelf life days)
- `Dropdown` - Single selection from options
- `Multi-Select` - Multiple selections from options
- `Yes/No` - Boolean toggle
- `Date` - Date picker
- `File Upload` - Document attachment

**Type-Specific Configuration**:

**For Short Text**:
- Min Length: __ characters
- Max Length: __ characters (default: 100)
- Pattern/Format: [Text/Email/URL/Custom Regex]

**For Long Text**:
- Min Length: __ characters
- Max Length: __ characters (default: 500)

**For Number**:
- Min Value: __
- Max Value: __
- Decimal Places: [0/1/2/3/4]
- Unit: __ (optional, e.g., "days", "kg", "%")

**For Dropdown/Multi-Select**:
- Options List: (one per line)
  ```
  Option 1
  Option 2
  Option 3
  ```
- Allow Other: [Toggle] (Vendors can add custom option)

**For File Upload**:
- Allowed File Types: [PDF] [Excel] [Image] [All]
- Max File Size: __ MB (default: 10 MB)

**Apply To Options**:
- `All Products` - Field appears for every product
- `Specific Products` - Field appears only for selected products
- `Specific Categories` - Field appears for products in selected categories

**Dialog Actions**:
- `Cancel` - Close without saving
- `Save Field` - Add/update custom field

### Step 5: Review & Finalize

#### Section Header
**Title**: `Review Template`
**Description**: `Review your template configuration before saving. You can edit any section by clicking the Edit button.`

#### Review Sections

**Section 1: Template Information**
```
┌─────────────────────────────────────────────────────────────┐
│  Template Information                              [Edit]    │
├─────────────────────────────────────────────────────────────┤
│  Name: Standard Food & Beverage Pricelist                   │
│  Description: Use this template for quarterly food and...   │
│  Template Code: FB-STD-2024                                  │
│  Primary Category: Food & Beverage                           │
│  Status: Active                                              │
│  Tags: food, quarterly, standard, 2024                       │
└─────────────────────────────────────────────────────────────┘
```

**Section 2: Products Summary**
```
┌─────────────────────────────────────────────────────────────┐
│  Products (45 selected)                            [Edit]    │
├─────────────────────────────────────────────────────────────┤
│  Categories: 3                                               │
│  • Food & Beverage: 35 products                             │
│    - Food Items: 25 products                                │
│    - Beverages: 10 products                                 │
│  • Kitchen Supplies: 8 products                             │
│  • Packaging Materials: 2 products                          │
│                                                              │
│  Required Products: 12                                       │
│  Optional Products: 33                                       │
│                                                              │
│  [View Product List]                                         │
└─────────────────────────────────────────────────────────────┘
```

**Section 3: Settings Summary**
```
┌─────────────────────────────────────────────────────────────┐
│  Template Settings                                 [Edit]    │
├─────────────────────────────────────────────────────────────┤
│  Pricing Requirements:                                       │
│  ✓ Unit Price Required                                       │
│  ✓ MOQ Required (up to 5 tiers allowed)                     │
│  ✓ Allow FOC promotional quantities                         │
│  ✓ Allow vendor price notes                                 │
│                                                              │
│  Currency & Validity:                                        │
│  • Allowed Currencies: USD, THB                             │
│  • Default Currency: USD                                     │
│  • Default Validity: 90 days                                │
│  ✓ Allow open-ended validity                                │
│                                                              │
│  Units of Measure:                                           │
│  • Unit Mode: Product Default                               │
│                                                              │
│  Submission Requirements:                                    │
│  • Minimum Products: 30 (out of 45)                         │
│  ✓ Allow partial submissions (drafts)                       │
│  ✓ Require vendor attachments                               │
│                                                              │
│  Data Collection:                                            │
│  ✓ Collect delivery lead time                               │
│  ✓ Collect brand names                                      │
└─────────────────────────────────────────────────────────────┘
```

**Section 4: Custom Fields Summary**
```
┌─────────────────────────────────────────────────────────────┐
│  Custom Fields (3 fields)                          [Edit]    │
├─────────────────────────────────────────────────────────────┤
│  1. Product Origin Country (Dropdown, Required)              │
│  2. Halal Certified (Yes/No, Optional)                       │
│  3. Special Handling Instructions (Long Text, Optional)      │
└─────────────────────────────────────────────────────────────┘
```

#### Pre-Save Validation Checklist

**Validation Panel**:
```
┌─────────────────────────────────────────────────────────────┐
│  Template Validation                                         │
├─────────────────────────────────────────────────────────────┤
│  ✓ Template name is unique                                   │
│  ✓ At least 1 product selected                              │
│  ✓ At least 1 currency selected                             │
│  ✓ All required fields completed                            │
│  ✓ Custom field keys are unique                             │
│  ✓ No validation errors                                      │
│                                                              │
│  ⚠ Recommendations:                                          │
│  • Consider adding more products to increase vendor options  │
│  • Review MOQ settings - currently allows up to 5 tiers     │
└─────────────────────────────────────────────────────────────┘
```

**If Validation Fails**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Template Validation Failed                               │
├─────────────────────────────────────────────────────────────┤
│  Please fix the following errors:                            │
│                                                              │
│  ❌ Template name "Standard Template" already exists         │
│     → Go to Template Information                            │
│                                                              │
│  ❌ No products selected                                     │
│     → Go to Select Products                                 │
│                                                              │
│  ❌ Custom field "origin" has duplicate key                  │
│     → Go to Custom Fields                                   │
└─────────────────────────────────────────────────────────────┘
```

#### Review Actions

**Action Buttons** (bottom of page):
```
[← Back to Custom Fields]  [Save as Draft]  [Save & Activate Template →]
```

**Save as Draft**:
- Status set to "Draft"
- Template not available for campaigns
- Can continue editing later
- Success message: "Template saved as draft"

**Save & Activate Template**:
- Status set to "Active"
- Template immediately available for campaigns
- Opens preview modal after save
- Success message: "Template activated successfully"

---

## Advanced Mode: Tabbed Layout

### Tab Navigation

**Tab Bar**:
```
[Template Info] [Products (45)] [Settings] [Custom Fields (3)] [Preview]
```

**Tab Indicators**:
- Active tab: Bold text, blue underline
- Tabs with content: Badge count in parentheses
- Tabs with errors: Red dot indicator

**Each Tab**: Contains the same sections as wizard steps, but all on one scrollable page

**Auto-Save**: Changes saved automatically every 30 seconds in advanced mode

**Unsaved Changes Indicator**:
```
⚠ You have unsaved changes  [Save Now] [Discard]
```

---

## Product Selection Interface

### Detailed Product Configuration

**When Clicking Product Options (⋮) → "Edit Product Details"**:

**Dialog: Product Template Settings**

```
┌──────────────────────────────────────────────────────────────┐
│  Product Template Settings: Chicken Breast (Fresh)           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Display Settings                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Custom Label (optional):                                 │ │
│  │ [Override product name for this template]               │ │
│  │                                                          │ │
│  │ Description for Vendors:                                │ │
│  │ [Add specific instructions or notes]                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Pricing Requirements                                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ☑ Required Product                                       │ │
│  │   Vendors must provide pricing for this product          │ │
│  │                                                          │ │
│  │ ☑ Require MOQ                                            │ │
│  │ ☐ Require Multi-Tier MOQ (override template setting)    │ │
│  │ ☐ Require FOC Quantity                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Unit Configuration                                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Default Unit: [KG ▾]                                     │ │
│  │                                                          │ │
│  │ Allowed Units:                                           │ │
│  │ ☑ KG  ☑ G  ☑ LB  ☐ OZ  ☐ Piece                         │ │
│  │                                                          │ │
│  │ ☐ Require Unit Conversion Rates                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Quality Parameters (optional)                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Minimum Quality Grade: [Grade A ▾]                       │ │
│  │ Shelf Life Requirement: [30] days minimum                │ │
│  │ Halal/Kosher: [Any ▾]                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Cancel]  [Save Settings]                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Template Settings

### Advanced Settings Panel

**Expandable Section: "Advanced Pricing Rules"**

```
┌─────────────────────────────────────────────────────────────┐
│  ▼ Advanced Pricing Rules                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Price Validation Rules                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Enable price range validation                        │ │
│  │                                                         │ │
│  │   Warn if price is:                                     │ │
│  │   ☑ More than [20]% higher than historical average     │ │
│  │   ☑ More than [30]% lower than historical average      │ │
│  │   ☑ Outside market range (if available)                │ │
│  │                                                         │ │
│  │ ☑ Require justification for unusual prices             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  MOQ Tier Validation                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Enforce ascending MOQ quantities                     │ │
│  │ ☑ Enforce descending unit prices                       │ │
│  │                                                         │ │
│  │   Minimum tier discount: [5]% per tier                 │ │
│  │   (Warn if next tier discount is less than this)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Competitive Analysis                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Compare with previous campaign pricing               │ │
│  │ ☑ Compare with other vendor submissions                │ │
│  │ ☑ Flag prices that are outliers                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Expandable Section: "Vendor Instructions"**

```
┌─────────────────────────────────────────────────────────────┐
│  ▼ Vendor Instructions                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  General Instructions (shown on portal home)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Please provide your best pricing for the products      │ │
│  │ listed. Ensure all MOQ and unit price information is   │ │
│  │ accurate and current.                                   │ │
│  │                                                         │ │
│  │ [Edit Instructions]                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pricing Guidelines (shown during pricing entry)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • All prices should be in USD unless specified         │ │
│  │ • Include delivery costs in unit price                 │ │
│  │ • Prices valid for at least 90 days                    │ │
│  │                                                         │ │
│  │ [Edit Guidelines]                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Help Resources                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ☑ Show pricing guide link                              │ │
│  │   Guide URL: [https://...]                             │ │
│  │                                                         │ │
│  │ ☑ Show contact for questions                           │ │
│  │   Contact Name: [John Smith]                           │ │
│  │   Contact Email: [john.smith@example.com]              │ │
│  │   Contact Phone: [+66 2 123 4567]                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Template Preview

### Preview Modal

**Modal Title**: `Template Preview: Standard Food & Beverage Pricelist`

**Modal Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│  Template Preview                                       [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  View As:  (•) Vendor Portal View  ( ) Excel Template        │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                           ││
│  │  [VENDOR PORTAL PREVIEW]                                 ││
│  │                                                           ││
│  │  Standard Food & Beverage Pricelist                      ││
│  │  Price Collection Campaign                               ││
│  │                                                           ││
│  │  Campaign Period: 15 Jan 2024 - 31 Jan 2024             ││
│  │  Deadline: 31 Jan 2024, 5:00 PM                         ││
│  │                                                           ││
│  │  Please provide pricing for the following products:      ││
│  │                                                           ││
│  │  Products: 45 items across 3 categories                 ││
│  │  Required Products: 12                                   ││
│  │                                                           ││
│  │  [Category Filter ▾]  [Search Products...]              ││
│  │                                                           ││
│  │  ┌────────────────────────────────────────────────────┐ ││
│  │  │ Food Items (25 products)                            │ ││
│  │  │                                                      │ ││
│  │  │ 1. Chicken Breast (Fresh) *REQUIRED                 │ ││
│  │  │    Base Unit: KG                                    │ ││
│  │  │    [Enter Pricing]                                  │ ││
│  │  │                                                      │ ││
│  │  │ 2. Salmon Fillet (Fresh) *REQUIRED                  │ ││
│  │  │    Base Unit: KG                                    │ ││
│  │  │    [Enter Pricing]                                  │ ││
│  │  │                                                      │ ││
│  │  │ ... (scrollable list)                               │ ││
│  │  └────────────────────────────────────────────────────┘ ││
│  │                                                           ││
│  │  Custom Fields:                                          ││
│  │  • Product Origin Country (required)                    ││
│  │  • Halal Certified (optional)                           ││
│  │  • Special Handling Instructions (optional)             ││
│  │                                                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  [Download Excel Template]  [Close Preview]                  │
└──────────────────────────────────────────────────────────────┘
```

### Excel Template Preview

**When View As: Excel Template**:

```
┌──────────────────────────────────────────────────────────────┐
│  Template Preview                                       [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  View As:  ( ) Vendor Portal View  (•) Excel Template        │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Excel Preview (Read-Only)                                ││
│  │                                                           ││
│  │ Sheet: Instructions                                      ││
│  │ ┌────────────────────────────────────────────────────┐  ││
│  │ │ Standard Food & Beverage Pricelist                  │  ││
│  │ │                                                      │  ││
│  │ │ Instructions:                                        │  ││
│  │ │ 1. Fill in pricing for each product row            │  ││
│  │ │ 2. Ensure all required fields are completed        │  ││
│  │ │ 3. Upload completed file before deadline           │  ││
│  │ │                                                      │  ││
│  │ │ Required Fields:                                    │  ││
│  │ │ • Product Code                                      │  ││
│  │ │ • Unit Price                                        │  ││
│  │ │ • Currency                                          │  ││
│  │ │ • Minimum Order Quantity (MOQ)                     │  ││
│  │ │ • Unit of Measure                                   │  ││
│  │ └────────────────────────────────────────────────────┘  ││
│  │                                                           ││
│  │ Sheet: Products & Pricing                                ││
│  │ ┌────────────────────────────────────────────────────┐  ││
│  │ │ Product | Unit | Unit Price | Currency | MOQ | ... │  ││
│  │ │ Code    |      |             |          | Qty |     │  ││
│  │ ├────────────────────────────────────────────────────┤  ││
│  │ │ CHK-001 | KG   |             | USD      |     |     │  ││
│  │ │ SLM-002 | KG   |             | USD      |     |     │  ││
│  │ │ ...                                                  │  ││
│  │ └────────────────────────────────────────────────────┘  ││
│  │                                                           ││
│  │ [Switch to Sheet: Custom Fields]                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  [Download Full Excel File]  [Close Preview]                 │
└──────────────────────────────────────────────────────────────┘
```

**Excel Download Includes**:
- **Sheet 1**: Instructions and guidelines
- **Sheet 2**: Products & Pricing (with data validation)
- **Sheet 3**: Custom Fields (if any)
- **Sheet 4**: Reference Data (currencies, units, dropdown options)

---

## Dialogs and Modals

### Dialog 1: Create Template

**Dialog Title**: `Create New Template`

**Quick Start Options**:
```
┌──────────────────────────────────────────────────────────────┐
│  Create New Template                                    [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Choose how to create your template:                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ( ) Start from Scratch                                  │  │
│  │     Create a new template from beginning                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ( ) Copy Existing Template                              │  │
│  │     Start with a copy of an existing template           │  │
│  │                                                          │  │
│  │     Select template: [Standard F&B Template ▾]          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ( ) Import from File                                     │  │
│  │     Upload a template JSON file                         │  │
│  │                                                          │  │
│  │     [Choose File] No file selected                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ( ) Use Quick Template                                  │  │
│  │     Select from pre-built templates                     │  │
│  │                                                          │  │
│  │     [Basic Pricing Template ▾]                          │  │
│  │     - Basic Pricing Template                            │  │
│  │     - Food & Beverage Standard                          │  │
│  │     - Comprehensive Product Catalog                     │  │
│  │     - Seasonal Campaign Template                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Cancel]  [Continue →]                                       │
└──────────────────────────────────────────────────────────────┘
```

**Behavior**:
- Radio button selection
- "Continue" button enabled only when option selected
- Continue opens wizard or advanced editor based on user preference

### Dialog 2: Duplicate Template

**Dialog Title**: `Duplicate Template`

```
┌──────────────────────────────────────────────────────────────┐
│  Duplicate Template: Standard Food & Beverage Pricelist [✕]  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Create a copy of this template with a new name.              │
│                                                               │
│  New Template Name: *                                         │
│  [Copy of Standard Food & Beverage Pricelist_____________]   │
│                                                               │
│  What to copy:                                                │
│  ☑ Template Information (name, description, tags)            │
│  ☑ Product Selection (all 45 products)                       │
│  ☑ Template Settings                                         │
│  ☑ Custom Fields (3 fields)                                  │
│                                                               │
│  New Template Status:                                         │
│  ( ) Active - Ready to use immediately                        │
│  (•) Draft - Save as draft for review                        │
│  ( ) Inactive - Save but don't activate                       │
│                                                               │
│  ☑ Open new template for editing after creation              │
│                                                               │
│  [Cancel]  [Duplicate Template]                               │
└──────────────────────────────────────────────────────────────┘
```

**Validation**:
- Template name must be unique
- At least one "What to copy" option must be selected
- Default name: "Copy of [Original Name]"

### Dialog 3: Delete Template Confirmation

**Dialog Title**: `Delete Template`

**Standard Delete**:
```
┌──────────────────────────────────────────────────────────────┐
│  Delete Template?                                       [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ⚠ Are you sure you want to delete this template?            │
│                                                               │
│  Template: Standard Food & Beverage Pricelist                │
│  Products: 45                                                 │
│  Custom Fields: 3                                             │
│                                                               │
│  This action cannot be undone. The template will be           │
│  permanently deleted.                                         │
│                                                               │
│  Template Usage:                                              │
│  • Used in 0 active campaigns                                │
│  • Used in 3 completed campaigns                             │
│                                                               │
│  Historical campaign data will be preserved.                  │
│                                                               │
│  [Cancel]  [Delete Template]                                  │
└──────────────────────────────────────────────────────────────┘
```

**Template In Use** (Cannot Delete):
```
┌──────────────────────────────────────────────────────────────┐
│  Cannot Delete Template                                 [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ❌ This template cannot be deleted because it is             │
│     currently in use by active campaigns.                    │
│                                                               │
│  Template: Standard Food & Beverage Pricelist                │
│                                                               │
│  Active Campaigns Using This Template:                        │
│  • Q1 2024 Food & Beverage Pricing (ends 31 Jan 2024)       │
│  • Weekly Produce Pricing (recurring, next: 29 Jan 2024)    │
│                                                               │
│  You can:                                                     │
│  • Wait until campaigns are completed                        │
│  • Cancel campaigns before deleting template                 │
│  • Deactivate template to prevent new campaign usage         │
│                                                               │
│  [View Campaigns]  [Deactivate Template]  [Close]            │
└──────────────────────────────────────────────────────────────┘
```

### Dialog 4: Activate/Deactivate Template

**Activate Template**:
```
┌──────────────────────────────────────────────────────────────┐
│  Activate Template                                      [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Activate "Standard Food & Beverage Pricelist"?              │
│                                                               │
│  Template Status: Draft → Active                             │
│                                                               │
│  ✓ Template validation passed                                │
│  ✓ All required fields configured                            │
│  ✓ 45 products selected                                      │
│  ✓ No validation errors                                      │
│                                                               │
│  Once activated, this template will be:                       │
│  • Available for selection when creating campaigns           │
│  • Visible to all staff members                              │
│  • Ready for immediate use                                   │
│                                                               │
│  [Cancel]  [Activate Template]                                │
└──────────────────────────────────────────────────────────────┘
```

**Deactivate Template**:
```
┌──────────────────────────────────────────────────────────────┐
│  Deactivate Template                                    [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Deactivate "Standard Food & Beverage Pricelist"?            │
│                                                               │
│  Template Status: Active → Inactive                          │
│                                                               │
│  Once deactivated, this template will:                        │
│  • Not be available for new campaigns                        │
│  • Remain in template list but marked inactive               │
│  • Continue to work for existing campaigns                   │
│  • Can be reactivated at any time                            │
│                                                               │
│  Current Usage:                                               │
│  • 2 active campaigns                                        │
│  • 5 completed campaigns                                     │
│                                                               │
│  ⚠ Active campaigns will not be affected.                    │
│                                                               │
│  Reason for deactivation (optional):                          │
│  [_________________________________________________]          │
│                                                               │
│  [Cancel]  [Deactivate Template]                              │
└──────────────────────────────────────────────────────────────┘
```

### Dialog 5: Archive Template

```
┌──────────────────────────────────────────────────────────────┐
│  Archive Template                                       [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Archive "Standard Food & Beverage Pricelist"?               │
│                                                               │
│  Template Status: Active → Archived                          │
│                                                               │
│  Archived templates:                                          │
│  • Cannot be used for new campaigns                          │
│  • Are hidden from template lists by default                 │
│  • Preserve all campaign history                             │
│  • Can be restored if needed                                 │
│                                                               │
│  Current Usage:                                               │
│  • 0 active campaigns                                        │
│  • 12 completed campaigns                                    │
│                                                               │
│  Reason for archiving (optional):                             │
│  [Replaced by new 2024 template version______________]       │
│                                                               │
│  [Cancel]  [Archive Template]                                 │
└──────────────────────────────────────────────────────────────┘
```

### Dialog 6: Import Template

**Dialog Title**: `Import Template`

```
┌──────────────────────────────────────────────────────────────┐
│  Import Template                                        [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Upload a template file to import                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │         [📁 Drag & drop file here]                      │  │
│  │                    or                                   │  │
│  │              [Choose File]                              │  │
│  │                                                         │  │
│  │         Accepted formats: .json                         │  │
│  │         Maximum file size: 10 MB                        │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Import Options:                                              │
│  ☑ Validate template structure before import                 │
│  ☑ Check for duplicate product codes                         │
│  ☐ Auto-activate after successful import                     │
│                                                               │
│  [Cancel]  [Import Template]                                  │
└──────────────────────────────────────────────────────────────┘
```

**After File Selected**:
```
┌──────────────────────────────────────────────────────────────┐
│  Import Template                                        [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  File Selected: standard_template_export.json (45 KB)        │
│                                                               │
│  Template Preview:                                            │
│  Name: Standard Food & Beverage Pricelist                    │
│  Products: 45                                                 │
│  Categories: 3                                                │
│  Custom Fields: 3                                             │
│  Created: 15 Dec 2023                                         │
│                                                               │
│  Validation Status:                                           │
│  ✓ Valid JSON structure                                      │
│  ✓ All required fields present                               │
│  ✓ Product codes valid                                       │
│  ⚠ Warning: 2 products not found in system                   │
│                                                               │
│  Missing Products:                                            │
│  • Product Code: ABC-999 (will be skipped)                   │
│  • Product Code: XYZ-888 (will be skipped)                   │
│                                                               │
│  Import Options:                                              │
│  ☑ Validate template structure before import                 │
│  ☑ Check for duplicate product codes                         │
│  ☐ Auto-activate after successful import                     │
│                                                               │
│  New Template Name (if different):                            │
│  [Standard Food & Beverage Pricelist_____________]           │
│                                                               │
│  [Cancel]  [Import Template]                                  │
└──────────────────────────────────────────────────────────────┘
```

### Dialog 7: Export Templates

**Dialog Title**: `Export Templates`

```
┌──────────────────────────────────────────────────────────────┐
│  Export Templates                                       [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Select templates to export:                                  │
│                                                               │
│  ☑ Standard Food & Beverage Pricelist (45 products)         │
│  ☑ Kitchen Supplies Template (30 products)                   │
│  ☐ Cleaning Supplies Template (15 products)                  │
│  ☐ Seasonal Campaign Template (60 products)                  │
│                                                               │
│  [Select All]  [Select None]                                 │
│                                                               │
│  Export Format:                                               │
│  (•) JSON (recommended for import)                            │
│  ( ) Excel Workbook (.xlsx)                                   │
│  ( ) CSV (products only, no settings)                         │
│                                                               │
│  Export Options:                                              │
│  ☑ Include product details                                   │
│  ☑ Include custom fields                                     │
│  ☑ Include template settings                                 │
│  ☐ Include usage history                                     │
│                                                               │
│  Export will include 2 templates with 75 total products.     │
│                                                               │
│  [Cancel]  [Export Templates]                                 │
└──────────────────────────────────────────────────────────────┘
```

### Dialog 8: Template Testing

**Dialog Title**: `Test Template`

```
┌──────────────────────────────────────────────────────────────┐
│  Test Template: Standard Food & Beverage Pricelist     [✕]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Test how this template will work in a real campaign          │
│                                                               │
│  Test Scenario:                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Select Vendor: [Vendor Name ▾]                          │  │
│  │ (Choose a vendor to simulate their experience)          │  │
│  │                                                          │  │
│  │ Test Mode: (•) Portal View  ( ) Excel Upload            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Template Validation Checks:                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✓ All products exist in system                          │  │
│  │ ✓ All units of measure valid                            │  │
│  │ ✓ Custom fields properly configured                     │  │
│  │ ✓ Pricing rules are valid                               │  │
│  │ ✓ Excel template can be generated                       │  │
│  │ ⚠ 3 products missing vendor history (may affect         │  │
│  │   price comparison)                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Test Actions:                                                │
│  [Generate Test Portal Link]  [Download Test Excel]          │
│                                                               │
│  [Close]                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Status Messages

### Success Messages

**Template Created**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template created successfully                            │
│                                                              │
│  "Standard Food & Beverage Pricelist" is now active and     │
│  ready to use in campaigns.                                 │
│                                                              │
│  [View Template]  [Create Campaign]  [Dismiss]              │
└─────────────────────────────────────────────────────────────┘
```

**Template Updated**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template updated successfully                            │
│                                                              │
│  Your changes have been saved. Active campaigns using this  │
│  template will not be affected.                             │
│                                                              │
│  [Dismiss]                                                   │
└─────────────────────────────────────────────────────────────┘
```

**Template Duplicated**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template duplicated successfully                         │
│                                                              │
│  "Copy of Standard Food & Beverage Pricelist" has been      │
│  created. You can now edit it independently.                │
│                                                              │
│  [Edit New Template]  [Dismiss]                             │
└─────────────────────────────────────────────────────────────┘
```

**Template Deleted**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template deleted                                          │
│                                                              │
│  "Standard Food & Beverage Pricelist" has been permanently  │
│  deleted. Historical campaign data has been preserved.       │
│                                                              │
│  [Undo Delete (10s)]  [Dismiss]                             │
└─────────────────────────────────────────────────────────────┘
```
**Note**: Undo available for 10 seconds after deletion

**Template Activated**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template activated                                        │
│                                                              │
│  "Standard Food & Beverage Pricelist" is now available for  │
│  use in campaigns.                                           │
│                                                              │
│  [Create Campaign]  [Dismiss]                               │
└─────────────────────────────────────────────────────────────┘
```

**Template Imported**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template imported successfully                           │
│                                                              │
│  "Imported Food & Beverage Template" has been added.        │
│  43 of 45 products imported successfully.                   │
│  2 products were skipped (not found in system).             │
│                                                              │
│  [View Template]  [View Import Log]  [Dismiss]              │
└─────────────────────────────────────────────────────────────┘
```

**Bulk Operation Complete**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Bulk operation completed                                 │
│                                                              │
│  3 templates activated successfully                          │
│                                                              │
│  [View Templates]  [Dismiss]                                │
└─────────────────────────────────────────────────────────────┘
```

### Error Messages

**Template Name Conflict**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Cannot save template                                     │
│                                                              │
│  A template with the name "Standard Food & Beverage         │
│  Pricelist" already exists.                                 │
│                                                              │
│  Please choose a different name or edit the existing        │
│  template.                                                   │
│                                                              │
│  [Edit Existing Template]  [Change Name]  [Dismiss]         │
└─────────────────────────────────────────────────────────────┘
```

**No Products Selected**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Template validation failed                               │
│                                                              │
│  You must select at least 1 product for this template.      │
│                                                              │
│  [Go to Product Selection]  [Dismiss]                       │
└─────────────────────────────────────────────────────────────┘
```

**Invalid Custom Field**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Invalid custom field configuration                       │
│                                                              │
│  Custom field "Product Origin" has duplicate key "origin".   │
│  Field keys must be unique.                                 │
│                                                              │
│  [Go to Custom Fields]  [Dismiss]                           │
└─────────────────────────────────────────────────────────────┘
```

**Template In Use - Cannot Delete**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Cannot delete template                                   │
│                                                              │
│  This template is currently in use by 2 active campaigns     │
│  and cannot be deleted.                                      │
│                                                              │
│  You can deactivate it to prevent new usage or wait until   │
│  campaigns are completed.                                    │
│                                                              │
│  [View Campaigns]  [Deactivate Template]  [Dismiss]         │
└─────────────────────────────────────────────────────────────┘
```

**Import Failed**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Template import failed                                   │
│                                                              │
│  The uploaded file is not a valid template format.          │
│                                                              │
│  Error: Invalid JSON structure at line 45                   │
│                                                              │
│  Please check the file format and try again.                │
│                                                              │
│  [View Error Details]  [Try Again]  [Dismiss]               │
└─────────────────────────────────────────────────────────────┘
```

**Save Failed - Network Error**:
```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Failed to save template                                  │
│                                                              │
│  A network error occurred while saving your template.       │
│  Your changes have been saved locally.                       │
│                                                              │
│  [Retry Save]  [Save as Draft]  [Dismiss]                   │
└─────────────────────────────────────────────────────────────┘
```

### Warning Messages

**Unsaved Changes**:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Unsaved changes                                           │
│                                                              │
│  You have unsaved changes. Do you want to save before       │
│  leaving?                                                    │
│                                                              │
│  [Save Changes]  [Discard Changes]  [Cancel]                │
└─────────────────────────────────────────────────────────────┘
```

**Large Template Warning**:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Large template notice                                     │
│                                                              │
│  This template contains 150 products. Large templates may:   │
│  • Take longer for vendors to complete                      │
│  • Result in lower submission rates                         │
│  • Require more time to review                              │
│                                                              │
│  Consider splitting into smaller category-specific          │
│  templates for better vendor experience.                     │
│                                                              │
│  [Continue]  [Split Template]  [Dismiss]                    │
└─────────────────────────────────────────────────────────────┘
```

**Duplicate Products Warning**:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Duplicate products detected                               │
│                                                              │
│  The following products appear multiple times in different   │
│  categories:                                                 │
│                                                              │
│  • Chicken Breast (Fresh) - appears in "Meat" and "Protein"│
│  • Salt - appears in "Condiments" and "Ingredients"         │
│                                                              │
│  This may confuse vendors. Consider removing duplicates.     │
│                                                              │
│  [Review Products]  [Auto-Remove Duplicates]  [Keep All]    │
└─────────────────────────────────────────────────────────────┘
```

**Template Validation Warning**:
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Template validation warnings                              │
│                                                              │
│  The following issues were found (template can still be      │
│  saved):                                                     │
│                                                              │
│  • 5 products have no vendor pricing history                │
│  • Custom field "Origin Country" has no default value       │
│  • MOQ tier limit set to 10 (recommended max: 5)           │
│                                                              │
│  These may affect vendor experience and submission quality.  │
│                                                              │
│  [Review Issues]  [Save Anyway]  [Cancel]                   │
└─────────────────────────────────────────────────────────────┘
```

### Info Messages

**Auto-Save Notice**:
```
┌─────────────────────────────────────────────────────────────┐
│  ℹ️ Changes saved automatically                              │
│                                                              │
│  Last saved: 2 minutes ago                                   │
│                                                              │
│  [Dismiss]                                                   │
└─────────────────────────────────────────────────────────────┘
```
**Display**: Subtle toast notification in bottom-right corner

**Template Usage Info**:
```
┌─────────────────────────────────────────────────────────────┐
│  ℹ️ Template usage                                           │
│                                                              │
│  This template is currently used in 3 campaigns:             │
│  • Q1 2024 Food Pricing (Active)                            │
│  • Weekly Produce (Recurring)                               │
│  • January Special (Completed)                              │
│                                                              │
│  Editing this template will not affect existing campaigns.  │
│                                                              │
│  [View Campaigns]  [Dismiss]                                │
└─────────────────────────────────────────────────────────────┘
```

**Product Update Notice**:
```
┌─────────────────────────────────────────────────────────────┐
│  ℹ️ Product information updated                              │
│                                                              │
│  3 products in this template have been updated in the        │
│  product catalog since this template was created.            │
│                                                              │
│  Updated products:                                           │
│  • Chicken Breast (Fresh) - unit changed KG → LB            │
│  • Olive Oil - category updated                             │
│  • Rice (Jasmine) - description modified                    │
│                                                              │
│  [Review Changes]  [Update Template]  [Dismiss]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading States

### Page Load

**Initial Page Load**:
```
┌─────────────────────────────────────────────────────────────┐
│  Pricelist Templates                                         │
│                                                              │
│  [Loading templates...]                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │ │
│  │ ░░░░░░░░ ░░░░░░ ░░░░░░░░ ░░░░░░░                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │ │
│  │ ░░░░░░░░ ░░░░░░ ░░░░░░░░ ░░░░░░░                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │ │
│  │ ░░░░░░░░ ░░░░░░ ░░░░░░░░ ░░░░░░░                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Skeleton Loader**: Gray animated skeleton for template rows

### Template Save

**Saving Template**:
```
┌─────────────────────────────────────────────────────────────┐
│  Saving template...                                    [✕]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│            ⏳ Saving "Standard F&B Template"                 │
│                                                              │
│  ✓ Validating template structure                            │
│  ✓ Checking product availability                            │
│  ⏳ Saving template data... (45 products)                    │
│  ⏳ Creating Excel template...                               │
│  ⏳ Updating search index...                                 │
│                                                              │
│  This may take a few moments...                              │
│                                                              │
│  ████████████░░░░░░░░░░░░ 60%                               │
└─────────────────────────────────────────────────────────────┘
```

### Product Selection Load

**Loading Products**:
```
Loading products...

Category tree:
▼ ░░░░░░░░░░░░░░
  ▼ ░░░░░░░░░░
    ░░░░░░░░░░░░░░
```

**Product Search**:
```
Searching products...
[Spinner animation]
```

### Template Preview Generation

**Generating Preview**:
```
┌─────────────────────────────────────────────────────────────┐
│  Generating Template Preview...                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│            ⏳ Please wait...                                 │
│                                                              │
│  ✓ Loading template data                                    │
│  ✓ Rendering product list                                   │
│  ⏳ Applying custom fields...                                │
│  ⏳ Generating Excel preview...                              │
│                                                              │
│  ████████░░░░░░░░ 50%                                        │
└─────────────────────────────────────────────────────────────┘
```

### Excel Download

**Preparing Download**:
```
┌─────────────────────────────────────────────────────────────┐
│  Preparing Excel Template...                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏳ Generating Excel file...                                 │
│                                                              │
│  ✓ Creating worksheets                                      │
│  ⏳ Adding products (45 of 45)                               │
│  ⏳ Formatting cells and data validation                     │
│  ⏳ Finalizing file...                                       │
│                                                              │
│  Your download will start automatically...                   │
└─────────────────────────────────────────────────────────────┘
```

### Bulk Operations

**Processing Bulk Action**:
```
┌─────────────────────────────────────────────────────────────┐
│  Activating Templates...                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Processing 3 templates...                                   │
│                                                              │
│  ✓ Standard Food & Beverage Template                        │
│  ⏳ Kitchen Supplies Template                                │
│  ⏳ Cleaning Supplies Template                               │
│                                                              │
│  ████████░░░░░░░░ 33%                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Empty States

### No Templates Found

**Initial Empty State** (No templates created):
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📋                                       │
│                                                              │
│           No templates created yet                           │
│                                                              │
│  Create your first pricelist template to start collecting   │
│  vendor pricing. Templates define which products to          │
│  request pricing for.                                        │
│                                                              │
│              [+ Create First Template]                       │
│                                                              │
│  Or get started with:                                        │
│  • [Use Quick Template]                                      │
│  • [Import Template from File]                               │
│  • [View Template Guide]                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Search Results

**Search Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     🔍                                       │
│                                                              │
│        No templates found matching "food items"              │
│                                                              │
│  Try:                                                        │
│  • Checking your spelling                                   │
│  • Using different keywords                                 │
│  • Removing filters                                         │
│  • Searching for template codes or descriptions             │
│                                                              │
│           [Clear Search] [Clear All Filters]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Products Selected

**Product Selection Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│  Selected Products                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     📦                                       │
│                                                              │
│              No products selected yet                        │
│                                                              │
│  Select products from the category tree on the left, or:     │
│                                                              │
│  • [Quick Add by Product Code]                              │
│  • [Import from CSV]                                         │
│  • [Copy from Another Template]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Custom Fields

**Custom Fields Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│  Custom Fields                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     ✏️                                       │
│                                                              │
│           No custom fields added yet                         │
│                                                              │
│  Custom fields let you collect additional information       │
│  from vendors beyond standard pricing data.                 │
│                                                              │
│  Examples:                                                   │
│  • Product origin country                                   │
│  • Halal/Kosher certification                               │
│  • Lead time                                                │
│  • Minimum shelf life                                       │
│                                                              │
│              [+ Add First Custom Field]                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Active Templates

**Filter Empty State** (Active filter, no active templates):
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│              No active templates                             │
│                                                              │
│  You don't have any active templates at the moment.         │
│                                                              │
│  • [View All Templates]                                      │
│  • [Create New Template]                                     │
│  • [Activate Draft Templates]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Template Not Used

**Template Usage Empty State**:
```
┌─────────────────────────────────────────────────────────────┐
│  Template Usage                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     📊                                       │
│                                                              │
│         This template hasn't been used yet                   │
│                                                              │
│  No campaigns have used this template. Once you create       │
│  campaigns using this template, usage history will appear    │
│  here.                                                       │
│                                                              │
│            [Create Campaign with Template]                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Accessibility

### ARIA Labels

| Element | ARIA Label |
|---------|------------|
| Template list table | Templates table with {count} templates |
| Template row | Template: {name}, {product_count} products, {status} |
| Create template button | Create new pricelist template |
| Edit template button | Edit template {name} |
| Delete template button | Delete template {name} |
| Search input | Search templates by name, description, or product |
| Filter dropdown | Filter templates by {filter_type} |
| Status badge | Template status: {status} |
| Product selection tree | Product category tree, {expanded/collapsed} |
| Product checkbox | Select {product_name} for template |
| Custom field row | Custom field: {field_name}, type {field_type} |
| Wizard step indicator | Step {current} of {total}: {step_name} |
| Preview modal | Template preview for {template_name} |

### Keyboard Navigation

**Template List Navigation**:
- `↑/↓` Navigate template rows
- `Space` Select/deselect template row
- `Enter` Open selected template for editing
- `Alt + N` Create new template
- `Ctrl/Cmd + K` Focus search box
- `Tab` Navigate between filters and controls
- `Shift + F10` or `Menu Key` Open row context menu
- `Delete` Delete selected template (with confirmation)

**Form Navigation**:
- `Tab` Move to next field
- `Shift + Tab` Move to previous field
- `Space` Toggle checkboxes and switches
- `↑/↓` Navigate dropdown options
- `Enter` Submit form
- `Esc` Cancel or close dialog

**Wizard Navigation**:
- `Alt + →` Next step
- `Alt + ←` Previous step
- `Ctrl/Cmd + S` Save draft
- `Esc` Exit wizard (with confirmation if changes)

**Product Selection**:
- `↑/↓` Navigate category tree
- `→` Expand category
- `←` Collapse category
- `Space` Toggle category/product selection
- `/` Focus product search
- `Ctrl/Cmd + A` Select all visible products
- `Ctrl/Cmd + D` Deselect all products

**Dialog Navigation**:
- `Esc` Close dialog (cancel action)
- `Enter` Confirm primary action
- `Tab` Navigate dialog controls

### Screen Reader Support

**Template Row Announcement**:
```
"Template: Standard Food & Beverage Pricelist,
45 products selected,
Status: Active,
Last modified: 23 January 2024,
Created by: John Smith,
Row 1 of 24"
```

**Form Field Announcement**:
```
"Template Name, required field,
text input,
currently: Standard Food & Beverage Pricelist"
```

**Status Change Announcement**:
```
"Template activated successfully.
Standard Food & Beverage Pricelist is now available for campaigns."
```

**Product Selection Announcement**:
```
"Chicken Breast Fresh selected,
45 of 120 products now selected"
```

### Focus Management

**Focus Indicators**:
- Visible 2px blue outline on focus
- High contrast mode compatible
- Skip to main content link
- Focus trap in modals and dialogs

**Focus Return**:
- After closing dialog, focus returns to trigger button
- After deleting template, focus moves to next/previous row
- After completing wizard, focus on success message

### Color Contrast

**WCAG AA Compliance**:
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18pt+): minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio
- Status colors tested for color-blind accessibility

**Status Color Accessibility**:
- Active: Green with checkmark icon
- Inactive: Gray with circle icon
- Draft: Orange with pencil icon
- Archived: Dark gray with box icon
- Icons provide additional visual cue beyond color

### Error Identification

**Error Announcement**:
```
"Error: Template name is required.
Please enter a template name to continue."
```

**Field-Level Errors**:
- Error message appears below field
- Red border on invalid field
- Error icon next to field label
- Clear error recovery instructions

---

## Translator Notes

### General Guidelines

**Tone**: Professional, helpful, instructional
**Audience**: Procurement staff, department managers
**Context**: Enterprise ERP system for hospitality industry

**Key Terminology**:
- "Template" - Reusable pricelist structure (not "model" or "format")
- "Campaign" - Price collection campaign (not "project" or "request")
- "Product" - Item to price (not "article" or "SKU")
- "Vendor" - Supplier providing pricing (not "supplier" in UI)
- "MOQ" - Minimum Order Quantity (keep as abbreviation, explain in help text)
- "FOC" - Free of Charge (keep as abbreviation, explain in help text)

### Character Limits

| Element | Limit | Reason |
|---------|-------|--------|
| Template Name | 100 chars | Database limit, display width |
| Template Description | 500 chars | Readability, card display |
| Template Code | 20 chars | Short reference code |
| Tag | 20 chars | Chip/badge display |
| Button Label | 25 chars | Button width |
| Tab Label | 20 chars | Tab bar width |
| Dialog Title | 60 chars | Header width |
| Success Message | 200 chars | Toast notification |
| Error Message | 300 chars | Alert box with recovery |
| Help Text | 150 chars | Tooltip/help icon |
| Custom Field Label | 50 chars | Form layout |

### Cultural Considerations

**Date Formats**:
- US: MM/DD/YYYY
- International: DD/MM/YYYY or ISO 8601
- Use localized format based on user settings

**Number Formats**:
- Decimal separator: period (.) or comma (,) based on locale
- Thousands separator: comma (,) or space based on locale
- Currency symbols: position varies by locale

**Units of Measure**:
- Weight: KG (metric) or LB (imperial)
- Volume: L (metric) or GAL (imperial)
- Localize based on user's country/region settings

**Business Terminology**:
- "Procurement" may translate to "Purchasing" in some locales
- "Template" meaning varies; use consistent translation
- "Campaign" context is price collection, not marketing

### Context for Translators

**"Template"** - Reusable configuration that defines:
- Which products to request pricing for
- What information to collect (MOQ, FOC, custom fields)
- Settings and validation rules
Used repeatedly for multiple price collection campaigns.

**"Active" Status** - Template is:
- Available for creating new campaigns
- Visible to all staff members
- Fully configured and validated
- Ready for immediate use

**"Draft" Status** - Template is:
- Not finalized or validated
- Not available for campaigns
- Being edited or configured
- May have missing required information

**MOQ (Minimum Order Quantity)**:
- Smallest quantity vendor will sell
- May have multiple tiers with different prices
- Example: 100 units at $5 each, 500 units at $4.50 each

**FOC (Free of Charge)**:
- Promotional quantity given free
- Example: Buy 100, get 10 free
- Optional, not all products have FOC

### Pluralization

**Template Count**:
- 0 templates: "No templates"
- 1 template: "1 template"
- 2+ templates: "{count} templates"

**Product Count**:
- 0 products: "No products selected"
- 1 product: "1 product selected"
- 2+ products: "{count} products selected"

**Campaign Count**:
- 0 campaigns: "Never used"
- 1 campaign: "Used in 1 campaign"
- 2+ campaigns: "Used in {count} campaigns"

### Formality Level

**Address Style**:
- Formal but approachable
- Use "you" directly (not "one" or third person)
- Active voice preferred over passive
- Imperative for instructions ("Select products" not "Products should be selected")

**Example Translations**:
- ✅ "Select the products you want to include"
- ❌ "Products that are to be included should be selected"
- ✅ "Create a template to get started"
- ❌ "A template may be created in order to commence"

### Gender-Neutral Language

**User References**:
- Use role-based language: "Procurement Staff", "Manager"
- Avoid gendered pronouns unless unavoidable in target language
- Use plural "they" in English when singular pronoun needed

**Examples**:
- ✅ "The staff member can edit their template"
- ✅ "Managers can view templates they created"
- ❌ "The user can edit his template"

---

## Brand Voice Guidelines

### Voice Characteristics

**Professional but Approachable**:
- Use clear, direct language
- Avoid jargon unless necessary (explain when used)
- Helpful and instructional tone
- Confident but not condescending

**Efficient and Action-Oriented**:
- Lead with action verbs in buttons and CTAs
- Keep instructions concise and scannable
- Use bullet points for lists
- Front-load important information

**Supportive and Empowering**:
- Provide clear next steps in error messages
- Offer guidance without being prescriptive
- Celebrate successes with positive confirmation
- Assume user competence, provide help when needed

### Writing Style

**Button Labels**:
- ✅ "Create Template" (action-oriented, clear)
- ❌ "New" (vague, not action-oriented)
- ✅ "Save & Activate" (describes outcome)
- ❌ "OK" (generic, unclear)

**Error Messages**:
- ✅ "Template name is required. Please enter a name to continue."
- ❌ "Error: Required field is empty."
- Include: What went wrong, why it matters, how to fix

**Success Messages**:
- ✅ "Template created successfully. You can now use it in campaigns."
- ❌ "Success."
- Include: What was accomplished, what happens next

**Help Text**:
- ✅ "Add tags to organize templates. Press Enter after each tag."
- ❌ "Tags: separate by pressing Enter"
- Include context and clear instructions

### Consistency Standards

**Terminology**:
- Always use "template" (not "format", "model", "structure")
- Always use "campaign" (not "request", "project", "collection")
- Always use "vendor" in UI (not "supplier", though acceptable in docs)
- Always use "product" (not "item", "SKU", "article")

**Capitalization**:
- Sentence case for headers: "Template information"
- Title case for buttons: "Create Template"
- Sentence case for help text and descriptions
- ALL CAPS: Never (except abbreviations like MOQ, FOC)

**Punctuation**:
- End full sentences with periods
- No periods for button labels or short phrases
- Use colons to introduce lists or fields
- Use parentheses for clarifications: "MOQ (Minimum Order Quantity)"

**Numbers**:
- Spell out one through nine
- Use numerals for 10 and above
- Use numerals in data displays and counts
- Use commas for thousands: "1,000 products"

### Action Language

**Create**: Use for new entities
- "Create Template"
- "Create Campaign"

**Add**: Use for adding items to collections
- "Add Products"
- "Add Custom Field"

**Edit**: Use for modifying existing entities
- "Edit Template"
- "Edit Settings"

**Delete**: Use for permanent removal
- "Delete Template"
- "Delete Custom Field"

**Remove**: Use for removing from collection (not permanent deletion)
- "Remove Product"
- "Remove from Selection"

**Save**: Use for persisting changes
- "Save Template"
- "Save Changes"

**Cancel**: Use for abandoning actions
- "Cancel"
- "Discard Changes"

### Status Language

**Active**: Positive, ready state
- "This template is active and ready to use"
- Green indicator, checkmark icon

**Inactive**: Neutral, not available state
- "This template is inactive"
- Gray indicator, circle icon

**Draft**: In-progress, not ready state
- "This template is in draft"
- Orange indicator, pencil icon

**Archived**: Historical, preserved state
- "This template is archived"
- Dark gray indicator, box icon

### Error Message Framework

**Structure**: [What went wrong] + [Why it matters] + [How to fix]

**Example**:
```
What: "Template name 'Standard Template' already exists"
Why: [Implicit - names must be unique]
How: "Please choose a different name or edit the existing template."
```

**Tone**:
- ✅ "We couldn't save your template because..."
- ❌ "System error: Save operation failed"
- Acknowledge the problem, explain clearly, offer solution

### Instructional Language

**Steps**:
- Use numbered lists for sequential steps
- Use bullet points for non-sequential items
- Start each step with a verb
- Keep steps concise (1-2 sentences max)

**Example**:
```
To create a template:
1. Click "New Template"
2. Enter template name and description
3. Select products from the category tree
4. Configure settings and custom fields
5. Save and activate your template
```

**Tips and Notes**:
- Use "💡 Tip:" for helpful suggestions
- Use "ℹ️ Note:" for important context
- Use "⚠️ Warning:" for cautions
- Use "❌ Important:" for critical information

---

## Appendix

### Related Pages
- [PC-campaign-create.md](./PC-campaign-create.md) - Campaign creation wizard
- [PC-campaign-detail.md](./PC-campaign-detail.md) - Campaign monitoring
- [PC-vendor-portal-submission.md](./PC-vendor-portal-submission.md) - Vendor submission portal

### Related Use Cases
- UC-VPP-001: Create Pricelist Template
- UC-VPP-002: Edit Pricelist Template
- UC-VPP-009: Manage Templates

### Related Technical Specifications
- TS-VPP-001: Template Builder
- TS-VPP-002: Template Validation

### Related Data Dictionary
- DD-VPP-007: PricelistTemplate
- DD-VPP-008: TemplateProduct
- DD-VPP-009: CustomField

### Change Log

| Date | Version | Change | Reason | Updated By |
|------|---------|--------|--------|------------|
| 2025-01-23 | 1.0 | Initial document creation | Created comprehensive PC specification for template builder | System |

---

**Document End**
