# Missing Tables and Fields - Comprehensive Summary

**Project**: Carmen ERP Schema Implementation
**Generated**: November 15, 2025
**Source**: Phase 4 DD Documents Analysis
**Total Missing Tables**: 23

---

## Executive Summary

### Summary by Module

| Module | Missing Tables | Priority | Implementation Effort |
|--------|---------------|----------|---------------------|
| Vendor Management - Vendor Portal | 7 | CRITICAL | 24-28 hours |
| Vendor Management - Vendor Directory | 3 | HIGH | 12-15 hours |
| Vendor Management - RFP Enhancement | 3 | MEDIUM | 8-10 hours |
| Inventory Management - Periodic Costing | 3 | CRITICAL | 13-16 hours |
| **TOTAL** | **16 required + 7 optional** | **Mixed** | **57-69 hours** |

### Implementation Priority Summary

- **CRITICAL (10 tables)**: Required for core functionality - 37-44 hours
- **HIGH (6 tables)**: Important for full features - 20-25 hours
- **MEDIUM (3 tables)**: Enhancement features - 8-10 hours
- **OPTIONAL (4 tables)**: Alternative to JSONB approach - included in MEDIUM

---

## 1. Vendor Management - Vendor Portal

**Module Path**: `vendor-management/vendor-portal`
**DD Document**: `DD-vendor-portal.md`
**Schema Coverage**: 0% (All tables missing)
**Total Tables**: 7 (all missing)
**Implementation Effort**: 24-28 hours

### Missing Tables

#### 1.1 tb_vendor_portal_user ❌

**Status**: NOT IN SCHEMA - Requires Implementation
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---
**Priority**: CRITICAL
**Estimated Effort**: 4-5 hours

**Purpose**: Vendor user accounts for portal access with authentication and authorization.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor)
- `email` (VARCHAR, UNIQUE, NOT NULL) - Login email
- `password_hash` (VARCHAR, NOT NULL) - Bcrypt hashed
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `two_factor_enabled` (BOOLEAN, DEFAULT FALSE)
- `two_factor_secret` (VARCHAR) - TOTP secret
- `backup_codes` (JSON) - 2FA backup codes
- `role` (ENUM) - VENDOR_ADMIN, VENDOR_USER, VENDOR_VIEWER
- `status` (ENUM) - ACTIVE, INACTIVE, SUSPENDED, LOCKED, PENDING_VERIFICATION
- `failed_login_attempts` (INTEGER, DEFAULT 0)
- `locked_until` (TIMESTAMPTZ)
- `last_login_at` (TIMESTAMPTZ)
- `last_login_ip` (VARCHAR)
- `notification_preferences` (JSON)
- Standard audit fields

**Enums Required**: 2
- `enum_vendor_user_role`
- `enum_vendor_user_status`

**Indexes**: 4
- Unique index on email
- Index on vendor_id
- Index on status
- Index on email_verified

**JSON Structures**: 2
- notification_preferences (email, sms, in-app settings)
- backup_codes (array of encrypted codes)

---

#### 1.2 tb_vendor_portal_session ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 3-4 hours

