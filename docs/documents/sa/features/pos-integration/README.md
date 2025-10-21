# POS Integration

> **Feature:** System Administration > POS Integration
> **Pages:** 15
> **Status:** ✅ Production Ready

---

## Overview

The POS Integration feature provides comprehensive connectivity between Carmen ERP and external Point-of-Sale (POS) systems. This integration enables automated synchronization of sales data, inventory deductions, mapping of POS items to system recipes, and detailed reporting on consumption and profitability.

### Key Capabilities

1. **Real-Time Synchronization** - Automatic sync of sales transactions from POS to ERP
2. **Intelligent Mapping** - Map POS items to recipes, units, and locations
3. **Fractional Sales Management** - Handle pizza slices, cake portions, and multi-yield items
4. **Consumption Tracking** - Monitor actual vs. theoretical ingredient usage
5. **Profitability Analysis** - Calculate gross profit by category and item
6. **Automated Inventory Deduction** - Automatic stock-out based on POS sales
7. **Stock-out Approval Workflow** - Review and approve inventory deductions

### Supported POS Systems

- Comanche POS (Primary integration)
- Square (via API connector)
- Toast (via API connector)
- Custom POS (via webhook integration)

---

## Feature Architecture

```
POS Integration
├── Setup (Configuration & Settings)
│   ├── POS Configuration
│   ├── System Settings
│   └── Connection Status
├── Mapping (Data Synchronization)
│   ├── Recipe Mapping
│   ├── Fractional Variants Mapping
│   ├── Unit Mapping
│   └── Location Mapping
├── Operations (Transaction Management)
│   ├── Transaction View
│   ├── Failed Transactions
│   └── Stock-out Review
└── Reporting (Analytics)
    ├── Gross Profit Report
    ├── Consumption Report
    └── Sales Analytics
```

---

## Page Structure

### 1. POS Integration Dashboard
**Route:** `/system-administration/system-integrations/pos`

#### Purpose
Central hub for POS integration management with real-time status and quick access to all features.

#### Sections:

**System Status Card**
- Connection status (Connected/Disconnected)
- Last sync timestamp
- Alert indicators:
  - Unmapped items count
  - Failed transactions count
  - Pending approvals count
  - Unmapped fractional variants count
- Quick action buttons to resolve issues

**Setup Section**
- POS Configuration
- System Settings
- Connection status with refresh
- Quick setup access

**Mapping Section**
- Recipe Mapping (with unmapped count)
- Unit Mapping
- Location Mapping
- Fractional Sales Management (pizza slices, cake portions)
- Quick mapping access

**Operations Section**
- View Transactions
- Failed Transactions (with count)
- Stock-out Review (with pending count)
- Quick operations access

**Reporting Section**
- Gross Profit Analysis
- Consumption Report
- Today's sales summary with progress bar

**Recent Activity Table**
- Recent transactions
- Mapping updates
- Stock-out approvals
- Fractional sales activity
- Time, type, description, status, actions

### 2. POS Configuration
**Route:** `/system-administration/system-integrations/pos/settings/config`

#### Form Sections:

**API Configuration**
- POS System Type (dropdown: Comanche, Square, Toast, Custom)
- API Endpoint URL
- API Key/Token (secured input)
- API Version
- Connection timeout settings

**Sync Settings**
- Auto-sync enabled toggle
- Sync frequency (minutes)
- Sync time range (hours back to fetch)
- Retry attempts on failure
- Error notification recipients

**Transaction Settings**
- Transaction batch size
- Include voided transactions toggle
- Include refunds toggle
- Minimum transaction amount filter

**Advanced Settings**
- Debug mode toggle
- Webhook URL (for push updates)
- Custom headers (JSON editor)
- SSL certificate verification

**Test Connection**
- Test button to validate configuration
- Connection status display
- Error messages with troubleshooting tips

### 3. System Settings
**Route:** `/system-administration/system-integrations/pos/settings/system`

