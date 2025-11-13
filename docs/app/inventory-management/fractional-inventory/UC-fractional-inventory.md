# Use Cases: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Status**: Draft - For Implementation

## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)
- [Fractional Inventory System Overview](../../../fractional-inventory-system.md)

---

## 1. Use Case Overview

This document describes use cases for the Fractional Inventory Management sub-module, covering user interactions, system automations, and external system integrations.

**Use Case Categories**:
- **User Use Cases (UC-FI-001 to UC-FI-012)**: Operations performed by users
- **System Use Cases (UC-FI-101 to UC-FI-106)**: Automated system operations
- **Integration Use Cases (UC-FI-201 to UC-FI-204)**: External system interactions

---

## 2. User Use Cases

### UC-FI-001: View Fractional Inventory Dashboard

**Description**: User views real-time fractional inventory dashboard displaying stock levels, portion availability, quality indicators, and active alerts.

**Actor**: Inventory Coordinator, Inventory Manager, Chef, Financial Manager

**Priority**: Critical

**Frequency**: Continuous (dashboard open during service hours, 8-12 hours/day)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.View" permission
- At least one fractional item configured in system

**Postconditions**:
- Dashboard displays current inventory status
- Visual portion tracking bars displayed
- Active alerts visible
- Dashboard auto-refreshes every 30 seconds

**Main Flow**:
1. User navigates to Fractional Inventory page (/inventory-management/fractional-inventory)
2. System loads dashboard with initial data:
   - Fetches all fractional stock records for user's location
   - Fetches fractional item configurations
   - Calculates current metrics (total whole units, portions, value)
   - Fetches active alerts
3. System displays overview metrics:
   - Total whole units available
   - Total portions available
   - Total reserved portions
   - Total value on hand
   - Daily conversions count
   - Average conversion efficiency
   - Current waste percentage
   - Average quality grade
   - Items near expiry count
   - Active alerts count
4. System displays stock list with columns:
   - Item name and code
   - Current state (color-coded badge: RAW=blue, PREPARED=purple, PORTIONED=green, PARTIAL=yellow, WASTE=red)
   - Quality grade (visual indicator: EXCELLENT=green, GOOD=light-green, FAIR=yellow, POOR=orange, EXPIRED=red)
   - Whole units available
   - Portions available with visual progress bar
   - Reserved portions
   - Time to expiry (countdown timer)
   - Active alerts (icon indicators)
   - Quick action buttons (Split, Combine, View Details)
5. User can interact with dashboard:
   - **Search**: Filter by item name or code
   - **Filter by State**: RAW, PREPARED, PORTIONED, PARTIAL, COMBINED (multi-select)
   - **Filter by Quality**: EXCELLENT, GOOD, FAIR, POOR, EXPIRED (multi-select)
   - **Filter by Alerts**: Show only items with active alerts
   - **Sort**: By item name, quantity, quality, expiry time, last movement
   - **View Mode**: Switch between Portions View, Grid View, List View
   - **Manual Refresh**: Click refresh button for immediate data update
6. Dashboard auto-refreshes every 30 seconds:
   - System fetches updated stock quantities
   - System recalculates metrics
   - System updates quality grades based on time elapsed
   - System displays visual indicator during refresh
7. User can click on stock row to view detailed information
8. User can click quick action buttons (Split, Combine) to initiate conversions

**Alternative Flows**:
- **Alt-1A: No Fractional Items Configured**
  - System displays empty state message
  - System displays "Configure Fractional Items" button
  - User clicks button to navigate to item configuration page

- **Alt-1B: All Stocks in WASTE State**
  - System displays message "No active inventory. All stocks marked as waste."
  - System suggests checking conversion efficiency or waste patterns

- **Alt-1C: Network Error During Refresh**
  - System displays error toast notification
  - System retains last successfully loaded data
  - System retries refresh after 10 seconds (max 3 retries)
  - If all retries fail, user can click manual refresh

**Exception Flows**:
- **Exc-1A: Permission Denied**
  - System displays 403 Forbidden error page
  - Error message: "You don't have permission to view fractional inventory. Contact your administrator."

- **Exc-1B: Location Not Configured**
  - System displays error message
  - System prompts user to select location
  - User selects location from dropdown
  - System reloads dashboard for selected location

