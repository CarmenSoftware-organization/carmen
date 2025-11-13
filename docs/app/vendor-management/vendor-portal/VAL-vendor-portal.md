# Vendor Entry Portal - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Vendor Entry Portal
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Vendor Entry Portal module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and security validation specifications.

The Vendor Entry Portal enables vendors to self-register, manage profiles, respond to pricing templates and RFQs, view purchase orders, submit invoices, and track performance metrics. Comprehensive validation ensures data integrity, security compliance, business rule enforcement, and proper approval workflows.

---

## 2. Field-Level Validations

### 2.1 Vendor Registration - Company Information

#### Legal Company Name
**Field**: `legalName` (stored in `tb_vendor_registration.legal_name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Legal company name is required" |
| Length | 3-200 characters | "Company name must be 3-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Company name contains invalid characters" |
| Unique | Must not duplicate active vendor | "A vendor with this name already exists" |

**Zod Schema**:
```typescript
legalName: z.string()
  .min(3, 'Company name must be at least 3 characters')
  .max(200, 'Company name must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters')
  .refine(async (name) => {
    const existing = await prisma.vendor.findFirst({
      where: {
        legalName: { equals: name, mode: 'insensitive' },
        status: { in: ['ACTIVE', 'PENDING_APPROVAL'] },
        deletedAt: null
      },
    });
    return !existing;
  }, 'A vendor with this name already exists')
```

#### Tax ID (EIN)
**Field**: `taxId` (stored in `tb_vendor_registration.tax_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Tax ID (EIN) is required" |
| Format | XX-XXXXXXX (9 digits with hyphen) | "Tax ID must be in format XX-XXXXXXX" |
| Unique | Must not duplicate active vendor | "This Tax ID is already registered" |
| Checksum | Valid EIN format | "Invalid Tax ID format" |

**Zod Schema**:
```typescript
taxId: z.string()
  .regex(/^\d{2}-\d{7}$/, 'Tax ID must be in format XX-XXXXXXX')
  .refine(async (taxId) => {
    const existing = await prisma.vendor.findFirst({
      where: { taxId, status: { in: ['ACTIVE', 'PENDING_APPROVAL'] } },
    });
    return !existing;
  }, 'This Tax ID is already registered')
```

#### Business Type
**Field**: `businessType` (stored in `tb_vendor_registration.business_type`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select business type | "Business type is required" |
| Valid | Must be valid enum value | "Invalid business type selected" |

**Zod Schema**:
```typescript
businessType: z.enum([
  'CORPORATION',
  'LLC',
  'PARTNERSHIP',
  'SOLE_PROPRIETORSHIP',
  'NON_PROFIT',
  'GOVERNMENT',
  'OTHER'
], {
  errorMap: () => ({ message: 'Invalid business type selected' }),
})
```

#### Physical Address
**Field**: `physicalAddress` (stored in `tb_vendor_registration.physical_address JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | All address fields required | "Complete physical address is required" |
| Street Length | 5-200 characters | "Street address must be 5-200 characters" |
| City Length | 2-100 characters | "City must be 2-100 characters" |
| State | Valid US state code | "Invalid state code" |
| Postal Code | Valid US ZIP (XXXXX or XXXXX-XXXX) | "Invalid ZIP code format" |
| Country | ISO 3166-1 alpha-2 code | "Invalid country code" |

**Zod Schema**:
```typescript
physicalAddress: z.object({
  street: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must not exceed 200 characters'),
  street2: z.string().max(200).optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  state: z.string()
    .length(2, 'State must be 2-letter code')
    .regex(/^[A-Z]{2}$/, 'State must be uppercase letters'),
  postalCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be XXXXX or XXXXX-XXXX'),
  country: z.string()
    .length(2, 'Country must be 2-letter ISO code')
    .default('US'),
})
```

### 2.2 Vendor Registration - Contact Information

#### Primary Contact Email
**Field**: `primaryContact.email` (stored in `tb_vendor_registration.primary_contact JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Primary contact email is required" |
| Format | Valid email format | "Invalid email address" |
| Length | Max 255 characters | "Email must not exceed 255 characters" |
| Unique | Must not be used by another vendor | "This email is already registered" |
| Domain | Cannot be disposable email | "Disposable email addresses are not allowed" |

**Zod Schema**:
```typescript
email: z.string()
  .email('Invalid email address')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .refine((email) => {
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
    const domain = email.split('@')[1];
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed')
  .refine(async (email) => {
    const existing = await prisma.vendorPortalUser.findFirst({
      where: { email, deletedAt: null },
    });
    return !existing;
  }, 'This email is already registered')
```

#### Phone Number
**Field**: `primaryContact.phone` (stored in `tb_vendor_registration.primary_contact JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Phone number is required" |
| Format | Valid US phone format | "Invalid phone number format" |
| Length | 10-15 digits | "Phone number must be 10-15 digits" |

**Zod Schema**:
```typescript
phone: z.string()
  .regex(/^\+?1?\d{10,14}$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
```

### 2.3 Vendor Registration - Business Details

#### Business Categories
**Field**: `businessCategories` (stored in `tb_vendor_registration.business_categories JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select at least one category | "At least one business category is required" |
| Max | Maximum 10 categories | "Maximum 10 business categories allowed" |
| Valid | Each must be valid category ID | "Invalid business category selected" |

**Zod Schema**:
```typescript
businessCategories: z.array(z.string().uuid())
  .min(1, 'At least one business category is required')
  .max(10, 'Maximum 10 business categories allowed')
  .refine(async (categoryIds) => {
    const categories = await prisma.businessCategory.findMany({
      where: { id: { in: categoryIds }, isActive: true },
    });
    return categories.length === categoryIds.length;
  }, 'One or more invalid business categories selected')
```

#### Bank Account Number
**Field**: `bankAccount.accountNumber` (stored in `tb_vendor_registration.bank_account JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Bank account number is required" |
| Format | 4-17 digits | "Account number must be 4-17 digits" |
| Encryption | Encrypted with AES-256 before storage | N/A |

**Zod Schema**:
```typescript
accountNumber: z.string()
  .regex(/^\d{4,17}$/, 'Account number must be 4-17 digits')
  .transform((val) => encryptData(val)) // Encrypt before storage
```

#### Routing Number
**Field**: `bankAccount.routingNumber` (stored in `tb_vendor_registration.bank_account JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Routing number is required" |
| Format | 9 digits | "Routing number must be 9 digits" |
| Checksum | Valid routing number checksum | "Invalid routing number" |
| Encryption | Encrypted with AES-256 before storage | N/A |

**Zod Schema**:
```typescript
routingNumber: z.string()
  .length(9, 'Routing number must be 9 digits')
  .regex(/^\d{9}$/, 'Routing number must be numeric')
  .refine((routing) => validateRoutingChecksum(routing), 'Invalid routing number')
  .transform((val) => encryptData(val))
```

### 2.4 Vendor Registration - Document Upload

#### Document Type
**Field**: `documentType` (stored in `tb_vendor_document.document_type`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select document type | "Document type is required" |
| Valid | Must be valid enum value | "Invalid document type selected" |
| Mandatory | Required documents must be uploaded | "Business License, Tax Certificate, and Insurance are required" |

**Zod Schema**:
```typescript
documentType: z.enum([
  'BUSINESS_LICENSE',
  'TAX_CERTIFICATE',
  'INSURANCE_GENERAL',
  'INSURANCE_LIABILITY',
  'INSURANCE_WORKERS_COMP',
  'CERTIFICATION_ISO',
  'CERTIFICATION_ORGANIC',
  'CERTIFICATION_HALAL',
  'CERTIFICATION_KOSHER',
  'CERTIFICATION_FAIR_TRADE',
  'CERTIFICATION_OTHER',
  'BANK_REFERENCE',
  'TRADE_REFERENCE',
  'W9_FORM',
  'OTHER'
], {
  errorMap: () => ({ message: 'Invalid document type selected' }),
})
```

#### File Upload
**Field**: `file` (uploaded to S3, reference in `tb_vendor_document`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must upload file | "Document file is required" |
| Size | Max 50MB per file | "File size must not exceed 50MB" |
| Format | PDF, JPG, PNG, DOC, DOCX, XLS, XLSX | "Invalid file format. Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX" |
| Virus Scan | Must pass virus scan | "File failed virus scan" |
| Name Length | Filename max 255 characters | "Filename must not exceed 255 characters" |

**Zod Schema**:
```typescript
file: z.custom<File>()
  .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must not exceed 50MB')
  .refine((file) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return allowedTypes.includes(file.type);
  }, 'Invalid file format')
  .refine((file) => file.name.length <= 255, 'Filename must not exceed 255 characters')
```

#### Expiry Date
**Field**: `expiryDate` (stored in `tb_vendor_document.expiry_date`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required for certifications | Required for licenses/certifications | "Expiry date is required for this document type" |
| Format | ISO 8601 date | "Invalid date format" |
| Future Date | Must be in the future | "Expiry date must be in the future" |
| Range | Max 10 years in future | "Expiry date cannot be more than 10 years in the future" |

**Zod Schema**:
```typescript
expiryDate: z.coerce.date()
  .refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }, 'Expiry date must be in the future')
  .refine((date) => {
    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
    return date <= tenYearsFromNow;
  }, 'Expiry date cannot be more than 10 years in the future')
  .refine((date, ctx) => {
    const requiresExpiry = [
      'BUSINESS_LICENSE',
      'TAX_CERTIFICATE',
      'INSURANCE_GENERAL',
      'INSURANCE_LIABILITY',
      'INSURANCE_WORKERS_COMP',
      'CERTIFICATION_ISO',
      'CERTIFICATION_ORGANIC',
      'CERTIFICATION_HALAL',
      'CERTIFICATION_KOSHER',
    ];
    if (requiresExpiry.includes(ctx.parent.documentType)) {
      return date !== undefined && date !== null;
    }
    return true;
  }, 'Expiry date is required for this document type')
  .optional()
```

### 2.5 Authentication Validations

#### Email (Login)
**Field**: `email` (login form)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Email is required" |
| Format | Valid email format | "Invalid email address" |
| Exists | Must exist in system | "Invalid credentials" |

**Zod Schema**:
```typescript
email: z.string()
  .email('Invalid email address')
  .toLowerCase()
```

#### Password (Login)
**Field**: `password` (login form)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Password is required" |
| Length | Min 8 characters | "Password must be at least 8 characters" |

**Zod Schema**:
```typescript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
```

#### Password (Registration/Change)
**Field**: `password` (stored in `tb_vendor_portal_user.password_hash`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Password is required" |
| Length | 12-128 characters | "Password must be 12-128 characters" |
| Complexity | Must contain uppercase, lowercase, number, special char | "Password must contain uppercase, lowercase, number, and special character" |
| Common Password | Not in common password list | "Password is too common. Please choose a stronger password" |
| Username Match | Cannot contain username/email | "Password cannot contain your email address" |

**Zod Schema**:
```typescript
password: z.string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine((password) => {
    const commonPasswords = ['Password123!', 'Welcome123!', 'Admin123!'];
    return !commonPasswords.includes(password);
  }, 'Password is too common')
  .refine((password, ctx) => {
    const email = ctx.parent.email?.toLowerCase();
    if (!email) return true;
    const username = email.split('@')[0];
    return !password.toLowerCase().includes(username);
  }, 'Password cannot contain your email address')
```

#### 2FA Code
**Field**: `code` (2FA verification)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Verification code is required" |
| Format | 6 digits | "Verification code must be 6 digits" |
| Expiry | Valid within 10 minutes | "Verification code has expired" |
| Attempts | Max 3 attempts | "Too many failed attempts. Please request a new code" |

**Zod Schema**:
```typescript
code: z.string()
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must be numeric')
```

### 2.6 Profile Update Validations

#### Company Information Update
**Field**: Various fields in vendor profile

| Rule | Validation | Error Message |
|------|------------|---------------|
| Critical Change Detection | Changes to legal name, tax ID, bank account require approval | "This change requires approval" |
| Change Reason | Required for critical changes (min 20 chars) | "Please provide a reason for this change (min 20 characters)" |
| Approval Status | Cannot edit during pending approval | "Profile update is pending approval" |

**Zod Schema**:
```typescript
changeReason: z.string()
  .min(20, 'Change reason must be at least 20 characters')
  .max(500, 'Change reason must not exceed 500 characters')
  .refine((reason, ctx) => {
    if (ctx.parent.isCriticalChange) {
      return reason && reason.length >= 20;
    }
    return true;
  }, 'Change reason is required for critical changes')
  .optional()
```

### 2.7 Price Template Response Validations

#### Product ID
**Field**: `productId` (price template item)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must be present | "Product ID is required" |
| Valid | Must exist in template | "Invalid product for this template" |
| Unique | No duplicate products in response | "Duplicate product in pricing response" |

**Zod Schema**:
```typescript
productId: z.string()
  .uuid('Invalid product ID format')
  .refine(async (productId, ctx) => {
    const templateItem = await prisma.priceListTemplateItem.findFirst({
      where: {
        templateId: ctx.parent.templateId,
        productId: productId,
      },
    });
    return templateItem !== null;
  }, 'Invalid product for this template')
```

#### Unit Price
**Field**: `unitPrice` (price template response)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide unit price | "Unit price is required" |
| Type | Must be positive number | "Unit price must be a positive number" |
| Range | 0.0001 to 999,999,999.9999 | "Unit price must be between 0.0001 and 999,999,999.9999" |
| Precision | Max 4 decimal places | "Unit price must have at most 4 decimal places" |
| Market Range | Warning if >20% above market average | "Price is significantly higher than market average (warning)" |

**Zod Schema**:
```typescript
unitPrice: z.number()
  .positive('Unit price must be a positive number')
  .min(0.0001, 'Unit price must be at least 0.0001')
  .max(999999999.9999, 'Unit price must not exceed 999,999,999.9999')
  .refine((val) => {
    const decimalPlaces = (val.toFixed(10).split('.')[1].replace(/0+$/, '')).length;
    return decimalPlaces <= 4;
  }, 'Unit price must have at most 4 decimal places')
```

#### Lead Time Days
**Field**: `leadTimeDays` (price template response)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide lead time | "Lead time is required" |
| Type | Must be positive integer | "Lead time must be a positive whole number" |
| Range | 1 to 365 days | "Lead time must be between 1 and 365 days" |

**Zod Schema**:
```typescript
leadTimeDays: z.number()
  .int('Lead time must be a whole number')
  .positive('Lead time must be a positive number')
  .min(1, 'Lead time must be at least 1 day')
  .max(365, 'Lead time must not exceed 365 days')
```

### 2.8 RFQ Response Validations

#### Bid Amount
**Field**: `bidAmount` (RFQ line item bid)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide bid amount | "Bid amount is required" |
| Type | Must be positive number | "Bid amount must be a positive number" |
| Range | 0.01 to 999,999,999.99 | "Bid amount must be between 0.01 and 999,999,999.99" |
| Precision | Max 2 decimal places for total bid | "Bid amount must have at most 2 decimal places" |
| Budget | Warning if exceeds budget by >10% | "Bid exceeds budget by more than 10% (warning)" |

**Zod Schema**:
```typescript
bidAmount: z.number()
  .positive('Bid amount must be a positive number')
  .min(0.01, 'Bid amount must be at least 0.01')
  .max(999999999.99, 'Bid amount must not exceed 999,999,999.99')
  .refine((val) => {
    const decimalPlaces = (val.toFixed(10).split('.')[1].replace(/0+$/, '')).length;
    return decimalPlaces <= 2;
  }, 'Bid amount must have at most 2 decimal places')
```

#### Bid Validity Days
**Field**: `bidValidityDays` (RFQ response)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide bid validity | "Bid validity period is required" |
| Type | Must be positive integer | "Bid validity must be a positive whole number" |
| Range | 7 to 90 days | "Bid validity must be between 7 and 90 days" |
| Minimum | Must meet RFQ minimum (if specified) | "Bid validity must be at least {min} days as specified in RFQ" |

**Zod Schema**:
```typescript
bidValidityDays: z.number()
  .int('Bid validity must be a whole number')
  .positive('Bid validity must be a positive number')
  .min(7, 'Bid validity must be at least 7 days')
  .max(90, 'Bid validity must not exceed 90 days')
  .refine((days, ctx) => {
    const minRequired = ctx.parent.rfq?.minBidValidityDays;
    if (minRequired) {
      return days >= minRequired;
    }
    return true;
  }, 'Bid validity does not meet RFQ requirements')
```

### 2.9 Invoice Submission Validations

#### Invoice Number
**Field**: `invoiceNumber` (vendor invoice submission)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Invoice number is required" |
| Length | 5-50 characters | "Invoice number must be 5-50 characters" |
| Format | Alphanumeric with hyphens | "Invoice number must be alphanumeric (hyphens allowed)" |
| Unique | Must be unique per vendor | "Invoice number already exists for your company" |

**Zod Schema**:
```typescript
invoiceNumber: z.string()
  .min(5, 'Invoice number must be at least 5 characters')
  .max(50, 'Invoice number must not exceed 50 characters')
  .regex(/^[A-Z0-9\-]+$/, 'Invoice number must be alphanumeric (hyphens allowed)')
  .refine(async (invoiceNumber, ctx) => {
    const existing = await prisma.invoice.findFirst({
      where: {
        vendorId: ctx.parent.vendorId,
        invoiceNumber: invoiceNumber,
      },
    });
    return !existing;
  }, 'Invoice number already exists for your company')
```

#### Purchase Order Number
**Field**: `purchaseOrderNumber` (invoice PO reference)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select PO | "Purchase order is required" |
| Valid | Must exist and belong to vendor | "Invalid purchase order selected" |
| Status | PO must be confirmed or delivered | "Selected purchase order is not confirmed" |
| Already Invoiced | Cannot invoice same PO twice | "This purchase order has already been invoiced" |

**Zod Schema**:
```typescript
purchaseOrderNumber: z.string()
  .refine(async (poNumber, ctx) => {
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        poNumber: poNumber,
        vendorId: ctx.parent.vendorId,
      },
    });
    return po !== null;
  }, 'Invalid purchase order selected')
  .refine(async (poNumber, ctx) => {
    const po = await prisma.purchaseOrder.findFirst({
      where: { poNumber: poNumber },
    });
    return po?.status === 'CONFIRMED' || po?.status === 'DELIVERED';
  }, 'Selected purchase order is not confirmed')
```

#### Invoice Amount
**Field**: `totalAmount` (invoice total)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide total amount | "Invoice total is required" |
| Type | Must be positive number | "Invoice total must be a positive number" |
| Range | 0.01 to 999,999,999.99 | "Invoice total must be between 0.01 and 999,999,999.99" |
| Precision | Max 2 decimal places | "Invoice total must have at most 2 decimal places" |
| PO Match | Must match PO total (±5% tolerance) | "Invoice total does not match purchase order (difference: {diff})" |

**Zod Schema**:
```typescript
totalAmount: z.number()
  .positive('Invoice total must be a positive number')
  .min(0.01, 'Invoice total must be at least 0.01')
  .max(999999999.99, 'Invoice total must not exceed 999,999,999.99')
  .refine((val) => {
    const decimalPlaces = (val.toFixed(2).split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Invoice total must have at most 2 decimal places')
  .refine(async (amount, ctx) => {
    const po = await prisma.purchaseOrder.findFirst({
      where: { poNumber: ctx.parent.purchaseOrderNumber },
    });
    if (!po) return true;

    const diff = Math.abs(amount - po.totalAmount);
    const tolerance = po.totalAmount * 0.05; // 5% tolerance

    if (diff > tolerance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invoice total does not match purchase order (difference: $${diff.toFixed(2)})`,
      });
      return false;
    }
    return true;
  })
```

### 2.10 Message/Communication Validations

#### Message Subject
**Field**: `subject` (vendor message)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Message subject is required" |
| Length | 5-200 characters | "Subject must be 5-200 characters" |
| Format | Plain text | "Subject contains invalid characters" |

**Zod Schema**:
```typescript
subject: z.string()
  .min(5, 'Subject must be at least 5 characters')
  .max(200, 'Subject must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\:\;\?\!\'\"\(\)]+$/, 'Subject contains invalid characters')
```

#### Message Body
**Field**: `body` (vendor message)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Message body is required" |
| Length | 10-5000 characters | "Message must be 10-5000 characters" |
| Format | Plain text or basic HTML | "Message contains unsafe content" |
| XSS Protection | No script tags or malicious code | "Message contains invalid content" |

**Zod Schema**:
```typescript
body: z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(5000, 'Message must not exceed 5000 characters')
  .refine((text) => !/<script[^>]*>.*?<\/script>/i.test(text), 'Message contains invalid content')
  .refine((text) => !/<iframe[^>]*>.*?<\/iframe>/i.test(text), 'Message contains invalid content')
```

---

## 3. Business Rule Validations

### BR-VP-001: Registration Approval Required

**Rule**: Vendor registration must be approved before portal access is granted.

**Enforcement**: Application-level validation + workflow routing

**Implementation**:
```typescript
async function checkRegistrationApproval(vendorId: string): Promise<ValidationResult> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { registration: true },
  });

  if (!vendor || vendor.status !== 'ACTIVE') {
    return {
      valid: false,
      code: 'BR_VP_001',
      message: 'Vendor registration is not approved',
      severity: 'error',
    };
  }

  if (!vendor.registration || vendor.registration.status !== 'APPROVED') {
    return {
      valid: false,
      code: 'BR_VP_001',
      message: 'Registration is pending approval',
      severity: 'error',
    };
  }

  return { valid: true };
}
```

### BR-VP-002: Document Expiry Blocks Submissions

**Rule**: Vendors with expired documents cannot submit pricing, bids, or invoices.

**Enforcement**: Application-level validation (pre-submission check)

**Implementation**:
```typescript
async function checkDocumentCompliance(vendorId: string): Promise<ValidationResult> {
  const requiredDocs = ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'INSURANCE_GENERAL'];

  const documents = await prisma.vendorDocument.findMany({
    where: {
      vendorId,
      documentType: { in: requiredDocs },
      status: 'APPROVED',
    },
  });

  // Check if all required documents exist
  const existingTypes = documents.map(d => d.documentType);
  const missingDocs = requiredDocs.filter(type => !existingTypes.includes(type));

  if (missingDocs.length > 0) {
    return {
      valid: false,
      code: 'BR_VP_002',
      message: `Missing required documents: ${missingDocs.join(', ')}`,
      severity: 'error',
      details: { missingDocuments: missingDocs },
    };
  }

  // Check for expired documents
  const now = new Date();
  const expiredDocs = documents.filter(d => d.expiryDate && d.expiryDate < now);

  if (expiredDocs.length > 0) {
    return {
      valid: false,
      code: 'BR_VP_002',
      message: `Expired documents: ${expiredDocs.map(d => d.documentType).join(', ')}. Please upload updated documents.`,
      severity: 'error',
      details: { expiredDocuments: expiredDocs.map(d => ({ type: d.documentType, expiryDate: d.expiryDate })) },
    };
  }

  return { valid: true };
}
```

### BR-VP-003: PO Acknowledgment Deadline

**Rule**: Purchase orders must be acknowledged within 48 hours of receipt.

**Enforcement**: Application-level validation + scheduled job

**Implementation**:
```typescript
async function checkPOAcknowledgmentDeadline(): Promise<void> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const overduePOs = await prisma.purchaseOrder.findMany({
    where: {
      status: 'CONFIRMED',
      vendorAcknowledgedAt: null,
      createdAt: { lt: fortyEightHoursAgo },
    },
    include: { vendor: true },
  });

  for (const po of overduePOs) {
    // Send reminder notification
    await createNotification({
      vendorId: po.vendorId,
      type: 'PO_ACKNOWLEDGMENT_OVERDUE',
      title: 'Purchase Order Acknowledgment Overdue',
      message: `Purchase Order ${po.poNumber} requires acknowledgment. Please review and acknowledge within 24 hours to avoid delays.`,
      priority: 'HIGH',
      relatedEntityType: 'PURCHASE_ORDER',
      relatedEntityId: po.id,
    });

    // Send email reminder
    await sendEmail({
      to: po.vendor.primaryEmail,
      subject: 'URGENT: Purchase Order Acknowledgment Required',
      template: 'po-acknowledgment-reminder',
      data: {
        poNumber: po.poNumber,
        issueDate: po.createdAt,
        daysOverdue: Math.floor((Date.now() - po.createdAt.getTime()) / (24 * 60 * 60 * 1000)) - 2,
      },
    });
  }
}
```

### BR-VP-004: Single Active Session

**Rule**: Each vendor user can have only one active session at a time (configurable).

**Enforcement**: Application-level validation (authentication middleware)

**Implementation**:
```typescript
async function enforceSessionPolicy(userId: string): Promise<ValidationResult> {
  const config = await getPortalConfig();

  if (!config.enforceSingleSession) {
    return { valid: true };
  }

  // Find existing active sessions
  const activeSessions = await prisma.vendorPortalSession.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (activeSessions.length > 0) {
    // Invalidate all existing sessions
    await prisma.vendorPortalSession.updateMany({
      where: {
        userId,
        id: { in: activeSessions.map(s => s.id) },
      },
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      action: 'SESSION_TERMINATED',
      actionCategory: 'AUTHENTICATION',
      status: 'SUCCESS',
      details: {
        reason: 'New login from different location',
        terminatedSessions: activeSessions.length,
      },
    });
  }

  return { valid: true };
}
```

### BR-VP-005: Password Expiry

**Rule**: Passwords must be changed every 90 days.

**Enforcement**: Application-level validation (login check)

**Implementation**:
```typescript
async function checkPasswordExpiry(userId: string): Promise<ValidationResult> {
  const user = await prisma.vendorPortalUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      valid: false,
      code: 'BR_VP_005',
      message: 'User not found',
      severity: 'error',
    };
  }

  const passwordAge = Date.now() - (user.passwordChangedAt?.getTime() || user.createdAt.getTime());
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  if (passwordAge > ninetyDays) {
    return {
      valid: false,
      code: 'BR_VP_005',
      message: 'Your password has expired. Please change your password to continue.',
      severity: 'error',
      details: {
        passwordAge: Math.floor(passwordAge / (24 * 60 * 60 * 1000)),
        mustChangePassword: true,
      },
    };
  }

  // Warning if password expires within 7 days
  if (passwordAge > (ninetyDays - 7 * 24 * 60 * 60 * 1000)) {
    const daysRemaining = 90 - Math.floor(passwordAge / (24 * 60 * 60 * 1000));
    return {
      valid: true,
      code: 'BR_VP_005',
      message: `Your password will expire in ${daysRemaining} days. Please change it soon.`,
      severity: 'warning',
    };
  }

  return { valid: true };
}
```

### BR-VP-006: File Upload Limits

**Rule**: Maximum file size is 50MB. All files must pass virus scanning.

**Enforcement**: Application-level validation + infrastructure

**Implementation**:
```typescript
async function validateFileUpload(file: File): Promise<ValidationResult> {
  // Check file size
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      code: 'BR_VP_006',
      message: 'File size exceeds 50MB limit',
      severity: 'error',
      details: {
        fileSize: file.size,
        maxSize: maxSize,
      },
    };
  }

  // Convert File to Buffer for virus scanning
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Virus scan
  const scanResult = await scanFileForVirus(buffer);

  if (!scanResult.clean) {
    // Log security event
    await createAuditLog({
      action: 'FILE_VIRUS_DETECTED',
      actionCategory: 'SECURITY',
      status: 'FAILURE',
      severity: 'CRITICAL',
      details: {
        fileName: file.name,
        fileSize: file.size,
        virusSignature: scanResult.signature,
      },
    });

    return {
      valid: false,
      code: 'BR_VP_006',
      message: 'File failed security scan',
      severity: 'error',
    };
  }

  return { valid: true };
}
```

### BR-VP-007: Session Timeout

**Rule**: Inactive sessions expire after 30 minutes.

**Enforcement**: Application-level validation (middleware) + scheduled job

**Implementation**:
```typescript
// Middleware check on each request
async function checkSessionValidity(sessionToken: string): Promise<ValidationResult> {
  const session = await prisma.vendorPortalSession.findFirst({
    where: {
      sessionToken,
      deletedAt: null,
    },
  });

  if (!session) {
    return {
      valid: false,
      code: 'BR_VP_007',
      message: 'Session not found',
      severity: 'error',
    };
  }

  const now = new Date();

  // Check if session expired
  if (session.expiresAt < now) {
    await prisma.vendorPortalSession.update({
      where: { id: session.id },
      data: { deletedAt: now },
    });

    return {
      valid: false,
      code: 'BR_VP_007',
      message: 'Session expired due to inactivity',
      severity: 'error',
    };
  }

  // Update last activity
  await prisma.vendorPortalSession.update({
    where: { id: session.id },
    data: {
      lastActivityAt: now,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000), // Extend by 30 minutes
    },
  });

  return { valid: true };
}

