# Price Lists - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Price Lists
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document provides detailed use case descriptions for the Price Lists module. Each use case includes preconditions, main flows, alternate flows, exception flows, postconditions, business rules, and UI requirements.

The Price Lists module enables organizations to store, manage, and utilize vendor pricing information for procurement decisions, supporting manual creation, automated generation from templates and RFQs, bulk operations, and comprehensive price analysis.

---

## 2. Use Case Index

| Use Case ID | Use Case Name | Actor(s) | Priority |
|-------------|---------------|----------|----------|
| UC-PL-001 | Create Price List | Procurement Staff, Purchasing Manager | High |
| UC-PL-002 | Import Vendor Prices | Procurement Staff, Purchasing Manager | High |
| UC-PL-003 | Update Existing Prices | Procurement Staff, Purchasing Manager | High |
| UC-PL-004 | Compare Prices Across Vendors | Procurement Staff, Purchasing Manager, Department Manager | High |
| UC-PL-005 | View Price History | Procurement Staff, Purchasing Manager, Financial Manager | Medium |
| UC-PL-006 | Set Price Alerts | Procurement Staff, Purchasing Manager, Department Manager | Medium |
| UC-PL-007 | Export Price Lists | Procurement Staff, Purchasing Manager, Financial Manager | Medium |
| UC-PL-008 | Approve Price Changes | Procurement Manager, Financial Manager, Executive | High |
| UC-PL-009 | Auto-Create from Template Submission | System (automated), Procurement Staff | High |
| UC-PL-010 | Auto-Create from RFQ Award | System (automated) | High |

---

## 3. Detailed Use Cases

### UC-PL-001: Create Price List

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to quickly create accurate price lists
- Purchasing Manager: Needs to ensure pricing is competitive and approved
- Finance Team: Wants to ensure pricing aligns with budget
- Vendors: Want their pricing accurately represented in system

**Preconditions**:
- User is authenticated and has "Create Price List" permission
- Vendor exists in vendor directory with status "approved" or "preferred"
- Product catalog is accessible and contains products
- User's department and location are configured

**Trigger**: User clicks "Create New Price List" button

---

#### Main Flow

**Step 1: Initiate Price List Creation**
1. User navigates to "Vendor Management" > "Price Lists"
2. System displays price lists dashboard
3. User clicks "Create New Price List" button
4. System displays price list creation wizard with 5 steps:
   - Step 1: Basic Information
   - Step 2: Product Selection
   - Step 3: Pricing Details
   - Step 4: Terms & Conditions
   - Step 5: Review & Submit

**Step 2: Enter Basic Information**
5. System displays Step 1: Basic Information form
6. User enters/selects:
   - Price List Name (required, 5-200 characters)
   - Vendor (required, searchable dropdown)
   - Description (optional, max 2000 characters)
   - Currency (required, default USD)
   - Effective From Date (required, date picker)
   - Effective To Date (optional, date picker)
   - Source Type (dropdown: Manual, Template, RFQ, Negotiation, Contract)
   - Source Reference (conditional, if not Manual)
7. User can optionally set targeting:
   - Specific Locations (multi-select)
   - Specific Departments (multi-select)
8. User clicks "Next" to proceed to Step 2
9. System validates Step 1 data
10. System saves draft and proceeds to Step 2

**Step 3: Select Products**
11. System displays Step 2: Product Selection interface
12. System shows:
    - Search bar to find products
    - Product catalog browser with categories
    - Selected products list (initially empty)
13. User searches for products by:
    - Product name
    - SKU
    - Category
    - Vendor's product code
14. System displays matching products with:
    - Product image
    - Product name and SKU
    - Current category
    - Current vendors supplying this product
    - "Add" button
15. User clicks "Add" for each product to include
16. System adds product to selected products list
17. User can:
    - Add multiple products
    - Remove products from selection
    - Reorder products (drag and drop)
18. User clicks "Next" to proceed to Step 3
19. System validates at least 1 product selected (BR-PL-001)
20. System saves draft and proceeds to Step 3

**Step 4: Enter Pricing Details**
21. System displays Step 3: Pricing Details form
22. System shows table with all selected products
23. For each product, system displays:
    - Product name and SKU
    - Product image (thumbnail)
    - Pricing input fields
    - Terms input fields
24. User enters for each product:
    - **Base Price** (required, positive number, up to 4 decimals)
    - **Unit Price** (required, positive number, up to 4 decimals)
    - **Unit of Measure** (required, dropdown: EA, KG, LB, L, etc.)
    - Case Price (optional, positive number)
    - Bulk Price (optional, positive number)
25. User can click "Add Pricing Tiers" to define volume pricing:
    - Min Quantity (required, positive integer)
    - Max Quantity (optional, positive integer)
    - Price (required, must be ≤ previous tier)
    - Discount Percent (optional, calculated automatically)
26. User can add multiple tiers per product
27. User enters commercial terms for each product:
    - Minimum Order Quantity (MOQ) (optional, positive integer)
    - Pack Size (optional, positive number with up to 3 decimals)
    - Lead Time Days (required, 1-365 days)
    - Shipping Cost (optional, positive number)
28. System provides bulk actions:
    - Apply same lead time to all products
    - Apply same MOQ to all products
    - Apply percentage markup/discount to all prices
29. User can click "Save Draft" at any time
30. User clicks "Next" to proceed to Step 4
31. System validates all pricing data
32. System saves draft and proceeds to Step 4

**Step 5: Enter Terms & Conditions**
33. System displays Step 4: Terms & Conditions form
34. User enters/selects:
    - Payment Terms (dropdown or custom text, max 500 chars)
    - Warranty Terms (optional, max 500 chars)
    - Return Policy (optional, max 500 chars)
    - Special Conditions (optional, max 2000 chars)
35. User can upload supporting documents:
    - Price confirmation from vendor (PDF, max 10MB)
    - Contract or agreement (PDF, max 10MB)
    - Other supporting documents
36. System validates file types and sizes
37. User clicks "Next" to proceed to Step 5
38. System saves draft and proceeds to Step 5

**Step 6: Review & Submit**
39. System displays Step 5: Review & Submit summary
40. System shows complete price list summary:
    - Basic information recap
    - Total products count
    - Price range (lowest to highest)
    - Average lead time
    - Total estimated annual value (if historical usage available)
41. System displays full product pricing table
42. User reviews all information
43. User can click "Edit" on any section to go back
44. User can select submission action:
    - "Save as Draft" (status: Draft)
    - "Activate Now" (status: Active, if no approval required)
    - "Submit for Approval" (status: Pending Approval, if approval required)
45. If price increases >10% detected, system displays warning and forces "Submit for Approval"
46. User clicks selected action button
47. System performs final validation
48. System creates price list with unique number (PL-YYYY-VENDORCODE-XXXX)
49. System sets appropriate status based on action
50. System sends notifications:
    - To user: Confirmation of creation
    - To approvers: If pending approval
    - To finance team: If estimated annual value >$50K
51. System displays success message with price list number
52. System redirects to price list detail view

---

#### Alternate Flows

**AF-001: Save Draft at Any Step**
- At any step 2-5, user clicks "Save Draft"
- System validates current step data
- System saves draft with current progress
- System displays "Draft saved successfully" message
- User can continue editing or exit

**AF-002: Use Template**
- At Step 1, user clicks "Use Template" button
- System displays modal with available price list templates
- User selects template
- System pre-fills form fields from template
- User modifies as needed
- Flow continues from step 8

**AF-003: Clone Existing Price List**
- User starts from existing price list detail view
- User clicks "Clone" button
- System creates copy of price list
- System opens creation wizard with pre-filled data
- System clears dates and sets status to Draft
- User modifies as needed
- Flow continues from step 6

**AF-004: Quick Create (Simplified)**
- User selects "Quick Create" option
- System displays single-page form with essential fields only
- User enters minimal required information
- System uses defaults for optional fields
- Flow skips to step 47 (final validation)

**AF-005: Bulk Price Entry**
- At Step 3, user clicks "Bulk Price Entry"
- System displays modal with spreadsheet-like interface
- User enters prices in table format
- System validates data on each cell
- User clicks "Apply"
- System updates pricing for all products
- Flow continues from step 30

**AF-006: Import Pricing from File**
- At Step 3, user clicks "Import Prices"
- System displays file upload modal
- User uploads Excel/CSV file with pricing
- System validates and imports pricing data
- System displays import results
- Flow continues from step 30

---

#### Exception Flows

**EF-001: Validation Errors**
- At any validation step, system detects errors
- System displays error summary at top of form
- System highlights fields with errors
- System displays specific error message for each field
- User corrects errors
- User resubmits
- Flow continues from failed validation step

**EF-002: Duplicate Active Price List**
- At step 47, system detects duplicate active price list for same vendor-product-location
- System displays error: "An active price list already exists for this vendor and location. Please adjust dates or cancel existing price list."
- System offers options:
  - "View Existing Price List"
  - "Adjust Dates" (change effective dates to avoid overlap)
  - "Cancel"
- User selects option
- If "Adjust Dates", flow returns to Step 2
- If "Cancel", flow terminates

**EF-003: Vendor Not Approved**
- At step 9, system validates vendor status
- Vendor status is not "approved" or "preferred"
- System displays error: "Only approved or preferred vendors can have price lists. Current vendor status: {status}"
- System offers to navigate to vendor profile
- User must approve vendor first before continuing
- Flow terminates

**EF-004: No Products in Catalog**
- At step 11, system loads product catalog
- Product catalog is empty or unavailable
- System displays error: "Product catalog is not available. Please contact system administrator."
- System offers "Retry" button
- User can cancel or retry
- Flow terminates if cannot load catalog

**EF-005: File Upload Failure**
- At step 35, user uploads supporting document
- File upload fails (network error, file too large, invalid type)
- System displays error: "File upload failed: {reason}"
- System retains other form data
- User can retry upload or continue without document
- Flow continues from step 36

**EF-006: Session Timeout**
- During any step, user session expires (30 minutes inactivity)
- System displays warning: "Your session is about to expire. Save your work."
- After 2 more minutes, session expires
- System saves current draft automatically
- User is redirected to login
- After login, system offers to restore saved draft
- User can resume from last saved step

**EF-007: Price Increase Exceeds Threshold**
- At step 47, system detects price increase >10% from previous price list
- System displays warning modal: "Price increases >10% detected. Approval required before activation."
- System shows table of products with excessive increases
- User must provide justification (required, min 50 characters)
- System forces "Submit for Approval" action
- "Activate Now" button disabled
- Flow continues to step 49 with forced approval status

**EF-008: Insufficient Permissions**
- User attempts action without required permission
- System displays error: "You do not have permission to {action}. Contact your administrator."
- System logs unauthorized attempt
- User redirected to price lists list
- Flow terminates

---

#### Postconditions

**Success**:
- Price list created with unique identifier
- Price list has status: Draft, Pending Approval, or Active
- All line items stored with complete pricing and terms
- Source references recorded if applicable
- Audit log entry created with user, timestamp, action
- If approval required:
  - Approval workflow initiated
  - Notifications sent to approvers
  - Price list marked as "Pending Approval"
- If no approval required and activated:
  - Price list marked as "Active"
  - Available for use in procurement
  - Previous price list for same vendor-product-location superseded
- User receives confirmation notification
- User can view created price list

**Failure**:
- No price list created
- Draft may be saved if user explicitly saved
- Error logged in system logs
- User informed of failure reason
- User can retry or cancel

---

#### Business Rules Applied

- **BR-PL-001**: Price list must have at least 1 product (validated at step 19)
- **BR-PL-002**: Effective dates cannot be in the past for new price lists (validated at step 9)
- **BR-PL-003**: Price increases >10% require approval (enforced at step 47)
- **BR-PL-004**: Only one active price list per vendor-product-location (validated at step 47)
- **BR-PL-008**: All prices must be positive numbers (validated at step 31)
- **BR-PL-009**: Prices have maximum 4 decimal places (enforced at input)
- **BR-PL-010**: Tiered pricing must show decreasing unit price (validated at step 31)
- **BR-PL-011**: All items in price list use same currency (enforced by design)
- **BR-PL-015**: Approval routing based on price change magnitude (enforced at step 49)

---

#### UI Requirements

**Price List Creation Wizard**:
- **Layout**: Multi-step wizard with progress indicator (5 steps)
- **Navigation**: "Previous", "Next", "Save Draft", "Cancel" buttons
- **Progress Bar**: Visual indicator showing current step (1/5, 2/5, etc.)
- **Step Indicators**: Clickable step numbers if previous steps completed
- **Auto-save**: Auto-save draft every 2 minutes
- **Responsive**: Mobile-friendly for tablet use

**Step 1: Basic Information Form**:
- **Vendor Search**: Autocomplete dropdown with vendor search
- **Date Pickers**: Calendar widgets for effective dates with date range validation
- **Character Counters**: Show remaining characters for text fields
- **Source Type**: Conditional fields based on source type selection
- **Targeting**: Optional collapsible section for location/department targeting

**Step 2: Product Selection**:
- **Search Interface**: Prominent search bar with filters
- **Product Cards**: Visual product cards with image, name, SKU, "Add" button
- **Selected List**: Right-side panel showing selected products with remove option
- **Drag & Drop**: Reorder products in selected list
- **Category Browser**: Expandable tree view of product categories
- **Pagination**: Paginated product results (20 per page)

