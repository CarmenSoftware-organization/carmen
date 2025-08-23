# Purchase Requests Screen Specification

**Module**: Procurement  
**Function**: Purchase Request Management  
**Screen**: Purchase Requests List  
**Version**: 1.0  
**Date**: January 22, 2025  
**Status**: Based on Actual Source Code Analysis

## Implementation Overview

- **Purpose**: Comprehensive management interface for purchase request lifecycle from creation through approval and conversion to purchase orders
- **File Locations**: `app/(main)/procurement/purchase-requests/page.tsx`, related component files
- **User Types**: Purchasing staff (full access), department managers (approval), financial managers (budget approval), staff (limited viewing)
- **Current Status**: Core functionality operational with approval workflows and status tracking

## Visual Reference

![Purchase Requests Screen](../procurement-purchase-requests.png)

## Layout & Navigation

### Header Section
- **Module Breadcrumb**: Shows "Procurement > Purchase Requests" navigation path
- **Page Title**: "Purchase Requests" with current record count display
- **Primary Actions**: "Create New PR" button prominently positioned for quick access
- **Secondary Actions**: Bulk operations, export options, and advanced filters

### Filter and Search Controls
- **Global Search**: Text search across PR numbers, descriptions, and vendor names
- **Status Filters**: Quick filter buttons for Draft, Pending, Approved, Rejected, Converted statuses
- **Date Range Selectors**: Filter PRs by creation date, required date, or approval date
- **Advanced Filters**: Dropdown panels for department, requestor, priority level, and amount ranges
- **Active Filter Display**: Visible indicators showing currently applied filters with clear options

### Layout Structure
- **Full-Width Table**: Optimized for displaying comprehensive PR information
- **Fixed Header**: Column headers remain visible during scrolling
- **Responsive Design**: Table columns adjust based on viewport width
- **Action Column**: Consistent placement of row-level actions on the right

## Data Display

### Table Columns
- **PR Number**: System-generated unique identifier with clickable link to detail view
- **Description**: Brief PR purpose or title with truncation for long descriptions
- **Requestor**: Name of employee who created the PR with department indication
- **Department**: Originating department for budget allocation and approval routing
- **Status**: Color-coded status badges (Draft, Pending Approval, Approved, Rejected, Converted)
- **Priority**: Visual priority indicators (High, Medium, Low) with appropriate color coding
- **Total Amount**: Formatted currency display with budget impact visualization
- **Required Date**: When items are needed with urgency indicators for overdue items
- **Created Date**: PR creation timestamp for audit trail and aging analysis
- **Actions**: Dropdown menu with context-appropriate options (View, Edit, Approve, etc.)

### Status Indicators
- **Visual Status System**: Consistent color coding across all status representations
- **Progress Tracking**: Visual indication of PR position in approval workflow
- **Urgency Markers**: Special indicators for expedited or overdue requests
- **Budget Alerts**: Warnings for PRs approaching or exceeding budget limits

### Data Formatting
- **Currency Display**: Consistent formatting with company currency standards
- **Date Presentation**: Relative dates (e.g., "2 days ago") with full date on hover
- **Text Truncation**: Smart truncation with expand options for long descriptions
- **Responsive Text**: Font sizing and spacing optimized for different screen sizes

## User Interactions

### Table Operations
- **Sortable Columns**: Click column headers to sort by any displayed field
- **Multi-Column Sorting**: Hold Shift to sort by multiple columns simultaneously
- **Row Selection**: Checkbox selection for bulk operations
- **Row Click Navigation**: Click anywhere on row (except actions) to view PR details
- **Pagination Controls**: Navigate through large result sets with page size options

### Bulk Operations
- **Multi-Select**: Checkbox interface for selecting multiple PRs
- **Bulk Actions Menu**: Actions available for selected items (Approve, Export, Delete)
- **Bulk Status Updates**: Change status of multiple PRs simultaneously (where permitted)
- **Batch Export**: Export selected PRs to various formats (Excel, PDF, CSV)

### Filter Interactions
- **Quick Filters**: Single-click status filters with active state indication
- **Advanced Filter Panel**: Expandable panel with comprehensive filter options
- **Filter Combinations**: Logical AND/OR combinations of multiple filter criteria
- **Saved Searches**: Ability to save and recall frequently used filter combinations
- **Clear Filters**: One-click option to reset all active filters

