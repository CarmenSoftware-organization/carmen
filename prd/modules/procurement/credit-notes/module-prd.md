# Credit Notes Module - Technical PRD

## Document Information

| **Attribute**     | **Value**                         |
|-------------------|-----------------------------------|
| **Document Type** | Module Product Requirements       |
| **Version**       | 1.0.0                            |
| **Date**          | January 2025                     |
| **Status**        | Production Ready                 |
| **Owner**         | Procurement Team                 |
| **Parent Module** | [Procurement Module](../module-prd.md) |

---

## Executive Summary

The Credit Notes module manages the complete lifecycle of vendor credits, returns, and financial adjustments arising from procurement activities. It provides automated credit note generation from discrepancies, systematic return processing, and comprehensive vendor account reconciliation to ensure accurate financial settlement and maintain strong vendor relationships.

### Key Objectives

1. **Automated Credit Processing**: Generate credit notes from receiving discrepancies and quality issues
2. **Return Management**: Handle product returns with proper documentation and tracking
3. **Financial Reconciliation**: Ensure accurate vendor account balancing and payment adjustments
4. **Vendor Relations**: Maintain transparent credit documentation and dispute resolution
5. **Audit Compliance**: Complete credit transaction history for regulatory and financial auditing
6. **Process Efficiency**: Streamline credit workflows to reduce administrative overhead

---

## Business Requirements

### Functional Requirements

#### CN-001: Automated Credit Note Generation
**Priority**: Critical  
**Complexity**: High

**User Story**: As an accounts payable clerk, I want credit notes to be automatically generated from GRN discrepancies and quality issues, so that vendor accounts are accurately adjusted without manual processing.

**Acceptance Criteria**:
- ✅ Auto-generate credit notes from GRN discrepancies
- ✅ Calculate credit amounts based on PO pricing and quantity variances
- ✅ Apply different credit types (shortage, damage, quality, pricing error)
- ✅ Include supporting documentation and evidence
- ✅ Route for approval based on credit amount thresholds
- ✅ Send credit note to vendor upon approval

**Technical Implementation**:
```typescript
interface CreditNote {
  id: string;
  creditNoteNumber: string;
  vendor: Vendor;
  purchaseOrder?: PurchaseOrder;
  goodsReceivedNote?: GoodsReceivedNote;
  creditType: CreditType;
  reason: CreditReason;
  status: CreditNoteStatus;
  issueDate: Date;
  creditAmount: Money;
  taxAmount: Money;
  totalCreditAmount: Money;
  items: CreditNoteItem[];
  attachments: Attachment[];
  approvals: CreditApproval[];
  vendorResponse?: VendorResponse;
  appliedToInvoices: InvoiceCredit[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditNoteItem {
  id: string;
  originalItem: POItem | GRNItem;
  productName: string;
  quantity: number;
  unitPrice: Money;
  extendedAmount: Money;
  creditReason: ItemCreditReason;
  discrepancyReference?: string;
  notes?: string;
}

type CreditType = 
  | 'RETURN_CREDIT' 
  | 'PRICE_ADJUSTMENT' 
  | 'QUANTITY_SHORTAGE' 
  | 'DAMAGE_ALLOWANCE' 
  | 'QUALITY_REJECTION';

type CreditReason = 
  | 'DAMAGED_GOODS' 
  | 'WRONG_ITEM' 
  | 'QUANTITY_SHORT' 
  | 'QUALITY_ISSUE' 
  | 'LATE_DELIVERY' 
  | 'PRICING_ERROR' 
  | 'RETURN_TO_VENDOR';
```

---

#### CN-002: Credit Note Approval Workflow
**Priority**: High  
**Complexity**: Medium

**User Story**: As a finance manager, I want credit notes above certain thresholds to require approval, so that significant financial adjustments are properly authorized and controlled.

**Acceptance Criteria**:
- ✅ Configurable approval thresholds by credit amount
- ✅ Multi-level approval workflows for large credits
- ✅ Automatic approval for credits below threshold
- ✅ Approval delegation and escalation capabilities
- ✅ Rejection handling with reason codes
- ✅ Audit trail of all approval actions