// Scheduled cleanup job (runs hourly)
async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();

  await prisma.vendorPortalSession.updateMany({
    where: {
      expiresAt: { lt: now },
      deletedAt: null,
    },
    data: {
      deletedAt: now,
      deletedBy: 'system',
    },
  });
}
```

### BR-VP-008: Critical Change Approval

**Rule**: Changes to legal name, tax ID, or bank account require approval.

**Enforcement**: Application-level validation + workflow routing

**Implementation**:
```typescript
async function detectCriticalChanges(
  vendorId: string,
  updates: Partial<Vendor>
): Promise<{ isCritical: boolean; changes: string[] }> {
  const criticalFields = ['legalName', 'taxId', 'bankAccount'];
  const current = await prisma.vendor.findUnique({ where: { id: vendorId } });

  if (!current) {
    throw new Error('Vendor not found');
  }

  const changes: string[] = [];

  // Check legal name
  if (updates.legalName && updates.legalName !== current.legalName) {
    changes.push('Legal Name');
  }

  // Check tax ID
  if (updates.taxId && updates.taxId !== current.taxId) {
    changes.push('Tax ID');
  }

  // Check bank account (compare encrypted values)
  if (updates.bankAccount) {
    const currentAccount = current.bankAccount as any;
    const newAccount = updates.bankAccount as any;

    if (
      newAccount.accountNumber !== currentAccount.accountNumber ||
      newAccount.routingNumber !== currentAccount.routingNumber
    ) {
      changes.push('Bank Account Information');
    }
  }

  return {
    isCritical: changes.length > 0,
    changes,
  };
}

