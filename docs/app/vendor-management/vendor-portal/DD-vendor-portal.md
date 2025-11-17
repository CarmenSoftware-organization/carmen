# Vendor Entry Portal - Data Definition (DD)

## Document Information
- **Document Type**: Data Definition Document
- **Module**: Vendor Management > Vendor Entry Portal
- **Version**: 1.0
- **Last Updated**: 2025-11-15
- **Document Status**: Final
- **Schema Coverage**: ⚠️ 0% (All tables require implementation)

---

## 1. Overview

### 1.1 Purpose
The Vendor Entry Portal module provides a self-service web application for vendors to interact with the organization. It enables vendor registration, profile management, document uploads, price submissions, RFQ responses, purchase order tracking, invoice submission, and performance monitoring through a dedicated portal interface.

### 1.2 Scope
This document defines the data structures for the Vendor Entry Portal, including:
- Vendor portal user accounts and authentication
- Vendor registration workflows
- Document management and tracking
- In-portal notifications and messaging
- Audit logging for vendor activities
- Session management and security

### 1.3 Architecture Pattern
**Separate Next.js Application with Shared Database**:
- Independent deployment from main ERP
- Separate authentication system (NextAuth.js)
- Direct access to shared PostgreSQL database
- Vendor-focused user experience
- Data isolation enforced at query level

### 1.4 Data Flow
```
Vendor User → Portal Frontend → Server Actions → Prisma ORM → Shared Database
                                         ↓
                            External Services (S3, Email, SMS)
                                         ↑
                          Main ERP Application (webhook updates)
```

---

## 2. Schema Coverage Analysis

### 2.1 Current Schema Status
**Schema Coverage**: ⚠️ **0%** - No portal-specific tables exist in schema.prisma

**Required Tables** (7 new tables):
1. ❌ `tb_vendor_portal_user` - Vendor user accounts (NOT IN SCHEMA)
2. ❌ `tb_vendor_portal_session` - Session management (NOT IN SCHEMA)
3. ❌ `tb_vendor_registration` - Registration requests (NOT IN SCHEMA)
4. ❌ `tb_vendor_document` - Vendor documents (NOT IN SCHEMA)
5. ❌ `tb_vendor_notification` - In-portal notifications (NOT IN SCHEMA)
6. ❌ `tb_vendor_message` - Message center (NOT IN SCHEMA)
7. ❌ `tb_vendor_audit_log` - Vendor activity audit (NOT IN SCHEMA)

**Existing Tables Used** (from main ERP):
- ✅ `tb_vendor` - Vendor profile information
- ✅ `tb_product` - Product catalog
- ✅ `tb_pricelist_template` - Price templates
- ✅ `tb_pricelist` - Submitted price lists
- ✅ `tb_request_for_pricing` - RFQ campaigns
- ✅ `tb_request_for_pricing_detail` - RFQ line items
- ✅ `tb_purchase_order` - Purchase orders
- ✅ `tb_invoice` - Invoices

### 2.2 Implementation Priority
**CRITICAL**: All 7 portal-specific tables required for Phase 1 launch
**Estimated Effort**: 24-28 hours total

---

## 3. ⚠️ Missing Tables (Not in Schema.prisma)

### 3.1 tb_vendor_portal_user

