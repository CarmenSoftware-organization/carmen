# Vendor Directory - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Executive Summary

The Vendor Directory module serves as the central repository for managing all vendor relationships, contact information, certifications, contracts, and performance metrics. It provides comprehensive vendor lifecycle management from onboarding through relationship maintenance and offboarding.

### 1.1 Purpose
- Centralize vendor information management
- Streamline vendor onboarding and approval processes
- Track vendor certifications, insurance, and compliance
- Manage vendor contacts and communication
- Monitor vendor performance and relationships
- Support procurement decision-making with vendor data

### 1.2 Scope
**In Scope**:
- Vendor profile management (creation, editing, archiving)
- Multi-level vendor categorization and classification
- Contact management (multiple contacts per vendor)
- Document management (contracts, certifications, insurance)
- Vendor approval workflows
- Performance tracking and ratings
- Vendor segmentation (preferred, approved, blocked)
- Location-based vendor assignments
- Payment terms and currency management
- Integration with procurement and finance modules

**Out of Scope**:
- Vendor portal functionality (covered in separate module)
- Price list management (covered in Price Lists module)
- RFQ campaigns (covered in Requests for Pricing module)
- Vendor payment processing (covered in Finance module)
- Vendor performance analytics (covered in Reporting & Analytics)

---

## 2. Functional Requirements

### FR-VD-001: Vendor Profile Management
**Priority**: Critical
**Description**: System shall provide comprehensive vendor profile creation and management capabilities.

**Requirements**:
- Create new vendor profiles with required and optional fields
- Edit existing vendor information
- Archive/deactivate vendors (soft delete)
- Restore archived vendors
- Bulk import vendors from CSV/Excel
- Export vendor list to CSV/Excel
- Duplicate detection during creation
- Version history tracking for profile changes
- Audit trail for all modifications

**Business Rules**:
- Vendor code must be unique across the system
- Company name must be unique within active vendors
- At least one contact person is required
- Payment terms must be defined before vendor can be used in POs
- Tax registration number format validation based on country

**Acceptance Criteria**:
- User can create vendor with all required fields in <2 minutes
- System prevents duplicate vendor codes
- All changes are logged with user and timestamp
- Archived vendors do not appear in active vendor searches
- Bulk import handles 1000+ vendors successfully

---

### FR-VD-002: Vendor Categorization
**Priority**: High
**Description**: System shall support multi-dimensional vendor categorization and classification.

**Requirements**:
- Primary vendor type classification:
  - Supplier (Food & Beverage, Equipment, Supplies)
  - Service Provider (Maintenance, Professional Services)
  - Contractor (Construction, Consulting)
  - Distributor
  - Manufacturer
- Secondary category tags (multiple per vendor)
- Industry classification
- Product/service specialization tags
- Preferred vendor designation
- Strategic partner classification
- Spend tier classification (Tier 1, 2, 3 based on annual spend)

**Business Rules**:
- Each vendor must have exactly one primary type
- Vendors can have 0-20 secondary category tags
- Preferred vendor status requires approval
- Strategic partner designation requires executive approval
- Spend tier calculated automatically based on 12-month rolling spend

**Acceptance Criteria**:
- User can filter vendors by any category dimension
- Category changes require reason/justification
- System tracks category change history
- Preferred vendor badge displayed prominently

---

### FR-VD-003: Contact Management
**Priority**: Critical
**Description**: System shall manage multiple contacts per vendor with roles and communication preferences.

**Requirements**:
- Add unlimited contacts per vendor
- Contact roles: Primary, Sales, Accounts Payable, Technical Support, Management, Other
- Contact details: Name, title, email (multiple), phone (multiple), mobile
- Communication preferences: Email, Phone, SMS, Portal
- Preferred contact designation (one per role)
- Contact availability schedule
- Language preference
- Contact status (Active, Inactive, Left Company)
- Contact notes and interaction history

**Business Rules**:
- At least one primary contact required
- Primary contact must have valid email
- Email addresses validated for format
- Phone numbers validated for format based on country code
- One preferred contact per role type
- Cannot delete last primary contact

**Acceptance Criteria**:
- User can add/edit contacts in <1 minute
- System sends test email to validate email addresses
- Contact list sortable by role, name, status
- Quick actions: Call, Email, Message from contact card
- Contact changes logged in audit trail

---

### FR-VD-004: Document Management
**Priority**: High
**Description**: System shall manage vendor-related documents with version control and expiration tracking.

