# Pricelist Templates - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 2.0.0
- **Last Updated**: 2025-11-25
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to align with BR-pricelist-templates.md; Reduced from 18 to 6 core use cases; Removed distribution, approval, versioning, submission tracking use cases |
| 1.1 | 2025-11-25 | System | Updated document status to Active |
| 1.0 | 2024-01-15 | System | Initial creation with detailed use cases |

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Pricelist Templates module, describing how different actors interact with the system to create, manage, and maintain standardized pricing templates for vendor price collection.

### 1.2 Scope
This document covers all user interactions with the Pricelist Templates module as defined in BR-pricelist-templates.md, including:
- Template creation and management
- Product/item assignment to templates
- Template activation and deactivation
- Template cloning

### 1.3 Document Conventions
- **Actor**: User or system component interacting with the module
- **Precondition**: State that must exist before use case executes
- **Postcondition**: State after successful use case completion
- **Main Flow**: Primary path through the use case
- **Alternate Flow**: Variations from the main flow
- **Exception Flow**: Error conditions and recovery

---

## 2. Actors

### 2.1 Primary Actors

**Procurement Manager**
- **Role**: Primary administrator of pricing templates
- **Responsibilities**: Create templates, manage product assignments, activate templates
- **Permissions**: Full access to template management

**Procurement Staff**
- **Role**: Template creators and maintainers
- **Responsibilities**: Create draft templates, add products
- **Permissions**: Create/edit templates (draft status)

### 2.2 Secondary Actors

**Finance Manager**
- View templates for pricing reference

**Department Manager**
- View department-specific templates

**Executive**
- View all templates and reports

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-PT-001 | Create Pricelist Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-002 | Add Products to Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-003 | Edit Template | Procurement Manager, Procurement Staff | High |
| UC-PT-004 | Clone Existing Template | Procurement Manager, Procurement Staff | Medium |
| UC-PT-005 | Activate/Deactivate Template | Procurement Manager | High |
| UC-PT-006 | Search and View Templates | All Users | High |

---

## 4. Detailed Use Cases

### UC-PT-001: Create Pricelist Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Weekly (2-5 templates/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create templates
- System is operational
- Product catalog is accessible

#### Main Flow
1. User navigates to Pricelist Templates module
2. User clicks "Create New Template" button
3. System displays template creation form with sections:
   - Basic Information
   - Product Assignment
4. User enters basic information:
   - Template Name (required, unique)
   - Description (optional)
   - Currency (optional, dropdown)
   - Vendor Instructions (optional, textarea)
   - Effective Date Range (optional start/end dates)
5. System validates template name uniqueness
6. User clicks "Next" to proceed to Product Assignment
7. System saves draft and displays product assignment interface
8. User adds products (see UC-PT-002 for details)
9. User clicks "Save Template"
10. System validates:
    - Template name is unique (BR-PT-001)
    - At least one product assigned (BR-PT-002)
11. If validation passes:
    - System saves template with status "Draft"
    - System generates unique template ID
    - System displays success message
12. System logs creation in audit trail

#### Postconditions
- **Success**: Template created in database with Draft status
- **Success**: Template ID assigned and displayed
- **Success**: All fields saved with entered data
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Clone from Existing Template**
- At step 3, user clicks "Start from Existing Template":
  - System displays template search dialog
  - User searches and selects source template
  - System copies all settings except:
    - Template name (appends "Copy of")
    - Effective dates (clears)
  - System pre-fills form with copied data
  - User modifies as needed
  - Continue to step 5

**AF-002: Save as Draft Midway**
- At any step before step 9:
  - User clicks "Save Draft"
  - System saves current progress
  - System displays "Draft saved" message
  - User can exit and resume later

#### Exception Flows

**EF-001: Duplicate Template Name**
- At step 5, if template name already exists:
  - System highlights template name field in red
  - System displays error: "Template name already exists. Please use a unique name."
  - User corrects template name
  - Continue to step 5

**EF-002: Missing Required Fields**
- At step 10, if required fields are missing:
  - System highlights missing fields with red borders
  - System displays validation summary
  - User completes missing fields
  - User clicks Save again
  - Continue to step 10

**EF-003: No Products Assigned**
- At step 10, if no products added to template:
  - System displays error: "Template must have at least one product."
  - System navigates to Product Assignment section
  - User must add products (see UC-PT-002)
  - Continue to step 9