async function routeToApproval(vendorId: string, changes: any): Promise<void> {
  // Create approval request
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      entityType: 'VENDOR_PROFILE',
      entityId: vendorId,
      requestType: 'CRITICAL_CHANGE',
      requestedBy: changes.userId,
      status: 'PENDING',
      changes: changes,
      requiredApprovers: ['PROCUREMENT_MANAGER', 'FINANCIAL_MANAGER'],
    },
  });

  // Notify approvers
  await notifyApprovers(approvalRequest);
}
```

---

## 4. Database Constraints

### 4.1 Unique Constraints

```sql
-- Vendor Registration
ALTER TABLE tb_vendor_registration
  ADD CONSTRAINT uq_vendor_registration_tax_id UNIQUE (tax_id);

ALTER TABLE tb_vendor_registration
  ADD CONSTRAINT uq_vendor_registration_email UNIQUE (primary_contact->>'email');

-- Vendor Portal User
ALTER TABLE tb_vendor_portal_user
  ADD CONSTRAINT uq_vendor_portal_user_email UNIQUE (email);

-- Vendor Portal Session
ALTER TABLE tb_vendor_portal_session
  ADD CONSTRAINT uq_vendor_portal_session_token UNIQUE (session_token);

-- Vendor Document
ALTER TABLE tb_vendor_document
  ADD CONSTRAINT uq_vendor_document_storage_path UNIQUE (storage_path);
