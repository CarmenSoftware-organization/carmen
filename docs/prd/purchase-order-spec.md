# Purchase Order Management Module

This document provides a comprehensive technical specification for the Purchase Order module within the Carmen ERP system, covering all currently implemented features, data structures, and user interactions.

## Module Name: Purchase Orders

## Actionable Features

### **Feature 1: View Purchase Order List** - [Link to Purchase Orders List in Carmen ERP](`/procurement/purchase-orders`)

* **Description**: Displays a comprehensive list of all purchase orders with filtering, sorting, and bulk action capabilities. Users can view POs in either table or card view modes and access detailed information about each purchase order.

* **Functions**:
  * **List Display**: 
    - Shows all purchase orders in a data table format with columns: PO Number, Vendor, Date, Status, Total Amount, Currency
    - Provides card view alternative with key information displayed in card format
    - Includes row selection checkboxes for bulk operations
    - Displays status badges with color-coded visual indicators
    - Shows total count and pagination controls when applicable
    
  * **Filtering & Search**: 
    - Global search functionality across all PO fields
    - Advanced filtering by status, vendor, date range, currency, and amount range
    - Quick filter buttons for common status filters (Draft, Sent, Pending, etc.)
    - Filter persistence across page navigation
    
  * **Sorting**: 
    - Column-based sorting (ascending/descending) for all visible columns
    - Multi-column sorting capability
    - Sort state persistence
    
  * **Bulk Operations**: 
    - Multi-select purchase orders using checkboxes
    - Bulk export to PDF, Excel, or CSV formats
    - Bulk print operations
    - Bulk status updates (where applicable)
    
  * **View Mode Toggle**: 
    - Switch between table view and card view
    - View preference persistence
    - Responsive design adaptation

### **Feature 2: Create New Purchase Order** - [Link to Create PO in Carmen ERP](`/procurement/purchase-orders/create`)

* **Description**: Comprehensive purchase order creation functionality supporting multiple creation methods including blank POs, creation from purchase requests, and bulk creation workflows.

* **Creation Methods**:
  * **Blank Purchase Order**: Direct creation of new purchase orders from scratch
  * **From Purchase Requests**: Conversion of approved purchase requests into purchase orders
  * **From Templates**: Creation using predefined templates
  * **Recurring Purchase Orders**: Setup of automatically recurring purchase orders

* **Functions**:
  * **Creation Workflow**: 
    - Dropdown menu with creation options accessible from main PO list page
    - "New Purchase Order" button with expandable options
    - Navigation to appropriate creation forms based on selected method
    - Pre-population of fields when creating from existing documents
    
  * **Header Information Entry**: 
    - Vendor selection and management
    - Purchase order date and delivery date selection
    - Currency and exchange rate configuration
    - Credit terms and payment conditions
    - Buyer/requestor assignment
    - Description and remarks fields
    
  * **Line Item Management**: 
    - Add individual items with detailed specifications
    - Item search and selection from catalog
    - Quantity, unit price, and total calculations
    - Tax rate and discount application
    - Line-level notes and specifications
    
  * **Financial Calculations**: 
    - Automatic subtotal, tax, and total calculations
    - Multi-currency support with exchange rate conversions
    - Discount application at line and header levels
    - Financial summary display with base and transaction currencies
    
  * **Validation & Save**: 
    - Required field validation before saving
    - Business rule validation (budget checks, approval limits)
    - Draft save functionality for incomplete POs
    - Final submission with approval workflow initiation

### **Feature 3: Create Purchase Order from Purchase Requests** - [Link to Create from PR in Carmen ERP](`/procurement/purchase-orders/create/from-pr`)

* **Description**: Specialized workflow for converting approved purchase requests into purchase orders with intelligent grouping and bulk processing capabilities.

* **Functions**:
  * **Purchase Request Selection**: 
    - Display of all approved purchase requests eligible for conversion
    - Multi-select capability with checkboxes
    - Filtering by vendor, date range, department, and status
    - Search functionality across PR fields
    - Display of PR details including items, quantities, and estimated values
    
  * **Intelligent Grouping**: 
    - Automatic grouping of selected PRs by vendor, currency, and delivery date
    - Visual indication of how PRs will be grouped into separate POs
    - Option to modify grouping logic before conversion
    - Preview of resulting purchase orders before creation
    
  * **Single PO Creation**: 
    - Direct creation when PRs form a single logical group
    - Navigation to standard PO creation form with pre-populated data
    - Source PR traceability maintained in PO items
    - Conversion of PR items to PO line items with proper mapping
    
  * **Bulk PO Creation**: 
    - Processing of multiple PO groups simultaneously
    - Bulk creation workflow for multiple purchase orders
    - Status tracking for each PO creation in the batch
    - Error handling and retry capabilities for failed conversions
    
  * **Data Mapping & Conversion**: 
    - Intelligent mapping of PR fields to PO fields
    - Preservation of item specifications and requirements
    - Vendor and financial information transfer
    - Approval history and notes migration