**EF-004: Invalid Date Range**
- At step 4, if end date is before start date:
  - System highlights date fields
  - System displays error: "End date must be after start date"
  - User corrects dates
  - Continue to step 4

#### Business Rules Applied
- BR-PT-001: Template name must be unique across active templates
- BR-PT-002: Each template must have at least one product

#### UI Requirements
- Form with clear sections
- Real-time validation feedback
- Save draft functionality
- Mobile-responsive form layout

---

### UC-PT-002: Add Products to Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Daily (10-50 products/template)
**Related FR**: FR-PT-002

#### Preconditions
- User is authenticated with appropriate role
- User has permission to edit templates
- Template exists (draft or active)
- Product catalog is accessible
- User is in template edit mode

#### Main Flow
1. User opens template for editing
2. User navigates to "Product Assignment" section
3. System displays current products (if any) in a table:
   - Sequence number
   - Product name
   - Unit of Measure (UOM)
   - Minimum Order Quantity (MOQ)
   - Lead Time (days)
   - Actions (Edit, Remove)
4. User clicks "Add Products" button
5. System displays product search/selection interface:
   - Search bar
   - Category filter
   - Product list with checkboxes
   - Selected products counter
6. User searches for products using:
   - Product name/code
   - Category filter
7. System displays matching products with:
   - Product code and name
   - Category
   - Default UOM
8. User selects products by:
   - Individual checkbox selection
   - "Select All" option
9. User clicks "Add Selected Products"
10. System displays product configuration for each selected product:
    - Product name (read-only)
    - Unit of Measure (text input)
    - Minimum Order Quantity (number input, optional)
    - Lead Time Days (number input, optional)
11. User configures product details
12. User clicks "Save Products"
13. System validates configurations:
    - UOM is provided
    - MOQ > 0 if specified
    - Lead time > 0 if specified
    - Product not already in template
14. System adds products to template
15. System auto-sequences products
16. System updates product count
17. System displays success message: "X products added"
18. System saves template draft

#### Postconditions
- **Success**: Products added to template
- **Success**: Product configurations saved
- **Success**: Products sequenced appropriately
- **Success**: Template draft updated

#### Alternate Flows

**AF-001: Bulk Add by Category**
- At step 5, user clicks "Add by Category":
  - System displays category tree
  - User selects one or more categories
  - System displays all products in selected categories
  - User clicks "Add All from Selected Categories"
  - System adds all products with default configuration
  - User can edit configurations afterwards
  - Continue to step 13

**AF-002: Edit Existing Product Configuration**
- At step 3, user clicks "Edit" on existing product:
  - System displays product configuration dialog
  - User modifies UOM, MOQ, or Lead Time
  - User clicks "Update"
  - System validates changes
  - System updates product configuration
  - Continue to step 18

**AF-003: Remove Product**
- At step 3, user clicks "Remove" on product:
  - System displays confirmation dialog
  - User confirms removal
  - System removes product
  - System updates sequence numbers
  - Continue to step 18

**AF-004: Reorder Products**
- At step 3, user drags and drops products to reorder:
  - System enables drag-and-drop mode
  - User drags product rows to new positions
  - System updates sequence numbers in real-time
  - User clicks "Save Order"
  - System saves new sequence
  - Continue to step 18

#### Exception Flows

**EF-001: Product Already in Template**
- At step 14, if selected product already in template:
  - System displays warning: "Product is already in this template"
  - System highlights existing product in list
  - User options:
    - "Update Configuration": Opens edit dialog
    - "Skip": Doesn't add, continues with other products

**EF-002: Invalid Product Configuration**
- At step 13, if configuration is invalid:
  - System highlights invalid fields:
    - MOQ = 0 or negative
    - Lead time = 0 or negative
    - UOM empty
  - System displays specific error messages
  - User corrects invalid values
  - Continue to step 13

**EF-003: Product Not Found**
- At step 6, if searching for non-existent product:
  - System displays "No products found"
  - System suggests:
    - Check spelling
    - Try different keywords
    - Browse by category
  - User adjusts search

#### Business Rules Applied
- BR-PT-002: Each template must have at least one product
- Products can appear in multiple templates
- UOM must be provided for each product

#### UI Requirements
- Product search with autocomplete
- Category tree navigation
- Bulk selection checkboxes
- Drag-and-drop reordering
- Inline editing for quick updates
- Selected product counter

