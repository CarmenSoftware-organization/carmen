# Data Definition: Requests for Pricing (RFP)

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Requests for Pricing (RFP)
- **Version**: 1.0.0
- **Status**: Active
- **Last Updated**: 2025-11-15

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document created from schema.prisma |

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT.
It does NOT contain executable SQL code, database scripts, or implementation code.
For database implementation details, refer to the Technical Specification document.

**⚠️ SCHEMA COVERAGE**: 40% - Partial coverage from `data-struc/schema.prisma`

**Existing Tables**: `tb_request_for_pricing`, `tb_request_for_pricing_detail`
**Missing Tables**: Vendor response tracking, comparison analysis, award management (likely stored in JSONB fields)

---

## Overview

The Requests for Pricing (RFP) module manages the procurement process of soliciting price quotes from multiple vendors. RFPs are created from pricelist templates, sent to selected vendors, and vendor responses are collected and compared to support purchasing decisions.

### Key Features
- RFP creation from templates
- Multi-vendor solicitation
- Vendor response tracking
- Price comparison analysis
- Award management
- Deadline tracking
- Automated notifications
- Response history

---

## Entity Relationship Overview

```
tb_pricelist_template (1) ──── (N) tb_request_for_pricing
tb_request_for_pricing (1) ──── (N) tb_request_for_pricing_detail
tb_vendor (1) ──── (N) tb_request_for_pricing_detail
tb_pricelist (1) ──── (0..1) tb_request_for_pricing_detail
```

---

## Core Entities (Existing in Schema)

### 1. RFP Header (tb_request_for_pricing)

**Source**: `schema.prisma` lines 2196-2220

**Purpose**: Stores RFP header information including template reference, timeline, and overall RFP metadata.

**Table Name**: `tb_request_for_pricing`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `pricelist_template_id` | UUID | FOREIGN KEY → tb_pricelist_template.id, NOT NULL | Source template |
| `start_date` | TIMESTAMPTZ | | RFP open date |
| `end_date` | TIMESTAMPTZ | | RFP submission deadline |
| `info` | JSON | | Additional metadata (status, vendor responses, comparison data) |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created the record |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_pricelist_template**: Many-to-One (RFP created from template)
- **tb_request_for_pricing_detail**: One-to-Many (RFP sent to multiple vendors)

#### Business Rules
1. **Timeline**: `end_date` must be after `start_date`
2. **Template Reference**: Cannot be deleted if template is deleted (preserve history)
3. **Immutability**: Once vendors respond, RFP details become read-only
4. **Status Tracking**: Status stored in `info.status` field

#### JSON Field Structures

**info field** - RFP metadata and status:
```json
{
  "status": "open|closed|awarded|cancelled",
  "rfp_number": "RFP-2025-000001",
  "title": "Q1 2025 Food & Beverage Pricing",
  "description": "Quarterly pricing request for F&B items",
  "evaluation_criteria": {
    "price_weight": 60,
    "quality_weight": 25,
    "delivery_weight": 15
  },
  "response_summary": {
    "total_vendors": 5,
    "responses_received": 3,
    "pending": 2,
    "response_rate": 60
  },
  "comparison_results": {
    "lowest_bidder": "vendor_id",
    "average_price": 1250.00,
    "price_range": {
      "min": 1100.00,
      "max": 1400.00
    }
  },
  "award": {
    "awarded_vendor_id": "uuid",
    "awarded_vendor_name": "ABC Suppliers",
    "award_date": "2025-01-15",
    "award_reason": "Best combination of price and quality",
    "total_award_value": 15000.00
  },
  "notifications": {
    "sent_date": "2025-01-01",
    "reminder_dates": ["2025-01-10", "2025-01-13"],
    "escalation_date": "2025-01-20"
  }
}
```

**dimension field** - Multi-dimensional attributes:
```json
{
  "department_id": "uuid",
  "location_id": "uuid",
  "cost_center_id": "uuid",
  "project_id": "uuid",
  "procurement_category": "food-beverage"
}
```

---

### 2. RFP Vendor Invitations (tb_request_for_pricing_detail)

**Source**: `schema.prisma` lines 2222-2253

