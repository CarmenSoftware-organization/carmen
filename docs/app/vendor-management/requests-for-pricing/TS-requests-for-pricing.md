# Requests for Pricing (RFQ) - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Requests for Pricing (RFQ)
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend**:
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.8.2 (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**:
  - Zustand (global UI state, RFQ wizard state)
  - React Query / TanStack Query (server state, caching)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with Lucide React icons
- **Date Handling**: date-fns
- **Rich Text Editor**: TipTap or Slate.js (for RFQ descriptions)
- **File Upload**: React Dropzone + AWS S3 Direct Upload

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers
- **ORM**: Prisma Client
- **Database**: PostgreSQL with JSONB support
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 / Azure Blob Storage
- **Email**: SendGrid / AWS SES / Resend
- **Search**: PostgreSQL Full-Text Search with GIN indexes
- **Scheduled Jobs**: node-cron or BullMQ (for deadline reminders, auto-closing)
- **PDF Generation**: react-pdf or PDFKit (for contracts, reports)

**Infrastructure**:
- **Hosting**: Vercel / AWS / Azure
- **CDN**: Vercel Edge Network / CloudFront
- **Monitoring**: Sentry (errors), Vercel Analytics (performance)
- **Version Control**: Git

### 1.2 Architecture Pattern

**Pattern**: Next.js App Router with Server Components (default) + Client Components (interactive)

```
app/
└── (main)/
    └── vendor-management/
        └── requests-for-pricing/
            ├── page.tsx                    # Server Component (RFQ list view)
            ├── [id]/
            │   ├── page.tsx               # Server Component (RFQ detail view)
            │   ├── edit/
            │   │   └── page.tsx           # Server Component with Client wizard
            │   ├── bids/
            │   │   ├── page.tsx           # Server Component (bids list)
            │   │   └── [bidId]/
            │   │       └── page.tsx       # Server Component (bid detail)
            │   ├── evaluation/
            │   │   └── page.tsx           # Client Component (evaluation workspace)
            │   └── award/
            │       └── page.tsx           # Server Component with Client form
            ├── new/
            │   └── page.tsx               # Server Component with Client wizard
            ├── components/
            │   ├── RFQList.tsx            # Client Component (interactive list)
            │   ├── RFQCard.tsx            # Server Component
            │   ├── RFQWizard.tsx          # Client Component (multi-step wizard)
            │   ├── RequirementsBuilder.tsx # Client Component
            │   ├── VendorSelector.tsx     # Client Component
            │   ├── TimelineConfig.tsx     # Client Component
            │   ├── EvaluationCriteria.tsx # Client Component
            │   ├── BidList.tsx            # Client Component
            │   ├── BidComparison.tsx      # Client Component (side-by-side)
            │   ├── EvaluationMatrix.tsx   # Client Component (scoring)
            │   ├── NegotiationWorkspace.tsx # Client Component
            │   └── ContractGenerator.tsx  # Client Component
            ├── actions.ts                 # Server Actions (mutations)
            └── types.ts                   # TypeScript interfaces
```

### 1.3 Data Flow Architecture

```
User Interface (Client Components)
        ↓
Server Actions / Route Handlers
        ↓
Business Logic Layer (Validation, Business Rules)
        ↓
Prisma ORM
        ↓
PostgreSQL Database (JSONB fields)
        ↓
External Services (Email, File Storage, Notifications)
```

**Key Principles**:
- Server Components for data fetching (default)
- Client Components only for interactivity (wizard, evaluation, comparison)
- Server Actions for mutations (preferred over API routes)
- React Query for client-side caching and optimistic updates
- Multi-step wizard with client-side state management (Zustand)
- Real-time collaboration support for multi-evaluator scenarios

---

## 2. Database Implementation

### 2.1 Database Schema

#### 2.1.1 RFQ Campaign Table

```prisma
// prisma/schema.prisma

model RFQCampaign {
  id                String            @id @default(uuid())
  rfqNumber         String            @unique
  title             String
  description       String?           @db.Text
  category          String
  type              RFQType
  status            RFQStatus         @default(DRAFT)
  budgetRange       Decimal?          @db.Decimal(15, 2)
  currency          String            @default("USD")

  // Ownership & Department
  createdBy         String
  department        String?
  location          String?
  priority          Priority          @default(MEDIUM)

  // JSON fields for flexible data
  timeline          Json              // Timeline configuration
  requirements      Json              // Requirements and line items
  evaluation        Json              // Evaluation criteria and config
  terms             Json              // Terms and conditions

  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  publishedAt       DateTime?
  closedAt          DateTime?
  awardedAt         DateTime?
  deletedAt         DateTime?

  // Relations
  invitations       VendorInvitation[]
  bids              RFQBid[]
  evaluations       BidEvaluation[]
  awards            RFQAward[]
  negotiations      Negotiation[]
  contracts         Contract[]

  @@map("tb_rfq_campaign")
  @@index([status, deletedAt])
  @@index([createdBy])
  @@index([rfqNumber])
}

enum RFQType {
  GOODS
  SERVICES
  WORKS
  MIXED
}

enum RFQStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  OPEN
  CLOSED
  UNDER_REVIEW
  EVALUATED
  AWARDED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### 2.1.2 Vendor Invitation Table

```prisma
model VendorInvitation {
  id                String            @id @default(uuid())
  rfqId             String
  vendorId          String

  // Invitation details
  invitedAt         DateTime          @default(now())
  invitedBy         String
  invitationMessage String?           @db.Text

  // Status tracking
  status            InvitationStatus  @default(INVITED)
  viewedAt          DateTime?
  acknowledgedAt    DateTime?

  // Notifications
  emailSent         Boolean           @default(false)
  emailSentAt       DateTime?
  remindersSent     Int               @default(0)
  lastReminderAt    DateTime?

  // Relations
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id], onDelete: Cascade)

  @@map("tb_rfq_vendor_invitation")
  @@unique([rfqId, vendorId])
  @@index([vendorId])
  @@index([status])
}

enum InvitationStatus {
  INVITED
  VIEWED
  ACKNOWLEDGED
  BID_SUBMITTED
  DECLINED
  WITHDRAWN
}
```

#### 2.1.3 RFQ Bid Table

```prisma
model RFQBid {
  id                String            @id @default(uuid())
  bidNumber         String            @unique
  rfqId             String
  vendorId          String

  // Bid details
  totalBidValue     Decimal           @db.Decimal(15, 2)
  currency          String
  validityPeriod    Int               // days
  status            BidStatus         @default(DRAFT)

  // JSON fields
  lineItems         Json              // Line item pricing
  commercialTerms   Json              // Commercial terms
  technicalCompliance Json            // Technical compliance
  documents         Json              // Document references

  // Submission tracking
  submittedAt       DateTime?
  submittedBy       String?
  lastModifiedAt    DateTime?
  version           Int               @default(1)

  // Evaluation results
  overallScore      Decimal?          @db.Decimal(5, 2)
  rank              Int?

  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  withdrawnAt       DateTime?

  // Relations
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  evaluations       BidEvaluation[]
  award             RFQAward?
  negotiation       Negotiation?

  @@map("tb_rfq_bid")
  @@index([rfqId, status])
  @@index([vendorId])
  @@index([status])
}

enum BidStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  SHORTLISTED
  AWARDED
  REJECTED
  WITHDRAWN
  DISQUALIFIED
}
```

#### 2.1.4 Bid Evaluation Table

```prisma
model BidEvaluation {
  id                String            @id @default(uuid())
  bidId             String
  evaluatorId       String

  // Evaluation details
  criteriaScores    Json              // Scores by criterion
  totalScore        Decimal           @db.Decimal(5, 2)
  comments          String?           @db.Text
  recommendation    String?           @db.Text

  // Status
  status            EvaluationStatus  @default(IN_PROGRESS)
  startedAt         DateTime          @default(now())
  completedAt       DateTime?

  // Relations
  bid               RFQBid            @relation(fields: [bidId], references: [id], onDelete: Cascade)
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  rfqId             String

  @@map("tb_rfq_bid_evaluation")
  @@unique([bidId, evaluatorId])
  @@index([rfqId])
  @@index([evaluatorId])
}

enum EvaluationStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  APPROVED
}
```

#### 2.1.5 RFQ Award Table

```prisma
model RFQAward {
  id                String            @id @default(uuid())
  awardNumber       String            @unique
  rfqId             String
  bidId             String            @unique
  vendorId          String

  // Award details
  awardValue        Decimal           @db.Decimal(15, 2)
  currency          String
  awardType         AwardType         @default(FULL)

  // Award decision
  awardedBy         String
  awardedAt         DateTime          @default(now())
  justification     String            @db.Text
  specialConditions String?           @db.Text

  // Approval tracking
  approvalStatus    ApprovalStatus    @default(PENDING)
  approvedBy        String?
  approvedAt        DateTime?
  approvalComments  String?           @db.Text

  // Contract details
  contractDuration  Int?              // months
  effectiveDate     DateTime?
  expiryDate        DateTime?

  // Status
  status            AwardStatus       @default(PENDING_ACCEPTANCE)
  vendorAcceptedAt  DateTime?
  rejectedAt        DateTime?
  rejectionReason   String?           @db.Text

  // Relations
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  bid               RFQBid            @relation(fields: [bidId], references: [id])
  contracts         Contract[]

  @@map("tb_rfq_award")
  @@index([rfqId])
  @@index([vendorId])
  @@index([status])
}