**Purpose**: Vendor user accounts for portal access (separate from main ERP users)

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 4-5 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| vendor_id | UUID | NOT NULL, FK → tb_vendor(id) ON DELETE CASCADE | Associated vendor |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address (login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| email_verified_at | TIMESTAMPTZ | NULL | Email verification timestamp |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA enabled flag |
| two_factor_secret | VARCHAR(255) | NULL | Encrypted TOTP secret |
| two_factor_backup_codes | JSON | NULL | Array of encrypted backup codes |
| first_name | VARCHAR(100) | NOT NULL | User first name |
| last_name | VARCHAR(100) | NOT NULL | User last name |
| title | VARCHAR(100) | NULL | User job title |
| phone | VARCHAR(20) | NULL | User phone number |
| mobile | VARCHAR(20) | NULL | User mobile number |
| role | ENUM | NOT NULL, DEFAULT 'VENDOR_USER' | User role (see enum below) |
| permissions | JSON | NULL | Custom permission overrides |
| status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | User account status (see enum below) |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| last_login_at | TIMESTAMPTZ | NULL | Last successful login |
| last_login_ip | VARCHAR(45) | NULL | Last login IP address |
| failed_login_attempts | INTEGER | DEFAULT 0 | Failed login counter |
| locked_until | TIMESTAMPTZ | NULL | Account lock expiry time |
| password_changed_at | TIMESTAMPTZ | NULL | Last password change timestamp |
| must_change_password | BOOLEAN | DEFAULT FALSE | Force password change flag |
| notification_preferences | JSON | NULL | Notification settings (see JSON structure) |
| created_at | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| created_by_id | UUID | NULL | Created by user ID |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| updated_by_id | UUID | NULL | Last updated by user ID |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

#### Enums

**enum_vendor_user_role**:
- `VENDOR_ADMIN` - Full access, can manage users
- `VENDOR_USER` - Standard operational access
- `VENDOR_VIEWER` - Read-only access

**enum_vendor_user_status**:
- `ACTIVE` - Active account
- `INACTIVE` - Deactivated account
- `SUSPENDED` - Temporarily suspended
- `LOCKED` - Locked due to failed login attempts
- `PENDING_VERIFICATION` - Email verification pending

#### Indexes

```sql
CREATE INDEX idx_vendor_portal_user_vendor_active
  ON tb_vendor_portal_user(vendor_id, is_active) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_vendor_portal_user_email
  ON tb_vendor_portal_user(email) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_portal_user_status
  ON tb_vendor_portal_user(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_portal_user_last_login
  ON tb_vendor_portal_user(last_login_at) WHERE deleted_at IS NULL;
```

#### JSON Structures

**notification_preferences**:
```json
{
  "email": {
    "enabled": true,
    "newRFQ": true,
    "newTemplate": true,
    "poIssued": true,
    "invoiceStatusChange": true,
    "paymentReceived": true,
    "documentExpiry": true,
    "performanceScorecard": true,
    "systemAnnouncements": true
  },
  "sms": {
    "enabled": false,
    "urgentOnly": true,
    "poIssued": true,
    "paymentReceived": true
  },
  "inApp": {
    "enabled": true,
    "frequency": "immediate"
  },
  "quietHours": {
    "enabled": false,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/New_York"
  }
}
```

**permissions** (custom overrides):
```json
{
  "canSubmitPricing": true,
  "canSubmitBids": true,
  "canSubmitInvoices": true,
  "canViewPerformance": true,
  "canManageUsers": false,
  "canEditProfile": true,
  "canUploadDocuments": true
}
```

#### Relationships
- **vendor** → tb_vendor(id)
- **sessions** ← tb_vendor_portal_session(user_id)
- **notifications** ← tb_vendor_notification(user_id)
- **messages** ← tb_vendor_message(sender_id)
- **audit_logs** ← tb_vendor_audit_log(user_id)
- **documents** ← tb_vendor_document(uploaded_by)

#### Business Rules
- VAL-VP-USER-001: Email must be unique across all portal users
- VAL-VP-USER-002: Password must meet complexity requirements (12+ chars, mixed case, numbers, special chars)
- VAL-VP-USER-003: Account locked for 15 minutes after 5 failed login attempts
- VAL-VP-USER-004: Password expires after 90 days
- VAL-VP-USER-005: Cannot reuse last 5 passwords
- VAL-VP-USER-006: Email verification required before portal access
- VAL-VP-USER-007: Only VENDOR_ADMIN role can manage other users
- VAL-VP-USER-008: Soft delete only (preserve audit trail)

---

### 3.2 tb_vendor_portal_session

**Purpose**: Session management and security tracking for vendor portal users

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 3-4 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique session identifier |
| user_id | UUID | NOT NULL, FK → tb_vendor_portal_user(id) ON DELETE CASCADE | Associated user |
| session_token | VARCHAR(255) | NOT NULL, UNIQUE | Session token (JWT) |
| refresh_token | VARCHAR(255) | UNIQUE, NULL | Refresh token |
| device_id | VARCHAR(255) | NULL | Device identifier |
| device_fingerprint | VARCHAR(255) | NULL | Browser fingerprint |
| ip_address | VARCHAR(45) | NOT NULL | Session IP address |
| user_agent | TEXT | NOT NULL | Browser user agent string |
| device_type | VARCHAR(50) | NULL | Mobile, Desktop, Tablet |
| browser | VARCHAR(100) | NULL | Browser name |
| os | VARCHAR(100) | NULL | Operating system |
| location | JSON | NULL | GeoIP location data |
| expires_at | TIMESTAMPTZ | NOT NULL | Session expiry time |
| last_activity_at | TIMESTAMPTZ | DEFAULT now() | Last activity timestamp |
| created_at | TIMESTAMPTZ | DEFAULT now() | Session creation timestamp |
| is_trusted_device | BOOLEAN | DEFAULT FALSE | Trusted device flag |
| requires_two_factor | BOOLEAN | DEFAULT TRUE | 2FA required for this session |
| two_factor_verified | BOOLEAN | DEFAULT FALSE | 2FA completed for this session |

#### Indexes

```sql
CREATE INDEX idx_vendor_session_user_expiry
  ON tb_vendor_portal_session(user_id, expires_at);

CREATE UNIQUE INDEX idx_vendor_session_token
  ON tb_vendor_portal_session(session_token);

CREATE INDEX idx_vendor_session_cleanup
  ON tb_vendor_portal_session(expires_at);

CREATE INDEX idx_vendor_session_device
  ON tb_vendor_portal_session(user_id, device_id);
```

#### JSON Structures

**location**:
```json
{
  "ip": "203.0.113.42",
  "city": "Los Angeles",
  "region": "California",
  "country": "United States",
  "countryCode": "US",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "timezone": "America/Los_Angeles"
}
```

#### Business Rules
- VAL-VP-SESSION-001: Session expires after 30 minutes of inactivity
- VAL-VP-SESSION-002: Maximum one active session per user (configurable)
- VAL-VP-SESSION-003: 2FA required for new devices
- VAL-VP-SESSION-004: Expired sessions cleaned up daily
- VAL-VP-SESSION-005: Session invalidated on password change
- VAL-VP-SESSION-006: "Remember me" extends session to 7 days

---

### 3.3 tb_vendor_registration

**Purpose**: Vendor registration requests and approval workflow

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 4-5 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique registration ID |
| registration_number | VARCHAR(50) | NOT NULL, UNIQUE | REG-YYYY-XXXX format |
| legal_name | VARCHAR(255) | NOT NULL | Company legal name |
| trade_name | VARCHAR(255) | NULL | Company trade name |
| business_type | VARCHAR(100) | NOT NULL | Corporation, LLC, Partnership, etc. |
| tax_id | VARCHAR(50) | NOT NULL, UNIQUE | EIN tax ID |
| state_tax_id | VARCHAR(50) | NULL | State tax ID |
| year_established | INTEGER | NOT NULL | Year company established |
| physical_address | JSON | NOT NULL | Physical address (see JSON structure) |
| mailing_address | JSON | NOT NULL | Mailing address |
| billing_address | JSON | NOT NULL | Billing address |
| primary_contact | JSON | NOT NULL | Primary contact info |
| secondary_contact | JSON | NULL | Secondary contact info |
| ap_contact | JSON | NOT NULL | Accounts payable contact |
| business_categories | JSON | NOT NULL | Array of business categories |
| products_services | TEXT | NOT NULL | Description of offerings |
| annual_revenue | VARCHAR(50) | NOT NULL | Revenue range |
| employee_count | VARCHAR(50) | NOT NULL | Employee count range |
| certifications | JSON | NULL | Array of certifications |
| website | VARCHAR(255) | NULL | Company website URL |
| bank_name | VARCHAR(255) | NOT NULL | Bank name |
| account_holder_name | VARCHAR(255) | NOT NULL | Bank account holder name |
| account_number | VARCHAR(255) | NOT NULL | Encrypted bank account number |
| routing_number | VARCHAR(255) | NOT NULL | Encrypted routing number |
| account_type | VARCHAR(50) | NOT NULL | Checking, Savings |
| documents | JSON | NOT NULL | Array of uploaded documents |
| terms_accepted | BOOLEAN | DEFAULT FALSE | Terms and conditions accepted |
| terms_accepted_at | TIMESTAMPTZ | NULL | Terms acceptance timestamp |
| electronic_signature | JSON | NOT NULL | Electronic signature data |
| status | ENUM | DEFAULT 'PENDING_REVIEW' | Registration status (see enum below) |
| submitted_at | TIMESTAMPTZ | DEFAULT now() | Submission timestamp |
| reviewed_by_id | UUID | NULL | Procurement staff reviewer ID |
| reviewed_at | TIMESTAMPTZ | NULL | Review timestamp |
| approved_by_id | UUID | NULL | Approver user ID |
| approved_at | TIMESTAMPTZ | NULL | Approval timestamp |
| rejection_reason | TEXT | NULL | Rejection reason |
| vendor_id | UUID | UNIQUE, NULL, FK → tb_vendor(id) | Created vendor record |
| submitter_ip | VARCHAR(45) | NOT NULL | Submitter IP address |
| submitter_user_agent | TEXT | NOT NULL | Submitter user agent |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

#### Enums

**enum_registration_status**:
- `PENDING_REVIEW` - Awaiting initial review
- `UNDER_REVIEW` - Currently being reviewed
- `APPROVED` - Approved and vendor created
- `REJECTED` - Rejected with reason
- `DUPLICATE` - Duplicate vendor detected
- `INCOMPLETE` - Missing required information

#### Indexes

```sql
CREATE UNIQUE INDEX idx_vendor_registration_number
  ON tb_vendor_registration(registration_number);

CREATE UNIQUE INDEX idx_vendor_registration_tax_id
  ON tb_vendor_registration(tax_id);

CREATE INDEX idx_vendor_registration_status
  ON tb_vendor_registration(status);

CREATE INDEX idx_vendor_registration_submitted
  ON tb_vendor_registration(submitted_at);

CREATE UNIQUE INDEX idx_vendor_registration_vendor
  ON tb_vendor_registration(vendor_id) WHERE vendor_id IS NOT NULL;
```

#### JSON Structures

**physical_address / mailing_address / billing_address**:
```json
{
  "street1": "123 Main Street",
  "street2": "Suite 100",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "country": "United States"
}
```

**primary_contact / secondary_contact / ap_contact**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "title": "CEO",
  "email": "john.doe@vendor.com",
  "phone": "+1 (555) 123-4567",
  "mobile": "+1 (555) 987-6543"
}
```

**business_categories**:
```json
{
  "categories": [
    "Food & Beverage",
    "Fresh Produce",
    "Dairy Products"
  ]
}
```

**certifications**:
```json
{
  "certifications": [
    {
      "name": "ISO 9001",
      "issuingOrganization": "ISO",
      "issueDate": "2024-01-01",
      "expiryDate": "2027-01-01"
    }
  ]
}
```

**documents**:
```json
{
  "documents": [
    {
      "documentType": "BUSINESS_LICENSE",
      "fileName": "business-license.pdf",
      "fileSize": 245678,
      "uploadedAt": "2025-01-15T10:30:00Z",
      "storageKey": "vendors/registrations/reg-123/business-license.pdf"
    }
  ]
}
```

**electronic_signature**:
```json
{
  "signerName": "John Doe",
  "signerTitle": "CEO",
  "signatureDate": "2025-01-15T10:45:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0..."
}
```

#### Business Rules
- VAL-VP-REG-001: Registration number auto-generated as REG-YYYY-XXXX
- VAL-VP-REG-002: Duplicate check by tax_id and legal_name before submission
- VAL-VP-REG-003: All required documents must be uploaded (business license, tax certificate, insurance)
- VAL-VP-REG-004: Terms acceptance required before submission
- VAL-VP-REG-005: Electronic signature required (name, title, date)
- VAL-VP-REG-006: Approval creates vendor record in tb_vendor
- VAL-VP-REG-007: Vendor portal account created upon approval
- VAL-VP-REG-008: Bank account data encrypted at rest
- VAL-VP-REG-009: Rejected vendors can reapply after 30 days

---

### 3.4 tb_vendor_document

**Purpose**: Vendor-uploaded documents with expiry tracking and virus scanning

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 4-5 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique document ID |
| vendor_id | UUID | NOT NULL, FK → tb_vendor(id) ON DELETE CASCADE | Associated vendor |
| document_type | ENUM | NOT NULL | Document classification (see enum below) |
| document_category | VARCHAR(100) | NULL | Custom category label |
| document_name | VARCHAR(255) | NOT NULL | Document display name |
| description | TEXT | NULL | Document description |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_size | BIGINT | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type |
| file_extension | VARCHAR(10) | NOT NULL | File extension |
| storage_provider | VARCHAR(50) | NOT NULL | S3, Azure, etc. |
| storage_path | VARCHAR(500) | NOT NULL | S3 key or blob path |
| storage_url | VARCHAR(1000) | NULL | Temporary pre-signed URL |
| issue_date | DATE | NULL | Document issue date |
| expiry_date | DATE | NULL | Document expiry date |
| issuing_organization | VARCHAR(255) | NULL | Issuing authority |
| certificate_number | VARCHAR(100) | NULL | Certificate/license number |
| version | VARCHAR(20) | NULL | Document version |
| notes | TEXT | NULL | Additional notes |
| status | ENUM | DEFAULT 'UNDER_REVIEW' | Document status (see enum below) |
| reviewed_by_id | UUID | NULL | Reviewer user ID |
| reviewed_at | TIMESTAMPTZ | NULL | Review timestamp |
| approved_by_id | UUID | NULL | Approver user ID |
| approved_at | TIMESTAMPTZ | NULL | Approval timestamp |
| rejection_reason | TEXT | NULL | Rejection reason |
| virus_scan_status | ENUM | DEFAULT 'PENDING' | Virus scan result (see enum below) |
| virus_scan_result | TEXT | NULL | Scan details |
| virus_scan_date | TIMESTAMPTZ | NULL | Scan timestamp |
| previous_version_id | UUID | NULL, FK → tb_vendor_document(id) | Previous version reference |
| current_version | BOOLEAN | DEFAULT TRUE | Is current version flag |
| superseded_at | TIMESTAMPTZ | NULL | When this version was replaced |
| uploaded_by_id | UUID | NOT NULL, FK → tb_vendor_portal_user(id) | Uploader user ID |
| uploaded_at | TIMESTAMPTZ | DEFAULT now() | Upload timestamp |
| reminders_sent | JSON | NULL | Array of reminder timestamps |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

#### Enums

**enum_vendor_document_type**:
- `BUSINESS_LICENSE` - Business operating license
- `TAX_CERTIFICATE` - W-9, sales tax exemption
- `INSURANCE_GENERAL_LIABILITY` - General liability insurance
- `INSURANCE_WORKERS_COMP` - Workers compensation insurance
- `INSURANCE_PROFESSIONAL` - Professional liability insurance
- `CERTIFICATION_ISO_9001` - ISO 9001 quality certification
- `CERTIFICATION_ISO_14001` - ISO 14001 environmental certification
- `CERTIFICATION_HACCP` - HACCP food safety certification
- `CERTIFICATION_FDA` - FDA registration
- `CERTIFICATION_ORGANIC` - Organic certification
- `CERTIFICATION_FAIR_TRADE` - Fair trade certification
- `CERTIFICATION_KOSHER` - Kosher certification
- `CERTIFICATION_HALAL` - Halal certification
- `PRODUCT_CATALOG` - Product catalog or brochure
- `SAFETY_DATA_SHEET` - SDS for chemicals
- `FINANCIAL_STATEMENT` - Financial statements
- `REFERENCE_LETTER` - Reference letter
- `CONTRACT` - Signed contract
- `OTHER` - Other document type

**enum_vendor_document_status**:
- `UNDER_REVIEW` - Awaiting review
- `APPROVED` - Approved and valid
- `REJECTED` - Rejected with reason
- `EXPIRED` - Past expiry date
- `EXPIRING_SOON` - Expiring within 30 days
- `SUPERSEDED` - Replaced by newer version

**enum_virus_scan_status**:
- `PENDING` - Scan pending
- `CLEAN` - No threats detected
- `INFECTED` - Virus/malware detected
- `SCAN_FAILED` - Scan could not complete

#### Indexes

```sql
CREATE INDEX idx_vendor_document_vendor_type
  ON tb_vendor_document(vendor_id, document_type) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_document_status
  ON tb_vendor_document(status) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_document_expiry
  ON tb_vendor_document(expiry_date) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_document_virus_scan
  ON tb_vendor_document(virus_scan_status) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_document_current
  ON tb_vendor_document(vendor_id, current_version)
  WHERE current_version = TRUE AND deleted_at IS NULL;
