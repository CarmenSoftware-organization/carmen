# Goods Receive Note Management Module

This document provides a comprehensive technical specification for the Goods Receive Note (GRN) module within the Carmen ERP system, covering all currently implemented features, data structures, and user interactions.

## Module Name: Goods Receive Notes

## Actionable Features

### **Feature 1: View Goods Receive Note List** - [Link to GRN List in Carmen ERP](`/procurement/goods-received-note`)

* **Description**: Displays a comprehensive list of all goods receive notes with filtering, sorting, and export capabilities. Users can track and manage goods received from vendors, validate deliveries against purchase orders, and maintain accurate inventory records.

* **Functions**:
  * **List Display**: 
    - Shows all goods receive notes in a data table format with columns: GRN Number, Date, Vendor, Status, Total Amount, Currency
    - Provides comprehensive filtering and search capabilities
    - Displays status badges with color-coded visual indicators
    - Shows total count and pagination controls when applicable
    
  * **Filtering & Search**: 
    - Global search functionality across all GRN fields
    - Advanced filtering by status, vendor, date range, currency, and amount range
    - Quick filter buttons for common status filters (Received, Committed, etc.)
    - Filter persistence across page navigation
    
  * **Sorting**: 
    - Column-based sorting (ascending/descending) for all visible columns
    - Multi-column sorting capability
    - Sort state persistence
    
  * **Export Operations**: 
    - Export to PDF, Excel, or CSV formats
    - Print operations for selected GRNs
    - Bulk operations on selected records
    - Custom export configurations

### **Feature 2: Create New Goods Receive Note** - [Link to Create GRN in Carmen ERP](`/procurement/goods-received-note/create`)

* **Description**: Comprehensive goods receive note creation functionality supporting multiple creation methods including creation from purchase orders and manual entry workflows.

* **Creation Methods**:
  * **From Purchase Order**: Creation based on existing purchase orders with automatic item population
  * **Manual Entry**: Direct creation of goods receive notes without predefined purchase orders

* **Functions**:
  * **Creation Workflow**: 
    - Dropdown menu with creation options accessible from main GRN list page
    - "New GRN" button with expandable options: "Create from Purchase Order" and "Create Manually"
    - Navigation to appropriate creation workflows based on selected method
    - Process type selection stored in application state for workflow continuity
    
  * **Process Selection Logic**: 
    - PO-based creation: Navigate to vendor selection → PO selection → item confirmation workflow
    - Manual creation: Generate temporary GRN ID and navigate directly to GRN detail form
    - Store creation context in Zustand state management for cross-page persistence
    - Error handling for navigation failures and state management issues

### **Feature 3: Create GRN from Purchase Order Workflow** - [Link to PO-based Creation in Carmen ERP](`/procurement/goods-received-note/new/vendor-selection`)

* **Description**: Multi-step workflow for creating goods receive notes from existing purchase orders with vendor selection, PO selection, and item confirmation stages.

* **Workflow Steps**:
  * **Vendor Selection**: Initial vendor selection from active vendor database
  * **PO Selection**: Purchase order selection based on chosen vendor
  * **Item Location Selection**: Specify storage locations for received items
  * **Confirmation**: Final review and GRN creation confirmation

* **Functions**:
  * **Vendor Selection Process**: 
    - Display searchable list of active vendors
    - Search functionality by company name and business registration number
    - Vendor information display including registration number and company name
    - Selection confirmation with navigation to next step
    - State persistence for selected vendor information
    
  * **Purchase Order Selection**: 
    - Display eligible purchase orders for selected vendor
    - Filter by PO status, date range, and outstanding quantities
    - PO details preview with item information
    - Multi-PO selection capability when applicable
    
  * **Item and Location Management**: 
    - Review items from selected purchase orders
    - Specify receiving quantities for each line item
    - Assign storage locations for received goods
    - Handle partial receipts and quantity adjustments
    - Validate against original PO quantities and specifications
    
  * **Workflow State Management**: 
    - Zustand store management for cross-page state persistence
    - Step navigation with back/forward capabilities
    - Progress indicator showing current workflow position
    - Data validation at each step before proceeding
    - Error recovery mechanisms for failed operations

### **Feature 4: Goods Receive Note Detail View and Management** - [Link to GRN Detail in Carmen ERP](`/procurement/goods-received-note/[id]`)

