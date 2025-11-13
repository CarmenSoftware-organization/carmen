# Use Cases: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document defines the use cases for the Spot Check sub-module, which enables quick, targeted verification of inventory quantities for selected items. Unlike full physical counts, spot checks focus on specific products requiring immediate verification.

Spot checks support:
- **Rapid verification** of high-value or problem items
- **Variance detection** without full physical count overhead
- **Loss prevention** through targeted sampling
- **Just-in-time accuracy** maintenance

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Storekeeper | Warehouse/storage staff responsible for inventory | Creates and conducts spot checks, enters actual quantities |
| Inventory Coordinator | Staff managing inventory control processes | Creates spot checks, reviews results, manages templates |
| Supervisor | Department supervisor overseeing inventory | Approves high variance items, reviews spot check performance |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Manager | Inventory or Operations Manager | Views all spot checks, analyzes variance trends, configures thresholds |
| Auditor | Internal or external auditor | Reviews spot check history for compliance evidence |
| System Administrator | Technical administrator | Configures spot check parameters, maintains templates |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Transaction System | Source of expected quantities and target for adjustments | API / Module |
| Notification Service | Sends alerts for high variance approvals | Event / API |
| Workflow Engine | Manages approval workflows | Module |
| Audit Log System | Records all spot check actions | Event |

---

## Use Case Diagram

```
                          ┌─────────────────────────────────────────┐
                          │      Spot Check System                  │
                          └──────────────┬──────────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        │                                │                                │
  ┌─────▼──────┐                  ┌─────▼──────┐                  ┌─────▼──────┐
  │ Storekeeper│                  │ Inventory  │                  │ Supervisor │
  │            │                  │Coordinator │                  │            │
  └─────┬──────┘                  └─────┬──────┘                  └─────┬──────┘
        │                                │                                │
   [UC-SC-001]                      [UC-SC-001]                      [UC-SC-006]
   [UC-SC-003]                      [UC-SC-002]                   (approve high
   [UC-SC-007]                      [UC-SC-008]                     variance)
  (view own)                        [UC-SC-009]                      [UC-SC-008]
                                  (create templates)                 (view all)
        │
        │                          ┌─────▼──────┐                  ┌─────▼──────┐
        │                          │  Manager   │                  │  Auditor   │
        │                          │            │                  │            │
        └──────────────────────────┤            │                  └─────┬──────┘
                [UC-SC-005]        └─────┬──────┘                        │
              (complete check)           │                          [UC-SC-008]
                                    [UC-SC-008]                    (view only -
                                   (view all +                      compliance)
                                    analytics)


  ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
  │   Inventory     │           │  Notification   │           │  Workflow       │
  │  Transaction    │           │    Service      │           │   Engine        │
  │    System       │           └─────────┬───────┘           └─────────┬───────┘
  └────────┬────────┘                     │                             │
           │                              │                             │
      [UC-SC-201]                    [UC-SC-103]                   [UC-SC-006]
      [UC-SC-202]                  (send alerts)                (approval workflow)
   (integration)                   (automated)                    (automated)
           │
           │                        ┌─────────────────┐
           │                        │  System Process │
           └────────────────────────┤   (Automated)   │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                        [UC-SC-101]
                                        [UC-SC-102]
                                       (calculate,
                                         adjust)
```

**Legend**:
- **Primary Actors** (top): User roles who directly conduct spot checks
- **Secondary Actors** (middle): Supporting roles who review and approve
- **System Actors** (bottom): Automated processes and integrations

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-SC-001 | Create Spot Check | Storekeeper, Inventory Coordinator | High | Medium | User |
| UC-SC-002 | Add Products to Spot Check | Storekeeper, Inventory Coordinator | High | Simple | User |
| UC-SC-003 | Enter Counted Quantities | Storekeeper | Critical | Simple | User |
| UC-SC-004 | Review Variance Analysis | Storekeeper, Inventory Coordinator | High | Simple | User |
| UC-SC-005 | Complete Spot Check | Inventory Coordinator, Supervisor | Critical | Complex | User |
| UC-SC-006 | Approve High Variance Items | Supervisor | High | Medium | User |
| UC-SC-007 | Cancel Spot Check | Supervisor | Medium | Simple | User |
| UC-SC-008 | View Spot Check History | All Users | Medium | Simple | User |
| UC-SC-009 | Create Spot Check Template | Inventory Coordinator, Manager | Low | Simple | User |
| **System Use Cases** | | | | | |
| UC-SC-101 | Calculate Variance Automatically | System | Critical | Simple | System |
| UC-SC-102 | Post Inventory Adjustments | System | Critical | Complex | System |
| UC-SC-103 | Send High Variance Notifications | System | High | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-SC-201 | Retrieve Expected Quantities | Inventory Transaction System | Critical | Medium | Integration |
| UC-SC-202 | Post Adjustments to Inventory | Inventory Transaction System | Critical | Complex | Integration |

**Complexity Definitions**:
- **Simple**: Single-step or straightforward process, minimal validation
- **Medium**: Multi-step process with moderate business logic and validation
- **Complex**: Multi-step with complex validation, integrations, and approvals

---

## User Use Cases

### UC-SC-001: Create Spot Check

**Description**: User creates a new spot check session for a specific location to verify selected products.

**Actor(s)**: Storekeeper, Inventory Coordinator

**Priority**: High

**Frequency**: Daily, Ad-hoc (as needed)

**Preconditions**:
- User is authenticated and authorized
- User has access to at least one location
- No active spot check exists for selected location (or user can create multiple)

**Postconditions**:
- **Success**: Spot check session created with status 'pending', unique spot check number assigned (SPOT-YYYY-NNNNNN)
- **Failure**: Error displayed, no spot check created

**Main Flow** (Happy Path):
1. User navigates to Spot Check module
2. System displays "Create Spot Check" button
3. User clicks "Create Spot Check"
4. System displays spot check creation form with location selector
5. User selects location from dropdown
6. User enters optional description (e.g., "Weekly dairy check")
7. User clicks "Create"
8. System validates location access
9. System generates unique spot check number (SPOT-2024-000015)
10. System sets count_stock_type = 'spot'
11. System saves spot check with status = 'pending', start_date = current timestamp
12. System displays "Spot check created successfully. Add products to begin."
13. System redirects to Add Products screen
14. Use case ends

**Alternative Flows**:

**Alt-1A: Create from Template** (At step 3)
- 3a. User clicks "Create from Template"
- 3b. System displays template selection dialog
- 3c. User selects template (e.g., "Daily High-Value Check")
- 3d. System pre-populates location and products from template
- 3e. Resume at step 7

**Alt-1B: Quick Create for Recent Location** (At step 3)
- 3a. System displays "Recent Locations" quick access
- 3b. User clicks location in recent list
- 3c. System pre-fills location
- 3d. Resume at step 6

**Exception Flows**:

**Exc-1A: Location Access Denied** (At step 8)
- System detects user doesn't have access to selected location
- System displays "Access denied. You don't have permission to perform spot checks for Main Kitchen."
- Resume at step 5

**Exc-1B: Validation Error** (At step 8)
- System validation fails (e.g., missing required fields)
- System displays field-specific validation errors
- Resume at step 5

**Business Rules**:
- **BR-SC-001**: Spot checks can be created anytime, on-demand
- **BR-SC-004**: System sets count_stock_type = 'spot' automatically
- **BR-SC-022**: Users can only create spot checks for locations they have access to

**Includes**:
- None