```

#### JSON Structures

**reminders_sent**:
```json
{
  "reminders": [
    {
      "type": "60_DAY",
      "sentAt": "2024-12-15T09:00:00Z"
    },
    {
      "type": "30_DAY",
      "sentAt": "2025-01-14T09:00:00Z"
    },
    {
      "type": "7_DAY",
      "sentAt": "2025-02-07T09:00:00Z"
    }
  ]
}
```

#### Business Rules
- VAL-VP-DOC-001: File size limited to 50MB per file
- VAL-VP-DOC-002: Allowed file types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
- VAL-VP-DOC-003: All files must pass virus scan before storage
- VAL-VP-DOC-004: Infected files rejected immediately
- VAL-VP-DOC-005: Expiry reminders sent at 60, 30, and 7 days before expiry
- VAL-VP-DOC-006: Documents auto-marked EXPIRED on expiry_date
- VAL-VP-DOC-007: Documents auto-marked EXPIRING_SOON at 30 days before expiry
- VAL-VP-DOC-008: Required documents: BUSINESS_LICENSE, TAX_CERTIFICATE, INSURANCE_GENERAL_LIABILITY
- VAL-VP-DOC-009: Vendors with expired critical documents cannot submit new prices/bids
- VAL-VP-DOC-010: Document versioning: superseded versions preserved with current_version = FALSE

---

### 3.5 tb_vendor_notification

**Purpose**: In-portal notifications for vendor users

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 3-4 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique notification ID |
| user_id | UUID | NOT NULL, FK → tb_vendor_portal_user(id) ON DELETE CASCADE | Target user |
| vendor_id | UUID | NOT NULL | Associated vendor ID |
| type | ENUM | NOT NULL | Notification type (see enum below) |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| action_url | VARCHAR(500) | NULL | Link to related resource |
| action_label | VARCHAR(100) | NULL | Action button label |
| priority | ENUM | DEFAULT 'NORMAL' | Notification priority (see enum below) |
| category | VARCHAR(100) | NULL | RFQ, Template, PO, Invoice, etc. |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMPTZ | NULL | Read timestamp |
| is_dismissed | BOOLEAN | DEFAULT FALSE | Dismissed status |
| dismissed_at | TIMESTAMPTZ | NULL | Dismissed timestamp |
| related_resource_type | VARCHAR(100) | NULL | Resource type |
| related_resource_id | UUID | NULL | Resource ID |
| email_sent | BOOLEAN | DEFAULT FALSE | Email sent flag |
| email_sent_at | TIMESTAMPTZ | NULL | Email sent timestamp |
| sms_sent | BOOLEAN | DEFAULT FALSE | SMS sent flag |
| sms_sent_at | TIMESTAMPTZ | NULL | SMS sent timestamp |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| expires_at | TIMESTAMPTZ | NULL | Auto-delete after this date |

#### Enums

**enum_notification_type**:
- `INFO` - Informational
- `SUCCESS` - Success message
- `WARNING` - Warning
- `ERROR` - Error notification
- `URGENT` - Urgent notification
- `REMINDER` - Reminder notification

**enum_notification_priority**:
- `LOW` - Low priority
- `NORMAL` - Normal priority
- `HIGH` - High priority
- `URGENT` - Urgent priority

#### Indexes

```sql
CREATE INDEX idx_vendor_notification_user_read
  ON tb_vendor_notification(user_id, is_read);