**Approval Workflow Engine**:
```typescript
interface CreditApprovalRule {
  id: string;
  name: string;
  condition: ApprovalCondition;
  approvers: ApprovalLevel[];
  autoApprove: boolean;
  escalationHours: number;
}

interface ApprovalCondition {
  creditAmountMin?: number;
  creditAmountMax?: number;
  creditTypes?: CreditType[];
  vendors?: string[];
  reasons?: CreditReason[];
}

interface ApprovalLevel {
  level: number;
  approvers: User[];
  requiresAll: boolean;
  delegationAllowed: boolean;
}

class CreditApprovalEngine {
  async determineApprovalPath(creditNote: CreditNote): Promise<ApprovalPath> {
    const rules = await this.getApplicableRules(creditNote);
    
    if (rules.length === 0) {
      return this.createAutoApprovalPath();
    }
    
    const highestRule = this.selectHighestPriorityRule(rules);
    return this.createApprovalPath(highestRule);
  }
  
  async processApproval(
    creditNoteId: string, 
    approverId: string, 
    action: ApprovalAction
  ): Promise<ApprovalResult> {
    const creditNote = await this.getCreditNote(creditNoteId);
    const currentStep = await this.getCurrentApprovalStep(creditNote);
    
    await this.recordApprovalAction(currentStep, approverId, action);
    
    if (action.decision === 'APPROVED') {
      return this.processApprovalStep(creditNote, currentStep);
    } else {
      return this.processRejection(creditNote, action);
    }
  }
}
```

---

#### CN-003: Return to Vendor Processing
**Priority**: High  
**Complexity**: High

**User Story**: As a warehouse manager, I want to process returns to vendors with proper documentation and tracking, so that returned goods are handled efficiently and credit is obtained.

**Acceptance Criteria**:
- ✅ Create return authorizations (RMA) with vendor coordination
- ✅ Generate return shipping labels and documentation
- ✅ Track return shipment status
- ✅ Confirm vendor receipt and processing
- ✅ Match credit notes to return confirmations
- ✅ Handle partial returns and restocking fees

**Return Management System**:
```typescript
interface ReturnToVendor {
  id: string;
  rmaNumber: string;
  creditNote: CreditNote;
  vendor: Vendor;
  returnReason: ReturnReason;
  returnDate: Date;
  expectedCreditDate: Date;
  returnItems: ReturnItem[];
  shippingInfo: ReturnShipping;
  vendorConfirmation?: VendorConfirmation;
  status: ReturnStatus;
  totalReturnValue: Money;
  restockingFee?: Money;
  netCreditExpected: Money;
}

interface ReturnItem {
  productId: string;
  quantity: number;
  condition: ItemCondition;
  originalCost: Money;
  restockingFeeRate?: number;
  serialNumbers?: string[];
  batchNumbers?: string[];
  photos?: string[];
}

interface ReturnShipping {
  carrier: string;
  trackingNumber: string;
  shippingCost: Money;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  packingSlip: string;
  shippingLabel: string;
}

type ReturnStatus = 
  | 'REQUESTED' 
  | 'AUTHORIZED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'PROCESSED' 
  | 'CREDITED' 
  | 'REJECTED';

class ReturnProcessor {
  async initiateReturn(
    creditNoteId: string, 
    returnItems: ReturnItem[]
  ): Promise<ReturnToVendor> {
    const creditNote = await this.getCreditNote(creditNoteId);
    
    // Request RMA from vendor
    const rmaRequest = await this.requestRMA(creditNote.vendor, returnItems);
    
    if (rmaRequest.approved) {
      // Generate shipping documentation
      const shipping = await this.generateShippingDocuments(rmaRequest);
      
      // Create return record
      return this.createReturn(creditNote, rmaRequest, shipping);
    } else {
      throw new Error(`RMA rejected: ${rmaRequest.rejectionReason}`);
    }
  }
}
```

---

#### CN-004: Vendor Account Reconciliation
**Priority**: High  
**Complexity**: Medium

**User Story**: As an accountant, I want to reconcile vendor accounts including all credits and adjustments, so that vendor balances are accurate and payments are properly calculated.

