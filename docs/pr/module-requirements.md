# Purchase Request Module - Requirements Specification

## 1. Module Overview

### 1.1 Purpose
The Purchase Request (PR) module manages the end-to-end process of creating, approving, and tracking purchase requests within the Carmen F&B Management System.

### 1.2 Module Reference Architecture
- **Source Files**:
  - docs/purchaserequest/PRRequirements.md
  - docs/purchase-request/prd.md
  - docs/purchase-request/business-logic.md
  - docs/purchase-request-ba.md

### 1.3 Integration Points
- Budget Module (BM)
- Inventory Management (IM)
- User Management (UM)
- Document Management (DM)
- Notification System (NS)

## 2. Functional Requirements

### 2.1 PR Creation [PR_CRT]
| ID | Requirement | Source | Priority |
|----|-------------|---------|----------|
| PR_CRT_001 | Unique PR reference number generation | business-logic.md | High |
| PR_CRT_002 | Multi-step PR creation form | PRRequirements.md | High |
| PR_CRT_003 | Template-based PR creation | prd.md:PR_F01 | Medium |
| PR_CRT_004 | Copy from existing PR | prd.md:PR_F01 | Low |
| PR_CRT_005 | Bulk item upload | prd.md:PR_F01 | Medium |

### 2.2 Item Management [PR_ITM]
| ID | Requirement | Source | Priority |
|----|-------------|---------|----------|
| PR_ITM_001 | Add/edit/remove items | prd.md:PR_F02 | High |
| PR_ITM_002 | Item lookup and search | prd.md:PR_F02 | High |
| PR_ITM_003 | Unit conversion support | prd.md:PR_F02 | Medium |
| PR_ITM_004 | Price estimation | prd.md:PR_F02 | Medium |
| PR_ITM_005 | Budget category mapping | prd.md:PR_F02 | High |

### 2.3 Workflow Management [PR_WFL]
| ID | Requirement | Source | Priority |
|----|-------------|---------|----------|
| PR_WFL_001 | Multi-level approval workflow | purchase-request-ba.md | High |
| PR_WFL_002 | Dynamic routing based on thresholds | PRRequirements.md | High |
| PR_WFL_003 | Department-based routing | PRRequirements.md | High |
| PR_WFL_004 | Status change tracking | business-logic.md | High |
| PR_WFL_005 | Delegation of authority | purchase-request-ba.md | Medium |

### 2.4 Budget Control [PR_BDG]
| ID | Requirement | Source | Priority |
|----|-------------|---------|----------|
| PR_BDG_001 | Budget availability check | business-logic.md | High |
| PR_BDG_002 | Soft commitment creation | purchase-request-ba.md | High |
| PR_BDG_003 | Budget category validation | purchase-request-ba.md | High |
| PR_BDG_004 | Multi-currency support | business-logic.md | Medium |
| PR_BDG_005 | Budget utilization tracking | PRRequirements.md | Medium |

## 3. Data Model

### 3.1 PR Header
```typescript
interface PurchaseRequest {
    prNumber: string;
    date: string;
    requestor: string;
    department: string;
    totalAmount: number;
    status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
    items: PRItem[];
    attachments: Attachment[];
    approvalFlow: ApprovalStep[];
}
```

### 3.2 PR Item
```typescript
interface PRItem {
    id: number;
    productId: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    budgetCategory: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}
```

## 4. Business Rules

### 4.1 Creation Rules
- Requestor must be an active employee
- Must have PR creation permission
- Cannot exceed monthly PR limit
- Minimum 1 item per PR
- Maximum 100 items per PR

### 4.2 Budget Rules
- Must have sufficient budget allocation
- Must be within fiscal year
- Must respect department budget limits
- Must consider existing commitments

### 4.3 Approval Rules
- Based on amount thresholds
- Department head approval mandatory
- Financial review for high-value PRs
- Supporting documents required for PRs above $10,000

## 5. UI Requirements

### 5.1 List View
- Sortable columns
- Filterable data
- Search functionality
- Bulk actions
- Pagination/infinite scroll

### 5.2 Detail View
- Tabbed interface
- Items list
- General info
- Financial details
- Attachments & comments
- Approval workflow
- Activity log

### 5.3 Create/Edit Form
- Multi-step wizard
- Real-time validation
- Draft saving
- Preview mode
- Item quick add

## 6. Technical Requirements

### 6.1 Performance
- Response time < 2 seconds
- Support 1000 concurrent users
- Handle 100,000 PRs annually

### 6.2 Security
- Role-based access control
- Data encryption
- Audit logging
- Session management

### 6.3 Integration
- REST API endpoints
- Webhook support
- Event-driven updates
- Batch processing capability

## 7. Implementation Phases