CREATE INDEX idx_vendor_notification_vendor_type
  ON tb_vendor_notification(vendor_id, type);

CREATE INDEX idx_vendor_notification_created
  ON tb_vendor_notification(created_at);

CREATE INDEX idx_vendor_notification_expiry
  ON tb_vendor_notification(expires_at);
```

#### Business Rules
- VAL-VP-NOTIF-001: Critical notifications (PO issued, payment received) cannot be disabled
- VAL-VP-NOTIF-002: Notifications auto-deleted after expires_at date
- VAL-VP-NOTIF-003: Default notification expiry: 90 days
- VAL-VP-NOTIF-004: Email/SMS sent based on user notification_preferences
- VAL-VP-NOTIF-005: Unread count displayed in portal header
- VAL-VP-NOTIF-006: action_url must be relative path within portal

---

### 3.6 tb_vendor_message

**Purpose**: Message center for vendor-buyer communication

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 3-4 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique message ID |
| vendor_id | UUID | NOT NULL | Associated vendor ID |
| sender_id | UUID | NULL, FK → tb_vendor_portal_user(id) | Sender user ID (if vendor) |
| sender_type | ENUM | DEFAULT 'VENDOR' | Sender type (see enum below) |
| sender_name | VARCHAR(255) | NOT NULL | Sender display name |
| recipient_type | ENUM | NOT NULL | Recipient type (see enum below) |
| recipient_id | UUID | NULL | Recipient user ID |
| subject | VARCHAR(500) | NOT NULL | Message subject |
| body | TEXT | NOT NULL | Message body |
| message_type | ENUM | DEFAULT 'GENERAL' | Message classification (see enum below) |
| parent_message_id | UUID | NULL, FK → tb_vendor_message(id) | Parent message for replies |
| thread_id | UUID | NOT NULL | Thread identifier |
| is_thread_starter | BOOLEAN | DEFAULT FALSE | First message in thread |
| attachments | JSON | NULL | File attachments array |
| status | ENUM | DEFAULT 'SENT' | Message status (see enum below) |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMPTZ | NULL | Read timestamp |
| replied_at | TIMESTAMPTZ | NULL | Reply timestamp |
| related_resource_type | VARCHAR(100) | NULL | PO, Invoice, RFQ, etc. |
| related_resource_id | UUID | NULL | Related resource ID |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Update timestamp |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete timestamp |

#### Enums

**enum_message_participant_type**:
- `VENDOR` - Vendor user
- `BUYER` - Procurement staff
- `SYSTEM` - System-generated message

**enum_message_type**:
- `GENERAL` - General inquiry
- `INQUIRY` - Question or inquiry
- `ISSUE` - Problem report
- `CLARIFICATION` - Clarification request
- `CONFIRMATION` - Confirmation message
- `URGENT` - Urgent message

**enum_message_status**:
- `DRAFT` - Draft message
- `SENT` - Sent message
- `DELIVERED` - Delivered to recipient
- `READ` - Read by recipient
- `REPLIED` - Reply received
- `ARCHIVED` - Archived message

#### Indexes

```sql
CREATE INDEX idx_vendor_message_vendor_thread
  ON tb_vendor_message(vendor_id, thread_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_message_sender_read
  ON tb_vendor_message(sender_id, is_read) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_message_thread_created
  ON tb_vendor_message(thread_id, created_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_message_related_resource
  ON tb_vendor_message(related_resource_type, related_resource_id)
  WHERE deleted_at IS NULL;
```

#### JSON Structures

**attachments**:
```json
{
  "attachments": [
    {
      "fileName": "invoice-12345.pdf",
      "fileSize": 154678,
      "mimeType": "application/pdf",
      "storageKey": "vendors/messages/msg-123/invoice.pdf",
      "uploadedAt": "2025-01-15T14:30:00Z"
    }
  ]
}
```

#### Business Rules
- VAL-VP-MSG-001: Messages associated with specific PO/Invoice/RFQ for context
- VAL-VP-MSG-002: thread_id groups related messages
- VAL-VP-MSG-003: Only sender and recipient can view messages
- VAL-VP-MSG-004: Attachments limited to 10MB per message
- VAL-VP-MSG-005: Messages cannot be edited after sending
- VAL-VP-MSG-006: Email notifications sent for new messages
- VAL-VP-MSG-007: Read receipts tracked for accountability

---

### 3.7 tb_vendor_audit_log

**Purpose**: Comprehensive audit trail for all vendor portal activities

**Implementation Priority**: ✅ CRITICAL (Phase 1)
**Estimated Effort**: 3-4 hours

#### Field Definitions

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique audit log ID |
| vendor_id | UUID | NOT NULL | Associated vendor ID |
| user_id | UUID | NULL, FK → tb_vendor_portal_user(id) | Acting user (NULL for system) |
| action | VARCHAR(100) | NOT NULL | Action performed |
| action_category | ENUM | NOT NULL | Action category (see enum below) |
| resource | VARCHAR(100) | NULL | Resource type |
| resource_id | UUID | NULL | Resource ID |
| ip_address | VARCHAR(45) | NOT NULL | Request IP address |
| user_agent | TEXT | NOT NULL | Browser user agent |
| method | VARCHAR(10) | NULL | HTTP method |
| endpoint | VARCHAR(500) | NULL | API endpoint |
| request_id | VARCHAR(100) | NULL | Trace/request ID |
| old_values | JSON | NULL | Previous state |
| new_values | JSON | NULL | New state |
| changed_fields | JSON | NULL | Array of changed field names |
| status | ENUM | NOT NULL | Action result (see enum below) |
| error_message | TEXT | NULL | Error message if failed |
| response_time | INTEGER | NULL | Response time in milliseconds |
| timestamp | TIMESTAMPTZ | DEFAULT now() | Action timestamp |
| session_id | VARCHAR(255) | NULL | Session identifier |

#### Enums

**enum_audit_category**:
- `AUTHENTICATION` - Login, logout, password changes
- `AUTHORIZATION` - Permission checks, access attempts
- `PROFILE_MANAGEMENT` - Profile updates
- `DOCUMENT_MANAGEMENT` - Document uploads, approvals
- `PRICING_SUBMISSION` - Price list submissions
- `RFQ_BIDDING` - RFQ bid submissions
- `PO_MANAGEMENT` - PO acknowledgments, delivery updates
- `INVOICE_SUBMISSION` - Invoice submissions
- `COMMUNICATION` - Messages sent/received
- `SETTINGS` - Settings changes
- `USER_MANAGEMENT` - User creation, role changes
- `SECURITY_EVENT` - Security-related events

**enum_audit_status**:
- `SUCCESS` - Action completed successfully
- `FAILURE` - Action failed
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized
- `ERROR` - System error

#### Indexes

```sql
CREATE INDEX idx_vendor_audit_vendor_time
  ON tb_vendor_audit_log(vendor_id, timestamp);

CREATE INDEX idx_vendor_audit_user_time
  ON tb_vendor_audit_log(user_id, timestamp);

CREATE INDEX idx_vendor_audit_action_time
  ON tb_vendor_audit_log(action, timestamp);

CREATE INDEX idx_vendor_audit_category
  ON tb_vendor_audit_log(action_category);

CREATE INDEX idx_vendor_audit_resource
  ON tb_vendor_audit_log(resource, resource_id);
```

#### JSON Structures

**old_values / new_values**:
```json
{
  "phone": "+1 (555) 123-4567",
  "website": "https://old-website.com",
  "businessCategories": ["Food & Beverage"]
}
```

**changed_fields**:
```json
{
  "fields": ["phone", "website", "businessCategories"]
}
```

#### Business Rules
- VAL-VP-AUDIT-001: All vendor actions logged automatically
- VAL-VP-AUDIT-002: Logs immutable (no updates or deletes)
- VAL-VP-AUDIT-003: Logs retained for 7 years minimum
- VAL-VP-AUDIT-004: Failed login attempts logged for security monitoring
- VAL-VP-AUDIT-005: Critical actions (profile changes, document uploads) include old/new values
- VAL-VP-AUDIT-006: Suspicious activity patterns trigger alerts
- VAL-VP-AUDIT-007: IP address and user agent logged for all actions

---

## 4. Integration Points

### 4.1 Main ERP Integration

**Data Sharing**:
- Vendor portal queries existing tb_vendor, tb_product, tb_pricelist_template, tb_request_for_pricing, tb_purchase_order, tb_invoice tables
- Data isolation enforced via vendor_id filtering in all queries
- No data duplication between portal and main ERP

**Webhook Updates** (from Main ERP → Portal):
- PO issued → Create notification in tb_vendor_notification
- Invoice status change → Create notification
- Payment received → Create notification
- RFQ assigned → Create notification

### 4.2 External Services

**File Storage** (AWS S3 / Azure Blob):
- Document uploads stored in cloud storage
- Pre-signed URLs generated for downloads (15-minute expiry)
- Storage path: `vendors/{vendor_id}/documents/{timestamp}-{random}.{ext}`

**Email Service** (SendGrid / AWS SES):
- Registration confirmations
- Email verification
- Document expiry reminders
- Notification emails (based on user preferences)
- Password reset emails
- 2FA setup instructions

**SMS Service** (Twilio):
- 2FA verification codes
- Critical notifications (if enabled in preferences)

**Virus Scanning** (ClamAV / AWS S3 Lambda):
- All uploaded files scanned before storage
- Infected files rejected immediately
- Scan results stored in tb_vendor_document

---

## 5. Validation Rules

### Authentication & Security
- **VAL-VP-AUTH-001**: Password minimum 12 characters, mixed case, numbers, special characters
- **VAL-VP-AUTH-002**: Account locked for 15 minutes after 5 failed login attempts
- **VAL-VP-AUTH-003**: Password expires after 90 days
- **VAL-VP-AUTH-004**: Cannot reuse last 5 passwords
- **VAL-VP-AUTH-005**: Session expires after 30 minutes of inactivity
- **VAL-VP-AUTH-006**: Email verification required before portal access
- **VAL-VP-AUTH-007**: 2FA recommended, required for VENDOR_ADMIN role

### Registration
- **VAL-VP-REG-001**: Tax ID must be unique across all vendors
- **VAL-VP-REG-002**: Email must be unique across all registrations
- **VAL-VP-REG-003**: Required documents: Business License, Tax Certificate, Insurance Certificate
- **VAL-VP-REG-004**: Terms and conditions must be accepted
- **VAL-VP-REG-005**: Electronic signature required (name, title, date)
- **VAL-VP-REG-006**: Bank account data encrypted before storage
- **VAL-VP-REG-007**: Duplicate detection by tax_id and legal_name

### Document Management
- **VAL-VP-DOC-001**: File size maximum 50MB
- **VAL-VP-DOC-002**: Allowed file types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX
- **VAL-VP-DOC-003**: All files must pass virus scan
- **VAL-VP-DOC-004**: Expiry date required for time-limited documents
- **VAL-VP-DOC-005**: Expiry reminders at 60, 30, 7 days before expiry
- **VAL-VP-DOC-006**: Critical documents: BUSINESS_LICENSE, TAX_CERTIFICATE, INSURANCE_GENERAL_LIABILITY
- **VAL-VP-DOC-007**: Vendors with expired critical documents cannot submit prices/bids

### User Management
- **VAL-VP-USER-001**: Only VENDOR_ADMIN can create/manage users
- **VAL-VP-USER-002**: Minimum one VENDOR_ADMIN per vendor
- **VAL-VP-USER-003**: Email must be unique across portal users
- **VAL-VP-USER-004**: User role cannot be changed to higher privilege without approval

### Notifications
- **VAL-VP-NOTIF-001**: Critical notifications cannot be disabled
- **VAL-VP-NOTIF-002**: Notifications expire after 90 days (auto-deleted)
- **VAL-VP-NOTIF-003**: Email/SMS sent based on user preferences

### Messages
- **VAL-VP-MSG-001**: Message attachments limited to 10MB
- **VAL-VP-MSG-002**: Messages cannot be edited after sending
- **VAL-VP-MSG-003**: Only sender and recipient can view messages
- **VAL-VP-MSG-004**: Messages threaded by thread_id

### Audit
- **VAL-VP-AUDIT-001**: All vendor actions logged automatically
- **VAL-VP-AUDIT-002**: Audit logs immutable (no updates/deletes)
- **VAL-VP-AUDIT-003**: Audit logs retained for 7 years minimum

---

## 6. Performance Considerations

### Database Indexing
- User lookup by email (login): Indexed on email
- Session validation: Indexed on session_token
- Document expiry tracking: Indexed on expiry_date
- Notification retrieval: Indexed on user_id + is_read
- Message threading: Indexed on thread_id + created_at
- Audit log queries: Indexed on vendor_id + timestamp

### Caching Strategy
- **Server-side**: unstable_cache for dashboard summaries (60-second revalidation)
- **Client-side**: React Query with 1-minute staleTime
- **Session data**: Redis cache for active sessions

### Query Optimization
- Use Prisma select to fetch only needed fields
- Batch related queries with $transaction
- Pagination for lists (10-50 items per page)
- Eager loading with include for related data

### File Upload Optimization
- Client-side validation before upload
- Chunked uploads for large files
- Progress tracking for user feedback
- Virus scanning in background (async)

---

## 7. Security Measures

### Data Protection
- **Encryption at Rest**: Bank account numbers, routing numbers, 2FA secrets encrypted with AES-256
- **Encryption in Transit**: HTTPS/TLS 1.3 for all connections
- **Password Hashing**: Bcrypt with cost factor 12
- **Data Masking**: Bank accounts, tax IDs partially masked in UI

### Access Control
- **Row-Level Security**: All queries filtered by vendor_id
- **Role-Based Permissions**: VENDOR_ADMIN, VENDOR_USER, VENDOR_VIEWER roles
- **Session Management**: JWT tokens, 30-minute expiry, refresh tokens
- **2FA**: TOTP-based, backup codes encrypted

### Rate Limiting
- API requests: 100 per minute per vendor
- Login attempts: 5 per 15 minutes (then lockout)
- File uploads: 50 per hour
- Message sending: 20 per hour

### Audit & Monitoring
- All actions logged to tb_vendor_audit_log
- Failed login attempts monitored
- Suspicious activity patterns flagged
- Security events trigger alerts

---

## 8. Implementation Roadmap

### Phase 1: Core Portal (MVP)
**Timeline**: 6-8 weeks
**Effort**: 24-28 hours total

**Week 1-2: Foundation**
- Implement 7 portal-specific tables in schema.prisma
- Set up NextAuth.js authentication
- Implement session management
- Create base portal layout and navigation

**Week 3-4: Registration & Profile**
- Vendor registration wizard (4 steps)
- Document upload functionality
- Profile viewing and editing
- Email verification workflow

**Week 5-6: Core Features**
- RFQ viewing and bid submission (reuse existing tables)
- Price template viewing and submission (reuse existing tables)
- PO viewing and acknowledgment (reuse existing tables)
- Invoice submission (reuse existing tables)

**Week 7-8: Communication & Polish**
- Notification system
- Message center
- Dashboard summary
- Testing and bug fixes

### Phase 2: Enhanced Features
**Timeline**: 4-6 weeks

- 2FA implementation
- Document expiry automation
- Performance metrics dashboard
- Advanced reporting
- Bulk price import (Excel)

### Phase 3: Optimization
**Timeline**: 2-3 weeks

- Performance optimization
- Security hardening
- Automated testing (E2E)
- Production deployment

---

## 9. Testing Requirements

### Unit Tests
- Authentication service (login, 2FA, password reset)
- Document upload service (validation, virus scan, storage)
- Notification service (creation, delivery)
- Audit logging service (creation, querying)

### Integration Tests
- Registration flow (end-to-end)
- Document upload and approval workflow
- Price submission workflow
- Message sending and threading

### E2E Tests (Playwright)
- Complete registration journey
- Login and navigation
- Document upload and management
- RFQ response submission
- Invoice submission workflow

### Security Tests
- Authentication bypass attempts
- Authorization checks (cross-vendor data access)
- SQL injection prevention
- XSS prevention
- CSRF protection
- File upload vulnerabilities

---

## 10. Migration Notes

### Database Migration

**Step 1: Create Tables**
```sql
-- Create enums first
CREATE TYPE enum_vendor_user_role AS ENUM ('VENDOR_ADMIN', 'VENDOR_USER', 'VENDOR_VIEWER');
CREATE TYPE enum_vendor_user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_VERIFICATION');
CREATE TYPE enum_registration_status AS ENUM ('PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DUPLICATE', 'INCOMPLETE');
CREATE TYPE enum_vendor_document_type AS ENUM ('BUSINESS_LICENSE', 'TAX_CERTIFICATE', ...);
CREATE TYPE enum_vendor_document_status AS ENUM ('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXPIRING_SOON', 'SUPERSEDED');
CREATE TYPE enum_virus_scan_status AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'SCAN_FAILED');
CREATE TYPE enum_notification_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'URGENT', 'REMINDER');
CREATE TYPE enum_notification_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE enum_message_participant_type AS ENUM ('VENDOR', 'BUYER', 'SYSTEM');
CREATE TYPE enum_message_type AS ENUM ('GENERAL', 'INQUIRY', 'ISSUE', 'CLARIFICATION', 'CONFIRMATION', 'URGENT');
CREATE TYPE enum_message_status AS ENUM ('DRAFT', 'SENT', 'DELIVERED', 'READ', 'REPLIED', 'ARCHIVED');
CREATE TYPE enum_audit_category AS ENUM ('AUTHENTICATION', 'AUTHORIZATION', 'PROFILE_MANAGEMENT', ...);
CREATE TYPE enum_audit_status AS ENUM ('SUCCESS', 'FAILURE', 'UNAUTHORIZED', 'FORBIDDEN', 'ERROR');