enum AwardType {
  FULL
  PARTIAL
  SPLIT
  CONDITIONAL
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  ESCALATED
}

enum AwardStatus {
  PENDING_ACCEPTANCE
  ACCEPTED
  REJECTED
  CANCELLED
  COMPLETED
}
```

#### 2.1.6 Negotiation Table

```prisma
model Negotiation {
  id                String            @id @default(uuid())
  rfqId             String
  bidId             String            @unique
  vendorId          String

  // Negotiation details
  status            NegotiationStatus @default(IN_PROGRESS)
  initiatedBy       String
  initiatedAt       DateTime          @default(now())
  deadline          DateTime?

  // Current state
  currentOffer      Json              // Latest offer details
  offerHistory      Json              // Array of all offers

  // Outcome
  completedAt       DateTime?
  outcome           String?           // AGREEMENT_REACHED, NO_AGREEMENT, CANCELLED
  finalTerms        Json?
  savingsAchieved   Decimal?          @db.Decimal(15, 2)

  // Relations
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  bid               RFQBid            @relation(fields: [bidId], references: [id])
  messages          NegotiationMessage[]

  @@map("tb_rfq_negotiation")
  @@index([rfqId])
  @@index([vendorId])
  @@index([status])
}

enum NegotiationStatus {
  IN_PROGRESS
  AGREEMENT_REACHED
  NO_AGREEMENT
  EXPIRED
  CANCELLED
}
```

#### 2.1.7 Negotiation Message Table

```prisma
model NegotiationMessage {
  id                String            @id @default(uuid())
  negotiationId     String

  // Message details
  messageType       MessageType
  senderType        String            // 'buyer' or 'vendor'
  senderId          String
  message           String            @db.Text
  offerDetails      Json?             // If this is an offer/counteroffer

  // Timestamps
  sentAt            DateTime          @default(now())
  readAt            DateTime?

  // Relations
  negotiation       Negotiation       @relation(fields: [negotiationId], references: [id], onDelete: Cascade)

  @@map("tb_rfq_negotiation_message")
  @@index([negotiationId, sentAt])
}

enum MessageType {
  MESSAGE
  OFFER
  COUNTEROFFER
  ACCEPT
  REJECT
  CLARIFICATION
}
```

#### 2.1.8 Contract Table

```prisma
model Contract {
  id                String            @id @default(uuid())
  contractNumber    String            @unique
  rfqId             String
  awardId           String
  vendorId          String

  // Contract details
  contractType      String
  title             String
  contractValue     Decimal           @db.Decimal(15, 2)
  currency          String

  // Contract document
  documentUrl       String?
  documentVersion   Int               @default(1)

  // Contract terms
  terms             Json              // All contract terms
  effectiveDate     DateTime
  expiryDate        DateTime?
  duration          Int?              // months

  // Status
  status            ContractStatus    @default(DRAFT)
  createdBy         String
  createdAt         DateTime          @default(now())

  // Signatures
  buyerSignedBy     String?
  buyerSignedAt     DateTime?
  vendorSignedBy    String?
  vendorSignedAt    DateTime?
  fullyExecutedAt   DateTime?

  // Relations
  rfq               RFQCampaign       @relation(fields: [rfqId], references: [id])
  award             RFQAward          @relation(fields: [awardId], references: [id])

  @@map("tb_rfq_contract")
  @@index([rfqId])
  @@index([vendorId])
  @@index([status])
}

enum ContractStatus {
  DRAFT
  PENDING_LEGAL_REVIEW
  PENDING_BUYER_SIGNATURE
  PENDING_VENDOR_SIGNATURE
  FULLY_EXECUTED
  ACTIVE
  EXPIRED
  TERMINATED
}
```

### 2.2 JSON Structure Implementation

#### 2.2.1 RFQCampaign.timeline JSON Structure

```typescript
// lib/types/rfq.ts

interface RFQTimeline {
  publishDate: string;          // ISO 8601 datetime
  bidOpenDate: string;          // ISO 8601 datetime
  bidCloseDate: string;         // ISO 8601 datetime
  awardTargetDate?: string;     // ISO 8601 datetime

  // Optional events
  preBidConference?: {
    date: string;
    time: string;
    location?: string;
    isVirtual: boolean;
    meetingLink?: string;
  };

  siteVisit?: {
    date: string;
    time: string;
    location: string;
    contactPerson?: string;
    contactPhone?: string;
  };

  // Reminders configuration
  reminders: Array<{
    type: 'pre_bid' | 'closing_reminder' | 'final_reminder';
    daysBeforeClosing: number;
    enabled: boolean;
  }>;
}
```

#### 2.2.2 RFQCampaign.requirements JSON Structure

```typescript
interface RFQRequirements {
  // Line items
  items: Array<{
    id: string;                   // Unique item ID
    itemNumber: string;           // e.g., "001", "002"
    description: string;
    productCode?: string;
    quantity: number;
    uom: string;

    specifications: {
      technical?: Record<string, any>;
      quality?: string;
      brand?: string;
      model?: string;
      customAttributes?: Record<string, any>;
    };

    delivery: {
      location: string;
      locationId?: string;
      requiredDate: string;
      earliestDate?: string;
      latestDate?: string;
    };

    samplesRequired: boolean;
    isRequired: boolean;          // true = required, false = optional
    estimatedBudget?: number;
  }>;

  // General requirements
  generalRequirements: {
    warranty?: string;
    qualityStandards?: string[];
    certifications?: string[];
    compliance?: string[];
    specialInstructions?: string;
  };

  // Attachments
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
    category: 'specification' | 'drawing' | 'sample' | 'other';
  }>;
}
```

#### 2.2.3 RFQCampaign.evaluation JSON Structure

```typescript
interface RFQEvaluation {
  // Evaluation criteria
  criteria: Array<{
    id: string;
    name: string;
    type: 'price' | 'quality' | 'delivery' | 'service' | 'technical' | 'custom';
    weight: number;               // percentage, must sum to 100
    scoringMethod: 'points_1_10' | 'pass_fail' | 'percentage';
    description?: string;
    guidelines?: string;
  }>;

  // Scoring method
  scoringMethod: 'lowest_price' | 'weighted_average' | 'technical_commercial';

  // Technical-commercial split (if applicable)
  technicalCommercialSplit?: {
    technicalWeight: number;      // percentage
    commercialWeight: number;     // percentage
    technicalThreshold: number;   // minimum score to pass technical
  };

  // Evaluators
  evaluators: Array<{
    userId: string;
    userName: string;
    role: string;
    assignedCriteria?: string[];  // criterion IDs
    evaluationDeadline?: string;
  }>;

  // Settings
  settings: {
    allowVendorClarifications: boolean;
    clarificationDeadline?: string;
    blindEvaluation: boolean;     // evaluators can't see each other's scores
    requireJustification: boolean;
  };
}
```

#### 2.2.4 RFQCampaign.terms JSON Structure

```typescript
interface RFQTerms {
  // Payment terms
  paymentTerms: {
    termsType: string;            // e.g., "Net 30", "Net 45"
    description?: string;
    milestones?: Array<{
      milestone: string;
      percentage: number;
      dueDate?: string;
    }>;
  };

  // Delivery terms
  deliveryTerms: {
    incoterm?: string;            // e.g., "FOB", "CIF", "DDP"
    description?: string;
    shippingInstructions?: string;
  };

  // Bid validity
  bidValidity: {
    period: number;               // days
    startFrom: 'bid_closing' | 'bid_submission';
  };

  // Bonds and guarantees
  bondsRequired: {
    bidBond?: {
      required: boolean;
      percentage?: number;
      amount?: number;
    };
    performanceBond?: {
      required: boolean;
      percentage?: number;
      amount?: number;
    };
  };

  // Insurance
  insuranceRequirements?: {
    liabilityCoverage?: number;
    workersCompensation?: boolean;
    productLiability?: number;
  };

  // Penalties
  liquidatedDamages?: {
    applicable: boolean;
    lateDeliveryPenalty?: string;
    qualityFailurePenalty?: string;
    maxPenaltyCap?: number;
  };

  // Termination
  terminationClauses: {
    noticePeriod: number;         // days
    conditions?: string[];
    penalties?: string;
  };

