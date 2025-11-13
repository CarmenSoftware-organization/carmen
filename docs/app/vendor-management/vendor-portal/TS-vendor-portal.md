# Vendor Entry Portal - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Vendor Entry Portal
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend**:
- **Framework**: Next.js 14 with App Router (separate application from main ERP)
- **Language**: TypeScript 5.8.2 (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**:
  - Zustand (global UI state)
  - React Query / TanStack Query (server state, caching)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with Lucide React icons
- **Date Handling**: date-fns
- **Charts**: Recharts (for performance metrics and trend visualizations)
- **Tables**: TanStack Table (for sortable, filterable lists)
- **File Upload**: React Dropzone (for document uploads)
- **PDF Generation**: jsPDF / react-pdf (for reports and summaries)

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers (API routes)
- **ORM**: Prisma Client (shared schema with main application)
- **Database**: PostgreSQL (shared database with main ERP)
- **Authentication**: NextAuth.js (vendor-specific configuration)
- **2FA**: otplib + qrcode (for authenticator apps)
- **Session Management**: NextAuth with JWT strategy
- **File Storage**: AWS S3 / Azure Blob Storage (for vendor documents)
- **Email**: SendGrid / AWS SES (for notifications and verification)
- **SMS**: Twilio (for 2FA and critical notifications)
- **Rate Limiting**: upstash/ratelimit (with Redis)
- **Virus Scanning**: ClamAV / AWS S3 Lambda trigger

**Infrastructure**:
- **Hosting**: Separate deployment from main ERP (Vercel / AWS / Azure)
- **Domain**: Separate subdomain (e.g., vendor.organization.com)
- **CDN**: Vercel Edge Network / CloudFront
- **Monitoring**: Sentry (errors), Vercel Analytics (performance)
- **Logging**: Winston / Pino (structured logging with vendor context)
- **Version Control**: Git (separate repository or monorepo)

### 1.2 Architecture Pattern

**Pattern**: Separate Next.js Application with Shared Database

```
Vendor Portal App                    Main ERP App
     ↓                                     ↓
Vendor-specific Auth                 Internal Auth
     ↓                                     ↓
Vendor Portal API                    ERP API
     ↓                                     ↓
     └─────────→  Shared Database  ←───────┘
                  (PostgreSQL)
```

**Application Structure**:
```
vendor-portal/
├── app/
│   ├── (auth)/                          # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   ├── register/
│   │   │   └── page.tsx                # Registration wizard
│   │   ├── forgot-password/
│   │   │   └── page.tsx                # Password reset
│   │   ├── verify-email/
│   │   │   └── page.tsx                # Email verification
│   │   └── setup-2fa/
│   │       └── page.tsx                # 2FA setup
│   │
│   ├── (portal)/                        # Authenticated portal routes
│   │   ├── layout.tsx                  # Portal layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Vendor dashboard
│   │   ├── profile/
│   │   │   ├── page.tsx                # View profile
│   │   │   └── edit/
│   │   │       └── page.tsx            # Edit profile
│   │   ├── documents/
│   │   │   ├── page.tsx                # Document library
│   │   │   └── upload/
│   │   │       └── page.tsx            # Upload documents
│   │   ├── templates/
│   │   │   ├── page.tsx                # Assigned templates list
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # View template
│   │   │       └── submit/
│   │   │           └── page.tsx        # Submit pricing
│   │   ├── rfqs/
│   │   │   ├── page.tsx                # Assigned RFQs list
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # View RFQ
│   │   │       ├── bid/
│   │   │       │   └── page.tsx        # Submit bid
│   │   │       └── clarifications/
│   │   │           └── page.tsx        # Q&A
│   │   ├── purchase-orders/
│   │   │   ├── page.tsx                # PO list
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # View PO
│   │   │       ├── acknowledge/
│   │   │       │   └── page.tsx        # Acknowledge PO
│   │   │       └── delivery/
│   │   │           └── page.tsx        # Update delivery
│   │   ├── invoices/
│   │   │   ├── page.tsx                # Invoice list
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create invoice
│   │   │   └── [id]/
│   │   │       └── page.tsx            # View invoice
│   │   ├── performance/
│   │   │   ├── page.tsx                # Performance dashboard
│   │   │   └── reports/
│   │   │       └── page.tsx            # Detailed reports
│   │   ├── messages/
│   │   │   ├── page.tsx                # Message center
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Message thread
│   │   └── settings/
│   │       ├── page.tsx                # Account settings
│   │       ├── users/
│   │       │   └── page.tsx            # Manage users
│   │       └── notifications/
│   │           └── page.tsx            # Notification preferences
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts            # NextAuth configuration
│   │   ├── register/
│   │   │   └── route.ts                # Registration API
│   │   ├── upload/
│   │   │   └── route.ts                # File upload handling
│   │   ├── 2fa/
│   │   │   ├── setup/route.ts          # 2FA setup
│   │   │   └── verify/route.ts         # 2FA verification
│   │   └── webhooks/
│   │       └── status-update/route.ts  # Receive updates from main system
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx           # Client Component
│   │   │   ├── RegistrationWizard.tsx  # Client Component (4-step)
│   │   │   ├── PasswordResetForm.tsx   # Client Component
│   │   │   └── TwoFactorSetup.tsx      # Client Component
│   │   ├── dashboard/
│   │   │   ├── DashboardSummary.tsx    # Client Component
│   │   │   ├── ActivityTimeline.tsx    # Client Component
│   │   │   ├── QuickActions.tsx        # Client Component
│   │   │   └── NotificationBell.tsx    # Client Component
│   │   ├── profile/
│   │   │   ├── ProfileView.tsx         # Client Component
│   │   │   ├── ProfileEditForm.tsx     # Client Component
│   │   │   ├── ContactManager.tsx      # Client Component
│   │   │   └── BankAccountForm.tsx     # Client Component
│   │   ├── documents/
│   │   │   ├── DocumentLibrary.tsx     # Client Component
│   │   │   ├── DocumentUploader.tsx    # Client Component
│   │   │   ├── DocumentViewer.tsx      # Client Component
│   │   │   └── ExpiryTracker.tsx       # Client Component
│   │   ├── templates/
│   │   │   ├── TemplateList.tsx        # Client Component
│   │   │   ├── TemplateViewer.tsx      # Client Component
│   │   │   ├── PricingForm.tsx         # Client Component
│   │   │   └── BulkPriceImporter.tsx   # Client Component
│   │   ├── rfqs/
│   │   │   ├── RFQList.tsx             # Client Component
│   │   │   ├── RFQViewer.tsx           # Client Component
│   │   │   ├── BidForm.tsx             # Client Component
│   │   │   └── ClarificationThread.tsx # Client Component
│   │   ├── purchase-orders/
│   │   │   ├── POList.tsx              # Client Component
│   │   │   ├── POViewer.tsx            # Client Component
│   │   │   ├── POAcknowledgment.tsx    # Client Component
│   │   │   └── DeliveryTracker.tsx     # Client Component
│   │   ├── invoices/
│   │   │   ├── InvoiceList.tsx         # Client Component
│   │   │   ├── InvoiceForm.tsx         # Client Component
│   │   │   ├── InvoiceViewer.tsx       # Client Component
│   │   │   └── PaymentTracker.tsx      # Client Component
│   │   ├── performance/
│   │   │   ├── MetricsDashboard.tsx    # Client Component
│   │   │   ├── PerformanceChart.tsx    # Client Component
│   │   │   └── ScorecardViewer.tsx     # Client Component
│   │   ├── messages/
│   │   │   ├── MessageCenter.tsx       # Client Component
│   │   │   ├── MessageList.tsx         # Client Component
│   │   │   ├── MessageComposer.tsx     # Client Component
│   │   │   └── MessageThread.tsx       # Client Component
│   │   └── shared/
│   │       ├── Header.tsx              # Portal header
│   │       ├── Sidebar.tsx             # Navigation sidebar
│   │       ├── Footer.tsx              # Portal footer
│   │       ├── Breadcrumbs.tsx         # Navigation breadcrumbs
│   │       └── LoadingStates.tsx       # Loading skeletons
│   │
│   ├── actions/
│   │   ├── auth-actions.ts             # Authentication actions
│   │   ├── registration-actions.ts     # Registration actions
│   │   ├── profile-actions.ts          # Profile management actions
│   │   ├── document-actions.ts         # Document management actions
│   │   ├── template-actions.ts         # Template response actions
│   │   ├── rfq-actions.ts              # RFQ bid actions
│   │   ├── po-actions.ts               # PO management actions
│   │   ├── invoice-actions.ts          # Invoice submission actions
│   │   ├── message-actions.ts          # Messaging actions
│   │   └── notification-actions.ts     # Notification actions
│   │
│   └── types/
│       ├── vendor-portal.ts            # Portal-specific types
│       ├── vendor-user.ts              # Vendor user types
│       └── index.ts                    # Barrel exports
│
├── lib/
│   ├── auth/
│   │   ├── auth-options.ts             # NextAuth configuration
│   │   ├── providers.ts                # Auth providers
│   │   ├── jwt-utils.ts                # JWT helpers
│   │   └── 2fa-utils.ts                # 2FA utilities
│   ├── validation/
│   │   ├── registration-schema.ts      # Registration validation
│   │   ├── profile-schema.ts           # Profile validation
│   │   ├── document-schema.ts          # Document validation
│   │   ├── pricing-schema.ts           # Pricing validation
│   │   ├── bid-schema.ts               # Bid validation
│   │   └── invoice-schema.ts           # Invoice validation
│   ├── services/
│   │   ├── vendor-service.ts           # Vendor management service
│   │   ├── document-service.ts         # Document processing service
│   │   ├── file-storage-service.ts     # S3/Azure Blob service
│   │   ├── virus-scan-service.ts       # Virus scanning service
│   │   ├── email-service.ts            # Email notification service
│   │   ├── sms-service.ts              # SMS service for 2FA
│   │   ├── notification-service.ts     # In-app notifications
│   │   └── audit-service.ts            # Audit logging service
│   ├── utils/
│   │   ├── rate-limiter.ts             # Rate limiting utilities
│   │   ├── encryption.ts               # Data encryption utilities
│   │   ├── validators.ts               # Custom validators
│   │   └── formatters.ts               # Data formatters
│   └── hooks/
│       ├── useVendorContext.ts         # Vendor context hook
│       ├── useNotifications.ts         # Notifications hook
│       ├── useDocuments.ts             # Documents hook
│       └── usePerformance.ts           # Performance metrics hook
│
├── prisma/
│   └── schema.prisma                   # Shared schema (portal-specific models)
│
├── middleware.ts                        # Auth and rate limiting middleware
├── next.config.js                      # Next.js configuration
└── package.json                        # Dependencies
```

### 1.3 Data Flow Architecture

```
Vendor User Interface (Browser)
        ↓
Next.js Client Components (React)
        ↓
Server Actions / API Routes (Portal Backend)
        ↓
Business Logic Layer (Services)
        ↓
Prisma ORM
        ↓
Shared PostgreSQL Database
        ↓
External Services (S3, Email, SMS, Virus Scan)
        ↑
Main ERP Application (webhook updates, data sync)
```

**Key Principles**:
- **Separate Application**: Independent deployment, separate authentication, vendor-focused UX
- **Shared Database**: Direct access to vendor data, no data duplication
- **Data Isolation**: Vendors can only access their own data (enforced at query level)
- **Server Components**: Default for data fetching
- **Client Components**: Only for interactivity (forms, charts, real-time updates)
- **Server Actions**: Primary method for mutations
- **React Query**: Client-side caching and optimistic updates
- **Audit Logging**: All vendor actions logged for security and compliance

---

## 2. Database Implementation

### 2.1 Schema Design Strategy

**Approach**: Extend existing shared schema with vendor portal-specific tables. Reuse existing vendor, product, purchase order, and invoice tables.

**New Tables Required for Portal**:
- `tb_vendor_portal_user` (vendor user accounts)
- `tb_vendor_portal_session` (session management)
- `tb_vendor_registration` (registration requests)
- `tb_vendor_document` (vendor-uploaded documents)
- `tb_vendor_notification` (in-portal notifications)
- `tb_vendor_message` (message center)
- `tb_vendor_audit_log` (vendor activity audit)

**Existing Tables Used** (from main ERP):
- `tb_vendor` (vendor profile information)
- `tb_product` (product catalog)
- `tb_pricelist_template` (price templates)
- `tb_price_list` (submitted price lists)
- `tb_rfq` (RFQ campaigns)
- `tb_rfq_bid` (vendor bids)
- `tb_purchase_order` (purchase orders)
- `tb_invoice` (invoices)

```prisma
// schema.prisma additions for Vendor Portal

// Vendor Portal User Account (separate from main ERP users)
model VendorPortalUser {
  id                String   @id @default(uuid())
  vendorId          String
  vendor            Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  // Authentication
  email             String   @unique
  passwordHash      String
  emailVerified     Boolean  @default(false)
  emailVerifiedAt   DateTime?

  // Two-Factor Authentication
  twoFactorEnabled  Boolean  @default(false)
  twoFactorSecret   String?  // Encrypted TOTP secret
  twoFactorBackupCodes Json? // Array of encrypted backup codes

  // User details
  firstName         String
  lastName          String
  title             String?
  phone             String?
  mobile            String?

  // Role and permissions
  role              VendorUserRole @default(VENDOR_USER)
  permissions       Json?          // Custom permissions overrides

  // Account status
  status            UserStatus @default(ACTIVE)
  isActive          Boolean    @default(true)

  // Security
  lastLoginAt       DateTime?
  lastLoginIp       String?
  failedLoginAttempts Int     @default(0)
  lockedUntil       DateTime?
  passwordChangedAt DateTime?
  mustChangePassword Boolean  @default(false)

  // Notification preferences
  notificationPreferences Json? // Email, SMS, in-app settings

  // Metadata
  createdAt         DateTime @default(now())
  createdBy         String?
  updatedAt         DateTime @updatedAt
  updatedBy         String?
  deletedAt         DateTime? // Soft delete

  // Relations
  sessions          VendorPortalSession[]
  notifications     VendorNotification[]
  messages          VendorMessage[]
  auditLogs         VendorAuditLog[]
  documents         VendorDocument[] @relation("UploadedBy")

  @@index([vendorId, isActive])
  @@index([email])
  @@index([status])
  @@map("tb_vendor_portal_user")
}

enum VendorUserRole {
  VENDOR_ADMIN    // Full access, can manage users
  VENDOR_USER     // Standard operational access
  VENDOR_VIEWER   // Read-only access
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  LOCKED
  PENDING_VERIFICATION
}

// Vendor Portal Session Management
model VendorPortalSession {
  id                String   @id @default(uuid())
  userId            String
  user              VendorPortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Session details
  sessionToken      String   @unique
  refreshToken      String?  @unique
  deviceId          String?
  deviceFingerprint String?

  // Session metadata
  ipAddress         String
  userAgent         String
  deviceType        String?  // Mobile, Desktop, Tablet
  browser           String?
  os                String?
  location          Json?    // City, country, lat/lng

  // Session lifecycle
  expiresAt         DateTime
  lastActivityAt    DateTime @default(now())
  createdAt         DateTime @default(now())

  // Security flags
  isTrustedDevice   Boolean  @default(false)
  requiresTwoFactor Boolean  @default(true)
  twoFactorVerified Boolean  @default(false)

  @@index([userId, expiresAt])
  @@index([sessionToken])
  @@index([expiresAt]) // For cleanup jobs
  @@map("tb_vendor_portal_session")
}

// Vendor Registration Requests
model VendorRegistration {
  id                String   @id @default(uuid())
  registrationNumber String  @unique // REG-YYYY-XXXX

  // Company information
  legalName         String
  tradeName         String?
  businessType      String
  taxId             String   @unique // EIN
  stateTaxId        String?
  yearEstablished   Int

  // Addresses
  physicalAddress   Json     // Street, city, state, zip, country
  mailingAddress    Json
  billingAddress    Json

  // Contact information
  primaryContact    Json     // Name, email, phone, title
  secondaryContact  Json?
  apContact         Json     // Accounts payable contact

  // Business details
  businessCategories Json    // Array of categories
  productsServices  String   // Description
  annualRevenue     String   // Range
  employeeCount     String   // Range
  certifications    Json?    // Array of certifications
  website           String?

  // Bank account
  bankName          String
  accountHolderName String
  accountNumber     String   // Encrypted
  routingNumber     String   // Encrypted
  accountType       String

  // Documents (references to uploaded files)
  documents         Json     // Array of document references

  // Agreement
  termsAccepted     Boolean  @default(false)
  termsAcceptedAt   DateTime?
  electronicSignature Json   // Name, title, date

  // Status and workflow
  status            RegistrationStatus @default(PENDING_REVIEW)
  submittedAt       DateTime @default(now())
  reviewedBy        String?
  reviewedAt        DateTime?
  approvedBy        String?
  approvedAt        DateTime?
  rejectionReason   String?

  // Created vendor reference (after approval)
  vendorId          String?  @unique
  vendor            Vendor?  @relation(fields: [vendorId], references: [id])

  // Metadata
  submitterIp       String
  submitterUserAgent String
  updatedAt         DateTime @updatedAt

  @@index([status])
  @@index([submittedAt])
  @@map("tb_vendor_registration")
}

enum RegistrationStatus {
  PENDING_REVIEW
  UNDER_REVIEW
  APPROVED
  REJECTED
  DUPLICATE
  INCOMPLETE
}

// Vendor Document Management
model VendorDocument {
  id                String   @id @default(uuid())
  vendorId          String
  vendor            Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  // Document classification
  documentType      DocumentType
  documentCategory  String?  // Business License, Insurance, Certification, etc.
  documentName      String
  description       String?

  // File information
  fileName          String
  fileSize          Int      // Bytes
  mimeType          String
  fileExtension     String
  storageProvider   String   // S3, Azure, etc.
  storagePath       String   // S3 key or blob path
  storageUrl        String?  // Pre-signed URL (temporary)

  // Document metadata
  issueDate         DateTime?
  expiryDate        DateTime?
  issuingOrganization String?
  certificateNumber String?
  version           String?
  notes             String?

  // Status and lifecycle
  status            DocumentStatus @default(UNDER_REVIEW)
  reviewedBy        String?
  reviewedAt        DateTime?
  approvedBy        String?
  approvedAt        DateTime?
  rejectionReason   String?

  // Virus scan results
  virusScanStatus   VirusScanStatus @default(PENDING)
  virusScanResult   String?
  virusScanDate     DateTime?

  // Version control (for replacements)
  previousVersionId String?
  currentVersion    Boolean  @default(true)
  supersededAt      DateTime?

  // Upload information
  uploadedBy        String
  uploader          VendorPortalUser @relation("UploadedBy", fields: [uploadedBy], references: [id])
  uploadedAt        DateTime @default(now())

  // Expiry reminders
  remindersSent     Json?    // Array of timestamps when reminders sent

  // Soft delete
  deletedAt         DateTime?

  @@index([vendorId, documentType])
  @@index([status])
  @@index([expiryDate])
  @@index([virusScanStatus])
  @@map("tb_vendor_document")
}

enum DocumentType {
  BUSINESS_LICENSE
  TAX_CERTIFICATE
  INSURANCE_GENERAL_LIABILITY
  INSURANCE_WORKERS_COMP
  INSURANCE_PROFESSIONAL
  CERTIFICATION_ISO_9001
  CERTIFICATION_ISO_14001
  CERTIFICATION_HACCP
  CERTIFICATION_FDA
  CERTIFICATION_ORGANIC
  CERTIFICATION_FAIR_TRADE
  CERTIFICATION_KOSHER
  CERTIFICATION_HALAL
  PRODUCT_CATALOG
  SAFETY_DATA_SHEET
  FINANCIAL_STATEMENT
  REFERENCE_LETTER
  CONTRACT
  OTHER
}

enum DocumentStatus {
  UNDER_REVIEW
  APPROVED
  REJECTED
  EXPIRED
  EXPIRING_SOON
  SUPERSEDED
}

enum VirusScanStatus {
  PENDING
  CLEAN
  INFECTED
  SCAN_FAILED
}

// Vendor Notifications (in-portal)
model VendorNotification {
  id                String   @id @default(uuid())
  userId            String
  user              VendorPortalUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  vendorId          String

  // Notification content
  type              NotificationType
  title             String
  message           String
  actionUrl         String?  // Link to related resource
  actionLabel       String?  // "View RFQ", "Submit Pricing", etc.

  // Notification metadata
  priority          NotificationPriority @default(NORMAL)
  category          String?  // RFQ, Template, PO, Invoice, etc.

  // Status
  isRead            Boolean  @default(false)
  readAt            DateTime?
  isDismissed       Boolean  @default(false)
  dismissedAt       DateTime?

  // Related resources
  relatedResourceType String?  // RFQ, Template, PO, Invoice
  relatedResourceId   String?

  // Delivery
  emailSent         Boolean  @default(false)
  emailSentAt       DateTime?
  smsSent           Boolean  @default(false)
  smsSentAt         DateTime?

  // Metadata
  createdAt         DateTime @default(now())
  expiresAt         DateTime? // Auto-delete after expiry

  @@index([userId, isRead])
  @@index([vendorId, type])
  @@index([createdAt])
  @@index([expiresAt]) // For cleanup
  @@map("tb_vendor_notification")
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  URGENT
  REMINDER
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

// Vendor Message Center
model VendorMessage {
  id                String   @id @default(uuid())
  vendorId          String

  // Participants
  senderId          String?
  sender            VendorPortalUser? @relation(fields: [senderId], references: [id])
  senderType        MessageParticipantType @default(VENDOR) // Vendor or Buyer
  senderName        String
  recipientType     MessageParticipantType
  recipientId       String?  // User ID or procurement staff ID

  // Message content
  subject           String
  body              String   @db.Text
  messageType       MessageType @default(GENERAL)

  // Threading
  parentMessageId   String?
  threadId          String   // All related messages share thread ID
  isThreadStarter   Boolean  @default(false)

  // Attachments
  attachments       Json?    // Array of file references

  // Status
  status            MessageStatus @default(SENT)
  isRead            Boolean  @default(false)
  readAt            DateTime?
  repliedAt         DateTime?

  // Related resources
  relatedResourceType String?  // PO, Invoice, RFQ, Template
  relatedResourceId   String?

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime? // Soft delete

  @@index([vendorId, threadId])
  @@index([senderId, isRead])
  @@index([threadId, createdAt])
  @@map("tb_vendor_message")
}

enum MessageParticipantType {
  VENDOR
  BUYER
  SYSTEM
}

enum MessageType {
  GENERAL
  INQUIRY
  ISSUE
  CLARIFICATION
  CONFIRMATION
  URGENT
}

enum MessageStatus {
  DRAFT
  SENT
  DELIVERED
  READ
  REPLIED
  ARCHIVED
}

// Vendor Audit Log
model VendorAuditLog {
  id                String   @id @default(uuid())
  vendorId          String
  userId            String?
  user              VendorPortalUser? @relation(fields: [userId], references: [id])

  // Action details
  action            String   // Login, Logout, ProfileUpdate, DocumentUpload, etc.
  actionCategory    AuditCategory
  resource          String?  // Resource type (Profile, Document, RFQ, etc.)
  resourceId        String?  // ID of affected resource

  // Request information
  ipAddress         String
  userAgent         String
  method            String?  // HTTP method
  endpoint          String?  // API endpoint
  requestId         String?  // Trace ID

  // Change details
  oldValues         Json?    // Previous state
  newValues         Json?    // New state
  changedFields     Json?    // Array of field names

  // Result
  status            AuditStatus
  errorMessage      String?
  responseTime      Int?     // Milliseconds

  // Metadata
  timestamp         DateTime @default(now())
  sessionId         String?

  @@index([vendorId, timestamp])
  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@index([actionCategory])
  @@map("tb_vendor_audit_log")
}

enum AuditCategory {
  AUTHENTICATION
  AUTHORIZATION
  PROFILE_MANAGEMENT
  DOCUMENT_MANAGEMENT
  PRICING_SUBMISSION
  RFQ_BIDDING
  PO_MANAGEMENT
  INVOICE_SUBMISSION
  COMMUNICATION
  SETTINGS
  USER_MANAGEMENT
  SECURITY_EVENT
}

enum AuditStatus {
  SUCCESS
  FAILURE
  UNAUTHORIZED
  FORBIDDEN
  ERROR
}
```

### 2.2 JSON Structure Implementation

**Vendor Registration - physicalAddress**:
```typescript
interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

**Vendor Registration - primaryContact**:
```typescript
interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
}
```

**Vendor Registration - documents**:
```typescript
interface RegistrationDocuments {
  documents: Array<{
    documentType: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    storageKey: string;
  }>;
}
```

**VendorPortalUser - notificationPreferences**:
```typescript
interface NotificationPreferences {
  email: {
    enabled: boolean;
    newRFQ: boolean;
    newTemplate: boolean;
    poIssued: boolean;
    invoiceStatusChange: boolean;
    paymentReceived: boolean;
    documentExpiry: boolean;
    performanceScorecard: boolean;
    systemAnnouncements: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    poIssued: boolean;
    paymentReceived: boolean;
  };
  inApp: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
  };
}
```

**VendorPortalSession - location**:
```typescript
interface SessionLocation {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}
```

**VendorNotification - relatedResource**:
```typescript
// Stored in relatedResourceType and relatedResourceId
// Example usage:
{
  relatedResourceType: 'RFQ',
  relatedResourceId: 'rfq_uuid_here'
}
```

**VendorMessage - attachments**:
```typescript
interface MessageAttachments {
  attachments: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageKey: string;
    uploadedAt: string;
  }>;
}
```

**VendorAuditLog - oldValues/newValues**:
```typescript
// Example for profile update:
{
  oldValues: {
    phone: "+1 (555) 123-4567",
    website: "https://old-website.com"
  },
  newValues: {
    phone: "+1 (555) 987-6543",
    website: "https://new-website.com"
  },
  changedFields: ["phone", "website"]
}
```

### 2.3 Database Indexes

**Performance-Critical Indexes**:
```sql
-- Vendor Portal User indexes
CREATE INDEX idx_vendor_portal_user_vendor_active ON tb_vendor_portal_user(vendor_id, is_active);
CREATE INDEX idx_vendor_portal_user_email ON tb_vendor_portal_user(email);
CREATE INDEX idx_vendor_portal_user_status ON tb_vendor_portal_user(status);

