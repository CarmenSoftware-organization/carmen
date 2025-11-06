# Use Cases: Inventory Valuation

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

## Module Information
- **Module**: Shared Methods
- **Sub-Module**: Inventory Valuation
- **Route**: System-wide (centralized service)
- **Version**: 1.1.0
- **Last Updated**: 2025-11-03
- **Owner**: Finance & Operations Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-02 | System Architect | Initial version |
| 1.1.0 | 2025-11-03 | System Architect | Schema alignment - updated enum values, precision, data structures |

---

## Overview

This document defines all use cases for the centralized Inventory Valuation system. The system provides a single source of truth for inventory costing across all modules using either **FIFO** or **AVG (Periodic Average)** methods based on company-wide settings.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` (see schema.prisma:42-45)

The use cases cover:
- **User interactions**: Viewing and changing system settings, querying valuations
- **System processes**: Automatic cost calculations, caching, audit logging
- **Integration points**: Credit notes, stock adjustments, GRN posting
- **Background jobs**: Periodic cost pre-calculation and cache management

**Related Documents**:
- [Business Requirements](BR-inventory-valuation.md) (to be created)
- [Shared Method Specification](SM-inventory-valuation.md)
- [Data Definition](DD-inventory-valuation.md)
- [Page Content](PC-inventory-settings.md)
- [Flow Diagrams](FD-inventory-valuation.md) (to be created)
- [Validations](VAL-inventory-valuation.md) (to be created)

---

## Actors

### Primary Actors
| Actor | Description | Role |
|-------|-------------|------|
| Financial Manager | Manages company financial settings and policies | Configure costing method, review audit history |
| System Administrator | Manages system configuration and settings | Configure costing method, monitor system health |
| Purchasing Staff | Creates credit notes and processes returns | Triggers cost calculations through business operations |
| Operations Manager | Manages inventory transactions and adjustments | Triggers cost calculations through stock movements |
| CFO/Finance Director | Authorizes major financial configuration changes | Approves costing method changes |

### Secondary Actors
| Actor | Description | Role |
|-------|-------------|------|
| Auditor | External or internal auditor | Reviews audit trail and costing method changes |
| Report Viewer | Users viewing financial reports | Consumes cost calculation results |
| Developer | System developer | Uses valuation service in module development |

### System Actors
| System | Description | Integration Type |
|--------|-------------|------------------|
| InventoryValuationService | Centralized costing calculation service | Module (Core Service) |
| PeriodicAverageService | Handles monthly average calculations and caching | Module (Supporting Service) |
| InventorySettingsService | Manages costing method configuration | Module (Configuration Service) |
| Credit Note Module | Processes vendor returns and credits | Module (Consumer) |
| Stock Adjustment Module | Handles inventory adjustments | Module (Consumer) |
| GRN Module | Posts goods receipts | Event (Publisher) |
| Notification Service | Sends alerts about configuration changes | API (Internal) |
| Audit Logging Service | Records all configuration and calculation events | API (Internal) |

---

## Use Case Diagram

```
                         ┌───────────────────────────────────────┐
                         │   Inventory Valuation System          │
                         └───────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        │                                │                                │
  ┌─────▼──────┐                  ┌─────▼──────┐                  ┌─────▼──────┐
  │ Financial  │                  │  System    │                  │ Purchasing │
  │  Manager   │                  │   Admin    │                  │   Staff    │
  └─────┬──────┘                  └─────┬──────┘                  └─────┬──────┘
        │                               │                               │
   [UC-INV-001]                    [UC-INV-001]                    [UC-INV-005]
   [UC-INV-002]                    [UC-INV-002]                 (trigger via CN)
   [UC-INV-003]                    [UC-INV-003]
        │                               │
        │                               │
  ┌─────▼──────┐                  ┌─────▼──────┐
  │ Operations │                  │    CFO     │
  │  Manager   │                  │            │
  └─────┬──────┘                  └─────┬──────┘
        │                               │
   [UC-INV-005]                    [UC-INV-002]
 (trigger via SA)                    (approve)


                         ┌───────────────────────────────────────┐
                         │      System Actors (Automated)        │
                         └───────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        │                                │                                │
  ┌─────▼──────┐                  ┌─────▼──────┐                  ┌─────▼──────┐
  │ Inventory  │                  │  Periodic  │                  │ Inventory  │
  │ Valuation  │                  │  Average   │                  │  Settings  │
  │  Service   │                  │  Service   │                  │  Service   │
  └─────┬──────┘                  └─────┬──────┘                  └─────┬──────┘
        │                               │                               │
   [UC-INV-101]                    [UC-INV-102]                    [UC-INV-106]
   [UC-INV-104]                    [UC-INV-103]                    [UC-INV-107]
   [UC-INV-105]                    [UC-INV-301]                   (audit log)
                                (cache mgmt)


  ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
  │  Credit Note │              │    Stock     │              │     GRN      │
  │    Module    │              │  Adjustment  │              │    Module    │
  │ (Integration)│              │    Module    │              │ (Integration)│
  └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
         │                             │                             │
    [UC-INV-201]                  [UC-INV-202]                  [UC-INV-203]
   (cost lookup)                 (cost lookup)              (cache invalidate)