```

### 4.2 Foreign Key Constraints

```sql
-- Vendor Portal User → Vendor
ALTER TABLE tb_vendor_portal_user
  ADD CONSTRAINT fk_vendor_portal_user_vendor
  FOREIGN KEY (vendor_id) REFERENCES tb_vendor(id) ON DELETE CASCADE;

-- Vendor Portal Session → User
ALTER TABLE tb_vendor_portal_session
  ADD CONSTRAINT fk_vendor_portal_session_user
  FOREIGN KEY (user_id) REFERENCES tb_vendor_portal_user(id) ON DELETE CASCADE;

-- Vendor Registration → Vendor (nullable, set after approval)
ALTER TABLE tb_vendor_registration
  ADD CONSTRAINT fk_vendor_registration_vendor
  FOREIGN KEY (vendor_id) REFERENCES tb_vendor(id) ON DELETE SET NULL;

-- Vendor Document → Vendor
ALTER TABLE tb_vendor_document
  ADD CONSTRAINT fk_vendor_document_vendor
  FOREIGN KEY (vendor_id) REFERENCES tb_vendor(id) ON DELETE CASCADE;

-- Vendor Document → Uploaded By
ALTER TABLE tb_vendor_document
  ADD CONSTRAINT fk_vendor_document_uploaded_by
  FOREIGN KEY (uploaded_by) REFERENCES tb_vendor_portal_user(id) ON DELETE SET NULL;

