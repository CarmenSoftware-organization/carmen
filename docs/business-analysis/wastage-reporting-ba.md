# Wastage Reporting Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive business analysis of the Wastage Reporting module within the Carmen F&B Management System. It details the business rules, processes, and technical requirements for tracking, reporting, and analyzing inventory wastage across all locations.

### 1.2 Scope
- Wastage recording and documentation
- Reason code management
- Cost impact analysis
- Approval workflow management
- Wastage trend analysis
- Integration with inventory and financial modules
- Analytics and reporting capabilities

### 1.3 Audience
- Store Operations Team
- Inventory Management Team
- Finance Team
- Quality Control Team
- Store Managers
- Department Heads
- System Administrators
- Development Team

### 1.4 Version History
| Version | Date | Author | Description |
|---------|------|---------|-------------|
| 1.0.0 | 2024-03-20 | System Analyst | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Accurately track and document all inventory wastage
- Identify and analyze wastage patterns and trends
- Reduce operational losses through better monitoring
- Ensure compliance with food safety regulations
- Improve inventory management efficiency
- Enable data-driven waste reduction strategies
- Maintain accurate cost accounting

### 2.2 Module Overview
The Wastage Reporting module manages the process of recording, tracking, and analyzing inventory losses due to various reasons such as expiration, damage, quality issues, or operational errors. It provides structured workflows for documenting wastage, obtaining necessary approvals, and generating insights for waste reduction initiatives.

### 2.3 Key Stakeholders
- Store Managers
- Department Supervisors
- Inventory Controllers
- Quality Control Team
- Finance Team
- Operations Managers
- Compliance Officers
- Cost Controllers

## 3. Business Rules

### 3.1 Recording Rules (WR_REC)
- **WR_REC_001**: All wastage must be recorded with date, time, and location
- **WR_REC_002**: Each wastage entry must specify quantity and unit of measure
- **WR_REC_003**: Valid reason code must be assigned to each wastage entry
- **WR_REC_004**: Supporting documentation (photos) required for significant wastage
- **WR_REC_005**: Batch/lot numbers must be recorded when applicable
- **WR_REC_006**: Wastage cost must be calculated using current average cost
- **WR_REC_007**: Multiple items can be included in a single wastage report
- **WR_REC_008**: System must track who recorded the wastage
- **WR_REC_009**: Comments/notes field required for unusual wastage amounts
- **WR_REC_010**: Quality issues must include specific defect descriptions

### 3.2 Approval Rules (WR_APR)
- **WR_APR_001**: Wastage above threshold requires manager approval
- **WR_APR_002**: Different approval levels based on wastage value
- **WR_APR_003**: Emergency wastage requires immediate supervisor review
- **WR_APR_004**: Bulk wastage requires department head approval
- **WR_APR_005**: Quality-related wastage needs QC team verification
- **WR_APR_006**: Approvers must provide comments for rejections
- **WR_APR_007**: Time limit for approval/rejection decisions
- **WR_APR_008**: Email notifications for pending approvals
- **WR_APR_009**: Escalation for overdue approval requests
- **WR_APR_010**: System must maintain approval audit trail

### 3.3 Calculation Rules (WR_CALC)
- **WR_CALC_001**: Wastage Cost = Quantity × Current Average Unit Cost
- **WR_CALC_002**: Wastage Percentage = (Wastage Quantity / Total Stock) × 100
- **WR_CALC_003**: Daily Wastage Rate = Total Daily Wastage / Daily Sales
- **WR_CALC_004**: Weekly Wastage Trend = Current Week Wastage / Average Weekly Wastage
- **WR_CALC_005**: Cost Impact = Sum of All Wastage Costs in Period
- **WR_CALC_006**: Category Wastage = Sum of Item Wastage in Category
- **WR_CALC_007**: Location Wastage = Sum of All Wastage at Location
- **WR_CALC_008**: Reason Code Analysis = Sum of Wastage by Reason
- **WR_CALC_009**: Time-based Analysis = Wastage by Hour/Day/Week
- **WR_CALC_010**: Seasonal Patterns = Current vs Historical Wastage