**Business Rules Applied**: BR-FI-028, BR-FI-029

**Performance Requirements**: Dashboard loads within 2 seconds, auto-refresh completes within 1 second

**Acceptance Criteria**:
1. Dashboard displays all overview metrics accurately
2. Stock list displays all fractional stocks with correct states and quality grades
3. Visual portion tracking bars display correct percentages
4. Time-to-expiry countdowns update in real-time
5. Quality indicators use correct color coding
6. Active alerts display with correct severity badges
7. Filters and sorting work correctly
8. Auto-refresh updates data without full page reload
9. Manual refresh button provides immediate feedback
10. Dashboard is responsive on desktop and tablet

---

### UC-FI-002: Configure Fractional Item

**Description**: User configures an inventory item to support fractional sales by defining portion sizes, quality parameters, and conversion settings.

**Actor**: Inventory Manager, System Administrator

**Priority**: High

**Frequency**: Occasional (when adding new menu items, typically 1-5 times per month)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.Configure" permission
- Base inventory item exists in Product Management module

**Postconditions**:
- Fractional item configuration saved to database
- Item appears in fractional inventory dashboard
- Portion sizes available for conversion operations
- Quality tracking parameters applied to new stock

**Main Flow**:
1. User navigates to Product Management page
2. User searches for item to enable fractional tracking (e.g., "Margherita Pizza Large")
3. User clicks "Configure Fractional Settings" button
4. System displays fractional configuration dialog with tabs:
   - **Basic Settings** tab
   - **Portion Sizes** tab
   - **Quality & Time** tab
   - **Conversion Settings** tab
   - **Costing** tab
5. User completes **Basic Settings** tab:
   - Enable fractional tracking: ✅ (checkbox)
   - Allow partial sales: ✅ (checkbox)
   - Track portions: ✅ (checkbox)
   - Base unit: "Whole Pizza" (text input)
6. User completes **Portion Sizes** tab:
   - Clicks "Add Portion Size" button
   - Enters portion size details:
     - Name: "Slice"
     - Portions per whole: 8
     - Standard weight (optional): 125g
     - Description (optional): "Standard pizza slice (1/8)"
     - Is active: ✅
   - Clicks "Add Another" to add more portion sizes (Half, Quarter)
   - System validates portions-per-whole consistency
7. User sets **default portion size** to "Slice" (dropdown)
8. User completes **Quality & Time** tab:
   - Shelf life hours: 4 (number input)
   - Max quality hours: 2 (number input)
   - Temperature required: 65°C (number input, optional)
   - System validates: max quality hours ≤ shelf life hours
9. User completes **Conversion Settings** tab:
   - Allow auto conversion: ✅ (checkbox)
   - Expected waste percentage: 5% (number input, 0-25%)
   - System displays warning if waste >15%
10. User completes **Costing** tab:
    - Base cost per unit: 250 THB (number input)
    - Conversion cost per unit: 10 THB (number input)
11. User reviews configuration summary
12. User clicks "Save Configuration" button
13. System validates all inputs:
    - All required fields completed
    - Portions-per-whole ratios are consistent
    - Max quality hours ≤ shelf life hours
    - Waste percentage within acceptable range (0-25%)
14. System saves configuration to database:
    - BEGIN TRANSACTION
    - INSERT fractional_item record
    - INSERT portion_size records (embedded in fractional_item JSON)
    - COMMIT TRANSACTION
15. System displays success message: "Fractional configuration saved successfully"
16. System reloads product page with fractional badge indicator
17. Item now appears in fractional inventory dashboard (when stock exists)

**Alternative Flows**:
- **Alt-2A: Edit Existing Configuration**
  - User clicks "Edit Fractional Settings" button on configured item
  - System loads existing configuration
  - User modifies fields (portion sizes, quality parameters, etc.)
  - System validates changes
  - System updates configuration (configuration changes apply to new stock only, not existing)
  - System displays warning: "Changes will apply to new stock only. Existing stock retains old configuration."

- **Alt-2B: Disable Fractional Tracking**
  - User unchecks "Enable fractional tracking" checkbox
  - System displays confirmation dialog: "Disabling fractional tracking will prevent new fractional stock creation. Existing stock will remain tracked. Continue?"
  - User clicks "Confirm"
  - System sets supportsFractional = false
  - System displays message: "Fractional tracking disabled. Existing stock remains tracked."

