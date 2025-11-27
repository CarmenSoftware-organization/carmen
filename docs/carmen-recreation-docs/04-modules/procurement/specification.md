# Procurement Module - Implementation Specification

**Module**: Procurement Management  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Purpose**: Complete implementation guide for Procurement module recreation

---

## 🎯 Module Overview

The Procurement module is the core purchasing and vendor management system for Carmen ERP, handling the complete procurement lifecycle from purchase requests through goods receipt. This module processes over 20 different routes and supports complex approval workflows.

### Key Capabilities
- **Purchase Request Management**: Complete PR lifecycle with approvals
- **Purchase Order Processing**: PO creation, modification, and tracking
- **Goods Receipt Processing**: GRN with quality control and discrepancy handling
- **Vendor Integration**: Direct vendor communication and management
- **Approval Workflows**: Role-based approval routing and escalation
- **Financial Integration**: Budget tracking and cost center allocation

### Module Statistics
- **20+ Routes**: Comprehensive procurement workflow coverage
- **6 User Roles**: Different access levels and permissions
- **8 Document States**: Complete workflow status management
- **15+ Form Types**: Various data entry and approval forms

---

## 🏗️ Route Architecture

### Primary Routes Structure
```
/procurement/
├── [main dashboard]              # Procurement overview and KPIs
├── purchase-requests/            # Purchase request management
│   ├── [list view]              # PR listing with filters
│   ├── new-pr/                  # New PR creation
│   ├── enhanced-demo/           # Enhanced PR demonstration
│   └── [id]/                    # Individual PR details and edit
├── purchase-orders/             # Purchase order management
│   ├── [list view]              # PO listing and tracking
│   ├── create/                  # New PO creation
│   │   ├── bulk/               # Bulk PO creation
│   │   └── from-pr/            # PO from existing PR
│   └── [id]/                   # PO details and management
├── goods-received-note/         # Goods receipt processing
│   ├── [list view]             # GRN listing
│   ├── new/                    # New GRN creation workflow
│   │   ├── po-selection/       # Select PO for receipt
│   │   ├── manual-entry/       # Manual GRN entry
│   │   ├── item-location-selection/ # Item placement
│   │   ├── confirmation/       # Receipt confirmation
│   │   └── vendor-selection/   # Vendor selection
│   └── [id]/                   # GRN details and edit
├── credit-note/                # Credit note management
│   ├── [list view]             # Credit note listing
│   ├── new/                    # Credit note creation
│   └── [id]/                   # Credit note details
├── my-approvals/               # User's pending approvals
├── purchase-request-templates/ # PR template management
└── vendor-comparison/          # Vendor comparison tools
```

### Route Implementation Details

#### Main Dashboard (`/procurement`)
**Purpose**: Executive overview of procurement activities  
**Components Required**:
- KPI cards (Total Orders, Active Suppliers, Monthly Spend)
- Recent activity feed
- Pending approvals widget
- Quick action buttons

#### Purchase Requests (`/procurement/purchase-requests`)
**Purpose**: Central PR management interface  
**Components Required**:
- Filterable data table with sorting
- Status badges for workflow states
- Bulk action controls
- Advanced search and filtering
- Export functionality

#### New Purchase Request (`/procurement/purchase-requests/new-pr`)
**Purpose**: Complete PR creation workflow  
**Form Sections**:
1. Request Information (description, department, priority)
2. Items Management (dynamic line items)
3. Vendor Selection (preferred vendors)
4. Approval Routing (workflow configuration)
5. Attachments and Notes

---

## 💾 Data Models & Types

### Purchase Request Types
```typescript
interface PurchaseRequest {
  id: string;
  number: string;              // Auto-generated PR number
  description: string;         // PR description/purpose
  department: string;          // Requesting department
  requestor: string;          // User ID of requestor
  status: DocumentStatus;      // Workflow status
  priority: PriorityLevel;     // Urgency level
  requiredDate: string;        // When items are needed
  items: PurchaseRequestItem[]; // Line items
  approvals: ApprovalStep[];   // Approval history
  totalAmount: Money;          // Total estimated cost
  budgetCode?: string;         // Budget allocation
  costCenter?: string;         // Cost center assignment
  attachments?: string[];      // Supporting documents
  notes?: string;             // Additional information
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface PurchaseRequestItem {
  id: string;
  productId?: string;          // Link to product catalog
  description: string;         // Item description
  quantity: number;           // Requested quantity
  unitOfMeasure: string;      // UOM (kg, pcs, etc.)
  estimatedPrice?: Money;     // Estimated unit price
  totalPrice?: Money;         // Line total
  specification?: string;     // Technical specifications
  category?: string;          // Item category
  vendorId?: string;         // Preferred vendor
  deliveryDate?: string;     // Required delivery
  notes?: string;            // Line item notes
}
```

