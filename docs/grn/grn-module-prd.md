# Goods Received Note (GRN) Module - Product Requirements Document

## 1. Introduction

### 1.1 Purpose
This Product Requirements Document (PRD) outlines the detailed specifications for the Goods Received Note (GRN) module within the Carmen F&B Management System. The GRN module is designed to manage and track the receipt of goods from vendors, ensuring accurate inventory records and facilitating proper financial accounting.

### 1.2 Scope
This document covers the complete functionality of the GRN module, including:
- User interface design and components
- Page flows and navigation
- Data structures and relationships
- Business rules and validations
- Integration with other modules

### 1.3 Definitions and Acronyms
- **GRN**: Goods Received Note
- **PO**: Purchase Order
- **AP**: Accounts Payable
- **FOC**: Free of Charge
- **UOM**: Unit of Measure

### 1.4 References
- Goods Received Note Business Analysis (goods-received-note-ba.md)
- GRN API Specification (grn-api-sp.md)
- GRN Business Analysis (grn-ba.md)

## 2. Product Overview

### 2.1 Product Perspective
The GRN module is a core component of the Carmen F&B Management System's procurement process. It integrates with the Purchase Order, Inventory Management, and Financial Management modules to provide a comprehensive solution for managing goods receipt.

### 2.2 User Personas

#### Warehouse Staff
- Responsible for receiving goods from vendors
- Records quantities and conditions of received items
- Initiates the GRN creation process

#### Warehouse Manager
- Reviews and approves GRNs
- Manages exceptions and discrepancies
- Oversees warehouse operations

#### Quality Control Personnel
- Inspects received goods for quality
- Records inspection results
- Approves or rejects items based on quality standards

#### Finance Officer
- Reviews financial aspects of GRNs
- Processes vendor payments
- Ensures proper accounting entries

#### Procurement Officer
- Links GRNs to purchase orders
- Manages vendor relationships
- Handles discrepancies between ordered and received goods

### 2.3 Key Features
1. GRN creation and management
2. Item receipt and inspection
3. Quality control integration
4. Financial processing
5. Inventory updates
6. Document attachments and comments
7. Activity logging and audit trails
8. Reporting and analytics

## 3. User Interface Requirements

### 3.1 Page Structure and Flow

#### 3.1.1 GRN List Page
- **URL Path**: `/procurement/goods-received-note`
- **Purpose**: Display a list of all GRNs with filtering and sorting options
- **Key Components**:
  - Header with title and action buttons
  - Filter and search controls
  - GRN data table with pagination
  - Bulk action controls
  - Export and print options

#### 3.1.2 GRN Creation Page
- **URL Path**: `/procurement/goods-received-note/create`
- **Purpose**: Create a new GRN
- **Key Components**:
  - Header with title and action buttons
  - Vendor and PO selection
  - Basic information form
  - Items tab for adding received items
  - Extra costs tab
  - Stock movement tab
  - Journal entries tab
  - Tax entries tab
  - Transaction summary

#### 3.1.3 GRN Detail Page
- **URL Path**: `/procurement/goods-received-note/[id]`
- **Purpose**: View and edit an existing GRN
- **Key Components**:
  - Header with title, status badge, and action buttons
  - Basic information display/form
  - Tabs for different aspects of the GRN
  - Transaction summary
  - Activity log

#### 3.1.4 GRN Edit Page
- **URL Path**: `/procurement/goods-received-note/[id]/edit`
- **Purpose**: Edit an existing GRN
- **Key Components**: Same as GRN Detail Page but in edit mode

### 3.2 Component Specifications

#### 3.2.1 GRN List Component
- **Component Name**: `GoodsReceiveNoteList`
- **Features**:
  - Sortable columns
  - Filterable data
  - Pagination
  - Bulk actions
  - Row selection
  - Status indicators
  - Action buttons per row

#### 3.2.2 GRN Detail Component
- **Component Name**: `GoodsReceiveNoteComponent`
- **Features**:
  - Mode switching (view/edit/create)
  - Form validation
  - Real-time calculations
  - Status management
  - Action buttons based on status and permissions

