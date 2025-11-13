# Pricelist Templates - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Pricelist Templates
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
- **Rich Text**: Tiptap or Slate (for custom instructions)

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers
- **ORM**: Prisma Client
- **Database**: PostgreSQL with JSONB support
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 / Azure Blob Storage (for template exports)
- **Email**: SendGrid / AWS SES (for distribution notifications)
- **Scheduling**: node-cron or BullMQ (for reminder jobs)

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
        └── pricelist-templates/
            ├── page.tsx                    # Server Component (template list)
            ├── [id]/
            │   ├── page.tsx               # Server Component (template detail)
            │   ├── edit/
            │   │   └── page.tsx           # Server Component with Client form
            │   ├── distribute/
            │   │   └── page.tsx           # Distribution wizard
            │   └── analytics/
            │       └── page.tsx           # Analytics dashboard
            ├── new/
            │   └── page.tsx               # Server Component with Client wizard
            ├── components/
            │   ├── TemplateList.tsx        # Client Component (interactive list)
            │   ├── TemplateCard.tsx        # Client Component
            │   ├── TemplateWizard.tsx      # Client Component (multi-step form)
            │   ├── ProductSelector.tsx     # Client Component
            │   ├── PricingStructureBuilder.tsx  # Client Component
            │   ├── DistributionWizard.tsx  # Client Component
            │   ├── SubmissionTracker.tsx   # Client Component
            │   └── TemplateVersionHistory.tsx   # Client Component
            ├── actions.ts                 # Server Actions (mutations)
            └── types.ts                   # TypeScript interfaces
```

### 1.3 Data Flow Architecture

```
User Interface (Client Components)
        ↓
Server Actions / Route Handlers
        ↓
Business Logic Layer
        ↓
Prisma ORM
        ↓
PostgreSQL Database (JSON fields for template data)
        ↓
External Services (Email, File Storage, Scheduling)
```

**Key Principles**:
- Server Components for data fetching (default)
- Client Components only for interactivity (wizard, form builder)
- Server Actions for mutations (preferred over API routes)
- React Query for client-side caching and real-time updates
- Optimistic updates for better UX

---

## 2. Database Implementation

### 2.1 Schema Design Strategy

**Approach**: Leverage existing `tb_vendor` table with JSON field extensions for template metadata.

**New Table Required**: `tb_pricelist_template` (core template entity)

```prisma
// schema.prisma addition

model PricelistTemplate {
  id                String   @id @default(uuid())
  code              String   @unique
  name              String
  description       String?
  category          String
  status            TemplateStatus @default(DRAFT)
  version           Int      @default(1)
  effectiveFrom     DateTime
  effectiveTo       DateTime?

  // JSON field for template structure
  structure         Json     // Contains products, pricing, targeting, custom fields

  // Metadata
  createdBy         String
  createdAt         DateTime @default(now())
  updatedBy         String?
  updatedAt         DateTime @updatedAt
  approvedBy        String?
  approvedAt        DateTime?

  // Soft delete
  deletedAt         DateTime?

  // Relations
  distributions     TemplateDistribution[]
  versions          TemplateVersion[]

  @@map("tb_pricelist_template")
}

enum TemplateStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  DISTRIBUTED
  ACTIVE
  ARCHIVED
}

model TemplateDistribution {
  id                String   @id @default(uuid())
  templateId        String
  template          PricelistTemplate @relation(fields: [templateId], references: [id])
  vendorId          String

  distributedAt     DateTime @default(now())
  distributedBy     String
  submissionDeadline DateTime

  // Status tracking
  status            DistributionStatus @default(SENT)
  viewedAt          DateTime?
  startedAt         DateTime?
  submittedAt       DateTime?

  // Submission data
  submissionData    Json?    // Vendor's price submission

  // Notifications
  remindersSent     Int      @default(0)
  lastReminderAt    DateTime?

  @@map("tb_template_distribution")
}

