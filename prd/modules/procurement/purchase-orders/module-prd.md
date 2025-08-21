# Purchase Orders Module - Technical PRD

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

The Purchase Orders (PO) module manages the complete purchase order lifecycle from creation through closure, serving as the critical link between purchase requests and goods receipt. It provides automated PO generation from approved PRs, vendor communication, delivery tracking, and three-way matching capabilities essential for procurement control and financial accuracy.

### Key Objectives

1. **Automated PO Generation**: Convert approved PRs to POs with minimal manual intervention
2. **Vendor Communication**: Seamless PO transmission and acknowledgment tracking
3. **Delivery Management**: Monitor order status and delivery schedules
4. **Financial Control**: Ensure three-way matching (PO-GRN-Invoice) compliance
5. **Exception Handling**: Manage changes, cancellations, and partial deliveries
6. **Audit Compliance**: Maintain complete transaction history for regulatory requirements

---

## Business Requirements

### Functional Requirements

#### PO-001: Automated PO Generation from PRs
**Priority**: Critical  
**Complexity**: High

**User Story**: As a procurement officer, I want approved purchase requests to automatically generate purchase orders, so that I can quickly proceed with vendor orders without manual data entry.

**Acceptance Criteria**:
- ✅ Convert approved PRs to POs with one-click action
- ✅ Consolidate multiple PRs to single PO by vendor
- ✅ Auto-populate vendor details, terms, and conditions
- ✅ Apply contract pricing when available
- ✅ Generate sequential PO numbers
- ✅ Validate budget availability before PO creation

**Technical Implementation**:
```typescript
interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: Vendor;
  location: Location;
  buyer: User;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: POStatus;
  priority: Priority;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  subtotal: Money;
  taxAmount: Money;
  shippingAmount: Money;
  totalAmount: Money;
  items: POItem[];
  sourceRequests: PurchaseRequest[];
  approvals: POApproval[];
  deliveries: Delivery[];
  invoices: Invoice[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

class POGenerationService {
  async generateFromPRs(prIds: string[]): Promise<PurchaseOrder[]> {
    // Group PRs by vendor and location
    // Consolidate line items
    // Apply contract pricing
    // Validate budget availability
    // Generate PO numbers
    // Create PO records
    return generatedPOs;
  }
}
```

---

#### PO-002: Vendor Communication & Electronic Ordering
**Priority**: High  
**Complexity**: High

**User Story**: As a buyer, I want to electronically send purchase orders to vendors and track their acknowledgments, so that I can ensure orders are received and confirmed.

**Acceptance Criteria**:
- ✅ Email PO transmission with PDF attachment
- ✅ Vendor portal access for PO viewing
- ✅ Acknowledgment tracking and reminders
- ✅ Change request notifications
- ✅ Delivery confirmation updates

**Vendor Communication Channels**:
```typescript
interface VendorCommunication {
  email: {
    enabled: boolean;
    addresses: string[];
    template: string;
    attachPDF: boolean;
  };
  
  api: {
    enabled: boolean;
    endpoint: string;
    authentication: 'API_KEY' | 'OAUTH2';
    format: 'JSON' | 'XML';
  };
  portal: {
    enabled: boolean;
    notificationPreferences: NotificationSettings;
  };
}

class VendorNotificationService {
  async sendPurchaseOrder(po: PurchaseOrder): Promise<DeliveryConfirmation> {
    const vendor = po.vendor;
    const communications = vendor.communicationPreferences;
    
    const results = await Promise.allSettled([
      this.sendEmail(po, communications.email),
      this.sendAPI(po, communications.api),
      this.notifyPortal(po, communications.portal)
    ]);
    
    return this.processDeliveryResults(results);
  }
}
```

---

#### PO-003: Contract Management Integration
**Priority**: High  
**Complexity**: Medium

**User Story**: As a contract manager, I want purchase orders to automatically apply contract terms and pricing, so that negotiated rates are consistently used.

**Acceptance Criteria**:
- ✅ Automatic contract price lookup and application
- ✅ Contract compliance validation
- ✅ Volume discount calculations
- ✅ Contract expiration warnings
- ✅ Rebate and incentive tracking
- ✅ Preferred vendor enforcement

