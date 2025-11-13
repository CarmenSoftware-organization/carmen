# Vendor Directory - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Vendor Directory module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and API validation specifications.

---

## 2. Field-Level Validations

### 2.1 Vendor Basic Information

#### Vendor Code
**Field**: `vendorCode` (stored in `tb_vendor.info['profile']['vendorCode']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Vendor code is required" |
| Unique | Must be unique across active vendors | "Vendor code already exists. Please use a unique code." |
| Format | Alphanumeric with hyphens, 3-20 characters | "Vendor code must be 3-20 characters (letters, numbers, hyphens only)" |
| Pattern | Matches: `^[A-Z0-9-]+$` | "Vendor code must contain only uppercase letters, numbers, and hyphens" |

**Zod Schema**:
```typescript
vendorCode: z.string()
  .min(3, 'Vendor code must be at least 3 characters')
  .max(20, 'Vendor code must not exceed 20 characters')
  .regex(/^[A-Z0-9-]+$/, 'Vendor code must contain only uppercase letters, numbers, and hyphens')
  .refine(async (code) => {
    // Check uniqueness in database
    const existing = await prisma.tb_vendor.findFirst({
      where: {
        info: {
          path: ['profile', 'vendorCode'],
          equals: code,
        },
        deleted_at: null,
      },
    });
    return !existing;
  }, 'Vendor code already exists')
```

#### Company Name
**Field**: `name` (stored in `tb_vendor.name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Company name is required" |
| Length | 2-200 characters | "Company name must be 2-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Company name contains invalid characters" |
| Unique | Warn if duplicate within active vendors | "A vendor with this name already exists. Continue anyway?" |

**Zod Schema**:
```typescript
name: z.string()
  .min(2, 'Company name must be at least 2 characters')
  .max(200, 'Company name must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters')
```

#### Legal Name
**Field**: `legalName` (stored in `tb_vendor.info['profile']['legalName']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | 2-200 characters if provided | "Legal name must be 2-200 characters" |
| Format | Letters, numbers, spaces, and legal entity suffixes | "Legal name contains invalid characters" |

**Zod Schema**:
```typescript
legalName: z.string()
  .min(2, 'Legal name must be at least 2 characters')
  .max(200, 'Legal name must not exceed 200 characters')
  .optional()
  .or(z.literal(''))
```

#### Website
**Field**: `website` (stored in `tb_vendor.info['profile']['website']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid URL format | "Invalid website URL. Must start with http:// or https://" |
| Protocol | Must include http:// or https:// | "Website URL must include protocol (http:// or https://)" |
| Length | Max 500 characters | "Website URL must not exceed 500 characters" |

**Zod Schema**:
```typescript
website: z.string()
  .url('Invalid website URL')
  .max(500, 'Website URL must not exceed 500 characters')
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'Website URL must start with http:// or https://',
  })
  .optional()
  .or(z.literal(''))
```

#### Description
**Field**: `description` (stored in `tb_vendor.description`)

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
```

#### Business Type
**Field**: `business_type_id` (stored in `tb_vendor.business_type_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a type | "Business type is required" |
| Valid | Must exist in business types list | "Invalid business type selected" |

**Zod Schema**:
```typescript
business_type_id: z.string()
  .min(1, 'Business type is required')
  .uuid('Invalid business type ID')
```

### 2.2 Contact Information

#### Contact Name
**Field**: `fullName` (stored in `tb_vendor_contact.info['fullName']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Contact name is required" |
| Length | 2-100 characters | "Contact name must be 2-100 characters" |
| Format | Letters, spaces, hyphens, apostrophes | "Contact name contains invalid characters" |

**Zod Schema**:
```typescript
fullName: z.string()
  .min(2, 'Contact name must be at least 2 characters')
  .max(100, 'Contact name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Contact name contains invalid characters')
```

#### Email
**Field**: `primaryEmail` (stored in `tb_vendor_contact.info['contactMethods']['primaryEmail']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Email address is required" |
| Format | Valid email format (RFC 5322) | "Invalid email address format" |
| Length | Max 320 characters | "Email address must not exceed 320 characters" |
| Domain | Valid domain with MX records (optional check) | "Email domain does not accept mail" |
| Duplicate | Warn if email exists for same vendor | "This email address already exists for this vendor" |

**Zod Schema**:
```typescript
primaryEmail: z.string()
  .email('Invalid email address format')
  .max(320, 'Email address must not exceed 320 characters')
  .refine((email) => {
    // Check for disposable email domains (optional)
    const disposableDomains = ['tempmail.com', 'throwaway.email'];
    const domain = email.split('@')[1];
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed')
```

#### Phone Number
**Field**: `phoneNumbers` (stored in `tb_vendor_contact.info['contactMethods']['phoneNumbers']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid phone format for country | "Invalid phone number format for selected country" |
| Country Code | Valid ISO country code | "Invalid country code" |
| Length | 7-15 digits (excluding formatting) | "Phone number must be 7-15 digits" |

**Zod Schema**:
```typescript
phoneNumbers: z.array(z.object({
  type: z.enum(['office', 'mobile', 'home', 'fax']),
  countryCode: z.string()
    .length(2, 'Country code must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
  number: z.string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
  extension: z.string()
    .max(10, 'Extension must not exceed 10 digits')
    .regex(/^\d*$/, 'Extension must contain only digits')
    .optional(),
  isPrimary: z.boolean().default(false),
})).optional()
```

### 2.3 Financial Information

#### Payment Terms
**Field**: `paymentTermsType` (stored in `tb_vendor.info['paymentTerms']['termsType']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select payment terms | "Payment terms are required" |
| Valid | Must be one of predefined types | "Invalid payment terms selected" |

**Zod Schema**:
```typescript
paymentTermsType: z.enum([
  'net_7',
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'net_90',
  'custom',
], {
  errorMap: () => ({ message: 'Invalid payment terms selected' }),
}).default('net_30')
```

#### Days Net
**Field**: `daysNet` (stored in `tb_vendor.info['paymentTerms']['daysNet']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide number of days | "Payment days is required" |
| Type | Must be integer | "Payment days must be a whole number" |
| Range | 0-365 days | "Payment days must be between 0 and 365" |
| Consistency | Must match payment terms type | "Payment days must match selected payment terms" |

**Zod Schema**:
```typescript
daysNet: z.number()
  .int('Payment days must be a whole number')
  .min(0, 'Payment days cannot be negative')
  .max(365, 'Payment days must not exceed 365')
  .default(30)
```

#### Credit Limit
**Field**: `creditLimit` (stored in `tb_vendor.info['paymentTerms']['creditLimit']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide credit limit | "Credit limit is required" |
| Type | Must be number | "Credit limit must be a number" |
| Range | 0 to 999,999,999 | "Credit limit must be between 0 and 999,999,999" |
| Precision | Max 2 decimal places | "Credit limit must have at most 2 decimal places" |

**Zod Schema**:
```typescript
creditLimit: z.number()
  .min(0, 'Credit limit cannot be negative')
  .max(999999999, 'Credit limit must not exceed 999,999,999')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Credit limit must have at most 2 decimal places')
  .default(0)
```

#### Currency
**Field**: `defaultCurrency` (stored in `tb_vendor.info['paymentTerms']['defaultCurrency']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Valid | Must exist in supported currencies | "Currency not supported" |

**Zod Schema**:
```typescript
defaultCurrency: z.string()
  .length(3, 'Currency code must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
  .refine((code) => {
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    return supportedCurrencies.includes(code);
  }, 'Currency not supported')
  .default('USD')
```

### 2.4 Address Information

#### Address Line 1
**Field**: `addressLine1` (stored in `tb_vendor_address.data['addressLine1']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Address line 1 is required" |
| Length | 5-200 characters | "Address must be 5-200 characters" |
| Format | Letters, numbers, spaces, common punctuation | "Address contains invalid characters" |

**Zod Schema**:
```typescript
addressLine1: z.string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\#]+$/, 'Address contains invalid characters')
```

#### Postal Code
**Field**: `postalCode` (stored in `tb_vendor_address.data['postalCode']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Postal code is required" |
| Format | Varies by country | "Invalid postal code format for selected country" |
| Length | 3-10 characters | "Postal code must be 3-10 characters" |

**Zod Schema**:
```typescript
postalCode: z.string()
  .min(3, 'Postal code must be at least 3 characters')
  .max(10, 'Postal code must not exceed 10 characters')
  .refine((code, ctx) => {
    const country = ctx.parent.country; // Access parent context
    const formats = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
      'GB': /^[A-Z]{1,2}\d{1,2} ?\d[A-Z]{2}$/,
    };
    const pattern = formats[country] || /^[A-Z0-9\s\-]+$/;
    return pattern.test(code);
  }, 'Invalid postal code format for selected country')
```

#### Country
**Field**: `country` (stored in `tb_vendor_address.data['country']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select country | "Country is required" |
| Format | ISO 3166-1 alpha-2 code | "Invalid country code" |
| Valid | Must exist in supported countries | "Country not supported" |

**Zod Schema**:
```typescript
country: z.string()
  .length(2, 'Country code must be exactly 2 characters')
  .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters')
```

### 2.5 Document Information

#### Document Type
**Field**: `documentType` (stored in `tb_vendor.info['documents']['documents'][n]['documentType']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select document type | "Document type is required" |
| Valid | Must be one of predefined types | "Invalid document type selected" |

**Zod Schema**:
```typescript
documentType: z.enum([
  'contract',
  'certification',
  'insurance',
  'tax_document',
  'bank_details',
  'quality_certificate',
  'other',
], {
  errorMap: () => ({ message: 'Invalid document type selected' }),
})
```

#### Document Number
**Field**: `documentNumber` (stored in `tb_vendor.info['documents']['documents'][n]['documentNumber']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Document number is required" |
| Length | 1-100 characters | "Document number must be 1-100 characters" |
| Format | Alphanumeric with common separators | "Document number contains invalid characters" |

**Zod Schema**:
```typescript
documentNumber: z.string()
  .min(1, 'Document number is required')
  .max(100, 'Document number must not exceed 100 characters')
  .regex(/^[A-Z0-9\-\/\.]+$/i, 'Document number contains invalid characters')
```

#### Issue Date
**Field**: `issueDate` (stored in `tb_vendor.info['documents']['documents'][n]['issueDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide date | "Issue date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Cannot be future date | "Issue date cannot be in the future" |
| Range | Cannot be more than 50 years ago | "Issue date is too far in the past" |

**Zod Schema**:
```typescript
issueDate: z.coerce.date()
  .max(new Date(), 'Issue date cannot be in the future')
  .refine((date) => {
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    return date >= fiftyYearsAgo;
  }, 'Issue date is too far in the past')
```

#### Expiry Date
**Field**: `expiryDate` (stored in `tb_vendor.info['documents']['documents'][n]['expiryDate']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | ISO 8601 date string if provided | "Invalid date format" |
| Consistency | Must be after issue date | "Expiry date must be after issue date" |
| Recommended | Should be provided for certifications and insurance | "Warning: Expiry date is recommended for this document type" |

**Zod Schema**:
```typescript
expiryDate: z.coerce.date()
  .optional()
  .refine((expiryDate, ctx) => {
    if (!expiryDate) return true;
    const issueDate = ctx.parent.issueDate;
    return expiryDate > issueDate;
  }, 'Expiry date must be after issue date')
```

#### File Upload
**Field**: File upload (stored in S3, URL in `tb_vendor.info['documents']['documents'][n]['fileUrl']`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select file | "Please select a file to upload" |
| Size | Max 50MB | "File size must not exceed 50MB" |
| Type | PDF, DOC, DOCX, XLS, XLSX, JPG, PNG | "Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG" |
| Virus Scan | Must pass virus scan | "File contains malicious content and cannot be uploaded" |

**Validation Logic**:
```typescript
const validateFile = (file: File): ValidationResult => {
  // Size check
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size must not exceed 50MB',
    };
  }

  // Type check
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG',
    };
  }

  return { valid: true };
};
```

---

## 3. Business Rule Validations

### 3.1 Vendor Creation Rules

#### BR-VAL-001: Primary Contact Requirement
**Rule**: At least one contact with role "Primary" must exist before vendor can be submitted for approval.

**Validation**: Before submission, check:
```typescript
const hasPrimaryContact = contacts.some(
  (contact) => contact.role === 'primary' && contact.isActive
);

if (!hasPrimaryContact) {
  throw new ValidationError('At least one primary contact is required before submission');
}
```

**Error Message**: "At least one primary contact is required before submission. Please add a primary contact in the Contacts tab."

#### BR-VAL-002: Payment Terms Requirement
**Rule**: Payment terms must be defined before vendor can be used in purchase orders.

**Validation**: Check if payment terms are configured:
```typescript
const hasPaymentTerms = vendorInfo.paymentTerms &&
  vendorInfo.paymentTerms.termsType &&
  vendorInfo.paymentTerms.daysNet > 0;

if (!hasPaymentTerms) {
  throw new ValidationError('Payment terms must be configured before creating purchase orders');
}
```

**Error Message**: "Payment terms must be configured before this vendor can be used in purchase orders."

#### BR-VAL-003: Required Documents
**Rule**: Specific vendor types require specific documents before approval.

**Validation**:
```typescript
const requiredDocsByType = {
  'supplier': ['tax_document', 'business_license'],
  'service_provider': ['tax_document', 'insurance', 'business_license'],
  'contractor': ['tax_document', 'insurance', 'business_license', 'quality_certificate'],
};

const vendorType = vendorInfo.categorization.primaryType;
const requiredDocs = requiredDocsByType[vendorType] || [];

const uploadedDocTypes = vendorInfo.documents.documents.map(doc => doc.documentType);
const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));

if (missingDocs.length > 0) {
  throw new ValidationError(`Missing required documents: ${missingDocs.join(', ')}`);
}
```

**Error Message**: "Missing required documents: [list of missing documents]. Please upload these documents before submission."

### 3.2 Approval Rules

#### BR-VAL-004: Self-Approval Prevention
**Rule**: Users cannot approve their own vendor submissions.

**Validation**:
```typescript
const isSubmitter = vendorInfo.approval.submittedBy === currentUserId;

if (isSubmitter) {
  throw new ValidationError('You cannot approve your own vendor submission');
}
```

**Error Message**: "You cannot approve your own vendor submission. Please assign to another approver."

#### BR-VAL-005: Approval Authority
**Rule**: High-value vendors require executive approval.

**Validation**:
```typescript
const annualSpend = vendorInfo.paymentTerms.creditLimit;
const requiresExecutive = annualSpend > 500000;

if (requiresExecutive && !hasExecutiveApproval) {
  throw new ValidationError('Vendors with credit limit > $500,000 require executive approval');
}
```

**Error Message**: "This high-value vendor requires executive approval. Routing to executive approval stage."

### 3.3 Status Change Rules

#### BR-VAL-006: Block Vendor with Active POs
**Rule**: Cannot block vendor if active purchase orders exist (unless forced with approval).

**Validation**:
```typescript
const activePOsCount = await prisma.tb_purchase_order.count({
  where: {
    vendor_id: vendorId,
    deleted_at: null,
    status: { in: ['pending', 'approved', 'partially_received'] },
  },
});

if (activePOsCount > 0 && !forceBlock) {
  throw new ValidationError(
    `Cannot block vendor with ${activePOsCount} active purchase orders. Force block requires manager approval.`
  );
}
```

**Error Message**: "Cannot block vendor with [X] active purchase orders. You can force block with manager approval, or wait for POs to complete."

#### BR-VAL-007: Archive Vendor with Pending Invoices
**Rule**: Cannot archive vendor if pending invoices exist.

**Validation**:
```typescript
const pendingInvoices = await prisma.tb_invoice.count({
  where: {
    vendor_id: vendorId,
    deleted_at: null,
    payment_status: { not: 'paid' },
  },
});

if (pendingInvoices > 0) {
  throw new ValidationError(
    `Cannot archive vendor with ${pendingInvoices} pending invoices. Please resolve all invoices first.`
  );
}
```

**Error Message**: "Cannot archive vendor with [X] pending invoices. Please resolve all invoices before archiving."

### 3.4 Performance Rules

#### BR-VAL-008: Minimum Transactions for Rating
**Rule**: Vendors must have minimum 5 transactions to receive performance rating.

**Validation**:
```typescript
const transactionCount = vendorInfo.performance?.transactionCount || 0;

if (transactionCount < 5) {
  return {
    rating: null,
    message: 'Insufficient transaction data for meaningful rating',
  };
}
```

**Display Message**: "Not yet rated (minimum 5 transactions required)"

#### BR-VAL-009: Rating Threshold for Preferred Status
**Rule**: Vendors must maintain rating ≥ 4.0/5.0 for preferred status.

**Validation**:
```typescript
const currentRating = vendorInfo.performance?.overallRating || 0;
const isPreferred = vendorInfo.categorization?.isPreferred;

if (isPreferred && currentRating < 4.0) {
  return {
    warning: true,
    message: 'Vendor rating below 4.0. Preferred status may be revoked.',
  };
}
```

**Warning Message**: "Warning: Vendor rating has fallen below 4.0. Preferred status may be revoked if performance does not improve."

---

## 4. Complete Zod Schemas

### 4.1 Vendor Schema

```typescript
// lib/schemas/vendor.schema.ts

import { z } from 'zod';

export const vendorSchema = z.object({
  // Basic Information
  vendorCode: z.string()
    .min(3, 'Vendor code must be at least 3 characters')
    .max(20, 'Vendor code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Vendor code must contain only uppercase letters, numbers, and hyphens'),

  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters'),

  legalName: z.string()
    .min(2, 'Legal name must be at least 2 characters')
    .max(200, 'Legal name must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), 'Description cannot contain HTML tags')
    .optional(),

  website: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL must not exceed 500 characters')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Website URL must start with http:// or https://',
    })
    .optional()
    .or(z.literal('')),

  industry: z.string()
    .max(100, 'Industry must not exceed 100 characters')
    .optional(),

  // Classification
  business_type_id: z.string()
    .min(1, 'Business type is required')
    .uuid('Invalid business type ID'),

  tax_profile_id: z.string()
    .uuid('Invalid tax profile ID')
    .optional(),

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

  daysNet: z.number()
    .int('Payment days must be a whole number')
    .min(0, 'Payment days cannot be negative')
    .max(365, 'Payment days must not exceed 365')
    .default(30),

  creditLimit: z.number()
    .min(0, 'Credit limit cannot be negative')
    .max(999999999, 'Credit limit must not exceed 999,999,999')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Credit limit must have at most 2 decimal places')
    .default(0),

  defaultCurrency: z.string()
    .length(3, 'Currency code must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .default('USD'),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
```

### 4.2 Contact Schema

```typescript
// lib/schemas/contact.schema.ts

import { z } from 'zod';

export const vendorContactSchema = z.object({
  fullName: z.string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Contact name contains invalid characters'),

  title: z.string()
    .max(100, 'Title must not exceed 100 characters')
    .optional(),

  role: z.enum([
    'primary',
    'sales',
    'accounts_payable',
    'technical_support',
    'management',
    'other',
  ]).default('primary'),

  // Contact Methods
  primaryEmail: z.string()
    .email('Invalid email address format')
    .max(320, 'Email address must not exceed 320 characters'),

  secondaryEmail: z.string()
    .email('Invalid email address format')
    .max(320, 'Email address must not exceed 320 characters')
    .optional()
    .or(z.literal('')),

  phoneNumbers: z.array(z.object({
    type: z.enum(['office', 'mobile', 'home', 'fax']),
    countryCode: z.string()
      .length(2, 'Country code must be 2 characters')
      .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
    number: z.string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
    extension: z.string()
      .max(10, 'Extension must not exceed 10 digits')
      .regex(/^\d*$/, 'Extension must contain only digits')
      .optional(),
    isPrimary: z.boolean().default(false),
  })).optional().default([]),

  // Preferences
  preferredMethod: z.enum(['email', 'phone', 'sms', 'portal']).default('email'),

  language: z.string()
    .length(2, 'Language code must be 2 characters')
    .regex(/^[a-z]{2}$/, 'Language code must be lowercase letters')
    .default('en'),

  // Status
  isActive: z.boolean().default(true),
  isPreferredContact: z.boolean().default(false),

  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export type VendorContactFormData = z.infer<typeof vendorContactSchema>;
```

### 4.3 Document Schema

```typescript
// lib/schemas/document.schema.ts

import { z } from 'zod';

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

  documentNumber: z.string()
    .min(1, 'Document number is required')
    .max(100, 'Document number must not exceed 100 characters')
    .regex(/^[A-Z0-9\-\/\.]+$/i, 'Document number contains invalid characters'),

  documentName: z.string()
    .min(1, 'Document name is required')
    .max(200, 'Document name must not exceed 200 characters'),

  issueDate: z.coerce.date()
    .max(new Date(), 'Issue date cannot be in the future')
    .refine((date) => {
      const fiftyYearsAgo = new Date();
      fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
      return date >= fiftyYearsAgo;
    }, 'Issue date is too far in the past'),

  expiryDate: z.coerce.date()
    .optional()
    .refine((expiryDate, ctx) => {
      if (!expiryDate) return true;
      const issueDate = ctx.parent.issueDate;
      return expiryDate > issueDate;
    }, 'Expiry date must be after issue date'),

  issuingAuthority: z.string()
    .max(200, 'Issuing authority must not exceed 200 characters')
    .optional(),

  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),

  requiresApproval: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
  autoNotifyBeforeExpiry: z.boolean().default(true),
});

export type VendorDocumentFormData = z.infer<typeof vendorDocumentSchema>;
```

### 4.4 Address Schema

```typescript
// lib/schemas/address.schema.ts

import { z } from 'zod';

export const vendorAddressSchema = z.object({
  addressType: z.enum(['contact_address', 'mailing_address', 'register_address']),

  addressLine1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\#]+$/, 'Address contains invalid characters'),

  addressLine2: z.string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\#]*$/, 'Address contains invalid characters')
    .optional(),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\.]+$/, 'City contains invalid characters'),

  stateProvince: z.string()
    .max(100, 'State/Province must not exceed 100 characters')
    .optional(),

  postalCode: z.string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(10, 'Postal code must not exceed 10 characters'),

  country: z.string()
    .length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),

  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),

  deliveryInstructions: z.string()
    .max(500, 'Delivery instructions must not exceed 500 characters')
    .optional(),
});

export type VendorAddressFormData = z.infer<typeof vendorAddressSchema>;
```

---

## 5. Database Constraints

### 5.1 PostgreSQL Constraints

```sql
-- Vendor table constraints
ALTER TABLE tb_vendor
  ADD CONSTRAINT check_name_not_empty CHECK (name <> ''),
  ADD CONSTRAINT check_vendor_code_format CHECK (
    (info->'profile'->>'vendorCode') ~ '^[A-Z0-9-]{3,20}$'
  );

-- Vendor contact constraints
ALTER TABLE tb_vendor_contact
  ADD CONSTRAINT check_contact_has_email CHECK (
    (info->'contactMethods'->>'primaryEmail') IS NOT NULL AND
    (info->'contactMethods'->>'primaryEmail') <> ''
  );

-- Unique constraints
CREATE UNIQUE INDEX idx_vendor_code_unique
  ON tb_vendor ((info->'profile'->>'vendorCode'))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_vendor_name_unique
  ON tb_vendor (LOWER(name))
  WHERE deleted_at IS NULL;

-- Check constraints for JSON data
ALTER TABLE tb_vendor
  ADD CONSTRAINT check_credit_limit_positive CHECK (
    CAST(info->'paymentTerms'->>'creditLimit' AS NUMERIC) >= 0
  ),
  ADD CONSTRAINT check_payment_days_range CHECK (
    CAST(info->'paymentTerms'->>'daysNet' AS INTEGER) BETWEEN 0 AND 365
  );
```

### 5.2 Application-Level Constraints

```typescript
// Before insert/update validations

// Ensure vendor code is unique
const existingVendorCode = await prisma.tb_vendor.findFirst({
  where: {
    info: {
      path: ['profile', 'vendorCode'],
      equals: vendorData.vendorCode,
    },
    deleted_at: null,
    ...(isUpdate && { NOT: { id: vendorId } }),
  },
});

if (existingVendorCode) {
  throw new ConflictError('Vendor code already exists');
}

// Ensure at least one primary contact for approved vendors
if (status === 'approved') {
  const primaryContactCount = await prisma.tb_vendor_contact.count({
    where: {
      vendor_id: vendorId,
      is_active: true,
      info: {
        path: ['role'],
        equals: 'primary',
      },
    },
  });

  if (primaryContactCount === 0) {
    throw new ValidationError('At least one primary contact is required for approved vendors');
  }
}
```

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Error Code | Technical Message | User Message |
|------------|-------------------|--------------|
| VEN-001 | Vendor code already exists | This vendor code is already in use. Please choose a different code. |
| VEN-002 | Company name duplicate | A vendor with this name already exists. Would you like to view the existing vendor? |
| VEN-003 | Missing primary contact | At least one primary contact is required. Please add a contact in the Contacts tab. |
| VEN-004 | Payment terms not configured | Payment terms must be set before this vendor can be used in purchase orders. |
| VEN-005 | Missing required documents | Required documents are missing. Please upload: [list] |
| VEN-006 | Cannot block vendor with active POs | This vendor has [X] active purchase orders. Force blocking requires manager approval. |
| VEN-007 | Cannot archive with pending invoices | This vendor has [X] pending invoices. Please resolve all invoices before archiving. |
| VEN-008 | Self-approval not allowed | You cannot approve your own vendor submission. Please assign to another approver. |
| VEN-009 | Insufficient transaction data | This vendor does not yet have enough transactions (minimum 5) for a performance rating. |
| VEN-010 | Invalid email format | Please enter a valid email address (e.g., user@example.com). |
| VEN-011 | Invalid phone number | Please enter a valid phone number for the selected country. |
| VEN-012 | File size exceeds limit | File size must not exceed 50MB. Please compress or split the file. |
| VEN-013 | Invalid file type | Only PDF, DOC, DOCX, XLS, XLSX, JPG, and PNG files are allowed. |
| VEN-014 | Expiry date before issue date | The expiry date must be after the issue date. |
| VEN-015 | Credit limit exceeded | This purchase order exceeds the vendor's credit limit. Additional approval required. |

### 6.2 Technical Error Logs

```typescript
// Error logging format
interface ErrorLog {
  code: string;
  message: string;
  details: Record<string, any>;
  userId: string;
  timestamp: string;
  stackTrace?: string;
}

// Example usage
logger.error({
  code: 'VEN-001',
  message: 'Vendor code already exists',
  details: {
    vendorCode: 'VEN-2024-001',
    existingVendorId: 'vendor-uuid',
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
| UT-VEN-001 | Vendor code format | "ven-001" | Error: Must be uppercase |
| UT-VEN-002 | Vendor code format | "VEN-2024-001" | Success |
| UT-VEN-003 | Vendor code length | "VE" | Error: Minimum 3 characters |
| UT-VEN-004 | Email format | "user@domain" | Error: Invalid email |
| UT-VEN-005 | Email format | "user@domain.com" | Success |
| UT-VEN-006 | Credit limit | -1000 | Error: Cannot be negative |
| UT-VEN-007 | Credit limit | 50000.555 | Error: Max 2 decimal places |
| UT-VEN-008 | Payment days | 400 | Error: Must be ≤ 365 |
| UT-VEN-009 | Expiry before issue | issue: 2024-01-15, expiry: 2024-01-10 | Error: Expiry must be after issue |
| UT-VEN-010 | File size | 60MB | Error: Exceeds 50MB limit |

### 7.2 Integration Test Cases

| Test Case ID | Scenario | Steps | Expected Result |
|--------------|----------|-------|-----------------|
| IT-VEN-001 | Create vendor with duplicate code | 1. Create vendor "VEN-001"<br/>2. Try create another "VEN-001" | Error on step 2 |
| IT-VEN-002 | Submit without primary contact | 1. Create vendor<br/>2. Submit without contacts | Error: Primary contact required |
| IT-VEN-003 | Block vendor with active PO | 1. Create vendor<br/>2. Create PO<br/>3. Try to block | Warning: Active PO exists |
| IT-VEN-004 | Approve own submission | 1. User A creates vendor<br/>2. User A tries to approve | Error: Self-approval |
| IT-VEN-005 | Upload invalid file type | 1. Select .exe file<br/>2. Try to upload | Error: Invalid file type |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial creation |

---

## Related Documents
- BR-vendor-directory.md - Business Requirements
- UC-vendor-directory.md - Use Cases
- TS-vendor-directory.md - Technical Specification
- FD-vendor-directory.md - Flow Diagrams
- data-structure-gaps.md - Data Structure Analysis

---

**End of Validations Document**
