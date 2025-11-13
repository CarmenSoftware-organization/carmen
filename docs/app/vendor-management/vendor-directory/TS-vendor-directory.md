# Vendor Directory - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Vendor Directory
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

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers
- **ORM**: Prisma Client
- **Database**: PostgreSQL with JSONB support
- **Authentication**: NextAuth.js (assumed)
- **File Storage**: AWS S3 / Azure Blob Storage
- **Email**: SendGrid / AWS SES
- **Search**: PostgreSQL Full-Text Search with GIN indexes

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
        └── manage-vendors/
            ├── page.tsx                 # Server Component (list view)
            ├── [id]/
            │   ├── page.tsx            # Server Component (detail view)
            │   └── edit/
            │       └── page.tsx        # Server Component with Client form
            ├── new/
            │   └── page.tsx            # Server Component with Client form
            ├── components/
            │   ├── VendorList.tsx       # Client Component (interactive list)
            │   ├── VendorCard.tsx       # Client Component
            │   ├── VendorForm.tsx       # Client Component (form)
            │   ├── ContactList.tsx      # Client Component
            │   ├── DocumentList.tsx     # Client Component
            │   └── PerformanceCard.tsx  # Server Component
            ├── actions.ts              # Server Actions (mutations)
            └── types.ts                # TypeScript interfaces
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
PostgreSQL Database (JSONB fields)
```

**Key Principles**:
- Server Components for data fetching (default)
- Client Components only for interactivity
- Server Actions for mutations (preferred over API routes)
- React Query for client-side caching
- Optimistic updates for better UX

---

## 2. Database Implementation

### 2.1 Existing Schema Utilization

Based on `data-structure-gaps.md`, the implementation leverages existing Prisma schema:

**Primary Tables**:
- `tb_vendor` - Main vendor entity
- `tb_vendor_address` - Vendor addresses (JSON data field)
- `tb_vendor_contact` - Vendor contacts (JSON info field)
- `tb_vendor_business_type` - Business type classification

**Key Strategy**: Use existing JSON fields (`info`, `dimension`) for extended data without schema modifications.

### 2.2 JSON Structure Implementation

#### 2.2.1 tb_vendor.info JSON Structure

```typescript
// lib/types/vendor.ts

interface VendorInfo {
  // Profile Extended
  profile?: {
    vendorCode: string;          // Unique vendor reference
    legalName: string;
    dbaName?: string;            // Doing Business As
    website?: string;
    industry: string;
    yearEstablished?: number;
    certifications: string[];
    numberOfEmployees?: number;
  };

  // Status & Segmentation
  status?: {
    currentStatus: 'draft' | 'pending_approval' | 'approved' | 'preferred' |
                   'provisional' | 'blocked' | 'blacklisted' | 'inactive';
    statusChangedAt: string;     // ISO 8601 datetime
    statusChangedBy: string;     // User ID
    statusReason?: string;
    statusHistory: Array<{
      status: string;
      changedAt: string;
      changedBy: string;
      reason: string;
    }>;
  };

  // Payment Terms & Financial
  paymentTerms?: {
    termsType: 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'custom';
    daysNet: number;
    earlyPaymentDiscount?: {
      discountPercent: number;
      discountDays: number;
    };
    creditLimit: number;
    creditLimitCurrency: string;
    defaultCurrency: string;
    bankingDetails?: {
      bankName: string;
      bankBranch?: string;
      accountNumber: string;      // Encrypted
      accountName: string;
      iban?: string;
      swiftCode?: string;
      routingNumber?: string;
      paymentMethods: Array<'wire' | 'ach' | 'check' | 'card'>;
    };
  };

  // Performance & Ratings
  performance?: {
    overallRating: number;        // 0-100 or 1-5 scale
    lastCalculatedAt: string;
    metrics: {
      qualityScore: number;        // 0-100
      deliveryPerformance: number; // 0-100
      serviceLevel: number;        // 0-100
      pricingCompetitiveness: number; // 0-100
    };
    transactionCount: number;
    totalSpend: number;
    spendCurrency: string;
    lastTransactionDate?: string;
  };

  // Location Assignments
  locations?: {
    assignments: Array<{
      locationId: string;
      locationName: string;
      isPrimary: boolean;
      isActive: boolean;
      deliveryDays: number[];      // 0-6 (Sunday-Saturday)
      minimumOrderValue?: number;
      deliveryInstructions?: string;
    }>;
  };

