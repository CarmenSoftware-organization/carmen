# Goods Received Note Detail Screen Specification

**Module**: Procurement  
**Function**: Goods Received Notes  
**Screen**: Goods Received Note Detail  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

---

## Implementation Overview

**Purpose**: This screen provides a comprehensive interface for viewing, editing, and managing individual goods received notes (GRNs). Users can view complete receipt details, edit information based on their permissions, manage received items with quantity and quality validation, and track the complete receipt process with financial summaries.

**File Locations**: 
- Main page: goods-received-note/[id]/page.tsx
- Main component: goods-receive-note.tsx
- Items tab: GoodsReceiveNoteItems.tsx

**User Types**: All authenticated users can access this screen, with different editing and receipt capabilities based on role permissions and receipt status.

**Current Status**: Core viewing and editing functionality fully implemented with comprehensive receipt workflows, financial tracking, and role-based access controls. Some workflow actions use placeholder implementations for backend integration.

---

## Layout & Navigation

### **Header/Title Area**
- **Navigation**: Back button with chevron icon returns to goods received note list
- **Page Title**: "Goods Receive Note" with consistent branding
- **Status Display**: Color-coded status badge showing current receipt stage
- **Reference Information**: GRN reference number and identification

### **Action Buttons**
- **Edit Controls**: Edit button switches to editable mode (permission-dependent visibility)
- **Save/Cancel**: Save button commits changes and returns to view mode, Cancel discards changes
- **Document Actions**: Print, Export, and Share buttons for document management
- **Sidebar Toggle**: Panel control with tooltip to show/hide comments and activity sidebar
- **Delete Option**: Delete button for removing GRN (role-dependent and status-dependent)

### **Layout Structure**
- **Responsive Design**: Single column on mobile, multi-column layout on desktop
- **Card-Based Layout**: Main content organized in card containers with consistent spacing
- **Sidebar Panel**: Toggleable sidebar for comments, attachments, and activity tracking

---

## Data Display

### **Primary Information Fields** (6-column responsive grid)

**GRN Reference Field**
- Unique goods received note identifier
- View mode: Displays GRN reference number
- Edit mode: Text input field for reference editing

**Date Field**
- Receipt date for goods received
- View mode: Displays date in standard format
- Edit mode: Date picker input with validation

**Vendor Information**
- Supplier details and company information
- View mode: Shows selected vendor name
- Edit mode: Dropdown selector with vendor search capabilities

**Invoice Details**
- Invoice number and date from vendor
- View mode: Displays invoice information
- Edit mode: Text input for invoice number and date picker for invoice date

**Description Area**
- Detailed description of goods received
- View mode: Description text in full-width field
- Edit mode: Text input field for description editing

**Currency and Exchange**
- Financial currency settings and exchange rates
- Currency dropdown with available options
- Exchange rate input with decimal precision support

### **Financial Controls**
**Consignment Option**
- Checkbox for consignment goods tracking
- Tooltip explanation of consignment terms
- Affects inventory and financial processing

**Cash Transaction**
- Checkbox for cash-based transactions
- Links to cash book selection when enabled
- Impacts payment and accounting workflows

**Credit Terms**
- Dropdown selection for payment terms (Net 30, Net 60, Net 90)
- Due date calculation based on selected terms
- Calendar picker for due date specification

### **Tabbed Content Navigation** (5 main sections)
- **Items Tab**: Comprehensive item management with detailed product information and receipt validation
- **Stock Movements Tab**: Inventory impact and stock location tracking
- **Extra Costs Tab**: Additional costs, shipping, duties, and handling charges
- **Related POs Tab**: Purchase orders linked to this goods receipt
- **Financials Tab**: Financial summary, tax information, and currency calculations

### **Transaction Summary Section**
- **Currency Display**: Shows transaction totals in receipt currency and base currency
- **Multi-Currency Support**: Exchange rate conversion and dual currency display
- **Summary Content**: Comprehensive financial breakdown including subtotals, discounts, taxes, and totals

### **Sidebar Content** (Toggleable panel)
- **Comments & Attachments**: Document collaboration and file management
- **Activity Log**: Complete audit trail of all goods receipt activities and changes

---

## User Interactions

### **Item Management** (Items Tab - Primary Interface)

#### **Item Information Display**
- **Table View**: Comprehensive item listing with sortable columns and detailed information
- **Item Selection**: Multi-select functionality with checkboxes for bulk operations
- **Expandable Details**: Click to expand item rows for detailed product and location information

#### **Comprehensive Item Table Structure**

