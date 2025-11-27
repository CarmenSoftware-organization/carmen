# Purchase Request Detail Screen Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Screen**: Purchase Request Detail  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This screen provides a comprehensive interface for viewing, editing, and managing individual purchase requests. Users can view complete purchase request details, edit information based on their permissions, manage item requests with full approval workflows, and track the complete approval process with role-based actions.

**File Locations**: 
- Main component: PRDetailPage.tsx
- Related tabs: ItemsTab.tsx, WorkflowTab.tsx, ActivityTab.tsx

**User Types**: All authenticated users can access this screen, with different editing and approval capabilities based on role permissions and workflow stage.

**Current Status**: Core viewing and editing functionality fully implemented, with comprehensive workflow decision engine and role-based access controls. Some workflow actions use placeholder implementations for backend integration.

---

## Layout & Navigation

### **Header/Title Area**
- **Navigation**: Back button with chevron icon returns to purchase request list
- **Dynamic Title**: 
  - New request mode: "Create New Purchase Request"  
  - Existing request: Shows PR reference number or "Purchase Request Details"
- **Status Display**: Color-coded status badge showing current approval stage (visible for existing requests)
- **Subtitle**: "Purchase Request" label for context identification

### **Action Buttons**
- **Edit Controls**: Edit button switches to editable mode (permission-dependent visibility)
- **Save/Cancel**: Save button commits changes and returns to view mode, Cancel discards changes
- **Document Actions**: Print, Export, and Share buttons for document management
- **Sidebar Toggle**: Panel control with tooltip to show/hide comments and activity sidebar

### **Layout Structure**
- **Responsive Design**: Single column on mobile, multi-column layout on desktop
- **Card-Based Layout**: Main content organized in card containers with consistent spacing
- **Flex Layout**: Header adapts from vertical stack on mobile to horizontal layout on desktop

---

## Data Display

### **Primary Information Fields** (4-column responsive grid)

**Date Field**
- Calendar icon for visual identification
- View mode: Displays date in DD/MM/YYYY format
- Edit mode: Date picker input with role-based editing restrictions

**Purchase Request Type**
- Tag icon indicating categorization
- View mode: Shows selected PR type as readable text
- Edit mode: Dropdown selector with predefined purchase request categories

**Requestor Information**
- User icon for person identification
- View mode: Displays full name of person making the request
- Edit mode: Text input field with role-based editing permissions

**Department Assignment**
- Building icon representing organizational unit
- View mode: Shows department name or "Not specified" if not assigned
- Edit mode: Text input field for department assignment

### **Secondary Information Section** (2-column layout)

**Description Area**
- File icon indicating detailed information
- View mode: Description text in highlighted background area
- Edit mode: Multi-line text area with placeholder guidance
- Shows "No description" when field is empty

**Workflow Progress Display**
- Compact workflow indicator showing current approval stage
- Visual progress representation of approval process
- Shows "No workflow data available" for new purchase requests

### **Tabbed Content Navigation** (3 main sections)
- **Items Tab**: Comprehensive item management with detailed product information and approval controls
- **Budgets Tab**: Budget tracking and financial summary information 
- **Workflow Tab**: Complete approval workflow status and history tracking

### **Transaction Summary Section** (Financial role-restricted)
- **Visibility Control**: Only visible to users with financial information access
- **Currency Display**: Shows transaction totals in base currency (USD default)
- **Summary Content**: Comprehensive financial breakdown of all requested items

### **Sidebar Content** (Toggleable panel)
- **Comments & Attachments**: Document collaboration and file management
- **Activity Log**: Complete audit trail of all purchase request activities and changes

---

## User Interactions

### **Item Management** (Items Tab - Primary Interface)

#### **View Mode Options**
- **Table View**: Primary display with sortable columns and expandable row details
- **Mobile Card View**: Touch-optimized card layout for smaller screens  
- **Auto-Expand Setting**: Toggle to automatically show details when hovering over items

