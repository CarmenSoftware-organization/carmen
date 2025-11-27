# Purchase Request Creation Workflow Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Component**: Creation Workflow  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This workflow provides a comprehensive purchase request creation process, enabling users to create PRs through a unified form interface with tabbed structure for items, budgets, and workflow management. The system supports both manual creation and template-based approaches with role-based access control and intelligent workflow decision making.

**Implementation Files**:
- Main entry: procurement/purchase-requests/page.tsx
- List component: components/ModernPurchaseRequestList.tsx
- Creation route: new-pr/page.tsx
- Detail component: components/PRDetailPage.tsx
- Items management: components/tabs/ItemsTab.tsx
- Form components: components/PRForm.tsx, components/PRHeader.tsx

**Current Status**: Complete workflow implementation with comprehensive form handling, role-based permissions, workflow decision engine, and multi-tab interface. Uses mock data for development with sophisticated state management and validation systems.

---

## Workflow Architecture

### **Creation Entry Points**
- **List Page Dropdown**: "New Purchase Request" button with template options
- **Direct Route**: `/procurement/purchase-requests/new-pr` with mode=add parameter
- **Template Selection**: Pre-defined templates (Office Supplies, IT Equipment, Kitchen Supplies, Maintenance)
- **Navigation**: Direct access from main PR list page

### **State Management System**
- **Form State**: React useState for main PR object and items array
- **Mode Control**: Three modes - "view", "edit", "add" with dynamic switching
- **User Context**: Role-based permissions and field access control
- **RBAC Integration**: Real-time permission checking for field editability

### **Form Structure**
- **Main Form**: Single form element wrapping tabbed interface
- **Header Section**: Basic PR information with responsive grid layout
- **Tabbed Content**: Items, Budgets, and Workflow tabs with independent state
- **Footer Actions**: Save, Cancel, and navigation buttons

---

## Creation Workflow Stages

### **Stage 1: Initial Access and Setup**

#### **Entry Point Selection**
- **List Page Access**: User clicks "New Purchase Request" dropdown button
- **Template Options**: Choose from pre-defined templates or "Create Blank PR"
- **Route Navigation**: Automatic redirect to new-pr page with mode=add parameter
- **Component Loading**: PRDetailPage component loads in creation mode

#### **Initial Data Setup**
- **Empty PR Object**: Generated via getEmptyPurchaseRequest() function
- **Default Values**: Pre-populated fields include current date, Draft status, Requester workflow stage
- **User Context**: Current user automatically set as requestor
- **Form Mode**: Set to "add" mode enabling all edit capabilities

### **Stage 2: Header Information Entry**

#### **Primary Fields (Row 1)**
- **Date**: Date picker with current date default, format validation
- **PR Type**: Dropdown selection from PRType enum (GeneralPurchase, MarketList, AssetPurchase, ServiceRequest)
- **Requestor**: Auto-populated from user context, editable by authorized roles
- **Department**: Text input for department assignment

#### **Secondary Fields (Row 2)**
- **Description**: Multi-line textarea with placeholder guidance
- **Workflow Progress**: Read-only display showing current stage and status
- **Responsive Layout**: 4-column grid on desktop, stacked on mobile
- **Field Permissions**: Role-based editability using canEditField utility

### **Stage 3: Items Management**

#### **Items Tab Interface**
- **Add New Item**: "+" button for new item creation via NewItemRow component
- **Item Table**: Comprehensive table with location, product, quantities, pricing, comments
- **Inline Editing**: Table-based editing for authorized roles
- **Bulk Operations**: Multi-select with approve, reject, return actions

#### **Item Creation Process**
- **New Item Row**: Embedded form within table structure
- **Required Fields**: Location, product name, requested quantity, unit
- **Optional Fields**: Comments, pricing (role-dependent visibility)
- **Validation**: Real-time validation with error messaging
- **Mock Data**: Product and location dropdowns with predefined options

#### **Role-Based Item Management**
- **Requestors**: Can add/edit items, set quantities, add comments
- **Approvers**: Can modify approved quantities, change item status
- **Purchasers**: Can assign vendors, set pricing, manage FOC items