  // Approval Workflow
  approval?: {
    submittedAt?: string;
    submittedBy?: string;
    submissionNotes?: string;
    currentStage?: string;
    approvalHistory: Array<{
      stage: string;
      approverUserId: string;
      approverName: string;
      decision: 'approved' | 'rejected' | 'info_requested';
      decidedAt: string;
      notes?: string;
    }>;
  };

  // Documents
  documents?: {
    documents: Array<{
      id: string;
      documentType: 'contract' | 'certification' | 'insurance' | 'tax_document' |
                    'bank_details' | 'quality_certificate' | 'other';
      documentNumber: string;
      documentName: string;
      fileName: string;
      fileUrl: string;            // S3/Azure path
      fileSize: number;           // bytes
      mimeType: string;
      issueDate: string;
      expiryDate?: string;
      status: 'active' | 'expired' | 'expiring_soon' | 'pending_renewal';
      version: number;
      uploadedBy: string;
      uploadedAt: string;
      approvedBy?: string;
      approvedAt?: string;
      tags?: string[];
    }>;
  };

  // Categories & Tags
  categorization?: {
    primaryType: string;          // From tb_vendor_business_type
    secondaryCategories: string[];
    industryTags: string[];
    productSpecializations: string[];
    serviceSpecializations: string[];
    isPreferred: boolean;
    isStrategicPartner: boolean;
    spendTier: 'tier_1' | 'tier_2' | 'tier_3'; // Based on annual spend
  };

  // Compliance & Certifications
  compliance?: {
    requiredCertifications: string[];
    currentCertifications: Array<{
      type: string;
      number: string;
      issuedBy: string;
      issueDate: string;
      expiryDate?: string;
      status: 'active' | 'expired' | 'pending';
    }>;
    insurancePolicies: Array<{
      type: 'liability' | 'product_liability' | 'workers_comp' | 'other';
      policyNumber: string;
      provider: string;
      coverage: number;
      coverageCurrency: string;
      effectiveDate: string;
      expiryDate: string;
    }>;
  };
}
```

#### 2.2.2 tb_vendor_contact.info JSON Structure

```typescript
// lib/types/vendor.ts

interface VendorContactInfo {
  fullName: string;
  title?: string;
  department?: string;
  role: 'primary' | 'sales' | 'accounts_payable' | 'technical_support' |
        'management' | 'other';

  // Contact Methods
  contactMethods: {
    primaryEmail: string;
    secondaryEmail?: string;
    phoneNumbers: Array<{
      type: 'office' | 'mobile' | 'home' | 'fax';
      countryCode: string;
      number: string;
      extension?: string;
      isPrimary: boolean;
    }>;
  };

  // Communication Preferences
  preferences: {
    preferredMethod: 'email' | 'phone' | 'sms' | 'portal';
    language: string;             // ISO 639-1 code
    timezone?: string;            // IANA timezone
    availability?: {
      daysAvailable: number[];    // 0-6 (Sunday-Saturday)
      hoursAvailable?: string;    // e.g., "09:00-17:00"
    };
  };

  // Status & Metadata
  status: 'active' | 'inactive' | 'left_company';
  isPreferredContact: boolean;    // For this role
  notes?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
  };
}
```

#### 2.2.3 tb_vendor_address.data JSON Structure

```typescript
// lib/types/vendor.ts

interface VendorAddressData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;                // ISO 3166-1 alpha-2
  county?: string;
  district?: string;

  // Address Metadata
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;

  // Additional Info
  deliveryInstructions?: string;
  accessCode?: string;
  contactAtLocation?: {
    name: string;
    phone: string;
  };

  // Geolocation (optional)
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}
```

### 2.3 Database Indexes

```sql
-- Full-text search index on vendor name, code, notes
CREATE INDEX idx_vendor_search ON tb_vendor
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(note, '')));

-- JSON field indexes for frequent queries
CREATE INDEX idx_vendor_info_vendor_code ON tb_vendor
USING GIN ((info->'profile'->>'vendorCode') gin_trgm_ops);

CREATE INDEX idx_vendor_info_status ON tb_vendor
USING GIN ((info->'status'->>'currentStatus'));