**Step 3: Pricing Details**:
- **Data Table**: Editable table with all selected products
- **Inline Editing**: Click to edit pricing fields
- **Pricing Tiers**: Expandable section for each product to add tiers
- **Bulk Actions Toolbar**: Buttons for bulk operations above table
- **Calculation Helpers**: Auto-calculate fields (discount %, total cost)
- **Validation Indicators**: Inline validation with red/green indicators
- **Currency Display**: Currency symbol shown before all price fields

**Step 4: Terms & Conditions**:
- **Text Areas**: Large text areas for terms with character counters
- **Document Upload**: Drag-and-drop file upload area
- **File List**: Uploaded files listed with remove option
- **Templates**: Dropdown to select predefined terms templates

**Step 5: Review & Submit**:
- **Summary Cards**: Visually distinct cards for each section
- **Editable Sections**: "Edit" buttons for each section linking back to step
- **Full Product Table**: Complete table showing all products and pricing
- **Warnings**: Prominent display of any warnings or required approvals
- **Action Buttons**: Large, distinct buttons for "Save as Draft", "Activate", "Submit for Approval"
- **Confirmation Modal**: Modal confirmation before final submission

---

### UC-PL-002: Import Vendor Prices

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to efficiently import large amounts of pricing data
- Vendors: Want their pricing accurately imported without errors
- Finance Team: Needs to ensure imported data is validated

**Preconditions**:
- User is authenticated and has "Import Prices" permission
- Import template is available for download
- Vendor exists in vendor directory
- Product catalog contains products referenced in import file

**Trigger**: User clicks "Import Prices" button

---

#### Main Flow

**Step 1: Initiate Import**
1. User navigates to "Vendor Management" > "Price Lists"
2. User clicks "Import Prices" button
3. System displays import wizard with 4 steps:
   - Step 1: Download Template
   - Step 2: Upload File
   - Step 3: Review & Validate
   - Step 4: Confirm Import

**Step 2: Download Template**
4. System displays Step 1: Download Template
5. System shows import template options:
   - New Price List Template (for creating new price list)
   - Update Existing Template (for updating existing price list)
   - Add Items Template (for adding items to existing price list)
6. User selects template type
7. If "Update Existing" or "Add Items", user searches and selects target price list
8. User clicks "Download Template"
9. System generates Excel template with:
   - Instructions worksheet
   - Data entry worksheet with column headers
   - Data validation rules
   - Example rows
   - Reference data (valid vendors, products, UOMs)
10. System downloads template file to user's computer
11. User clicks "Next" when ready to upload

**Step 3: Prepare Import File**
12. User opens downloaded template in Excel
13. User fills data entry worksheet with vendor pricing data:
    - **Vendor Code** (required, must exist in system)
    - **Product SKU** (required, must exist in catalog)
    - **Base Price** (required, positive number)
    - **Unit Price** (required, positive number)
    - **UOM** (required, from dropdown)
    - Case Price (optional)
    - Bulk Price (optional)
    - MOQ (optional, integer)
    - Pack Size (optional, number)
    - Lead Time Days (required, 1-365)
    - Shipping Cost (optional)
    - Notes (optional, max 500 chars)
14. Excel template provides:
    - Dropdown validation for constrained fields
    - Cell formatting for numeric fields
    - Error highlighting for invalid data
15. User can fill up to 10,000 rows
16. User saves completed template
17. User returns to import wizard

**Step 4: Upload Import File**
18. System displays Step 2: Upload File
19. System shows drag-and-drop upload area
20. User drags and drops completed Excel file OR clicks "Browse" to select file
21. System validates file:
    - File format (Excel .xlsx or .xls)
    - File size (<50MB)
    - File structure matches template
22. System uploads file to server
23. System displays upload progress bar
24. Upload completes
25. User clicks "Next" to proceed to validation

**Step 5: Validate Import Data**
26. System displays Step 3: Review & Validate
27. System shows "Validating data..." progress indicator
28. System validates each row:
    - Vendor exists and is approved
    - Product exists in catalog
    - All required fields present
    - Prices are positive numbers
    - Prices have max 4 decimal places
    - Lead time within valid range (1-365)
    - MOQ and pack size are valid numbers
    - Duplicate rows within file
29. System categorizes rows:
    - **Valid rows**: Pass all validations (green)
    - **Warning rows**: Pass validation but have warnings (yellow)
    - **Error rows**: Fail validation (red)
30. System displays validation summary:
    - Total rows: X
    - Valid rows: X (green)
    - Rows with warnings: X (yellow)
    - Rows with errors: X (red)
31. System displays data preview table showing all rows with validation status
32. For error rows, system displays specific error messages
33. User can:
    - Filter table by validation status
    - Sort by any column
    - View detailed error messages
    - Download validation report (Excel)
34. If errors exist, user has options:
    - "Download Error Report" (Excel with highlighted errors)
    - "Fix Errors and Re-upload"
    - "Import Valid Rows Only" (skip error rows)
    - "Cancel Import"
35. If "Fix Errors and Re-upload" selected:
    - User downloads error report
    - User corrects errors in Excel
    - User re-uploads file
    - Flow returns to step 21
36. If "Import Valid Rows Only" or no errors:
    - User clicks "Next" to proceed to confirmation
37. System proceeds to Step 4

**Step 6: Confirm and Execute Import**
38. System displays Step 4: Confirm Import
39. System shows import summary:
    - Price list name (if creating new) or target price list (if updating)
    - Vendor name
    - Total valid items to import: X
    - Estimated completion time
40. If creating new price list:
    - User enters price list basic information:
      - Price List Name (required)
      - Description (optional)
      - Currency (required)
      - Effective From Date (required)
      - Effective To Date (optional)
41. If updating existing or adding items:
    - System displays current price list information
    - User confirms update action
42. User reviews import summary
43. User can select import options:
    - "Replace existing items" (for updates, replaces all items)
    - "Merge with existing" (for updates, adds/updates items)
    - "Create backup before import" (recommended)
44. User clicks "Confirm Import" button
45. System displays confirmation modal: "Are you sure you want to import X items?"
46. User clicks "Yes, Import"
47. System processes import:
    - Creates backup if selected
    - Creates or updates price list
    - Inserts all valid line items
    - Updates price list metadata
    - Records import transaction
48. System displays progress bar during import
49. Import completes
50. System displays success message:
    - "Successfully imported X items"
    - "Skipped X rows with errors" (if applicable)
    - Price list number and status
51. System provides next action options:
    - "View Price List"
    - "Download Import Report"
    - "Import More Prices"
52. System sends notification email to user with import summary

---

#### Alternate Flows

**AF-001: Import Using CSV File**
- At step 20, user uploads CSV file instead of Excel
- System validates CSV format (comma-delimited, UTF-8 encoding)
- System parses CSV data
- Flow continues from step 22

**AF-002: Import Template Customization**
- At step 5, user clicks "Customize Template"
- System displays column configuration modal
- User selects which columns to include
- User rearranges column order
- System generates customized template
- Flow continues from step 9

**AF-003: Partial Import with Approval**
- At step 47, system detects price increases >10%
- System splits import into two groups:
  - Items not requiring approval (auto-imported)
  - Items requiring approval (pending approval)
- System displays two-part summary
- Items requiring approval go through approval workflow
- Flow continues to step 50 with partial success message

**AF-004: Resume Interrupted Import**
- User starts import but does not complete
- System saves import draft
- User returns later and clicks "Resume Import"
- System displays saved import with uploaded file
- User can continue from validation step
- Flow continues from step 26

---

#### Exception Flows

**EF-001: Invalid File Format**
- At step 21, system detects invalid file format
- System displays error: "Invalid file format. Please upload Excel (.xlsx, .xls) or CSV file."
- User must select correct file
- Flow returns to step 20

**EF-002: File Size Exceeded**
- At step 21, system detects file >50MB
- System displays error: "File size exceeds 50MB limit. Please reduce file size or split into multiple imports."
- User must reduce file size
- Flow returns to step 20

**EF-003: All Rows Have Errors**
- At step 30, system finds errors in all rows
- System displays error summary: "All rows contain errors. Please review and correct data."
- "Import Valid Rows Only" button disabled
- User must fix errors and re-upload
- Flow returns to step 20 after user downloads error report

**EF-004: Duplicate Import Detected**
- At step 47, system detects user recently imported identical data
- System displays warning: "This appears to be a duplicate import. Continue anyway?"
- User can:
  - "Continue" (proceed with import)
  - "Cancel" (abort import)
- If continue, flow proceeds to step 48
- If cancel, flow terminates

**EF-005: Import Processing Failure**
- At step 47, import processing fails (database error, timeout)
- System displays error: "Import failed: {error reason}"
- System rolls back any partial changes
- System restores backup if created
- System logs error for investigation
- User offered options:
  - "Retry Import"
  - "Download Error Log"
  - "Cancel"
- Flow terminates or retries from step 47

**EF-006: File Structure Mismatch**
- At step 21, uploaded file structure doesn't match template
- System displays error: "File structure does not match template. Missing columns: {list}"
- System suggests downloading correct template
- User must use correct template
- Flow returns to step 20

---

#### Postconditions

**Success**:
- Price list created or updated with imported items
- All valid rows imported successfully
- Import transaction recorded in audit log
- Import report generated and available for download
- User notified of import completion
- If errors skipped:
  - Error report available for download
  - Error count logged
- If approval required:
  - Items requiring approval pending in approval workflow
  - Approvers notified

**Failure**:
- No data imported
- System state unchanged
- Error logged with details
- User notified of failure reason
- Original data preserved

---

#### Business Rules Applied

- **BR-PL-001**: Price list must have at least 1 item
- **BR-PL-008**: All prices must be positive numbers
- **BR-PL-009**: Prices have maximum 4 decimal places
- **BR-PL-003**: Price increases >10% require approval (auto-routed)
- Import batch size limited to 10,000 items (performance)

---

#### UI Requirements

**Import Wizard**:
- **Progress Indicator**: 4-step wizard with visual progress
- **File Upload**: Drag-and-drop area with browse button
- **Progress Bars**: Visual progress for upload and validation
- **Data Preview**: Scrollable table with 100 rows visible, paginate rest

**Validation Results Table**:
- **Color Coding**: Green (valid), yellow (warning), red (error)
- **Sortable Columns**: Click headers to sort
- **Filter Buttons**: Quick filters for validation status
- **Error Tooltips**: Hover over error icon to see details
- **Row Selection**: Select rows to view detailed errors

**Import Summary**:
- **Statistics Cards**: Large, visual cards showing counts
- **Action Buttons**: Clear, distinct buttons for user actions
- **Confirmation Modal**: Double-confirmation for data safety

---

### UC-PL-003: Update Existing Prices

**Primary Actor**: Procurement Staff, Purchasing Manager, Vendor (via portal)

**Stakeholders and Interests**:
- Procurement Staff: Wants to efficiently update prices when vendors change pricing
- Vendors: Want ability to update their pricing easily
- Finance Team: Needs to track price changes for budget adjustments
- Department Managers: Want to be notified of significant price changes

**Preconditions**:
- User is authenticated and has "Update Price List" permission
- Price list exists and is not expired
- User has access to the price list based on role and location

**Trigger**: User opens price list and clicks "Edit Prices"

---

#### Main Flow

**Step 1: Navigate to Price List**
1. User navigates to "Vendor Management" > "Price Lists"
2. System displays price lists dashboard with search and filters
3. User searches for price list by:
   - Price list number
   - Vendor name
   - Product name/SKU
   - Date range
4. System displays matching price lists
5. User clicks on price list to open
6. System displays price list detail view with all information

**Step 2: Initiate Price Update**
7. User clicks "Edit Prices" button
8. System checks if user has permission to edit
9. System checks if price list is editable (not expired, not superseded)
10. System displays editable price list form
11. System shows:
    - Basic information (read-only: vendor, price list number, dates)
    - Product pricing table (editable)
    - Terms & conditions (editable)

**Step 3: Update Individual Product Prices**
12. System displays product pricing table with columns:
    - Product Name & SKU
    - Current Base Price
    - Current Unit Price
    - Case Price
    - Bulk Price
    - Pricing Tiers (if any)
    - MOQ
    - Lead Time Days
    - Actions (Edit, Remove)
13. User clicks "Edit" button for a product
14. System opens inline editor or modal for the product
15. User modifies:
    - Base Price
    - Unit Price
    - Case Price (optional)
    - Bulk Price (optional)
    - Pricing Tiers
    - MOQ
    - Pack Size
    - Lead Time Days
    - Shipping Cost
16. If price increases >10%, system displays warning in real-time
17. If price increases >10%, system prompts for change reason (required)
18. User enters change reason if prompted (min 20 characters)
19. User clicks "Save Changes" for the product
20. System validates changes
21. System calculates price change percentage
22. System updates product pricing in price list
23. System updates "Last Updated" timestamp for item
24. System displays updated pricing in table

**Step 4: Bulk Update Option**
25. User can click "Bulk Update" button for mass price changes
26. System displays bulk update modal with options:
    - Apply percentage change to selected products
    - Update specific field for selected products
    - Import price changes from file
27. If "Apply percentage change":
    - User selects products (checkboxes)
    - User enters percentage (+5% increase, -3% decrease)
    - User can specify which price type to update (base, unit, case, bulk)
    - User enters reason for bulk change (required if >10%)
    - System calculates new prices
    - System displays preview of changes
    - User confirms
    - System applies changes to all selected products