### Purchase Order Types
```typescript
interface PurchaseOrder {
  id: string;
  number: string;              // PO number
  vendorId: string;           // Vendor reference
  vendorName: string;         // Vendor display name
  status: DocumentStatus;     // Order status
  orderDate: string;          // Order date
  deliveryDate?: string;      // Expected delivery
  items: PurchaseOrderItem[]; // Ordered items
  totalAmount: Money;         // Order total
  terms: string;              // Payment terms
  notes?: string;            // Order notes
  createdFrom?: string;       // Source PR reference
  approvals: ApprovalStep[];  // Approval trail
  deliveryAddress?: Address; // Delivery location
  billingAddress?: Address;  // Billing location
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  deliveryDate?: string;
  status: 'ordered' | 'partial' | 'received' | 'cancelled';
  receivedQuantity?: number;
}
```

### Goods Received Note Types
```typescript
interface GoodsReceivedNote {
  id: string;
  number: string;              // GRN number
  purchaseOrderId?: string;    // Reference PO
  vendorId: string;           // Delivering vendor
  receivedDate: string;        // Receipt date
  receivedBy: string;         // Receiving user
  items: GRNItem[];           // Received items
  totalAmount: Money;         // Receipt total
  status: 'draft' | 'completed' | 'partially-received';
  notes?: string;             // Receipt notes
  qualityIssues?: QualityIssue[]; // Quality problems
  discrepancies?: Discrepancy[]; // Quantity/quality issues
}

interface GRNItem {
  id: string;
  productId: string;
  description: string;
  orderedQty: number;         // Originally ordered
  receivedQty: number;        // Actually received
  unitPrice: Money;
  totalPrice: Money;
  condition: 'good' | 'damaged' | 'partial' | 'rejected';
  expiryDate?: string;        // For perishables
  batchNumber?: string;       // Batch tracking
  location: string;           // Storage location
  notes?: string;
}
```

---

## 🔐 Role-Based Access Control

### Procurement Access Matrix
| Feature | Staff | Dept Mgr | Financial Mgr | Purchasing | Counter | Chef |
|---------|--------|----------|---------------|------------|---------|------|
| **View PRs** | Own Dept | Own Dept | Multi-Dept | All | Limited | Recipe-Related |
| **Create PR** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Approve PR** | ❌ | Department | Multi-Dept | All | ❌ | Department |
| **Create PO** | ❌ | Limited | ✅ | ✅ | ❌ | ❌ |
| **Manage Vendors** | ❌ | View Only | ✅ | ✅ | ❌ | View Only |
| **Process GRN** | ❌ | Limited | ✅ | ✅ | ✅ | Ingredients |
| **View Pricing** | ❌ | Department | ✅ | ✅ | ❌ | Cost Info |

### Permission Implementation
```typescript
// Permission checking function
function canUserPerformAction(user: User, action: string, resource: any): boolean {
  const role = user.context.currentRole.name;
  
  switch (action) {
    case 'create-pr':
      return ['staff', 'department-manager', 'financial-manager', 'purchasing-staff', 'chef'].includes(role);
    
    case 'approve-pr':
      if (role === 'department-manager') {
        return resource.department === user.context.currentDepartment.id;
      }
      return ['financial-manager', 'purchasing-staff'].includes(role);
    
    case 'view-pricing':
      return ['department-manager', 'financial-manager', 'purchasing-staff'].includes(role) ||
             (role === 'chef' && resource.category === 'ingredients');
    
    default:
      return false;
  }
}
```

---

## 🖼️ Visual Reference Screenshots

### Core Procurement Interfaces
Based on captured screenshots, the following interfaces are documented:

#### Main Dashboard
- **File**: `procurement-main.png`
- **Features**: KPI dashboard, quick actions, navigation
- **Interactive Elements**: Dropdown filters, action buttons

#### Purchase Requests List
- **File**: `procurement-purchase-requests-main.png`
- **Features**: Filterable table, status indicators, bulk actions
- **Interactive Elements**: Search, filters, sorting, pagination

#### New Purchase Request Form
- **File**: `procurement-purchase-requests-new-pr-main.png`
- **Features**: Multi-section form, dynamic line items, workflow routing
- **Interactive Elements**: Add/remove items, vendor search, date pickers
- **Form States**: `procurement-purchase-requests-new-pr-form-filled.png`

#### Purchase Orders Management
- **File**: `procurement-purchase-orders-main.png`
- **Features**: Order tracking, status management, vendor information
- **Interactive Elements**: Status updates, delivery tracking

#### Goods Receipt Processing
- **Files**: Multiple GRN workflow screenshots
- **Features**: PO selection, item verification, quality control
- **Workflow Steps**: Selection → Entry → Confirmation → Storage

---

## ⚙️ Component Implementation

### Required UI Components
```typescript
// Core procurement components to implement
import { 
  PurchaseRequestList,     // Main PR listing table
  PurchaseRequestForm,     // PR creation/edit form
  PRItemManager,           // Dynamic line item management
  ApprovalWorkflow,        // Approval routing display
  VendorSelector,          // Vendor selection component
  PurchaseOrderForm,       // PO creation form
  GRNProcessingWizard,     // Multi-step GRN workflow
  BudgetTracker,          // Budget allocation display
  DocumentStatusBadge,     // Status indication
  ProcurementDashboard    // Main dashboard
} from '@/components/procurement'
```