  // Other terms
  specialConditions?: string;
  disputeResolution?: string;
  governingLaw?: string;
}
```

#### 2.2.5 RFQBid.lineItems JSON Structure

```typescript
interface BidLineItems {
  items: Array<{
    itemId: string;               // Reference to RFQ item ID
    itemNumber: string;

    // Pricing
    unitPrice: number;
    currency: string;
    totalPrice: number;           // quantity × unitPrice

    // Product details
    brand?: string;
    manufacturer?: string;
    model?: string;
    partNumber?: string;

    // Delivery
    deliveryDate: string;
    leadTime?: number;            // days

    // Compliance
    complianceStatus: 'full' | 'partial' | 'non_compliant' | 'alternative';
    complianceNotes?: string;
    alternativeOffered?: {
      description: string;
      reason: string;
      price: number;
    };

    // Documents
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      documentType: string;
    }>;
  }>;

  // Summary
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  totalBidValue: number;
}
```

#### 2.2.6 RFQBid.commercialTerms JSON Structure

```typescript
interface BidCommercialTerms {
  // Payment terms
  paymentTerms: {
    offered: string;              // e.g., "Net 45"
    matchesRFQ: boolean;
    variance?: string;
  };

  // Delivery terms
  deliveryTerms: {
    incoterm?: string;
    description?: string;
    matchesRFQ: boolean;
  };

  // Warranty
  warranty: {
    period: number;               // months or years
    unit: 'months' | 'years';
    coverage: string;
    terms?: string;
  };

  // After-sales service
  afterSalesService?: {
    available: boolean;
    description?: string;
    responseTime?: string;
    supportHours?: string;
  };

  // Bonds acceptance
  bonds: {
    bidBondProvided?: boolean;
    performanceBondAccepted?: boolean;
    bondProvider?: string;
  };

  // Insurance
  insurance: {
    liabilityCoverageProvided?: number;
    workersCompensation?: boolean;
    productLiability?: number;
    insuranceProvider?: string;
  };

  // Penalty acceptance
  penaltiesAccepted: {
    lateDelivery: boolean;
    qualityFailure: boolean;
    comments?: string;
  };

  // Alternative terms proposed
  alternativeTerms?: Array<{
    termType: string;
    proposed: string;
    justification: string;
  }>;
}
```

#### 2.2.7 RFQBid.technicalCompliance JSON Structure

```typescript
interface BidTechnicalCompliance {
  requirements: Array<{
    requirementId: string;
    requirementName: string;
    complianceStatus: 'compliant' | 'partial' | 'non_compliant';
    evidence?: string;
    supportingDocs?: string[];
    explanation?: string;
  }>;

  // Certifications
  certifications: Array<{
    type: string;
    certificateNumber: string;
    issuedBy: string;
    issueDate: string;
    expiryDate?: string;
    documentUrl?: string;
  }>;

  // Technical documents
  technicalDocuments: Array<{
    documentType: 'datasheet' | 'brochure' | 'test_report' | 'certification' | 'other';
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;

  // Technical narrative
  technicalNarrative?: string;

  // Compliance summary
  overallCompliance: {
    percentageCompliant: number;
    criticalRequirementsMet: boolean;
    summary: string;
  };
}
```

### 2.3 Database Indexes

```sql
-- RFQ Campaign indexes
CREATE INDEX idx_rfq_campaign_status ON tb_rfq_campaign(status, deleted_at)
WHERE deleted_at IS NULL;

CREATE INDEX idx_rfq_campaign_created_by ON tb_rfq_campaign(created_by);

CREATE INDEX idx_rfq_campaign_number ON tb_rfq_campaign(rfq_number);

-- Full-text search on RFQ title and description
CREATE INDEX idx_rfq_search ON tb_rfq_campaign
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- JSON field indexes
CREATE INDEX idx_rfq_timeline_close_date ON tb_rfq_campaign
((timeline->>'bidCloseDate'));

CREATE INDEX idx_rfq_budget ON tb_rfq_campaign(budget_range)
WHERE budget_range IS NOT NULL;

-- Vendor invitation indexes
CREATE INDEX idx_vendor_invitation_rfq ON tb_rfq_vendor_invitation(rfq_id, status);

CREATE INDEX idx_vendor_invitation_vendor ON tb_rfq_vendor_invitation(vendor_id);

-- RFQ Bid indexes
CREATE INDEX idx_rfq_bid_rfq_status ON tb_rfq_bid(rfq_id, status);

CREATE INDEX idx_rfq_bid_vendor ON tb_rfq_bid(vendor_id);

CREATE INDEX idx_rfq_bid_number ON tb_rfq_bid(bid_number);

CREATE INDEX idx_rfq_bid_rank ON tb_rfq_bid(rfq_id, rank)
WHERE rank IS NOT NULL;

-- Bid evaluation indexes
CREATE INDEX idx_bid_evaluation_bid ON tb_rfq_bid_evaluation(bid_id, evaluator_id);

CREATE INDEX idx_bid_evaluation_rfq ON tb_rfq_bid_evaluation(rfq_id, status);

-- Award indexes
CREATE INDEX idx_rfq_award_rfq ON tb_rfq_award(rfq_id);

CREATE INDEX idx_rfq_award_vendor ON tb_rfq_award(vendor_id);

CREATE INDEX idx_rfq_award_status ON tb_rfq_award(status);

-- Negotiation indexes
CREATE INDEX idx_negotiation_rfq ON tb_rfq_negotiation(rfq_id, status);

CREATE INDEX idx_negotiation_vendor ON tb_rfq_negotiation(vendor_id);

-- Contract indexes
CREATE INDEX idx_contract_rfq ON tb_rfq_contract(rfq_id);

CREATE INDEX idx_contract_vendor ON tb_rfq_contract(vendor_id);

CREATE INDEX idx_contract_status ON tb_rfq_contract(status);

CREATE INDEX idx_contract_expiry ON tb_rfq_contract(expiry_date)
WHERE expiry_date IS NOT NULL AND status = 'ACTIVE';
```

---

## 3. Component Architecture

### 3.1 Page Components

#### 3.1.1 RFQ List Page

**File**: `app/(main)/vendor-management/requests-for-pricing/page.tsx`
**Type**: Server Component

```typescript
// app/(main)/vendor-management/requests-for-pricing/page.tsx

import { Suspense } from 'react';
import { RFQList } from './components/RFQList';
import { RFQListSkeleton } from './components/RFQListSkeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    type?: string;
  };
}

export default async function RFQPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const status = searchParams.status || 'all';
  const type = searchParams.type || 'all';

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Requests for Pricing (RFQ)</h1>
          <p className="text-muted-foreground mt-2">
            Manage competitive bidding campaigns and vendor proposals
          </p>
        </div>
        <Link href="/vendor-management/requests-for-pricing/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
        </Link>
      </div>

      <Suspense fallback={<RFQListSkeleton />}>
        <RFQList
          initialPage={page}
          initialSearch={search}
          initialStatus={status}
          initialType={type}
        />
      </Suspense>
    </div>
  );
}
```

#### 3.1.2 RFQ Creation Page (Wizard)

**File**: `app/(main)/vendor-management/requests-for-pricing/new/page.tsx`
**Type**: Server Component with Client Wizard

```typescript
// app/(main)/vendor-management/requests-for-pricing/new/page.tsx

import { RFQWizard } from '../components/RFQWizard';
import { getVendors } from '@/app/(main)/vendor-management/manage-vendors/actions';
import { getProducts } from '@/app/(main)/product-management/actions';