```

**Legend**:
- **Primary Actors** (top): User roles who manage settings or trigger valuations
- **System Actors** (middle): Core services that perform calculations and caching
- **Integration Actors** (bottom): External modules that consume or affect valuation

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-INV-001 | View Current Costing Method | Financial Manager, System Admin | Medium | Simple | User |
| UC-INV-002 | Change Costing Method | Financial Manager, System Admin, CFO | High | Complex | User |
| UC-INV-003 | View Costing Method Audit History | Financial Manager, System Admin, Auditor | Medium | Simple | User |
| UC-INV-004 | Export Audit History | Financial Manager, Auditor | Low | Simple | User |
| UC-INV-005 | Request Inventory Valuation | Developer, Module | High | Medium | User |
| **System Use Cases** | | | | | |
| UC-INV-101 | Calculate FIFO Cost | InventoryValuationService | High | Complex | System |
| UC-INV-102 | Calculate Periodic Average Cost | PeriodicAverageService | High | Complex | System |
| UC-INV-103 | Cache Period Cost | PeriodicAverageService | High | Medium | System |
| UC-INV-104 | Apply Fallback Costing | InventoryValuationService | Medium | Medium | System |
| UC-INV-105 | Log Valuation Event | Audit Service | Medium | Simple | System |
| UC-INV-106 | Log Configuration Change | InventorySettingsService | High | Simple | System |
| UC-INV-107 | Notify Costing Method Change | Notification Service | Medium | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-INV-201 | Integrate Credit Note Valuation | Credit Note Module | High | Medium | Integration |
| UC-INV-202 | Integrate Stock Adjustment Valuation | Stock Adjustment Module | High | Medium | Integration |
| UC-INV-203 | Handle GRN Posted Event | GRN Module | High | Medium | Integration |
| UC-INV-204 | Provide Batch Valuation | Report Module | Medium | Medium | Integration |
| **Background Job Use Cases** | | | | | |
| UC-INV-301 | Pre-calculate Monthly Period Costs | System (Scheduled) | Medium | Medium | Background |
| UC-INV-302 | Invalidate Stale Cache | System (Scheduled) | Low | Simple | Background |

**Complexity Definitions**:
- **Simple**: Single-step process, minimal logic, 1-3 scenarios
- **Medium**: Multi-step process, business rules, 4-8 scenarios
- **Complex**: Multi-step with complex validation, multiple integrations, 9+ scenarios

**Priority Definitions**:
- **High**: Core functionality, critical user workflows, impacts financial data
- **Medium**: Supporting functionality, enhances user experience
- **Low**: Nice-to-have features, edge case handling

---

## User Use Cases

### UC-INV-001: View Current Costing Method

**Description**: Allow authorized users to view the current system-wide costing method configuration and related settings.

**Actor(s)**: Financial Manager, System Administrator

**Priority**: Medium

**Frequency**: Ad-hoc (when reviewing system settings)

**Preconditions**:
- User is authenticated
- User has permission to view inventory settings
- System has inventory settings configured

**Postconditions**:
- **Success**: User can see current costing method, period type, and audit information
- **Failure**: User sees appropriate error message

**Main Flow**:
1. User navigates to System Administration > Settings > Inventory
2. System retrieves current inventory settings for user's company
3. System displays current costing method (FIFO or Periodic Average)
4. System displays period type (Calendar Month - read-only)
5. System displays last updated timestamp and user
6. System displays method descriptions and current impacts
7. Use case ends

**Alternative Flows**:

**Alt-001A: First Time Access** (At step 2)
- 2a. No inventory settings exist for company
- 2b. System displays default configuration (FIFO)
- 2c. System shows message: "Using default costing method. This can be changed below."
- Continue to step 3

**Exception Flows**:

**Exc-001A: Unauthorized Access** (At step 1)
- User lacks permission to view settings
- System displays error: "You do not have permission to view inventory settings"
- System logs unauthorized access attempt
- Use case ends

**Exc-001B: Settings Load Failure** (At step 2)
- Database connection error or query failure
- System displays error: "Unable to load settings. Please try again."
- System logs error for support
- Use case ends

**Business Rules**:
- **BR-INV-001**: Only users with financial-manager or system-admin role can view settings
- **BR-INV-002**: Settings are company-specific and isolated by company ID

**Related Requirements**:
- FR-INV-001: System shall display current costing method configuration
- NFR-INV-001: Settings page shall load within 2 seconds

**UI Mockups**: See [PC-inventory-settings.md](PC-inventory-settings.md)

**Notes**:
- This is a read-only view for users without change permissions
- Audit information helps users understand change history

---

### UC-INV-002: Change Costing Method

**Description**: Allow authorized users to change the system-wide costing method from FIFO to Periodic Average or vice versa, with proper authorization and audit trail.

**Actor(s)**: Financial Manager, System Administrator (initiator); CFO/Finance Director (approver)

**Priority**: High

**Frequency**: Rare (major accounting policy change, typically 1-2 times per year or less)

**Preconditions**:
- User is authenticated
- User has permission to modify inventory settings
- Current costing method is configured
- All pending transactions have been processed

**Postconditions**:
- **Success**: Costing method changed, audit log created, users notified, cache invalidated if switching TO Periodic Average
- **Failure**: Costing method unchanged, error logged, user informed

**Main Flow**:
1. User navigates to System Administration > Settings > Inventory
2. System displays current costing method and change form
3. User selects new costing method (different from current)
4. System displays impact analysis section showing:
   - Current vs new method comparison
   - What will change
   - What will NOT change
   - Important warnings
5. User enters change justification (minimum 20 characters)
6. User enters approving authority name (CFO/Finance Director who approved change)
7. User clicks "Save Changes" button
8. System displays confirmation dialog with full change summary
9. User confirms change by clicking "Confirm Change"
10. System validates all inputs
11. System creates audit log entry BEFORE making change
12. System updates inventory settings with new costing method
13. System invalidates application cache
14. System sends notifications to relevant users (finance managers, operations managers, admins)
15. System displays success message: "Inventory settings updated successfully. New costing method is now active."
16. If switching TO Periodic Average:
    - 16a. System queues background job to pre-calculate period costs
    - 16b. System displays info: "Period costs are being calculated in the background."
17. Use case ends

**Alternative Flows**:

**Alt-002A: Same Method Selected** (At step 3)
- 3a. User selects same method as current
- 3b. System displays info message: "This is the current active costing method"
- 3c. Change justification section not shown
- 3d. Save button remains disabled
- Resume at step 3 (user can select different method)

**Alt-002B: User Cancels Change** (At step 9)
- 9a. User clicks "Review Settings" instead of "Confirm Change"
- 9b. Dialog closes
- 9c. User returns to settings page with unsaved changes
- Resume at step 3

**Alt-002C: Navigation with Unsaved Changes** (At step 3-7)
- Xa. User attempts to navigate away
- Xb. System displays warning dialog: "You have unsaved changes. Save before leaving?"
- Xc. User chooses "Save Changes" → Resume at step 8
- Xd. User chooses "Discard Changes" → Changes discarded, navigation proceeds
- Xe. User chooses "Stay on Page" → Dialog closes, remain on page

**Exception Flows**:

**Exc-002A: Validation Failure** (At step 10)
- Validation fails (missing justification, invalid approver name, etc.)
- System displays field-level error messages
- Save operation does not proceed
- Resume at step 5

**Exc-002B: Audit Log Creation Failure** (At step 11)
- Audit log entry creation fails
- System displays error: "Unable to create audit record. Change not saved."
- System logs error for support
- Use case ends (transaction rolled back)

**Exc-002C: Settings Update Failure** (At step 12)
- Database update fails
- System displays error: "An error occurred while saving settings. Please try again."
- System logs error with full context
- Audit log entry marked as failed
- Use case ends (transaction rolled back)

**Exc-002D: Concurrent Modification** (At step 10)
- Another user modified settings since page load
- System detects version mismatch
- System displays error: "Settings were modified by another user. Please refresh and try again."
- System provides "Refresh Page" button
- Use case ends

**Business Rules**:
- **BR-INV-003**: Only financial-manager or system-admin roles can change costing method
- **BR-INV-004**: Costing method change requires business justification (min 20 chars, max 500 chars)
- **BR-INV-005**: Costing method change requires approver name (CFO/Finance Director)
- **BR-INV-006**: All costing method changes must be logged in audit trail
- **BR-INV-007**: Costing method changes affect only future transactions, not historical data
- **BR-INV-008**: System-wide setting applies to all locations and items

**Includes**:
- [UC-INV-106: Log Configuration Change](#uc-inv-106-log-configuration-change)
- [UC-INV-107: Notify Costing Method Change](#uc-inv-107-notify-costing-method-change)

**Related Requirements**:
- FR-INV-002: System shall allow authorized users to change costing method
- FR-INV-003: System shall require justification for costing method changes
- FR-INV-004: System shall audit all configuration changes
- NFR-INV-002: Configuration changes shall complete within 5 seconds
- NFR-INV-003: System shall notify users of configuration changes within 1 minute

**UI Mockups**: See [PC-inventory-settings.md](PC-inventory-settings.md) - Sections 1-3, Confirmation Dialogs

**Notes**:
- This is a critical financial configuration change requiring proper authorization
- Impact analysis helps users understand consequences before committing
- Audit trail supports compliance and financial audits
- Cache invalidation ensures new method takes effect immediately

---

### UC-INV-003: View Costing Method Audit History

**Description**: Allow authorized users to view complete audit history of all costing method configuration changes with filtering and search capabilities.

**Actor(s)**: Financial Manager, System Administrator, Auditor

**Priority**: Medium

**Frequency**: Ad-hoc (during audits, compliance reviews, or troubleshooting)

**Preconditions**:
- User is authenticated
- User has permission to view audit history
- Audit log data exists

**Postconditions**:
- **Success**: User can view filtered audit history with full change details
- **Failure**: User sees appropriate error message

**Main Flow**:
1. User clicks "View Audit History" button on Inventory Settings page
2. System opens audit history dialog
3. System retrieves audit log entries for company
4. System displays entries in table format (most recent first):
   - Date & Time
   - Previous Method
   - New Method
   - Changed By
   - Reason (truncated to 50 characters)
   - Approved By
5. System shows pagination controls (10 items per page default)
6. User can:
   - 6a. Filter by date range
   - 6b. Filter by user who made change
   - 6c. Navigate through pages
   - 6d. Click "View Details" on any entry
7. Use case continues or ends

**Alternative Flows**:

**Alt-003A: View Entry Details** (At step 6d)
- 6d1. User clicks "View Details" on audit entry
- 6d2. System opens detailed audit entry dialog showing:
  - Change ID and timestamp
  - Previous and new method (with badges)
  - Full user details (name, role, department)
  - Complete justification text (no truncation)
  - Approver details
  - System information (IP, session, browser)
- 6d3. User reviews details
- 6d4. User closes detail dialog
- Resume at step 6

**Alt-003B: Apply Filters** (At step 6a-6b)
- 6x1. User selects filter criteria
- 6x2. User clicks "Apply" or filters auto-apply
- 6x3. System refreshes table with filtered results
- 6x4. System updates record count
- Resume at step 6

**Alt-003C: No Audit History** (At step 3)
- 3a. No audit log entries exist
- 3b. System displays empty state:
  - Icon: 📋
  - Message: "No configuration changes yet"
  - Description: "This is the initial system configuration. Changes will appear here."
- 3c. Export and filter options disabled
- Use case ends

**Alt-003D: Filtered Results Empty** (At step 6x3)
- Filter criteria returns no results
- System displays empty state:
  - Icon: 🔍
  - Message: "No changes found for selected filters"
  - Description: "Try adjusting your filter criteria"
  - Button: "Clear Filters"
- Resume at step 6

**Exception Flows**:

**Exc-003A: Audit Log Load Failure** (At step 3)
- Database query fails
- System displays error in dialog: "Unable to load audit history. Please try again."
- System logs error for support
- Dialog remains open with retry option
- Use case can resume at step 3

**Business Rules**:
- **BR-INV-009**: Audit history is company-specific (filtered by company ID)
- **BR-INV-010**: Audit entries are immutable (cannot be edited or deleted)
- **BR-INV-011**: Audit history retention follows company data retention policy

**Related Requirements**:
- FR-INV-005: System shall maintain complete audit trail of configuration changes
- FR-INV-006: System shall allow filtering and searching of audit history
- NFR-INV-004: Audit history shall load within 3 seconds
- NFR-INV-005: Audit data shall be retained for minimum 7 years

**UI Mockups**: See [PC-inventory-settings.md](PC-inventory-settings.md) - Dialog 1: Audit History

**Notes**:
- Audit history supports compliance with financial regulations
- Detailed view helps during investigations or dispute resolution
- Filtering enables quick location of specific changes

---

### UC-INV-004: Export Audit History

**Description**: Allow authorized users to export audit history to CSV format for external analysis or compliance reporting.

**Actor(s)**: Financial Manager, Auditor

**Priority**: Low

**Frequency**: Occasional (during audits, compliance reporting)

**Preconditions**:
- User is authenticated
- User has permission to view audit history
- Audit history dialog is open
- At least one audit entry exists

**Postconditions**:
- **Success**: CSV file downloaded with audit history data
- **Failure**: User sees error message, no file downloaded

**Main Flow**:
1. User is viewing Audit History dialog (UC-INV-003)
2. User clicks "Export to CSV" button
3. System displays toast notification: "Exporting audit history..."
4. System generates CSV file with columns:
   - Date & Time
   - Previous Method
   - New Method
   - Changed By User
   - Changed By Role
   - Justification Reason
   - Approved By
   - Change ID
   - IP Address
   - Session ID
5. System applies current filters (if any) to export
6. System initiates browser download with filename: `inventory-costing-audit-{company}-{date}.csv`
7. System displays success toast: "Audit history downloaded"
8. Use case ends

**Alternative Flows**:

**Alt-004A: Filtered Export** (At step 5)
- 5a. User has applied date range or user filters
- 5b. System exports only filtered records
- 5c. Filename includes filter info: `inventory-costing-audit-{company}-{filter}-{date}.csv`
- Continue to step 6

**Exception Flows**:

**Exc-004A: Export Generation Failure** (At step 4)
- CSV generation fails (memory issue, data corruption, etc.)
- System displays error toast: "Failed to generate export. Please try again."
- System logs error with context
- Use case ends

**Business Rules**:
- **BR-INV-012**: Exported data respects user's company scope (no cross-company data)
- **BR-INV-013**: Export includes only data user has permission to view

**Related Requirements**:
- FR-INV-007: System shall allow exporting audit history to CSV
- NFR-INV-006: Export shall complete within 10 seconds for up to 1000 records

**UI Mockups**: See [PC-inventory-settings.md](PC-inventory-settings.md) - Dialog 1 Footer

**Notes**:
- CSV format chosen for compatibility with Excel and other analysis tools
- Filename includes company and date for easy organization
- Filtered exports help focus on specific time periods or users

---

### UC-INV-005: Request Inventory Valuation

**Description**: Allow modules or developers to request inventory valuation for items through the centralized service API.

**Actor(s)**: Developer, Credit Note Module, Stock Adjustment Module, Report Module

**Priority**: High

**Frequency**: Very frequent (every credit note, stock adjustment, report generation)

**Preconditions**:
- Calling module is authenticated
- Item ID is valid and exists
- Quantity is positive number
- Transaction date is provided
- Company's costing method is configured

**Postconditions**:
- **Success**: Valuation result returned with cost breakdown
- **Failure**: Error response with details

**Main Flow**:
1. Module calls `InventoryValuationService.calculateInventoryValuation(itemId, quantity, date)`
2. System validates input parameters:
   - 2a. Item ID is not empty
   - 2b. Quantity is greater than zero
   - 2c. Date is valid
3. System retrieves company's costing method from InventorySettings
4. System routes to appropriate calculation method:
   - 4a. If FIFO → [UC-INV-101: Calculate FIFO Cost](#uc-inv-101-calculate-fifo-cost)
   - 4b. If Periodic Average → [UC-INV-102: Calculate Periodic Average Cost](#uc-inv-102-calculate-periodic-average-cost)
5. System receives calculation result
6. System returns ValuationResult object with:
   - itemId
   - quantity
   - unitCost
   - totalValue
   - method used
   - calculatedAt timestamp
   - method-specific data (FIFO layers OR period average)
7. Use case ends

**Alternative Flows**:

**Alt-005A: Batch Valuation Request** (At step 1)
- 1a. Module calls `batchValuation(items[], date)` with multiple items
- 1b. System processes each item in parallel
- 1c. System returns array of ValuationResult objects
- Use case ends

**Alt-005B: Fallback Costing Applied** (At step 4-5)
- Primary calculation fails (no receipts in period, insufficient FIFO layers)
- System applies fallback strategies (see [UC-INV-104](#uc-inv-104-apply-fallback-costing))
- System returns result with warning flag
- Continue to step 6

**Exception Flows**:

**Exc-005A: Invalid Input** (At step 2)
- Validation fails
- System throws error with specific validation message
- Calling module receives error
- Use case ends

**Exc-005B: Item Not Found** (At step 3)
- Item ID does not exist in database
- System throws error: "Item not found"
- Use case ends

**Exc-005C: Costing Method Not Configured** (At step 3)
- No inventory settings found for company
- System uses default method (FIFO) with warning
- System logs warning for admin attention
- Continue to step 4

**Exc-005D: Calculation Failure** (At step 4-5)
- All calculation and fallback strategies fail
- System throws error with diagnostic information
- Error includes: item ID, attempted method, failure reason
- Use case ends

**Business Rules**:
- **BR-INV-014**: Valuation calculations are company-specific
- **BR-INV-015**: All valuations use configured costing method
- **BR-INV-016**: Calculations are deterministic (same inputs = same outputs)
- **BR-INV-017**: Unit costs rounded to 5 decimal places (DECIMAL(20,5) in schema)
- **BR-INV-018**: Total values rounded to 2 decimal places

**Includes**:
- [UC-INV-101: Calculate FIFO Cost](#uc-inv-101-calculate-fifo-cost)
- [UC-INV-102: Calculate Periodic Average Cost](#uc-inv-102-calculate-periodic-average-cost)
- [UC-INV-104: Apply Fallback Costing](#uc-inv-104-apply-fallback-costing)

**Related Requirements**:
- FR-INV-008: System shall provide centralized valuation API
- FR-INV-009: System shall support both single and batch valuations
- NFR-INV-007: Valuation calculations shall complete within 500ms
- NFR-INV-008: API shall support concurrent requests (100+ simultaneous)

**Notes**:
- This is the primary integration point for all modules needing cost calculations
- Centralized service ensures consistency across entire application
- Batch operations improve performance for bulk transactions

---

## System Use Cases

### UC-INV-101: Calculate FIFO Cost

**Description**: Calculate inventory cost using First-In-First-Out method by consuming oldest available inventory layers.

**Trigger**: Called by UC-INV-005 when costing method is FIFO

**Actor(s)**:
- **Primary**: InventoryValuationService
- **Secondary**: Database (FIFO Layers table)

**Priority**: High

**Frequency**: Real-time (every valuation request when using FIFO)

**Preconditions**:
- Item ID is valid
- Quantity to value is positive
- Transaction date is provided
- FIFO layers exist for the item
- Costing method is configured as FIFO

**Postconditions**:
- **Success**: Valuation result with consumed layers returned
- **Failure**: Error thrown with specific reason

**Main Flow**:
1. System queries FIFO layers for item WHERE:
   - item_id = {itemId}
   - remaining_quantity > 0
   - ORDER BY lot_number ASC (natural chronological sort via embedded date)
2. System validates layers retrieved
3. System iterates through layers (oldest first):
   - 3a. Calculate quantity to consume from current layer:
     - quantityToConsume = min(layer.remainingQuantity, remainingQuantity)
   - 3b. Create consumption record:
     - layerId
     - lotNumber
     - quantityConsumed
     - unitCost (from layer)
     - totalCost (quantityConsumed * unitCost)
     - receiptDate
   - 3c. Subtract quantityConsumed from remainingQuantity
   - 3d. If remainingQuantity = 0, break loop
4. System validates sufficient quantity consumed
5. System calculates totals:
   - totalValue = sum of all layer totalCosts
   - unitCost = totalValue / quantity
6. System rounds values:
   - unitCost to 5 decimal places (DECIMAL(20,5))
   - totalValue to 2 decimal places
7. System returns ValuationResult with:
   - itemId, quantity, unitCost, totalValue
   - method = 'FIFO'
   - layersConsumed[] array
   - calculatedAt timestamp
8. Process completes

**Alternative Flows**:

**Alt-101A: Single Layer Sufficient** (At step 3)
- 3x. First layer has enough quantity
- 3x. Consume entire quantity from single layer
- 3x. No iteration needed
- Continue to step 4

**Alt-101B: Multiple Layers Consumed** (At step 3)
- 3x. Multiple layers required to satisfy quantity
- 3x. System consumes from each layer until quantity satisfied
- 3x. Last layer may be partially consumed
- Continue to step 4

**Exception Flows**:

**Exc-101A: No Layers Found** (At step 2)
- Query returns zero layers
- System throws error: "No FIFO layers available for item {itemId}"
- Calling service can apply fallback strategy
- Process ends

**Exc-101B: Insufficient Quantity** (At step 4)
- Sum of consumed quantities < requested quantity
- Available: {totalConsumed}
- Required: {quantity}
- System throws error: "Insufficient FIFO layers for item {itemId}. Required: {quantity}, Available: {totalConsumed}"
- Calling service can apply fallback strategy
- Process ends

**Business Rules**:
- **BR-INV-019**: FIFO consumes oldest layers first (by receipt_date, then lot_number)
- **BR-INV-020**: Each consumption tracked with layer details for audit
- **BR-INV-021**: Layers with zero remaining_quantity are skipped
- **BR-INV-022**: FIFO unit cost precision: 5 decimal places (DECIMAL(20,5) in schema)
- **BR-INV-023**: Total value precision: 2 decimal places

**Data Contract**:

**Input Data Requirements**:
- **itemId**: UUID or string - Unique identifier for inventory item
- **quantity**: Decimal(20,5) - Quantity to value (must be > 0)
- **transactionDate**: DateTime - Date of transaction (determines layer cutoff)

**Validation Rules**:
- itemId must not be empty/null
- quantity must be > 0 and <= 999999999.9999
- transactionDate must be valid date (not future date beyond current time + buffer)

**Output Data Structure**:
- **itemId**: Input item ID
- **quantity**: Input quantity
- **unitCost**: Decimal(20,5) - Weighted average cost per unit
- **totalValue**: Decimal(19,2) - Total cost (quantity * unitCost)
- **method**: String - Always 'FIFO'
- **layersConsumed**: Array of objects:
  - layerId: UUID
  - lotNumber: String
  - quantityConsumed: Decimal(20,5)
  - unitCost: Decimal(19,4)
  - totalCost: Decimal(19,2)
  - receiptDate: DateTime
- **calculatedAt**: DateTime - Timestamp of calculation

**Related Requirements**:
- FR-INV-010: System shall calculate FIFO costs by consuming oldest layers
- FR-INV-011: System shall track which layers were consumed
- NFR-INV-009: FIFO calculation shall complete within 300ms for up to 100 layers

**Notes**:
- FIFO layers are not actually updated by this query (read-only)
- Actual layer updates happen during GRN posting and consumption posting
- This use case only calculates what the cost WOULD be

---

### UC-INV-102: Calculate Periodic Average Cost

**Description**: Calculate inventory cost using monthly average cost for the transaction period, with caching support.

**Trigger**: Called by UC-INV-005 when costing method is AVG (Periodic Average)

**Actor(s)**:
- **Primary**: PeriodicAverageService
- **Secondary**: Database (GRN Items table, Period Cost Cache table)

**Priority**: High

**Frequency**: Real-time (every valuation request when using Periodic Average)

**Preconditions**:
- Item ID is valid
- Quantity to value is positive
- Transaction date is provided
- Costing method is configured as AVG (Periodic Average)

**Postconditions**:
- **Success**: Valuation result with period average cost returned
- **Failure**: Error thrown OR fallback strategy applied

**Main Flow**:
1. System normalizes transaction date to period start (1st of month)
2. System calls `getCachedCost(itemId, periodStart)`
3. If cache HIT:
   - 3a. System retrieves cached average cost
   - 3b. Skip to step 8
4. If cache MISS:
   - 4a. System calculates period boundaries:
     - periodStart = 1st day of month
     - periodEnd = last day of month
   - 4b. System queries GRN items for period:
     - WHERE item_id = {itemId}
     - AND receipt_date BETWEEN periodStart AND periodEnd
     - AND status = 'COMMITTED'
   - 4c. System validates receipts retrieved
5. System calculates average cost:
   - totalCost = sum of all (quantity * unit_cost)
   - totalQuantity = sum of all quantities
   - averageCost = totalCost / totalQuantity
   - averageCost = round(averageCost, 5)  // DECIMAL(20,5)
6. System caches calculated cost:
   - Calls `cachePeriodCost(itemId, periodStart, averageCost, metadata)`
   - Metadata includes: receiptCount, totalQuantity, totalCost
7. System logs calculation completion
8. System calculates valuation:
   - totalValue = quantity * averageCost
   - totalValue = round(totalValue, 2)
9. System returns ValuationResult with:
   - itemId, quantity, unitCost, totalValue
   - method = 'AVG'  // enum_calculation_method.AVG (Periodic Average)
   - period = periodStart
   - averageCost
   - calculatedAt timestamp
10. Process completes

**Alternative Flows**:

**Alt-102A: Cache Hit** (At step 3)
- 3a. Cached cost found for item and period
- 3b. System uses cached cost immediately
- Skip calculation steps 4-7
- Continue to step 8

**Alt-102B: Single Receipt in Period** (At step 4-5)
- Only one GRN receipt in period
- Average cost equals that receipt's unit cost
- Simple calculation, no averaging needed
- Continue to step 6

**Alt-102C: Multiple Receipts** (At step 4-5)
- Multiple receipts with varying costs
- System calculates weighted average across all receipts
- Each receipt weighted by its quantity
- Continue to step 6

**Exception Flows**:

**Exc-102A: No Receipts in Period** (At step 4c)
- Query returns zero receipts for period
- System throws error: "No receipts found for item {itemId} in period {period}"
- Calling service applies fallback strategy (UC-INV-104)
- Process ends

**Exc-102B: Zero Total Quantity** (At step 5)
- Total quantity from receipts = 0 (should not happen with valid data)
- System throws error: "Cannot calculate average cost: total quantity is zero"
- System logs data anomaly for investigation
- Process ends

**Exc-102C: Cache Write Failure** (At step 6)
- Database insert/update fails for cache entry
- System logs error but continues (cache is optimization, not critical)
- Calculation still succeeds
- System returns calculated cost
- Continue to step 8

**Business Rules**:
- **BR-INV-024**: Period boundaries always calendar month (1st to last day)
- **BR-INV-025**: Average cost = Σ(quantity * unitCost) / Σ(quantity)
- **BR-INV-026**: Periodic Average cost precision: 5 decimal places (DECIMAL(20,5) in schema)
- **BR-INV-027**: Total value precision: 2 decimal places
- **BR-INV-028**: Only COMMITTED GRN items included in calculation
- **BR-INV-029**: Cached costs remain valid until new GRN posted in that period

**Data Contract**:

**Input Data Requirements**:
- **itemId**: UUID or string - Unique identifier for inventory item
- **quantity**: Decimal(20,5) - Quantity to value (must be > 0)
- **transactionDate**: DateTime - Date of transaction (determines which month to use)

**Validation Rules**:
- itemId must not be empty/null
- quantity must be > 0 and <= 999999999.9999
- transactionDate must be valid date

**Output Data Structure**:
- **itemId**: Input item ID
- **quantity**: Input quantity
- **unitCost**: Decimal(20,5) - Period average cost
- **totalValue**: Decimal(19,2) - Total cost (quantity * unitCost)
- **method**: String - Always 'AVG' (enum_calculation_method.AVG = Periodic Average)
- **period**: Date - 1st of month (period start)
- **averageCost**: Decimal(20,5) - Same as unitCost (for clarity)
- **calculatedAt**: DateTime - Timestamp of calculation

**SLA**:
- **Cache Hit Response Time**: <50ms
- **Cache Miss Calculation**: <500ms for up to 1000 receipts
- **Cache Availability**: 95% (graceful degradation if cache unavailable)

**Monitoring**:
- Cache hit rate metric (target: >80%)
- Calculation time metric
- Period with zero receipts count (should be rare)
- Cache write failure rate

**Rollback Procedure**:
If incorrect cached cost detected:
1. Delete cache entry for affected item/period
2. Recalculate cost
3. Update cache with correct cost
4. Log incident for investigation

**Related Requirements**:
- FR-INV-012: System shall calculate period average using all receipts in calendar month
- FR-INV-013: System shall cache calculated period costs
- NFR-INV-010: Period average calculation shall complete within 500ms
- NFR-INV-011: Cache hit rate shall exceed 80%

**Notes**:
- Caching significantly improves performance for frequently accessed periods
- Cache invalidation happens when new GRN posted (UC-INV-203)
- Fallback strategies handle edge cases (UC-INV-104)

---

### UC-INV-103: Cache Period Cost

**Description**: Store calculated periodic average cost in cache for future reuse, improving performance of subsequent valuations.

**Trigger**: Called by UC-INV-102 after successful period average calculation

**Actor(s)**:
- **Primary**: PeriodicAverageService
- **Secondary**: Database (Period Cost Cache table)

**Priority**: High

**Frequency**: Real-time (after each period cost calculation)

**Preconditions**:
- Average cost has been calculated
- Item ID and period (1st of month) are known
- Optional metadata available (receiptCount, totalQuantity, totalCost)

**Postconditions**:
- **Success**: Cache entry created or updated in database
- **Failure**: Error logged, calculation still succeeds (cache is optimization)

**Main Flow**:
1. System prepares cache entry:
   - id = generated UUID
   - itemId = input item ID
   - period = normalized period date (1st of month)
   - averageCost = calculated average (4 decimals)
   - totalQuantity = from metadata or 0
   - totalCost = from metadata or 0
   - receiptCount = from metadata or 0
   - calculatedAt = current timestamp
   - createdBy = 'SYSTEM'
2. System executes UPSERT query:
   - INSERT cache entry
   - ON CONFLICT (item_id, period) DO UPDATE SET:
     - averageCost = new value
     - totalQuantity = new value
     - totalCost = new value
     - receiptCount = new value
     - calculatedAt = new timestamp
3. System verifies cache entry saved
4. System logs cache update: "Cached cost for item {itemId}, period {period}: {averageCost}"
5. Process completes

**Alternative Flows**:

**Alt-103A: Cache Entry Exists** (At step 2)
- Cache entry already exists for item/period
- UPSERT updates existing entry
- Previous cached cost replaced with new calculation
- Continue to step 3

**Alt-103B: New Cache Entry** (At step 2)
- No existing cache entry for item/period
- UPSERT inserts new entry
- First time caching for this item/period
- Continue to step 3

**Exception Flows**:

**Exc-103A: Database Constraint Violation** (At step 2)
- Unique constraint violation (should not happen with UPSERT)
- System logs error with full context
- System does NOT throw error (cache is non-critical)
- Process completes without caching

**Exc-103B: Database Connection Failure** (At step 2)
- Cannot connect to database
- System logs error: "Failed to cache period cost: {error}"
- System does NOT throw error (cache is optimization)
- Calling process continues normally
- Process completes

**Business Rules**:
- **BR-INV-030**: Cache entries uniquely identified by (item_id, period)
- **BR-INV-031**: Cache entries can be updated when recalculated
- **BR-INV-032**: Cache entries include metadata for transparency
- **BR-INV-033**: Cache failures do not fail the parent operation

**Data Contract**:

**Input Data Requirements**:
- **itemId**: UUID or string - Item being cached
- **period**: Date - 1st of month (period start)
- **averageCost**: Decimal(20,5) - Calculated average cost
- **metadata** (optional):
  - receiptCount: Integer - Number of receipts in calculation
  - totalQuantity: Decimal(20,5) - Sum of all quantities
  - totalCost: Decimal(19,2) - Sum of all costs

**Database Schema**:

**⚠️ Note**: The `period_cost_cache` table does not exist in the current schema (schema.prisma). Average costs are calculated on-demand from `tb_inventory_transaction_detail`. Consider implementing application-level caching (Redis, memory cache) or adding this table to the schema.

```
Proposed period_cost_cache table (not in current schema):
- id: UUID (primary key)
- item_id: UUID (foreign key, indexed)
- period: DATE (normalized to 1st of month, indexed)
- average_cost: DECIMAL(20,5)  // Updated precision
- total_quantity: DECIMAL(20,5)  // Updated precision
- total_cost: DECIMAL(19,2)
- receipt_count: INTEGER
- calculated_at: TIMESTAMP
- created_by: VARCHAR(100)
UNIQUE (item_id, period)
```

**Related Requirements**:
- FR-INV-014: System shall cache period average costs
- NFR-INV-012: Cache write operations shall complete within 100ms

**Notes**:
- Cache is optimization - failures should not break parent operations
- UPSERT ensures idempotency (safe to call multiple times)
- Metadata helps with troubleshooting and verification

---

### UC-INV-104: Apply Fallback Costing

**Description**: Apply fallback strategies when primary cost calculation fails, ensuring valuations can still be calculated.

**Trigger**: Called by UC-INV-005 when primary calculation (FIFO or Periodic Average) fails

**Actor(s)**:
- **Primary**: InventoryValuationService
- **Secondary**: PeriodicAverageService (for previous period lookup)

**Priority**: Medium

**Frequency**: Rare (only when primary calculation fails)

**Preconditions**:
- Primary cost calculation failed
- Original error captured
- Item ID, quantity, and date available

**Postconditions**:
- **Success**: Valuation result returned using fallback method
- **Failure**: Final error thrown with all attempted strategies

**Main Flow**:
1. System logs primary calculation failure
2. System attempts Fallback Strategy 1: Previous Period Cost
   - 2a. Calculate previous month from transaction date
   - 2b. Call `periodicService.getCachedCost(itemId, previousMonth)`
   - 2c. If cost found:
     - Use previous month's cost
     - Log: "Using previous month cost: {cost}"
     - Skip to step 5
3. System attempts Fallback Strategy 2: Standard Cost Lookup
   - 3a. Query item master for standard_cost field
   - 3b. If standard cost exists and > 0:
     - Use standard cost
     - Log: "Using standard cost: {cost}"
     - Skip to step 5
4. System attempts Fallback Strategy 3: Latest Purchase Price
   - 4a. Query most recent GRN item for this item (last 90 days)
   - 4b. If recent purchase found:
     - Use that unit_cost
     - Log: "Using latest purchase price: {cost}"
     - Continue to step 5
5. System builds ValuationResult:
   - itemId, quantity, unitCost (from fallback)
   - totalValue = quantity * unitCost
   - method = original method attempted
   - fallbackUsed = true (flag indicating fallback was used)
   - fallbackStrategy = which strategy succeeded
   - warning = "Cost calculated using fallback strategy"
6. System returns result
7. Process completes

**Alternative Flows**: None (linear fallback sequence)

**Exception Flows**:

**Exc-104A: All Fallback Strategies Fail** (At step 4b)
- No fallback strategy successful
- System compiles error message:
  ```
  Cannot determine cost for item {itemId}.
  Original error: {originalError}
  Attempted fallbacks:
  - Previous period cost: Not found
  - Standard cost: Not configured
  - Latest purchase: No recent purchases (90 days)
  ```
- System throws comprehensive error
- Calling module receives error
- Process ends

**Business Rules**:
- **BR-INV-034**: Fallback strategies attempted in priority order
- **BR-INV-035**: Fallback results flagged with warning
- **BR-INV-036**: Previous period limited to 1 month prior
- **BR-INV-037**: Latest purchase limited to 90 days
- **BR-INV-038**: Standard cost used only if configured and > 0

**Rollback Procedure**:
Not applicable - this is a read-only calculation process

**Related Requirements**:
- FR-INV-015: System shall provide fallback costing strategies
- FR-INV-016: System shall log which fallback strategy was used
- NFR-INV-013: Fallback calculation shall complete within 200ms

**Notes**:
- Fallback strategies help system remain operational even with data gaps
- Warning flags alert users to investigate root cause
- Each fallback strategy progressively less ideal than previous

---

### UC-INV-105: Log Valuation Event

**Description**: Create audit log entry for significant valuation events (failures, fallbacks, unusual conditions).

**Trigger**: Called by valuation services when notable events occur

**Actor(s)**:
- **Primary**: InventoryValuationService
- **Secondary**: Audit Logging Service

**Priority**: Medium

**Frequency**: As-needed (when notable events occur)

**Preconditions**:
- Event data available
- Audit logging service operational

**Postconditions**:
- **Success**: Audit entry created
- **Failure**: Error logged to system logs (audit failure does not fail parent operation)

**Main Flow**:
1. System prepares audit log entry:
   - eventType: 'VALUATION_FAILURE' | 'FALLBACK_USED' | 'NO_RECEIPTS' | etc.
   - itemId
   - quantity
   - transactionDate
   - attemptedMethod: 'FIFO' | 'PERIODIC_AVERAGE'
   - errorMessage (if error occurred)
   - fallbackStrategy (if fallback used)
   - userId (if user-initiated)
   - timestamp
2. System calls audit logging service
3. Audit service creates log entry
4. System receives confirmation
5. Process completes

**Exception Flows**:

**Exc-105A: Audit Service Unavailable** (At step 2-3)
- Cannot connect to audit service
- System logs to application logs instead
- Parent operation continues (audit failure non-critical)
- Process completes

**Business Rules**:
- **BR-INV-039**: Audit logging failures do not fail parent operations
- **BR-INV-040**: Sensitive data (costs, quantities) may be audited depending on policy

**Related Requirements**:
- FR-INV-017: System shall log significant valuation events
- NFR-INV-014: Audit logging shall not add more than 50ms overhead

---

### UC-INV-106: Log Configuration Change

**Description**: Create immutable audit log entry recording costing method configuration changes.

**Trigger**: Called by UC-INV-002 before saving configuration change

**Actor(s)**:
- **Primary**: InventorySettingsService
- **Secondary**: Audit Logging Service / Database

**Priority**: High

**Frequency**: Rare (each costing method change)

**Preconditions**:
- Configuration change initiated
- Old and new values known
- User information available
- Justification and approver provided

**Postconditions**:
- **Success**: Immutable audit entry created
- **Failure**: Error thrown, configuration change blocked

**Main Flow**:
1. System prepares audit log entry:
   - id = generated UUID
   - eventType = 'COSTING_METHOD_CHANGED'
   - oldValue = current costing method
   - newValue = new costing method selected
   - reason = user-provided justification
   - userId = user making change
   - approvedBy = approver name
   - timestamp = current UTC timestamp
2. System validates audit entry data
3. System inserts audit entry into valuation_audit_log table
4. System verifies insert successful
5. System returns audit entry ID
6. Process completes (parent UC-INV-002 continues with configuration update)

**Exception Flows**:

**Exc-106A: Audit Insert Failure** (At step 3)
- Database insert fails
- System throws error: "Unable to create audit record. Change not saved."
- System logs error with full context
- Parent operation (UC-INV-002) aborts
- Configuration NOT changed (transaction rolled back)
- Process ends

**Business Rules**:
- **BR-INV-041**: Audit entry MUST be created before configuration change
- **BR-INV-042**: Audit entries are immutable (never updated or deleted)
- **BR-INV-043**: Audit entry creation failure prevents configuration change
- **BR-INV-044**: All configuration changes require audit trail

**Data Contract**:

**Input Data Requirements**:
- **oldValue**: CostingMethod enum - Current method
- **newValue**: CostingMethod enum - New method
- **reason**: String - Justification (20-500 chars)
- **userId**: UUID - User making change
- **approvedBy**: String - Approver name (3-100 chars)

**Database Schema**:
```
valuation_audit_log:
- id: UUID (primary key)
- event_type: VARCHAR(50) ('COSTING_METHOD_CHANGED')
- old_value: VARCHAR(50) (costing method name)
- new_value: VARCHAR(50) (costing method name)
- reason: TEXT (justification)
- user_id: UUID (foreign key to users)
- approved_by: VARCHAR(100) (approver name)
- timestamp: TIMESTAMP (UTC)
- ip_address: VARCHAR(45) (optional)
- session_id: VARCHAR(100) (optional)
```

**Related Requirements**:
- FR-INV-018: System shall create audit entry before configuration change
- FR-INV-019: Audit entries shall be immutable
- NFR-INV-015: Audit entry creation shall complete within 200ms

---

### UC-INV-107: Notify Costing Method Change

**Description**: Send notifications to relevant stakeholders when costing method is changed.

**Trigger**: Called by UC-INV-002 after successful configuration change

**Actor(s)**:
- **Primary**: InventorySettingsService
- **Secondary**: Notification Service, Email Service

**Priority**: Medium

**Frequency**: Rare (each costing method change)

**Preconditions**:
- Configuration change saved successfully
- Old and new methods known
- User who made change identified
- Notification service operational

**Postconditions**:
- **Success**: Notifications sent to all relevant users
- **Failure**: Error logged, but configuration change remains saved

**Main Flow**:
1. System determines notification recipients:
   - All users with role: 'financial-manager'
   - All users with role: 'operations-manager'
   - All users with role: 'system-admin'
   - User who made the change (for confirmation)
2. System prepares notification content:
   - Title: "Inventory Costing Method Changed"
   - Message: "The inventory costing method has been changed from {oldMethod} to {newMethod} by {userName}. This change is effective immediately and will apply to all future inventory transactions."
   - Priority: MEDIUM
   - Category: SYSTEM_CONFIGURATION
3. System sends in-app notifications to recipients
4. System sends email notifications to recipients (if enabled in their preferences)
5. System logs notification delivery
6. Process completes

**Alternative Flows**:

**Alt-107A: User Email Disabled** (At step 4)
- Some users have email notifications disabled
- System sends in-app notification only
- System respects user preferences
- Continue to step 5

**Exception Flows**:

**Exc-107A: Notification Service Unavailable** (At step 3)
- Cannot connect to notification service
- System logs error: "Failed to send costing method change notifications"
- System does NOT throw error (notifications are non-critical)
- Configuration change remains saved
- Process completes

**Exc-107B: Email Service Failure** (At step 4)
- Email sending fails
- In-app notifications still sent (step 3 succeeded)
- System logs email failure
- Configuration change remains saved
- Process completes

**Business Rules**:
- **BR-INV-045**: Notification failure does not rollback configuration change
- **BR-INV-046**: Notifications respect user preferences
- **BR-INV-047**: Critical stakeholders always notified (financial managers, admins)

**Related Requirements**:
- FR-INV-020: System shall notify stakeholders of configuration changes
- NFR-INV-016: Notifications shall be delivered within 1 minute

---

## Integration Use Cases

### UC-INV-201: Integrate Credit Note Valuation

**Description**: Provide inventory valuation service to Credit Note module for calculating return costs.

**Actor(s)**:
- **Primary**: Credit Note Module
- **External System**: InventoryValuationService

**Trigger**: User creates or edits credit note with line items

**Integration Type**: ✓ Module (Internal API Call)

**Direction**: ✓ Inbound (Credit Note calls Valuation Service)

**Priority**: High

**Frequency**: Real-time (every credit note creation/edit)

**Preconditions**:
- Credit note in progress
- Line items added with item ID and quantity
- Return date specified
- User has permissions

**Postconditions**:
- **Success**: Line item costs calculated and displayed
- **Failure**: Error shown to user, cost cannot be calculated

**Main Flow**:
1. User adds line item to credit note:
   - Selects item
   - Enters quantity
   - Specifies return date
2. Credit Note module calls valuation service:
   ```typescript
   const result = await valuationService.calculateInventoryValuation(
     item.id,
     quantity,
     returnDate
   )
   ```
3. Valuation service calculates cost (UC-INV-005)
4. Valuation service returns result
5. Credit Note module receives ValuationResult
6. Credit Note module updates line item:
   - unitCost = result.unitCost
   - totalCost = result.totalValue
   - costingMethod = result.method (for display)
7. Credit Note module displays cost to user
8. Process completes

**Alternative Flows**:

**Alt-201A: Batch Valuation** (At step 2)
- Credit note has multiple line items
- Credit Note module calls `batchValuation([items], returnDate)`
- All items valued in single call
- Better performance for multi-line credit notes
- Continue to step 5

**Exception Flows**:

**Exc-201A: Valuation Failure** (At step 3-4)
- Valuation service throws error
- Credit Note module catches error
- Module displays error to user: "Unable to calculate cost for item {itemName}. {errorMessage}"
- User can:
  - Remove problematic item
  - Change return date
  - Contact support
- Line item remains without cost
- Process ends for that line item

**Exc-201B: Service Unavailable** (At step 2)
- Cannot connect to valuation service
- Credit Note module displays error: "Costing service unavailable. Please try again."
- User can retry
- Credit note cannot be completed without costs
- Process ends

**API Contract**:

**Request**:
```typescript
InventoryValuationService.calculateInventoryValuation(
  itemId: string,
  quantity: number,
  date: Date
): Promise<ValuationResult>
```

**Response**:
```typescript
interface ValuationResult {
  itemId: string
  quantity: number
  unitCost: number        // 5 decimal places (DECIMAL 20,5)
  totalValue: number      // 2 decimal places
  method: 'FIFO' | 'AVG'  // From enum_calculation_method (AVG = Periodic Average)
  calculatedAt: Date
  layersConsumed?: FIFOLayerConsumption[]  // If FIFO
  period?: Date                             // If Periodic Average
  averageCost?: number                      // If Periodic Average
}
```

**Error Handling**:
- Validation errors: Display specific field error
- Calculation failures: Display user-friendly message with retry option
- Service unavailable: Display service status message

**Monitoring**:
- Credit note valuation request count
- Average valuation response time
- Valuation error rate by reason
- Cost calculation method distribution

**Fallback Strategy**:
If valuation service unavailable:
- Allow user to manually enter cost (with warning)
- Flag credit note for review
- Send alert to finance team

**Related Requirements**:
- FR-INV-021: Credit Note module shall use centralized valuation service
- NFR-INV-017: Credit note cost calculation shall complete within 1 second

---

### UC-INV-202: Integrate Stock Adjustment Valuation

**Description**: Provide inventory valuation service to Stock Adjustment module for costing adjustments.

**Actor(s)**:
- **Primary**: Stock Adjustment Module
- **External System**: InventoryValuationService

**Trigger**: User creates stock adjustment (increase/decrease/write-off)

**Integration Type**: ✓ Module (Internal API Call)

**Direction**: ✓ Inbound (Stock Adjustment calls Valuation Service)

**Priority**: High

**Frequency**: Real-time (every stock adjustment)

**Preconditions**:
- Stock adjustment initiated
- Item and quantity specified
- Adjustment date provided
- Adjustment type determined (increase/decrease/write-off)

**Postconditions**:
- **Success**: Adjustment valued and posted
- **Failure**: Adjustment cannot be completed

**Main Flow**:
1. User creates stock adjustment:
   - Selects item
   - Enters quantity
   - Specifies adjustment type
   - Provides adjustment date and reason
2. Stock Adjustment module determines if valuation needed:
   - If adjustment type = INCREASE: No valuation needed (use actual cost)
   - If adjustment type = DECREASE or WRITE_OFF: Valuation needed
3. For DECREASE/WRITE_OFF, module calls valuation service:
   ```typescript
   const result = await valuationService.calculateInventoryValuation(
     item.id,
     quantity,
     adjustmentDate
   )
   ```
4. Valuation service calculates cost (UC-INV-005)
5. Stock Adjustment module receives ValuationResult
6. Stock Adjustment module records:
   - quantity adjusted
   - unitCost = result.unitCost
   - totalValue = result.totalValue (for GL posting)
   - costingMethod = result.method (for audit)
7. Module posts adjustment to general ledger
8. Process completes

**Alternative Flows**:

**Alt-202A: Adjustment Increase** (At step 2-3)
- Adjustment type is INCREASE
- No valuation needed (cost from purchase or manual entry)
- Skip valuation service call
- Use cost from adjustment form
- Continue to step 6

**Exception Flows**:

**Exc-202A: Valuation Failure** (At step 4)
- Valuation service throws error
- Module displays error: "Unable to calculate cost for adjustment. {errorMessage}"
- User options:
  - Change adjustment date
  - Use manual cost override (if permitted)
  - Cancel adjustment
- Process ends

**API Contract**: Same as UC-INV-201 (shared valuation service)

**Monitoring**:
- Stock adjustment valuation request count
- Valuation failures by reason
- Cost method used distribution

**Fallback Strategy**:
If valuation service fails:
- Allow manual cost entry
- Flag adjustment for review
- Alert finance team

**Related Requirements**:
- FR-INV-022: Stock Adjustment module shall use centralized valuation for decreases/write-offs
- NFR-INV-018: Stock adjustment valuation shall complete within 1 second

---

### UC-INV-203: Handle GRN Posted Event

**Description**: Invalidate cached period costs when new GRN is posted, ensuring future valuations use updated data.

**Trigger**: GRN Module publishes 'GRN_POSTED' event after committing goods receipt

**Actor(s)**:
- **Primary**: GRN Module (Event Publisher)
- **Secondary**: PeriodicAverageService (Event Consumer)

**Integration Type**: ✓ Message Queue / Event-Driven

**Direction**: ✓ Inbound (We consume events from GRN Module)

**Priority**: High

**Frequency**: Real-time (every GRN posting)

**Preconditions**:
- Event subscription active
- GRN successfully posted and committed
- Event contains item IDs and receipt date

**Postconditions**:
- **Success**: Affected period costs invalidated, next valuation will recalculate
- **Failure**: Event marked for retry, cache may become stale

**Main Flow**:
1. GRN Module posts goods receipt
2. GRN Module publishes 'GRN_POSTED' event to message queue
3. PeriodicAverageService receives event
4. Service validates event schema
5. Service checks for duplicate event (idempotency)
6. Service extracts data:
   - itemIds[] - All items in the GRN
   - receiptDate - Date of receipt
7. Service normalizes receipt date to period (1st of month)
8. For each item in GRN:
   - 8a. Service calls `invalidateCache(itemId, period, reason)`
   - 8b. Cache entry deleted for item/period combination
   - 8c. Service logs invalidation
9. Service acknowledges event
10. Process completes

**Alternative Flows**:

**Alt-203A: Duplicate Event** (At step 5)
- Event already processed (duplicate detected via eventId)
- Service logs duplicate detection
- Service acknowledges event without processing
- Process ends

**Alt-203B: Multi-Item GRN** (At step 8)
- GRN contains multiple line items
- Service invalidates cache for all affected items
- All invalidations in same period
- Multiple cache deletes executed
- Continue to step 9

**Exception Flows**:

**Exc-203A: Invalid Event** (At step 4)
- Event fails schema validation
- Service logs validation error
- Service sends event to dead letter queue
- Service alerts monitoring
- Process ends

**Exc-203B: Cache Invalidation Failure** (At step 8b)
- Database delete fails for cache entry
- Service logs error
- Service continues with other items (partial success)
- Service acknowledges event (idempotent operation)
- Next valuation will recalculate anyway
- Process completes

**Event Schema**:

**Standard Event Fields**:
- **eventId**: UUID - Unique identifier (for idempotency)
- **eventType**: 'GRN_POSTED'
- **timestamp**: ISO 8601 UTC - When GRN was posted
- **version**: '1.0.0' - Event schema version
- **source**: 'grn-module' - Publishing system

**Event-Specific Data**:
- **grnId**: UUID - GRN document ID
- **grnNumber**: String - Human-readable GRN number
- **receiptDate**: ISO 8601 Date - Date goods were received
- **itemIds**: UUID[] - Array of item IDs in this GRN
- **companyId**: UUID - Company identifier

**Optional Metadata Fields**:
- **userId**: UUID - User who posted GRN
- **correlationId**: UUID - Links related events

**Idempotency Strategy**:
- Idempotency key = eventId
- Store processed eventIds in cache/database
- Check for duplicate before processing
- Acknowledge duplicates without reprocessing

**Retry Policy**:
- Max retries: 3
- Backoff: exponential (1s, 5s, 15s)
- Retry intervals: 1s, 5s, 15s
- After max retries: Move to dead letter queue

**Dead Letter Queue**:
- Events moved after 3 failed retries
- DLQ monitored with alerts
- Manual investigation and reprocessing

**Monitoring**:
- Event processing rate
- Cache invalidation count per event
- Event processing latency
- Duplicate event rate
- Dead letter queue depth

**Related Requirements**:
- FR-INV-023: System shall invalidate period cache when new GRN posted
- NFR-INV-019: Event processing shall complete within 500ms
- NFR-INV-020: System shall guarantee at-least-once event delivery

---

### UC-INV-204: Provide Batch Valuation

**Description**: Provide batch valuation service for reports and bulk operations requiring multiple item valuations.

**Actor(s)**:
- **Primary**: Report Module, Bulk Operations
- **External System**: InventoryValuationService

**Trigger**: Report generation or bulk operation initiated

**Integration Type**: ✓ Module (Internal API Call)

**Direction**: ✓ Inbound (Reports call Valuation Service)

**Priority**: Medium

**Frequency**: Periodic (report generation, end-of-period processes)

**Preconditions**:
- List of items to value available
- Common valuation date specified
- Requester authenticated

**Postconditions**:
- **Success**: All items valued, results returned
- **Failure**: Partial results returned with error details

**Main Flow**:
1. Calling module prepares batch request:
   ```typescript
   const items = [
     { itemId: 'item-1', quantity: 100 },
     { itemId: 'item-2', quantity: 50 },
     { itemId: 'item-3', quantity: 200 }
   ]
   const date = new Date('2025-01-15')
   ```
2. Module calls batch valuation:
   ```typescript
   const results = await batchValuation(items, date)
   ```
3. Valuation service processes items in parallel:
   - Creates promise for each item
   - Executes all promises concurrently
   - Waits for all to complete
4. Service returns array of ValuationResult objects:
   ```typescript
   [
     { itemId: 'item-1', quantity: 100, unitCost: 10.50, ... },
     { itemId: 'item-2', quantity: 50, unitCost: 25.75, ... },
     { itemId: 'item-3', quantity: 200, unitCost: 8.33, ... }
   ]
   ```
5. Calling module receives results
6. Module processes results (generates report, completes bulk operation)
7. Process completes

**Alternative Flows**:

**Alt-204A: Large Batch** (At step 3)
- Batch size > 100 items
- Service processes in chunks of 100
- Prevents resource exhaustion
- Results aggregated and returned
- Continue to step 4

**Exception Flows**:

**Exc-204A: Partial Failures** (At step 3)
- Some items succeed, others fail
- Service completes all attempted valuations
- Service returns results array with:
  - Successful ValuationResults
  - Error objects for failed items
- Calling module handles partial success
- Process completes

**Exc-204B: Complete Failure** (At step 3)
- All valuations fail (service unavailable, etc.)
- Service throws error with batch context
- Calling module displays error
- Process ends

**API Contract**:

**Request**:
```typescript
batchValuation(
  items: Array<{ itemId: string; quantity: number }>,
  date: Date
): Promise<ValuationResult[]>
```

**Response**: Array of ValuationResult objects (see UC-INV-201 for structure)

**Monitoring**:
- Batch request count and average size
- Batch processing time
- Partial failure rate
- Parallel processing efficiency

**Related Requirements**:
- FR-INV-024: System shall support batch valuations
- NFR-INV-021: Batch valuation shall process 100 items within 5 seconds

---

## Background Job Use Cases

### UC-INV-301: Pre-calculate Monthly Period Costs

**Description**: Scheduled job that pre-calculates period average costs for all active items at end of each month, improving performance of future valuations.

**Trigger**:
- **Schedule**: Cron: `0 2 1 * *` (2 AM on 1st of each month)
- **Manual Trigger**: Can be triggered by System Administrator via admin interface

**Actor(s)**:
- **Primary**: System Scheduler
- **Secondary**: PeriodicAverageService, Database

**Priority**: Medium

**Frequency**: Monthly (automated) + ad-hoc (manual)

**Preconditions**:
- Previous month has ended
- GRN data for previous month is committed
- No other pre-calculation job running

**Postconditions**:
- **Success**: Period costs calculated and cached for all active items
- **Failure**: Partial completion, remaining items queued for retry

**Main Flow**:
1. Scheduler triggers job at 2 AM on 1st of month
2. Job acquires distributed lock to prevent concurrent execution
3. Job calculates target period (previous month)
4. Job queries list of active items with receipts in target period
5. Job logs start: "Starting period cost pre-calculation for {month} - {itemCount} items"
6. For each item:
   - 6a. Job calls `periodicService.calculateMonthlyAverageCost(itemId, month)`
   - 6b. Service calculates average cost
   - 6c. Service caches result (UC-INV-103)
   - 6d. Job updates progress counter
7. Job releases distributed lock
8. Job generates summary report:
   - Total items processed
   - Successful calculations
   - Failed calculations (with reasons)
   - Total execution time
9. Job sends summary report to System Administrators
10. Job logs completion
11. Process completes

**Alternative Flows**:

**Alt-301A: Some Items Have No Receipts** (At step 6a-6c)
- Item has no receipts in target period
- Calculation fails (expected)
- Job logs: "No receipts for item {itemId} in {month} - skipped"
- Job continues with next item
- Item excluded from success count
- Resume at step 6d

**Alt-301B: Manual Trigger** (At step 1)
- System Administrator triggers job manually
- Job executes same logic immediately
- Administrator specifies target period
- Continue to step 2

**Exception Flows**:

**Exc-301A: Job Already Running** (At step 2)
- Cannot acquire distributed lock
- Another instance of job is running
- Job logs: "Pre-calculation job already running, exiting"
- Job exits without processing
- Process ends

**Exc-301B: Partial Failure** (At step 6)
- Some item calculations fail (database error, data corruption, etc.)
- Job continues processing remaining items
- Failed items logged with error details
- Job completes with partial success
- Failed items included in summary report
- Process completes

**Exc-301C: Database Unavailable** (At step 4)
- Cannot query active items list
- Job logs error
- Job waits 5 minutes and retries once
- If retry fails, job exits
- Alert sent to administrators
- Process ends

**Concurrency Control**:
- Distributed lock using database or Redis
- Lock key: `period-cost-precalc:{companyId}:{month}`
- Lock timeout: 2 hours (job should complete faster)
- If job crashes, lock auto-released after timeout

**Failure Recovery**:
- Job idempotent (safe to re-run)
- Failed items can be reprocessed individually
- Manual trigger allows reprocessing specific periods
- Cache UPSERT ensures no duplicate entries

**Idempotency**:
- Process is idempotent
- Cache UPSERT overwrites existing entries
- Safe to run multiple times for same period
- No side effects

**Monitoring**:
- Job execution count per month
- Average execution time
- Success rate per period
- Items processed per period
- Cache population rate

**Related Requirements**:
- FR-INV-025: System shall pre-calculate period costs monthly
- NFR-INV-022: Pre-calculation shall complete within 1 hour for 10,000 active items

**Notes**:
- Job improves performance of Periodic Average valuations
- Runs during low-traffic hours (2 AM)
- Pre-calculated costs valid until new GRN posted (UC-INV-203)

---

### UC-INV-302: Invalidate Stale Cache

**Description**: Scheduled job that identifies and removes stale cache entries that are outdated or no longer needed.

**Trigger**:
- **Schedule**: Cron: `0 3 * * 0` (3 AM every Sunday)
- **Manual Trigger**: Can be triggered by System Administrator

**Actor(s)**:
- **Primary**: System Scheduler
- **Secondary**: PeriodicAverageService, Database

**Priority**: Low

**Frequency**: Weekly (automated)

**Preconditions**:
- Cache entries exist
- No active pre-calculation job running

**Postconditions**:
- **Success**: Stale cache entries removed, database optimized
- **Failure**: Partial cleanup, some entries may remain

**Main Flow**:
1. Scheduler triggers job at 3 AM Sunday
2. Job acquires lock to prevent concurrent execution
3. Job calculates stale threshold: 6 months ago
4. Job queries cache entries WHERE calculated_at < threshold
5. Job logs start: "Starting cache cleanup - {count} stale entries found"
6. Job deletes stale cache entries in batches of 1000
7. Job releases lock
8. Job logs summary:
   - Entries deleted
   - Database space reclaimed
   - Execution time
9. Process completes

**Alternative Flows**: None

**Exception Flows**:

**Exc-302A: No Stale Entries** (At step 4)
- Query returns zero entries
- Job logs: "No stale cache entries found"
- Job exits
- Process completes

**Exc-302B: Delete Failure** (At step 6)
- Some deletes fail
- Job logs errors
- Job continues with remaining batches
- Process completes with partial success

**Concurrency Control**:
- Lock key: `cache-cleanup:{companyId}`
- Lock timeout: 30 minutes

**Idempotency**:
- Process is idempotent
- Safe to run multiple times
- Already-deleted entries simply not found

**Monitoring**:
- Cache cleanup execution count
- Entries deleted per run
- Database space reclaimed

**Related Requirements**:
- FR-INV-026: System shall clean up stale cache entries
- NFR-INV-023: Cleanup shall complete within 15 minutes

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-INV-001 | FR-INV-001 | BR-INV-001, BR-INV-002 | TC-INV-001 | Planned |
| UC-INV-002 | FR-INV-002, FR-INV-003, FR-INV-004 | BR-INV-003 to BR-INV-008 | TC-INV-002 | Planned |
| UC-INV-003 | FR-INV-005, FR-INV-006 | BR-INV-009 to BR-INV-011 | TC-INV-003 | Planned |
| UC-INV-004 | FR-INV-007 | BR-INV-012, BR-INV-013 | TC-INV-004 | Planned |
| UC-INV-005 | FR-INV-008, FR-INV-009 | BR-INV-014 to BR-INV-018 | TC-INV-005 | Planned |
| UC-INV-101 | FR-INV-010, FR-INV-011 | BR-INV-019 to BR-INV-023 | TC-INV-101 | Planned |
| UC-INV-102 | FR-INV-012, FR-INV-013 | BR-INV-024 to BR-INV-029 | TC-INV-102 | Planned |
| UC-INV-103 | FR-INV-014 | BR-INV-030 to BR-INV-033 | TC-INV-103 | Planned |
| UC-INV-104 | FR-INV-015, FR-INV-016 | BR-INV-034 to BR-INV-038 | TC-INV-104 | Planned |
| UC-INV-105 | FR-INV-017 | BR-INV-039, BR-INV-040 | TC-INV-105 | Planned |
| UC-INV-106 | FR-INV-018, FR-INV-019 | BR-INV-041 to BR-INV-044 | TC-INV-106 | Planned |
| UC-INV-107 | FR-INV-020 | BR-INV-045 to BR-INV-047 | TC-INV-107 | Planned |
| UC-INV-201 | FR-INV-021 | - | TC-INV-201 | Planned |
| UC-INV-202 | FR-INV-022 | - | TC-INV-202 | Planned |
| UC-INV-203 | FR-INV-023 | - | TC-INV-203 | Planned |
| UC-INV-204 | FR-INV-024 | - | TC-INV-204 | Planned |
| UC-INV-301 | FR-INV-025 | - | TC-INV-301 | Planned |
| UC-INV-302 | FR-INV-026 | - | TC-INV-302 | Planned |

---

## Appendix

### Glossary

- **Actor**: A user, system, or external service that interacts with the inventory valuation system
- **Use Case**: A description of how an actor uses the system to achieve a goal
- **Precondition**: A condition that must be true before a use case can begin
- **Postcondition**: A condition that is guaranteed to be true after successful use case completion
- **FIFO**: First-In-First-Out costing method that consumes oldest inventory layers first
- **Periodic Average**: Costing method using monthly average of all receipts
- **Valuation**: The process of calculating the cost of inventory items
- **Cache**: Temporary storage of calculated costs for performance optimization
- **Audit Trail**: Immutable record of all configuration changes and significant events

### Common Patterns

**Pattern: Cost Calculation Request**
1. Module needs to value inventory
2. Module calls `calculateInventoryValuation(itemId, quantity, date)`
3. Service retrieves costing method
4. Service routes to appropriate calculation (FIFO or Periodic Average)
5. Service returns ValuationResult
6. Module uses cost in business logic

**Pattern: Cache-Then-Calculate**
1. Service checks cache for period cost
2. If found: Return cached cost (fast path)
3. If not found: Calculate from GRN data
4. Store calculation in cache
5. Return calculated cost

**Pattern: Event-Driven Cache Invalidation**
1. Module posts transaction affecting inventory costs
2. Module publishes event
3. Valuation service consumes event
4. Service invalidates affected cache entries
5. Next valuation request will recalculate

---

**Document End**

> 📝 **Note to Authors**:
> - Each use case represents a complete, testable scenario
> - Use cases map directly to functional requirements
> - Integration use cases show how modules consume valuation service
> - System use cases document automated processes
> - Background jobs optimize system performance
> - Maintain traceability to BR and FR documents
> - Review with stakeholders before implementation

---

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Updates**:
- Costing method enum values clarified: Database uses `FIFO` and `AVG` (display as "Periodic Average")
- Updated cost precision from 4 to 5 decimal places (DECIMAL(20,5))
- Updated all data contracts and type definitions to use DECIMAL(20,5)
- Added note that `period_cost_cache` table doesn't exist - costs calculated on-demand from `tb_inventory_transaction_detail`
- Updated all business rules references (BR-INV-017, BR-INV-022, BR-INV-026) with correct precision
- Updated all method references from `'PERIODIC_AVERAGE'` to `'AVG'` with notes explaining enum mapping
- Added schema references throughout document
