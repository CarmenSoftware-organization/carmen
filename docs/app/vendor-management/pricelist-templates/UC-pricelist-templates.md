# Pricelist Templates - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Pricelist Templates module, describing how different actors interact with the system to create, manage, distribute, and track standardized pricing templates. Each use case includes preconditions, main flows, alternate flows, exception handling, and postconditions.

### 1.2 Scope
This document covers all user interactions with the Pricelist Templates module as defined in BR-pricelist-templates.md, including template creation, product assignment, pricing structure configuration, template distribution, submission tracking, versioning, and approval workflows.

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
- **Responsibilities**: Create templates, manage product assignments, configure pricing structures, approve distributions
- **Permissions**: Full access to template management, approval authority
- **Skills**: Advanced procurement and pricing knowledge

**Procurement Staff**
- **Role**: Template creators and maintainers
- **Responsibilities**: Create draft templates, add products, track distributions, monitor submissions
- **Permissions**: Create/edit templates (subject to approval), view analytics
- **Skills**: Procurement operations, basic pricing knowledge

**Finance Manager**
- **Role**: Pricing and financial oversight
- **Responsibilities**: Review pricing structures, approve templates, monitor pricing analytics
- **Permissions**: View/approve templates, access financial reports
- **Skills**: Financial analysis, pricing strategy

**Department Manager**
- **Role**: Department-specific template requestor
- **Responsibilities**: Request templates for department needs, review submissions
- **Permissions**: View department templates, request new templates
- **Skills**: Department operations knowledge

**Vendor Manager**
- **Role**: Vendor relationship coordinator
- **Responsibilities**: Coordinate vendor template distribution, track vendor engagement
- **Permissions**: Distribute templates, view vendor submission status
- **Skills**: Vendor relationship management

### 2.2 Secondary Actors

**System Administrator**
- Configures template workflows, manages permissions, performs system maintenance

**External Systems**
- Product management system, email service, vendor portal, ERP systems

**Vendors** (via Vendor Portal)
- Receive templates, submit pricing, track submission status

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-PT-001 | Create Pricelist Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-002 | Add Products to Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-003 | Define Pricing Structure | Procurement Manager | High |
| UC-PT-004 | Distribute Template to Vendors | Procurement Manager, Vendor Manager | Critical |
| UC-PT-005 | Track Template Submissions | Procurement Manager, Vendor Manager | High |
| UC-PT-006 | Clone Existing Template | Procurement Manager, Procurement Staff | Medium |
| UC-PT-007 | Version Template | Procurement Manager | Medium |
| UC-PT-008 | Approve Template Changes | Finance Manager, Procurement Manager | Critical |
| UC-PT-009 | Edit Template | Procurement Manager | High |
| UC-PT-010 | Archive Template | Procurement Manager | Medium |
| UC-PT-011 | Export Template | All Users | Medium |
| UC-PT-012 | Import Template | Procurement Manager | Medium |
| UC-PT-013 | Search Templates | All Users | High |
| UC-PT-014 | Configure Custom Fields | Procurement Manager | Medium |
| UC-PT-015 | Set Submission Deadline | Procurement Manager, Vendor Manager | High |
| UC-PT-016 | Send Reminder Notifications | System | High |
| UC-PT-017 | View Template Analytics | Procurement Manager, Finance Manager | High |
| UC-PT-018 | Compare Template Versions | Procurement Manager | Medium |

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
   - Pricing Structure
   - Location/Department Targeting
   - Custom Fields
   - Preview
4. User enters basic information:
   - Template Name (required)
   - Template Code (auto-generated or manual)
   - Description
   - Category/Type (dropdown)
   - Effective Date Range (start date, end date)
5. System validates template code uniqueness
6. User clicks "Next" to proceed to Product Assignment
7. System saves draft and displays product assignment interface
8. User adds products (see UC-PT-002 for details)
9. User clicks "Next" to proceed to Pricing Structure
10. System displays pricing structure configuration
11. User defines pricing columns and rules (see UC-PT-003 for details)
12. User clicks "Next" to proceed to Targeting
13. System displays location/department targeting options
14. User selects:
    - Target locations (multi-select or "All Locations")
    - Target departments (multi-select or "All Departments")
    - Vendor types eligible to receive template
15. User optionally adds custom fields
16. User clicks "Preview Template"
17. System displays template preview as vendors will see it
18. User reviews preview
19. User clicks "Save as Draft" or "Submit for Approval"
20. System validates all required sections completed
21. If validation passes:
    - System saves template with status "Draft" or "Pending Approval"
    - System generates unique template ID
    - System displays success message
22. System logs creation in audit trail

#### Postconditions
- **Success**: Template created in database with Draft or Pending status
- **Success**: Template ID assigned and displayed
- **Success**: All sections saved with entered data
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Auto-generate Template Code**
- At step 4, if user doesn't enter template code:
  - System generates code based on pattern: "TPL-[CATEGORY]-[YYYY]-[###]"
  - Example: "TPL-FOOD-2024-001"
  - System displays generated code
  - User can accept or modify
  - Continue to step 5

**AF-002: Clone from Existing Template**
- At step 3, user clicks "Start from Existing Template":
  - System displays template search dialog
  - User searches and selects source template
  - System copies all settings except:
    - Template code (generates new)
    - Template name (appends "Copy of")
    - Effective dates (sets to current date)
  - System pre-fills form with copied data
  - User modifies as needed
  - Continue to step 6

**AF-003: Import from Excel**
- At step 3, user clicks "Import from Excel":
  - System displays file upload dialog
  - User selects Excel file
  - System validates file format
  - System parses Excel data
  - System pre-fills form with imported data
  - User reviews and adjusts
  - Continue to step 6

**AF-004: Save as Draft Multiple Times**
- At any step before step 19:
  - User clicks "Save Draft"
  - System saves current progress
  - System displays "Draft saved" message
  - User can exit and resume later
  - Continue editing when resumed

**AF-005: Multi-location Pricing Variations**
- At step 14, user selects "Different pricing per location":
  - System displays location-specific pricing matrix
  - User configures pricing variations per location
  - System validates each location configuration
  - Continue to step 15

#### Exception Flows

**EF-001: Duplicate Template Code**
- At step 5, if template code already exists:
  - System highlights template code field in red
  - System displays error: "Template code already exists. Please use a unique code."
  - System suggests alternative codes:
    - Original code + "-v2"
    - Original code + "-[date]"
  - User corrects template code
  - Continue to step 5

**EF-002: Overlapping Effective Dates**
- At step 20, if effective dates overlap with another active template for same category:
  - System displays warning dialog
  - System shows conflicting template details:
    - Template name
    - Effective dates
    - Category
  - User options:
    - "Adjust Dates": User modifies effective dates
    - "Archive Conflicting Template": System archives old template
    - "Cancel": Cancel template creation
  - System proceeds based on selection

**EF-003: Missing Required Fields**
- At step 20, if required fields are missing:
  - System highlights missing fields with red borders
  - System displays validation summary panel:
    - List of missing required fields
    - Section location for each field
  - System scrolls to first missing field
  - User completes missing fields
  - User clicks Save/Submit again
  - Continue to step 20

**EF-004: No Products Assigned**
- At step 20, if no products added to template:
  - System displays error: "Template must have at least one product. Please add products."
  - System navigates to Product Assignment section
  - User must add products (see UC-PT-002)
  - Continue to step 9

**EF-005: Invalid Date Range**
- At step 4, if end date is before start date:
  - System highlights date fields
  - System displays error: "End date must be after start date"
  - User corrects dates
  - Continue to step 4

**EF-006: System Error During Save**
- At step 21, if system error occurs:
  - System displays error message: "Unable to save template. Please try again."
  - System logs error details
  - System preserves entered data in browser
  - User can retry save
  - If persistent, contact system administrator
  - If data lost, system shows last auto-saved version

#### Business Rules Applied
- BR-PT-001: Template codes must be unique across active templates
- BR-PT-002: Each template must have at least one product
- BR-PT-006: Active templates cannot have overlapping effective dates for same category

#### UI Requirements
- Multi-step wizard with progress indicator
- Auto-save draft every 2 minutes
- Visual validation with real-time feedback
- Template preview functionality
- Mobile-responsive form layout
- Keyboard shortcuts (Ctrl+S to save draft)
- Section navigation menu
- Unsaved changes warning on exit

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
   - Product code
   - Product name
   - Category
   - UOM
   - Required/Optional indicator
   - Sequence number
   - Actions (Edit, Remove)
