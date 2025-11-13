# Price Lists - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Price Lists
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Document Status**: Draft

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Price Lists module. It includes field-level validations, business rule validations, Zod schemas, database constraints, and API validation specifications.

The Price Lists module enables organizations to manage vendor pricing information with comprehensive validation to ensure data integrity, pricing accuracy, business rule enforcement, and proper approval workflows throughout the price list lifecycle from creation through expiration.

---

## 2. Field-Level Validations

### 2.1 Price List Basic Information

#### Price List Number
**Field**: `priceListNumber` (stored in `tb_price_list.price_list_number`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Price list number is required" |
| Unique | Must be unique across all price lists | "Price list number already exists" |
| Format | Alphanumeric with hyphens, 10-50 characters | "Price list number must be 10-50 characters (letters, numbers, hyphens only)" |
| Pattern | Matches: `^PL-[0-9]{4}-[A-Z0-9]+-[0-9]{4}$` | "Price list number must follow format: PL-YYYY-VENDOR-XXXX" |
| Auto-generation | Auto-generated if not provided | N/A |

**Zod Schema**:
```typescript
priceListNumber: z.string()
  .min(10, 'Price list number must be at least 10 characters')
  .max(50, 'Price list number must not exceed 50 characters')
  .regex(/^PL-[0-9]{4}-[A-Z0-9]+-[0-9]{4}$/, 'Price list number must follow format: PL-YYYY-VENDOR-XXXX')
  .refine(async (number) => {
    const existing = await prisma.priceList.findFirst({
      where: { priceListNumber: number, deletedAt: null },
    });
    return !existing;
  }, 'Price list number already exists')
```

#### Name
**Field**: `name` (stored in `tb_price_list.name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Price list name is required" |
| Length | 3-200 characters | "Price list name must be 3-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Price list name contains invalid characters" |

**Zod Schema**:
```typescript
name: z.string()
  .min(3, 'Price list name must be at least 3 characters')
  .max(200, 'Price list name must not exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Price list name contains invalid characters')
```

#### Description
**Field**: `description` (stored in `tb_price_list.description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 1000 characters | "Description must not exceed 1000 characters" |
| Format | Plain text with basic formatting | "Description cannot contain script tags or malicious code" |

**Zod Schema**:
```typescript
description: z.string()
  .max(1000, 'Description must not exceed 1000 characters')
  .refine((text) => !/<script[^>]*>.*?<\/script>/i.test(text), 'Description cannot contain script tags')
  .optional()
```

#### Vendor ID
**Field**: `vendorId` (stored in `tb_price_list.vendor_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a vendor | "Vendor is required" |
| Valid | Must exist in vendor table | "Invalid vendor selected" |
| Active | Vendor must be active | "Selected vendor is not active" |
| Format | Must be valid UUID | "Invalid vendor ID format" |

**Zod Schema**:
```typescript
vendorId: z.string()
  .uuid('Invalid vendor ID format')
  .refine(async (vendorId) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId, deletedAt: null },
    });
    return vendor !== null;
  }, 'Invalid vendor selected')
  .refine(async (vendorId) => {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    return vendor?.status === 'ACTIVE';
  }, 'Selected vendor is not active')
```

#### Currency
**Field**: `currency` (stored in `tb_price_list.currency`)

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

#### Effective From Date
**Field**: `effectiveFrom` (stored in `tb_price_list.effective_from`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide effective from date | "Effective from date is required" |
| Format | ISO 8601 date string | "Invalid date format" |
| Range | Cannot be in the past for new price lists | "Effective from date cannot be in the past" |
| Range | Cannot be more than 2 years in future | "Effective from date cannot be more than 2 years in the future" |

**Zod Schema**:
```typescript
effectiveFrom: z.coerce.date()
  .refine((date, ctx) => {
    // Allow past dates for editing existing price lists
    if (ctx.isEditing) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Effective from date cannot be in the past')
  .refine((date) => {
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    return date <= twoYearsFromNow;
  }, 'Effective from date cannot be more than 2 years in the future')
```

#### Effective To Date
**Field**: `effectiveTo` (stored in `tb_price_list.effective_to`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty (null = no expiration) | N/A |
| Format | ISO 8601 date string | "Invalid date format" |
| Consistency | Must be after effective from date | "Effective to date must be after effective from date" |
| Range | Should be within 2 years of effective from (warning) | "Effective period is longer than 2 years (warning)" |

**Zod Schema**:
```typescript
effectiveTo: z.coerce.date()
  .refine((toDate, ctx) => {
    if (!toDate) return true;
    const fromDate = ctx.parent.effectiveFrom;
    return toDate > fromDate;
  }, 'Effective to date must be after effective from date')
  .refine((toDate, ctx) => {
    if (!toDate) return true;
    const fromDate = ctx.parent.effectiveFrom;
    const twoYearsLater = new Date(fromDate);
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

    if (toDate > twoYearsLater) {
      // This is a warning, not an error
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Effective period is longer than 2 years',
        severity: 'warning',
      });
    }
    return true;
  })
  .optional()
  .nullable()
```

### 2.2 Price List Line Item Validations

#### Product ID
**Field**: `productId` (stored in `tb_price_list_item.product_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a product | "Product is required" |
| Valid | Must exist in product catalog | "Invalid product selected" |
| Active | Product must be active | "Selected product is not active" |
| Format | Must be valid UUID | "Invalid product ID format" |
| Unique | No duplicate products in same price list | "Product already exists in this price list" |

