# Vendor Management - Module Overview

## Document Information
- **Document Type**: Module Overview Document
- **Module**: Vendor Management (All Submodules)
- **Version**: 1.1
- **Last Updated**: 2025-11-17
- **Document Status**: Active
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-11-17 | Documentation Team | Updated for ARC-2024-001: Added Recent Architecture Changes section, updated document status to Active, added references to new documentation (ARC, CODE-TODO, CHANGE-HISTORY, updated DDs) |
| 1.0 | 2024-01-15 | System | Initial consolidated overview |

---
- **Recent Changes**: ARC-2024-001 (Architecture Redesign)

---

## Recent Architecture Changes

### ARC-2024-001: Vendor Management Redesign (2025-11-17)

**Status**: ✅ Approved - Implementation Pending
**Impact**: High - Affects Price Lists, Request for Pricing, Price List Templates

**Key Changes Summary**:
- **16 Total Changes**: 6 Simplifications, 7 Enhancements, 3 Modifications
- **Effective Date Model**: Replaced date ranges with single effective date
- **Currency Enhancement**: Added explicit currency code field (ISO 4217)
- **FOC Support**: Added Free of Charge item handling
- **Preferred Vendor**: Added preferred vendor tracking
- **Bulk Import**: Excel/CSV import for price list items
- **Simplified Workflow**: Removed approval and submission method tracking
- **Description Primary**: Description field now primary display (removed name field)

**Implementation**:
- **Timeline**: 10 weeks (4 phases)
- **Team**: 6 developers (2 backend, 2 frontend, 1 QA, 1 designer)
- **Documentation**: Complete (ARC, CODE-TODO, DD updates, CHANGE-HISTORY)

**Reference Documents**:
- **ARC Document**: `ARC-2024-001-vendor-management-redesign.md`
- **Implementation Checklist**: `CODE-CHANGE-TODO.md` (87 tasks)
- **Change History**: `CHANGE-HISTORY.md`
- **Updated DD**: `price-lists/DD-price-lists.md` (v1.1.0)
- **Updated DD**: `requests-for-pricing/DD-requests-for-pricing.md` (v1.1.0)

---

## 1. Module Structure

The Vendor Management module consists of 5 submodules:

1. **Vendor Directory** ✅ COMPLETED
   - Full documentation: BR, UC, TS, Data Structure Analysis, FD, VAL
   - Location: `docs/app/vendor-management/vendor-directory/`

2. **Pricelist Templates** 📝 IN PROGRESS
   - BR: Completed
   - Remaining: UC, TS, DS, FD, VAL

3. **Requests for Pricing (RFQ)**
   - Location: `docs/app/vendor-management/requests-for-pricing/`

4. **Price Lists**
   - Location: `docs/app/vendor-management/price-lists/`

5. **Vendor Entry Portal**
   - Location: `docs/app/vendor-management/vendor-portal/`

---

## 2. Pricelist Templates Module

### 2.1 Core Purpose
Standardized templates for collecting vendor pricing, ensuring consistency and enabling easy comparison across vendors.

### 2.2 Key Features
- **Template Builder**: Visual interface for creating pricing templates
- **Product Assignment**: Bulk and individual product assignment
- **Pricing Structures**: Multi-tier pricing (unit, case, bulk, promotional)
- **Distribution**: Automated template distribution to vendors
- **Versioning**: Complete version history with comparison
- **Analytics**: Template performance and vendor engagement metrics

### 2.3 Primary Use Cases
- UC-PT-001: Create Pricelist Template
- UC-PT-002: Add Products to Template
- UC-PT-003: Define Pricing Structure
- UC-PT-004: Distribute Template to Vendors
- UC-PT-005: Track Template Submissions
- UC-PT-006: Clone Existing Template
- UC-PT-007: Version Template
- UC-PT-008: Approve Template Changes