**Requirements**:
- Document types:
  - Contracts (Service agreements, Supply agreements)
  - Certifications (ISO, HACCP, Organic, Halal, etc.)
  - Insurance (Liability, Product liability, Workers comp)
  - Tax documents (W-9, Tax registration)
  - Bank details (for payments)
  - Quality certificates
  - Other attachments
- Document metadata: Type, number, issue date, expiry date, status
- Version control for document updates
- Expiration alerts (30, 60, 90 days before expiry)
- Document approval workflow for critical documents
- Access control by document type
- Bulk document upload
- Document linking to purchase orders

**Business Rules**:
- Contracts require approval before vendor can receive POs >$10,000
- Insurance certificates must be current (not expired)
- Certifications with expiry dates must be renewed before expiry
- Expired documents flagged with red indicator
- Documents <30 days from expiry flagged with amber warning
- Maximum file size: 50MB per document
- Allowed formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG

**Acceptance Criteria**:
- User can upload documents via drag-and-drop
- System displays document status indicators
- Expiration alerts sent to assigned users
- Document viewer supports PDF preview
- Version history shows all document revisions

---

### FR-VD-005: Vendor Approval Workflow
**Priority**: Critical
**Description**: System shall implement configurable approval workflows for vendor onboarding and changes.

**Requirements**:
- Multi-stage approval workflow
- Approval stages:
  1. Compliance review (documents, certifications)
  2. Financial review (credit check, payment terms)
  3. Quality review (standards, certifications)
  4. Management approval (final authorization)
- Parallel and sequential approval paths
- Conditional approvals based on vendor type, spend tier
- Email notifications at each stage
- Approval delegation during absence
- Approval history and audit trail
- Rejection with required reasons
- Re-submission after rejection
- Approval SLA tracking

**Business Rules**:
- All new vendors require approval before activation
- Major changes (payment terms, bank details) require re-approval
- Approval required based on:
  - New vendor: All stages
  - Preferred vendor designation: Management approval
  - Contract value >$100,000: Executive approval
  - International vendor: Additional compliance review
- Approvers cannot approve their own submissions
- Minimum 2 approvers for critical vendors

**Acceptance Criteria**:
- Approval request sent within 5 minutes of submission
- Approvers receive email with inline approval option
- Average approval cycle <24 hours for standard vendors
- Rejection includes clear reason and improvement suggestions
- Dashboard shows pending approvals count

---

### FR-VD-006: Vendor Rating and Performance Tracking
**Priority**: High
**Description**: System shall track vendor performance metrics and calculate overall ratings.

**Requirements**:
- Performance metrics:
  - Quality score (defect rate, reject rate)
  - Delivery performance (on-time delivery %)
  - Service level (responsiveness, issue resolution)
  - Pricing competitiveness
  - Compliance adherence
  - Innovation and value-add
- Weighted scoring model (configurable weights)
- Overall vendor rating (5-star or 1-10 scale)
- Rating history and trends
- Performance reviews (quarterly, annual)
- Scorecard generation
- Performance alerts for declining scores
- Comparison against benchmarks

**Business Rules**:
- Ratings updated monthly based on transaction data
- Minimum 5 transactions required for meaningful rating
- Quality score based on GRN inspection results
- Delivery performance based on PO delivery dates vs. actual
- Service level based on issue tickets and resolution time
- Rating changes >1 point trigger notification
- Vendors below threshold (rating <3) flagged for review

**Acceptance Criteria**:
- Performance dashboard shows current rating and trends
- Rating calculation transparent and auditable
- Historical ratings preserved for comparison
- Automated rating calculation runs monthly
- Manual adjustments allowed with justification

---

### FR-VD-007: Vendor Segmentation
**Priority**: Medium
**Description**: System shall support vendor segmentation for strategic management.

**Requirements**:
- Vendor status types:
  - **Approved**: Standard active vendors
  - **Preferred**: High-performing, strategic vendors
  - **Provisional**: New vendors on probation (first 90 days)
  - **Blocked**: Temporarily suspended
  - **Blacklisted**: Permanently banned
  - **Inactive**: Archived, no longer used
- Status change workflow with approval
- Status change reasons (required for Blocked/Blacklisted)
- Status change effective date
- Automatic provisional → approved transition after 90 days with good performance
- Block/blacklist impact on existing POs
- Status badges and indicators

**Business Rules**:
- Preferred vendors get priority in vendor selection
- Provisional vendors limited to PO value <$5,000
- Blocked vendors cannot receive new POs (existing POs continue)
- Blacklisted vendors completely excluded from system
- Status change from Preferred requires justification
- Blacklisting requires executive approval