**Purpose**: Session management for vendor portal with JWT tokens and device tracking.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_portal_user_id` (UUID, FK → tb_vendor_portal_user)
- `session_token` (VARCHAR, UNIQUE, NOT NULL) - JWT
- `refresh_token` (VARCHAR, UNIQUE)
- `device_id` (VARCHAR)
- `device_fingerprint` (VARCHAR)
- `device_name` (VARCHAR)
- `browser` (VARCHAR)
- `os` (VARCHAR)
- `ip_address` (VARCHAR, NOT NULL)
- `user_agent` (VARCHAR)
- `location` (JSON) - GeoIP data
- `expires_at` (TIMESTAMPTZ, NOT NULL)
- `two_factor_verified` (BOOLEAN, DEFAULT FALSE)
- `last_activity_at` (TIMESTAMPTZ)
- `is_revoked` (BOOLEAN, DEFAULT FALSE)
- `revoked_at` (TIMESTAMPTZ)
- `revoked_reason` (VARCHAR)
- Standard audit fields

**Indexes**: 4
- Unique index on session_token
- Unique index on refresh_token
- Index on vendor_portal_user_id
- Index on expires_at WHERE is_revoked = FALSE

**JSON Structures**: 1
- location (city, region, country, coordinates)

**Business Rules**:
- Session expires after 30 minutes inactivity
- 2FA required for new devices
- Auto-cleanup of expired sessions daily

---

#### 1.3 tb_vendor_registration ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 4-5 hours

**Purpose**: Vendor registration requests and onboarding workflow.

**Key Fields**:
- `id` (UUID, PK)
- `registration_number` (VARCHAR, UNIQUE) - REG-YYYY-XXXX
- `legal_name` (VARCHAR, NOT NULL, UNIQUE)
- `tax_id` (VARCHAR, UNIQUE)
- `business_type` (VARCHAR)
- `physical_address` (JSON, NOT NULL)
- `mailing_address` (JSON)
- `billing_address` (JSON)
- `primary_contact` (JSON, NOT NULL)
- `secondary_contact` (JSON)
- `ap_contact` (JSON)
- `bank_name` (VARCHAR)
- `account_number` (VARCHAR, ENCRYPTED)
- `routing_number` (VARCHAR, ENCRYPTED)
- `swift_code` (VARCHAR)
- `documents` (JSON) - Uploaded document references
- `electronic_signature` (JSON)
- `status` (ENUM) - PENDING_REVIEW, UNDER_REVIEW, APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED
- `submitted_date` (TIMESTAMPTZ)
- `reviewed_by_id` (UUID)
- `reviewed_date` (TIMESTAMPTZ)
- `rejection_reason` (TEXT)
- `approved_vendor_id` (UUID, FK → tb_vendor)
- Standard audit fields

**Enums Required**: 1
- `enum_vendor_registration_status`

**Indexes**: 5
- Unique on registration_number
- Unique on legal_name
- Unique on tax_id
- Index on status
- Index on submitted_date

**JSON Structures**: 6
- physical_address, mailing_address, billing_address (street, city, state, postal_code, country)
- primary_contact, secondary_contact, ap_contact (name, email, phone, title)
- documents (array of uploaded file metadata)
- electronic_signature (signer name, date, IP, user agent)

---

#### 1.4 tb_vendor_document ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 4-5 hours

**Purpose**: Document management for vendor portal with virus scanning and expiry tracking.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `document_type` (ENUM, NOT NULL) - 19 types
- `file_name` (VARCHAR, NOT NULL)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `file_extension` (VARCHAR)
- `storage_provider` (VARCHAR) - S3, Azure, etc.
- `storage_path` (VARCHAR)
- `storage_key` (VARCHAR)
- `issue_date` (DATE)
- `expiry_date` (DATE)
- `virus_scan_status` (ENUM) - PENDING, CLEAN, INFECTED, SCAN_FAILED
- `virus_scan_date` (TIMESTAMPTZ)
- `status` (ENUM) - UNDER_REVIEW, APPROVED, REJECTED, EXPIRED, EXPIRING_SOON
- `uploaded_by_vendor_user_id` (UUID)
- `reviewed_by_id` (UUID)
- `reviewed_date` (TIMESTAMPTZ)
- `rejection_reason` (TEXT)
- `version` (INTEGER, DEFAULT 1)
- `previous_version_id` (UUID, FK → tb_vendor_document)
- `is_current_version` (BOOLEAN, DEFAULT TRUE)
- `reminders_sent` (JSON) - Expiry reminder tracking
- Standard audit fields

**Enums Required**: 3
- `enum_vendor_document_type` (19 values)
- `enum_virus_scan_status`
- `enum_vendor_document_status`

**Indexes**: 7
- Index on vendor_id
- Index on document_type
- Composite on (vendor_id, document_type)
- Index on expiry_date WHERE expiry_date IS NOT NULL
- Index on virus_scan_status
- Index on status
- Index on (previous_version_id, is_current_version)

**JSON Structures**: 1
- reminders_sent (array of reminder dates and statuses)

**Document Types**: 19
- BUSINESS_LICENSE, TAX_CERTIFICATE, INSURANCE_CERTIFICATE, BANK_REFERENCE
- ISO_9001, ISO_14001, ISO_22000, HACCP, ORGANIC_CERTIFICATION
- HALAL_CERTIFICATION, KOSHER_CERTIFICATION, W9_FORM, W8_FORM
- CONTRACT_AGREEMENT, PRODUCT_CATALOG, COMPANY_PROFILE
- FINANCIAL_STATEMENT, CREDIT_REPORT, OTHER

---

#### 1.5 tb_vendor_notification ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 3-4 hours

**Purpose**: In-portal notifications for vendors with multi-channel delivery tracking.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `vendor_portal_user_id` (UUID, FK → tb_vendor_portal_user)
- `type` (ENUM, NOT NULL) - INFO, SUCCESS, WARNING, ERROR, URGENT, REMINDER
- `priority` (ENUM, NOT NULL) - LOW, NORMAL, HIGH, URGENT
- `title` (VARCHAR, NOT NULL)
- `message` (TEXT, NOT NULL)
- `action_url` (VARCHAR) - Link to related resource
- `action_label` (VARCHAR) - Button text
- `is_read` (BOOLEAN, DEFAULT FALSE)
- `read_at` (TIMESTAMPTZ)
- `email_sent` (BOOLEAN, DEFAULT FALSE)
- `email_sent_at` (TIMESTAMPTZ)
- `sms_sent` (BOOLEAN, DEFAULT FALSE)
- `sms_sent_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ) - Auto-delete after 90 days
- Standard audit fields