**Zod Schema**:
```typescript
productId: z.string()
  .uuid('Invalid product ID format')
  .refine(async (productId) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product !== null;
  }, 'Invalid product selected')
  .refine(async (productId) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product?.status === 'ACTIVE';
  }, 'Selected product is not active')
```

#### Base Price
**Field**: `basePrice` (stored in `tb_price_list_item.base_price`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide base price | "Base price is required" |
| Type | Must be positive number | "Base price must be a positive number" |
| Range | 0.0001 to 999,999,999.9999 | "Base price must be between 0.0001 and 999,999,999.9999" |
| Precision | Max 4 decimal places | "Base price must have at most 4 decimal places" |

**Zod Schema**:
```typescript
basePrice: z.number()
  .positive('Base price must be a positive number')
  .min(0.0001, 'Base price must be at least 0.0001')
  .max(999999999.9999, 'Base price must not exceed 999,999,999.9999')
  .refine((val) => {
    const str = val.toFixed(10);
    const decimalPart = str.split('.')[1];
    const significantDecimals = decimalPart.replace(/0+$/, '').length;
    return significantDecimals <= 4;
  }, 'Base price must have at most 4 decimal places')
```

#### Unit Price
**Field**: `unitPrice` (stored in `tb_price_list_item.unit_price`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide unit price | "Unit price is required" |
| Type | Must be positive number | "Unit price must be a positive number" |
| Range | 0.0001 to 999,999,999.9999 | "Unit price must be between 0.0001 and 999,999,999.9999" |
| Precision | Max 4 decimal places | "Unit price must have at most 4 decimal places" |

**Zod Schema**:
```typescript
unitPrice: z.number()
  .positive('Unit price must be a positive number')
  .min(0.0001, 'Unit price must be at least 0.0001')
  .max(999999999.9999, 'Unit price must not exceed 999,999,999.9999')
  .refine((val) => {
    const str = val.toFixed(10);
    const decimalPart = str.split('.')[1];
    const significantDecimals = decimalPart.replace(/0+$/, '').length;
    return significantDecimals <= 4;
  }, 'Unit price must have at most 4 decimal places')
```

#### Case Price
**Field**: `casePrice` (stored in `tb_price_list_item.case_price`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive number | "Case price must be a positive number" |
| Range | 0.0001 to 999,999,999.9999 | "Case price must be between 0.0001 and 999,999,999.9999" |
| Precision | Max 4 decimal places | "Case price must have at most 4 decimal places" |

**Zod Schema**:
```typescript
casePrice: z.number()
  .positive('Case price must be a positive number')
  .min(0.0001, 'Case price must be at least 0.0001')
  .max(999999999.9999, 'Case price must not exceed 999,999,999.9999')
  .refine((val) => {
    const str = val.toFixed(10);
    const decimalPart = str.split('.')[1];
    const significantDecimals = decimalPart.replace(/0+$/, '').length;
    return significantDecimals <= 4;
  }, 'Case price must have at most 4 decimal places')
  .optional()
  .nullable()
```

#### Minimum Order Quantity (MOQ)
**Field**: `moq` (stored in `tb_price_list_item.moq`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer | "MOQ must be a positive whole number" |
| Range | 1 to 999,999 | "MOQ must be between 1 and 999,999" |

**Zod Schema**:
```typescript
moq: z.number()
  .int('MOQ must be a whole number')
  .positive('MOQ must be a positive number')
  .min(1, 'MOQ must be at least 1')
  .max(999999, 'MOQ must not exceed 999,999')
  .optional()
  .nullable()
```

#### Pack Size
**Field**: `packSize` (stored in `tb_price_list_item.pack_size`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer | "Pack size must be a positive whole number" |
| Range | 1 to 999,999 | "Pack size must be between 1 and 999,999" |

**Zod Schema**:
```typescript
packSize: z.number()
  .int('Pack size must be a whole number')
  .positive('Pack size must be a positive number')
  .min(1, 'Pack size must be at least 1')
  .max(999999, 'Pack size must not exceed 999,999')
  .optional()
  .nullable()
```

#### Lead Time Days
**Field**: `leadTimeDays` (stored in `tb_price_list_item.lead_time_days`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer | "Lead time must be a positive whole number" |
| Range | 1 to 365 days | "Lead time must be between 1 and 365 days" |

**Zod Schema**:
```typescript
leadTimeDays: z.number()
  .int('Lead time must be a whole number')
  .positive('Lead time must be a positive number')
  .min(1, 'Lead time must be at least 1 day')
  .max(365, 'Lead time must not exceed 365 days')
  .optional()
  .nullable()
```

#### Price Change Reason
**Field**: `changeReason` (stored in `tb_price_list_item.change_reason`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required if change >10% | Must provide reason for significant price changes | "Change reason is required for price increases >10%" |
| Length | Min 20 characters if provided, max 500 characters | "Change reason must be 20-500 characters" |
| Format | Plain text | "Change reason contains invalid characters" |

**Zod Schema**:
```typescript
changeReason: z.string()
  .min(20, 'Change reason must be at least 20 characters')
  .max(500, 'Change reason must not exceed 500 characters')
  .refine((reason, ctx) => {
    const priceChangePercent = ctx.parent.priceChangePercent;
    if (priceChangePercent && priceChangePercent > 10) {
      return reason && reason.length >= 20;
    }
    return true;
  }, 'Change reason is required for price increases >10%')
  .optional()
```

### 2.3 Pricing Tiers Validation (JSONB)

#### Tier Minimum Quantity
**Field**: `pricingTiers.tiers[].minQuantity`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide minimum quantity | "Tier minimum quantity is required" |
| Type | Must be positive integer | "Tier minimum quantity must be a positive whole number" |
| Range | 1 to 999,999 | "Tier minimum quantity must be between 1 and 999,999" |
| Consistency | Must be greater than previous tier's max | "Tier ranges must not overlap" |

**Zod Schema**:
```typescript
minQuantity: z.number()
  .int('Tier minimum quantity must be a whole number')
  .positive('Tier minimum quantity must be a positive number')
  .min(1, 'Tier minimum quantity must be at least 1')
  .max(999999, 'Tier minimum quantity must not exceed 999,999')
```

#### Tier Price
**Field**: `pricingTiers.tiers[].tierPrice`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide tier price | "Tier price is required" |
| Type | Must be positive number | "Tier price must be a positive number" |
| Range | 0.0001 to 999,999,999.9999 | "Tier price must be between 0.0001 and 999,999,999.9999" |
| Precision | Max 4 decimal places | "Tier price must have at most 4 decimal places" |
| Consistency | Should be less than base price | "Tier price should be less than base price (volume discount)" |

**Zod Schema**:
```typescript
tierPrice: z.number()
  .positive('Tier price must be a positive number')
  .min(0.0001, 'Tier price must be at least 0.0001')
  .max(999999999.9999, 'Tier price must not exceed 999,999,999.9999')
  .refine((val) => {
    const str = val.toFixed(10);
    const decimalPart = str.split('.')[1];
    const significantDecimals = decimalPart.replace(/0+$/, '').length;
    return significantDecimals <= 4;
  }, 'Tier price must have at most 4 decimal places')
```

### 2.4 Terms & Conditions Validation (JSONB)

#### Net Days
**Field**: `terms.paymentTerms.netDays`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide net days | "Net payment days is required" |
| Type | Must be positive integer | "Net days must be a positive whole number" |
| Range | 0 to 365 days | "Net days must be between 0 and 365" |

**Zod Schema**:
```typescript
netDays: z.number()
  .int('Net days must be a whole number')
  .min(0, 'Net days must be at least 0')
  .max(365, 'Net days must not exceed 365')
```

#### Warranty Period Days
**Field**: `terms.warranty.warrantyPeriodDays`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide warranty period | "Warranty period is required" |
| Type | Must be positive integer | "Warranty period must be a positive whole number" |
| Range | 1 to 3650 days (10 years) | "Warranty period must be between 1 and 3650 days" |

**Zod Schema**:
```typescript
warrantyPeriodDays: z.number()
  .int('Warranty period must be a whole number')
  .positive('Warranty period must be a positive number')
  .min(1, 'Warranty period must be at least 1 day')
  .max(3650, 'Warranty period must not exceed 3650 days (10 years)')
```

#### Return Window Days
**Field**: `terms.returnPolicy.returnWindowDays`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required if returns accepted | Must provide return window if returns accepted | "Return window is required when returns are accepted" |
| Type | Must be positive integer | "Return window must be a positive whole number" |
| Range | 1 to 365 days | "Return window must be between 1 and 365 days" |

**Zod Schema**:
```typescript
returnWindowDays: z.number()
  .int('Return window must be a whole number')
  .positive('Return window must be a positive number')
  .min(1, 'Return window must be at least 1 day')
  .max(365, 'Return window must not exceed 365 days')
  .refine((days, ctx) => {
    if (ctx.parent.returnsAccepted) {
      return days !== undefined && days !== null;
    }
    return true;
  }, 'Return window is required when returns are accepted')
```

### 2.5 Price Alert Validations

#### Alert Type
**Field**: `alertType` (stored in `tb_price_alert.alert_type`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select alert type | "Alert type is required" |
| Valid | Must be one of: INCREASE, DECREASE, ANY_CHANGE, EXPIRATION, NEW_LIST | "Invalid alert type selected" |

**Zod Schema**:
```typescript
alertType: z.enum(['INCREASE', 'DECREASE', 'ANY_CHANGE', 'EXPIRATION', 'NEW_LIST'], {
  errorMap: () => ({ message: 'Invalid alert type selected' }),
})
```

#### Threshold Percentage
**Field**: `threshold.percentage` (stored in `tb_price_alert.threshold JSONB`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required for INCREASE/DECREASE types | Must provide threshold percentage | "Threshold percentage is required for this alert type" |
| Type | Must be number | "Threshold percentage must be a number" |
| Range | 1 to 100 | "Threshold percentage must be between 1 and 100" |
| Precision | Max 2 decimal places | "Threshold percentage must have at most 2 decimal places" |

**Zod Schema**:
```typescript
percentage: z.number()
  .min(1, 'Threshold percentage must be at least 1')
  .max(100, 'Threshold percentage must not exceed 100')
  .refine((val) => {
    const decimalPlaces = (val.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
  }, 'Threshold percentage must have at most 2 decimal places')
  .refine((percent, ctx) => {
    const alertType = ctx.parent.parent.alertType;
    if (alertType === 'INCREASE' || alertType === 'DECREASE') {
      return percent !== undefined && percent !== null;
    }
    return true;
  }, 'Threshold percentage is required for this alert type')
  .optional()
```

---

## 3. Business Rule Validations

### BR-PL-001: Price List Must Have At Least One Item

**Rule**: A price list must contain at least one line item before it can be activated.

**Enforcement**: Application-level validation

**Implementation**:
```typescript
function validateMinimumItems(priceList: PriceList): ValidationResult {
  if (!priceList.items || priceList.items.length === 0) {
    return {
      valid: false,
      code: 'BR_PL_001',
      message: 'Price list must contain at least one item',
      severity: 'error',
    };
  }

  return { valid: true };
}
```

### BR-PL-002: Effective Dates Cannot Be in the Past

**Rule**: For new price lists, the effective from date cannot be in the past.

**Enforcement**: Application-level validation (edit mode exception)

**Implementation**:
```typescript
function validateEffectiveDates(priceList: PriceList, isEditing: boolean): ValidationResult {
  if (isEditing) {
    return { valid: true }; // Allow editing existing price lists
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (priceList.effectiveFrom < today) {
    return {
      valid: false,
      code: 'BR_PL_002',
      message: 'Effective from date cannot be in the past for new price lists',
      severity: 'error',
    };
  }

  return { valid: true };
}
```

### BR-PL-003: Price Increases >10% Require Approval

**Rule**: Price increases greater than 10% from the previous active price require approval.

**Enforcement**: Application-level validation and workflow routing

**Implementation**:
```typescript
async function checkPriceChangeApproval(
  priceList: PriceList
): Promise<{ requiresApproval: boolean; approvalLevel: string | null; maxIncrease: number }> {
  let maxIncrease = 0;

  for (const item of priceList.items) {
    if (item.priceChangePercent && item.priceChangePercent > maxIncrease) {
      maxIncrease = item.priceChangePercent;
    }
  }

  if (maxIncrease <= 10) {
    return {
      requiresApproval: false,
      approvalLevel: null,
      maxIncrease,
    };
  }

  // Determine approval level based on increase percentage
  let approvalLevel: string;

  if (maxIncrease <= 20) {
    approvalLevel = 'PROCUREMENT_MANAGER';
  } else if (maxIncrease <= 30) {
    approvalLevel = 'FINANCIAL_MANAGER';
  } else {
    approvalLevel = 'EXECUTIVE';
  }

  return {
    requiresApproval: true,
    approvalLevel,
    maxIncrease,
  };
}
```

### BR-PL-004: Only One Active Price List Per Vendor-Product-Location

**Rule**: A vendor cannot have multiple active price lists for the same product and location combination.

**Enforcement**: Database-level constraint + application-level validation

**Implementation**:
```typescript
async function validateUniquePriceList(priceList: PriceList): Promise<ValidationResult> {
  const overlapping = await prisma.priceList.findMany({
    where: {
      vendorId: priceList.vendorId,
      status: 'ACTIVE',
      effectiveFrom: { lte: priceList.effectiveTo || new Date('2099-12-31') },
      effectiveTo: { gte: priceList.effectiveFrom },
      id: { not: priceList.id },
      items: {
        some: {
          productId: { in: priceList.items.map(item => item.productId) },
        },
      },
    },
  });

  if (overlapping.length > 0) {
    // Check if targeting overlaps
    for (const existing of overlapping) {
      if (hasTargetingOverlap(priceList.targeting, existing.targeting)) {
        return {
          valid: false,
          code: 'BR_PL_004',
          message: `Active price list already exists for vendor ${priceList.vendor.name} with overlapping products and targeting`,
          severity: 'error',
          details: {
            overlappingPriceListIds: overlapping.map(pl => pl.id),
          },
        };
      }
    }
  }

  return { valid: true };
}

function hasTargetingOverlap(targeting1: any, targeting2: any): boolean {
  if (!targeting1 || !targeting2) return true; // Both apply to all
  if (targeting1.applicability === 'all' || targeting2.applicability === 'all') return true;

  // Check location overlap
  if (targeting1.locations && targeting2.locations) {
    const locations1 = targeting1.locations.filter((l: any) => l.isIncluded).map((l: any) => l.locationId);
    const locations2 = targeting2.locations.filter((l: any) => l.isIncluded).map((l: any) => l.locationId);
    const hasOverlap = locations1.some((loc: string) => locations2.includes(loc));
    if (hasOverlap) return true;
  }

  return false;
}
```

### BR-PL-005: Expired Price Lists Automatically Superseded

**Rule**: When the effective end date is reached, price lists are automatically marked as expired.

**Enforcement**: Scheduled job (daily)

**Implementation**:
```typescript
async function expirePriceLists(): Promise<void> {
  const now = new Date();

  const expiredPriceLists = await prisma.priceList.findMany({
    where: {
      status: 'ACTIVE',
      effectiveTo: {
        lt: now,
      },
    },
  });

  for (const priceList of expiredPriceLists) {
    await prisma.priceList.update({
      where: { id: priceList.id },
      data: { status: 'EXPIRED' },
    });

    await prisma.priceListHistory.create({
      data: {
        priceListId: priceList.id,
        changeType: 'EXPIRED',
        changedBy: 'system',
        reason: 'Effective end date reached',
      },
    });
  }
}
```

### BR-PL-006: Price History Retained for 5 Years

**Rule**: Price change history must be retained for at least 5 years for auditing purposes.

**Enforcement**: Scheduled job + application-level policy

**Implementation**:
```typescript
async function archiveOldPriceHistory(): Promise<void> {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  // Instead of deleting, move to archive table
  const oldHistory = await prisma.priceListHistory.findMany({
    where: {
      changedAt: { lt: fiveYearsAgo },
    },
  });

  if (oldHistory.length > 0) {
    // Move to archive storage (cold storage, S3, etc.)
    await archiveHistoryRecords(oldHistory);

    // Mark as archived but don't delete
    await prisma.priceListHistory.updateMany({
      where: {
        id: { in: oldHistory.map(h => h.id) },
      },
      data: {
        archived: true,
        archivedAt: new Date(),
      },
    });
  }
}
```

### BR-PL-007: Contract Prices Take Precedence

**Rule**: Contract-based price lists take precedence over standard price lists.

**Enforcement**: Application-level query logic

**Implementation**:
```typescript
async function getApplicablePrice(
  productId: string,
  vendorId: string,
  locationId?: string
): Promise<PriceListItem | null> {
  // First, look for contract pricing
  const contractPrice = await prisma.priceListItem.findFirst({
    where: {
      productId,
      priceList: {
        vendorId,
        status: 'ACTIVE',
        isContractPricing: true,
        takesPrecedence: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
    },
    include: {
      priceList: true,
    },
    orderBy: {
      priceList: {
        effectiveFrom: 'desc',
      },
    },
  });

  if (contractPrice) {
    return contractPrice;
  }

  // Fall back to standard pricing
  const standardPrice = await prisma.priceListItem.findFirst({
    where: {
      productId,
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
    include: {
      priceList: true,
    },
    orderBy: {
      priceList: {
        effectiveFrom: 'desc',
      },
    },
  });

  return standardPrice;
}
```

---

## 4. Complete Zod Schemas

### 4.1 Price List Schema

```typescript
// app/(main)/vendor-management/price-lists/validation.ts

import { z } from 'zod';

export const priceListSchema = z.object({
  // Basic Information
  name: z.string()
    .min(3, 'Price list name must be at least 3 characters')
    .max(200, 'Price list name must not exceed 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/, 'Price list name contains invalid characters'),

  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .refine((text) => !/<script[^>]*>.*?<\/script>/i.test(text), 'Description cannot contain script tags')
    .optional(),

  vendorId: z.string()
    .uuid('Invalid vendor ID format'),

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
      netDays: z.number().int().min(0).max(365),
      earlyPaymentDiscount: z.object({
        discountPercent: z.number().min(0).max(100),
        daysForDiscount: z.number().int().positive(),
      }).optional(),
      lateFee: z.object({
        feePercent: z.number().min(0).max(100),
        gracePeriodDays: z.number().int().positive(),
      }).optional(),
    }),
    warranty: z.object({
      warrantyPeriodDays: z.number().int().positive().min(1).max(3650),
      warrantyType: z.string(),
      warrantyTerms: z.string(),
    }),
    returnPolicy: z.object({
      returnsAccepted: z.boolean(),
      returnWindowDays: z.number().int().positive().min(1).max(365),
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
    productId: z.string().uuid(),
    productCode: z.string(),
    productName: z.string(),
    productCategory: z.string(),

    // Pricing
    basePrice: z.number()
      .positive('Base price must be positive')
      .min(0.0001)
      .max(999999999.9999)
      .refine((val) => {
        const str = val.toFixed(10);
        const decimalPart = str.split('.')[1];
        const significantDecimals = decimalPart.replace(/0+$/, '').length;
        return significantDecimals <= 4;
      }, 'Maximum 4 decimal places'),

    unitPrice: z.number()
      .positive('Unit price must be positive')
      .min(0.0001)
      .max(999999999.9999)
      .refine((val) => {
        const str = val.toFixed(10);
        const decimalPart = str.split('.')[1];
        const significantDecimals = decimalPart.replace(/0+$/, '').length;
        return significantDecimals <= 4;
      }, 'Maximum 4 decimal places'),

    casePrice: z.number()
      .positive('Case price must be positive')
      .min(0.0001)
      .max(999999999.9999)
      .refine((val) => {
        const str = val.toFixed(10);
        const decimalPart = str.split('.')[1];
        const significantDecimals = decimalPart.replace(/0+$/, '').length;
        return significantDecimals <= 4;
      }, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    bulkPrice: z.number()
      .positive('Bulk price must be positive')
      .min(0.0001)
      .max(999999999.9999)
      .refine((val) => {
        const str = val.toFixed(10);
        const decimalPart = str.split('.')[1];
        const significantDecimals = decimalPart.replace(/0+$/, '').length;
        return significantDecimals <= 4;
      }, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    // Pricing tiers
    pricingTiers: z.object({
      tiers: z.array(z.object({
        tierId: z.string(),
        minQuantity: z.number().int().positive().min(1).max(999999),
        maxQuantity: z.number().int().positive().optional(),
        tierPrice: z.number().positive().min(0.0001).max(999999999.9999),
        discountPercent: z.number().min(0).max(100).optional(),
        label: z.string(),
        isActive: z.boolean(),
      })),
    }).optional(),

    // Commercial terms
    moq: z.number()
      .int('MOQ must be a whole number')
      .positive('MOQ must be positive')
      .min(1)
      .max(999999)
      .optional()
      .nullable(),

    packSize: z.number()
      .int('Pack size must be a whole number')
      .positive('Pack size must be positive')
      .min(1)
      .max(999999)
      .optional()
      .nullable(),

    leadTimeDays: z.number()
      .int('Lead time must be a whole number')
      .positive('Lead time must be positive')
      .min(1)
      .max(365)
      .optional()
      .nullable(),

    shippingCost: z.number()
      .nonnegative('Shipping cost cannot be negative')
      .max(999999999.9999)
      .refine((val) => {
        const str = val.toFixed(10);
        const decimalPart = str.split('.')[1];
        const significantDecimals = decimalPart.replace(/0+$/, '').length;
        return significantDecimals <= 4;
      }, 'Maximum 4 decimal places')
      .optional()
      .nullable(),

    // Change tracking
    changeReason: z.string()
      .min(20, 'Change reason must be at least 20 characters')
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
})
.refine((data) => {
  // Validate pricing tiers don't overlap
  for (const item of data.items) {
    if (item.pricingTiers && item.pricingTiers.tiers.length > 0) {
      const sortedTiers = [...item.pricingTiers.tiers].sort((a, b) => a.minQuantity - b.minQuantity);

      for (let i = 0; i < sortedTiers.length - 1; i++) {
        const current = sortedTiers[i];
        const next = sortedTiers[i + 1];

        if (current.maxQuantity && current.maxQuantity >= next.minQuantity) {
          return false;
        }
      }
    }
  }
  return true;
}, {
  message: 'Pricing tier quantity ranges must not overlap',
  path: ['items'],
});
```

### 4.2 Price Alert Schema

```typescript
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
    percentage: z.number().min(1).max(100).optional(),
    fixedAmount: z.number().optional(),
  }).optional(),

  notificationMethods: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    sms: z.boolean(),
  }).refine((methods) => {
    return methods.email || methods.inApp || methods.sms;
  }, 'At least one notification method must be selected'),

  frequency: z.enum(['IMMEDIATE', 'DAILY_DIGEST', 'WEEKLY_SUMMARY']),
})
.refine((data) => {
  // Validate that threshold is provided for INCREASE/DECREASE types
  if (data.alertType === 'INCREASE' || data.alertType === 'DECREASE') {
    return data.threshold && (data.threshold.percentage !== undefined || data.threshold.fixedAmount !== undefined);
  }
  return true;
}, {
  message: 'Threshold is required for INCREASE/DECREASE alert types',
  path: ['threshold'],
});
```

### 4.3 Bulk Import Schema

```typescript
export const importDataSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  currency: z.string().length(3).default('USD'),

  rows: z.array(z.object({
    rowNumber: z.number().int().positive(),
    productCode: z.string(),
    productName: z.string(),
    productCategory: z.string(),
    productId: z.string().uuid().optional(),
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
  })).max(10000, 'Maximum 10,000 rows per import'),
});
```

---

## 5. Database Constraints

### 5.1 Primary Keys & Unique Constraints

```sql
-- Primary keys
ALTER TABLE tb_price_list ADD CONSTRAINT pk_price_list PRIMARY KEY (id);
ALTER TABLE tb_price_list_item ADD CONSTRAINT pk_price_list_item PRIMARY KEY (id);
ALTER TABLE tb_price_list_approval ADD CONSTRAINT pk_price_list_approval PRIMARY KEY (id);
ALTER TABLE tb_price_list_history ADD CONSTRAINT pk_price_list_history PRIMARY KEY (id);
ALTER TABLE tb_price_alert ADD CONSTRAINT pk_price_alert PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE tb_price_list ADD CONSTRAINT uq_price_list_number
  UNIQUE (price_list_number);
```

### 5.2 Foreign Key Constraints

```sql
-- Price list foreign keys
ALTER TABLE tb_price_list ADD CONSTRAINT fk_price_list_vendor
  FOREIGN KEY (vendor_id) REFERENCES tb_vendor(id) ON DELETE RESTRICT;

ALTER TABLE tb_price_list ADD CONSTRAINT fk_price_list_superseded
  FOREIGN KEY (superseded_by_id) REFERENCES tb_price_list(id) ON DELETE SET NULL;

-- Price list item foreign keys
ALTER TABLE tb_price_list_item ADD CONSTRAINT fk_item_price_list
  FOREIGN KEY (price_list_id) REFERENCES tb_price_list(id) ON DELETE CASCADE;

ALTER TABLE tb_price_list_item ADD CONSTRAINT fk_item_product
  FOREIGN KEY (product_id) REFERENCES tb_product(id) ON DELETE RESTRICT;

-- Approval foreign keys
ALTER TABLE tb_price_list_approval ADD CONSTRAINT fk_approval_price_list
  FOREIGN KEY (price_list_id) REFERENCES tb_price_list(id) ON DELETE CASCADE;

-- History foreign keys
ALTER TABLE tb_price_list_history ADD CONSTRAINT fk_history_price_list
  FOREIGN KEY (price_list_id) REFERENCES tb_price_list(id) ON DELETE CASCADE;
```

### 5.3 Check Constraints

```sql
-- Price validations
ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_base_price_positive
  CHECK (base_price > 0);

ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_unit_price_positive
  CHECK (unit_price > 0);

ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_case_price_positive
  CHECK (case_price IS NULL OR case_price > 0);

ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_bulk_price_positive
  CHECK (bulk_price IS NULL OR bulk_price > 0);

-- Quantity validations
ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_moq_positive
  CHECK (moq IS NULL OR moq > 0);

ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_pack_size_positive
  CHECK (pack_size IS NULL OR pack_size > 0);

ALTER TABLE tb_price_list_item ADD CONSTRAINT chk_lead_time_positive
  CHECK (lead_time_days IS NULL OR lead_time_days > 0);

-- Date validations
ALTER TABLE tb_price_list ADD CONSTRAINT chk_effective_dates
  CHECK (effective_to IS NULL OR effective_to > effective_from);

-- Status validations
ALTER TABLE tb_price_list ADD CONSTRAINT chk_valid_status
  CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'SUPERSEDED', 'CANCELLED'));

ALTER TABLE tb_price_list_approval ADD CONSTRAINT chk_valid_approval_level
  CHECK (approval_level IN ('PROCUREMENT_MANAGER', 'FINANCIAL_MANAGER', 'EXECUTIVE'));

ALTER TABLE tb_price_alert ADD CONSTRAINT chk_valid_alert_type
  CHECK (alert_type IN ('INCREASE', 'DECREASE', 'ANY_CHANGE', 'EXPIRATION', 'NEW_LIST'));
```

### 5.4 NOT NULL Constraints

```sql
-- Price list NOT NULL
ALTER TABLE tb_price_list ALTER COLUMN price_list_number SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN name SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN vendor_id SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN status SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN effective_from SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN currency SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE tb_price_list ALTER COLUMN created_at SET NOT NULL;

-- Price list item NOT NULL
ALTER TABLE tb_price_list_item ALTER COLUMN price_list_id SET NOT NULL;
ALTER TABLE tb_price_list_item ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE tb_price_list_item ALTER COLUMN product_code SET NOT NULL;
ALTER TABLE tb_price_list_item ALTER COLUMN product_name SET NOT NULL;
ALTER TABLE tb_price_list_item ALTER COLUMN base_price SET NOT NULL;
ALTER TABLE tb_price_list_item ALTER COLUMN unit_price SET NOT NULL;
```

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Code | Message | Action Required |
|------|---------|-----------------|
| VAL_PL_001 | Price list name is required | Provide a name for the price list |
| VAL_PL_002 | Price list must contain at least one item | Add at least one product to the price list |
| VAL_PL_003 | Vendor is required | Select a vendor for this price list |
| VAL_PL_004 | Effective from date cannot be in the past | Set effective from date to today or future date |
| VAL_PL_005 | Effective to date must be after effective from date | Adjust the effective date range |
| VAL_PL_006 | Price must be a positive number | Enter a valid positive price |
| VAL_PL_007 | Price can have at most 4 decimal places | Adjust price to maximum 4 decimal places |
| VAL_PL_008 | MOQ must be a positive whole number | Enter a valid minimum order quantity |
| VAL_PL_009 | Lead time must be between 1 and 365 days | Enter a lead time between 1 and 365 days |
| VAL_PL_010 | Change reason is required for price increases >10% | Provide a reason for the price increase |
| VAL_PL_011 | Pricing tier ranges must not overlap | Adjust tier quantity ranges to avoid overlap |
| VAL_PL_012 | Currency not supported | Select a supported currency from the list |
| VAL_PL_013 | Product already exists in this price list | Remove duplicate product or update existing entry |
| VAL_PL_014 | Active price list already exists for this vendor-product combination | Supersede the existing price list or modify targeting |
| VAL_PL_015 | Alert threshold is required for INCREASE/DECREASE types | Specify a percentage or fixed amount threshold |

### 6.2 Technical Error Messages (Logs)

| Code | Message | Details |
|------|---------|---------|
| ERR_PL_001 | Failed to create price list: Database error | SQL error, constraint violation, or transaction failure |
| ERR_PL_002 | Failed to validate price list items | One or more items failed validation checks |
| ERR_PL_003 | Price change calculation error | Unable to retrieve previous price for comparison |
| ERR_PL_004 | Approval routing failed | Error determining appropriate approval level |
| ERR_PL_005 | Failed to supersede existing price list | Error updating status of previous price list |
| ERR_PL_006 | Price list activation failed | Error activating price list or creating history record |
| ERR_PL_007 | Import validation failed | Bulk import data validation error |
| ERR_PL_008 | Price alert trigger failed | Error processing price alert notification |

---

## 7. Validation Testing Matrix

### 7.1 Field Validation Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| **Price List Name** |
| Name - Empty | "" | Fail: "Price list name is required" | VAL_PL_001 |
| Name - Too short | "AB" | Fail: "Price list name must be at least 3 characters" | VAL_PL_001 |
| Name - Too long | "A" * 201 | Fail: "Price list name must not exceed 200 characters" | VAL_PL_001 |
| Name - Invalid chars | "Test<script>" | Fail: "Price list name contains invalid characters" | VAL_PL_001 |
| Name - Valid | "Test Price List 2024" | Pass | - |
| **Vendor** |
| Vendor - Not selected | null | Fail: "Vendor is required" | VAL_PL_003 |
| Vendor - Invalid UUID | "invalid-uuid" | Fail: "Invalid vendor ID format" | VAL_PL_003 |
| Vendor - Non-existent | "00000000-0000-0000-0000-000000000000" | Fail: "Invalid vendor selected" | VAL_PL_003 |
| Vendor - Inactive | {inactive vendor UUID} | Fail: "Selected vendor is not active" | VAL_PL_003 |
| Vendor - Valid | {valid active vendor UUID} | Pass | - |
| **Effective Dates** |
| From - Past date (new) | "2023-01-01" | Fail: "Effective from date cannot be in the past" | VAL_PL_004 |
| From - Past date (edit) | "2023-01-01" | Pass (editing exception) | - |
| From - Valid | Today | Pass | - |
| To - Before From | From: "2024-12-01", To: "2024-11-01" | Fail: "Effective to date must be after effective from date" | VAL_PL_005 |
| To - Valid | From: "2024-01-01", To: "2024-12-31" | Pass | - |
| **Currency** |
| Currency - Empty | "" | Fail: "Currency is required" | VAL_PL_012 |
| Currency - Invalid length | "US" | Fail: "Currency code must be exactly 3 characters" | VAL_PL_012 |
| Currency - Not supported | "ZZZ" | Fail: "Currency not supported" | VAL_PL_012 |
| Currency - Valid | "USD" | Pass | - |
| **Base Price** |
| Price - Negative | -10.00 | Fail: "Base price must be a positive number" | VAL_PL_006 |
| Price - Zero | 0 | Fail: "Base price must be at least 0.0001" | VAL_PL_006 |
| Price - Too many decimals | 10.12345 | Fail: "Base price must have at most 4 decimal places" | VAL_PL_007 |
| Price - Valid | 10.5000 | Pass | - |
| **MOQ** |
| MOQ - Negative | -5 | Fail: "MOQ must be a positive number" | VAL_PL_008 |
| MOQ - Decimal | 5.5 | Fail: "MOQ must be a whole number" | VAL_PL_008 |
| MOQ - Zero | 0 | Fail: "MOQ must be at least 1" | VAL_PL_008 |
| MOQ - Valid | 10 | Pass | - |
| **Lead Time** |
| Lead Time - Zero | 0 | Fail: "Lead time must be at least 1 day" | VAL_PL_009 |
| Lead Time - Too long | 400 | Fail: "Lead time must not exceed 365 days" | VAL_PL_009 |
| Lead Time - Valid | 30 | Pass | - |

### 7.2 Business Rule Validation Tests

| Test Case | Scenario | Expected Result | Rule |
|-----------|----------|-----------------|------|
| **BR-PL-001: Minimum Items** |
| Empty items array | items: [] | Fail: "Price list must contain at least one item" | BR-PL-001 |
| One item | items: [item1] | Pass | BR-PL-001 |
| **BR-PL-003: Price Change Approval** |
| No previous price | New product added | Pass, no approval needed | BR-PL-003 |
| Price increase 5% | Previous: $10, New: $10.50 | Pass, no approval needed | BR-PL-003 |
| Price increase 15% | Previous: $10, New: $11.50 | Requires Procurement Manager approval | BR-PL-003 |
| Price increase 25% | Previous: $10, New: $12.50 | Requires Financial Manager approval | BR-PL-003 |
| Price increase 40% | Previous: $10, New: $14.00 | Requires Executive approval | BR-PL-003 |
| Price decrease 20% | Previous: $10, New: $8.00 | Pass, no approval needed | BR-PL-003 |
| **BR-PL-004: Unique Active Price List** |
| Same vendor-product, different dates | Vendor A, Product X, Date: Jan-Jun | Pass if no overlap | BR-PL-004 |
| Same vendor-product, overlapping dates | Vendor A, Product X, both active in Feb | Fail: "Active price list already exists" | BR-PL-004 |
| Same vendor-product, different locations | Vendor A, Product X, Location 1 vs Location 2 | Pass | BR-PL-004 |
| **BR-PL-007: Contract Precedence** |
| Contract price exists | Query for price, contract exists | Returns contract price | BR-PL-007 |
| No contract price | Query for price, only standard exists | Returns standard price | BR-PL-007 |
| Both exist | Query for price, both exist | Returns contract price (precedence) | BR-PL-007 |

### 7.3 Integration Validation Tests

| Test Case | Input | Expected Result | Validation |
|-----------|-------|-----------------|------------|
| **Template Integration** |
| Auto-create from template | Valid template submission | Price list created with sourceType: 'template' | Pass |
| Template with missing products | Template with non-existent products | Error, price list not created | Fail |
| **RFQ Integration** |
| Auto-create from RFQ award | Valid RFQ award | Contract price list created with precedence flag | Pass |
| RFQ with invalid bid data | RFQ award with invalid pricing | Error, price list not created | Fail |
| **Bulk Import** |
| Import 100 valid rows | 100 rows, all valid | All rows imported successfully | Pass |
| Import 10,001 rows | 10,001 rows | Fail: "Maximum 10,000 rows per import" | Fail |
| Import mixed validity | 50 valid, 30 warnings, 20 errors | 50 imported, 30 warnings shown, 20 errors rejected | Partial Pass |
| **Price Comparison** |
| Compare with 3 vendors | Product X, 3 active price lists | Comparison table with 3 rows, statistics calculated | Pass |
| Compare with no active prices | Product Y, 0 active price lists | "No active prices found" message | Pass |
| **Price Alerts** |
| Alert triggers on >10% increase | Price increases 15%, alert configured | Alert notification sent | Pass |
| Alert triggers on new list | New price list created, alert configured | Alert notification sent | Pass |
| Alert doesn't trigger | Price increases 5%, alert threshold 10% | No notification sent | Pass |

### 7.4 Performance Validation Tests

| Test Case | Input Size | Max Time | Expected Result |
|-----------|-----------|----------|-----------------|
| Create price list | 100 items | < 2 seconds | Success |
| Create price list | 1,000 items | < 5 seconds | Success |
| Bulk import | 1,000 rows | < 10 seconds | Success |
| Bulk import | 10,000 rows | < 30 seconds | Success |
| Price comparison query | 10 vendors | < 1 second | Success |
| Price comparison query | 50 vendors | < 3 seconds | Success |
| Price history query | 100 changes | < 1 second | Success |
| Price history query | 1,000 changes | < 3 seconds | Success |

---

## Appendices

### A. Validation Rule Summary

**Total Validation Rules**: 85+
- Field-level validations: 45
- Business rule validations: 21
- Database constraints: 15
- Integration validations: 4

### B. Glossary

- **Field-level Validation**: Input validation for individual form fields
- **Business Rule Validation**: Logic validation enforcing business policies
- **Database Constraint**: Database-level enforcement of data integrity
- **Zod Schema**: TypeScript validation schema using Zod library
- **Approval Threshold**: Percentage change triggering approval requirement
- **Supersession**: Replacing an active price list with a newer one
- **Contract Pricing**: Pricing derived from awarded contracts/RFQs
- **Precedence**: Priority given to contract prices over standard prices

### C. References

- Zod Documentation: https://zod.dev
- ISO 4217 Currency Codes: https://www.iso.org/iso-4217-currency-codes.html
- PostgreSQL Check Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial validations document |

---

*End of Validations Document*