CREATE INDEX idx_vendor_info_rating ON tb_vendor
((CAST(info->'performance'->>'overallRating' AS numeric)));

-- Contact email search
CREATE INDEX idx_vendor_contact_email ON tb_vendor_contact
USING GIN ((info->'contactMethods'->>'primaryEmail') gin_trgm_ops);

-- Document expiry monitoring
CREATE INDEX idx_vendor_documents_expiry ON tb_vendor
USING GIN ((info->'documents'->'documents'));

-- Active vendors only (common query)
CREATE INDEX idx_vendor_active ON tb_vendor (is_active, deleted_at)
WHERE deleted_at IS NULL;
```

---

## 3. Component Architecture

### 3.1 Page Components

#### 3.1.1 Vendor List Page

**File**: `app/(main)/vendor-management/manage-vendors/page.tsx`
**Type**: Server Component

```typescript
// app/(main)/vendor-management/manage-vendors/page.tsx

import { Suspense } from 'react';
import { VendorList } from './components/VendorList';
import { VendorListSkeleton } from './components/VendorListSkeleton';
import { getVendors } from './actions';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    rating?: string;
  };
}

export default async function VendorDirectoryPage({ searchParams }: PageProps) {
  // Server-side data fetching
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const status = searchParams.status || 'all';
  const rating = searchParams.rating || '';

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Vendor Directory</h1>
        <Link href="/vendor-management/manage-vendors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <Suspense fallback={<VendorListSkeleton />}>
        <VendorList
          initialPage={page}
          initialSearch={search}
          initialStatus={status}
          initialRating={rating}
        />
      </Suspense>
    </div>
  );
}
```

#### 3.1.2 Vendor Detail Page

**File**: `app/(main)/vendor-management/manage-vendors/[id]/page.tsx`
**Type**: Server Component

```typescript
// app/(main)/vendor-management/manage-vendors/[id]/page.tsx

import { notFound } from 'next/navigation';
import { getVendorById } from '../actions';
import { VendorProfileHeader } from '../components/VendorProfileHeader';
import { VendorTabs } from '../components/VendorTabs';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function VendorDetailPage({ params }: PageProps) {
  const vendor = await getVendorById(params.id);

  if (!vendor) {
    notFound();
  }

  // Parse JSON fields
  const vendorInfo = vendor.info as VendorInfo;
  const status = vendorInfo?.status?.currentStatus || 'draft';
  const rating = vendorInfo?.performance?.overallRating || 0;

  return (
    <div className="container mx-auto py-6">
      <VendorProfileHeader
        vendor={vendor}
        status={status}
        rating={rating}
      />

      <VendorTabs vendorId={vendor.id} vendor={vendor} />
    </div>
  );
}
```

### 3.2 Client Components

#### 3.2.1 Vendor List Component

**File**: `app/(main)/vendor-management/manage-vendors/components/VendorList.tsx`
**Type**: Client Component

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendorCard } from './VendorCard';
import { VendorFilters } from './VendorFilters';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getVendors } from '../actions';
import type { Vendor, VendorInfo } from '@/lib/types';

interface VendorListProps {
  initialPage: number;
  initialSearch: string;
  initialStatus: string;
  initialRating: string;
}

export function VendorList({
  initialPage,
  initialSearch,
  initialStatus,
  initialRating,
}: VendorListProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    status: initialStatus,
    rating: initialRating,
  });

  // React Query for client-side caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendors', page, search, filters],
    queryFn: () => getVendors({ page, search, ...filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Client-side filtering and sorting
  const filteredVendors = useMemo(() => {
    if (!data?.vendors) return [];

    let filtered = data.vendors;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(vendor => {
        const vendorInfo = vendor.info as VendorInfo;
        const vendorCode = vendorInfo?.profile?.vendorCode || '';
        return (
          vendor.name.toLowerCase().includes(search.toLowerCase()) ||
          vendorCode.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(vendor => {
        const vendorInfo = vendor.info as VendorInfo;
        return vendorInfo?.status?.currentStatus === filters.status;
      });
    }

    // Apply rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(vendor => {
        const vendorInfo = vendor.info as VendorInfo;
        const rating = vendorInfo?.performance?.overallRating || 0;
        return rating >= minRating;
      });
    }

    return filtered;
  }, [data?.vendors, search, filters]);

  if (error) {
    return <div>Error loading vendors: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <VendorFilters filters={filters} onFiltersChange={setFilters} />

      {/* Vendor Cards Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

#### 3.2.2 Vendor Form Component

**File**: `app/(main)/vendor-management/manage-vendors/components/VendorForm.tsx`
**Type**: Client Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, type VendorFormData } from '../schemas';
import { createVendor, updateVendor } from '../actions';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactList } from './ContactList';
import { DocumentList } from './DocumentList';
import { AddressList } from './AddressList';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VendorFormProps {
  mode: 'create' | 'edit';
  initialData?: VendorFormData;
  vendorId?: string;
}

export function VendorForm({ mode, initialData, vendorId }: VendorFormProps) {
  const router = useRouter();

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      business_type_id: '',
      tax_profile_id: '',
      vendorCode: '',
      legalName: '',
      website: '',
      industry: '',
      status: 'draft',
      paymentTermsType: 'net_30',
      daysNet: 30,
      creditLimit: 0,
      defaultCurrency: 'USD',
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (mode === 'create') {
        const result = await createVendor(data);
        if (result.success) {
          toast.success('Vendor created successfully');
          router.push(`/vendor-management/manage-vendors/${result.vendorId}`);
        } else {
          toast.error(result.error || 'Failed to create vendor');
        }
      } else if (vendorId) {
        const result = await updateVendor(vendorId, data);
        if (result.success) {
          toast.success('Vendor updated successfully');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update vendor');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <FormField
              control={form.control}
              name="vendorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="VEN-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation Ltd." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the vendor..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressList vendorId={vendorId} />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactList vendorId={vendorId} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentList vendorId={vendorId} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FormField
              control={form.control}
              name="paymentTermsType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="net_7">Net 7</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_45">Net 45</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                      <SelectItem value="net_90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creditLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Saving...'
              : mode === 'create'
              ? 'Create Vendor'
              : 'Update Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 4. Server Actions

### 4.1 Vendor CRUD Actions

**File**: `app/(main)/vendor-management/manage-vendors/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { VendorFormData } from './schemas';
import type { VendorInfo } from '@/lib/types';

