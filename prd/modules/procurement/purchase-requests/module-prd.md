# Purchase Requests Module - Technical PRD

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

The Purchase Requests (PR) module serves as the gateway for all procurement activities within the Carmen Hospitality System. It provides a comprehensive workflow for creating, approving, and managing purchase requests with intelligent vendor comparison, budget validation, and automated purchase order generation capabilities.

### Key Objectives

1. **Streamlined Requisition Process**: Simplify the creation and submission of purchase requests
2. **Intelligent Approval Workflows**: Multi-level approval based on amount, category, and requester
3. **Budget Control**: Real-time budget validation and spending tracking
4. **Vendor Optimization**: Automated vendor comparison and price intelligence
5. **Audit Compliance**: Complete audit trail with document versioning
6. **Cost Efficiency**: Price history analysis and savings opportunities identification

---

## Business Requirements

### Functional Requirements

#### PR-001: Request Creation
**Priority**: Critical  
**Complexity**: Medium

**User Story**: As a department manager, I want to create purchase requests for items needed by my department, so that I can maintain adequate inventory and operations.

**Acceptance Criteria**:
- ✅ Create PR with multiple line items
- ✅ Add items from product catalog or create ad-hoc items
- ✅ Specify quantities, preferred vendors, and delivery dates
- ✅ Attach supporting documents (specifications, quotes)
- ✅ Save as draft for later completion
- ✅ Submit for approval workflow

**Technical Implementation**:
```typescript
interface PurchaseRequest {
  id: string;
  prNumber: string;
  title: string;
  description?: string;
  department: Department;
  location: Location;
  requester: User;
  requestDate: Date;
  requiredDate: Date;
  status: PRStatus;
  priority: Priority;
  totalAmount: Money;
  budgetCode: string;
  items: PRItem[];
  attachments: Attachment[];
  approvals: ApprovalStep[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PRItem {
  id: string;
  lineNumber: number;
  product: Product | AdHocProduct;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  estimatedPrice: Money;
  preferredVendor?: Vendor;
  specifications?: string;
  notes?: string;
  urgency: ItemUrgency;
}
```

---

#### PR-002: Multi-Level Approval Workflow
**Priority**: Critical  
**Complexity**: High

**User Story**: As an approver, I want to review and approve purchase requests based on predefined rules, so that spending is controlled and authorized.

**Acceptance Criteria**:
- ✅ Configurable approval rules based on amount, category, department
- ✅ Sequential and parallel approval flows
- ✅ Automatic approval for pre-approved items below threshold
- ✅ Approval delegation and escalation
- ✅ Email notifications and in-app alerts
- ✅ Bulk approval capabilities

**Workflow Configuration**:
```yaml
approval_rules:
  - name: "Department Manager Approval"
    condition: "amount <= $1,000"
    approvers: ["department_manager"]
    auto_approve: false
    
  - name: "Finance Director Approval"
    condition: "amount > $1,000 AND amount <= $5,000"
    approvers: ["department_manager", "finance_director"]
    sequence: "sequential"
    
  - name: "Executive Approval"
    condition: "amount > $5,000"
    approvers: ["department_manager", "finance_director", "gm"]
    sequence: "sequential"
    escalation_hours: 48
```

---

#### PR-003: Budget Integration & Validation
**Priority**: High  
**Complexity**: High

**User Story**: As a finance manager, I want purchase requests validated against approved budgets, so that spending stays within allocated limits.

**Acceptance Criteria**:
- ✅ Real-time budget validation during PR creation
- ✅ Budget allocation and consumption tracking
- ✅ Multi-dimensional budget categories (department, GL account, project)
- ✅ Budget warning and blocking thresholds
- ✅ Variance reporting and alerts
- ✅ Budget reallocation capabilities

**Budget Validation Logic**:
```typescript
interface BudgetValidation {
  budgetCode: string;
  totalBudget: Money;
  consumedAmount: Money;
  pendingAmount: Money;
  availableAmount: Money;
  warningThreshold: number; // 80%
  blockingThreshold: number; // 100%
  status: 'AVAILABLE' | 'WARNING' | 'EXCEEDED';
}

class BudgetValidator {
  async validatePurchaseRequest(pr: PurchaseRequest): Promise<BudgetValidationResult> {
    const budget = await this.getBudgetAllocation(pr.budgetCode);
    const consumed = await this.getConsumedAmount(pr.budgetCode);
    const pending = await this.getPendingAmount(pr.budgetCode);
    
    return this.calculateAvailability(budget, consumed, pending, pr.totalAmount);
  }
}
```