4. User clicks "Add Products" button
5. System displays product search/selection interface:
   - Search bar with filters
   - Category tree view
   - Product list with checkboxes
   - Selected products counter
6. User searches for products using:
   - Product name/code
   - Category filter
   - Supplier filter
   - Department filter
7. System displays matching products with:
   - Product thumbnail
   - Product code and name
   - Current price (if available)
   - Category
   - UOM options
8. User selects products by:
   - Individual checkbox selection
   - "Select All" in category
   - "Add All from Supplier"
9. User clicks "Add Selected Products" (X products selected)
10. System displays product configuration dialog for each selected product:
    - Product name (read-only)
    - Required/Optional toggle
    - Unit of Measure (dropdown)
    - Pack Size (number input)
    - Minimum Order Quantity (number input)
    - Expected Delivery Days (number input)
    - Custom attributes (optional)
11. User configures product details
12. User clicks "Save Products"
13. System validates configurations:
    - UOM is valid for product
    - Pack size > 0
    - MOQ > 0
    - Delivery days > 0
14. System adds products to template
15. System auto-sequences products by category
16. System updates product count
17. System displays success message: "X products added to template"
18. System saves template draft
19. System logs product additions in audit trail

#### Postconditions
- **Success**: Products added to template
- **Success**: Product configurations saved
- **Success**: Products sequenced appropriately
- **Success**: Template draft updated
- **Success**: Audit log entry created

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

**AF-002: Bulk Add by Supplier**
- At step 5, user clicks "Add by Supplier":
  - System displays supplier search
  - User searches and selects supplier
  - System displays all products from that supplier
  - User reviews product list
  - User clicks "Add All from Supplier"
  - System adds all products with default configuration
  - Continue to step 13

**AF-003: Add Custom Item (Non-Catalog)**
- At step 5, user clicks "Add Custom Item":
  - System displays custom item form:
    - Item name (required)
    - Description (required)
    - Category (required)
    - UOM (required)
    - Estimated price range (optional)
  - User enters custom item details
  - User clicks "Add Custom Item"
  - System flags as "Custom" (requires approval)
  - System adds to template with orange "Custom" badge
  - Continue to step 18

**AF-004: Import Products from Excel**
- At step 5, user clicks "Import from Excel":
  - System displays file upload dialog
  - User uploads Excel file with columns:
    - Product Code, UOM, Pack Size, MOQ, Required Y/N
  - System validates file format
  - System matches product codes to catalog
  - System displays import preview:
    - Matched products (green)
    - Unmatched products (red)
    - Duplicate products (yellow)
  - User reviews and confirms
  - System imports matched products
  - System reports unmatched products
  - Continue to step 18

**AF-005: Reorder Products**
- At step 3, user drags and drops products to reorder:
  - System enables drag-and-drop mode
  - User drags product rows to new positions
  - System updates sequence numbers in real-time
  - User clicks "Save Order"
  - System saves new sequence
  - Continue to step 18

**AF-006: Edit Existing Product Configuration**
- At step 3, user clicks "Edit" on existing product:
  - System displays product configuration dialog
  - User modifies settings
  - User clicks "Update"
  - System validates changes
  - System updates product configuration
  - Continue to step 18

**AF-007: Remove Product**
- At step 3, user clicks "Remove" on product:
  - System displays confirmation dialog:
    - "Remove [Product Name] from template?"
    - "If template already distributed, vendors will be notified"
  - User confirms removal
  - System checks if template is distributed
  - If distributed: System flags for vendor notification
  - System removes product
  - System updates sequence numbers
  - Continue to step 18

#### Exception Flows

**EF-001: Product Already in Template**
- At step 14, if selected product already in template:
  - System displays warning: "[Product Name] is already in this template"
  - System highlights existing product in list
  - User options:
    - "Update Configuration": Opens edit dialog for existing product
    - "Add as Duplicate": Adds with different UOM/pack size
    - "Skip": Doesn't add, continues with other products
  - System proceeds based on selection

**EF-002: Invalid Product Configuration**
- At step 13, if configuration is invalid:
  - System highlights invalid fields:
    - Pack size = 0 or negative
    - MOQ = 0 or negative
    - Delivery days = 0 or negative
    - Invalid UOM for product
  - System displays specific error messages
  - User corrects invalid values
  - Continue to step 13

**EF-003: Product Not Found in Catalog**
- At step 6, if searching for non-existent product:
  - System displays "No products found matching '[search term]'"
  - System suggests:
    - Check spelling
    - Try different keywords
    - Browse by category
    - Add as custom item
  - User adjusts search or adds custom item
  - Continue to step 6 or go to AF-003

**EF-004: Maximum Products Exceeded**
- At step 14, if adding products exceeds limit (e.g., 1000 products):
  - System displays error: "Cannot add more products. Maximum 1000 products per template reached."
  - System lists products not added
  - User options:
    - Remove existing products to make room
    - Create separate template for additional products
    - Contact administrator for limit increase
  - End use case or user adjusts

**EF-005: Product Discontinued**
- At step 7, if product is discontinued:
  - System displays warning badge: "Discontinued"
  - System shows discontinuation date
  - System suggests replacement products if available
  - User options:
    - "Add Anyway": Includes with warning
    - "Use Replacement": Adds replacement product instead
    - "Skip": Doesn't add product
  - System proceeds based on selection

**EF-006: Custom Item Requires Approval**
- At step 10 (in AF-003), when adding custom item:
  - System displays notice: "Custom items require approval before template distribution"
  - System adds custom item with "Pending Approval" status
  - Template cannot be distributed until custom items approved
  - System creates approval workflow for custom items
  - Continue to step 18

**EF-007: Permission Denied**
- At step 5, if user lacks permission to add products:
  - System displays error: "You do not have permission to modify this template"
  - System shows template as read-only
  - User cannot add/edit/remove products
  - User can view products only
  - End use case

#### Business Rules Applied
- BR-PT-002: Each template must have at least one product
- Custom items require approval before distribution
- Products can appear in multiple templates
- Product removal requires confirmation if template distributed
- UOM must be valid for selected product

#### UI Requirements
- Advanced product search with autocomplete
- Category tree navigation
- Bulk selection checkboxes
- Drag-and-drop reordering
- Inline editing for quick updates
- Product thumbnails/images
- Real-time validation feedback
- Bulk import via Excel
- Mobile-responsive product selection
- Selected product counter
- Quick filters (required/optional, category)

---

### UC-PT-003: Define Pricing Structure

**Primary Actor**: Procurement Manager
**Priority**: High
**Frequency**: Weekly (2-5 pricing structures/week)
**Related FR**: FR-PT-003

#### Preconditions
- User is authenticated as Procurement Manager
- User has permission to configure pricing
- Template exists with products assigned
- User is in template edit mode

#### Main Flow
1. User opens template for editing
2. User navigates to "Pricing Structure" section
3. System displays current pricing structure (if any):
   - Defined pricing columns
   - Quantity breakpoints (if configured)
   - Discount rules (if configured)
   - Currency settings
4. User clicks "Add Pricing Column"
5. System displays pricing column configuration dialog:
   - Column Name (required)
   - Column Type (dropdown, required):
     - Unit Price
     - Case Price
     - Bulk Price
     - Promotional Price
     - Contract Price
   - Description/Instructions (optional)
   - Required/Optional toggle
6. User enters pricing column details
7. User clicks "Add Column"
8. System validates column configuration
9. System adds column to pricing structure
10. User repeats steps 4-9 for additional columns
11. User clicks "Configure Quantity Breakpoints" (optional)
12. System displays breakpoint configuration interface:
    - Tiered pricing table
    - Add/remove breakpoint rows
13. User defines quantity tiers:
    - Tier 1: Minimum quantity (e.g., 1-99 units)
    - Tier 2: Minimum quantity (e.g., 100-499 units)
    - Tier 3: Minimum quantity (e.g., 500+ units)
14. User clicks "Configure Discounts" (optional)
15. System displays discount rules interface:
    - Discount type (percentage, fixed amount, volume)
    - Discount conditions
    - Minimum order value
    - Early payment discount terms
16. User defines discount rules
17. User configures currency settings:
    - Primary currency (required)
    - Allow multiple currencies (toggle)
    - Exchange rate handling (auto or manual)
18. User sets price tolerance:
    - Minimum acceptable price (% below reference)
    - Maximum acceptable price (% above reference)