**Acceptance Criteria**:
- Status badges prominently displayed
- Status change triggers email to stakeholders
- System prevents PO creation to blocked/blacklisted vendors
- Status history tracked with reasons
- Filters available by vendor status

---

### FR-VD-008: Location and Assignment
**Priority**: Medium
**Description**: System shall manage vendor assignments to locations and departments.

**Requirements**:
- Assign vendors to one or multiple locations
- Assign vendors to specific departments
- Location-specific pricing (if different)
- Location-specific contacts
- Location-specific delivery terms
- Location availability schedule
- Primary location designation
- Location restrictions (vendor only serves specific locations)

**Business Rules**:
- Vendors can serve all locations (default) or specific locations only
- Location assignments required for location-specific pricing
- Location restrictions enforced during PO creation
- At least one location must be assigned if restrictions enabled

**Acceptance Criteria**:
- User can select multiple locations during vendor creation
- Location-restricted vendors only appear in PO for assigned locations
- Location-specific details (contact, pricing) override global settings
- Location matrix view shows vendor coverage

---

### FR-VD-009: Payment Terms and Currency
**Priority**: High
**Description**: System shall manage vendor payment terms, currency, and banking details.

**Requirements**:
- Payment terms:
  - Net 7, 15, 30, 45, 60, 90 days
  - Custom payment terms
  - Early payment discounts (e.g., 2/10 Net 30)
  - Prepayment requirements
  - Credit limit
- Multi-currency support
- Default currency per vendor
- Banking details:
  - Bank name and branch
  - Account number
  - IBAN / SWIFT code
  - Routing number
  - Payment method preferences (Wire, Check, ACH, Card)
- Tax settings:
  - Tax registration number
  - Tax exemption status
  - Tax rates

**Business Rules**:
- Payment terms default from vendor profile to PO
- Currency must match vendor's default currency or be explicitly changed
- Banking details required for electronic payments
- Tax registration number validated based on country
- Credit limit enforced during PO approval

**Acceptance Criteria**:
- Payment terms clearly displayed during PO creation
- Multi-currency transactions handled correctly
- Banking details encrypted and access-controlled
- Early payment discount calculations automatic

---

### FR-VD-010: Search and Filtering
**Priority**: High
**Description**: System shall provide powerful search and filtering capabilities.

**Requirements**:
- Quick search by:
  - Vendor code
  - Company name
  - Contact name
  - Tax ID
  - Email
  - Phone
- Advanced filters:
  - Vendor type and categories
  - Status (Approved, Preferred, Blocked, etc.)
  - Location
  - Rating (range)
  - Spend tier
  - Certification type
  - Contract expiration
  - Document expiration
  - Creation date range
  - Last transaction date
- Saved filter presets
- Sort by: Name, Code, Rating, Last Order Date, Total Spend
- Export filtered results

**Business Rules**:
- Search results return max 100 vendors per page
- Search is case-insensitive
- Partial matches supported
- Results sorted by relevance score by default

**Acceptance Criteria**:
- Search results appear in <1 second for database <10,000 vendors
- Filters can be combined (AND logic)
- Saved filters accessible from dropdown
- Search highlights matching terms

---

### FR-VD-011: Integration with Other Modules
**Priority**: Critical
**Description**: System shall integrate seamlessly with procurement and finance modules.

**Requirements**:
- **Purchase Request**: Vendor selection from directory
- **Purchase Order**: Vendor details auto-populate
- **GRN**: Quality ratings fed back to vendor performance
- **Invoices**: Payment terms enforced
- **Price Lists**: Link vendor to price lists
- **RFQ**: Vendor contact details for RFQ distribution
- **Finance**: Vendor as payable entity
- **Reporting**: Vendor spend analysis

**Business Rules**:
- Vendor must be Approved or Preferred status to use in POs
- Vendor blocking prevents new PO creation
- Vendor archiving requires no active POs or outstanding invoices
- Vendor data changes reflect immediately in all modules

**Acceptance Criteria**:
- Vendor selection dropdown in PO shows only eligible vendors
- Vendor details auto-fill in PO (address, payment terms, currency)
- Performance ratings update after each GRN
- Spend data aggregates correctly in reporting

---

## 3. Non-Functional Requirements

### NFR-VD-001: Performance
- Vendor list page loads in <2 seconds for 10,000 vendors
- Search returns results in <1 second
- Vendor profile loads in <1 second
- Bulk operations (import/export) handle 5,000+ records
- Concurrent user support: 100+ simultaneous users