---

### UC-PT-003: Edit Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: High
**Frequency**: Weekly (5-10 edits/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to edit templates
- Template exists in system
- Template is in Draft or Active status

#### Main Flow
1. User navigates to template detail page
2. User clicks "Edit" button
3. System displays template in edit mode
4. System shows all editable fields:
   - Template Name
   - Description
   - Currency
   - Vendor Instructions
   - Effective Dates
   - Product Assignment
5. User modifies desired fields
6. User clicks "Save Changes"
7. System validates all changes:
   - Template name uniqueness (if changed)
   - Effective date range validity
   - At least one product remains
8. System saves changes
9. System increments doc_version
10. System displays success message
11. System logs changes in audit trail

#### Postconditions
- **Success**: Template updated with changes
- **Success**: doc_version incremented
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Edit Active Template**
- If template status is "Active":
  - System allows editing
  - System saves changes immediately
  - Continue to step 8

**AF-002: Cancel Edit**
- At any step, user clicks "Cancel":
  - System displays confirmation: "Discard unsaved changes?"
  - User confirms
  - System discards changes
  - System returns to view mode

#### Exception Flows

**EF-001: Validation Failure**
- At step 7, if validation fails:
  - System displays validation errors
  - User corrects errors
  - User clicks Save again

**EF-002: Concurrent Edit Conflict**
- At step 8, if another user saved changes:
  - System displays conflict warning
  - User options:
    - "Refresh": Loads other user's changes
    - "Override": Saves current user's changes

#### Business Rules Applied
- BR-PT-001: Template name must remain unique

#### UI Requirements
- Edit mode toggle
- Save/Cancel buttons
- Validation feedback
- Unsaved changes warning

---

### UC-PT-004: Clone Existing Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Medium
**Frequency**: Weekly (5-10 clones/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create templates
- Source template exists in system

#### Main Flow
1. User navigates to template library or detail page
2. User locates template to clone
3. User clicks "Clone Template" action button
4. System displays clone dialog:
   - New template name (required)
   - Pre-filled with "Copy of [Original Name]"
5. User enters new template name
6. System validates name uniqueness
7. User clicks "Clone"
8. System creates new template copy with:
   - All products from original template
   - All product configurations (UOM, MOQ, Lead Time)
   - Description and vendor instructions
   - Currency setting
9. System resets template metadata:
   - Status: Draft
   - Created date: Current date
   - Created by: Current user
   - Effective dates: Cleared
10. System displays success message
11. User options:
    - "Edit Now": Opens cloned template for editing
    - "View Template": Views cloned template
    - "Back to Library": Returns to template list
12. System logs clone operation in audit trail

#### Postconditions
- **Success**: New template created as copy of original
- **Success**: Status set to Draft
- **Success**: User can edit cloned template
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Clone and Edit Immediately**
- At step 11, user selects "Edit Now":
  - System opens template editor
  - User makes changes
  - User saves changes
  - End use case

#### Exception Flows

**EF-001: Duplicate Name**
- At step 6, if name already exists:
  - System displays error: "Template name already exists"
  - User enters different name
  - Continue to step 6

**EF-002: Clone Permission Denied**
- At step 3, if user lacks permission:
  - System displays error: "You do not have permission to clone templates"
  - End use case

#### Business Rules Applied
- BR-PT-001: Cloned template must have unique name
- Cloned template starts as Draft status

#### UI Requirements
- One-click clone button
- Clone confirmation dialog
- Quick edit after clone
- Success notification

---

### UC-PT-005: Activate/Deactivate Template

**Primary Actor**: Procurement Manager
**Priority**: High
**Frequency**: Weekly (5-10 status changes/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated as Procurement Manager
- User has permission to manage template status
- Template exists in system

#### Main Flow (Activate)
1. User navigates to template detail page
2. Template status is "Draft"
3. User clicks "Activate" button
4. System validates template is ready:
   - Has at least one product (BR-PT-002)
   - Template name is unique (BR-PT-001)
5. If validation passes:
   - System changes status to "Active"
   - System displays success message
6. System logs status change in audit trail

#### Main Flow (Deactivate)
1. User navigates to template detail page
2. Template status is "Active"
3. User clicks "Deactivate" button
4. System displays confirmation dialog
5. User confirms deactivation
6. System changes status to "Inactive"
7. System displays success message
8. System logs status change in audit trail

#### Postconditions
- **Success**: Template status updated
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Reactivate Inactive Template**
- If template status is "Inactive":
  - User clicks "Reactivate"
  - System validates template
  - System changes status to "Active"
  - Continue to step 6 of Main Flow (Activate)

#### Exception Flows

**EF-001: Activation Validation Failure**
- At step 4 (Activate), if template has no products:
  - System displays error: "Template must have at least one product before activation"
  - User must add products first
  - End use case

**EF-002: Permission Denied**
- At step 3, if user is not Procurement Manager:
  - System displays error: "Only Procurement Manager can change template status"
  - End use case

#### Business Rules Applied
- BR-PT-002: Template must have at least one product to activate
- Status workflow: Draft → Active → Inactive

#### UI Requirements
- Status badge on template card
- Activate/Deactivate button based on current status
- Confirmation dialog for deactivation
- Status change success notification

---

### UC-PT-006: Search and View Templates

**Primary Actor**: All Users
**Priority**: High
**Frequency**: Daily (multiple times/day)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated
- User has permission to view templates

#### Main Flow
1. User navigates to Pricelist Templates module
2. System displays template list with:
   - Template name
   - Status badge
   - Currency
   - Product count
   - Last updated date
   - Actions
3. User can filter templates by:
   - Status (All, Draft, Active, Inactive)
   - Search term (name, description)
4. User can sort templates by:
   - Name (A-Z, Z-A)
   - Last updated (newest, oldest)
   - Status
5. User clicks on template row
6. System displays template detail page with:
   - Basic information
   - Effective dates
   - Product list
   - Activity log
7. User can navigate through template details

#### Postconditions
- **Success**: User views template information
- **Success**: Search/filter applied correctly

#### Alternate Flows

**AF-001: Quick Actions from List**
- At step 2, user clicks action button on template row:
  - "Edit": Opens template in edit mode
  - "Clone": Initiates clone process
  - "Delete": Soft deletes template (if Draft)

**AF-002: Export Template**
- At step 6, user clicks "Export":
  - System generates Excel/CSV file
  - System downloads file

#### Exception Flows

**EF-001: No Templates Found**
- At step 3, if no templates match filter:
  - System displays empty state
  - System suggests: "No templates found. Create a new template?"

#### Business Rules Applied
- Users can only see templates they have permission to view
- Status filters show accurate counts

#### UI Requirements
- Searchable list
- Status filter tabs
- Sortable columns
- Responsive table
- Quick action buttons
- Empty state handling

---

## 5. Use Case Dependencies

### 5.1 Dependency Matrix

| Use Case | Depends On | Enables |
|----------|-----------|---------|
| UC-PT-001: Create Template | - | UC-PT-002, UC-PT-003, UC-PT-005 |
| UC-PT-002: Add Products | UC-PT-001 | UC-PT-005 |
| UC-PT-003: Edit Template | UC-PT-001 | - |
| UC-PT-004: Clone Template | Existing template | UC-PT-001, UC-PT-002 |
| UC-PT-005: Activate/Deactivate | UC-PT-001, UC-PT-002 | - |
| UC-PT-006: Search/View | - | UC-PT-003, UC-PT-004, UC-PT-005 |

---

## 6. Success Metrics

### 6.1 Use Case Performance Targets

| Use Case | Target Time | Target Success Rate |
|----------|-------------|-------------------|
| UC-PT-001: Create Template | <3 minutes | >90% |
| UC-PT-002: Add Products (10 products) | <2 minutes | >95% |
| UC-PT-003: Edit Template | <2 minutes | >95% |
| UC-PT-004: Clone Template | <10 seconds | >99% |
| UC-PT-005: Activate/Deactivate | <5 seconds | >99% |
| UC-PT-006: Search/View | <1 second | >99% |

### 6.2 User Satisfaction Targets
- Overall satisfaction: >4.0/5.0
- Ease of use: >4.2/5.0
- Template completion rate: >90%

### 6.3 Business Impact Targets
- 80% reduction in time to create pricing templates
- 100% templates use standardized format
- <5 support tickets per 100 template operations

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- DD-pricelist-templates.md - Data Definition
- FD-pricelist-templates.md - Flow Diagrams
- VAL-pricelist-templates.md - Validations
- TS-pricelist-templates.md - Technical Specification

---

**End of Use Cases Document**