### **Feature 4: Purchase Order Detail View and Management** - [Link to PO Detail in Carmen ERP](`/procurement/purchase-orders/[id]`)

* **Description**: Comprehensive detail view and management interface for individual purchase orders providing full lifecycle management from creation through closure.

* **Tabs/Sections**:
  * **Items Tab**: Detailed line item management and editing
  * **Documents Tab**: Related document viewing and attachment management

* **Functions**:
  * **Header Information Display**: 
    - Complete PO header with all key details (PO number, vendor, dates, financial totals)
    - Status indicator with visual badge and color coding
    - Creation and modification timestamps with user attribution
    - Source PR references when applicable
    - Vendor contact information and shipping details
    
  * **Status Management**: 
    - Status change workflow with confirmation dialogs
    - Reason capture for status changes (required for cancellations/voids)
    - Status history tracking with timestamps and user records
    - Business rule enforcement for status transitions
    - Automatic status updates based on receiving activities
    
  * **Item Management**: 
    - Line item editing with quantity, price, and specification changes
    - Add new items to existing purchase orders
    - Delete or modify existing line items
    - Split line functionality for partial receipts
    - Item status tracking (pending, partially received, fully received)
    - Inventory information display for each item
    
  * **Financial Management**: 
    - Real-time financial calculations and summaries
    - Tax and discount calculations at line and header levels
    - Multi-currency display with base currency conversion
    - Financial approval workflow integration
    - Budget checking and allocation tracking
    
  * **Document Actions**: 
    - Print purchase order in standard format
    - Email PO to vendor with customizable templates
    - Export to multiple formats (PDF, Excel, CSV)
    - Export section selection and customization
    - Generate receiving documents and labels
    
  * **Activity Tracking**: 
    - Complete audit trail of all PO activities
    - Status change history with reasons and timestamps
    - User action tracking (edits, approvals, communications)
    - Document generation and distribution log
    - Integration with workflow and approval systems

### **Feature 5: Purchase Order Editing** - [Link to Edit PO in Carmen ERP](`/procurement/purchase-orders/[id]/edit`)

* **Description**: In-line editing functionality for purchase orders allowing modifications to header information, line items, and related details while maintaining data integrity and approval workflows.

* **Functions**:
  * **Edit Mode Activation**: 
    - Edit button activation with proper permission checking
    - Form field enablement with appropriate input controls
    - Validation rule application during editing
    - Concurrent editing protection and conflict resolution
    
  * **Header Editing**: 
    - Vendor change with impact analysis
    - Date modifications with business rule validation
    - Currency and exchange rate updates with recalculation triggers
    - Description and remarks modification
    - Terms and conditions updates
    
  * **Line Item Editing**: 
    - Quantity adjustments with inventory impact checking
    - Price changes with approval requirement enforcement
    - Item substitution with specification matching
    - Tax and discount rate modifications
    - Line-level notes and special instructions
    
  * **Validation & Save**: 
    - Real-time field validation with error messaging
    - Business rule checking (budget limits, approval thresholds)
    - Change impact analysis and user confirmation
    - Save draft functionality for incomplete changes
    - Final save with audit trail creation
    
  * **Workflow Integration**: 
    - Re-approval trigger for significant changes
    - Notification generation for affected stakeholders
    - Status adjustment based on modification type
    - Change approval workflow when required

### **Feature 6: Bulk Purchase Order Creation** - [Link to Bulk Creation in Carmen ERP](`/procurement/purchase-orders/create/bulk`)

* **Description**: Specialized interface for creating multiple purchase orders simultaneously from grouped purchase requests with batch processing and individual review capabilities.

* **Functions**:
  * **Bulk Creation Overview**: 
    - Display of all PO groups to be created
    - Summary statistics (total POs, total value, vendor breakdown)
    - Individual group review and modification capability
    - Creation sequence planning and optimization
    
  * **Group Management**: 
    - Individual group editing and customization
    - Regroup functionality based on different criteria
    - Group validation and completeness checking
    - Preview of each resulting purchase order
    
  * **Batch Processing**: 
    - Sequential or parallel PO creation processing
    - Progress tracking with status indicators
    - Error handling and retry mechanisms
    - Partial success handling with continuation options
    
  * **Review & Finalization**: 
    - Created PO review and verification
    - Batch approval workflow initiation
    - Success/failure reporting with detailed logs
    - Navigation to created POs for individual review

---

## Navigation and Interfaces

* **Main Navigation Link**: [Link to the main module page in Carmen ERP](`/procurement/purchase-orders`) (Procurement → Purchase Orders)

* **Key Interfaces/Objects**:

  * **PurchaseOrder**: Primary data structure for purchase order management in the Carmen ERP system.