### NFR-VD-002: Security
- Role-based access control (RBAC)
- Sensitive data encrypted at rest (banking details, tax IDs)
- Audit log for all vendor changes
- Banking details masked (show last 4 digits only)
- Document access controlled by role
- SSO integration support

### NFR-VD-003: Reliability
- System uptime: 99.9%
- Data backup: Daily automated backups
- Disaster recovery: <4 hour RTO, <1 hour RPO
- No data loss on system failures

### NFR-VD-004: Usability
- Intuitive UI following established design patterns
- Mobile-responsive design
- Accessibility: WCAG 2.1 AA compliance
- Multi-language support (English, Spanish, French default)
- Context-sensitive help available
- Keyboard shortcuts for power users

### NFR-VD-005: Scalability
- Support 50,000+ vendor records
- Support 500,000+ contact records
- Support 1,000,000+ document records
- Horizontal scaling capability

### NFR-VD-006: Maintainability
- Modular architecture
- RESTful API for integrations
- Comprehensive logging
- Monitoring and alerting
- Automated testing coverage >80%

---

## 4. Data Requirements

### 4.1 Core Data Entities

**Vendor**:
- Vendor ID (primary key)
- Vendor Code (unique, user-defined)
- Company Name
- Legal Name
- DBA (Doing Business As)
- Vendor Type
- Category Tags
- Status
- Rating
- Website
- Description/Notes

**Vendor Address**:
- Address Type (Billing, Shipping, Remittance)
- Address Line 1, 2
- City, State, Postal Code, Country
- Is Primary

**Vendor Contact**:
- Contact ID
- Name, Title
- Role
- Email (primary, secondary)
- Phone, Mobile
- Preferred Contact
- Status

**Vendor Document**:
- Document ID
- Document Type
- Document Number
- Issue Date
- Expiry Date
- File Path
- Version Number
- Status

**Vendor Payment Terms**:
- Payment Terms ID
- Terms Description
- Days Net
- Early Payment Discount %
- Early Payment Days
- Credit Limit

**Vendor Location Assignment**:
- Vendor ID
- Location ID
- Is Primary
- Delivery Days
- Minimum Order Value

### 4.2 Data Volumes (Estimated)
- Vendors: 5,000 - 50,000 records
- Contacts: 10,000 - 100,000 records
- Documents: 50,000 - 500,000 records
- Addresses: 15,000 - 150,000 records

### 4.3 Data Retention
- Active vendors: Indefinite
- Archived vendors: 7 years
- Audit logs: 10 years
- Documents: Per legal requirements (typically 7-10 years)

---

## 5. Business Rules Summary

### BR-VD-001: Vendor Code Uniqueness
All vendor codes must be unique across the system. System prevents creation of duplicate codes.

### BR-VD-002: Required Contact Information
Every vendor must have at least one primary contact with a valid email address.

### BR-VD-003: Approval Requirements
New vendors and significant changes require approval before use in transactions.

### BR-VD-004: Document Expiration
Vendors with expired critical documents (insurance, certifications) receive warnings, but are not blocked from transactions.

### BR-VD-005: Performance Rating Minimum
Vendors require minimum 5 transactions over 30 days to calculate meaningful performance ratings.

### BR-VD-006: Status-Based Restrictions
- **Provisional**: PO limit $5,000
- **Blocked**: No new POs, existing POs continue
- **Blacklisted**: Completely excluded, existing POs must be cancelled

### BR-VD-007: Preferred Vendor Criteria
Preferred vendor status requires:
- Rating ≥ 4.0/5.0
- Minimum 6 months relationship
- Minimum 20 completed orders
- No major issues in last 6 months
- Management approval

### BR-VD-008: Credit Limit Enforcement
Purchase orders exceeding vendor credit limit require additional approval.

### BR-VD-009: Multi-Currency Rules
Currency must be specified for each vendor. All POs default to vendor's currency unless explicitly changed.

### BR-VD-010: Document Retention
Expired documents are retained in system for historical reference but flagged as expired.

---

## 6. User Roles and Permissions

### 6.1 Vendor Manager
- Full access to vendor management
- Create, edit, archive vendors
- Manage contacts and documents
- Initiate approval workflows
- View performance metrics
- Configure vendor categories

### 6.2 Procurement Staff
- View vendor directory
- View contact information
- View documents (non-sensitive)
- Create vendor requests (subject to approval)
- View performance ratings

### 6.3 Finance Manager
- View vendor financial information
- Edit payment terms
- Edit banking details
- View credit limits
- Approve credit limit changes