### 7.1 Phase 1 - Core
- Basic PR creation
- Simple approval workflow
- Essential budget checks
- Basic reporting

### 7.2 Phase 2 - Enhanced
- Template management
- Advanced workflow
- Budget integration
- Document management

### 7.3 Phase 3 - Advanced
- AI-powered recommendations
- Advanced analytics
- Mobile app support
- Blockchain integration

## 8. Success Metrics
1. PR processing time reduction
2. Budget compliance rate
3. User satisfaction score
4. System adoption rate
5. Error reduction percentage

## 10. Item Detail Page Specification

### 10.1 Component Structure
```typescript
interface PRItemDetail {
    id: string;
    productInfo: {
        code: string;
        name: string;
        description: string;
        category: string;
        subCategory: string;
        unit: string;
    };
    requestDetails: {
        quantity: number;
        unitPrice: number;
        currency: string;
        totalAmount: number;
        requestedDeliveryDate: string;
        remarks: string;
    };
    budgetInfo: {
        costCenter: string;
        budgetCategory: string;
        availableBudget: number;
        committedAmount: number;
    };
    inventoryStatus: {
        currentStock: number;
        onOrder: number;
        reserved: number;
        lastPurchaseDate: string;
        lastPurchasePrice: number;
    };
    vendorInfo: {
        preferredVendors: Array<{
            code: string;
            name: string;
            lastPrice: number;
            leadTime: number;
        }>;
        priceHistory: Array<{
            date: string;
            vendor: string;
            price: number;
            quantity: number;
        }>;
    };
}
```

### 10.2 UI Layout

#### 10.2.1 Header Section
```
┌─────────────────────────────────────────────────────────┐
│ Item Details                              [Edit] [Close] │
│ Product Code: PRD-001                Status: [Draft   ▼] │
│ Description: Premium Coffee Beans     
└─────────────────────────────────────────────────────────┘
```

#### 10.2.2 Main Content - Tabs Interface
```typescript
interface TabStructure {
    general: {
        productDetails: boolean;
        requestDetails: boolean;
        budgetAllocation: boolean;
    };
    inventory: {
        currentStock: boolean;
        reservations: boolean;
        movements: boolean;
    };
    pricing: {
        vendorComparison: boolean;
        priceHistory: boolean;
        quotations: boolean;
    };
    documents: {
        attachments: boolean;
        relatedPOs: boolean;
        specifications: boolean;
    };
}
```

### 10.3 Detailed Tab Specifications

#### 10.3.1 General Tab
```
┌─────────────────────────────────────────────────────────┐
│ Product Information                                     │
├─────────────────────────────────────────────────────────┤
│ Name: Premium Coffee Beans                              │
│ Category: Beverages > Coffee                            │
│ Description: Arabica beans, medium roast               │
│ Unit: KG                                               │
│                                                        │
│ Request Details                                        │
├─────────────────────────────────────────────────────────┤
│ Quantity: [____50____] KG                              │
│ Unit Price: [___15.50__] USD                           │
│ Total Amount: USD 775.00                               │
│ Requested Delivery: [_2024-03-15_]                     │
│                                                        │
│ Budget Information                                     │
├─────────────────────────────────────────────────────────┤
│ Cost Center: [__F&B-001__▼]                            │
│ Budget Category: [__Raw Materials__▼]                  │
│ Available Budget: USD 5,000                            │
│ Committed Amount: USD 775.00                           │
└─────────────────────────────────────────────────────────┘
```

#### 10.3.2 Inventory Tab
```
┌─────────────────────────────────────────────────────────┐
│ Current Stock Status                                    │
├─────────────────────────────────────────────────────────┤
│ On Hand: 100 KG                                        │
│ Reserved: 25 KG                                        │
│ Available: 75 KG                                       │
│ On Order: 150 KG                                       │
│                                                        │
│ Stock Movement History                                 │
├─────────────────────────────────────────────────────────┤
│ Date       │ Type    │ Quantity │ Reference            │
│ 2024-01-15 │ Receipt │ +100 KG  │ GRN-2024-001        │
│ 2024-01-10 │ Issue   │ -50 KG   │ ISS-2024-005        │
└─────────────────────────────────────────────────────────┘
```