**Contract Integration Engine**:
```typescript
interface ContractPricing {
  contractId: string;
  vendorId: string;
  productId: string;
  tieredPricing: PricingTier[];
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  validFrom: Date;
  validTo: Date;
  currency: string;
  terms: ContractTerms;
}

interface PricingTier {
  minimumQuantity: number;
  unitPrice: Money;
  discountPercentage?: number;
  rebatePercentage?: number;
}

class ContractPricingEngine {
  async applyContractPricing(poItem: POItem): Promise<PricedPOItem> {
    const contracts = await this.getActiveContracts(
      poItem.vendorId, 
      poItem.productId
    );
    
    if (contracts.length === 0) {
      return this.applyCatalogPricing(poItem);
    }
    
    const bestContract = this.selectBestContract(contracts, poItem.quantity);
    return this.calculateContractPrice(poItem, bestContract);
  }
}
```

---

#### PO-004: Change Management & Amendments
**Priority**: High  
**Complexity**: High

**User Story**: As a buyer, I want to modify purchase orders and track all changes, so that vendors are informed of updates and audit trails are maintained.

**Acceptance Criteria**:
- ✅ Quantity, price, and delivery date modifications
- ✅ Line item additions and deletions
- ✅ Vendor change requests processing
- ✅ Amendment approval workflows for significant changes
- ✅ Automatic vendor notification of changes
- ✅ Version control with change history

**Change Management System**:
```typescript
interface POAmendment {
  id: string;
  poId: string;
  amendmentNumber: string;
  changeType: ChangeType;
  requestedBy: User;
  requestedDate: Date;
  reason: string;
  changes: ChangeRecord[];
  approval: ApprovalRecord;
  vendorNotified: boolean;
  vendorAcknowledged: boolean;
  status: AmendmentStatus;
}

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  impact: ChangeImpact;
}

type ChangeType = 
  | 'QUANTITY_CHANGE' 
  | 'PRICE_CHANGE' 
  | 'DATE_CHANGE' 
  | 'VENDOR_CHANGE' 
  | 'CANCELLATION';

class POChangeManager {
  async requestChange(
    poId: string, 
    changes: ChangeRequest[]
  ): Promise<POAmendment> {
    const currentPO = await this.getPO(poId);
    const impact = await this.assessChangeImpact(currentPO, changes);
    
    if (this.requiresApproval(impact)) {
      return this.submitForApproval(poId, changes, impact);
    }
    
    return this.applyChangesDirectly(poId, changes);
  }
}
```

---

#### PO-005: Delivery Tracking & Management
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As a receiving clerk, I want to track expected deliveries and update delivery status, so that inventory planning is accurate and exceptions are handled promptly.

**Acceptance Criteria**:
- ✅ Expected delivery scheduling and tracking
- ✅ Partial delivery support with remaining quantity tracking
- ✅ Delivery confirmation with actual dates
- ✅ Exception handling for late or early deliveries
- ✅ Integration with logistics providers for real-time tracking
- ✅ Delivery calendar with visual scheduling

**Delivery Tracking System**:
```typescript
interface Delivery {
  id: string;
  poId: string;
  deliveryNumber: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: DeliveryStatus;
  items: DeliveryItem[];
  carrier?: string;
  trackingNumber?: string;
  receivedBy?: User;
  notes?: string;
}

interface DeliveryItem {
  poItemId: string;
  expectedQuantity: number;
  deliveredQuantity?: number;
  remainingQuantity: number;
  condition: ItemCondition;
  exceptions?: DeliveryException[];
}

type DeliveryStatus = 
  | 'SCHEDULED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'PARTIALLY_DELIVERED' 
  | 'DELAYED' 
  | 'CANCELLED';

class DeliveryTracker {
  async trackDelivery(trackingNumber: string): Promise<TrackingUpdate> {
    // Integration with shipping carriers (FedEx, UPS, USPS)
    // Real-time status updates
    // ETA calculations
    return trackingUpdate;
  }
}
```

---

#### PO-006: Three-Way Matching
**Priority**: Critical  
**Complexity**: High

**User Story**: As an accounts payable clerk, I want automatic three-way matching between PO, GRN, and invoice, so that payments are accurate and compliant.