export default async function NewRFQPage() {
  // Fetch data needed for wizard
  const vendors = await getVendors({ status: 'approved' });
  const products = await getProducts({ active: true });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New RFQ</h1>
        <p className="text-muted-foreground mt-2">
          Create a new request for pricing campaign
        </p>
      </div>

      <RFQWizard
        vendors={vendors}
        products={products}
      />
    </div>
  );
}
```

#### 3.1.3 RFQ Detail Page

**File**: `app/(main)/vendor-management/requests-for-pricing/[id]/page.tsx`
**Type**: Server Component

```typescript
// app/(main)/vendor-management/requests-for-pricing/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getRFQById } from '../actions';
import { RFQHeader } from '../components/RFQHeader';
import { RFQTabs } from '../components/RFQTabs';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RFQDetailPage({ params }: PageProps) {
  const rfq = await getRFQById(params.id);

  if (!rfq) {
    notFound();
  }

  // Parse JSON fields
  const timeline = rfq.timeline as RFQTimeline;
  const requirements = rfq.requirements as RFQRequirements;
  const evaluation = rfq.evaluation as RFQEvaluation;

  return (
    <div className="container mx-auto py-6">
      <RFQHeader
        rfq={rfq}
        timeline={timeline}
      />

      <RFQTabs
        rfqId={rfq.id}
        rfq={rfq}
        requirements={requirements}
        evaluation={evaluation}
      />
    </div>
  );
}
```

### 3.2 Client Components

#### 3.2.1 RFQ Wizard Component

**File**: `app/(main)/vendor-management/requests-for-pricing/components/RFQWizard.tsx`
**Type**: Client Component

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rfqSchema } from '../validations';
import { createRFQ } from '../actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Wizard steps
import { BasicInfoStep } from './wizard-steps/BasicInfoStep';
import { RequirementsStep } from './wizard-steps/RequirementsStep';
import { VendorSelectionStep } from './wizard-steps/VendorSelectionStep';
import { TimelineStep } from './wizard-steps/TimelineStep';
import { EvaluationStep } from './wizard-steps/EvaluationStep';
import { TermsStep } from './wizard-steps/TermsStep';
import { ReviewStep } from './wizard-steps/ReviewStep';

import type { Vendor, Product } from '@/lib/types';

interface RFQWizardProps {
  vendors: Vendor[];
  products: Product[];
  rfq?: any; // For editing existing RFQ
}

const STEPS = [
  { id: 1, name: 'Basic Information', description: 'RFQ details and description' },
  { id: 2, name: 'Requirements', description: 'Line items and specifications' },
  { id: 3, name: 'Vendor Selection', description: 'Invite qualified vendors' },
  { id: 4, name: 'Timeline', description: 'Bidding schedule and deadlines' },
  { id: 5, name: 'Evaluation', description: 'Criteria and scoring method' },
  { id: 6, name: 'Terms & Conditions', description: 'Payment and delivery terms' },
  { id: 7, name: 'Review & Publish', description: 'Review and finalize' },
];

export function RFQWizard({ vendors, products, rfq }: RFQWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(rfqSchema),
    defaultValues: rfq || {
      // Default values for new RFQ
      title: '',
      description: '',
      type: 'GOODS',
      category: '',
      priority: 'MEDIUM',
      requirements: {
        items: [],
        generalRequirements: {},
        attachments: [],
      },
      timeline: {
        bidOpenDate: new Date().toISOString(),
        bidCloseDate: '',
        reminders: [
          { type: 'closing_reminder', daysBeforeClosing: 7, enabled: true },
          { type: 'final_reminder', daysBeforeClosing: 1, enabled: true },
        ],
      },
      evaluation: {
        criteria: [],
        scoringMethod: 'weighted_average',
        evaluators: [],
        settings: {
          allowVendorClarifications: true,
          blindEvaluation: false,
          requireJustification: true,
        },
      },
      terms: {},
      selectedVendors: [],
    },
  });

  const handleNext = async () => {
    // Validate current step before proceeding
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields);

    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const result = await createRFQ({ ...data, status: 'DRAFT' });

      if (result.success) {
        toast({
          title: 'Draft saved',
          description: 'Your RFQ has been saved as a draft.',
        });
        router.push(`/vendor-management/requests-for-pricing/${result.rfqId}`);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save draft',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const result = await createRFQ({ ...data, status: 'PUBLISHED' });

      if (result.success) {
        toast({
          title: 'RFQ Published',
          description: 'Your RFQ has been published and vendors have been invited.',
        });
        router.push(`/vendor-management/requests-for-pricing/${result.rfqId}`);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to publish RFQ',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep
                  ? 'text-primary font-semibold'
                  : step.id < currentStep
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
              }`}
            >
              <div className="text-sm">{step.name}</div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {currentStep === 1 && (
          <BasicInfoStep form={form} />
        )}
        {currentStep === 2 && (
          <RequirementsStep form={form} products={products} />
        )}
        {currentStep === 3 && (
          <VendorSelectionStep form={form} vendors={vendors} />
        )}
        {currentStep === 4 && (
          <TimelineStep form={form} />
        )}
        {currentStep === 5 && (
          <EvaluationStep form={form} />
        )}
        {currentStep === 6 && (
          <TermsStep form={form} />
        )}
        {currentStep === 7 && (
          <ReviewStep form={form} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              Publish RFQ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get fields to validate for each step
function getStepFields(step: number): string[] {
  switch (step) {
    case 1:
      return ['title', 'type', 'category', 'description'];
    case 2:
      return ['requirements.items'];
    case 3:
      return ['selectedVendors'];
    case 4:
      return ['timeline.bidCloseDate'];
    case 5:
      return ['evaluation.criteria', 'evaluation.scoringMethod'];
    case 6:
      return ['terms.paymentTerms', 'terms.deliveryTerms'];
    default:
      return [];
  }
}
```

#### 3.2.2 Bid Comparison Component

**File**: `app/(main)/vendor-management/requests-for-pricing/components/BidComparison.tsx`
**Type**: Client Component

```typescript
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Check, X } from 'lucide-react';
import type { RFQBid, BidLineItems } from '@/lib/types';

interface BidComparisonProps {
  bids: RFQBid[];
  requirements: any;
}

export function BidComparison({ bids, requirements }: BidComparisonProps) {
  const [sortBy, setSortBy] = useState<'price' | 'score' | 'delivery'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort bids
  const sortedBids = useMemo(() => {
    const sorted = [...bids].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.totalBidValue;
          bValue = b.totalBidValue;
          break;
        case 'score':
          aValue = a.overallScore || 0;
          bValue = b.overallScore || 0;
          break;
        case 'delivery':
          const aLineItems = a.lineItems as BidLineItems;
          const bLineItems = b.lineItems as BidLineItems;
          aValue = new Date(aLineItems.items[0]?.deliveryDate || 0).getTime();
          bValue = new Date(bLineItems.items[0]?.deliveryDate || 0).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [bids, sortBy, sortOrder]);

  // Find best values for highlighting
  const lowestPrice = Math.min(...bids.map(b => b.totalBidValue));
  const highestScore = Math.max(...bids.map(b => b.overallScore || 0));

  const handleSort = (column: 'price' | 'score' | 'delivery') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Comparison Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Total Bids</div>
          <div className="text-2xl font-bold">{bids.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Lowest Bid</div>
          <div className="text-2xl font-bold">
            ${lowestPrice.toLocaleString()}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Price Range</div>
          <div className="text-2xl font-bold">
            {((Math.max(...bids.map(b => b.totalBidValue)) - lowestPrice) / lowestPrice * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Highest Score</div>
          <div className="text-2xl font-bold">{highestScore}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('price')}
                >
                  Total Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('score')}
                >
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('delivery')}
                >
                  Delivery
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBids.map((bid, index) => {
              const lineItems = bid.lineItems as BidLineItems;
              const isLowest = bid.totalBidValue === lowestPrice;
              const isHighestScore = bid.overallScore === highestScore;

              return (
                <TableRow key={bid.id}>
                  <TableCell>
                    {bid.rank ? (
                      <Badge variant={bid.rank === 1 ? 'default' : 'secondary'}>
                        #{bid.rank}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {bid.vendorId}
                  </TableCell>
                  <TableCell>
                    <div className={isLowest ? 'text-green-600 font-semibold' : ''}>
                      ${bid.totalBidValue.toLocaleString()}
                      {isLowest && <Check className="inline ml-1 h-4 w-4" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={isHighestScore ? 'text-green-600 font-semibold' : ''}>
                      {bid.overallScore?.toFixed(1) || '-'}
                      {isHighestScore && <Check className="inline ml-1 h-4 w-4" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lineItems.items[0]?.deliveryDate
                      ? new Date(lineItems.items[0].deliveryDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lineItems.items.filter(i => i.complianceStatus === 'full').length}/
                      {lineItems.items.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bid.status === 'AWARDED'
                          ? 'default'
                          : bid.status === 'SHORTLISTED'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## 4. Server Actions

### 4.1 RFQ Management Actions

**File**: `app/(main)/vendor-management/requests-for-pricing/actions.ts`

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { rfqSchema } from './validations';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import { generateRFQNumber } from '@/lib/utils/generators';

/**
 * Create new RFQ campaign
 */
export async function createRFQ(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate data
    const validated = rfqSchema.parse(data);

    // Generate RFQ number
    const rfqNumber = await generateRFQNumber(validated.category);

    // Create RFQ
    const rfq = await prisma.rFQCampaign.create({
      data: {
        rfqNumber,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        type: validated.type,
        status: validated.status || 'DRAFT',
        budgetRange: validated.budgetRange,
        currency: validated.currency || 'USD',
        priority: validated.priority || 'MEDIUM',
        timeline: validated.timeline,
        requirements: validated.requirements,
        evaluation: validated.evaluation,
        terms: validated.terms,
        createdBy: user.id,
        department: user.department,
        location: user.location,
      },
    });

    // If publishing, invite vendors
    if (validated.status === 'PUBLISHED' && validated.selectedVendors?.length > 0) {
      await inviteVendorsToRFQ(rfq.id, validated.selectedVendors, user.id);
    }

    revalidatePath('/vendor-management/requests-for-pricing');

    return { success: true, rfqId: rfq.id };
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return {
      success: false,
      error: error.message || 'Failed to create RFQ',
    };
  }
}

/**
 * Invite vendors to RFQ
 */
export async function inviteVendorsToRFQ(
  rfqId: string,
  vendorIds: string[],
  invitedBy: string,
  customMessage?: string
) {
  try {
    // Get RFQ details
    const rfq = await prisma.rFQCampaign.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      throw new Error('RFQ not found');
    }

    // Create invitation records
    const invitations = await prisma.vendorInvitation.createMany({
      data: vendorIds.map(vendorId => ({
        rfqId,
        vendorId,
        invitedBy,
        invitationMessage: customMessage,
        status: 'INVITED',
      })),
      skipDuplicates: true,
    });

    // Send invitation emails
    for (const vendorId of vendorIds) {
      await sendRFQInvitationEmail(rfqId, vendorId, customMessage);
    }

    revalidatePath(`/vendor-management/requests-for-pricing/${rfqId}`);

    return { success: true, invitationsCount: invitations.count };
  } catch (error: any) {
    console.error('Error inviting vendors:', error);
    return {
      success: false,
      error: error.message || 'Failed to invite vendors',
    };
  }
}

/**
 * Submit bid (vendor action)
 */
export async function submitBid(rfqId: string, bidData: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if RFQ is still open
    const rfq = await prisma.rFQCampaign.findUnique({
      where: { id: rfqId },
    });

    if (!rfq || rfq.status !== 'OPEN') {
      return { success: false, error: 'RFQ is not accepting bids' };
    }

    // Check deadline
    const timeline = rfq.timeline as any;
    if (new Date() > new Date(timeline.bidCloseDate)) {
      return { success: false, error: 'Bid deadline has passed' };
    }

    // Generate bid number
    const bidNumber = await generateBidNumber(rfqId);

    // Create or update bid
    const bid = await prisma.rFQBid.upsert({
      where: {
        rfqId_vendorId: {
          rfqId,
          vendorId: user.vendorId || user.id,
        },
      },
      create: {
        bidNumber,
        rfqId,
        vendorId: user.vendorId || user.id,
        totalBidValue: bidData.totalBidValue,
        currency: bidData.currency,
        validityPeriod: bidData.validityPeriod,
        status: 'SUBMITTED',
        lineItems: bidData.lineItems,
        commercialTerms: bidData.commercialTerms,
        technicalCompliance: bidData.technicalCompliance,
        documents: bidData.documents,
        submittedAt: new Date(),
        submittedBy: user.id,
      },
      update: {
        totalBidValue: bidData.totalBidValue,
        currency: bidData.currency,
        validityPeriod: bidData.validityPeriod,
        status: 'SUBMITTED',
        lineItems: bidData.lineItems,
        commercialTerms: bidData.commercialTerms,
        technicalCompliance: bidData.technicalCompliance,
        documents: bidData.documents,
        submittedAt: new Date(),
        submittedBy: user.id,
        version: { increment: 1 },
        lastModifiedAt: new Date(),
      },
    });

    // Update invitation status
    await prisma.vendorInvitation.update({
      where: {
        rfqId_vendorId: {
          rfqId,
          vendorId: user.vendorId || user.id,
        },
      },
      data: {
        status: 'BID_SUBMITTED',
      },
    });

    // Send confirmation email to vendor
    await sendBidConfirmationEmail(bid.id, user.email);

    // Notify procurement team
    await notifyProcurementTeamOfNewBid(rfqId, bid.id);

    revalidatePath(`/vendor-management/requests-for-pricing/${rfqId}`);

    return { success: true, bidId: bid.id, bidNumber: bid.bidNumber };
  } catch (error: any) {
    console.error('Error submitting bid:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit bid',
    };
  }
}

/**
 * Evaluate bid
 */
export async function evaluateBid(bidId: string, evaluationData: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get bid details
    const bid = await prisma.rFQBid.findUnique({
      where: { id: bidId },
      include: { rfq: true },
    });

    if (!bid) {
      return { success: false, error: 'Bid not found' };
    }

    // Create or update evaluation
    const evaluation = await prisma.bidEvaluation.upsert({
      where: {
        bidId_evaluatorId: {
          bidId,
          evaluatorId: user.id,
        },
      },
      create: {
        bidId,
        rfqId: bid.rfqId,
        evaluatorId: user.id,
        criteriaScores: evaluationData.criteriaScores,
        totalScore: evaluationData.totalScore,
        comments: evaluationData.comments,
        recommendation: evaluationData.recommendation,
        status: evaluationData.isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: evaluationData.isComplete ? new Date() : null,
      },
      update: {
        criteriaScores: evaluationData.criteriaScores,
        totalScore: evaluationData.totalScore,
        comments: evaluationData.comments,
        recommendation: evaluationData.recommendation,
        status: evaluationData.isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: evaluationData.isComplete ? new Date() : null,
      },
    });

    // Update bid overall score (aggregate from all evaluations)
    const allEvaluations = await prisma.bidEvaluation.findMany({
      where: { bidId, status: 'COMPLETED' },
    });

    if (allEvaluations.length > 0) {
      const avgScore =
        allEvaluations.reduce((sum, e) => sum + parseFloat(e.totalScore.toString()), 0) /
        allEvaluations.length;

      await prisma.rFQBid.update({
        where: { id: bidId },
        data: { overallScore: avgScore },
      });
    }

    revalidatePath(`/vendor-management/requests-for-pricing/${bid.rfqId}/evaluation`);

    return { success: true, evaluationId: evaluation.id };
  } catch (error: any) {
    console.error('Error evaluating bid:', error);
    return {
      success: false,
      error: error.message || 'Failed to evaluate bid',
    };
  }
}

/**
 * Award RFQ to winning vendor
 */
export async function awardRFQ(rfqId: string, awardData: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get RFQ and bid details
    const rfq = await prisma.rFQCampaign.findUnique({
      where: { id: rfqId },
    });

    const bid = await prisma.rFQBid.findUnique({
      where: { id: awardData.bidId },
    });

    if (!rfq || !bid) {
      return { success: false, error: 'RFQ or bid not found' };
    }

    // Check approval authority
    const requiresHigherApproval = await checkApprovalAuthority(
      user.id,
      bid.totalBidValue
    );

    // Generate award number
    const awardNumber = await generateAwardNumber(rfqId);

    // Create award
    const award = await prisma.rFQAward.create({
      data: {
        awardNumber,
        rfqId,
        bidId: bid.id,
        vendorId: bid.vendorId,
        awardValue: bid.totalBidValue,
        currency: bid.currency,
        awardType: awardData.awardType || 'FULL',
        awardedBy: user.id,
        justification: awardData.justification,
        specialConditions: awardData.specialConditions,
        approvalStatus: requiresHigherApproval ? 'PENDING' : 'APPROVED',
        approvedBy: requiresHigherApproval ? null : user.id,
        approvedAt: requiresHigherApproval ? null : new Date(),
        contractDuration: awardData.contractDuration,
        effectiveDate: awardData.effectiveDate,
        expiryDate: awardData.expiryDate,
        status: 'PENDING_ACCEPTANCE',
      },
    });

    // Update RFQ status
    await prisma.rFQCampaign.update({
      where: { id: rfqId },
      data: {
        status: 'AWARDED',
        awardedAt: new Date(),
      },
    });

    // Update winning bid status
    await prisma.rFQBid.update({
      where: { id: bid.id },
      data: { status: 'AWARDED' },
    });

    // Update other bids status
    await prisma.rFQBid.updateMany({
      where: {
        rfqId,
        id: { not: bid.id },
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'] },
      },
      data: { status: 'REJECTED' },
    });

    // Send award notification to winning vendor
    await sendAwardNotification(award.id, bid.vendorId);

    // Send regret letters to unsuccessful vendors
    await sendRegretLetters(rfqId, bid.id);

    // If requires approval, notify approver
    if (requiresHigherApproval) {
      await notifyApproverOfPendingAward(award.id);
    }

    revalidatePath(`/vendor-management/requests-for-pricing/${rfqId}`);

    return { success: true, awardId: award.id, awardNumber: award.awardNumber };
  } catch (error: any) {
    console.error('Error awarding RFQ:', error);
    return {
      success: false,
      error: error.message || 'Failed to award RFQ',
    };
  }
}

/**
 * Generate contract from RFQ
 */
export async function generateContract(awardId: string, contractData: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get award details
    const award = await prisma.rFQAward.findUnique({
      where: { id: awardId },
      include: {
        rfq: true,
        bid: true,
      },
    });

    if (!award) {
      return { success: false, error: 'Award not found' };
    }

    // Generate contract number
    const contractNumber = await generateContractNumber(award.rfqId);

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        rfqId: award.rfqId,
        awardId: award.id,
        vendorId: award.vendorId,
        contractType: contractData.contractType,
        title: contractData.title || award.rfq.title,
        contractValue: award.awardValue,
        currency: award.currency,
        terms: contractData.terms,
        effectiveDate: contractData.effectiveDate || award.effectiveDate,
        expiryDate: contractData.expiryDate || award.expiryDate,
        duration: award.contractDuration,
        status: 'DRAFT',
        createdBy: user.id,
      },
    });

    // Generate PDF document (async job)
    // await generateContractPDF(contract.id);

    revalidatePath(`/vendor-management/requests-for-pricing/${award.rfqId}`);

    return { success: true, contractId: contract.id, contractNumber: contract.contractNumber };
  } catch (error: any) {
    console.error('Error generating contract:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate contract',
    };
  }
}

// Helper functions
async function sendRFQInvitationEmail(rfqId: string, vendorId: string, customMessage?: string) {
  // Implementation for sending invitation email
}

async function sendBidConfirmationEmail(bidId: string, vendorEmail: string) {
  // Implementation for sending bid confirmation
}

async function notifyProcurementTeamOfNewBid(rfqId: string, bidId: string) {
  // Implementation for notifying procurement team
}

async function checkApprovalAuthority(userId: string, amount: number): Promise<boolean> {
  // Check if user has authority to approve award of this amount
  // Returns true if higher approval needed
  if (amount > 500000) return true; // Requires executive approval
  if (amount > 50000) return true;  // Requires finance manager approval
  return false; // Procurement manager can approve
}

async function sendAwardNotification(awardId: string, vendorId: string) {
  // Implementation for sending award notification
}

async function sendRegretLetters(rfqId: string, winningBidId: string) {
  // Implementation for sending regret letters to unsuccessful vendors
}

async function notifyApproverOfPendingAward(awardId: string) {
  // Implementation for notifying approver
}

async function generateRFQNumber(category: string): Promise<string> {
  // Generate unique RFQ number (e.g., RFQ-2024-FOOD-001)
  const year = new Date().getFullYear();
  const count = await prisma.rFQCampaign.count({
    where: {
      rfqNumber: { startsWith: `RFQ-${year}-${category}` },
    },
  });
  return `RFQ-${year}-${category}-${String(count + 1).padStart(3, '0')}`;
}

async function generateBidNumber(rfqId: string): Promise<string> {
  // Generate unique bid number
  const rfq = await prisma.rFQCampaign.findUnique({
    where: { id: rfqId },
  });
  const count = await prisma.rFQBid.count({
    where: { rfqId },
  });
  return `${rfq?.rfqNumber}-BID-${String(count + 1).padStart(3, '0')}`;
}

async function generateAwardNumber(rfqId: string): Promise<string> {
  // Generate unique award number
  const rfq = await prisma.rFQCampaign.findUnique({
    where: { id: rfqId },
  });
  return `${rfq?.rfqNumber}-AWD-001`;
}

async function generateContractNumber(rfqId: string): Promise<string> {
  // Generate unique contract number
  const rfq = await prisma.rFQCampaign.findUnique({
    where: { id: rfqId },
  });
  return `${rfq?.rfqNumber}-CTR-001`;
}
```

---

## 5. Validation Schemas

### 5.1 Zod Schemas

**File**: `app/(main)/vendor-management/requests-for-pricing/validations.ts`

```typescript
import { z } from 'zod';

// RFQ Schema
export const rfqSchema = z.object({
  // Basic information
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),

  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),

  type: z.enum(['GOODS', 'SERVICES', 'WORKS', 'MIXED']),

  category: z.string().min(1, 'Category is required'),

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),

  budgetRange: z.number().positive().optional(),

  currency: z.string().default('USD'),

  // Requirements
  requirements: z.object({
    items: z.array(z.object({
      id: z.string(),
      itemNumber: z.string(),
      description: z.string().min(5, 'Item description required'),
      productCode: z.string().optional(),
      quantity: z.number().positive('Quantity must be positive'),
      uom: z.string().min(1, 'Unit of measure required'),
      specifications: z.object({
        technical: z.record(z.any()).optional(),
        quality: z.string().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        customAttributes: z.record(z.any()).optional(),
      }).optional(),
      delivery: z.object({
        location: z.string().min(1, 'Delivery location required'),
        locationId: z.string().optional(),
        requiredDate: z.string(),
        earliestDate: z.string().optional(),
        latestDate: z.string().optional(),
      }),
      samplesRequired: z.boolean().default(false),
      isRequired: z.boolean().default(true),
      estimatedBudget: z.number().positive().optional(),
    })).min(1, 'At least one line item required'),

    generalRequirements: z.object({
      warranty: z.string().optional(),
      qualityStandards: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      compliance: z.array(z.string()).optional(),
      specialInstructions: z.string().optional(),
    }).optional(),

    attachments: z.array(z.object({
      id: z.string(),
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileSize: z.number(),
      mimeType: z.string(),
      uploadedAt: z.string(),
      uploadedBy: z.string(),
      category: z.enum(['specification', 'drawing', 'sample', 'other']),
    })).optional(),
  }),

  // Timeline
  timeline: z.object({
    publishDate: z.string(),
    bidOpenDate: z.string(),
    bidCloseDate: z.string(),
    awardTargetDate: z.string().optional(),
    preBidConference: z.object({
      date: z.string(),
      time: z.string(),
      location: z.string().optional(),
      isVirtual: z.boolean(),
      meetingLink: z.string().url().optional(),
    }).optional(),
    siteVisit: z.object({
      date: z.string(),
      time: z.string(),
      location: z.string(),
      contactPerson: z.string().optional(),
      contactPhone: z.string().optional(),
    }).optional(),
    reminders: z.array(z.object({
      type: z.enum(['pre_bid', 'closing_reminder', 'final_reminder']),
      daysBeforeClosing: z.number().int().positive(),
      enabled: z.boolean(),
    })),
  }),

  // Evaluation
  evaluation: z.object({
    criteria: z.array(z.object({
      id: z.string(),
      name: z.string().min(3, 'Criterion name required'),
      type: z.enum(['price', 'quality', 'delivery', 'service', 'technical', 'custom']),
      weight: z.number().min(0).max(100, 'Weight must be 0-100'),
      scoringMethod: z.enum(['points_1_10', 'pass_fail', 'percentage']),
      description: z.string().optional(),
      guidelines: z.string().optional(),
    })).min(1, 'At least one evaluation criterion required'),

    scoringMethod: z.enum(['lowest_price', 'weighted_average', 'technical_commercial']),

    technicalCommercialSplit: z.object({
      technicalWeight: z.number().min(0).max(100),
      commercialWeight: z.number().min(0).max(100),
      technicalThreshold: z.number().min(0).max(100),
    }).optional(),

    evaluators: z.array(z.object({
      userId: z.string(),
      userName: z.string(),
      role: z.string(),
      assignedCriteria: z.array(z.string()).optional(),
      evaluationDeadline: z.string().optional(),
    })),

    settings: z.object({
      allowVendorClarifications: z.boolean().default(true),
      clarificationDeadline: z.string().optional(),
      blindEvaluation: z.boolean().default(false),
      requireJustification: z.boolean().default(true),
    }),
  }),

  // Terms
  terms: z.object({
    paymentTerms: z.object({
      termsType: z.string(),
      description: z.string().optional(),
      milestones: z.array(z.object({
        milestone: z.string(),
        percentage: z.number().min(0).max(100),
        dueDate: z.string().optional(),
      })).optional(),
    }),

    deliveryTerms: z.object({
      incoterm: z.string().optional(),
      description: z.string().optional(),
      shippingInstructions: z.string().optional(),
    }),

    bidValidity: z.object({
      period: z.number().int().positive().min(60, 'Bid validity must be at least 60 days'),
      startFrom: z.enum(['bid_closing', 'bid_submission']),
    }),

    bondsRequired: z.object({
      bidBond: z.object({
        required: z.boolean(),
        percentage: z.number().optional(),
        amount: z.number().optional(),
      }).optional(),
      performanceBond: z.object({
        required: z.boolean(),
        percentage: z.number().optional(),
        amount: z.number().optional(),
      }).optional(),
    }).optional(),

    insuranceRequirements: z.object({
      liabilityCoverage: z.number().optional(),
      workersCompensation: z.boolean().optional(),
      productLiability: z.number().optional(),
    }).optional(),

    liquidatedDamages: z.object({
      applicable: z.boolean(),
      lateDeliveryPenalty: z.string().optional(),
      qualityFailurePenalty: z.string().optional(),
      maxPenaltyCap: z.number().optional(),
    }).optional(),

    terminationClauses: z.object({
      noticePeriod: z.number().int().positive(),
      conditions: z.array(z.string()).optional(),
      penalties: z.string().optional(),
    }),

    specialConditions: z.string().optional(),
    disputeResolution: z.string().optional(),
    governingLaw: z.string().optional(),
  }),

  // Selected vendors (for invitation)
  selectedVendors: z.array(z.string()).min(3, 'Minimum 3 vendors required for competitive RFQ'),

  // Status
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'OPEN']).optional(),
})
.refine(
  (data) => {
    // Validate evaluation criteria weights sum to 100%
    const totalWeight = data.evaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
    return Math.abs(totalWeight - 100) < 0.01; // Allow for floating point errors
  },
  {
    message: 'Evaluation criteria weights must sum to 100%',
    path: ['evaluation', 'criteria'],
  }
)
.refine(
  (data) => {
    // Validate bid closing date is at least 7 business days from opening
    const openDate = new Date(data.timeline.bidOpenDate);
    const closeDate = new Date(data.timeline.bidCloseDate);
    const diffTime = Math.abs(closeDate.getTime() - openDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  },
  {
    message: 'Bid period must be at least 7 business days',
    path: ['timeline', 'bidCloseDate'],
  }
);

// Bid Submission Schema
export const bidSubmissionSchema = z.object({
  lineItems: z.object({
    items: z.array(z.object({
      itemId: z.string(),
      itemNumber: z.string(),
      unitPrice: z.number().positive('Unit price must be positive'),
      currency: z.string(),
      totalPrice: z.number().positive(),
      brand: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      partNumber: z.string().optional(),
      deliveryDate: z.string(),
      leadTime: z.number().int().positive().optional(),
      complianceStatus: z.enum(['full', 'partial', 'non_compliant', 'alternative']),
      complianceNotes: z.string().optional(),
      alternativeOffered: z.object({
        description: z.string(),
        reason: z.string(),
        price: z.number().positive(),
      }).optional(),
      attachments: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        documentType: z.string(),
      })).optional(),
    })).min(1, 'At least one line item required'),
    subtotal: z.number().positive(),
    tax: z.number().optional(),
    shipping: z.number().optional(),
    discount: z.number().optional(),
    totalBidValue: z.number().positive(),
  }),

  commercialTerms: z.object({
    paymentTerms: z.object({
      offered: z.string(),
      matchesRFQ: z.boolean(),
      variance: z.string().optional(),
    }),
    deliveryTerms: z.object({
      incoterm: z.string().optional(),
      description: z.string().optional(),
      matchesRFQ: z.boolean(),
    }),
    warranty: z.object({
      period: z.number().int().positive(),
      unit: z.enum(['months', 'years']),
      coverage: z.string(),
      terms: z.string().optional(),
    }),
    afterSalesService: z.object({
      available: z.boolean(),
      description: z.string().optional(),
      responseTime: z.string().optional(),
      supportHours: z.string().optional(),
    }).optional(),
    bonds: z.object({
      bidBondProvided: z.boolean().optional(),
      performanceBondAccepted: z.boolean().optional(),
      bondProvider: z.string().optional(),
    }),
    insurance: z.object({
      liabilityCoverageProvided: z.number().optional(),
      workersCompensation: z.boolean().optional(),
      productLiability: z.number().optional(),
      insuranceProvider: z.string().optional(),
    }),
    penaltiesAccepted: z.object({
      lateDelivery: z.boolean(),
      qualityFailure: z.boolean(),
      comments: z.string().optional(),
    }),
    alternativeTerms: z.array(z.object({
      termType: z.string(),
      proposed: z.string(),
      justification: z.string(),
    })).optional(),
  }),

  technicalCompliance: z.object({
    requirements: z.array(z.object({
      requirementId: z.string(),
      requirementName: z.string(),
      complianceStatus: z.enum(['compliant', 'partial', 'non_compliant']),
      evidence: z.string().optional(),
      supportingDocs: z.array(z.string()).optional(),
      explanation: z.string().optional(),
    })),
    certifications: z.array(z.object({
      type: z.string(),
      certificateNumber: z.string(),
      issuedBy: z.string(),
      issueDate: z.string(),
      expiryDate: z.string().optional(),
      documentUrl: z.string().url().optional(),
    })),
    technicalDocuments: z.array(z.object({
      documentType: z.enum(['datasheet', 'brochure', 'test_report', 'certification', 'other']),
      fileName: z.string(),
      fileUrl: z.string().url(),
      uploadedAt: z.string(),
    })),
    technicalNarrative: z.string().optional(),
    overallCompliance: z.object({
      percentageCompliant: z.number().min(0).max(100),
      criticalRequirementsMet: z.boolean(),
      summary: z.string(),
    }),
  }),

  validityPeriod: z.number().int().positive().min(60, 'Bid validity must be at least 60 days'),

  // Declarations
  declarations: z.object({
    accuracyDeclaration: z.boolean().refine(val => val === true, 'Must accept accuracy declaration'),
    conflictOfInterest: z.boolean().refine(val => val === true, 'Must declare no conflict of interest'),
    antiCorruption: z.boolean().refine(val => val === true, 'Must accept anti-corruption declaration'),
    termsAcceptance: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
  }),

  finalComments: z.string().max(2000).optional(),
});