* **Description**: Comprehensive detail view and management interface for individual goods receive notes providing full lifecycle management from receipt through commitment to inventory.

* **Modes of Operation**:
  * **View Mode**: Read-only display of GRN information
  * **Edit Mode**: Modification of GRN details and line items
  * **Add Mode**: Creation and initial setup of new GRNs

* **Tabs/Sections**:
  * **Items Tab**: Detailed line item management and receiving information
  * **Stock Movement Tab**: Inventory movement tracking and location assignments
  * **Extra Costs Tab**: Additional costs associated with the receipt (shipping, handling, insurance)
  * **Financial Summary Tab**: Complete financial breakdown and journal entry details
  * **Tax Tab**: Tax calculations and adjustments
  * **Activity Log Tab**: Complete audit trail of all GRN activities
  * **Comments & Attachments Tab**: Document attachments and communication records

* **Functions**:
  * **Header Information Management**: 
    - Complete GRN header display with reference number, dates, vendor information
    - Status indicator with visual badge and business rule enforcement
    - Invoice information capture (invoice number, date, tax invoice details)
    - Financial totals with multi-currency support and exchange rate handling
    - Consignment and cash purchase flags with associated business logic
    
  * **Mode Determination Logic**: 
    - Automatic mode detection based on ID pattern (new- prefix indicates add mode)
    - URL parameter mode override with validation
    - State management for mode transitions during editing
    - Form field enablement/disablement based on current mode
    - Permission checking for mode access rights
    
  * **Item Management Interface**: 
    - Line item editing with quantity, price, and specification management
    - Receiving quantity validation against ordered quantities
    - Quality control status tracking (pending, passed, failed, conditional)
    - Batch/lot number assignment and expiry date tracking
    - Serial number management for serialized items
    - Inventory integration showing on-hand quantities and reorder levels
    
  * **Financial Management**: 
    - Real-time financial calculations for subtotals, taxes, discounts, and totals
    - Multi-currency support with base currency conversion
    - Tax rate application and calculation with inclusivity handling
    - Discount management at line and header levels
    - Extra cost allocation and distribution across line items
    
  * **Stock Movement Processing**: 
    - Automatic stock movement generation upon GRN commitment
    - Location-based inventory updates with before/after stock tracking
    - Integration with inventory management system
    - Stock-out prevention and validation
    - Movement reversal capabilities for corrections
    
  * **Document State Management**: 
    - Unsaved changes tracking with user prompts
    - Form validation with real-time error display
    - Auto-save capabilities for draft documents
    - Concurrent editing protection and conflict resolution
    - Version control and change history maintenance

### **Feature 5: GRN Item Management and Processing** - [Link to GRN Items in Carmen ERP](`/procurement/goods-received-note/[id]#items-tab`)

* **Description**: Detailed line item management interface providing comprehensive control over received goods including quantity validation, quality control, and inventory integration.

* **Functions**:
  * **Item Detail Form Management**: 
    - Expandable item rows with detailed editing capabilities
    - Item specification display including description, job codes, and references
    - Quantity management with ordered vs. received quantity tracking
    - Unit conversion handling between order units and base units
    - Price validation and adjustment capabilities
    
  * **Quality Control Processing**: 
    - Quality status assignment (pending, passed, failed, conditional)
    - Rejection quantity tracking with reason codes
    - Damage quantity recording with detailed notes
    - Quality control checklist completion
    - Inspector assignment and approval workflow
    
  * **Inventory Integration**: 
    - Real-time inventory information display (on-hand, on-order, reorder levels)
    - Automatic inventory updates upon GRN commitment
    - Location-based stock allocation and management
    - Batch/lot tracking with expiry date management
    - Serial number assignment for trackable items
    
  * **Financial Calculations**: 
    - Line-level financial calculations with tax and discount handling
    - Multi-currency support with exchange rate application
    - Extra cost allocation from header-level charges
    - Total calculations with validation against header totals
    - Cost center and project code assignment for expense tracking
    
  * **Bulk Operations**: 
    - Multi-select item operations for efficiency
    - Bulk status updates and approvals
    - Mass quantity adjustments with validation
    - Batch location assignments
    - Bulk quality control operations

### **Feature 6: GRN Status Management and Workflow** - [Link to GRN Status Management in Carmen ERP](`/procurement/goods-received-note/[id]#status-management`)