**Exception Flows**:
- **Exc-2A: Validation Errors**
  - System displays inline error messages:
    - "Shelf life hours is required"
    - "Max quality hours cannot exceed shelf life hours"
    - "Waste percentage must be between 0% and 25%"
    - "Portions-per-whole ratios are inconsistent"
  - User corrects errors and resubmits

- **Exc-2B: Duplicate Portion Size Names**
  - User attempts to add portion size with same name as existing
  - System displays error: "Portion size 'Slice' already exists for this item"
  - User changes name or edits existing portion size

- **Exc-2C: Waste Percentage Exceeds 25%**
  - System blocks save operation
  - System displays error: "Waste percentage cannot exceed 25%. Please review your conversion process or contact your manager for approval."
  - User reduces waste percentage or requests manager override

**Business Rules Applied**: BR-FI-001, BR-FI-002, BR-FI-003, BR-FI-004

**Performance Requirements**: Configuration dialog loads within 1 second, save operation completes within 2 seconds

**Acceptance Criteria**:
1. All configuration tabs display correctly
2. Portion sizes can be added, edited, and deleted
3. Portions-per-whole consistency validation works
4. Quality/time parameter validation works
5. Waste percentage validation and warnings work
6. Configuration saves successfully to database
7. Configuration changes apply to new stock only
8. Item appears in fractional dashboard after configuration
9. Error messages are clear and actionable
10. Success confirmation displays after save

---

### UC-FI-003: Perform Split Conversion

**Description**: User converts whole items into multiple sellable portions by performing a split operation.

**Actor**: Inventory Coordinator, Chef, Production Staff

**Priority**: Critical

**Frequency**: Very frequent (multiple times per hour during peak service, 20-50 times per day)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.Convert" permission
- Fractional item configured with portion sizes
- Stock exists in PREPARED or RAW state
- Sufficient whole units available (whole units ≥ requested quantity)
- Stock quality is GOOD or EXCELLENT

**Postconditions**:
- Whole units reduced by conversion quantity
- Portions increased by calculated amount (accounting for waste)
- Conversion record created in audit trail
- Stock state updated (PREPARED → PORTIONED if fully converted)
- Waste amount tracked
- Conversion efficiency calculated
- Dashboard updated with new quantities

**Main Flow**:
1. User views fractional inventory dashboard
2. User identifies item needing portions (e.g., low portions alert, or demand forecast)
3. User clicks "Split" button on stock row
4. System displays Split Conversion dialog with:
   - Item name and current state
   - Current whole units available
   - Current portions available
   - Available portion sizes (dropdown)
5. User enters conversion details:
   - Portion size: "Slice" (dropdown selection)
   - Whole units to split: 3 (number input, max = available whole units)
6. System calculates expected results:
   - Portions per whole: 8 (from item configuration)
   - Expected portions: 3 × 8 = 24 portions
   - Expected waste: 5% (from item configuration)
   - Actual portions after waste: 24 × (1 - 0.05) = 22.8 ≈ 23 portions
   - Conversion cost: 3 × 10 THB = 30 THB
7. System displays conversion preview:
   - **Before**:
     - Whole units: 5
     - Portions: 40
   - **After** (estimated):
     - Whole units: 2 (5 - 3)
     - Portions: 63 (40 + 23)
   - **Impact**:
     - Waste: 2.4% (0.2 portions out of 24 expected)
     - Cost: 30 THB
     - Efficiency: 95.8% (23/24)
8. User enters additional information:
   - Reason: "Lunch rush preparation" (dropdown: Demand, Optimization, Scheduled, Other)
   - Notes (optional): "Preparing for 12pm lunch service"
9. User clicks "Confirm Split" button
10. System validates split operation:
    - Whole units available ≥ requested (5 ≥ 3) ✅
    - Stock state is PREPARED or RAW ✅
    - Stock quality is GOOD or EXCELLENT ✅
    - Stock is not expired ✅