// Bid Evaluation Schema
export const bidEvaluationSchema = z.object({
  criteriaScores: z.record(z.number().min(0).max(10)),
  totalScore: z.number().min(0).max(100),
  comments: z.string().max(5000).optional(),
  recommendation: z.string().max(5000).optional(),
  isComplete: z.boolean(),
});

// Award Schema
export const awardSchema = z.object({
  bidId: z.string().uuid(),
  awardType: z.enum(['FULL', 'PARTIAL', 'SPLIT', 'CONDITIONAL']).default('FULL'),
  justification: z.string().min(20, 'Award justification required'),
  specialConditions: z.string().max(5000).optional(),
  contractDuration: z.number().int().positive().optional(),
  effectiveDate: z.string(),
  expiryDate: z.string().optional(),
});
```

---

## 6. Scheduled Jobs

### 6.1 RFQ Monitoring Jobs

```typescript
// lib/jobs/rfq-jobs.ts

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

/**
 * Send bid closing reminders
 * Runs daily at 8:00 AM
 */
export async function sendBidClosingReminders() {
  const now = new Date();

  // Find RFQs that need reminders
  const rfqs = await prisma.rFQCampaign.findMany({
    where: {
      status: 'OPEN',
      deletedAt: null,
    },
    include: {
      invitations: {
        where: {
          status: { in: ['INVITED', 'VIEWED', 'ACKNOWLEDGED'] },
        },
      },
    },
  });

  for (const rfq of rfqs) {
    const timeline = rfq.timeline as any;
    const closeDate = new Date(timeline.bidCloseDate);
    const daysUntilClose = Math.ceil(
      (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if reminder is needed based on configured reminders
    const reminders = timeline.reminders || [];
    for (const reminder of reminders) {
      if (
        reminder.enabled &&
        daysUntilClose === reminder.daysBeforeClosing
      ) {
        // Send reminder to vendors who haven't submitted bids
        for (const invitation of rfq.invitations) {
          await sendReminderEmail(rfq.id, invitation.vendorId, daysUntilClose);
        }
      }
    }
  }
}

/**
 * Auto-close RFQs when deadline passes
 * Runs hourly
 */
export async function autoCloseExpiredRFQs() {
  const now = new Date();

  // Find RFQs that should be closed
  const rfqs = await prisma.rFQCampaign.findMany({
    where: {
      status: 'OPEN',
      deletedAt: null,
    },
  });

  for (const rfq of rfqs) {
    const timeline = rfq.timeline as any;
    const closeDate = new Date(timeline.bidCloseDate);

    if (now > closeDate) {
      // Auto-close RFQ
      await prisma.rFQCampaign.update({
        where: { id: rfq.id },
        data: {
          status: 'CLOSED',
          closedAt: closeDate,
        },
      });

      // Notify procurement team
      await notifyProcurementTeamOfClosure(rfq.id);
    }
  }
}

/**
 * Monitor contract expiry dates
 * Runs daily
 */
export async function monitorContractExpiry() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Find contracts expiring within 30 days
  const expiringContracts = await prisma.contract.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
    },
  });

  for (const contract of expiringContracts) {
    // Send expiry notification
    await sendContractExpiryNotification(contract.id);
  }
}