19. User clicks "Preview Pricing Structure"
20. System displays preview showing how vendors will see pricing form
21. User reviews preview
22. User clicks "Save Pricing Structure"
23. System validates complete configuration:
    - At least one pricing column defined
    - Quantity breakpoints in ascending order
    - Discount percentages within 0-100%
    - Currency is valid
24. System saves pricing structure
25. System updates template status
26. System displays success message
27. System logs pricing structure changes in audit trail

#### Postconditions
- **Success**: Pricing structure defined and saved
- **Success**: Pricing columns configured
- **Success**: Quantity breakpoints set (if applicable)
- **Success**: Discount rules configured (if applicable)
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Use Pricing Template**
- At step 3, user clicks "Use Pricing Template":
  - System displays saved pricing structure templates:
    - Standard pricing (unit, case, bulk)
    - Simple pricing (unit only)
    - Volume pricing (tiered)
    - Promotional pricing
  - User selects template
  - System applies template configuration
  - User can customize further
  - Continue to step 22

**AF-002: Multi-Currency Pricing**
- At step 17, user enables "Allow multiple currencies":
  - System displays currency selection:
    - Primary currency (required)
    - Additional currencies (multi-select)
  - User selects currencies
  - System displays exchange rate options:
    - Use daily rates (auto-update)
    - Lock rates at distribution time
    - Manual entry by vendor
  - User selects exchange rate handling
  - Continue to step 18

**AF-003: Conditional Pricing Rules**
- At step 14, user clicks "Add Conditional Rule":
  - System displays rule builder:
    - Condition: If [field] [operator] [value]
    - Then: Apply [discount/pricing adjustment]
  - Example conditions:
    - If order quantity > 1000 units, apply 5% discount
    - If delivery location = Warehouse A, add $50 shipping
    - If payment terms = COD, apply 2% discount
  - User defines conditions and actions
  - System validates rule logic
  - Continue to step 16

**AF-004: Location-Specific Pricing**
- At step 3, user clicks "Configure Location Pricing":
  - System displays location pricing matrix:
    - Rows: Products
    - Columns: Locations
    - Cells: Pricing columns
  - User selects "Different pricing per location"
  - System enables location-specific configuration
  - User defines pricing variations per location
  - Continue to step 22

**AF-005: Copy from Another Template**
- At step 3, user clicks "Copy Pricing from Template":
  - System displays template search
  - User searches and selects source template
  - System displays source pricing structure
  - User clicks "Copy Pricing Structure"
  - System copies all pricing configuration
  - User can modify as needed
  - Continue to step 22

#### Exception Flows

**EF-001: No Pricing Columns Defined**
- At step 23, if no pricing columns added:
  - System displays error: "At least one pricing column is required"
  - System navigates to pricing column section
  - User must add at least one column
  - Continue to step 4

**EF-002: Invalid Quantity Breakpoints**
- At step 13, if breakpoints are not in ascending order:
  - System highlights invalid breakpoints in red
  - System displays error: "Quantity breakpoints must be in ascending order"
  - Example error:
    - Tier 1: 100-499 (valid)
    - Tier 2: 50-99 (invalid - lower than Tier 1)
  - User corrects breakpoints
  - Continue to step 13

**EF-003: Invalid Discount Percentage**
- At step 16, if discount is <0% or >100%:
  - System highlights discount field
  - System displays error: "Discount must be between 0% and 100%"
  - User corrects discount value
  - Continue to step 16

**EF-004: Conflicting Pricing Rules**
- At step 23, if pricing rules conflict:
  - System detects conflicts:
    - Example: Two rules apply same discount for overlapping conditions
  - System displays conflict warning:
    - "Rule 1 and Rule 2 have overlapping conditions"
    - "Which rule should take precedence?"
  - User options:
    - Modify rules to remove overlap
    - Set rule priority
    - Combine rules
  - System proceeds based on selection

**EF-005: Currency Conversion Error**
- At step 17, if exchange rate service unavailable:
  - System displays warning: "Unable to retrieve current exchange rates"
  - System shows last known rates with date
  - User options:
    - Use last known rates (with date warning)
    - Enter manual rates
    - Wait for service to restore
  - System proceeds based on selection

**EF-006: Price Tolerance Too Wide**
- At step 18, if tolerance range is >50%:
  - System displays warning: "Price tolerance is very wide (±XX%). This may allow unrealistic pricing."
  - System suggests standard tolerances:
    - Conservative: ±10%
    - Moderate: ±20%
    - Flexible: ±30%
  - User can accept wide tolerance or adjust
  - System logs warning if user accepts wide tolerance
  - Continue to step 19

**EF-007: Template Already Distributed**
- At step 22, if template is already distributed to vendors:
  - System displays warning: "This template has been distributed. Changing pricing structure may affect vendor submissions."
  - System shows impact:
    - X vendors have received template
    - Y vendors have started submissions
    - Z vendors have completed submissions
  - User options:
    - "Save as New Version": Creates new major version
    - "Force Update": Updates existing (requires approval)
    - "Cancel": Cancels changes
  - System proceeds based on selection

#### Business Rules Applied
- At least one pricing column must be defined
- Quantity breakpoints must be in ascending order
- Discount percentages must be 0-100%
- Currency must match vendor's default or be explicitly specified
- Price tolerance prevents unrealistic submissions
- Changes to distributed templates require approval

#### UI Requirements
- Drag-and-drop column reordering
- Visual pricing structure builder
- Real-time validation feedback
- Pricing preview functionality
- Currency selector with flags
- Tier visualization (chart or table)
- Rule builder with dropdown conditions
- Mobile-responsive configuration
- Pricing template library
- Side-by-side comparison of pricing structures
- Export pricing structure to Excel

---

### UC-PT-004: Distribute Template to Vendors

**Primary Actor**: Procurement Manager, Vendor Manager
**Priority**: Critical
**Frequency**: Daily (5-20 distributions/day)
**Related FR**: FR-PT-006

#### Preconditions
- User is authenticated with appropriate role
- User has permission to distribute templates
- Template exists with status "Approved"
- Template has products and pricing structure defined
- Vendor directory is accessible
- At least one approved vendor exists

#### Main Flow
1. User navigates to template detail page
2. System displays template summary with "Distribute" button
3. User clicks "Distribute Template" button
4. System verifies template is ready for distribution:
   - Status is "Approved"
   - Has at least one product
   - Has pricing structure defined
   - No validation errors
5. System displays distribution configuration wizard:
   - Step 1: Select Vendors
   - Step 2: Set Deadline
   - Step 3: Configure Notifications
   - Step 4: Review and Confirm
6. **Step 1: Vendor Selection**
   - System displays vendor selection interface:
     - Search bar
     - Filters (category, location, rating)
     - Vendor list with checkboxes
     - Selected vendors counter
7. User selects target vendors using:
   - Individual vendor selection
   - "Select All in Category"
   - "Select by Location"
   - "Select by Vendor Type"
   - Saved vendor groups
8. System displays selected vendors summary:
   - Vendor count
   - Vendor names with contact info
   - Warning if vendor has pending submissions
9. User clicks "Next: Set Deadline"
10. **Step 2: Submission Deadline**
    - System displays calendar date picker
    - System calculates minimum deadline (today + 5 business days)
    - User selects submission deadline
    - System validates deadline is at least 5 business days away
11. User optionally configures:
    - Extended deadline for specific vendors
    - Grace period after deadline
    - Auto-close on deadline
12. User clicks "Next: Configure Notifications"
13. **Step 3: Notification Settings**
    - System displays notification configuration:
      - Email notification (default: enabled)
      - Portal notification (default: enabled)
      - SMS notification (optional)
14. User customizes notification:
    - Email subject line
    - Email message body (with template variables)
    - Attach template as PDF/Excel (toggle)
    - Include submission instructions (toggle)
15. User configures automatic reminders:
    - Reminder schedule:
      - First reminder: 7 days before deadline
      - Second reminder: 3 days before deadline
      - Final reminder: 1 day before deadline
    - Escalation: Notify vendor manager if not submitted by deadline
16. User clicks "Next: Review"
17. **Step 4: Review and Confirm**
    - System displays distribution summary:
      - Template name and code
      - Number of vendors: X vendors
      - Submission deadline: [Date]
      - Notification settings
      - Reminder schedule
