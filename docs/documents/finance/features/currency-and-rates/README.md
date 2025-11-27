# Currency Management & Exchange Rates

> **Features:** Finance > Currency Management & Exchange Rates
> **Pages:** 4 (2 Currency + 2 Exchange Rates)
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

Currency Management and Exchange Rates provide comprehensive multi-currency support for Carmen ERP, enabling international operations with automatic currency conversion, real-time exchange rate tracking, and accurate financial reporting across multiple currencies.

---

# Currency Management

## Overview

Configure and manage all currencies used in the system, including activation controls, currency descriptions, and integration with transactions across all modules.

### Page Structure

**Route:** `/finance/currency-management`

---

## Data Model

```typescript
interface Currency {
  // Identity
  code: string; // ISO 4217 (3-letter code: USD, EUR, GBP)
  description: string; // Full currency name
  symbol?: string; // Currency symbol ($, €, £)

  // Configuration
  active: boolean; // Enable/disable for transactions
  decimalPlaces?: number; // Decimal precision (default: 2)

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

// Example Currencies
const currencies: Currency[] = [
  {
    code: 'USD',
    description: 'United States Dollar',
    symbol: '$',
    active: true,
    decimalPlaces: 2
  },
  {
    code: 'EUR',
    description: 'Euro',
    symbol: '€',
    active: true,
    decimalPlaces: 2
  },
  {
    code: 'JPY',
    description: 'Japanese Yen',
    symbol: '¥',
    active: true,
    decimalPlaces: 0
  },
  {
    code: 'GBP',
    description: 'British Pound Sterling',
    symbol: '£',
    active: true,
    decimalPlaces: 2
  }
];
```

---

## Features & Functionality

### 1. Currency List View

**Columns:**
- Selection checkbox (for bulk operations)
- **Currency Code**: ISO 4217 code
- **Currency Description**: Full name
- **Active**: Status toggle checkbox
- **Actions**: Edit/Delete options

**Features:**
- Sortable columns
- Multi-select for bulk operations
- Inline activation toggle
- Real-time search filtering
- Active-only filter

### 2. Search & Filter

**Search:**
- Search by currency code
- Search by description
- Real-time filtering
- Case-insensitive

**Filter:**
- "Show Active" checkbox
- Filter active/inactive currencies
- Combined with search

### 3. Currency Operations

**Create Currency:**
1. Click "Create" button
2. Enter currency code (ISO 4217)
3. Enter description
4. Set active status
5. Save

**Activate/Deactivate:**
- Toggle checkbox in Active column
- Immediate update
- Confirmation for deactivation if currency in use

**Delete Currency:**
1. Select currencies via checkbox
2. Click "Delete" button
3. Confirmation dialog
4. Delete if no transactions exist

### 4. Bulk Operations

**Actions:**
- Bulk activate
- Bulk deactivate
- Bulk delete
- Bulk export

**Print:**
- Print currency list
- PDF export
- Filtered results

---

## Business Rules

### Currency Validation

1. **ISO 4217 Compliance**: Currency code must be valid ISO 4217 code
2. **Unique Codes**: No duplicate currency codes allowed
3. **Active Check**: At least one currency must be active (typically base currency)
4. **Delete Protection**: Cannot delete currency with existing transactions
5. **Deactivation Warning**: Warn if deactivating currency with pending transactions

### Currency Configuration

1. **Base Currency**: System designates one base currency (often USD)
2. **Decimal Places**: Configurable per currency (JPY = 0, most others = 2)
3. **Symbol Display**: Optional currency symbol for UI display
4. **Description Required**: Full currency name mandatory

### System Integration

1. **Default Currency**: New transactions default to base currency
2. **Multi-Currency Transactions**: Can create transactions in any active currency
3. **Reporting**: All reports can display in base currency or transaction currency
4. **Exchange Rate Linkage**: Active currencies require exchange rates

---

# Exchange Rate Management

## Overview

Manage exchange rates for currency conversion, supporting both manual entry and automated updates from external sources.

### Page Structure

**Route:** `/finance/exchange-rates`

---

## Data Model