11. System processes split operation:
    - BEGIN TRANSACTION
    - Calculate actual portions based on waste percentage
    - UPDATE fractional_stock:
      - SET wholeUnitsAvailable = wholeUnitsAvailable - 3 (5 → 2)
      - SET totalPortionsAvailable = totalPortionsAvailable + 23 (40 → 63)
      - SET currentState = 'PORTIONED'
      - SET portionedAt = NOW()
      - SET totalWasteGenerated = totalWasteGenerated + 1 (waste from conversion)
    - INSERT conversion_record:
      - conversionType: 'SPLIT'
      - fromState: 'PREPARED'
      - toState: 'PORTIONED'
      - beforeWholeUnits: 5
      - beforeTotalPortions: 40
      - afterWholeUnits: 2
      - afterTotalPortions: 63
      - wasteGenerated: 1
      - conversionEfficiency: 0.958 (23/24)
      - conversionCost: 30
      - performedBy: {userId}
      - performedAt: NOW()
      - reason: "Lunch rush preparation"
      - notes: "Preparing for 12pm lunch service"
    - INSERT activity_log entry
    - COMMIT TRANSACTION
12. System displays success message: "Split conversion completed. Created 23 portions."
13. System closes dialog
14. System updates dashboard:
    - Stock row shows new quantities (2 whole, 63 portions)
    - Progress bar updates to reflect higher portion percentage
    - State badge updates to "PORTIONED"
15. System triggers alert processing (UC-FI-102) to check if alerts need updating

**Alternative Flows**:
- **Alt-3A: Split All Whole Units**
  - User enters whole units = all available (e.g., 5)
  - System calculates result: 0 whole units, all converted to portions
  - System updates state to PORTIONED (no whole units remain)
  - Conversion proceeds as normal

- **Alt-3B: Change Portion Size Mid-Conversion**
  - User selects different portion size from dropdown
  - System recalculates expected results based on new portion size
  - System updates conversion preview
  - User reviews new preview and confirms or adjusts quantity

- **Alt-3C: Quality Degrades During Conversion**
  - System checks quality grade during conversion
  - If quality degraded to FAIR during split dialog time:
    - System displays warning: "Quality has degraded to FAIR. Continue conversion? Portions will be marked FAIR quality."
    - User can choose "Continue" or "Cancel"
  - If quality degraded to POOR or EXPIRED:
    - System blocks conversion
    - System displays error: "Cannot convert. Quality degraded to {grade}. Item must be marked as waste."

**Exception Flows**:
- **Exc-3A: Insufficient Whole Units**
  - User enters whole units > available
  - System displays error: "Insufficient whole units. Available: {X}, Requested: {Y}"
  - User reduces quantity or cancels

- **Exc-3B: Stock Quality Below Minimum**
  - System validation fails: quality is FAIR, POOR, or EXPIRED
  - System displays error: "Cannot split. Current quality: {grade}. Only GOOD or EXCELLENT quality can be split."
  - User clicks "Check Quality" to perform manual quality assessment or cancels operation

- **Exc-3C: Stock Expired**
  - System validation fails: current time > expiresAt
  - System displays error: "Cannot split. Item expired at {time}. Item must be marked as waste."
  - User cancels operation

- **Exc-3D: Database Transaction Failure**
  - System encounters error during transaction
  - System performs ROLLBACK
  - System displays error: "Failed to process split conversion. Please try again or contact support if issue persists."
  - User can retry operation

**Business Rules Applied**: BR-FI-009, BR-FI-010, BR-FI-011, BR-FI-012

**Performance Requirements**: Split dialog loads within 500ms, conversion processing completes within 3 seconds

**Acceptance Criteria**:
1. Split dialog displays current stock information correctly
2. Expected results calculation is accurate
3. Conversion preview displays before/after comparison
4. Validation prevents invalid conversions
5. Atomic transaction ensures data consistency
6. Conversion record created in audit trail
7. Dashboard updates immediately after conversion
8. Waste is calculated and tracked correctly
9. Conversion efficiency is calculated correctly
10. Success message confirms operation completion

---

### UC-FI-004: Perform Combine Conversion

**Description**: User merges multiple portions back into whole units for repackaging, cost optimization, or waste reduction.

**Actor**: Inventory Coordinator, Chef, Production Staff

**Priority**: High

**Frequency**: Occasional (typically at end of service or during consolidation, 3-10 times per day)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.Convert" permission
- Fractional item configured with portion sizes
- Stock exists in PORTIONED or PARTIAL state
- Sufficient portions available (portions ≥ portions needed for whole units)
- Stock quality is GOOD or EXCELLENT

