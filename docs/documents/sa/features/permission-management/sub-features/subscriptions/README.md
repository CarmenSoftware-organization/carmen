# Subscriptions Management

> **Feature:** Permission Management > Subscriptions
> **Pages:** 2
> **Status:** ✅ Production Ready

---

## Overview

The Subscriptions Management sub-feature provides comprehensive control over Carmen ERP subscription packages, feature activation, resource limits, billing information, and usage analytics. This system enables organizations to manage their subscription tier, activate/deactivate specific features, monitor resource usage, and handle billing seamlessly.

### Key Features

1. **Package Management** - Compare and switch between subscription tiers
2. **Resource Activation** - Enable/disable individual features within subscription limits
3. **Usage Monitoring** - Real-time tracking of resource consumption
4. **Billing Management** - Payment methods, invoices, and billing information
5. **Usage Analytics** - Historical usage data and trend analysis
6. **Limit Enforcement** - Automatic feature gating based on subscription limits

---

## Page Structure

### 1. Subscription Management Main Page
**Route:** `/system-administration/permission-management/subscription`

#### Layout
The page uses a tabbed interface with 4 main sections:
- Packages
- Resources
- Billing
- Analytics

#### Tab 1: Packages

**Purpose**: Compare subscription tiers and manage package selection

**Components**:
- **Current Subscription Card**
  - Package name and tier
  - Billing cycle (monthly/annual)
  - Renewal date
  - Status badge
  - Usage summary

- **Package Comparison Grid**
  - 3-4 package cards (Starter, Professional, Enterprise, Custom)
  - Feature comparison matrix
  - Pricing information
  - Highlight differences from current plan

- **Package Selector**
  - Interactive package cards
  - Feature lists with checkmarks
  - "Upgrade" / "Downgrade" buttons
  - Custom package inquiry option

**Features**:
- Side-by-side package comparison
- Upgrade/downgrade flows
- Proration calculation
- Trial period information
- Contact sales for custom plans

**User Actions**:
- View package details
- Compare features
- Upgrade to higher tier
- Downgrade to lower tier (with confirmation)
- Request custom quote
- View pricing details

**Package Tiers**:

```typescript
interface Package {
  type: 'starter' | 'professional' | 'enterprise' | 'custom';
  name: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
  limits: {
    users: number;
    locations: number;
    storage: number; // GB
    apiCalls: number; // per month
    transactions: number; // per month
  };
  features: string[];
  support: {
    level: string;
    responseTime: string;
    channels: string[];
  };
  highlighted?: boolean; // Recommended
}
```

**Example Packages**:

**Starter**:
- Up to 10 users
- 2 locations
- 50 GB storage
- 10,000 API calls/month
- Basic features
- Email support
- $99/month or $950/year

**Professional**:
- Up to 50 users
- 10 locations
- 500 GB storage
- 100,000 API calls/month
- Advanced features
- Priority support
- $499/month or $4,800/year

**Enterprise**:
- Unlimited users
- Unlimited locations
- 5 TB storage
- 1M API calls/month
- All features
- 24/7 dedicated support
- Custom pricing

#### Tab 2: Resources

**Purpose**: Manage feature activation and resource limits

**Components**:
- **Resource Categories**
  - Core Features
  - Advanced Features
  - Integrations
  - Add-ons

- **Resource Activation Cards**
  - Feature name and description
  - Toggle switch (enabled/disabled)
  - Usage indicator
  - Limit settings (if applicable)
  - Availability in current package

- **Resource Limits Configuration**
  - User limit slider
  - Storage limit slider
  - API call limit input
  - Transaction limit input
  - Custom limits (if allowed)

- **Usage Overview**
  - Current usage vs. limits
  - Progress bars for each resource
  - Warning indicators (approaching limit)
  - Upgrade prompts (if over limit)

**Features**:
- Enable/disable individual features
- Adjust resource limits (within package constraints)
- View feature dependencies
- Monitor real-time usage
- Upgrade prompts for premium features

**User Actions**:
- Toggle feature on/off
- Adjust limits (if package allows)
- View feature documentation
- Check feature dependencies
- Request limit increase

**Resource Types**:

```typescript
interface Resource {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'integration' | 'addon';
  enabled: boolean;
  availableIn: PackageType[];
  limits?: {
    type: 'users' | 'storage' | 'api_calls' | 'custom';
    current: number;
    max: number;
    unit: string;
  };
  dependencies?: string[]; // Other resource IDs
}
```

**Example Resources**:
- **Core**: User Management, Inventory Management, Purchase Requests
- **Advanced**: ABAC Policies, Workflow Automation, Advanced Analytics
- **Integrations**: POS Integration, Accounting Software, Payment Gateways
- **Add-ons**: Mobile App, API Access, Custom Reports

#### Tab 3: Billing

**Purpose**: Manage payment methods and billing information