```typescript
interface ExchangeRate {
  // Identity
  code: string; // Currency code (foreign currency)
  name: string; // Currency full name

  // Rate Information
  rate: number; // Exchange rate (6 decimal precision)
  baseCurrency: string; // Base currency (e.g., 'USD')
  rateType: 'manual' | 'automatic' | 'api';

  // Temporal
  effectiveDate: string; // When rate becomes active
  expiryDate?: string; // When rate expires (optional)
  lastUpdated: string; // Last update timestamp

  // Source
  source?: string; // Rate provider (e.g., 'Central Bank', 'XE.com')
  updatedBy?: string; // User who updated (for manual)

  // Metadata
  historical: boolean; // Is this a historical rate?
}

// Example Exchange Rates
const exchangeRates: ExchangeRate[] = [
  {
    code: "USD",
    name: "United States Dollar",
    rate: 1.000000,
    baseCurrency: "USD",
    rateType: "manual",
    effectiveDate: "2023-07-01",
    lastUpdated: "2023-07-01",
    historical: false
  },
  {
    code: "EUR",
    name: "Euro",
    rate: 0.920000,
    baseCurrency: "USD",
    rateType: "api",
    effectiveDate: "2023-07-01",
    lastUpdated: "2023-07-01",
    source: "ECB",
    historical: false
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    rate: 144.500000,
    baseCurrency: "USD",
    rateType: "api",
    effectiveDate: "2023-07-01",
    lastUpdated: "2023-07-01",
    source: "BOJ",
    historical: false
  }
];
```

---

## Features & Functionality

### 1. Exchange Rate Viewer

**Columns:**
- **Currency Code**: ISO code
- **Currency Name**: Full name
- **Rate**: Exchange rate (6 decimals)
- **Last Updated**: Timestamp
- **Actions**: Edit/Delete/History

**Display Features:**
- Current rates only (default)
- Historical rates view (optional)
- Color-coded rate changes (increase/decrease)
- Sortable by any column

### 2. Rate Entry Methods

**Method 1: Manual Entry**
1. Click "Add Rate" button
2. Select currency
3. Enter rate (6 decimal places)
4. Set effective date
5. Optional: Add source/notes
6. Save

**Method 2: CSV Import**
1. Click "Import CSV" button
2. Download template (optional)
3. Prepare CSV file:
   ```csv
   Currency Code,Rate,Effective Date,Source
   EUR,0.920000,2023-07-01,ECB
   JPY,144.500000,2023-07-01,BOJ
   GBP,0.790000,2023-07-01,BoE
   ```
4. Upload file
5. Validate and preview
6. Confirm import

**Method 3: API Integration (Future)**
- Configure API provider
- Schedule automatic updates
- Real-time rate fetching

### 3. Search & Filter

**Search:**
- Currency code
- Currency name
- Quick lookup

**Filter:**
- Date range
- Rate type (manual/automatic/api)
- Currency group (e.g., European, Asian)
- Active currencies only

### 4. Rate History

**Historical Tracking:**
- View all historical rates for a currency
- Compare rates over time
- Rate change percentage
- Trend visualization

**History Table:**
- Effective date
- Rate value
- Rate change (%)
- Source
- Updated by
- Timestamp

---

## Currency Conversion

### Conversion Logic

```typescript
function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRate[]
): number {
  // Both currencies are the same
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get exchange rates
  const fromRate = exchangeRates.find(r => r.code === fromCurrency)?.rate || 1;
  const toRate = exchangeRates.find(r => r.code === toCurrency)?.rate || 1;

  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  const convertedAmount = baseAmount * toRate;

  return convertedAmount;
}

// Example usage
const usdAmount = 100;
const eurRate = 0.92; // 1 USD = 0.92 EUR
const eurAmount = convertCurrency(usdAmount, 'USD', 'EUR', exchangeRates);
// Result: 92.00 EUR
```

### Conversion Rules

1. **Base Currency**: All conversions go through base currency
2. **Rate Precision**: Maintain 6 decimal precision during calculation
3. **Rounding**: Round final result to currency decimal places
4. **Rate Date**: Use rate effective on transaction date
5. **Missing Rate**: Error if no rate available for transaction date

---

## Business Rules

### Exchange Rate Management

1. **Base Currency Rate**: Base currency always has rate of 1.000000
2. **Rate Precision**: All rates stored with 6 decimal places
3. **Effective Date Required**: Every rate must have effective date
4. **Rate History**: System maintains complete rate history
5. **No Retroactive Changes**: Cannot modify historical rates (create new rate instead)

### Rate Updates

1. **Manual Override**: Manual rates take precedence over automatic
2. **Update Frequency**:
   - Manual: On-demand
   - API: Configurable (hourly, daily, weekly)