**Acceptance Criteria**:
- ✅ Vendor account balance tracking with credit applications
- ✅ Credit note application to outstanding invoices
- ✅ Aging analysis including credit impacts
- ✅ Automatic payment adjustment calculations
- ✅ Vendor statement reconciliation
- ✅ Dispute resolution tracking

**Reconciliation Engine**:
```typescript
interface VendorAccountBalance {
  vendorId: string;
  currency: string;
  outstandingInvoices: OutstandingInvoice[];
  availableCredits: AvailableCredit[];
  netBalance: Money;
  overdueAmount: Money;
  creditBalance: Money;
  lastReconciliationDate: Date;
}

interface OutstandingInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  originalAmount: Money;
  paidAmount: Money;
  creditApplied: Money;
  netOutstanding: Money;
  daysOutstanding: number;
  appliedCredits: AppliedCredit[];
}

interface AvailableCredit {
  creditNoteId: string;
  creditNoteNumber: string;
  totalAmount: Money;
  appliedAmount: Money;
  availableAmount: Money;
  expirationDate?: Date;
  restrictions?: CreditRestriction[];
}

class VendorReconciliation {
  async reconcileVendorAccount(vendorId: string): Promise<VendorAccountBalance> {
    const invoices = await this.getOutstandingInvoices(vendorId);
    const credits = await this.getAvailableCredits(vendorId);
    
    // Auto-apply credits to oldest invoices first
    const reconciled = await this.autoApplyCredits(invoices, credits);
    
    // Calculate net balances
    const balance = this.calculateNetBalance(reconciled);
    
    // Update vendor account
    await this.updateVendorBalance(vendorId, balance);
    
    return balance;
  }
  
  async applyCreditToInvoice(
    creditNoteId: string, 
    invoiceId: string, 
    amount: Money
  ): Promise<CreditApplication> {
    // Validate credit availability
    await this.validateCreditAvailability(creditNoteId, amount);
    
    // Apply credit to invoice
    const application = await this.createCreditApplication(
      creditNoteId, 
      invoiceId, 
      amount
    );
    
    // Update balances
    await this.updateAccountBalances(application);
    
    return application;
  }
}
```

---

#### CN-005: Credit Note Communication
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As a procurement manager, I want to communicate credit notes to vendors electronically and track their responses, so that credit processing is efficient and transparent.

**Acceptance Criteria**:
- ✅ Email credit notes with PDF attachments
- ✅ Vendor portal credit note access
- ✅ Acknowledgment and response tracking
- ✅ Dispute handling and resolution workflow
- ✅ Follow-up reminders for unacknowledged credits

**Communication System**:
```typescript
interface CreditNoteCommunication {
  creditNoteId: string;
  communicationMethod: CommunicationMethod[];
  sentDate: Date;
  recipients: CommunicationRecipient[];
  acknowledgmentReceived: boolean;
  acknowledgmentDate?: Date;
  vendorResponse?: VendorCreditResponse;
  followUpScheduled?: Date;
  disputes: CreditDispute[];
}

interface VendorCreditResponse {
  responseDate: Date;
  responseType: CreditResponseType;
  agreedAmount?: Money;
  disputedAmount?: Money;
  comments: string;
  attachments?: string[];
}

type CreditResponseType = 
  | 'ACCEPTED' 
  | 'PARTIALLY_ACCEPTED' 
  | 'DISPUTED' 
  | 'REJECTED' 
  | 'REQUIRES_CLARIFICATION';

class CreditCommunicationService {
  async sendCreditNote(
    creditNote: CreditNote, 
    methods: CommunicationMethod[]
  ): Promise<CommunicationResult> {
    const results: CommunicationResult[] = [];
    
    for (const method of methods) {
      switch (method) {
        case 'EMAIL':
          results.push(await this.sendEmail(creditNote));
          break;
        case 'VENDOR_PORTAL':
          results.push(await this.notifyPortal(creditNote));
          break;
      }
    }
    
    // Schedule follow-up if no acknowledgment
    await this.scheduleFollowUp(creditNote.id, 5); // 5 days
    
    return this.consolidateResults(results);
  }
}
```

---

#### CN-006: Credit Note Reporting & Analytics
**Priority**: Medium  
**Complexity**: Low