**Sections**:

**Billing Information**
- Company name
- Billing email
- Billing address
- Tax ID / VAT number
- Currency preference

**Payment Methods**
- Credit/debit card details
  - Card type (Visa, Mastercard, Amex)
  - Last 4 digits
  - Expiry date
  - Set as default option
- Bank transfer information
- Invoice payment option

**Invoice Settings**
- Invoice frequency (monthly, annual)
- Invoice delivery (email, download)
- Invoice format (PDF, CSV)
- Auto-download enabled

**Invoice History**
- Table of past invoices
- Columns: Invoice #, Date, Amount, Status, Actions
- Download PDF
- View details
- Payment status (Paid, Pending, Overdue)

**Features**:
- Add/edit payment methods
- Update billing address
- Set default payment method
- Manage invoice preferences
- View payment history
- Download invoices
- Set up auto-payment

**User Actions**:
- Update billing information
- Add new payment method
- Remove payment method
- Download invoice
- View invoice details
- Update invoice settings
- Contact billing support

**Data Models**:

```typescript
interface BillingInformation {
  company: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'invoice';
  isDefault: boolean;
  // Card specific
  cardBrand?: string;
  cardLast4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  // Bank transfer specific
  accountNumber?: string;
  routingNumber?: string;
}

interface Invoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  pdfUrl: string;
}
```

#### Tab 4: Analytics

**Purpose**: Monitor resource usage and analyze trends

**Components**:

**Usage Summary Cards**
- Users (active users vs. limit)
- Storage (used vs. total)
- API Calls (this month)
- Transactions (this month)
- Locations (active vs. limit)

**Usage Charts**
- **User Growth**: Line chart showing active users over time
- **Storage Consumption**: Area chart of storage usage
- **API Usage**: Bar chart of API calls per day/week
- **Feature Usage**: Pie chart of most-used features
- **Location Activity**: Bar chart of activity per location

**Usage Breakdown**
- By module (which modules use most resources)
- By user (top resource consumers)
- By location (resource usage per location)
- By feature (most/least used features)

**Export Options**
- Export data to CSV/Excel
- Generate PDF report
- Email report
- Schedule automated reports

**Time Period Selector**
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

**Features**:
- Real-time usage monitoring
- Historical usage trends
- Usage forecasting
- Anomaly detection
- Usage alerts
- Comparative analysis (period over period)

**User Actions**:
- Select time period
- Filter by resource type
- Export usage data
- Schedule reports
- Set usage alerts
- View detailed breakdowns

**Data Models**:

```typescript
interface UsageMetrics {
  period: {
    start: Date;
    end: Date;
  };
  users: {
    total: number;
    active: number;
    limit: number;
  };
  storage: {
    used: number; // GB
    limit: number; // GB
  };
  apiCalls: {
    count: number;
    limit: number;
  };
  transactions: {
    count: number;
    limit: number;
  };
  byModule: Record<string, number>;
  byLocation: Record<string, number>;
  byFeature: Record<string, number>;
}
```

### 2. Multiple Subscriptions Page
**Route:** `/system-administration/permission-management/subscriptions`

#### Purpose
For organizations managing multiple subscriptions (e.g., different divisions, subsidiaries)

**Features**:
- List of all subscriptions
- Switch between subscriptions
- Compare subscriptions
- Consolidated billing
- Cross-subscription analytics

**Layout**:
- Subscription cards grid
- Quick filters (by status, package, division)
- Consolidated usage summary
- Bulk operations

**Use Cases**:
- Multi-division organizations
- Franchise management
- Holding companies
- Agency managing client subscriptions

---

## Component Architecture

### PackageSelector Component
**File:** `components/permissions/subscription/package-selector.tsx`

**Props**:
- `packages`: Array of available packages
- `currentSubscription`: Current subscription details
- `onPackageSelect`: Callback when package selected
- `onUpgrade`, `onDowngrade`: Callbacks for tier changes

**Features**:
- Package comparison grid
- Feature highlights
- Pricing display
- Upgrade/downgrade buttons
- Trial information

### ResourceActivation Component
**File:** `components/permissions/subscription/resource-activation.tsx`

**Props**:
- `package`: Current package details
- `subscription`: Current subscription
- `showAnalytics`: Show usage analytics
- `onResourceToggle`: Callback for feature toggle
- `onLimitUpdate`: Callback for limit changes

**Features**:
- Resource category organization
- Toggle switches
- Limit sliders
- Usage progress bars
- Dependency warnings

### BillingPaymentInfo Component
**File:** `components/permissions/subscription/billing-payment-info.tsx`

**Props**:
- `subscription`: Current subscription
- `onPaymentMethodUpdate`: Callback for payment updates
- `onBillingAddressUpdate`: Callback for address updates
- `onInvoiceSettingsUpdate`: Callback for invoice settings
- `onDownloadInvoice`: Callback for invoice download