-- Vendor Notification → User
ALTER TABLE tb_vendor_notification
  ADD CONSTRAINT fk_vendor_notification_user
  FOREIGN KEY (user_id) REFERENCES tb_vendor_portal_user(id) ON DELETE CASCADE;

-- Vendor Message → User
ALTER TABLE tb_vendor_message
  ADD CONSTRAINT fk_vendor_message_user
  FOREIGN KEY (user_id) REFERENCES tb_vendor_portal_user(id) ON DELETE CASCADE;

-- Vendor Audit Log → User
ALTER TABLE tb_vendor_audit_log
  ADD CONSTRAINT fk_vendor_audit_log_user
  FOREIGN KEY (user_id) REFERENCES tb_vendor_portal_user(id) ON DELETE SET NULL;
```

### 4.3 Check Constraints

```sql
-- Vendor Portal User
ALTER TABLE tb_vendor_portal_user
  ADD CONSTRAINT chk_vendor_portal_user_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE tb_vendor_portal_user
  ADD CONSTRAINT chk_vendor_portal_user_failed_attempts
  CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10);

-- Vendor Portal Session
ALTER TABLE tb_vendor_portal_session
  ADD CONSTRAINT chk_vendor_portal_session_expiry
  CHECK (expires_at > created_at);

ALTER TABLE tb_vendor_portal_session
  ADD CONSTRAINT chk_vendor_portal_session_activity
  CHECK (last_activity_at >= created_at);

-- Vendor Document
ALTER TABLE tb_vendor_document
  ADD CONSTRAINT chk_vendor_document_file_size
  CHECK (file_size > 0 AND file_size <= 52428800); -- 50MB in bytes

ALTER TABLE tb_vendor_document
  ADD CONSTRAINT chk_vendor_document_expiry
  CHECK (expiry_date IS NULL OR expiry_date > issue_date);