* **Description**: Comprehensive status management system controlling GRN lifecycle from receipt through final commitment to inventory with full audit trail and business rule enforcement.

* **Status Workflow**:
  * **Received**: Initial status when goods are physically received
  * **Committed**: Final status when inventory has been updated and financial entries processed
  * **Void**: Cancelled status for erroneous or cancelled receipts

* **Functions**:
  * **Status Transition Control**: 
    - Business rule validation for status changes
    - User permission checking for status modification rights
    - Confirmation dialogs for irreversible status changes
    - Reason capture for status modifications with audit trail
    - Automatic status updates based on system events
    
  * **Commitment Processing**: 
    - Inventory update validation and execution
    - Financial journal entry generation with proper account coding
    - Integration with accounts payable for vendor invoice matching
    - Cost center allocation and project expense tracking
    - Reversal procedures for commitment corrections
    
  * **Activity Logging**: 
    - Complete audit trail of all status changes with timestamps
    - User attribution for all modifications and approvals
    - System-generated activity entries for automated processes
    - Integration with workflow management for approval processes
    - Export capabilities for audit and compliance reporting

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Navigation and Interfaces

* **Main Navigation Link**: [Link to the main module page in Carmen ERP](`/procurement/goods-received-note`) (Procurement → Goods Receive Notes)

* **Key Interfaces/Objects**:

  * **GoodsReceiveNote**: Primary data structure for goods receive note management in the Carmen ERP system.

```typescript
interface GoodsReceiveNote {
  // Core Identification
  id: string;
  ref: string;
  date: Date;
  
  // Invoice Information
  invoiceDate: Date;
  invoiceNumber: string;
  taxInvoiceDate?: Date;
  taxInvoiceNumber?: string;
  
  // Vendor and Location Information
  vendorId: string;
  vendor: string;
  location: string;
  
  // Content and Processing
  description: string;
  receiver: string;
  status: GoodsReceiveNoteStatus;
  
  // Financial Information
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  
  // Calculated Financial Totals
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  
  // Business Flags
  isConsignment: boolean;
  isCash: boolean;
  cashBook?: string;
  
  // Payment Terms
  creditTerms?: string;
  dueDate?: Date;
  
  // Related Data Collections
  items: GoodsReceiveNoteItem[];
  selectedItems: string[];
  stockMovements: StockMovement[];
  extraCosts: ExtraCost[];
  comments: Comment[];
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  
  // Financial Integration
  financialSummary?: FinancialSummary | null;
}
```

  * **GoodsReceiveNoteItem**: Line item structure for individual received products/goods within a GRN.

```typescript
interface GoodsReceiveNoteItem {
  // Core Identification
  id: string;
  name: string;
  description: string;
  jobCode: string;
  
  // Quantity Management
  orderedQuantity: number;
  orderUnit: string;
  receivedQuantity: number;
  unit: string;
  
  // Quality and Tracking
  expiryDate?: Date;
  serialNumber?: string;
  lotNumber: string;
  notes?: string;
  
  // Pricing and Financial
  unitPrice: number;
  subTotalAmount: number;
  totalAmount: number;
  netAmount: number;
  
  // Tax and Discount Handling
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  taxIncluded: boolean;
  
  // Multi-Currency Support
  baseCurrency: string;
  baseQuantity: number;
  baseUnitPrice: number;
  baseUnit: string;
  baseSubTotalAmount: number;
  baseNetAmount: number;
  baseTotalAmount: number;
  baseTaxRate: number;
  baseTaxAmount: number;
  baseDiscountRate: number;
  baseDiscountAmount: number;
  conversionRate: number;
  currency: string;
  exchangeRate: number;
  
  // Additional Costs and Inventory
  extraCost: number;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryReorderThreshold: number;
  inventoryRestockLevel: number;
  
  // Purchase Order Integration
  purchaseOrderRef: string;
  lastPurchasePrice: number;
  lastOrderDate: Date;
  lastVendor: string;
  
  // Location and Delivery
  deliveryPoint: string;
  deliveryDate: Date;
  location: string;
  
  // Business Flags
  isFreeOfCharge: boolean;
  isConsignment?: boolean;
  isTaxInclusive?: boolean;
  
  // System Configuration
  taxSystem?: 'GST' | 'VAT';
  projectCode?: string;
  marketSegment?: string;
  
  // Adjustment Controls
  adjustments: {
    discount: boolean;
    tax: boolean;
  };
  
  // Available Lots Information
  availableLots?: {
    lotNumber: string;
    expiryDate: Date;
  }[];
  
  // Free of Charge Handling
  focQuantity?: number;
  focUnit?: string;
  focConversionRate?: number;
}
```

  * **StockMovement**: Stock movement tracking for inventory location transfers and updates.

