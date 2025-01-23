# Goods Received Note Module - Business Analysis Documentation

### 3.5 UI Rules
- **GRN_021**: GRN list must display key information (GRN number, vendor, date, status, total)
- **GRN_022**: Item grid must support inline editing for received quantities and actual costs
- **GRN_023**: Financial summary must update in real-time as items are modified
- **GRN_024**: Status changes must be reflected immediately in the UI
- **GRN_025**: Validation errors must be displayed clearly next to relevant fields
- **GRN_026**: Required fields must be visually marked with asterisk (*)
- **GRN_027**: Currency fields must display appropriate currency symbols
- **GRN_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **GRN_029**: Action buttons must be disabled based on user permissions
- **GRN_030**: Print preview must match final GRN document format
- **GRN_031**: All monetary amounts must be displayed with 2 decimal places
- **GRN_032**: All quantities must be displayed with 3 decimal places
- **GRN_033**: Exchange rates must be displayed with 5 decimal places
- **GRN_034**: All numeric values must be right-aligned
- **GRN_035**: All numeric values must use system's regional numeric format
- **GRN_036**: Date inputs must enforce regional format validation
- **GRN_037**: Date/time values must be stored as timestamptz in UTC
- **GRN_038**: Time zone conversions must respect daylight saving rules
- **GRN_039**: Calendar controls must indicate working days and holidays
- **GRN_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **GRN_041**: Item subtotal = Round(Received Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **GRN_042**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **GRN_043**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **GRN_044**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **GRN_045**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **GRN_046**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **GRN_047**: Receipt subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **GRN_048**: Receipt total discount = Round(Sum of Round(item discounts, 2), 2)
- **GRN_049**: Receipt total tax = Round(Sum of Round(item taxes, 2), 2)
- **GRN_050**: Receipt final total = Round(Round(Receipt subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **GRN_051**: All intermediate calculations must be rounded before use in subsequent calculations
- **GRN_052**: Final rounding must use half-up (banker's) rounding method
- **GRN_053**: Quantity conversions must be rounded to 3 decimals before use
- **GRN_054**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **GRN_055**: Regional numeric format must be applied after all calculations and rounding
- **GRN_056**: Each step in multi-step calculations must round intermediate results
- **GRN_057**: Running totals must be rounded before adding each new value
- **GRN_058**: Percentage calculations must round result before applying to base amount
- **GRN_059**: Cross-currency calculations must round after each currency conversion
- **GRN_060**: Tax-inclusive price breakdowns must round each component
- **GRN_061**: Variance calculations between PO and actual received quantities must be rounded to 3 decimals
- **GRN_062**: Cost variance calculations between PO and actual costs must be rounded to 2 decimals
- **GRN_063**: Average cost calculations must maintain 5 decimal precision before final rounding
- **GRN_064**: Landed cost allocations must be rounded to 2 decimals for each component
- **GRN_065**: Inventory value adjustments must be rounded to 2 decimals

## 4. Data Definitions 