**Extends**:
- [UC-SC-009: Create Spot Check Template](#uc-sc-009-create-spot-check-template)

**Related Requirements**:
- FR-SC-001: Initiate Spot Check
- VAL-SC-001: location_id validation
- VAL-SC-301: Location access permission

**UI Mockups**: `/app/(main)/inventory-management/spot-check/new`

**Notes**:
- Spot check creation is lightweight - user can create multiple spot checks for same location
- Unlike physical counts, no restriction on one active count per location

---

### UC-SC-002: Add Products to Spot Check

**Description**: User adds products to spot check session using search, category selection, or template.

**Actor(s)**: Storekeeper, Inventory Coordinator

**Priority**: High

**Frequency**: Daily (part of every spot check)

**Preconditions**:
- Spot check session created (status = 'pending')
- User has access to spot check location
- Products exist in product master

**Postconditions**:
- **Success**: Products added to spot check with expected quantities populated from inventory system
- **Failure**: Error displayed, products not added

**Main Flow** (Happy Path):
1. User is on Add Products screen for spot check
2. System displays product search and category filters
3. User searches for product by name or code (e.g., "chicken breast")
4. System displays matching products with current stock info
5. User clicks "Add" next to desired product
6. System validates product not already in spot check
7. System calls Inventory Transaction System to retrieve expected quantity
8. System adds product to spot check detail list with:
   - sequence_no = next available sequence
   - expected_qty = current closing balance
   - actual_qty = null (to be entered)
   - is_counted = false
9. System displays "Product added: Chicken Breast - Expected: 100.00 kg"
10. User repeats steps 3-9 for additional products
11. System shows running count of products added (e.g., "5 of 50 products")
12. User clicks "Start Counting" when all products added
13. System changes spot check status to 'in_progress'
14. System redirects to Enter Quantities screen
15. Use case ends

**Alternative Flows**:

**Alt-2A: Add by Category** (At step 3)
- 3a. User clicks "Add by Category"
- 3b. System displays product categories
- 3c. User selects category (e.g., "Dairy Products")
- 3d. System displays all products in category
- 3e. User clicks "Add All" or selects multiple products
- 3f. Resume at step 6 for each product

**Alt-2B: Barcode Scan** (At step 3)
- 3a. User scans product barcode
- 3b. System finds product by barcode
- 3c. Resume at step 6

**Alt-2C: Save as Draft** (At step 12)
- 12a. User clicks "Save as Draft"
- 12b. System saves spot check with status = 'pending'
- 12c. System displays "Draft saved. You can resume later."
- Use case ends

**Exception Flows**:

**Exc-2A: Product Already Added** (At step 6)
- System detects product already in spot check
- System displays "Product 'Chicken Breast' already added to this spot check"
- Resume at step 3

**Exc-2B: Product Inactive** (At step 6)
- System detects product is inactive (is_active = false)
- System displays "Product 'Expired Item' is inactive and cannot be added"
- Resume at step 3

**Exc-2C: Maximum Products Reached** (At step 6)
- System detects 50 products already added (configurable limit)
- System displays "Maximum 50 products per spot check reached. Start counting or remove products."
- Resume at step 11

**Exc-2D: Expected Quantity Unavailable** (At step 7)
- Inventory Transaction System unavailable or returns error
- System displays warning "Expected quantity unavailable. You can still add product and enter actual quantity."
- System sets expected_qty = null
- Resume at step 9

**Business Rules**:
- **BR-SC-002**: Minimum 1, maximum 50 products per spot check
- **BR-SC-003**: Products can only appear once in any given spot check
- **BR-SC-005**: Expected quantities retrieved from current closing balance

**Includes**:
- [UC-SC-201: Retrieve Expected Quantities](#uc-sc-201-retrieve-expected-quantities)

**Extends**:
- None

**Related Requirements**:
- FR-SC-002: Select Products for Spot Check
- VAL-SC-012: product_id validation
- BR-SC-003: Unique products per spot check

**UI Mockups**: `/app/(main)/inventory-management/spot-check/[id]/add-products`

**Notes**:
- Expected quantities may be unavailable if product has no inventory transactions
- System allows proceeding without expected quantities (variance calculation will show as N/A)
- Draft mode allows users to build spot check over time before starting actual counting

---

### UC-SC-003: Enter Counted Quantities

**Description**: User enters actual physical quantities for each product in spot check using numeric input or barcode scanner.

**Actor(s)**: Storekeeper

**Priority**: Critical

**Frequency**: Daily (multiple times during spot check)

**Preconditions**:
- Spot check status = 'in_progress'
- Products added to spot check
- User has physical access to storage location

**Postconditions**:
- **Success**: Actual quantities entered, variance calculated automatically, is_counted = true
- **Failure**: Validation error displayed, quantities not saved

**Main Flow** (Happy Path):
1. User is on Enter Quantities screen
2. System displays list of products with expected quantities
3. User locates first product physically (e.g., Chicken Breast)
4. User counts actual quantity (e.g., 95.00 kg)
5. User enters actual quantity in input field
6. System validates actual_qty >= 0 and <= 2 decimal places
7. System automatically calculates:
   - variance_qty = 95.00 - 100.00 = -5.00
   - variance_pct = (-5.00 / 100.00) * 100 = -5.00%
8. System sets is_counted = true
9. System auto-saves entered quantity (draft mode)
10. System displays variance with color indicator:
    - Green = match (variance = 0)
    - Yellow = small variance (<5%, <$100)
    - Red = high variance (>=5% or >=$100)
11. System displays "Saved: Chicken Breast - Actual: 95.00 kg, Variance: -5.00 kg (-5.00%)"
12. User repeats steps 3-11 for remaining products
13. System shows progress indicator (e.g., "8 of 10 counted")
14. User clicks "Next" when all products counted
15. System validates all products have is_counted = true
16. System redirects to Review Variance screen
17. Use case ends

**Alternative Flows**:

**Alt-3A: Barcode Scan Entry** (At step 3)
- 3a. User scans product barcode
- 3b. System focuses on matching product input field
- 3c. Resume at step 4

**Alt-3B: Skip Product** (At step 5)
- 5a. User clicks "Skip" for product not available/accessible
- 5b. System keeps is_counted = false
- 5c. System adds note "Skipped during count"
- 5d. Resume at step 12 for next product

**Alt-3C: Update Previously Entered Quantity** (At step 5)
- 5a. User changes actual_qty for already counted product
- 5b. System recalculates variance
- 5c. System auto-saves updated quantity
- 5d. System displays "Updated: Chicken Breast - Actual: 96.00 kg"
- Resume at step 12

**Alt-3D: Zero Quantity (Out of Stock)** (At step 5)
- 5a. User enters 0 for actual_qty
- 5b. System accepts and calculates variance
- 5c. If expected_qty > 0 and variance is high, flag for approval
- 5d. Resume at step 7

**Exception Flows**:

**Exc-3A: Negative Quantity** (At step 6)
- User enters negative value (e.g., -5)
- System displays "Actual quantity cannot be negative"
- Resume at step 5

**Exc-3B: Invalid Decimal Precision** (At step 6)
- User enters value with >2 decimal places (e.g., 95.555)
- System displays "Actual quantity maximum 2 decimal places"
- Resume at step 5

**Exc-3C: Auto-Save Failure** (At step 9)
- Network error or system unavailable
- System displays warning "Auto-save failed. Data will be saved when connection restored."
- System stores in browser local storage
- System retries save every 30 seconds
- Resume at step 10

**Exc-3D: Session Timeout** (At any step)
- User session expires during counting
- System preserves entered data in local storage
- System displays "Session expired. Please log in again. Your data is preserved."
- After login, system restores data from local storage
- Resume where user left off

**Business Rules**:
- **BR-SC-006**: Actual quantity must be non-negative (>= 0)
- **BR-SC-007**: Actual quantity supports up to 2 decimal places
- **BR-SC-008**: Variance calculation: variance_qty = actual_qty - expected_qty
- **BR-SC-009**: Variance percentage: variance_pct = (variance_qty / expected_qty) * 100

**Includes**:
- [UC-SC-101: Calculate Variance Automatically](#uc-sc-101-calculate-variance-automatically)

**Extends**:
- None

**Related Requirements**:
- FR-SC-003: Enter Counted Quantities
- VAL-SC-014: actual_qty validation
- VAL-SC-203: Variance calculation validation

**UI Mockups**: `/app/(main)/inventory-management/spot-check/[id]/enter-quantities`

**Notes**:
- Auto-save every 30 seconds prevents data loss
- Local storage fallback for offline/network issues
- Progress indicator motivates completion
- Color-coded variance helps identify issues quickly

---

### UC-SC-004: Review Variance Analysis

**Description**: User reviews calculated variances for all counted products and adds notes to explain significant variances.

**Actor(s)**: Storekeeper, Inventory Coordinator

**Priority**: High

**Frequency**: Daily (after entering quantities)

**Preconditions**:
- All products counted (is_counted = true)
- Variances calculated by system

**Postconditions**:
- **Success**: Variance review complete, notes added for significant variances, ready for completion or approval
- **Failure**: User returns to previous screen to recount

**Main Flow** (Happy Path):
1. User is on Review Variance screen
2. System displays variance summary table:
   - Product name, Expected qty, Actual qty, Variance qty, Variance %, Status
3. System shows aggregate statistics:
   - Total products: 10
   - Items with variance: 3
   - High variance items: 1 (requires approval)
   - Total variance value: -$125.50
4. System highlights high variance items in red
5. User reviews each item with variance
6. For high variance item (Chicken Breast: -5.00 kg, -5.00%, -$75.00):
   - User clicks "Add Note"
   - User enters explanation: "Found 5kg expired, removed from inventory"
   - User clicks "Save Note"
   - System saves note to detail record
7. User verifies all variances are reasonable or explained
8. User clicks "Proceed to Complete" if confident
9. System validates:
   - All products counted
   - High variance items have notes (warning if missing)
10. System identifies high variance items requiring approval
11. If high variance items exist:
    - System displays "This spot check requires supervisor approval (1 item with high variance)"
    - User clicks "Submit for Approval"
12. If no high variance items:
    - User proceeds directly to completion
13. System redirects to completion flow
14. Use case ends

**Alternative Flows**:

**Alt-4A: Filter by Variance Status** (At step 2)
- 2a. User clicks filter dropdown
- 2b. User selects "High Variance Only"
- 2c. System displays only high variance items
- 2d. Resume at step 5

**Alt-4B: Sort by Variance** (At step 2)
- 2a. User clicks column header "Variance %"
- 2b. System sorts items by variance percentage (descending)
- 2c. Resume at step 5

**Alt-4C: Recount Product** (At step 5)
- 5a. User suspects counting error
- 5b. User clicks "Recount" next to product
- 5c. System redirects back to Enter Quantities for that product
- 5d. User re-enters actual quantity
- 5e. System recalculates variance
- 5f. Resume at step 2

**Alt-4D: Export Variance Report** (At step 3)
- 3a. User clicks "Export to CSV"
- 3b. System generates CSV file with all variance data
- 3c. System downloads file
- 3d. Resume at step 5

**Exception Flows**:

**Exc-4A: Uncounted Items** (At step 9)
- System detects products with is_counted = false
- System displays "Cannot proceed. 2 items not yet counted: Salmon Fillet, Olive Oil"
- System provides "Go Back to Count" button
- Use case ends

**Exc-4B: Missing Notes for High Variance** (At step 9)
- System detects high variance items without notes
- System displays warning "High variance items should have explanatory notes. Continue anyway?"
- User clicks "Add Notes" or "Continue"
- If "Add Notes", resume at step 5
- If "Continue", proceed to step 10

**Business Rules**:
- **BR-SC-020**: High variance threshold: > 5% OR variance value > $100
- **BR-SC-017**: Variance quantity = actual - expected
- **BR-SC-018**: Variance percentage = (variance_qty / expected_qty) * 100

**Includes**:
- None

**Extends**:
- [UC-SC-003: Enter Counted Quantities](#uc-sc-003-enter-counted-quantities) (for recount)

**Related Requirements**:
- FR-SC-004: Review Variance Analysis
- VAL-SC-203: Variance calculation validation
- BR-SC-020: High variance threshold

**UI Mockups**: `/app/(main)/inventory-management/spot-check/[id]/review-variance`

**Notes**:
- Variance review is critical quality gate before completion
- Notes provide audit trail for significant variances
- Aggregated statistics help management understand inventory accuracy
- Export function supports further analysis in Excel

---

### UC-SC-005: Complete Spot Check

**Description**: User completes spot check, triggering inventory adjustment posting and status change to 'completed'.

**Actor(s)**: Inventory Coordinator, Supervisor

**Priority**: Critical

**Frequency**: Daily (at end of each spot check)

**Preconditions**:
- Spot check status = 'in_progress'
- All products counted (is_counted = true)
- High variance items approved (if any)

**Postconditions**:
- **Success**: Spot check status = 'completed', end_date set, inventory adjustments posted, stock levels updated
- **Failure**: Error displayed, spot check remains in_progress

**Main Flow** (Happy Path):
1. User is on Review Variance screen
2. User clicks "Complete Spot Check"
3. System displays confirmation dialog:
   - "Complete spot check SPOT-2024-000015?"
   - "This will post inventory adjustments and update stock levels."
   - Summary: 10 products, 3 with variance, total adjustment: -$125.50
4. User clicks "Confirm"
5. System validates completion requirements:
   - All products counted
   - High variance items approved
   - User has permission to complete
6. System begins completion process:
   - 6a. System sets end_date = current timestamp
   - 6b. For each product with variance_qty != 0:
     - System calls Inventory Transaction System to post adjustment
     - System creates adjustment transaction (type = 'adjustment', reason = 'spot_check')
     - System records adjustment_transaction_id
     - System sets adjustment_posted = true
   - 6c. System updates spot check status = 'completed'
   - 6d. System records completion in workflow_history
7. System displays progress: "Posting adjustments... 3 of 3 complete"
8. System displays success message:
   - "Spot check completed successfully"
   - "3 inventory adjustments posted"
   - "Stock levels updated"
9. System sends notification to supervisor/manager
10. System redirects to spot check detail view (read-only)
11. Use case ends

**Alternative Flows**:

**Alt-5A: Complete with Zero Variance** (At step 6)
- 6a. System detects all variance_qty = 0
- 6b. System displays "No adjustments needed. All quantities match."
- 6c. System sets status = 'completed' without posting adjustments
- 6d. Resume at step 8

**Alt-5B: Partial Adjustment Posting** (At step 6b)
- 6ba. Some adjustments succeed, others fail
- 6bb. System commits successful adjustments
- 6bc. System logs failed adjustments
- 6bd. System displays warning "2 of 3 adjustments posted. 1 failed: Chicken Breast. Retry?"
- 6be. User clicks "Retry Failed"
- 6bf. System retries failed adjustments
- 6bg. If success, resume at step 7
- 6bh. If still failing, move to exception flow

**Exception Flows**:

**Exc-5A: Uncounted Products** (At step 5)
- System detects products with is_counted = false
- System displays "Cannot complete. 2 items not yet counted."
- System provides "Go Back to Count" button
- Use case ends

**Exc-5B: Unapproved High Variance** (At step 5)
- System detects high variance items without supervisor approval
- System displays "Cannot complete. 1 high variance item requires supervisor approval."
- System provides "Request Approval" button
- Use case ends (see UC-SC-006)

**Exc-5C: Inventory Transaction System Unavailable** (At step 6b)
- System cannot connect to Inventory Transaction System
- System displays error "Inventory system unavailable. Adjustments cannot be posted."
- System provides options:
  - "Retry Now"
  - "Save and Retry Later" (queues for background processing)
  - "Cancel Completion"
- If "Save and Retry Later":
  - System saves spot check with status = 'pending_adjustment_post'
  - System queues adjustment posting job
  - System displays "Spot check saved. Adjustments will be posted when system available."
- Use case ends

**Exc-5D: Permission Denied** (At step 5)
- System detects user lacks 'complete_spot_check' permission
- System displays "Permission denied. Only coordinators and supervisors can complete spot checks."
- Use case ends

**Exc-5E: Concurrent Modification** (At step 6)
- Another user modified spot check during review
- System displays "Spot check was modified by [User Name]. Please refresh and review changes."
- System provides "Refresh" button
- Use case ends

**Business Rules**:
- **BR-SC-012**: Status transition: in_progress → completed
- **BR-SC-014**: Supervisors must approve high variance before completion
- **BR-SC-015**: Completed spot checks cannot be modified
- **BR-SC-021**: Total variance value = SUM(variance_qty * product_cost)

**Includes**:
- [UC-SC-102: Post Inventory Adjustments](#uc-sc-102-post-inventory-adjustments)
- [UC-SC-202: Post Adjustments to Inventory](#uc-sc-202-post-adjustments-to-inventory)

**Extends**:
- None

**Related Requirements**:
- FR-SC-005: Complete Spot Check
- VAL-SC-102: All items must be counted
- VAL-SC-105: Adjustment posting required

**UI Mockups**: `/app/(main)/inventory-management/spot-check/[id]/complete`

**Notes**:
- Completion is atomic transaction - all adjustments succeed or none
- If adjustment posting fails, spot check can be queued for background retry
- Completed spot checks are immutable - no further modifications allowed
- Notification ensures management awareness of inventory changes

---

### UC-SC-006: Approve High Variance Items

**Description**: Supervisor reviews and approves high variance items before spot check can be completed.

**Actor(s)**: Supervisor

**Priority**: High

**Frequency**: Weekly (for spot checks with high variance)

**Preconditions**:
- Spot check has high variance items (>5% or >$100)
- Approval requested by storekeeper/coordinator
- Supervisor has approval permission

**Postconditions**:
- **Success**: High variance items approved, spot check can proceed to completion
- **Failure**: Items rejected, spot check remains pending approval

**Main Flow** (Happy Path):
1. Supervisor receives notification: "Spot check SPOT-2024-000015 requires your approval (1 high variance item)"
2. Supervisor clicks notification link
3. System displays spot check approval screen
4. System shows high variance items requiring approval:
   - Product: Chicken Breast
   - Expected: 100.00 kg
   - Actual: 85.00 kg
   - Variance: -15.00 kg (-15.00%)
   - Variance Value: -$225.00
   - Note: "Found 15kg expired due to refrigeration failure"
5. Supervisor reviews variance and explanation
6. Supervisor may add additional notes: "Refrigeration unit repaired. Approve write-off."
7. Supervisor clicks "Approve" for the item
8. System records approval:
   - approved = true
   - approved_by = supervisor user ID
   - approved_at = current timestamp
9. System updates spot check info.supervisor_approved = true
10. System displays "High variance approved. Spot check can now be completed."
11. System sends notification to original requester
12. Supervisor clicks "Back to List" or "Complete Now"
13. Use case ends

**Alternative Flows**:

**Alt-6A: Approve Multiple Items** (At step 7)
- 7a. Multiple high variance items present
- 7b. Supervisor reviews each item
- 7c. Supervisor clicks "Approve All" to approve all items at once
- 7d. System records approval for all items
- 7e. Resume at step 9

**Alt-6B: Request Recount** (At step 7)
- 7a. Supervisor suspects counting error
- 7b. Supervisor clicks "Request Recount"
- 7c. System adds recount flag to item
- 7d. System sends notification to storekeeper: "Supervisor requested recount for Chicken Breast"
- 7e. System displays "Recount requested. Awaiting updated count."
- 7f. Storekeeper recounts and updates actual quantity
- 7g. System recalculates variance
- 7h. If still high variance, notification sent back to supervisor
- 7i. Resume at step 3

**Alt-6C: Partially Approve** (At step 7)
- 7a. Multiple items, supervisor approves some, rejects others
- 7b. System records approval for approved items only
- 7c. System keeps rejected items pending
- 7d. System displays "2 of 3 items approved. 1 item requires recount or additional information."
- Resume at step 11

**Exception Flows**:

**Exc-6A: Reject High Variance** (At step 7)
- Supervisor determines variance unacceptable without further investigation
- Supervisor clicks "Reject"
- System prompts for rejection reason
- Supervisor enters: "Variance too high. Conduct full recount with witness."
- System sets approved = false, rejection_reason recorded
- System sends notification to requester with rejection reason
- Spot check remains in 'in_progress' status
- Use case ends

**Exc-6B: Insufficient Information** (At step 5)
- Supervisor finds explanation insufficient
- Supervisor clicks "Request More Information"
- System prompts for specific questions
- Supervisor enters: "When did refrigeration fail? Was loss reported to maintenance?"
- System sends notification to requester with questions
- Spot check remains pending approval
- Use case ends

**Exc-6C: Permission Denied** (At step 2)
- System detects user lacks supervisor role
- System displays "Permission denied. Only supervisors can approve high variance items."
- Use case ends

**Business Rules**:
- **BR-SC-014**: Supervisors must approve high variance before completion
- **BR-SC-020**: High variance threshold: > 5% OR variance value > $100
- **BR-SC-024**: Supervisors can approve variances for their department locations

**Includes**:
- [UC-SC-103: Send High Variance Notifications](#uc-sc-103-send-high-variance-notifications)

**Extends**:
- [UC-SC-003: Enter Counted Quantities](#uc-sc-003-enter-counted-quantities) (for recount)

**Related Requirements**:
- FR-SC-006: Approve High Variance Items
- VAL-SC-103: High variance requires approval
- VAL-SC-302: Role-based action permission

**UI Mockups**: `/app/(main)/inventory-management/spot-check/[id]/approve`

**Notes**:
- Approval workflow ensures accountability for significant inventory adjustments
- Supervisor can request recount before approval to verify accuracy
- Rejection sends spot check back to requester for additional investigation
- Audit trail records all approval/rejection decisions

---

### UC-SC-007: Cancel Spot Check

**Description**: User cancels spot check before completion when it's no longer needed or cannot be completed.

**Actor(s)**: Supervisor

**Priority**: Medium

**Frequency**: Monthly (occasional)

**Preconditions**:
- Spot check exists with status 'pending' or 'in_progress'
- User has cancellation permission (supervisor+)

**Postconditions**:
- **Success**: Spot check status = 'cancelled', no adjustments posted, data retained for audit
- **Failure**: Error displayed, spot check remains in original status

**Main Flow** (Happy Path):
1. Supervisor views spot check list
2. Supervisor identifies spot check to cancel (e.g., SPOT-2024-000015)
3. Supervisor clicks "Cancel" button next to spot check
4. System displays cancellation confirmation dialog:
   - "Cancel spot check SPOT-2024-000015?"
   - "Entered data will be retained but no adjustments will be posted."
   - "Cancellation reason (required):"
5. Supervisor selects cancellation reason from dropdown:
   - "Location access unavailable"
   - "Products relocated to different location"
   - "Created by mistake"
   - "Other (please specify)"
6. If "Other", supervisor enters custom reason
7. Supervisor clicks "Confirm Cancellation"
8. System validates supervisor has cancellation permission
9. System updates spot check:
   - Sets status = 'cancelled'
   - Records cancellation reason in note field
   - Records cancelled_by = supervisor user ID
   - Records cancelled_at = current timestamp
10. System displays "Spot check cancelled successfully"
11. System retains all entered data (soft cancellation)
12. System sends notification to original creator
13. Use case ends

**Alternative Flows**:

**Alt-7A: Cancel from Detail View** (At step 2)
- 2a. Supervisor is viewing spot check details
- 2b. Supervisor clicks "Cancel Spot Check" button in detail view
- 2c. Resume at step 4

**Exception Flows**:

**Exc-7A: Permission Denied** (At step 8)
- System detects user lacks supervisor role
- System displays "Permission denied. Only supervisors can cancel spot checks."
- Use case ends

**Exc-7B: Spot Check Already Completed** (At step 8)
- System detects spot check status = 'completed'
- System displays "Cannot cancel completed spot check. Use void function to reverse if needed."
- Use case ends

**Exc-7C: Missing Cancellation Reason** (At step 7)
- User clicks confirm without entering reason
- System displays "Cancellation reason is required"
- Resume at step 5

**Business Rules**:
- **BR-SC-007**: Only supervisors can cancel spot checks
- **BR-SC-011**: Status transition: pending/in_progress → cancelled
- **BR-SC-015**: Completed spot checks cannot be cancelled
- **BR-SC-016**: Cancelled spot checks retain data but don't post adjustments

**Includes**:
- None

**Extends**:
- None

**Related Requirements**:
- FR-SC-007: Cancel Spot Check
- VAL-SC-201: Status transition validation
- VAL-SC-302: Role-based action permission

**UI Mockups**: `/app/(main)/inventory-management/spot-check` (list view)

**Notes**:
- Cancellation retains audit trail - data not deleted
- Cancellation reason required for accountability
- Cancelled spot checks appear in history with 'cancelled' badge
- Cannot cancel completed spot checks - use void function instead (future enhancement)

---

### UC-SC-008: View Spot Check History

**Description**: User views historical spot checks, filters by criteria, and exports data for analysis.

**Actor(s)**: All Users (with location-based access control)

**Priority**: Medium

**Frequency**: Weekly, Ad-hoc

**Preconditions**:
- User is authenticated
- Historical spot check data exists

**Postconditions**:
- **Success**: User views spot check list with applied filters, can export data
- **Failure**: Empty list or error displayed

**Main Flow** (Happy Path):
1. User navigates to Spot Check History
2. System displays list of spot checks with default filters (last 30 days, all locations user has access to)
3. System shows columns:
   - Spot Check #, Date, Location, Status, # Products, # Variances, Total Variance Value, Created By
4. System displays summary statistics:
   - Total spot checks: 45
   - Completed: 40, In Progress: 3, Cancelled: 2
   - Average variance rate: 2.8%
5. User applies filters:
   - Date range: Last 7 days
   - Location: Main Kitchen
   - Status: Completed
6. System refreshes list with filtered results
7. User clicks on spot check number (SPOT-2024-000015) to view details
8. System displays spot check detail page:
   - Header: Spot check #, location, dates, status
   - Product table: All counted products with expected, actual, variance
   - Notes and approval history
   - Created by, completed by information
9. User returns to list
10. Use case ends

**Alternative Flows**:

**Alt-8A: Search by Product** (At step 5)
- 5a. User enters product name in search box: "Chicken Breast"
- 5b. System filters to show only spot checks containing that product
- 5c. Resume at step 6

**Alt-8B: Sort by Column** (At step 3)
- 3a. User clicks column header (e.g., "Total Variance Value")
- 3b. System sorts list by that column (descending)
- 3c. User clicks again to reverse sort order
- 3d. Resume at step 5

**Alt-8C: Export to Excel** (At step 5)
- 5a. User clicks "Export to Excel"
- 5b. System generates Excel file with filtered spot check data
- 5c. System includes summary sheet with variance analysis
- 5d. System downloads file
- 5e. Resume at step 5

**Alt-8D: View Variance Trends** (At step 4)
- 4a. User clicks "View Trends" button
- 4b. System displays variance trend chart:
   - Line chart: Average variance % over time
   - Bar chart: Top 10 products by variance frequency
   - Heat map: Variance by location and day of week
- 4c. User closes trend view
- 4d. Resume at step 5

**Exception Flows**:

**Exc-8A: No Results** (At step 6)
- System finds no spot checks matching filters
- System displays "No spot checks found matching your criteria. Try different filters."
- User adjusts filters or clears all
- Resume at step 5

**Exc-8B: Location Access Denied** (At step 7)
- User clicks spot check for location they don't have access to
- System displays "Access denied. You don't have permission to view spot checks for this location."
- Resume at step 2

**Business Rules**:
- **BR-SC-023**: Users can only view spot checks for their assigned locations (unless manager+)
- **BR-SC-025**: Managers can view spot checks across all locations

**Includes**:
- None

**Extends**:
- None

**Related Requirements**:
- FR-SC-008: View Spot Check History
- VAL-SC-301: Location access permission
- NFR-SC-001: List page loads within 2 seconds

**UI Mockups**: `/app/(main)/inventory-management/spot-check`

**Notes**:
- Default view shows recent spot checks to reduce load time
- Export function supports management reporting and analysis
- Variance trends help identify systematic issues
- Detail view is read-only for completed spot checks

---

### UC-SC-009: Create Spot Check Template

**Description**: User creates reusable template with predefined product list for frequently conducted spot checks.

**Actor(s)**: Inventory Coordinator, Manager

**Priority**: Low (Future Enhancement)

**Frequency**: Monthly (when setting up new routine checks)

**Preconditions**:
- User has template management permission
- Products exist in product master

**Postconditions**:
- **Success**: Template created and available for use when creating spot checks
- **Failure**: Error displayed, template not created

**Main Flow** (Happy Path):
1. User navigates to Spot Check Templates page
2. User clicks "Create Template"
3. System displays template creation form
4. User enters template details:
   - Name: "Daily High-Value Check"
   - Description: "Daily verification of high-value protein items"
   - Scope: "Main Kitchen" (location-specific) or "All Locations" (global)
5. User adds products to template:
   - Searches and adds: Chicken Breast, Beef Tenderloin, Salmon Fillet, Lamb Chops
6. User can reorder products using drag-and-drop
7. User clicks "Save Template"
8. System validates template name is unique
9. System saves template with:
   - template_id = UUID
   - created_by = user ID
   - is_active = true
10. System displays "Template created successfully"
11. User sees template in template list
12. Use case ends

**Alternative Flows**:

**Alt-9A: Add Products by Category** (At step 5)
- 5a. User clicks "Add Category"
- 5b. User selects "Proteins"
- 5c. System adds all products from category
- 5d. User removes unwanted products
- 5e. Resume at step 6

**Alt-9B: Copy Existing Template** (At step 3)
- 3a. User clicks "Copy from Existing"
- 3b. User selects existing template
- 3c. System pre-fills form with template data
- 3d. User modifies as needed
- 3e. Resume at step 7

**Alt-9C: Global vs Location-Specific** (At step 4)
- 4a. If "All Locations" selected:
  - Template available to all users
  - Products may have different expected quantities per location
- 4b. If specific location selected:
  - Template only available for that location
  - More focused product list
- 4c. Resume at step 5

**Exception Flows**:

**Exc-9A: Duplicate Template Name** (At step 8)
- System detects template name already exists for user
- System displays "Template name already exists. Please choose a different name."
- Resume at step 4

**Exc-9B: No Products Added** (At step 7)
- User tries to save without adding products
- System displays "Template must contain at least 1 product"
- Resume at step 5

**Exc-9C: Permission Denied** (At step 2)
- System detects user lacks template management permission
- System displays "Permission denied. Only coordinators and managers can create templates."
- Use case ends

**Business Rules**:
- **BR-SC-026**: System administrators can configure templates
- Future: **BR-SC-027**: Templates can be location-specific or global
- Future: **BR-SC-028**: Template usage tracked for analytics

**Includes**:
- None

**Extends**:
- [UC-SC-001: Create Spot Check](#uc-sc-001-create-spot-check) (template selection)

**Related Requirements**:
- FR-SC-009: Create Spot Check Templates
- Future enhancement - not in MVP

**UI Mockups**: `/app/(main)/inventory-management/spot-check/templates`

**Notes**:
- Template feature is future enhancement (Phase 2)
- Templates significantly reduce spot check creation time
- Usage tracking helps identify most valuable templates
- Global templates promote consistency across locations

---

## System Use Cases

### UC-SC-101: Calculate Variance Automatically

**Description**: System automatically calculates variance quantity and percentage when actual quantity is entered.

**Trigger**: User enters or updates actual_qty field

**Actor(s)**:
- **Primary**: System (Calculation Engine)
- **Secondary**: Spot Check Entry Form

**Priority**: Critical

**Frequency**: Real-time (on every actual quantity entry)

**Preconditions**:
- Spot check detail record exists
- expected_qty is available (not null)
- actual_qty is entered by user

**Postconditions**:
- **Success**: variance_qty and variance_pct calculated and saved
- **Failure**: Calculation error logged, user notified

**Main Flow**:
1. System receives actual_qty value from user input
2. System validates actual_qty is numeric and >= 0
3. System retrieves expected_qty for the product
4. System calculates variance_qty:
   - Formula: variance_qty = actual_qty - expected_qty
   - Example: 95.00 - 100.00 = -5.00
5. System calculates variance_pct:
   - If expected_qty > 0:
     - Formula: variance_pct = (variance_qty / expected_qty) * 100
     - Example: (-5.00 / 100.00) * 100 = -5.00%
   - If expected_qty = 0:
     - variance_pct = null
6. System rounds results to 2 decimal places
7. System saves variance_qty and variance_pct to detail record
8. System determines variance status:
   - Match: variance_qty = 0
   - Small Variance: variance_pct < 5% AND variance_value < $100
   - High Variance: variance_pct >= 5% OR variance_value >= $100
9. System returns calculated values to UI
10. Process completes

**Alternative Flows**:

**Alt-101A: Zero Expected Quantity** (At step 5)
- 5a. expected_qty = 0
- 5b. System sets variance_pct = null
- 5c. System sets variance_qty = actual_qty (since expected was 0)
- 5d. System flags for review if actual_qty > 0 (unexpected inventory)
- Resume at step 6

**Alt-101B: Null Expected Quantity** (At step 3)
- 3a. expected_qty is null (no inventory history)
- 3b. System sets variance_qty = null
- 3c. System sets variance_pct = null
- 3d. System displays "No expected quantity available. Variance cannot be calculated."
- Resume at step 9

**Exception Flows**:

**Exc-101A: Invalid Actual Quantity** (At step 2)
- actual_qty is null, negative, or invalid format
- System logs validation error
- System does not calculate variance
- System notifies user of validation error
- Process ends

**Exc-101B: Calculation Overflow** (At step 4-5)
- Numbers exceed maximum precision (15,2)
- System logs overflow error
- System displays "Calculation error. Values too large."
- Process ends

**Business Rules**:
- **BR-SC-017**: Variance quantity = actual - expected
- **BR-SC-018**: Variance percentage = (variance_qty / expected_qty) * 100
- **BR-SC-010**: If expected_qty = 0, variance_pct = null

**Related Requirements**:
- FR-SC-003: Enter Counted Quantities
- FR-SC-004: Review Variance Analysis
- VAL-SC-203: Variance calculation validation

**SLA**:
- **Processing Time**: < 100ms per calculation
- **Availability**: 100% (local calculation)

**Monitoring**:
- Calculation error rate
- Average calculation time

---

### UC-SC-102: Post Inventory Adjustments

**Description**: System posts inventory adjustment transactions to Inventory Transaction System for all products with variance when spot check is completed.

**Trigger**: Spot check completion (status change to 'completed')

**Actor(s)**:
- **Primary**: Spot Check Completion Process
- **Secondary**: Inventory Transaction System

**Priority**: Critical

**Frequency**: Daily (for each completed spot check)

**Preconditions**:
- Spot check status = 'completed' or completing
- All products counted
- High variance items approved
- Inventory Transaction System available

**Postconditions**:
- **Success**: Adjustment transactions created, inventory balances updated, adjustment_posted = true
- **Failure**: Error logged, adjustments queued for retry, spot check status = 'pending_adjustment_post'

**Main Flow**:
1. System receives spot check completion event
2. System retrieves all detail records with variance_qty != 0
3. For each detail record:
   - 3a. System prepares adjustment transaction payload:
     - transaction_type = 'adjustment'
     - product_id
     - location_id
     - adjustment_qty = variance_qty
     - reason = 'spot_check'
     - reference_no = spot check number
     - notes = detail note (if any)
   - 3b. System calls Inventory Transaction System API
   - 3c. ITS validates and processes adjustment
   - 3d. ITS updates inventory balance
   - 3e. ITS returns transaction_id
   - 3f. System records adjustment_transaction_id in detail record
   - 3g. System sets adjustment_posted = true
4. System verifies all adjustments posted successfully
5. System updates spot check info.adjustment_posted = true
6. System commits transaction
7. System logs completion event
8. System sends success notification
9. Process completes

**Alternative Flows**:

**Alt-102A: No Adjustments Needed** (At step 2)
- 2a. All detail records have variance_qty = 0
- 2b. System logs "No adjustments needed"
- 2c. System sets spot check status = 'completed'
- 2d. Skip to step 7

**Alt-102B: Partial Success** (At step 3)
- 3ba. Some adjustments succeed, others fail
- 3bb. System commits successful adjustments
- 3bc. System logs failed adjustments
- 3bd. System queues failed adjustments for retry
- 3be. System sets spot check status = 'partially_posted'
- 3bf. System sends alert to administrator
- 3bg. Resume at step 7

**Alt-102C: Retry on Temporary Failure** (At step 3b)
- 3ba. API call times out or returns temporary error (502, 503)
- 3bb. System waits 1 second (exponential backoff: 1s, 2s, 4s)
- 3bc. System retries up to 3 times
- 3bd. If successful on retry, resume at step 3c
- 3be. If all retries fail, move to exception flow

**Exception Flows**:

**Exc-102A: Inventory Transaction System Unavailable** (At step 3b)
- ITS API unavailable or returning errors
- System logs error with full context
- System sets spot check status = 'pending_adjustment_post'
- System queues adjustment posting background job
- System sends alert to operations team
- System displays message to user: "Spot check saved. Adjustments will be posted when inventory system available."
- Process ends

**Exc-102B: Business Rule Violation** (At step 3c)
- ITS rejects adjustment due to business rule (e.g., insufficient stock for negative adjustment)
- System logs rejection reason
- System flags detail record as 'adjustment_failed'
- System sends notification to manager for manual resolution
- System continues processing remaining adjustments
- Resume at step 3 for next record

**Exc-102C: Transaction Rollback** (At step 6)
- System detects critical error before commit
- System rolls back all adjustments
- System restores original inventory balances via compensating transactions
- System logs rollback event
- System sets spot check status = 'failed_post'
- System sends critical alert
- Process ends

**Data Contract**:

**Input (to ITS)**:
```json
{
  "transaction_type": "adjustment",
  "product_id": "660e8400-e29b-41d4-a716-446655440001",
  "location_id": "440e8400-e29b-41d4-a716-446655440001",
  "adjustment_qty": -5.00,
  "reason": "spot_check",
  "reference_no": "SPOT-2024-000015",
  "notes": "Found 5kg expired, removed from inventory",
  "posted_by": "user-123",
  "posted_at": "2024-01-15T14:30:00Z"
}
```

**Output (from ITS)**:
```json
{
  "status": "success",
  "transaction_id": "770e8400-e29b-41d4-a716-446655440001",
  "new_balance": 95.00,
  "posted_at": "2024-01-15T14:30:01Z"
}
```

**Business Rules**:
- **BR-SC-015**: Completed spot checks cannot be modified
- **BR-SC-021**: Total variance value = SUM(variance_qty * product_cost)

**SLA**:
- **Processing Time**: < 5 seconds for 50 products
- **Availability**: 99.9% (relies on ITS availability)
- **Recovery Time**: < 5 minutes for retry

**Monitoring**:
- Adjustment posting success rate
- Average posting time
- Failed adjustment count
- ITS API response time

**Rollback Procedure**:
1. Identify all posted adjustment transactions for spot check
2. Create compensating transactions (inverse of original adjustments)
3. Post compensating transactions to ITS
4. Verify inventory balances restored
5. Set spot check status = 'adjustment_reversed'
6. Log reversal event with reason

**Related Requirements**:
- FR-SC-005: Complete Spot Check
- VAL-SC-105: Adjustment posting required
- UC-SC-202: Post Adjustments to Inventory

---

### UC-SC-103: Send High Variance Notifications

**Description**: System sends notifications to supervisors when high variance items require approval.

**Trigger**: High variance item detected during variance review

**Actor(s)**:
- **Primary**: Spot Check System
- **Secondary**: Notification Service

**Priority**: High

**Frequency**: Weekly (when high variance detected)

**Preconditions**:
- Spot check has high variance items (>5% or >$100)
- Supervisor contact information available

**Postconditions**:
- **Success**: Notification sent to appropriate supervisor(s)
- **Failure**: Error logged, notification queued for retry

**Main Flow**:
1. System detects high variance item during variance calculation
2. System identifies appropriate supervisor:
   - 2a. Retrieves location's department
   - 2b. Retrieves department supervisor(s)
   - 2c. Falls back to location manager if no supervisor
3. System prepares notification payload:
   - Subject: "Spot Check Approval Required - SPOT-2024-000015"
   - Body:
     - Spot check number and location
     - High variance item details
     - Link to approval page
     - Requestor name and contact
4. System calls Notification Service API
5. Notification Service routes to appropriate channels:
   - In-app notification
   - Email notification
   - Optional: SMS for critical items (>$500 variance)
6. System records notification sent:
   - notification_id
   - sent_at timestamp
   - recipient(s)
7. System logs notification event
8. Process completes

**Alternative Flows**:

**Alt-103A: Multiple Recipients** (At step 2)
- 2a. Multiple supervisors found for location
- 2b. System sends notification to all supervisors
- 2c. First supervisor to approve handles request
- 2d. Other supervisors notified when approval completed
- Resume at step 3

**Alt-103B: Escalation for Critical Variance** (At step 2)
- 2a. Variance value > $500 (critical threshold)
- 2b. System also notifies manager and inventory director
- 2c. Notification marked as "Critical" priority
- 2d. Resume at step 3

**Exception Flows**:

**Exc-103A: Supervisor Not Found** (At step 2)
- No supervisor assigned to location's department
- System falls back to location manager
- If no manager, system sends to inventory director
- System logs warning "No supervisor found for location"
- Resume at step 3

**Exc-103B: Notification Service Unavailable** (At step 4)
- Notification Service API unavailable
- System queues notification for retry
- System logs error
- System displays message to user: "Approval notification will be sent when available"
- Process ends

**Exc-103C: Invalid Contact Information** (At step 4)
- Supervisor email/phone invalid or missing
- System logs error
- System sends notification to alternate supervisor
- System alerts administrator to update contact info
- Resume at step 3 with alternate recipient

**Business Rules**:
- **BR-SC-020**: High variance threshold: > 5% OR variance value > $100
- **BR-SC-024**: Supervisors approve for their department locations

**SLA**:
- **Processing Time**: < 2 seconds
- **Availability**: 99.5% (degrades gracefully)
- **Recovery Time**: < 5 minutes for retry

**Monitoring**:
- Notification delivery rate
- Average delivery time
- Failed notification count
- Approval response time

**Related Requirements**:
- FR-SC-006: Approve High Variance Items
- UC-SC-006: Approve High Variance Items

---

## Integration Use Cases

### UC-SC-201: Retrieve Expected Quantities

**Description**: System retrieves expected quantities from Inventory Transaction System when products are added to spot check.

**Actor(s)**:
- **Primary**: Spot Check System
- **External System**: Inventory Transaction System

**Trigger**: Product added to spot check

**Integration Type**: [X] REST API

**Direction**: [X] Outbound (We call ITS)

**Priority**: Critical

**Frequency**: Real-time (on product addition)

**Preconditions**:
- Spot check session created
- Product exists in product master
- ITS API available and authenticated

**Postconditions**:
- **Success**: Expected quantity retrieved and populated in spot check detail
- **Failure**: Warning displayed, expected quantity set to null, user can still proceed

**Main Flow**:
1. System receives product addition request
2. System prepares API request:
   - Endpoint: GET /api/inventory/balance
   - Parameters: product_id, location_id, as_of_date=current date
3. System authenticates with ITS using OAuth 2.0 token
4. System sends request to ITS
5. ITS queries current inventory balance:
   - Retrieves closing balance from last transaction
   - Considers: receipts, issues, adjustments, transfers
6. ITS responds with current balance
7. System validates response format
8. System populates expected_qty field with returned balance
9. System logs successful retrieval
10. Process completes

**Alternative Flows**:

**Alt-201A: No Inventory History** (At step 5)
- 5a. Product has no transactions at location
- 5b. ITS returns balance = 0.00
- 5c. System populates expected_qty = 0.00
- 5d. System adds note "New product - no previous inventory"
- Resume at step 8

**Alt-201B: Future-Dated Transaction** (At step 5)
- 5a. ITS finds transaction dated in future
- 5b. ITS ignores future transaction, uses last historical transaction
- 5c. Resume at step 6

**Exception Flows**:

**Exc-201A: ITS Unavailable** (At step 4)
- ITS API unavailable (network error, service down)
- System logs error with timestamp
- System displays warning: "Inventory system unavailable. Expected quantity cannot be retrieved. You can still add product and enter actual quantity."
- System sets expected_qty = null
- System allows user to proceed (degrades gracefully)
- Process ends

**Exc-201B: Authentication Failure** (At step 3)
- OAuth token expired or invalid
- System attempts token refresh
- If refresh succeeds, resume at step 4
- If refresh fails:
   - System logs authentication error
   - System displays error: "Authentication failed. Please contact support."
   - Process ends

**Exc-201C: Product Not Found in ITS** (At step 5)
- Product exists in local system but not in ITS
- ITS returns 404 Not Found
- System logs warning
- System displays: "Product not found in inventory system. Expected quantity set to zero."
- System sets expected_qty = 0.00
- Resume at step 8

**Exc-201D: Invalid Response** (At step 7)
- Response format invalid or missing required fields
- System logs validation error
- System displays warning: "Invalid response from inventory system"
- System sets expected_qty = null
- Process ends

**API Contract**:

**Request**:
```http
GET /api/inventory/balance
?product_id=660e8400-e29b-41d4-a716-446655440001
&location_id=440e8400-e29b-41d4-a716-446655440001
&as_of_date=2024-01-15

Authorization: Bearer {oauth_token}
Content-Type: application/json
```

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "product_id": "660e8400-e29b-41d4-a716-446655440001",
    "location_id": "440e8400-e29b-41d4-a716-446655440001",
    "current_balance": 100.00,
    "unit_id": "unit-kg",
    "unit_name": "Kilogram",
    "last_transaction_date": "2024-01-14T16:30:00Z",
    "last_transaction_type": "receipt"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Response** (No History):
```json
{
  "status": "success",
  "data": {
    "product_id": "660e8400-e29b-41d4-a716-446655440001",
    "location_id": "440e8400-e29b-41d4-a716-446655440001",
    "current_balance": 0.00,
    "unit_id": "unit-kg",
    "unit_name": "Kilogram",
    "last_transaction_date": null,
    "last_transaction_type": null,
    "note": "No transaction history"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Response** (Error):
```json
{
  "status": "error",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found in inventory system",
    "details": "Product ID 660e8400-... does not exist at location 440e8400-..."
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Error Handling**:
- **4xx errors**: Log and display user-friendly message, allow proceeding without expected qty
- **5xx errors**: Retry with exponential backoff (1s, 2s, 4s), queue for background retry if all fail
- **Timeout**: 10 second timeout, retry once, then degrade gracefully
- **Network errors**: Retry immediately once, then degrade gracefully

**Data Mapping**:

| Internal Field | ITS Field | Transformation |
|----------------|-----------|----------------|
| expected_qty | current_balance | Direct mapping (decimal 15,2) |
| unit_id | unit_id | Direct mapping (UUID) |
| unit_name | unit_name | Direct mapping (varchar) |

**Monitoring**:
- API success rate
- Average response time
- Error rate by error type
- Cache hit rate (if caching implemented)

**Fallback Strategy**:
- If ITS unavailable for >15 minutes, send alert to operations team
- Allow spot checks to proceed with null expected quantities
- Display banner: "Inventory system connectivity issue. Expected quantities unavailable."
- Queue failed requests for batch retry when system restored

**Related Requirements**:
- FR-SC-002: Select Products for Spot Check
- BR-SC-005: Expected quantities from closing balance
- NFR-SC-002: Response time < 500ms

---

### UC-SC-202: Post Adjustments to Inventory

**Description**: System posts inventory adjustment transactions to Inventory Transaction System when spot check is completed.

**Actor(s)**:
- **Primary**: Spot Check System
- **External System**: Inventory Transaction System

**Trigger**: Spot check completion

**Integration Type**: [X] REST API

**Direction**: [X] Outbound (We call ITS)

**Priority**: Critical

**Frequency**: Daily (for each completed spot check)

**Preconditions**:
- Spot check status = 'completed' or completing
- Variance exists (variance_qty != 0)
- User has approved high variance items
- ITS API available and authenticated

**Postconditions**:
- **Success**: Adjustment transaction created in ITS, inventory balance updated, adjustment_transaction_id recorded
- **Failure**: Error logged, adjustment queued for retry, spot check status = 'pending_adjustment_post'

**Main Flow**:
1. System receives spot check completion event
2. System retrieves all detail records with variance_qty != 0
3. For each detail record:
   - 3a. System prepares adjustment transaction payload
   - 3b. System authenticates with ITS using OAuth 2.0 token
   - 3c. System sends POST request to ITS
   - 3d. ITS validates request:
     - Product exists and active
     - Location exists and active
     - Adjustment quantity valid
     - Sufficient stock for negative adjustments (configurable warning/block)
   - 3e. ITS creates adjustment transaction
   - 3f. ITS updates inventory balance:
     - new_balance = current_balance + adjustment_qty
   - 3g. ITS records transaction in audit log
   - 3h. ITS responds with transaction details
   - 3i. System validates response
   - 3j. System records adjustment_transaction_id
   - 3k. System sets adjustment_posted = true
4. System verifies all adjustments posted successfully
5. System commits local transaction
6. System logs completion event
7. Process completes

**Alternative Flows**:

**Alt-202A: Batch Adjustment** (At step 3)
- 3a. Multiple adjustments to post (>1 product)
- 3b. System prepares batch request payload
- 3c. System sends single POST with array of adjustments
- 3d. ITS processes all adjustments atomically
- 3e. ITS responds with array of transaction IDs
- 3f. Resume at step 4

**Alt-202B: Zero Balance Adjustment** (At step 3d)
- 3da. Negative adjustment would result in negative balance
- 3db. ITS configured to allow negative balances (depending on business rules)
- 3dc. ITS logs warning but processes adjustment
- 3dd. Resume at step 3e

**Alt-202C: Retry on Temporary Failure** (At step 3c)
- 3ca. Request times out or temporary error (502, 503)
- 3cb. System implements exponential backoff: 1s, 2s, 4s
- 3cc. System retries up to 3 times
- 3cd. If successful on retry, resume at step 3d
- 3ce. If all retries fail, move to exception flow

**Exception Flows**:

**Exc-202A: ITS Unavailable** (At step 3c)
- ITS API unavailable or all retries exhausted
- System logs error with full context
- System queues adjustment for background retry
- System sets spot check status = 'pending_adjustment_post'
- System sends alert to operations team
- System displays: "Spot check saved. Adjustments will be posted when inventory system available."
- Process ends

**Exc-202B: Business Rule Violation** (At step 3d)
- ITS rejects adjustment (e.g., insufficient stock, product inactive)
- ITS returns 400 Bad Request with error details
- System logs rejection reason
- System flags detail record with rejection error
- System sends notification to manager for manual resolution
- System continues with remaining adjustments
- Resume at step 3 for next record

**Exc-202C: Authentication Failure** (At step 3b)
- OAuth token expired or invalid
- System attempts token refresh
- If refresh succeeds, resume at step 3c
- If refresh fails:
   - System logs authentication error
   - System queues adjustment for retry
   - System sends alert to administrator
   - Process ends

**Exc-202D: Partial Success in Batch** (At step 3d - batch mode)
- Some adjustments succeed, others fail
- ITS returns partial success response
- System commits successful adjustments
- System logs failed adjustments with errors
- System queues failed adjustments for retry
- System sets spot check status = 'partially_posted'
- System sends notification listing failed items
- Process ends

**Exc-202E: Response Validation Failure** (At step 3i)
- Response format invalid or missing required fields
- System logs validation error
- System marks adjustment as failed
- System queues for manual review
- Resume at step 3 for next record

**API Contract**:

**Request** (Single Adjustment):
```http
POST /api/inventory/adjustment
Authorization: Bearer {oauth_token}
Content-Type: application/json

{
  "transaction_type": "adjustment",
  "product_id": "660e8400-e29b-41d4-a716-446655440001",
  "location_id": "440e8400-e29b-41d4-a716-446655440001",
  "adjustment_qty": -5.00,
  "reason": "spot_check",
  "reference_type": "spot_check",
  "reference_no": "SPOT-2024-000015",
  "notes": "Found 5kg expired, removed from inventory",
  "posted_by": "user-123",
  "posted_at": "2024-01-15T14:30:00Z"
}
```

**Request** (Batch Adjustments):
```http
POST /api/inventory/adjustment/batch
Authorization: Bearer {oauth_token}
Content-Type: application/json

{
  "reference_type": "spot_check",
  "reference_no": "SPOT-2024-000015",
  "posted_by": "user-123",
  "posted_at": "2024-01-15T14:30:00Z",
  "adjustments": [
    {
      "product_id": "660e8400-...",
      "location_id": "440e8400-...",
      "adjustment_qty": -5.00,
      "notes": "Expired inventory removed"
    },
    {
      "product_id": "660e8400-...",
      "location_id": "440e8400-...",
      "adjustment_qty": 2.00,
      "notes": "Overage found"
    }
  ]
}
```

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "transaction_id": "770e8400-e29b-41d4-a716-446655440001",
    "transaction_no": "ADJ-2024-001523",
    "product_id": "660e8400-e29b-41d4-a716-446655440001",
    "location_id": "440e8400-e29b-41d4-a716-446655440001",
    "previous_balance": 100.00,
    "adjustment_qty": -5.00,
    "new_balance": 95.00,
    "posted_at": "2024-01-15T14:30:01Z"
  },
  "timestamp": "2024-01-15T14:30:01Z"
}
```

**Response** (Batch Success):
```json
{
  "status": "success",
  "data": {
    "batch_id": "batch-550e8400-...",
    "processed_count": 3,
    "failed_count": 0,
    "transactions": [
      {
        "sequence": 1,
        "status": "success",
        "transaction_id": "770e8400-...",
        "transaction_no": "ADJ-2024-001523"
      },
      {
        "sequence": 2,
        "status": "success",
        "transaction_id": "770e8400-...",
        "transaction_no": "ADJ-2024-001524"
      }
    ]
  },
  "timestamp": "2024-01-15T14:30:02Z"
}
```

**Response** (Business Rule Violation):
```json
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for negative adjustment",
    "details": "Current balance: 3.00 kg, Adjustment: -5.00 kg, Resulting balance would be negative.",
    "product_id": "660e8400-e29b-41d4-a716-446655440001",
    "location_id": "440e8400-e29b-41d4-a716-446655440001"
  },
  "timestamp": "2024-01-15T14:30:01Z"
}
```

**Response** (Partial Batch Success):
```json
{
  "status": "partial_success",
  "data": {
    "batch_id": "batch-550e8400-...",
    "processed_count": 2,
    "failed_count": 1,
    "transactions": [
      {
        "sequence": 1,
        "status": "success",
        "transaction_id": "770e8400-...",
        "transaction_no": "ADJ-2024-001523"
      },
      {
        "sequence": 2,
        "status": "failed",
        "error": {
          "code": "PRODUCT_INACTIVE",
          "message": "Product is inactive and cannot be adjusted"
        }
      }
    ]
  },
  "timestamp": "2024-01-15T14:30:02Z"
}
```

**Error Handling**:
- **400 Bad Request**: Log error, mark adjustment as failed, notify manager for manual resolution
- **401 Unauthorized**: Refresh token, retry once
- **404 Not Found**: Log error, mark adjustment as failed, alert administrator
- **409 Conflict**: Concurrent update detected, retry with latest balance
- **422 Unprocessable**: Business rule violation, log and notify manager
- **500 Server Error**: Retry with exponential backoff, queue for background retry if all fail
- **503 Service Unavailable**: Retry with exponential backoff, queue if unavailable for >15 min
- **Timeout** (10s): Retry immediately once, then retry with backoff

**Data Mapping**:

| Internal Field | ITS Field | Transformation |
|----------------|-----------|----------------|
| variance_qty | adjustment_qty | Direct mapping (decimal 15,2) |
| product_id | product_id | Direct mapping (UUID) |
| location_id | location_id | Direct mapping (UUID) |
| count_stock_no | reference_no | Direct mapping (varchar) |
| note | notes | Direct mapping (varchar) |

**Business Rules**:
- **BR-ITS-001**: Negative adjustments cannot result in negative balance (configurable)
- **BR-ITS-002**: Adjustments must reference original document (spot check number)
- **BR-ITS-003**: All adjustments logged in audit trail

**SLA**:
- **Processing Time**: < 5 seconds for 50 adjustments
- **Availability**: 99.9%
- **Recovery Time**: < 5 minutes for retry

**Monitoring**:
- Adjustment posting success rate
- Average API response time
- Error rate by error type
- Queue depth for pending adjustments
- Failed adjustment count requiring manual intervention

**Rollback Procedure**:
1. Identify all posted adjustment transactions for spot check (by reference_no)
2. For each adjustment:
   - Create compensating transaction with inverse adjustment_qty
   - Post compensating transaction to ITS
3. Verify all compensating transactions successful
4. Verify inventory balances restored to pre-adjustment state
5. Set spot check status = 'adjustment_reversed'
6. Log reversal event with reason and user
7. Send notification to manager and original creator

**Fallback Strategy**:
- If ITS unavailable for >15 minutes:
  - Send critical alert to operations team
  - Queue all adjustments for background retry
  - Implement exponential backoff: 1min, 5min, 15min, 30min, 1hour
  - Retry until successful or manual intervention required
  - Display system banner: "Inventory adjustments pending. System will retry automatically."

**Related Requirements**:
- FR-SC-005: Complete Spot Check
- VAL-SC-105: Adjustment posting required
- UC-SC-102: Post Inventory Adjustments
- NFR-SC-004: Adjustment posting < 5 seconds

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Priority | Status |
|----------|----------------|---------------|----------|--------|
| UC-SC-001 | FR-SC-001 | BR-SC-001, BR-SC-022 | High | Planned |
| UC-SC-002 | FR-SC-002 | BR-SC-002, BR-SC-003, BR-SC-005 | High | Planned |
| UC-SC-003 | FR-SC-003 | BR-SC-006, BR-SC-007, BR-SC-008 | Critical | Planned |
| UC-SC-004 | FR-SC-004 | BR-SC-017, BR-SC-018, BR-SC-020 | High | Planned |
| UC-SC-005 | FR-SC-005 | BR-SC-012, BR-SC-014, BR-SC-015 | Critical | Planned |
| UC-SC-006 | FR-SC-006 | BR-SC-014, BR-SC-020, BR-SC-024 | High | Planned |
| UC-SC-007 | FR-SC-007 | BR-SC-007, BR-SC-011, BR-SC-016 | Medium | Planned |
| UC-SC-008 | FR-SC-008 | BR-SC-023, BR-SC-025 | Medium | Planned |
| UC-SC-009 | FR-SC-009 | BR-SC-026 | Low | Future |
| UC-SC-101 | FR-SC-003, FR-SC-004 | BR-SC-017, BR-SC-018 | Critical | Planned |
| UC-SC-102 | FR-SC-005 | BR-SC-015, BR-SC-021 | Critical | Planned |
| UC-SC-103 | FR-SC-006 | BR-SC-020, BR-SC-024 | High | Planned |
| UC-SC-201 | FR-SC-002 | BR-SC-005 | Critical | Planned |
| UC-SC-202 | FR-SC-005 | BR-SC-021 | Critical | Planned |

---

## Appendix

### Glossary

- **Spot Check**: Targeted inventory verification of selected products, as opposed to comprehensive physical count
- **Expected Quantity**: System-calculated quantity based on current inventory balance from transactions
- **Actual Quantity**: Physical count performed by storekeeper during spot check
- **Variance**: Difference between expected and actual quantities (can be positive=overage or negative=shortage)
- **High Variance**: Variance exceeding configured threshold (default: >5% or >$100) requiring supervisor approval
- **Variance Value**: Monetary impact of variance, calculated as variance_qty * product_cost
- **Adjustment Posting**: Creating inventory adjustment transaction in ITS to correct stock levels
- **Draft Mode**: Ability to save partially completed spot check with status='pending' and resume later
- **count_stock_type**: Database field discriminator ('spot') that differentiates spot checks from physical counts ('physical')
- **Closing Balance**: Current inventory quantity calculated from all historical transactions (receipts, issues, adjustments, transfers)
- **Compensating Transaction**: Reverse transaction used to undo adjustment and restore previous balance

### Common Patterns

**Pattern: Graceful Degradation**
- When external dependencies (ITS) unavailable
- System allows operation to proceed with reduced functionality
- Data queued for retry when dependency restored
- User notified of degraded state with clear messaging

**Pattern: Optimistic UI with Auto-Save**
- User enters data in form
- System auto-saves every 30 seconds
- User receives immediate visual feedback
- Network failures handled via local storage fallback
- Data synchronized when connection restored

**Pattern: Approval Workflow**
- User completes work requiring approval
- System identifies approval authority
- Notification sent with approval link
- Approver reviews and approves/rejects/requests more info
- System updates state and notifies requester
- Audit trail preserved

**Pattern: Batch Processing with Partial Success Handling**
- System processes multiple items as batch
- Each item processed independently
- Successful items committed immediately
- Failed items logged and queued for retry
- User notified of partial success with details
- Manual intervention available for persistent failures

---

**Document End**

> 📝 **Use Case Coverage**:
> - **User Use Cases**: 9 (core spot check workflows)
> - **System Use Cases**: 3 (automated processes)
> - **Integration Use Cases**: 2 (ITS integration)
> - **Total**: 14 use cases covering full spot check lifecycle
>
> 📊 **Priority Distribution**:
> - **Critical**: 5 use cases (creation, entry, calculation, completion, integrations)
> - **High**: 6 use cases (product addition, variance review, approval, notifications)
> - **Medium**: 2 use cases (cancellation, history)
> - **Low**: 1 use case (templates - future enhancement)
