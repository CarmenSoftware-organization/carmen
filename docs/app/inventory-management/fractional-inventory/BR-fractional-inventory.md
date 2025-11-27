# Business Requirements: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Status**: Draft - For Implementation

## Related Documents
- [Use Cases](./UC-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)
- [Fractional Inventory System Overview](../../../fractional-inventory-system.md)
- [Fractional Inventory Management Business Rules](../../../prd/output/rules/fractional-inventory-management-business-rules.md)
- [Fractional Stock Deduction Service Spec](../../../prd/output/functions/fractional-stock-deduction-service-spec.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## 1. Overview

### 1.1 Purpose

The Fractional Inventory Management sub-module enables hospitality businesses to track and manage items that can be sold in portions or fractions. This system supports multi-state inventory tracking (RAW → PREPARED → PORTIONED → PARTIAL → COMBINED → WASTE) with conversion operations (split/combine), quality management, smart alerts, and real-time visual tracking.

### 1.2 Business Context

Hospitality businesses like restaurants, cafes, and catering operations frequently deal with items that are purchased as whole units but sold in portions:
- **Pizzas**: Sold by slice (8 slices per pizza)
- **Cakes**: Sold by slice (12 slices per cake) or half/quarter
- **Bulk Containers**: Deli containers, beverage kegs
- **Prepared Items**: Batch recipes portioned for individual service

Traditional inventory systems track only whole units, leading to:
- **Inaccurate inventory levels**: Cannot track partial consumption
- **Waste tracking gaps**: Difficult to measure conversion waste
- **Cost allocation issues**: Cannot allocate costs to portion-level sales
- **Quality blind spots**: No visibility into quality degradation after portioning
- **Missed optimization opportunities**: Cannot optimize conversion timing

The Fractional Inventory Management sub-module solves these challenges by providing:
- Dual-state tracking (whole units + portions) with automatic synchronization
- Multi-state lifecycle tracking (RAW → PREPARED → PORTIONED → etc.)
- Conversion operations with waste tracking and efficiency measurement
- Time-based quality degradation with automated alerts
- Smart conversion recommendations based on demand patterns
- Real-time visual dashboards with portion utilization charts

### 1.3 Scope

**In Scope**:
- Fractional item configuration (portion sizes, conversion rules, quality parameters)
- Multi-state stock tracking (RAW, PREPARED, PORTIONED, PARTIAL, COMBINED, WASTE)
- Conversion operations (Split, Combine, Prepare, Portion)
- Quality management (time-based degradation, quality grades, expiry tracking)
- Smart alerts and recommendations (portion low, quality degrading, conversion optimal)
- Real-time dashboard with visual portion tracking
- Conversion history and audit trail
- Integration with POS for sales deduction
- Integration with Recipe Management for conversion planning
- Integration with Financial System for cost accounting

**Out of Scope** (Future Enhancements):
- IoT sensor integration for automatic quality monitoring
- Machine learning-based demand forecasting (basic demand patterns in scope)
- Voice-activated conversion operations
- Mobile app for floor staff (web-based UI only)
- Multi-tenant franchise support (single-tenant only)

---

## 2. Functional Requirements

### FR-FI-001: Fractional Item Configuration

**Description**: Configure items to support fractional sales with portion sizes, conversion rules, quality parameters, and costing information.

**Priority**: Critical

**Business Rules Applied**: BR-FI-001, BR-FI-002, BR-FI-003, BR-FI-004

**Acceptance Criteria**:
- Users can enable fractional tracking for specific inventory items
- Users can define multiple portion sizes per item (e.g., slice, half, quarter)
- Users can specify portions-per-whole ratio for each portion size
- Users can configure shelf life hours (maximum time after preparation)
- Users can configure maximum quality hours (time before degradation)
- Users can set expected waste percentage during conversion
- Users can enter base cost per unit and conversion cost per unit
- Users can enable/disable auto-conversion feature
- Configuration changes apply to new stock only (not retroactively)
- System validates portion-per-whole ratios are mathematically consistent

**Input**:
- Item code and name
- Base unit (e.g., "Whole Pizza", "Whole Cake")
- Portion sizes with portions-per-whole ratio
- Shelf life hours, maximum quality hours
- Temperature requirements (optional)
- Expected waste percentage
- Base cost and conversion cost
- Auto-conversion enabled/disabled

**Output**:
- Fractional item configuration saved
- Configuration validation results
- Success/error messages

**Dependencies**:
- Product Management module for base item information
- User must have "Inventory.FractionalInventory.Configure" permission

---

### FR-FI-002: Multi-State Stock Tracking

**Description**: Track fractional inventory through multiple states (RAW, PREPARED, PORTIONED, PARTIAL, COMBINED, WASTE) with automatic state transitions and quality monitoring.

**Priority**: Critical

**Business Rules Applied**: BR-FI-005, BR-FI-006, BR-FI-007, BR-FI-008

**Acceptance Criteria**:
- System tracks fractional stock in six distinct states:
  - **RAW**: Original whole items in their initial state
  - **PREPARED**: Items that have been prepared/processed but not portioned
  - **PORTIONED**: Items divided into sellable portions
  - **PARTIAL**: Partially consumed items with remaining portions
  - **COMBINED**: Multiple portions combined back into bulk items
  - **WASTE**: Items marked as waste due to quality degradation or other reasons
- Each stock record tracks current state, state transition date, and quality grade
- System tracks whole units, partial quantity, and total portions simultaneously
- System tracks reserved portions (allocated to orders but not yet fulfilled)
- System maintains original quantities for variance analysis
- State transitions follow defined workflows with validation
- Quality grades update automatically based on time elapsed since preparation
- System prevents invalid state transitions (e.g., RAW → PARTIAL)
- Users can manually override state transitions with proper authorization

**Input**:
- Stock ID
- Target state (for manual transitions)
- Reason and notes for state change
- User authorization

**Output**:
- Updated stock state and quality grade
- State transition timestamp
- Validation errors if transition is invalid
- Activity log entry

**Dependencies**:
- Fractional Item configuration (FR-FI-001)
- User must have "Inventory.FractionalInventory.ManageStates" permission

---

### FR-FI-003: Split Conversion Operation

**Description**: Convert whole items into multiple portions with automatic quantity calculations, waste tracking, and quality impact assessment.

**Priority**: Critical

**Business Rules Applied**: BR-FI-009, BR-FI-010, BR-FI-011, BR-FI-012

**Acceptance Criteria**:
- Users can initiate split operation on PREPARED or RAW stock
- Users specify number of whole units to split and target portion size
- System calculates expected portions based on portions-per-whole ratio
- System applies configured waste percentage to calculate actual portions
- System creates conversion record with before/after quantities
- System updates stock quantities (reduces whole units, increases portions)
- System generates waste amount and tracks separately
- System calculates conversion efficiency (actual vs expected yield)
- System calculates conversion cost based on item configuration
- System updates quality grade if quality degradation occurs
- System prevents splitting if insufficient whole units available
- System prevents splitting if stock quality is POOR or EXPIRED
- Split operation is atomic (all-or-nothing transaction)
- User can provide reason and notes for audit trail

**Input**:
- Stock ID
- Number of whole units to split
- Target portion size ID
- Performed by (user ID)
- Reason for conversion
- Optional notes

**Output**:
- Conversion record created
- Stock quantities updated (whole units reduced, portions increased)
- Waste amount calculated and tracked
- Conversion efficiency calculated
- Conversion cost calculated
- Quality impact assessed
- Success/error message
- Updated stock displayed in dashboard

**Dependencies**:
- Fractional Item configuration with portion sizes (FR-FI-001)
- Stock must be in PREPARED or RAW state (FR-FI-002)
- User must have "Inventory.FractionalInventory.Convert" permission

---

### FR-FI-004: Combine Conversion Operation

**Description**: Merge multiple portions back into whole units for repackaging, cost optimization, or waste reduction.

**Priority**: High

**Business Rules Applied**: BR-FI-013, BR-FI-014, BR-FI-015, BR-FI-016

**Acceptance Criteria**:
- Users can initiate combine operation on PORTIONED or PARTIAL stock
- Users specify target number of whole units to create
- System calculates required portions based on portions-per-whole ratio
- System validates sufficient portions available across selected stocks
- System considers quality grades when combining (only GOOD+ allowed)
- System creates conversion record with before/after quantities
- System updates stock quantities (increases whole units, reduces portions)
- System generates minimal waste during combining
- System calculates conversion efficiency
- System calculates conversion cost (typically lower than split)
- System updates quality grade to lowest of combined portions
- System prevents combining if insufficient portions available
- System prevents combining POOR or EXPIRED quality portions
- Combine operation is atomic (all-or-nothing transaction)
- User can provide reason and notes for audit trail

**Input**:
- Stock ID(s) to combine from
- Target whole units to create
- Performed by (user ID)
- Reason for conversion
- Optional notes

**Output**:
- Conversion record created
- Stock quantities updated (portions reduced, whole units increased)
- Minimal waste calculated and tracked
- Conversion efficiency calculated
- Conversion cost calculated
- Quality grade updated (lowest of combined portions)
- Success/error message
- Updated stock displayed in dashboard

**Dependencies**:
- Fractional Item configuration with portion sizes (FR-FI-001)
- Stock must be in PORTIONED or PARTIAL state (FR-FI-002)
- User must have "Inventory.FractionalInventory.Convert" permission

---

### FR-FI-005: Prepare and Portion Operations

**Description**: Move stock from RAW to PREPARED state, and from PREPARED to PORTIONED state with time tracking and quality monitoring.

**Priority**: High

**Business Rules Applied**: BR-FI-017, BR-FI-018, BR-FI-019

**Acceptance Criteria**:
- **Prepare Operation**:
  - Users can move RAW stock to PREPARED state
  - System records prepared-at timestamp
  - System calculates expiry time based on shelf life hours
  - System sets quality grade to EXCELLENT
  - System validates sufficient RAW whole units available
  - User provides reason and notes for audit trail

- **Portion Operation**:
  - Users can move PREPARED stock to PORTIONED state
  - System records portioned-at timestamp
  - System inherits expiry time from prepared-at
  - System maintains current quality grade
  - System validates PREPARED stock is not expired
  - System validates quality grade is GOOD or better
  - User provides reason and notes for audit trail

- Both operations create activity log entries
- Both operations are atomic transactions
- System prevents operations on expired or poor quality stock

**Input**:
- Stock ID
- Operation type (Prepare or Portion)
- Quantity (whole units)
- Performed by (user ID)
- Reason
- Optional notes

**Output**:
- Stock state updated (RAW → PREPARED or PREPARED → PORTIONED)
- Timestamp recorded (prepared-at or portioned-at)
- Expiry time calculated
- Quality grade set/maintained
- Activity log entry created
- Success/error message

**Dependencies**:
- Fractional Item configuration (FR-FI-001)
- Stock in correct source state (FR-FI-002)
- User must have "Inventory.FractionalInventory.Prepare" permission

---

### FR-FI-006: Quality Management and Time-Based Degradation

**Description**: Monitor and manage quality degradation over time with automatic quality grade updates, alerts, and disposal procedures.

**Priority**: Critical

**Business Rules Applied**: BR-FI-020, BR-FI-021, BR-FI-022, BR-FI-023

**Acceptance Criteria**:
- System calculates quality grade based on time since preparation:
  - **EXCELLENT**: 0 to max quality hours (e.g., 0-2 hours)
  - **GOOD**: max quality hours to 50% shelf life (e.g., 2-2.5 hours)
  - **FAIR**: 50% to 75% shelf life (e.g., 2.5-3 hours)
  - **POOR**: 75% to 100% shelf life (e.g., 3-4 hours)
  - **EXPIRED**: beyond shelf life (e.g., >4 hours)
- System updates quality grades automatically every 15 minutes
- System displays visual quality indicators (color-coded badges)
- System displays time-to-expiry countdown
- System generates alerts when quality degrades to FAIR or below
- System restricts sales when quality reaches POOR
- System prevents sales when quality reaches EXPIRED
- System automatically marks EXPIRED items as WASTE if not manually handled
- Users can manually update quality grade with justification
- Users can extend expiry time with proper authorization (max 1-time extension)
- System tracks quality history for each stock record

**Input**:
- Stock ID (for manual quality update)
- New quality grade
- Justification for manual update
- User authorization

**Output**:
- Quality grade updated
- Quality update timestamp
- Quality history entry
- Alerts generated if quality below threshold
- Visual quality indicator updated
- Time-to-expiry countdown updated

**Dependencies**:
- Fractional Item configuration with shelf life and max quality hours (FR-FI-001)
- Stock in PREPARED or PORTIONED state (FR-FI-002)
- Automated background job running every 15 minutes

---

### FR-FI-007: Smart Alerts and Recommendations

**Description**: Generate intelligent alerts and conversion recommendations based on inventory levels, demand patterns, quality status, and optimization algorithms.

**Priority**: High

**Business Rules Applied**: BR-FI-024, BR-FI-025, BR-FI-026, BR-FI-027

**Acceptance Criteria**:
- System generates alerts for six alert types:
  - **PORTION_LOW**: Available portions below minimum threshold
  - **QUALITY_DEGRADING**: Quality grade degrading to FAIR or below
  - **CONVERSION_RECOMMENDED**: Optimal time to convert based on demand
  - **WASTE_HIGH**: Waste percentage exceeding acceptable limits
  - **EXPIRING_SOON**: Items approaching expiry (within 1 hour)
  - **OPTIMAL_CONVERSION_TIME**: Best time window for conversion to minimize waste

- Each alert includes:
  - Severity level (LOW, MEDIUM, HIGH, CRITICAL)
  - Triggered timestamp and triggering user/system
  - Descriptive title and message
  - Recommended actions with priority ordering
  - Estimated impact of recommended actions

- System processes alerts for all stocks every 15 minutes
- System displays active alerts in dashboard with visual indicators
- Users can acknowledge alerts (marks as read, remains active)
- Users can resolve alerts (marks as resolved, archived)
- System tracks alert history for analytics
- Critical alerts trigger push notifications (if enabled)
- System generates conversion recommendations based on:
  - Current inventory levels (whole units and portions)
  - Historical demand patterns (last 30 days)
  - Time of day and day of week patterns
  - Upcoming reservations and orders
  - Quality degradation trajectory
  - Waste minimization opportunities

**Input**:
- Alert ID (for acknowledge/resolve actions)
- User ID
- Resolution notes (for resolve action)

**Output**:
- Active alerts displayed in dashboard
- Alert notification (push/email if enabled)
- Alert acknowledgment confirmation
- Alert resolution confirmation
- Conversion recommendations with impact estimates

**Dependencies**:
- Fractional Item configuration (FR-FI-001)
- Multi-state stock tracking (FR-FI-002)
- Quality management (FR-FI-006)
- Automated background job running every 15 minutes

---

### FR-FI-008: Real-Time Dashboard with Visual Portion Tracking

**Description**: Provide real-time visual dashboard displaying inventory levels, portion utilization, quality indicators, alerts, and conversion opportunities.

**Priority**: High

**Business Rules Applied**: BR-FI-028, BR-FI-029

**Acceptance Criteria**:
- Dashboard displays overview metrics:
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

- Dashboard displays stock list with:
  - Item name and code
  - Current state (color-coded badge)
  - Quality grade (visual indicator)
  - Whole units available
  - Portions available (with visual bar)
  - Reserved portions
  - Time to expiry (countdown)
  - Active alerts (icon indicators)
  - Quick action buttons (Split, Combine, View Details)

- Dashboard supports three view modes:
  - **Portions View**: Focus on portion availability with visual bars
  - **Grid View**: Card-based layout for quick overview
  - **List View**: Detailed table with all fields

- Dashboard supports filtering by:
  - Item name/code (search)
  - Current state (RAW, PREPARED, PORTIONED, PARTIAL, COMBINED)
  - Quality grade (EXCELLENT, GOOD, FAIR, POOR, EXPIRED)
  - Alert presence (has active alerts)
  - Location (if multi-location)

- Dashboard supports sorting by:
  - Item name
  - Quantity (whole units or portions)
  - Quality grade
  - Time to expiry
  - Last movement date

- Dashboard auto-refreshes every 30 seconds
- Users can manually refresh with button click
- Dashboard displays loading states and error handling
- Dashboard is responsive (desktop, tablet, mobile)

**Input**:
- Location filter (optional, if multi-location)
- Search term (item name/code)
- State filter
- Quality filter
- Sort field and direction

**Output**:
- Real-time dashboard display
- Visual portion tracking bars
- Quality indicators
- Alert badges
- Metric summaries
- Quick action buttons
- Auto-refresh indicator

**Dependencies**:
- Fractional Item configuration (FR-FI-001)
- Multi-state stock tracking (FR-FI-002)
- Quality management (FR-FI-006)
- Smart alerts (FR-FI-007)

---

### FR-FI-009: Conversion History and Audit Trail

**Description**: Maintain complete audit trail of all conversion operations with detailed before/after quantities, waste tracking, efficiency metrics, and user attribution.

**Priority**: High

**Business Rules Applied**: BR-FI-030, BR-FI-031

**Acceptance Criteria**:
- System records every conversion operation with:
  - Conversion ID (unique identifier)
  - Conversion type (SPLIT, COMBINE, PREPARE, PORTION, CONSUME, WASTE)
  - From state and to state
  - Before quantities (whole units, partial quantity, total portions)
  - After quantities (whole units, partial quantity, total portions)
  - Waste generated (quantity and percentage)
  - Conversion efficiency (actual vs expected yield)
  - Conversion cost (labor + overhead)
  - Quality grade before and after
  - Performed by (user ID and name)
  - Performed at (timestamp)
  - Reason and notes
  - Source stock IDs (stocks used in conversion)
  - Target stock IDs (stocks created from conversion)
  - Related order ID (if conversion was for specific order)

- Users can view conversion history:
  - By stock ID (all conversions for a specific stock)
  - By item ID (all conversions for a specific item)
  - By date range
  - By conversion type
  - By user (who performed conversions)

- Users can view detailed conversion record with:
  - Full before/after comparison
  - Waste analysis
  - Efficiency metrics
  - Quality impact
  - Cost breakdown
  - Timeline view

- Users can export conversion history to Excel/CSV
- System retains conversion history indefinitely for audit compliance
- Conversion records are immutable (cannot be edited or deleted)
- Users can add follow-up notes to existing conversion records

**Input**:
- Stock ID, item ID, date range, conversion type, or user ID (for filtering)
- Export format (Excel or CSV)

**Output**:
- Conversion history list with filtering and sorting
- Detailed conversion record view
- Exported file (Excel or CSV)
- Conversion analytics dashboard

**Dependencies**:
- Conversion operations (FR-FI-003, FR-FI-004, FR-FI-005)
- User must have "Inventory.FractionalInventory.ViewHistory" permission

---

### FR-FI-010: POS Integration for Sales Deduction

**Description**: Integrate with Point-of-Sale system to automatically deduct portion quantities from fractional inventory when sales are made.

**Priority**: Critical

**Business Rules Applied**: BR-FI-032, BR-FI-033, BR-FI-034

**Acceptance Criteria**:
- POS system sends sale transaction with:
  - Item ID or item code
  - Portion size ID (e.g., "slice-8")
  - Quantity sold (number of portions)
  - Location ID
  - Order ID
  - Timestamp

- System validates sale request:
  - Item exists and supports fractional sales
  - Portion size is valid for item
  - Sufficient portions available (not reserved)
  - Stock quality is EXCELLENT or GOOD
  - Stock is not expired

- System processes sale deduction:
  - Reduces total portions available
  - Updates partial quantity if needed
  - Creates sale operation record
  - Updates stock state to PARTIAL if partially consumed
  - Calculates cost of goods sold (COGS)
  - Updates inventory valuation

- System reserves portions for orders:
  - POS sends reservation request with order ID
  - System reserves portions (reduces available, increases reserved)
  - System holds reservation for maximum 2 hours
  - System releases reservation on order cancellation
  - System converts reservation to sale on order fulfillment

- System handles insufficient inventory:
  - Returns error with available quantity
  - Suggests alternative portion sizes if available
  - Generates PORTION_LOW alert if below threshold

- System provides real-time inventory availability to POS:
  - POS queries available portions by item and location
  - System returns available portions (excluding reserved)
  - System returns quality grade and expiry time
  - POS displays availability to cashier/server

**Input**:
- Sale transaction (item ID, portion size, quantity, location, order ID)
- Reservation request (item ID, portion size, quantity, order ID)
- Availability query (item ID, location ID)

**Output**:
- Sale confirmation with updated inventory
- Reservation confirmation with reservation ID
- Availability response with portions available and quality grade
- Error message if sale cannot be fulfilled
- PORTION_LOW alert if below threshold

**Dependencies**:
- Fractional Item configuration (FR-FI-001)
- Multi-state stock tracking (FR-FI-002)
- Quality management (FR-FI-006)
- POS system API integration

---

## 3. Business Rules

### BR-FI-001: Fractional Item Eligibility

**Rule**: Only specific inventory items can be configured for fractional sales based on business requirements.

**Validation**:
- Item must be in "Food" or "Beverage" category
- Item must not be a pre-packaged individual serving
- Item must have defined base unit (e.g., "Whole Pizza", "Whole Cake")
- Item must support portioning without quality degradation risk

**Rationale**: Fractional tracking adds complexity and should only be enabled for items that are actually sold in portions. Pre-packaged individual servings don't need fractional tracking since they're already portioned by the manufacturer.

---

### BR-FI-002: Portions-Per-Whole Consistency

**Rule**: All portion sizes for an item must have mathematically consistent portions-per-whole ratios.

**Validation**:
- If item has "Half" (2 portions per whole) and "Quarter" (4 portions per whole), ratios must be consistent
- If item has "Slice" (8 per whole) and "Half" (2 per whole), then 1 half = 4 slices
- System validates consistency when saving portion size configuration
- System prevents configuration changes that create inconsistency

**Rationale**: Inconsistent portion ratios lead to inventory discrepancies when converting between different portion sizes. Mathematical consistency ensures accurate inventory tracking.

---

### BR-FI-003: Waste Percentage Limits

**Rule**: Expected waste percentage during conversion must be within acceptable business limits.

**Validation**:
- Waste percentage must be between 0% and 25%
- Waste percentage >15% triggers warning message
- Waste percentage >25% blocked without management approval
- Actual waste exceeding expected by >5% triggers investigation alert

**Rationale**: Excessive waste indicates process inefficiency or configuration errors. Setting limits ensures waste is monitored and controlled.

---

### BR-FI-004: Shelf Life and Quality Hours Relationship

**Rule**: Maximum quality hours must be less than or equal to shelf life hours.

**Validation**:
- Max quality hours ≤ shelf life hours
- Max quality hours typically 25-50% of shelf life hours
- System validates relationship when saving configuration
- System prevents configuration that violates relationship

**Rationale**: An item cannot maintain maximum quality beyond its shelf life. Ensuring proper relationship prevents illogical configurations.

---

### BR-FI-005: State Transition Workflow

**Rule**: Stock state transitions must follow defined workflows with valid pathways.

**Valid Pathways**:
- RAW → PREPARED → PORTIONED → PARTIAL → WASTE
- RAW → PREPARED → PORTIONED → COMBINED → PARTIAL
- PREPARED → WASTE
- PORTIONED → WASTE
- PARTIAL → WASTE

**Invalid Pathways**:
- RAW → PORTIONED (must go through PREPARED)
- PORTIONED → PREPARED (reverse not allowed)
- WASTE → any other state (waste is terminal)
- COMBINED → PORTIONED (must go through PARTIAL first)

**Rationale**: Enforcing workflow ensures proper tracking and prevents illogical state transitions that could cause inventory discrepancies.

---

### BR-FI-006: Time Limits on PREPARED State

**Rule**: Items in PREPARED state must be portioned within 4 hours (or configured shelf life, whichever is shorter).

**Validation**:
- System tracks time in PREPARED state
- System generates alert when 75% of time limit reached (e.g., 3 hours)
- System automatically transitions to WASTE if time limit exceeded without manual intervention
- System updates quality grade to FAIR when 50% of time limit reached

**Rationale**: Food safety regulations require prepared items to be portioned or served within time limits. Enforcing this rule ensures compliance and quality maintenance.

---

### BR-FI-007: Quality Grade Sales Restrictions

**Rule**: Only EXCELLENT and GOOD quality grades are allowed for customer sales.

**Validation**:
- POS sale requests blocked if quality grade is FAIR, POOR, or EXPIRED
- System returns error message indicating quality restriction
- FAIR quality items can be marked down for discounted sales (if enabled)
- POOR and EXPIRED items can only be marked as WASTE
- System prevents quality grade from being manually upgraded (only downgrades allowed)

**Rationale**: Food safety and customer satisfaction require maintaining minimum quality standards for sold items. Restricting sales based on quality protects the business and customers.

---

### BR-FI-008: Reservation Time Limits

**Rule**: Reserved portions must be fulfilled or released within maximum 2 hours for perishable items.

**Validation**:
- System tracks reservation timestamp
- System generates alert when 90 minutes reached
- System automatically releases reservation after 2 hours
- System sends notification to manager for expired reservations
- Customer service can extend reservation once for additional 1 hour (max 3 hours total)

**Rationale**: Indefinite reservations prevent inventory from being sold to other customers and can lead to waste if items expire while reserved. Time limits ensure efficient inventory utilization.

---

### BR-FI-009: Minimum Conversion Efficiency

**Rule**: Conversion efficiency must achieve minimum 85% of theoretical yield.

**Validation**:
- System calculates expected portions based on portions-per-whole ratio and waste percentage
- System calculates actual portions created during conversion
- Efficiency = (actual portions / expected portions) × 100%
- Efficiency <85% triggers process review alert
- Efficiency <75% requires immediate investigation and manager approval for future conversions
- System tracks efficiency trends and reports monthly

**Rationale**: Low conversion efficiency indicates process problems, inadequate training, or equipment issues. Monitoring efficiency enables process improvement and cost control.

---

### BR-FI-010: Waste Generation Limits

**Rule**: Waste generated during conversions must not exceed 12% of input material value.

**Validation**:
- System calculates waste as percentage of input quantity
- Waste ≤ configured waste percentage + 2% tolerance = acceptable
- Waste > configured + 2% but ≤ 12% = triggers warning
- Waste > 12% = triggers immediate investigation alert and blocks future conversions until reviewed
- System tracks waste trends by item, location, and operator

**Rationale**: Excessive waste increases costs and reduces profitability. Monitoring and limiting waste drives operational excellence and sustainability.

---

### BR-FI-011: Quality Maintenance During Conversion

**Rule**: Conversion operations must not degrade quality grade by more than one level.

**Validation**:
- EXCELLENT → GOOD = acceptable
- EXCELLENT → FAIR = triggers warning
- EXCELLENT → POOR = blocked (conversion not allowed)
- GOOD → FAIR = acceptable if near time limit
- GOOD → POOR = blocked (conversion not allowed)
- System prevents conversions that would cause >1 level degradation
- Manual override requires manager approval with documented justification

**Rationale**: Conversion operations involve handling and exposure that can degrade quality. Limiting degradation to one level ensures customer satisfaction and food safety.

---

### BR-FI-012: Split Operation Quantity Limits

**Rule**: Split operations can only process whole units available in stock (no partial unit splitting).

**Validation**:
- System validates requested whole units ≤ available whole units
- System blocks split if insufficient whole units
- System suggests reducing quantity if over available
- Split operation cannot split partial units (must be whole)

**Rationale**: Partial unit splitting introduces complexity and potential inaccuracy. Limiting to whole units simplifies operations and ensures accuracy.

---

### BR-FI-013: Combine Operation Quality Requirements

**Rule**: Only GOOD or EXCELLENT quality portions can be combined into whole units.

**Validation**:
- System checks quality grade of all portions being combined
- System blocks combine if any portion is FAIR, POOR, or EXPIRED
- System sets combined whole unit quality to lowest of input portions (e.g., GOOD + EXCELLENT = GOOD)
- System allows GOOD + GOOD = GOOD
- System allows EXCELLENT + EXCELLENT = EXCELLENT

**Rationale**: Combining lower quality portions into whole units would compromise quality standards and could violate food safety requirements. Maintaining minimum quality ensures customer satisfaction.

---

### BR-FI-014: Combine Operation Quantity Validation

**Rule**: Combine operations must have sufficient portions available to create requested whole units.

**Validation**:
- System calculates required portions = target whole units × portions-per-whole
- System validates available portions ≥ required portions
- System blocks combine if insufficient portions
- System considers reserved portions as unavailable for combining
- System allows combining across multiple stocks if same item and compatible quality

**Rationale**: Accurate quantity validation prevents incomplete conversions and inventory discrepancies. Ensuring sufficient portions before combining maintains data integrity.

---

### BR-FI-015: Combine Operation Waste Minimization

**Rule**: Combine operations should generate minimal waste (<3% of input material).

**Validation**:
- System expects 0-3% waste during combining (repacking)
- Waste 3-5% = acceptable with documentation
- Waste >5% = triggers investigation alert
- System tracks combine waste separately from split waste
- Low combine waste demonstrates operational excellence

**Rationale**: Combining is generally less wasteful than splitting since it involves repacking rather than cutting. Monitoring combine waste ensures operational efficiency.

---

### BR-FI-016: Combine Operation Cost Calculation

**Rule**: Combine operations incur lower conversion cost than split operations.

**Validation**:
- Combine conversion cost = 30-50% of split conversion cost
- System calculates cost based on labor time and packaging materials
- Cost allocated to resulting whole units
- System tracks and reports conversion costs by operation type

**Rationale**: Combining (repacking) requires less labor and generates less waste than splitting (cutting). Lower cost incentivizes waste reduction through strategic combining.

---

### BR-FI-017: Prepare Operation Time Recording

**Rule**: PREPARE operation must record accurate prepared-at timestamp for quality tracking.

**Validation**:
- System records prepared-at timestamp when state changes to PREPARED
- Timestamp is server-generated (not client-provided) for accuracy
- Timestamp is immutable (cannot be changed after recorded)
- System calculates expiry time = prepared-at + shelf life hours
- System uses prepared-at for all quality degradation calculations

**Rationale**: Accurate time recording is critical for food safety compliance and quality management. Server-generated timestamps prevent tampering and ensure accuracy.

---

### BR-FI-018: Portion Operation Quality Validation

**Rule**: PORTION operation can only be performed on GOOD or EXCELLENT quality PREPARED stock.

**Validation**:
- System checks quality grade before allowing portion operation
- System blocks portion if quality is FAIR, POOR, or EXPIRED
- System blocks portion if PREPARED stock is within 30 minutes of expiry
- System allows portion only if sufficient time remains for sales (minimum 1 hour)

**Rationale**: Portioning stock that is already degrading wastes labor and creates inventory that cannot be sold. Validating quality before portioning prevents waste and ensures saleable inventory.

---

### BR-FI-019: Portion Operation State Preservation

**Rule**: PORTION operation preserves prepared-at timestamp and expiry time from PREPARED state.

**Validation**:
- System copies prepared-at from PREPARED to PORTIONED
- System copies expiry-at from PREPARED to PORTIONED
- System does not reset time tracking when portioning
- System continues quality degradation tracking based on original prepared-at

**Rationale**: Portioning does not reset the shelf life clock - the item is still aging from when it was originally prepared. Preserving timestamps ensures accurate quality tracking and compliance.

---

### BR-FI-020: Quality Grade Calculation Algorithm

**Rule**: Quality grade is calculated based on percentage of shelf life elapsed since preparation.

**Algorithm**:
```
time_elapsed = current_time - prepared_at
percentage_elapsed = (time_elapsed / shelf_life_hours) * 100%

IF percentage_elapsed ≤ (max_quality_hours / shelf_life_hours) * 100%:
  quality_grade = EXCELLENT
ELSE IF percentage_elapsed ≤ 50%:
  quality_grade = GOOD
ELSE IF percentage_elapsed ≤ 75%:
  quality_grade = FAIR
ELSE IF percentage_elapsed ≤ 100%:
  quality_grade = POOR
ELSE:
  quality_grade = EXPIRED
```

**Example** (Pizza with 4-hour shelf life, 2-hour max quality):
- 0-2 hours (0-50%): EXCELLENT
- 2-2.5 hours (50-62.5%): GOOD
- 2.5-3 hours (62.5-75%): FAIR
- 3-4 hours (75-100%): POOR
- >4 hours (>100%): EXPIRED

**Rationale**: Standardized algorithm ensures consistent quality assessment across all fractional items. Time-based degradation reflects reality of food quality decline.

---

### BR-FI-021: Quality Grade Update Frequency

**Rule**: Quality grades must be updated automatically every 15 minutes using background job.

**Validation**:
- Automated job runs every 15 minutes
- Job processes all PREPARED and PORTIONED stocks
- Job updates quality grades based on time elapsed
- Job generates alerts when quality degrades to FAIR or below
- Job marks EXPIRED items as WASTE if no manual intervention within 1 hour
- Manual quality checks can be performed at any time

**Rationale**: Regular updates ensure quality information is current and accurate. 15-minute frequency balances accuracy with system performance.

---

### BR-FI-022: Manual Quality Grade Override

**Rule**: Users can manually override quality grade with proper authorization and justification.

**Validation**:
- Only users with "Inventory.FractionalInventory.OverrideQuality" permission can override
- Override can only downgrade quality (not upgrade)
- Override requires documented justification (minimum 50 characters)
- Override is logged with user ID, timestamp, old grade, new grade, and reason
- Override does not change prepared-at or expiry-at timestamps
- System warns if override contradicts time-based calculation

**Rationale**: Manual override accommodates situations where visual inspection reveals quality issues not captured by time-based algorithm (e.g., temperature excursion, contamination, damage). Requiring authorization and justification prevents abuse.

---

### BR-FI-023: Automatic Waste Marking

**Rule**: EXPIRED items are automatically marked as WASTE if not manually handled within 1 hour of expiry.

**Validation**:
- Automated job checks for EXPIRED items every 15 minutes
- Job marks items as WASTE if expired >1 hour ago and still in PREPARED or PORTIONED state
- Job creates waste operation record with reason "Automatic - Expired"
- Job sends notification to inventory manager
- Manual intervention before 1-hour grace period prevents automatic waste marking

**Rationale**: Automatic waste marking ensures expired items are removed from available inventory and prevents accidental sales. Grace period allows staff to manually handle expired items (e.g., discount sales, staff meals).

---

### BR-FI-024: Portion Low Alert Threshold

**Rule**: PORTION_LOW alert is triggered when available portions fall below minimum threshold.

**Threshold Calculation**:
```
minimum_portions = MAX(
  5,  // Absolute minimum (5 portions)
  average_daily_demand * 0.25,  // 25% of daily demand
  portions_per_whole * 0.5      // Half of one whole unit
)

IF available_portions < minimum_portions:
  TRIGGER PORTION_LOW alert
```

**Example** (Pizza with 8 slices, average demand 20 slices/day):
- Minimum = MAX(5, 20 * 0.25, 8 * 0.5) = MAX(5, 5, 4) = 5 slices
- Alert triggers when available slices < 5

**Rationale**: Dynamic threshold based on demand ensures alerts are relevant to actual business needs. Multiple calculation factors provide robust minimum.

---

### BR-FI-025: Conversion Recommendation Algorithm

**Rule**: System generates conversion recommendations based on multiple factors with weighted scoring.

**Scoring Algorithm**:
```
recommendation_score =
  (demand_factor * 0.40) +
  (inventory_factor * 0.25) +
  (quality_factor * 0.20) +
  (waste_factor * 0.15)

IF recommendation_score ≥ 0.70:
  GENERATE "IMMEDIATE" conversion recommendation (priority: URGENT)
ELSE IF recommendation_score ≥ 0.50:
  GENERATE "SCHEDULED" conversion recommendation (priority: HIGH)
ELSE IF recommendation_score ≥ 0.30:
  GENERATE "DEMAND_BASED" conversion recommendation (priority: MEDIUM)
```

**Factor Calculations**:
- **demand_factor**: Based on predicted demand in next 2 hours vs current portions
- **inventory_factor**: Based on whole units available and optimal conversion size
- **quality_factor**: Based on time to quality degradation and optimal conversion timing
- **waste_factor**: Based on historical waste patterns and conversion efficiency

**Rationale**: Multi-factor scoring ensures conversion recommendations balance demand fulfillment, inventory optimization, quality maintenance, and waste minimization.

---

### BR-FI-026: Alert Severity Classification

**Rule**: Alerts are classified by severity based on business impact and urgency.

**Severity Levels**:
- **CRITICAL**: Immediate action required (expired items, food safety violations, stockouts during service)
- **HIGH**: Action required within 1 hour (quality degrading to POOR, portions very low during peak)
- **MEDIUM**: Action required within 4 hours (quality degrading to FAIR, portions moderately low)
- **LOW**: Action recommended but not urgent (optimization opportunities, efficiency improvements)

**Validation**:
- System assigns severity based on alert type and context
- CRITICAL alerts generate push notifications and email
- HIGH alerts display prominently in dashboard
- MEDIUM and LOW alerts display in alerts panel
- Users can filter alerts by severity

**Rationale**: Severity classification helps users prioritize actions and ensures critical issues receive immediate attention. Different notification methods for different severities prevent alert fatigue.

---

### BR-FI-027: Predictive Demand Patterns

**Rule**: System analyzes historical sales data to predict demand patterns for conversion planning.

**Demand Analysis**:
- **Time of Day Patterns**:
  - Morning (6am-11am): Breakfast items
  - Lunch (11am-2pm): Lunch items, high demand
  - Afternoon (2pm-5pm): Snacks, lower demand
  - Dinner (5pm-9pm): Dinner items, high demand
  - Late Night (9pm-close): Reduced demand

- **Day of Week Patterns**:
  - Weekdays vs weekends
  - Special events (promotions, holidays)

- **Seasonal Patterns**:
  - Monthly trends
  - Holiday periods

- **Reservation Data**:
  - Upcoming reservations and orders
  - Catering orders

**Application**:
- System uses patterns to recommend conversion timing
- System adjusts minimum portion thresholds based on predicted demand
- System generates proactive conversion recommendations before peak periods

**Rationale**: Predictive demand patterns enable proactive inventory management, reducing stockouts and waste. Historical analysis provides data-driven decision support.

---

### BR-FI-028: Dashboard Refresh Frequency

**Rule**: Dashboard must refresh data automatically every 30 seconds to ensure real-time accuracy.

**Validation**:
- JavaScript timer triggers data refresh every 30 seconds
- Only visible dashboard data is refreshed (not background tabs)
- User can manually trigger immediate refresh with button click
- Refresh indicator displays during data loading
- Failed refresh attempts retry after 10 seconds (max 3 retries)
- Users can disable auto-refresh in settings (not recommended)

**Rationale**: Real-time data is critical for fractional inventory management where quantities change rapidly during service periods. 30-second refresh balances accuracy with performance.

---

### BR-FI-029: Visual Portion Tracking Display

**Rule**: Dashboard must display visual portion availability using color-coded progress bars.

**Visual Indicators**:
- **Green** (>50% of capacity): Healthy inventory level
- **Yellow** (25-50% of capacity): Moderate inventory level
- **Orange** (10-25% of capacity): Low inventory level
- **Red** (<10% of capacity): Critical inventory level

**Display Format**:
```
Pizza Margherita (Large)
[████████░░] 32 / 40 portions (80%)
Reserved: 5 portions
```

**Rationale**: Visual indicators enable quick assessment of inventory status without reading numbers. Color coding draws attention to low inventory situations requiring action.

---

### BR-FI-030: Conversion Audit Trail Immutability

**Rule**: Conversion records are immutable and cannot be edited or deleted after creation.

**Validation**:
- System prevents UPDATE and DELETE operations on conversion_record table
- Database constraints enforce immutability at data layer
- Users can add follow-up notes as separate entries (not edits)
- System retains all conversion records indefinitely for compliance
- Only System Administrator can archive old records (moves to archive table, does not delete)

**Rationale**: Immutable audit trail ensures data integrity for compliance, financial auditing, and operational analysis. Preventing edits and deletions maintains trustworthy historical record.

---

### BR-FI-031: Conversion History Retention

**Rule**: Conversion history must be retained for minimum 7 years for compliance and operational analysis.

**Validation**:
- System stores conversion records in primary database for 3 years
- System archives records older than 3 years to archive database
- Archived records remain accessible for reporting and auditing
- System prevents deletion of any records within 7-year period
- After 7 years, records can be archived to cold storage (offline)

**Rationale**: Seven-year retention meets typical accounting and regulatory requirements. Archiving strategy balances data access with database performance.

---

### BR-FI-032: POS Sale Validation

**Rule**: POS sale requests must be validated for inventory availability, quality, and expiry before processing.

**Validation Steps**:
1. Validate item exists and supports fractional sales
2. Validate portion size exists for item
3. Validate sufficient portions available (available ≥ requested)
4. Validate quality grade is EXCELLENT or GOOD
5. Validate item is not expired
6. Validate location matches POS location
7. Process sale deduction if all validations pass
8. Return error with specific reason if any validation fails

**Error Messages**:
- "Insufficient portions available. Available: {X}, Requested: {Y}"
- "Item quality below minimum for sale. Current quality: {grade}"
- "Item has expired. Cannot fulfill sale."
- "Item not available at this location."

**Rationale**: Comprehensive validation prevents selling unavailable, poor quality, or expired items. Clear error messages help POS staff communicate with customers.

---

### BR-FI-033: Reservation Management

**Rule**: Portion reservations must be managed separately from available inventory to prevent overselling.

**Reservation Process**:
1. POS sends reservation request (item, portion size, quantity, order ID)
2. System validates availability (available portions ≥ requested)
3. System creates reservation record
4. System moves portions from available to reserved
5. System sets expiration time (2 hours from reservation)
6. System returns reservation ID to POS

**Reservation Lifecycle**:
- **Active**: Reserved and waiting for fulfillment
- **Fulfilled**: Order completed, portions deducted
- **Released**: Reservation canceled or expired, portions returned to available
- **Expired**: 2-hour limit reached, automatic release

**Rationale**: Separate reservation tracking prevents double-booking and ensures orders can be fulfilled. Time limits prevent indefinite reservations that reduce inventory availability.

---

### BR-FI-034: Cost of Goods Sold (COGS) Calculation

**Rule**: System must calculate accurate COGS for portion-level sales including conversion costs.

**COGS Calculation**:
```
portion_cost = (
  (base_cost_per_unit / portions_per_whole) +
  (conversion_cost_per_unit / portions_per_whole)
) * quantity_sold

total_cogs = portion_cost + waste_allocation

Example (Pizza $250, conversion $10, 8 slices):
  cost_per_slice = (250/8) + (10/8) = 31.25 + 1.25 = 32.50 THB

  Sale of 3 slices:
  COGS = 32.50 * 3 = 97.50 THB
```

**Waste Allocation**:
- Waste costs are allocated proportionally to sold portions
- Waste allocation = (actual_waste_percentage / 100) * portion_cost

**Rationale**: Accurate COGS ensures proper financial reporting and profitability analysis. Including conversion costs and waste allocation provides true cost of fractional sales.

---

## 4. Data Models

### 4.1 FractionalItem

**Purpose**: Configuration entity defining items that support fractional sales.

**Key Attributes**:
- `id` (UUID, Primary Key)
- `itemCode` (String, Unique, Indexed) - Item identification code
- `itemName` (String) - Display name
- `category` (String) - Category (Food, Beverage, etc.)
- `baseUnit` (String) - Base measurement unit (e.g., "Whole Pizza")
- `supportsFractional` (Boolean) - Enable fractional tracking
- `allowPartialSales` (Boolean) - Allow selling partial units
- `trackPortions` (Boolean) - Track portion-level inventory
- `availablePortions` (JSON Array) - Array of PortionSize objects
- `defaultPortionId` (String, Foreign Key) - Default portion size
- `shelfLifeHours` (Integer) - Maximum shelf life after preparation
- `maxQualityHours` (Integer) - Hours before quality degradation
- `temperatureRequired` (Decimal) - Storage temperature requirement
- `allowAutoConversion` (Boolean) - Enable automatic conversions
- `wastePercentage` (Decimal) - Expected waste during conversion
- `baseCostPerUnit` (Decimal) - Base cost per whole unit
- `conversionCostPerUnit` (Decimal) - Additional conversion cost
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Relationships**:
- Has many FractionalStock records
- Has many ConversionRecord records
- Has many InventoryAlert records

---

### 4.2 PortionSize (Embedded in FractionalItem)

**Purpose**: Define available portion sizes for fractional items.

**Key Attributes**:
- `id` (String) - Unique identifier (e.g., "slice-8")
- `name` (String) - Display name (e.g., "Slice")
- `portionsPerWhole` (Integer) - How many portions per whole unit
- `standardWeight` (Decimal, Optional) - Standard weight per portion
- `description` (String, Optional) - User-friendly description
- `isActive` (Boolean) - Whether portion size is currently available

---

### 4.3 FractionalStock

**Purpose**: Current state and quantities of fractional inventory items.

**Key Attributes**:
- `id` (UUID, Primary Key)
- `itemId` (UUID, Foreign Key → FractionalItem)
- `locationId` (UUID, Foreign Key → Location)
- `batchId` (String, Optional) - Batch identifier
- `currentState` (Enum) - RAW, PREPARED, PORTIONED, PARTIAL, COMBINED, WASTE
- `stateTransitionDate` (Timestamp) - When state last changed
- `qualityGrade` (Enum) - EXCELLENT, GOOD, FAIR, POOR, EXPIRED
- `wholeUnitsAvailable` (Decimal) - Complete whole units
- `partialQuantityAvailable` (Decimal) - Remaining partial quantity
- `totalPortionsAvailable` (Integer) - Total sellable portions
- `reservedPortions` (Integer) - Reserved for orders
- `originalWholeUnits` (Decimal) - Original quantity received
- `originalTotalPortions` (Integer) - Original total portions
- `conversionsApplied` (JSON Array) - Array of conversion IDs
- `totalWasteGenerated` (Decimal) - Cumulative waste
- `preparedAt` (Timestamp, Optional) - When item was prepared
- `portionedAt` (Timestamp, Optional) - When item was portioned
- `expiresAt` (Timestamp, Optional) - Expiry time
- `lastQualityCheck` (Timestamp, Optional) - Last manual quality check
- `qualityNotes` (Text, Optional) - Quality assessment notes
- `storageLocation` (String, Optional) - Physical storage location
- `batchNumber` (String, Optional) - Production batch number
- `supplierLotNumber` (String, Optional) - Supplier lot number
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Relationships**:
- Belongs to FractionalItem
- Belongs to Location
- Has many ConversionRecord records (as source or target)
- Has many InventoryAlert records

**Indexes**:
- `itemId, locationId, currentState`
- `currentState, qualityGrade`
- `expiresAt` (for expiry queries)
- `preparedAt` (for quality degradation)

---

### 4.4 ConversionRecord

**Purpose**: Detailed history of all conversion operations.

**Key Attributes**:
- `id` (UUID, Primary Key)
- `conversionType` (Enum) - SPLIT, COMBINE, PREPARE, PORTION, CONSUME, WASTE
- `fromState` (Enum) - Source state
- `toState` (Enum) - Target state
- `beforeWholeUnits` (Decimal) - Quantities before conversion
- `beforePartialQuantity` (Decimal)
- `beforeTotalPortions` (Integer)
- `afterWholeUnits` (Decimal) - Quantities after conversion
- `afterPartialQuantity` (Decimal)
- `afterTotalPortions` (Integer)
- `wasteGenerated` (Decimal) - Waste quantity
- `conversionEfficiency` (Decimal) - Actual vs expected ratio
- `conversionCost` (Decimal) - Cost of conversion
- `performedBy` (UUID, Foreign Key → User) - User who performed conversion
- `performedAt` (Timestamp) - When conversion occurred
- `reason` (Text, Optional) - Reason for conversion
- `notes` (Text, Optional) - Additional notes
- `qualityBefore` (Enum, Optional) - Quality before conversion
- `qualityAfter` (Enum, Optional) - Quality after conversion
- `sourceStockIds` (JSON Array) - Stock items used
- `targetStockIds` (JSON Array) - Stock items created
- `relatedOrderId` (UUID, Optional, Foreign Key → Order)

**Relationships**:
- Belongs to FractionalItem (via source/target stocks)
- References FractionalStock (source and target)
- Belongs to User (performed by)
- Optionally references Order

**Indexes**:
- `performedAt DESC` (for history queries)
- `performedBy, performedAt` (for user activity)
- `conversionType, performedAt` (for analytics)

---

### 4.5 InventoryAlert

**Purpose**: Smart alerts and recommendations for inventory actions.

**Key Attributes**:
- `id` (UUID, Primary Key)
- `type` (Enum) - PORTION_LOW, QUALITY_DEGRADING, CONVERSION_RECOMMENDED, WASTE_HIGH, EXPIRING_SOON, OPTIMAL_CONVERSION_TIME
- `severity` (Enum) - LOW, MEDIUM, HIGH, CRITICAL
- `itemId` (UUID, Foreign Key → FractionalItem)
- `stockId` (UUID, Foreign Key → FractionalStock)
- `locationId` (UUID, Foreign Key → Location)
- `title` (String) - Alert title
- `message` (Text) - Alert description
- `triggeredAt` (Timestamp) - When alert was triggered
- `triggeredBy` (String) - User ID or "SYSTEM"
- `recommendedActions` (JSON Array) - Array of recommended actions
- `isActive` (Boolean) - Whether alert is still active
- `acknowledgedAt` (Timestamp, Optional) - When acknowledged
- `acknowledgedBy` (UUID, Optional, Foreign Key → User)
- `resolvedAt` (Timestamp, Optional) - When resolved
- `resolutionNotes` (Text, Optional) - Resolution details

**Relationships**:
- Belongs to FractionalItem
- Belongs to FractionalStock
- Belongs to Location
- Optionally belongs to User (acknowledged by, resolved by)

**Indexes**:
- `isActive, severity` (for active alerts dashboard)
- `itemId, isActive`
- `locationId, isActive`
- `triggeredAt DESC`

---

### 4.6 ConversionRecommendation

**Purpose**: AI-powered conversion recommendations.

**Key Attributes**:
- `id` (UUID, Primary Key)
- `itemId` (UUID, Foreign Key → FractionalItem)
- `stockId` (UUID, Foreign Key → FractionalStock)
- `recommendationType` (Enum) - IMMEDIATE, SCHEDULED, DEMAND_BASED
- `priority` (Enum) - LOW, MEDIUM, HIGH, URGENT
- `fromState` (Enum) - Current state
- `toState` (Enum) - Recommended target state
- `recommendedWholeUnits` (Decimal) - Quantity to convert
- `recommendedPortions` (Integer) - Expected portions
- `reason` (Text) - Reason for recommendation
- `expectedBenefits` (JSON Array) - Array of expected benefits
- `potentialRisks` (JSON Array) - Array of potential risks
- `estimatedWaste` (Decimal) - Estimated waste
- `estimatedCost` (Decimal) - Estimated conversion cost
- `estimatedRevenue` (Decimal, Optional) - Estimated revenue
- `qualityImpact` (Decimal, Optional) - Quality impact score
- `recommendedBy` (String) - "SYSTEM" or user ID
- `recommendedAt` (Timestamp) - When recommendation generated
- `optimalExecutionTime` (Timestamp, Optional) - Best time to execute
- `expirationTime` (Timestamp, Optional) - When recommendation expires
- `status` (Enum) - PENDING, ACCEPTED, REJECTED, EXECUTED
- `acceptedBy` (UUID, Optional, Foreign Key → User)
- `acceptedAt` (Timestamp, Optional)
- `executionNotes` (Text, Optional)

**Relationships**:
- Belongs to FractionalItem
- Belongs to FractionalStock
- Optionally belongs to User (accepted by)

**Indexes**:
- `status, priority` (for pending recommendations)
- `itemId, status`
- `recommendedAt DESC`
- `expirationTime` (for expiry cleanup)

---

## 5. Integration Points

### 5.1 Product Management Module

**Integration Purpose**: Access base item information for fractional configuration.

**Data Flow**:
- Fractional Inventory reads item master data (code, name, category, base unit)
- Fractional Inventory checks if item exists before enabling fractional tracking
- Changes to item master data propagate to fractional item configuration

**API Endpoints**:
- `GET /api/products/{id}` - Retrieve product details
- `GET /api/products?category={category}` - List products by category

---

### 5.2 Point-of-Sale (POS) System

**Integration Purpose**: Deduct portion quantities from inventory when sales are made.

**Data Flow** (POS → Fractional Inventory):
1. POS sends sale transaction (item, portion size, quantity, location, order ID)
2. Fractional Inventory validates availability and quality
3. Fractional Inventory deducts portions from available inventory
4. Fractional Inventory returns confirmation with updated availability
5. Fractional Inventory creates sale operation record

**Data Flow** (Fractional Inventory → POS):
1. POS queries available portions (item, location)
2. Fractional Inventory returns available portions, quality, expiry time
3. POS displays availability to cashier/server

**API Endpoints**:
- `POST /api/fractional-inventory/sales` - Process sale transaction
- `POST /api/fractional-inventory/reservations` - Create portion reservation
- `GET /api/fractional-inventory/availability` - Query available portions
- `DELETE /api/fractional-inventory/reservations/{id}` - Cancel reservation

---

### 5.3 Recipe Management Module

**Integration Purpose**: Plan conversions based on recipe requirements and expected demand.

**Data Flow**:
- Recipe Management requests conversion planning (recipe ID, expected covers, meal period)
- Fractional Inventory analyzes current inventory and recipe requirements
- Fractional Inventory generates conversion recommendations
- Recipe Management displays recommendations to production staff

**API Endpoints**:
- `POST /api/fractional-inventory/conversion-planning` - Request conversion planning
- `GET /api/fractional-inventory/items/{id}/portions-available` - Check portion availability for recipe ingredients

---

### 5.4 Financial System (General Ledger)

**Integration Purpose**: Record cost of goods sold (COGS), waste costs, and inventory valuation.

**Data Flow**:
- Fractional Inventory calculates COGS for portion-level sales
- Fractional Inventory posts journal entries to General Ledger:
  - Debit: Cost of Goods Sold
  - Credit: Inventory Asset
- Fractional Inventory posts waste journal entries:
  - Debit: Waste Expense
  - Credit: Inventory Asset
- Fractional Inventory posts conversion cost journal entries:
  - Debit: Conversion Expense (or COGS)
  - Credit: Cash/Accounts Payable

**API Endpoints**:
- `POST /api/gl/journal-entries` - Post journal entries
- `GET /api/gl/accounts` - Retrieve GL account codes

---

### 5.5 Procurement Module

**Integration Purpose**: Trigger reorder when whole unit inventory falls below minimum.

**Data Flow**:
- Fractional Inventory monitors whole unit levels
- Fractional Inventory generates PORTION_LOW alerts
- Procurement receives notification to reorder
- Procurement creates purchase request for whole units

**API Endpoints**:
- `POST /api/procurement/reorder-triggers` - Trigger reorder alert
- `GET /api/procurement/vendors` - Retrieve vendor information

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| Requirement | Target | Measurement Method |
|-------------|--------|-------------------|
| Dashboard Load Time | <2 seconds | Page load to interactive |
| Dashboard Refresh Time | <1 second | Auto-refresh data fetch |
| Conversion Operation Processing | <3 seconds | Split/combine completion |
| POS Sale Deduction | <500ms | Sale request to confirmation |
| Alert Processing | <30 seconds | All stocks processed |
| Quality Grade Update | <1 minute | All stocks updated |
| Concurrent Users | 20 users | Simultaneous dashboard access |
| Database Query Response | <200ms | 95th percentile |

---

### 6.2 Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| Authentication | NextAuth with JWT tokens |
| Authorization | Role-Based Access Control (RBAC) |
| Data Encryption | TLS 1.3 in transit, AES-256 at rest |
| Audit Logging | All conversion operations logged with user ID, timestamp, IP address |
| Activity Tracking | Immutable audit trail for compliance |
| Session Management | 8-hour session timeout, automatic logout |
| Password Policy | Minimum 12 characters, complexity requirements |
| API Security | API key authentication, rate limiting (100 req/min per key) |

**Permission Matrix**:

| Operation | Coordinator | Manager | Financial | Admin |
|-----------|------------|---------|-----------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Configure Items | ❌ | ✅ | ✅ | ✅ |
| Perform Conversions | ✅ | ✅ | ✅ | ✅ |
| Override Quality | ❌ | ✅ | ✅ | ✅ |
| View Conversion History | ✅ | ✅ | ✅ | ✅ |
| Acknowledge Alerts | ✅ | ✅ | ✅ | ✅ |
| Resolve Alerts | ❌ | ✅ | ✅ | ✅ |
| Export Reports | ❌ | ✅ | ✅ | ✅ |
| Delete Records | ❌ | ❌ | ❌ | ✅ |

---

### 6.3 Reliability Requirements

| Requirement | Target | Implementation |
|-------------|--------|---------------|
| System Availability | 99.5% (43.8 hours downtime/year) | Load balancing, redundant servers |
| Data Backup | Daily incremental, weekly full | Automated backup with 30-day retention |
| Disaster Recovery | RTO <4 hours, RPO <1 hour | Hot standby database, automated failover |
| Transaction Reliability | ACID compliance | PostgreSQL transactions with isolation |
| Data Integrity | Zero data loss | Database constraints, validation, backups |
| Error Rate | <0.1% of operations | Comprehensive error handling, logging |

---

### 6.4 Usability Requirements

| Requirement | Implementation |
|-------------|---------------|
| Learning Curve | New users productive within 2 hours | Intuitive UI, tooltips, help documentation |
| Visual Clarity | Color-coded indicators, progress bars | Green/Yellow/Orange/Red quality/portion indicators |
| Mobile Responsiveness | Full functionality on tablets | Responsive design, touch-friendly controls |
| Accessibility | WCAG 2.1 AA compliance | Semantic HTML, ARIA labels, keyboard navigation |
| Language Support | English (primary), Thai (future) | i18n framework, translatable strings |
| Help Documentation | Context-sensitive help | Inline help text, user guide, video tutorials |

---

### 6.5 Scalability Requirements

| Requirement | Target | Implementation |
|-------------|--------|---------------|
| Concurrent Dashboard Users | 20 users | Efficient database queries, caching |
| Fractional Items Supported | 500 items | Indexed database tables |
| Stock Records | 10,000 active records | Pagination, filtering, archiving |
| Conversion Records Retained | 100,000 records | Indexed history table, archive strategy |
| Alert Processing | 1,000 stocks in <30 seconds | Batch processing, parallel execution |
| POS Integration Throughput | 100 sales/minute | Async processing, queue management |

---

### 6.6 Maintainability Requirements

| Requirement | Implementation |
|-------------|---------------|
| Code Quality | TypeScript strict mode, ESLint rules | Automated linting, code review |
| Documentation | Inline comments, API docs, user guides | JSDoc, Swagger/OpenAPI, user manual |
| Testing | 80% unit test coverage, E2E tests | Vitest, Playwright, automated CI/CD |
| Monitoring | Application performance monitoring (APM) | Sentry for errors, CloudWatch for metrics |
| Logging | Structured logging with severity levels | Winston logger, log aggregation |
| Deployment | Automated deployment pipeline | GitHub Actions, Docker containers |

---

### 6.7 Compliance Requirements

| Requirement | Implementation |
|-------------|---------------|
| Food Safety Compliance | Time-based quality tracking, expiry management | Automated quality degradation, alerts |
| Audit Trail | Immutable conversion history | Append-only audit log, database constraints |
| Data Retention | 7-year retention for financial records | Archive strategy, compliance reporting |
| Financial Reporting | Accurate COGS calculation, GL posting | Integration with Financial System |
| Inventory Accuracy | ±1% variance in physical counts | Dual-state tracking, waste tracking |

---

## 7. Assumptions and Constraints

### 7.1 Assumptions

1. **User Training**: Staff are trained on fractional inventory concepts and procedures
2. **Internet Connectivity**: Reliable internet connection for real-time updates
3. **Browser Compatibility**: Users access system via modern browsers (Chrome, Firefox, Safari, Edge)
4. **POS Integration**: POS system supports API integration for real-time sales deduction
5. **Quality Compliance**: Staff follow food safety protocols for preparation and storage
6. **Accurate Configuration**: Fractional item configurations (shelf life, waste percentage) are accurate
7. **Timely Actions**: Staff respond to alerts and perform recommended conversions promptly
8. **Physical Storage**: Adequate physical storage with proper temperature control

### 7.2 Constraints

1. **Technology Stack**: Must use Next.js 14.2+, TypeScript 5.8+, PostgreSQL 14+, Prisma 5.8+
2. **Single Tenant**: System supports only single-tenant deployment (no multi-tenancy)
3. **Location Count**: System supports up to 10 locations per tenant
4. **Concurrent Users**: Maximum 20 concurrent users accessing fractional inventory dashboard
5. **Mobile**: Web-based responsive UI only (no native mobile app)
6. **Language**: English only (internationalization planned for future)
7. **Integration**: Must integrate with existing ERP modules (Product, POS, Recipe, Finance)
8. **Budget**: Development within allocated budget and timeline
9. **Compliance**: Must comply with food safety regulations and financial reporting standards

---

## 8. Success Criteria

### 8.1 Business Outcomes

- **Inventory Accuracy**: Achieve ±1% variance between physical and system inventory for fractional items
- **Waste Reduction**: Reduce waste from conversion operations by 15% within 6 months
- **Service Level**: Maintain 95%+ availability of portions during service periods (no stockouts)
- **Conversion Efficiency**: Achieve average conversion efficiency of 90%+ across all items
- **Quality Compliance**: Ensure 98%+ of sold portions meet quality standards (EXCELLENT or GOOD)
- **Cost Visibility**: Provide accurate COGS for portion-level sales for profitability analysis
- **Staff Productivity**: Reduce time spent on manual inventory tracking by 30%

### 8.2 User Adoption

- **Training Completion**: 90%+ of staff complete training within 2 weeks
- **Dashboard Usage**: 80%+ of inventory staff use dashboard daily
- **Alert Response**: Average alert response time <1 hour during service periods
- **User Satisfaction**: Average user satisfaction score ≥4.0/5.0
- **Support Tickets**: <5 support tickets per week after initial 1-month period

### 8.3 Technical Performance

- **System Availability**: 99.5%+ uptime
- **Dashboard Load Time**: <2 seconds for initial load
- **POS Integration**: <500ms response time for sale deductions
- **Data Accuracy**: Zero data integrity issues
- **Error Rate**: <0.1% of operations result in errors

---

## 9. Future Enhancements (Out of Scope for Initial Release)

### 9.1 Phase 2 Enhancements (6-12 months)

- **IoT Sensor Integration**: Automatic quality monitoring via temperature and humidity sensors
- **Machine Learning Forecasting**: Advanced demand prediction using ML models
- **Mobile App**: Native mobile app for floor staff with offline capability
- **Voice Commands**: Voice-activated conversion operations for hands-free operation
- **Multi-Language Support**: Thai language support for local operations
- **Advanced Analytics**: Business intelligence dashboard with trend analysis

### 9.2 Phase 3 Enhancements (12-18 months)

- **Blockchain Integration**: Immutable audit trails for regulatory compliance
- **Multi-Tenant Support**: Support for franchise operations with centralized management
- **GraphQL API**: More flexible API for complex queries and integrations
- **Webhook Support**: Real-time notifications for external systems
- **Advanced Automation**: Fully automated conversion operations based on AI recommendations
- **Sustainability Metrics**: Carbon footprint tracking and waste reduction goals

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Fractional Inventory** | Inventory items that can be sold in portions or fractions rather than only as whole units |
| **Multi-State Tracking** | Tracking inventory through multiple lifecycle states (RAW, PREPARED, PORTIONED, etc.) |
| **Conversion Operation** | Process of transforming inventory between states (e.g., splitting whole units into portions) |
| **Split Operation** | Converting whole items into multiple sellable portions |
| **Combine Operation** | Merging multiple portions back into whole units |
| **Quality Grade** | Assessment of item quality (EXCELLENT, GOOD, FAIR, POOR, EXPIRED) based on time and conditions |
| **Shelf Life** | Maximum time an item can be held after preparation before it must be discarded |
| **Quality Degradation** | Natural decline in quality over time due to aging and environmental factors |
| **Conversion Efficiency** | Ratio of actual portions created to expected portions (accounting for waste) |
| **Waste Percentage** | Amount of material lost during conversion operations as a percentage of input |
| **Portion Size** | Defined serving size for fractional items (e.g., slice, half, quarter) |
| **Portions-Per-Whole** | Number of portions that can be created from one whole unit |
| **Reserved Portions** | Portions allocated to specific orders but not yet fulfilled |
| **Available Portions** | Portions available for sale (not reserved) |
| **Prepared-At Timestamp** | Time when item was prepared and quality tracking began |
| **Expiry Time** | Time when item reaches end of shelf life and must be discarded |
| **Smart Alert** | Intelligent notification based on inventory levels, quality, demand patterns |
| **Conversion Recommendation** | AI-generated suggestion for optimal conversion timing and quantity |
| **COGS** | Cost of Goods Sold - total cost of portions sold including base cost, conversion cost, and waste allocation |

---

**End of Business Requirements Document**