**Enums Required**: 3
- `enum_vendor_notification_type`
- `enum_vendor_notification_priority`
- (No status enum, uses is_read boolean)

**Indexes**: 6
- Index on vendor_id
- Index on vendor_portal_user_id
- Index on (vendor_id, is_read)
- Index on type
- Index on priority
- Index on expires_at

**Notification Types**:
- New RFQ/RFP assigned
- Price list update required
- PO issued
- Invoice status changed
- Payment received
- Document expiring soon
- Account security alerts

---

#### 1.6 tb_vendor_message ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 3-4 hours

**Purpose**: Message center for vendor-buyer communication with threading.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `thread_id` (UUID) - Groups related messages
- `parent_message_id` (UUID, FK → tb_vendor_message) - Reply threading
- `sender_type` (ENUM, NOT NULL) - VENDOR, BUYER, SYSTEM
- `sender_vendor_user_id` (UUID, FK → tb_vendor_portal_user)
- `sender_system_user_id` (UUID, FK → tb_user)
- `recipient_type` (ENUM, NOT NULL) - VENDOR, BUYER
- `subject` (VARCHAR, NOT NULL)
- `body` (TEXT, NOT NULL)
- `message_type` (ENUM) - GENERAL, INQUIRY, ISSUE, CLARIFICATION
- `attachments` (JSON) - File attachments metadata
- `status` (ENUM, DEFAULT 'SENT') - DRAFT, SENT, DELIVERED, READ, REPLIED
- `sent_at` (TIMESTAMPTZ)
- `delivered_at` (TIMESTAMPTZ)
- `read_at` (TIMESTAMPTZ)
- `replied_at` (TIMESTAMPTZ)
- `related_resource_type` (VARCHAR) - PO, Invoice, RFQ, etc.
- `related_resource_id` (UUID)
- Standard audit fields

**Enums Required**: 4
- `enum_message_sender_type`
- `enum_message_recipient_type`
- `enum_message_type`
- `enum_message_status`

**Indexes**: 8
- Index on vendor_id
- Index on thread_id
- Index on parent_message_id
- Index on sender_vendor_user_id
- Index on (vendor_id, status)
- Index on sent_at
- Composite on (related_resource_type, related_resource_id)
- Index on read_at WHERE read_at IS NULL

**JSON Structures**: 1
- attachments (array of file metadata, max 10MB per message)

---

#### 1.7 tb_vendor_audit_log ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 3-4 hours