// Get vendors with filters
export async function getVendors({
  page = 1,
  limit = 50,
  search = '',
  status = 'all',
  rating = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  rating?: string;
}) {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null, // Exclude soft-deleted
    };

    // Search filter (PostgreSQL full-text search)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          info: {
            path: ['profile', 'vendorCode'],
            string_contains: search,
          },
        },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.info = {
        ...where.info,
        path: ['status', 'currentStatus'],
        equals: status,
      };
    }

    // Fetch vendors
    const [vendors, totalCount] = await Promise.all([
      prisma.tb_vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          tb_vendor_contact: {
            where: { is_active: true },
            take: 1,
          },
        },
      }),
      prisma.tb_vendor.count({ where }),
    ]);

    return {
      vendors,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Failed to fetch vendors');
  }
}

// Get vendor by ID
export async function getVendorById(id: string) {
  try {
    const vendor = await prisma.tb_vendor.findUnique({
      where: { id },
      include: {
        tb_vendor_contact: {
          where: { is_active: true },
          orderBy: { created_at: 'desc' },
        },
        tb_vendor_address: {
          where: { is_active: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    return vendor;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

// Create vendor
export async function createVendor(data: VendorFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check for duplicate vendor code
    const existingVendor = await prisma.tb_vendor.findFirst({
      where: {
        info: {
          path: ['profile', 'vendorCode'],
          equals: data.vendorCode,
        },
        deleted_at: null,
      },
    });

    if (existingVendor) {
      return { success: false, error: 'Vendor code already exists' };
    }

    // Construct JSON info field
    const vendorInfo: VendorInfo = {
      profile: {
        vendorCode: data.vendorCode,
        legalName: data.legalName || data.name,
        website: data.website,
        industry: data.industry || '',
        certifications: [],
      },
      status: {
        currentStatus: data.status || 'draft',
        statusChangedAt: new Date().toISOString(),
        statusChangedBy: user.id,
        statusHistory: [
          {
            status: data.status || 'draft',
            changedAt: new Date().toISOString(),
            changedBy: user.id,
            reason: 'Initial creation',
          },
        ],
      },
      paymentTerms: {
        termsType: data.paymentTermsType,
        daysNet: data.daysNet,
        creditLimit: data.creditLimit || 0,
        creditLimitCurrency: data.defaultCurrency,
        defaultCurrency: data.defaultCurrency,
      },
      categorization: {
        primaryType: data.business_type_id,
        secondaryCategories: [],
        industryTags: [],
        productSpecializations: [],
        serviceSpecializations: [],
        isPreferred: false,
        isStrategicPartner: false,
        spendTier: 'tier_3',
      },
    };

    // Create vendor
    const vendor = await prisma.tb_vendor.create({
      data: {
        name: data.name,
        description: data.description,
        business_type_id: data.business_type_id,
        tax_profile_id: data.tax_profile_id,
        is_active: true,
        info: vendorInfo as any,
        created_by_id: user.id,
        updated_by_id: user.id,
      },
    });

    revalidatePath('/vendor-management/manage-vendors');

    return { success: true, vendorId: vendor.id };
  } catch (error) {
    console.error('Error creating vendor:', error);
    return { success: false, error: 'Failed to create vendor' };
  }
}

// Update vendor
export async function updateVendor(id: string, data: VendorFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch existing vendor
    const existingVendor = await prisma.tb_vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return { success: false, error: 'Vendor not found' };
    }

    // Merge existing info with updates
    const existingInfo = (existingVendor.info as VendorInfo) || {};
    const updatedInfo: VendorInfo = {
      ...existingInfo,
      profile: {
        ...existingInfo.profile,
        vendorCode: data.vendorCode,
        legalName: data.legalName || data.name,
        website: data.website,
        industry: data.industry,
        certifications: existingInfo.profile?.certifications || [],
      },
      paymentTerms: {
        ...existingInfo.paymentTerms,
        termsType: data.paymentTermsType,
        daysNet: data.daysNet,
        creditLimit: data.creditLimit,
        creditLimitCurrency: data.defaultCurrency,
        defaultCurrency: data.defaultCurrency,
      },
    };

    // Update vendor
    await prisma.tb_vendor.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        business_type_id: data.business_type_id,
        tax_profile_id: data.tax_profile_id,
        info: updatedInfo as any,
        updated_by_id: user.id,
        updated_at: new Date(),
      },
    });

    revalidatePath(`/vendor-management/manage-vendors/${id}`);
    revalidatePath('/vendor-management/manage-vendors');

    return { success: true };
  } catch (error) {
    console.error('Error updating vendor:', error);
    return { success: false, error: 'Failed to update vendor' };
  }
}

// Archive vendor (soft delete)
export async function archiveVendor(id: string, reason: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check for active POs
    const activePOs = await prisma.tb_purchase_order.count({
      where: {
        vendor_id: id,
        deleted_at: null,
        // Add status check for active POs
      },
    });

    if (activePOs > 0) {
      return {
        success: false,
        error: `Cannot archive vendor with ${activePOs} active purchase orders`,
      };
    }

    // Fetch existing vendor
    const existingVendor = await prisma.tb_vendor.findUnique({
      where: { id },
    });

    if (!existingVendor) {
      return { success: false, error: 'Vendor not found' };
    }

    // Update status in info
    const existingInfo = (existingVendor.info as VendorInfo) || {};
    const updatedInfo: VendorInfo = {
      ...existingInfo,
      status: {
        ...existingInfo.status,
        currentStatus: 'inactive',
        statusChangedAt: new Date().toISOString(),
        statusChangedBy: user.id,
        statusReason: reason,
        statusHistory: [
          ...(existingInfo.status?.statusHistory || []),
          {
            status: 'inactive',
            changedAt: new Date().toISOString(),
            changedBy: user.id,
            reason,
          },
        ],
      },
    };

    // Soft delete
    await prisma.tb_vendor.update({
      where: { id },
      data: {
        is_active: false,
        deleted_at: new Date(),
        deleted_by_id: user.id,
        info: updatedInfo as any,
      },
    });

    revalidatePath('/vendor-management/manage-vendors');

    return { success: true };
  } catch (error) {
    console.error('Error archiving vendor:', error);
    return { success: false, error: 'Failed to archive vendor' };
  }
}