#### 3.2.3 GRN Items Component
- **Component Name**: `GoodsReceiveNoteItems`
- **Features**:
  - Item grid with inline editing
  - Quantity validation
  - Price and amount calculations
  - Lot and serial number tracking
  - Item selection for bulk actions

#### 3.2.4 Extra Costs Component
- **Component Name**: `ExtraCostsTab`
- **Features**:
  - Cost type selection
  - Amount entry
  - Distribution method selection
  - Cost allocation preview

#### 3.2.5 Stock Movement Component
- **Component Name**: `StockMovementTab`
- **Features**:
  - Movement type display
  - Quantity and location tracking
  - Lot and batch tracking
  - Movement history

#### 3.2.6 Financial Summary Component
- **Component Name**: `FinancialSummaryTab`
- **Features**:
  - Journal entry preview
  - Account distribution
  - Currency conversion
  - Tax breakdown

#### 3.2.7 Tax Tab Component
- **Component Name**: `TaxTab`
- **Features**:
  - Tax invoice details
  - Tax calculation breakdown
  - Tax code management
  - Tax amount validation

### 3.3 Tab Structure

#### 3.3.1 Items Tab
- Display and manage received items
- Show ordered vs. received quantities
- Allow inline editing of quantities and prices
- Support lot and serial number entry
- Calculate item totals

#### 3.3.2 Extra Costs Tab
- Manage additional costs (freight, insurance, etc.)
- Allocate costs to items
- Select distribution methods
- Calculate landed costs

#### 3.3.3 Stock Movement Tab
- Display inventory movements
- Show lot and location details
- Track movement history
- Display movement status

#### 3.3.4 Journal Entries Tab
- Preview accounting entries
- Show account distributions
- Display debit and credit amounts
- Show posting status

#### 3.3.5 Tax Entries Tab
- Manage tax invoice details
- Display tax calculations
- Show tax codes and rates
- Calculate tax totals

#### 3.3.6 Comments Tab
- Add and view comments
- Tag users in comments
- Sort comments by date
- Filter comments by user

#### 3.3.7 Attachments Tab
- Upload and manage documents
- Preview attachments
- Download attachments
- Delete attachments

#### 3.3.8 Activity Log Tab
- Display all actions on the GRN
- Show user, date, and action details
- Filter by action type
- Sort by date

## 4. Functional Requirements

### 4.1 GRN Creation

#### 4.1.1 Create from Purchase Order
- Select a Purchase Order to create a GRN
- Auto-populate vendor and item details
- Allow modification of quantities and prices
- Generate a unique GRN reference number

#### 4.1.2 Create Direct GRN
- Create a GRN without a Purchase Order
- Select vendor manually
- Add items manually
- Specify all required details

#### 4.1.3 Create Cash Purchase GRN
- Create a GRN for cash purchases
- Select cash book
- Record payment details
- Generate appropriate financial entries

### 4.2 Item Management

#### 4.2.1 Receive Items
- Record received quantities
- Compare with ordered quantities
- Handle partial receipts
- Record lot and serial numbers

#### 4.2.2 Quality Inspection
- Record inspection results
- Accept or reject items
- Document rejection reasons
- Update inventory accordingly

#### 4.2.3 Price Variances
- Detect price variances from PO
- Allow authorized adjustments
- Document variance reasons
- Update financial calculations

### 4.3 Financial Processing

#### 4.3.1 Calculate Totals
- Calculate item subtotals
- Apply taxes and discounts
- Calculate document totals
- Handle currency conversions

#### 4.3.2 Extra Costs
- Record additional costs
- Allocate costs to items
- Calculate landed costs
- Update inventory values

#### 4.3.3 Generate Journal Entries
- Create accounting entries
- Update vendor balances
- Post to general ledger
- Track financial status

### 4.4 Approval Workflow

#### 4.4.1 Submit for Approval
- Change status to pending approval
- Notify approvers
- Lock certain fields
- Track submission details

#### 4.4.2 Approval Process
- Route to appropriate approvers
- Capture approval decisions
- Record approval comments
- Update status based on approvals

#### 4.4.3 Post-Approval Actions
- Update inventory
- Generate financial entries
- Send notifications
- Archive documents

### 4.5 Document Management

#### 4.5.1 Attachments
- Upload supporting documents
- Manage document types
- Preview and download
- Track document history