28. If "Update specific field":
    - User selects products
    - User selects field to update (e.g., Lead Time Days)
    - User enters new value
    - User enters reason for change
    - System displays preview
    - User confirms
    - System applies changes
29. If "Import price changes":
    - User uploads file with price updates
    - System validates file
    - System displays changes preview
    - User confirms
    - System applies changes
    - Flow similar to UC-PL-002 (Import)

**Step 5: Add or Remove Products**
30. User can add new products to price list:
    - User clicks "Add Products" button
    - System displays product search modal
    - User searches and selects products to add
    - User enters pricing for new products
    - System adds products to price list
31. User can remove products from price list:
    - User clicks "Remove" button for a product
    - System displays confirmation: "Remove product from price list?"
    - User confirms
    - System removes product from price list

**Step 6: Update Terms & Conditions**
32. User scrolls to Terms & Conditions section
33. User clicks "Edit Terms"
34. System displays editable terms fields
35. User modifies:
    - Payment Terms
    - Warranty Terms
    - Return Policy
    - Special Conditions
36. User saves term changes

**Step 7: Review and Save Changes**
37. User reviews all changes made
38. System displays summary of changes:
    - Products with price increases (count and %)
    - Products with price decreases (count and %)
    - New products added
    - Products removed
    - Terms updated
39. If any price increase >10%, system displays:
    - Warning message
    - List of products exceeding threshold
    - Approval requirement notice
40. User clicks "Save Changes"
41. System validates all changes
42. System determines if approval required based on price changes
43. If approval required:
    - System changes price list status to "Pending Approval"
    - System routes to appropriate approver
    - System notifies approvers
    - System displays message: "Changes submitted for approval"
44. If no approval required:
    - System saves changes immediately
    - System updates price list version (if versioning enabled)
    - System marks previous version as superseded
    - System displays success message: "Price list updated successfully"
45. System records all changes in price change history
46. System sends notifications:
    - To user: Confirmation of changes
    - To approvers: If pending approval
    - To subscribed users: If price alert configured
47. System redirects to updated price list detail view

---

#### Alternate Flows

**AF-001: Quick Price Update**
- At step 13, user double-clicks on price cell
- System enables inline editing
- User types new price directly in table
- User presses Enter to save
- System validates and updates
- No modal or separate form needed
- Flow continues from step 20

**AF-002: Copy Pricing from Another Price List**
- At step 11, user clicks "Copy Pricing From..."
- System displays modal to select source price list
- User searches and selects source price list
- System displays matching products between lists
- User selects which products to copy pricing for
- User confirms copy operation
- System copies pricing from source to current price list
- Flow continues from step 37

**AF-003: Revert Recent Changes**
- At any point before saving, user clicks "Revert Changes"
- System displays confirmation: "Discard all unsaved changes?"
- User confirms
- System reloads original price list data
- All unsaved edits discarded
- User returned to read-only view

**AF-004: Schedule Future Price Changes**
- At step 39, user clicks "Schedule for Future Date"
- System displays date picker modal
- User selects future effective date for changes
- System creates scheduled price update task
- Current price list remains active until scheduled date
- On scheduled date, system applies changes automatically
- Flow completes with scheduling confirmation

**AF-005: Vendor Self-Service Update (Portal)**
- Vendor logs into vendor portal
- Vendor navigates to "My Price Lists"
- Vendor selects their price list
- Vendor clicks "Request Price Update"
- System displays editable form for vendor
- Vendor updates their pricing
- Vendor submits request
- System creates price update pending buyer approval
- Buyer receives notification to review vendor's proposed changes
- Buyer approves or requests modifications
- If approved, flow continues from step 42

---

#### Exception Flows

**EF-001: Price List Not Editable**
- At step 9, system determines price list cannot be edited
- Reasons: expired, superseded, or locked
- System displays error: "This price list cannot be edited. Reason: {reason}"
- System suggests alternatives:
  - "Create New Version" (clone and edit)
  - "View History"
- Flow terminates

**EF-002: Concurrent Edit Conflict**
- User is editing price list
- Another user saves changes to same price list
- At step 40, system detects concurrent modification
- System displays error: "This price list has been modified by another user. Your changes cannot be saved."
- System offers options:
  - "View Other User's Changes"
  - "Reload and Retry" (lose current changes)
  - "Save as New Version"
- User selects option
- Flow adjusts based on selection

**EF-003: Validation Errors on Save**
- At step 41, system detects validation errors
- Errors include:
  - Negative prices
  - Invalid date ranges
  - Missing required fields
  - Tiered pricing inconsistencies
- System displays error summary
- System highlights fields with errors
- User corrects errors
- User resubmits
- Flow returns to step 41

**EF-004: Approval Rejected**
- Price list submitted for approval (step 43)
- Approver rejects changes
- System changes status back to "Active" (reverts to previous state)
- System notifies user of rejection with reasons
- User can:
  - Review rejection reasons
  - Make adjustments
  - Resubmit for approval
- Flow can restart from step 7 for adjustments

**EF-005: Extreme Price Change**
- At step 20, system detects price change >50%
- System displays critical warning: "Price change exceeds 50%. This requires additional review."
- System requires:
  - Detailed justification (min 100 characters)
  - Supporting documentation upload (mandatory)
  - Supervisor review before submission
- User provides required information
- System flags for executive-level approval
- Flow continues to step 22 with heightened approval requirements

**EF-006: Product Discontinued**
- User attempts to update pricing for a product
- Product has been discontinued in product catalog
- System displays warning: "This product has been discontinued. Price list will be flagged."
- System offers options:
  - "Remove from Price List"
  - "Keep and Flag" (for remaining inventory)
- User selects option
- System applies user's choice
- Flow continues from step 24

---

#### Postconditions

**Success**:
- Price list updated with new pricing
- Price change history recorded for all modified items
- Each changed item shows:
  - Previous price
  - New price
  - Change percentage
  - Change reason
  - User who made change
  - Timestamp
- If approval required:
  - Price list status: Pending Approval
  - Approval workflow initiated
  - Notifications sent to approvers
  - Changes not yet active
- If no approval required:
  - Price list status: Active
  - Changes active immediately
  - Previous version superseded (if versioning enabled)
- Audit log updated with complete change record
- Relevant stakeholders notified
- Price alerts triggered if thresholds exceeded

**Failure**:
- Price list unchanged
- No changes saved
- Error logged
- User informed of failure reason
- User can retry

---

#### Business Rules Applied

- **BR-PL-003**: Price increases >10% require approval (enforced at step 39)
- **BR-PL-008**: All prices must be positive (validated at step 41)
- **BR-PL-009**: Prices have maximum 4 decimal places (validated at step 20)
- **BR-PL-010**: Tiered pricing consistency validated (validated at step 41)
- **BR-PL-015**: Approval routing based on price change magnitude (enforced at step 42)
- **BR-PL-021**: Discontinued products flagged but not auto-deleted (EF-006)

---

#### UI Requirements

**Price List Edit View**:
- **Layout**: Full-width layout with sticky header
- **Edit Mode Indicator**: Banner showing "Editing Mode" with unsaved changes count
- **Auto-save**: Auto-save draft every 2 minutes
- **Unsaved Changes Warning**: Warn user if attempting to navigate away with unsaved changes

**Product Pricing Table**:
- **Inline Editing**: Click cell to edit, or double-click for quick edit
- **Row Selection**: Checkboxes for bulk operations
- **Sorting**: Click headers to sort by any column
- **Filtering**: Filter by product category, price range, change status
- **Highlight Changes**: Yellow background for modified cells
- **Price Change Indicators**: Up/down arrows with percentage change
- **Warning Icons**: Alert icon for items exceeding approval threshold

**Bulk Update Modal**:
- **Large, Centered Modal**: Overlay with backdrop
- **Radio Options**: Clear options for update type
- **Preview Table**: Show before/after prices in table
- **Apply/Cancel Buttons**: Large, distinct buttons

**Change Summary**:
- **Accordion Sections**: Collapsible sections for each change category
- **Statistics**: Visual stats showing counts and percentages
- **Approval Warning**: Prominent warning box if approval required

---

### UC-PL-004: Compare Prices Across Vendors

**Primary Actor**: Procurement Staff, Purchasing Manager, Department Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to quickly identify best pricing for products
- Purchasing Manager: Needs comprehensive comparison for decision-making
- Department Managers: Want cost-effective vendor selection
- Finance Team: Interested in cost savings opportunities

**Preconditions**:
- User is authenticated and has "View Price Lists" permission
- Multiple vendors have active price lists
- Products exist in multiple price lists
- User has access to relevant price lists based on location/department

**Trigger**: User searches for product and clicks "Compare Prices"

---

#### Main Flow

**Step 1: Initiate Price Comparison**
1. User navigates to "Vendor Management" > "Price Lists"
2. User clicks "Compare Prices" button OR
3. User navigates to specific product detail page and clicks "Compare Vendor Prices"
4. System displays price comparison search interface

**Step 2: Search for Product**
5. System displays product search form with:
   - Search bar (search by name, SKU, category)
   - Advanced filters:
     - Product Category (dropdown)
     - Product Subcategory (dropdown)
     - Vendor (multi-select, optional)
     - Location (multi-select, optional)
     - Date Range (effective date range)
6. User enters product name or SKU in search bar
7. System displays autocomplete suggestions as user types
8. User selects product from suggestions OR user presses Enter to search
9. System searches for product across all active price lists
10. System displays search results

**Step 3: Display Price Comparison**
11. System retrieves all active price lists containing the product
12. System filters price lists based on:
    - User's location access
    - User's department access
    - Selected filters (if any)
    - Active/valid date range
13. System displays price comparison page with:
    - Product information header (name, SKU, image, category)
    - Comparison summary statistics
    - Detailed vendor comparison table
    - Price history chart
14. **Product Information Header**:
    - Product Name
    - SKU
    - Product Image (thumbnail)
    - Current Category
    - Current Average Price
    - Price Range (min - max across vendors)
15. **Comparison Summary Statistics**:
    - Number of vendors with active pricing: X
    - Lowest Price: $XX.XX (Vendor Name) - highlighted in green
    - Highest Price: $XX.XX (Vendor Name) - highlighted in red
    - Average Price: $XX.XX
    - Price Spread: XX% (difference between highest and lowest)
    - Median Price: $XX.XX
16. **Vendor Comparison Table** displays columns:
    - Vendor Name (with vendor rating if available)
    - Unit Price
    - Case Price (if applicable)
    - Bulk Price (if applicable)
    - Currency
    - MOQ
    - Pack Size
    - Lead Time (days)
    - Shipping Cost
    - Total Cost per Unit (price + shipping/quantity)
    - Price List Effective Date
    - Price List Source (Manual, Template, RFQ, Contract)
    - Actions (View Details, Select)
17. System sorts table by "Total Cost per Unit" (lowest to highest) by default
18. System highlights lowest price row with green background
19. System displays price tier information icon - click to expand tiers

**Step 4: User Interacts with Comparison**
20. User can sort table by clicking any column header
21. User can filter vendors using filter controls:
    - Vendor Rating (5 stars, 4+ stars, etc.)
    - Lead Time (≤7 days, ≤14 days, ≤30 days)
    - Source Type (Contract, RFQ, Manual, Template)
    - Location (if multi-location)
22. User can view pricing tiers by clicking tier icon for a vendor:
    - System displays modal with tier breakdown
    - Table shows: Min Qty, Max Qty, Unit Price, Discount %
    - Visual chart shows price decrease by volume
23. User can view detailed terms by clicking "View Details" for a vendor:
    - System displays modal with full price list details
    - Shows: Payment Terms, Warranty, Return Policy, Special Conditions
    - Shows: Supporting documents (if any)
24. User can view price history for vendor-product by clicking history icon:
    - System displays price history modal
    - Shows: All historical prices for this vendor-product combination
    - Chart displays price trend over time
    - Table shows: Date, Price, Change %, Change Reason
25. User can toggle between comparison views:
    - Table View (default, detailed table)
    - Card View (vendor cards side-by-side)
    - Chart View (visual price comparison bar chart)

**Step 5: Make Selection or Export**
26. User can perform actions:
    - "Select Vendor" - marks vendor as preferred for this product
    - "Add to Cart" - if integrated with requisition system
    - "Create Purchase Request" - initiates PR with selected vendor
    - "Export Comparison" - downloads comparison data
27. If "Select Vendor" clicked:
    - System displays confirmation modal
    - User can add notes for selection reason
    - System records vendor selection for this product
    - System can update preferred vendor status
28. If "Export Comparison" clicked:
    - System displays export options modal
    - User selects export format (Excel, CSV, PDF)
    - User selects data to include (all columns or selected)
    - System generates export file
    - System downloads file to user
29. If "Create Purchase Request" clicked:
    - System redirects to PR creation form
    - System pre-fills product and vendor information
    - System pre-fills pricing from selected price list
    - User completes PR creation

**Step 6: Compare Multiple Products (Optional)**
30. User can add more products to comparison:
    - User clicks "Add Product to Comparison"
    - User searches and selects additional product
    - System adds product to comparison view
    - System displays side-by-side comparison for all selected products