### **Stage 4: Financial and Budget Information**

#### **Budget Tab Integration**
- **Budget Validation**: Integration with ResponsiveBudgetScreen component
- **Financial Calculations**: Automatic calculation of totals based on item data
- **Currency Support**: Multi-currency handling with base currency conversion
- **Budget Tracking**: Real-time budget consumption monitoring

#### **Financial Summary Display**
- **Transaction Summary**: Comprehensive totals in base currency
- **Role Visibility**: Financial information hidden from requestors based on canViewFinancialInfo
- **Calculation Engine**: Real-time updates based on item changes
- **Exchange Rates**: Automatic conversion for multi-currency items

### **Stage 5: Workflow and Approval Configuration**

#### **Workflow Tab Features**
- **Current Stage Display**: Visual representation of workflow progress
- **Next Steps**: Clear indication of required actions and approvers
- **Workflow Decision Engine**: Intelligent routing based on item status and values
- **Approval Routing**: Automatic determination of approval path

#### **Status Management**
- **Initial Status**: All new PRs start in "Draft" status
- **Workflow Stage**: Set to "requester" stage initially
- **Submission Trigger**: "Submit for Approval" action advances workflow
- **Status Tracking**: Complete audit trail of status changes

---

## Form Validation and Business Rules

### **Client-Side Validation**
- **Required Fields**: Real-time validation for mandatory fields
- **Field Dependencies**: Cross-field validation (e.g., invoice date requires invoice number)
- **Format Validation**: Date formats, numeric ranges, text length limits
- **Business Logic**: Custom validation rules for specific scenarios

### **Form Submission Handling**
- **Save Action**: handleSubmit function processes form data
- **Data Transformation**: Conversion of form data to PR object structure
- **Validation Gateway**: Pre-submission validation checkpoint
- **Success Navigation**: Redirect to PR list after successful creation

### **Error Handling**
- **Field-Level Errors**: Inline error messages for invalid inputs
- **Form-Level Errors**: Global error handling for submission failures
- **User Feedback**: Clear messaging for validation failures
- **Recovery Guidance**: Specific instructions for error correction

---

## User Interface Components

### **Header Component Structure**
- **Back Navigation**: Breadcrumb navigation to PR list
- **Title Display**: Dynamic title based on mode ("Create New Purchase Request")
- **Action Buttons**: Save, Cancel, Print, Export, Share buttons
- **Status Badge**: Current PR status display (hidden in creation mode)

### **Form Layout Design**
- **Responsive Grid**: 4-column layout adapting to screen size
- **Field Grouping**: Logical grouping of related fields
- **Visual Hierarchy**: Clear typography and spacing
- **Interactive Elements**: Proper focus management and keyboard navigation

### **Tab Navigation System**
- **Three Primary Tabs**: Items, Budgets, Workflow
- **Tab State Management**: Independent state for each tab
- **Content Loading**: Lazy loading of tab content
- **Progress Indication**: Visual indicators for completed sections

### **Items Table Interface**
- **Responsive Design**: Adaptive layout for mobile devices
- **Interactive Controls**: Dropdown menus, input fields, checkboxes
- **Row Actions**: Expand/collapse, edit, approve/reject options
- **Bulk Actions**: Multi-select operations with status indicators

---

## Role-Based Access Control

### **Permission Framework**
- **Field-Level Control**: Individual field editability based on user role
- **Component Visibility**: Role-based showing/hiding of interface elements
- **Action Authorization**: Workflow actions restricted by user permissions
- **Data Access**: Information visibility controlled by security settings

### **Role Definitions**
- **Staff/Requestor**: Can create PRs, add items, submit for approval
- **Department Manager**: Can approve items, modify quantities, provide feedback
- **Financial Manager**: Can review budgets, approve high-value requests
- **Purchasing Staff**: Can assign vendors, set pricing, manage procurement

### **Workflow Actions by Role**
- **Create Permission**: All authorized users can create new PRs
- **Edit Permission**: Edit capabilities based on PR status and user role
- **Submit Permission**: Requestors can submit draft PRs for approval
- **Approval Permission**: Managers can approve/reject items based on authority levels