-- Session indexes
CREATE INDEX idx_vendor_session_user_expiry ON tb_vendor_portal_session(user_id, expires_at);
CREATE INDEX idx_vendor_session_token ON tb_vendor_portal_session(session_token);
CREATE INDEX idx_vendor_session_cleanup ON tb_vendor_portal_session(expires_at);

-- Registration indexes
CREATE INDEX idx_vendor_registration_status ON tb_vendor_registration(status);
CREATE INDEX idx_vendor_registration_submitted ON tb_vendor_registration(submitted_at);

-- Document indexes
CREATE INDEX idx_vendor_document_vendor_type ON tb_vendor_document(vendor_id, document_type);
CREATE INDEX idx_vendor_document_status ON tb_vendor_document(status);
CREATE INDEX idx_vendor_document_expiry ON tb_vendor_document(expiry_date);
CREATE INDEX idx_vendor_document_virus_scan ON tb_vendor_document(virus_scan_status);

-- Notification indexes
CREATE INDEX idx_vendor_notification_user_read ON tb_vendor_notification(user_id, is_read);
CREATE INDEX idx_vendor_notification_vendor_type ON tb_vendor_notification(vendor_id, type);
CREATE INDEX idx_vendor_notification_created ON tb_vendor_notification(created_at);
CREATE INDEX idx_vendor_notification_expiry ON tb_vendor_notification(expires_at);