#### Workflow Settings:

**Stock-out Approval**
- Require approval for stock-outs toggle
- Auto-approve threshold amount
- Approval routing (user/role)
- Notification settings

**Mapping Automation**
- Auto-create recipes for unmapped items toggle
- Default category for new items
- Require manual review toggle

**Notifications**
- Email notifications for failed transactions
- Slack/Teams webhooks for alerts
- Notification frequency (immediate, daily digest)

**Data Retention**
- Transaction history retention (days)
- Log retention (days)
- Auto-archive old data toggle

### 4. Recipe Mapping
**Route:** `/system-administration/system-integrations/pos/mapping/recipes`

#### Features:

**Mapping Table**
- Columns:
  - POS Item ID
  - POS Item Name
  - POS Category
  - Mapped Recipe (dropdown)
  - Mapping Status (badge)
  - Portion Size
  - Actions
- Filters:
  - Status (Mapped, Unmapped, All)
  - Category
  - Search by name
- Bulk actions:
  - Bulk map to recipe
  - Export mappings
  - Import mappings (CSV)

**Mapping Drawer**
- POS item details
- Recipe selector (searchable dropdown)
- Portion size input
- Unit selector
- Cost override (optional)
- Save mapping button

**Auto-Mapping Suggestions**
- AI-suggested mappings based on name similarity
- Accept/reject suggestions
- Confidence score indicator

### 5. Fractional Variants Mapping
**Route:** `/system-administration/system-integrations/pos/mapping/recipes/fractional-variants`

#### Purpose
Manage mapping for items sold in fractions (pizza slices, cake slices, etc.).

#### Features:

**Fractional Recipe Table**
- Base Recipe (e.g., "Large Pepperoni Pizza")
- Total Yield (e.g., 8 slices)
- POS Variant Items (list of slice SKUs)
- Fractional Units (e.g., "1/8 pizza")
- Inventory Deduction Logic
- Status

**Variant Mapping Interface**
- Select base recipe
- Define total yield (portions)
- Map POS slice items
- Set fractional deduction (1/8, 1/6, etc.)
- Preview inventory impact

**Supported Fractional Types**
- Pizza (by slice)
- Cakes (by slice/portion)
- Whole items with partial sales
- Multi-yield recipes (e.g., batch items)

**Deduction Logic**
- Automatic fractional inventory deduction
- Rounding rules (nearest whole, ceiling, floor)
- Threshold for full unit deduction
- Audit trail of fractional deductions

### 6. Unit Mapping
**Route:** `/system-administration/system-integrations/pos/mapping/units`

#### Purpose
Map POS measurement units to system units with conversion factors.

#### Mapping Table:
- POS Unit (e.g., "oz", "lb", "each")
- System Unit (dropdown)
- Conversion Factor
- Status
- Actions

#### Unit Converter:
- Source unit
- Target unit
- Conversion factor calculation
- Test conversion

### 7. Location Mapping
**Route:** `/system-administration/system-integrations/pos/mapping/locations`

#### Purpose
Map POS store locations to Carmen ERP locations.

#### Mapping Table:
- POS Location ID
- POS Location Name
- System Location (dropdown)
- Default Department
- Status
- Actions

#### Multi-Location Support:
- Handle franchises
- Central kitchen mappings
- Transfer tracking between locations

### 8. Transactions View
**Route:** `/system-administration/system-integrations/pos/transactions`

#### Features:

**Transaction Table**
- Columns:
  - Transaction ID
  - Date/Time
  - POS Location
  - Item Count
  - Total Amount
  - Status (Success, Failed, Pending)
  - Actions
- Filters:
  - Date range
  - Location
  - Status
  - Amount range
- Bulk actions:
  - Retry failed transactions
  - Export to CSV
  - Generate report