enum DistributionStatus {
  SENT
  VIEWED
  IN_PROGRESS
  SUBMITTED
  OVERDUE
  EXPIRED
}

model TemplateVersion {
  id                String   @id @default(uuid())
  templateId        String
  template          PricelistTemplate @relation(fields: [templateId], references: [id])
  versionNumber     String   // e.g., "1.0", "1.5", "2.0"
  versionType       VersionType

  // Snapshot of template at this version
  snapshot          Json

  // Change tracking
  changeSummary     String
  releaseNotes      String?
  changedBy         String
  changedAt         DateTime @default(now())

  isMilestone       Boolean  @default(false)
  milestoneLabel    String?

  @@map("tb_template_version")
}

enum VersionType {
  MAJOR
  MINOR
}
```

### 2.2 JSON Structure Implementation

#### 2.2.1 PricelistTemplate.structure JSON

```typescript
// lib/types/pricelist-template.ts

interface TemplateStructure {
  // Products Assignment
  products: Array<{
    productId: string;
    productCode: string;
    productName: string;
    category: string;
    sequence: number;
    isRequired: boolean;

    // Product specifications
    specifications: {
      uom: string;
      packSize: number;
      moq: number;
      expectedDeliveryDays: number;
    };

    // Custom attributes per product
    customAttributes?: Record<string, any>;
  }>;

  // Pricing Structure
  pricingStructure: {
    columns: Array<{
      id: string;
      name: string;
      type: 'unit_price' | 'case_price' | 'bulk_price' | 'promotional_price' | 'contract_price';
      description?: string;
      isRequired: boolean;
      sequence: number;
    }>;

    // Quantity breakpoints for tiered pricing
    quantityBreakpoints?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      label: string;
    }>;

    // Discount rules
    discountRules?: Array<{
      id: string;
      type: 'percentage' | 'fixed_amount' | 'volume';
      condition: string;           // e.g., "quantity > 1000"
      value: number;
      description: string;
    }>;

    // Currency settings
    currency: {
      primaryCurrency: string;     // ISO 4217 code
      allowMultipleCurrencies: boolean;
      additionalCurrencies?: string[];
      exchangeRateHandling: 'auto' | 'locked' | 'manual';
    };

    // Price tolerance
    priceTolerance: {
      minPercentage: number;       // -10% = 10% below reference
      maxPercentage: number;       // +20% = 20% above reference
    };
  };

  // Location & Department Targeting
  targeting: {
    locations?: Array<{
      locationId: string;
      locationName: string;
      isIncluded: boolean;
      specificPricing?: boolean;   // Different pricing per location
    }>;

    departments?: Array<{
      departmentId: string;
      departmentName: string;
      isIncluded: boolean;
    }>;

    vendorTypes?: string[];        // Eligible vendor types
  };

  // Custom Fields
  customFields?: Array<{
    id: string;
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
    isRequired: boolean;
    options?: string[];            // For select type
    defaultValue?: any;
    validationRules?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
    helpText?: string;
  }>;

  // Instructions & Terms
  instructions?: {
    emailSubject?: string;
    emailBody?: string;            // Rich text / HTML
    termsAndConditions?: string;
    submissionGuidelines?: string;
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }>;
  };

  // Notification Settings
  notifications: {
    emailEnabled: boolean;
    portalEnabled: boolean;
    smsEnabled: boolean;

    reminderSchedule: Array<{
      daysBeforeDeadline: number;
      reminderType: 'email' | 'sms' | 'portal' | 'all';
    }>;

    escalationEnabled: boolean;
    escalationRecipients?: string[];
  };
}
```

#### 2.2.2 TemplateDistribution.submissionData JSON

```typescript
// lib/types/pricelist-template.ts

interface VendorSubmissionData {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  submittedAt: string;

