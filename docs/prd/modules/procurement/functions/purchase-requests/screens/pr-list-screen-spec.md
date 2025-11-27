# Purchase Request List Screen Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Screen**: Purchase Request List  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This screen provides a comprehensive interface for viewing, managing, and taking actions on purchase requests across the organization. Users can browse all purchase requests, switch between different view modes, and perform various operations based on their role permissions.

**File Locations**: 
- Main component: ModernPurchaseRequestList.tsx
- Main page: purchase-requests/page.tsx

**User Types**: All authenticated users can access this screen, with different action capabilities based on role permissions.

**Current Status**: Core viewing and navigation functionality fully implemented, with some workflow actions using placeholder implementations.

---

## Layout & Navigation

### **Header/Title Area**
- **Page Title**: "Purchase Requests" displayed prominently at the top
- **Description**: "Manage and track all purchase requests across your organization."
- **Responsive Layout**: Adapts from single column on mobile to side-by-side layout on desktop

### **Action Buttons**
- **New Purchase Request Dropdown**: Primary action button with template options
  - Create Blank PR: Starts a new empty purchase request
  - Template Options: Pre-configured PR templates for common categories
    - Office Supplies
    - IT Equipment  
    - Kitchen Supplies
    - Maintenance
- **Export Button**: Exports the current purchase request data
- **Print Button**: Prints the purchase request list

### **Layout Structure**
- **Container**: Main content area with responsive spacing and margins
- **Header Section**: Flexible layout that stacks vertically on mobile, horizontal on desktop
- **Content Area**: Full-width space for the data display components

---

## Data Display

### **View Mode Toggle**
- **Table View**: Default tabular display with rows and columns
- **Card View**: Card-based layout for enhanced visual presentation
- **Toggle Control**: Users can switch between view modes seamlessly

### **Table View Features**
- **Column Structure**: Organized data presentation with sortable headers
- **Multi-Select**: Checkbox selection for individual items and select all functionality
- **Sorting**: Column-based sorting capabilities
- **Pagination**: Navigation through large datasets
- **Filtering**: Built-in filtering capabilities through the data table

### **Card View Features**  
- **Visual Cards**: Enhanced presentation of PR data in card format
- **Same Functionality**: All interaction capabilities available in table view
- **Mobile Optimization**: Responsive design optimized for touch interfaces
- **Consistent Selection**: Same multi-select functionality as table view

### **Information Fields**
- **PR Identification**: Reference numbers, creation dates, and basic identifiers
- **Status Information**: Current approval status with color-coded indicators
- **Financial Data**: Budget information and cost details (role-dependent visibility)
- **Workflow State**: Current position in approval workflow
- **Item Summary**: Overview of requested items and quantities

### **Status Indicators**
- **Color-Coded Badges**: Visual status representation for quick identification
- **Workflow Progress**: Current stage in approval process
- **Priority Indicators**: Visual cues for urgent or high-priority requests

---

## User Interactions

### **Navigation Actions**
- **View PR**: Opens purchase request in read-only detail view
- **Edit PR**: Opens purchase request in editable mode (permission-dependent)
- **Create New**: Initiates new purchase request creation process

### **Selection Operations**
- **Individual Selection**: Click checkboxes to select specific purchase requests
- **Select All**: Single click to select all visible purchase requests
- **Bulk Operations**: Perform actions on multiple selected items simultaneously

### **Data Management**
- **View Mode Switching**: Toggle between table and card presentations
- **Sorting**: Click column headers to sort data
- **Filtering**: Use built-in filters to narrow down displayed results
- **Pagination**: Navigate through multiple pages of data

---

## Role-Based Functionality

### **All Users**
- View purchase request list in both table and card formats
- Access individual purchase request details
- Use search and filtering capabilities
- Switch between view modes
- Export and print functionality

### **Requestors/Staff**
- Create new purchase requests using templates or blank forms
- Edit their own draft purchase requests
- View status of their submitted requests

### **Approvers** (Department Managers, Financial Managers)
- View all purchase requests in their approval scope
- Access workflow actions for requests requiring their approval
- Bulk approval operations for multiple requests

### **Purchasing Staff**
- View all purchase requests across the organization
- Access vendor and pricing information
- Process approved requests for vendor ordering

---

## Current Limitations

### **Placeholder Features**
- **Approval Actions**: Approve, reject, and delete actions currently only log to console
- **Template Creation**: New PR templates create basic forms but don't save custom templates
- **Real-time Updates**: Data doesn't refresh automatically when changes occur

### **Missing Integration**
- **Backend Connections**: All data operations use mock data instead of live database
- **Workflow Integration**: Status changes don't trigger actual workflow processes
- **Notification System**: No alerts or notifications for status changes

### **Known Issues**
- **Data Persistence**: Changes made to purchase requests aren't permanently saved
- **User Context**: Limited integration with actual user permission systems
- **Audit Trail**: No tracking of user actions or changes to purchase requests

---

## Business Rules & Validation

### **Access Control**
- All authenticated users can view the purchase request list
- Edit capabilities restricted based on user role and request ownership
- Financial information visibility controlled by user permissions

### **Data Validation**
- Purchase request data validated against predefined schemas
- Required fields enforced during creation and editing
- Status transitions follow defined workflow rules

### **Workflow Logic**
- Purchase requests progress through defined approval stages
- Status changes trigger appropriate next steps in the process
- Role-based actions available based on current workflow stage

---

*This specification documents the actual implementation as found in the source code. Features marked as placeholder indicate console.log implementations without full backend integration.*