#### 4.5.2 Comments
- Add comments to GRNs
- Tag users in comments
- Notify tagged users
- Track comment history

#### 4.5.3 Activity Logging
- Log all actions on GRNs
- Record user, date, and action details
- Provide audit trail
- Support compliance requirements

## 5. Data Requirements

### 5.1 GRN Header Data
```typescript
interface GoodsReceiveNote {
  id: string;
  ref: string;
  date: Date;
  invoiceDate: Date;
  invoiceNumber: string;
  taxInvoiceDate?: Date;
  taxInvoiceNumber?: string;
  description: string;
  receiver: string;
  vendorId: string;
  vendor: string;
  location: string;
  currency: string;
  exchangeRate: number;
  baseCurrency: string;
  status: GoodsReceiveNoteStatus;
  isConsignment: boolean;
  isCash: boolean;
  cashBook?: string;
  items: GoodsReceiveNoteItem[];
  selectedItems: string[];
  stockMovements: StockMovement[];
  extraCosts: ExtraCost[];
  comments: Comment[];
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  financialSummary?: FinancialSummary | null;
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
  creditTerms?: string;
  dueDate?: Date;
}
```

### 5.2 GRN Item Data
```typescript
interface GoodsReceiveNoteItem {
  id: string;
  name: string;
  description: string;
  jobCode: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  subTotalAmount: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
  expiryDate?: Date;
  serialNumber?: string;
  notes?: string;
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
  extraCost: number;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryReorderThreshold: number;
  inventoryRestockLevel: number;
  purchaseOrderRef: string;
  lastPurchasePrice: number;
  lastOrderDate: Date;
  lastVendor: string;
  lotNumber: string;
  deliveryPoint: string;
  deliveryDate: Date;
  location: string;
  isFreeOfCharge: boolean;
  taxIncluded: boolean;
  adjustments: {
    discount: boolean;
    tax: boolean;
  };
  availableLots?: {
    lotNumber: string;
    expiryDate: Date;
  }[];
}
```

### 5.3 Extra Cost Data
```typescript
interface ExtraCost {
  id: string;
  type: string;
  description: string;
  amount: number;
  baseAmount: number;
  currency: string;
  exchangeRate: number;
  distributionMethod: 'value' | 'quantity' | 'weight' | 'volume' | 'equal';
  allocations: {
    itemId: string;
    amount: number;
  }[];
}
```

### 5.4 Stock Movement Data
```typescript
interface StockMovement {
  id: string;
  itemId: string;
  documentId: string;
  documentType: string;
  documentRef: string;
  date: Date;
  quantity: number;
  unit: string;
  fromLocation?: string;
  toLocation: string;
  lotNumber?: string;
  expiryDate?: Date;
  serialNumbers?: string[];
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}
```

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load time under 2 seconds
- Form submission response under 1 second
- Support for handling up to 1000 items per GRN
- Support for concurrent users (up to 50 simultaneous users)

### 6.2 Security
- Role-based access control
- Data encryption for sensitive information
- Audit logging for all actions
- Secure API endpoints with proper authentication

### 6.3 Usability
- Responsive design for desktop and tablet
- Intuitive navigation and workflow
- Clear error messages and validation feedback
- Keyboard shortcuts for common actions

### 6.4 Reliability
- 99.9% uptime during business hours
- Data backup and recovery procedures
- Graceful error handling
- Offline capability for basic functions

### 6.5 Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-friendly design for tablet devices
- Print-friendly layouts for documents

## 7. Integration Requirements

### 7.1 Purchase Order Integration
- Link GRNs to Purchase Orders
- Update PO status based on GRN status
- Track received vs. ordered quantities
- Handle partial receipts

### 7.2 Inventory Integration
- Update inventory levels
- Track lot and serial numbers
- Manage warehouse locations
- Calculate inventory values

### 7.3 Financial Integration
- Generate journal entries
- Update vendor balances
- Process payments
- Handle tax calculations

### 7.4 Vendor Management Integration
- Access vendor information
- Update vendor performance metrics
- Manage vendor communications
- Track vendor history

## 8. User Interface Mockups

