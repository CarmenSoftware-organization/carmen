# Requests for Pricing (RFQ) - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Requests for Pricing (RFQ)
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Requests for Pricing (RFQ) module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and API validation specifications.

The RFQ module enables organizations to conduct competitive pricing processes with comprehensive validation to ensure data integrity, regulatory compliance, and business rule enforcement throughout the entire RFQ lifecycle from creation through contract generation.

---

## 2. Field-Level Validations

### 2.1 RFQ Basic Information

#### RFQ Number
**Field**: `rfqNumber` (stored in `tb_rfq_campaign.rfqNumber`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "RFQ number is required" |
| Unique | Must be unique across all RFQs | "RFQ number already exists" |
| Format | Alphanumeric with hyphens, 8-50 characters | "RFQ number must be 8-50 characters (letters, numbers, hyphens only)" |
| Pattern | Matches: `^RFQ-[0-9]{4}-[A-Z0-9-]+$` | "RFQ number must follow format: RFQ-YYYY-XXXX" |
| Auto-generation | Auto-generated if not provided | N/A |

**Zod Schema**:
```typescript
rfqNumber: z.string()
  .min(8, 'RFQ number must be at least 8 characters')
  .max(50, 'RFQ number must not exceed 50 characters')
  .regex(/^RFQ-[0-9]{4}-[A-Z0-9-]+$/, 'RFQ number must follow format: RFQ-YYYY-XXXX')
  .refine(async (number) => {
    const existing = await prisma.rFQCampaign.findFirst({
      where: { rfqNumber: number, deletedAt: null },
    });
    return !existing;
  }, 'RFQ number already exists')
```

#### Title
**Field**: `title` (stored in `tb_rfq_campaign.title`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "RFQ title is required" |
| Length | 5-200 characters | "RFQ title must be 5-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "RFQ title contains invalid characters" |

**Zod Schema**:
```typescript
title: z.string()
  .min(5, 'RFQ title must be at least 5 characters')
  .max(200, 'RFQ title must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'RFQ title contains invalid characters')
```

#### Description
**Field**: `description` (stored in `tb_rfq_campaign.description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Min 20 characters if provided, max 5000 characters | "Description must be 20-5000 characters" |
| Format | Plain text with basic formatting | "Description cannot contain script tags or malicious code" |

**Zod Schema**:
```typescript
description: z.string()
  .min(20, 'Description must be at least 20 characters')
  .max(5000, 'Description must not exceed 5000 characters')
  .refine((text) => !/<script[^>]*>.*?<\/script>/i.test(text), 'Description cannot contain script tags')
  .optional()
```

#### Category
**Field**: `category` (stored in `tb_rfq_campaign.category`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a category | "RFQ category is required" |
| Valid | Must be one of predefined categories | "Invalid category selected" |
| Length | Max 100 characters | "Category must not exceed 100 characters" |

**Zod Schema**:
```typescript
category: z.string()
  .min(1, 'RFQ category is required')
  .max(100, 'Category must not exceed 100 characters')
```

#### RFQ Type
**Field**: `type` (stored in `tb_rfq_campaign.type`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select RFQ type | "RFQ type is required" |
| Valid | Must be one of: GOODS, SERVICES, WORKS, MIXED | "Invalid RFQ type selected" |

**Zod Schema**:
```typescript
type: z.enum(['GOODS', 'SERVICES', 'WORKS', 'MIXED'], {
  errorMap: () => ({ message: 'Invalid RFQ type selected' }),
})
```

#### Budget Range
**Field**: `budgetRange` (stored in `tb_rfq_campaign.budgetRange`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive number | "Budget must be a positive number" |
| Range | 0.01 to 999,999,999 | "Budget must be between 0.01 and 999,999,999" |
| Precision | Max 2 decimal places | "Budget must have at most 2 decimal places" |

**Zod Schema**:
```typescript
budgetRange: z.number()
  .positive('Budget must be a positive number')
  .min(0.01, 'Budget must be at least 0.01')
  .max(999999999, 'Budget must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Budget must have at most 2 decimal places')
  .optional()
```

#### Currency
**Field**: `currency` (stored in `tb_rfq_campaign.currency`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Valid | Must exist in supported currencies | "Currency not supported" |

**Zod Schema**:
```typescript
currency: z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
  .refine((code) => {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'MYR', 'THB', 'IDR', 'PHP'];
    return supportedCurrencies.includes(code);
  }, 'Currency not supported')
  .default('USD')
```

#### Priority
**Field**: `priority` (stored in `tb_rfq_campaign.priority`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select priority | "Priority is required" |
| Valid | Must be one of: LOW, MEDIUM, HIGH, CRITICAL | "Invalid priority level" |

**Zod Schema**:
```typescript
priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
  errorMap: () => ({ message: 'Invalid priority level' }),
}).default('MEDIUM')
```

### 2.2 Timeline Validations

#### Bid Open Date
**Field**: `bidOpenDate` (stored in `tb_rfq_campaign.timeline.bidOpenDate`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide bid open date | "Bid open date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Cannot be in the past (if creating new RFQ) | "Bid open date cannot be in the past" |
| Range | Cannot be more than 1 year in future | "Bid open date cannot be more than 1 year in the future" |

**Zod Schema**:
```typescript
bidOpenDate: z.coerce.date()
  .refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Bid open date cannot be in the past')
  .refine((date) => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return date <= oneYearFromNow;
  }, 'Bid open date cannot be more than 1 year in the future')