---

## Technical Implementation Details

### **Component Architecture**
- **Functional Components**: All components use function declarations with hooks
- **State Management**: useState and useEffect for local state
- **Context Integration**: User context for authentication and permissions
- **Service Integration**: RBAC and WorkflowDecisionEngine services

### **Data Flow Management**
- **Props Drilling**: Data passed through component hierarchy
- **Callback Functions**: Parent-child communication via callback props
- **State Lifting**: Shared state lifted to appropriate parent components
- **Event Handling**: Consistent event handling patterns

### **Form Data Structure**
```typescript
interface PurchaseRequest {
  id: string;
  refNumber: string;
  date: Date;
  type: PRType;
  description: string;
  requestor: { name: string; id: string; department: string };
  status: DocumentStatus;
  workflowStatus: WorkflowStatus;
  currentWorkflowStage: WorkflowStage;
  // ... financial and item data
}
```

### **Validation Framework**
- **Real-time Validation**: Immediate feedback on input changes
- **Business Rule Engine**: Centralized validation logic
- **Error State Management**: Comprehensive error handling
- **User Feedback System**: Clear validation messages

---

## Integration Points

### **User Management Integration**
- **Authentication**: Current user context from user-context provider
- **Role Detection**: Automatic role identification for permission control
- **Department Mapping**: User department information for PR routing
- **Permission Checking**: Real-time permission validation

### **Workflow Engine Integration**
- **Decision Engine**: WorkflowDecisionEngine for intelligent routing
- **Status Management**: Automatic status transitions based on business rules
- **Approval Routing**: Dynamic approval path determination
- **Notification Triggers**: Workflow stage change notifications

### **Financial System Integration**
- **Budget Validation**: Real-time budget checking and consumption tracking
- **Currency Management**: Multi-currency support with exchange rates
- **Cost Calculations**: Automatic calculation of PR totals
- **Financial Reporting**: Integration with financial summary displays

### **Inventory Management Integration**
- **Product Lookup**: Integration with product catalog for item selection
- **Inventory Checking**: Real-time inventory levels for selected items
- **Unit Conversion**: Support for different ordering and inventory units
- **Supplier Information**: Integration with vendor management system

---

## Current Implementation Status

### **Completed Features**
- **Full Form Interface**: Complete PR creation form with all required fields
- **Items Management**: Comprehensive item addition and editing capabilities
- **Role-Based Access**: Complete RBAC implementation with field-level control
- **Workflow Integration**: Intelligent workflow decision making and routing
- **Validation System**: Real-time validation with user feedback

### **Mock Data Dependencies**
- **User Context**: Uses mock user roles and permissions
- **Product Catalog**: Mock product data for item selection
- **Vendor Information**: Simplified vendor assignment
- **Budget Data**: Mock budget information for validation

### **Development Features**
- **Template System**: Pre-defined PR templates for common scenarios
- **Workflow Simulation**: Complete workflow engine for status management
- **Permission Framework**: Comprehensive role-based access control
- **Financial Calculations**: Real-time cost calculations and summaries

---

## Future Enhancement Opportunities

### **Advanced Form Features**
- **Auto-save Functionality**: Automatic saving of work-in-progress
- **Form Templates**: User-defined templates for recurring requests
- **Bulk Import**: Excel-based bulk item import for large requests
- **Collaborative Editing**: Real-time collaboration on PR creation

### **Integration Enhancements**
- **Real-time Inventory**: Live inventory checking during item selection
- **Vendor Marketplace**: Direct integration with vendor catalogs
- **Budget Alerts**: Real-time budget warnings and approvals
- **Mobile Optimization**: Native mobile app functionality

### **Workflow Improvements**
- **Advanced Routing**: Complex approval routing based on multiple factors
- **Conditional Logic**: Dynamic form behavior based on selections
- **Integration APIs**: REST API integration for external systems
- **Audit Enhancement**: Comprehensive audit trail with detailed logging

---

*This workflow specification documents the actual implementation as found in the source code. Features marked as mock or template indicate areas designed for production enhancement through backend integration.*