```

### 4.4 NOT NULL Constraints

```sql
-- Vendor Portal User (essential fields)
ALTER TABLE tb_vendor_portal_user
  ALTER COLUMN vendor_id SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN password_hash SET NOT NULL,
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Vendor Portal Session
ALTER TABLE tb_vendor_portal_session
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN session_token SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL;

-- Vendor Registration
ALTER TABLE tb_vendor_registration
  ALTER COLUMN registration_number SET NOT NULL,
  ALTER COLUMN legal_name SET NOT NULL,
  ALTER COLUMN tax_id SET NOT NULL,
  ALTER COLUMN business_type SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Vendor Document
ALTER TABLE tb_vendor_document
  ALTER COLUMN vendor_id SET NOT NULL,
  ALTER COLUMN document_type SET NOT NULL,
  ALTER COLUMN document_name SET NOT NULL,
  ALTER COLUMN file_name SET NOT NULL,
  ALTER COLUMN file_size SET NOT NULL,
  ALTER COLUMN storage_path SET NOT NULL,
  ALTER COLUMN uploaded_by SET NOT NULL;
```

---

## 5. Security Validations

### 5.1 Rate Limiting

**Implementation**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Global rate limit: 100 requests per minute per IP
const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

// Login rate limit: 5 attempts per minute per IP
const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

// Document upload rate limit: 10 uploads per hour per user
const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

export async function checkRateLimit(
  identifier: string,
  type: 'global' | 'login' | 'upload'
): Promise<ValidationResult> {
  let ratelimit: Ratelimit;
  let action: string;

  switch (type) {
    case 'login':
      ratelimit = loginRateLimit;
      action = 'login';
      break;
    case 'upload':
      ratelimit = uploadRateLimit;
      action = 'upload';
      break;
    default:
      ratelimit = globalRateLimit;
      action = 'request';
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    return {
      valid: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many ${action} attempts. Please try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      severity: 'error',
      details: {
        limit,
        remaining,
        reset: new Date(reset),
      },
    };
  }

  return { valid: true };
}
```

### 5.2 Account Lockout

**Implementation**:
```typescript
async function handleFailedLogin(userId: string): Promise<void> {
  const user = await prisma.vendorPortalUser.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const failedAttempts = user.failedLoginAttempts + 1;
  const shouldLock = failedAttempts >= 5;

  await prisma.vendorPortalUser.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: failedAttempts,
      lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 minutes
    },
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: shouldLock ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
    actionCategory: 'AUTHENTICATION',
    status: 'FAILURE',
    details: {
      failedAttempts,
      lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
    },
  });

  // Send security alert if locked
  if (shouldLock) {
    await sendEmail({
      to: user.email,
      subject: 'Account Locked - Security Alert',
      template: 'account-locked',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        lockDuration: 15,
        unlockTime: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }
}
```

### 5.3 XSS Protection

**Implementation**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

### 5.4 SQL Injection Protection

**Implementation**: Prisma ORM provides built-in SQL injection protection through parameterized queries. All database queries use Prisma's type-safe query builder.

### 5.5 CSRF Protection

**Implementation**:
```typescript
import { getCsrfToken } from 'next-auth/react';

// Generate CSRF token for forms
export async function generateCsrfToken(): Promise<string> {
  return await getCsrfToken();
}

// Validate CSRF token on submission
export async function validateCsrfToken(token: string): Promise<ValidationResult> {
  const expectedToken = await getCsrfToken();

  if (token !== expectedToken) {
    return {
      valid: false,
      code: 'INVALID_CSRF_TOKEN',
      message: 'Invalid or expired security token. Please refresh the page.',
      severity: 'error',
    };
  }

  return { valid: true };
}
```

---

## 6. Complete Zod Schemas

### 6.1 Vendor Registration Schema

```typescript
import { z } from 'zod';

export const vendorRegistrationSchema = z.object({
  // Company Information
  legalName: z.string()
    .min(3, 'Company name must be at least 3 characters')
    .max(200, 'Company name must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Company name contains invalid characters'),

  tradeName: z.string()
    .max(200, 'Trade name must not exceed 200 characters')
    .optional(),

  taxId: z.string()
    .regex(/^\d{2}-\d{7}$/, 'Tax ID must be in format XX-XXXXXXX'),

  businessType: z.enum([
    'CORPORATION',
    'LLC',
    'PARTNERSHIP',
    'SOLE_PROPRIETORSHIP',
    'NON_PROFIT',
    'GOVERNMENT',
    'OTHER'
  ]),

  yearEstablished: z.number()
    .int('Year must be a whole number')
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),

  website: z.string()
    .url('Invalid website URL')
    .optional(),

  // Addresses
  physicalAddress: z.object({
    street: z.string().min(5).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).default('US'),
  }),

  mailingAddress: z.object({
    street: z.string().min(5).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).default('US'),
  }).optional(),

  billingAddress: z.object({
    street: z.string().min(5).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().length(2).regex(/^[A-Z]{2}$/),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).default('US'),
  }).optional(),

  // Contact Information
  primaryContact: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    title: z.string().max(100).optional(),
    email: z.string().email().max(255).toLowerCase(),
    phone: z.string().regex(/^\+?1?\d{10,14}$/),
    mobile: z.string().regex(/^\+?1?\d{10,14}$/).optional(),
  }),

  secondaryContact: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    title: z.string().max(100).optional(),
    email: z.string().email().max(255).toLowerCase(),
    phone: z.string().regex(/^\+?1?\d{10,14}$/),
  }).optional(),

  apContact: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email().max(255).toLowerCase(),
    phone: z.string().regex(/^\+?1?\d{10,14}$/),
  }).optional(),

  // Business Details
  businessCategories: z.array(z.string().uuid())
    .min(1, 'At least one business category is required')
    .max(10, 'Maximum 10 business categories allowed'),

  productsServices: z.array(z.string())
    .min(1, 'At least one product/service is required')
    .max(50, 'Maximum 50 products/services allowed'),

  bankAccount: z.object({
    bankName: z.string().min(2).max(200),
    accountName: z.string().min(2).max(200),
    accountNumber: z.string()
      .regex(/^\d{4,17}$/, 'Account number must be 4-17 digits')
      .transform((val) => encryptData(val)),
    routingNumber: z.string()
      .length(9, 'Routing number must be 9 digits')
      .regex(/^\d{9}$/, 'Routing number must be numeric')
      .refine((routing) => validateRoutingChecksum(routing), 'Invalid routing number')
      .transform((val) => encryptData(val)),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
  }),

  certifications: z.array(z.object({
    name: z.string().min(2).max(200),
    issuingOrganization: z.string().min(2).max(200),
    certificateNumber: z.string().max(100).optional(),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
  })).optional(),

  // Terms Acceptance
  acceptedTerms: z.boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),

  electronicSignature: z.string()
    .min(3, 'Electronic signature must be at least 3 characters')
    .max(200, 'Electronic signature must not exceed 200 characters'),

  signatureDate: z.coerce.date(),

  // Metadata
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

export type VendorRegistrationFormData = z.infer<typeof vendorRegistrationSchema>;
```

### 6.2 Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters'),

  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 6.3 Password Change Schema

```typescript
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(8, 'Current password is required'),

  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
```

### 6.4 Profile Update Schema