31. Multi-product comparison shows:
    - Separate table for each product
    - OR consolidated table with product as additional grouping
    - Vendor consistency indicators (vendors offering all products)
    - Bundle pricing opportunities (if vendors offer multiple products)

---

#### Alternate Flows

**AF-001: Compare from Purchase Request**
- User creating purchase request
- User enters product
- System automatically displays price comparison from active price lists
- User selects vendor based on comparison
- System populates PR with selected pricing
- Flow integrates with PR creation

**AF-002: Save Comparison for Later**
- At step 29, user clicks "Save Comparison"
- System displays save modal
- User enters comparison name
- System saves comparison parameters and results
- User can access saved comparisons from dashboard
- User can reload saved comparison to see updated prices

**AF-003: Set Price Alert from Comparison**
- User viewing price comparison
- User clicks "Set Price Alert" for specific vendor
- System displays alert configuration modal
- User sets alert criteria (e.g., if price drops below $X, or decreases by Y%)
- System saves alert configuration
- User receives notifications when alert conditions met

**AF-004: Request Quote from Non-Listed Vendors**
- At step 13, user notices some preferred vendors missing from comparison
- User clicks "Request Additional Quotes"
- System displays vendor selection modal
- User selects vendors to request quotes from
- System initiates mini-RFQ or price request
- System sends request to selected vendors
- Vendors receive notification to submit pricing

---

#### Exception Flows

**EF-001: No Active Price Lists Found**
- At step 11, system finds no active price lists for product
- System displays message: "No active pricing found for this product."
- System offers options:
  - "View Historical Prices" (if price history exists)
  - "Request Quotes from Vendors"
  - "Search Similar Products"
- User selects option
- Flow adjusts based on selection

**EF-002: Single Vendor Only**
- At step 11, system finds only one vendor with active pricing
- System displays message: "Only one vendor has active pricing for this product."
- System shows single vendor details
- System disables comparison features
- System suggests: "Request quotes from additional vendors for better comparison"

**EF-003: Price Lists Expired**
- At step 11, system finds price lists but all are expired
- System displays warning: "All price lists for this product have expired. Showing most recent expired pricing."
- System displays comparison with expired pricing
- System clearly marks rows as "Expired - Do not use"
- System suggests: "Request updated pricing from vendors"

**EF-004: Currency Mismatch**
- At step 13, vendors have pricing in different currencies
- System detects multiple currencies
- System displays currency selector dropdown
- User selects preferred currency for comparison
- System converts all prices to selected currency using current exchange rates
- System displays conversion rate and date
- System shows warning: "Prices converted from multiple currencies. Rates as of {date}."

**EF-005: Insufficient Permissions**
- User searches for product
- User does not have permission to view certain vendors' pricing (restricted by location/department)
- System filters out restricted vendors
- System displays partial comparison
- System shows message: "Some vendors not displayed due to access restrictions."

**EF-006: Performance Issue with Large Data Set**
- System is comparing many vendors (>20)
- Loading takes longer than 5 seconds
- System displays loading progress: "Comparing prices from 23 vendors..."
- System displays results progressively as loaded
- System caches comparison results for faster reload

---

#### Postconditions

**Success**:
- User views comprehensive price comparison
- User has data to make informed vendor selection
- If vendor selected:
  - Vendor selection recorded
  - Audit log entry created
- If comparison exported:
  - Export file generated and downloaded
  - Export logged for reporting
- If PR created:
  - Purchase request initiated with selected vendor and pricing
- Comparison interaction logged for analytics

**Failure**:
- No comparison data displayed
- User informed of reason (no pricing, errors)
- User offered alternative actions
- Error logged for investigation

---

#### Business Rules Applied

- **BR-PL-004**: Only one active price list per vendor-product-location (system ensures unique comparison entries)
- **BR-PL-007**: Contract prices take precedence over standard price lists (contract pricing marked prominently)
- **BR-PL-018**: Location-specific pricing takes precedence over general pricing (reflected in comparison)

---

#### UI Requirements

**Price Comparison Page**:
- **Layout**: Full-width responsive layout
- **Product Header**: Large header with product info and image
- **Statistics Cards**: Visual cards showing key comparison metrics
- **Comparison Table**: Sortable, filterable table with clear column headers
- **Lowest Price Highlight**: Green background for lowest price row
- **Icons**: Visual icons for price tiers, details, history
- **Responsive**: Mobile-friendly with horizontal scrolling for table

**Comparison Summary Statistics**:
- **Visual Cards**: Large, colorful cards for each statistic
- **Iconography**: Icons for lowest, highest, average price
- **Color Coding**: Green (lowest), red (highest), blue (average)

**Vendor Comparison Table**:
- **Zebra Striping**: Alternate row colors for readability
- **Sortable Columns**: Click header to sort, arrow indicates sort direction
- **Expandable Rows**: Click to expand for more details or pricing tiers
- **Action Buttons**: Clear, distinct buttons for "View Details", "Select"
- **Inline Info Icons**: Tooltips for additional information

**Alternative Views**:
- **Card View**: Vendor cards in grid layout, large and visual
- **Chart View**: Bar or column chart showing price comparison visually

**Export Modal**:
- **Format Selection**: Radio buttons for Excel, CSV, PDF
- **Column Selection**: Checkboxes to select which columns to include
- **Preview**: Small preview of export data
- **Generate Button**: Large button to initiate export

---

### UC-PL-005: View Price History

**Primary Actor**: Procurement Staff, Purchasing Manager, Financial Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to understand price trends for negotiation
- Purchasing Manager: Needs historical data for strategic planning
- Financial Manager: Requires trend analysis for budgeting
- Vendors: May want transparency into their own pricing history

**Preconditions**:
- User is authenticated and has "View Price Lists" permission
- Price history exists for at least one product
- User has access to relevant price lists

**Trigger**: User clicks "View Price History" from product or vendor context

---

#### Main Flow

**Step 1: Navigate to Price History**
1. User accesses price history through one of several entry points:
   - From product detail page: clicks "Price History" button
   - From price comparison view: clicks price history icon for a vendor-product
   - From price list detail: clicks "View History" for specific item
   - From "Price Lists" dashboard: clicks "Price History" report option
2. System determines context (specific product, vendor, or general history)
3. System navigates to price history view

**Step 2: Display Price History Interface**
4. System displays price history page with:
   - Search and filter controls
   - Time period selector
   - Vendor selector (if not specific vendor context)
   - Product selector (if not specific product context)
   - Visualization options (chart, table, both)
5. If coming from specific product context:
   - Product information displayed at top
   - History pre-filtered for that product
6. If coming from specific vendor context:
   - Vendor information displayed at top
   - History pre-filtered for that vendor
7. Default view shows:
   - Last 12 months of data
   - All vendors (or specific vendor if context set)
   - All products (or specific product if context set)
   - Chart and table view combined

**Step 3: User Configures View**
8. User selects time period from preset options:
   - Last 3 months
   - Last 6 months
   - Last 12 months (default)
   - Last 24 months
   - Last 5 years (maximum)
   - Custom date range (date picker)
9. If custom date range:
   - User selects start date
   - User selects end date
   - System validates end date > start date
10. User optionally filters by:
    - Vendor (multi-select dropdown)
    - Product Category (dropdown)
    - Specific Products (multi-select search)
    - Location (multi-select)
    - Price Change Type (increases only, decreases only, all changes)
11. User clicks "Apply Filters"
12. System retrieves filtered price history data

**Step 4: Display Price History Chart**
13. System displays interactive price trend chart:
    - Line chart showing price over time
    - X-axis: Time (dates)
    - Y-axis: Price
    - Multiple lines if multiple vendors selected (different colors)
    - Data points for each price change
14. Chart features:
    - **Zoom**: User can zoom into time periods by dragging selection
    - **Hover Tooltips**: Hovering over data point shows:
      - Exact date
      - Price
      - Vendor name
      - Change from previous price (+/- $X, %)
      - Change reason (if provided)
    - **Legend**: Shows vendor names with color coding
    - **Toggle Vendors**: Click legend item to show/hide vendor line
15. System displays chart statistics:
    - Average price over period: $XX.XX
    - Highest price: $XX.XX on {date}
    - Lowest price: $XX.XX on {date}
    - Total price changes: X
    - Average change: +/- X%
    - Volatility score: Low/Medium/High (based on standard deviation)

**Step 5: Display Price History Table**
16. System displays price history table below chart
17. Table columns:
    - Date (effective date of price change)
    - Vendor Name
    - Product Name & SKU
    - Previous Price
    - New Price
    - Change Amount ($)
    - Change Percentage (%)
    - Change Reason
    - Change Type (Increase/Decrease icon)
    - Price List Number (link)
    - Updated By (user who made change)
18. System sorts table by Date (most recent first) by default
19. User can sort by any column
20. Table shows 50 rows per page with pagination
21. User can filter table independently from chart:
    - Filter by vendor
    - Filter by change type (increase/decrease)
    - Filter by minimum change percentage
    - Search by product name

**Step 6: Analyze Price Trends**
22. User can toggle between visualization types:
    - Line Chart (default, shows trend)
    - Bar Chart (shows discrete price changes)
    - Area Chart (shows price ranges)
23. System provides trend analysis section:
    - **Trend Direction**: Overall up/down/stable with arrow indicator
    - **Trend Strength**: Strong/Moderate/Weak
    - **Seasonality**: Detects seasonal patterns if sufficient data
    - **Forecast**: Simple forecast for next 3 months (optional)
24. System calculates and displays price statistics:
    - Mean price
    - Median price
    - Standard deviation
    - Coefficient of variation
25. System highlights significant events:
    - Largest price increase (date, amount, %)
    - Largest price decrease (date, amount, %)
    - Periods of price stability (no changes >90 days)
    - Periods of high volatility (frequent changes)

**Step 7: Compare Multiple Products or Vendors**
26. User can add additional products or vendors to comparison:
    - Click "Add to Comparison"
    - Select additional product or vendor
    - System adds new line to chart
    - System updates table with additional data
27. Multi-product/vendor comparison shows:
    - Multiple colored lines on same chart
    - Combined table with all data
    - Comparative statistics
28. User can view side-by-side comparison:
    - System displays separate mini-charts for each product/vendor
    - Allows visual comparison of different trends

**Step 8: Export or Save**
29. User can export price history:
    - Click "Export" button
    - Select format:
      - Excel (with chart embedded)
      - CSV (data only)
      - PDF (report format with charts)
      - PNG/JPG (chart image only)
    - Select date range and filters to include
    - System generates export file
    - System downloads file
30. User can save current view configuration:
    - Click "Save View"
    - Enter view name
    - System saves filters, date range, chart type
    - User can reload saved views from dashboard

---

#### Alternate Flows

**AF-001: Price History from Dashboard Widget**
- User on dashboard with "Price History" widget
- Widget shows mini price trend chart for selected products
- User clicks "View Full History" on widget
- System opens full price history view with pre-selected products
- Flow continues from step 13

**AF-002: Compare to Budget**
- At step 23, user clicks "Compare to Budget"
- System displays budget price line on chart (if budget data available)
- System shows variance from budget (+/- %) for each period
- System highlights periods where actual exceeded budget
- User can see cost impact of price changes

**AF-003: Vendor Performance Analysis**
- At step 23, user clicks "Vendor Performance"
- System displays additional vendor metrics:
  - Price stability score
  - Frequency of price changes
  - Average lead time changes
  - Delivery performance correlation with price changes
- System ranks vendors by price stability
- User can identify most reliable vendors

**AF-004: Forecast Future Prices**
- At step 23, user clicks "Generate Forecast"
- System displays forecasting options:
  - Simple linear forecast
  - Moving average forecast
  - Seasonal forecast (if applicable)
- User selects forecast type
- User selects forecast period (1, 3, 6 months)
- System calculates and displays forecast line on chart
- System shows confidence interval (range)
- System disclaims forecast as estimate only

---

#### Exception Flows

**EF-001: No Price History Available**
- At step 12, system finds no price history for selected criteria
- System displays message: "No price history found for selected criteria."
- System suggests:
  - Expanding date range
  - Removing some filters
  - Viewing active price lists instead
- User adjusts criteria or exits

**EF-002: Insufficient Data for Analysis**
- At step 23, system determines insufficient data for meaningful analysis
- Less than 3 data points for product
- System displays message: "Insufficient price history for trend analysis."
- System shows available data without advanced statistics
- System suggests waiting for more historical data to accumulate

**EF-003: Data Retrieval Timeout**
- At step 12, system times out retrieving large amount of historical data
- System displays error: "Request timed out. Please narrow your search criteria."
- System suggests:
  - Selecting shorter time period
  - Selecting fewer vendors/products
  - Filtering by specific criteria
- User adjusts and retries

**EF-004: Chart Rendering Failure**
- At step 13, chart fails to render (browser compatibility, data issue)
- System displays error message in chart area
- System still displays price history table below
- System offers alternative: "Download data for offline analysis"
- User can export data and view externally

**EF-005: Currency Conversion Issues**
- Historical prices include multiple currencies
- At step 13, system detects multi-currency data
- System displays warning: "Historical prices in multiple currencies. Select conversion option."
- User selects:
  - Show in original currencies (separate lines per currency)
  - Convert all to single currency (select currency)
- If conversion selected:
  - System converts using historical exchange rates for each date
  - System displays conversion info icon with rates table
- Chart displays based on user selection

---

#### Postconditions

