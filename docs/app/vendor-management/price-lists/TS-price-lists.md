# Price Lists - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Price Lists
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
  - Zustand (global UI state)
  - React Query / TanStack Query (server state, caching)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with Lucide React icons
- **Date Handling**: date-fns
- **Charts**: Recharts (for price history and comparison visualizations)
- **Tables**: TanStack Table (for sortable, filterable price lists)

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers
- **ORM**: Prisma Client
- **Database**: PostgreSQL with JSONB support
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 / Azure Blob Storage (for exports)
- **Email**: SendGrid / AWS SES (for notifications)
- **Scheduling**: node-cron or BullMQ (for expiration checks, reminders)
- **Background Jobs**: BullMQ with Redis (for bulk operations)

**Infrastructure**:
- **Hosting**: Vercel / AWS / Azure
- **CDN**: Vercel Edge Network / CloudFront
- **Monitoring**: Sentry (errors), Vercel Analytics (performance)
- **Logging**: Winston / Pino (structured logging)
- **Version Control**: Git

### 1.2 Architecture Pattern

**Pattern**: Next.js App Router with Server Components (default) + Client Components (interactive)

```
app/
└── (main)/
    └── vendor-management/
        └── price-lists/
            ├── page.tsx                    # Server Component (price list overview)
            ├── [id]/
            │   ├── page.tsx               # Server Component (price list detail)
            │   ├── edit/
            │   │   └── page.tsx           # Edit price list
            │   ├── approve/
            │   │   └── page.tsx           # Approval workflow
            │   └── history/
            │       └── page.tsx           # Price history view
            ├── new/
            │   └── page.tsx               # Server Component with Client wizard
            ├── compare/
            │   └── page.tsx               # Multi-vendor comparison
            ├── import/
            │   └── page.tsx               # Bulk import wizard
            ├── components/
            │   ├── PriceListTable.tsx      # Client Component (interactive list)
            │   ├── PriceListWizard.tsx     # Client Component (5-step creation)
            │   ├── PriceListLineItem.tsx   # Client Component (editable item)
            │   ├── BulkImportWizard.tsx    # Client Component
            │   ├── PriceComparisonTable.tsx # Client Component
            │   ├── PriceHistoryChart.tsx   # Client Component (trend chart)
            │   ├── ApprovalWorkflow.tsx    # Client Component
            │   ├── PriceAlertConfig.tsx    # Client Component
            │   └── ExportDialog.tsx        # Client Component
            ├── actions.ts                 # Server Actions (mutations)
            └── types.ts                   # TypeScript interfaces

lib/
├── types/
│   ├── price-list.ts                      # Price list interfaces
│   └── index.ts                           # Barrel exports
├── mock-data/
│   ├── price-lists.ts                     # Mock price lists
│   └── index.ts                           # Barrel exports
└── services/
    ├── price-list-service.ts              # Business logic
    ├── price-comparison-service.ts        # Comparison logic
    ├── approval-service.ts                # Approval workflow
    └── notification-service.ts            # Email/alerts
```

### 1.3 Data Flow Architecture

```
User Interface (Client Components)
        ↓
Server Actions / Route Handlers
        ↓
Business Logic Layer (Services)
        ↓
Prisma ORM
        ↓
PostgreSQL Database (JSON fields for pricing tiers, terms)
        ↓
External Services (Email, File Storage, Scheduling, Queue)
```

**Key Principles**:
- Server Components for data fetching (default)
- Client Components only for interactivity (wizard, form builder, charts)
- Server Actions for mutations (preferred over API routes)
- React Query for client-side caching and real-time updates
- Optimistic updates for better UX
- Background jobs for bulk operations and scheduled tasks

---

## 2. Database Implementation

### 2.1 Schema Design Strategy

**Approach**: New dedicated tables for price lists with relationships to existing vendor and product tables.

**New Tables Required**:
- `tb_price_list` (core price list entity)
- `tb_price_list_item` (line items)
- `tb_price_list_approval` (approval workflow)
- `tb_price_list_history` (price change tracking)

```prisma
// schema.prisma addition

model PriceList {
  id                String   @id @default(uuid())
  priceListNumber   String   @unique
  name              String
  description       String?

  // Vendor relationship
  vendorId          String
  vendor            Vendor   @relation(fields: [vendorId], references: [id])

  // Status and lifecycle
  status            PriceListStatus @default(DRAFT)
  effectiveFrom     DateTime
  effectiveTo       DateTime?

  // Source tracking
  sourceType        SourceType?
  sourceId          String?
  sourceReference   String?

  // Pricing metadata
  currency          String   @default("USD")
  isContractPricing Boolean  @default(false)
  contractReference String?
  takesPrecedence   Boolean  @default(false)

  // Targeting (JSONB)
  targeting         Json?    // Locations, departments

  // Terms and conditions (JSONB)
  terms             Json?    // Payment, warranty, return policy

  // Metadata
  createdBy         String
  createdAt         DateTime @default(now())
  updatedBy         String?
  updatedAt         DateTime @updatedAt
  approvedBy        String?
  approvedAt        DateTime?
  activatedBy       String?
  activatedAt       DateTime?

  // Soft delete
  deletedAt         DateTime?

  // Relations
  items             PriceListItem[]
  approvals         PriceListApproval[]
  history           PriceListHistory[]

  // Supersession tracking
  supersededById    String?
  supersededBy      PriceList? @relation("Supersession", fields: [supersededById], references: [id])
  supersedes        PriceList[] @relation("Supersession")

  @@index([vendorId, status])
  @@index([effectiveFrom, effectiveTo])
  @@index([status, effectiveTo])
  @@index([sourceType, sourceId])
  @@map("tb_price_list")
}

enum PriceListStatus {
  DRAFT
  PENDING_APPROVAL
  ACTIVE
  EXPIRED
  SUPERSEDED
  CANCELLED
}

enum SourceType {
  manual
  template
  rfq
  negotiation
  contract
  import
}

model PriceListItem {
  id                String   @id @default(uuid())
  priceListId       String
  priceList         PriceList @relation(fields: [priceListId], references: [id], onDelete: Cascade)

  // Product relationship
  productId         String
  productCode       String
  productName       String
  productCategory   String

  // Pricing
  basePrice         Decimal  @db.Decimal(15, 4)
  unitPrice         Decimal  @db.Decimal(15, 4)
  casePrice         Decimal? @db.Decimal(15, 4)
  bulkPrice         Decimal? @db.Decimal(15, 4)

  // Pricing tiers (JSONB)
  pricingTiers      Json?    // Array of quantity ranges with prices

  // Commercial terms
  moq               Int?
  packSize          Int?
  leadTimeDays      Int?
  shippingCost      Decimal? @db.Decimal(15, 4)

  // Price change tracking
  previousPrice     Decimal? @db.Decimal(15, 4)
  priceChange       Decimal? @db.Decimal(15, 4)
  priceChangePercent Decimal? @db.Decimal(10, 2)
  changeReason      String?

  // Metadata
  sequence          Int      @default(0)
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([priceListId, productId])
  @@index([productId])
  @@map("tb_price_list_item")
}

model PriceListApproval {
  id                String   @id @default(uuid())
  priceListId       String
  priceList         PriceList @relation(fields: [priceListId], references: [id], onDelete: Cascade)

  // Approval workflow
  approvalLevel     ApprovalLevel
  approverRole      String
  approverUserId    String?

  // Status
  status            ApprovalStatus @default(PENDING)

  // Decision
  decision          ApprovalDecision?
  comments          String?
  decidedAt         DateTime?

  // Escalation
  escalatedAt       DateTime?
  escalatedTo       String?

  // Metadata
  requestedAt       DateTime @default(now())

  @@index([priceListId, status])
  @@index([approverUserId, status])
  @@map("tb_price_list_approval")
}

enum ApprovalLevel {
  PROCUREMENT_MANAGER
  FINANCIAL_MANAGER
  EXECUTIVE
}

enum ApprovalStatus {
  PENDING
  IN_REVIEW
  ESCALATED
  COMPLETED
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  CONDITIONAL
  DEFERRED
}

model PriceListHistory {
  id                String   @id @default(uuid())
  priceListId       String
  priceList         PriceList @relation(fields: [priceListId], references: [id], onDelete: Cascade)

  // Change tracking
  changeType        HistoryChangeType
  fieldName         String?
  oldValue          String?
  newValue          String?

  // Item-specific changes
  itemId            String?
  productId         String?
  productCode       String?

  // Price change details
  oldPrice          Decimal? @db.Decimal(15, 4)
  newPrice          Decimal? @db.Decimal(15, 4)
  priceChangePercent Decimal? @db.Decimal(10, 2)

  // Metadata
  changedBy         String
  changedAt         DateTime @default(now())
  reason            String?

  @@index([priceListId, changedAt])
  @@index([productId, changedAt])
  @@map("tb_price_list_history")
}

enum HistoryChangeType {
  CREATED
  UPDATED
  ITEM_ADDED
  ITEM_REMOVED
  ITEM_UPDATED
  PRICE_CHANGED
  STATUS_CHANGED
  APPROVED
  ACTIVATED
  EXPIRED
  SUPERSEDED
  CANCELLED
}

// Price alert configuration
model PriceAlert {
  id                String   @id @default(uuid())
  userId            String

  // Alert configuration
  alertType         PriceAlertType
  scope             Json     // Product, category, vendor, department targeting

  // Thresholds
  threshold         Json?    // Percentage or fixed amount

  // Notifications
  notificationMethods Json   // email, inApp, sms
  frequency         AlertFrequency @default(IMMEDIATE)

  // Status
  isActive          Boolean  @default(true)

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastTriggeredAt   DateTime?

  @@index([userId, isActive])
  @@map("tb_price_alert")
}

enum PriceAlertType {
  INCREASE
  DECREASE
  ANY_CHANGE
  EXPIRATION
  NEW_LIST
}

enum AlertFrequency {
  IMMEDIATE
  DAILY_DIGEST
  WEEKLY_SUMMARY
}
```