**Acceptance Criteria**:
- ✅ Automatic matching of PO-GRN-Invoice data
- ✅ Variance tolerance configuration
- ✅ Exception reporting for mismatches
- ✅ Approval workflows for variance resolution
- ✅ Hold/release mechanisms for disputed invoices
- ✅ Audit trail for all matching decisions

**Three-Way Matching Engine**:
```typescript
interface MatchingResult {
  poId: string;
  grnId: string;
  invoiceId: string;
  matchStatus: MatchStatus;
  variances: MatchingVariance[];
  totalVarianceAmount: Money;
  withinTolerance: boolean;
  requiresApproval: boolean;
}

interface MatchingVariance {
  type: VarianceType;
  description: string;
  poValue: any;
  grnValue: any;
  invoiceValue: any;
  variance: number;
  tolerance: number;
  withinTolerance: boolean;
}

type VarianceType = 
  | 'QUANTITY_VARIANCE' 
  | 'PRICE_VARIANCE' 
  | 'TOTAL_VARIANCE' 
  | 'DATE_VARIANCE';

class ThreeWayMatcher {
  async performMatching(
    poId: string, 
    grnId: string, 
    invoiceId: string
  ): Promise<MatchingResult> {
    const po = await this.getPO(poId);
    const grn = await this.getGRN(grnId);
    const invoice = await this.getInvoice(invoiceId);
    
    return this.executeMatching(po, grn, invoice);
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **PO Generation**: <3 seconds to convert PR to PO
- **Vendor Communication**: <5 seconds to send PO
- **Change Processing**: <2 seconds to save amendments
- **Matching Engine**: <1 second for three-way matching
- **Report Generation**: <10 seconds for standard reports

#### Scalability Requirements
- **PO Volume**: Handle 100K+ POs per year
- **Concurrent Users**: Support 200+ simultaneous users
- **Vendor Communications**: Process 10K+ daily notifications
- **Document Storage**: Handle 1TB+ PO attachments

#### Security Requirements
- **Document Encryption**: AES-256 for PO documents
- **Digital Signatures**: PKI-based PO signing
- **Access Control**: Role-based PO permissions
- **Audit Logging**: Complete PO lifecycle tracking
- **Vendor Portal Security**: Multi-factor authentication

---

## Technical Architecture

### Database Schema

```sql
-- Purchase Orders Table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(20) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_delivery_date DATE,
    status purchase_order_status DEFAULT 'DRAFT',
    priority item_priority DEFAULT 'MEDIUM',
    payment_terms_id UUID REFERENCES payment_terms(id),
    delivery_terms TEXT,
    subtotal DECIMAL(15,4) DEFAULT 0,
    tax_amount DECIMAL(15,4) DEFAULT 0,
    shipping_amount DECIMAL(15,4) DEFAULT 0,
    total_amount DECIMAL(15,4) DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'USD',
    terms_and_conditions TEXT,
    special_instructions TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_amounts CHECK (
        subtotal >= 0 AND 
        tax_amount >= 0 AND 
        shipping_amount >= 0 AND
        total_amount = subtotal + tax_amount + shipping_amount
    ),
    INDEX idx_po_number (po_number),
    INDEX idx_vendor_date (vendor_id, order_date),
    INDEX idx_status (status),
    INDEX idx_expected_delivery (expected_delivery_date)
);

-- PO Items Table
CREATE TABLE po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    quantity DECIMAL(12,4) NOT NULL CHECK (quantity > 0),
    unit_of_measure_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(15,4) NOT NULL CHECK (unit_price >= 0),
    extended_price DECIMAL(15,4) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    currency_code VARCHAR(3) DEFAULT 'USD',
    contract_id UUID REFERENCES contracts(id),
    tax_rate DECIMAL(5,4) DEFAULT 0,
    requested_delivery_date DATE,
    specifications TEXT,
    notes TEXT,
    pr_item_id UUID REFERENCES pr_items(id),
    received_quantity DECIMAL(12,4) DEFAULT 0,
    invoiced_quantity DECIMAL(12,4) DEFAULT 0,
    status po_item_status DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(po_id, line_number),
    CHECK (received_quantity <= quantity),
    CHECK (invoiced_quantity <= received_quantity),
    INDEX idx_product (product_id),
    INDEX idx_status (status)
);