```typescript
export const profileUpdateSchema = z.object({
  // Contact Information
  primaryContact: z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    title: z.string().max(100).optional(),
    phone: z.string().regex(/^\+?1?\d{10,14}$/),
    mobile: z.string().regex(/^\+?1?\d{10,14}$/).optional(),
  }).optional(),

  // Addresses (non-critical)
  mailingAddress: z.object({
    street: z.string().min(5).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().length(2),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).default('US'),
  }).optional(),

  // Critical Changes (require approval)
  legalName: z.string()
    .min(3).max(200)
    .optional(),

  taxId: z.string()
    .regex(/^\d{2}-\d{7}$/)
    .optional(),

  bankAccount: z.object({
    bankName: z.string().min(2).max(200),
    accountName: z.string().min(2).max(200),
    accountNumber: z.string().regex(/^\d{4,17}$/),
    routingNumber: z.string().length(9).regex(/^\d{9}$/),
    accountType: z.enum(['CHECKING', 'SAVINGS']),
  }).optional(),

  changeReason: z.string()
    .min(20, 'Change reason must be at least 20 characters')
    .max(500, 'Change reason must not exceed 500 characters')
    .optional(),

  currentPassword: z.string()
    .min(8)
    .optional(), // Required when changing bank account
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
```

### 6.5 Price Template Response Schema

```typescript
export const priceTemplateResponseSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),

  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    unitPrice: z.number()
      .positive('Unit price must be a positive number')
      .min(0.0001).max(999999999.9999)
      .refine((val) => {
        const decimalPlaces = (val.toFixed(10).split('.')[1].replace(/0+$/, '')).length;
        return decimalPlaces <= 4;
      }, 'Unit price must have at most 4 decimal places'),
    casePrice: z.number()
      .positive().min(0.0001).max(999999999.9999).optional(),
    leadTimeDays: z.number()
      .int().positive().min(1).max(365),
    moq: z.number()
      .int().positive().min(1).max(999999).optional(),
    packSize: z.number()
      .int().positive().min(1).max(999999).optional(),
    notes: z.string().max(500).optional(),
  })).min(1, 'At least one item is required'),

  notes: z.string().max(1000).optional(),
});

export type PriceTemplateResponseFormData = z.infer<typeof priceTemplateResponseSchema>;
```

### 6.6 RFQ Response Schema

```typescript
export const rfqResponseSchema = z.object({
  rfqId: z.string().uuid('Invalid RFQ ID'),

  items: z.array(z.object({
    rfqItemId: z.string().uuid('Invalid RFQ item ID'),
    unitPrice: z.number()
      .positive().min(0.01).max(999999999.99),
    totalPrice: z.number()
      .positive().min(0.01).max(999999999.99),
    leadTimeDays: z.number()
      .int().positive().min(1).max(365),
    notes: z.string().max(500).optional(),
  })).min(1, 'At least one item is required'),

  totalBidAmount: z.number()
    .positive().min(0.01).max(999999999.99),

  bidValidityDays: z.number()
    .int().positive().min(7).max(90),

  paymentTerms: z.object({
    netDays: z.number().int().min(0).max(365),
    earlyPaymentDiscount: z.number().min(0).max(100).optional(),
    discountDays: z.number().int().min(0).max(365).optional(),
  }),

  deliveryTerms: z.object({
    incoterm: z.enum(['EXW', 'FOB', 'CIF', 'DDP', 'DAP']),
    shippingMethod: z.string().max(100),
    estimatedDeliveryDays: z.number().int().positive().min(1).max(365),
  }),

  notes: z.string().max(2000).optional(),

  attachments: z.array(z.object({
    fileName: z.string().max(255),
    fileSize: z.number().positive().max(50 * 1024 * 1024),
    fileType: z.string().max(100),
    storageKey: z.string(),
  })).max(10).optional(),
});

export type RfqResponseFormData = z.infer<typeof rfqResponseSchema>;
```

### 6.7 Invoice Submission Schema

```typescript
export const invoiceSubmissionSchema = z.object({
  purchaseOrderNumber: z.string()
    .min(5, 'Purchase order number is required')
    .max(50),

  invoiceNumber: z.string()
    .min(5, 'Invoice number must be at least 5 characters')
    .max(50, 'Invoice number must not exceed 50 characters')
    .regex(/^[A-Z0-9\-]+$/, 'Invoice number must be alphanumeric'),

  invoiceDate: z.coerce.date()
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date <= today;
    }, 'Invoice date cannot be in the future'),

  dueDate: z.coerce.date()
    .refine((date, ctx) => {
      const invoiceDate = ctx.parent.invoiceDate;
      return date >= invoiceDate;
    }, 'Due date must be on or after invoice date'),

  items: z.array(z.object({
    description: z.string().min(3).max(500),
    quantity: z.number().int().positive().min(1),
    unitPrice: z.number().positive().min(0.01).max(999999999.99),
    totalPrice: z.number().positive().min(0.01).max(999999999.99),
  })).min(1, 'At least one item is required'),

  subtotal: z.number().positive().min(0.01).max(999999999.99),
  taxAmount: z.number().min(0).max(999999999.99),
  totalAmount: z.number().positive().min(0.01).max(999999999.99),

  notes: z.string().max(1000).optional(),

  invoiceDocument: z.custom<File>()
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must not exceed 50MB')
    .refine((file) => {
      return ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    }, 'Invoice must be PDF, JPG, or PNG'),
});

export type InvoiceSubmissionFormData = z.infer<typeof invoiceSubmissionSchema>;
```

---

## 7. Error Messages Reference

### 7.1 Authentication Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| AUTH_001 | Invalid email or password | Authentication failed | error |
| AUTH_002 | Account is locked. Please try again in 15 minutes. | Account locked due to failed attempts | error |
| AUTH_003 | Your account is not active. Please contact support. | Account status is not ACTIVE | error |
| AUTH_004 | Invalid verification code | 2FA code verification failed | error |
| AUTH_005 | Verification code has expired. Please request a new one. | 2FA code expired | error |
| AUTH_006 | Your session has expired. Please log in again. | Session expired | error |
| AUTH_007 | Your password has expired. Please change your password. | Password older than 90 days | error |

### 7.2 Registration Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| REG_001 | This email is already registered | Duplicate email in registration | error |
| REG_002 | This Tax ID is already registered | Duplicate Tax ID | error |
| REG_003 | Invalid Tax ID format | Tax ID format validation failed | error |
| REG_004 | Business License is required | Missing mandatory document | error |
| REG_005 | File size exceeds 50MB limit | File size validation failed | error |
| REG_006 | File failed security scan | Virus scan failed | error |
| REG_007 | Invalid routing number | Bank routing checksum failed | error |

### 7.3 Document Upload Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| DOC_001 | Document type is required | Missing document type | error |
| DOC_002 | File size must not exceed 50MB | File size exceeds limit | error |
| DOC_003 | Invalid file format. Allowed: PDF, JPG, PNG, DOC, DOCX | File type not allowed | error |
| DOC_004 | File failed virus scan | Malware detected | error |
| DOC_005 | Expiry date is required for this document type | Missing expiry date for certification | error |
| DOC_006 | Document is expired. Please upload a current version. | Document expiry date in past | error |