18. User reviews all settings
19. User clicks "Distribute Now"
20. System creates distribution records for each vendor
21. System generates unique submission links for each vendor
22. System sends email notifications:
    - Sends to primary contact for each vendor
    - Includes template details
    - Includes submission link
    - Includes deadline
23. System creates portal notifications
24. System schedules reminder notifications
25. System updates template status to "Distributed"
26. System logs distribution in audit trail
27. System displays success message:
    - "Template distributed to X vendors"
    - "Notifications sent successfully"
    - "Track status in Distribution Dashboard"
28. System navigates to Distribution Tracking dashboard

#### Postconditions
- **Success**: Template distributed to selected vendors
- **Success**: Distribution records created for each vendor
- **Success**: Email notifications sent within 5 minutes
- **Success**: Portal notifications created
- **Success**: Reminder schedule configured
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Schedule Future Distribution**
- At step 19, user clicks "Schedule for Later":
  - System displays date/time picker
  - User selects distribution date and time
  - System validates future date
  - System schedules distribution job
  - System displays: "Distribution scheduled for [Date Time]"
  - System sends confirmation to user
  - On scheduled time, system executes distribution
  - End use case

**AF-002: Test Distribution to Single Vendor**
- At step 17, user clicks "Send Test":
  - System prompts: "Select test vendor"
  - User selects one vendor
  - System sends test notification
  - System displays: "Test sent to [Vendor Name]"
  - User can verify email received
  - User returns to review and confirms
  - Continue to step 19

**AF-003: Use Saved Vendor Group**
- At step 7, user clicks "Load Vendor Group":
  - System displays saved vendor groups:
    - "Food Suppliers - Regional"
    - "Beverage Vendors - Tier 1"
    - "Equipment Suppliers"
  - User selects group
  - System loads vendors from group
  - User can add/remove vendors
  - Continue to step 8

**AF-004: Staggered Distribution**
- At step 7, user clicks "Stagger Distribution":
  - System displays staggered distribution options:
    - Distribute in batches of X vendors
    - Time interval between batches (hours/days)
  - User configures batch size and interval
  - System creates distribution schedule
  - System sends batches according to schedule
  - Continue to step 20

**AF-005: Re-send to Non-Responsive Vendors**
- After step 28, from Distribution Dashboard:
  - User identifies vendors who haven't viewed template
  - User selects non-responsive vendors
  - User clicks "Re-send Notification"
  - System sends reminder notification
  - System logs re-send action
  - End use case

**AF-006: Custom Email Template**
- At step 14, user clicks "Use Custom Template":
  - System displays saved email templates
  - User selects template or creates new
  - System loads template content
  - User can edit before sending
  - Continue to step 15

#### Exception Flows

**EF-001: Template Not Approved**
- At step 4, if template status is not "Approved":
  - System displays error: "Template must be approved before distribution"
  - System shows current status: [Draft/Pending Approval]
  - System displays approval workflow status
  - User options:
    - "Submit for Approval": Initiates approval workflow
    - "Cancel": Returns to template detail
  - End use case

**EF-002: No Approved Vendors Selected**
- At step 8, if all selected vendors are not "Approved" status:
  - System displays warning: "Only approved vendors can receive templates"
  - System filters out non-approved vendors:
    - Shows: "X vendors removed (not approved status)"
  - System displays only approved vendors
  - If no approved vendors remain:
    - Error: "No approved vendors selected. Please select approved vendors."
    - User must select different vendors
  - Continue to step 8

**EF-003: Deadline Too Soon**
- At step 10, if selected deadline is <5 business days:
  - System displays error: "Submission deadline must be at least 5 business days from today"
  - System highlights minimum deadline in calendar
  - User must select later date
  - Continue to step 10

**EF-004: Vendor Has Pending Submission**
- At step 8, if vendor already has pending submission for this template:
  - System displays warning: "[Vendor Name] already has a pending submission for this template"
  - System shows existing submission details:
    - Distribution date
    - Deadline
    - Status (Not Started, In Progress)
  - User options:
    - "Skip Vendor": Removes from distribution
    - "Re-send": Replaces existing distribution
    - "Cancel": Cancels entire distribution
  - System proceeds based on selection

**EF-005: Email Delivery Failure**
- At step 22, if email fails to send to some vendors:
  - System logs failed deliveries
  - System retries sending 3 times (5 minutes apart)
  - If still failing:
    - System displays warning: "Email failed for X vendors"
    - System lists failed vendors with email addresses
  - System options:
    - Verify email addresses
    - Use portal notification instead
    - Contact vendors manually
  - System marks distribution as "Partial Success"
  - Continue to step 26

**EF-006: Template Modified During Distribution**
- At step 20, if template was modified by another user:
  - System detects version conflict
  - System displays error: "Template was modified during distribution setup"
  - System shows what changed
  - User options:
    - "Use Latest Version": Distributes updated template
    - "Use My Version": Distributes original version
    - "Cancel": Cancels distribution
  - System proceeds based on selection

**EF-007: Distribution Quota Exceeded**
- At step 20, if monthly distribution quota exceeded:
  - System displays error: "Monthly distribution limit reached (XXX distributions)"
  - System shows current usage
  - User options:
    - Schedule for next month
    - Contact administrator for quota increase
    - Reduce number of vendors
  - End use case

**EF-008: Vendor Contact Information Missing**
- At step 8, if selected vendor has no email address:
  - System displays warning: "[Vendor Name] has no primary contact email"
  - System highlights vendor in list
  - User options:
    - "Update Vendor Contact": Opens vendor profile
    - "Skip Vendor": Removes from distribution
    - "Use Alternative Contact": Select secondary contact
  - System proceeds based on selection

#### Business Rules Applied
- BR-PT-003: Template must be approved before distribution
- BR-PT-004: Distribution requires minimum 5 business days before deadline
- BR-PT-008: Only approved vendors can receive templates
- Vendors receive notification within 1 hour of distribution
- Reminders sent at 7, 3, 1 days before deadline
- Expired templates cannot receive submissions

#### UI Requirements
- Multi-step wizard with progress bar
- Vendor selection with bulk operations
- Calendar date picker with business day validation
- Email template editor with WYSIWYG
- Template variables (vendor name, deadline, etc.)
- Real-time notification preview
- Distribution status dashboard
- Mobile-responsive configuration
- Drag-and-drop email attachments
- Vendor group management
- Save as draft between steps
- Distribution analytics

---

### UC-PT-005: Track Template Submissions

**Primary Actor**: Procurement Manager, Vendor Manager
**Priority**: High
**Frequency**: Daily (multiple times/day)
**Related FR**: FR-PT-006, FR-PT-008

#### Preconditions
- User is authenticated with appropriate role
- User has permission to view template submissions
- Template has been distributed to vendors
- Distribution tracking dashboard is accessible

#### Main Flow
1. User navigates to "Template Submissions" dashboard
2. System displays submission tracking interface with:
   - Distributed templates list
   - Submission statistics panel
   - Status filters
   - Search bar
3. System shows overall statistics:
   - Total distributions: X
   - Submitted: Y (Z%)
   - In Progress: A (B%)
   - Not Started: C (D%)
   - Overdue: E (F%)
4. User selects a template to track
5. System displays detailed submission status for selected template:
   - Template name and code
   - Distribution date
   - Submission deadline
   - Vendor submission list with columns:
     - Vendor name
     - Contact person
     - Distribution date
     - Status badge (color-coded)
     - Last activity
     - Progress indicator
     - Actions
6. System shows status breakdown:
   - 🟢 Submitted (completed): X vendors
   - 🟡 In Progress (started but not submitted): Y vendors
   - 🔵 Viewed (opened link): Z vendors
   - ⚪ Sent (not yet viewed): A vendors
   - 🔴 Overdue (past deadline): B vendors
7. User can filter by status using dropdown:
   - All Vendors
   - Submitted
   - In Progress
   - Not Started
   - Overdue
8. User can sort by:
   - Vendor name (A-Z, Z-A)
   - Status
   - Last activity (most recent, oldest)
   - Submission date
9. User clicks on a vendor row to view details
10. System displays vendor submission detail panel:
    - Vendor information
    - Submission timeline:
      - Distributed: [Date Time]
      - Viewed: [Date Time] (if viewed)
      - Started: [Date Time] (if started)
      - Submitted: [Date Time] (if submitted)
    - Progress: X of Y products priced
    - Document attachments (if any)
    - Comments from vendor (if any)
    - Activity log