### 2.4 Technical Implementation
**Data Storage**: Uses `tb_vendor.info` JSON field extensions for template metadata
```typescript
interface PricelistTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  effectiveDateRange: { start: string; end: string };

  items: Array<{
    productId: string;
    sequence: number;
    isRequired: boolean;
    uom: string;
    packSize: number;
    moq: number;
    expectedDeliveryDays: number;
  }>;

  pricingStructure: {
    columns: Array<{
      name: string;
      type: 'unit' | 'case' | 'bulk' | 'promotional';
      quantityBreakpoints?: number[];
    }>;
    currency: string;
    priceTolerance: { min: number; max: number };
  };

  targeting: {
    locations?: string[];
    departments?: string[];
    vendorTypes?: string[];
  };

  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
}
```

### 2.5 Key Validations
- Template code must be unique (Zod + database check)
- Minimum 1 product required per template
- Effective dates cannot overlap for same category
- Price tolerance: 0-100% range
- Submission deadline: minimum 5 business days from distribution

---

## 3. Requests for Pricing (RFQ) Module

### 3.1 Core Purpose
Manage formal Request for Quote (RFQ) campaigns to solicit competitive bids from multiple vendors for specific procurement needs.

### 3.2 Key Features
- **RFQ Creation**: Create RFQ from templates or from scratch
- **Vendor Selection**: Target specific vendors based on capabilities
- **Multi-round Bidding**: Support for multiple bidding rounds
- **Bid Comparison**: Side-by-side bid analysis
- **Award Management**: Select winning bids and notify vendors
- **Negotiation Support**: Track negotiations and counteroffers
- **Contract Generation**: Auto-generate contracts from awarded bids

### 3.3 Primary Use Cases
- UC-RFQ-001: Create RFQ Campaign
- UC-RFQ-002: Invite Vendors to RFQ
- UC-RFQ-003: Submit Bid (Vendor)
- UC-RFQ-004: Evaluate and Compare Bids
- UC-RFQ-005: Award RFQ to Vendor
- UC-RFQ-006: Negotiate Bid Terms
- UC-RFQ-007: Close RFQ Campaign
- UC-RFQ-008: Generate Contract from RFQ

### 3.4 Technical Implementation
**Data Storage**: Dedicated table structure with JSON extensions

```typescript
interface RFQCampaign {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  category: string;
  type: 'goods' | 'services' | 'works';
  status: 'draft' | 'published' | 'open' | 'closed' | 'awarded' | 'cancelled';

  timeline: {
    publishDate: string;
    bidOpenDate: string;
    bidCloseDate: string;
    awardDate?: string;
  };

  requirements: {
    items: Array<{
      itemId: string;
      description: string;
      quantity: number;
      uom: string;
      specifications: Record<string, any>;
      deliveryLocation: string;
      deliveryDate: string;
    }>;

    terms: {
      paymentTerms: string;
      deliveryTerms: string;
      warrantyRequirements?: string;
      qualityStandards?: string;
    };
  };

  invitedVendors: Array<{
    vendorId: string;
    invitedAt: string;
    viewedAt?: string;
    bidSubmittedAt?: string;
    bidStatus: 'pending' | 'submitted' | 'withdrawn' | 'disqualified';
  }>;

  evaluation: {
    criteria: Array<{
      name: string;
      weight: number; // percentage
      type: 'price' | 'quality' | 'delivery' | 'service' | 'custom';
    }>;
    scoringMethod: 'lowest_price' | 'weighted_average' | 'technical_commercial';
  };

  bids: Array<{
    bidId: string;
    vendorId: string;
    submittedAt: string;
    totalBidValue: number;
    currency: string;
    validityPeriod: number; // days
    status: 'submitted' | 'under_review' | 'shortlisted' | 'awarded' | 'rejected';
    scores?: Record<string, number>;
  }>;
}
```