-- Message indexes
CREATE INDEX idx_vendor_message_vendor_thread ON tb_vendor_message(vendor_id, thread_id);
CREATE INDEX idx_vendor_message_sender_read ON tb_vendor_message(sender_id, is_read);
CREATE INDEX idx_vendor_message_thread_created ON tb_vendor_message(thread_id, created_at);

-- Audit log indexes
CREATE INDEX idx_vendor_audit_vendor_time ON tb_vendor_audit_log(vendor_id, timestamp);
CREATE INDEX idx_vendor_audit_user_time ON tb_vendor_audit_log(user_id, timestamp);
CREATE INDEX idx_vendor_audit_action_time ON tb_vendor_audit_log(action, timestamp);
CREATE INDEX idx_vendor_audit_category ON tb_vendor_audit_log(action_category);
```

---

## 3. Component Architecture

### 3.1 Authentication Components

**LoginForm Component** (`components/auth/LoginForm.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      if (result?.ok) {
        // Check if 2FA required
        const response = await fetch('/api/auth/check-2fa');
        const { requires2FA } = await response.json();

        if (requires2FA) {
          router.push('/auth/verify-2fa');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields implementation */}
    </form>
  );
}
```

**RegistrationWizard Component** (`components/auth/RegistrationWizard.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registrationSchema } from '@/lib/validation/registration-schema';
import type { RegistrationFormData } from '@/types/vendor-portal';