**Column Layout** (14 main columns):
1. **Selection Checkbox**: Multi-select functionality with select all option
2. **Location**: Delivery destination for inventory placement
3. **Product Name**: Item names with descriptions and status badges
4. **Ordered Quantity**: Original order amounts with base unit conversion display
5. **Ordered Unit**: Purchase order unit of measure
6. **Received Quantity**: Actual received amounts with real-time base unit calculations
7. **Received Unit**: Unit selector with conversion rate display
8. **FOC Quantity**: Free-of-charge quantities with base unit conversion
9. **FOC Unit**: Free-of-charge unit selector with conversion options
10. **Price**: Unit pricing display with currency formatting
11. **Discount**: Discount percentage display
12. **Net Amount**: Calculated net amounts after discounts
13. **Tax Amount**: Tax calculations based on rates
14. **Total Amount**: Final calculated totals including taxes
15. **Actions**: Dropdown menu with item-specific operations

#### **Advanced Unit Conversion System**

**Real-Time Conversion Display**:
- **Base Unit Calculations**: Shows converted quantities in base units below each quantity field
- **Conversion Rate Indicators**: Displays conversion factors (e.g., "1 Box = 25 Kg")
- **Multiple Unit Support**: Handles different units for ordered, received, and FOC quantities
- **Dynamic Updates**: Real-time recalculation when units or quantities change

**Unit Management Features**:
- **Unit Dropdowns**: Selectable units with predefined options (Kg, Pcs, Box, Pack, L, mL)
- **Flexible Conversions**: Different conversion rates for FOC quantities
- **Base Unit Reference**: Consistent base unit display for inventory tracking
- **Custom Units**: Support for item-specific unit options

**Conversion Examples**:
- Ordered: "50 Box" with "Base: 1,250.00 Kg" 
- Received: "45 Box" with "Base: 1,125.00 Kg"
- FOC: "2 Box" with "Base: 50.00 Kg"
- Conversion rate display: "1 Box = 25 Kg"

#### **Item Detail Modal Dialog**

**Modal Features**:
- **Large Dialog**: Full-screen modal (max-width 5xl) for comprehensive item management
- **Multi-Mode Support**: View, Edit, and Add modes with appropriate controls
- **Product Integration**: Links to product catalog with category and product code display
- **Location Integration**: Shows location codes and display types

**Detailed Information Sections**:
- **Product Details**: Complete product information with category classification
- **Unit Conversions**: Full unit conversion table with all available units
- **Quality Information**: Batch tracking, lot numbers, expiration dates, serial numbers
- **Business Dimensions**: Project codes, job codes, market segments, events
- **Inventory Context**: Current stock levels, reorder thresholds, last purchase data
- **Tax Configuration**: Tax systems (GST/VAT), tax inclusion settings, rates

**Modal Actions**:
- **View Details**: Complete read-only item information display
- **Edit Item**: Full editing capabilities for all item fields
- **Add New Records**: Create new project codes, job codes, or market segments
- **Save Changes**: Validates and saves item modifications
- **Close Dialog**: Returns to main items table

#### **Business Dimension Management**

**Project Classification**:
- **Project Codes**: Dropdown selection with "Add New" option
- **Job Codes**: Kitchen renovations, lobby upgrades, facility improvements
- **Job Numbers**: Quarter-based job numbering (FB-2024-Q1-001)
- **Market Segments**: Enterprise, Commercial Construction, Residential, Hospitality
- **Events**: Conference, trade shows, summit categorization

**Dynamic Field Creation**:
- **Add New Button**: Placeholder functionality to create new classification entries
- **Real-time Updates**: New entries become immediately available in dropdowns
- **Integration**: Links with project management and cost allocation systems

### **Interactive Unit Conversion**

**Real-Time Calculations**:
- **Quantity Input Fields**: Editable quantity fields with immediate base unit calculation
- **Unit Selectors**: Dropdown menus for changing units with instant conversion updates
- **Base Unit Display**: Shows calculated base quantities below each input field
- **Conversion Rate Tooltip**: Displays current conversion rate (e.g., "1 Box = 25 Kg")

**Unit Change Workflow**:
1. User selects different unit from dropdown
2. System automatically recalculates base quantities
3. Conversion rate display updates to show new factor
4. All related calculations (totals, taxes) update automatically

**Multiple Unit Systems**:
- **Ordered Units**: Original purchase order units (cannot be changed)
- **Received Units**: Selectable from available unit options
- **FOC Units**: Independent unit selection for free-of-charge items
- **Base Units**: Consistent inventory units for all items

### **Item Detail Modal Interactions**