#### **Item Table Structure**
**Column Organization** (8 main columns):
1. **Selection Controls**: Individual checkboxes plus select all functionality
2. **Row Numbering**: Sequential item numbers with expand/collapse toggle
3. **Location & Status**: Delivery destinations with color-coded approval status badges
4. **Product Information**: Item names and detailed descriptions
5. **Requested Quantities**: Requested amounts with units of measure
6. **Approved Quantities**: Approved amounts (editable by authorized roles)
7. **Pricing Information**: Cost data and currency (role-dependent visibility)
8. **Action Menu**: Context-sensitive dropdown with workflow actions

#### **Row Interaction Behavior**
- **Summary Display**: Main row shows essential item information with hover highlighting
- **Detailed View**: Expanded rows reveal comprehensive item details including inventory levels and vendor information
- **Expansion Control**: Manual expansion persists until collapsed, auto-expansion shows details temporarily on hover

#### **Item Information Fields**

**Basic Request Information** (requestor-editable):
- **Product Selection**: Choose items from available product catalog via dropdown
- **Product Description**: Detailed item specifications (read-only reference)
- **Delivery Location**: Select destination from available location list
- **Requested Quantity**: Enter requested amounts with decimal precision support
- **Unit of Measure**: Select appropriate measurement units from standard list
- **Required Delivery Date**: Set delivery deadlines using date picker
- **Item Comments**: Add item-specific notes and special instructions

**Approval Information** (approver-controlled):
- **Approved Quantity**: Set final approved amounts for each item
- **Item Status**: System-managed approval state (Pending/Approved/Rejected/Review)

**Purchasing Information** (purchaser-managed):
- **Vendor Selection**: Choose and assign vendors with company details
- **Pricelist Reference**: Link to specific vendor pricing agreements
- **Unit Pricing**: Set per-unit costs from selected vendor sources
- **Currency Handling**: Multi-currency support with automatic conversion
- **Free of Charge Items**: Track complimentary quantities from vendors
- **Total Calculations**: Automatic cost calculations including adjustments

**Inventory Reference** (display-only information):
- **Current Stock Levels**: Real-time inventory across all locations
- **Outstanding Orders**: Quantities already on order from suppliers
- **Reorder Thresholds**: Minimum stock levels triggering reorder alerts
- **Target Stock Levels**: Optimal inventory quantities for replenishment
- **Inventory Units**: Base measurement units for stock tracking

**Business Classification** (optional categorization):
- **Job Code Assignment**: Link items to specific projects for cost tracking
- **Event Classification**: Categorize by events or special occasions
- **Project References**: Associate with broader project initiatives
- **Market Segment**: Classify by business segments for reporting

### **Bulk Operations**
- **Item Selection**: Multi-select functionality with individual and select-all options
- **Status Analysis**: Automatic analysis of selected items by approval status
- **Mixed Status Handling**: Smart handling when selected items have different approval states
- **Bulk Actions Available**:
  - Approve multiple selected items simultaneously
  - Reject selected items with reasons
  - Return items for review with comments
  - Split items into multiple line entries (planned feature)
  - Bulk update delivery dates across selected items

### **Vendor Comparison Feature**
- **Trigger Access**: Available through vendor pricing section for authorized users
- **Comparison Dialog**: Modal interface for evaluating multiple vendor options
- **Pricing Analysis**: Side-by-side comparison of vendor pricing and terms
- **Vendor Selection**: Direct selection and assignment of preferred vendors
- **Pricelist Integration**: Link selected vendors to specific pricing agreements

---

## Role-Based Functionality

### **Staff/Requestor Capabilities**
- Edit core item request information (product, location, quantity, delivery dates, comments)
- Add new items to existing purchase requests
- Remove items from their own requests
- View approved quantities and status updates (read-only access)

### **Approver Capabilities** (Department Managers, Financial Managers)
- View complete item details and request information
- Edit and approve quantities for items within their authority
- Individual item approval actions (Approve, Reject, Return for review)
- Bulk approval operations across multiple selected items
- Full visibility of pricing and financial information

### **Purchaser Capabilities** (Purchasing Staff)
- All approver permissions plus purchasing-specific functions
- Edit vendor assignments and pricing information
- Manage free-of-charge quantities and special terms
- Access vendor comparison tools for competitive analysis
- Configure delivery points and business dimension classifications