### 3.4 Validation Rules (WR_VAL)
- **WR_VAL_001**: Wastage quantity cannot exceed current stock
- **WR_VAL_002**: Wastage date cannot be in the future
- **WR_VAL_003**: Reason code must be from approved list
- **WR_VAL_004**: Required fields must be completed
- **WR_VAL_005**: Photo required for wastage above threshold
- **WR_VAL_006**: Valid location code required
- **WR_VAL_007**: Valid product code required
- **WR_VAL_008**: Quantity must be greater than zero
- **WR_VAL_009**: Cost calculations must be verified
- **WR_VAL_010**: Approval levels must match thresholds

### 3.5 UI Rules (WR_UI)
- **WR_UI_001**: Display wastage entries in reverse chronological order with pagination (20 items per page)
- **WR_UI_002**: Color-code wastage status indicators (Draft: Gray, Pending: Yellow, Approved: Green, Rejected: Red)
- **WR_UI_003**: Show cost impact prominently with currency symbol and 2 decimal places
- **WR_UI_004**: Provide reason code quick selection with search and category filtering
- **WR_UI_005**: Enable batch entry for multiple items with spreadsheet-like grid interface
- **WR_UI_006**: Show approval status with timestamp and approver details in tooltip
- **WR_UI_007**: Display wastage trends graphically with daily/weekly/monthly toggle
- **WR_UI_008**: Allow photo attachment preview with thumbnail grid and full-size modal
- **WR_UI_009**: Provide search and filter options with advanced filtering panel
- **WR_UI_010**: Show validation errors clearly next to relevant fields in red
- **WR_UI_011**: All monetary amounts must be displayed with 2 decimal places
- **WR_UI_012**: All quantities must be displayed with 3 decimal places
- **WR_UI_013**: All numeric values must be left-aligned
- **WR_UI_014**: All numeric values must use the system's regional numeric format
- **WR_UI_015**: All dates must be displayed using the system's regional format with UTC offset
- **WR_UI_016**: Date inputs must enforce regional format validation
- **WR_UI_017**: Calendar controls must indicate working days and holidays
- **WR_UI_018**: Time zone conversions must respect daylight saving rules
- **WR_UI_019**: Date range validations must consider time zone differences
- **WR_UI_020**: Provide visual indicators for items with high wastage percentage

### 3.6 System Calculation Rules (WR_SYS)
- **WR_SYS_001**: Item Wastage Cost = Quantity (3 decimals) × Current Average Unit Cost (5 decimals)
- **WR_SYS_002**: Total Wastage Cost = Sum of all Item Wastage Costs (rounded to 2 decimals)
- **WR_SYS_003**: Wastage Percentage = (Wastage Quantity / Total Stock) × 100 (rounded to 2 decimals)
- **WR_SYS_004**: Daily Wastage Rate = (Total Daily Wastage Cost / Daily Sales) × 100 (2 decimals)
- **WR_SYS_005**: Weekly Trend = ((Current Week Wastage - Average Weekly Wastage) / Average Weekly Wastage) × 100 (2 decimals)
- **WR_SYS_006**: Moving Average = Sum of Last 4 Weeks Wastage / 4 (2 decimals)
- **WR_SYS_007**: Category Impact = (Category Wastage Cost / Total Wastage Cost) × 100 (2 decimals)
- **WR_SYS_008**: Location Performance = (Location Wastage / Location Sales) × 100 (2 decimals)
- **WR_SYS_009**: YTD Wastage = Sum of All Wastage Costs for Current Year (2 decimals)
- **WR_SYS_010**: Cost Variance = ((Current Period Cost - Previous Period Cost) / Previous Period Cost) × 100 (2 decimals)
- **WR_SYS_011**: All calculations involving currency must maintain 5 decimal precision internally
- **WR_SYS_012**: All percentage calculations must maintain 4 decimal precision internally
- **WR_SYS_013**: Rounding must be performed only at final display step
- **WR_SYS_014**: Quantity conversions must maintain 3 decimal precision
- **WR_SYS_015**: Time-based calculations must account for timezone differences
- **WR_SYS_016**: Period comparisons must align to local business day boundaries
- **WR_SYS_017**: Historical averages must exclude outliers (beyond 2 standard deviations)
- **WR_SYS_018**: Seasonal adjustments must consider trailing 13 months of data
- **WR_SYS_019**: Performance metrics must be normalized for business days
- **WR_SYS_020**: System must track rounding differences for reconciliation