### 2.2 JSON Structure Implementation

#### 2.2.1 PriceListItem.pricingTiers JSON

```typescript
// lib/types/price-list.ts

interface PricingTier {
  tierId: string;
  minQuantity: number;
  maxQuantity?: number;
  tierPrice: number;
  discountPercent?: number;
  label: string;
  isActive: boolean;
}

// Example JSON stored in pricingTiers field:
{
  "tiers": [
    {
      "tierId": "tier-1",
      "minQuantity": 1,
      "maxQuantity": 99,
      "tierPrice": 10.50,
      "label": "1-99 units",
      "isActive": true
    },
    {
      "tierId": "tier-2",
      "minQuantity": 100,
      "maxQuantity": 499,
      "tierPrice": 9.75,
      "discountPercent": 7.14,
      "label": "100-499 units",
      "isActive": true
    },
    {
      "tierId": "tier-3",
      "minQuantity": 500,
      "tierPrice": 8.99,
      "discountPercent": 14.38,
      "label": "500+ units",
      "isActive": true
    }
  ]
}
```

#### 2.2.2 PriceList.targeting JSON

```typescript
// lib/types/price-list.ts

interface PriceListTargeting {
  locations?: Array<{
    locationId: string;
    locationName: string;
    locationCode: string;
    isIncluded: boolean;
  }>;

  departments?: Array<{
    departmentId: string;
    departmentName: string;
    isIncluded: boolean;
  }>;

  applicability: 'all' | 'specific_locations' | 'specific_departments' | 'combined';
  priority: number; // For conflict resolution
}

// Example JSON:
{
  "applicability": "specific_locations",
  "priority": 10,
  "locations": [
    {
      "locationId": "loc-001",
      "locationName": "Main Kitchen",
      "locationCode": "MK-001",
      "isIncluded": true
    },
    {
      "locationId": "loc-002",
      "locationName": "Banquet Hall",
      "locationCode": "BH-001",
      "isIncluded": true
    }
  ]
}
```

#### 2.2.3 PriceList.terms JSON

```typescript
// lib/types/price-list.ts

interface PriceListTerms {
  paymentTerms: {
    paymentMethod: string[];
    netDays: number;
    earlyPaymentDiscount?: {
      discountPercent: number;
      daysForDiscount: number;
    };
    lateFee?: {
      feePercent: number;
      gracePeriodDays: number;
    };
  };

  warranty: {
    warrantyPeriodDays: number;
    warrantyType: string;
    warrantyTerms: string;
  };

  returnPolicy: {
    returnsAccepted: boolean;
    returnWindowDays: number;
    restockingFee?: number;
    conditions: string[];
  };

  deliveryTerms: {
    deliveryMethod: string;
    freeShippingThreshold?: number;
    deliveryDays: number;
    deliveryZones?: string[];
  };

  additionalTerms?: string;
}

// Example JSON:
{
  "paymentTerms": {
    "paymentMethod": ["Net Terms", "Credit Card", "Bank Transfer"],
    "netDays": 30,
    "earlyPaymentDiscount": {
      "discountPercent": 2,
      "daysForDiscount": 10
    }
  },
  "warranty": {
    "warrantyPeriodDays": 90,
    "warrantyType": "Manufacturer Warranty",
    "warrantyTerms": "Defects in materials and workmanship"
  },
  "returnPolicy": {
    "returnsAccepted": true,
    "returnWindowDays": 30,
    "restockingFee": 15,
    "conditions": [
      "Items must be unopened",
      "Original packaging required",
      "Authorization required"
    ]
  },
  "deliveryTerms": {
    "deliveryMethod": "Standard Ground",
    "freeShippingThreshold": 500,
    "deliveryDays": 5,
    "deliveryZones": ["Metro Area", "Suburban"]
  }
}
```

#### 2.2.4 PriceAlert.scope JSON

```typescript
// lib/types/price-list.ts

interface PriceAlertScope {
  scopeType: 'PRODUCT' | 'CATEGORY' | 'VENDOR' | 'DEPARTMENT';
  target: string; // ID of the target entity
  targetName: string; // Display name

  // Optional additional filters
  filters?: {
    minPriceThreshold?: number;
    maxPriceThreshold?: number;
    locationIds?: string[];
    categoryIds?: string[];
  };
}

// Example JSON:
{
  "scopeType": "CATEGORY",
  "target": "cat-produce",
  "targetName": "Fresh Produce",
  "filters": {
    "minPriceThreshold": 10,
    "locationIds": ["loc-001", "loc-002"]
  }
}
```

### 2.3 Database Indexes

```sql
-- Price list search and filtering
CREATE INDEX idx_pricelist_number ON tb_price_list(price_list_number);
CREATE INDEX idx_pricelist_vendor_status ON tb_price_list(vendor_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pricelist_status ON tb_price_list(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pricelist_effective_dates ON tb_price_list(effective_from, effective_to);
CREATE INDEX idx_pricelist_active ON tb_price_list(vendor_id, effective_from, effective_to)
WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- Source tracking
CREATE INDEX idx_pricelist_source ON tb_price_list(source_type, source_id);

-- Contract pricing
CREATE INDEX idx_pricelist_contract ON tb_price_list(is_contract_pricing, takes_precedence)
WHERE status = 'ACTIVE';

-- Full-text search
CREATE INDEX idx_pricelist_search ON tb_price_list
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(source_reference, '')));

-- Price list items
CREATE INDEX idx_item_pricelist ON tb_price_list_item(price_list_id, sequence);
CREATE INDEX idx_item_product ON tb_price_list_item(product_id);
CREATE INDEX idx_item_product_pricelist ON tb_price_list_item(product_id, price_list_id);

-- Price change tracking
CREATE INDEX idx_item_price_change ON tb_price_list_item(price_change_percent)
WHERE price_change_percent IS NOT NULL;

-- JSON field indexes for targeting
CREATE INDEX idx_pricelist_targeting_locations ON tb_price_list
USING GIN ((targeting->'locations'));

-- Approval workflow
CREATE INDEX idx_approval_pricelist_status ON tb_price_list_approval(price_list_id, status);
CREATE INDEX idx_approval_user_pending ON tb_price_list_approval(approver_user_id, status)
WHERE status IN ('PENDING', 'IN_REVIEW');
CREATE INDEX idx_approval_escalated ON tb_price_list_approval(escalated_at, status)
WHERE status = 'ESCALATED';

-- History tracking
CREATE INDEX idx_history_pricelist_date ON tb_price_list_history(price_list_id, changed_at DESC);
CREATE INDEX idx_history_product_date ON tb_price_list_history(product_id, changed_at DESC)
WHERE product_id IS NOT NULL;
CREATE INDEX idx_history_change_type ON tb_price_list_history(change_type, changed_at DESC);

-- Price alerts
CREATE INDEX idx_alert_user_active ON tb_price_alert(user_id, is_active)
WHERE is_active = true;
CREATE INDEX idx_alert_type ON tb_price_alert(alert_type, is_active);
```