### 3.5 Key Business Rules
- BR-RFQ-001: Minimum 3 vendors must be invited for competitive RFQ
- BR-RFQ-002: Bid submission period must be at least 7 business days
- BR-RFQ-003: Vendors cannot see other bids until evaluation
- BR-RFQ-004: Evaluation criteria weights must sum to 100%
- BR-RFQ-005: Award requires approval based on value thresholds
- BR-RFQ-006: Bid modifications not allowed after deadline
- BR-RFQ-007: All invited vendors notified of award decision

### 3.6 Integration Points
- **Vendor Directory**: Vendor selection and qualification
- **Pricelist Templates**: Use templates as RFQ basis
- **Price Lists**: Awarded bids create price lists
- **Procurement**: Awarded RFQs feed into PO creation
- **Contracts**: Generate contracts from awarded bids

---

## 4. Price Lists Module

### 4.1 Core Purpose
Store and manage vendor-submitted pricing, making it accessible for procurement decisions and purchase order creation.

### 4.2 Key Features
- **Price List Management**: CRUD operations for price lists
- **Multi-vendor Pricing**: Store prices from multiple vendors
- **Price Comparison**: Compare prices across vendors
- **Price History**: Track price changes over time
- **Effective Dating**: Time-bound pricing with validity periods
- **Location-specific Pricing**: Support regional price variations
- **Bulk Price Updates**: Import/export for mass updates
- **Price Alerts**: Notify on significant price changes
- **Contract Pricing**: Link prices to contracts

### 4.3 Primary Use Cases
- UC-PL-001: Create Price List
- UC-PL-002: Import Vendor Prices
- UC-PL-003: Update Existing Prices
- UC-PL-004: Compare Prices Across Vendors
- UC-PL-005: View Price History
- UC-PL-006: Set Price Alerts
- UC-PL-007: Export Price Lists
- UC-PL-008: Approve Price Changes

### 4.4 Technical Implementation
**Data Storage**: Dedicated price list tables with product relationships

```typescript
interface PriceList {
  id: string;
  priceListNumber: string;
  vendorId: string;
  name: string;
  description: string;
  status: 'draft' | 'pending_approval' | 'active' | 'expired' | 'superseded';

  validity: {
    effectiveFrom: string;
    effectiveTo: string;
    lastReviewDate?: string;
    nextReviewDate?: string;
  };

  source: {
    sourceType: 'manual' | 'template' | 'rfq' | 'negotiation' | 'contract';
    sourceId?: string;
    sourceReference?: string;
  };

  targeting: {
    locations?: string[];
    departments?: string[];
    customerTypes?: string[];
  };

  items: Array<{
    priceListItemId: string;
    productId: string;
    sku: string;
    description: string;

    pricing: {
      basePrice: number;
      unitPrice: number;
      casePrice?: number;
      bulkPrice?: number;
      currency: string;
      uom: string;

      tiers?: Array<{
        minQuantity: number;
        maxQuantity?: number;
        price: number;
        discountPercent?: number;
      }>;
    };

    terms: {
      moq?: number;
      packSize?: number;
      leadTimeDays: number;
      shippingCost?: number;
    };

    metadata: {
      lastUpdated: string;
      priceChange?: {
        previousPrice: number;
        changePercent: number;
        changeReason?: string;
      };
    };
  }>;

  approval: {
    requiredApprovals: string[];
    approvalHistory: Array<{
      stage: string;
      approver: string;
      decision: 'approved' | 'rejected';
      decidedAt: string;
      notes?: string;
    }>;
  };
}
```

### 4.5 Key Business Rules
- BR-PL-001: Price list must have at least 1 item
- BR-PL-002: Effective dates cannot be in the past (for new price lists)
- BR-PL-003: Price changes >10% require approval
- BR-PL-004: Only one active price list per vendor-location-product combination
- BR-PL-005: Expired price lists automatically superseded by new ones
- BR-PL-006: Price history retained for 5 years
- BR-PL-007: Contract prices take precedence over standard price lists