**Purpose**: Comprehensive audit trail for vendor portal activities (7-year retention).

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `vendor_portal_user_id` (UUID, FK → tb_vendor_portal_user)
- `action` (VARCHAR, NOT NULL) - Specific action taken
- `action_category` (ENUM, NOT NULL) - 12 categories
- `resource` (VARCHAR) - Resource type affected
- `resource_id` (UUID) - Specific resource ID
- `ip_address` (VARCHAR)
- `user_agent` (VARCHAR)
- `request_method` (VARCHAR) - GET, POST, PUT, DELETE
- `request_endpoint` (VARCHAR)
- `old_values` (JSON) - Before change
- `new_values` (JSON) - After change
- `changed_fields` (JSON) - Array of field names changed
- `status` (ENUM, NOT NULL) - SUCCESS, FAILURE, UNAUTHORIZED, FORBIDDEN, ERROR
- `error_message` (TEXT)
- `timestamp` (TIMESTAMPTZ, DEFAULT now(), NOT NULL)

**Enums Required**: 2
- `enum_audit_action_category` (12 values)
- `enum_audit_status`

**Indexes**: 8
- Index on vendor_id
- Index on vendor_portal_user_id
- Index on action_category
- Index on timestamp (DESC)
- Composite on (vendor_id, timestamp DESC)
- Composite on (vendor_portal_user_id, timestamp DESC)
- Index on status
- Composite on (action_category, timestamp DESC)

**Action Categories**: 12
- AUTHENTICATION
- AUTHORIZATION
- PROFILE_MANAGEMENT
- DOCUMENT_MANAGEMENT
- PRICING_SUBMISSION
- RFQ_BIDDING
- PO_MANAGEMENT
- INVOICE_SUBMISSION
- COMMUNICATION
- SETTINGS
- USER_MANAGEMENT
- SECURITY_EVENT

**JSON Structures**: 3
- old_values (before state)
- new_values (after state)
- changed_fields (array of field names)

**Business Rules**:
- All vendor actions logged automatically
- Logs are immutable (no updates/deletes)
- 7-year retention minimum
- Failed login attempts logged
- Security events flagged

---

## 2. Vendor Management - Vendor Directory

**Module Path**: `vendor-management/vendor-directory`
**DD Document**: `DD-vendor-directory.md`
**Schema Coverage**: 57% (4 existing tables, 3 missing)
**Total Tables**: 7 (4 existing, 3 missing)
**Implementation Effort**: 12-15 hours

### Existing Tables (Reference)

- ✅ `tb_vendor` - Core vendor profiles
- ✅ `tb_vendor_contact` - Contact persons
- ✅ `tb_vendor_address` - Multiple addresses
- ✅ `tb_vendor_business_type` - Business classification

### Missing Tables

#### 2.1 tb_vendor_certification ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: HIGH
**Estimated Effort**: 3-4 hours

**Purpose**: Track vendor certifications (ISO, HACCP, organic, etc.) with expiry alerts.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `certification_type` (VARCHAR, NOT NULL)
- `certification_number` (VARCHAR)
- `issuing_authority` (VARCHAR)
- `issue_date` (DATE)
- `expiry_date` (DATE)
- `renewal_date` (DATE)
- `status` (ENUM, DEFAULT 'active') - active, expired, suspended, revoked
- `document_url` (VARCHAR)
- `verified_by_id` (UUID)
- `verified_date` (TIMESTAMPTZ)
- `info` (JSON) - Certification details (scope, audit score, etc.)
- Standard audit fields

**Enums Required**: 1
- `enum_vendor_certification_status`

**Indexes**: 2
- Index on vendor_id
- Index on expiry_date WHERE status = 'active'

**JSON Structures**: 1
- info (scope, audit_score, audit_date, auditor_name, certificate_file)

**Business Rules**:
- Alert when expiry_date within 60 days
- Auto-update status to 'expired' when expiry_date < current_date
- Required certifications for food vendors (HACCP)

---

#### 2.2 tb_vendor_document ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: HIGH
**Estimated Effort**: 4-5 hours

**Purpose**: Manage vendor-related documents (contracts, insurance, licenses).

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `document_type` (VARCHAR, NOT NULL)
- `document_name` (VARCHAR, NOT NULL)
- `document_number` (VARCHAR)
- `document_date` (DATE)
- `expiry_date` (DATE)
- `file_path` (VARCHAR)
- `file_name` (VARCHAR)
- `file_size` (INTEGER)
- `mime_type` (VARCHAR)
- `version` (INTEGER, DEFAULT 1)
- `status` (VARCHAR, DEFAULT 'active') - active, archived, superseded
- `uploaded_by_id` (UUID)
- `uploaded_at` (TIMESTAMPTZ, DEFAULT now())
- `info` (JSON) - Document metadata
- Standard audit fields