---

## 3. Component Architecture

### 3.1 Price List Creation Wizard Component

```typescript
// app/(main)/vendor-management/price-lists/components/PriceListWizard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { priceListSchema } from '../validation';
import { createPriceList } from '../actions';
import { toast } from 'sonner';

interface PriceListWizardProps {
  vendorId?: string;
  sourceType?: string;
  sourceId?: string;
}

export function PriceListWizard({ vendorId, sourceType, sourceId }: PriceListWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PriceListFormData>({
    resolver: zodResolver(priceListSchema),
    defaultValues: {
      vendorId: vendorId || '',
      currency: 'USD',
      status: 'DRAFT',
      items: [],
      targeting: { applicability: 'all' },
    },
  });

  const steps = [
    { id: 1, name: 'Basic Information', component: BasicInfoStep },
    { id: 2, name: 'Product Selection', component: ProductSelectionStep },
    { id: 3, name: 'Pricing Details', component: PricingDetailsStep },
    { id: 4, name: 'Terms & Conditions', component: TermsStep },
    { id: 5, name: 'Review & Submit', component: ReviewStep },
  ];

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (form.formState.isDirty) {
        const data = form.getValues();
        await saveDraft(data);
        toast.success('Draft auto-saved');
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [form]);

  const validateStep = async (stepId: number): Promise<boolean> => {
    const fieldsToValidate = getStepFields(stepId);
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createPriceList(data);

      if (result.success) {
        toast.success('Price list created successfully');

        // Check if approval is required
        if (result.requiresApproval) {
          toast.info('Price list submitted for approval');
          router.push(`/vendor-management/price-lists/${result.priceListId}/approve`);
        } else {
          router.push(`/vendor-management/price-lists/${result.priceListId}`);
        }
      } else {
        toast.error(result.error || 'Failed to create price list');
      }
    } catch (error) {
      console.error('Price list creation error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  });

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${currentStep >= step.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted-foreground text-muted-foreground'}
                `}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-4
                  ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <CurrentStepComponent form={form} />

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const data = form.getValues();
                await saveDraft(data);
                toast.success('Draft saved successfully');
              }}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>

            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Price List
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Bulk Import Component

```typescript
// app/(main)/vendor-management/price-lists/components/BulkImportWizard.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parse } from 'papaparse';
import { validateImportData, importPriceList } from '../actions';

interface ImportRow {
  rowNumber: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  status: 'valid' | 'warning' | 'error';
  errors?: string[];
  warnings?: string[];
}

export function BulkImportWizard() {
  const [step, setStep] = useState<'upload' | 'validate' | 'preview' | 'import'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [summary, setSummary] = useState({ valid: 0, warnings: 0, errors: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        await processFile(uploadedFile);
      }
    },
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setStep('validate');

    try {
      // Parse CSV/Excel file
      const text = await file.text();
      const parsed = parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      // Validate data
      const validationResult = await validateImportData(parsed.data);

      setImportData(validationResult.rows);
      setSummary({
        valid: validationResult.rows.filter(r => r.status === 'valid').length,
        warnings: validationResult.rows.filter(r => r.status === 'warning').length,
        errors: validationResult.rows.filter(r => r.status === 'error').length,
      });

      setStep('preview');
    } catch (error) {
      toast.error('Failed to process file');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setStep('import');

    try {
      // Filter out error rows
      const validRows = importData.filter(row => row.status !== 'error');

      const result = await importPriceList({
        rows: validRows,
        vendorId: form.getValues('vendorId'),
        effectiveFrom: form.getValues('effectiveFrom'),
      });

      if (result.success) {
        toast.success(`Successfully imported ${result.importedCount} items`);
        router.push(`/vendor-management/price-lists/${result.priceListId}`);
      } else {
        toast.error(result.error || 'Import failed');
      }
    } catch (error) {
      toast.error('An error occurred during import');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Upload step */}
        {step === 'upload' && (
          <div>
            <div className="mb-4">
              <Button variant="outline" asChild>
                <a href="/templates/price-list-import-template.xlsx" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </a>
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to select file
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: Excel (.xlsx, .xls), CSV
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation step */}
        {step === 'validate' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Validating data...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && (
          <div>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
                <div className="text-sm text-muted-foreground">Valid Rows</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Data table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.slice(0, 100).map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>
                        <Badge variant={
                          row.status === 'valid' ? 'success' :
                          row.status === 'warning' ? 'warning' : 'destructive'
                        }>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.productCode}</TableCell>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>${row.unitPrice}</TableCell>
                      <TableCell>
                        {row.errors && row.errors.length > 0 && (
                          <ul className="text-sm text-red-600">
                            {row.errors.map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                          </ul>
                        )}
                        {row.warnings && row.warnings.length > 0 && (
                          <ul className="text-sm text-yellow-600">
                            {row.warnings.map((warning, i) => (
                              <li key={i}>• {warning}</li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => {
                setStep('upload');
                setFile(null);
                setImportData([]);
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={summary.errors > 0 || summary.valid === 0}
              >
                Import {summary.valid} Valid Rows
              </Button>
            </div>
          </div>
        )}

        {/* Import step */}
        {step === 'import' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Importing data...</p>
            <p className="text-sm text-muted-foreground">Please wait while we process your import</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3.3 Price Comparison Component

```typescript
// app/(main)/vendor-management/price-lists/components/PriceComparisonTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { comparePrices } from '../actions';

interface PriceComparisonProps {
  productId: string;
}