### 6.4 Compliance Officer
- View all vendor documents
- Upload/approve certifications
- Monitor document expiration
- Approve/reject vendor applications
- Audit vendor compliance

### 6.5 Department Manager
- View vendors assigned to department
- View contact information
- Request new vendor additions
- View performance ratings

### 6.6 System Administrator
- Full system access
- Configure workflows
- Manage user permissions
- System configuration
- Bulk operations

---

## 7. Workflow Specifications

### 7.1 New Vendor Onboarding Workflow
1. **Initiation**: User creates vendor request
2. **Data Entry**: Complete vendor profile, contacts, documents
3. **Compliance Review**: Verify certifications, insurance, tax documents
4. **Financial Review**: Credit check, payment terms approval
5. **Quality Review**: Review quality certifications and standards
6. **Management Approval**: Final approval for activation
7. **Activation**: Vendor status set to "Approved" or "Provisional"
8. **Notification**: Vendor and requestor notified

### 7.2 Vendor Change Request Workflow
1. **Change Request**: User submits change request
2. **Impact Assessment**: System identifies impacted POs, contracts
3. **Approval Routing**: Based on change type (financial, contract, etc.)
4. **Approval/Rejection**: Approvers review and decide
5. **Implementation**: Changes applied upon approval
6. **Notification**: Stakeholders notified of changes

### 7.3 Vendor Block/Blacklist Workflow
1. **Issue Reported**: Quality issue, fraud, non-compliance reported
2. **Investigation**: Investigate issue and gather evidence
3. **Recommendation**: Recommend block (temporary) or blacklist (permanent)
4. **Management Review**: Review recommendation and evidence
5. **Decision**: Approve or reject recommendation
6. **Implementation**: Status changed, notifications sent
7. **Impact Management**: Handle existing POs and contracts

---

## 8. Integration Requirements

### 8.1 Internal Integrations
- **Procurement**: Vendor selection, PO creation
- **Finance**: Accounts payable, payment processing
- **Inventory**: Product-vendor relationships
- **Reporting**: Vendor spend analysis, performance reports

### 8.2 External Integrations
- **Credit Check Services**: Dun & Bradstreet, Experian
- **Tax Validation**: TIN verification services
- **Email/SMS**: Notification services
- **Document Storage**: Cloud storage (AWS S3, Azure Blob)
- **ERP Systems**: SAP, Oracle, QuickBooks

### 8.3 API Requirements
- RESTful API for vendor CRUD operations
- API for vendor search and filtering
- Webhook support for status changes
- Rate limiting: 1000 requests/hour per API key

---

## 9. Success Criteria

### 9.1 Business Metrics
- Vendor onboarding time reduced by 50%
- 100% vendor compliance with required documents
- 95%+ vendor contact information accuracy
- Average vendor rating >4.0/5.0
- <5% vendors blocked or blacklisted

### 9.2 System Metrics
- Page load time <2 seconds
- Search response time <1 second
- 99.9% system uptime
- Zero data loss incidents
- <10 support tickets per 1000 transactions

### 9.3 User Adoption
- 80%+ user satisfaction score
- 90%+ users complete onboarding training
- <5% duplicate vendor entries
- 95%+ vendors have current documents

---

## 10. Constraints and Assumptions

### 10.1 Constraints
- Must integrate with existing ERP system
- Must comply with data protection regulations (GDPR, CCPA)
- Must support multi-tenancy for enterprise clients
- Budget: $150,000 development + $25,000 annual maintenance
- Timeline: 6 months development + 2 months testing

### 10.2 Assumptions
- Users have basic computer literacy
- Stable internet connection available
- Existing vendor data can be migrated
- Vendors willing to provide required documents
- Integration APIs available from external systems

---

## 11. Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data migration failures | High | Medium | Comprehensive migration testing, rollback plan |
| User adoption resistance | Medium | Medium | Change management, training, user support |
| Integration complexity | High | High | Early integration testing, vendor collaboration |
| Performance issues at scale | High | Low | Load testing, horizontal scaling architecture |
| Document storage costs | Medium | Medium | Cost optimization, tiered storage strategy |
| Regulatory compliance | High | Low | Legal review, compliance audits |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial creation |

---

## Related Documents
- UC-vendor-directory.md - Use Cases
- TS-vendor-directory.md - Technical Specification
- DS-vendor-directory.md - Data Schema
- FD-vendor-directory.md - Flow Diagrams
- VAL-vendor-directory.md - Validations

---

**End of Business Requirements Document**