### 7.4 Price Template Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| PT_001 | Template not found or no longer available | Invalid template ID | error |
| PT_002 | Deadline for this template has passed | Template deadline exceeded | error |
| PT_003 | Unit price is required | Missing unit price | error |
| PT_004 | Unit price must be a positive number | Invalid unit price | error |
| PT_005 | Price is significantly higher than market average | Price exceeds market by >20% | warning |

### 7.5 RFQ Response Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| RFQ_001 | RFQ not found or no longer available | Invalid RFQ ID | error |
| RFQ_002 | Deadline for this RFQ has passed | RFQ deadline exceeded | error |
| RFQ_003 | Bid validity must be at least {min} days | Bid validity below RFQ minimum | error |
| RFQ_004 | Bid exceeds budget by more than 10% | Bid amount validation warning | warning |
| RFQ_005 | You have already submitted a response to this RFQ | Duplicate RFQ response | error |

### 7.6 Invoice Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| INV_001 | Purchase order not found | Invalid PO number | error |
| INV_002 | This purchase order has already been invoiced | Duplicate invoice for PO | error |
| INV_003 | Invoice number already exists | Duplicate invoice number | error |
| INV_004 | Invoice total does not match purchase order | Invoice-PO amount mismatch | error |
| INV_005 | Invoice document is required | Missing invoice file | error |

### 7.7 Security Errors

| Code | User Message | Technical Message | Severity |
|------|--------------|-------------------|----------|
| SEC_001 | Too many login attempts. Please try again later. | Rate limit exceeded | error |
| SEC_002 | Your session has been terminated due to suspicious activity | Security violation detected | error |
| SEC_003 | Invalid security token. Please refresh the page. | CSRF token validation failed | error |
| SEC_004 | You have been logged out due to inactivity | Session timeout | warning |

---

## 8. Validation Testing Matrix

### 8.1 Registration Flow Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid registration | Complete valid data | Registration created with PENDING status | All validations pass |
| Duplicate email | Existing email | Error: "This email is already registered" | Email uniqueness check |
| Invalid Tax ID format | "123456789" | Error: "Tax ID must be in format XX-XXXXXXX" | Tax ID regex validation |
| Missing mandatory document | No business license | Error: "Business License is required" | Document requirement check |
| File too large | 60MB file | Error: "File size exceeds 50MB limit" | File size validation |
| Weak password | "password" | Error: "Password must contain..." | Password complexity check |

### 8.2 Authentication Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid login | Correct credentials | Login successful, redirect to dashboard | Authentication successful |
| Invalid password | Wrong password | Error: "Invalid email or password" | Password verification |
| Account locked | 6th failed attempt | Error: "Account is locked..." | Account lockout rule |
| Expired password | Password > 90 days old | Force password change | Password expiry rule |
| Invalid 2FA code | Wrong code | Error: "Invalid verification code" | TOTP verification |

### 8.3 Profile Update Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Update contact info | New phone number | Update successful | Non-critical change |
| Change legal name | New company name | Approval request created | Critical change detection |
| Change bank account without password | New account number | Error: "Password required" | Bank account security |
| Invalid routing number | "123456789" | Error: "Invalid routing number" | Routing checksum validation |

### 8.4 Price Template Response Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid pricing submission | All items with prices | Submission successful | All validations pass |
| Price too high | 50% above market | Warning displayed | Market price comparison |
| Missing lead time | No lead time | Error: "Lead time is required" | Required field validation |
| Invalid unit price | Negative price | Error: "Unit price must be positive" | Price range validation |

### 8.5 RFQ Response Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid bid submission | Complete bid data | Submission successful | All validations pass |
| Bid validity too short | 5 days | Error: "Bid validity must be at least 7 days" | Minimum validity check |
| Bid exceeds budget | 15% over budget | Warning displayed | Budget comparison |
| Missing attachments | No supporting docs | Submission allowed (optional) | Optional field |

### 8.6 Invoice Submission Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid invoice | Complete invoice data | Submission successful | All validations pass |
| Duplicate invoice number | Existing invoice # | Error: "Invoice number already exists" | Invoice number uniqueness |
| Amount mismatch | Different from PO | Error: "Invoice total does not match PO" | PO amount validation |
| Missing invoice document | No PDF uploaded | Error: "Invoice document is required" | Required file validation |

### 8.7 Document Upload Tests

| Test Case | Input | Expected Outcome | Validation Rule |
|-----------|-------|------------------|-----------------|
| Valid document | PDF < 50MB | Upload successful | All validations pass |
| File too large | 60MB PDF | Error: "File size exceeds 50MB" | File size limit |
| Infected file | File with virus | Error: "File failed security scan" | Virus scan |
| Invalid file type | .exe file | Error: "Invalid file format" | File type validation |

---

## 9. Performance Validation

### 9.1 Response Time Requirements

| Operation | Target | Maximum |
|-----------|--------|---------|
| Login | < 1 second | 2 seconds |
| Registration submission | < 2 seconds | 5 seconds |
| Profile update | < 1 second | 3 seconds |
| Document upload (10MB) | < 5 seconds | 10 seconds |
| Price template response | < 2 seconds | 5 seconds |
| RFQ response submission | < 2 seconds | 5 seconds |
| Invoice submission | < 3 seconds | 7 seconds |
| Dashboard load | < 2 seconds | 4 seconds |

### 9.2 Concurrent User Support

| Scenario | Target Concurrent Users |
|----------|------------------------|
| Normal operation | 1,000 users |
| Peak period | 2,000 users |
| RFQ deadline rush | 5,000 users |

---

## 10. Validation Best Practices

### 10.1 Client-Side Validation

**Purpose**: Improve UX with immediate feedback

**Implementation Guidelines**:
- Use Zod schemas with React Hook Form
- Display inline error messages
- Provide real-time validation feedback
- Disable submit button until form is valid

### 10.2 Server-Side Validation

**Purpose**: Ensure data integrity and security

**Implementation Guidelines**:
- Always validate on server, even if client validates
- Use same Zod schemas on server
- Return detailed error messages
- Log validation failures for security monitoring

### 10.3 Database-Level Validation

**Purpose**: Enforce data integrity constraints

**Implementation Guidelines**:
- Use constraints (UNIQUE, CHECK, NOT NULL)
- Define foreign key relationships
- Implement triggers for complex validations
- Maintain referential integrity

---

## Appendix: Validation Test Data

### A. Valid Test Data

**Valid Registration**:
```typescript
{
  legalName: "Acme Food Distributors LLC",
  taxId: "12-3456789",
  businessType: "LLC",
  physicalAddress: {
    street: "123 Main Street",
    city: "Boston",
    state: "MA",
    postalCode: "02101",
    country: "US"
  },
  primaryContact: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@acmefood.com",
    phone: "6175551234"
  },
  // ... complete data
}
```

### B. Invalid Test Data

**Invalid Tax ID**:
```typescript
{
  taxId: "123456789", // Missing hyphen
}
```

**Weak Password**:
```typescript
{
  password: "password123", // No uppercase, no special char
}
```

**Expired Document**:
```typescript
{
  documentType: "BUSINESS_LICENSE",
  expiryDate: "2023-01-01", // In the past
}
```

---

**Document End**