3. **Rate Validation**: Warn if rate change exceeds threshold (e.g., >10%)
4. **Source Tracking**: Record source of all rate updates

### Transaction Impact

1. **Transaction Currency**: Transactions store original currency amount
2. **Base Currency Equivalent**: Also store base currency amount at transaction time
3. **Rate Locking**: Transaction uses rate from transaction date
4. **Recalculation**: Can recalculate base amounts if rate corrected

---

## Integration Points

### Multi-Currency Transactions

**Purchase Orders:**
```
PO in EUR → Exchange Rate (EUR to USD) → USD Equivalent
```

**Vendor Invoices:**
```
Invoice in GBP → Exchange Rate (GBP to USD) → USD Posting
```

**Sales:**
```
Sale in JPY → Exchange Rate (JPY to USD) → USD Revenue
```

### Financial Reporting

**Currency Presentation:**
- Transactional Currency (original)
- Base Currency (converted)
- Reporting Currency (optional third currency)

**Exchange Gain/Loss:**
- Track realized gains/losses on settlement
- Track unrealized gains/losses on open items
- Automatic GL posting for gains/losses

---

## API Endpoints

```http
# Currency Management
GET /api/finance/currencies
POST /api/finance/currencies
PUT /api/finance/currencies/:code
DELETE /api/finance/currencies/:code
PATCH /api/finance/currencies/:code/activate
PATCH /api/finance/currencies/:code/deactivate

# Exchange Rates
GET /api/finance/exchange-rates
POST /api/finance/exchange-rates
PUT /api/finance/exchange-rates/:id
DELETE /api/finance/exchange-rates/:id

# Rate Lookup
GET /api/finance/exchange-rates/current
GET /api/finance/exchange-rates/history/:code
GET /api/finance/exchange-rates/on-date?date=YYYY-MM-DD
POST /api/finance/exchange-rates/convert

# Bulk Operations
POST /api/finance/exchange-rates/import
GET /api/finance/exchange-rates/export
POST /api/finance/exchange-rates/update-all
```

---

## User Guide

### Adding a Currency

1. Navigate to Currency Management
2. Click "Create" button
3. Enter currency code (e.g., CAD)
4. Enter description (e.g., Canadian Dollar)
5. Check "Active" checkbox
6. Save

### Updating Exchange Rates

**Single Rate:**
1. Navigate to Exchange Rates
2. Find currency row
3. Click edit icon
4. Enter new rate
5. Save

**Bulk Update via CSV:**
1. Click "Import CSV"
2. Download template
3. Fill in rates
4. Upload file
5. Review preview
6. Confirm

### Viewing Rate History

1. Navigate to Exchange Rates
2. Click on currency row
3. Select "View History"
4. Browse historical rates
5. Export history if needed

---

## Troubleshooting

### Issue: Currency Won't Delete
**Cause**: Currency has associated transactions
**Solution**: Deactivate currency instead of deleting

### Issue: Exchange Rate Not Found
**Cause**: No rate configured for transaction date
**Solution**: Add historical rate for that date or use current rate

### Issue: CSV Import Fails
**Cause**: Invalid format or missing required fields
**Solution**: Download template, verify data format, check currency codes

### Issue: Rate Conversion Incorrect
**Cause**: Using wrong base currency or outdated rate
**Solution**: Verify base currency setting, check rate effective dates

---

## Best Practices

### Currency Setup

1. **Complete Setup First**: Configure all currencies before transactions
2. **ISO Compliance**: Always use ISO 4217 codes
3. **Descriptive Names**: Use full currency names
4. **Active Management**: Keep inactive list clean

### Exchange Rate Management

1. **Daily Updates**: Update rates daily for accuracy
2. **Rate Validation**: Cross-check rates with official sources
3. **Historical Preservation**: Never delete historical rates
4. **Audit Trail**: Review rate changes regularly
5. **Backup**: Export rates weekly for backup

### Multi-Currency Operations

1. **Consistent Base**: Use one base currency across organization
2. **Rate Documentation**: Document rate sources and methodology
3. **Threshold Alerts**: Set alerts for significant rate changes
4. **Reconciliation**: Regular forex reconciliation
5. **Reporting**: Use consistent currency for executive reports

---

## Future Enhancements

**Planned Features:**
- Real-time API integration with forex providers
- Automatic rate alerts for significant changes
- Currency basket support
- Forward contract management
- Hedging recommendations
- Multi-base currency support
- Custom conversion rules
- Advanced analytics and trending

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