---

#### PR-004: Vendor Comparison & Selection
**Priority**: High  
**Complexity**: Medium

**User Story**: As a purchaser, I want to compare prices from multiple vendors for requested items, so that I can select the most cost-effective option.

**Acceptance Criteria**:
- ✅ Automatic vendor suggestion based on item category
- ✅ Price history analysis and trending
- ✅ Vendor performance scoring integration
- ✅ RFQ (Request for Quotation) generation
- ✅ Side-by-side vendor comparison
- ✅ Total cost of ownership calculation

**Price Comparison Engine**:
```typescript
interface VendorQuote {
  vendor: Vendor;
  item: PRItem;
  unitPrice: Money;
  minimumQuantity: number;
  leadTime: number;
  validUntil: Date;
  terms: PaymentTerms;
  totalCost: Money; // Including shipping, taxes
  vendorScore: number;
  recommendationRank: number;
}

class VendorComparisonEngine {
  async getVendorRecommendations(item: PRItem): Promise<VendorQuote[]> {
    const vendors = await this.getQualifiedVendors(item.product);
    const quotes = await this.getPriceQuotes(vendors, item);
    const scored = await this.scoreVendors(quotes);
    
    return scored.sort((a, b) => a.recommendationRank - b.recommendationRank);
  }
}
```

---

#### PR-005: Item Management & Catalog Integration
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As a requester, I want to search and select items from the product catalog or create custom items, so that I can specify exactly what I need.

**Acceptance Criteria**:
- ✅ Smart search with autocomplete and suggestions
- ✅ Product catalog browsing with filters
- ✅ Recent/favorite items shortcuts
- ✅ Ad-hoc item creation for unique requirements
- ✅ Item specification templates
- ✅ Bulk item import from CSV/Excel

**Search Implementation**:
```typescript
interface ProductSearchResult {
  product: Product;
  relevanceScore: number;
  availableVendors: Vendor[];
  lastPurchasePrice: Money;
  averageLeadTime: number;
  inStock: boolean;
}

class ProductSearchService {
  async searchProducts(
    query: string, 
    filters: ProductFilter[]
  ): Promise<ProductSearchResult[]> {
    // Implement full-text search with scoring
    // Include price history, vendor availability
    // Return ranked results with purchase intelligence
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Search Response**: <500ms for product catalog search
- **PR Creation**: <2 seconds to save and submit
- **Approval Processing**: <1 second per approval action
- **PDF Generation**: <3 seconds for standard PR report
- **Concurrent Users**: Support 500+ simultaneous PR creators

#### Scalability Requirements
- **Database**: Handle 10M+ purchase requests per year
- **File Storage**: Support 100GB+ attachments per year
- **API Throughput**: 1,000+ requests per minute
- **Approval Queue**: Process 10,000+ pending approvals

#### Security Requirements
- **Data Encryption**: AES-256 for sensitive financial data
- **Access Control**: Role-based permissions for PR actions
- **Audit Trail**: Complete change history for compliance
- **Document Security**: Encrypted attachment storage
- **API Security**: OAuth 2.0 with rate limiting

---

## Technical Architecture

### Database Schema

```sql
-- Purchase Requests Table
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    location_id UUID REFERENCES locations(id),
    requester_id UUID REFERENCES users(id),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    required_date DATE NOT NULL,
    status purchase_request_status DEFAULT 'DRAFT',
    priority item_priority DEFAULT 'MEDIUM',
    total_amount DECIMAL(15,4) DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'USD',
    budget_code VARCHAR(50),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_required_date CHECK (required_date >= request_date::DATE),
    INDEX idx_pr_number (pr_number),
    INDEX idx_status_date (status, request_date),
    INDEX idx_department (department_id),
    INDEX idx_requester (requester_id)
);