**Transaction Detail Drawer**
- Transaction header (ID, date, location, amount)
- Line items table
- Inventory deductions applied
- Error details (if failed)
- Retry/resolve buttons
- Audit log

**Failed Transaction Handling**
- Error categorization
- Retry logic
- Manual resolution
- Error notifications

### 9. Stock-out Review
**Route:** `/system-administration/system-integrations/pos/transactions/stock-out-review`

#### Purpose
Review and approve inventory deductions from POS sales before finalizing.

#### Approval Queue Table:
- Transaction ID
- Date/Time
- Location
- Items Sold
- Inventory Impact
- Requester
- Status
- Actions (Approve, Reject, Review)

#### Approval Workflow:
1. POS transaction synced
2. Inventory impact calculated
3. Approval request generated
4. Reviewer notified
5. Review item details
6. Approve/reject/request changes
7. Inventory deducted (if approved)

#### Bulk Approval:
- Select multiple transactions
- Review aggregate impact
- Bulk approve/reject
- Approval notes

### 10. Reports Home
**Route:** `/system-administration/system-integrations/pos/reports`

#### Available Reports:
- Gross Profit Analysis
- Consumption Report
- Sales Trends
- Top Selling Items
- Slow-Moving Items
- Variance Analysis

#### Quick Stats:
- Today's sales
- This week's sales
- Top categories
- Average transaction value

### 11. Gross Profit Report
**Route:** `/system-administration/system-integrations/pos/reports/gross-profit`

#### Features:

**Report Filters**
- Date range
- Location
- Category
- Item

**Report Sections**

**Summary Cards**
- Total Sales Revenue
- Total Cost of Goods Sold (COGS)
- Gross Profit Amount
- Gross Profit Margin %

**Profit by Category**
- Table with columns:
  - Category
  - Revenue
  - COGS
  - Gross Profit
  - Margin %
  - Units Sold
- Bar chart visualization
- Drill-down to items

**Profit by Item**
- Item name
- Quantity sold
- Revenue
- Unit cost
- Total COGS
- Gross profit
- Margin %
- Sortable columns

**Trend Analysis**
- Line chart: Profit over time
- Comparison to previous period
- Seasonal trends

**Export Options**
- PDF report
- Excel spreadsheet
- CSV data

### 12. Consumption Report
**Route:** `/system-administration/system-integrations/pos/reports/consumption`

#### Purpose
Compare theoretical ingredient usage (based on recipes) vs. actual inventory deductions.

#### Report Sections:

**Variance Summary**
- Total Theoretical Usage
- Total Actual Usage
- Total Variance
- Variance %

**Variance by Ingredient**
- Table columns:
  - Ingredient Name
  - Theoretical Qty
  - Actual Qty
  - Variance Qty
  - Variance %
  - Value Impact
  - Status (Over/Under/Normal)
- Color-coded variance indicators
- Drill-down to transactions

**Variance Analysis**
- Identify ingredients with high variance
- Possible causes (wastage, theft, recipe errors)
- Recommendations

**Trend Charts**
- Variance trends over time
- By location
- By category

**Investigation Tools**
- Filter by high variance threshold
- Analyze specific time periods
- Compare locations
- Export detailed transaction log

---

## Data Models

### POS Transaction

```typescript
interface POSTransaction {
  // Identity
  id: string;
  posTransactionId: string;
  posSystemType: 'comanche' | 'square' | 'toast' | 'custom';

  // Transaction Details
  transactionDate: Date;
  locationId: string;
  locationName: string;
  terminalId?: string;
  employeeId?: string;

  // Items
  items: POSTransactionItem[];

  // Totals
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;

  // Processing
  status: 'success' | 'failed' | 'pending' | 'processing';
  syncedAt: Date;
  errorMessage?: string;
  retryCount: number;

  // Inventory Impact
  inventoryDeducted: boolean;
  deductionApproved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

interface POSTransactionItem {
  id: string;
  posItemId: string;
  posItemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  modifiers?: POSModifier[];

  // Mapping
  recipeId?: string;
  recipeName?: string;
  isFractional: boolean;
  fractionalDeduction?: {
    baseRecipeId: string;
    fractionalAmount: number; // e.g., 0.125 for 1/8
    totalYield: number; // e.g., 8 slices
  };

  // Inventory
  inventoryImpact?: IngredientDeduction[];
}

interface POSModifier {
  id: string;
  name: string;
  price: number;
  recipeId?: string; // If modifier has recipe
}

interface IngredientDeduction {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
}
```