  // Product pricing submissions
  productPrices: Array<{
    productId: string;
    productCode: string;

    // Pricing data matching template structure
    prices: Record<string, number>;  // columnId -> price value

    // Additional vendor data
    leadTimeDays?: number;
    moq?: number;
    packSize?: number;
    availability: 'in_stock' | 'backordered' | 'discontinued';
    notes?: string;
  }>;

  // Custom field responses
  customFieldResponses?: Record<string, any>;

  // Vendor documents (optional)
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  }>;

  // Submission metadata
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    submissionDuration?: number;   // seconds to complete
    incompleteFields?: string[];
  };
}
```

### 2.3 Database Indexes

```sql
-- Template search and filtering
CREATE INDEX idx_template_code ON tb_pricelist_template(code);
CREATE INDEX idx_template_status ON tb_pricelist_template(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_template_category ON tb_pricelist_template(category);
CREATE INDEX idx_template_effective_dates ON tb_pricelist_template(effective_from, effective_to);

-- Full-text search on template name, description
CREATE INDEX idx_template_search ON tb_pricelist_template
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- JSON field indexes for product search
CREATE INDEX idx_template_products ON tb_pricelist_template
USING GIN ((structure->'products'));

-- Distribution tracking
CREATE INDEX idx_distribution_status ON tb_template_distribution(status, submission_deadline);
CREATE INDEX idx_distribution_vendor ON tb_template_distribution(vendor_id, status);
CREATE INDEX idx_distribution_overdue ON tb_template_distribution(submission_deadline)
WHERE status NOT IN ('SUBMITTED', 'EXPIRED');

-- Version history
CREATE INDEX idx_version_template ON tb_template_version(template_id, version_number DESC);
CREATE INDEX idx_version_milestone ON tb_template_version(is_milestone, changed_at DESC)
WHERE is_milestone = true;
```

---

## 3. Component Architecture

### 3.1 Template Creation Wizard Component

```typescript
// app/(main)/vendor-management/pricelist-templates/components/TemplateWizard.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema } from '../validation';
import { createTemplate } from '../actions';

interface TemplateWizardProps {
  initialData?: Partial<Template>;
}

export function TemplateWizard({ initialData }: TemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [savedDraft, setSavedDraft] = useState<string | null>(null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialData || getEmptyTemplate(),
  });

  const steps = [
    { id: 1, name: 'Basic Information', component: <BasicInfoStep form={form} /> },
    { id: 2, name: 'Product Assignment', component: <ProductAssignmentStep form={form} /> },
    { id: 3, name: 'Pricing Structure', component: <PricingStructureStep form={form} /> },
    { id: 4, name: 'Targeting', component: <TargetingStep form={form} /> },
    { id: 5, name: 'Custom Fields', component: <CustomFieldsStep form={form} /> },
    { id: 6, name: 'Preview', component: <PreviewStep form={form} /> },
  ];

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = form.getValues();
      const draftId = await saveDraft(data);
      setSavedDraft(draftId);
    }, 120000);

    return () => clearInterval(interval);
  }, [form]);

  const handleNext = async () => {
    // Validate current step before proceeding
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await createTemplate(data);
      if (result.success) {
        router.push(`/vendor-management/pricelist-templates/${result.templateId}`);
      }
    } catch (error) {
      console.error('Template creation error:', error);
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}
              `}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className="ml-2 text-sm font-medium">{step.name}</span>
              {index < steps.length - 1 && (
                <div className="w-16 h-1 mx-4 bg-muted" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="bg-card rounded-lg shadow p-6">
        {steps[currentStep - 1].component}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={async () => {
              const draftId = await saveDraft(form.getValues());
              toast.success('Draft saved');
            }}>
              Save Draft
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>
                Submit for Approval
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {savedDraft && (
        <div className="fixed bottom-4 right-4 bg-muted px-4 py-2 rounded-md text-sm">
          Draft auto-saved at {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
```

### 3.2 Product Selector Component