#### 10.3.3 Pricing Tab
```
┌─────────────────────────────────────────────────────────┐
│ Vendor Comparison                                       │
├─────────────────────────────────────────────────────────┤
│ Vendor    │ Last Price │ Lead Time │ Rating            │
│ Vendor A  │ USD 15.50  │ 7 days    │ ★★★★☆             │
│ Vendor B  │ USD 16.00  │ 5 days    │ ★★★★★             │
│                                                        │
│ Price History                                         │
├─────────────────────────────────────────────────────────┤
│ Date       │ Vendor    │ Quantity │ Unit Price         │
│ 2024-01-01 │ Vendor A  │ 100 KG   │ USD 15.50         │
│ 2023-12-15 │ Vendor B  │ 75 KG    │ USD 16.00         │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Actions and Controls

#### 10.4.1 Edit Mode Controls
```typescript
interface EditControls {
    quantity: {
        type: 'number';
        min: 0;
        step: 0.01;
        validation: (value: number) => boolean;
    };
    unitPrice: {
        type: 'number';
        min: 0;
        step: 0.01;
        validation: (value: number) => boolean;
    };
    deliveryDate: {
        type: 'date';
        min: 'today';
        validation: (date: Date) => boolean;
    };
    costCenter: {
        type: 'select';
        options: CostCenter[];
        validation: (value: string) => boolean;
    };
}
```

#### 10.4.2 Action Buttons
```typescript
interface ActionButtons {
    primary: {
        save: boolean;
        submit: boolean;
    };
    secondary: {
        delete: boolean;
        copy: boolean;
        print: boolean;
    };
    contextual: {
        checkStock: boolean;
        viewVendors: boolean;
        attachments: boolean;
    };
}
```

### 10.5 Business Rules

#### 10.5.1 Validation Rules
```typescript
interface ValidationRules {
    quantity: {
        min: number;
        max: number;
        multiplier?: number;
    };
    price: {
        variance: number; // % from last price
        threshold: number; // requires approval if exceeded
    };
    budget: {
        checkAvailability: boolean;
        allowOverride: boolean;
        approvalThreshold: number;
    };
    delivery: {
        minDays: number;
        maxDays: number;
    };
}
```

#### 10.5.2 Auto-Calculations
- Total Amount = Quantity × Unit Price
- Budget Impact = Total Amount + Existing Commitments
- Available Stock = Current Stock - Reserved
- Price Variance = ((New Price - Last Price) / Last Price) × 100

### 10.6 Integration Points

#### 10.6.1 API Endpoints
```typescript
interface APIEndpoints {
    item: {
        get: '/api/pr/items/:id';
        update: '/api/pr/items/:id';
        delete: '/api/pr/items/:id';
    };
    inventory: {
        status: '/api/inventory/status/:productId';
        movements: '/api/inventory/movements/:productId';
    };
    pricing: {
        vendors: '/api/vendors/prices/:productId';
        history: '/api/prices/history/:productId';
    };
    budget: {
        check: '/api/budget/check';
        commit: '/api/budget/commit';
    };
}
```

#### 10.6.2 Event Handlers
```typescript
interface EventHandlers {
    onQuantityChange: (value: number) => void;
    onPriceChange: (value: number) => void;
    onVendorSelect: (vendorId: string) => void;
    onBudgetCheck: (amount: number) => void;
    onSave: (data: PRItemDetail) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}
```

### 10.7 Performance Considerations

#### 10.7.1 Data Loading
- Lazy load tabs content
- Cache inventory status for 5 minutes
- Prefetch common lookup data
- Background refresh price information

#### 10.7.2 Optimizations
- Debounce input handlers (300ms)
- Memoize complex calculations
- Progressive loading for history data
- Optimistic UI updates

# Purchase Request Detail Page Specification

## 1. Component Structure

```typescript
interface PRDetailPageProps {
    id: string;
    mode: 'view' | 'edit' | 'add';
}

interface PurchaseRequest {
    prNumber: string;
    date: string;
    requestor: Requestor;
    department: string;
    totalAmount: number;
    status: DocumentStatus;
    workflowStatus: WorkflowStatus;
    workflowStage: WorkflowStage;
    items: PRItem[];
    attachments: Attachment[];
    approvalFlow: ApprovalStep[];
}
```

## 2. Page Layout

### 2.1 Header Section
```
┌─────────────────────────────────────────────────────────┐
│ ← Back   Purchase Request: PR-2024-001                  │
│          Status: [Pending Approval]   [Edit] [Actions ▼] │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Main Content Structure
```
┌─────────────────────────────────────────────────────────┐
│ General Information                                     │
├─────────────────────────────────────────────────────────┤
│ PR Number: PR-2024-001        Date: 2024-02-20         │
│ Requestor: John Doe           Dept: IT                  │
│ Type: [Standard PR ▼]         Priority: [Normal ▼]      │
│                                                         │
│ Description:                                           │
│ [Multiple line text input for detailed description]     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Items] [Budgets] [Workflow] [Attachments] [Activity]   │
├─────────────────────────────────────────────────────────┤
│ Content based on selected tab                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Transaction Summary                                     │
├─────────────────────────────────────────────────────────┤
│ Subtotal: $10,000                                      │
│ Tax: $700                                              │
│ Total: $10,700                                         │
└─────────────────────────────────────────────────────────┘
```

