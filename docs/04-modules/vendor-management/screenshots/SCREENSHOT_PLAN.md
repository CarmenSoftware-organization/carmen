# Vendor Management Module - Screenshot Capture Plan

## Overview

This document outlines all screenshots needed to document the Vendor Management module. Screenshots should be captured when the development server is running.

## Screenshot Categories

### 1. Main Landing Page

#### VM-001: Landing Page Overview
- **Route**: `/vendor-management`
- **Description**: Main landing page with statistics and module cards
- **Elements to Capture**:
  - Header with title and description
  - Quick statistics cards (Total Vendors, Price Updates, Active Contracts, Pending)
  - Module navigation cards (Manage Vendors, Price Lists, Templates, Campaigns)
  - Development status section
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-landing-page.png`

### 2. Vendor List Pages

#### VM-002: Vendor List - Table View
- **Route**: `/vendor-management/manage-vendors`
- **Description**: Vendor list in table view
- **Elements to Capture**:
  - Page header with title
  - Search bar and filters
  - Status dropdown filter
  - View toggle buttons (Table/Card)
  - Table with vendor data
  - Action menu dropdown (expanded)
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-list-table.png`

#### VM-003: Vendor List - Card View
- **Route**: `/vendor-management/manage-vendors?view=card`
- **Description**: Vendor list in card view
- **Elements to Capture**:
  - Card grid layout
  - Vendor cards with information
  - Action menu on card (expanded on one card)
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-list-card.png`

#### VM-004: Advanced Filter Dialog
- **Route**: `/vendor-management/manage-vendors` (with filter dialog open)
- **Description**: Advanced filter dialog
- **Elements to Capture**:
  - Filter dialog overlay
  - Field selection dropdown
  - Operator selection dropdown
  - Value input field
  - Multiple filter criteria
  - Save filter option
  - Apply and Cancel buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-advanced-filter-dialog.png`

#### VM-005: Saved Filters Dialog
- **Route**: `/vendor-management/manage-vendors` (with saved filters dialog)
- **Description**: Saved filters selection
- **Elements to Capture**:
  - Saved filter list
  - Filter preview
  - Load and Delete options
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-saved-filters-dialog.png`

#### VM-006: Search Results
- **Route**: `/vendor-management/manage-vendors?search=tech`
- **Description**: Filtered search results
- **Elements to Capture**:
  - Search query in search bar
  - Filtered results
  - Result count
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-search-results.png`

### 3. Vendor Detail Pages

#### VM-007: Vendor Detail - Overview Tab
- **Route**: `/vendor-management/manage-vendors/[id]`
- **Description**: Vendor detail overview tab
- **Elements to Capture**:
  - Back button and vendor name header
  - Status badge and toggle
  - Summary card with key information
  - Tab navigation
  - Basic Information card
  - Tax Configuration card
  - Primary Address and Contact cards
  - Action buttons (Edit, Print, Delete)
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-detail-overview.png`

#### VM-008: Vendor Detail - Pricelists Tab
- **Route**: `/vendor-management/manage-vendors/[id]?tab=pricelists`
- **Description**: Vendor pricelists tab
- **Elements to Capture**:
  - Pricelist list
  - Filter and search options
  - Add pricelist button
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-detail-pricelists.png`

#### VM-009: Vendor Detail - Contacts Tab
- **Route**: `/vendor-management/manage-vendors/[id]?tab=contacts`
- **Description**: Contacts and addresses tab
- **Elements to Capture**:
  - Address list
  - Contact list
  - Add buttons for each
  - Primary designation indicators
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-detail-contacts.png`

#### VM-010: Vendor Detail - Certifications Tab
- **Route**: `/vendor-management/manage-vendors/[id]?tab=certifications`
- **Description**: Certifications tab
- **Elements to Capture**:
  - Certification badges
  - Add certification button
  - Expiry indicators
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-detail-certifications.png`

#### VM-011: Vendor Detail - Edit Mode
- **Route**: `/vendor-management/manage-vendors/[id]?edit=1`
- **Description**: Vendor detail in edit mode
- **Elements to Capture**:
  - Editable fields
  - Tax profile dropdown expanded
  - Tax rate input
  - Save Changes and Cancel buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-detail-edit-mode.png`

### 4. Vendor Form Pages

#### VM-012: New Vendor Form - Empty
- **Route**: `/vendor-management/manage-vendors/new`
- **Description**: New vendor form (empty state)
- **Elements to Capture**:
  - Form header
  - All form sections
  - Required field indicators
  - Submit and Cancel buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-new-vendor-form-empty.png`

#### VM-013: New Vendor Form - Filled
- **Route**: `/vendor-management/manage-vendors/new` (filled)
- **Description**: New vendor form with sample data
- **Elements to Capture**:
  - Filled form fields
  - Validation states
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-new-vendor-form-filled.png`

#### VM-014: New Vendor Form - Validation Errors
- **Route**: `/vendor-management/manage-vendors/new` (with errors)
- **Description**: Form validation error states
- **Elements to Capture**:
  - Error messages
  - Invalid field highlighting
  - Error summary
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-new-vendor-form-errors.png`