```typescript
// components/ProductSelector.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../actions';

interface ProductSelectorProps {
  selectedProducts: string[];
  onProductsChange: (productIds: string[]) => void;
}

export function ProductSelector({ selectedProducts, onProductsChange }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Query products with debounced search
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter],
    queryFn: () => searchProducts({ search: searchTerm, category: categoryFilter }),
    staleTime: 60000,
  });

  const handleToggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      onProductsChange(selectedProducts.filter(id => id !== productId));
    } else {
      onProductsChange([...selectedProducts, productId]);
    }
  };

  const handleBulkAdd = (category: string) => {
    const categoryProducts = products?.filter(p => p.category === category) || [];
    const newIds = categoryProducts.map(p => p.id);
    onProductsChange([...new Set([...selectedProducts, ...newIds])]);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Search and filters */}
      <div className="col-span-3 space-y-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="beverage">Beverage</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => handleBulkAdd(categoryFilter)} variant="outline">
          Add All in Category
        </Button>
      </div>

      {/* Product list */}
      <div className="col-span-6">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div>Loading products...</div>
          ) : (
            products?.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleToggleProduct(product.id)}
                  />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.code} • {product.category}
                    </div>
                  </div>
                </div>

                <Badge variant="outline">{product.uom}</Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected products */}
      <div className="col-span-3">
        <div className="sticky top-4">
          <h3 className="font-semibold mb-2">
            Selected ({selectedProducts.length})
          </h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {selectedProducts.map(id => {
              const product = products?.find(p => p.id === id);
              return product ? (
                <div key={id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate">{product.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleProduct(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Server Actions

### 4.1 Template CRUD Operations

```typescript
// app/(main)/vendor-management/pricelist-templates/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { templateSchema } from './validation';
import { getCurrentUser } from '@/lib/auth';

export async function createTemplate(data: TemplateFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Validate input
    const validatedData = templateSchema.parse(data);

    // Generate unique template code
    const code = await generateTemplateCode(validatedData.category);

    // Create template
    const template = await prisma.pricelistTemplate.create({
      data: {
        code,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        status: 'DRAFT',
        version: 1,
        effectiveFrom: validatedData.effectiveFrom,
        effectiveTo: validatedData.effectiveTo,
        structure: {
          products: validatedData.products,
          pricingStructure: validatedData.pricingStructure,
          targeting: validatedData.targeting,
          customFields: validatedData.customFields,
          instructions: validatedData.instructions,
          notifications: validatedData.notifications,
        },
        createdBy: user.id,
      },
    });

    // Create initial version
    await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        versionNumber: '1.0',
        versionType: 'MAJOR',
        snapshot: template.structure,
        changeSummary: 'Initial template creation',
        changedBy: user.id,
      },
    });

    revalidatePath('/vendor-management/pricelist-templates');

    return {
      success: true,
      templateId: template.id,
      message: 'Template created successfully',
    };
  } catch (error) {
    console.error('Create template error:', error);
    return {
      success: false,
      error: 'Failed to create template',
    };
  }
}

export async function updateTemplate(templateId: string, data: Partial<TemplateFormData>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const existingTemplate = await prisma.pricelistTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw new Error('Template not found');
    }

    // Determine if this is a major or minor version change
    const versionType = determineVersionType(existingTemplate.structure, data);
    const newVersionNumber = incrementVersion(existingTemplate.version.toString(), versionType);

    // Update template
    const updated = await prisma.pricelistTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        structure: {
          ...existingTemplate.structure,
          ...data,
        },
        version: parseInt(newVersionNumber.split('.')[0]),
        updatedBy: user.id,
      },
    });

    // Create version record
    await prisma.templateVersion.create({
      data: {
        templateId: templateId,
        versionNumber: newVersionNumber,
        versionType: versionType,
        snapshot: updated.structure,
        changeSummary: data.changeSummary || 'Template updated',
        changedBy: user.id,
      },
    });

    revalidatePath(`/vendor-management/pricelist-templates/${templateId}`);

    return {
      success: true,
      message: 'Template updated successfully',
    };
  } catch (error) {
    console.error('Update template error:', error);
    return {
      success: false,
      error: 'Failed to update template',
    };
  }
}