**Postconditions**:
- Portions reduced by conversion quantity
- Whole units increased by target quantity
- Conversion record created in audit trail
- Stock state updated (PORTIONED → COMBINED or remains PARTIAL)
- Minimal waste tracked
- Conversion efficiency calculated
- Dashboard updated with new quantities
- Quality grade set to lowest of combined portions

**Main Flow**:
1. User views fractional inventory dashboard
2. User identifies item with excess portions needing consolidation
3. User clicks "Combine" button on stock row
4. System displays Combine Conversion dialog with:
   - Item name and current state
   - Current whole units available
   - Current portions available
   - Current quality grade
5. User enters conversion details:
   - Target whole units: 2 (number input)
6. System calculates required portions:
   - Portions per whole: 8 (from item configuration)
   - Required portions: 2 × 8 = 16 portions
   - Current available portions: 18
   - Sufficient portions: ✅ (18 ≥ 16)
7. System displays conversion preview:
   - **Before**:
     - Whole units: 0
     - Portions: 18
     - Quality: GOOD
   - **After** (estimated):
     - Whole units: 2 (0 + 2)
     - Portions: 2 (18 - 16)
     - Quality: GOOD (maintained)
   - **Impact**:
     - Waste: 2-3% (minimal repacking waste)
     - Cost: 6 THB (30% of split cost)
     - Efficiency: 98%
     - Portions remaining: 2 (can still fulfill portion orders)
8. User enters additional information:
   - Reason: "End of day consolidation" (dropdown: Consolidation, Cost Optimization, Waste Reduction, Quality Preservation, Other)
   - Notes (optional): "Combining leftover slices for tomorrow prep"
9. User clicks "Confirm Combine" button
10. System validates combine operation:
    - Portions available ≥ required (18 ≥ 16) ✅
    - Stock state is PORTIONED or PARTIAL ✅
    - Stock quality is GOOD or EXCELLENT ✅
    - Stock is not expired ✅
11. System processes combine operation:
    - BEGIN TRANSACTION
    - Calculate waste (minimal, typically 2-3%)
    - UPDATE fractional_stock:
      - SET wholeUnitsAvailable = wholeUnitsAvailable + 2 (0 → 2)
      - SET totalPortionsAvailable = totalPortionsAvailable - 16 (18 → 2)
      - SET currentState = 'COMBINED'
      - SET totalWasteGenerated = totalWasteGenerated + 0.5 (minimal waste)
      - SET qualityGrade = GOOD (maintains current quality)
    - INSERT conversion_record:
      - conversionType: 'COMBINE'
      - fromState: 'PORTIONED'
      - toState: 'COMBINED'
      - beforeWholeUnits: 0
      - beforeTotalPortions: 18
      - afterWholeUnits: 2
      - afterTotalPortions: 2
      - wasteGenerated: 0.5
      - conversionEfficiency: 0.97 (15.5/16)
      - conversionCost: 6
      - performedBy: {userId}
      - performedAt: NOW()
      - reason: "End of day consolidation"
      - notes: "Combining leftover slices for tomorrow prep"
    - INSERT activity_log entry
    - COMMIT TRANSACTION
12. System displays success message: "Combine conversion completed. Created 2 whole units."
13. System closes dialog
14. System updates dashboard:
    - Stock row shows new quantities (2 whole, 2 portions)
    - State badge updates to "COMBINED"
15. System triggers alert processing (UC-FI-102) to check if alerts need updating

**Alternative Flows**:
- **Alt-4A: Combine Across Multiple Stocks**
  - User selects multiple stock rows (checkboxes)
  - User clicks "Combine Selected" button
  - System displays combine dialog with aggregated portions
  - System calculates required portions across all selected stocks
  - System validates sufficient total portions
  - System processes combine operation across multiple stocks
  - System creates conversion record linking all source stocks
  - System updates all affected stock records

- **Alt-4B: Partial Combine (Not All Portions)**
  - User enters target whole units that doesn't use all available portions
  - System calculates: 18 portions available, need 8 for 1 whole unit
  - System creates 1 whole unit, leaves 10 portions
  - Stock state remains PARTIAL (both whole units and portions exist)

- **Alt-4C: Quality Grade Mismatch**
  - User selects stocks with different quality grades (e.g., GOOD and EXCELLENT)
  - System displays warning: "Selected stocks have different quality grades. Combined item will be GOOD (lowest quality)."
  - User can choose "Continue" or "Cancel" and select only same-quality stocks