```typescript
interface PurchaseOrder {
  // Core Identification
  poId: string;
  number: string;
  
  // Vendor Information
  vendorId: number;
  vendorName: string;
  
  // Dates and Timeline
  orderDate: Date;
  DeliveryDate?: Date;
  approvalDate?: Date;
  
  // Status and Workflow
  status: PurchaseOrderStatus;
  
  // Financial Information
  totalAmount: number;
  currencyCode: string;
  baseCurrencyCode: string;
  exchangeRate: number;
  
  // Calculated Totals
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  
  // User and Approval Information
  createdBy: number;
  approvedBy?: number;
  buyer: string;
  
  // Terms and Conditions
  creditTerms: string;
  email: string;
  
  // Content and Notes
  description: string;
  remarks: string;
  notes?: string;
  
  // Source Document References
  purchaseRequisitionIds: string[];
  purchaseRequisitionNumbers: string[];
  
  // Address and Delivery
  shippingAddress?: Address;
  deliveryPoint?: string;
  
  // Line Items
  items: PurchaseOrderItem[];
  
  // Activity and Audit
  activityLog?: ActivityLogEntry[];
}
```

  * **PurchaseOrderItem**: Line item structure for individual products/services within a purchase order.

```typescript
interface PurchaseOrderItem {
  // Core Identification
  id: string;
  name: string;
  description: string;
  
  // Quantity and Unit Management
  convRate: number;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  
  // Receiving Tracking
  baseReceivingQty: number;
  receivedQuantity: number;
  remainingQuantity: number;
  
  // Pricing
  unitPrice: number;
  
  // Financial Calculations
  subTotalPrice: number;
  baseSubTotalPrice: number;
  netAmount: number;
  baseNetAmount: number;
  discountAmount: number;
  baseDiscAmount: number;
  taxAmount: number;
  baseTaxAmount: number;
  totalAmount: number;
  baseTotalAmount: number;
  
  // Rates and Flags
  taxRate: number;
  discountRate: number;
  taxIncluded: boolean;
  isFOC: boolean; // Free of Charge
  
  // Status and Tracking
  status: string;
  
  // Inventory Integration
  inventoryInfo?: InventoryInfo;
  
  // Source Traceability (for PR conversions)
  sourcePRId?: string;
  sourcePRNumber?: string;
  sourcePRItemId?: string;
}
```

  * **InventoryInfo**: Inventory-related information for purchase order items.

```typescript
interface InventoryInfo {
  onHand: number;
  onOrdered: number;
  reorderLevel: number;
  restockLevel: number;
  averageMonthlyUsage: number;
  lastPrice: number;
  lastOrderDate: Date;
  lastVendor: string;
}
```

  * **ActivityLogEntry**: Audit trail entry for tracking purchase order activities.

```typescript
interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  activityType: string;
  description: string;
  timestamp: Date;
}
```

  * **Address**: Shipping and delivery address structure.

```typescript
interface Address {
  id: string;
  addressType: string;
  addressLine: string;
  subDistrictId: string;
  districtId: string;
  provinceId: string;
  postalCode: string;
  isPrimary: boolean;
}
```

* **Enums/Status Fields**:

  * **PurchaseOrderStatus**: Available status values for purchase order lifecycle management.

```typescript
enum PurchaseOrderStatus {
  Draft = "Draft",
  Sent = "Sent", 
  Acknowledged = "Acknowledged",
  PartiallyReceived = "Partially Received",
  FullyReceived = "Fully Received",
  Cancelled = "Cancelled",
  Closed = "Closed",
  Voided = "Voided"
}
```

  * **DocumentStatus**: General document status enumeration used across procurement documents.

```typescript
enum DocumentStatus {
  Draft = "DRAFT",
  Pending = "PENDING", 
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  Voided = "VOIDED"
}
```

---

## Potential Enhancements/Future Considerations (Optional)

* **Advanced Vendor Management**: Enhanced vendor performance tracking and automatic vendor selection based on historical performance and pricing.

* **Intelligent PO Recommendations**: AI-powered suggestions for optimal ordering quantities, timing, and vendor selection based on historical data and demand forecasting.

* **Electronic PO Transmission**: Direct electronic integration with vendor systems for automated PO transmission and acknowledgment.

* **Advanced Approval Workflows**: Configurable multi-stage approval workflows based on PO value, vendor, commodity type, and organizational hierarchy.

* **Contract Integration**: Integration with contract management for automatic terms application and compliance checking.

* **Mobile Application**: Dedicated mobile app for PO approval, receiving, and field operations.

* **Vendor Portal Integration**: Self-service vendor portal for PO acknowledgment, status updates, and document exchange.

* **Advanced Analytics**: Comprehensive spend analytics, vendor performance dashboards, and procurement KPI tracking.

* **Integration Enhancements**: Enhanced integration with ERP systems, accounting software, and external procurement platforms.

* **Document Templates**: Customizable PO templates for different vendor types, commodities, and business requirements.