-- Create tables in dependency order
-- 1. tb_vendor_portal_user
-- 2. tb_vendor_portal_session
-- 3. tb_vendor_registration
-- 4. tb_vendor_document
-- 5. tb_vendor_notification
-- 6. tb_vendor_message
-- 7. tb_vendor_audit_log
```

**Step 2: Add Indexes**
```sql
-- Apply all indexes as specified in each table section
```

**Step 3: Data Migration**
- No existing data to migrate (new portal)
- Seed data: None required

### Application Deployment

**Environment Setup**:
1. Configure AWS S3 bucket for document storage
2. Set up SendGrid/SES for email
3. Set up Twilio for SMS (optional)
4. Configure Redis for session storage
5. Set up ClamAV for virus scanning

**NextAuth Configuration**:
1. Generate NEXTAUTH_SECRET (min 32 characters)
2. Configure credentials provider
3. Set session strategy to JWT
4. Configure callbacks for custom user data

**Deployment**:
1. Deploy to separate subdomain (vendor.organization.com)
2. Configure DNS and SSL certificates
3. Set environment variables
4. Run database migrations
5. Deploy application
6. Smoke test critical paths

---

## Document History

| Version | Date       | Author      | Changes                              |
|---------|------------|-------------|--------------------------------------|
| 1.0     | 2025-11-15 | Claude Code | Initial DD document creation         |

---

## Related Documents
- Vendor Entry Portal - Business Requirements (BR-vendor-portal.md)
- Vendor Entry Portal - Use Cases (UC-vendor-portal.md)
- Vendor Entry Portal - Technical Specification (TS-vendor-portal.md)
- Vendor Entry Portal - Flow Diagrams (FD-vendor-portal.md)
- Vendor Entry Portal - Validations (VAL-vendor-portal.md)
- Vendor Management - Module Overview

---

**End of Data Definition Document**