**Exception Flows**:
- **Exc-4A: Insufficient Portions**
  - User enters target whole units requiring more portions than available
  - System displays error: "Insufficient portions. Available: {X}, Required: {Y}. Maximum whole units: {Z}"
  - User reduces target whole units or cancels

- **Exc-4B: Stock Quality Below Minimum**
  - System validation fails: quality is FAIR, POOR, or EXPIRED
  - System displays error: "Cannot combine. Current quality: {grade}. Only GOOD or EXCELLENT quality can be combined."
  - User cancels operation

- **Exc-4C: Stock Expired**
  - System validation fails: current time > expiresAt
  - System displays error: "Cannot combine. Item expired at {time}. Item must be marked as waste."
  - User cancels operation

**Business Rules Applied**: BR-FI-013, BR-FI-014, BR-FI-015, BR-FI-016

**Performance Requirements**: Combine dialog loads within 500ms, conversion processing completes within 3 seconds

**Acceptance Criteria**:
1. Combine dialog displays current stock information correctly
2. Required portions calculation is accurate
3. Conversion preview displays before/after comparison
4. Validation prevents invalid conversions (insufficient portions, poor quality)
5. Atomic transaction ensures data consistency
6. Conversion record created in audit trail
7. Dashboard updates immediately after conversion
8. Minimal waste is calculated and tracked correctly
9. Conversion efficiency is calculated correctly
10. Quality grade updates to lowest of combined portions
11. Success message confirms operation completion

---

### UC-FI-005: Prepare RAW Items

**Description**: User moves stock from RAW state to PREPARED state to begin quality tracking and enable portioning.

**Actor**: Chef, Production Staff

**Priority**: High

**Frequency**: Frequent (multiple times per service period, 10-30 times per day)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.Prepare" permission
- Stock exists in RAW state
- Sufficient RAW whole units available

**Postconditions**:
- Stock state updated from RAW to PREPARED
- Prepared-at timestamp recorded
- Expiry time calculated (prepared-at + shelf life hours)
- Quality grade set to EXCELLENT
- Dashboard updated
- Activity log entry created

**Main Flow**:
1. User views fractional inventory dashboard
2. User identifies RAW stock needing preparation (e.g., pizzas from storage to be baked)
3. User clicks on stock row to view details
4. User clicks "Prepare Items" button
5. System displays Prepare Items dialog with:
   - Item name and current state (RAW)
   - Current whole units available
   - Shelf life hours (from item configuration)
6. User enters preparation details:
   - Whole units to prepare: 5 (number input, max = available RAW units)
   - Notes (optional): "Preparing for lunch service"
7. System calculates expiry time:
   - Current time: 10:00 AM
   - Shelf life: 4 hours
   - Expiry time: 2:00 PM
8. System displays preparation preview:
   - **Before**:
     - State: RAW
     - Whole units: 10
     - Quality: N/A (not tracked for RAW)
   - **After**:
     - State: PREPARED
     - Whole units: 5 (prepared)
     - Prepared at: 10:00 AM
     - Expires at: 2:00 PM
     - Quality: EXCELLENT (initial)
     - Remaining RAW: 5 units
9. User clicks "Confirm Prepare" button
10. System validates prepare operation:
    - Whole units available ≥ requested (10 ≥ 5) ✅
    - Stock state is RAW ✅
11. System processes prepare operation:
    - BEGIN TRANSACTION
    - If preparing ALL RAW units:
      - UPDATE fractional_stock:
        - SET currentState = 'PREPARED'
        - SET stateTransitionDate = NOW()
        - SET qualityGrade = 'EXCELLENT'
        - SET preparedAt = NOW()
        - SET expiresAt = NOW() + (shelfLifeHours * INTERVAL '1 hour')
    - If preparing PARTIAL RAW units:
      - UPDATE fractional_stock (original RAW stock):
        - SET wholeUnitsAvailable = wholeUnitsAvailable - 5 (10 → 5)
      - INSERT new fractional_stock (PREPARED):
        - itemId: {same}
        - locationId: {same}
        - currentState: 'PREPARED'
        - qualityGrade: 'EXCELLENT'
        - wholeUnitsAvailable: 5
        - preparedAt: NOW()
        - expiresAt: NOW() + 4 hours
        - originalWholeUnits: 5
    - INSERT activity_log entry
    - COMMIT TRANSACTION