-- PR Items Table
CREATE TABLE pr_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    product_id UUID REFERENCES products(id),
    ad_hoc_product_name VARCHAR(255),
    ad_hoc_product_description TEXT,
    quantity DECIMAL(12,4) NOT NULL CHECK (quantity > 0),
    unit_of_measure_id UUID REFERENCES units_of_measure(id),
    estimated_price DECIMAL(15,4),
    currency_code VARCHAR(3) DEFAULT 'USD',
    preferred_vendor_id UUID REFERENCES vendors(id),
    specifications TEXT,
    notes TEXT,
    urgency item_urgency DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pr_id, line_number),
    CHECK (
        (product_id IS NOT NULL) OR 
        (ad_hoc_product_name IS NOT NULL AND ad_hoc_product_description IS NOT NULL)
    )
);

-- Approval Workflow Table
CREATE TABLE pr_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id),
    approver_role VARCHAR(100),
    status approval_status DEFAULT 'PENDING',
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    delegate_from_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pr_id, step_number, approver_id),
    INDEX idx_pending_approvals (approver_id, status)
);

-- Custom Types
CREATE TYPE purchase_request_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'IN_APPROVAL', 'APPROVED', 
    'REJECTED', 'CANCELLED', 'CONVERTED_TO_PO', 'CLOSED'
);

CREATE TYPE approval_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'DELEGATED', 'EXPIRED'
);

CREATE TYPE item_priority AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY'
);

CREATE TYPE item_urgency AS ENUM (
    'ROUTINE', 'NORMAL', 'URGENT', 'CRITICAL'
);
```

---

### API Endpoints

#### Purchase Request Management
```typescript
// Create new purchase request
POST /api/procurement/purchase-requests
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "title": "Kitchen Equipment - January 2025",
  "description": "Replacement equipment for main kitchen",
  "departmentId": "dept-001",
  "locationId": "loc-001",
  "requiredDate": "2025-02-15",
  "priority": "HIGH",
  "budgetCode": "KITCHEN-2025-Q1",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitOfMeasureId": "uom-001",
      "estimatedPrice": 1250.00,
      "preferredVendorId": "vendor-001",
      "specifications": "Stainless steel, commercial grade",
      "urgency": "NORMAL"
    }
  ]
}

Response: 201 Created
{
  "id": "pr-12345678",
  "prNumber": "PR-2025-001234",
  "status": "DRAFT",
  "totalAmount": 2500.00,
  "currencyCode": "USD"
}
```

#### Approval Workflow
```typescript
// Submit for approval
POST /api/procurement/purchase-requests/{id}/submit
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "status": "SUBMITTED",
  "nextApprover": {
    "userId": "user-001",
    "role": "DEPARTMENT_MANAGER",
    "name": "John Smith"
  },
  "estimatedApprovalTime": "2 business days"
}

// Approve purchase request
POST /api/procurement/purchase-requests/{id}/approve
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "comments": "Approved with budget allocation adjustment",
  "conditions": ["Verify delivery date with vendor"]
}

// Bulk approve requests
POST /api/procurement/purchase-requests/bulk-approve
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "prIds": ["pr-001", "pr-002", "pr-003"],
  "comments": "Batch approval for routine supplies"
}
```

#### Search and Filtering
```typescript
// Advanced search
GET /api/procurement/purchase-requests/search
Authorization: Bearer {jwt_token}
Query Parameters:
  - status: 'PENDING,IN_APPROVAL'
  - department: 'dept-001'
  - dateFrom: '2025-01-01'
  - dateTo: '2025-01-31'
  - amountMin: '1000'
  - amountMax: '5000'
  - requester: 'user-001'
  - budgetCode: 'KITCHEN-2025-Q1'
  - page: '1'
  - limit: '25'
  - sortBy: 'requestDate'
  - sortOrder: 'desc'

Response: 200 OK
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 156,
    "totalPages": 7
  },
  "aggregations": {
    "totalAmount": 125750.00,
    "statusBreakdown": {
      "PENDING": 12,
      "IN_APPROVAL": 8,
      "APPROVED": 5
    }
  }
}
```

---

### User Interface Specifications

#### PR Creation Form
**Layout**: Multi-step wizard with progress indicator

**Step 1: Basic Information**
```typescript
interface BasicInfoForm {
  title: string;           // Required, max 255 chars
  description?: string;    // Optional, rich text editor
  department: Department;  // Dropdown with search
  location: Location;      // Conditional on department
  requiredDate: Date;      // Date picker, min: today + 1
  priority: Priority;      // Radio buttons
  budgetCode: string;      // Autocomplete with budget validation
}
```

**Step 2: Items Addition**
- Product search with autocomplete
- Recent items quick-add
- Bulk import from CSV/Excel
- Line item editing with inline validation
- Vendor suggestion per item
- Price history display

**Step 3: Review & Submit**
- Summary view with totals
- Budget impact visualization
- Attachment management
- Approval workflow preview
- Save as draft or submit options

#### Approval Dashboard
**Components**:
- Pending approvals queue with filters
- Quick approve/reject actions
- Bulk approval checkbox selection
- Approval history timeline
- Escalation alerts
- Delegation management

#### PR List View
**Features**:
- Advanced filtering sidebar
- Sortable columns with persistence
- Export functionality (PDF, Excel, CSV)
- Bulk actions (cancel, duplicate)
- Status-based color coding
- Quick view modal

---

### Integration Points

#### Budget System Integration
```typescript
interface BudgetIntegration {
  // Real-time budget validation
  validateBudget(budgetCode: string, amount: Money): Promise<BudgetValidationResult>;
  