export async function distributeTemplate(
  templateId: string,
  vendorIds: string[],
  deadline: Date,
  notificationSettings: NotificationSettings
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const template = await prisma.pricelistTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.status !== 'APPROVED') {
      throw new Error('Template must be approved before distribution');
    }

    // Create distribution records
    const distributions = await prisma.templateDistribution.createMany({
      data: vendorIds.map(vendorId => ({
        templateId,
        vendorId,
        submissionDeadline: deadline,
        distributedBy: user.id,
        status: 'SENT',
      })),
    });

    // Send email notifications
    await sendDistributionEmails(
      template,
      vendorIds,
      deadline,
      notificationSettings
    );

    // Schedule reminder jobs
    await scheduleReminders(templateId, vendorIds, deadline);

    // Update template status
    await prisma.pricelistTemplate.update({
      where: { id: templateId },
      data: { status: 'DISTRIBUTED' },
    });

    revalidatePath(`/vendor-management/pricelist-templates/${templateId}`);

    return {
      success: true,
      distributionCount: vendorIds.length,
      message: `Template distributed to ${vendorIds.length} vendors`,
    };
  } catch (error) {
    console.error('Distribute template error:', error);
    return {
      success: false,
      error: 'Failed to distribute template',
    };
  }
}
```

---

## 5. Validation Schemas

### 5.1 Template Validation

```typescript
// app/(main)/vendor-management/pricelist-templates/validation.ts

import { z } from 'zod';

export const templateSchema = z.object({
  // Basic Information
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name must not exceed 100 characters'),

  code: z.string().optional(),

  description: z.string().max(500, 'Description too long').optional(),

  category: z.string().min(1, 'Category is required'),

  effectiveFrom: z.coerce.date(),

  effectiveTo: z.coerce.date().optional(),

  // Products
  products: z.array(z.object({
    productId: z.string(),
    productCode: z.string(),
    productName: z.string(),
    category: z.string(),
    sequence: z.number().int().positive(),
    isRequired: z.boolean(),
    specifications: z.object({
      uom: z.string(),
      packSize: z.number().positive(),
      moq: z.number().positive(),
      expectedDeliveryDays: z.number().int().positive(),
    }),
    customAttributes: z.record(z.any()).optional(),
  })).min(1, 'At least one product is required'),

  // Pricing Structure
  pricingStructure: z.object({
    columns: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['unit_price', 'case_price', 'bulk_price', 'promotional_price', 'contract_price']),
      description: z.string().optional(),
      isRequired: z.boolean(),
      sequence: z.number().int(),
    })).min(1, 'At least one pricing column is required'),

    quantityBreakpoints: z.array(z.object({
      minQuantity: z.number().positive(),
      maxQuantity: z.number().positive().optional(),
      label: z.string(),
    })).optional(),

    discountRules: z.array(z.object({
      id: z.string(),
      type: z.enum(['percentage', 'fixed_amount', 'volume']),
      condition: z.string(),
      value: z.number(),
      description: z.string(),
    })).optional(),

    currency: z.object({
      primaryCurrency: z.string().length(3, 'Invalid currency code'),
      allowMultipleCurrencies: z.boolean(),
      additionalCurrencies: z.array(z.string()).optional(),
      exchangeRateHandling: z.enum(['auto', 'locked', 'manual']),
    }),

    priceTolerance: z.object({
      minPercentage: z.number().min(-100).max(0),
      maxPercentage: z.number().min(0).max(100),
    }),
  }),

  // Targeting
  targeting: z.object({
    locations: z.array(z.object({
      locationId: z.string(),
      locationName: z.string(),
      isIncluded: z.boolean(),
      specificPricing: z.boolean().optional(),
    })).optional(),

    departments: z.array(z.object({
      departmentId: z.string(),
      departmentName: z.string(),
      isIncluded: z.boolean(),
    })).optional(),

    vendorTypes: z.array(z.string()).optional(),
  }),

  // Custom Fields
  customFields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'textarea']),
    isRequired: z.boolean(),
    options: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    validationRules: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      message: z.string().optional(),
    }).optional(),
    helpText: z.string().optional(),
  })).optional(),

  // Instructions
  instructions: z.object({
    emailSubject: z.string().optional(),
    emailBody: z.string().optional(),
    termsAndConditions: z.string().optional(),
    submissionGuidelines: z.string().optional(),
  }).optional(),

  // Notifications
  notifications: z.object({
    emailEnabled: z.boolean(),
    portalEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    reminderSchedule: z.array(z.object({
      daysBeforeDeadline: z.number().int().positive(),
      reminderType: z.enum(['email', 'sms', 'portal', 'all']),
    })),
    escalationEnabled: z.boolean(),
    escalationRecipients: z.array(z.string()).optional(),
  }),
}).refine((data) => {
  // Validate effective date range
  if (data.effectiveTo && data.effectiveFrom >= data.effectiveTo) {
    return false;
  }
  return true;
}, {
  message: 'Effective end date must be after start date',
  path: ['effectiveTo'],
});

