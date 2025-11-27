# Goods Received Note Creation Workflow Specification

**Module**: Procurement  
**Function**: Goods Received Notes  
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

**Purpose**: This workflow provides a comprehensive multi-path creation process for goods received notes, enabling users to create GRNs either from existing purchase orders or through manual entry. The workflow includes vendor selection, purchase order selection, item selection with location assignment, and final confirmation stages.

**Implementation Files**:
- Main entry: goods-received-note/page.tsx
- Vendor selection: new/vendor-selection/page.tsx
- PO selection: new/po-selection/page.tsx
- Item selection: new/item-location-selection/page.tsx
- Manual entry: new/manual-entry/page.tsx
- State management: lib/store/grn-creation.store.ts

**Current Status**: Complete workflow implementation with Zustand state management, multi-step navigation, and comprehensive data validation. Some backend integration uses mock data for development.

---

## Workflow Architecture

### **State Management System**
- **Store Technology**: Zustand store (`useGRNCreationStore`) for cross-page state persistence
- **Process Types**: Purchase Order-based creation ('po') and Manual creation ('manual')
- **Step Tracking**: Process selection → Vendor selection → PO selection → Item selection → Confirmation
- **Data Persistence**: Temporary GRN data stored in browser state until final submission

### **Navigation Flow Control**
- **Dynamic Routing**: URL-based navigation with mode parameters and step validation
- **Back Button Support**: Each step includes navigation back to previous steps
- **Error Recovery**: Automatic redirection to appropriate steps when required data missing
- **State Validation**: Prevents users from accessing steps without completing prerequisites

---

## Creation Workflows

### **Process 1: Purchase Order-Based Creation**

#### **Step 1: Process Selection**
- **Entry Point**: Goods Received Note list page dropdown menu
- **Action Trigger**: User clicks "Create from Purchase Order" 
- **Store Updates**: Sets process type to 'po' and step to 'vendor-selection'
- **Navigation**: Redirects to vendor selection page

#### **Step 2: Vendor Selection**
- **Page Location**: `/procurement/goods-received-note/new/vendor-selection`
- **Data Source**: Vendor management system (currently mock data with 3 sample vendors)
- **Search Functionality**: Real-time search by company name and business registration number
- **Selection Criteria**: Only active vendors displayed in searchable table format
- **Required Data**: Business registration number, company name
- **Validation**: Must select vendor before proceeding to next step
- **Store Updates**: Saves selected vendor object and advances to 'po-selection' step
- **Navigation**: Automatic redirect to PO selection page upon vendor selection

#### **Step 3: Purchase Order Selection**
- **Page Location**: `/procurement/goods-received-note/new/po-selection`
- **Data Filter**: Shows only Open and Partial purchase orders for selected vendor
- **Multi-Selection**: Checkbox-based selection system with select-all functionality
- **Search Features**: Filter by PO number and purchase requisition references
- **Order Information**: Displays PO number, PR references, order date, item count, status, currency, total amount
- **Item Preview**: Expandable rows showing detailed item information with base units and currencies
- **Vendor Context**: Header displays selected vendor name for confirmation
- **Validation**: Must select at least one purchase order to proceed
- **Store Updates**: Saves array of selected purchase order objects
- **Navigation**: Advances to item location selection page

#### **Step 4: Item and Location Selection**
- **Page Location**: `/procurement/goods-received-note/new/item-location-selection`
- **Data Processing**: Flattens items from all selected purchase orders into unified list
- **Location Assignment**: Assigns mock locations based on PO patterns (Main Warehouse, Store Room A, Kitchen Prep Area, Receiving Bay)
- **Location Filtering**: Badge-based location filter system with multi-select capability
- **Item Selection**: Table with checkboxes for individual item selection
- **Quantity Management**: Receiving quantity input with validation against remaining quantities
- **Unit Selection**: Dropdown for receiving units with real-time base quantity calculations
- **Amount Calculations**: Display amounts in both PO currency and base currency
- **Data Validation**: Prevents quantities exceeding remaining amounts, ensures positive values
- **Required Fields**: Selected items must have receiving quantities greater than zero
- **Search Functionality**: Filter items by name, description, or PO number
- **Store Updates**: Creates complete GRN object with all selected items and calculated totals
- **Navigation**: Redirects to detail page with confirmation mode

#### **Step 5: Confirmation and Finalization**
- **Page Location**: `/procurement/goods-received-note/[tempId]?mode=confirm`
- **Display Format**: Full GRN detail page showing all collected information
- **Data Source**: Temporary GRN object stored in Zustand state
- **User Actions**: Review, edit, save, or cancel the created GRN
- **Final Processing**: Save triggers permanent data storage and generates final GRN reference

### **Process 2: Manual Creation**

#### **Step 1: Process Selection**
- **Entry Point**: Goods Received Note list page dropdown menu  
- **Action Trigger**: User clicks "Create Manually"
- **Data Generation**: Creates temporary GRN ID and placeholder data structure
- **Store Updates**: Sets process type to 'manual' and creates initial GRN data
- **Navigation**: Directly redirects to detail page in confirmation mode

#### **Alternative Manual Entry Path**
- **Page Location**: `/procurement/goods-received-note/new/manual-entry`
- **Form Structure**: Header section for GRN details and table section for items
- **Header Fields**: Vendor selection (dropdown), reference number, date picker, remarks textarea
- **Item Management**: Dynamic table with add/remove capabilities for items
- **Item Fields**: Name (with lookup), description, quantity, unit, location, unit price
- **Data Validation**: Required fields marked with asterisks, prevents submission with incomplete data
- **Calculation Logic**: Automatic calculation of amounts based on quantity and unit price
- **Mock Integration**: Uses mock vendor data and location options for development
- **Store Updates**: Creates complete GRN object with manual items and financial totals
- **Navigation**: Redirects to detail page with confirmation mode