**Features**:
- Billing form
- Payment method management
- Invoice list
- Download functionality

### UsageAnalytics Component
**File:** `components/permissions/subscription/usage-analytics.tsx`

**Props**:
- `subscription`: Current subscription
- `onExportData`: Callback for data export

**Features**:
- Usage charts (Recharts library)
- Time period selector
- Export functionality
- Usage breakdown tables

---

## State Management

### useSubscriptionStore (Zustand)

```typescript
interface SubscriptionStore {
  // State
  subscription: Subscription | null;
  packages: Package[];
  usage: UsageMetrics | null;
  isLoading: boolean;

  // Actions
  fetchSubscription: () => Promise<void>;
  updatePackage: (packageType: PackageType) => Promise<void>;
  toggleResource: (resourceId: string, enabled: boolean) => Promise<void>;
  updateBilling: (billing: BillingInformation) => Promise<void>;
  fetchUsage: (period: DateRange) => Promise<void>;

  // Computed
  getRemainingQuota: (resourceType: string) => number;
  isFeatureAvailable: (featureId: string) => boolean;
  isLimitExceeded: (resourceType: string) => boolean;
}
```

---

## API Integration

### GET /api/subscriptions
Get current subscription details

**Response**:
```json
{
  "subscription": Subscription,
  "availablePackages": Package[],
  "usage": UsageMetrics
}
```

### PUT /api/subscriptions/package
Update subscription package

**Request**:
```json
{
  "packageType": "professional",
  "billingCycle": "annual"
}
```

**Response**:
```json
{
  "subscription": Subscription,
  "prorationAmount": 150.00,
  "effectiveDate": "2025-02-01"
}
```

### POST /api/subscriptions/resources
Toggle resource activation

**Request**:
```json
{
  "resourceId": "pos-integration",
  "enabled": true
}
```

### PUT /api/subscriptions/billing
Update billing information

**Request**: `BillingInformation`

### GET /api/subscriptions/usage
Get usage metrics

**Query**: `period=last_30_days`

**Response**: `UsageMetrics`

### GET /api/subscriptions/invoices
List invoices

**Response**: `Invoice[]`

### GET /api/subscriptions/invoices/:id/download
Download invoice PDF

---

## Business Rules

### Package Changes

1. **Upgrade Immediate**: Upgrades take effect immediately with prorated charges
2. **Downgrade Delayed**: Downgrades take effect at next renewal date
3. **Feature Retention**: Downgrading disables features not in new package
4. **Data Retention**: All data preserved during downgrade (but may be inaccessible)
5. **Trial Period**: 14-day trial for Professional/Enterprise packages

### Resource Limits

1. **Soft Limits**: Warning at 80% usage
2. **Hard Limits**: Features disabled at 100% usage
3. **Grace Period**: 7-day grace period for billing failures
4. **Overage Charges**: Some resources allow overage with additional charges
5. **Custom Limits**: Enterprise plans can request custom limits

### Billing

1. **Auto-Renewal**: Subscriptions auto-renew unless cancelled
2. **Cancellation**: 30-day notice required for annual plans
3. **Refund Policy**: Pro-rated refunds for annual plans
4. **Payment Retry**: 3 automatic retry attempts for failed payments
5. **Suspension**: Account suspended after 7 days of unpaid invoices

---

## User Guide

### Upgrading Package

1. Navigate to Subscription → Packages
2. Review available packages
3. Click "Upgrade" on desired package
4. Review changes and pricing
5. Confirm upgrade
6. Payment processed immediately
7. New features activated

### Managing Resources

1. Navigate to Subscription → Resources
2. Browse resource categories
3. Toggle features on/off
4. Adjust limits (if allowed)
5. Save changes
6. Features activate immediately

### Updating Billing Information

1. Navigate to Subscription → Billing
2. Click "Edit Billing Information"
3. Update company details
4. Update billing address
5. Save changes
6. Confirmation email sent

### Viewing Usage Analytics

1. Navigate to Subscription → Analytics
2. Select time period
3. View usage charts
4. Export data if needed
5. Set up usage alerts
6. Schedule automated reports

---

## Troubleshooting

### Issue: Feature not activating

**Solutions**:
- Check if feature available in current package
- Verify subscription status is active
- Check if limit has been reached
- Clear cache and retry
- Contact support if issue persists

### Issue: Payment failed

**Solutions**:
- Verify payment method is valid
- Check card expiry date
- Ensure sufficient funds
- Update billing address
- Try alternative payment method
- Contact billing support

### Issue: Usage exceeds limit

**Solutions**:
- Review usage analytics
- Identify high-usage areas
- Optimize resource consumption
- Upgrade to higher tier
- Request temporary limit increase
- Enable overage charges

---

## Screenshots

See [screenshots directory](./screenshots/) for visual examples.

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