### POS Mapping

```typescript
interface RecipeMapping {
  id: string;
  posItemId: string;
  posItemName: string;
  posCategory?: string;

  recipeId: string;
  recipeName: string;

  portionSize: number;
  portionUnit: string;

  isFractional: boolean;
  fractionalConfig?: FractionalConfig;

  costOverride?: number;

  status: 'active' | 'inactive';
  autoMapped: boolean;
  confidence?: number; // For AI suggestions

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FractionalConfig {
  baseRecipeId: string;
  totalYield: number;
  fractionalUnit: string; // e.g., "1/8 pizza"
  deductionLogic: 'fractional' | 'threshold' | 'batch';
  roundingRule: 'nearest' | 'ceiling' | 'floor';
  thresholdForFullUnit?: number; // e.g., 6 slices triggers full pizza deduction
}

interface UnitMapping {
  id: string;
  posUnit: string;
  systemUnitId: string;
  systemUnitName: string;
  conversionFactor: number;
  status: 'active' | 'inactive';
}

interface LocationMapping {
  id: string;
  posLocationId: string;
  posLocationName: string;
  systemLocationId: string;
  systemLocationName: string;
  defaultDepartment?: string;
  status: 'active' | 'inactive';
}
```

### POS Configuration

```typescript
interface POSConfiguration {
  id: string;
  organizationId: string;

  // API Settings
  posSystemType: 'comanche' | 'square' | 'toast' | 'custom';
  apiEndpoint: string;
  apiKey: string; // Encrypted
  apiVersion?: string;
  connectionTimeout: number; // seconds

  // Sync Settings
  autoSyncEnabled: boolean;
  syncFrequency: number; // minutes
  syncTimeRange: number; // hours back
  retryAttempts: number;
  errorNotificationEmails: string[];

  // Transaction Settings
  batchSize: number;
  includeVoidedTransactions: boolean;
  includeRefunds: boolean;
  minTransactionAmount?: number;

  // Advanced
  debugMode: boolean;
  webhookUrl?: string;
  customHeaders?: Record<string, string>;
  verifySsl: boolean;

  // Status
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  lastError?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface SystemSettings {
  // Stock-out Approval
  requireStockoutApproval: boolean;
  autoApproveThreshold?: number;
  approvalRoutingUserId?: string;
  approvalRoutingRoleId?: string;

  // Mapping Automation
  autoCreateRecipes: boolean;
  defaultCategory?: string;
  requireManualReview: boolean;

  // Notifications
  emailNotificationsEnabled: boolean;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
  notificationFrequency: 'immediate' | 'daily_digest';

  // Data Retention
  transactionRetentionDays: number;
  logRetentionDays: number;
  autoArchive: boolean;
}
```

---

## Component Architecture

### POSIntegrationDashboard
**File:** `app/(main)/system-administration/system-integrations/pos/page.tsx`

**Features**:
- System status overview
- Quick action cards (Setup, Mapping, Operations, Reporting)
- Alert indicators
- Recent activity table
- Responsive grid layout

### MappingDataTable
**File:** `pos/mapping/components/data-table.tsx`

**Props**:
- `data`: Array of mapping items
- `columns`: Column definitions
- `filters`: Active filters
- `onMapItem`: Mapping callback
- `onBulkAction`: Bulk operation callback