### Context Menus
- **Row-Level Actions**: Right-click context menus with role-appropriate options
- **Quick Actions**: Common operations like View, Edit, Copy, Approve accessible via menu
- **Keyboard Shortcuts**: Support for keyboard navigation and common actions
- **Mobile Touch**: Touch-friendly interactions for tablet and mobile access

## Role-Based Functionality

### Staff User Access
- **View Own PRs**: Can see purchase requests they created or are involved with
- **Read-Only Mode**: Cannot modify PRs after submission, limited to viewing status
- **Create New PRs**: Can initiate new purchase requests following department guidelines
- **Status Tracking**: Can monitor progress of their submitted requests through workflow

### Department Manager Access
- **Department Scope**: Full access to all PRs originating from their department
- **Approval Authority**: Can approve PRs within designated spending limits
- **Team Overview**: Dashboard view of all team member PR activity and status
- **Budget Management**: Visibility into departmental spending and budget utilization
- **Workflow Control**: Can expedite or hold PRs based on departmental priorities

### Financial Manager Access
- **Financial Review**: Access to all PRs requiring financial approval above threshold limits
- **Budget Analysis**: Cross-departmental view of spending patterns and budget performance
- **Approval Workflow**: Final approval authority for high-value or budget-impacting PRs
- **Financial Reporting**: Access to financial analytics and spending trend analysis
- **Vendor Analysis**: Financial performance metrics for vendor relationships and pricing

### Purchasing Staff Access
- **Complete Access**: Full CRUD operations on all purchase requests across departments
- **Workflow Management**: Can advance PRs through approval process and handle exceptions
- **Vendor Coordination**: Can modify PRs based on vendor feedback and availability
- **Conversion Authority**: Can convert approved PRs to purchase orders
- **Process Optimization**: Can modify PR workflows and approval routing as needed

### Counter Staff Access
- **Inventory Context**: Can view PRs related to inventory items and stock management
- **Stock Level Integration**: PR information includes current inventory levels and consumption data
- **Receiving Coordination**: Can link PRs to expected deliveries and goods receipt processes
- **Location-Specific**: Access limited to PRs relevant to their assigned location or warehouse

### Chef Access
- **Recipe Integration**: Can create PRs for recipe ingredients and kitchen supplies
- **Menu Planning**: PR creation integrated with menu planning and ingredient forecasting
- **Cost Control**: Visibility into food cost implications and recipe profitability impact
- **Production Scheduling**: Can align PR timing with production schedules and menu cycles

## Business Rules & Validation

### Approval Workflow Rules
- **Hierarchical Approval**: PRs route through department manager, then financial approval if required
- **Spending Thresholds**: Automatic routing based on PR total amount and department budgets
- **Emergency Override**: Expedited approval process for urgent operational requirements
- **Delegation Rules**: Approval authority can be delegated during absence or vacation periods

### Data Validation Rules
- **Required Fields**: PR description, requestor, department, and at least one line item mandatory
- **Budget Validation**: Real-time budget checking against department allocations
- **Vendor Validation**: Preferred vendor recommendations based on item categories and history
- **Date Logic**: Required dates must be future dates with realistic lead times

### Status Progression Logic
- **Linear Workflow**: PRs progress through defined states without skipping stages
- **Rejection Handling**: Rejected PRs can be revised and resubmitted with change tracking
- **Conversion Process**: Approved PRs automatically available for PO conversion
- **Audit Trail**: Complete history of status changes with timestamps and user attribution

## Current Limitations

### Development Status
- **Real-Time Updates**: Partial implementation of live status updates, refresh required for latest data
- **Advanced Reporting**: Enhanced reporting and analytics features in development
- **Mobile Optimization**: Interface optimized for desktop, mobile improvements planned
- **Workflow Customization**: Limited workflow customization options, expansion planned

### Integration Dependencies
- **Budget System**: Integration with formal budget management system in progress
- **Vendor Catalog**: Full vendor catalog integration pending external system connections
- **Notification System**: Email and mobile notifications partially implemented
- **Document Management**: Attachment and document handling capabilities being enhanced

### Performance Considerations
- **Large Dataset Handling**: Optimization needed for departments with high PR volumes
- **Search Performance**: Complex filter combinations may experience slower response times
- **Concurrent Users**: Performance tuning required for high concurrent user scenarios
- **Export Operations**: Large data exports may require background processing

---

*This specification reflects the current Purchase Requests screen implementation and should be updated as features are enhanced and workflows are refined.*