export function RegistrationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
  });

  // Step 1: Company Information
  function Step1CompanyInfo() {
    return (
      <div className="space-y-4">
        {/* Company info fields */}
      </div>
    );
  }

  // Step 2: Contact Information
  function Step2ContactInfo() {
    return (
      <div className="space-y-4">
        {/* Contact info fields */}
      </div>
    );
  }

  // Step 3: Business Details
  function Step3BusinessDetails() {
    return (
      <div className="space-y-4">
        {/* Business details fields */}
      </div>
    );
  }

  // Step 4: Documents & Terms
  function Step4DocumentsTerms() {
    return (
      <div className="space-y-4">
        {/* Document upload and terms acceptance */}
      </div>
    );
  }

  async function onSubmit(data: RegistrationFormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { registrationId } = await response.json();

      // Redirect to success page
      router.push(`/register/success?id=${registrationId}`);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-1/4 text-center ${
                step <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Step {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-secondary h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {currentStep === 1 && <Step1CompanyInfo />}
        {currentStep === 2 && <Step2ContactInfo />}
        {currentStep === 3 && <Step3BusinessDetails />}
        {currentStep === 4 && <Step4DocumentsTerms />}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-secondary"
            >
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="btn btn-primary ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary ml-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

### 3.2 Dashboard Components

**DashboardSummary Component** (`components/dashboard/DashboardSummary.tsx`):
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FileText, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardData {
  activePOs: number;
  pendingInvoices: number;
  openRFQs: number;
  performanceScore: number;
}

export function DashboardSummary() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/summary');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active POs</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.activePOs}</div>
          <p className="text-xs text-muted-foreground">
            Purchase orders in progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.pendingInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting payment
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open RFQs</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.openRFQs}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting your response
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.performanceScore}%</div>
          <p className="text-xs text-muted-foreground">
            Overall rating
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 4. Server Actions Implementation

### 4.1 Registration Actions

**File**: `app/actions/registration-actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validation/registration-schema';
import { sendEmail } from '@/lib/services/email-service';
import { generateRegistrationNumber } from '@/lib/utils/generators';
import { hashPassword, encryptData } from '@/lib/utils/encryption';
import type { RegistrationFormData } from '@/types/vendor-portal';

export async function submitRegistration(data: RegistrationFormData) {
  try {
    // Validate data
    const validatedData = registrationSchema.parse(data);

    // Check for duplicates
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { taxId: validatedData.taxId },
          { legalName: validatedData.legalName },
        ],
      },
    });

    if (existingVendor) {
      return {
        success: false,
        error: 'A vendor with this information already exists.',
        code: 'DUPLICATE_VENDOR',
      };
    }

    // Generate registration number
    const registrationNumber = await generateRegistrationNumber();

    // Encrypt sensitive data
    const encryptedAccountNumber = encryptData(validatedData.accountNumber);
    const encryptedRoutingNumber = encryptData(validatedData.routingNumber);

    // Create registration record
    const registration = await prisma.vendorRegistration.create({
      data: {
        registrationNumber,
        legalName: validatedData.legalName,
        tradeName: validatedData.tradeName,
        businessType: validatedData.businessType,
        taxId: validatedData.taxId,
        stateTaxId: validatedData.stateTaxId,
        yearEstablished: validatedData.yearEstablished,
        physicalAddress: validatedData.physicalAddress,
        mailingAddress: validatedData.mailingAddress,
        billingAddress: validatedData.billingAddress,
        primaryContact: validatedData.primaryContact,
        secondaryContact: validatedData.secondaryContact,
        apContact: validatedData.apContact,
        businessCategories: validatedData.businessCategories,
        productsServices: validatedData.productsServices,
        annualRevenue: validatedData.annualRevenue,
        employeeCount: validatedData.employeeCount,
        certifications: validatedData.certifications,
        website: validatedData.website,
        bankName: validatedData.bankName,
        accountHolderName: validatedData.accountHolderName,
        accountNumber: encryptedAccountNumber,
        routingNumber: encryptedRoutingNumber,
        accountType: validatedData.accountType,
        documents: validatedData.documents,
        termsAccepted: validatedData.termsAccepted,
        termsAcceptedAt: new Date(),
        electronicSignature: validatedData.electronicSignature,
        status: 'PENDING_REVIEW',
        submitterIp: validatedData.ipAddress,
        submitterUserAgent: validatedData.userAgent,
      },
    });

    // Send confirmation email to vendor
    await sendEmail({
      to: validatedData.primaryContact.email,
      subject: 'Vendor Registration Received',
      template: 'registration-confirmation',
      data: {
        registrationNumber,
        companyName: validatedData.legalName,
        contactName: `${validatedData.primaryContact.firstName} ${validatedData.primaryContact.lastName}`,
      },
    });

    // Send notification to procurement staff
    await sendEmail({
      to: process.env.PROCUREMENT_EMAIL!,
      subject: 'New Vendor Registration',
      template: 'new-registration-notification',
      data: {
        registrationNumber,
        companyName: validatedData.legalName,
        reviewUrl: `${process.env.NEXT_PUBLIC_ERP_URL}/vendor-management/registrations/${registration.id}`,
      },
    });

    return {
      success: true,
      registrationId: registration.id,
      registrationNumber,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Failed to submit registration. Please try again.',
      code: 'REGISTRATION_ERROR',
    };
  }
}

export async function saveRegistrationProgress(data: Partial<RegistrationFormData>, resumeToken: string) {
  // Implementation for saving partial registration data
  // Store in Redis or database with expiry
}

export async function resumeRegistration(resumeToken: string) {
  // Implementation for retrieving saved registration data
}
```

### 4.2 Profile Management Actions

**File**: `app/actions/profile-actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validation/profile-schema';
import { sendEmail } from '@/lib/services/email-service';
import { createAuditLog } from '@/lib/services/audit-service';
import { encryptData, verifyPassword } from '@/lib/utils/encryption';
import type { ProfileUpdateData } from '@/types/vendor-portal';

export async function updateVendorProfile(data: ProfileUpdateData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const validatedData = profileSchema.parse(data);

    // Check for critical changes requiring approval
    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
    });

    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    const criticalChanges = detectCriticalChanges(vendor, validatedData);

    // Update vendor record
    const updatedVendor = await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: {
        tradeName: validatedData.tradeName,
        physicalAddress: validatedData.physicalAddress,
        mailingAddress: validatedData.mailingAddress,
        billingAddress: validatedData.billingAddress,
        businessPhone: validatedData.businessPhone,
        website: validatedData.website,
        businessCategories: validatedData.businessCategories,
        productsServices: validatedData.productsServices,
        annualRevenue: validatedData.annualRevenue,
        employeeCount: validatedData.employeeCount,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
    });

    // Update contacts
    if (validatedData.contacts) {
      // Implementation for updating contacts
    }

    // Create audit log
    await createAuditLog({
      vendorId: session.user.vendorId,
      userId: session.user.id,
      action: 'PROFILE_UPDATE',
      actionCategory: 'PROFILE_MANAGEMENT',
      resource: 'Vendor',
      resourceId: vendor.id,
      oldValues: {
        tradeName: vendor.tradeName,
        physicalAddress: vendor.physicalAddress,
        // ... other fields
      },
      newValues: {
        tradeName: validatedData.tradeName,
        physicalAddress: validatedData.physicalAddress,
        // ... other fields
      },
      changedFields: Object.keys(validatedData),
      status: 'SUCCESS',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    // If critical changes, notify procurement
    if (criticalChanges.length > 0) {
      await sendEmail({
        to: process.env.PROCUREMENT_EMAIL!,
        subject: 'Vendor Profile Change Requires Approval',
        template: 'profile-change-approval',
        data: {
          vendorName: vendor.legalName,
          changes: criticalChanges,
          reviewUrl: `${process.env.NEXT_PUBLIC_ERP_URL}/vendor-management/vendors/${vendor.id}`,
        },
      });
    }

    revalidatePath('/profile');

    return {
      success: true,
      requiresApproval: criticalChanges.length > 0,
      criticalChanges,
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.',
    };
  }
}

export async function updateBankAccount(data: { bankName: string; accountNumber: string; routingNumber: string; accountType: string }, password: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify password
    const user = await prisma.vendorPortalUser.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    // Encrypt sensitive data
    const encryptedAccountNumber = encryptData(data.accountNumber);
    const encryptedRoutingNumber = encryptData(data.routingNumber);

    // Update bank account with approval flag
    await prisma.vendor.update({
      where: { id: session.user.vendorId },
      data: {
        bankName: data.bankName,
        accountNumber: encryptedAccountNumber,
        routingNumber: encryptedRoutingNumber,
        accountType: data.accountType,
        bankAccountChangeStatus: 'PENDING_APPROVAL',
        bankAccountChangedAt: new Date(),
        updatedBy: session.user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      vendorId: session.user.vendorId,
      userId: session.user.id,
      action: 'BANK_ACCOUNT_UPDATE',
      actionCategory: 'PROFILE_MANAGEMENT',
      resource: 'Vendor',
      resourceId: session.user.vendorId,
      status: 'SUCCESS',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    // Notify procurement for approval
    await sendEmail({
      to: process.env.PROCUREMENT_EMAIL!,
      subject: 'Vendor Bank Account Change Requires Approval',
      template: 'bank-account-change-approval',
      data: {
        vendorName: user.vendor.legalName,
        reviewUrl: `${process.env.NEXT_PUBLIC_ERP_URL}/vendor-management/vendors/${session.user.vendorId}`,
      },
    });

    return {
      success: true,
      message: 'Bank account information updated. Changes pending approval.',
    };
  } catch (error) {
    console.error('Bank account update error:', error);
    return {
      success: false,
      error: 'Failed to update bank account. Please try again.',
    };
  }
}

function detectCriticalChanges(oldData: any, newData: any): string[] {
  const criticalFields = ['legalName', 'taxId', 'bankAccount'];
  const changes: string[] = [];

  // Compare critical fields
  criticalFields.forEach((field) => {
    if (oldData[field] !== newData[field]) {
      changes.push(field);
    }
  });

  return changes;
}
```

---

## 5. Authentication & Security Implementation

### 5.1 NextAuth Configuration

**File**: `lib/auth/auth-options.ts`

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/utils/encryption';
import { createAuditLog } from '@/lib/services/audit-service';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user
          const user = await prisma.vendorPortalUser.findUnique({
            where: { email: credentials.email },
            include: {
              vendor: {
                select: {
                  id: true,
                  legalName: true,
                  vendorCode: true,
                  status: true,
                },
              },
            },
          });

          if (!user || !user.isActive) {
            // Log failed attempt
            await createAuditLog({
              action: 'LOGIN_FAILED',
              actionCategory: 'AUTHENTICATION',
              status: 'FAILURE',
              errorMessage: 'User not found or inactive',
              ipAddress: req.headers?.['x-forwarded-for'] as string || 'unknown',
              userAgent: req.headers?.['user-agent'] || 'unknown',
            });

            return null;
          }

          // Check account status
          if (user.status !== 'ACTIVE') {
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            // Increment failed login attempts
            const failedAttempts = user.failedLoginAttempts + 1;
            const shouldLock = failedAttempts >= 5;

            await prisma.vendorPortalUser.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
                  : null,
              },
            });

            // Log failed attempt
            await createAuditLog({
              vendorId: user.vendorId,
              userId: user.id,
              action: 'LOGIN_FAILED',
              actionCategory: 'AUTHENTICATION',
              status: 'FAILURE',
              errorMessage: 'Invalid password',
              ipAddress: req.headers?.['x-forwarded-for'] as string || 'unknown',
              userAgent: req.headers?.['user-agent'] || 'unknown',
            });

            return null;
          }

          // Check if password change required
          if (user.mustChangePassword) {
            // Return user but flag for password change
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              vendorId: user.vendorId,
              vendorName: user.vendor.legalName,
              role: user.role,
              mustChangePassword: true,
            };
          }

          // Check if password expired (90 days)
          const passwordAge =
            Date.now() -
            (user.passwordChangedAt?.getTime() || user.createdAt.getTime());
          const passwordExpired = passwordAge > 90 * 24 * 60 * 60 * 1000;

          if (passwordExpired) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              vendorId: user.vendorId,
              vendorName: user.vendor.legalName,
              role: user.role,
              mustChangePassword: true,
              passwordExpired: true,
            };
          }

          // Successful login - reset failed attempts and update last login
          await prisma.vendorPortalUser.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lastLoginAt: new Date(),
              lastLoginIp: req.headers?.['x-forwarded-for'] as string || 'unknown',
            },
          });

          // Log successful login
          await createAuditLog({
            vendorId: user.vendorId,
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            actionCategory: 'AUTHENTICATION',
            status: 'SUCCESS',
            ipAddress: req.headers?.['x-forwarded-for'] as string || 'unknown',
            userAgent: req.headers?.['user-agent'] || 'unknown',
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            vendorId: user.vendorId,
            vendorName: user.vendor.legalName,
            vendorCode: user.vendor.vendorCode,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.vendorId = user.vendorId;
        token.vendorName = user.vendorName;
        token.vendorCode = user.vendorCode;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.vendorId = token.vendorId as string;
        session.user.vendorName = token.vendorName as string;
        session.user.vendorCode = token.vendorCode as string;
        session.user.role = token.role as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 5.2 Rate Limiting Middleware

**File**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Get IP address
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';

  // Apply rate limiting
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`
  );

  // Add rate limit headers
  const response = success
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );

  // Apply security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/register',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 6. File Storage & Security

### 6.1 Document Upload Service

**File**: `lib/services/document-service.ts`

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/prisma';
import { scanFileForVirus } from '@/lib/services/virus-scan-service';
import { sendEmail } from '@/lib/services/email-service';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function uploadVendorDocument(
  vendorId: string,
  userId: string,
  file: File,
  metadata: {
    documentType: string;
    documentCategory: string;
    documentName: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingOrganization?: string;
    certificateNumber?: string;
    notes?: string;
  }
) {
  try {
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }

    // Generate unique storage key
    const fileExtension = file.name.split('.').pop();
    const storageKey = `vendors/${vendorId}/documents/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Scan for viruses
    const virusScanResult = await scanFileForVirus(buffer);

    if (!virusScanResult.clean) {
      throw new Error('File failed virus scan');
    }

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          vendorId,
          uploadedBy: userId,
          documentType: metadata.documentType,
        },
      })
    );

    // Create document record
    const document = await prisma.vendorDocument.create({
      data: {
        vendorId,
        documentType: metadata.documentType as any,
        documentCategory: metadata.documentCategory,
        documentName: metadata.documentName,
        description: metadata.notes,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileExtension: fileExtension || '',
        storageProvider: 'S3',
        storagePath: storageKey,
        issueDate: metadata.issueDate,
        expiryDate: metadata.expiryDate,
        issuingOrganization: metadata.issuingOrganization,
        certificateNumber: metadata.certificateNumber,
        notes: metadata.notes,
        status: 'UNDER_REVIEW',
        virusScanStatus: 'CLEAN',
        virusScanResult: virusScanResult.details,
        virusScanDate: new Date(),
        uploadedBy: userId,
        uploadedAt: new Date(),
      },
    });

    // Notify procurement staff for required documents
    const requiredDocTypes = [
      'BUSINESS_LICENSE',
      'TAX_CERTIFICATE',
      'INSURANCE_GENERAL_LIABILITY',
      'INSURANCE_WORKERS_COMP',
    ];

    if (requiredDocTypes.includes(metadata.documentType)) {
      await sendEmail({
        to: process.env.PROCUREMENT_EMAIL!,
        subject: 'New Vendor Document Uploaded',
        template: 'document-uploaded-notification',
        data: {
          vendorId,
          documentType: metadata.documentType,
          documentName: metadata.documentName,
          reviewUrl: `${process.env.NEXT_PUBLIC_ERP_URL}/vendor-management/documents/${document.id}`,
        },
      });
    }

    return {
      success: true,
      documentId: document.id,
      storageKey,
    };
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
}