export const vendorSubmissionSchema = z.object({
  templateId: z.string(),
  vendorId: z.string(),

  productPrices: z.array(z.object({
    productId: z.string(),
    productCode: z.string(),
    prices: z.record(z.number().positive()),
    leadTimeDays: z.number().int().positive().optional(),
    moq: z.number().positive().optional(),
    packSize: z.number().positive().optional(),
    availability: z.enum(['in_stock', 'backordered', 'discontinued']),
    notes: z.string().max(500).optional(),
  })).min(1, 'At least one product must be priced'),

  customFieldResponses: z.record(z.any()).optional(),

  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number(),
  })).optional(),
});
```

---

## 6. Performance Optimization

### 6.1 Caching Strategy

```typescript
// lib/cache/template-cache.ts

import { unstable_cache } from 'next/cache';

export const getTemplateById = unstable_cache(
  async (templateId: string) => {
    return await prisma.pricelistTemplate.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: { changedAt: 'desc' },
          take: 5,
        },
        distributions: {
          where: { status: { not: 'EXPIRED' } },
          include: { vendor: true },
        },
      },
    });
  },
  ['template-by-id'],
  {
    revalidate: 300, // 5 minutes
    tags: ['templates'],
  }
);

export const getActiveTemplates = unstable_cache(
  async () => {
    return await prisma.pricelistTemplate.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['active-templates'],
  {
    revalidate: 600, // 10 minutes
    tags: ['templates'],
  }
);
```

### 6.2 Database Query Optimization

```typescript
// Efficient distribution status query with pagination
export async function getDistributionStats(templateId: string) {
  const stats = await prisma.templateDistribution.groupBy({
    by: ['status'],
    where: { templateId },
    _count: true,
  });

  return stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<DistributionStatus, number>);
}

// Optimized product search with full-text search
export async function searchProducts(query: string, category?: string) {
  return await prisma.$queryRaw`
    SELECT id, code, name, category, uom
    FROM tb_product
    WHERE
      deleted_at IS NULL
      AND (
        name ILIKE ${`%${query}%`}
        OR code ILIKE ${`%${query}%`}
        OR to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', ${query})
      )
      ${category ? Prisma.sql`AND category = ${category}` : Prisma.empty}
    ORDER BY name
    LIMIT 100
  `;
}
```

---

## 7. Security Implementation

### 7.1 Authentication & Authorization

```typescript
// lib/auth/permissions.ts