```typescript
interface StockMovement {
  id?: string | number;
  fromLocation?: string;
  toLocation: string;
  location?: LocationInfo;
  itemName: string;
  itemDescription?: string;
  lotNumber: string;
  unit: string;
  quantity: number;
  cost: number;
  totalCost: number;
  netAmount: number;
  extraCost: number;
  beforeStock: number;
  afterStock: number;
  stockOut: number;
  currency?: string;
  totalAmount?: number;
}
```

  * **LocationInfo**: Location information for inventory management and stock movements.

```typescript
interface LocationInfo {
  type: 'INV' | 'DIR';
  code: string;
  name: string;
  displayType: 'Inventory' | 'Direct';
}
```

  * **ExtraCost**: Additional costs associated with goods receipt (shipping, handling, insurance).

```typescript
interface ExtraCost {
  id: string;
  type: CostType;
  amount: number;
  currency: string;
  exchangeRate: number;
  baseAmount: number;
  baseCurrency: string;
}
```

  * **FinancialSummary**: Financial summary and journal entry details for GRN.

```typescript
interface FinancialSummary {
  id: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  baseNetAmount: number;
  baseTaxAmount: number;
  baseTotalAmount: number;
  baseCurrency: string;
  jvType: string;
  jvNumber: string;
  jvDate: Date;
  jvDescription: string;
  jvStatus: string;
  jvReference: string;
  jvDetail?: JournalEntryDetail[];
  jvTotal: JournalEntryTotal;
  sourceOfTransaction?: string;
}
```

  * **ActivityLogEntry**: Audit trail entry for tracking GRN activities and changes.

```typescript
interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  activityType?: string;
  description: string;
  timestamp: Date;
  details?: string;
}
```

* **Enums/Status Fields**:

  * **GoodsReceiveNoteStatus**: Available status values for GRN lifecycle management.

```typescript
type GoodsReceiveNoteStatus = 'Received' | 'Committed';
```

  * **GoodsReceiveNoteMode**: Operating modes for GRN detail interface.

```typescript
type GoodsReceiveNoteMode = "view" | "edit" | "add";
```

  * **CostType**: Types of additional costs that can be associated with goods receipt.

```typescript
type CostType = "shipping" | "handling" | "insurance" | "other";
```

  * **GRNStatus**: Enhanced status enumeration for comprehensive status management.

```typescript
enum GRNStatus {
  DRAFT = "DRAFT",
  RECEIVED = "RECEIVED", 
  COMMITTED = "COMMITTED",
  VOID = "VOID"
}
```

---

## Potential Enhancements/Future Considerations (Optional)

* **Advanced Quality Control**: Enhanced quality control workflows with photo capture, quality checklists, and inspector assignment with digital signatures.

* **Barcode/QR Code Integration**: Barcode scanning capabilities for rapid item identification, quantity verification, and location assignment during receiving.

* **Mobile Receiving Application**: Dedicated mobile app for warehouse staff to process receipts, update quantities, and assign locations in real-time.

* **Vendor Portal Integration**: Self-service vendor portal for delivery notifications, document upload, and receipt confirmation with real-time status updates.

* **Advanced Analytics**: Comprehensive receiving analytics including vendor performance metrics, receiving efficiency tracking, and quality control reporting.

* **Integration Enhancements**: Enhanced integration with WMS systems, transportation management, and vendor EDI for automated receiving workflows.

* **Document Recognition**: AI-powered invoice and packing slip recognition for automatic data extraction and validation against purchase orders.

* **Predictive Receiving**: AI-powered predictions for optimal receiving schedules, resource allocation, and inventory planning based on historical patterns.

* **Blockchain Integration**: Blockchain-based supply chain tracking for enhanced traceability, authenticity verification, and compliance reporting.

* **Advanced Approval Workflows**: Configurable multi-stage approval workflows for high-value receipts, quality exceptions, and financial discrepancies.