**Indexes**: 3
- Index on vendor_id
- Composite on (document_type, vendor_id)
- Index on expiry_date WHERE expiry_date IS NOT NULL

**Document Types**: 10
- Contract/Agreement
- Insurance Certificate
- Business License
- Tax Certificate
- Bank Account Details
- W-9/W-8 (US tax forms)
- Quality Audit Report
- Product Catalog
- Price List Archive
- Other

**JSON Structures**: 1
- info (security_classification, requires_signature, signed_by, review_required, tags, related_documents)

**Business Rules**:
- Version control: New upload creates new version if document_type + document_number match
- Expiry alert when document expires within 30 days
- Access control for sensitive documents by role

---

#### 2.3 tb_vendor_rating ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: MEDIUM
**Estimated Effort**: 5-6 hours

**Purpose**: Track vendor performance ratings across multiple criteria.

**Key Fields**:
- `id` (UUID, PK)
- `vendor_id` (UUID, FK → tb_vendor, NOT NULL)
- `rating_period_start` (DATE, NOT NULL)
- `rating_period_end` (DATE, NOT NULL)
- `overall_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `quality_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `delivery_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `price_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `service_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `compliance_score` (DECIMAL(3,2), CHECK >= 1 AND <= 5)
- `total_orders` (INTEGER, DEFAULT 0)
- `on_time_deliveries` (INTEGER, DEFAULT 0)
- `quality_issues` (INTEGER, DEFAULT 0)
- `rated_by_id` (UUID)
- `rated_date` (TIMESTAMPTZ, DEFAULT now())
- `comments` (TEXT)
- `info` (JSON) - Rating metrics and details
- Standard audit fields

**Indexes**: 3
- Index on vendor_id
- Index on (rating_period_start, rating_period_end)
- Unique on (vendor_id, rating_period_start, rating_period_end) WHERE deleted_at IS NULL

**JSON Structures**: 1
- info (metrics, strengths, areas_for_improvement, action_items)

**Business Rules**:
- Period non-overlap: Rating periods for same vendor cannot overlap
- Score calculation: overall_score = AVERAGE(quality, delivery, price, service, compliance)
- Minimum data: Require at least 3 orders in period for valid rating
- Approval: Ratings may require manager approval

---

## 3. Inventory Management - Periodic Average Costing

**Module Path**: `inventory-management/periodic-average-costing`
**DD Document**: `DD-periodic-average-costing.md`
**Schema Coverage**: 20% (reuses 1 existing table with different pattern, 3 missing)
**Total Tables**: 4 (1 reused, 3 missing)
**Implementation Effort**: 13-16 hours

### Existing Table Reuse Pattern

- ✅ `tb_inventory_transaction_cost_layer` - Reused with different pattern
  - **FIFO Pattern**: lot_no = "LOT-XXX" (unique identifier)
  - **Periodic Average Pattern**: lot_no = NULL (no lot tracking)
  - All transactions in same period use same `cost_per_unit` (period average)

### Missing Tables

#### 3.1 tb_costing_period ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 4-5 hours

**Purpose**: Track monthly costing periods with open/closed status.

**Key Fields**:
- `id` (UUID, PK)
- `year` (INTEGER, NOT NULL)
- `month` (INTEGER, NOT NULL, CHECK month BETWEEN 1 AND 12)
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE, NOT NULL)
- `status` (ENUM, NOT NULL, DEFAULT 'open') - open, closing, closed, reopened
- `closed_date` (TIMESTAMPTZ)
- `closed_by_id` (UUID)
- `total_products_processed` (INTEGER, DEFAULT 0)
- `total_locations_processed` (INTEGER, DEFAULT 0)
- `processing_duration_seconds` (INTEGER)
- `info` (JSON) - Period statistics and validation results
- Standard audit fields

**Enums Required**: 1
- `enum_costing_period_status`

**Indexes**: 2
- Unique on (year, month) WHERE deleted_at IS NULL
- Index on status

**JSON Structures**: 1
- info (auto_created, transaction counts, statistics, validation_results)

**Business Rules**:
- Only one period per year-month
- Sequential closing: Cannot close current if previous is open
- No new transactions in closed periods (except adjustments)
- Periods auto-created when first transaction occurs

---

#### 3.2 tb_period_average_cost_cache ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: CRITICAL
**Estimated Effort**: 5-6 hours

**Purpose**: Cache calculated average costs per product/location/period.

**Key Fields**:
- `id` (UUID, PK)
- `costing_period_id` (UUID, FK → tb_costing_period, NOT NULL)
- `product_id` (UUID, FK → tb_product, NOT NULL)
- `location_id` (UUID, FK → tb_location, NOT NULL)
- `unit_id` (UUID, FK → tb_unit)
- `opening_balance_qty` (DECIMAL(20,5), DEFAULT 0)
- `opening_balance_value` (DECIMAL(20,5), DEFAULT 0)
- `total_receipt_qty` (DECIMAL(20,5), DEFAULT 0)
- `total_receipt_value` (DECIMAL(20,5), DEFAULT 0)
- `total_consumption_qty` (DECIMAL(20,5), DEFAULT 0)
- `total_adjustment_qty` (DECIMAL(20,5), DEFAULT 0)
- `closing_balance_qty` (DECIMAL(20,5), DEFAULT 0)
- `average_cost_per_unit` (DECIMAL(20,5), NOT NULL)
- `calculation_method` (VARCHAR, DEFAULT 'weighted_average')
- `calculated_at` (TIMESTAMPTZ, DEFAULT now())
- `calculated_by_id` (UUID)
- `is_finalized` (BOOLEAN, DEFAULT FALSE)
- `info` (JSON) - Calculation details and variance analysis
- Standard audit fields

**Indexes**: 3
- Unique on (costing_period_id, product_id, location_id) WHERE deleted_at IS NULL
- Index on product_id
- Index on location_id

**JSON Structures**: 1
- info (calculation_details, variance_analysis, transactions_applied)

**Calculation Formula**:
```
average_cost_per_unit = (opening_balance_value + total_receipt_value)
                      ÷ (opening_balance_qty + total_receipt_qty)