### 4.6 Integration Points
- **Vendor Directory**: Link prices to vendors
- **Product Management**: Product catalog integration
- **Pricelist Templates**: Template submissions create price lists
- **RFQ Module**: Awarded bids create price lists
- **Purchase Requests**: Price lists populate PR suggestions
- **Purchase Orders**: Price lists provide default pricing
- **Contracts**: Contract pricing stored as price lists

---

## 5. Vendor Entry Portal Module

### 5.1 Core Purpose
Self-service portal for vendors to manage their information, submit prices, respond to RFQs, and track purchase orders.

### 5.2 Key Features
- **Vendor Registration**: Self-service vendor onboarding
- **Profile Management**: Vendors update their own information
- **Document Upload**: Vendors upload certifications and documents
- **Price Submission**: Respond to price list templates
- **RFQ Response**: Submit bids for RFQ campaigns
- **PO Tracking**: View and acknowledge purchase orders
- **Invoice Submission**: Submit invoices for payment
- **Performance Dashboard**: View performance metrics
- **Communication**: Message center for vendor-buyer communication
- **Notifications**: Email and portal notifications

### 5.3 Primary Use Cases
- UC-VP-001: Vendor Registration
- UC-VP-002: Vendor Login and Authentication
- UC-VP-003: Update Vendor Profile
- UC-VP-004: Upload Documents
- UC-VP-005: View Price List Templates
- UC-VP-006: Submit Pricing
- UC-VP-007: Respond to RFQ
- UC-VP-008: View Purchase Orders
- UC-VP-009: Submit Invoice
- UC-VP-010: View Performance Metrics
- UC-VP-011: Communicate with Buyer

### 5.4 Technical Implementation
**Architecture**: Separate Next.js application with shared database

```typescript
// Vendor Portal User Context
interface VendorPortalUser {
  userId: string;
  vendorId: string;
  email: string;
  role: 'vendor_admin' | 'vendor_user' | 'vendor_viewer';

  permissions: {
    canEditProfile: boolean;
    canSubmitPrices: boolean;
    canRespondToRFQ: boolean;
    canViewPOs: boolean;
    canSubmitInvoices: boolean;
    canViewReports: boolean;
  };

  vendorInfo: {
    companyName: string;
    vendorCode: string;
    status: string;
    rating?: number;
    primaryContact: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

// Portal Dashboard Data
interface VendorPortalDashboard {
  summary: {
    activePriceLists: number;
    openRFQs: number;
    activePOs: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };

  recentActivity: Array<{
    type: 'price_list' | 'rfq' | 'po' | 'invoice' | 'message';
    title: string;
    date: string;
    status: string;
    action?: string;
  }>;

  performance: {
    overallRating: number;
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
  };

  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'urgent';
    message: string;
    date: string;
    isRead: boolean;
  }>;
}
```

### 5.5 Key Security Features
- **Authentication**: OAuth 2.0 / JWT tokens
- **Authorization**: Role-based access control
- **Data Isolation**: Vendors only see their own data
- **Audit Logging**: All actions logged
- **Session Management**: Secure session handling
- **Rate Limiting**: Prevent abuse
- **HTTPS Only**: All traffic encrypted

### 5.6 Key Business Rules
- BR-VP-001: Vendor registration requires approval before access
- BR-VP-002: Price submissions require approved vendor status
- BR-VP-003: RFQ responses only during bid window
- BR-VP-004: Document uploads limited to 50MB per file
- BR-VP-005: Invoice submission requires valid PO reference
- BR-VP-006: Vendors can only view their assigned templates/RFQs
- BR-VP-007: Session timeout after 30 minutes of inactivity

### 5.7 Integration Points
- **Vendor Directory**: Profile sync, status updates
- **Pricelist Templates**: Template display and submission
- **RFQ Module**: RFQ display and bid submission
- **Price Lists**: Price submissions create price lists
- **Purchase Orders**: PO display and acknowledgment
- **Finance**: Invoice submission and tracking
- **Notifications**: Email and push notifications

---

## 6. Shared Data Structures

### 6.1 Common JSON Extensions