**User Story**: As a finance director, I want comprehensive reporting on credit notes and their financial impact, so that I can analyze trends and optimize vendor relationships.

**Acceptance Criteria**:
- ✅ Credit note summary reports by vendor, reason, and period
- ✅ Financial impact analysis with trend identification
- ✅ Vendor performance correlation with credit frequency
- ✅ Return processing efficiency metrics
- ✅ Aging analysis of unresolved credits
- ✅ Cost center impact reporting

**Analytics Engine**:
```typescript
interface CreditAnalytics {
  period: DateRange;
  totalCreditsIssued: number;
  totalCreditValue: Money;
  creditsByType: CreditTypeBreakdown[];
  creditsByVendor: VendorCreditSummary[];
  creditsByReason: ReasonAnalysis[];
  returnProcessingMetrics: ReturnMetrics;
  financialImpact: FinancialImpactAnalysis;
}

interface VendorCreditSummary {
  vendorId: string;
  vendorName: string;
  totalCreditAmount: Money;
  creditCount: number;
  averageCreditValue: Money;
  mostCommonReason: CreditReason;
  resolutionTimeAvg: number; // days
  impactOnRelationship: RelationshipImpact;
}

class CreditAnalyticsService {
  async generateCreditAnalytics(
    dateRange: DateRange, 
    filters?: AnalyticsFilter[]
  ): Promise<CreditAnalytics> {
    const credits = await this.getCreditNotes(dateRange, filters);
    
    return {
      totalCreditsIssued: credits.length,
      totalCreditValue: this.calculateTotalValue(credits),
      creditsByType: this.groupByType(credits),
      creditsByVendor: this.analyzeByVendor(credits),
      creditsByReason: this.analyzeByReason(credits),
      returnProcessingMetrics: await this.getReturnMetrics(dateRange),
      financialImpact: await this.calculateFinancialImpact(credits)
    };
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Credit Generation**: <2 seconds to create from discrepancy
- **Approval Processing**: <1 second per approval action
- **Communication**: <5 seconds to send credit note
- **Reconciliation**: <10 seconds for vendor account balance
- **Report Generation**: <15 seconds for standard reports

#### Scalability Requirements
- **Credit Volume**: Handle 50K+ credit notes per year
- **Vendor Communications**: Process 5K+ daily notifications
- **Reconciliation**: Support 10K+ vendor accounts
- **Document Storage**: Handle 500GB+ credit documentation

#### Security Requirements
- **Financial Data Encryption**: AES-256 for credit amounts
- **Document Security**: Encrypted PDF generation and storage
- **Access Control**: Role-based credit note permissions
- **Audit Trail**: Immutable record of all credit activities
- **Vendor Portal Security**: Multi-factor authentication

---

## Technical Architecture

### Database Schema

```sql
-- Credit Notes Table
CREATE TABLE credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_number VARCHAR(20) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    purchase_order_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES goods_received_notes(id),
    credit_type credit_type NOT NULL,
    reason credit_reason NOT NULL,
    status credit_note_status DEFAULT 'DRAFT',
    issue_date DATE DEFAULT CURRENT_DATE,
    credit_amount DECIMAL(15,4) NOT NULL CHECK (credit_amount > 0),
    tax_amount DECIMAL(15,4) DEFAULT 0,
    total_credit_amount DECIMAL(15,4) GENERATED ALWAYS AS (credit_amount + tax_amount) STORED,
    currency_code VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    internal_notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_amounts CHECK (tax_amount >= 0),
    INDEX idx_credit_number (credit_note_number),
    INDEX idx_vendor_date (vendor_id, issue_date),
    INDEX idx_status (status),
    INDEX idx_type_reason (credit_type, reason)
);

-- Credit Note Items Table
CREATE TABLE credit_note_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID REFERENCES credit_notes(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    quantity DECIMAL(12,4) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,4) NOT NULL CHECK (unit_price >= 0),
    extended_amount DECIMAL(15,4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    currency_code VARCHAR(3) DEFAULT 'USD',
    credit_reason item_credit_reason NOT NULL,
    po_item_id UUID REFERENCES po_items(id),
    grn_item_id UUID REFERENCES grn_items(id),
    discrepancy_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(credit_note_id, line_number),
    INDEX idx_product (product_id),
    INDEX idx_po_item (po_item_id)
);