export async function generateDocumentDownloadUrl(documentId: string, userId: string) {
  // Verify user has access to document
  const document = await prisma.vendorDocument.findFirst({
    where: {
      id: documentId,
      vendor: {
        portalUsers: {
          some: {
            id: userId,
          },
        },
      },
    },
  });

  if (!document) {
    throw new Error('Document not found or access denied');
  }

  // Generate pre-signed URL (valid for 15 minutes)
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: document.storagePath,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return url;
}

export async function scheduleExpiryReminders() {
  // Find documents expiring in 60, 30, and 7 days
  const today = new Date();
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringDocuments = await prisma.vendorDocument.findMany({
    where: {
      expiryDate: {
        lte: in60Days,
        gte: today,
      },
      status: {
        in: ['APPROVED', 'EXPIRING_SOON'],
      },
      currentVersion: true,
    },
    include: {
      vendor: {
        include: {
          portalUsers: {
            where: {
              role: 'VENDOR_ADMIN',
              isActive: true,
            },
          },
        },
      },
    },
  });

  for (const doc of expiringDocuments) {
    const daysUntilExpiry = Math.ceil(
      (doc.expiryDate!.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );

    let shouldSendReminder = false;
    let reminderType = '';

    if (daysUntilExpiry === 60) {
      shouldSendReminder = true;
      reminderType = '60_DAY';
    } else if (daysUntilExpiry === 30) {
      shouldSendReminder = true;
      reminderType = '30_DAY';
    } else if (daysUntilExpiry === 7) {
      shouldSendReminder = true;
      reminderType = '7_DAY';
    }

    if (shouldSendReminder) {
      // Check if reminder already sent
      const reminders = (doc.remindersSent as any[]) || [];
      if (!reminders.includes(reminderType)) {
        // Send reminders to all vendor admins
        for (const user of doc.vendor.portalUsers) {
          await sendEmail({
            to: user.email,
            subject: `Document Expiring Soon: ${doc.documentName}`,
            template: 'document-expiry-reminder',
            data: {
              documentName: doc.documentName,
              documentType: doc.documentType,
              expiryDate: doc.expiryDate,
              daysUntilExpiry,
              uploadUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL}/documents/upload`,
            },
          });
        }

        // Update remindersSent
        await prisma.vendorDocument.update({
          where: { id: doc.id },
          data: {
            remindersSent: [...reminders, reminderType],
            status: daysUntilExpiry <= 30 ? 'EXPIRING_SOON' : doc.status,
          },
        });
      }
    }
  }

  // Mark expired documents
  await prisma.vendorDocument.updateMany({
    where: {
      expiryDate: {
        lt: today,
      },
      status: {
        notIn: ['EXPIRED', 'SUPERSEDED'],
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Example Test**: `__tests__/services/document-service.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadVendorDocument } from '@/lib/services/document-service';
import { prisma } from '@/lib/prisma';
import { scanFileForVirus } from '@/lib/services/virus-scan-service';

vi.mock('@/lib/prisma');
vi.mock('@/lib/services/virus-scan-service');
vi.mock('@aws-sdk/client-s3');

describe('Document Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadVendorDocument', () => {
    it('should successfully upload a valid document', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const metadata = {
        documentType: 'BUSINESS_LICENSE',
        documentCategory: 'Business License',
        documentName: 'Business License 2024',
        issueDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-01-01'),
      };

      vi.mocked(scanFileForVirus).mockResolvedValue({
        clean: true,
        details: 'No threats detected',
      });

      vi.mocked(prisma.vendorDocument.create).mockResolvedValue({
        id: 'doc-123',
        // ... other fields
      } as any);

      const result = await uploadVendorDocument(
        'vendor-123',
        'user-123',
        mockFile,
        metadata
      );

      expect(result.success).toBe(true);
      expect(result.documentId).toBe('doc-123');
      expect(scanFileForVirus).toHaveBeenCalled();
    });

    it('should reject file exceeding size limit', async () => {
      const largeFile = new File([new ArrayBuffer(51 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      await expect(
        uploadVendorDocument('vendor-123', 'user-123', largeFile, {} as any)
      ).rejects.toThrow('File size exceeds 50MB limit');
    });

    it('should reject file with unsupported type', async () => {
      const invalidFile = new File(['test'], 'test.exe', {
        type: 'application/x-msdownload',
      });

      await expect(
        uploadVendorDocument('vendor-123', 'user-123', invalidFile, {} as any)
      ).rejects.toThrow('File type not supported');
    });

    it('should reject file failing virus scan', async () => {
      const mockFile = new File(['malicious'], 'malware.pdf', {
        type: 'application/pdf',
      });

      vi.mocked(scanFileForVirus).mockResolvedValue({
        clean: false,
        details: 'Virus detected',
      });

      await expect(
        uploadVendorDocument('vendor-123', 'user-123', mockFile, {} as any)
      ).rejects.toThrow('File failed virus scan');
    });
  });
});
```

### 7.2 Integration Tests

**Example Test**: `__tests__/api/registration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '@/app/api/register/route';
import { prisma } from '@/lib/prisma';

describe('Registration API', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.vendorRegistration.deleteMany({
      where: { taxId: { startsWith: 'TEST-' } },
    });
  });

  it('should accept valid registration request', async () => {
    const validRegistration = {
      legalName: 'Test Vendor Inc.',
      businessType: 'Corporation',
      taxId: 'TEST-12-3456789',
      // ... other required fields
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify(validRegistration),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.registrationId).toBeDefined();
    expect(data.registrationNumber).toMatch(/^REG-\d{4}-\d{4}$/);
  });

  it('should reject duplicate tax ID', async () => {
    // Create initial registration
    await prisma.vendorRegistration.create({
      data: {
        legalName: 'Existing Vendor',
        taxId: 'TEST-99-9999999',
        // ... other fields
      },
    });

    const duplicateRegistration = {
      legalName: 'Another Vendor',
      taxId: 'TEST-99-9999999',
      // ... other fields
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify(duplicateRegistration),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('DUPLICATE_VENDOR');
  });

  it('should validate required fields', async () => {
    const incompleteRegistration = {
      legalName: 'Test Vendor',
      // Missing required fields
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      body: JSON.stringify(incompleteRegistration),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### 7.3 End-to-End Tests

**Example Test**: `__tests__/e2e/registration-flow.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendor Registration Flow', () => {
  test('should complete full registration successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Step 1: Company Information
    await page.fill('input[name="legalName"]', 'E2E Test Vendor Inc.');
    await page.fill('input[name="taxId"]', '12-3456789');
    await page.selectOption('select[name="businessType"]', 'Corporation');
    await page.fill('input[name="yearEstablished"]', '2020');
    await page.fill('input[name="street1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.selectOption('select[name="state"]', 'CA');
    await page.fill('input[name="zipCode"]', '90210');
    await page.click('button:text("Next")');

    // Step 2: Contact Information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@e2etest.com');
    await page.fill('input[name="phone"]', '555-123-4567');
    await page.fill('input[name="title"]', 'CEO');
    await page.click('button:text("Next")');

    // Step 3: Business Details
    await page.check('input[value="Food & Beverage"]');
    await page.fill('textarea[name="productsServices"]', 'We provide high-quality food products for restaurants and hospitality businesses.');
    await page.selectOption('select[name="annualRevenue"]', '$1M-$5M');
    await page.selectOption('select[name="employeeCount"]', '11-50');
    await page.fill('input[name="bankName"]', 'Test Bank');
    await page.fill('input[name="accountNumber"]', '123456789');
    await page.fill('input[name="routingNumber"]', '021000021');
    await page.click('button:text("Next")');

    // Step 4: Documents & Terms
    // Upload business license
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('tests/fixtures/test-license.pdf');

    // Wait for upload to complete
    await expect(page.locator('text=Business License uploaded')).toBeVisible();

    // Accept terms
    await page.check('input[name="termsAccepted"]');
    await page.fill('input[name="signatureName"]', 'John Doe');
    await page.fill('input[name="signatureTitle"]', 'CEO');

    // Submit registration
    await page.click('button:text("Submit Registration")');

    // Verify success page
    await expect(page.locator('h1')).toContainText('Registration Submitted');
    await expect(page.locator('text=/REG-\\d{4}-\\d{4}/')).toBeVisible();
  });

  test('should save progress and resume later', async ({ page }) => {
    // Start registration
    await page.goto('/register');

    // Fill Step 1
    await page.fill('input[name="legalName"]', 'Resume Test Vendor');
    await page.fill('input[name="taxId"]', '98-7654321');
    await page.selectOption('select[name="businessType"]', 'LLC');

    // Save and exit
    await page.click('button:text("Save and Continue Later")');

    // Verify email message
    await expect(page.locator('text=Check your email for resume link')).toBeVisible();

    // Simulate clicking resume link (in real test, would retrieve from test email)
    // For demo purposes, manually navigate to resume URL
    const resumeToken = 'test-resume-token';
    await page.goto(`/register/resume?token=${resumeToken}`);

    // Verify data restored
    await expect(page.locator('input[name="legalName"]')).toHaveValue('Resume Test Vendor');
    await expect(page.locator('input[name="taxId"]')).toHaveValue('98-7654321');
  });
});
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

**Server-Side Caching with unstable_cache**:
```typescript
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getDashboardSummary = unstable_cache(
  async (vendorId: string) => {
    const [activePOs, pendingInvoices, openRFQs, performanceScore] =
      await Promise.all([
        prisma.purchaseOrder.count({
          where: {
            vendorId,
            status: { in: ['ISSUED', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
          },
        }),
        prisma.invoice.count({
          where: {
            vendorId,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] },
          },
        }),
        prisma.rfq.count({
          where: {
            invitedVendors: {
              some: {
                vendorId,
                bidStatus: 'pending',
              },
            },
            status: 'OPEN',
          },
        }),
        calculatePerformanceScore(vendorId),
      ]);

    return {
      activePOs,
      pendingInvoices,
      openRFQs,
      performanceScore,
    };
  },
  ['dashboard-summary'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['dashboard'],
  }
);
```

**Client-Side Caching with React Query**:
```typescript
// In component
const { data, isLoading } = useQuery({
  queryKey: ['dashboard-summary', vendorId],
  queryFn: async () => {
    const response = await fetch('/api/dashboard/summary');
    return response.json();
  },
  staleTime: 60000, // Data fresh for 1 minute
  cacheTime: 300000, // Keep in cache for 5 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: 'always',
});
```

### 8.2 Database Query Optimization

**Use Prisma Select for Specific Fields**:
```typescript
// Instead of fetching entire vendor object
const vendor = await prisma.vendor.findUnique({
  where: { id: vendorId },
  select: {
    id: true,
    legalName: true,
    vendorCode: true,
    status: true,
    // Only select needed fields
  },
});
```

**Batch Queries with Prisma**:
```typescript
// Batch multiple related queries
const [vendor, documents, notifications] = await prisma.$transaction([
  prisma.vendor.findUnique({ where: { id: vendorId } }),
  prisma.vendorDocument.findMany({
    where: { vendorId, currentVersion: true },
    orderBy: { uploadedAt: 'desc' },
    take: 10,
  }),
  prisma.vendorNotification.findMany({
    where: { vendorId, isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }),
]);
```

### 8.3 Image and Asset Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Company Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
  placeholder="blur" // Add blur placeholder
/>
```

**Font Optimization**:
```typescript
// In app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

---

## 9. Deployment Configuration

### 9.1 Environment Variables

**.env.example**:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/carmen_db"

# NextAuth
NEXTAUTH_URL="https://vendor.organization.com"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="vendor-portal-documents"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@organization.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Virus Scanning
CLAMAV_HOST="localhost"
CLAMAV_PORT="3310"

# Main ERP URLs (for integration)
NEXT_PUBLIC_ERP_URL="https://erp.organization.com"
PROCUREMENT_EMAIL="procurement@organization.com"

# Portal URL
NEXT_PUBLIC_PORTAL_URL="https://vendor.organization.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-token"

# Feature Flags
ENABLE_2FA="true"
ENABLE_SMS_NOTIFICATIONS="true"
```

### 9.2 Next.js Configuration

**next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: ['vendor-portal-documents.s3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // For document uploads
    },
  },

  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
  },
};

module.exports = nextConfig;
```

---

## Document History

| Version | Date       | Author | Changes                                |
|---------|------------|--------|----------------------------------------|
| 1.0     | 2024-01-15 | System | Initial technical specification        |

---

## Related Documents

- Vendor Entry Portal - Business Requirements (BR-vendor-portal.md)
- Vendor Entry Portal - Use Cases (UC-vendor-portal.md)
- Vendor Entry Portal - Flow Diagrams (FD-vendor-portal.md)
- Vendor Entry Portal - Validations (VAL-vendor-portal.md)
- Vendor Management - Module Overview (VENDOR-MANAGEMENT-OVERVIEW.md)

---

**End of Technical Specification Document**