**Modal Access**:
- **View Details**: Click "View Details" from item actions dropdown
- **Edit Item**: Click "Edit Item" from actions dropdown (edit mode only)
- **Add Item**: Click "Add Item" button above table (edit mode only)

**Modal Content**:
- **Product Information**: Category ID, product code, detailed descriptions
- **Location Details**: Location codes with type indicators (Inventory/Direct)
- **Unit Conversion Table**: Complete list of available units with conversion factors
- **Business Classifications**: Project codes, job codes, market segments with "Add New" options
- **Quality Tracking**: Lot numbers, expiration dates, serial numbers, quality notes

**Modal Actions**:
- **Save Changes**: Validates all fields and updates item in main table
- **Request Edit**: Switch from view mode to edit mode within modal
- **Add New Records**: Create new project/job codes through placeholder alerts
- **Close**: Returns to main items table without saving changes

### **Bulk Operations**
- **Item Selection**: Multi-select items using checkboxes with select all functionality
- **Bulk Actions**: Delete selected items, change quantities, update prices in batch
- **Status Updates**: Apply status changes to multiple items simultaneously
- **Validation**: Ensures bulk operations maintain data integrity

### **Financial Management**
- **Extra Costs**: Add shipping, duties, handling fees, and other additional costs
- **Tax Calculations**: Automatic tax calculations with manual override capabilities
- **Currency Conversion**: Real-time exchange rate application and base currency conversion

### **Stock Movement Tracking**
- **Inventory Impact**: View how receipt affects inventory levels
- **Location Tracking**: Track items across multiple storage locations
- **Movement History**: Complete history of stock movements and adjustments

---

## Role-Based Functionality

### **Receiving Staff**
- Create and edit goods received notes from purchase orders
- Enter received quantities and record quality inspections
- Assign items to appropriate inventory locations
- Record discrepancies and quality issues

### **Warehouse Managers**
- Approve receipt quantities and resolve discrepancies
- Manage location assignments and stock movements
- Override quality control decisions
- Access complete inventory impact information

### **Purchasing Staff**
- View goods receipts linked to their purchase orders
- Monitor receipt status and purchase order completion
- Access vendor performance metrics
- Validate pricing and terms against purchase agreements

### **Financial Controllers**
- View and approve financial aspects of goods receipts
- Manage extra costs and currency conversions
- Process tax calculations and adjustments
- Access complete financial summary and reporting

### **Quality Assurance**
- Record quality inspection results
- Approve or reject received items based on quality standards
- Manage batch tracking and expiration date recording
- Generate quality reports and certifications

---

## Current Limitations

### **Placeholder Features**
- **Save Operations**: Save functionality currently uses simulated delays without permanent storage
- **Delete Confirmation**: Delete operations show alerts but don't permanently remove data
- **API Integration**: All data operations use mock data instead of live database connections

### **Missing Integration**
- **Real-time Inventory**: No live connection to inventory management systems
- **Purchase Order Sync**: Limited integration with purchase order status updates
- **Workflow Notifications**: No automated notifications for status changes or approvals
- **Document Generation**: No automatic generation of receipt confirmations or reports

### **Known Issues**
- **Data Persistence**: Changes to goods received notes aren't permanently saved
- **Multi-User Conflicts**: No handling of concurrent editing by multiple users
- **Audit Trail**: Limited tracking of user actions and data changes

---

## Business Rules & Validation

### **Field Requirements**
- **Mandatory Fields**: GRN reference, date, vendor, and at least one received item required
- **Optional Fields**: Description, special instructions, and additional costs are optional
- **Conditional Requirements**: Invoice details required for non-consignment receipts

### **Validation Rules**
- **Quantity Validation**: Received quantities must be positive numbers and within reasonable variance of purchase order quantities
- **Date Validation**: Receipt dates cannot be in the future
- **Currency Consistency**: All financial data within a GRN must use consistent currency
- **Location Validation**: Receipt locations must be valid and accessible

### **Workflow Logic**
- **Sequential Processing**: Items progress through receipt, quality inspection, and inventory placement stages
- **Role-Based Approvals**: Different approval requirements based on receipt value and discrepancy levels
- **Status Transitions**: GRNs can only move to valid next states based on business rules
- **Financial Controls**: Financial approvals required for receipts exceeding defined thresholds

### **Integration Rules**
- **Purchase Order Matching**: Items must link to valid purchase order line items when created from POs
- **Inventory Updates**: Successful receipts automatically update inventory levels
- **Financial Posting**: Approved receipts trigger appropriate financial transactions
- **Vendor Performance**: Receipt data contributes to vendor performance metrics

---

*This specification documents the actual implementation as found in the source code. Features marked as placeholder indicate simulated implementations without full backend integration.*