-- Credit Note Approvals Table
CREATE TABLE credit_note_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID REFERENCES credit_notes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id) NOT NULL,
    required_amount_threshold DECIMAL(15,4),
    status approval_status DEFAULT 'PENDING',
    approved_date TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(credit_note_id, step_number),
    INDEX idx_pending_approvals (approver_id, status)
);

-- Return to Vendor Table
CREATE TABLE returns_to_vendor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rma_number VARCHAR(20) UNIQUE NOT NULL,
    credit_note_id UUID REFERENCES credit_notes(id) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    return_reason return_reason NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_credit_date DATE,
    total_return_value DECIMAL(15,4) NOT NULL,
    restocking_fee DECIMAL(15,4) DEFAULT 0,
    net_credit_expected DECIMAL(15,4) GENERATED ALWAYS AS (total_return_value - restocking_fee) STORED,
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    shipping_cost DECIMAL(15,4) DEFAULT 0,
    vendor_confirmed_receipt BOOLEAN DEFAULT FALSE,
    vendor_confirmation_date TIMESTAMP WITH TIME ZONE,
    status return_status DEFAULT 'REQUESTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_rma_number (rma_number),
    INDEX idx_credit_note (credit_note_id),
    INDEX idx_status (status)
);

-- Credit Applications Table (to invoices)
CREATE TABLE credit_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID REFERENCES credit_notes(id) NOT NULL,
    invoice_id UUID REFERENCES vendor_invoices(id) NOT NULL,
    applied_amount DECIMAL(15,4) NOT NULL CHECK (applied_amount > 0),
    currency_code VARCHAR(3) DEFAULT 'USD',
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by UUID REFERENCES users(id) NOT NULL,
    reversal_id UUID REFERENCES credit_applications(id), -- Self-reference for reversals
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_credit_note (credit_note_id),
    INDEX idx_invoice (invoice_id),
    INDEX idx_applied_date (applied_date)
);

-- Vendor Credit Responses Table
CREATE TABLE vendor_credit_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID REFERENCES credit_notes(id) NOT NULL,
    response_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_type credit_response_type NOT NULL,
    agreed_amount DECIMAL(15,4),
    disputed_amount DECIMAL(15,4),
    comments TEXT,
    contact_person VARCHAR(255),
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_credit_note (credit_note_id),
    INDEX idx_response_type (response_type)
);

-- Custom Types
CREATE TYPE credit_type AS ENUM (
    'RETURN_CREDIT', 'PRICE_ADJUSTMENT', 'QUANTITY_SHORTAGE', 
    'DAMAGE_ALLOWANCE', 'QUALITY_REJECTION', 'LATE_DELIVERY_PENALTY'
);

CREATE TYPE credit_reason AS ENUM (
    'DAMAGED_GOODS', 'WRONG_ITEM', 'QUANTITY_SHORT', 'QUALITY_ISSUE', 
    'LATE_DELIVERY', 'PRICING_ERROR', 'RETURN_TO_VENDOR', 'EXPIRY_ISSUE'
);

CREATE TYPE item_credit_reason AS ENUM (
    'PHYSICAL_DAMAGE', 'QUALITY_DEFECT', 'WRONG_SPECIFICATION', 
    'SHORT_QUANTITY', 'PRICING_DISCREPANCY', 'EXPIRATION_ISSUE'
);

CREATE TYPE credit_note_status AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACKNOWLEDGED', 
    'DISPUTED', 'RESOLVED', 'APPLIED', 'CANCELLED'
);

CREATE TYPE return_reason AS ENUM (
    'DEFECTIVE_PRODUCT', 'WRONG_ITEM_SHIPPED', 'QUALITY_ISSUE', 
    'DAMAGED_IN_TRANSIT', 'NOT_AS_SPECIFIED', 'EXPIRED_PRODUCT'
);

CREATE TYPE return_status AS ENUM (
    'REQUESTED', 'AUTHORIZED', 'SHIPPED', 'DELIVERED', 
    'PROCESSED', 'CREDITED', 'REJECTED'
);

