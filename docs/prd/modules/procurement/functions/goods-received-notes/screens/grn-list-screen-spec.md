# Goods Received Note List Screen Specification

**Module**: Procurement  
**Function**: Goods Received Notes  
**Screen**: Goods Received Note List  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This screen provides a comprehensive interface for viewing, managing, and creating goods received notes (GRNs) across the organization. Users can browse all goods receipts, switch between different view modes, create new GRNs from purchase orders or manually, and perform various operations based on their role permissions.

**File Locations**: 
- Main page: goods-received-note/page.tsx
- List component: GoodsReceiveNoteList.tsx
- Data table: grn-shadcn-data-table.tsx

**User Types**: All authenticated users can access this screen, with different action capabilities based on role permissions and workflow stages.

**Current Status**: Core viewing and navigation functionality fully implemented with dual view modes, comprehensive filtering, and GRN creation workflows. Some bulk actions use placeholder implementations for backend integration.

---

## Layout & Navigation

### **Header/Title Area**
- **Page Title**: "Goods Receive Notes" displayed prominently at the top
- **Description**: "Track and manage goods received from vendors, validate deliveries against purchase orders, and maintain accurate inventory records."
- **Responsive Layout**: Adapts from single column on mobile to side-by-side layout on desktop

### **Action Buttons**
- **New GRN Dropdown**: Primary action button with creation options
  - Create from Purchase Order: Links existing PO to new goods receipt
  - Create Manually: Start a new GRN without purchase order reference
- **Export Button**: Exports the current goods received note data
- **Print Button**: Prints the goods received note list

### **Layout Structure**
- **Container**: Main content area with responsive spacing and margins
- **Header Section**: Flexible layout that stacks vertically on mobile, horizontal on desktop
- **Content Area**: Full-width space for the data display components

---

## Data Display

### **View Mode Toggle**
- **Table View**: Default tabular display with sortable columns and detailed information
- **Card View**: Card-based layout for enhanced visual presentation and mobile optimization
- **Toggle Control**: Users can switch between view modes seamlessly with dedicated buttons

### **Table View Features**
- **Column Structure**: Organized data presentation with sortable headers
- **Multi-Select**: Checkbox selection for individual items and select all functionality
- **Sorting**: Column-based sorting capabilities for all major fields
- **Pagination**: Navigation through large datasets with page indicators
- **Row Actions**: Individual action dropdown menus for each GRN

### **Card View Features**  
- **Visual Cards**: Enhanced presentation of GRN data in responsive card format
- **Same Functionality**: All interaction capabilities available in table view
- **Mobile Optimization**: Touch-friendly design optimized for smaller screens
- **Consistent Selection**: Same multi-select functionality as table view

### **Information Fields**
- **GRN Reference**: Unique GRN numbers with clickable links to detail pages
- **Vendor Information**: Supplier company names and details
- **Date Information**: Receipt dates with consistent formatting
- **Status Indicators**: Color-coded status badges for quick identification
- **Financial Data**: Total amounts and currency information
- **Item Summary**: Number of items received per GRN

### **Status Indicators**
- **Color-Coded Badges**: Visual status representation for quick identification
  - Received: Items successfully received and recorded
  - Committed: GRN committed to inventory systems
  - Partial: Partially received with pending items
  - Cancelled: Cancelled receipt transactions
  - Voided: Voided or reversed transactions

---

## User Interactions

### **Search and Filtering**
- **Global Search**: Real-time search across all GRN fields with search icon
- **Quick Filters**: Status-based filtering with dropdown selector
- **Advanced Filters**: Complex filter builder for detailed searches
- **Filter Display**: Active filters shown as removable badges

### **Navigation Actions**
- **View GRN**: Opens goods received note in read-only detail view
- **Edit GRN**: Opens goods received note in editable mode (permission-dependent)
- **Create New**: Initiates new GRN creation process with workflow options

### **Selection Operations**
- **Individual Selection**: Click checkboxes to select specific goods received notes
- **Select All**: Single click to select all visible GRNs
- **Bulk Operations**: Perform actions on multiple selected items simultaneously

### **Data Management**
- **View Mode Switching**: Toggle between table and card presentations
- **Column Visibility**: Show/hide specific columns in table view
- **Sorting**: Click column headers to sort data in ascending/descending order
- **Pagination**: Navigate through multiple pages of GRN data

### **Action Menu Operations** (per GRN)
- **Print GRN**: Generate printable version of goods received note
- **Download PDF**: Export individual GRN as PDF document
- **Delete**: Remove GRN from system (role-dependent visibility)

---

## Role-Based Functionality

### **All Users**
- View goods received note list in both table and card formats
- Access individual GRN details and information
- Use search and filtering capabilities to find specific receipts
- Switch between view modes and adjust column visibility
- Export and print functionality for reporting purposes

### **Receiving Staff**
- Create new goods received notes from purchase orders
- Create manual GRNs for direct receipts
- Edit draft and in-progress goods received notes
- View status of submitted receipts and approvals

### **Warehouse Managers**
- View all goods received notes across locations
- Access inventory impact and stock movement information
- Approve receipt quantities and resolve discrepancies
- Manage location-specific receipt workflows

### **Purchasing Staff**
- View all goods received notes linked to purchase orders
- Monitor receipt status against purchase order commitments
- Access vendor performance and delivery metrics
- Process purchase order completion workflows

### **Financial Controllers**
- View financial summary and cost information for all receipts
- Access pricing discrepancies and approval requirements
- Monitor currency conversions and exchange rate impacts
- Approve financial adjustments and extra costs

---

## Current Limitations

### **Placeholder Features**
- **Bulk Actions**: Delete selected operation currently only logs to console
- **Advanced Filtering**: Complex filter application uses placeholder logic
- **Real-time Updates**: Data doesn't refresh automatically when changes occur

### **Missing Integration**
- **Backend Connections**: All data operations use mock data instead of live database
- **Workflow Integration**: Status changes don't trigger actual workflow processes
- **Notification System**: No alerts or notifications for status changes or approvals

### **Known Issues**
- **Data Persistence**: Changes made to goods received notes aren't permanently saved
- **User Context**: Limited integration with actual user permission systems
- **Audit Trail**: No tracking of user actions or changes to GRNs

---

## Business Rules & Validation

### **Access Control**
- All authenticated users can view the goods received note list
- Creation capabilities restricted based on user role and location permissions
- Financial information visibility controlled by user permissions

### **Data Validation**
- Goods received note data validated against predefined schemas
- Required fields enforced during creation and editing processes
- Status transitions follow defined workflow rules

### **Workflow Logic**
- Goods received notes progress through defined receipt and approval stages
- Status changes trigger appropriate next steps in the inventory process
- Role-based actions available based on current workflow stage

---

*This specification documents the actual implementation as found in the source code. Features marked as placeholder indicate console.log implementations without full backend integration.*