```

#### Bid Close Date
**Field**: `bidCloseDate` (stored in `tb_rfq_campaign.timeline.bidCloseDate`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide bid close date | "Bid close date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after bid open date | "Bid close date must be after bid open date" |
| Range | Minimum 7 business days after open date | "Bid period must be at least 7 business days" |
| Range | Cannot be more than 1 year after open date | "Bid period cannot exceed 1 year" |

**Zod Schema**:
```typescript
bidCloseDate: z.coerce.date()
  .refine((closeDate, ctx) => {
    const openDate = ctx.parent.bidOpenDate;
    return closeDate > openDate;
  }, 'Bid close date must be after bid open date')
  .refine((closeDate, ctx) => {
    const openDate = ctx.parent.bidOpenDate;
    const diffDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
    // Simplified: count all days, minimum 7
    return diffDays >= 7;
  }, 'Bid period must be at least 7 business days')
  .refine((closeDate, ctx) => {
    const openDate = ctx.parent.bidOpenDate;
    const oneYearLater = new Date(openDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return closeDate <= oneYearLater;
  }, 'Bid period cannot exceed 1 year')
```

#### Clarification Deadline
**Field**: `clarificationDeadline` (stored in `tb_rfq_campaign.timeline.clarificationDeadline`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be before bid close date if provided | "Clarification deadline must be before bid close date" |
| Range | Must be at least 2 business days before close | "Clarification deadline must be at least 2 business days before bid close date" |

**Zod Schema**:
```typescript
clarificationDeadline: z.coerce.date()
  .refine((clarDate, ctx) => {
    if (!clarDate) return true;
    const closeDate = ctx.parent.bidCloseDate;
    return clarDate < closeDate;
  }, 'Clarification deadline must be before bid close date')
  .refine((clarDate, ctx) => {
    if (!clarDate) return true;
    const closeDate = ctx.parent.bidCloseDate;
    const diffDays = Math.ceil((closeDate.getTime() - clarDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 2;
  }, 'Clarification deadline must be at least 2 business days before bid close date')
  .optional()
```

#### Evaluation Deadline
**Field**: `evaluationDeadline` (stored in `tb_rfq_campaign.timeline.evaluationDeadline`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after bid close date if provided | "Evaluation deadline must be after bid close date" |
| Range | Should be within 30 days of bid close (warning) | "Evaluation deadline is more than 30 days after bid close" |

**Zod Schema**:
```typescript
evaluationDeadline: z.coerce.date()
  .refine((evalDate, ctx) => {
    if (!evalDate) return true;
    const closeDate = ctx.parent.bidCloseDate;
    return evalDate > closeDate;
  }, 'Evaluation deadline must be after bid close date')
  .optional()
```

#### Award Date
**Field**: `awardDate` (stored in `tb_rfq_campaign.timeline.awardDate`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after evaluation deadline if provided | "Award date must be after evaluation deadline" |

**Zod Schema**:
```typescript
awardDate: z.coerce.date()
  .refine((awardDate, ctx) => {
    if (!awardDate) return true;
    const evalDate = ctx.parent.evaluationDeadline;
    if (!evalDate) return true;
    return awardDate > evalDate;
  }, 'Award date must be after evaluation deadline')
  .optional()
```

### 2.3 Requirements & Line Items Validations

#### Line Item Description
**Field**: `description` (stored in `tb_rfq_campaign.requirements.items[].description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Item description is required" |
| Length | 5-500 characters | "Item description must be 5-500 characters" |
| Format | Plain text with basic formatting | "Description contains invalid characters" |

**Zod Schema**:
```typescript
description: z.string()
  .min(5, 'Item description must be at least 5 characters')
  .max(500, 'Item description must not exceed 500 characters')
```

#### Line Item Quantity
**Field**: `quantity` (stored in `tb_rfq_campaign.requirements.items[].quantity`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide quantity | "Quantity is required" |
| Type | Must be positive number | "Quantity must be a positive number" |
| Range | 0.001 to 999,999,999 | "Quantity must be between 0.001 and 999,999,999" |
| Precision | Max 3 decimal places | "Quantity must have at most 3 decimal places" |

**Zod Schema**:
```typescript
quantity: z.number()
  .positive('Quantity must be a positive number')
  .min(0.001, 'Quantity must be at least 0.001')
  .max(999999999, 'Quantity must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 3;
  }, 'Quantity must have at most 3 decimal places')
```

#### Unit of Measure (UOM)
**Field**: `uom` (stored in `tb_rfq_campaign.requirements.items[].uom`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select UOM | "Unit of measure is required" |
| Valid | Must be one of standard UOMs | "Invalid unit of measure" |
| Length | Max 20 characters | "UOM must not exceed 20 characters" |

**Zod Schema**:
```typescript
uom: z.string()
  .min(1, 'Unit of measure is required')
  .max(20, 'UOM must not exceed 20 characters')
```

#### Delivery Location
**Field**: `location` (stored in `tb_rfq_campaign.requirements.items[].delivery.location`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide delivery location | "Delivery location is required" |
| Length | 3-200 characters | "Delivery location must be 3-200 characters" |

**Zod Schema**:
```typescript
location: z.string()
  .min(3, 'Delivery location must be at least 3 characters')
  .max(200, 'Delivery location must not exceed 200 characters')
```

#### Required Delivery Date
**Field**: `requiredDate` (stored in `tb_rfq_campaign.requirements.items[].delivery.requiredDate`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide required date | "Required delivery date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after bid close date | "Required delivery date must be after bid close date" |
| Range | Cannot be more than 2 years in future | "Delivery date cannot be more than 2 years in the future" |

**Zod Schema**:
```typescript
requiredDate: z.coerce.date()
  .refine((deliveryDate, ctx) => {
    const closeDate = ctx.parent.parent.parent.timeline.bidCloseDate;
    return deliveryDate > closeDate;
  }, 'Required delivery date must be after bid close date')
  .refine((date) => {
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    return date <= twoYearsFromNow;
  }, 'Delivery date cannot be more than 2 years in the future')
```

#### Estimated Budget (Line Item)
**Field**: `estimatedBudget` (stored in `tb_rfq_campaign.requirements.items[].estimatedBudget`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive number | "Estimated budget must be a positive number" |
| Range | 0.01 to 999,999,999 | "Estimated budget must be between 0.01 and 999,999,999" |
| Precision | Max 2 decimal places | "Estimated budget must have at most 2 decimal places" |

**Zod Schema**:
```typescript
estimatedBudget: z.number()
  .positive('Estimated budget must be a positive number')
  .min(0.01, 'Estimated budget must be at least 0.01')
  .max(999999999, 'Estimated budget must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Estimated budget must have at most 2 decimal places')
  .optional()
```

### 2.4 Evaluation Criteria Validations

#### Criterion Name
**Field**: `name` (stored in `tb_rfq_campaign.evaluation.criteria[].name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Criterion name is required" |
| Length | 3-100 characters | "Criterion name must be 3-100 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Criterion name contains invalid characters" |
| Unique | No duplicate criterion names | "Criterion name already exists in this RFQ" |

**Zod Schema**:
```typescript
name: z.string()
  .min(3, 'Criterion name must be at least 3 characters')
  .max(100, 'Criterion name must not exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\/]+$/, 'Criterion name contains invalid characters')
```

#### Criterion Weight
**Field**: `weight` (stored in `tb_rfq_campaign.evaluation.criteria[].weight`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide weight | "Criterion weight is required" |
| Type | Must be positive number | "Weight must be a positive number" |
| Range | 0.01 to 100 | "Weight must be between 0.01 and 100" |
| Precision | Max 2 decimal places | "Weight must have at most 2 decimal places" |
| Total | Sum of all weights must equal 100 | "Total evaluation criteria weights must equal 100%" |

**Zod Schema**:
```typescript
weight: z.number()
  .positive('Weight must be a positive number')
  .min(0.01, 'Weight must be at least 0.01')
  .max(100, 'Weight must not exceed 100')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Weight must have at most 2 decimal places')
```

#### Scoring Scale Minimum
**Field**: `minScore` (stored in `tb_rfq_campaign.evaluation.criteria[].scoringScale.min`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide minimum score | "Minimum score is required" |
| Type | Must be number | "Minimum score must be a number" |
| Range | 0 to 100 | "Minimum score must be between 0 and 100" |
| Consistency | Must be less than maximum score | "Minimum score must be less than maximum score" |

**Zod Schema**:
```typescript
minScore: z.number()
  .min(0, 'Minimum score must be at least 0')
  .max(100, 'Minimum score must not exceed 100')
```

#### Scoring Scale Maximum
**Field**: `maxScore` (stored in `tb_rfq_campaign.evaluation.criteria[].scoringScale.max`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide maximum score | "Maximum score is required" |
| Type | Must be number | "Maximum score must be a number" |
| Range | 1 to 100 | "Maximum score must be between 1 and 100" |
| Consistency | Must be greater than minimum score | "Maximum score must be greater than minimum score" |

**Zod Schema**:
```typescript
maxScore: z.number()
  .min(1, 'Maximum score must be at least 1')
  .max(100, 'Maximum score must not exceed 100')
  .refine((maxScore, ctx) => {
    const minScore = ctx.parent.minScore;
    return maxScore > minScore;
  }, 'Maximum score must be greater than minimum score')
```

### 2.5 Vendor Selection Validations

#### Vendor ID
**Field**: `vendorId` (stored in `tb_vendor_invitation.vendorId`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select at least one vendor | "At least one vendor is required" |
| Format | Valid UUID | "Invalid vendor ID format" |
| Exists | Must exist in vendor directory | "Vendor does not exist" |
| Status | Vendor must be approved or preferred | "Only approved or preferred vendors can receive RFQs" |
| Duplicate | Cannot invite same vendor twice | "Vendor already invited to this RFQ" |
| Minimum | Minimum 3 vendors for competitive RFQ | "Competitive RFQ requires at least 3 vendors" |

**Zod Schema**:
```typescript
vendorId: z.string()
  .uuid('Invalid vendor ID format')
  .refine(async (id) => {
    const vendor = await prisma.tb_vendor.findUnique({
      where: { id, deleted_at: null },
    });
    return !!vendor;
  }, 'Vendor does not exist')
  .refine(async (id) => {
    const vendor = await prisma.tb_vendor.findUnique({
      where: { id },
    });
    return vendor?.status === 'approved' || vendor?.status === 'preferred';
  }, 'Only approved or preferred vendors can receive RFQs')
```

**Array Level Validation**:
```typescript
selectedVendors: z.array(z.string().uuid())
  .min(3, 'Competitive RFQ requires at least 3 vendors')
  .max(100, 'Maximum 100 vendors can be invited per RFQ')
  .refine((vendors) => {
    const uniqueVendors = new Set(vendors);
    return uniqueVendors.size === vendors.length;
  }, 'Duplicate vendors detected. Each vendor can only be invited once.')
```

### 2.6 Terms & Conditions Validations

#### Payment Terms
**Field**: `paymentTerms` (stored in `tb_rfq_campaign.terms.paymentTerms`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide payment terms | "Payment terms are required" |
| Length | 10-500 characters | "Payment terms must be 10-500 characters" |

**Zod Schema**:
```typescript
paymentTerms: z.string()
  .min(10, 'Payment terms must be at least 10 characters')
  .max(500, 'Payment terms must not exceed 500 characters')
```

#### Warranty Requirements
**Field**: `warranty` (stored in `tb_rfq_campaign.terms.warranty`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 500 characters | "Warranty requirements must not exceed 500 characters" |

**Zod Schema**:
```typescript
warranty: z.string()
  .max(500, 'Warranty requirements must not exceed 500 characters')
  .optional()
```

#### Incoterms
**Field**: `incoterms` (stored in `tb_rfq_campaign.terms.incoterms`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Valid | Must be valid Incoterm if provided | "Invalid Incoterm selected" |
| Format | 3 uppercase letters | "Incoterm must be 3 uppercase letters (e.g., FOB, CIF, EXW)" |

**Zod Schema**:
```typescript
incoterms: z.string()
  .length(3, 'Incoterm must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Incoterm must be 3 uppercase letters')
  .refine((term) => {
    const validIncoterms = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
    return validIncoterms.includes(term);
  }, 'Invalid Incoterm selected')
  .optional()
```

### 2.7 Bid Submission Validations

#### Bid Unit Price
**Field**: Price values (stored in `tb_rfq_bid.bidData.lineItems[].unitPrice`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide price for all required line items | "Price is required for this line item" |
| Type | Must be positive number | "Price must be a positive number" |
| Range | 0.01 to 999,999,999 | "Price must be between 0.01 and 999,999,999" |
| Precision | Max 4 decimal places | "Price must have at most 4 decimal places" |

**Zod Schema**:
```typescript
unitPrice: z.number()
  .positive('Price must be a positive number')
  .min(0.01, 'Price must be at least 0.01')
  .max(999999999, 'Price must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 4;
  }, 'Price must have at most 4 decimal places')
```

#### Bid Currency
**Field**: `currency` (stored in `tb_rfq_bid.bidData.lineItems[].currency`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Valid | Must match RFQ currency or be convertible | "Currency not supported or not convertible" |

**Zod Schema**:
```typescript
currency: z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
```

#### Delivery Lead Time
**Field**: `deliveryDate` (stored in `tb_rfq_bid.bidData.lineItems[].deliveryDate`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide delivery date | "Delivery date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must meet or exceed RFQ required date | "Delivery date must meet RFQ requirement" |
| Range | Cannot be more than 2 years in future | "Delivery date cannot be more than 2 years in the future" |

**Zod Schema**:
```typescript
deliveryDate: z.coerce.date()
  .refine((deliveryDate, ctx) => {
    const requiredDate = ctx.parent.parent.parent.rfqRequiredDate;
    return deliveryDate <= requiredDate;
  }, 'Delivery date must meet RFQ requirement')
  .refine((date) => {
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    return date <= twoYearsFromNow;
  }, 'Delivery date cannot be more than 2 years in the future')
```

#### Technical Specifications Compliance
**Field**: `technicalCompliance` (stored in `tb_rfq_bid.bidData.technicalCompliance.isCompliant`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must indicate compliance status | "Technical compliance status is required" |
| Type | Must be boolean | "Technical compliance must be Yes or No" |
| Conditional | If non-compliant, justification required | "Justification required for non-compliant specifications" |

**Zod Schema**:
```typescript
technicalCompliance: z.object({
  isCompliant: z.boolean(),
  deviations: z.array(z.object({
    specification: z.string().min(1),
    deviation: z.string().min(10, 'Deviation description must be at least 10 characters'),
    justification: z.string().min(20, 'Justification must be at least 20 characters'),
  })).optional(),
}).refine((data) => {
  if (!data.isCompliant) {
    return data.deviations && data.deviations.length > 0;
  }
  return true;
}, 'Deviations must be documented for non-compliant bids')
```

#### Commercial Terms Acceptance
**Field**: `commercialTerms` (stored in `tb_rfq_bid.bidData.commercialTerms`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must indicate acceptance of terms | "Commercial terms acceptance is required" |
| Type | Must be boolean for each term | "Each commercial term must be accepted or rejected" |
| Conditional | If rejected, alternative proposal required | "Alternative proposal required for rejected terms" |

**Zod Schema**:
```typescript
commercialTerms: z.object({
  paymentTermsAccepted: z.boolean(),
  alternativePaymentTerms: z.string().min(10).optional(),
  warrantyAccepted: z.boolean(),
  alternativeWarranty: z.string().min(10).optional(),
  incotermsAccepted: z.boolean(),
  alternativeIncoterms: z.string().length(3).optional(),
}).refine((data) => {
  if (!data.paymentTermsAccepted) {
    return data.alternativePaymentTerms && data.alternativePaymentTerms.length >= 10;
  }
  return true;
}, 'Alternative payment terms required when RFQ terms are not accepted')
```

### 2.8 Bid Evaluation Validations

#### Criterion Score
**Field**: `score` (stored in `tb_bid_evaluation.evaluationData.criterionScores[].score`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide score for all criteria | "Score is required for this criterion" |
| Type | Must be number | "Score must be a number" |
| Range | Must be within criterion's scoring scale | "Score must be between {min} and {max}" |
| Justification | Required for extreme scores (<5 or >8 on 1-10 scale) | "Justification required for this score" |

**Zod Schema**:
```typescript
criterionScore: z.object({
  criterionId: z.string().uuid(),
  score: z.number()
    .min(0, 'Score cannot be negative')
    .max(100, 'Score cannot exceed 100'),
  justification: z.string()
    .min(20, 'Justification must be at least 20 characters')
    .max(1000, 'Justification must not exceed 1000 characters')
    .optional(),
}).refine((data) => {
  // Require justification for extreme scores (assuming 1-10 scale)
  if (data.score < 5 || data.score > 8) {
    return data.justification && data.justification.length >= 20;
  }
  return true;
}, 'Justification required for scores below 5 or above 8')
```

#### Overall Recommendation
**Field**: `recommendation` (stored in `tb_bid_evaluation.recommendation`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide recommendation | "Evaluation recommendation is required" |
| Valid | Must be one of: AWARD, SHORTLIST, REJECT, REQUEST_CLARIFICATION | "Invalid recommendation" |
| Justification | Required for REJECT or AWARD recommendations | "Justification required for this recommendation" |

**Zod Schema**:
```typescript
recommendation: z.enum(['AWARD', 'SHORTLIST', 'REJECT', 'REQUEST_CLARIFICATION'], {
  errorMap: () => ({ message: 'Invalid recommendation' }),
})

justification: z.string()
  .min(50, 'Justification must be at least 50 characters')
  .max(2000, 'Justification must not exceed 2000 characters')
  .refine((text, ctx) => {
    const recommendation = ctx.parent.recommendation;
    if (recommendation === 'AWARD' || recommendation === 'REJECT') {
      return text && text.length >= 50;
    }
    return true;
  }, 'Justification required for AWARD or REJECT recommendations')
```

### 2.9 Award Validations

#### Award Decision
**Field**: `status` (stored in `tb_rfq_award.status`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide award decision | "Award decision is required" |
| Valid | Must be one of: PENDING_APPROVAL, APPROVED, REJECTED, AWARDED | "Invalid award status" |

**Zod Schema**:
```typescript
status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'AWARDED'], {
  errorMap: () => ({ message: 'Invalid award status' }),
})
```

#### Award Justification
**Field**: `justification` (stored in `tb_rfq_award.justification`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide justification | "Award justification is required" |
| Length | 50-2000 characters | "Justification must be 50-2000 characters" |

**Zod Schema**:
```typescript
justification: z.string()
  .min(50, 'Award justification must be at least 50 characters')
  .max(2000, 'Award justification must not exceed 2000 characters')
```

#### Contract Terms
**Field**: `contractTerms` (stored in `tb_rfq_award.contractTerms`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide contract terms | "Contract terms are required" |
| Length | 20-5000 characters | "Contract terms must be 20-5000 characters" |

**Zod Schema**:
```typescript
contractTerms: z.string()
  .min(20, 'Contract terms must be at least 20 characters')
  .max(5000, 'Contract terms must not exceed 5000 characters')
```

### 2.10 Negotiation Validations

#### Offer Amount
**Field**: `offerAmount` (stored in `tb_negotiation.offerAmount`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide offer amount | "Offer amount is required" |
| Type | Must be positive number | "Offer amount must be a positive number" |
| Range | 0.01 to 999,999,999 | "Offer amount must be between 0.01 and 999,999,999" |
| Precision | Max 2 decimal places | "Offer amount must have at most 2 decimal places" |

**Zod Schema**:
```typescript
offerAmount: z.number()
  .positive('Offer amount must be a positive number')
  .min(0.01, 'Offer amount must be at least 0.01')
  .max(999999999, 'Offer amount must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Offer amount must have at most 2 decimal places')
```

#### Negotiation Message
**Field**: `message` (stored in `tb_negotiation_message.message`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide message | "Message is required" |
| Length | 10-2000 characters | "Message must be 10-2000 characters" |

**Zod Schema**:
```typescript
message: z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message must not exceed 2000 characters')
```

---

## 3. Business Rule Validations

### 3.1 RFQ Creation Rules

#### BR-RFQ-001: Minimum Vendor Requirement
**Rule**: Competitive RFQs must invite at least 3 vendors.

**Validation**:
```typescript
const vendorCount = selectedVendors.length;

if (rfqType === 'COMPETITIVE' && vendorCount < 3) {
  throw new ValidationError('Competitive RFQ requires at least 3 vendors');
}
```

**Error Message**: "Competitive RFQ requires at least 3 vendors. Please select additional vendors or change to single-source RFQ."

#### BR-RFQ-002: Minimum Bid Period
**Rule**: Bid period must be at least 7 business days.

**Validation**:
```typescript
const openDate = new Date(timeline.bidOpenDate);
const closeDate = new Date(timeline.bidCloseDate);

// Calculate business days (simplified - actual implementation should use library)
const diffDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));

if (diffDays < 7) {
  throw new ValidationError('Bid period must be at least 7 business days');
}
```

**Error Message**: "Bid period must be at least 7 business days. Please adjust the bid close date."

#### BR-RFQ-003: Bid Confidentiality
**Rule**: Bids must remain confidential until evaluation phase.

**Validation**:
```typescript
// Check if attempting to view bid details before evaluation
const rfq = await prisma.rFQCampaign.findUnique({ where: { id: rfqId } });

if (rfq.status === 'OPEN' || rfq.status === 'CLOSED') {
  const isAuthorizedEvaluator = await checkEvaluatorPermission(userId, rfqId);

  if (!isAuthorizedEvaluator) {
    throw new ValidationError('Bid details are confidential until evaluation phase');
  }
}
```

**Error Message**: "Bid details are confidential until the evaluation phase begins. Only authorized evaluators can access bids."

#### BR-RFQ-004: Evaluation Criteria Weights
**Rule**: Evaluation criteria weights must sum to 100%.

**Validation**:
```typescript
const totalWeight = evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);

if (Math.abs(totalWeight - 100) > 0.01) {
  throw new ValidationError(`Evaluation criteria weights must sum to 100%. Current total: ${totalWeight}%`);
}
```

**Error Message**: "Evaluation criteria weights must sum to 100%. Current total: {totalWeight}%. Please adjust the weights."

#### BR-RFQ-005: Approval Thresholds
**Rule**: RFQs above certain value thresholds require specific approval levels.

**Validation**:
```typescript
const estimatedValue = calculateEstimatedValue(rfq);

let requiredApprovalLevel: string;

if (estimatedValue < 50000) {
  requiredApprovalLevel = 'PROCUREMENT_MANAGER';
} else if (estimatedValue < 500000) {
  requiredApprovalLevel = 'FINANCIAL_MANAGER';
} else {
  requiredApprovalLevel = 'EXECUTIVE';
}

// Check if current user has required approval authority
const hasAuthority = await checkApprovalAuthority(userId, requiredApprovalLevel);

if (!hasAuthority) {
  throw new ValidationError(`RFQ value requires ${requiredApprovalLevel} approval`);
}
```

**Error Message**: "This RFQ exceeds your approval authority. Required approval level: {requiredApprovalLevel}."

#### BR-RFQ-006: Line Item Minimum
**Rule**: RFQ must contain at least one line item.

**Validation**:
```typescript
const lineItemCount = requirements.items?.length || 0;

if (lineItemCount === 0) {
  throw new ValidationError('RFQ must contain at least one line item');
}
```

**Error Message**: "RFQ must contain at least one line item. Please add items to the requirements section."

#### BR-RFQ-007: Evaluation Criteria Minimum
**Rule**: RFQ must have at least one evaluation criterion (price is automatically included).

**Validation**:
```typescript
const criteriaCount = evaluation.criteria?.length || 0;

if (criteriaCount === 0) {
  throw new ValidationError('RFQ must have at least one evaluation criterion');
}

// Ensure price criterion exists
const hasPriceCriterion = evaluation.criteria.some(c => c.type === 'PRICE');

if (!hasPriceCriterion) {
  throw new ValidationError('RFQ must include price as an evaluation criterion');
}
```

**Error Message**: "RFQ must have at least one evaluation criterion, including price."

### 3.2 Vendor Invitation Rules

#### BR-RFQ-008: Vendor Status Requirement
**Rule**: Only approved or preferred vendors can be invited to RFQs.

**Validation**:
```typescript
const vendor = await prisma.tb_vendor.findUnique({
  where: { id: vendorId },
});

if (vendor.status !== 'approved' && vendor.status !== 'preferred') {
  throw new ValidationError('Only approved or preferred vendors can receive RFQs');
}
```

**Error Message**: "Only approved or preferred vendors can receive RFQs. Vendor status: {vendor.status}."

#### BR-RFQ-009: Duplicate Invitation Prevention
**Rule**: Cannot invite same vendor multiple times to same RFQ.

**Validation**:
```typescript
const existingInvitation = await prisma.vendorInvitation.findFirst({
  where: {
    rfqId,
    vendorId,
    status: { notIn: ['CANCELLED', 'DECLINED'] },
  },
});

if (existingInvitation) {
  throw new ValidationError('Vendor already invited to this RFQ');
}
```

**Error Message**: "This vendor has already been invited to this RFQ. Cannot send duplicate invitations."

#### BR-RFQ-010: Category Relevance
**Rule**: Invited vendors should have relevant categories/capabilities.

**Validation** (Warning, not blocking):
```typescript
const vendor = await prisma.tb_vendor.findUnique({
  where: { id: vendorId },
  include: { categories: true },
});

const rfqCategory = rfq.category;

const hasRelevantCategory = vendor.categories.some(cat =>
  cat.category === rfqCategory || cat.parentCategory === rfqCategory
);

if (!hasRelevantCategory) {
  // Warning, but allow to proceed
  warnings.push(`Vendor "${vendor.companyName}" does not have a matching category. Consider if they are suitable for this RFQ.`);
}
```

**Warning Message**: "Vendor '{vendor.companyName}' does not have a matching category. Consider if they are suitable for this RFQ."

### 3.3 Bid Submission Rules

#### BR-RFQ-011: Bid Deadline Enforcement
**Rule**: Bids cannot be submitted after the bid close date/time.

**Validation**:
```typescript
const rfq = await prisma.rFQCampaign.findUnique({
  where: { id: rfqId },
});

const closeDate = new Date(rfq.timeline.bidCloseDate);
const now = new Date();

if (now > closeDate) {
  throw new ValidationError('Bid submission deadline has passed');
}
```

**Error Message**: "Bid submission deadline has passed. The RFQ closed on {closeDate}."

#### BR-RFQ-012: Complete Pricing Requirement
**Rule**: Vendors must provide pricing for all required line items.

**Validation**:
```typescript
const requiredItems = rfq.requirements.items.filter(item => item.isRequired);
const submittedItems = bidData.lineItems;

const missingItems = requiredItems.filter(reqItem =>
  !submittedItems.find(subItem => subItem.itemId === reqItem.id)
);

if (missingItems.length > 0) {
  throw new ValidationError(`Missing pricing for ${missingItems.length} required items`);
}
```

**Error Message**: "Missing pricing for {count} required items. All required line items must have pricing."

#### BR-RFQ-013: No Bid Modification After Submission
**Rule**: Bids cannot be modified after submission deadline.

**Validation**:
```typescript
const bid = await prisma.rFQBid.findUnique({
  where: { id: bidId },
  include: { rfq: true },
});

const closeDate = new Date(bid.rfq.timeline.bidCloseDate);
const now = new Date();

if (bid.submittedAt && now > closeDate) {
  throw new ValidationError('Cannot modify bid after submission deadline');
}
```

**Error Message**: "Cannot modify bid after submission deadline. The RFQ closed on {closeDate}."

#### BR-RFQ-014: Technical Compliance Documentation
**Rule**: If technical specifications are not met, deviations must be documented.

**Validation**:
```typescript
const technicalCompliance = bidData.technicalCompliance;

if (!technicalCompliance.isCompliant) {
  if (!technicalCompliance.deviations || technicalCompliance.deviations.length === 0) {
    throw new ValidationError('Deviations must be documented for non-compliant bids');
  }

  // Check that all deviations have justifications
  const missingJustifications = technicalCompliance.deviations.filter(
    dev => !dev.justification || dev.justification.length < 20
  );

  if (missingJustifications.length > 0) {
    throw new ValidationError('All deviations must have detailed justifications');
  }
}
```

**Error Message**: "Deviations from technical specifications must be documented with detailed justifications."

#### BR-RFQ-015: Bid Validity Period
**Rule**: Bid validity period must be at least 60 days from bid close date.

**Validation**:
```typescript
const closeDate = new Date(rfq.timeline.bidCloseDate);
const validUntilDate = new Date(bidData.validUntil);

const diffDays = Math.ceil((validUntilDate.getTime() - closeDate.getTime()) / (1000 * 60 * 60 * 24));

if (diffDays < 60) {
  throw new ValidationError('Bid validity period must be at least 60 days from bid close date');
}
```

**Error Message**: "Bid validity period must be at least 60 days from bid close date. Please extend the validity period."

### 3.4 Bid Evaluation Rules

#### BR-RFQ-016: Evaluation Completeness
**Rule**: All evaluation criteria must be scored before finalizing evaluation.

**Validation**:
```typescript
const criteria = rfq.evaluation.criteria;
const scoredCriteria = evaluation.evaluationData.criterionScores;

const missingScores = criteria.filter(c =>
  !scoredCriteria.find(s => s.criterionId === c.id)
);

if (missingScores.length > 0) {
  throw new ValidationError(`${missingScores.length} criteria have not been scored`);
}
```

**Error Message**: "{count} evaluation criteria have not been scored. All criteria must be scored before finalizing evaluation."

#### BR-RFQ-017: Disqualification Justification
**Rule**: Bid disqualifications require detailed justification.

**Validation**:
```typescript
if (evaluation.recommendation === 'REJECT') {
  if (!evaluation.justification || evaluation.justification.length < 50) {
    throw new ValidationError('Disqualification requires detailed justification (minimum 50 characters)');
  }
}
```

**Error Message**: "Disqualification requires detailed justification explaining the reasons for rejection."

#### BR-RFQ-018: Price Criterion Auto-Calculation
**Rule**: Price criterion scores must be calculated automatically based on lowest price.

**Validation** (System enforced):
```typescript
// Price criterion score is auto-calculated, not manually entered
const priceCriterion = criteria.find(c => c.type === 'PRICE');

if (priceCriterion) {
  const lowestPrice = Math.min(...allBids.map(b => b.totalPrice));
  const currentBidPrice = currentBid.totalPrice;

  // Score = (Lowest Price / Current Price) * Max Score
  const autoScore = (lowestPrice / currentBidPrice) * priceCriterion.scoringScale.max;

  // Override any manually entered price score
  evaluation.criterionScores.find(s => s.criterionId === priceCriterion.id).score = autoScore;
}
```

**Note**: This is system-enforced, no user error message needed.

#### BR-RFQ-019: Multi-Evaluator Consistency
**Rule**: For multi-evaluator RFQs, significant score discrepancies require discussion.

**Validation** (Warning):
```typescript
if (rfq.evaluation.multipleEvaluators) {
  const allEvaluations = await prisma.bidEvaluation.findMany({
    where: { bidId, status: 'COMPLETED' },
  });

  // Check for significant score discrepancies
  criteria.forEach(criterion => {
    const scores = allEvaluations.map(eval =>
      eval.evaluationData.criterionScores.find(s => s.criterionId === criterion.id).score
    );

    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const discrepancy = max - min;

    // If discrepancy > 30% of scale, flag for discussion
    const scale = criterion.scoringScale.max - criterion.scoringScale.min;
    if (discrepancy > scale * 0.3) {
      warnings.push(`Significant score discrepancy for "${criterion.name}": Range ${min}-${max}. Evaluators should discuss.`);
    }
  });
}
```

**Warning Message**: "Significant score discrepancy for '{criterion.name}': Range {min}-{max}. Evaluators should discuss before finalizing."

### 3.5 Award Rules

#### BR-RFQ-020: Award to Evaluated Bid
**Rule**: Can only award to bids that have been evaluated.

**Validation**:
```typescript
const bid = await prisma.rFQBid.findUnique({
  where: { id: bidId },
  include: { evaluations: true },
});

const hasEvaluation = bid.evaluations.some(e => e.status === 'COMPLETED');

if (!hasEvaluation) {
  throw new ValidationError('Cannot award to a bid that has not been evaluated');
}
```

**Error Message**: "Cannot award to a bid that has not been evaluated. Please complete evaluation first."

#### BR-RFQ-021: Award Approval Workflow
**Rule**: Awards above thresholds require appropriate approval.

**Validation**:
```typescript
const awardValue = calculateAwardValue(award);

let requiredApprovalLevel: string;

if (awardValue < 50000) {
  requiredApprovalLevel = 'PROCUREMENT_MANAGER';
} else if (awardValue < 500000) {
  requiredApprovalLevel = 'FINANCIAL_MANAGER';
} else {
  requiredApprovalLevel = 'EXECUTIVE';
}

// Check if award has required approvals
const approvals = await prisma.rfqAwardApproval.findMany({
  where: { awardId: award.id, status: 'APPROVED' },
});

const hasRequiredApproval = approvals.some(a => a.approverLevel === requiredApprovalLevel);

if (!hasRequiredApproval) {
  throw new ValidationError(`Award requires ${requiredApprovalLevel} approval`);
}
```

**Error Message**: "This award exceeds approval threshold. Required approval level: {requiredApprovalLevel}."

#### BR-RFQ-022: Single Award Per RFQ
**Rule**: Cannot award to multiple vendors unless RFQ explicitly allows split awards.

**Validation**:
```typescript
const existingAwards = await prisma.rFQAward.findMany({
  where: {
    rfqId,
    status: { in: ['APPROVED', 'AWARDED'] },
  },
});

if (existingAwards.length > 0 && !rfq.allowSplitAwards) {
  throw new ValidationError('RFQ already has an award. Split awards are not allowed for this RFQ.');
}
```

**Error Message**: "This RFQ already has an award. Split awards are not allowed for this RFQ."

#### BR-RFQ-023: Award Notification Requirement
**Rule**: Awarded and non-awarded vendors must be notified.

**Validation** (System enforced):
```typescript
// After award is finalized, send notifications
async function finalizeAward(awardId: string) {
  const award = await prisma.rFQAward.findUnique({
    where: { id: awardId },
    include: { bid: { include: { vendor: true } }, rfq: { include: { bids: { include: { vendor: true } } } } },
  });

  // Notify awarded vendor
  await sendAwardNotification(award.bid.vendor, award);

  // Notify non-awarded vendors
  const nonAwardedBids = award.rfq.bids.filter(b => b.id !== award.bidId && b.status === 'SUBMITTED');

  for (const bid of nonAwardedBids) {
    await sendNonAwardNotification(bid.vendor, award.rfq);
  }
}
```

**Note**: This is system-enforced, notifications are automatic.

### 3.6 Contract Generation Rules

#### BR-RFQ-024: Contract Based on Award
**Rule**: Contracts can only be generated from awarded RFQs.

**Validation**:
```typescript
const award = await prisma.rFQAward.findFirst({
  where: { rfqId, status: 'AWARDED' },
});

if (!award) {
  throw new ValidationError('Cannot generate contract without an approved award');
}
```

**Error Message**: "Cannot generate contract without an approved award. Please finalize the award first."

#### BR-RFQ-025: Contract Terms Consistency
**Rule**: Contract terms must be consistent with RFQ terms and awarded bid.

**Validation**:
```typescript
// Validate payment terms match
if (contract.paymentTerms !== rfq.terms.paymentTerms &&
    contract.paymentTerms !== award.negotiatedTerms.paymentTerms) {
  warnings.push('Contract payment terms differ from RFQ and negotiated terms. Please verify.');
}

// Validate pricing matches awarded bid
const bidTotal = award.bid.bidData.totalPrice;
const contractTotal = contract.totalValue;

if (Math.abs(bidTotal - contractTotal) > 0.01) {
  throw new ValidationError('Contract total value must match awarded bid total');
}
```

**Error Message**: "Contract total value must match awarded bid total. Bid total: {bidTotal}, Contract total: {contractTotal}."

---

## 4. Complete Zod Schemas

### 4.1 RFQ Creation Schema

```typescript
export const rfqSchema = z.object({
  // Basic Information
  title: z.string()
    .min(5, 'RFQ title must be at least 5 characters')
    .max(200, 'RFQ title must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'RFQ title contains invalid characters'),

  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .refine((text) => !/<script[^>]*>.*?<\/script>/i.test(text), 'Description cannot contain script tags')
    .optional(),

  category: z.string()
    .min(1, 'RFQ category is required')
    .max(100, 'Category must not exceed 100 characters'),

  type: z.enum(['GOODS', 'SERVICES', 'WORKS', 'MIXED'], {
    errorMap: () => ({ message: 'Invalid RFQ type selected' }),
  }),

  budgetRange: z.number()
    .positive('Budget must be a positive number')
    .min(0.01, 'Budget must be at least 0.01')
    .max(999999999, 'Budget must not exceed 999,999,999')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Budget must have at most 2 decimal places')
    .optional(),

  currency: z.string()
    .length(3, 'Currency code must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .refine((code) => {
      const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'MYR', 'THB', 'IDR', 'PHP'];
      return supportedCurrencies.includes(code);
    }, 'Currency not supported')
    .default('USD'),

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    errorMap: () => ({ message: 'Invalid priority level' }),
  }).default('MEDIUM'),

  // Timeline
  timeline: z.object({
    bidOpenDate: z.coerce.date()
      .refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Bid open date cannot be in the past')
      .refine((date) => {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return date <= oneYearFromNow;
      }, 'Bid open date cannot be more than 1 year in the future'),

    bidCloseDate: z.coerce.date(),

    clarificationDeadline: z.coerce.date().optional(),

    evaluationDeadline: z.coerce.date().optional(),

    awardDate: z.coerce.date().optional(),
  })
  .refine((timeline) => {
    return timeline.bidCloseDate > timeline.bidOpenDate;
  }, {
    message: 'Bid close date must be after bid open date',
    path: ['bidCloseDate'],
  })
  .refine((timeline) => {
    const openDate = timeline.bidOpenDate;
    const closeDate = timeline.bidCloseDate;
    const diffDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  }, {
    message: 'Bid period must be at least 7 business days',
    path: ['bidCloseDate'],
  })
  .refine((timeline) => {
    if (!timeline.clarificationDeadline) return true;
    return timeline.clarificationDeadline < timeline.bidCloseDate;
  }, {
    message: 'Clarification deadline must be before bid close date',
    path: ['clarificationDeadline'],
  })
  .refine((timeline) => {
    if (!timeline.evaluationDeadline) return true;
    return timeline.evaluationDeadline > timeline.bidCloseDate;
  }, {
    message: 'Evaluation deadline must be after bid close date',
    path: ['evaluationDeadline'],
  }),

  // Requirements & Line Items
  requirements: z.object({
    items: z.array(z.object({
      id: z.string(),
      itemNumber: z.string(),
      description: z.string()
        .min(5, 'Item description must be at least 5 characters')
        .max(500, 'Item description must not exceed 500 characters'),

      productCode: z.string().optional(),

      quantity: z.number()
        .positive('Quantity must be a positive number')
        .min(0.001, 'Quantity must be at least 0.001')
        .max(999999999, 'Quantity must not exceed 999,999,999')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 3;
        }, 'Quantity must have at most 3 decimal places'),

      uom: z.string()
        .min(1, 'Unit of measure is required')
        .max(20, 'UOM must not exceed 20 characters'),

      specifications: z.object({
        technical: z.record(z.any()).optional(),
        quality: z.string().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        customAttributes: z.record(z.any()).optional(),
      }),

      delivery: z.object({
        location: z.string()
          .min(3, 'Delivery location must be at least 3 characters')
          .max(200, 'Delivery location must not exceed 200 characters'),
        locationId: z.string().uuid().optional(),
        requiredDate: z.coerce.date(),
        earliestDate: z.coerce.date().optional(),
        latestDate: z.coerce.date().optional(),
      }),

      samplesRequired: z.boolean().default(false),
      isRequired: z.boolean().default(true),
      estimatedBudget: z.number()
        .positive('Estimated budget must be a positive number')
        .min(0.01)
        .max(999999999)
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }, 'Estimated budget must have at most 2 decimal places')
        .optional(),
    })).min(1, 'At least one line item is required'),

    generalRequirements: z.object({
      warranty: z.string().max(500).optional(),
      qualityStandards: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      compliance: z.array(z.string()).optional(),
      specialInstructions: z.string().max(2000).optional(),
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

  // Evaluation Criteria
  evaluation: z.object({
    criteria: z.array(z.object({
      id: z.string(),
      name: z.string()
        .min(3, 'Criterion name must be at least 3 characters')
        .max(100, 'Criterion name must not exceed 100 characters')
        .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\/]+$/, 'Criterion name contains invalid characters'),

      description: z.string().max(500).optional(),

      type: z.enum(['PRICE', 'QUALITY', 'DELIVERY', 'TECHNICAL', 'SERVICE', 'CUSTOM']),

      weight: z.number()
        .positive('Weight must be a positive number')
        .min(0.01, 'Weight must be at least 0.01')
        .max(100, 'Weight must not exceed 100')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }, 'Weight must have at most 2 decimal places'),

      scoringScale: z.object({
        min: z.number().min(0).max(100),
        max: z.number().min(1).max(100),
      }).refine((scale) => scale.max > scale.min, {
        message: 'Maximum score must be greater than minimum score',
      }),

      guidelines: z.string().max(1000).optional(),
    })).min(1, 'At least one evaluation criterion is required'),

    evaluationMethod: z.enum(['WEIGHTED_SCORING', 'PASS_FAIL', 'RANKING']).default('WEIGHTED_SCORING'),

    blindEvaluation: z.boolean().default(false),

    multipleEvaluators: z.boolean().default(false),

    evaluators: z.array(z.string().uuid()).optional(),
  })
  .refine((evaluation) => {
    const totalWeight = evaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
    return Math.abs(totalWeight - 100) < 0.01;
  }, {
    message: 'Evaluation criteria weights must sum to 100%',
    path: ['criteria'],
  })
  .refine((evaluation) => {
    const hasPriceCriterion = evaluation.criteria.some(c => c.type === 'PRICE');
    return hasPriceCriterion;
  }, {
    message: 'At least one criterion must be of type PRICE',
    path: ['criteria'],
  }),

  // Terms & Conditions
  terms: z.object({
    paymentTerms: z.string()
      .min(10, 'Payment terms must be at least 10 characters')
      .max(500, 'Payment terms must not exceed 500 characters'),

    warranty: z.string().max(500).optional(),

    incoterms: z.string()
      .length(3, 'Incoterm must be exactly 3 characters')
      .regex(/^[A-Z]{3}$/, 'Incoterm must be 3 uppercase letters')
      .refine((term) => {
        const validIncoterms = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
        return validIncoterms.includes(term);
      }, 'Invalid Incoterm selected')
      .optional(),

    penalties: z.string().max(1000).optional(),

    other: z.string().max(2000).optional(),
  }),

  // Vendor Selection
  selectedVendors: z.array(z.string().uuid())
    .min(3, 'Competitive RFQ requires at least 3 vendors')
    .max(100, 'Maximum 100 vendors can be invited per RFQ')
    .refine((vendors) => {
      const uniqueVendors = new Set(vendors);
      return uniqueVendors.size === vendors.length;
    }, 'Duplicate vendors detected. Each vendor can only be invited once.'),

  // Metadata
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'OPEN', 'CLOSED', 'UNDER_REVIEW', 'EVALUATED', 'AWARDED', 'CANCELLED']).default('DRAFT'),

  department: z.string(),
  location: z.string(),
  createdBy: z.string().uuid(),
});
```

### 4.2 Bid Submission Schema

```typescript
export const bidSubmissionSchema = z.object({
  rfqId: z.string().uuid(),
  vendorId: z.string().uuid(),

  // Line Items & Pricing
  bidData: z.object({
    lineItems: z.array(z.object({
      itemId: z.string(),
      unitPrice: z.number()
        .positive('Price must be a positive number')
        .min(0.01, 'Price must be at least 0.01')
        .max(999999999, 'Price must not exceed 999,999,999')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 4;
        }, 'Price must have at most 4 decimal places'),

      currency: z.string()
        .length(3, 'Currency code must be exactly 3 characters')
        .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters'),

      deliveryDate: z.coerce.date(),

      brand: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),

      alternativeOffered: z.boolean().default(false),
      alternativeDescription: z.string().max(500).optional(),

      notes: z.string().max(500).optional(),
    })).min(1, 'At least one line item must be priced'),

    // Technical Compliance
    technicalCompliance: z.object({
      isCompliant: z.boolean(),
      deviations: z.array(z.object({
        specification: z.string().min(1),
        deviation: z.string()
          .min(10, 'Deviation description must be at least 10 characters'),
        justification: z.string()
          .min(20, 'Justification must be at least 20 characters'),
      })).optional(),
    }).refine((data) => {
      if (!data.isCompliant) {
        return data.deviations && data.deviations.length > 0;
      }
      return true;
    }, 'Deviations must be documented for non-compliant bids'),

    // Commercial Terms
    commercialTerms: z.object({
      paymentTermsAccepted: z.boolean(),
      alternativePaymentTerms: z.string().min(10).optional(),
      warrantyAccepted: z.boolean(),
      alternativeWarranty: z.string().min(10).optional(),
      incotermsAccepted: z.boolean(),
      alternativeIncoterms: z.string().length(3).optional(),
    }).refine((data) => {
      if (!data.paymentTermsAccepted) {
        return data.alternativePaymentTerms && data.alternativePaymentTerms.length >= 10;
      }
      return true;
    }, 'Alternative payment terms required when RFQ terms are not accepted'),

    // Additional Information
    companyProfile: z.string().max(2000).optional(),
    references: z.array(z.object({
      clientName: z.string(),
      contactPerson: z.string(),
      contactEmail: z.string().email(),
      projectDescription: z.string(),
    })).optional(),

    certifications: z.array(z.object({
      name: z.string(),
      issuedBy: z.string(),
      validUntil: z.coerce.date().optional(),
      documentUrl: z.string().url().optional(),
    })).optional(),

    attachments: z.array(z.object({
      fileName: z.string(),
      fileUrl: z.string().url(),
      category: z.enum(['technical_spec', 'certificate', 'reference', 'other']),
    })).optional(),

    validUntil: z.coerce.date(),

    totalPrice: z.number().positive(),
  }),

  // Metadata
  submittedBy: z.string().uuid(),
});
```

### 4.3 Bid Evaluation Schema

```typescript
export const bidEvaluationSchema = z.object({
  bidId: z.string().uuid(),
  evaluatorId: z.string().uuid(),

  evaluationData: z.object({
    criterionScores: z.array(z.object({
      criterionId: z.string().uuid(),
      score: z.number()
        .min(0, 'Score cannot be negative')
        .max(100, 'Score cannot exceed 100'),
      justification: z.string()
        .min(20, 'Justification must be at least 20 characters')
        .max(1000, 'Justification must not exceed 1000 characters')
        .optional(),
    })).refine((scores) => {
      // Check that all required justifications are provided for extreme scores
      return scores.every(s => {
        if (s.score < 5 || s.score > 8) {
          return s.justification && s.justification.length >= 20;
        }
        return true;
      });
    }, 'Justification required for scores below 5 or above 8'),

    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    risks: z.array(z.string()).optional(),

    clarificationsNeeded: z.array(z.object({
      question: z.string().min(10),
      category: z.enum(['TECHNICAL', 'COMMERCIAL', 'DELIVERY', 'OTHER']),
    })).optional(),
  }),

  recommendation: z.enum(['AWARD', 'SHORTLIST', 'REJECT', 'REQUEST_CLARIFICATION'], {
    errorMap: () => ({ message: 'Invalid recommendation' }),
  }),

  justification: z.string()
    .min(50, 'Justification must be at least 50 characters')
    .max(2000, 'Justification must not exceed 2000 characters'),

  status: z.enum(['IN_PROGRESS', 'COMPLETED']).default('IN_PROGRESS'),
}).refine((data) => {
  if (data.recommendation === 'AWARD' || data.recommendation === 'REJECT') {
    return data.justification && data.justification.length >= 50;
  }
  return true;
}, 'Detailed justification required for AWARD or REJECT recommendations');
```

### 4.4 Award Schema

```typescript
export const awardSchema = z.object({
  rfqId: z.string().uuid(),
  bidId: z.string().uuid(),

  awardData: z.object({
    awardedItems: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      totalPrice: z.number().positive(),
    })).min(1, 'At least one item must be awarded'),

    totalValue: z.number()
      .positive('Total award value must be positive')
      .min(0.01)
      .max(999999999),
  }),

  justification: z.string()
    .min(50, 'Award justification must be at least 50 characters')
    .max(2000, 'Award justification must not exceed 2000 characters'),

  contractTerms: z.string()
    .min(20, 'Contract terms must be at least 20 characters')
    .max(5000, 'Contract terms must not exceed 5000 characters'),

  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'AWARDED'], {
    errorMap: () => ({ message: 'Invalid award status' }),
  }).default('PENDING_APPROVAL'),

  approvedBy: z.string().uuid().optional(),
  awardedBy: z.string().uuid(),
});
```

### 4.5 Negotiation Schema

```typescript
export const negotiationSchema = z.object({
  rfqId: z.string().uuid(),
  bidId: z.string().uuid(),

  offerType: z.enum(['INITIAL', 'COUNTER', 'FINAL']),

  offerAmount: z.number()
    .positive('Offer amount must be a positive number')
    .min(0.01, 'Offer amount must be at least 0.01')
    .max(999999999, 'Offer amount must not exceed 999,999,999')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Offer amount must have at most 2 decimal places'),

  offerTerms: z.string()
    .min(20, 'Offer terms must be at least 20 characters')
    .max(2000, 'Offer terms must not exceed 2000 characters'),

  validUntil: z.coerce.date(),

  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED']).default('PENDING'),

  messages: z.array(z.object({
    message: z.string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must not exceed 2000 characters'),
    sentBy: z.string().uuid(),
    sentAt: z.string(),
  })).optional(),

  initiatedBy: z.string().uuid(),
});
```

---

## 5. Database Constraints

### 5.1 Table Constraints

#### tb_rfq_campaign

**SQL Constraints**:
```sql
CREATE TABLE tb_rfq_campaign (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('GOODS', 'SERVICES', 'WORKS', 'MIXED')),
  status VARCHAR(30) NOT NULL CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'OPEN', 'CLOSED', 'UNDER_REVIEW', 'EVALUATED', 'AWARDED', 'CANCELLED')) DEFAULT 'DRAFT',
  budget_range DECIMAL(15,2) CHECK (budget_range > 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',

  timeline JSONB NOT NULL,
  requirements JSONB NOT NULL,
  evaluation JSONB NOT NULL,
  terms JSONB NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  awarded_at TIMESTAMP,
  deleted_at TIMESTAMP,

  created_by UUID NOT NULL REFERENCES tb_user(id),
  department VARCHAR(100),
  location VARCHAR(100),

  CONSTRAINT chk_rfq_dates CHECK (
    (published_at IS NULL OR published_at >= created_at) AND
    (closed_at IS NULL OR closed_at >= published_at) AND
    (awarded_at IS NULL OR awarded_at >= closed_at)
  )
);