### 3.7 Integration Rules (WR_INT)
- **WR_INT_001**: Update inventory levels automatically
- **WR_INT_002**: Sync with financial module for costing
- **WR_INT_003**: Interface with approval workflow system
- **WR_INT_004**: Connect to notification system
- **WR_INT_005**: Link to quality control module
- **WR_INT_006**: Update analytics dashboard
- **WR_INT_007**: Sync with master data
- **WR_INT_008**: Interface with reporting module
- **WR_INT_009**: Connect to document management
- **WR_INT_010**: Link to audit trail system

## 4. Data Definitions

### 4.1 Wastage Entry
```typescript
interface WastageEntry {
  id: number
  locationId: string
  dateTime: string // ISO 8601 format with timezone
  recordedBy: string
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
  totalCost: number
  comments: string
  attachments: WastageAttachment[]
  items: WastageItem[]
  approvalRequired: boolean
  createdAt: string // ISO 8601 format with timezone
  updatedAt: string // ISO 8601 format with timezone
}

interface WastageItem {
  id: number
  wastageEntryId: number
  productId: string
  quantity: number
  uom: string
  reasonCode: string
  batchNumber?: string
  expiryDate?: string // ISO 8601 format with timezone
  unitCost: number
  totalCost: number
  comments: string
}

interface WastageAttachment {
  id: number
  wastageEntryId: number
  fileType: 'Image' | 'Document'
  fileName: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string // ISO 8601 format with timezone
}
```

### 4.2 Reason Codes
```typescript
interface WastageReason {
  code: string
  category: 'Expiry' | 'Damage' | 'Quality' | 'Production' | 'Other'
  description: string
  requiresPhoto: boolean
  requiresApproval: boolean
  active: boolean
}
```

### 4.3 Approval Workflow
```typescript
interface WastageApproval {
  id: number
  wastageEntryId: number
  level: number
  approverRole: string
  approverId: string
  status: 'Pending' | 'Approved' | 'Rejected'
  comments: string
  actionDate: string // ISO 8601 format with timezone
  notifiedAt: string // ISO 8601 format with timezone
  reminderCount: number
}
```

## 5. Logic Implementation

### 5.1 Wastage Recording Process
- Entry Creation:
  - Data collection
  - Validation checks
  - Cost calculation
  - Attachment handling
- Approval Routing:
  - Threshold checking
  - Approver determination
  - Notification dispatch
  - Status tracking

### 5.2 Analysis Process
- Data Aggregation:
  - Period summaries
  - Category analysis
  - Trend calculation
  - Pattern detection
- Report Generation:
  - Cost impact analysis
  - Reason analysis
  - Location comparison
  - Trend visualization

### 5.3 Integration Process
- Inventory Update:
  - Stock reduction
  - Cost adjustment
  - History tracking
- Financial Processing:
  - Cost allocation
  - Account posting
  - Period closing
  - Reconciliation

## 6. Validation and Testing

### 6.1 Data Validation
- Entry validation
- Cost calculation
- Approval routing
- Integration verification
- Performance testing

### 6.2 Business Rule Validation
- Recording rules
- Approval rules
- Calculation rules
- Integration rules
- UI rules

### 6.3 Test Scenarios
- Normal wastage flow
- Bulk wastage entry
- Approval workflow
- Integration testing
- Exception handling

### 6.4 Error Handling
- Validation errors
- Integration failures
- Approval issues
- System timeouts
- Recovery procedures

## 7. Maintenance and Governance

### 7.1 Module Ownership
- Primary Owner: Operations Team
- Technical Owner: IT Development Team
- Business Process Owner: Store Operations Manager

### 7.2 Review Process
- Daily wastage review
- Weekly trend analysis
- Monthly performance review
- Quarterly process audit

### 7.3 Change Management
- Reason code updates
- Threshold adjustments
- Workflow modifications
- Integration changes
- Documentation updates

## 8. Appendices

### 8.1 Glossary
- Wastage: Any loss of inventory due to damage, expiry, or quality issues
- PAR: Periodic Automatic Replenishment
- UOM: Unit of Measure
- QC: Quality Control

### 8.2 References
- Food Safety Guidelines
- Inventory Management Policy
- Cost Accounting Standards
- Quality Control Procedures
- System Architecture Document

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Analyst | | | |
| Technical Lead | | | |
| Operations Manager | | | |
| System Architect | | | | 