All vendor management modules extend the existing schema using JSON fields:

```typescript
// tb_vendor.info extensions
interface VendorInfoExtensions {
  // ... existing vendor info

  pricelistTemplates?: {
    assignedTemplates: string[];
    submittedPriceLists: string[];
    templatePreferences?: Record<string, any>;
  };

  rfqParticipation?: {
    invitedRFQs: string[];
    submittedBids: string[];
    awardedRFQs: string[];
    winRate: number;
  };

  pricing?: {
    activePriceLists: string[];
    priceHistory: Array<{
      productId: string;
      priceChanges: Array<{
        date: string;
        oldPrice: number;
        newPrice: number;
        reason: string;
      }>;
    }>;
  };

  portalAccess?: {
    portalUsers: Array<{
      userId: string;
      email: string;
      role: string;
      status: string;
    }>;
    lastLoginAt?: string;
    loginCount: number;
  };
}
```

### 6.2 Common Validation Patterns

**Email Validation**:
```typescript
email: z.string()
  .email('Invalid email format')
  .max(320, 'Email too long')
```

**Date Range Validation**:
```typescript
effectiveDateRange: z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
}).refine((range) => range.end > range.start, {
  message: 'End date must be after start date',
})
```

**Price Validation**:
```typescript
price: z.number()
  .min(0, 'Price cannot be negative')
  .max(999999999, 'Price too large')
  .refine((val) => {
    const decimals = (val.toString().split('.')[1] || '').length;
    return decimals <= 2;
  }, 'Maximum 2 decimal places')
```

---

## 7. Workflow Integration Matrix

| Workflow | Modules Involved | Data Flow |
|----------|------------------|-----------|
| Vendor Onboarding | Vendor Directory → Portal | Vendor created → Portal access granted |
| Template-based Pricing | Templates → Portal → Price Lists | Template distributed → Vendor submits → Price list created |
| RFQ Process | RFQ → Portal → Price Lists → Procurement | RFQ created → Vendors bid → Award → Price list/PO |
| Price Update | Portal → Price Lists | Vendor submits new prices → Approval → Price list updated |
| Purchase Order | Vendor Directory → Price Lists → PO | Vendor selected → Prices applied → PO created |
| Performance Tracking | All modules → Vendor Directory | Transaction data → Performance calculation → Vendor rating |

---

## 8. API Endpoints Summary

### 8.1 Pricelist Templates
```
GET    /api/templates              - List templates
POST   /api/templates              - Create template
GET    /api/templates/:id          - Get template details
PUT    /api/templates/:id          - Update template
DELETE /api/templates/:id          - Archive template
POST   /api/templates/:id/clone    - Clone template
POST   /api/templates/:id/distribute - Distribute to vendors
GET    /api/templates/:id/analytics - Get template analytics
```

### 8.2 RFQ
```
GET    /api/rfq                    - List RFQ campaigns
POST   /api/rfq                    - Create RFQ
GET    /api/rfq/:id                - Get RFQ details
PUT    /api/rfq/:id                - Update RFQ
POST   /api/rfq/:id/publish        - Publish RFQ
POST   /api/rfq/:id/bids           - Submit bid (vendor)
GET    /api/rfq/:id/bids           - List bids
POST   /api/rfq/:id/award          - Award RFQ
```

### 8.3 Price Lists
```
GET    /api/price-lists            - List price lists
POST   /api/price-lists            - Create price list
GET    /api/price-lists/:id        - Get price list details
PUT    /api/price-lists/:id        - Update price list
DELETE /api/price-lists/:id        - Delete price list
GET    /api/price-lists/compare    - Compare prices
POST   /api/price-lists/:id/approve - Approve price list
GET    /api/price-lists/:id/history - Get price history
```