// Change vendor status (Approve, Block, etc.)
export async function changeVendorStatus(
  id: string,
  newStatus: string,
  reason: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const vendor = await prisma.tb_vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    const existingInfo = (vendor.info as VendorInfo) || {};
    const updatedInfo: VendorInfo = {
      ...existingInfo,
      status: {
        ...existingInfo.status,
        currentStatus: newStatus as any,
        statusChangedAt: new Date().toISOString(),
        statusChangedBy: user.id,
        statusReason: reason,
        statusHistory: [
          ...(existingInfo.status?.statusHistory || []),
          {
            status: newStatus,
            changedAt: new Date().toISOString(),
            changedBy: user.id,
            reason,
          },
        ],
      },
    };

    await prisma.tb_vendor.update({
      where: { id },
      data: {
        info: updatedInfo as any,
        updated_by_id: user.id,
        updated_at: new Date(),
      },
    });

    // Send notifications based on status change
    // TODO: Implement notification logic

    revalidatePath(`/vendor-management/manage-vendors/${id}`);
    revalidatePath('/vendor-management/manage-vendors');

    return { success: true };
  } catch (error) {
    console.error('Error changing vendor status:', error);
    return { success: false, error: 'Failed to change status' };
  }
}
```

---

## 5. Validation Schemas

### 5.1 Zod Schema Definition

**File**: `app/(main)/vendor-management/manage-vendors/schemas.ts`

```typescript
import { z } from 'zod';