### Form Validation Schemas
```typescript
// Zod validation schemas for data integrity
const purchaseRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(1, "Department is required"),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  requiredDate: z.string().refine(date => new Date(date) > new Date(), {
    message: "Required date must be in the future"
  }),
  items: z.array(z.object({
    description: z.string().min(5, "Item description required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unitOfMeasure: z.string().min(1, "Unit of measure required"),
    estimatedPrice: z.object({
      amount: z.number().min(0, "Price cannot be negative"),
      currency: z.string()
    }).optional()
  })).min(1, "At least one item is required")
});
```

---

## 🔄 Business Logic Implementation

### Approval Workflow Logic
```typescript
// Approval routing based on amount and department
function determineApprovalRoute(pr: PurchaseRequest): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  const totalAmount = pr.totalAmount.amount;
  
  // Department manager approval for all PRs
  if (pr.requestor !== getDepartmentManager(pr.department)) {
    steps.push({
      role: 'department-manager',
      department: pr.department,
      required: true,
      order: 1
    });
  }
  
  // Financial approval for amounts > $1000
  if (totalAmount > 1000) {
    steps.push({
      role: 'financial-manager',
      required: true,
      order: 2
    });
  }
  
  // Purchasing approval for all PRs
  steps.push({
    role: 'purchasing-staff',
    required: true,
    order: steps.length + 1
  });
  
  return steps;
}
```

### PR to PO Conversion Logic
```typescript
// Convert approved PR to PO
function convertPRToPO(pr: PurchaseRequest, vendorId: string): Partial<PurchaseOrder> {
  return {
    vendorId,
    status: 'draft',
    orderDate: new Date().toISOString(),
    items: pr.items.map(item => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.estimatedPrice || { amount: 0, currency: pr.totalAmount.currency },
      totalPrice: item.totalPrice || { amount: 0, currency: pr.totalAmount.currency },
      status: 'ordered'
    })),
    totalAmount: pr.totalAmount,
    createdFrom: pr.id,
    notes: `Generated from PR ${pr.number}`
  };
}
```

---

## 🔧 API Integration Points

### Server Actions Required
```typescript
// Purchase Request actions
async function createPurchaseRequest(data: CreatePRData): Promise<PurchaseRequest>
async function updatePurchaseRequest(id: string, data: UpdatePRData): Promise<PurchaseRequest>
async function approvePurchaseRequest(id: string, approval: ApprovalData): Promise<void>
async function convertPRToPO(prId: string, vendorId: string): Promise<PurchaseOrder>

// Purchase Order actions
async function createPurchaseOrder(data: CreatePOData): Promise<PurchaseOrder>
async function updatePurchaseOrder(id: string, data: UpdatePOData): Promise<PurchaseOrder>
async function sendPOToVendor(id: string): Promise<void>

// Goods Receipt actions
async function createGRN(data: CreateGRNData): Promise<GoodsReceivedNote>
async function processGRNItems(id: string, items: GRNItemData[]): Promise<void>
async function completeGRN(id: string): Promise<void>
```

### Integration Requirements
- **Inventory Integration**: Update stock levels on GRN completion
- **Financial Integration**: Post to accounting system
- **Vendor Integration**: Send POs via email/API
- **Budget Integration**: Check and reserve budget allocations
- **Notification System**: Email/SMS notifications for approvals

---

## ✅ Implementation Checklist

### Core Features
- [ ] Purchase request creation and management
- [ ] Multi-level approval workflows
- [ ] Purchase order generation and tracking
- [ ] Goods receipt processing with quality control
- [ ] Vendor integration and communication
- [ ] Budget tracking and allocation
- [ ] Document status management
- [ ] Role-based access control

### User Interface
- [ ] Responsive data tables with filtering
- [ ] Multi-step form wizards
- [ ] Dynamic line item management
- [ ] Status badges and progress indicators
- [ ] File upload and attachment handling
- [ ] Print/PDF generation
- [ ] Mobile-responsive design

### Business Logic
- [ ] Approval routing algorithms
- [ ] Document number generation
- [ ] Price calculation and totaling
- [ ] Currency conversion handling
- [ ] Tax calculation integration
- [ ] Budget validation rules
- [ ] Inventory impact tracking

### Integration
- [ ] Email notification system
- [ ] PDF document generation
- [ ] Accounting system integration
- [ ] Vendor portal connectivity
- [ ] Mobile app API endpoints

---

**Next Steps**: Implement remaining modules following similar patterns. Refer to [Visual Reference](../05-visual-reference/) for complete screenshot documentation.

*This specification provides complete implementation guidance for the Procurement module, the most complex business module in Carmen ERP.*