---

## Data Flow and Transformations

### **Purchase Order Item to GRN Item Mapping**
- **Identifier Transformation**: PO item IDs mapped to temporary GRN item IDs
- **Quantity Mapping**: Ordered quantities preserved, received quantities captured separately
- **Unit Handling**: Supports different units for ordering and receiving with conversion rates
- **Currency Processing**: Maintains both PO currency and base currency amounts
- **Location Assignment**: Maps items to receiving locations with delivery point tracking
- **Financial Calculations**: Calculates subtotals, taxes, discounts, and net amounts

### **State Persistence Strategy**
- **Temporary Storage**: Uses browser-based Zustand store for cross-page state
- **Data Structure**: Complete GRN object stored before final submission
- **Session Continuity**: Maintains state during navigation and page refreshes
- **Error Recovery**: Reconstructs state from stored data if navigation issues occur

### **Validation and Error Handling**
- **Step Prerequisites**: Validates required data before allowing step progression
- **Business Rules**: Enforces quantity limits, positive values, and required field completion
- **User Feedback**: Displays clear error messages and validation states
- **Graceful Degradation**: Handles missing data with sensible defaults and user prompts

---

## Integration Points

### **Vendor Management Integration**
- **Data Source**: Connects to vendor management system for vendor lookup
- **Search Functionality**: Real-time search across vendor attributes
- **Vendor Context**: Maintains selected vendor throughout creation process

### **Purchase Order Integration**
- **Order Filtering**: Shows only relevant POs (Open/Partial status) for selected vendor
- **Item Synchronization**: Pulls complete item details from purchase orders
- **Status Tracking**: Updates PO status based on receipt quantities

### **Inventory Management Integration**
- **Location Assignment**: Maps items to appropriate inventory locations
- **Stock Updates**: Prepares stock movement data for inventory system
- **Unit Conversions**: Handles multiple unit types with conversion factors

### **Financial System Integration**
- **Currency Handling**: Manages multi-currency transactions with exchange rates
- **Cost Calculations**: Computes extended costs, taxes, and totals
- **Financial Posting**: Prepares data for accounting system integration

---

## User Experience Features

### **Progressive Disclosure**
- **Step-by-Step Guidance**: Breaks complex creation process into manageable steps
- **Context Preservation**: Maintains user selections and progress throughout workflow
- **Visual Feedback**: Progress indicators and step navigation elements

### **Data Entry Efficiency**
- **Smart Defaults**: Pre-populates fields with sensible default values
- **Bulk Operations**: Select-all functionality for items and purchase orders
- **Real-time Calculations**: Immediate updates to totals and base quantities

### **Error Prevention**
- **Input Validation**: Real-time validation with immediate feedback
- **Business Rule Enforcement**: Prevents invalid configurations and data entry
- **Confirmation Steps**: Review opportunities before final submission

### **Responsive Design**
- **Multi-Column Layouts**: Adaptive layouts for different screen sizes
- **Touch-Friendly Controls**: Appropriately sized buttons and input fields
- **Mobile Navigation**: Streamlined interface for mobile devices

---

## Technical Implementation

### **State Management Architecture**
```typescript
interface GRNCreationState {
  processType: 'po' | 'manual' | null;
  currentStep: Step;
  selectedVendor: Vendor | null;
  selectedPOs: PurchaseOrder[];
  selectedItems: GoodsReceiveNoteItem[];
  newlyCreatedGRNData: GoodsReceiveNote | null;
}
```

### **Navigation System**
- **URL-Based Routing**: Each step has dedicated URL for direct access and bookmarking
- **Query Parameters**: Mode and step information passed via URL parameters
- **Dynamic Redirects**: Automatic navigation based on workflow state and prerequisites

### **Data Validation Framework**
- **Frontend Validation**: Immediate validation with user feedback
- **Business Rule Engine**: Centralized validation logic for business constraints
- **Error State Management**: Comprehensive error handling and user messaging

---

## Current Limitations

### **Mock Data Dependencies**
- **Vendor Data**: Uses mock vendor list instead of live vendor management integration
- **Location Data**: Mock location assignments rather than dynamic location lookup
- **Purchase Order Data**: Simulated PO data with mock item relationships

### **Integration Gaps**
- **Inventory System**: No real-time inventory level checking during item selection
- **Financial System**: Simplified financial calculations without complex tax logic
- **User Management**: No integration with user context for receiver information

### **Backend Integration**
- **Data Persistence**: Temporary state storage without permanent database integration
- **API Integration**: Mock API calls instead of real backend service connections
- **Real-time Updates**: No live updates during multi-user scenarios

---

## Future Enhancements

### **Advanced Features**
- **Batch Processing**: Support for processing multiple GRNs simultaneously
- **Template System**: Reusable GRN templates for common scenarios
- **Approval Workflow**: Multi-level approval process for high-value receipts

### **Integration Improvements**
- **Real-time Inventory**: Live inventory checking and automatic location suggestions
- **Advanced Calculations**: Complex tax calculations and multi-currency support
- **Notification System**: Automated notifications for workflow status changes

### **User Experience Enhancements**
- **Draft Saving**: Automatic saving of work-in-progress GRNs
- **Bulk Import**: Excel-based bulk item import for large receipts
- **Mobile Optimization**: Native mobile app functionality

---

*This workflow specification documents the actual implementation as found in the source code. Features marked as mock or placeholder indicate areas requiring backend integration for production deployment.*