## 3. Tab Specifications

### 3.1 Items Tab
- Data grid with the following columns:
  - Item Code
  - Description
  - Quantity
  - Unit
  - Unit Price
  - Total Amount
  - Budget Category
  - Status
- Actions:
  - Add Item
  - Edit Item
  - Delete Item
  - Import from Excel

### 3.2 Budget Tab
- Budget allocation overview
- Department budget status
- Cost center breakdown
- Budget category utilization
- Commitment tracking

### 3.3 Workflow Tab
- Current approval stage
- Approval history
- Next approvers
- Timeline visualization
- Action buttons:
  - Approve
  - Reject
  - Send Back
  - Delegate

### 3.4 Attachments Tab
- Document upload area
- List of attached files
- Document preview
- Version history

### 3.5 Activity Tab
- Chronological activity log
- User actions
- System events
- Comments thread

## 4. Action Controls

### 4.1 Primary Actions
```typescript
interface PRActions {
    edit: {
        visible: boolean;
        enabled: boolean;
        handler: () => void;
    };
    save: {
        visible: boolean;
        enabled: boolean;
        handler: () => Promise<void>;
    };
    submit: {
        visible: boolean;
        enabled: boolean;
        handler: () => Promise<void>;
    };
    cancel: {
        visible: boolean;
        enabled: boolean;
        handler: () => void;
    };
}
```

### 4.2 Workflow Actions
```typescript
interface WorkflowActions {
    approve: {
        visible: boolean;
        enabled: boolean;
        handler: () => Promise<void>;
    };
    reject: {
        visible: boolean;
        enabled: boolean;
        handler: () => Promise<void>;
    };
    sendBack: {
        visible: boolean;
        enabled: boolean;
        handler: () => Promise<void>;
    };
}
```

## 5. State Management

### 5.1 Component State
```typescript
interface PRDetailState {
    mode: 'view' | 'edit' | 'add';
    formData: PurchaseRequest;
    originalData: PurchaseRequest;
    isDirty: boolean;
    isSubmitting: boolean;
    activeTab: 'items' | 'budgets' | 'workflow' | 'attachments' | 'activity';
    validation: {
        errors: Record<string, string>;
        warnings: Record<string, string>;
    };
}
```

### 5.2 Form Handlers
```typescript
interface FormHandlers {
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleModeChange: (mode: 'view' | 'edit') => void;
    handleTabChange: (tab: string) => void;
    handleWorkflowAction: (action: WorkflowAction) => Promise<void>;
    handleFieldChange: (field: string, value: any) => void;
}
```

## 6. Business Rules

### 6.1 Edit Permissions
- User must have PR edit rights
- PR must be in editable status
- Changes must be within user's authority limits

### 6.2 Workflow Rules
- Approval based on amount thresholds
- Department head approval mandatory
- Financial review for high-value PRs
- Supporting documents required above threshold

### 6.3 Validation Rules
- Required fields must be filled
- Total amount within budget limits
- Valid cost center and budget categories
- Minimum one item required
- Valid delivery dates

## 7. Integration Points

### 7.1 API Endpoints
```typescript
interface PRDetailAPI {
    get: '/api/pr/:id';
    update: '/api/pr/:id';
    submit: '/api/pr/:id/submit';
    approve: '/api/pr/:id/approve';
    reject: '/api/pr/:id/reject';
    sendBack: '/api/pr/:id/send-back';
    attachments: {
        upload: '/api/pr/:id/attachments';
        delete: '/api/pr/:id/attachments/:attachmentId';
    };
}
```

### 7.2 External Services
- Budget checking service
- Document management system
- Workflow engine
- Notification service

## 8. Performance Optimizations

### 8.1 Data Loading
- Progressive loading for large datasets
- Cached lookup data
- Optimistic UI updates
- Background data refresh

### 8.2 Rendering
- Virtualized lists for large datasets
- Memoized components
- Lazy-loaded tabs
- Debounced input handlers

## 9. Error Handling

### 9.1 User Errors
- Field validation feedback
- Business rule violations
- Insufficient permissions
- Budget exceeded warnings

### 9.2 System Errors
- Network failure recovery
- Session timeout handling
- Concurrent edit detection
- Data consistency checks
```

This specification provides a comprehensive layout for the PR detail page, including:
1. Component and data structure
2. UI layout with tabs
3. Action controls and handlers
4. Business rules and validation
5. Integration points
6. Performance considerations
7. Error handling

Would you like me to:
1. Add more specific validation rules?
2. Detail the component implementations?
3. Expand the API specifications?
4. Add more UI components?