-- Indexes for performance
CREATE INDEX idx_rfq_campaign_rfq_number ON tb_rfq_campaign(rfq_number);
CREATE INDEX idx_rfq_campaign_status ON tb_rfq_campaign(status);
CREATE INDEX idx_rfq_campaign_category ON tb_rfq_campaign(category);
CREATE INDEX idx_rfq_campaign_created_by ON tb_rfq_campaign(created_by);
CREATE INDEX idx_rfq_campaign_deleted_at ON tb_rfq_campaign(deleted_at);

-- GIN index for JSONB fields
CREATE INDEX idx_rfq_campaign_timeline ON tb_rfq_campaign USING GIN (timeline);
CREATE INDEX idx_rfq_campaign_requirements ON tb_rfq_campaign USING GIN (requirements);
CREATE INDEX idx_rfq_campaign_evaluation ON tb_rfq_campaign USING GIN (evaluation);
```

**Application-Level Constraints**:
- RFQ number auto-generation: `RFQ-{YEAR}-{CATEGORY_CODE}-{SEQUENCE}`
- Status transitions must follow defined workflow (Draft → Pending Approval → Published → Open → Closed → Under Review → Evaluated → Awarded)
- Cannot delete RFQ with submitted bids (soft delete only)
- Timeline validation: bidOpenDate < bidCloseDate, bidCloseDate + 7 days minimum
- Evaluation criteria weights must sum to 100%

#### tb_vendor_invitation

**SQL Constraints**:
```sql
CREATE TABLE tb_vendor_invitation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES tb_rfq_campaign(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES tb_vendor(id) ON DELETE CASCADE,

  invitation_data JSONB,

  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'SENT', 'VIEWED', 'ACKNOWLEDGED', 'DECLINED')) DEFAULT 'PENDING',

  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  acknowledged_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  sent_by UUID NOT NULL REFERENCES tb_user(id),

  CONSTRAINT uq_rfq_vendor UNIQUE (rfq_id, vendor_id),
  CONSTRAINT chk_invitation_dates CHECK (
    (viewed_at IS NULL OR viewed_at >= sent_at) AND
    (acknowledged_at IS NULL OR acknowledged_at >= viewed_at)
  )
);