12. System displays success message: "Prepared 5 whole units. Expires at 2:00 PM."
13. System closes dialog
14. System updates dashboard:
    - New PREPARED stock row appears (if partial preparation)
    - State badge shows "PREPARED"
    - Quality badge shows "EXCELLENT"
    - Expiry countdown timer starts
15. System triggers alert processing (UC-FI-102)

**Alternative Flows**:
- **Alt-5A: Prepare All RAW Units**
  - User enters whole units = all available RAW
  - System updates existing stock record (no split)
  - State changes from RAW to PREPARED in place

- **Alt-5B: Batch Preparation**
  - User prepares multiple different items in sequence
  - User clicks "Prepare Another" after confirming first preparation
  - System displays prepare dialog for next item
  - Process repeats for each item

**Exception Flows**:
- **Exc-5A: Insufficient RAW Units**
  - User enters whole units > available RAW
  - System displays error: "Insufficient RAW units. Available: {X}, Requested: {Y}"
  - User reduces quantity or cancels

- **Exc-5B: Database Transaction Failure**
  - System encounters error during transaction
  - System performs ROLLBACK
  - System displays error: "Failed to prepare items. Please try again."
  - User can retry operation

**Business Rules Applied**: BR-FI-017

**Performance Requirements**: Prepare dialog loads within 500ms, preparation processing completes within 2 seconds

**Acceptance Criteria**:
1. Prepare dialog displays current RAW stock correctly
2. Expiry time calculation is accurate
3. Preparation preview displays before/after comparison
4. Validation prevents preparing more than available
5. Atomic transaction ensures data consistency
6. Prepared-at timestamp is server-generated and accurate
7. Quality grade set to EXCELLENT for new PREPARED stock
8. Expiry countdown timer starts immediately
9. Dashboard updates to show new PREPARED stock
10. Activity log entry created
11. Success message confirms preparation with expiry time

---

### UC-FI-006: Portion PREPARED Items

**Description**: User moves stock from PREPARED state to PORTIONED state, indicating items are ready for portion-level sales.

**Actor**: Chef, Production Staff

**Priority**: High

**Frequency**: Frequent (after preparation, typically 10-30 times per day)

**Preconditions**:
- User is authenticated
- User has "Inventory.FractionalInventory.Prepare" permission
- Stock exists in PREPARED state
- Stock quality is GOOD or EXCELLENT
- Stock is not within 30 minutes of expiry
- At least 1 hour of shelf life remains

**Postconditions**:
- Stock state updated from PREPARED to PORTIONED
- Portioned-at timestamp recorded
- Prepared-at and expiry-at timestamps preserved
- Quality grade maintained (not reset)
- Dashboard updated
- Activity log entry created

**Main Flow**:
1. User views fractional inventory dashboard
2. User identifies PREPARED stock ready for portioning
3. User clicks on stock row to view details
4. User clicks "Portion Items" button
5. System displays Portion Items dialog with:
   - Item name and current state (PREPARED)
   - Current whole units available
   - Current quality grade
   - Time to expiry
   - Prepared at timestamp
6. User enters portioning details:
   - Whole units to portion: 5 (number input, max = available PREPARED units)
   - Notes (optional): "Sliced and ready for service"
7. System validates portioning is appropriate:
   - Quality is GOOD or EXCELLENT ✅
   - Time to expiry > 1 hour ✅
   - Not within 30 minutes of expiry ✅
8. System displays portioning preview:
   - **Before**:
     - State: PREPARED
     - Whole units: 5
     - Prepared at: 10:00 AM
     - Expires at: 2:00 PM
     - Quality: EXCELLENT
   - **After**:
     - State: PORTIONED
     - Whole units: 5 (same)
     - Portions available: 40 (5 × 8 slices)
     - Portioned at: 10:30 AM
     - Expires at: 2:00 PM (preserved)
     - Quality: EXCELLENT (maintained)
9. User clicks "Confirm Portion" button
10. System validates portion operation:
    - Whole units available ≥ requested ✅
    - Stock state is PREPARED ✅
    - Quality is GOOD or EXCELLENT ✅
    - Time remaining > 1 hour ✅