**Success**:
- User views comprehensive price history
- User understands price trends and patterns
- User has data for decision-making or budgeting
- If exported:
  - Export file generated and downloaded
  - Export logged for audit
- If view saved:
  - View configuration saved for future use
- Interaction logged for analytics

**Failure**:
- No history displayed due to error
- User informed of issue
- User offered alternatives (retry, adjust filters)
- Error logged for investigation

---

#### Business Rules Applied

- **BR-PL-006**: Price history retained for 5 years (system enforces retention)
- Historical data is read-only (no modifications allowed)
- Price changes recorded with complete metadata (date, user, reason)

---

#### UI Requirements

**Price History Page**:
- **Layout**: Full-width layout with chart on top, table below
- **Filter Panel**: Collapsible left sidebar with all filter controls
- **Time Period Selector**: Prominent buttons for preset periods
- **Responsive**: Chart and table adapt to mobile screens

**Price Trend Chart**:
- **Interactive**: Hover tooltips, click to view details, zoom and pan
- **Legend**: Color-coded legend with toggle capability
- **Annotations**: Mark significant events on chart
- **Axis Labels**: Clear labels with currency formatting
- **Gridlines**: Light gridlines for readability

**Statistics Panel**:
- **Cards Layout**: Visual cards for key statistics
- **Icons**: Icons representing each statistic
- **Color Coding**: Green (favorable), red (unfavorable), blue (neutral)

**Price History Table**:
- **Sortable**: Click headers to sort
- **Filterable**: Filter controls above table
- **Pagination**: Page controls at bottom
- **Row Actions**: Click row to view detailed price list
- **Change Indicators**: Up/down arrows with color coding

**Export Options Modal**:
- **Format Selection**: Radio buttons for each format
- **Include Options**: Checkboxes for what to include
- **Preview**: Small preview of export layout
- **Generate Button**: Prominent button to create export

---

### UC-PL-006: Set Price Alerts

**Primary Actor**: Procurement Staff, Purchasing Manager, Department Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants automated notifications of significant price changes
- Purchasing Manager: Needs proactive awareness of pricing trends
- Department Managers: Want alerts for products relevant to their department
- Finance Team: Needs notification of price changes affecting budget

**Preconditions**:
- User is authenticated and has "Configure Alerts" permission
- Price lists exist in the system
- Notification service is operational

**Trigger**: User clicks "Set Price Alert" or "Configure Alerts"

---

#### Main Flow

**Step 1: Navigate to Alert Configuration**
1. User navigates to alert configuration through one of several paths:
   - From "Price Lists" dashboard: clicks "Price Alerts" button
   - From specific product: clicks "Set Alert for This Product"
   - From specific vendor: clicks "Set Alert for This Vendor"
   - From user settings: navigates to "My Alert Preferences"
2. System displays alert configuration interface

**Step 2: Create New Alert**
3. User clicks "Create New Alert" button
4. System displays alert creation form with sections:
   - Alert Type Selection
   - Scope Definition
   - Threshold Configuration
   - Notification Settings
5. User selects alert type from options:
   - **Price Increase Alert**: Triggered when price increases beyond threshold
   - **Price Decrease Alert**: Triggered when price decreases beyond threshold
   - **Any Price Change Alert**: Triggered on any price change
   - **Price List Expiration Alert**: Triggered before price list expires
   - **New Price List Alert**: Triggered when new price list added
6. System adjusts form fields based on selected alert type

**Step 3: Define Alert Scope**
7. User defines what the alert monitors:
   - **Scope Type** (radio buttons):
     - Specific Product (search and select product)
     - Product Category (select from dropdown)
     - Specific Vendor (search and select vendor)
     - Vendor + Product Combination
     - All Products in Department
     - Custom Product List (multi-select)
8. If "Specific Product" selected:
   - User searches for product
   - System displays autocomplete results
   - User selects product
   - System shows product details
9. If "Product Category" selected:
   - User selects category from hierarchical dropdown
   - System displays number of products in category
10. If "Specific Vendor" selected:
    - User searches for vendor
    - User selects vendor
    - System displays vendor details
11. If "Custom Product List" selected:
    - User adds multiple products to list
    - System shows selected products with remove option

**Step 4: Configure Threshold**
12. System displays threshold configuration based on alert type
13. For **Price Increase Alert**:
    - User enters threshold as:
      - Percentage (e.g., 10% increase)
      - OR Fixed amount (e.g., $5.00 increase)
      - OR Both (either condition triggers alert)
    - User can set severity levels:
      - Warning: X% increase (yellow alert)
      - Critical: Y% increase (red alert)
14. For **Price Decrease Alert**:
    - Similar to price increase configuration
    - User enters decrease threshold
    - User sets severity levels
15. For **Price List Expiration Alert**:
    - User selects notification period:
      - 30 days before expiration
      - 14 days before expiration
      - 7 days before expiration
      - Custom days (enter number)
    - User can select multiple notification periods
16. System validates threshold values are reasonable

**Step 5: Configure Notifications**
17. User selects notification methods (can select multiple):
    - **Email**: Send email notification (default)
    - **In-App**: Dashboard notification badge
    - **SMS**: Text message (if configured)
18. If email selected:
    - User enters/confirms email address
    - User can add additional recipients (CC list)
19. User configures notification frequency:
    - **Immediate**: Send notification as soon as triggered
    - **Daily Digest**: Compile all alerts and send once per day
    - **Weekly Summary**: Send weekly summary of all alerts
20. User can configure notification content:
    - Include price comparison (old vs. new)
    - Include affected products list (for category/vendor alerts)
    - Include link to price list
    - Include vendor contact information

**Step 6: Set Alert Metadata**
21. User provides alert information:
    - **Alert Name** (required, descriptive name for reference)
    - **Description** (optional, notes about why alert created)
    - **Priority** (Low, Medium, High)
    - **Active/Inactive** toggle (default: Active)
22. User can set advanced options:
    - **Effective Date Range**: Alert only active during specified dates
    - **Apply to Locations**: Specific locations only (multi-select)
    - **Apply to Departments**: Specific departments only (multi-select)

**Step 7: Review and Save Alert**
23. User clicks "Preview Alert"
24. System displays alert summary showing:
    - Alert type and name
    - Scope (what it monitors)
    - Threshold configuration
    - Notification settings
    - Example of alert notification
25. User reviews configuration
26. User clicks "Save Alert"
27. System validates alert configuration
28. System saves alert with unique ID
29. System activates alert monitoring
30. System displays success message: "Price alert created successfully"
31. System shows alert in user's alert list

---

#### Alternate Flows

**AF-001: Use Alert Template**
- At step 4, user clicks "Use Template"
- System displays common alert templates:
  - "Significant Price Increase (>10%)"
  - "Price Drop Opportunities"
  - "Expiring Price Lists"
  - "New Vendor Pricing"
- User selects template
- System pre-fills form with template configuration
- User modifies as needed
- Flow continues from step 7

**AF-002: Clone Existing Alert**
- User viewing existing alert
- User clicks "Clone" button
- System creates copy of alert configuration
- System opens alert form with copied settings
- User modifies scope or settings
- Flow continues from step 23

**AF-003: Quick Alert from Product**
- User viewing specific product
- User clicks "Quick Alert" button
- System displays simplified alert form
- System pre-fills product as scope
- User enters threshold (percentage only)
- User selects notification method
- User clicks "Create"
- System creates alert with default settings
- Flow completes without full configuration

**AF-004: Bulk Alert Creation**
- At step 11, user selects "Bulk Alert Creation"
- User uploads CSV file with product list
- System creates individual alert for each product
- System uses same threshold and notification settings
- System displays bulk creation summary
- Flow completes with multiple alerts created

---

#### Exception Flows

**EF-001: Duplicate Alert Detected**
- At step 27, system detects identical or very similar alert exists
- System displays warning: "Similar alert already exists for this scope"
- System shows existing alert details
- System offers options:
  - "Update Existing Alert"
  - "Create Anyway" (allows duplicate)
  - "Cancel"
- User selects option
- Flow adjusts based on selection

**EF-002: Invalid Threshold**
- At step 16, system validates threshold
- Threshold is unreasonable (e.g., >1000%, <0%)
- System displays error: "Invalid threshold value"
- System highlights field with error
- User corrects value
- Flow continues from step 16

**EF-003: No Products in Scope**
- At step 11, user selects category
- Category has no products with active price lists
- System displays warning: "Selected category has no products with active pricing"
- System suggests selecting different category
- User adjusts selection or cancels
- Flow continues from step 7 if adjusted

**EF-004: Email Service Unavailable**
- At step 27, system attempts to validate email notification
- Email service is down
- System displays warning: "Email service currently unavailable. Alert saved but email notifications may be delayed."
- System saves alert anyway
- Alert will send notifications when email service restored
- Flow continues to step 30

**EF-005: Alert Limit Reached**
- User attempts to create new alert
- User has reached maximum alert limit (e.g., 50 alerts per user)
- System displays error: "Maximum alert limit reached (50). Please delete unused alerts."
- System displays list of user's existing alerts
- User must delete alerts before creating new one
- Flow terminates

---

#### Postconditions

**Success**:
- Price alert created and activated
- Alert monitoring begins immediately
- Alert appears in user's alert list
- Alert logged in system audit log
- When alert triggers:
  - Notification sent via configured methods
  - Alert logged in alert history
  - Alert marked with last triggered date/time
- User can manage (edit, disable, delete) alert

**Failure**:
- No alert created
- User informed of reason
- User can retry or cancel
- Error logged for investigation

---

#### Business Rules Applied

- **BR-PL-007**: Price alerts configured per BR-PL-007 specifications
- Alerts trigger based on configured thresholds
- Users can have maximum 50 active alerts
- Alerts auto-disable after 12 months of inactivity

---

#### UI Requirements

**Alert Configuration Page**:
- **Wizard-style Layout**: Step-by-step configuration
- **Progress Indicator**: Show current step (1/4, 2/4, etc.)
- **Form Validation**: Real-time validation with clear error messages

**Alert Creation Form**:
- **Alert Type Selection**: Large, visual cards for each alert type
- **Scope Definition**: Search and select interfaces with autocomplete
- **Threshold Configuration**: Number inputs with +/- buttons
- **Notification Settings**: Checkboxes and toggles for preferences

**Alert List View**:
- **Table or Card Layout**: Show all user's alerts
- **Status Indicators**: Active/Inactive toggle
- **Last Triggered**: Show when alert last fired
- **Quick Actions**: Edit, Disable, Delete buttons

---

### UC-PL-007: Export Price Lists

**Primary Actor**: Procurement Staff, Purchasing Manager, Financial Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs data for offline analysis or sharing
- Purchasing Manager: Requires reports for management
- Financial Manager: Needs pricing data for budgeting
- External Auditors: May require price list exports for compliance

**Preconditions**:
- User is authenticated and has "View Price Lists" permission
- Price lists exist in the system
- User has access to relevant price lists

**Trigger**: User clicks "Export" button from price lists context

---

#### Main Flow

**Step 1: Initiate Export**
1. User accesses export function from one of several contexts:
   - From price lists dashboard: clicks "Export Price Lists"
   - From specific price list detail: clicks "Export This Price List"
   - From price comparison view: clicks "Export Comparison"
   - From price history view: clicks "Export History"
2. System displays export configuration modal

**Step 2: Configure Export**
3. System displays export configuration form with sections:
   - Export Scope
   - Export Format
   - Export Options
   - Scheduling (optional)
4. **Export Scope Section**:
   - If from specific price list: Scope pre-selected to that price list
   - If from dashboard: User selects scope:
     - Single Price List (search and select)
     - Multiple Price Lists (multi-select)
     - All Active Price Lists
     - Filtered Price Lists (apply filters first)
5. If "Filtered Price Lists" selected:
   - System displays filter controls:
     - Vendor (multi-select)
     - Date Range (effective dates)
     - Status (Active, Expired, Pending Approval)
     - Location (multi-select)
     - Product Category (multi-select)
   - User applies filters
   - System shows count: "X price lists match filters"
6. **Export Format Section**:
   - User selects export format (radio buttons):
     - **Excel (.xlsx)**: Formatted spreadsheet with multiple sheets
     - **CSV (.csv)**: Comma-separated values, single file
     - **PDF (.pdf)**: Formatted document for printing/archiving
     - **JSON (.json)**: Structured data for system integrations
7. System adjusts options based on selected format

**Step 3: Configure Export Options**
8. **Excel Format Options** (if Excel selected):
   - Multiple sheets option:
     - "One sheet per price list"
     - "All price lists in one sheet"
     - "Summary sheet + detail sheets"
   - Include charts and graphs
   - Apply Excel formatting (headers, borders, colors)
   - Include formulas (subtotals, averages)
9. **CSV Format Options** (if CSV selected):
   - Delimiter selection (comma, semicolon, tab)
   - Include headers row
   - Text qualifier (quotes or none)
   - Character encoding (UTF-8, Windows-1252)
10. **PDF Format Options** (if PDF selected):
    - Layout orientation (Portrait/Landscape)
    - Include cover page with summary
    - Include table of contents
    - Page size (A4, Letter, Legal)
    - Include watermark (Draft, Confidential, etc.)
11. **Data Selection Options** (for all formats):
    - User selects which data to include (checkboxes):
      - Basic Information (name, vendor, dates)
      - Product Pricing (all prices)
      - Pricing Tiers (volume discounts)
      - Commercial Terms (MOQ, lead time)
      - Terms & Conditions
      - Price Change History
      - Supporting Documents (as attachments or links)
    - User can select specific columns for product pricing table