-- PO Amendments Table
CREATE TABLE po_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    amendment_number VARCHAR(10) NOT NULL,
    change_type change_type NOT NULL,
    requested_by UUID REFERENCES users(id),
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT NOT NULL,
    change_summary TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMP WITH TIME ZONE,
    vendor_notified_date TIMESTAMP WITH TIME ZONE,
    vendor_acknowledged_date TIMESTAMP WITH TIME ZONE,
    status amendment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(po_id, amendment_number),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date)
);

-- Custom Types
CREATE TYPE purchase_order_status AS ENUM (
    'DRAFT', 'SENT', 'ACKNOWLEDGED', 'IN_PROGRESS', 
    'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'
);

CREATE TYPE po_item_status AS ENUM (
    'OPEN', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'
);

CREATE TYPE change_type AS ENUM (
    'QUANTITY_CHANGE', 'PRICE_CHANGE', 'DATE_CHANGE', 
    'VENDOR_CHANGE', 'ITEM_ADDITION', 'ITEM_DELETION', 'CANCELLATION'
);

CREATE TYPE amendment_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED'
);
```

---

### API Endpoints

#### PO Management
```typescript
// Generate PO from PRs
POST /api/procurement/purchase-orders/generate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "prIds": ["pr-001", "pr-002"],
  "consolidateByVendor": true,
  "expectedDeliveryDate": "2025-02-15",
  "paymentTermsId": "terms-001",
  "specialInstructions": "Delivery to back dock only"
}

Response: 201 Created
{
  "purchaseOrders": [
    {
      "id": "po-001",
      "poNumber": "PO-2025-001234",
      "vendor": {
        "id": "vendor-001",
        "name": "ABC Supply Co"
      },
      "totalAmount": 5750.00,
      "itemCount": 8
    }
  ]
}

// Send PO to vendor
POST /api/procurement/purchase-orders/{id}/send
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "method": ["EMAIL"],
  "priority": "NORMAL",
  "requestAcknowledgment": true,
  "customMessage": "Please confirm receipt and expected delivery date"
}

Response: 200 OK
{
  "deliveryConfirmation": {
    "email": {
      "sent": true,
      "timestamp": "2025-01-15T10:30:00Z",
      "recipients": ["orders@abcsupply.com"]
    }
  }
}
```

#### Amendment Management
```typescript
// Request PO amendment
POST /api/procurement/purchase-orders/{id}/amendments
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "changeType": "QUANTITY_CHANGE",
  "reason": "Demand increase based on updated forecast",
  "changes": [
    {
      "itemId": "item-001",
      "field": "quantity",
      "currentValue": 100,
      "newValue": 150
    }
  ],
  "requestApproval": true
}

Response: 201 Created
{
  "amendment": {
    "id": "amend-001",
    "amendmentNumber": "AMD-001",
    "status": "PENDING",
    "approvalRequired": true,
    "estimatedImpact": {
      "totalAmountChange": 1250.00,
      "deliveryDateImpact": "No change expected"
    }
  }
}
```

#### Three-Way Matching
```typescript
// Execute three-way matching
POST /api/procurement/purchase-orders/{id}/match
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "grnId": "grn-001",
  "invoiceId": "inv-001",
  "tolerances": {
    "quantityVariance": 2.0,
    "priceVariance": 5.0,
    "totalVariance": 1.0
  }
}

Response: 200 OK
{
  "matchingResult": {
    "status": "MATCHED_WITH_VARIANCES",
    "withinTolerance": false,
    "variances": [
      {
        "type": "PRICE_VARIANCE",
        "description": "Unit price differs between PO and invoice",
        "poValue": 12.50,
        "invoiceValue": 13.00,
        "variance": 4.0,
        "tolerance": 5.0,
        "withinTolerance": true
      }
    ],
    "requiresApproval": true,
    "nextAction": "SUBMIT_FOR_APPROVAL"
  }
}
```

---

### User Interface Specifications

#### PO Generation Wizard
**Step 1: Source Selection**
- Select approved PRs for PO generation
- Preview consolidation options by vendor
- Set global delivery preferences

**Step 2: Vendor Details**
- Review vendor information and contact details
- Select payment and delivery terms
- Add special instructions or conditions

**Step 3: Item Review**
- Edit quantities, prices, and delivery dates
- Apply contract pricing where available
- Add/remove line items as needed

**Step 4: Final Review & Send**
- Summary view with totals and terms
- Choose communication methods
- Send immediately or save as draft

#### PO Management Dashboard
**Features**:
- Status-based filtering (Open, Sent, Acknowledged)
- Vendor performance indicators
- Delivery calendar integration
- Quick action buttons (Send, Amend, Cancel)
- Three-way matching status indicators

#### Amendment Tracking Interface
**Components**:
- Change history timeline
- Side-by-side comparison view
- Approval workflow status
- Vendor communication log
- Impact analysis summary

---

### Integration Points

#### ERP System Integration
```typescript
interface ERPIntegration {
  // Sync PO to ERP system
  syncPurchaseOrder(po: PurchaseOrder): Promise<ERPResponse>;
  
