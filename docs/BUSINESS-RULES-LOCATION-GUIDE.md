# Business Rules Implementation Location Guide

**Document Version**: 1.0
**Last Updated**: January 2025
**Purpose**: Guide to locate actual business rule implementations in the Carmen ERP codebase

---

## Table of Contents

1. [Overview](#overview)
2. [Core Business Rule Locations](#core-business-rule-locations)
3. [Module-Specific Business Rules](#module-specific-business-rules)
4. [Supporting Infrastructure](#supporting-infrastructure)
5. [Quick Reference Matrix](#quick-reference-matrix)

---

## Overview

This document maps the business rules documented in [BUSINESS-RULES-SUMMARY.md](BUSINESS-RULES-SUMMARY.md) to their actual implementation locations in the codebase. Use this guide to find where specific business rules are enforced and how they are implemented.

### Implementation Patterns

Business rules in Carmen ERP are implemented across multiple layers:

1. **Service Layer**: Core business logic and calculations
2. **Utility Layer**: Field permissions, validation helpers, and utility functions
3. **Component Layer**: UI validation and real-time feedback
4. **Type Layer**: TypeScript type definitions and interfaces
5. **Database Layer**: Data integrity and persistence rules

---

## Core Business Rule Locations

### **1. Role-Based Access Control (RBAC)**

#### Purchase Request RBAC Service
**Location**: [`app/(main)/procurement/purchase-requests/services/rbac-service.ts`](../app/(main)/procurement/purchase-requests/services/rbac-service.ts)

**Implements**:
- User role definitions (Requester, Department Head, Finance Manager, Purchasing Staff, General Manager, System Admin)
- Widget access rules (myPR, myApproval, myOrder permissions)
- Visibility settings (department, full)
- Action permissions (edit, delete, submit, approval)
- Field-level access control

**Key Functions**:
```typescript
canViewWidget(user: User, widget: WidgetType): boolean
canPerformAction(user: User, action: ActionType, pr: PurchaseRequest): boolean
getFieldPermissions(user: User, prStatus: PRStatus): FieldPermissions
hasApprovalAuthority(user: User, workflowStage: string): boolean
```

#### Price Management RBAC Service
**Location**: [`lib/services/price-management-rbac-service.ts`](../lib/services/price-management-rbac-service.ts)

**Implements**:
- Vendor price management access control
- Price visibility by role
- Price update permissions
- Currency preference management

#### Enhanced Permission Service
**Location**: [`lib/services/permissions/enhanced-permission-service.ts`](../lib/services/permissions/enhanced-permission-service.ts)

**Implements**:
- Cross-module permission management
- Role hierarchy and inheritance
- Permission caching and performance optimization
- Permission audit trail

#### Field Permissions Utility
**Location**: [`lib/utils/field-permissions.ts`](../lib/utils/field-permissions.ts)

**Implements**:
- Granular field-level permissions
- Role-based field visibility
- Field editability by workflow stage
- Dynamic permission calculation

**Key Functions**:
```typescript
getFieldPermissions(role: UserRole, status: PRStatus): FieldPermissions
canEditField(role: UserRole, field: string, status: PRStatus): boolean
getEditableFields(role: UserRole, status: PRStatus): string[]
```

---

### **2. Workflow Business Rules**

#### Workflow Decision Engine
**Location**: [`app/(main)/procurement/purchase-requests/services/workflow-decision-engine.ts`](../app/(main)/procurement/purchase-requests/services/workflow-decision-engine.ts)

**Implements**:
- Priority-based decision logic (All Rejected → Any Review → Any Pending → Any Approved)
- Item status rules (Pending, Approved, Rejected, Review)
- Workflow stage progression
- Return logic and rejection routing
- Approval authority validation
- SLA enforcement and escalation

**Key Functions**:
```typescript
determineWorkflowAction(items: PRItem[]): WorkflowAction
validateStageProgression(currentStage: string, nextStage: string): boolean
calculateApprovalRoute(pr: PurchaseRequest): ApprovalRoute
checkSLACompliance(pr: PurchaseRequest): SLAStatus
escalateIfNeeded(pr: PurchaseRequest): void
```

**Priority System**:
```typescript
Priority 1: All Rejected (summary.rejected === summary.total)
Priority 2: Any Review (summary.review > 0)
Priority 3: Any Pending (summary.pending > 0)
Priority 4: Any Approved (summary.approved > 0)
```

#### Resubmission Workflow Service
**Location**: [`lib/services/resubmission-workflow-service.ts`](../lib/services/resubmission-workflow-service.ts)

**Implements**:
- Request modification workflow
- Approval reset logic
- Change tracking and justification
- Re-routing after modifications

---

### **3. Financial Calculation Rules**

#### Financial Calculations Service
**Location**: [`lib/services/calculations/financial-calculations.ts`](../lib/services/calculations/financial-calculations.ts)

**Implements**:
- Price calculations (baseAmount, discountAmount, netAmount, taxAmount, totalAmount)
- Multi-currency conversion
- Exchange rate application
- Tax calculations (inclusive/exclusive)
- Discount calculations (line-level and document-level)
- Rounding rules (2 decimal places)

**Key Functions**:
```typescript
calculateLineTotal(item: LineItem): FinancialAmount
calculateDiscount(amount: Money, discountRate: number): Money
calculateTax(netAmount: Money, taxRate: number): Money
convertCurrency(amount: Money, fromCurrency: Currency, toCurrency: Currency, rate: number): Money
calculateDocumentTotal(items: LineItem[]): DocumentTotal
applyExchangeRate(amount: Money, rate: ExchangeRate): Money
```

**Calculation Logic**:
```typescript
baseAmount = price * quantity
discountAmount = baseAmount * (discountRate / 100)
netAmount = baseAmount - discountAmount
taxAmount = netAmount * (taxRate / 100)
totalAmount = netAmount + taxAmount
```

#### Cached Financial Calculations
**Location**: [`lib/services/cache/cached-financial-calculations.ts`](../lib/services/cache/cached-financial-calculations.ts)

**Implements**:
- Performance-optimized calculation caching
- Memoization for repeated calculations
- Cache invalidation strategies

---

### **4. Inventory Management Rules**

#### Comprehensive Inventory Service
**Location**: [`lib/services/inventory/comprehensive-inventory-service.ts`](../lib/services/inventory/comprehensive-inventory-service.ts)

**Implements**:
- Transaction type processing (Receive, Issue, Transfer, Adjust, Vendor Returns)
- FIFO costing method
- Average costing method
- Cost layer management
- Quantity tracking and validation
- Status updates and transitions

**Key Functions**:
```typescript
receiveGoods(receipt: GoodsReceipt): InventoryTransaction
issueGoods(issue: GoodsIssue): InventoryTransaction
transferGoods(transfer: Transfer): InventoryTransaction[]
adjustInventory(adjustment: Adjustment): InventoryTransaction
processVendorReturn(creditNote: VendorCreditNote): InventoryTransaction
updateFIFOLayers(transaction: InventoryTransaction): void
calculateAverageCost(item: Item, location: Location): Money
```

#### Inventory Calculations Service
**Location**: [`lib/services/calculations/inventory-calculations.ts`](../lib/services/calculations/inventory-calculations.ts)

**Implements**:
- Quantity calculations
- Unit conversion logic
- Base quantity calculations
- Remaining quantity tracking
- Stock valuation

**Key Functions**:
```typescript
calculateBaseQuantity(quantity: number, conversionRate: number): number
convertUnits(quantity: number, fromUnit: Unit, toUnit: Unit): number
calculateRemainingQuantity(ordered: number, received: number): number
validateQuantityLimits(quantity: number, maxQuantity: number): boolean
```

#### Database Inventory Service
**Location**: [`lib/services/db/inventory-service.ts`](../lib/services/db/inventory-service.ts)

**Implements**:
- Database persistence of inventory transactions
- Inventory status updates
- Stock movement records
- Audit trail creation

#### Stock Movement Management Service
**Location**: [`lib/services/inventory/stock-movement-management-service.ts`](../lib/services/inventory/stock-movement-management-service.ts)

**Implements**:
- Stock movement tracking
- Location-based inventory management
- Movement validation
- History and audit trail

#### Physical Count Service
**Location**: [`lib/services/inventory/physical-count-service.ts`](../lib/services/inventory/physical-count-service.ts)

**Implements**:
- Physical inventory count workflow
- Variance tracking and reconciliation
- Count adjustment processing
- Approval workflow for variances

---

### **5. Validation Rules**

#### Fractional Sales Rule Validation Service
**Location**: [`lib/services/fractional-sales-rule-validation-service.ts`](../lib/services/fractional-sales-rule-validation-service.ts)

**Implements**:
- Food safety critical controls (temperature monitoring, holding time limits)
- Quality standards (size consistency, appearance quality, weight consistency)
- Sanitation protocols (equipment sanitization, surface cleanliness)
- Operational workflow rules (cutting procedures, timing requirements)
- Storage and display rules (temperature zones, display duration limits)
- Waste minimization controls (overproduction prevention, disposal authorization)

**Key Functions**:
```typescript
validateTemperatureCompliance(item: FractionalItem): ValidationResult
checkHoldingTimeLimits(item: FractionalItem): ValidationResult
validateQualityStandards(item: FractionalItem): ValidationResult
checkSanitationCompliance(equipment: Equipment): ValidationResult
validatePortion Size(slice: Slice, standards: PortionStandards): ValidationResult
enforceDisplayDurationLimits(item: FractionalItem): ValidationResult
```

**HACCP Critical Control Points**:
```typescript
Temperature Control:
  - Hot foods: >= 140°F
  - Cold foods: <= 41°F

Holding Time Limits:
  - Pizza slices: 4 hours hot holding
  - Cake slices: 2 hours room temperature

Quality Thresholds:
  - Pizza size consistency: 85-115% of standard
  - Appearance quality: >= 7/10
  - Cake weight variance: +/- 10 grams
  - Presentation quality: >= 8/10
```

#### Vendor Validation Service
**Location**: [`lib/utils/vendor-validation.ts`](../lib/utils/vendor-validation.ts)

**Implements**:
- Vendor data validation
- Business registration validation
- Contact information validation
- Vendor status checks

**Location**: [`app/(main)/vendor-management/lib/services/vendor-validation.ts`](../app/(main)/vendor-management/lib/services/vendor-validation.ts)

**Additional Vendor Validation**:
- Credit limit validation
- Payment terms validation
- Vendor performance checks
- Active vendor verification

#### Price Validation Engine
**Location**: [`lib/services/price-validation-engine.ts`](../lib/services/price-validation-engine.ts)

**Implements**:
- Price deviation alerts (15% threshold from last purchase)
- Price variance validation (20% from historical average)
- Vendor pricing verification
- Competitive pricing checks
- Price reasonableness validation

#### Template Validation
**Location**: [`lib/utils/template-validation.ts`](../lib/utils/template-validation.ts)

**Implements**:
- Purchase request template validation
- Data format validation
- Required field validation
- Business rule compliance checking

---

### **6. Currency and Exchange Rate Rules**

#### Currency Management Service
**Location**: [`lib/services/currency-management-service.ts`](../lib/services/currency-management-service.ts)

**Implements**:
- Multi-currency support (USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, MXN)
- Base currency handling (THB - Thai Baht)
- Currency configuration and settings
- Currency code validation

**Supported Currencies**:
```typescript
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD',
  'JPY', 'CHF', 'CNY', 'INR', 'MXN', 'THB'
];

const BASE_CURRENCY = 'THB';
```

#### Currency Conversion Service
**Location**: [`lib/services/currency-conversion-service.ts`](../lib/services/currency-conversion-service.ts)

**Implements**:
- Real-time currency conversion
- Exchange rate application
- Conversion precision (4 decimal places for rates, 2 for amounts)
- Multi-currency calculations

**Key Functions**:
```typescript
convertAmount(amount: Money, fromCurrency: Currency, toCurrency: Currency, rate: ExchangeRate): Money
getConversionRate(fromCurrency: Currency, toCurrency: Currency): ExchangeRate
calculateBaseCurrencyAmount(amount: Money, currency: Currency): Money
```

#### Exchange Rate Automation Service
**Location**: [`lib/services/exchange-rate-automation-service.ts`](../lib/services/exchange-rate-automation-service.ts)

**Implements**:
- Automatic exchange rate updates
- Rate locking during approval processing
- Historical rate tracking
- Rate variance monitoring

#### Vendor Currency Preference Service
**Location**: [`lib/services/vendor-currency-preference-service.ts`](../lib/services/vendor-currency-preference-service.ts)

**Implements**:
- Vendor-specific currency preferences
- Multi-currency vendor support
- Currency preference validation

---

### **7. Price Management Rules**

#### Price Assignment Service
**Location**: [`lib/services/price-assignment-service.ts`](../lib/services/price-assignment-service.ts)

**Implements**:
- Automatic price assignment logic
- Vendor selection based on pricing
- Price comparison and validation
- Preferred vendor priority

**Key Functions**:
```typescript
assignPrice(item: Item, vendors: Vendor[]): PriceAssignment
selectBestVendor(item: Item, vendors: Vendor[]): Vendor
compareVendorPrices(item: Item, vendors: Vendor[]): PriceComparison
applyPreferredVendorLogic(vendors: Vendor[]): Vendor
```

#### PR Price Assignment Service
**Location**: [`lib/services/pr-price-assignment-service.ts`](../lib/services/pr-price-assignment-service.ts)

**Implements**:
- Purchase request specific price assignment
- Price history tracking
- Price volatility analysis
- Price alert system

#### Vendor Price Management Service
**Location**: [`lib/services/vendor-price-management-service.ts`](../lib/services/vendor-price-management-service.ts)

**Implements**:
- Vendor-specific price lists
- Price validity periods
- Price update workflows
- Contract pricing

#### Price Normalization Service
**Location**: [`lib/services/price-normalization-service.ts`](../lib/services/price-normalization-service.ts)

**Implements**:
- Unit price normalization
- Comparable price calculations
- Base unit conversions for pricing
- Price standardization across vendors

#### Price Lifecycle Service
**Location**: [`lib/services/price-lifecycle-service.ts`](../lib/services/price-lifecycle-service.ts)

**Implements**:
- Price validity management
- Price expiration tracking
- Price renewal workflows
- Historical price archival

#### Price Status Management Service
**Location**: [`lib/services/price-status-management-service.ts`](../lib/services/price-status-management-service.ts)

**Implements**:
- Price status tracking (Active, Expired, Pending)
- Status transition rules
- Automated status updates

#### Price Expiration Notification Service
**Location**: [`lib/services/price-expiration-notification-service.ts`](../lib/services/price-expiration-notification-service.ts)

**Implements**:
- Price expiration alerts
- Notification scheduling
- Vendor communication for price updates

---

### **8. Quality and Data Validation**

#### Data Quality Service
**Location**: [`lib/services/data-quality-service.ts`](../lib/services/data-quality-service.ts)

**Implements**:
- Data completeness validation
- Data consistency checks
- Data accuracy verification
- Data quality scoring

**Key Functions**:
```typescript
validateDataCompleteness(record: DataRecord): QualityScore
checkDataConsistency(records: DataRecord[]): ConsistencyReport
verifyDataAccuracy(data: any, rules: ValidationRule[]): AccuracyResult
calculateQualityScore(record: DataRecord): number
```

#### Automated Quality Service
**Location**: [`lib/services/automated-quality-service.ts`](../lib/services/automated-quality-service.ts)

**Implements**:
- Automated quality checks
- Scheduled validation runs
- Quality trend analysis
- Automated remediation

---

### **9. Reporting and Analytics**

#### Cost Savings Reporting Service
**Location**: [`lib/services/cost-savings-reporting-service.ts`](../lib/services/cost-savings-reporting-service.ts)

**Implements**:
- Cost saving calculations
- Vendor comparison analysis
- Price variance reporting
- Savings trend analysis

#### Comparative Analysis Service
**Location**: [`lib/services/comparative-analysis-service.ts`](../lib/services/comparative-analysis-service.ts)

**Implements**:
- Multi-vendor comparisons
- Historical price comparisons
- Performance comparisons
- Trend analysis

#### Profitability Analysis Service
**Location**: [`lib/services/profitability-analysis-service.ts`](../lib/services/profitability-analysis-service.ts)

**Implements**:
- Product profitability calculations
- Margin analysis
- Cost structure analysis
- Revenue optimization

#### Consumption Variance Tracking Service
**Location**: [`lib/services/consumption-variance-tracking-service.ts`](../lib/services/consumption-variance-tracking-service.ts)

**Implements**:
- Actual vs planned consumption tracking
- Variance calculations
- Anomaly detection
- Variance reporting

---

### **10. Integration Services**

#### Procurement Integration Service
**Location**: [`lib/services/procurement-integration-service.ts`](../lib/services/procurement-integration-service.ts)

**Implements**:
- Purchase request to purchase order conversion
- PO to GRN integration
- Vendor integration
- Budget system synchronization

#### Inventory Integration Service
**Location**: [`lib/services/inventory/inventory-integration-service.ts`](../lib/services/inventory/inventory-integration-service.ts)

**Implements**:
- Stock movement integration
- Cost updates from GRN
- Location management integration
- Multi-system synchronization

#### POS Integration Service
**Location**: [`lib/services/pos-integration-service.ts`](../lib/services/pos-integration-service.ts)

**Implements**:
- Point of sale integration
- Fractional sales tracking
- Real-time inventory updates
- Sales data synchronization

---

## Module-Specific Business Rules

### **Procurement Module**

#### Purchase Request Services Directory
**Location**: [`app/(main)/procurement/purchase-requests/services/`](../app/(main)/procurement/purchase-requests/services/)

**Contains**:
- `rbac-service.ts` - Role-based access control
- `workflow-decision-engine.ts` - Workflow logic

#### Purchase Order Service
**Location**: [`lib/services/db/purchase-order-service.ts`](../lib/services/db/purchase-order-service.ts)

**Implements**:
- Purchase order creation workflow
- PO approval logic
- PO status management
- Vendor integration

#### Purchase Request Database Service
**Location**: [`lib/services/db/purchase-request-service.ts`](../lib/services/db/purchase-request-service.ts)

**Implements**:
- PR persistence
- PR retrieval and queries
- PR status updates
- Audit trail

---

### **Vendor Management Module**

#### Vendor Service
**Location**: [`app/(main)/vendor-management/lib/services/vendor-service.ts`](../app/(main)/vendor-management/lib/services/vendor-service.ts)

**Implements**:
- Vendor CRUD operations
- Vendor status management
- Vendor performance tracking
- Vendor relationship management

**Location**: [`lib/services/db/vendor-service.ts`](../lib/services/db/vendor-service.ts)

**Database Layer Implementation**:
- Vendor persistence
- Vendor queries
- Vendor data validation

---

### **Inventory Management Module**

#### Inventory Service Suite
**Location**: [`lib/services/inventory/`](../lib/services/inventory/)

**Contains**:
- `comprehensive-inventory-service.ts` - Core inventory operations
- `stock-movement-management-service.ts` - Movement tracking
- `physical-count-service.ts` - Physical inventory counts
- `inventory-analytics-service.ts` - Inventory analysis
- `inventory-integration-service.ts` - System integration

#### Database Inventory Services
**Location**: [`lib/services/db/`](../lib/services/db/)

**Contains**:
- `inventory-service.ts` - Inventory persistence
- `stock-movement-service.ts` - Movement records
- `inventory-valuation-service.ts` - Valuation calculations
- `physical-count-service.ts` - Count records
- `inventory-audit-service.ts` - Audit trails
- `inventory-integration-service.ts` - Integration layer

---

### **Fractional Sales Module**

#### Fractional Inventory Service
**Location**: [`lib/services/fractional-inventory-service.ts`](../lib/services/fractional-inventory-service.ts)

**Implements**:
- Fractional item tracking
- Pizza and cake portion management
- Multi-yield recipe support
- Portion inventory management

#### Fractional Stock Deduction Service
**Location**: [`lib/services/fractional-stock-deduction-service.ts`](../lib/services/fractional-stock-deduction-service.ts)

**Implements**:
- Automatic stock deduction for fractional sales
- Whole item to portion conversion
- Stock synchronization with POS
- Inventory accuracy maintenance

#### Dynamic Pricing Optimization Service
**Location**: [`lib/services/dynamic-pricing-optimization-service.ts`](../lib/services/dynamic-pricing-optimization-service.ts)

**Implements**:
- Time-based pricing adjustments
- Quality-based pricing (10% at 75% shelf life, 25% at 90%)
- Demand-based pricing
- Minimum margin enforcement

---

### **Operational Planning Module**

#### Menu Engineering Service
**Location**: [`lib/services/menu-engineering-service.ts`](../lib/services/menu-engineering-service.ts)

**Implements**:
- Recipe profitability analysis
- Menu item performance tracking
- Cost-based pricing recommendations
- Menu optimization

#### Enhanced Recipe Costing Service
**Location**: [`lib/services/enhanced-recipe-costing-service.ts`](../lib/services/enhanced-recipe-costing-service.ts)

**Implements**:
- Multi-level recipe costing
- Ingredient cost tracking
- Recipe margin calculations
- Cost variance analysis

---

## Supporting Infrastructure

### **Type Definitions**

#### Business Rules Types
**Location**: [`lib/types/business-rules.ts`](../lib/types/business-rules.ts)

**Defines**:
- Business rule type definitions
- Validation rule interfaces
- Workflow rule types
- Approval rule structures
- Status transition types

### **Notification System**

#### Notification Service
**Location**: [`lib/services/notification-service.ts`](../lib/services/notification-service.ts)

**Implements**:
- SLA violation notifications
- Budget alert notifications
- Price variance alerts
- Workflow escalation notifications
- Quality threshold alerts

### **Audit and Reporting**

#### Assignment Audit Service
**Location**: [`lib/services/assignment-audit-service.ts`](../lib/services/assignment-audit-service.ts)

**Implements**:
- Price assignment audit trails
- Vendor selection audit logs
- Decision tracking
- Compliance reporting

#### Price Management Audit Service
**Location**: [`lib/services/price-management-audit-service.ts`](../lib/services/price-management-audit-service.ts)

**Implements**:
- Price change history
- Price approval audit trail
- Price update logs
- Compliance tracking

#### Error Reporting Service
**Location**: [`lib/services/error-reporting-service.ts`](../lib/services/error-reporting-service.ts)

**Implements**:
- Business rule violation tracking
- Validation error logging
- Exception reporting
- Error trend analysis

### **Caching and Performance**

#### Calculation Cache Service
**Location**: [`lib/services/cache/calculation-cache-service.ts`](../lib/services/cache/calculation-cache-service.ts)

**Implements**:
- Financial calculation caching
- Permission caching
- Exchange rate caching
- Performance optimization

---

## Quick Reference Matrix

### Business Rule Category → Implementation Location

| Business Rule Category | Primary Service | Supporting Services | Utility/Helper Files |
|------------------------|----------------|---------------------|---------------------|
| **RBAC & Permissions** | `rbac-service.ts`<br>`enhanced-permission-service.ts` | `price-management-rbac-service.ts`<br>`permission-service.ts` | `field-permissions.ts` |
| **Workflow Logic** | `workflow-decision-engine.ts` | `resubmission-workflow-service.ts` | - |
| **Financial Calculations** | `financial-calculations.ts` | `cached-financial-calculations.ts`<br>`currency-conversion-service.ts` | - |
| **Inventory Management** | `comprehensive-inventory-service.ts` | `inventory-service.ts`<br>`stock-movement-management-service.ts`<br>`physical-count-service.ts` | `inventory-calculations.ts` |
| **Fractional Sales** | `fractional-sales-rule-validation-service.ts`<br>`fractional-inventory-service.ts` | `fractional-stock-deduction-service.ts`<br>`dynamic-pricing-optimization-service.ts` | - |
| **Validation Rules** | `vendor-validation.ts`<br>`price-validation-engine.ts` | `data-quality-service.ts`<br>`automated-quality-service.ts` | `template-validation.ts` |
| **Currency Management** | `currency-management-service.ts`<br>`currency-conversion-service.ts` | `exchange-rate-automation-service.ts`<br>`vendor-currency-preference-service.ts` | - |
| **Price Management** | `price-assignment-service.ts`<br>`vendor-price-management-service.ts` | `price-lifecycle-service.ts`<br>`price-status-management-service.ts`<br>`price-normalization-service.ts` | `PriceValidation.ts` |
| **Procurement** | `purchase-order-service.ts`<br>`purchase-request-service.ts` | `pr-price-assignment-service.ts`<br>`procurement-integration-service.ts` | - |
| **Vendor Management** | `vendor-service.ts` (app & lib) | `vendor-validation.ts` | - |
| **Quality & Audit** | `data-quality-service.ts`<br>`automated-quality-service.ts` | `assignment-audit-service.ts`<br>`price-management-audit-service.ts`<br>`error-reporting-service.ts` | - |
| **Integration** | `procurement-integration-service.ts`<br>`inventory-integration-service.ts` | `pos-integration-service.ts` | - |
| **Notifications** | `notification-service.ts` | `price-expiration-notification-service.ts` | - |
| **Reporting** | `cost-savings-reporting-service.ts`<br>`comparative-analysis-service.ts` | `profitability-analysis-service.ts`<br>`consumption-variance-tracking-service.ts` | - |

---

## Finding Specific Business Rules

### **To Find Authorization Rules**
1. Start with: `app/(main)/procurement/purchase-requests/services/rbac-service.ts`
2. Check field-level: `lib/utils/field-permissions.ts`
3. For cross-module: `lib/services/permissions/enhanced-permission-service.ts`

### **To Find Workflow Rules**
1. Start with: `app/(main)/procurement/purchase-requests/services/workflow-decision-engine.ts`
2. Check modifications: `lib/services/resubmission-workflow-service.ts`

### **To Find Financial Rules**
1. Calculations: `lib/services/calculations/financial-calculations.ts`
2. Currency: `lib/services/currency-conversion-service.ts`
3. Exchange rates: `lib/services/exchange-rate-automation-service.ts`

### **To Find Inventory Rules**
1. Main service: `lib/services/inventory/comprehensive-inventory-service.ts`
2. Calculations: `lib/services/calculations/inventory-calculations.ts`
3. Database layer: `lib/services/db/inventory-service.ts`

### **To Find Validation Rules**
1. Fractional sales: `lib/services/fractional-sales-rule-validation-service.ts`
2. Vendors: `lib/utils/vendor-validation.ts` and `app/(main)/vendor-management/lib/services/vendor-validation.ts`
3. Prices: `lib/services/price-validation-engine.ts`
4. Data quality: `lib/services/data-quality-service.ts`

### **To Find Type Definitions**
1. Business rules types: `lib/types/business-rules.ts`
2. General types: `lib/types.ts` (main type definitions)

---

## Implementation Verification

To verify a business rule implementation:

1. **Check the service file** for the business logic
2. **Look for corresponding test files** in `__tests__` directories
3. **Find component usage** to see how rules are applied in UI
4. **Review type definitions** to understand data structures
5. **Check database services** for persistence logic

### Example: Verifying RBAC Rules

```typescript
// 1. Service implementation
import { PRRBACService } from '@/app/(main)/procurement/purchase-requests/services/rbac-service'

// 2. Field permissions utility
import { getFieldPermissions } from '@/lib/utils/field-permissions'

// 3. Component usage
// Check components that use these services

// 4. Type definitions
import { UserRole, PRStatus, FieldPermissions } from '@/lib/types'
```

---

## Notes

- All paths are relative to the project root directory
- Services follow dependency injection patterns for testability
- Type definitions provide compile-time validation of business rules
- Database services handle persistence while business services handle logic
- Caching services optimize performance for frequently used calculations

**For detailed business rule specifications, see**: [BUSINESS-RULES-SUMMARY.md](BUSINESS-RULES-SUMMARY.md)

**For development guidelines, see**: [CLAUDE.md](../CLAUDE.md)