12. **Additional Options**:
    - Include summary statistics
    - Include comparison data (if multi-price list export)
    - Include archived/expired price lists
    - Password protect export file (enter password)

**Step 4: Configure Scheduling (Optional)**
13. User can optionally schedule recurring export:
    - Toggle "Schedule This Export"
    - If enabled, configure schedule:
      - Frequency (Daily, Weekly, Monthly)
      - Day/Date selection
      - Time of day
      - Email recipients (who receives exported file)
      - Retention period (how long to keep exports)
14. If scheduled:
    - User provides schedule name
    - System validates schedule configuration

**Step 5: Generate and Download Export**
15. User reviews export configuration summary
16. User clicks "Generate Export" button
17. System displays progress indicator: "Generating export..."
18. System retrieves data based on scope and filters
19. System formats data according to selected format and options
20. For large exports (>1000 items):
    - System shows progress: "Processing X of Y price lists..."
    - Processing happens in background
21. Export generation completes
22. System displays success message with:
    - File size
    - Number of price lists included
    - Number of line items included
    - Estimated time to download
23. System provides "Download" button
24. User clicks "Download"
25. System initiates file download to user's computer
26. Download completes
27. System logs export in audit trail:
    - User who exported
    - Export scope and filters
    - Export format
    - Date and time
    - File size

**Step 6: Access Export Later (for Large Exports)**
28. For very large exports processed in background:
    - System sends notification when export ready
    - Export saved in "My Exports" section
    - User navigates to "My Exports"
    - System displays list of available exports with:
      - Export name
      - Generated date
      - File size
      - Expiration date (30 days retention)
      - Download button
    - User downloads export from list
29. System automatically deletes exports after 30 days

---

#### Alternate Flows

**AF-001: Quick Export**
- From price list detail view
- User clicks "Quick Export"
- System exports current price list immediately
- Uses default format (Excel)
- Includes all standard data
- No configuration modal
- Direct download
- Flow completes faster

**AF-002: Export to Email**
- At step 16, user clicks "Email Export" instead of "Generate"
- System displays email form
- User enters recipient email addresses
- User optionally adds message
- User clicks "Send"
- System generates export
- System sends email with export as attachment
- User receives confirmation
- Flow completes without download

**AF-003: Save Export Configuration**
- At step 15, user clicks "Save Configuration"
- System displays save dialog
- User enters configuration name
- System saves export settings
- User can reuse saved configuration later
- Next time: Select saved configuration instead of reconfiguring
- Flow continues from step 16

**AF-004: Export Comparison Data**
- User in price comparison view
- User clicks "Export Comparison"
- System pre-configures export to include:
  - All vendors in comparison
  - Product being compared
  - Comparison statistics
  - Chart (if Excel/PDF format)
- Flow continues from step 3 with pre-configuration

---

#### Exception Flows

**EF-001: Export Size Too Large**
- At step 18, system determines export will be extremely large (>100MB)
- System displays warning: "Export size will exceed 100MB. Consider narrowing scope or splitting into multiple exports."
- System offers options:
  - "Continue Anyway" (may take several minutes)
  - "Adjust Scope" (return to configuration)
  - "Split Export" (system suggests how to split)
- User selects option
- Flow adjusts based on selection

**EF-002: No Data to Export**
- At step 18, system finds no data matching export criteria
- System displays error: "No data found matching export criteria."
- System suggests:
  - Adjusting filters
  - Expanding date range
  - Selecting different scope
- User adjusts or cancels
- Flow returns to step 3 or terminates

**EF-003: Export Generation Failure**
- At step 19, export generation fails (system error, memory issue)
- System displays error: "Export generation failed. Please try again or contact support."
- System logs error details
- System offers options:
  - "Retry" (attempt export again)
  - "Reduce Scope" (try smaller export)
  - "Contact Support" (open support ticket)
- User selects option
- Flow adjusts or terminates

**EF-004: Download Interrupted**
- At step 26, download is interrupted (network issue, browser closed)
- Download fails partway through
- User can return to "My Exports" section
- Export file still available for re-download
- User clicks "Download" again
- Download restarts
- Flow continues from step 24

**EF-005: Scheduled Export Failure**
- Scheduled export runs automatically
- Export fails (data unavailable, system error)
- System logs failure
- System sends notification to user: "Scheduled export failed"
- System provides error details and suggested actions
- User can manually trigger export or adjust schedule
- System retries on next scheduled occurrence

---

#### Postconditions

**Success**:
- Export file generated successfully
- Export downloaded to user's computer OR emailed to recipients
- Export logged in audit trail with complete details
- If scheduled: Schedule configured and will run automatically
- Export file available in "My Exports" for 30 days
- User can access and re-download export

**Failure**:
- No export generated
- User informed of reason
- User offered retry or alternative options
- Error logged for investigation
- If scheduled: Schedule not created

---

#### Business Rules Applied

- **BR-PL-009**: Bulk export operations supported up to 10,000 line items per export
- **BR-PL-006**: Price history included in exports if selected (5 years retention)
- Export files retained for 30 days then automatically deleted
- Scheduled exports limited to one per user per format per day

---

#### UI Requirements

**Export Configuration Modal**:
- **Large Modal**: Overlay with backdrop
- **Tabbed Interface**: Tabs for Scope, Format, Options, Schedule
- **Progress Steps**: Visual steps for configuration process
- **Preview**: Show preview of export structure

**Export Format Selection**:
- **Visual Cards**: Large cards with icons for each format
- **Format Details**: Description of each format with pros/cons
- **Radio Selection**: Clear radio button for selection

**Options Configuration**:
- **Checkboxes**: Clear checkboxes for data inclusion options
- **Column Selector**: Visual column selector for custom exports
- **Toggle Switches**: For on/off options

**Download Interface**:
- **Progress Bar**: Show export generation progress
- **File Info**: Display file size and item count
- **Large Download Button**: Prominent button to download

**My Exports List**:
- **Table Layout**: List of past exports with details
- **Status Indicators**: Show if export is ready, processing, expired
- **Quick Actions**: Download, Delete, Re-generate buttons

---

### UC-PL-008: Approve Price Changes

**Primary Actor**: Procurement Manager, Financial Manager, Executive

**Stakeholders and Interests**:
- Procurement Manager: Responsible for approving standard price changes
- Financial Manager: Must approve significant price increases affecting budget
- Executive: Required for approval of major price changes
- Finance Team: Needs visibility into approval process
- Submitter: Wants timely approval of price list

**Preconditions**:
- User is authenticated and has appropriate approval authority
- Price list exists with status "Pending Approval"
- Price changes exceed approval threshold (>10% increase)
- User has been notified of pending approval

**Trigger**: User receives approval notification or checks approval queue

---

#### Main Flow

**Step 1: Navigate to Approval Queue**
1. User accesses approval queue through one of several paths:
   - Clicks notification: "You have X pending approvals"
   - Navigates to "Price Lists" > "Pending Approvals"
   - From dashboard widget: "My Approvals"
2. System displays approval queue with list of pending price lists
3. System shows for each pending approval:
   - Price List Number and Name
   - Vendor Name
   - Submitted By (user name)
   - Submitted Date
   - Days Pending
   - Priority (based on price change magnitude and business impact)
   - Quick Stats (number of items, total value, max price increase %)
4. System sorts by priority and date (urgent items first)
5. System highlights items requiring attention:
   - Red badge: >30% price increase or approaching approval deadline
   - Yellow badge: >20% price increase
   - Blue badge: Standard approval (<20% increase)

**Step 2: Review Price List Details**
6. User clicks on price list to review
7. System displays price list approval review page with sections:
   - Basic Information Summary
   - Price Change Analysis
   - Product Pricing Details
   - Justification and Comments
   - Approval Actions
8. **Basic Information Summary**:
   - Price List Number, Name, Vendor
   - Effective Date Range
   - Current Status and Submission Date
   - Submitter Information
   - Source (Manual, Template, RFQ, etc.)
9. **Price Change Analysis Section**:
   - Overall Statistics:
     - Total Products: X
     - Products with Increases: X (Y%)
     - Products with Decreases: X (Y%)
     - Average Price Change: +X%
     - Total Estimated Annual Impact: $X,XXX
   - Change Distribution Chart:
     - Bar chart showing distribution of price changes
     - Categories: >30% increase, 20-30%, 10-20%, <10%, decreases
   - Highest Impact Items:
     - Table showing top 10 items by price increase
     - Shows: Product, Old Price, New Price, Change %, Estimated Annual Impact