export function PriceComparisonTable({ productId }: PriceComparisonProps) {
  const [sortColumn, setSortColumn] = useState<'price' | 'leadTime' | 'moq'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['price-comparison', productId],
    queryFn: () => comparePrices(productId),
  });

  const sortedVendors = useMemo(() => {
    if (!comparison?.vendors) return [];

    return [...comparison.vendors].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [comparison, sortColumn, sortDirection]);

  const statistics = useMemo(() => {
    if (!comparison?.vendors || comparison.vendors.length === 0) return null;

    const prices = comparison.vendors.map(v => v.price);
    return {
      lowest: Math.min(...prices),
      highest: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.sort()[Math.floor(prices.length / 2)],
      spread: Math.max(...prices) - Math.min(...prices),
    };
  }, [comparison]);

  if (isLoading) {
    return <div>Loading comparison...</div>;
  }

  if (!comparison || comparison.vendors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No active price lists found for this product
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Lowest Price</div>
          <div className="text-2xl font-bold text-green-600">
            ${statistics?.lowest.toFixed(2)}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Highest Price</div>
          <div className="text-2xl font-bold text-red-600">
            ${statistics?.highest.toFixed(2)}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Average</div>
          <div className="text-2xl font-bold">
            ${statistics?.average.toFixed(2)}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Median</div>
          <div className="text-2xl font-bold">
            ${statistics?.median.toFixed(2)}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Spread</div>
          <div className="text-2xl font-bold">
            ${statistics?.spread.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortColumn === 'price') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn('price');
                      setSortDirection('asc');
                    }
                  }}
                >
                  Unit Price
                  {sortColumn === 'price' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Case Price</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortColumn === 'leadTime') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn('leadTime');
                      setSortDirection('asc');
                    }
                  }}
                >
                  Lead Time
                  {sortColumn === 'leadTime' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortColumn === 'moq') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn('moq');
                      setSortDirection('asc');
                    }
                  }}
                >
                  MOQ
                  {sortColumn === 'moq' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Effective Until</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVendors.map((vendor) => {
              const isLowest = vendor.price === statistics?.lowest;
              const isHighest = vendor.price === statistics?.highest;

              return (
                <TableRow key={vendor.vendorId}>
                  <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                  <TableCell>
                    <div className={`font-bold ${isLowest ? 'text-green-600' : isHighest ? 'text-red-600' : ''}`}>
                      ${vendor.price.toFixed(2)}
                      {isLowest && <Badge variant="success" className="ml-2">Lowest</Badge>}
                      {isHighest && <Badge variant="destructive" className="ml-2">Highest</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendor.casePrice ? `$${vendor.casePrice.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>{vendor.leadTime} days</TableCell>
                  <TableCell>{vendor.moq}</TableCell>
                  <TableCell>{format(new Date(vendor.effectiveTo), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/vendor-management/price-lists/${vendor.priceListId}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => exportComparison(comparison)}>
          <Download className="mr-2 h-4 w-4" />
          Export Comparison
        </Button>
      </div>
    </div>
  );
}
```

---

## 4. Server Actions

### 4.1 Price List CRUD Operations

```typescript
// app/(main)/vendor-management/price-lists/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { priceListSchema } from './validation';
import { getCurrentUser } from '@/lib/auth';
import { sendPriceListNotification } from '@/lib/services/notification-service';
import { checkApprovalRequired, routeForApproval } from '@/lib/services/approval-service';

export async function createPriceList(data: PriceListFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Validate input
    const validatedData = priceListSchema.parse(data);

    // Generate unique price list number
    const priceListNumber = await generatePriceListNumber(validatedData.vendorId);

    // Calculate price changes if this updates existing prices
    const itemsWithChanges = await calculatePriceChanges(
      validatedData.vendorId,
      validatedData.items
    );

    // Determine if approval is required
    const requiresApproval = await checkApprovalRequired(itemsWithChanges);
    const initialStatus = requiresApproval ? 'PENDING_APPROVAL' : 'DRAFT';

    // Create price list
    const priceList = await prisma.priceList.create({
      data: {
        priceListNumber,
        name: validatedData.name,
        description: validatedData.description,
        vendorId: validatedData.vendorId,
        status: initialStatus,
        effectiveFrom: validatedData.effectiveFrom,
        effectiveTo: validatedData.effectiveTo,
        sourceType: validatedData.sourceType || 'manual',
        sourceId: validatedData.sourceId,
        sourceReference: validatedData.sourceReference,
        currency: validatedData.currency,
        isContractPricing: validatedData.isContractPricing || false,
        contractReference: validatedData.contractReference,
        takesPrecedence: validatedData.takesPrecedence || false,
        targeting: validatedData.targeting || null,
        terms: validatedData.terms || null,
        createdBy: user.id,
        items: {
          create: itemsWithChanges.map((item, index) => ({
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            productCategory: item.productCategory,
            basePrice: item.basePrice,
            unitPrice: item.unitPrice,
            casePrice: item.casePrice,
            bulkPrice: item.bulkPrice,
            pricingTiers: item.pricingTiers || null,
            moq: item.moq,
            packSize: item.packSize,
            leadTimeDays: item.leadTimeDays,
            shippingCost: item.shippingCost,
            previousPrice: item.previousPrice,
            priceChange: item.priceChange,
            priceChangePercent: item.priceChangePercent,
            changeReason: item.changeReason,
            sequence: index + 1,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        vendor: true,
      },
    });

    // Create history record
    await prisma.priceListHistory.create({
      data: {
        priceListId: priceList.id,
        changeType: 'CREATED',
        changedBy: user.id,
        reason: 'Price list created',
      },
    });

    // Route for approval if required
    if (requiresApproval) {
      await routeForApproval(priceList);
    }

    revalidatePath('/vendor-management/price-lists');

    return {
      success: true,
      priceListId: priceList.id,
      priceListNumber: priceList.priceListNumber,
      requiresApproval,
      message: requiresApproval
        ? 'Price list created and submitted for approval'
        : 'Price list created successfully',
    };
  } catch (error) {
    console.error('Create price list error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create price list',
    };
  }
}

export async function updatePriceList(priceListId: string, data: Partial<PriceListFormData>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const existingPriceList = await prisma.priceList.findUnique({
      where: { id: priceListId },
      include: { items: true },
    });

    if (!existingPriceList) {
      throw new Error('Price list not found');
    }

    if (existingPriceList.status !== 'DRAFT' && existingPriceList.status !== 'PENDING_APPROVAL') {
      throw new Error('Only draft or pending approval price lists can be edited');
    }

    // Track changes for history
    const changes: any[] = [];

    // Update price list
    const updated = await prisma.priceList.update({
      where: { id: priceListId },
      data: {
        name: data.name,
        description: data.description,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        targeting: data.targeting || null,
        terms: data.terms || null,
        updatedBy: user.id,
      },
    });

    // Update items if provided
    if (data.items) {
      // Delete removed items
      const newItemIds = data.items.filter(item => item.id).map(item => item.id);
      await prisma.priceListItem.deleteMany({
        where: {
          priceListId,
          id: { notIn: newItemIds },
        },
      });

      // Update or create items
      for (const item of data.items) {
        if (item.id) {
          // Update existing item
          await prisma.priceListItem.update({
            where: { id: item.id },
            data: {
              unitPrice: item.unitPrice,
              casePrice: item.casePrice,
              bulkPrice: item.bulkPrice,
              pricingTiers: item.pricingTiers || null,
              moq: item.moq,
              packSize: item.packSize,
              leadTimeDays: item.leadTimeDays,
              shippingCost: item.shippingCost,
              notes: item.notes,
            },
          });

          changes.push({
            changeType: 'ITEM_UPDATED',
            itemId: item.id,
            productId: item.productId,
            productCode: item.productCode,
          });
        } else {
          // Create new item
          await prisma.priceListItem.create({
            data: {
              priceListId,
              ...item,
            },
          });

          changes.push({
            changeType: 'ITEM_ADDED',
            productId: item.productId,
            productCode: item.productCode,
          });
        }
      }
    }

    // Create history records
    for (const change of changes) {
      await prisma.priceListHistory.create({
        data: {
          priceListId,
          changeType: change.changeType,
          itemId: change.itemId,
          productId: change.productId,
          productCode: change.productCode,
          changedBy: user.id,
          reason: 'Price list updated',
        },
      });
    }

    revalidatePath(`/vendor-management/price-lists/${priceListId}`);

    return {
      success: true,
      message: 'Price list updated successfully',
    };
  } catch (error) {
    console.error('Update price list error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update price list',
    };
  }
}

export async function activatePriceList(priceListId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const priceList = await prisma.priceList.findUnique({
      where: { id: priceListId },
      include: { items: true, vendor: true },
    });

    if (!priceList) {
      throw new Error('Price list not found');
    }

    if (priceList.status === 'ACTIVE') {
      throw new Error('Price list is already active');
    }

    // Check for overlapping active price lists
    const overlapping = await prisma.priceList.findMany({
      where: {
        vendorId: priceList.vendorId,
        status: 'ACTIVE',
        effectiveFrom: { lte: priceList.effectiveTo || new Date('2099-12-31') },
        effectiveTo: { gte: priceList.effectiveFrom },
        id: { not: priceListId },
      },
    });

    // Supersede overlapping price lists
    if (overlapping.length > 0) {
      await prisma.priceList.updateMany({
        where: {
          id: { in: overlapping.map(p => p.id) },
        },
        data: {
          status: 'SUPERSEDED',
          supersededById: priceListId,
        },
      });

      // Create history records for superseded price lists
      for (const superseded of overlapping) {
        await prisma.priceListHistory.create({
          data: {
            priceListId: superseded.id,
            changeType: 'SUPERSEDED',
            changedBy: user.id,
            reason: `Superseded by ${priceList.priceListNumber}`,
          },
        });
      }
    }

    // Activate price list
    await prisma.priceList.update({
      where: { id: priceListId },
      data: {
        status: 'ACTIVE',
        activatedBy: user.id,
        activatedAt: new Date(),
      },
    });

    // Create history record
    await prisma.priceListHistory.create({
      data: {
        priceListId,
        changeType: 'ACTIVATED',
        changedBy: user.id,
        reason: 'Price list activated',
      },
    });

    // Send notifications
    await sendPriceListNotification(priceList, 'activated', user);

    // Trigger price alerts
    await checkPriceAlerts(priceList);

    revalidatePath(`/vendor-management/price-lists/${priceListId}`);

    return {
      success: true,
      message: `Price list activated successfully${overlapping.length > 0 ? ` (superseded ${overlapping.length} previous price list(s))` : ''}`,
      supersededCount: overlapping.length,
    };
  } catch (error) {
    console.error('Activate price list error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate price list',
    };
  }
}

export async function importPriceList(data: ImportPriceListData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Validate import data
    const validatedRows = data.rows.filter(row => row.status !== 'error');

    if (validatedRows.length === 0) {
      throw new Error('No valid rows to import');
    }

    // Create price list
    const priceListNumber = await generatePriceListNumber(data.vendorId);

    const priceList = await prisma.priceList.create({
      data: {
        priceListNumber,
        name: data.name || `Imported Price List ${priceListNumber}`,
        description: `Bulk imported on ${new Date().toLocaleDateString()}`,
        vendorId: data.vendorId,
        status: 'DRAFT',
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        sourceType: 'import',
        currency: data.currency || 'USD',
        createdBy: user.id,
        items: {
          create: validatedRows.map((row, index) => ({
            productId: row.productId,
            productCode: row.productCode,
            productName: row.productName,
            productCategory: row.productCategory,
            basePrice: row.basePrice,
            unitPrice: row.unitPrice,
            casePrice: row.casePrice,
            bulkPrice: row.bulkPrice,
            moq: row.moq,
            packSize: row.packSize,
            leadTimeDays: row.leadTimeDays,
            sequence: index + 1,
          })),
        },
      },
    });

    // Create history record
    await prisma.priceListHistory.create({
      data: {
        priceListId: priceList.id,
        changeType: 'CREATED',
        changedBy: user.id,
        reason: `Bulk imported ${validatedRows.length} items`,
      },
    });

    revalidatePath('/vendor-management/price-lists');

    return {
      success: true,
      priceListId: priceList.id,
      importedCount: validatedRows.length,
      message: `Successfully imported ${validatedRows.length} items`,
    };
  } catch (error) {
    console.error('Import price list error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import price list',
    };
  }
}

export async function comparePrices(productId: string, options?: {
  locationId?: string;
  departmentId?: string;
}) {
  try {
    // Find all active price lists containing this product
    const priceLists = await prisma.priceList.findMany({
      where: {
        status: 'ACTIVE',
        items: {
          some: {
            productId,
          },
        },
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            tier: true,
          },
        },
        items: {
          where: {
            productId,
          },
        },
      },
    });

    // Filter by location/department if specified
    const filteredPriceLists = priceLists.filter(pl => {
      if (!pl.targeting) return true;

      const targeting = pl.targeting as any;

      if (options?.locationId && targeting.locations) {
        return targeting.locations.some((loc: any) =>
          loc.locationId === options.locationId && loc.isIncluded
        );
      }

      if (options?.departmentId && targeting.departments) {
        return targeting.departments.some((dept: any) =>
          dept.departmentId === options.departmentId && dept.isIncluded
        );
      }

      return true;
    });

    // Format comparison data
    const vendors = filteredPriceLists.map(pl => ({
      priceListId: pl.id,
      priceListNumber: pl.priceListNumber,
      vendorId: pl.vendor.id,
      vendorName: pl.vendor.companyName,
      vendorTier: pl.vendor.tier,
      price: Number(pl.items[0].unitPrice),
      casePrice: pl.items[0].casePrice ? Number(pl.items[0].casePrice) : null,
      leadTime: pl.items[0].leadTimeDays || 0,
      moq: pl.items[0].moq || 0,
      effectiveFrom: pl.effectiveFrom,
      effectiveTo: pl.effectiveTo,
      isContractPricing: pl.isContractPricing,
    }));

    return {
      success: true,
      productId,
      vendorCount: vendors.length,
      vendors,
    };
  } catch (error) {
    console.error('Compare prices error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare prices',
    };
  }
}

// Helper functions

async function generatePriceListNumber(vendorId: string): Promise<string> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { vendorCode: true },
  });

  if (!vendor) throw new Error('Vendor not found');

  const year = new Date().getFullYear();
  const count = await prisma.priceList.count({
    where: {
      vendorId,
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `PL-${year}-${vendor.vendorCode}-${sequence}`;
}

async function calculatePriceChanges(vendorId: string, items: PriceListItemInput[]) {
  const itemsWithChanges = [];

  for (const item of items) {
    // Find most recent price for this product from this vendor
    const previousItem = await prisma.priceListItem.findFirst({
      where: {
        productId: item.productId,
        priceList: {
          vendorId,
          status: 'ACTIVE',
        },
      },
      orderBy: {
        priceList: {
          effectiveFrom: 'desc',
        },
      },
    });

    let priceChange = null;
    let priceChangePercent = null;

    if (previousItem) {
      const oldPrice = Number(previousItem.unitPrice);
      const newPrice = Number(item.unitPrice);
      priceChange = newPrice - oldPrice;
      priceChangePercent = ((newPrice - oldPrice) / oldPrice) * 100;
    }

    itemsWithChanges.push({
      ...item,
      previousPrice: previousItem ? Number(previousItem.unitPrice) : null,
      priceChange,
      priceChangePercent,
    });
  }

  return itemsWithChanges;
}

async function checkPriceAlerts(priceList: any) {
  // Find applicable alerts
  const alerts = await prisma.priceAlert.findMany({
    where: {
      isActive: true,
      OR: [
        { alertType: 'NEW_LIST' },
        { alertType: 'ANY_CHANGE' },
      ],
    },
  });

  for (const alert of alerts) {
    const scope = alert.scope as any;

    // Check if alert applies to this price list
    const applies = checkAlertScope(scope, priceList);

    if (applies) {
      // Send notification
      await sendAlertNotification(alert, priceList);

      // Update last triggered
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { lastTriggeredAt: new Date() },
      });
    }
  }
}

function checkAlertScope(scope: any, priceList: any): boolean {
  switch (scope.scopeType) {
    case 'VENDOR':
      return scope.target === priceList.vendorId;
    case 'PRODUCT':
      return priceList.items.some((item: any) => item.productId === scope.target);
    case 'CATEGORY':
      return priceList.items.some((item: any) => item.productCategory === scope.target);
    case 'DEPARTMENT':
      if (!priceList.targeting) return false;
      const targeting = priceList.targeting as any;
      return targeting.departments?.some((dept: any) => dept.departmentId === scope.target);
    default:
      return false;
  }
}
```

---

## 5. Validation Schemas

### 5.1 Price List Validation

```typescript
// app/(main)/vendor-management/price-lists/validation.ts

import { z } from 'zod';

export const priceListSchema = z.object({
  // Basic Information
  name: z.string()
    .min(3, 'Price list name must be at least 3 characters')
    .max(200, 'Price list name must not exceed 200 characters'),

  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),

  vendorId: z.string()
    .uuid('Invalid vendor ID'),

  // Dates
  effectiveFrom: z.coerce.date(),

  effectiveTo: z.coerce.date()
    .optional()
    .nullable(),

  // Source tracking
  sourceType: z.enum(['manual', 'template', 'rfq', 'negotiation', 'contract', 'import'])
    .optional(),

  sourceId: z.string().optional(),

  sourceReference: z.string().optional(),

  // Pricing metadata
  currency: z.string()
    .length(3, 'Currency must be 3-letter ISO code')
    .default('USD'),

  isContractPricing: z.boolean()
    .default(false),

  contractReference: z.string().optional(),

  takesPrecedence: z.boolean()
    .default(false),

  // Targeting
  targeting: z.object({
    applicability: z.enum(['all', 'specific_locations', 'specific_departments', 'combined']),
    priority: z.number().int().min(1).max(100).default(10),
    locations: z.array(z.object({
      locationId: z.string(),
      locationName: z.string(),
      locationCode: z.string(),
      isIncluded: z.boolean(),
    })).optional(),
    departments: z.array(z.object({
      departmentId: z.string(),
      departmentName: z.string(),
      isIncluded: z.boolean(),
    })).optional(),
  }).optional(),

  // Terms
  terms: z.object({
    paymentTerms: z.object({
      paymentMethod: z.array(z.string()),
      netDays: z.number().int().positive(),
      earlyPaymentDiscount: z.object({
        discountPercent: z.number().min(0).max(100),
        daysForDiscount: z.number().int().positive(),
      }).optional(),
    }),
    warranty: z.object({
      warrantyPeriodDays: z.number().int().positive(),
      warrantyType: z.string(),
      warrantyTerms: z.string(),
    }),
    returnPolicy: z.object({
      returnsAccepted: z.boolean(),
      returnWindowDays: z.number().int().positive(),
      restockingFee: z.number().min(0).max(100).optional(),
      conditions: z.array(z.string()),
    }),
    deliveryTerms: z.object({
      deliveryMethod: z.string(),
      freeShippingThreshold: z.number().positive().optional(),
      deliveryDays: z.number().int().positive(),
      deliveryZones: z.array(z.string()).optional(),
    }),
    additionalTerms: z.string().optional(),
  }).optional(),

  // Items
  items: z.array(z.object({
    id: z.string().optional(), // For updates
    productId: z.string(),
    productCode: z.string(),
    productName: z.string(),
    productCategory: z.string(),

    // Pricing
    basePrice: z.number()
      .positive('Base price must be positive')
      .multipleOf(0.0001, 'Maximum 4 decimal places'),

    unitPrice: z.number()
      .positive('Unit price must be positive')
      .multipleOf(0.0001, 'Maximum 4 decimal places'),

    casePrice: z.number()
      .positive('Case price must be positive')
      .multipleOf(0.0001, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    bulkPrice: z.number()
      .positive('Bulk price must be positive')
      .multipleOf(0.0001, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    // Pricing tiers
    pricingTiers: z.object({
      tiers: z.array(z.object({
        tierId: z.string(),
        minQuantity: z.number().int().positive(),
        maxQuantity: z.number().int().positive().optional(),
        tierPrice: z.number().positive().multipleOf(0.0001),
        discountPercent: z.number().min(0).max(100).optional(),
        label: z.string(),
        isActive: z.boolean(),
      })),
    }).optional(),

    // Commercial terms
    moq: z.number()
      .int('MOQ must be a whole number')
      .positive('MOQ must be positive')
      .optional()
      .nullable(),

    packSize: z.number()
      .int('Pack size must be a whole number')
      .positive('Pack size must be positive')
      .optional()
      .nullable(),

    leadTimeDays: z.number()
      .int('Lead time must be a whole number')
      .positive('Lead time must be positive')
      .optional()
      .nullable(),

    shippingCost: z.number()
      .nonnegative('Shipping cost cannot be negative')
      .multipleOf(0.0001, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    // Change tracking
    changeReason: z.string()
      .max(500, 'Change reason must not exceed 500 characters')
      .optional(),

    notes: z.string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  })).min(1, 'Price list must have at least one item'),
})
.refine((data) => {
  // Validate effective date range
  if (data.effectiveTo && data.effectiveFrom >= data.effectiveTo) {
    return false;
  }
  return true;
}, {
  message: 'Effective end date must be after start date',
  path: ['effectiveTo'],
})
.refine((data) => {
  // Validate that targeting is specified when applicability is not 'all'
  if (data.targeting && data.targeting.applicability !== 'all') {
    if (data.targeting.applicability === 'specific_locations' && (!data.targeting.locations || data.targeting.locations.length === 0)) {
      return false;
    }
    if (data.targeting.applicability === 'specific_departments' && (!data.targeting.departments || data.targeting.departments.length === 0)) {
      return false;
    }
  }
  return true;
}, {
  message: 'Must specify locations or departments when applicability is not "all"',
  path: ['targeting'],
});

export const priceAlertSchema = z.object({
  alertType: z.enum(['INCREASE', 'DECREASE', 'ANY_CHANGE', 'EXPIRATION', 'NEW_LIST']),

  scope: z.object({
    scopeType: z.enum(['PRODUCT', 'CATEGORY', 'VENDOR', 'DEPARTMENT']),
    target: z.string(),
    targetName: z.string(),
    filters: z.object({
      minPriceThreshold: z.number().positive().optional(),
      maxPriceThreshold: z.number().positive().optional(),
      locationIds: z.array(z.string()).optional(),
      categoryIds: z.array(z.string()).optional(),
    }).optional(),
  }),

  threshold: z.object({
    percentage: z.number().min(-100).max(100).optional(),
    fixedAmount: z.number().optional(),
  }).optional(),

  notificationMethods: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    sms: z.boolean(),
  }),

  frequency: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'WEEKLY_SUMMARY']),
});

export const importDataSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  currency: z.string().length(3).default('USD'),

  rows: z.array(z.object({
    productCode: z.string(),
    productName: z.string(),
    productCategory: z.string(),
    basePrice: z.number().positive(),
    unitPrice: z.number().positive(),
    casePrice: z.number().positive().optional(),
    bulkPrice: z.number().positive().optional(),
    moq: z.number().int().positive().optional(),
    packSize: z.number().int().positive().optional(),
    leadTimeDays: z.number().int().positive().optional(),
    status: z.enum(['valid', 'warning', 'error']),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
  })),
});
```

---

## 6. Performance Optimization

### 6.1 Caching Strategy

```typescript
// lib/cache/price-list-cache.ts

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getPriceListById = unstable_cache(
  async (priceListId: string) => {
    return await prisma.priceList.findUnique({
      where: { id: priceListId },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            vendorCode: true,
            tier: true,
          },
        },
        items: {
          orderBy: { sequence: 'asc' },
        },
        approvals: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });
  },
  ['price-list-by-id'],
  {
    revalidate: 60, // 1 minute
    tags: ['price-lists'],
  }
);

export const getActivePriceListsByVendor = unstable_cache(
  async (vendorId: string) => {
    return await prisma.priceList.findMany({
      where: {
        vendorId,
        status: 'ACTIVE',
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: {
        items: {
          select: {
            id: true,
            productCode: true,
            productName: true,
            unitPrice: true,
          },
        },
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  },
  ['active-price-lists-by-vendor'],
  {
    revalidate: 300, // 5 minutes
    tags: ['price-lists', 'active-price-lists'],
  }
);

export const getPriceHistoryForProduct = unstable_cache(
  async (productId: string, vendorId?: string) => {
    return await prisma.priceListHistory.findMany({
      where: {
        productId,
        priceList: vendorId ? { vendorId } : undefined,
        changeType: 'PRICE_CHANGED',
      },
      include: {
        priceList: {
          select: {
            priceListNumber: true,
            vendor: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
      take: 100, // Last 100 price changes
    });
  },
  ['price-history-by-product'],
  {
    revalidate: 600, // 10 minutes
    tags: ['price-history'],
  }
);
```

### 6.2 Query Optimization

```typescript
// lib/services/price-list-service.ts

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class PriceListService {
  // Optimized query for price comparison
  static async getLowestPriceForProduct(
    productId: string,
    options?: {
      locationId?: string;
      departmentId?: string;
      excludeContractPricing?: boolean;
    }
  ) {
    const where: Prisma.PriceListWhereInput = {
      status: 'ACTIVE',
      effectiveFrom: { lte: new Date() },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: new Date() } },
      ],
      items: {
        some: {
          productId,
        },
      },
    };

    if (options?.excludeContractPricing) {
      where.isContractPricing = false;
    }

    // Use raw SQL for better performance on large datasets
    const result = await prisma.$queryRaw<Array<{
      price_list_id: string;
      vendor_id: string;
      vendor_name: string;
      unit_price: number;
      lead_time_days: number;
    }>>`
      SELECT
        pl.id as price_list_id,
        v.id as vendor_id,
        v.company_name as vendor_name,
        pli.unit_price,
        pli.lead_time_days
      FROM tb_price_list pl
      INNER JOIN tb_vendor v ON v.id = pl.vendor_id
      INNER JOIN tb_price_list_item pli ON pli.price_list_id = pl.id
      WHERE pl.status = 'ACTIVE'
        AND pl.effective_from <= NOW()
        AND (pl.effective_to IS NULL OR pl.effective_to >= NOW())
        AND pli.product_id = ${productId}
        ${options?.excludeContractPricing ? Prisma.sql`AND pl.is_contract_pricing = false` : Prisma.empty}
      ORDER BY pli.unit_price ASC
      LIMIT 1
    `;

    return result[0] || null;
  }

  // Batch query for multiple products
  static async getBatchPrices(productIds: string[], vendorId: string) {
    const items = await prisma.priceListItem.findMany({
      where: {
        productId: { in: productIds },
        priceList: {
          vendorId,
          status: 'ACTIVE',
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } },
          ],
        },
      },
      select: {
        productId: true,
        productCode: true,
        productName: true,
        unitPrice: true,
        casePrice: true,
        moq: true,
        leadTimeDays: true,
        priceList: {
          select: {
            id: true,
            priceListNumber: true,
            effectiveFrom: true,
            effectiveTo: true,
          },
        },
      },
      orderBy: {
        priceList: {
          effectiveFrom: 'desc',
        },
      },
    });

    // Group by product (take most recent for each)
    const priceMap = new Map();
    for (const item of items) {
      if (!priceMap.has(item.productId)) {
        priceMap.set(item.productId, item);
      }
    }

    return Array.from(priceMap.values());
  }
}
```

---

## 7. Scheduled Jobs

### 7.1 Price List Expiration Job

```typescript
// lib/jobs/price-list-expiration-job.ts

import { prisma } from '@/lib/prisma';
import { sendPriceListNotification } from '@/lib/services/notification-service';

/**
 * Daily job to check for expired price lists
 * Should run at 12:01 AM daily
 */
export async function checkExpiredPriceLists() {
  console.log('[Job] Checking for expired price lists...');

  try {
    const now = new Date();

    // Find active price lists that have expired
    const expiredPriceLists = await prisma.priceList.findMany({
      where: {
        status: 'ACTIVE',
        effectiveTo: {
          lt: now,
        },
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    console.log(`[Job] Found ${expiredPriceLists.length} expired price lists`);

    // Update status to EXPIRED
    for (const priceList of expiredPriceLists) {
      await prisma.priceList.update({
        where: { id: priceList.id },
        data: { status: 'EXPIRED' },
      });

      // Create history record
      await prisma.priceListHistory.create({
        data: {
          priceListId: priceList.id,
          changeType: 'EXPIRED',
          changedBy: 'system',
          reason: 'Effective end date reached',
        },
      });

      // Send notifications
      await sendPriceListNotification(priceList, 'expired', null);
    }

    console.log('[Job] Expired price lists processed successfully');

    return {
      success: true,
      count: expiredPriceLists.length,
    };
  } catch (error) {
    console.error('[Job] Error checking expired price lists:', error);
    throw error;
  }
}

/**
 * Daily job to send expiration warnings
 * Should run at 9:00 AM daily
 */
export async function sendExpirationWarnings() {
  console.log('[Job] Checking for price lists expiring soon...');

  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringPriceLists = await prisma.priceList.findMany({
      where: {
        status: 'ACTIVE',
        effectiveTo: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        vendor: true,
      },
    });

    console.log(`[Job] Found ${expiringPriceLists.length} price lists expiring within 30 days`);

    for (const priceList of expiringPriceLists) {
      const daysUntilExpiration = Math.ceil(
        (priceList.effectiveTo!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await sendPriceListNotification(priceList, 'expiring_soon', null, {
        daysUntilExpiration,
      });
    }

    console.log('[Job] Expiration warnings sent successfully');

    return {
      success: true,
      count: expiringPriceLists.length,
    };
  } catch (error) {
    console.error('[Job] Error sending expiration warnings:', error);
    throw error;
  }
}
```

### 7.2 Job Configuration

```typescript
// lib/jobs/index.ts

import cron from 'node-cron';
import { checkExpiredPriceLists, sendExpirationWarnings } from './price-list-expiration-job';

export function initializeScheduledJobs() {
  console.log('[Jobs] Initializing scheduled jobs...');

  // Check for expired price lists daily at 12:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log('[Cron] Running expired price lists check');
    try {
      await checkExpiredPriceLists();
    } catch (error) {
      console.error('[Cron] Expired price lists check failed:', error);
    }
  });

  // Send expiration warnings daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running expiration warnings job');
    try {
      await sendExpirationWarnings();
    } catch (error) {
      console.error('[Cron] Expiration warnings job failed:', error);
    }
  });

  console.log('[Jobs] Scheduled jobs initialized');
}
```

---

## 8. Email Notifications

### 8.1 Notification Templates

```typescript
// lib/services/notification-service.ts

import { sendEmail } from '@/lib/email';
import { PriceList } from '@prisma/client';

export async function sendPriceListNotification(
  priceList: any,
  eventType: 'created' | 'activated' | 'expired' | 'expiring_soon' | 'approval_required' | 'approved' | 'rejected',
  triggeredBy: any,
  metadata?: any
) {
  const templates = {
    created: {
      subject: `New Price List Created: ${priceList.priceListNumber}`,
      template: 'price-list-created',
    },
    activated: {
      subject: `Price List Activated: ${priceList.priceListNumber}`,
      template: 'price-list-activated',
    },
    expired: {
      subject: `Price List Expired: ${priceList.priceListNumber}`,
      template: 'price-list-expired',
    },
    expiring_soon: {
      subject: `Price List Expiring Soon: ${priceList.priceListNumber}`,
      template: 'price-list-expiring-soon',
    },
    approval_required: {
      subject: `Price List Approval Required: ${priceList.priceListNumber}`,
      template: 'price-list-approval-required',
    },
    approved: {
      subject: `Price List Approved: ${priceList.priceListNumber}`,
      template: 'price-list-approved',
    },
    rejected: {
      subject: `Price List Rejected: ${priceList.priceListNumber}`,
      template: 'price-list-rejected',
    },
  };

  const config = templates[eventType];

  await sendEmail({
    to: getRecipients(priceList, eventType),
    subject: config.subject,
    template: config.template,
    data: {
      priceList,
      triggeredBy,
      ...metadata,
      actionUrl: `${process.env.APP_URL}/vendor-management/price-lists/${priceList.id}`,
    },
  });
}

function getRecipients(priceList: any, eventType: string): string[] {
  const recipients: string[] = [];

  // Add creator
  if (priceList.createdBy) {
    recipients.push(priceList.createdBy);
  }

  // Add procurement team for certain events
  if (['activated', 'expired', 'expiring_soon'].includes(eventType)) {
    recipients.push('procurement@company.com');
  }

  // Add finance team for approvals
  if (['approval_required', 'approved', 'rejected'].includes(eventType)) {
    recipients.push('finance@company.com');
  }

  return recipients;
}
```

---

## 9. Security Implementation

### 9.1 Authorization Checks

```typescript
// lib/services/authorization-service.ts

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function canEditPriceList(priceListId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId },
    select: { status: true, createdBy: true },
  });

  if (!priceList) return false;

  // Only draft or pending approval price lists can be edited
  if (priceList.status !== 'DRAFT' && priceList.status !== 'PENDING_APPROVAL') {
    return false;
  }

  // Check if user is creator or has procurement role
  return (
    priceList.createdBy === user.id ||
    user.role === 'procurement-staff' ||
    user.role === 'financial-manager' ||
    user.role === 'executive'
  );
}

export async function canApprovePriceList(priceListId: string, approvalLevel: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const rolePermissions: Record<string, string[]> = {
    'PROCUREMENT_MANAGER': ['procurement-staff', 'purchasing-staff', 'financial-manager', 'executive'],
    'FINANCIAL_MANAGER': ['financial-manager', 'executive'],
    'EXECUTIVE': ['executive'],
  };

  const allowedRoles = rolePermissions[approvalLevel] || [];
  return allowedRoles.includes(user.role);
}

export async function canViewPriceList(priceListId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // All authenticated users can view price lists
  return true;
}

export async function canDeletePriceList(priceListId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId },
    select: { status: true, createdBy: true },
  });

  if (!priceList) return false;

  // Only draft price lists can be deleted
  if (priceList.status !== 'DRAFT') {
    return false;
  }

  // Check if user is creator or has procurement/financial role
  return (
    priceList.createdBy === user.id ||
    user.role === 'procurement-staff' ||
    user.role === 'financial-manager' ||
    user.role === 'executive'
  );
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// __tests__/price-list-service.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { PriceListService } from '@/lib/services/price-list-service';
import { prisma } from '@/lib/prisma';

describe('PriceListService', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.priceListItem.deleteMany();
    await prisma.priceList.deleteMany();
  });

  describe('getLowestPriceForProduct', () => {
    it('should return the lowest price from active price lists', async () => {
      // Create test price lists
      const vendor1 = await createTestVendor('Vendor 1');
      const vendor2 = await createTestVendor('Vendor 2');
      const product = await createTestProduct('Product 1');

      await createTestPriceList(vendor1.id, product.id, 10.00);
      await createTestPriceList(vendor2.id, product.id, 8.50);

      const result = await PriceListService.getLowestPriceForProduct(product.id);

      expect(result).toBeDefined();
      expect(result.unit_price).toBe(8.50);
      expect(result.vendor_id).toBe(vendor2.id);
    });

    it('should exclude expired price lists', async () => {
      const vendor = await createTestVendor('Vendor 1');
      const product = await createTestProduct('Product 1');

      // Create expired price list
      await createTestPriceList(vendor.id, product.id, 5.00, {
        effectiveTo: new Date('2023-01-01'),
      });

      // Create active price list
      await createTestPriceList(vendor.id, product.id, 10.00);

      const result = await PriceListService.getLowestPriceForProduct(product.id);

      expect(result).toBeDefined();
      expect(result.unit_price).toBe(10.00);
    });

    it('should exclude contract pricing when specified', async () => {
      const vendor = await createTestVendor('Vendor 1');
      const product = await createTestProduct('Product 1');

      // Create contract price list
      await createTestPriceList(vendor.id, product.id, 5.00, {
        isContractPricing: true,
      });

      // Create standard price list
      await createTestPriceList(vendor.id, product.id, 10.00);

      const result = await PriceListService.getLowestPriceForProduct(product.id, {
        excludeContractPricing: true,
      });

      expect(result).toBeDefined();
      expect(result.unit_price).toBe(10.00);
    });
  });

  describe('getBatchPrices', () => {
    it('should return prices for multiple products', async () => {
      const vendor = await createTestVendor('Vendor 1');
      const product1 = await createTestProduct('Product 1');
      const product2 = await createTestProduct('Product 2');

      await createTestPriceList(vendor.id, product1.id, 10.00);
      await createTestPriceList(vendor.id, product2.id, 15.00);

      const result = await PriceListService.getBatchPrices(
        [product1.id, product2.id],
        vendor.id
      );

      expect(result).toHaveLength(2);
      expect(result.find(r => r.productId === product1.id)?.unitPrice).toBe(10.00);
      expect(result.find(r => r.productId === product2.id)?.unitPrice).toBe(15.00);
    });
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/price-list-actions.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createPriceList, activatePriceList } from '@/app/(main)/vendor-management/price-lists/actions';
import { prisma } from '@/lib/prisma';

describe('Price List Actions', () => {
  beforeEach(async () => {
    await prisma.priceListItem.deleteMany();
    await prisma.priceList.deleteMany();
  });

  describe('createPriceList', () => {
    it('should create a price list with items', async () => {
      const vendor = await createTestVendor('Test Vendor');
      const product = await createTestProduct('Test Product');

      const result = await createPriceList({
        name: 'Test Price List',
        vendorId: vendor.id,
        effectiveFrom: new Date(),
        currency: 'USD',
        items: [
          {
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            productCategory: product.category,
            basePrice: 10.00,
            unitPrice: 10.00,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.priceListId).toBeDefined();

      const created = await prisma.priceList.findUnique({
        where: { id: result.priceListId },
        include: { items: true },
      });

      expect(created).toBeDefined();
      expect(created.items).toHaveLength(1);
    });

    it('should require approval for price increases >10%', async () => {
      const vendor = await createTestVendor('Test Vendor');
      const product = await createTestProduct('Test Product');

      // Create existing price list
      await createTestPriceList(vendor.id, product.id, 10.00);

      // Create new price list with 15% increase
      const result = await createPriceList({
        name: 'Updated Price List',
        vendorId: vendor.id,
        effectiveFrom: new Date(),
        currency: 'USD',
        items: [
          {
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            productCategory: product.category,
            basePrice: 11.50,
            unitPrice: 11.50,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.requiresApproval).toBe(true);
    });
  });

  describe('activatePriceList', () => {
    it('should supersede overlapping price lists', async () => {
      const vendor = await createTestVendor('Test Vendor');
      const product = await createTestProduct('Test Product');

      // Create existing active price list
      const existing = await createTestPriceList(vendor.id, product.id, 10.00, {
        status: 'ACTIVE',
      });

      // Create new price list
      const newPriceList = await createTestPriceList(vendor.id, product.id, 12.00, {
        status: 'DRAFT',
      });

      const result = await activatePriceList(newPriceList.id);

      expect(result.success).toBe(true);
      expect(result.supersededCount).toBe(1);

      // Check existing price list is superseded
      const superseded = await prisma.priceList.findUnique({
        where: { id: existing.id },
      });

      expect(superseded.status).toBe('SUPERSEDED');
      expect(superseded.supersededById).toBe(newPriceList.id);
    });
  });
});
```

---

## 11. Deployment Checklist

### 11.1 Pre-Deployment

- [ ] Database migrations applied
- [ ] Indexes created
- [ ] Validation schemas tested
- [ ] Server actions tested
- [ ] Components tested
- [ ] Authorization checks implemented
- [ ] Email templates configured
- [ ] Scheduled jobs configured
- [ ] Environment variables set
- [ ] Error logging configured

### 11.2 Post-Deployment

- [ ] Verify price list creation works
- [ ] Verify bulk import works
- [ ] Verify approval workflow functions
- [ ] Verify price comparison works
- [ ] Verify scheduled jobs run
- [ ] Verify email notifications send
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Verify caching works
- [ ] Verify authorization checks

---

## 12. Monitoring and Maintenance

### 12.1 Key Metrics to Monitor

- **Performance**:
  - Average price list creation time
  - Bulk import processing time
  - Price comparison query time
  - Page load times

- **Business Metrics**:
  - Number of active price lists
  - Number of expired price lists
  - Price changes per week
  - Approval turnaround time

- **System Health**:
  - Scheduled job success rate
  - Email delivery rate
  - Database query performance
  - Cache hit rate

### 12.2 Maintenance Tasks

**Daily**:
- Monitor scheduled job execution
- Check error logs for issues
- Verify email notifications sending

**Weekly**:
- Review price list statistics
- Check for orphaned records
- Analyze approval workflow metrics

**Monthly**:
- Archive old price lists
- Review and optimize slow queries
- Update documentation

**Quarterly**:
- Performance tuning
- Security audit
- User feedback review

---

## Appendices

### A. Database Diagram

```
┌─────────────────┐
│   tb_vendor     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐         ┌──────────────────┐
│ tb_price_list   ├────────►│ tb_price_list_   │
│                 │  1:N    │ item             │
└────────┬────────┘         └──────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ tb_price_list_  │
│ approval        │
└─────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ tb_price_list_  │
│ history         │
└─────────────────┘
```

### B. Glossary

- **Price List**: Collection of products with pricing from a specific vendor
- **Line Item**: Individual product entry within a price list
- **Pricing Tier**: Quantity-based pricing structure
- **Supersession**: Replacing an active price list with a newer one
- **Contract Pricing**: Pricing derived from awarded RFQs or negotiated contracts
- **Targeting**: Specifying which locations/departments a price list applies to
- **Price Alert**: Automated notification for price changes
- **Effective Date**: Date range when a price list is valid

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial technical specification |

---

*End of Technical Specification Document*