  // Update PO status from ERP
  updatePOStatus(poNumber: string, status: string): Promise<void>;
  
  // Get budget codes from ERP
  getBudgetCodes(): Promise<BudgetCode[]>;
  
  // Validate GL accounts
  validateGLAccount(account: string): Promise<boolean>;
}
```

#### Vendor Portal Integration
```typescript
interface VendorPortalAPI {
  // Notify vendor of new PO
  notifyNewPO(poId: string, vendorId: string): Promise<void>;
  
  // Get vendor acknowledgment
  getAcknowledgment(poId: string): Promise<VendorAcknowledgment>;
  
  // Receive delivery updates
  receiveDeliveryUpdate(update: DeliveryUpdate): Promise<void>;
  
  // Handle change requests from vendor
  processVendorChangeRequest(request: VendorChangeRequest): Promise<void>;
}
```

 

---

### Reporting & Analytics

#### Standard Reports
1. **PO Status Report**
   - Open POs by vendor and age
   - Delivery performance metrics
   - Amendment frequency analysis

2. **Vendor Performance Report**
   - On-time delivery rates
   - Order acknowledgment response times
   - Quality and compliance scores

3. **Budget vs. Actual Report**
   - PO spending against budgets
   - Variance analysis by category
   - Forecast accuracy metrics

4. **Three-Way Matching Report**
   - Matching success rates
   - Common variance types
   - Processing time analytics

#### Advanced Analytics
- Spend analysis by vendor and category
- Contract utilization and savings
- Seasonal ordering patterns
- Price trend analysis

---

### Quality Assurance

#### Test Coverage Requirements
- **Unit Tests**: >90% code coverage
- **Integration Tests**: All vendor communication channels
- **E2E Tests**: Complete PO lifecycle testing
- **Performance Tests**: Load testing with 10K concurrent POs
- **Security Tests**: Vendor portal security

#### Test Scenarios
1. **PO Generation**: Multiple PR consolidation scenarios
2. **Vendor Communication**: All communication channel testing
3. **Amendment Processing**: Complex change scenarios
4. **Matching Engine**: Various tolerance and variance scenarios
5. **Error Recovery**: Network failures and system downtime

---

### Deployment & Monitoring

#### Performance Metrics
- PO generation time
- Vendor communication success rates
- Amendment processing time
- Three-way matching accuracy
- System availability

#### Business Metrics
- PO volume and value trends
- Vendor response times
- Order accuracy rates
- Cost savings from automation
- User productivity gains

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered vendor selection optimization
- Predictive delivery date modeling
- Smart contract term suggestions
- Mobile PO approval application
- Blockchain-based audit trails

#### Phase 3 Features (Q3 2025)
- Machine learning price validation
- Automated contract compliance monitoring
- Advanced supplier risk assessment
- Real-time supply chain visibility
- Voice-activated PO amendments

---

## Conclusion

The Purchase Orders module serves as the operational backbone of the procurement process, transforming approved requests into actionable vendor orders while maintaining strict financial controls and audit compliance. The comprehensive feature set ensures efficient order management from creation through three-way matching, delivering measurable improvements in procurement efficiency and cost control.

Success will be measured by reduced order processing time, improved vendor relationships, and enhanced financial accuracy through automated three-way matching, ultimately contributing to significant operational savings for hospitality businesses.

---

*This document serves as the definitive technical specification for the Purchase Orders module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025