### 5. Vendor Deletion Flow

#### VM-015: Delete Confirmation Dialog
- **Route**: `/vendor-management/manage-vendors/[id]` (delete dialog open)
- **Description**: Delete confirmation dialog
- **Elements to Capture**:
  - Confirmation message
  - Vendor details
  - Delete and Cancel buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-delete-confirmation.png`

#### VM-016: Delete Warning - Has Dependencies
- **Route**: `/vendor-management/manage-vendors/[id]` (delete dialog with dependencies)
- **Description**: Delete warning with dependency list
- **Elements to Capture**:
  - Warning message
  - Dependency list (POs, PRs, contracts)
  - Force delete option
  - Cancel and Confirm buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-delete-warning-dependencies.png`

### 6. Price Management (Prototype)

#### VM-017: Template List
- **Route**: `/vendor-management/templates`
- **Description**: Pricelist template list
- **Elements to Capture**:
  - Template cards/table
  - New template button
  - Prototype badge
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-template-list.png`

#### VM-018: New Template Form
- **Route**: `/vendor-management/templates/new`
- **Description**: Create new pricelist template
- **Elements to Capture**:
  - Template basic info section
  - Product selection component
  - Custom fields configuration
  - MOQ pricing setup
  - Save and Cancel buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-new-template-form.png`

#### VM-019: Product Selection Component
- **Route**: `/vendor-management/templates/new` (product selection expanded)
- **Description**: Product selection interface
- **Elements to Capture**:
  - Category tree
  - Product search
  - Selected products list
  - Product instances with units
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-product-selection.png`

#### VM-020: Custom Fields Configuration
- **Route**: `/vendor-management/templates/new` (custom fields section)
- **Description**: Custom fields setup
- **Elements to Capture**:
  - Field type selection
  - Field properties
  - Validation rules
  - Required toggle
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-custom-fields-config.png`

#### VM-021: MOQ Pricing Component
- **Route**: `/vendor-management/templates/new` (MOQ section)
- **Description**: MOQ pricing configuration
- **Elements to Capture**:
  - MOQ tiers
  - Unit price inputs
  - Conversion factors
  - Lead time fields
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-moq-pricing.png`

#### VM-022: Campaign List
- **Route**: `/vendor-management/campaigns`
- **Description**: Pricing campaign list
- **Elements to Capture**:
  - Campaign cards
  - Status indicators
  - New campaign button
  - Prototype badge
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-campaign-list.png`

#### VM-023: New Campaign Form
- **Route**: `/vendor-management/campaigns/new`
- **Description**: Create pricing campaign
- **Elements to Capture**:
  - Campaign details
  - Template selection
  - Vendor selection
  - Schedule configuration
  - Priority and tags
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-new-campaign-form.png`

#### VM-024: Campaign Detail
- **Route**: `/vendor-management/campaigns/[id]`
- **Description**: Campaign detail and analytics
- **Elements to Capture**:
  - Campaign information
  - Invitation status
  - Response tracking
  - Analytics dashboard
  - Vendor engagement metrics
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-campaign-detail.png`

#### VM-025: Pricelist List
- **Route**: `/vendor-management/pricelists`
- **Description**: Vendor pricelist list
- **Elements to Capture**:
  - Pricelist table
  - Filter options
  - Status badges
  - Action menu
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-pricelist-list.png`

#### VM-026: Pricelist Detail
- **Route**: `/vendor-management/pricelists/[id]`
- **Description**: Pricelist detail view
- **Elements to Capture**:
  - Pricelist header
  - Item list with pricing
  - MOQ tiers
  - Approval status
  - Action buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-pricelist-detail.png`

#### VM-027: Pricelist Edit Form
- **Route**: `/vendor-management/pricelists/[id]/edit`
- **Description**: Edit pricelist
- **Elements to Capture**:
  - Editable item list
  - Inline editing
  - Price validation
  - Save and Submit buttons
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-pricelist-edit.png`

#### VM-028: Vendor Portal - Login
- **Route**: `/vendor-management/vendor-portal/sample`
- **Description**: Vendor portal entry
- **Elements to Capture**:
  - Token input field
  - Campaign information
  - Access button
  - Instructions
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-portal-login.png`

#### VM-029: Vendor Portal - Price Entry
- **Route**: `/vendor-management/vendor-portal/sample` (authenticated)
- **Description**: Vendor price entry form
- **Elements to Capture**:
  - Product list
  - Price input fields
  - MOQ inputs
  - Real-time validation
  - Auto-save indicator
  - Progress bar
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-portal-entry.png`

#### VM-030: Vendor Portal - Validation
- **Route**: `/vendor-management/vendor-portal/sample` (with validation)
- **Description**: Price validation feedback
- **Elements to Capture**:
  - Validation error messages
  - Warning indicators
  - Suggested corrections
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-vendor-portal-validation.png`

### 7. Mobile Views

#### VM-031: Mobile - Landing Page
- **Route**: `/vendor-management`
- **Viewport**: Mobile (375x812)
- **Filename**: `vm-mobile-landing.png`

