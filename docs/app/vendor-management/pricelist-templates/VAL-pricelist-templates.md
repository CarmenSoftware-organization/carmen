# Pricelist Templates - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Pricelist Templates module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and API validation specifications.

The Pricelist Templates module enables organizations to create standardized pricing request templates with comprehensive validation to ensure data integrity and business rule compliance.

---

## 2. Field-Level Validations

### 2.1 Template Basic Information

#### Template Name
**Field**: `name` (stored in `tb_pricelist_template.name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Template name is required" |
| Length | 3-200 characters | "Template name must be 3-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Template name contains invalid characters" |
| Unique | Must be unique across active templates | "Template name already exists. Please use a unique name." |

**Zod Schema**:
```typescript
name: z.string()
  .min(3, 'Template name must be at least 3 characters')
  .max(200, 'Template name must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Template name contains invalid characters')
  .refine(async (name) => {
    const existing = await prisma.pricelistTemplate.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    return !existing;
  }, 'Template name already exists')
```

#### Template Code
**Field**: `code` (stored in `tb_pricelist_template.code`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Template code is required" |
| Unique | Must be unique across all templates | "Template code already exists" |
| Format | Alphanumeric with hyphens, 3-50 characters | "Template code must be 3-50 characters (letters, numbers, hyphens only)" |
| Pattern | Matches: `^PLT-[A-Z0-9-]+$` | "Template code must start with 'PLT-' followed by uppercase letters, numbers, and hyphens" |
| Auto-generation | Auto-generated if not provided | N/A |

**Zod Schema**:
```typescript
code: z.string()
  .min(3, 'Template code must be at least 3 characters')
  .max(50, 'Template code must not exceed 50 characters')
  .regex(/^PLT-[A-Z0-9-]+$/, 'Template code must start with PLT- followed by uppercase letters, numbers, and hyphens')
  .refine(async (code) => {
    const existing = await prisma.pricelistTemplate.findFirst({
      where: { code, deletedAt: null },
    });
    return !existing;
  }, 'Template code already exists')
```

#### Description
**Field**: `description` (stored in `tb_pricelist_template.description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 2000 characters | "Description must not exceed 2000 characters" |
| Format | Plain text, no HTML | "Description cannot contain HTML tags" |

**Zod Schema**:
```typescript
description: z.string()
  .max(2000, 'Description must not exceed 2000 characters')
  .refine((text) => !/<[^>]*>/.test(text), 'Description cannot contain HTML tags')
  .optional()
  .or(z.literal(''))
```

#### Category
**Field**: `category` (stored in `tb_pricelist_template.category`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a category | "Template category is required" |
| Valid | Must be one of predefined categories | "Invalid category selected" |
| Length | Max 100 characters | "Category must not exceed 100 characters" |

**Zod Schema**:
```typescript
category: z.string()
  .min(1, 'Template category is required')
  .max(100, 'Category must not exceed 100 characters')
```

#### Effective Date Range
**Field**: `effectiveFrom`, `effectiveTo` (stored in `tb_pricelist_template`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required (From) | Must provide start date | "Effective start date is required" |
| Optional (To) | Can be empty for indefinite | N/A |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | End date must be after start date | "Effective end date must be after start date" |
| Range | Start date cannot be more than 1 year in past | "Effective start date cannot be more than 1 year in the past" |

**Zod Schema**:
```typescript
effectiveFrom: z.coerce.date()
  .refine((date) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date >= oneYearAgo;
  }, 'Effective start date cannot be more than 1 year in the past'),

effectiveTo: z.coerce.date()
  .optional()
  .refine((endDate, ctx) => {
    if (!endDate) return true;
    const startDate = ctx.parent.effectiveFrom;
    return endDate > startDate;
  }, 'Effective end date must be after start date')
```

### 2.2 Product Assignment Validations

#### Product ID
**Field**: `productId` (stored in template `structure.products[].productId`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Product ID is required" |
| Format | Valid UUID | "Invalid product ID format" |
| Exists | Must exist in product catalog | "Product does not exist in catalog" |
| Duplicate | Cannot add same product twice | "Product already added to template" |

**Zod Schema**:
```typescript
productId: z.string()
  .uuid('Invalid product ID format')
  .refine(async (id) => {
    const product = await prisma.tb_product.findUnique({
      where: { id, deleted_at: null },
    });
    return !!product;
  }, 'Product does not exist in catalog')
```

#### Unit of Measure (UOM)
**Field**: `uom` (stored in template `structure.products[].specifications.uom`)

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

#### Pack Size
**Field**: `packSize` (stored in template `structure.products[].specifications.packSize`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide pack size | "Pack size is required" |
| Type | Must be positive number | "Pack size must be a positive number" |
| Range | 0.001 to 999,999 | "Pack size must be between 0.001 and 999,999" |
| Precision | Max 3 decimal places | "Pack size must have at most 3 decimal places" |

**Zod Schema**:
```typescript
packSize: z.number()
  .positive('Pack size must be a positive number')
  .min(0.001, 'Pack size must be at least 0.001')
  .max(999999, 'Pack size must not exceed 999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 3;
  }, 'Pack size must have at most 3 decimal places')
```

#### Minimum Order Quantity (MOQ)
**Field**: `moq` (stored in template `structure.products[].specifications.moq`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide MOQ | "Minimum order quantity is required" |
| Type | Must be positive integer | "MOQ must be a positive whole number" |
| Range | 1 to 1,000,000 | "MOQ must be between 1 and 1,000,000" |

**Zod Schema**:
```typescript
moq: z.number()
  .int('MOQ must be a whole number')
  .positive('MOQ must be a positive number')
  .min(1, 'MOQ must be at least 1')
  .max(1000000, 'MOQ must not exceed 1,000,000')
```

#### Expected Delivery Days
**Field**: `expectedDeliveryDays` (stored in template `structure.products[].specifications.expectedDeliveryDays`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide delivery days | "Expected delivery days is required" |
| Type | Must be positive integer | "Delivery days must be a positive whole number" |
| Range | 1 to 365 days | "Delivery days must be between 1 and 365" |

**Zod Schema**:
```typescript
expectedDeliveryDays: z.number()
  .int('Delivery days must be a whole number')
  .positive('Delivery days must be a positive number')
  .min(1, 'Delivery days must be at least 1')
  .max(365, 'Delivery days must not exceed 365')
```

#### Product Sequence
**Field**: `sequence` (stored in template `structure.products[].sequence`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide sequence | "Product sequence is required" |
| Type | Must be positive integer | "Sequence must be a positive whole number" |
| Range | 1 to 1,000 | "Sequence must be between 1 and 1,000" |
| Unique | No duplicate sequences in template | "Sequence number already used" |

**Zod Schema**:
```typescript
sequence: z.number()
  .int('Sequence must be a whole number')
  .positive('Sequence must be a positive number')
  .min(1, 'Sequence must be at least 1')
  .max(1000, 'Sequence must not exceed 1,000')
```

### 2.3 Pricing Structure Validations

#### Pricing Column Name
**Field**: `name` (stored in template `structure.pricingStructure.columns[].name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Column name is required" |
| Length | 3-100 characters | "Column name must be 3-100 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Column name contains invalid characters" |
| Unique | No duplicate column names | "Column name already exists in this template" |

**Zod Schema**:
```typescript
name: z.string()
  .min(3, 'Column name must be at least 3 characters')
  .max(100, 'Column name must not exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\/]+$/, 'Column name contains invalid characters')
```

#### Pricing Column Type
**Field**: `type` (stored in template `structure.pricingStructure.columns[].type`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select column type | "Column type is required" |
| Valid | Must be one of predefined types | "Invalid column type selected" |

**Zod Schema**:
```typescript
type: z.enum([
  'unit_price',
  'case_price',
  'bulk_price',
  'promotional_price',
], {
  errorMap: () => ({ message: 'Invalid column type selected' }),
})
```

#### Currency Code
**Field**: `primaryCurrency` (stored in template `structure.pricingStructure.currency.primaryCurrency`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Valid | Must exist in supported currencies | "Currency not supported" |

**Zod Schema**:
```typescript
primaryCurrency: z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
  .refine((code) => {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'MYR'];
    return supportedCurrencies.includes(code);
  }, 'Currency not supported')
  .default('USD')
```

#### Price Tolerance
**Field**: `minPercentage`, `maxPercentage` (stored in template `structure.pricingStructure.priceTolerance`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide tolerance range | "Price tolerance is required" |
| Type | Must be number | "Tolerance must be a number" |
| Range | -100 to 1000 percent | "Tolerance must be between -100% and 1000%" |
| Consistency | Max must be >= Min | "Maximum tolerance must be greater than or equal to minimum tolerance" |
| Precision | Max 2 decimal places | "Tolerance must have at most 2 decimal places" |

**Zod Schema**:
```typescript
priceTolerance: z.object({
  minPercentage: z.number()
    .min(-100, 'Minimum tolerance must be at least -100%')
    .max(1000, 'Minimum tolerance must not exceed 1000%')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Tolerance must have at most 2 decimal places'),

  maxPercentage: z.number()
    .min(-100, 'Maximum tolerance must be at least -100%')
    .max(1000, 'Maximum tolerance must not exceed 1000%')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Tolerance must have at most 2 decimal places'),
}).refine((data) => data.maxPercentage >= data.minPercentage, {
  message: 'Maximum tolerance must be greater than or equal to minimum tolerance',
  path: ['maxPercentage'],
})
```

### 2.4 Distribution Validations

#### Submission Deadline
**Field**: `submissionDeadline` (stored in `tb_template_distribution.submissionDeadline`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide deadline date | "Submission deadline is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Must be at least 5 business days from today | "Deadline must be at least 5 business days from today" |
| Range | Cannot be more than 1 year in future | "Deadline cannot be more than 1 year in the future" |

**Zod Schema**:
```typescript
submissionDeadline: z.coerce.date()
  .refine((date) => {
    const fiveBusinessDays = addBusinessDays(new Date(), 5);
    return date >= fiveBusinessDays;
  }, 'Deadline must be at least 5 business days from today')
  .refine((date) => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return date <= oneYearFromNow;
  }, 'Deadline cannot be more than 1 year in the future')
```

#### Vendor Selection
**Field**: `vendorId` (stored in `tb_template_distribution.vendorId`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select at least one vendor | "At least one vendor is required for distribution" |
| Format | Valid UUID | "Invalid vendor ID format" |
| Exists | Must exist in vendor directory | "Vendor does not exist" |
| Status | Vendor must be approved or preferred | "Only approved or preferred vendors can receive templates" |
| Duplicate | Cannot distribute to same vendor twice | "Vendor already selected for distribution" |

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
  }, 'Only approved or preferred vendors can receive templates')
```

### 2.5 Vendor Submission Validations

#### Price Value
**Field**: Price values (stored in `tb_template_distribution.submissionData`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide price for required columns | "Price is required for this column" |
| Type | Must be positive number | "Price must be a positive number" |
| Range | 0.01 to 999,999,999 | "Price must be between 0.01 and 999,999,999" |
| Precision | Max 4 decimal places | "Price must have at most 4 decimal places" |
| Tolerance | Within acceptable tolerance if comparing | "Price outside acceptable tolerance range" |

**Zod Schema**:
```typescript
price: z.number()
  .positive('Price must be a positive number')
  .min(0.01, 'Price must be at least 0.01')
  .max(999999999, 'Price must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 4;
  }, 'Price must have at most 4 decimal places')
```

#### Lead Time
**Field**: `leadTimeDays` (stored in vendor submission data)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer if provided | "Lead time must be a positive whole number" |
| Range | 1 to 365 days | "Lead time must be between 1 and 365 days" |

**Zod Schema**:
```typescript
leadTimeDays: z.number()
  .int('Lead time must be a whole number')
  .positive('Lead time must be a positive number')
  .min(1, 'Lead time must be at least 1 day')
  .max(365, 'Lead time must not exceed 365 days')
  .optional()
```

---

## 3. Business Rule Validations

### 3.1 Template Creation Rules

#### BR-VAL-001: Minimum Product Requirement
**Rule**: Templates must contain at least one product before approval or distribution.

**Validation**: Before approval/distribution, check:
```typescript
const productCount = template.structure.products?.length || 0;

if (productCount === 0) {
  throw new ValidationError('Template must contain at least one product');
}
```

**Error Message**: "Template must contain at least one product before it can be approved or distributed."

#### BR-VAL-002: Minimum Pricing Column Requirement
**Rule**: Templates must have at least one required pricing column.

**Validation**:
```typescript
const requiredColumns = template.structure.pricingStructure.columns.filter(
  (col) => col.isRequired
);

if (requiredColumns.length === 0) {
  throw new ValidationError('Template must have at least one required pricing column');
}
```

**Error Message**: "At least one pricing column must be marked as required."

#### BR-VAL-003: Effective Date Overlap Prevention
**Rule**: Cannot have multiple active templates with same category and overlapping effective dates.

**Validation**:
```typescript
const overlappingTemplates = await prisma.pricelistTemplate.findMany({
  where: {
    category: templateData.category,
    status: { in: ['APPROVED', 'DISTRIBUTED', 'ACTIVE'] },
    deletedAt: null,
    ...(isUpdate && { NOT: { id: templateId } }),
    OR: [
      {
        AND: [
          { effectiveFrom: { lte: templateData.effectiveFrom } },
          { effectiveTo: { gte: templateData.effectiveFrom } },
        ],
      },
      {
        AND: [
          { effectiveFrom: { lte: templateData.effectiveTo } },
          { effectiveTo: { gte: templateData.effectiveTo } },
        ],
      },
    ],
  },
});

if (overlappingTemplates.length > 0) {
  throw new ValidationError('Template effective dates overlap with existing active template');
}
```

**Error Message**: "Template effective dates overlap with an existing active template in the same category. Please adjust the dates."

### 3.2 Distribution Rules

#### BR-VAL-004: Template Status for Distribution
**Rule**: Only approved templates can be distributed to vendors.

**Validation**:
```typescript
const template = await prisma.pricelistTemplate.findUnique({
  where: { id: templateId },
});

if (template.status !== 'APPROVED') {
  throw new ValidationError('Only approved templates can be distributed');
}
```

**Error Message**: "Only approved templates can be distributed. Please submit this template for approval first."

#### BR-VAL-005: Duplicate Distribution Prevention
**Rule**: Cannot distribute same template to same vendor with overlapping deadlines.

**Validation**:
```typescript
const existingDistribution = await prisma.templateDistribution.findFirst({
  where: {
    templateId,
    vendorId,
    status: { in: ['SENT', 'VIEWED', 'IN_PROGRESS'] },
    submissionDeadline: { gte: new Date() },
  },
});

if (existingDistribution) {
  throw new ValidationError('Active distribution already exists for this vendor');
}
```

**Error Message**: "An active distribution already exists for this vendor. Please wait for completion or cancel the existing distribution."

#### BR-VAL-006: Vendor Count Limit
**Rule**: Maximum 500 vendors per distribution batch.

**Validation**:
```typescript
if (selectedVendors.length > 500) {
  throw new ValidationError('Maximum 500 vendors per distribution batch');
}
```

**Error Message**: "You can distribute to a maximum of 500 vendors at once. Please create multiple distribution batches."

### 3.3 Version Control Rules

#### BR-VAL-007: Version Number Format
**Rule**: Version numbers must follow semantic versioning (Major.Minor).

**Validation**:
```typescript
const versionPattern = /^\d+\.\d+$/;

if (!versionPattern.test(versionNumber)) {
  throw new ValidationError('Version number must follow format: Major.Minor (e.g., 1.0, 2.3)');
}
```

**Error Message**: "Version number must follow format: Major.Minor (e.g., 1.0, 2.3)"

#### BR-VAL-008: Version Increment Logic
**Rule**: Version numbers must increment correctly based on change type.

**Validation**:
```typescript
const [currentMajor, currentMinor] = currentVersion.split('.').map(Number);
const [newMajor, newMinor] = newVersion.split('.').map(Number);

const isMajorChange = hasProductChanges || hasPricingStructureChange;

if (isMajorChange) {
  // Expect major increment
  if (newMajor !== currentMajor + 1 || newMinor !== 0) {
    throw new ValidationError('Major changes require major version increment');
  }
} else {
  // Expect minor increment
  if (newMajor !== currentMajor || newMinor !== currentMinor + 1) {
    throw new ValidationError('Minor changes require minor version increment');
  }
}
```

**Error Message**: "Version increment does not match change type. Major changes require major version increment (e.g., 1.0 → 2.0), minor changes require minor increment (e.g., 1.0 → 1.1)."

### 3.4 Submission Rules

#### BR-VAL-009: Complete Submission Requirement
**Rule**: All required pricing columns must have values for all products.

**Validation**:
```typescript
const requiredColumns = template.structure.pricingStructure.columns
  .filter((col) => col.isRequired)
  .map((col) => col.id);

for (const product of submissionData.products) {
  for (const colId of requiredColumns) {
    if (!product.prices[colId]) {
      throw new ValidationError(`Missing required price for ${product.productName}`);
    }
  }
}
```

**Error Message**: "All required pricing columns must be completed for all products. Missing price for: [product name]."

#### BR-VAL-010: Submission Deadline Enforcement
**Rule**: Cannot submit after deadline has passed.

**Validation**:
```typescript
const distribution = await prisma.templateDistribution.findUnique({
  where: { id: distributionId },
});

if (new Date() > distribution.submissionDeadline) {
  throw new ValidationError('Submission deadline has passed');
}
```

**Error Message**: "The submission deadline has passed. Please contact the procurement team to request an extension."

### 3.5 Approval Rules

#### BR-VAL-011: Self-Approval Prevention
**Rule**: Users cannot approve their own template submissions.

**Validation**:
```typescript
const template = await prisma.pricelistTemplate.findUnique({
  where: { id: templateId },
});

if (template.createdBy === currentUserId) {
  throw new ValidationError('You cannot approve your own template submission');
}
```

**Error Message**: "You cannot approve your own template submission. Please assign to another approver."

#### BR-VAL-012: Approval Authority
**Rule**: High-value templates (>$500K estimated value) require executive approval.

**Validation**:
```typescript
const estimatedValue = calculateTemplateEstimatedValue(template);
const requiresExecutive = estimatedValue > 500000;

if (requiresExecutive && !hasExecutiveApproval) {
  throw new ValidationError('Templates with estimated value > $500,000 require executive approval');
}
```

**Error Message**: "This high-value template requires executive approval. Routing to executive approval stage."

### 3.6 Archival Rules

#### BR-VAL-013: Archive with Active Distributions
**Rule**: Cannot archive template if active distributions exist (unless forced with manager approval).

**Validation**:
```typescript
const activeDistributions = await prisma.templateDistribution.count({
  where: {
    templateId,
    status: { in: ['SENT', 'VIEWED', 'IN_PROGRESS'] },
  },
});

if (activeDistributions > 0 && !forceArchive) {
  throw new ValidationError(
    `Cannot archive template with ${activeDistributions} active distributions`
  );
}
```

**Error Message**: "Cannot archive template with [X] active distributions. You can force archive with manager approval, or wait for distributions to complete."

---

## 4. Complete Zod Schemas

### 4.1 Template Schema

```typescript
// lib/schemas/template.schema.ts

import { z } from 'zod';
import { addBusinessDays } from 'date-fns';

export const templateSchema = z.object({
  // Basic Information
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(200, 'Template name must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Template name contains invalid characters'),

  code: z.string()
    .min(3, 'Template code must be at least 3 characters')
    .max(50, 'Template code must not exceed 50 characters')
    .regex(/^PLT-[A-Z0-9-]+$/, 'Template code must start with PLT- followed by uppercase letters, numbers, and hyphens')
    .optional(), // Auto-generated if not provided

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), 'Description cannot contain HTML tags')
    .optional()
    .or(z.literal('')),

  category: z.string()
    .min(1, 'Template category is required')
    .max(100, 'Category must not exceed 100 characters'),

  // Effective Dates
  effectiveFrom: z.coerce.date()
    .refine((date) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return date >= oneYearAgo;
    }, 'Effective start date cannot be more than 1 year in the past'),

  effectiveTo: z.coerce.date()
    .optional()
    .nullable(),

  // Products
  products: z.array(z.object({
    productId: z.string().uuid('Invalid product ID format'),
    productCode: z.string(),
    productName: z.string(),
    category: z.string(),
    sequence: z.number()
      .int('Sequence must be a whole number')
      .positive('Sequence must be a positive number')
      .min(1, 'Sequence must be at least 1')
      .max(1000, 'Sequence must not exceed 1,000'),
    isRequired: z.boolean().default(false),
    specifications: z.object({
      uom: z.string()
        .min(1, 'Unit of measure is required')
        .max(20, 'UOM must not exceed 20 characters'),
      packSize: z.number()
        .positive('Pack size must be a positive number')
        .min(0.001, 'Pack size must be at least 0.001')
        .max(999999, 'Pack size must not exceed 999,999')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 3;
        }, 'Pack size must have at most 3 decimal places'),
      moq: z.number()
        .int('MOQ must be a whole number')
        .positive('MOQ must be a positive number')
        .min(1, 'MOQ must be at least 1')
        .max(1000000, 'MOQ must not exceed 1,000,000'),
      expectedDeliveryDays: z.number()
        .int('Delivery days must be a whole number')
        .positive('Delivery days must be a positive number')
        .min(1, 'Delivery days must be at least 1')
        .max(365, 'Delivery days must not exceed 365'),
    }),
  })).min(1, 'At least one product is required'),

  // Pricing Structure
  pricingStructure: z.object({
    columns: z.array(z.object({
      id: z.string().uuid(),
      name: z.string()
        .min(3, 'Column name must be at least 3 characters')
        .max(100, 'Column name must not exceed 100 characters')
        .regex(/^[a-zA-Z0-9\s\-\.\,\(\)\/]+$/, 'Column name contains invalid characters'),
      type: z.enum([
        'unit_price',
        'case_price',
        'bulk_price',
        'promotional_price',
      ]),
      isRequired: z.boolean().default(false),
    })).min(1, 'At least one pricing column is required'),

    currency: z.object({
      primaryCurrency: z.string()
        .length(3, 'Currency code must be exactly 3 characters')
        .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
        .default('USD'),
      allowMultipleCurrencies: z.boolean().default(false),
      exchangeRateHandling: z.enum(['auto', 'locked', 'manual']).default('auto'),
    }),

    priceTolerance: z.object({
      minPercentage: z.number()
        .min(-100, 'Minimum tolerance must be at least -100%')
        .max(1000, 'Minimum tolerance must not exceed 1000%')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }, 'Tolerance must have at most 2 decimal places'),
      maxPercentage: z.number()
        .min(-100, 'Maximum tolerance must be at least -100%')
        .max(1000, 'Maximum tolerance must not exceed 1000%')
        .refine((val) => {
          const decimalPlaces = (val.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }, 'Tolerance must have at most 2 decimal places'),
    }).refine((data) => data.maxPercentage >= data.minPercentage, {
      message: 'Maximum tolerance must be greater than or equal to minimum tolerance',
      path: ['maxPercentage'],
    }),
  }),

  // Targeting (optional)
  targeting: z.object({
    locations: z.array(z.object({
      locationId: z.string().uuid(),
      locationName: z.string(),
      isIncluded: z.boolean(),
    })).optional(),
    departments: z.array(z.object({
      departmentId: z.string().uuid(),
      departmentName: z.string(),
    })).optional(),
  }).optional(),
});

// Validate template structure before submission
export const validateTemplate = (data: unknown) => {
  return templateSchema.parse(data);
};

export type TemplateFormData = z.infer<typeof templateSchema>;
```

### 4.2 Distribution Schema

```typescript
// lib/schemas/distribution.schema.ts

import { z } from 'zod';
import { addBusinessDays } from 'date-fns';

export const distributionSchema = z.object({
  templateId: z.string()
    .uuid('Invalid template ID format'),

  vendors: z.array(z.object({
    vendorId: z.string()
      .uuid('Invalid vendor ID format'),
    vendorName: z.string(),
  })).min(1, 'At least one vendor is required for distribution')
    .max(500, 'Maximum 500 vendors per distribution batch'),

  submissionDeadline: z.coerce.date()
    .refine((date) => {
      const fiveBusinessDays = addBusinessDays(new Date(), 5);
      return date >= fiveBusinessDays;
    }, 'Deadline must be at least 5 business days from today')
    .refine((date) => {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      return date <= oneYearFromNow;
    }, 'Deadline cannot be more than 1 year in the future'),

  notifications: z.object({
    emailEnabled: z.boolean().default(true),
    portalEnabled: z.boolean().default(true),
    customMessage: z.string()
      .max(1000, 'Custom message must not exceed 1000 characters')
      .optional(),
  }),

  reminders: z.object({
    enabled: z.boolean().default(true),
    sevenDaysBefore: z.boolean().default(true),
    threeDaysBefore: z.boolean().default(true),
    oneDayBefore: z.boolean().default(true),
    dailyAfterOverdue: z.boolean().default(false),
  }),
});

export type DistributionFormData = z.infer<typeof distributionSchema>;
```

### 4.3 Vendor Submission Schema

```typescript
// lib/schemas/submission.schema.ts

import { z } from 'zod';

export const vendorSubmissionSchema = z.object({
  distributionId: z.string()
    .uuid('Invalid distribution ID format'),

  products: z.array(z.object({
    productId: z.string().uuid(),
    prices: z.record(z.string(), z.number()
      .positive('Price must be a positive number')
      .min(0.01, 'Price must be at least 0.01')
      .max(999999999, 'Price must not exceed 999,999,999')
      .refine((val) => {
        const decimalPlaces = (val.toString().split('.')[1] || '').length;
        return decimalPlaces <= 4;
      }, 'Price must have at most 4 decimal places')
    ),
    leadTimeDays: z.number()
      .int('Lead time must be a whole number')
      .positive('Lead time must be a positive number')
      .min(1, 'Lead time must be at least 1 day')
      .max(365, 'Lead time must not exceed 365 days')
      .optional(),
    notes: z.string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  })),

  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileSize: z.number()
      .max(50 * 1024 * 1024, 'File size must not exceed 50MB'),
    fileType: z.string(),
  })).optional(),

  generalNotes: z.string()
    .max(2000, 'General notes must not exceed 2000 characters')
    .optional(),

  contactPerson: z.object({
    name: z.string()
      .min(2, 'Contact name must be at least 2 characters')
      .max(100, 'Contact name must not exceed 100 characters'),
    email: z.string()
      .email('Invalid email address format'),
    phone: z.string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number must not exceed 20 digits')
      .optional(),
  }),
});

export type VendorSubmissionFormData = z.infer<typeof vendorSubmissionSchema>;
```

---

## 5. Database Constraints

### 5.1 PostgreSQL Constraints

```sql
-- Template table constraints
ALTER TABLE tb_pricelist_template
  ADD CONSTRAINT check_name_not_empty CHECK (name <> ''),
  ADD CONSTRAINT check_code_format CHECK (code ~ '^PLT-[A-Z0-9-]{3,50}$'),
  ADD CONSTRAINT check_effective_dates CHECK (
    effective_to IS NULL OR effective_to > effective_from
  ),
  ADD CONSTRAINT check_version_positive CHECK (version > 0);

-- Template distribution constraints
ALTER TABLE tb_template_distribution
  ADD CONSTRAINT check_deadline_future CHECK (submission_deadline > distributed_at),
  ADD CONSTRAINT check_reminders_count CHECK (reminders_sent >= 0);

-- Unique constraints
CREATE UNIQUE INDEX idx_template_code_unique
  ON tb_pricelist_template (code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_template_name_category_unique
  ON tb_pricelist_template (name, category)
  WHERE deleted_at IS NULL;

-- Prevent duplicate active distributions
CREATE UNIQUE INDEX idx_active_distribution_unique
  ON tb_template_distribution (template_id, vendor_id)
  WHERE status IN ('SENT', 'VIEWED', 'IN_PROGRESS') AND deleted_at IS NULL;

-- Check constraints for JSON data
ALTER TABLE tb_pricelist_template
  ADD CONSTRAINT check_min_products CHECK (
    jsonb_array_length(structure->'products') > 0
  ),
  ADD CONSTRAINT check_min_pricing_columns CHECK (
    jsonb_array_length(structure->'pricingStructure'->'columns') > 0
  );

-- Status transition constraints
CREATE OR REPLACE FUNCTION check_template_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Cannot go from APPROVED back to DRAFT without archiving first
  IF OLD.status = 'APPROVED' AND NEW.status = 'DRAFT' THEN
    RAISE EXCEPTION 'Cannot change status from APPROVED to DRAFT';
  END IF;

  -- Cannot distribute non-approved templates
  IF NEW.status = 'DISTRIBUTED' AND OLD.status NOT IN ('APPROVED', 'ACTIVE') THEN
    RAISE EXCEPTION 'Only approved templates can be distributed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_template_status_transition
  BEFORE UPDATE ON tb_pricelist_template
  FOR EACH ROW
  EXECUTE FUNCTION check_template_status_transition();
```

### 5.2 Application-Level Constraints

```typescript
// Before insert/update validations

// Ensure template code is unique
const existingCode = await prisma.pricelistTemplate.findFirst({
  where: {
    code: templateData.code,
    deletedAt: null,
    ...(isUpdate && { NOT: { id: templateId } }),
  },
});

if (existingCode) {
  throw new ConflictError('Template code already exists');
}

// Ensure template name is unique within category
const existingName = await prisma.pricelistTemplate.findFirst({
  where: {
    name: templateData.name,
    category: templateData.category,
    deletedAt: null,
    ...(isUpdate && { NOT: { id: templateId } }),
  },
});

if (existingName) {
  throw new ConflictError('Template name already exists in this category');
}

// Ensure at least one product exists
if (templateData.products.length === 0) {
  throw new ValidationError('Template must contain at least one product');
}

// Ensure at least one required pricing column
const requiredColumns = templateData.pricingStructure.columns.filter(
  (col) => col.isRequired
);

if (requiredColumns.length === 0) {
  throw new ValidationError('At least one pricing column must be marked as required');
}

// Check for effective date overlaps
if (templateData.status === 'APPROVED') {
  const overlapping = await checkEffectiveDateOverlap(
    templateData.category,
    templateData.effectiveFrom,
    templateData.effectiveTo,
    templateId
  );

  if (overlapping) {
    throw new ValidationError('Effective dates overlap with existing active template');
  }
}
```

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Error Code | Technical Message | User Message |
|------------|-------------------|--------------|
| PLT-001 | Template code already exists | This template code is already in use. Please choose a different code. |
| PLT-002 | Template name duplicate | A template with this name already exists in this category. |
| PLT-003 | Missing products | At least one product is required. Please add products to the template. |
| PLT-004 | Missing pricing columns | At least one pricing column is required. Please add pricing columns. |
| PLT-005 | No required pricing column | At least one pricing column must be marked as required. |
| PLT-006 | Effective date overlap | Effective dates overlap with an existing active template. Please adjust the dates. |
| PLT-007 | Template not approved | Only approved templates can be distributed. Please submit for approval first. |
| PLT-008 | Duplicate distribution | An active distribution already exists for this vendor. |
| PLT-009 | Vendor not approved | Only approved or preferred vendors can receive templates. |
| PLT-010 | Deadline too soon | Deadline must be at least 5 business days from today. |
| PLT-011 | Past deadline submission | The submission deadline has passed. Please request an extension. |
| PLT-012 | Incomplete submission | All required pricing columns must be completed for all products. |
| PLT-013 | Self-approval not allowed | You cannot approve your own template submission. |
| PLT-014 | Active distributions exist | Cannot archive template with active distributions. |
| PLT-015 | Invalid version increment | Version increment does not match change type. |
| PLT-016 | Vendor count exceeded | Maximum 500 vendors per distribution batch. |
| PLT-017 | Price out of tolerance | Price is outside the acceptable tolerance range. |
| PLT-018 | Invalid price format | Price must be a positive number with at most 4 decimal places. |
| PLT-019 | High-value approval required | Templates with estimated value > $500,000 require executive approval. |
| PLT-020 | Missing required price | Price is required for this column. |

### 6.2 Technical Error Logs

```typescript
// Error logging format
interface TemplateErrorLog {
  code: string;
  message: string;
  details: Record<string, any>;
  userId: string;
  templateId?: string;
  timestamp: string;
  stackTrace?: string;
}

// Example usage
logger.error({
  code: 'PLT-001',
  message: 'Template code already exists',
  details: {
    templateCode: 'PLT-2024-001',
    existingTemplateId: 'template-uuid',
    category: 'Food & Beverage',
  },
  userId: currentUser.id,
  timestamp: new Date().toISOString(),
});
```

---

## 7. Validation Testing Matrix

### 7.1 Unit Test Cases

| Test Case ID | Validation Rule | Input | Expected Result |
|--------------|-----------------|-------|-----------------|
| UT-PLT-001 | Template code format | "plt-001" | Error: Must be uppercase and start with PLT- |
| UT-PLT-002 | Template code format | "PLT-2024-001" | Success |
| UT-PLT-003 | Template name length | "AB" | Error: Minimum 3 characters |
| UT-PLT-004 | Product count | Empty array | Error: At least one product required |
| UT-PLT-005 | Product count | [product1, product2] | Success |
| UT-PLT-006 | Pricing column count | Empty array | Error: At least one column required |
| UT-PLT-007 | Required column | All optional columns | Error: At least one required column |
| UT-PLT-008 | Pack size precision | 10.12345 | Error: Max 3 decimal places |
| UT-PLT-009 | Pack size | 10.123 | Success |
| UT-PLT-010 | MOQ range | 0 | Error: Must be at least 1 |
| UT-PLT-011 | MOQ range | 50 | Success |
| UT-PLT-012 | Price precision | 123.12345 | Error: Max 4 decimal places |
| UT-PLT-013 | Price precision | 123.1234 | Success |
| UT-PLT-014 | Deadline calculation | Today + 3 days | Error: Minimum 5 business days |
| UT-PLT-015 | Deadline calculation | Today + 7 days | Success |
| UT-PLT-016 | Effective date order | From: 2024-12-31, To: 2024-01-01 | Error: End must be after start |
| UT-PLT-017 | Effective date order | From: 2024-01-01, To: 2024-12-31 | Success |
| UT-PLT-018 | Currency code | "usd" | Error: Must be uppercase |
| UT-PLT-019 | Currency code | "USD" | Success |
| UT-PLT-020 | Tolerance range | Min: 10, Max: 5 | Error: Max must be >= Min |

### 7.2 Integration Test Cases

| Test Case ID | Scenario | Steps | Expected Result |
|--------------|----------|-------|-----------------|
| IT-PLT-001 | Create template with duplicate code | 1. Create template "PLT-001"<br/>2. Try create another "PLT-001" | Error on step 2 |
| IT-PLT-002 | Distribute non-approved template | 1. Create template (Draft)<br/>2. Try to distribute | Error: Not approved |
| IT-PLT-003 | Duplicate distribution | 1. Distribute to Vendor A<br/>2. Try distribute same template to Vendor A | Error: Active distribution exists |
| IT-PLT-004 | Submit after deadline | 1. Create distribution with deadline tomorrow<br/>2. Wait until past deadline<br/>3. Try to submit | Error: Deadline passed |
| IT-PLT-005 | Incomplete submission | 1. Load submission form<br/>2. Fill only 50% of required fields<br/>3. Try to submit | Error: Missing required prices |
| IT-PLT-006 | Self-approval | 1. User A creates template<br/>2. User A tries to approve | Error: Self-approval |
| IT-PLT-007 | Archive with active distributions | 1. Distribute template<br/>2. Try to archive | Warning: Active distributions |
| IT-PLT-008 | Version increment validation | 1. Create version 1.0<br/>2. Make major changes<br/>3. Try to create version 1.1 | Error: Requires major increment |
| IT-PLT-009 | Vendor count limit | 1. Select 501 vendors<br/>2. Try to distribute | Error: Maximum 500 vendors |
| IT-PLT-010 | Effective date overlap | 1. Create template A (Jan-Jun)<br/>2. Try create template B (May-Jul) same category | Error: Date overlap |

### 7.3 Business Rule Test Cases

| Test Case ID | Business Rule | Scenario | Expected Result |
|--------------|---------------|----------|-----------------|
| BR-PLT-001 | BR-VAL-001 | Create template without products | Error: Minimum product requirement |
| BR-PLT-002 | BR-VAL-002 | Create template with no required columns | Error: Required column requirement |
| BR-PLT-003 | BR-VAL-003 | Overlapping effective dates | Error: Date overlap prevention |
| BR-PLT-004 | BR-VAL-004 | Distribute draft template | Error: Status requirement |
| BR-PLT-005 | BR-VAL-005 | Duplicate active distribution | Error: Duplicate prevention |
| BR-PLT-006 | BR-VAL-006 | Exceed vendor count limit | Error: Vendor limit |
| BR-PLT-007 | BR-VAL-007 | Invalid version format | Error: Version format requirement |
| BR-PLT-008 | BR-VAL-008 | Wrong version increment | Error: Version logic |
| BR-PLT-009 | BR-VAL-009 | Missing required prices | Error: Completion requirement |
| BR-PLT-010 | BR-VAL-010 | Late submission | Error: Deadline enforcement |
| BR-PLT-011 | BR-VAL-011 | Creator approves own template | Error: Self-approval prevention |
| BR-PLT-012 | BR-VAL-012 | High-value template approval | Warning: Executive approval required |
| BR-PLT-013 | BR-VAL-013 | Archive with active distributions | Warning: Active distributions exist |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial creation |

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- UC-pricelist-templates.md - Use Cases
- TS-pricelist-templates.md - Technical Specification
- FD-pricelist-templates.md - Flow Diagrams
- VENDOR-MANAGEMENT-OVERVIEW.md - Module Overview

---

**End of Validations Document**