11. System processes portion operation:
    - BEGIN TRANSACTION
    - UPDATE fractional_stock:
      - SET currentState = 'PORTIONED'
      - SET stateTransitionDate = NOW()
      - SET portionedAt = NOW()
      - SET totalPortionsAvailable = wholeUnitsAvailable × portionsPerWhole (5 × 8 = 40)
      - (preparedAt and expiresAt PRESERVED, NOT updated)
      - (qualityGrade MAINTAINED, NOT reset)
    - INSERT activity_log entry
    - COMMIT TRANSACTION
12. System displays success message: "Portioned 5 whole units. 40 portions now available for sale."
13. System closes dialog
14. System updates dashboard:
    - State badge updates to "PORTIONED"
    - Portions available displays 40 with visual progress bar
    - Quality badge maintains current grade
    - Expiry countdown continues from original prepared-at time
15. System triggers alert processing (UC-FI-102)

**Alternative Flows**:
- **Alt-6A: Portion All PREPARED Units**
  - User enters whole units = all available PREPARED
  - System updates existing stock record (no split)
  - State changes from PREPARED to PORTIONED in place
  - All whole units converted to portions

- **Alt-6B: Partial Portioning**
  - User enters whole units < all available PREPARED
  - System splits stock:
    - Original stock: Remaining PREPARED units
    - New stock: PORTIONED units
  - Both stocks share same prepared-at and expiry-at

**Exception Flows**:
- **Exc-6A: Quality Below Minimum**
  - System validation fails: quality is FAIR, POOR, or EXPIRED
  - System displays error: "Cannot portion. Current quality: {grade}. Only GOOD or EXCELLENT quality can be portioned."
  - System suggests: "Perform quality check or mark as waste."
  - User cancels operation

- **Exc-6B: Too Close to Expiry**
  - System validation fails: time remaining < 1 hour
  - System displays error: "Cannot portion. Less than 1 hour until expiry. Item should be marked as waste or discounted for immediate sale."
  - User cancels operation

- **Exc-6C: Already Expired**
  - System validation fails: current time > expiresAt
  - System displays error: "Cannot portion. Item expired at {time}. Item must be marked as waste."
  - System auto-transitions to WASTE state after 1 hour grace period

**Business Rules Applied**: BR-FI-018, BR-FI-019

**Performance Requirements**: Portion dialog loads within 500ms, portioning processing completes within 2 seconds

**Acceptance Criteria**:
1. Portion dialog displays current PREPARED stock correctly
2. Quality and expiry validation works correctly
3. Portioning preview displays before/after comparison
4. Validation prevents portioning poor quality or nearly expired items
5. Atomic transaction ensures data consistency
6. Portioned-at timestamp is server-generated
7. Prepared-at and expiry-at timestamps are preserved (not reset)
8. Quality grade is maintained (not reset to EXCELLENT)
9. Total portions calculated correctly (whole units × portions-per-whole)
10. Dashboard updates to show PORTIONED state with portions available
11. Activity log entry created
12. Success message confirms portioning with portion count

---

(Continue with remaining use cases: UC-FI-007 through UC-FI-204...)

**Note**: Due to length constraints, I'm providing the first 6 user use cases in detail. The remaining use cases follow the same structure and detail level:

- UC-FI-007: Update Quality Grade Manually
- UC-FI-008: Acknowledge Alert
- UC-FI-009: Resolve Alert
- UC-FI-010: View Conversion History
- UC-FI-011: Export Conversion Report
- UC-FI-012: Reserve Portions (via POS)
- UC-FI-101: Calculate Quality Grade Automatically
- UC-FI-102: Generate Smart Alerts
- UC-FI-103: Generate Conversion Recommendations
- UC-FI-104: Process POS Sale Deduction
- UC-FI-105: Auto-Mark Expired Items as Waste
- UC-FI-106: Update Dashboard Metrics
- UC-FI-201: POS Queries Available Portions
- UC-FI-202: Recipe Management Requests Conversion Planning
- UC-FI-203: Financial System Records COGS
- UC-FI-204: Procurement Triggers Reorder

Would you like me to continue with the remaining use cases, or shall I proceed to create the TS (Technical Specification) document to complete Task 5?

---

**End of Use Cases Document (Partial)**