CREATE TYPE credit_response_type AS ENUM (
    'ACCEPTED', 'PARTIALLY_ACCEPTED', 'DISPUTED', 
    'REJECTED', 'REQUIRES_CLARIFICATION'
);
```

---

### API Endpoints

#### Credit Note Management
```typescript
// Create credit note from discrepancy
POST /api/procurement/credit-notes
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "vendorId": "vendor-001",
  "purchaseOrderId": "po-001",
  "grnId": "grn-001",
  "creditType": "DAMAGE_ALLOWANCE",
  "reason": "DAMAGED_GOODS",
  "description": "Items damaged during transit - partial shipment return required",
  "items": [
    {
      "productId": "prod-001",
      "productName": "Premium Coffee Beans",
      "quantity": 10,
      "unitPrice": 25.00,
      "creditReason": "PHYSICAL_DAMAGE",
      "discrepancyReference": "DISC-001",
      "notes": "5 bags torn, contents contaminated"
    }
  ]
}

Response: 201 Created
{
  "id": "cn-001",
  "creditNoteNumber": "CN-2025-001234",
  "status": "PENDING_APPROVAL",
  "totalCreditAmount": 250.00,
  "approvalRequired": true,
  "nextApprover": {
    "userId": "user-001",
    "role": "FINANCE_MANAGER"
  }
}
```

#### Return Processing
```typescript
// Initiate return to vendor
POST /api/procurement/credit-notes/{id}/return
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "returnReason": "DEFECTIVE_PRODUCT",
  "expectedCreditDate": "2025-02-15",
  "returnItems": [
    {
      "productId": "prod-001",
      "quantity": 10,
      "condition": "DAMAGED",
      "serialNumbers": ["SN001", "SN002"],
      "photos": ["photo1.jpg", "photo2.jpg"]
    }
  ],
  "shippingPreferences": {
    "carrier": "UPS",
    "serviceLevel": "GROUND",
    "includeInsurance": true
  }
}

Response: 201 Created
{
  "return": {
    "id": "rtv-001",
    "rmaNumber": "RMA-2025-001234",
    "status": "REQUESTED",
    "shippingLabel": "https://storage.carmen.io/labels/rtv-001.pdf",
    "trackingNumber": "1Z999AA1234567890",
    "expectedDeliveryDate": "2025-01-20"
  }
}
```

#### Vendor Account Reconciliation
```typescript
// Get vendor account balance
GET /api/procurement/vendors/{vendorId}/account-balance
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "vendorId": "vendor-001",
  "currency": "USD",
  "netBalance": -1250.00,
  "outstandingInvoices": [
    {
      "invoiceId": "inv-001",
      "invoiceNumber": "INV-2025-001",
      "originalAmount": 5000.00,
      "creditApplied": 250.00,
      "netOutstanding": 4750.00,
      "daysOutstanding": 15
    }
  ],
  "availableCredits": [
    {
      "creditNoteId": "cn-001",
      "creditNoteNumber": "CN-2025-001234",
      "totalAmount": 250.00,
      "appliedAmount": 0.00,
      "availableAmount": 250.00
    }
  ],
  "lastReconciliation": "2025-01-14T09:00:00Z"
}

// Apply credit to invoice
POST /api/procurement/credit-notes/{creditId}/apply
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "invoiceId": "inv-001",
  "appliedAmount": 250.00,
  "notes": "Applied to oldest outstanding invoice"
}
```

---

### User Interface Specifications

#### Credit Note Creation Form
**Layout**: Wizard-style with validation steps

**Step 1: Credit Information**
- Vendor selection with account balance display
- Credit type and reason selection
- Reference document linking (PO, GRN)
- Description and internal notes

**Step 2: Line Items**
- Item selection from reference documents
- Quantity and pricing adjustments
- Individual item reasons and notes
- Photo and document attachments

**Step 3: Review & Submit**
- Summary with calculated totals
- Approval workflow preview
- Supporting documentation review
- Submit for approval or save as draft

#### Credit Note Management Dashboard
**Components**:
- Pending approvals queue
- Vendor communication status
- Return tracking panel
- Dispute resolution queue
- Financial impact summary

#### Vendor Account Reconciliation Screen
**Features**:
- Outstanding invoice aging
- Available credits listing
- Auto-application suggestions
- Balance history timeline
- Dispute tracking

---

### Integration Points

#### Accounts Payable Integration
```typescript
interface APIntegration {
  // Apply credit to invoices
  applyCreditToInvoice(
    creditNoteId: string, 
    invoiceId: string, 
    amount: Money
  ): Promise<void>;
  