```

**Business Rules**:
- One cache entry per period-product-location
- If no receipts in period, use previous period's average
- Cannot modify after is_finalized = TRUE
- Validation: closing = opening + receipts + adjustments - consumption

---

#### 3.3 tb_period_close_log ❌

**Status**: NOT IN SCHEMA - Requires Implementation
**Priority**: HIGH
**Estimated Effort**: 4-5 hours

**Purpose**: Audit trail of period close processing with step-by-step tracking.

**Key Fields**:
- `id` (UUID, PK)
- `costing_period_id` (UUID, FK → tb_costing_period, NOT NULL)
- `process_step` (VARCHAR, NOT NULL)
- `step_sequence` (INTEGER, NOT NULL)
- `start_time` (TIMESTAMPTZ, NOT NULL)
- `end_time` (TIMESTAMPTZ)
- `duration_seconds` (INTEGER)
- `status` (ENUM, NOT NULL) - pending, running, completed, failed, skipped
- `records_processed` (INTEGER, DEFAULT 0)
- `records_succeeded` (INTEGER, DEFAULT 0)
- `records_failed` (INTEGER, DEFAULT 0)
- `error_message` (TEXT)
- `warnings` (JSON) - Warning messages array
- `info` (JSON) - Processing metadata (SQL query, parameters, batch details, performance metrics)
- Standard audit fields

**Enums Required**: 1
- `enum_period_close_step_status`

**Standard Process Steps**: 8
1. validate_transactions
2. calculate_averages
3. apply_costs_receipts
4. apply_costs_consumptions
5. apply_costs_adjustments
6. validate_balances
7. update_gl_accounts
8. finalize_period

**Indexes**: 2
- Composite on (costing_period_id, step_sequence)
- Index on status

**JSON Structures**: 2
- warnings (array of warning objects with code, message, severity)
- info (sql_query, parameters, affected_tables, batch_details, performance_metrics)

**Business Rules**:
- Sequential processing in step_sequence order
- If step fails, entire close process rolls back
- All steps logged regardless of success/failure
- Failed close can be retried

---

## 4. Vendor Management - RFP Enhancement (OPTIONAL)

**Module Path**: `vendor-management/requests-for-pricing`
**DD Document**: `DD-requests-for-pricing.md`
**Schema Coverage**: 40% (2 existing, 3 proposed enhancements)
**Status**: OPTIONAL - Alternative to current JSONB approach
**Implementation Effort**: 8-10 hours (if implementing relational approach)

### Current Implementation

- ✅ `tb_request_for_pricing` - Uses JSONB for vendor responses, comparison, awards
- ✅ `tb_request_for_pricing_detail` - Line items

### Proposed Enhancement Tables (OPTIONAL)

These tables provide a relational alternative to the current JSONB approach. Implementation is optional and depends on querying/reporting requirements.

#### 4.1 tb_rfp_vendor_response ❌

**Status**: PROPOSED ENHANCEMENT (Not in schema)
**Priority**: MEDIUM (Optional - alternative to JSONB)
**Estimated Effort**: 3-4 hours

**Purpose**: Store vendor responses to RFPs in relational format (alternative to JSONB).

**Key Fields**:
- `id` (UUID, PK)
- `request_for_pricing_id` (UUID, FK → tb_request_for_pricing)
- `vendor_id` (UUID, FK → tb_vendor)
- `response_date` (TIMESTAMPTZ)
- `total_quoted_amount` (DECIMAL(15,2))
- `delivery_commitment_days` (INTEGER)
- `payment_terms` (VARCHAR)
- `validity_days` (INTEGER)
- `comments` (TEXT)
- `line_item_responses` (JSON) - Per-item pricing
- `status` (ENUM) - draft, submitted, withdrawn, accepted, rejected
- Standard audit fields

---

#### 4.2 tb_rfp_evaluation ❌

**Status**: PROPOSED ENHANCEMENT (Not in schema)
**Priority**: MEDIUM (Optional - alternative to JSONB)
**Estimated Effort**: 3-4 hours

**Purpose**: Store RFP evaluation scores (alternative to JSONB).

**Key Fields**:
- `id` (UUID, PK)
- `request_for_pricing_id` (UUID, FK → tb_request_for_pricing)
- `vendor_id` (UUID, FK → tb_vendor)
- `price_score` (DECIMAL(5,2))
- `quality_score` (DECIMAL(5,2))
- `delivery_score` (DECIMAL(5,2))
- `total_score` (DECIMAL(5,2))
- `evaluated_by_id` (UUID)
- `evaluated_date` (TIMESTAMPTZ)
- `comments` (TEXT)
- Standard audit fields

---

#### 4.3 tb_rfp_award ❌

**Status**: PROPOSED ENHANCEMENT (Not in schema)
**Priority**: MEDIUM (Optional - alternative to JSONB)
**Estimated Effort**: 2-3 hours

**Purpose**: Store RFP award decisions (alternative to JSONB).

**Key Fields**:
- `id` (UUID, PK)
- `request_for_pricing_id` (UUID, FK → tb_request_for_pricing)
- `vendor_id` (UUID, FK → tb_vendor)
- `award_date` (TIMESTAMPTZ)
- `total_award_amount` (DECIMAL(15,2))
- `awarded_by_id` (UUID)
- `award_reason` (TEXT)
- `line_items_awarded` (JSON)
- Standard audit fields

**Note**: These 3 tables are **OPTIONAL enhancements**. The current JSONB implementation works but has trade-offs:
- **JSONB Advantages**: Flexible schema, simpler structure, faster initial development
- **Relational Advantages**: Better querying, referential integrity, normalized data, easier reporting

---

## 5. Missing Fields in Existing Tables

After comprehensive review of all Phase 4 DD documents, **NO missing fields were identified in existing tables**. All existing tables documented in schema.prisma are complete and used as-is.

The documents identified entire missing tables rather than missing fields within existing tables.

### Existing Tables Fully Documented

All existing tables from schema.prisma are fully utilized:

**Vendor Management**:
- ✅ tb_vendor (complete)
- ✅ tb_vendor_contact (complete)
- ✅ tb_vendor_address (complete)
- ✅ tb_vendor_business_type (complete)
- ✅ tb_pricelist (complete)
- ✅ tb_pricelist_detail (complete)
- ✅ tb_pricelist_template (complete)
- ✅ tb_pricelist_template_detail (complete)
- ✅ tb_request_for_pricing (complete - uses JSONB for flexibility)
- ✅ tb_request_for_pricing_detail (complete)

**Inventory Management**:
- ✅ tb_inventory_transaction_cost_layer (complete - reused with different pattern for Periodic Average)

---

## Implementation Roadmap

### Phase 1: CRITICAL Tables (37-44 hours)

**Priority**: Implement immediately for core functionality

1. **Periodic Average Costing** (13-16 hours)
   - tb_costing_period (4-5 hours)
   - tb_period_average_cost_cache (5-6 hours)
   - tb_period_close_log (4-5 hours)

2. **Vendor Portal Core** (24-28 hours)
   - tb_vendor_portal_user (4-5 hours)
   - tb_vendor_portal_session (3-4 hours)
   - tb_vendor_registration (4-5 hours)
   - tb_vendor_document (4-5 hours)
   - tb_vendor_notification (3-4 hours)
   - tb_vendor_message (3-4 hours)
   - tb_vendor_audit_log (3-4 hours)

### Phase 2: HIGH Priority Tables (12-15 hours)

**Priority**: Implement within 3 months for full vendor management features

3. **Vendor Directory Enhancements** (12-15 hours)
   - tb_vendor_certification (3-4 hours)
   - tb_vendor_document (4-5 hours)
   - tb_vendor_rating (5-6 hours)

### Phase 3: MEDIUM/OPTIONAL Tables (8-10 hours)

**Priority**: Evaluate and implement if needed (6-12 months)

4. **RFP Enhancement** (8-10 hours) - OPTIONAL
   - tb_rfp_vendor_response (3-4 hours)
   - tb_rfp_evaluation (3-4 hours)
   - tb_rfp_award (2-3 hours)
   - **Decision Required**: Keep JSONB or migrate to relational?

---

## Summary Statistics

### By Priority

| Priority | Tables | Implementation Effort |
|----------|--------|---------------------|
| CRITICAL | 10 | 37-44 hours |
| HIGH | 3 | 12-15 hours |
| MEDIUM | 3 | 8-10 hours |
| OPTIONAL | 3 (RFP) | 8-10 hours |
| **TOTAL** | **16-19** | **57-79 hours** |

### By Module

| Module | Tables | Status | Effort |
|--------|--------|--------|--------|
| Vendor Portal | 7 | All missing | 24-28 hours |
| Vendor Directory | 3 | Enhancement | 12-15 hours |
| Periodic Costing | 3 | All missing | 13-16 hours |
| RFP Enhancement | 3 | Optional | 8-10 hours |

### Enums Required

**Total New Enums**: 20+

By Module:
- Vendor Portal: 12 enums
- Vendor Directory: 2 enums
- Periodic Costing: 2 enums
- RFP Enhancement: 4 enums (optional)

### Indexes Required

**Total New Indexes**: 60+

By Module:
- Vendor Portal: 40+ indexes
- Vendor Directory: 8 indexes
- Periodic Costing: 7 indexes
- RFP Enhancement: 8 indexes (optional)

---

## Document Metadata

**Created**: November 15, 2025
**Source**: Phase 4 DD Documents
**Documents Analyzed**: 6
- DD-vendor-portal.md
- DD-vendor-directory.md
- DD-periodic-average-costing.md
- DD-price-lists.md (100% coverage, no missing tables)
- DD-pricelist-templates.md (100% coverage, no missing tables)
- DD-requests-for-pricing.md (40% coverage, optional enhancements)

**Total Missing Tables**: 16 required + 3 optional = 19
**Total Missing Fields**: 0 (all existing tables complete)
**Total Implementation Effort**: 57-69 hours (database only)
**Additional Effort**: 100-150 hours (application logic) + 40-60 hours (testing)

---

**End of Summary Document**