11. System displays submission actions:
    - "View Submission" (if submitted)
    - "Send Reminder" (if not submitted)
    - "Extend Deadline" (if needed)
    - "Download Submission" (if submitted)
    - "Contact Vendor"
12. User can click "Send Reminder" for non-responsive vendors
13. System sends reminder email to vendor
14. System logs reminder sent with timestamp
15. System displays success message: "Reminder sent to [Vendor Name]"
16. User can export submission report:
    - Clicks "Export Report"
    - Selects format (Excel, PDF, CSV)
    - System generates report with all submission data
    - System downloads file
17. System auto-refreshes dashboard every 5 minutes
18. System displays real-time updates when vendor submits

#### Postconditions
- **Success**: User has visibility into all submission statuses
- **Success**: Reminders sent to non-responsive vendors
- **Success**: Submission data exported if requested
- **Success**: Actions logged in audit trail

#### Alternate Flows

**AF-001: Bulk Send Reminders**
- At step 7, user selects multiple vendors (checkbox):
  - User clicks "Send Reminders to Selected"
  - System displays confirmation: "Send reminder to X vendors?"
  - User confirms
  - System sends bulk reminders
  - System logs each reminder action
  - System displays: "Reminders sent to X vendors"
  - Continue to step 17

**AF-002: View Submission Analytics**
- At step 5, user clicks "View Analytics":
  - System displays analytics dashboard:
    - Submission rate over time (line chart)
    - Average time to submit (bar chart)
    - Completion rate by vendor (table)
    - Price variance analysis (scatter plot)
  - User can filter by date range
  - User can export analytics to PDF
  - Continue to step 17

**AF-003: Extend Deadline for Vendor**
- At step 11, user clicks "Extend Deadline":
  - System displays deadline extension form:
    - Current deadline: [Date]
    - New deadline: [Date picker]
    - Reason for extension (required)
    - Notify vendor (checkbox, default: yes)
  - User enters new deadline and reason
  - System validates new deadline is in future
  - System updates deadline for vendor
  - System sends notification if selected
  - System logs deadline extension
  - System displays: "Deadline extended to [Date]"
  - Continue to step 17

**AF-004: Download All Submissions**
- At step 5, user clicks "Download All Submissions":
  - System displays download options:
    - Format: Excel (all submissions in tabs) or ZIP (individual files)
    - Include: Submitted only or All statuses
    - Attachments: Include vendor documents (yes/no)
  - User selects options
  - System generates download package
  - System compiles all submission data
  - System downloads file
  - Continue to step 17

**AF-005: Compare Submissions**
- At step 5, user selects 2+ submitted vendors:
  - User clicks "Compare Submissions"
  - System displays side-by-side comparison:
    - Products in columns
    - Vendors in rows
    - Price comparison with highlighting:
      - 🟢 Green: Lowest price
      - 🟡 Yellow: Mid-range
      - 🔴 Red: Highest price
    - Variance from average
  - User can export comparison to Excel
  - Continue to step 17

**AF-006: Contact Vendor Directly**
- At step 11, user clicks "Contact Vendor":
  - System displays contact options:
    - Send Email
    - Call (shows phone number)
    - Portal Message
  - If "Send Email" selected:
    - System opens email composer
    - Pre-fills vendor contact email
    - Includes template context
    - User writes message
    - System sends email
    - System logs communication
  - Continue to step 17

**AF-007: Escalate Overdue Submission**
- At step 6, for overdue vendors:
  - System automatically escalates:
    - Sends escalation email to Vendor Manager
    - Includes vendor details and days overdue
    - Suggests actions (call vendor, extend deadline)
  - User can manually escalate:
    - Click "Escalate" on vendor row
    - Select escalation recipient
    - Add escalation notes
    - System sends escalation notification
  - Continue to step 17

#### Exception Flows

**EF-001: No Distributions Found**
- At step 2, if no templates have been distributed:
  - System displays empty state:
    - Icon and message: "No templates distributed yet"
    - Suggested actions:
      - "Distribute a Template"
      - "View Template Library"
  - User can click to initiate distribution
  - End use case

**EF-002: Vendor Submission Link Expired**
- At step 10, if submission link has expired:
  - System displays status: "Link Expired"
  - System shows expiry date
  - User options:
    - "Generate New Link": Creates fresh link with new deadline
    - "Extend Deadline": Updates existing link expiry
  - User selects option
  - System generates new link if selected
  - System sends new link to vendor
  - System logs link regeneration
  - Continue to step 17

**EF-003: Vendor Requests Extension**
- During tracking, if vendor requests extension via portal:
  - System generates notification to Procurement Manager
  - System displays extension request:
    - Vendor name
    - Current deadline
    - Requested deadline
    - Reason provided by vendor
  - User reviews request
  - User options:
    - "Approve Extension": Updates deadline
    - "Deny Extension": Keeps original deadline
    - "Negotiate": Opens communication
  - System proceeds based on selection
  - System notifies vendor of decision
  - Continue to step 17

**EF-004: Incomplete Submission Detected**
- At step 10, if vendor marked as "Submitted" but data is incomplete:
  - System displays warning: "Submission appears incomplete"
  - System shows missing data:
    - X of Y products priced
    - Missing required fields
  - User options:
    - "Contact Vendor": Request completion
    - "Accept as Partial": Accepts incomplete submission
    - "Reject Submission": Returns to vendor for completion
  - System proceeds based on selection
  - Continue to step 17

**EF-005: Multiple Submissions from Same Vendor**
- At step 10, if vendor submitted multiple times:
  - System displays all submission versions:
    - Submission 1: [Date Time]
    - Submission 2: [Date Time]
    - Submission 3 (Latest): [Date Time]
  - System highlights latest submission
  - User can view/compare any version
  - System uses latest submission by default
  - Continue to step 17

**EF-006: Submission Deadline Passed**
- At step 5, for templates past deadline:
  - System marks template status as "Closed"
  - System sends closure notifications:
    - To vendors who submitted: Thank you
    - To vendors who didn't submit: Opportunity closed
    - To procurement team: Submission summary
  - System displays closure banner
  - User can still extend deadline if needed
  - Continue to step 17

**EF-007: Export Generation Failure**
- At step 16, if export fails:
  - System displays error: "Unable to generate export"
  - System logs error details
  - User options:
    - "Retry": Attempts export again
    - "Reduce Data Range": Export subset
    - "Contact Support": Reports issue
  - System retries if selected
  - If persistent, suggests alternative formats
  - End use case

#### Business Rules Applied
- Vendors receive notification within 1 hour of distribution
- Reminders sent at 7, 3, 1 days before deadline
- Escalation if not submitted by deadline
- Submission link valid until deadline (+ grace period)
- Latest submission from vendor is considered official
- Overdue submissions may be accepted with approval

#### UI Requirements
- Real-time dashboard with auto-refresh (5 minutes)
- Color-coded status badges (green, yellow, blue, red)
- Progress bars for partial submissions
- Timeline view of vendor activity
- Filterable and sortable vendor list
- Bulk action checkboxes
- One-click reminder sending
- Export functionality (Excel, PDF, CSV)
- Mobile-responsive tracking interface
- Push notifications for new submissions
- Analytics charts and visualizations
- Side-by-side submission comparison
- Quick action buttons (remind, extend, download)
- Search across all distributed templates

---