**Features**:
- Sortable columns
- Advanced filtering
- Bulk selection
- Quick actions menu
- Export functionality

### TransactionDetailDrawer
**Features**:
- Transaction header
- Line items table
- Inventory impact breakdown
- Error details
- Action buttons (retry, resolve)
- Audit trail

### FractionalVariantMapper
**Features**:
- Base recipe selector
- Yield configuration
- POS variant mapping
- Deduction logic settings
- Preview calculations

### GrossProfitChart
**Features**:
- Recharts integration
- Category breakdown
- Trend visualization
- Interactive tooltips
- Export options

---

## State Management

### usePOSStore (Zustand)

```typescript
interface POSStore {
  // Configuration
  configuration: POSConfiguration | null;
  systemSettings: SystemSettings | null;

  // Mappings
  recipeMappings: RecipeMapping[];
  unitMappings: UnitMapping[];
  locationMappings: LocationMapping[];

  // Transactions
  transactions: POSTransaction[];
  pendingApprovals: POSTransaction[];

  // Status
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastSync: Date | null;
  isLoading: boolean;

  // Actions
  fetchConfiguration: () => Promise<void>;
  updateConfiguration: (config: Partial<POSConfiguration>) => Promise<void>;
  testConnection: () => Promise<boolean>;

  fetchMappings: (type: 'recipe' | 'unit' | 'location') => Promise<void>;
  createMapping: (type: string, mapping: any) => Promise<void>;
  updateMapping: (type: string, id: string, mapping: any) => Promise<void>;

  fetchTransactions: (filters: any) => Promise<void>;
  retryTransaction: (id: string) => Promise<void>;
  approveStockout: (ids: string[], notes?: string) => Promise<void>;

  triggerSync: () => Promise<void>;
}
```

---

## API Integration

### Configuration Endpoints

```http
GET /api/pos/configuration
PUT /api/pos/configuration
POST /api/pos/configuration/test-connection
POST /api/pos/configuration/trigger-sync
```

### Mapping Endpoints

```http
GET /api/pos/mappings/recipes
POST /api/pos/mappings/recipes
PUT /api/pos/mappings/recipes/:id
DELETE /api/pos/mappings/recipes/:id
POST /api/pos/mappings/recipes/bulk
POST /api/pos/mappings/recipes/import (CSV upload)
GET /api/pos/mappings/recipes/export

GET /api/pos/mappings/units
POST /api/pos/mappings/units
PUT /api/pos/mappings/units/:id

GET /api/pos/mappings/locations
POST /api/pos/mappings/locations
PUT /api/pos/mappings/locations/:id
```

### Transaction Endpoints

```http
GET /api/pos/transactions
GET /api/pos/transactions/:id
POST /api/pos/transactions/:id/retry
POST /api/pos/transactions/bulk-retry

GET /api/pos/stockout-approvals
POST /api/pos/stockout-approvals/approve
POST /api/pos/stockout-approvals/reject
```

### Reporting Endpoints

```http
GET /api/pos/reports/gross-profit
GET /api/pos/reports/consumption
GET /api/pos/reports/sales-summary
POST /api/pos/reports/export
```

---

## Business Rules

### Transaction Sync

1. **Sync Frequency**: Configurable (default: every 15 minutes)
2. **Batch Processing**: Process in batches of 100 transactions
3. **Retry Logic**: 3 automatic retries with exponential backoff
4. **Error Handling**: Failed transactions logged and flagged for manual review
5. **Duplicate Prevention**: Transaction ID uniqueness check

### Inventory Deduction

1. **Mapping Required**: Only mapped items trigger inventory deduction
2. **Approval Workflow**: Optional approval for stock-outs above threshold
3. **Fractional Handling**: Automatic fractional deduction with rounding
4. **Cost Calculation**: Use recipe cost or cost override
5. **Audit Trail**: All deductions logged with transaction reference

### Fractional Sales