// Helper functions
async function sendReminderEmail(rfqId: string, vendorId: string, daysRemaining: number) {
  // Implementation
}

async function notifyProcurementTeamOfClosure(rfqId: string) {
  // Implementation
}

async function sendContractExpiryNotification(contractId: string) {
  // Implementation
}
```

---

## 7. Email Notifications

### 7.1 Email Templates

```typescript
// lib/email/rfq-templates.ts

export const emailTemplates = {
  rfqInvitation: {
    subject: 'RFQ Invitation: {{rfqTitle}}',
    html: `
      <h2>You're invited to participate in an RFQ</h2>
      <p>Dear {{vendorName}},</p>
      <p>We invite you to submit a bid for the following procurement:</p>
      <ul>
        <li><strong>RFQ Number:</strong> {{rfqNumber}}</li>
        <li><strong>Title:</strong> {{rfqTitle}}</li>
        <li><strong>Closing Date:</strong> {{closingDate}}</li>
      </ul>
      <p>{{customMessage}}</p>
      <p><a href="{{portalLink}}">View RFQ Details</a></p>
      <p>Best regards,<br>{{companyName}}</p>
    `,
  },

  bidConfirmation: {
    subject: 'Bid Confirmation: {{rfqNumber}}',
    html: `
      <h2>Bid Submitted Successfully</h2>
      <p>Dear {{vendorName}},</p>
      <p>Your bid has been successfully submitted for:</p>
      <ul>
        <li><strong>RFQ Number:</strong> {{rfqNumber}}</li>
        <li><strong>Bid Number:</strong> {{bidNumber}}</li>
        <li><strong>Submission Date:</strong> {{submissionDate}}</li>
        <li><strong>Total Bid Value:</strong> {{totalValue}}</li>
      </ul>
      <p>We will review your bid and notify you of the outcome.</p>
      <p>Best regards,<br>{{companyName}}</p>
    `,
  },

  awardNotification: {
    subject: 'Award Notification: {{rfqNumber}}',
    html: `
      <h2>Congratulations! You have been awarded the contract</h2>
      <p>Dear {{vendorName}},</p>
      <p>We are pleased to inform you that your bid has been selected as the winning proposal for:</p>
      <ul>
        <li><strong>RFQ Number:</strong> {{rfqNumber}}</li>
        <li><strong>Award Number:</strong> {{awardNumber}}</li>
        <li><strong>Award Value:</strong> {{awardValue}}</li>
      </ul>
      <p>Please find the award letter attached.</p>
      <p><a href="{{portalLink}}">View Award Details</a></p>
      <p>Best regards,<br>{{companyName}}</p>
    `,
  },

  regretLetter: {
    subject: 'RFQ Outcome: {{rfqNumber}}',
    html: `
      <h2>Thank you for your participation</h2>
      <p>Dear {{vendorName}},</p>
      <p>Thank you for submitting a bid for RFQ {{rfqNumber}}.</p>
      <p>After careful evaluation, we regret to inform you that your bid was not selected on this occasion.</p>
      <p>We appreciate your interest and encourage you to participate in future opportunities.</p>
      <p>Best regards,<br>{{companyName}}</p>
    `,
  },
};
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