**Step 3: Review Product-Level Details**
10. System displays detailed product pricing table
11. Table shows all products in price list with columns:
    - Product Name & SKU
    - Previous Price (from previous price list or last known)
    - New Price (proposed)
    - Change Amount ($)
    - Change Percentage (%)
    - Annual Volume (from historical data, if available)
    - Estimated Annual Impact ($)
    - Justification (submitter's reason for change)
12. System color-codes rows:
    - Red: >30% increase
    - Orange: 20-30% increase
    - Yellow: 10-20% increase
    - Green: Decrease
    - White: Minimal change (<10%)
13. User can:
    - Sort by any column
    - Filter by change percentage
    - Search for specific products
    - Expand row to see full details (previous pricing tiers, terms, etc.)

**Step 4: Review Justifications**
14. System displays "Justification and Comments" section
15. Shows submitter's overall justification for price changes
16. Shows item-specific justifications for products with >10% increases
17. Shows supporting documentation:
    - Vendor price confirmation letters (if uploaded)
    - Contract amendments
    - Market analysis reports
    - Other supporting files
18. User can download and review supporting documents

**Step 5: Request Additional Information (Optional)**
19. If user needs more information before deciding:
    - User clicks "Request Clarification" button
    - System displays clarification request form
    - User enters questions or information needed
    - User can:
      - Request general clarification (to submitter)
      - Request vendor justification (to vendor via submitter)
      - Request financial impact analysis (to finance team)
      - Request alternative pricing options
    - User selects recipient(s)
    - User sets response deadline
    - User clicks "Send Request"
20. System changes price list status to "Clarification Requested"
21. System sends notification to requested parties
22. System awaits response
23. When response received:
    - System notifies approver
    - System changes status back to "Pending Approval"
    - Additional information appears in review page
    - Approver returns to review (step 6)

**Step 6: Compare with Alternatives (Optional)**
24. User can click "Compare Alternatives" button
25. System displays alternative pricing options:
    - Current pricing (if replacing existing price list)
    - Other vendors' pricing for same products (if available)
    - Historical pricing trends
    - Market pricing benchmarks (if available)
26. User can see side-by-side comparison
27. User returns to approval review

**Step 7: Make Approval Decision**
28. User reviews all information
29. User selects approval action (radio buttons):
    - **Approve**: Approve price list for activation
    - **Approve with Conditions**: Approve but with modifications or conditions
    - **Reject**: Reject price list, return to submitter for revision
    - **Defer**: Defer decision, requires more time or information
30. If "Approve" selected:
    - User enters approval comments (optional but recommended)
    - User confirms approval authority is within their limit
    - Flow continues to step 31
31. If "Approve with Conditions" selected:
    - User enters required conditions (required, min 50 characters):
      - Effective date adjustment
      - Specific items to remove/adjust
      - Additional documentation required
      - Other conditions
    - User enters approval comments
    - Flow continues to step 31
32. If "Reject" selected:
    - User must provide detailed rejection reasons (required, min 100 characters)
    - User selects rejection category:
      - Price increases not justified
      - Supporting documentation insufficient
      - Alternative vendors offer better pricing
      - Budget constraints
      - Vendor not approved
      - Other (specify)
    - User can suggest recommended actions for submitter
    - Flow continues to step 31
33. If "Defer" selected:
    - User provides reason for deferral
    - User sets review date (when will review again)
    - System schedules reminder for review date
    - Flow terminates (price list remains pending)

**Step 8: Review and Confirm Decision**
34. System displays decision confirmation modal
35. Modal shows:
    - Approval decision selected
    - Comments/conditions/reasons provided
    - Impact summary (what will happen)
    - Confirmation prompt
36. User reviews confirmation
37. User clicks "Confirm Decision"
38. System validates decision
39. System processes approval decision

**Step 9: System Processes Approval**
40. System updates price list status based on decision:
    - If Approved: Status changes to "Active"
    - If Approved with Conditions: Status changes to "Conditionally Approved"
    - If Rejected: Status changes to "Rejected"
41. System records approval in approval history:
    - Approver name and role
    - Decision (approved/rejected/conditional)
    - Decision date and time
    - Comments/reasons
    - Approval level
42. If Approved:
    - System activates price list
    - System marks previous price list for same vendor-products as "Superseded"
    - System updates vendor pricing in system
    - System sends notifications:
      - To submitter: "Price list approved and activated"
      - To vendor (if vendor portal): "Your price list is now active"
      - To finance team: "New pricing activated - budget impact: $X"
      - To relevant departments/locations
43. If Approved with Conditions:
    - System returns price list to submitter with conditions
    - System notifies submitter of conditions
    - Submitter must make adjustments and resubmit
    - Flow can restart from original submission
44. If Rejected:
    - System returns price list to "Draft" status
    - System notifies submitter with detailed rejection reasons
    - System provides guidance on resubmission
    - Submitter can revise and resubmit
45. System displays success message to approver: "Price list {decision} successfully"
46. System returns approver to approval queue
47. Approval queue updated (approved/rejected item removed)

---

#### Alternate Flows

**AF-001: Batch Approval**
- User in approval queue with multiple similar approvals
- User selects multiple price lists (checkboxes)
- User clicks "Batch Approve" button
- System displays batch approval modal showing all selected items
- User reviews batch summary
- User enters batch approval comments (applies to all)
- User confirms batch approval
- System processes all approvals simultaneously
- System notifies all submitters
- Flow completes with batch success message

**AF-002: Delegate Approval**
- User reviewing price list
- User realizes this should be approved by someone else (different authority level, subject matter expert)
- User clicks "Delegate Approval"
- System displays delegation form
- User selects delegate (search for user)
- User enters delegation reason
- System transfers approval to delegate
- System notifies delegate
- Approval remains in delegate's queue
- Flow terminates for original approver

**AF-003: Escalate for Higher Approval**
- User reviewing price list
- Price change exceeds user's approval authority
- User clicks "Escalate"
- System automatically determines next approval level
- User enters escalation notes
- System routes to higher-level approver (Financial Manager or Executive)
- System notifies higher-level approver
- Flow terminates for current approver

**AF-004: Partial Approval**
- User reviewing price list with multiple products
- User approves some items but not others
- User selects "Partial Approval" option
- User marks specific products as approved/rejected
- System splits price list:
  - Approved items: activated immediately
  - Rejected items: returned to submitter for revision
- System processes partial approval
- System notifies submitter of split decision
- Flow completes with partial activation

---

#### Exception Flows

**EF-001: Approval Authority Exceeded**
- At step 38, system checks approver's authority level
- Price list total value exceeds approver's authority
- System displays error: "This price list exceeds your approval authority. Total value: $X. Your limit: $Y."
- System automatically escalates to higher authority
- System notifies higher-level approver
- Original approver's review recorded as recommendation
- Flow terminates for original approver

**EF-002: Concurrent Approval**
- User reviewing price list
- Another approver (in multi-approver scenario) approves/rejects price list
- At step 37, system detects concurrent action
- System displays message: "This price list has been {approved/rejected} by {approver name}"
- System shows other approver's decision and comments
- Original approver's review no longer needed
- Flow terminates

**EF-003: Price List Modified During Review**
- User reviewing price list
- Submitter withdraws and modifies price list
- At step 37, system detects price list changed
- System displays error: "This price list has been modified. Please review updated version."
- System refreshes to show updated price list
- Flow returns to step 6 with updated data

**EF-004: Approval Timeout/Expiration**
- Price list pending approval for >5 business days
- Automatic escalation triggered (BR-PL-016)
- System sends escalation notification
- Price list moves to higher approval level
- Original approver receives notification of escalation
- Higher-level approver added to approval workflow
- Flow continues with escalated approver

**EF-005: Supporting Documents Unavailable**
- At step 17, user attempts to view supporting documents
- Documents not accessible (deleted, corrupted, access issue)
- System displays error: "Supporting documents unavailable"
- User can:
  - Request clarification (documents to be re-uploaded)
  - Proceed without documents (if not critical)
  - Defer approval pending document availability
- User selects action
- Flow adjusts based on selection

---

#### Postconditions

**Success - Approved**:
- Price list status changed to "Active"
- Price list activated and available for use
- Previous price list superseded
- Approval recorded in approval history
- Audit log updated
- All relevant parties notified
- Pricing available for procurement processes

**Success - Approved with Conditions**:
- Price list status: "Conditionally Approved"
- Conditions documented
- Submitter notified of conditions
- Price list returned for adjustments
- Approval workflow continues after adjustment

**Success - Rejected**:
- Price list status changed to "Rejected"
- Rejection reasons documented
- Submitter notified with detailed feedback
- Price list returned to "Draft" status
- Submitter can revise and resubmit
- Audit log updated

**Success - Deferred**:
- Price list remains "Pending Approval"
- Deferral reason recorded
- Review reminder scheduled
- Submitter may be notified of deferral

**Failure**:
- Price list status unchanged
- Error logged
- Approver notified of issue
- Can retry approval action

---

#### Business Rules Applied

- **BR-PL-003**: Price increases >10% require approval (enforced throughout)
- **BR-PL-015**: Approval routing based on price change magnitude (10-20% Procurement, 20-30% Finance, >30% Executive)
- **BR-PL-016**: Approval timeout escalation after 5 business days (automatic)
- **BR-PL-017**: Rejection requires detailed justification (enforced at step 32)

---

#### UI Requirements

**Approval Queue Page**:
- **Table Layout**: List of pending approvals
- **Priority Indicators**: Color-coded badges (red, yellow, blue)
- **Quick Stats**: Key metrics for each item
- **Sorting**: Click headers to sort
- **Filtering**: Filter by priority, days pending, value

**Approval Review Page**:
- **Section Layout**: Distinct sections for different information
- **Summary Cards**: Visual cards for key statistics
- **Price Change Chart**: Interactive chart showing distribution
- **Product Table**: Detailed, sortable table with color coding
- **Sticky Actions**: Action buttons stay visible while scrolling

**Price Change Analysis**:
- **Visual Charts**: Bar charts, pie charts for change distribution
- **Color Coding**: Red (high increase), yellow (moderate), green (decrease)
- **Impact Metrics**: Large, prominent metrics showing financial impact

**Decision Form**:
- **Radio Buttons**: Clear options for decision types
- **Conditional Fields**: Show/hide fields based on decision
- **Text Areas**: Large text areas for comments/reasons
- **Character Counters**: Show minimum character requirements

**Confirmation Modal**:
- **Large Modal**: Prominent confirmation dialog
- **Decision Summary**: Clear summary of decision and impact
- **Confirmation Button**: Prominent button to finalize

---

### UC-PL-009: Auto-Create from Template Submission

**Primary Actor**: System (automated), Procurement Staff (review)

**Stakeholders and Interests**:
- System: Automates price list creation from template submissions
- Procurement Staff: Wants streamlined process without manual data entry
- Vendors: Benefit from faster price list activation
- Finance Team: Needs accurate pricing captured from submissions

**Preconditions**:
- Pricelist template has been distributed to vendor
- Vendor has submitted completed template through vendor portal
- Template submission has been received and validated
- Product catalog contains all products referenced in submission

**Trigger**: Vendor submits pricelist template

---

#### Main Flow

**Step 1: Vendor Submits Template**
1. Vendor logs into vendor portal
2. Vendor navigates to "My Templates"
3. Vendor finds distributed template
4. Vendor fills out template with pricing
5. Vendor submits completed template
6. Vendor portal validates submission
7. Vendor portal sends submission to main system

**Step 2: System Receives Submission**
8. System receives template submission event
9. System retrieves submission data:
   - Template ID and version
   - Vendor ID
   - Submission date and time
   - Submitted pricing data (all line items)
   - Commercial terms
   - Supporting documents
10. System logs submission received

**Step 3: Validate Submission Data**
11. System validates submission data:
    - All required fields completed
    - All products exist in product catalog
    - All prices are positive numbers
    - Prices within expected ranges (if tolerance configured)
    - Vendor is still approved/preferred status
    - Template is still active/valid
12. If validation passes, proceed to step 13
13. If validation fails:
    - System logs validation errors
    - System notifies vendor of issues
    - System does not create price list
    - Vendor must correct and resubmit
    - Flow terminates

**Step 4: Map Submission to Price List**
14. System begins auto-creation process
15. System creates new price list record
16. System generates unique price list number: PL-YYYY-{VENDOR_CODE}-{SEQUENCE}
17. System maps template data to price list fields:
    - **Basic Information**:
      - Vendor: From submission vendor ID
      - Name: Auto-generated from template name + date
      - Description: From template description
      - Currency: From template configuration
      - Effective From: From template or submission date
      - Effective To: From template or calculated (1 year default)
    - **Source Information**:
      - Source Type: "template"
      - Source ID: Template ID
      - Source Reference: Template submission ID
    - **Targeting**:
      - Locations: From template targeting
      - Departments: From template targeting
18. System maps product data for each line item:
    - Product ID from template product reference
    - SKU from template
    - Pricing from vendor submission:
      - Base Price
      - Unit Price
      - Case Price (if provided)
      - Bulk Price (if provided)
    - Pricing Tiers from submission (if provided)
    - Commercial Terms:
      - MOQ from submission
      - Pack Size from template specification
      - Lead Time Days from submission
      - Shipping Cost (if provided)
19. System maps additional data:
    - Terms & Conditions from template
    - Supporting documents from submission
    - Metadata (last updated, submitted by)

**Step 5: Apply Business Rules**
20. System checks business rules:
    - BR-PL-001: Verify at least 1 line item (should always pass from template)
    - BR-PL-003: Check for price increases >10% from previous price list
    - BR-PL-004: Check for duplicate active price list
21. If price increases >10% detected:
    - System determines approval required
    - System sets price list status to "Pending Approval"
    - System routes to appropriate approver based on increase magnitude
    - Proceed to step 22
22. If no approval required:
    - System sets price list status to "Active"
    - Proceed to step 22
23. If duplicate active price list detected:
    - System flags potential conflict
    - System creates price list but requires manual review
    - System sets status to "Pending Review"
    - System notifies procurement staff

**Step 6: Finalize Price List Creation**
24. System saves price list to database
25. System creates price change history entries
26. System links price list to template submission
27. System updates vendor record with new price list reference
28. System records audit log entry

**Step 7: Send Notifications**
29. System sends notifications based on status:
    - **If Active**:
      - To vendor: "Your pricing has been activated"
      - To procurement staff: "New price list created from template"
      - To relevant departments/locations
    - **If Pending Approval**:
      - To approvers: "New price list requires approval"
      - To vendor: "Your pricing submitted for approval"
      - To procurement staff: "Price list pending approval"
    - **If Pending Review**:
      - To procurement staff: "Price list requires manual review - potential conflict"
30. Notification includes:
    - Price list number
    - Vendor name
    - Number of products
    - Status
    - Link to price list
    - Next action required (if any)

**Step 8: Handle Post-Creation Actions**
31. If status is "Active":
    - System marks previous price list as "Superseded" (if exists)
    - System makes pricing available for procurement
    - Price list appears in active price lists
    - Flow completes
32. If status is "Pending Approval":
    - Price list enters approval workflow (UC-PL-008)
    - Awaits approver action
    - Flow continues in approval workflow
33. If status is "Pending Review":
    - Price list awaits procurement staff review
    - Staff reviews and resolves conflict
    - Staff manually activates or rejects
    - Flow completes after manual action

---

#### Alternate Flows

**AF-001: Template with Pre-Approval**
- Template configured with "Auto-Approve" flag
- Vendor status is "Preferred" (highest trust level)
- Price changes within acceptable limits
- At step 21, system bypasses approval
- System activates price list immediately
- Flow continues from step 24 with "Active" status

**AF-002: Partial Submission**
- Vendor submits template with some items incomplete
- At step 11, system detects partial submission
- System creates price list with only completed items
- System notifies vendor of missing items
- System flags price list as "Incomplete"
- Vendor can submit missing items later
- Flow continues from step 14 with partial data

**AF-003: Price Decrease Submission**
- Vendor submits pricing with significant decreases (>15%)
- System detects favorable pricing changes
- System marks as "Expedited Review" (positive change)
- System sends special notification to procurement highlighting savings
- System may fast-track approval if configured
- Flow continues from step 21 with expedited handling

---

#### Exception Flows

**EF-001: Product Not Found**
- At step 11, system finds product SKU not in catalog
- System flags line item as "Product Not Found"
- System continues processing other items
- System creates price list with found products only
- System notifies procurement of missing products
- System provides list of unmatched SKUs
- Procurement staff must:
  - Add missing products to catalog
  - OR remove items from price list
  - OR map to correct products
- Flow continues with manual intervention

**EF-002: Vendor Status Changed**
- Vendor was approved when template distributed
- At step 11, vendor status has changed to "suspended" or "inactive"
- System detects status change
- System does not create price list
- System notifies procurement staff of status issue
- System notifies vendor of status problem
- System holds submission until vendor status resolved
- Flow terminates

**EF-003: Template Expired**
- Template was valid when distributed
- At step 11, template has expired (past submission deadline)
- System detects expired template
- System flags submission as "Late Submission"
- System creates price list but sets status to "Pending Review"
- Procurement staff must manually review and approve late submission
- Flow continues with manual review requirement

**EF-004: Price Validation Failed**
- At step 11, submitted prices fail validation:
  - Prices outside expected range (e.g., 200% higher than previous)
  - Prices in wrong currency
  - Negative prices or zero prices
- System rejects submission
- System logs validation errors with details
- System notifies vendor with specific errors
- System provides guidance on correcting errors
- Vendor must correct and resubmit
- Flow terminates

**EF-005: System Error During Creation**
- At step 24, system encounters error (database error, timeout)
- Price list creation fails partway through
- System rolls back partial changes
- System logs error details
- System sends alert to system administrators
- System notifies vendor submission is pending
- System retries creation automatically (up to 3 attempts)
- If retry succeeds, flow continues normally
- If retry fails, manual intervention required

---

#### Postconditions

**Success - Active**:
- Price list created and activated
- Vendor pricing available in system
- Previous price list superseded
- Vendor notified of activation
- Procurement staff notified
- Source traceability maintained (links to template)

**Success - Pending Approval**:
- Price list created, awaiting approval
- Approval workflow initiated
- Approvers notified
- Vendor notified of pending approval
- Pricing not yet active

**Success - Pending Review**:
- Price list created, requires manual review
- Procurement staff notified of review need
- Vendor notified submission received
- Review reason documented

**Failure**:
- No price list created
- Vendor notified of submission failure
- Vendor provided with error details and guidance
- Vendor can correct and resubmit

---

#### Business Rules Applied

- **BR-PL-012**: Template source traceability maintained (sourceType, sourceId, sourceReference)
- **BR-PL-001**: At least 1 product required (validated)
- **BR-PL-003**: Price increases >10% require approval (automatic routing)
- **BR-PL-008**: Prices must be positive (validated)

---

### UC-PL-010: Auto-Create from RFQ Award

**Primary Actor**: System (automated)

**Stakeholders and Interests**:
- System: Automates price list creation from RFQ awards
- Procurement Staff: Wants seamless transition from RFQ to pricing
- Vendors: Want awarded prices immediately available
- Finance Team: Needs contract pricing captured accurately

**Preconditions**:
- RFQ campaign has been completed
- RFQ has been awarded to vendor
- Awarded bid contains pricing for products
- Award has been approved (if approval required)

**Trigger**: RFQ award is finalized and approved

---

#### Main Flow

**Step 1: RFQ Award Finalized**
1. RFQ award workflow completes (UC-RFQ-005 from RFQ module)
2. Award status changes to "Awarded"
3. System generates award notification event
4. Price list auto-creation process triggered

**Step 2: Retrieve Award Data**
5. System retrieves RFQ award data:
   - RFQ ID and RFQ number
   - Awarded bid ID
   - Vendor ID
   - Award date
   - Contract ID (if contract generated)
   - All awarded line items with pricing
6. System retrieves bid data:
   - Bid number and date
   - All line item pricing from bid
   - Commercial terms from bid
   - Technical specifications
   - Pricing tiers (if any)
7. System retrieves RFQ data for context:
   - RFQ requirements
   - Original specifications
   - Evaluation criteria
   - Contract terms

**Step 3: Validate Award Data**
8. System validates award data suitable for price list creation:
   - Award is finalized (status: Awarded)
   - Vendor exists and is active
   - All products in award exist in product catalog
   - Pricing data is complete
   - Contract dates are valid (if contract exists)
9. If validation passes, proceed to step 10
10. If validation fails:
    - System logs validation errors
    - System alerts procurement staff
    - System does not create price list
    - Manual intervention required
    - Flow terminates

**Step 4: Create Price List from Award**
11. System begins auto-creation process
12. System creates new price list record
13. System generates unique price list number: PL-YYYY-{VENDOR_CODE}-{SEQUENCE}-RFQ
14. System populates price list basic information:
    - **Vendor**: From awarded vendor
    - **Name**: Auto-generated: "RFQ {RFQ_NUMBER} - Contract Pricing - {VENDOR_NAME}"
    - **Description**: "Contract pricing from RFQ {RFQ_NUMBER}, awarded on {DATE}"
    - **Currency**: From bid currency
    - **Status**: "Active" (pre-approved through RFQ award)
    - **Effective From**: Award date OR contract start date
    - **Effective To**: Contract end date (if contract) OR award date + 1 year
15. System sets source information:
    - **Source Type**: "rfq"
    - **Source ID**: RFQ ID
    - **Source Reference**: "RFQ-{RFQ_NUMBER} | Bid-{BID_NUMBER} | Award-{AWARD_ID}"
    - **Contract ID**: Link to contract (if generated)
16. System marks as contract pricing:
    - **Is Contract Pricing**: true
    - **Contract Reference**: Contract number (if applicable)
    - **Takes Precedence**: true (over standard price lists)

**Step 5: Map Awarded Line Items**
17. For each awarded line item from bid:
    - System retrieves product from product catalog
    - System creates price list line item:
      - Product ID
      - SKU
      - Description from bid
    - System maps pricing:
      - **Base Price**: From awarded bid unit price
      - **Unit Price**: From awarded bid unit price
      - **Case Price**: From bid if provided
      - **Bulk Price**: From bid if provided
      - **Currency**: From bid
      - **UOM**: From bid specification
    - System maps pricing tiers (if bid included volume discounts):
      - Min Quantity
      - Max Quantity
      - Tiered Price
      - Discount Percent
    - System maps commercial terms:
      - **MOQ**: From bid terms or RFQ requirement
      - **Pack Size**: From bid specification
      - **Lead Time Days**: From awarded bid delivery terms
      - **Shipping Cost**: From bid if specified
    - System adds metadata:
      - **Last Updated**: Award date
      - **Source**: "RFQ Award"
      - **Awarded Rank**: Bid ranking in evaluation (for reference)
18. System processes all line items

**Step 6: Map Terms & Conditions**
19. System maps terms from RFQ award:
    - **Payment Terms**: From awarded bid or contract
    - **Warranty**: From bid or RFQ requirements
    - **Return Policy**: From contract terms
    - **Special Conditions**: From contract or award notes
20. System attaches contract as supporting document (if generated)
21. System links to bid documents (technical spec, certifications)

**Step 7: Apply Business Rules**
22. System validates against business rules:
    - BR-PL-001: At least 1 line item (always true from RFQ)
    - BR-PL-004: Check for existing active contract price list
23. If duplicate contract price list exists:
    - System supersedes previous contract price list
    - System marks old price list as "Superseded by RFQ Award"
24. System ensures contract pricing precedence:
    - Marks price list with highest precedence flag
    - Contract pricing overrides standard price lists

**Step 8: Finalize and Activate**
25. System saves price list with status "Active" (no approval needed - pre-approved through RFQ)
26. System creates complete price change history:
    - Record each item's pricing
    - Note source as RFQ award
    - Link to previous pricing (if available)
27. System updates vendor record:
    - Add new contract price list reference
    - Update vendor performance metrics
28. System marks previous standard price lists for same products as "Superseded by Contract"
29. System records complete audit trail:
    - Price list created from RFQ award
    - User: System (automated)
    - Source: RFQ {number}
    - Date and time
    - All line items

**Step 9: Integration with Procurement**
30. System makes contract pricing available immediately:
    - Price list status: Active
    - Available for purchase request creation
    - Available for purchase order creation
    - Takes precedence over other pricing
31. System updates product records:
    - Link products to contract price list
    - Mark as "Contract Pricing Available"
    - Show contract price in product details
32. If contract exists:
    - System links price list to contract record
    - Contract management module can reference pricing
    - Contract compliance tracked against pricing

**Step 10: Send Notifications**
33. System sends notifications to stakeholders:
    - **To Vendor**:
      - Subject: "Contract Price List Activated - RFQ {number}"
      - Content: "Congratulations! Your pricing from RFQ {number} is now active. Contract pricing will be used for all purchase orders."
      - Include: Price list number, contract reference, effective dates, next actions
    - **To Procurement Staff**:
      - Subject: "New Contract Price List Created - RFQ {number}"
      - Content: "Contract pricing from RFQ {number} has been automatically activated."
      - Include: Vendor, products, price summary, link to price list
    - **To Finance Team**:
      - Subject: "Contract Pricing Activated - Budget Impact"
      - Content: "New contract pricing active. Estimated annual value: ${total}"
      - Include: Price comparison, budget impact, contract terms
    - **To Relevant Departments/Locations**:
      - Subject: "New Contract Pricing Available - {Vendor}"
      - Content: "Contract pricing now available for {products}"
      - Include: Key products, pricing highlights, ordering instructions
34. Notifications include direct links to:
    - Price list details
    - Contract document (if applicable)
    - RFQ award details
    - Vendor contact information

---

#### Alternate Flows

**AF-001: Partial Award to Multiple Vendors**
- RFQ awarded to multiple vendors (split award)
- System creates separate price list for each awarded vendor
- Each price list contains only that vendor's awarded items
- System links all price lists to same RFQ source
- Each vendor receives notification for their price list
- Flow repeats for each vendor in award

**AF-002: Award with Negotiated Pricing**
- RFQ award includes post-bid negotiated pricing
- Pricing differs from original bid submission
- System uses final negotiated pricing from award record
- System notes pricing source as "RFQ Award (Negotiated)"
- System includes negotiation history reference
- Flow continues from step 17 with negotiated prices

**AF-003: Framework Agreement Pricing**
- RFQ creates framework agreement (multi-year contract)
- Award includes pricing for multiple periods
- System creates price list with:
  - Initial period pricing (immediate activation)
  - Future period pricing (scheduled activation dates)
- System schedules automatic updates for future periods
- System sends reminders before price changes
- Flow continues with scheduled price activations

---

#### Exception Flows

**EF-001: Contract Generation Pending**
- RFQ awarded but contract not yet generated
- At step 6, contract ID is null
- System creates price list anyway but marks as "Contract Pending"
- System links to RFQ and bid only
- Once contract generated:
  - System updates price list with contract reference
  - System updates terms from contract
  - System sends updated notification
- Flow continues with temporary price list

**EF-002: Product Discontinued After Award**
- RFQ awarded for products
- At step 17, some products no longer in catalog (discontinued)
- System flags discontinued products
- System creates price list with available products only
- System alerts procurement staff of discontinued products
- Procurement staff must:
  - Confirm discontinuation
  - Negotiate substitute products
  - Update award and price list
- Flow continues with available products

**EF-003: Vendor Status Changed After Award**
- RFQ awarded to vendor
- At step 8, vendor status changed to suspended/inactive
- System detects status change
- System still creates price list (award is binding)
- System marks price list as "Vendor Status: Suspended"
- System alerts procurement staff immediately
- Price list created but flagged for review
- Flow continues with warning flags

**EF-004: Currency Mismatch**
- Bid submitted in one currency
- Contract specifies different currency
- At step 14, system detects currency conflict
- System prompts for currency selection:
  - Use bid currency
  - Use contract currency
  - Convert bid prices to contract currency
- Procurement staff resolves manually
- System applies selected currency
- Flow continues after resolution

**EF-005: Price List Creation Failure**
- At step 25, system error during save (database error)
- Price list creation fails
- System logs error
- System sends alert to administrators
- System retries creation automatically (up to 3 times)
- If retry succeeds: Flow continues normally
- If retry fails:
  - System notifies procurement staff
  - Manual price list creation required
  - Award record marked "Price List Pending"
  - Flow terminates with error status

---

#### Postconditions

**Success**:
- Contract price list created and activated
- Status: Active (no approval needed)
- Pricing available immediately for procurement
- Source traceability complete (links to RFQ, bid, award, contract)
- Previous standard price lists superseded
- Contract pricing takes precedence
- All stakeholders notified
- Audit trail complete
- Vendor can see active price list in portal
- Finance team aware of budget impact
- Procurement can create POs with contract pricing

**Partial Success**:
- Price list created with warnings
- Some products missing or flagged
- Manual review required
- Stakeholders notified of issues
- Price list functional but incomplete

**Failure**:
- No price list created
- Award record flagged "Price List Creation Failed"
- Procurement staff notified for manual intervention
- System administrators alerted
- Manual price list creation required

---

#### Business Rules Applied

- **BR-PL-013**: RFQ source traceability maintained (complete linkage)
- **BR-PL-007**: Contract prices take precedence over standard price lists (enforced by design)
- **BR-PL-014**: Source reference cannot be changed (system-controlled)
- Price list auto-activated without approval (pre-approved through RFQ award)
- Contract pricing overrides all other pricing

---

## Summary

This comprehensive Use Cases document details all 10 primary use cases for the Price Lists module:

1. **UC-PL-001: Create Price List** - Manual price list creation with 5-step wizard
2. **UC-PL-002: Import Vendor Prices** - Bulk import from Excel/CSV files
3. **UC-PL-003: Update Existing Prices** - Edit and update pricing with approval workflow
4. **UC-PL-004: Compare Prices Across Vendors** - Multi-vendor price comparison with charts
5. **UC-PL-005: View Price History** - Historical trend analysis and forecasting
6. **UC-PL-006: Set Price Alerts** - Configure automated price change notifications
7. **UC-PL-007: Export Price Lists** - Export to Excel/CSV/PDF with scheduling
8. **UC-PL-008: Approve Price Changes** - Multi-level approval workflow for price changes
9. **UC-PL-009: Auto-Create from Template Submission** - Automated price list generation from vendor template submissions
10. **UC-PL-010: Auto-Create from RFQ Award** - Automated contract pricing from RFQ awards

Each use case includes:
- **Complete flows**: Preconditions, main flow (step-by-step), alternate flows, exception flows, postconditions
- **Business rules**: All applicable business rules from BR document
- **UI requirements**: Detailed interface specifications
- **Stakeholder interests**: Clear identification of all actors and their needs
- **Integration points**: How each use case connects with other modules

The document provides production-ready specifications for development, covering normal operations, edge cases, error handling, and user experience requirements. All use cases follow established patterns from previous modules (Vendor Directory, Pricelist Templates, Requests for Pricing) ensuring consistency across the vendor management documentation.

**Total Document Size**: ~2100 lines (estimated 95+ pages)

The Price Lists module UC document is now complete and ready for technical specification development.