export async function canCreateTemplate(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  return user?.role?.permissions.includes('create_templates') ?? false;
}

export async function canDistributeTemplate(
  userId: string,
  templateId: string
): Promise<boolean> {
  const template = await prisma.pricelistTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template || template.status !== 'APPROVED') {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  return user?.role?.permissions.includes('distribute_templates') ?? false;
}
```

### 7.2 Data Sanitization

```typescript
// lib/security/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeTemplateInstructions(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeVendorSubmission(data: VendorSubmissionData): VendorSubmissionData {
  return {
    ...data,
    productPrices: data.productPrices.map(price => ({
      ...price,
      notes: price.notes ? DOMPurify.sanitize(price.notes) : undefined,
    })),
  };
}
```

---

## 8. Email Notification System

### 8.1 Email Templates

```typescript
// lib/email/template-distribution.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDistributionEmail(
  template: PricelistTemplate,
  vendor: Vendor,
  submissionLink: string,
  deadline: Date
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Price List Template - ${template.name}</title>
      </head>
      <body>
        <h1>New Pricing Template Request</h1>
        <p>Dear ${vendor.name},</p>

        <p>You have been invited to submit pricing for: <strong>${template.name}</strong></p>

        <div>
          <h2>Template Details:</h2>
          <ul>
            <li>Category: ${template.category}</li>
            <li>Number of Products: ${(template.structure as TemplateStructure).products.length}</li>
            <li>Submission Deadline: ${deadline.toLocaleDateString()}</li>
          </ul>
        </div>

        <p>
          <a href="${submissionLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Submit Your Pricing
          </a>
        </p>

        <p>Please submit your pricing before ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}.</p>

        <p>Best regards,<br>Procurement Team</p>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: 'procurement@company.com',
    to: vendor.email,
    subject: `Price List Request: ${template.name}`,
    html: emailHtml,
  });
}

export async function sendReminderEmail(
  template: PricelistTemplate,
  vendor: Vendor,
  submissionLink: string,
  deadline: Date,
  daysRemaining: number
) {
  await resend.emails.send({
    from: 'procurement@company.com',
    to: vendor.email,
    subject: `Reminder: ${daysRemaining} days to submit pricing for ${template.name}`,
    html: `
      <p>Dear ${vendor.name},</p>
      <p>This is a reminder that you have <strong>${daysRemaining} days</strong> remaining to submit your pricing for ${template.name}.</p>
      <p>Deadline: ${deadline.toLocaleDateString()}</p>
      <p><a href="${submissionLink}">Submit Now</a></p>
    `,
  });
}
```

---

## 9. Scheduled Jobs

### 9.1 Reminder Scheduler

```typescript
// lib/jobs/template-reminders.ts

import cron from 'node-cron';

export function scheduleTemplateReminders() {
  // Run daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    const today = new Date();

    // Get distributions with upcoming deadlines
    const distributions = await prisma.templateDistribution.findMany({
      where: {
        status: { in: ['SENT', 'VIEWED', 'IN_PROGRESS'] },
        submissionDeadline: {
          gte: today,
          lte: addDays(today, 7), // Next 7 days
        },
      },
      include: {
        template: true,
        vendor: true,
      },
    });

    for (const dist of distributions) {
      const daysUntilDeadline = differenceInDays(dist.submissionDeadline, today);

      // Send reminder if scheduled (7, 3, 1 days before)
      if ([7, 3, 1].includes(daysUntilDeadline)) {
        await sendReminderEmail(
          dist.template,
          dist.vendor,
          generateSubmissionLink(dist.id),
          dist.submissionDeadline,
          daysUntilDeadline
        );

        // Update reminder count
        await prisma.templateDistribution.update({
          where: { id: dist.id },
          data: {
            remindersSent: { increment: 1 },
            lastReminderAt: new Date(),
          },
        });
      }
    }
  });
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// __tests__/pricelist-templates/template-creation.test.ts