  // Update vendor balances
  updateVendorBalance(
    vendorId: string, 
    adjustment: BalanceAdjustment
  ): Promise<void>;
  
  // Generate credit memos
  generateCreditMemo(creditNote: CreditNote): Promise<CreditMemo>;
}
```

#### Vendor Management Integration
```typescript
interface VendorIntegration {
  // Notify vendor of credit note
  sendCreditNotification(
    creditNote: CreditNote, 
    method: CommunicationMethod[]
  ): Promise<void>;
  
  // Update vendor performance metrics
  updateCreditMetrics(
    vendorId: string, 
    metrics: CreditMetrics
  ): Promise<void>;
  
  // Handle vendor responses
  processCreditResponse(response: VendorCreditResponse): Promise<void>;
}
```

#### Inventory Management Integration
```typescript
interface InventoryIntegration {
  // Process return inventory adjustments
  processReturnInventory(
    returnItems: ReturnItem[], 
    disposition: ReturnDisposition
  ): Promise<void>;
  
  // Update product costs for credits
  adjustProductCosts(costAdjustments: CostAdjustment[]): Promise<void>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Credit Note Summary Report**
   - Credits by vendor, type, and reason
   - Financial impact analysis
   - Approval workflow performance

2. **Vendor Credit Analysis**
   - Credit frequency by vendor
   - Common credit reasons
   - Resolution timeframes

3. **Return Processing Report**
   - Return volumes and values
   - Processing efficiency metrics
   - Vendor response analysis

4. **Financial Impact Report**
   - Credit amounts by period
   - Budget impact analysis
   - Cost center allocation

#### Advanced Analytics
- Credit trend analysis and forecasting
- Vendor relationship impact assessment
- Process efficiency optimization
- Cost avoidance calculations

---

### Quality Assurance

#### Test Coverage Requirements
- **Unit Tests**: >90% code coverage
- **Integration Tests**: All financial and vendor integrations
- **Workflow Tests**: Complete approval cycle testing
- **Security Tests**: Financial data protection validation
- **Performance Tests**: High-volume credit processing

#### Test Scenarios
1. **Automated Generation**: Credit creation from various discrepancy types
2. **Approval Workflows**: Multi-level approval testing
3. **Return Processing**: Complete return-to-credit cycle
4. **Account Reconciliation**: Complex vendor balance scenarios
5. **Dispute Handling**: Vendor response and resolution workflows

---

### Deployment & Monitoring

#### Performance Metrics
- Credit note generation time
- Approval workflow completion rates
- Vendor communication success rates
- Return processing efficiency
- Account reconciliation accuracy

#### Business Metrics
- Credit note volumes and values
- Vendor response rates
- Dispute resolution times
- Financial impact of credits
- Process cost savings

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered credit amount suggestions
- Predictive credit analysis based on vendor patterns
- Automated dispute resolution
- Blockchain-based credit verification
- Advanced mobile return processing

#### Phase 3 Features (Q3 2025)
- Machine learning credit approval recommendations
- Automated vendor credit negotiations
- Real-time financial impact dashboards
- Advanced supplier collaboration portal
- Integration with external credit rating services

---

## Conclusion

The Credit Notes module provides comprehensive credit management capabilities that ensure accurate financial reconciliation, efficient return processing, and strong vendor relationship management. The automated workflows and integrated approval processes deliver significant improvements in financial accuracy and administrative efficiency.

Success will be measured by reduced credit processing time, improved vendor satisfaction through transparent credit handling, enhanced financial accuracy through automated reconciliation, and increased operational efficiency through streamlined return processing.

---

*This document serves as the definitive technical specification for the Credit Notes module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025