**Purpose**: Stores vendor-specific RFP information including invited vendors, contact details, and their submitted pricelists.

**Table Name**: `tb_request_for_pricing_detail`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `request_for_pricing_id` | UUID | FOREIGN KEY → tb_request_for_pricing.id, NOT NULL | Parent RFP |
| `sequence_no` | INTEGER | DEFAULT 1 | Vendor invitation order |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id, NOT NULL | Invited vendor |
| `vendor_name` | VARCHAR | DENORMALIZED | Vendor name for quick reference |
| `contact_person` | VARCHAR | | Vendor contact person name |
| `contact_phone` | VARCHAR | | Contact phone number |
| `contact_email` | VARCHAR | | Contact email address |
| `pricelist_id` | UUID | FOREIGN KEY → tb_pricelist.id | Submitted pricelist (if responded) |
| `pricelist_name` | VARCHAR | DENORMALIZED | Pricelist name for quick reference |
| `info` | JSON | | Vendor response tracking and evaluation data |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_request_for_pricing**: Many-to-One (details belong to one RFP)
- **tb_vendor**: Many-to-One (multiple RFPs can invite same vendor)
- **tb_pricelist**: Many-to-One (vendor's response stored as pricelist)

#### Business Rules
1. **Vendor Uniqueness**: Same vendor cannot be invited twice in same RFP
2. **Response Link**: `pricelist_id` populated when vendor submits response
3. **Contact Information**: Copied from vendor master at time of RFP creation
4. **Response Status**: Tracked via `info.response_status`

#### Indexes
```
INDEX request_for_pricing_detail_request_for_pricing_id_vendor_id_u
  ON tb_request_for_pricing_detail(request_for_pricing_id, vendor_id)
```

#### JSON Field Structures

**info field** - Vendor response and evaluation:
```json
{
  "response_status": "pending|submitted|declined|expired",
  "invitation_sent": "2025-01-01T10:00:00Z",
  "response_submitted": "2025-01-10T15:30:00Z",
  "portal_access_token": "secure-token-abc123",
  "portal_last_viewed": "2025-01-08T14:20:00Z",
  "vendor_notes": "Requesting 2-day extension due to inventory count",
  "evaluation_scores": {
    "price_score": 85,
    "quality_score": 90,
    "delivery_score": 75,
    "total_score": 83,
    "rank": 2
  },
  "price_comparison": {
    "total_quoted": 14500.00,
    "vs_average": -5.2,
    "vs_lowest": 8.3,
    "competitive_items": 45,
    "non_competitive_items": 5
  },
  "compliance_check": {
    "all_items_quoted": true,
    "valid_certifications": true,
    "delivery_acceptable": true,
    "payment_terms_acceptable": true
  },
  "decision": {
    "recommended": false,
    "reason": "Higher price than competitor, similar quality"
  }
}
```

---

## ⚠️ Analysis: Missing Functionality in Existing Schema

### Current Implementation Pattern

The existing schema uses a **JSONB-based approach** for vendor responses, comparison, and awards:

1. **Vendor Responses**: Linked via `pricelist_id` field + tracked in `info.response_status`
2. **Price Comparison**: Stored in `info.price_comparison` at detail level
3. **Evaluation Scores**: Stored in `info.evaluation_scores` at detail level
4. **Award Information**: Stored in `info.award` at RFP header level

### Advantages of Current Approach
✅ Flexible schema - can adapt to different evaluation criteria
✅ No additional tables needed
✅ Fast queries - all data in single table
✅ Historical responses preserved in JSONB

### Limitations of Current Approach
⚠️ **Querying Complexity**: Cannot easily query/filter by response status without JSONB operations
⚠️ **Index Performance**: Cannot create indexes on JSONB sub-fields efficiently
⚠️ **Type Safety**: No database-level validation of JSONB structure
⚠️ **Relational Integrity**: No foreign key constraints for data within JSONB

### Recommendation

**For Current Implementation**: ✅ **Keep JSONB approach** - Works well for current scale

**For Future Enhancement**: Consider separate tables if:
- Need to query vendor responses across multiple RFPs efficiently
- Require complex reporting on evaluation scores
- Need strict data validation on response fields
- Scale increases significantly (>1000 RFPs/month)

---

## ⚠️ Proposed Enhancement Tables (Future)

### If Separate Tables Are Needed

#### RFP Vendor Response Table
```
Table Name: tb_rfp_vendor_response

Purpose: Dedicated table for tracking vendor responses

Fields:
- id (UUID, PRIMARY KEY)
- request_for_pricing_detail_id (UUID, FK)
- response_status (ENUM: pending|submitted|declined|expired)
- submitted_at (TIMESTAMPTZ)
- portal_access_token (VARCHAR)
- portal_last_viewed (TIMESTAMPTZ)
- vendor_notes (TEXT)
- created_at, updated_at, deleted_at
- created_by_id, updated_by_id, deleted_by_id

Benefits:
- Easy filtering by response status
- Indexable response dates
- Clear audit trail

Current Workaround:
- Use info.response_status in tb_request_for_pricing_detail
```

#### RFP Evaluation Scores Table
```
Table Name: tb_rfp_evaluation

Purpose: Store vendor evaluation scores separately

Fields:
- id (UUID, PRIMARY KEY)
- request_for_pricing_detail_id (UUID, FK)
- price_score (DECIMAL)
- quality_score (DECIMAL)
- delivery_score (DECIMAL)
- total_score (DECIMAL)
- rank (INTEGER)
- evaluator_id (UUID)
- evaluated_at (TIMESTAMPTZ)

Benefits:
- Easy ranking queries
- Clear evaluation history
- Multiple evaluators support

Current Workaround:
- Use info.evaluation_scores in tb_request_for_pricing_detail
```

#### RFP Award Table
```
Table Name: tb_rfp_award

Purpose: Track RFP awards separately

Fields:
- id (UUID, PRIMARY KEY)
- request_for_pricing_id (UUID, FK)
- awarded_vendor_id (UUID, FK → tb_vendor)
- awarded_detail_id (UUID, FK → tb_request_for_pricing_detail)
- award_date (TIMESTAMPTZ)
- award_reason (TEXT)
- total_award_value (DECIMAL)
- purchase_order_id (UUID, FK → tb_purchase_order)

Benefits:
- Track awards across RFPs
- Link to purchase orders
- Award analytics

Current Workaround:
- Use info.award in tb_request_for_pricing
```

---

## Data Validation Rules

### RFP Header Validation

1. **VAL-RFP-001**: Timeline consistency
   - Rule: `end_date > start_date`
   - Error: "End date must be after start date"

2. **VAL-RFP-002**: Minimum duration
   - Rule: `(end_date - start_date) >= 3 days`
   - Error: "RFP must be open for at least 3 days"

3. **VAL-RFP-003**: Status workflow
   - Rule: Valid transitions: open → closed → awarded/cancelled
   - Error: "Invalid status transition"

4. **VAL-RFP-004**: Award validation
   - Rule: Cannot award if `info.response_summary.responses_received = 0`
   - Error: "Cannot award RFP with no responses"

### RFP Detail Validation

5. **VAL-RFP-101**: Vendor uniqueness
   - Rule: Same vendor cannot appear twice in same RFP
   - Error: "Vendor already invited to this RFP"

6. **VAL-RFP-102**: Contact information
   - Rule: Valid email format for `contact_email`
   - Error: "Invalid email address"

7. **VAL-RFP-103**: Response linkage
   - Rule: If `pricelist_id` is set, `info.response_status` must be 'submitted'
   - Error: "Response status inconsistent with pricelist"

8. **VAL-RFP-104**: Evaluation completeness
   - Rule: If `info.evaluation_scores` exists, all required score fields must be present
   - Error: "Incomplete evaluation scores"

---

## Integration Points

### 1. Pricelist Template Integration
- **Direction**: Inbound
- **Purpose**: RFPs created from templates
- **Key Fields**: `pricelist_template_id`
- **Process**: Template structure copied to RFP at creation

### 2. Vendor Management Integration
- **Direction**: Inbound
- **Purpose**: Select vendors to invite
- **Key Fields**: `vendor_id`, `vendor_name`, contact fields
- **Process**: Vendor contact info copied at RFP creation time

### 3. Price List Integration
- **Direction**: Inbound/Outbound
- **Purpose**: Vendors submit responses as pricelists
- **Key Fields**: `pricelist_id`, `pricelist_name`
- **Process**: Vendor creates pricelist, system links to RFP detail

### 4. Purchase Order Creation
- **Direction**: Outbound
- **Purpose**: Award leads to PO generation
- **Key Fields**: `info.award.awarded_vendor_id`, pricelist data
- **Process**: Winning vendor's pricelist used to create PO

### 5. Notification System
- **Direction**: Outbound
- **Purpose**: Automated vendor notifications
- **Triggers**: RFP creation, reminders, deadline, award
- **Recipients**: Vendors (detail-level), purchasing staff (header-level)

### 6. Vendor Portal
- **Direction**: Bidirectional
- **Purpose**: Vendors access RFP and submit responses
- **Key Fields**: `info.portal_access_token`
- **Security**: Token-based secure access per vendor

---

## RFP Workflow & State Management

### RFP Lifecycle

```
┌──────┐    vendors    ┌────────┐   evaluate   ┌──────────┐
│ OPEN │    invited   │ CLOSED │───────────────►│ AWARDED  │
└──────┘──────────────►└────────┘              └──────────┘
   │                       │                         │
   │                       │    no award            │
   │    cancel            └───────────────►┌──────────────┐
   └────────────────────────────────────────►│  CANCELLED   │
                                            └──────────────┘
```

### Status Descriptions

**OPEN** (`info.status = "open"`):
- RFP active and accepting responses
- Vendors can submit/modify responses
- Reminders sent based on schedule
- Before `end_date`

**CLOSED** (`info.status = "closed"`):
- RFP past deadline
- No more responses accepted
- Ready for evaluation
- After `end_date`

**AWARDED** (`info.status = "awarded"`):
- Winning vendor selected
- Award information populated in `info.award`
- Purchase order may be generated
- Final state (successful)

**CANCELLED** (`info.status = "cancelled"`):
- RFP terminated without award
- May occur at any stage
- Reason documented
- Final state (unsuccessful)

### Vendor Response States

**PENDING** (`info.response_status = "pending"`):
- Invitation sent, no response yet
- Portal access available
- Reminders active

**SUBMITTED** (`info.response_status = "submitted"`):
- Vendor submitted pricelist
- `pricelist_id` populated
- Ready for evaluation

**DECLINED** (`info.response_status = "declined"`):
- Vendor actively declined to participate
- Reason may be documented
- No further reminders

**EXPIRED** (`info.response_status = "expired"`):
- Deadline passed with no response
- Considered non-responsive
- Excluded from evaluation

---

## Performance Considerations

### Indexing Strategy
1. **RFP Lookup**: `request_for_pricing_id` (composite index exists)
2. **Vendor Lookup**: `vendor_id` (composite index exists)
3. **Timeline Queries**: `start_date`, `end_date` - **NEEDS INDEX**
4. **Status Filtering**: JSONB index on `info.status` - **NEEDS INDEX**

### Recommended Additional Indexes
```
CREATE INDEX idx_rfp_timeline
  ON tb_request_for_pricing(start_date, end_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_rfp_status
  ON tb_request_for_pricing((info->>'status'))
  WHERE deleted_at IS NULL;

CREATE INDEX idx_rfp_detail_response_status
  ON tb_request_for_pricing_detail((info->>'response_status'))
  WHERE deleted_at IS NULL;
```

### Query Optimization

**Active RFPs**:
```sql
SELECT *
FROM tb_request_for_pricing
WHERE info->>'status' = 'open'
  AND deleted_at IS NULL
  AND end_date > CURRENT_TIMESTAMP
ORDER BY end_date;
```

**Vendor Response Rate**:
```sql
SELECT
  r.id,
  COUNT(d.id) as total_vendors,
  COUNT(d.pricelist_id) as responses_received,
  ROUND(COUNT(d.pricelist_id)::numeric / COUNT(d.id) * 100, 2) as response_rate
FROM tb_request_for_pricing r
JOIN tb_request_for_pricing_detail d ON r.id = d.request_for_pricing_id
WHERE r.deleted_at IS NULL AND d.deleted_at IS NULL
GROUP BY r.id;
```

---

## Security & Access Control

### Field-Level Security
- **Public (via portal)**: RFP title, description, timeline, product requirements
- **Vendor-specific**: Contact info, portal token, own response data
- **Internal Only**: Evaluation scores, comparison data, award decisions

### Row-Level Security
- **Vendor Portal**: Vendors can only view/edit their own RFP detail row
- **Department Access**: Filtered by `dimension.department_id`
- **Role-Based**:
  - Purchasing Staff: Create RFPs, view all responses
  - Purchasing Manager: Evaluate, compare, award
  - Finance: View awarded RFPs and values
  - Vendors: View invited RFPs via portal token only

### Portal Security
- **Token-Based Access**: Unique `portal_access_token` per vendor per RFP
- **Token Expiration**: Tokens expire after RFP end_date
- **Activity Tracking**: `portal_last_viewed` tracks vendor engagement
- **IP Restriction**: Optional IP whitelist per vendor

---

## Audit & Compliance

### Change Tracking
- **Version Control**: `doc_version` incremented on each update
- **User Tracking**: Full audit trail of creators and editors
- **Response Tracking**: Submission timestamps preserved
- **Award Tracking**: Complete history of award decisions

### Compliance Requirements
- **Fair Competition**: All vendors receive same information and deadline
- **Transparency**: Evaluation criteria documented before opening RFP
- **Audit Trail**: Complete history of communications and decisions
- **Data Retention**: Preserve all RFP data for audit periods (typically 7 years)

---

## Sample Data Scenarios

### Scenario 1: Simple RFP Flow

```
RFP Header:
- pricelist_template_id: "uuid-template-123"
- start_date: 2025-01-01
- end_date: 2025-01-15
- info.status: "open"
- info.rfp_number: "RFP-2025-000001"

RFP Details (3 vendors invited):
1. Vendor A: status "submitted", pricelist_id set, evaluation_scores populated
2. Vendor B: status "submitted", pricelist_id set, evaluation_scores populated
3. Vendor C: status "pending", no response

Award:
- info.award.awarded_vendor_id: Vendor A
- info.award.award_reason: "Best price-quality combination"
- info.award.total_award_value: 15000.00
```

### Scenario 2: Complex Evaluation

```
RFP Detail (Vendor A):
- info.response_status: "submitted"
- info.evaluation_scores: {
    price_score: 85,      (60% weight)
    quality_score: 90,    (25% weight)
    delivery_score: 75,   (15% weight)
    total_score: 84.25,
    rank: 1
  }
- info.price_comparison: {
    total_quoted: 14200.00,
    vs_average: -8.5%,
    vs_lowest: 0% (this is lowest),
    competitive_items: 48/50
  }
- info.compliance_check: {
    all_items_quoted: true,
    valid_certifications: true,
    delivery_acceptable: true,
    payment_terms_acceptable: true
  }
```

---

## Migration Notes

### From DS to DD
- **Date**: 2025-11-15
- **Schema Source**: `data-struc/schema.prisma` lines 2196-2253
- **Coverage**: ⚠️ 40% - Core tables exist, functionality in JSONB
- **Existing**: RFP header and detail tables
- **JSONB Usage**: Response tracking, evaluation, comparison, awards

### Future Enhancements
1. **Separate Response Table**: If query performance becomes issue
2. **Separate Evaluation Table**: For multi-evaluator support
3. **Separate Award Table**: For award analytics
4. **Response Versioning**: Track vendor response changes
5. **Collaborative Evaluation**: Multiple evaluators with weighted scores

---

## Document Metadata

**Created**: 2025-11-15
**Schema Version**: As of schema.prisma commit 9fbc771
**Coverage**: 2 entities from schema.prisma + JSONB analysis
**Status**: Active - Current JSONB approach is sufficient
**Enhancement Status**: Proposed tables documented for future consideration

---

**End of Data Definition Document**