-- Indexes
CREATE INDEX idx_vendor_invitation_rfq_id ON tb_vendor_invitation(rfq_id);
CREATE INDEX idx_vendor_invitation_vendor_id ON tb_vendor_invitation(vendor_id);
CREATE INDEX idx_vendor_invitation_status ON tb_vendor_invitation(status);
```

**Application-Level Constraints**:
- Cannot invite same vendor twice to same RFQ (enforced by unique constraint)
- Cannot invite vendors with status other than 'approved' or 'preferred'
- Cannot send invitation after bid close date
- Status transitions must follow defined workflow

#### tb_rfq_bid

**SQL Constraints**:
```sql
CREATE TABLE tb_rfq_bid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES tb_rfq_campaign(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES tb_vendor(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES tb_vendor_invitation(id),

  bid_number VARCHAR(50) UNIQUE NOT NULL,

  bid_data JSONB NOT NULL,

  status VARCHAR(30) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CLARIFICATION_REQUESTED', 'CLARIFICATION_PROVIDED', 'DISQUALIFIED', 'AWARDED', 'NOT_AWARDED')) DEFAULT 'DRAFT',

  total_price DECIMAL(15,2) NOT NULL CHECK (total_price > 0),
  currency CHAR(3) NOT NULL,

  submitted_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  created_by UUID NOT NULL REFERENCES tb_user(id),

  CONSTRAINT uq_rfq_vendor_bid UNIQUE (rfq_id, vendor_id),
  CONSTRAINT chk_bid_submitted CHECK (
    (status = 'DRAFT' AND submitted_at IS NULL) OR
    (status != 'DRAFT' AND submitted_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_rfq_bid_rfq_id ON tb_rfq_bid(rfq_id);
CREATE INDEX idx_rfq_bid_vendor_id ON tb_rfq_bid(vendor_id);
CREATE INDEX idx_rfq_bid_status ON tb_rfq_bid(status);
CREATE INDEX idx_rfq_bid_submitted_at ON tb_rfq_bid(submitted_at);

-- GIN index for JSONB field
CREATE INDEX idx_rfq_bid_bid_data ON tb_rfq_bid USING GIN (bid_data);
```

**Application-Level Constraints**:
- Bid number auto-generation: `BID-{RFQ_NUMBER}-{VENDOR_CODE}-{SEQUENCE}`
- One bid per vendor per RFQ (enforced by unique constraint)
- Cannot submit bid after bid close date
- Cannot modify submitted bid after deadline
- Total price must match sum of line item prices (with tolerance for rounding)
- All required line items must have pricing

#### tb_bid_evaluation

**SQL Constraints**:
```sql
CREATE TABLE tb_bid_evaluation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES tb_rfq_campaign(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES tb_rfq_bid(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES tb_user(id),

  evaluation_data JSONB NOT NULL,

  total_score DECIMAL(5,2) CHECK (total_score >= 0 AND total_score <= 100),
  recommendation VARCHAR(30) CHECK (recommendation IN ('AWARD', 'SHORTLIST', 'REJECT', 'REQUEST_CLARIFICATION')),
  justification TEXT,

  status VARCHAR(30) NOT NULL CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'NOT_STARTED',

  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_bid_evaluator UNIQUE (bid_id, evaluator_id),
  CONSTRAINT chk_evaluation_dates CHECK (
    (completed_at IS NULL OR completed_at >= started_at) AND
    (started_at IS NULL OR started_at >= created_at)
  ),
  CONSTRAINT chk_evaluation_completed CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL AND total_score IS NOT NULL AND recommendation IS NOT NULL) OR
    (status != 'COMPLETED')
  )
);

-- Indexes
CREATE INDEX idx_bid_evaluation_rfq_id ON tb_bid_evaluation(rfq_id);
CREATE INDEX idx_bid_evaluation_bid_id ON tb_bid_evaluation(bid_id);
CREATE INDEX idx_bid_evaluation_evaluator_id ON tb_bid_evaluation(evaluator_id);
CREATE INDEX idx_bid_evaluation_status ON tb_bid_evaluation(status);

-- GIN index for JSONB field
CREATE INDEX idx_bid_evaluation_data ON tb_bid_evaluation USING GIN (evaluation_data);
```

**Application-Level Constraints**:
- One evaluation per evaluator per bid (enforced by unique constraint)
- Cannot evaluate bid before bid submission deadline
- All evaluation criteria must be scored before marking as completed
- Total score must be calculated from criterion scores with weights
- Justification required for AWARD or REJECT recommendations (minimum 50 characters)

#### tb_rfq_award

**SQL Constraints**:
```sql
CREATE TABLE tb_rfq_award (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES tb_rfq_campaign(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES tb_rfq_bid(id) ON DELETE CASCADE,

  award_data JSONB NOT NULL,

  total_value DECIMAL(15,2) NOT NULL CHECK (total_value > 0),
  currency CHAR(3) NOT NULL,

  justification TEXT NOT NULL,
  contract_terms TEXT NOT NULL,

  status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'AWARDED')) DEFAULT 'PENDING_APPROVAL',

  awarded_at TIMESTAMP,
  approved_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  awarded_by UUID NOT NULL REFERENCES tb_user(id),
  approved_by UUID REFERENCES tb_user(id),

  CONSTRAINT chk_award_dates CHECK (
    (approved_at IS NULL OR approved_at >= created_at) AND
    (awarded_at IS NULL OR awarded_at >= approved_at)
  ),
  CONSTRAINT chk_award_approved CHECK (
    (status = 'APPROVED' AND approved_at IS NOT NULL AND approved_by IS NOT NULL) OR
    (status = 'AWARDED' AND awarded_at IS NOT NULL) OR
    (status IN ('PENDING_APPROVAL', 'REJECTED'))
  )
);

-- Indexes
CREATE INDEX idx_rfq_award_rfq_id ON tb_rfq_award(rfq_id);
CREATE INDEX idx_rfq_award_bid_id ON tb_rfq_award(bid_id);
CREATE INDEX idx_rfq_award_status ON tb_rfq_award(status);
CREATE INDEX idx_rfq_award_awarded_by ON tb_rfq_award(awarded_by);

-- GIN index for JSONB field
CREATE INDEX idx_rfq_award_data ON tb_rfq_award USING GIN (award_data);
```

**Application-Level Constraints**:
- Can only award to evaluated bids
- Total award value must match bid total (within tolerance)
- Approval required for awards above thresholds (<$50K: Procurement, $50K-$500K: Finance, >$500K: Executive)
- Justification required (minimum 50 characters)
- Contract terms required (minimum 20 characters)
- Cannot have multiple awards for same RFQ unless split awards allowed

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Error Code | Error Message | User Action |
|------------|---------------|-------------|
| ERR-RFQ-001 | RFQ title is required | Provide a title for the RFQ |
| ERR-RFQ-002 | RFQ title must be 5-200 characters | Adjust title length |
| ERR-RFQ-003 | Bid period must be at least 7 business days | Extend bid close date |
| ERR-RFQ-004 | Competitive RFQ requires at least 3 vendors | Select additional vendors |
| ERR-RFQ-005 | Evaluation criteria weights must sum to 100% | Adjust criterion weights |
| ERR-RFQ-006 | Only approved or preferred vendors can receive RFQs | Select different vendors or approve vendors first |
| ERR-RFQ-007 | Bid submission deadline has passed | Contact procurement team |
| ERR-RFQ-008 | Price is required for all required line items | Complete all required pricing fields |
| ERR-RFQ-009 | Cannot modify bid after submission deadline | Contact procurement team if urgent |
| ERR-RFQ-010 | Deviations must be documented for non-compliant bids | Provide deviation details and justifications |
| ERR-RFQ-011 | All evaluation criteria must be scored | Complete all criterion scores |
| ERR-RFQ-012 | Justification required for AWARD or REJECT recommendations | Provide detailed justification |
| ERR-RFQ-013 | Cannot award to a bid that has not been evaluated | Complete evaluation first |
| ERR-RFQ-014 | Award requires {approval_level} approval | Submit for approval |
| ERR-RFQ-015 | Contract total value must match awarded bid total | Verify contract amounts |

### 6.2 Technical Error Messages

| Error Code | Technical Message | Log Level |
|------------|-------------------|-----------|
| ERR-RFQ-DB-001 | Database constraint violation: {constraint_name} | ERROR |
| ERR-RFQ-DB-002 | Foreign key violation: {table}.{column} | ERROR |
| ERR-RFQ-DB-003 | Unique constraint violation: {field} | ERROR |
| ERR-RFQ-VAL-001 | Zod validation failed: {error_details} | WARN |
| ERR-RFQ-BIZ-001 | Business rule violation: {rule_id} | WARN |
| ERR-RFQ-BIZ-002 | Approval workflow violation: {details} | WARN |
| ERR-RFQ-AUTH-001 | Insufficient permissions: {required_permission} | WARN |
| ERR-RFQ-SYS-001 | System error during {operation}: {error_message} | ERROR |

---

## 7. Validation Testing Matrix

### 7.1 Field Validation Tests

| Test ID | Field | Test Case | Expected Result | Status |
|---------|-------|-----------|-----------------|--------|
| VT-001 | title | Empty string | Validation error: "RFQ title is required" | ✅ |
| VT-002 | title | "ABC" (3 chars) | Validation error: "RFQ title must be at least 5 characters" | ✅ |
| VT-003 | title | Valid title (50 chars) | Validation passes | ✅ |
| VT-004 | title | Title with 201 chars | Validation error: "RFQ title must not exceed 200 characters" | ✅ |
| VT-005 | description | Optional empty | Validation passes | ✅ |
| VT-006 | description | "Short" (5 chars) | Validation error: "Description must be at least 20 characters" | ✅ |
| VT-007 | description | Contains `<script>` tag | Validation error: "Description cannot contain script tags" | ✅ |
| VT-008 | bidOpenDate | Date in past | Validation error: "Bid open date cannot be in the past" | ✅ |
| VT-009 | bidCloseDate | Before bid open date | Validation error: "Bid close date must be after bid open date" | ✅ |
| VT-010 | bidCloseDate | 5 days after open date | Validation error: "Bid period must be at least 7 business days" | ✅ |
| VT-011 | bidCloseDate | 10 days after open date | Validation passes | ✅ |
| VT-012 | quantity | Negative number | Validation error: "Quantity must be a positive number" | ✅ |
| VT-013 | quantity | 0.0001 (4 decimals) | Validation error: "Quantity must have at most 3 decimal places" | ✅ |
| VT-014 | quantity | 1.5 | Validation passes | ✅ |
| VT-015 | weight | 50.5 (single criterion) | Validation error: "Total weights must equal 100%" | ✅ |
| VT-016 | weight | Multiple criteria totaling 100 | Validation passes | ✅ |
| VT-017 | selectedVendors | 2 vendors | Validation error: "Competitive RFQ requires at least 3 vendors" | ✅ |
| VT-018 | selectedVendors | 5 vendors with 1 duplicate | Validation error: "Duplicate vendors detected" | ✅ |
| VT-019 | unitPrice | 0 | Validation error: "Price must be a positive number" | ✅ |
| VT-020 | unitPrice | 100.12345 (5 decimals) | Validation error: "Price must have at most 4 decimal places" | ✅ |
| VT-021 | currency | "US" (2 chars) | Validation error: "Currency code must be exactly 3 characters" | ✅ |
| VT-022 | currency | "usd" (lowercase) | Validation error: "Currency code must be uppercase letters" | ✅ |
| VT-023 | currency | "XYZ" (unsupported) | Validation error: "Currency not supported" | ✅ |

### 7.2 Business Rule Tests

| Test ID | Business Rule | Test Scenario | Expected Result | Status |
|---------|---------------|---------------|-----------------|--------|
| BR-T-001 | BR-RFQ-001 | Create competitive RFQ with 2 vendors | Validation error: "Competitive RFQ requires at least 3 vendors" | ✅ |
| BR-T-002 | BR-RFQ-002 | Set bid period to 5 days | Validation error: "Bid period must be at least 7 business days" | ✅ |
| BR-T-003 | BR-RFQ-003 | Non-evaluator tries to view bid details during open period | Access denied: "Bid details are confidential" | ✅ |
| BR-T-004 | BR-RFQ-004 | Criteria weights sum to 95% | Validation error: "Evaluation criteria weights must sum to 100%" | ✅ |
| BR-T-005 | BR-RFQ-005 | User without authority tries to approve $75K RFQ | Validation error: "RFQ value requires FINANCIAL_MANAGER approval" | ✅ |
| BR-T-006 | BR-RFQ-006 | Create RFQ with 0 line items | Validation error: "RFQ must contain at least one line item" | ✅ |
| BR-T-007 | BR-RFQ-007 | Create RFQ with no evaluation criteria | Validation error: "RFQ must have at least one evaluation criterion" | ✅ |
| BR-T-008 | BR-RFQ-008 | Invite vendor with status "pending" | Validation error: "Only approved or preferred vendors can receive RFQs" | ✅ |
| BR-T-009 | BR-RFQ-009 | Invite same vendor twice to same RFQ | Validation error: "Vendor already invited to this RFQ" | ✅ |
| BR-T-010 | BR-RFQ-010 | Invite vendor without matching category | Warning: "Vendor does not have matching category" (allowed) | ✅ |
| BR-T-011 | BR-RFQ-011 | Submit bid 1 day after deadline | Validation error: "Bid submission deadline has passed" | ✅ |
| BR-T-012 | BR-RFQ-012 | Submit bid with 2 of 5 required items priced | Validation error: "Missing pricing for 3 required items" | ✅ |
| BR-T-013 | BR-RFQ-013 | Modify bid 1 day after deadline | Validation error: "Cannot modify bid after submission deadline" | ✅ |
| BR-T-014 | BR-RFQ-014 | Submit non-compliant bid without deviations | Validation error: "Deviations must be documented" | ✅ |
| BR-T-015 | BR-RFQ-015 | Submit bid with validity period of 45 days | Validation error: "Bid validity period must be at least 60 days" | ✅ |
| BR-T-016 | BR-RFQ-016 | Finalize evaluation with 2 of 5 criteria unscored | Validation error: "3 criteria have not been scored" | ✅ |
| BR-T-017 | BR-RFQ-017 | Reject bid with 10-char justification | Validation error: "Disqualification requires detailed justification" | ✅ |
| BR-T-018 | BR-RFQ-018 | Price criterion is auto-calculated | Price score matches formula | ✅ |
| BR-T-019 | BR-RFQ-019 | Multi-evaluator with 40% score discrepancy | Warning: "Significant score discrepancy" | ✅ |
| BR-T-020 | BR-RFQ-020 | Award to bid without evaluation | Validation error: "Cannot award to bid that has not been evaluated" | ✅ |
| BR-T-021 | BR-RFQ-021 | Award $100K without Finance approval | Validation error: "Award requires FINANCIAL_MANAGER approval" | ✅ |
| BR-T-022 | BR-RFQ-022 | Create second award for same RFQ (no split awards) | Validation error: "RFQ already has an award" | ✅ |
| BR-T-023 | BR-RFQ-023 | Finalize award | System sends notifications to all vendors | ✅ |
| BR-T-024 | BR-RFQ-024 | Generate contract without award | Validation error: "Cannot generate contract without approved award" | ✅ |
| BR-T-025 | BR-RFQ-025 | Contract value differs from bid total | Validation error: "Contract total value must match awarded bid total" | ✅ |

### 7.3 Integration Tests

| Test ID | Integration Point | Test Scenario | Expected Result | Status |
|---------|-------------------|---------------|-----------------|--------|
| IT-001 | Vendor Directory | Invite vendor to RFQ | Vendor receives notification and can access RFQ | ✅ |
| IT-002 | User Management | Check approval authority | Correct approval level determined based on user role | ✅ |
| IT-003 | Product Catalog | Add line item from catalog | Product details auto-populated | ✅ |
| IT-004 | Email Service | Send invitation | Email delivered to vendor contact | ✅ |
| IT-005 | File Storage | Upload attachment | File stored and URL returned | ✅ |
| IT-006 | Purchase Orders | Convert award to PO | PO created with correct data from RFQ and bid | ✅ |
| IT-007 | Price Lists | Update price list from awarded bid | Price list updated with new prices | ✅ |
| IT-008 | Vendor Performance | Record performance after RFQ close | Performance metrics updated | ✅ |
| IT-009 | Contract Management | Generate contract from award | Contract created with correct terms and pricing | ✅ |
| IT-010 | Notification Service | Send automatic reminders | Reminders sent 3 days before deadline | ✅ |

---

## 8. Summary

This validation document comprehensively defines all validation rules for the Requests for Pricing (RFQ) module, including:

- **Field-level validations**: Detailed validation rules for all input fields across RFQ creation, bid submission, evaluation, award, and negotiation processes
- **Business rule validations**: 25 business rules (BR-RFQ-001 through BR-RFQ-025) enforcing procurement best practices, regulatory compliance, and organizational policies
- **Complete Zod schemas**: Production-ready TypeScript validation schemas for all major operations
- **Database constraints**: SQL constraints and application-level data integrity rules
- **Error messages**: User-friendly and technical error messages for all validation failures
- **Validation testing matrix**: Comprehensive test cases covering 80+ validation scenarios

The validation rules ensure:
- Data integrity throughout the RFQ lifecycle
- Compliance with procurement regulations and best practices
- Fair and transparent competitive bidding processes
- Proper approval workflows based on value thresholds
- Bid confidentiality until evaluation
- Complete documentation and audit trails

All validations work together to create a robust, secure, and compliant RFQ management system that protects organizational interests while providing a transparent process for vendors.