### UC-PT-006: Clone Existing Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Medium
**Frequency**: Weekly (5-10 clones/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create templates
- Source template exists in system
- User has access to view source template

#### Main Flow
1. User navigates to template library or detail page
2. User locates template to clone
3. User clicks "Clone Template" action button
4. System displays clone confirmation dialog:
   - "Clone template: [Template Name]?"
   - "This will create a copy you can modify"
5. User confirms clone operation
6. System creates new template copy with:
   - All products from original template
   - All pricing structure configuration
   - All location/department targeting
   - All custom fields
   - Version history reset to 1.0
7. System generates new unique template code:
   - Pattern: [Original Code]-COPY-[###]
   - Example: TPL-FOOD-2024-001-COPY-001
8. System sets new template name:
   - Pattern: "Copy of [Original Name]"
   - Example: "Copy of Q1 Food Pricing Template"
9. System resets template metadata:
   - Status: Draft
   - Created date: Current date
   - Created by: Current user
   - Version: 1.0
   - Distribution history: Cleared
   - Submission data: Cleared
10. System sets effective dates:
    - Start date: Current date
    - End date: Original end date (or cleared)
11. System displays clone success dialog:
    - "Template cloned successfully"
    - "Template Code: [New Code]"
    - "Status: Draft"
12. User options in success dialog:
    - "Edit Now": Opens cloned template for editing
    - "View Template": Views cloned template (read-only)
    - "Back to Library": Returns to template list
13. User selects action
14. System navigates based on selection
15. System logs clone operation in audit trail:
    - Source template ID and name
    - New template ID and code
    - User who performed clone
    - Clone timestamp

#### Postconditions
- **Success**: New template created as copy of original
- **Success**: New unique template code assigned
- **Success**: Status set to Draft
- **Success**: User can edit cloned template
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Clone and Modify Immediately**
- At step 12, user selects "Edit Now":
  - System opens template editor
  - System displays clone notification banner:
    - "This is a cloned template. Modify as needed."
  - User makes changes:
    - Update template name
    - Adjust effective dates
    - Modify products (add/remove)
    - Update pricing structure
  - User saves changes
  - Continue with template edit workflow
  - End use case

**AF-002: Clone Specific Version**
- At step 2, user clicks "Clone Version":
  - System displays version history
  - User selects specific version to clone
  - System confirms: "Clone version [X.X]?"
  - User confirms
  - System clones selected version
  - Continue to step 6

**AF-003: Clone Multiple Templates**
- At step 2, user selects multiple templates:
  - User checks checkboxes for multiple templates
  - User clicks "Clone Selected"
  - System displays bulk clone confirmation:
    - "Clone X templates?"
    - List of templates to clone
  - User confirms
  - System clones all selected templates
  - System displays progress: "Cloning X of Y templates..."
  - System displays summary:
    - "Successfully cloned: X templates"
    - "Failed: Y templates" (if any)
  - End use case

**AF-004: Clone with Custom Name/Code**
- At step 11, user clicks "Customize":
  - System displays customization form:
    - Template Name (editable, pre-filled with default)
    - Template Code (editable, pre-filled with default)
    - Description (editable)
  - User modifies name and/or code
  - System validates uniqueness
  - User clicks "Save"
  - System uses custom name/code
  - Continue to step 12

**AF-005: Clone to Different Location/Department**
- At step 11, user clicks "Change Targeting":
  - System displays targeting options:
    - Locations (multi-select)
    - Departments (multi-select)
  - User selects new targeting
  - System validates selections
  - User clicks "Apply"
  - System updates targeting in clone
  - Continue to step 12

#### Exception Flows

**EF-001: Duplicate Code Generated**
- At step 7, if generated code already exists:
  - System increments counter: [Code]-COPY-002
  - System retries code generation
  - System validates uniqueness
  - If still duplicate (unlikely):
    - System appends timestamp: [Code]-COPY-[YYYYMMDDHHMMSS]
  - Continue to step 8

**EF-002: Clone Permission Denied**
- At step 3, if user lacks permission to clone:
  - System displays error: "You do not have permission to clone templates"
  - System suggests contacting Procurement Manager
  - End use case

**EF-003: Source Template Modified During Clone**
- At step 6, if source template modified by another user:
  - System detects concurrent modification
  - System displays warning: "Source template was modified during clone"
  - User options:
    - "Clone Latest Version": Uses updated source
    - "Clone Original": Uses version when clone started
  - System proceeds based on selection
  - Continue to step 7

**EF-004: Clone Exceeds Template Limit**
- At step 6, if creating clone exceeds system/user template limit:
  - System displays error: "Cannot clone. Template limit reached (XXX templates)"
  - System suggests:
    - Archive old templates
    - Contact administrator for limit increase
  - End use case

**EF-005: Product Catalog Unavailable**
- At step 6, if product data unavailable during clone:
  - System logs error
  - System creates clone with product references
  - System marks clone with warning:
    - "Product data temporarily unavailable"
    - "Verify products before use"
  - System retries product data load in background
  - Clone still usable once products loaded
  - Continue to step 7

**EF-006: Clone Operation Timeout**
- At step 6, if clone takes >30 seconds (large template):
  - System displays: "Clone is taking longer than expected..."
  - System continues operation in background
  - System sends notification when complete:
    - Email: "Template clone completed"
    - Portal notification with link to cloned template
  - User can continue other work
  - End use case

**EF-007: Source Template Deleted**
- At step 2, if attempting to clone deleted/archived template:
  - System displays error: "Cannot clone archived template"
  - System suggests:
    - "Restore Template First": Restores then clones
    - "Select Different Template": Returns to list
  - System proceeds based on selection
  - If restore: Continue to step 3
  - If different: End use case

#### Business Rules Applied
- Cloned template receives new unique code
- Cloned template starts as Draft status
- Version history is reset for cloned template
- Distribution and submission data not copied
- User cloning becomes creator of new template
- Template code uniqueness must be maintained

#### UI Requirements
- One-click clone button on template cards
- Clone confirmation dialog
- Quick edit after clone
- Progress indicator for large templates
- Success notification with next action buttons
- Customization options before finalizing clone
- Bulk clone capability
- Clone badge/indicator on template cards
- Mobile-responsive clone interface
- Keyboard shortcut (Ctrl+D to clone)
- Recent clones list in sidebar
- "Clone from" reference link in cloned template

---

### UC-PT-007: Version Template

**Primary Actor**: Procurement Manager
**Priority**: Medium
**Frequency**: Monthly (2-5 versions/month)
**Related FR**: FR-PT-005

#### Preconditions
- User is authenticated as Procurement Manager
- User has permission to version templates
- Template exists in system
- Template has been modified from last version
- User is viewing template detail or history page

#### Main Flow
1. User opens template with changes
2. System detects changes from last saved version
3. System displays version indicator:
   - Current version: [X.Y]
   - Unsaved changes detected
   - Last saved: [Date Time] by [User]
4. User clicks "Save New Version" or "View Version History"
5. If "View Version History":
   - System displays version history panel:
     - List of all versions (newest first)
     - Version number, date, user, change summary
     - Version type (Major/Minor)
     - Actions (View, Compare, Revert)
6. User clicks "Create New Version"
7. System analyzes changes to determine version type:
   - **Major version** (increment first number, e.g., 2.0):
     - Products added or removed
     - Pricing structure changed
     - Vendor targeting changed significantly
   - **Minor version** (increment second number, e.g., 1.5):
     - Product details updated
     - Description changes
     - Minor pricing adjustments
     - Date range adjustments
8. System displays version creation dialog:
   - Suggested version number: [X.Y]
   - Version type: Major / Minor (auto-selected)
   - Change summary (required):
     - Pre-filled with detected changes
     - User can edit/add details
   - Release notes (optional)
   - Mark as milestone version (checkbox)
9. User reviews and edits change summary
10. User optionally adds release notes
11. User clicks "Create Version"
12. System validates:
    - Change summary provided
    - Version number is sequential
    - No conflicts with existing versions
13. System creates new version record:
    - Version number: [X.Y]
    - Created date/time: Current timestamp
    - Created by: Current user
    - Changes: Diff from previous version
    - Full snapshot: Complete template data
14. System updates template to new version
15. If template is distributed:
    - System checks if vendors have submissions in progress
    - If yes: System displays impact warning
    - User confirms version update
    - System notifies affected vendors if needed
16. System tags previous version as "Superseded"
17. System displays success message:
    - "New version [X.Y] created successfully"
    - "Previous version: [A.B]"
    - "Changes: [Summary]"
18. System updates version dropdown in template header
19. System logs version creation in audit trail
20. System links any distributed price lists to version number

#### Postconditions
- **Success**: New version created and saved
- **Success**: Version number incremented appropriately
- **Success**: Change summary and release notes saved
- **Success**: Previous version preserved
- **Success**: Audit log entry created
- **Success**: Price lists linked to version

#### Alternate Flows

**AF-001: Compare Two Versions**
- At step 5, user selects two versions:
  - User checks checkboxes for two versions
  - User clicks "Compare Versions"
  - System displays side-by-side comparison:
    - Left panel: Version [X.Y]
    - Right panel: Version [A.B]
    - Differences highlighted:
      - 🟢 Green: Additions
      - 🔴 Red: Deletions
      - 🟡 Yellow: Modifications
  - System shows comparison sections:
    - Basic information changes
    - Product changes (added/removed/modified)
    - Pricing structure changes
    - Location/department changes
  - User can export comparison to PDF
  - Continue to step 6 or end use case

**AF-002: Revert to Previous Version**
- At step 5, user selects old version:
  - User clicks "Revert to This Version"
  - System displays confirmation:
    - "Revert to version [X.Y]?"
    - "This will create a new version based on [X.Y]"
    - "Current changes will be lost"
  - User confirms revert
  - System creates new version from old version data
  - System increments version number (doesn't replace)
  - System marks as "Reverted from [X.Y]"
  - System logs revert action
  - System displays: "Reverted to version [X.Y] as new version [A.B]"
  - End use case

**AF-003: Create Milestone Version**
- At step 8, user checks "Mark as Milestone":
  - System displays milestone configuration:
    - Milestone name (required)
    - Milestone description
    - Milestone date (default: today)
  - User enters milestone details
  - System marks version with milestone flag
  - Milestone versions highlighted in history
  - System allows direct navigation to milestones
  - Continue to step 11

**AF-004: Auto-versioning for Distributed Templates**
- At step 15, if template is distributed:
  - System automatically determines versioning strategy:
    - If changes affect pricing: Major version required
    - If changes to products: Major version required
    - If minor metadata changes: Minor version acceptable
  - System displays recommended version type
  - User can override if needed (with justification)
  - System notifies vendors based on version type:
    - Major: "Template updated, please review"
    - Minor: "Minor template update"
  - Continue to step 16

**AF-005: Batch Version Multiple Templates**
- At step 1, from template library:
  - User selects multiple templates
  - User clicks "Create Versions"
  - System displays batch versioning dialog:
    - List of selected templates
    - Unified change summary field
    - Version type selection (apply to all)
  - User enters change summary
  - System creates versions for all templates
  - System displays summary:
    - "X templates versioned successfully"
    - "Failed: Y templates" (if any with reasons)
  - End use case

#### Exception Flows

**EF-001: No Changes to Version**
- At step 7, if no changes detected:
  - System displays message: "No changes detected since last version"
  - User options:
    - "Force New Version": Creates version anyway (requires reason)
    - "Cancel": Returns to template
  - If force version:
    - User enters reason for version
    - Continue to step 8
  - If cancel:
    - End use case

**EF-002: Conflicting Changes**
- At step 13, if another user created version simultaneously:
  - System detects version conflict
  - System displays error: "Version conflict detected. Another user created version [X.Y]"
  - System shows other user's changes
  - User options:
    - "Merge Changes": Attempts automatic merge
    - "Override": Creates next version with user's changes
    - "Cancel": Cancels versioning, returns to edit
  - System proceeds based on selection

**EF-003: Version Number Validation Failure**
- At step 12, if version number invalid:
  - System displays error: "Invalid version number"
  - Possible issues:
    - Not sequential (e.g., jumps from 1.0 to 3.0)
    - Already exists
    - Wrong format
  - System suggests correct version number
  - User accepts suggestion or enters different
  - Continue to step 12

**EF-004: Active Submissions Prevent Version**
- At step 15, if vendors have active submissions:
  - System displays error: "Cannot version template with active submissions"
  - System shows impact:
    - "X vendors currently filling out this template"
    - "Versioning will invalidate their progress"
  - User options:
    - "Wait for Submissions": Delays versioning
    - "Force Version": Creates version (requires approval)
    - "Notify Vendors First": Sends warning before versioning
  - System proceeds based on selection

**EF-005: Version History Limit Reached**
- At step 13, if version count exceeds retention limit (e.g., 50 versions):
  - System displays warning: "Version history limit reached"
  - System suggests archiving old versions:
    - "Archive versions older than [Date]?"
    - "This will compress old versions"
  - User options:
    - "Archive Old Versions": Compresses versions >2 years old
    - "Continue Anyway": Creates version (admin override)
  - System proceeds based on selection

**EF-006: Missing Change Summary**
- At step 12, if change summary not provided:
  - System highlights change summary field
  - System displays error: "Change summary is required"
  - System suggests using detected changes
  - User must enter change summary
  - Continue to step 12

**EF-007: Version Creation Timeout**
- At step 13, if version creation takes >10 seconds:
  - System displays: "Creating version..."
  - System continues operation in background
  - System sends notification when complete
  - User can continue other work
  - End use case

#### Business Rules Applied
- BR-PT-005: Major changes increment major version, minor changes increment minor version
- Version numbers must be sequential
- Change summary required for all versions
- Previous versions preserved indefinitely
- Active distributed templates with submissions require approval for versioning
- Versions linked to price lists for audit trail

#### UI Requirements
- Version dropdown in template header (shows current version)
- Version history panel with timeline view
- Visual diff highlighting in comparisons
- One-click version creation
- Automatic change detection
- Version badges (Major/Minor/Milestone)
- Filterable version history
- Export version comparison to PDF
- Mobile-responsive version history
- Keyboard shortcuts (Ctrl+Shift+V for new version)
- Version notes preview on hover
- Quick revert button for recent versions
- Version search functionality

---

### UC-PT-008: Approve Template Changes

**Primary Actor**: Finance Manager, Procurement Manager
**Priority**: Critical
**Frequency**: Weekly (5-15 approvals/week)
**Related FR**: FR-PT-009

#### Preconditions
- User is authenticated with appropriate approver role
- User has approval permission
- Template exists with status "Pending Approval"
- Approval request assigned to user
- User is current stage approver

#### Main Flow
1. User receives approval notification via:
   - Email notification with approval link
   - In-app notification badge
   - Pending approvals dashboard
2. User navigates to "My Approvals" page
3. System displays pending template approval requests:
   - Template name and code
   - Submitted by
   - Submission date
   - Approval stage (current stage highlighted)
   - SLA deadline
   - Urgency flag (if applicable)
4. User clicks on approval request
5. System displays template approval review page with tabs:
   - **Overview**: Template summary and approval checklist
   - **Products**: List of products with details
   - **Pricing**: Pricing structure configuration
   - **Targeting**: Location/department assignments
   - **Changes**: What changed (if existing template)
   - **History**: Previous approval actions
6. **Overview Tab**:
   - Template basic information
   - Submission notes from requestor
   - Approval checklist for current stage:
     - **Procurement Review** (Stage 1):
       - [ ] Product selection appropriate for category
       - [ ] Pricing structure clearly defined
       - [ ] Template structure logical
       - [ ] No duplicate templates exist
     - **Finance Review** (Stage 2):
       - [ ] Pricing parameters reasonable
       - [ ] Currency settings correct
       - [ ] Price tolerance appropriate
       - [ ] Payment terms aligned with policy
     - **Management Review** (Stage 3):
       - [ ] Strategic alignment verified
       - [ ] Budget impact acceptable
       - [ ] Risk assessment completed
       - [ ] Vendor targeting appropriate
7. User reviews each tab thoroughly
8. **Products Tab**:
   - User reviews product list
   - Verifies product selection is appropriate
   - Checks for any missing/unnecessary products
9. **Pricing Tab**:
   - User reviews pricing structure
   - Validates pricing columns
   - Checks quantity breakpoints
   - Verifies discount rules
10. **Targeting Tab**:
    - User reviews location assignments
    - Verifies department targeting
    - Checks vendor type eligibility
11. **Changes Tab** (if template update):
    - User reviews what changed from previous version
    - System displays side-by-side comparison
    - Highlights added/removed/modified items
12. User completes approval checklist items
13. User enters approval notes/comments (optional but recommended)
14. User selects action:
    - **Approve**: Move to next stage or activate
    - **Reject**: Return to submitter with reason
    - **Request Changes**: Send back with specific requests
15. If "Approve" selected:
    - User clicks "Approve Template"
    - System validates all checklist items completed
    - System records approval decision
    - System updates approval workflow status
    - If last stage:
      - System changes template status to "Approved"
      - Template ready for distribution
    - If not last stage:
      - System routes to next approver
      - System sends notification to next approver
16. System sends status update to submitter
17. System logs approval in audit trail
18. System displays success message:
    - "Template approved successfully"
    - "Template ready for distribution" (if final approval)
    - or "Routed to [Next Approver] for [Stage]"
19. System removes from user's pending approvals
20. System updates SLA tracking

#### Postconditions
- **Success**: Approval decision recorded
- **Success**: Template moved to next stage or approved
- **Success**: Notifications sent to relevant parties
- **Success**: Audit trail updated
- **Success**: SLA tracking updated

#### Alternate Flows

**AF-001: Quick Approve from Email**
- At step 1, user receives email:
  - User clicks "Quick Approve" link in email
  - System displays mobile-optimized review page
  - System shows template summary and checklist
  - User reviews key information
  - User enters approval notes
  - User clicks "Approve"
  - System processes approval
  - System sends confirmation email
  - End use case

**AF-002: Approve with Conditions**
- At step 14, user selects "Approve with Conditions":
  - System displays conditional approval form:
    - Conditions to be met:
      - Example: "Valid for 90 days only"
      - Example: "Requires monthly review"
      - Example: "Limited to 5 vendors initially"
  - User enters conditions
  - User selects condition enforcement:
    - Warning only
    - Hard restriction
    - Requires review after period
  - System records conditions
  - System attaches conditions to template
  - Template approved with conditions badge
  - Continue to step 16

**AF-003: Delegate Approval**
- At step 4, user clicks "Delegate":
  - System displays delegate selection:
    - List of users with same role
    - Delegation reason field (required)
  - User selects delegate
  - User enters delegation reason
  - System reassigns approval to delegate
  - System notifies delegate
  - System logs delegation action
  - End use case

**AF-004: Request Additional Information**
- At step 14, user selects "Request Information":
  - System displays information request form:
    - Questions/clarifications needed
    - Additional documents required
    - Specific concerns to address
  - User enters requests
  - User sets response deadline
  - System changes status to "Information Requested"
  - System sends request to submitter
  - System pauses SLA timer
  - Approval remains assigned to current user
  - End use case

**AF-005: Batch Approve Multiple Templates**
- At step 3, user selects multiple approval requests:
  - User checks checkboxes for multiple templates
  - User clicks "Batch Review"
  - System displays batch approval interface:
    - Template summaries side-by-side
    - Common approval checklist
  - User reviews all templates
  - User enters batch approval notes
  - User clicks "Approve All Selected"
  - System processes all approvals
  - System sends notifications for each
  - End use case

**AF-006: Escalate for Higher Approval**
- At step 7, if user identifies high-risk situation:
  - User clicks "Escalate"
  - System displays escalation dialog:
    - Escalation reason (required):
      - High value (>$500K potential spend)
      - Strategic vendor changes
      - Unusual pricing structure
      - Regulatory concerns
    - Escalation level:
      - Executive approval
      - Board approval
  - User selects reason and level
  - System adds escalation stage to workflow
  - System routes to escalation approver
  - System notifies submitter of escalation
  - End use case

#### Exception Flows

**EF-001: Reject Template**
- At step 14, if user selects "Reject":
  - System displays rejection dialog
  - User must enter rejection reason (required):
    - Inappropriate product selection
    - Pricing structure issues
    - Missing required information
    - Non-compliance with policy
    - Duplicate template exists
    - Other (specify)
  - User enters detailed rejection notes
  - User can provide guidance for resubmission
  - User clicks "Confirm Rejection"
  - System changes status to "Rejected"
  - System sends rejection notification to submitter
  - System includes rejection reason and notes
  - Submitter can revise and resubmit
  - End use case

**EF-002: Approval Checklist Incomplete**
- At step 15, if required checklist items not completed:
  - System displays error: "Please complete all required checklist items"
  - System highlights incomplete items in red
  - System scrolls to first incomplete item
  - User must complete all items
  - Continue to step 15

**EF-003: Template Modified During Review**
- At step 15, if template was modified during approval:
  - System detects version conflict
  - System displays error: "Template was modified during your review"
  - System shows what changed
  - User options:
    - "Review New Version": Restarts review with updates
    - "Approve Original": Approves version user reviewed
    - "Reject": Returns for consolidation
  - System proceeds based on selection

**EF-004: Approval Deadline Exceeded**
- At step 3, if SLA deadline passed:
  - System displays "OVERDUE" warning badge
  - System has already escalated to manager
  - User completes approval as normal
  - System logs SLA breach
  - Approval performance tracked
  - Impacts user's approval metrics
  - Continue to step 4

**EF-005: High-Value Template Requires Additional Approval**
- At step 15, if template exceeds value threshold (>$100K):
  - System detects high value based on:
    - Product count × estimated prices
    - Target vendor count
    - Expected order volume
  - System displays notice: "This template requires executive approval"
  - System adds executive approval stage
  - Current approval continues
  - Executive notified after current stage
  - Continue to step 16

**EF-006: Duplicate Template Exists**
- At step 7, if system detects similar template:
  - System displays warning: "Similar template exists"
  - System shows duplicate template details:
    - Template name and code
    - Effective dates
    - Product overlap: XX%
    - Status
  - User options:
    - "Approve Anyway": Proceeds with approval
    - "Reject as Duplicate": Rejects with reason
    - "Compare Templates": Views side-by-side
  - User makes decision
  - System proceeds based on selection

**EF-007: Approval Permission Revoked**
- At step 4, if user's approval permission revoked:
  - System displays error: "Approval permission no longer active"
  - System automatically delegates to backup approver
  - System sends notification to both users
  - Original user cannot proceed
  - Backup continues approval
  - End use case

**EF-008: Concurrent Approvals Conflict**
- At step 15, if using parallel approval and approvals conflict:
  - Example: Finance approves, Procurement rejects
  - System escalates to higher authority
  - System notifies all approvers of conflict
  - Management reviews both decisions
  - Management makes final decision
  - System proceeds based on final decision

#### Business Rules Applied
- BR-PT-003: New templates require approval before distribution
- All checklist items must be completed
- Rejection requires detailed reason
- Approvers cannot approve their own template submissions
- SLA: 48 hours per approval stage
- High-value templates (>$100K) require executive approval
- Major template changes require all approval stages
- Minor updates may bypass some stages

#### UI Requirements
- Mobile-responsive approval interface
- Tabbed template review interface
- Side-by-side version comparison
- Visual approval progress tracker
- Color-coded SLA indicators (green, yellow, red)
- One-click approval buttons
- Inline comments on specific items
- Approval history timeline
- Quick action shortcuts
- Bulk approval capability
- Email approval option (one-click from email)
- Real-time approval status updates
- Document preview panel
- Checklist progress bar

---

## 5. Use Case Dependencies

### 5.1 Dependency Matrix

| Use Case | Depends On | Enables |
|----------|-----------|---------|
| UC-PT-001: Create Template | - | UC-PT-002, UC-PT-003, UC-PT-008 |
| UC-PT-002: Add Products | UC-PT-001 | UC-PT-003, UC-PT-008 |
| UC-PT-003: Define Pricing | UC-PT-001, UC-PT-002 | UC-PT-008 |
| UC-PT-004: Distribute Template | UC-PT-008 (approval) | UC-PT-005 |
| UC-PT-005: Track Submissions | UC-PT-004 | - |
| UC-PT-006: Clone Template | Existing template | UC-PT-001, UC-PT-002 |
| UC-PT-007: Version Template | UC-PT-001 | UC-PT-008 |
| UC-PT-008: Approve Changes | UC-PT-001, UC-PT-002, UC-PT-003 | UC-PT-004 |

---

## 6. Success Metrics

### 6.1 Use Case Performance Targets

| Use Case | Target Time | Target Success Rate |
|----------|-------------|-------------------|
| UC-PT-001: Create Template | <5 minutes | >90% |
| UC-PT-002: Add Products (10 products) | <2 minutes | >95% |
| UC-PT-003: Define Pricing | <3 minutes | >95% |
| UC-PT-004: Distribute (50 vendors) | <2 minutes | >98% |
| UC-PT-005: Track Submissions | <1 second | >99% |
| UC-PT-006: Clone Template | <10 seconds | >99% |
| UC-PT-007: Version Template | <30 seconds | >98% |
| UC-PT-008: Approve Template | <15 minutes | >85% |

### 6.2 User Satisfaction Targets
- Overall satisfaction: >4.0/5.0
- Ease of use: >4.2/5.0
- Time savings: >60% vs. manual process
- Template completion rate: >90%
- Vendor submission rate: >85%

### 6.3 Business Impact Targets
- 80% reduction in time to collect vendor pricing
- 90% template submission completion rate
- 50% reduction in pricing errors/clarifications
- 100% templates use standardized format
- 75% vendor satisfaction with template process

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial creation with 8 detailed use cases |

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- TS-pricelist-templates.md - Technical Specification
- DS-pricelist-templates.md - Data Schema
- FD-pricelist-templates.md - Flow Diagrams
- VAL-pricelist-templates.md - Validations
- VENDOR-MANAGEMENT-OVERVIEW.md - Module Overview

---

**End of Use Cases Document**