1. **Yield Validation**: Total yield must be positive integer
2. **Fractional Accuracy**: Deductions accurate to 1/100th of unit
3. **Threshold Deduction**: Option to deduct full unit at threshold (e.g., 6/8 slices sold)
4. **Rounding Rules**: Configurable rounding (nearest, ceiling, floor)
5. **Multi-Variant Support**: Multiple POS items can map to same base recipe

---

## User Guide

### Setting Up POS Integration

**Step 1: Configure API Connection**
1. Navigate to Settings → POS Configuration
2. Select POS system type
3. Enter API endpoint and credentials
4. Test connection
5. Configure sync frequency
6. Save configuration

**Step 2: Map Locations**
1. Navigate to Mapping → Locations
2. View detected POS locations
3. Map each POS location to system location
4. Save mappings

**Step 3: Map Units**
1. Navigate to Mapping → Units
2. Map POS units to system units
3. Set conversion factors
4. Test conversions
5. Save mappings

**Step 4: Map Recipes**
1. Navigate to Mapping → Recipes
2. Review unmapped POS items
3. For each item:
   - Select matching recipe
   - Set portion size
   - Choose unit
4. Use auto-suggest for similar names
5. Save mappings

**Step 5: Configure Fractional Items** (If applicable)
1. Navigate to Mapping → Fractional Variants
2. Select base recipe (e.g., Large Pizza)
3. Set total yield (e.g., 8 slices)
4. Map POS slice items
5. Configure deduction logic
6. Save variant configuration

**Step 6: Enable Auto-Sync**
1. Return to Settings → System Settings
2. Enable auto-sync
3. Set sync frequency
4. Configure notifications
5. Save settings

### Daily Operations

**Reviewing Transactions**:
1. Navigate to Transactions
2. Filter by date, location, status
3. Review failed transactions
4. Retry or resolve errors

**Approving Stock-outs**:
1. Navigate to Stock-out Review
2. Review pending approvals
3. Check inventory impact
4. Approve or reject
5. Add approval notes

**Monitoring Reports**:
1. Navigate to Reports
2. Select report type
3. Set date range and filters
4. Review metrics
5. Export data if needed

---

## Troubleshooting

### Connection Issues

**Issue**: Cannot connect to POS system

**Solutions**:
- Verify API endpoint URL
- Check API credentials
- Ensure network connectivity
- Check firewall rules
- Verify SSL certificate (if applicable)
- Review error logs

### Mapping Issues

**Issue**: POS items not appearing for mapping

**Solutions**:
- Trigger manual sync
- Check sync time range settings
- Verify POS API permissions
- Review sync logs for errors

**Issue**: Fractional deductions incorrect

**Solutions**:
- Verify total yield configuration
- Check fractional unit settings
- Review rounding rules
- Test with sample transactions
- Check audit trail

### Transaction Sync Issues

**Issue**: Transactions failing to sync

**Solutions**:
- Check transaction batch size
- Review error messages
- Verify mapping completeness
- Check for data format issues
- Retry failed transactions
- Contact support if persistent

### Inventory Deduction Issues

**Issue**: Inventory not deducting

**Solutions**:
- Verify recipe mapping exists
- Check if approval required
- Review stock-out approval queue
- Ensure sufficient inventory
- Check inventory adjustment permissions

---

## Screenshots

See [screenshots directory](./screenshots/) for visual examples.

---

## Related Documentation

### Detailed Documentation (Coming Soon)

The following detailed documentation pages are in development:

- **Settings Configuration** - POS Configuration and System Settings deep dive
- **Mapping Management** - Recipe, Unit, and Location mapping guides
- **Reports & Analytics** - Gross Profit and Consumption reporting details
- **Transactions Management** - Transaction sync and stock-out approval workflows
- **POS Integration API** - API reference and integration guides

For now, all functionality is documented in the sections above.

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
**Status:** Production Ready