### **Expanded Row Details**

#### **Detail Expansion Controls**
- **Auto-Expand Toggle**: Checkbox setting to enable automatic detail display on hover
- **Manual Expansion**: Click chevron icons to permanently expand/collapse item details  
- **Hover Expansion**: Temporary detail display when auto-expand is enabled
- **Visual Indicators**: Clear distinction between manual and automatic expansion states

#### **Detailed Information Layout**
**Two-Column Detail Structure**:
- **Left Column - Inventory & Delivery**: Stock levels, order quantities, delivery information, and reorder thresholds
- **Right Column - Business Dimensions**: Job codes, event classifications, project assignments, and market segments

**Full-Width Pricing Section** (role-restricted visibility):
- **Vendor Information**: Selected vendor details and company information
- **Pricing Details**: Unit prices, currency information, and pricelist references
- **Cost Calculations**: Total amounts, free-of-charge quantities, and pricing adjustments

### **Smart Workflow Actions**
#### **Workflow Decision Engine**
- **Automatic Analysis**: System automatically analyzes item statuses to determine available workflow actions
- **Role-Based Actions**: Available actions change based on user role and current item status
- **Smart Button Display**: Workflow buttons adapt to current context and user permissions

#### **Available Workflow Actions** (context-dependent)
- **Individual Item Actions**: Approve, reject, or return specific items with comments
- **Bulk Actions**: Apply actions to multiple selected items simultaneously
- **History Tracking**: View complete change history for individual items

### **Pricing Visibility Management**
#### **Role-Based Pricing Display**
- **Requestor Visibility**: Pricing information shown based on user account settings
- **Approver Access**: Department and financial managers always see full pricing details
- **Purchaser Access**: Purchasing staff have complete access to all pricing and vendor information
- **Conditional Display**: Pricing columns and sections appear/hide based on user permissions and settings

### **Floating Action Menu** (Smart workflow interface)
- **Position**: Fixed bottom-right corner for easy access
- **Visibility Control**: Appears in view mode when user has available workflow actions  
- **Workflow Summary**: Shows current item status breakdown and workflow reasoning
- **Dynamic Actions**: Role-specific action buttons (Requestor: Delete/Submit, Approvers: Workflow actions)

---

## Business Rules & Validation

### **Field Requirements**
- **Mandatory Fields**: Product selection, requested quantity, delivery location, and delivery date required for all items
- **Optional Fields**: Comments, business dimensions, and special instructions are optional
- **Role-Based Editing**: Field editability controlled by user role and current workflow stage

### **Validation Rules**  
- **Quantity Validation**: Requested and approved quantities must be positive numbers
- **Date Validation**: Delivery dates cannot be in the past
- **Currency Consistency**: All pricing within a request must use consistent currency
- **Vendor Assignment**: Items must have vendor assignments before final approval

### **Workflow Logic**
- **Sequential Approval**: Items progress through defined approval stages based on request value and type
- **Role-Based Actions**: Available actions depend on user role and current item status
- **Status Transitions**: Items can only move to valid next states based on business rules
- **Bulk Operation Rules**: Mixed-status bulk operations prompt user for scope selection

---

## Current Limitations

### **Placeholder Features**
- **Backend Integration**: All workflow actions currently log to console without permanent changes
- **Real-time Data**: Inventory levels and pricing use static mock data instead of live feeds
- **History Tracking**: Item change history and audit trails use placeholder implementations
- **Split Functionality**: Item splitting feature planned but not yet implemented

### **Missing Integration**
- **Database Persistence**: Changes to items and approvals are not permanently saved
- **Live Inventory**: No connection to real-time inventory management systems
- **Vendor Pricing**: Static pricing data instead of dynamic vendor price feeds
- **Notification System**: No automated notifications for status changes or approvals

### **Known Issues**
- **Data Synchronization**: No real-time updates when multiple users edit the same request
- **Offline Capability**: No support for offline editing or conflict resolution
- **Advanced Workflows**: Complex approval routing not fully implemented

---

*This specification documents the actual implementation as found in the source code. Features marked as placeholder indicate console.log implementations without full backend integration.*