export const vendorSchema = z.object({
  // Basic Information
  vendorCode: z.string().min(1, 'Vendor code is required'),
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),

  // Classification
  business_type_id: z.string().min(1, 'Business type is required'),
  tax_profile_id: z.string().optional(),

  // Status
  status: z.enum([
    'draft',
    'pending_approval',
    'approved',
    'preferred',
    'provisional',
    'blocked',
    'blacklisted',
    'inactive',
  ]).default('draft'),

  // Financial
  paymentTermsType: z.enum([
    'net_7',
    'net_15',
    'net_30',
    'net_45',
    'net_60',
    'net_90',
    'custom',
  ]).default('net_30'),
  daysNet: z.number().int().min(0).max(365).default(30),
  creditLimit: z.number().min(0).default(0),
  defaultCurrency: z.string().min(3).max(3).default('USD'),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Contact Schema
export const vendorContactSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  title: z.string().optional(),
  role: z.enum([
    'primary',
    'sales',
    'accounts_payable',
    'technical_support',
    'management',
    'other',
  ]).default('primary'),

  primaryEmail: z.string().email('Invalid email format'),
  secondaryEmail: z.string().email('Invalid email format').optional().or(z.literal('')),

  phoneNumbers: z.array(z.object({
    type: z.enum(['office', 'mobile', 'home', 'fax']),
    countryCode: z.string(),
    number: z.string(),
    extension: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),

  preferredMethod: z.enum(['email', 'phone', 'sms', 'portal']).default('email'),
  language: z.string().min(2).max(2).default('en'),

  isActive: z.boolean().default(true),
  isPreferredContact: z.boolean().default(false),
  notes: z.string().optional(),
});

export type VendorContactFormData = z.infer<typeof vendorContactSchema>;

// Document Schema
export const vendorDocumentSchema = z.object({
  documentType: z.enum([
    'contract',
    'certification',
    'insurance',
    'tax_document',
    'bank_details',
    'quality_certificate',
    'other',
  ]),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentName: z.string().min(1, 'Document name is required'),
  issueDate: z.date(),
  expiryDate: z.date().optional(),
  issuingAuthority: z.string().optional(),
  notes: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
  autoNotifyBeforeExpiry: z.boolean().default(true),
});

export type VendorDocumentFormData = z.infer<typeof vendorDocumentSchema>;

// Address Schema
export const vendorAddressSchema = z.object({
  addressType: z.enum(['contact_address', 'mailing_address', 'register_address']),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Country code must be 2 characters'),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  deliveryInstructions: z.string().optional(),
});

export type VendorAddressFormData = z.infer<typeof vendorAddressSchema>;
```

---

## 6. API Integration

### 6.1 Route Handlers (Alternative to Server Actions)

**File**: `app/api/vendors/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/vendors
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, totalCount] = await Promise.all([
      prisma.tb_vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.tb_vendor.count({ where }),
    ]);

    return NextResponse.json({
      vendors,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vendors
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod schema
    // ... validation logic

    const vendor = await prisma.tb_vendor.create({
      data: {
        // ... vendor data
      },
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 7. Performance Optimization

### 7.1 Caching Strategy

```typescript
// React Query configuration
// lib/query-client.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

// Query keys factory
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  contacts: (id: string) => [...vendorKeys.detail(id), 'contacts'] as const,
  documents: (id: string) => [...vendorKeys.detail(id), 'documents'] as const,
};
```

### 7.2 Database Query Optimization

```typescript
// Optimized query with selective fields
export async function getVendorsOptimized() {
  return prisma.tb_vendor.findMany({
    select: {
      id: true,
      name: true,
      is_active: true,
      info: true, // JSON field
      // Omit large text fields
      // description: false,
      // note: false,
    },
    where: {
      deleted_at: null,
      is_active: true,
    },
    orderBy: { name: 'asc' },
    take: 100,
  });
}

// Pagination with cursor-based approach (more efficient)
export async function getVendorsPaginated(cursor?: string, limit = 50) {
  return prisma.tb_vendor.findMany({
    take: limit + 1, // Fetch one extra to check if there's a next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor
    }),
    where: {
      deleted_at: null,
    },
    orderBy: { created_at: 'desc' },
  });
}
```

### 7.3 Optimistic Updates

```typescript
// Optimistic update example
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVendor } from './actions';

export function useUpdateVendor(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorFormData) => updateVendor(vendorId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: vendorKeys.detail(vendorId) });

      // Snapshot previous value
      const previousVendor = queryClient.getQueryData(vendorKeys.detail(vendorId));

      // Optimistically update
      queryClient.setQueryData(vendorKeys.detail(vendorId), (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previousVendor };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(
        vendorKeys.detail(vendorId),
        context?.previousVendor
      );
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
    },
  });
}
```

---

## 8. Security Implementation

### 8.1 Authentication & Authorization

```typescript
// lib/auth.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // Fetch user permissions from database
  const userPermissions = await prisma.tb_user_permission.findMany({
    where: { user_id: userId },
  });

  return userPermissions.some((p) => p.permission === permission);
}

// Middleware for protected actions
export async function withAuth<T extends (...args: any[]) => any>(
  handler: T,
  requiredPermission?: string
): Promise<ReturnType<T>> {
  const user = await requireAuth();

  if (requiredPermission) {
    const hasPermission = await checkPermission(user.id, requiredPermission);
    if (!hasPermission) {
      throw new Error('Forbidden: Insufficient permissions');
    }
  }

  return handler();
}
```

### 8.2 Data Encryption

```typescript
// lib/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage in vendor actions
export async function saveBankingDetails(vendorId: string, bankDetails: any) {
  const encryptedAccountNumber = encrypt(bankDetails.accountNumber);

  const updatedInfo = {
    // ... other info
    paymentTerms: {
      bankingDetails: {
        ...bankDetails,
        accountNumber: encryptedAccountNumber,
      },
    },
  };

  await prisma.tb_vendor.update({
    where: { id: vendorId },
    data: { info: updatedInfo as any },
  });
}
```

### 8.3 Input Sanitization

```typescript
// lib/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

// SQL Injection Prevention (Prisma handles this automatically)
// But for raw queries:
export async function executeRawQuery(vendorCode: string) {
  // NEVER do this:
  // await prisma.$queryRaw`SELECT * FROM tb_vendor WHERE vendor_code = '${vendorCode}'`;

  // ALWAYS use parameterized queries:
  await prisma.$queryRaw`SELECT * FROM tb_vendor WHERE vendor_code = ${vendorCode}`;
}
```

---

## 9. File Upload Implementation

### 9.1 Document Upload to AWS S3

```typescript
// lib/upload.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadDocument(
  file: File,
  vendorId: string,
  documentType: string
): Promise<{ fileUrl: string; fileKey: string }> {
  const fileKey = `vendors/${vendorId}/${documentType}/${uuidv4()}-${file.name}`;
  const buffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    Metadata: {
      vendorId,
      documentType,
      originalName: file.name,
    },
  });

  await s3Client.send(command);

  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return { fileUrl, fileKey };
}

// Server action for document upload
export async function uploadVendorDocument(
  vendorId: string,
  formData: FormData
) {
  try {
    const user = await requireAuth();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const documentNumber = formData.get('documentNumber') as string;
    const issueDate = formData.get('issueDate') as string;
    const expiryDate = formData.get('expiryDate') as string;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 50MB limit' };
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File type not allowed' };
    }

    // Upload to S3
    const { fileUrl, fileKey } = await uploadDocument(file, vendorId, documentType);

    // Get existing vendor
    const vendor = await prisma.tb_vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    // Update vendor info with document
    const existingInfo = (vendor.info as VendorInfo) || {};
    const documents = existingInfo.documents?.documents || [];

    const newDocument = {
      id: uuidv4(),
      documentType,
      documentNumber,
      documentName: file.name,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
      issueDate,
      expiryDate: expiryDate || undefined,
      status: 'active' as const,
      version: 1,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
    };

    const updatedInfo: VendorInfo = {
      ...existingInfo,
      documents: {
        documents: [...documents, newDocument],
      },
    };

    await prisma.tb_vendor.update({
      where: { id: vendorId },
      data: {
        info: updatedInfo as any,
        updated_by_id: user.id,
        updated_at: new Date(),
      },
    });

    return { success: true, document: newDocument };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: 'Failed to upload document' };
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

```typescript
// __tests__/vendor.test.ts

import { describe, it, expect, vi } from 'vitest';
import { createVendor, getVendorById } from '../actions';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db');
vi.mock('@/lib/auth');

describe('Vendor Actions', () => {
  describe('createVendor', () => {
    it('should create a vendor successfully', async () => {
      const mockVendorData = {
        vendorCode: 'VEN-001',
        name: 'Test Vendor',
        business_type_id: '123',
        paymentTermsType: 'net_30' as const,
        daysNet: 30,
        creditLimit: 10000,
        defaultCurrency: 'USD',
      };

      const mockCreatedVendor = {
        id: 'vendor-123',
        ...mockVendorData,
        created_at: new Date(),
      };

      vi.mocked(prisma.tb_vendor.create).mockResolvedValue(mockCreatedVendor as any);

      const result = await createVendor(mockVendorData);

      expect(result.success).toBe(true);
      expect(result.vendorId).toBe('vendor-123');
    });

    it('should reject duplicate vendor code', async () => {
      const mockVendorData = {
        vendorCode: 'VEN-001',
        name: 'Test Vendor',
        // ... other fields
      };

      vi.mocked(prisma.tb_vendor.findFirst).mockResolvedValue({} as any);

      const result = await createVendor(mockVendorData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vendor code already exists');
    });
  });

  describe('getVendorById', () => {
    it('should return vendor by ID', async () => {
      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        // ... other fields
      };

      vi.mocked(prisma.tb_vendor.findUnique).mockResolvedValue(mockVendor as any);

      const result = await getVendorById('vendor-123');

      expect(result).toEqual(mockVendor);
    });

    it('should return null for non-existent vendor', async () => {
      vi.mocked(prisma.tb_vendor.findUnique).mockResolvedValue(null);

      const result = await getVendorById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/vendor-integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { createVendor, getVendors } from '../actions';

describe('Vendor Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test database
    await prisma.$disconnect();
  });

  it('should create and retrieve vendor', async () => {
    const vendorData = {
      vendorCode: 'TEST-001',
      name: 'Integration Test Vendor',
      business_type_id: 'supplier',
      paymentTermsType: 'net_30' as const,
      daysNet: 30,
      creditLimit: 5000,
      defaultCurrency: 'USD',
    };

    // Create vendor
    const createResult = await createVendor(vendorData);
    expect(createResult.success).toBe(true);

    // Retrieve vendor
    const vendors = await getVendors({ search: 'Integration Test' });
    expect(vendors.vendors).toHaveLength(1);
    expect(vendors.vendors[0].name).toBe('Integration Test Vendor');
  });
});
```

---

## 11. Deployment Considerations

### 11.1 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/carmen"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="carmen-documents"

# Encryption
ENCRYPTION_KEY="32-byte-hex-key"

# Email
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@example.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### 11.2 Build Configuration

```json
// package.json scripts

{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "checktypes": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "analyze": "ANALYZE=true next build"
  }
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial creation |

---

## Related Documents
- BR-vendor-directory.md - Business Requirements
- UC-vendor-directory.md - Use Cases
- data-structure-gaps.md - Data Structure Analysis
- FD-vendor-directory.md - Flow Diagrams
- VAL-vendor-directory.md - Validations

---

**End of Technical Specification Document**