#### VM-032: Mobile - Vendor List
- **Route**: `/vendor-management/manage-vendors`
- **Viewport**: Mobile (375x812)
- **Filename**: `vm-mobile-vendor-list.png`

#### VM-033: Mobile - Vendor Detail
- **Route**: `/vendor-management/manage-vendors/[id]`
- **Viewport**: Mobile (375x812)
- **Filename**: `vm-mobile-vendor-detail.png`

#### VM-034: Mobile - New Vendor Form
- **Route**: `/vendor-management/manage-vendors/new`
- **Viewport**: Mobile (375x812)
- **Filename**: `vm-mobile-new-vendor.png`

### 8. Edge Cases and Error States

#### VM-035: Empty State - No Vendors
- **Route**: `/vendor-management/manage-vendors` (empty)
- **Description**: No vendors in system
- **Elements to Capture**:
  - Empty state illustration
  - Create first vendor CTA
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-empty-state.png`

#### VM-036: Loading State
- **Route**: `/vendor-management/manage-vendors` (loading)
- **Description**: Loading skeleton
- **Elements to Capture**:
  - Skeleton loaders
  - Loading indicators
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-loading-state.png`

#### VM-037: Error State
- **Route**: `/vendor-management/manage-vendors` (error)
- **Description**: Error fetching vendors
- **Elements to Capture**:
  - Error message
  - Retry button
  - Error details
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-error-state.png`

#### VM-038: No Search Results
- **Route**: `/vendor-management/manage-vendors?search=xxxxx`
- **Description**: No results found
- **Elements to Capture**:
  - No results message
  - Clear search button
  - Suggestions
- **Viewport**: Desktop (1920x1080)
- **Filename**: `vm-no-results.png`

## Capture Instructions

### Tools Needed
- Browser: Chrome/Firefox with responsive design mode
- Screenshot tool: Browser DevTools, Playwright, or similar
- Image editing: For annotations if needed

### Screenshot Standards
1. **Resolution**:
   - Desktop: 1920x1080
   - Mobile: 375x812 (iPhone X)
   - Tablet: 768x1024 (iPad)

2. **Format**: PNG with transparency where applicable

3. **Naming Convention**:
   - Format: `vm-[category]-[description].png`
   - Use kebab-case
   - Include viewport suffix for mobile/tablet

4. **Content Standards**:
   - Use consistent sample data
   - Show realistic vendor names
   - Include diverse data types
   - Capture both empty and populated states

5. **Annotations**:
   - Add arrows/highlights for key features
   - Number sequential steps
   - Use consistent color scheme for annotations

### Sample Data for Screenshots

#### Vendor Examples:
1. **Tech Innovations Inc.**
   - Type: Technology
   - Status: Active
   - Rating: 4.5/5

2. **Green Fields Produce**
   - Type: Agriculture
   - Status: Active
   - Rating: 4.2/5

3. **Global Logistics Co.**
   - Type: Transportation
   - Status: Inactive
   - Rating: 3.8/5

4. **Stellar Manufacturing**
   - Type: Manufacturing
   - Status: Active
   - Rating: 4.7/5

#### Price List Examples:
- Electronics Components - Q1 2025
- Fresh Produce - March 2025
- Packaging Materials - 2025

#### Campaign Examples:
- Q1 Food Supplies RFP
- Office Equipment Quote Request
- Annual Packaging Contract

## Capture Sequence

### Phase 1: Core Functionality (Priority 1)
- VM-001 to VM-016 (Landing, List, Detail, Forms, Deletion)

### Phase 2: Price Management (Priority 2)
- VM-017 to VM-030 (Templates, Campaigns, Pricelists, Portal)

### Phase 3: Responsive Views (Priority 3)
- VM-031 to VM-034 (Mobile views)

### Phase 4: Edge Cases (Priority 4)
- VM-035 to VM-038 (Empty, Loading, Error states)

## Automation Script

```bash
# Example Playwright script structure
# To be run when dev server is active

npm run dev &
sleep 5  # Wait for server

# Capture desktop screenshots
npx playwright screenshot http://localhost:3000/vendor-management vm-landing-page.png
# ... (repeat for all routes)

# Capture mobile screenshots
npx playwright screenshot --viewport-size=375,812 http://localhost:3000/vendor-management vm-mobile-landing.png
# ... (repeat for mobile routes)

# Kill dev server
pkill -f "npm run dev"
```

## Post-Capture Tasks

1. **Review**: Check all screenshots for clarity and completeness
2. **Annotate**: Add arrows, highlights, and labels where needed
3. **Optimize**: Compress images without losing quality
4. **Organize**: Place in appropriate documentation folders
5. **Reference**: Update documentation with screenshot references

## Screenshot Usage in Documentation

### In README.md:
```markdown
## Vendor List View

![Vendor List Table](./screenshots/vm-vendor-list-table.png)
*Vendor list in table view with search and filter options*
```

### In Component Docs:
```markdown
## Advanced Filter Component

![Advanced Filter Dialog](./screenshots/vm-advanced-filter-dialog.png)
*Advanced filter dialog showing multi-criteria selection*
```

---

**Last Updated**: 2025-10-02
**Total Screenshots Planned**: 38
**Estimated Capture Time**: 2-3 hours