### 8.4 Vendor Portal
```
POST   /api/portal/register        - Vendor registration
POST   /api/portal/login           - Vendor login
GET    /api/portal/dashboard       - Dashboard data
GET    /api/portal/templates       - Assigned templates
POST   /api/portal/submit-prices   - Submit pricing
GET    /api/portal/rfqs            - Assigned RFQs
POST   /api/portal/submit-bid      - Submit RFQ bid
GET    /api/portal/pos             - Purchase orders
GET    /api/portal/performance     - Performance metrics
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Zod schema validations
- Business rule enforcement
- Data transformations
- Utility functions

### 9.2 Integration Tests
- Module-to-module workflows
- API endpoint testing
- Database operations
- External service integrations

### 9.3 End-to-End Tests
- Complete vendor onboarding
- Template distribution and submission
- RFQ creation and award
- Price list approval and usage

### 9.4 Performance Tests
- Load testing (100+ concurrent users)
- Large data set handling (10,000+ templates)
- Bulk operations (1,000+ product assignments)
- Report generation performance

---

## 10. Deployment Checklist

### 10.1 Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Database migrations reviewed
- [ ] API documentation updated
- [ ] User documentation complete
- [ ] Security audit completed
- [ ] Performance benchmarks met

### 10.2 Deployment
- [ ] Database backup created
- [ ] Feature flags configured
- [ ] Environment variables set
- [ ] SSL certificates valid
- [ ] CDN configured
- [ ] Monitoring enabled
- [ ] Alerts configured

### 10.3 Post-Deployment
- [ ] Smoke tests passing
- [ ] User acceptance testing
- [ ] Training materials distributed
- [ ] Support team briefed
- [ ] Rollback plan documented
- [ ] Performance monitoring active

---

## 11. Future Enhancements

### Phase 2 (6-12 months)
- AI-powered price recommendations
- Automated price negotiation
- Predictive analytics for pricing trends
- Mobile app for vendor portal
- Advanced reporting with Power BI integration

### Phase 3 (12-18 months)
- Blockchain for contract management
- Integration with external marketplaces
- Real-time price benchmarking
- Supplier collaboration tools
- Advanced forecasting integration

---

## Related Documents

### Module-Level Documentation
- **VENDOR-MANAGEMENT-OVERVIEW.md** - This document (Module overview)
- **CHANGE-HISTORY.md** - Complete change tracking and history (v1.0.0)
- **DOCUMENTATION-STATUS.md** - Documentation completion status
- **data-structure-gaps.md** - Data structure analysis

### Architecture Change Requests
- **ARC-2024-001-vendor-management-redesign.md** - Comprehensive redesign (16 changes)
- **CODE-CHANGE-TODO.md** - Implementation checklist (87 tasks across 4 phases)

### Vendor Directory (Complete)
- BR-vendor-directory.md
- UC-vendor-directory.md
- TS-vendor-directory.md
- data-structure-gaps.md
- FD-vendor-directory.md
- VAL-vendor-directory.md

### Price Lists (Updated for ARC-2024-001)
- **DD-price-lists.md** (v1.1.0) - Data Dictionary with ARC-2024-001 changes
- BR-price-lists.md (pending update)
- UC-price-lists.md (pending update)
- TS-price-lists.md (pending update)
- VAL-price-lists.md (pending update)

### Request for Pricing (Updated for ARC-2024-001)
- **DD-requests-for-pricing.md** (v1.1.0) - Data Dictionary with ARC-2024-001 changes
- BR-requests-for-pricing.md (pending update)
- UC-requests-for-pricing.md (pending update)
- TS-requests-for-pricing.md (pending update)
- VAL-requests-for-pricing.md (pending update)

### Pricelist Templates
- BR-pricelist-templates.md
- DD-pricelist-templates.md (pending ARC-2024-001 update)
- UC-pricelist-templates.md (to be created)
- TS-pricelist-templates.md (to be created)
- FD-pricelist-templates.md (to be created)
- VAL-pricelist-templates.md (to be created)

### Vendor Portal
- Documentation to be created following similar patterns established in Vendor Directory

---

**End of Vendor Management Module Overview**