  // Reserve budget allocation
  reserveBudget(budgetCode: string, amount: Money, referenceId: string): Promise<void>;
  
  // Release reserved budget
  releaseBudget(budgetCode: string, referenceId: string): Promise<void>;
  
  // Get budget status
  getBudgetStatus(budgetCode: string): Promise<BudgetStatus>;
}
```

#### Vendor Management Integration
```typescript
interface VendorIntegration {
  // Get qualified vendors for product
  getQualifiedVendors(productId: string): Promise<Vendor[]>;
  
  // Get price history
  getPriceHistory(productId: string, vendorId: string): Promise<PriceHistory[]>;
  
  // Send RFQ to vendors
  sendRFQ(prId: string, vendorIds: string[]): Promise<RFQResponse[]>;
  
  // Get vendor performance scores
  getVendorScores(vendorIds: string[]): Promise<VendorScore[]>;
}
```

#### Workflow Engine Integration
```typescript
interface WorkflowIntegration {
  // Start approval workflow
  startWorkflow(prId: string, workflowType: string): Promise<WorkflowInstance>;
  
  // Process approval step
  processApproval(workflowId: string, action: ApprovalAction): Promise<WorkflowState>;
  
  // Get workflow status
  getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **PR Summary Report**
   - Total requests by period, department, status
   - Average approval time
   - Budget utilization

2. **Vendor Performance Report**
   - Response rates to RFQs
   - Price competitiveness
   - Delivery performance

3. **Budget Analysis Report**
   - Budget consumption trends
   - Variance analysis
   - Forecast vs. actual

4. **Approval Efficiency Report**
   - Bottleneck identification
   - Approval time analysis
   - Escalation tracking

#### Custom Analytics
- Purchase pattern analysis
- Seasonal demand forecasting
- Cost center performance
- Vendor consolidation opportunities

---

### Quality Assurance

#### Test Coverage Requirements
- **Unit Tests**: >90% code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Complete PR lifecycle
- **Performance Tests**: Load testing with 1000+ concurrent users
- **Security Tests**: OWASP compliance

#### Test Scenarios
1. **Happy Path**: Complete PR creation to PO conversion
2. **Approval Workflows**: Multi-level approval testing
3. **Budget Validation**: Over-budget rejection scenarios
4. **Vendor Integration**: Price comparison and selection
5. **Error Handling**: Network failures, timeout scenarios

---

### Deployment & Monitoring

#### Performance Monitoring
- API response times per endpoint
- Database query performance
- User session analytics
- Error rate tracking
- Cache hit ratios

#### Business Metrics
- PR creation volume
- Approval cycle time
- Budget accuracy
- User adoption rates
- Cost savings achieved

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered spend analytics
- Predictive budget recommendations
- Mobile application for approvals
- Voice-to-text PR creation
- Smart vendor recommendations

#### Phase 3 Features (Q3 2025)
- Machine learning price optimization
- Automated contract compliance checking
- Advanced workflow designer
- Real-time collaboration features
- Blockchain audit trail

---

## Conclusion

The Purchase Requests module forms the foundation of the Carmen Procurement system, providing robust functionality for request creation, approval workflows, and vendor management integration. The technical architecture ensures scalability, security, and maintainability while delivering exceptional user experience.

The module's success will be measured by reduced procurement cycle times, improved budget control, and enhanced vendor relationship management, ultimately delivering significant cost savings and operational efficiency to hospitality businesses.

---

*This document serves as the definitive technical specification for the Purchase Requests module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025