import { describe, it, expect, vi } from 'vitest';
import { createTemplate } from '../app/(main)/vendor-management/pricelist-templates/actions';

describe('Template Creation', () => {
  it('should create template with valid data', async () => {
    const mockData = {
      name: 'Q1 Food Pricing',
      category: 'food',
      effectiveFrom: new Date('2024-01-01'),
      products: [
        {
          productId: '1',
          productCode: 'PROD-001',
          productName: 'Product 1',
          category: 'food',
          sequence: 1,
          isRequired: true,
          specifications: {
            uom: 'kg',
            packSize: 1,
            moq: 10,
            expectedDeliveryDays: 7,
          },
        },
      ],
      pricingStructure: {
        columns: [
          {
            id: '1',
            name: 'Unit Price',
            type: 'unit_price',
            isRequired: true,
            sequence: 1,
          },
        ],
        currency: {
          primaryCurrency: 'USD',
          allowMultipleCurrencies: false,
          exchangeRateHandling: 'auto',
        },
        priceTolerance: {
          minPercentage: -10,
          maxPercentage: 20,
        },
      },
      targeting: {},
      notifications: {
        emailEnabled: true,
        portalEnabled: true,
        smsEnabled: false,
        reminderSchedule: [
          { daysBeforeDeadline: 7, reminderType: 'email' },
        ],
        escalationEnabled: false,
      },
    };

    const result = await createTemplate(mockData);

    expect(result.success).toBe(true);
    expect(result.templateId).toBeDefined();
  });

  it('should fail with missing required products', async () => {
    const invalidData = {
      name: 'Invalid Template',
      category: 'food',
      products: [], // Empty products
    };

    await expect(createTemplate(invalidData)).rejects.toThrow();
  });
});
```

---

## 11. Deployment Considerations

### 11.1 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/carmen"

# Authentication
NEXTAUTH_URL="https://app.company.com"
NEXTAUTH_SECRET="your-secret-key"

# Email Service
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="procurement@company.com"

# File Storage
AWS_S3_BUCKET="company-templates"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"

# Feature Flags
ENABLE_TEMPLATE_VERSIONING=true
ENABLE_MULTI_CURRENCY=true
ENABLE_SCHEDULED_REMINDERS=true
```

### 11.2 Migration Scripts

```typescript
// prisma/migrations/add_pricelist_templates.sql

-- Create pricelist_template table
CREATE TABLE tb_pricelist_template (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  structure JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create template_distribution table
CREATE TABLE tb_template_distribution (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES tb_pricelist_template(id),
  vendor_id TEXT NOT NULL,
  distributed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  distributed_by TEXT NOT NULL,
  submission_deadline TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'SENT',
  viewed_at TIMESTAMP,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  submission_data JSONB,
  reminders_sent INTEGER NOT NULL DEFAULT 0,
  last_reminder_at TIMESTAMP
);

-- Create template_version table
CREATE TABLE tb_template_version (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES tb_pricelist_template(id),
  version_number TEXT NOT NULL,
  version_type TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT NOT NULL,
  release_notes TEXT,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_milestone BOOLEAN NOT NULL DEFAULT FALSE,
  milestone_label TEXT
);

-- Create indexes
CREATE INDEX idx_template_code ON tb_pricelist_template(code);
CREATE INDEX idx_template_status ON tb_pricelist_template(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_distribution_status ON tb_template_distribution(status, submission_deadline);
CREATE INDEX idx_version_template ON tb_template_version(template_id, version_number DESC);
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial technical specification |

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- UC-pricelist-templates.md - Use Cases
- FD-pricelist-templates.md - Flow Diagrams
- VAL-pricelist-templates.md - Validations
- VENDOR-MANAGEMENT-OVERVIEW.md - Module Overview

---

**End of Technical Specification Document**