**React Query Configuration**:
```typescript
// lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // RFQ list cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

**Server-side Caching**:
```typescript
// Implement Redis caching for frequently accessed data
import { redis } from '@/lib/redis';

export async function getRFQById(id: string) {
  // Check cache first
  const cached = await redis.get(`rfq:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const rfq = await prisma.rFQCampaign.findUnique({
    where: { id },
    include: {
      invitations: true,
      bids: true,
    },
  });

  // Cache for 5 minutes
  await redis.setex(`rfq:${id}`, 300, JSON.stringify(rfq));

  return rfq;
}
```

### 8.2 Query Optimization

**Efficient Queries**:
```sql
-- Use indexes for common queries
-- Bid comparison query
SELECT b.*, v.name as vendor_name
FROM tb_rfq_bid b
JOIN tb_vendor v ON b.vendor_id = v.id
WHERE b.rfq_id = $1
  AND b.status IN ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED')
ORDER BY b.overall_score DESC, b.total_bid_value ASC;

-- RFQ list with filters
SELECT r.*,
       COUNT(DISTINCT i.vendor_id) as invited_count,
       COUNT(DISTINCT b.id) as bid_count
FROM tb_rfq_campaign r
LEFT JOIN tb_rfq_vendor_invitation i ON r.id = i.rfq_id
LEFT JOIN tb_rfq_bid b ON r.id = b.rfq_id AND b.status = 'SUBMITTED'
WHERE r.deleted_at IS NULL
  AND ($1::text IS NULL OR r.status = $1)
  AND ($2::text IS NULL OR r.type = $2)
GROUP BY r.id
ORDER BY r.created_at DESC
LIMIT $3 OFFSET $4;
```

### 8.3 Real-time Updates

**WebSocket Integration** (optional):
```typescript
// For real-time bid submission notifications
import { Server as SocketServer } from 'socket.io';

export function setupRFQWebSocket(io: SocketServer) {
  io.on('connection', (socket) => {
    socket.on('subscribe:rfq', (rfqId: string) => {
      socket.join(`rfq:${rfqId}`);
    });

    socket.on('unsubscribe:rfq', (rfqId: string) => {
      socket.leave(`rfq:${rfqId}`);
    });
  });
}

// Emit bid submission event
export function notifyBidSubmitted(rfqId: string, bidData: any) {
  io.to(`rfq:${rfqId}`).emit('bid:submitted', bidData);
}
```

---

## 9. Security Implementation

### 9.1 Authentication & Authorization

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // Protect RFQ routes
  if (req.nextUrl.pathname.startsWith('/vendor-management/requests-for-pricing')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check role permissions
    const requiredRole = getRequiredRole(req.nextUrl.pathname);
    if (requiredRole && !hasRole(token, requiredRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

function getRequiredRole(pathname: string): string | null {
  if (pathname.includes('/evaluation')) return 'evaluator';
  if (pathname.includes('/award')) return 'procurement_manager';
  return null;
}

function hasRole(token: any, role: string): boolean {
  return token.roles?.includes(role) || false;
}
```

### 9.2 Data Encryption

```typescript
// lib/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Encrypt sensitive bid data before storage
export function encryptBidData(bidData: any) {
  if (bidData.commercialTerms?.paymentTerms) {
    bidData.commercialTerms.paymentTerms = encrypt(
      JSON.stringify(bidData.commercialTerms.paymentTerms)
    );
  }
  return bidData;
}
```

### 9.3 Input Sanitization

```typescript
// lib/sanitization.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeUserInput(input: string): string {
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// __tests__/rfq/actions.test.ts

import { describe, it, expect, vi } from 'vitest';
import { createRFQ, submitBid, evaluateBid, awardRFQ } from '../actions';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    rFQCampaign: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    rFQBid: {
      create: vi.fn(),
      upsert: vi.fn(),
    },
    bidEvaluation: {
      upsert: vi.fn(),
    },
    rFQAward: {
      create: vi.fn(),
    },
  },
}));

describe('RFQ Actions', () => {
  describe('createRFQ', () => {
    it('should create a new RFQ with valid data', async () => {
      const rfqData = {
        title: 'Test RFQ',
        type: 'GOODS',
        category: 'FOOD',
        // ... other required fields
      };

      vi.mocked(prisma.rFQCampaign.create).mockResolvedValue({
        id: 'rfq-123',
        rfqNumber: 'RFQ-2024-FOOD-001',
        // ... other fields
      } as any);

      const result = await createRFQ(rfqData);

      expect(result.success).toBe(true);
      expect(result.rfqId).toBe('rfq-123');
      expect(prisma.rFQCampaign.create).toHaveBeenCalled();
    });

    it('should validate minimum vendors requirement', async () => {
      const rfqData = {
        title: 'Test RFQ',
        selectedVendors: ['vendor-1'], // Only 1 vendor (< 3 minimum)
        // ... other fields
      };

      const result = await createRFQ(rfqData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Minimum 3 vendors');
    });
  });

  describe('submitBid', () => {
    it('should submit a valid bid', async () => {
      // Test implementation
    });

    it('should reject bid after deadline', async () => {
      // Test implementation
    });
  });

  describe('evaluateBid', () => {
    it('should calculate weighted score correctly', async () => {
      // Test implementation
    });
  });

  describe('awardRFQ', () => {
    it('should award to highest-scored bid', async () => {
      // Test implementation
    });

    it('should require higher approval for high-value awards', async () => {
      // Test implementation
    });
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/rfq/integration.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRFQ, inviteVendorsToRFQ, submitBid, evaluateBid, awardRFQ } from '../actions';

describe('RFQ Workflow Integration', () => {
  let rfqId: string;
  let bidId: string;

  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  it('should complete full RFQ lifecycle', async () => {
    // 1. Create RFQ
    const rfqResult = await createRFQ({
      // ... RFQ data
    });
    expect(rfqResult.success).toBe(true);
    rfqId = rfqResult.rfqId!;

    // 2. Invite vendors
    const inviteResult = await inviteVendorsToRFQ(rfqId, [
      'vendor-1',
      'vendor-2',
      'vendor-3',
    ]);
    expect(inviteResult.success).toBe(true);

    // 3. Submit bid
    const bidResult = await submitBid(rfqId, {
      // ... bid data
    });
    expect(bidResult.success).toBe(true);
    bidId = bidResult.bidId!;

    // 4. Evaluate bid
    const evalResult = await evaluateBid(bidId, {
      // ... evaluation data
    });
    expect(evalResult.success).toBe(true);

    // 5. Award RFQ
    const awardResult = await awardRFQ(rfqId, {
      bidId,
      // ... award data
    });
    expect(awardResult.success).toBe(true);
  });
});
```

---

## 11. Deployment Considerations

### 11.1 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# File Storage
AWS_S3_BUCKET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="..."

# Email
SENDGRID_API_KEY="..."
EMAIL_FROM="noreply@company.com"

# Encryption
ENCRYPTION_KEY="..." # 32-byte hex string

# Redis (optional)
REDIS_URL="..."

# Features
ENABLE_REAL_TIME_UPDATES="true"
ENABLE_EMAIL_NOTIFICATIONS="true"
```

### 11.2 Build Configuration

```javascript
// next.config.js

module.exports = {
  images: {
    domains: ['s3.amazonaws.com'],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    // Custom webpack configuration
    return config;
  },
};
```

### 11.3 Database Migrations

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial technical specification document |

---

**End of Technical Specification Document**