### 8.1 GRN List Page
```
+-----------------------------------------------------------------------+
| Goods Received Notes                                 [Create] [Export] |
+-----------------------------------------------------------------------+
| [Filter Bar: Status, Date Range, Vendor, Search]      [Bulk Actions]   |
+-----------------------------------------------------------------------+
| [ ] | GRN # | Date       | Vendor    | Status    | Total    | Actions  |
|-----+-------+------------+-----------+-----------+----------+----------|
| [ ] | GRN001| 2023-05-15 | Vendor A  | Received  | $1,500.00| [View]   |
| [ ] | GRN002| 2023-05-20 | Vendor B  | Partial   | $2,300.00| [View]   |
| [ ] | GRN003| 2023-05-25 | Vendor C  | Pending   | $3,100.00| [View]   |
+-----------------------------------------------------------------------+
| [< Prev] Page 1 of 5 [Next >]                                         |
+-----------------------------------------------------------------------+
```

### 8.2 GRN Detail Page
```
+-----------------------------------------------------------------------+
| < Back | Goods Received Note: GRN001                    [Status Badge] |
+-----------------------------------------------------------------------+
| [Edit] [Delete] [Print] [Send] [Approve] [Post]                       |
+-----------------------------------------------------------------------+
| Basic Information                                                      |
+-----------------------------------------------------------------------+
| Vendor: Vendor A                | GRN Date: 2023-05-15                 |
| Invoice #: INV-001              | Invoice Date: 2023-05-15             |
| Location: Warehouse A           | Receiver: John Doe                   |
| Currency: USD                   | Exchange Rate: 1.0                   |
+-----------------------------------------------------------------------+
| [Items] [Extra Costs] [Stock Movement] [Journal Entries] [Tax Entries] |
+-----------------------------------------------------------------------+
| Item Table                                                             |
| [Item Name] [Description] [Ordered] [Received] [Unit] [Price] [Total]  |
+-----------------------------------------------------------------------+
| Transaction Summary                                                    |
| Subtotal: $1,400.00                                                    |
| Discount: $0.00                                                        |
| Tax: $100.00                                                           |
| Total: $1,500.00                                                       |
+-----------------------------------------------------------------------+
```

## 9. Implementation Guidelines

### 9.1 Technology Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js
- State Management: React Context API, React Query

### 9.2 Development Approach
- Component-based architecture
- Server-side rendering for initial page load
- Client-side rendering for interactive elements
- API-first development
- Test-driven development

### 9.3 Coding Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write comprehensive unit and integration tests
- Document all components and functions

## 10. Testing Requirements

### 10.1 Unit Testing
- Test all business logic functions
- Test component rendering
- Test form validations
- Test calculations and data transformations

### 10.2 Integration Testing
- Test API endpoints
- Test module integrations
- Test workflow processes
- Test data persistence

### 10.3 User Acceptance Testing
- Test against user stories
- Verify business requirements
- Validate user workflows
- Ensure usability standards

### 10.4 Performance Testing
- Load testing for concurrent users
- Response time testing
- Resource utilization testing
- Scalability testing

## 11. Deployment and Maintenance

### 11.1 Deployment Strategy
- Continuous integration and deployment
- Feature flags for gradual rollout
- Blue-green deployment for zero downtime
- Automated rollback procedures

### 11.2 Monitoring and Logging
- Application performance monitoring
- Error tracking and alerting
- User activity logging
- System health dashboards

### 11.3 Maintenance Plan
- Regular security updates
- Performance optimizations
- Bug fixes and patches
- Feature enhancements

## 12. Appendices

### 12.1 Business Rules Reference
See the Goods Received Note Business Analysis document (goods-received-note-ba.md) for detailed business rules.

### 12.2 API Reference
See the GRN API Specification document (grn-api-sp.md) for detailed API endpoints and data structures.

### 12.3 Glossary
- **GRN**: Goods Received Note - A document that records the receipt of goods from a vendor
- **PO**: Purchase Order - A document sent to vendors to order goods or services
- **AP**: Accounts Payable - The amount owed by a company to its creditors
- **FOC**: Free of Charge - Items provided without cost
- **UOM**: Unit of Measure - The unit used to measure quantity (e.g., kg, liter, piece) 