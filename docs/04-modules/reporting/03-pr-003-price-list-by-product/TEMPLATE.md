# Price List Detail by Product Report - Template Structure

## Template Layout (Screen View)

```
┌──────────────────────────────────────────────────────────────────┐
│           Price List Detail by Product (Comparison)               │
│                                                                    │
│  Filters:                                                          │
│  ├─ Date From: [____] To: [____]      Category: [All/...]        │
│  ├─ Product: [Multi-select]                                       │
│  └─ Vendor: [Multi-select vendors]                                │
│                                                                    │
├─────────────┬────────────────┬──────────┬──────────┬────────────┤
│Product Code │ Product Name   │ Vendor 1 │ Vendor 2 │  Vendor 3  │
│             │                │  Price   │  Price   │   Price    │
├─────────────┼────────────────┼──────────┼──────────┼────────────┤
│  F&B-001    │Rice 5kg Premium│  145.00  │  148.00  │   142.00   │
│             │                │ABC Supply│XYZ Trading│ Best Foods │
├─────────────┼────────────────┼──────────┼──────────┼────────────┤
│  F&B-015    │Cooking Oil 5L  │  140.00  │  138.00  │   145.00   │
│             │                │ABC Supply│XYZ Trading│ Best Foods │
└─────────────┴────────────────┴──────────┴──────────┴────────────┘

    ┌─────────────┬──────────────┬───────────────┬──────────────┐
    │Lowest Price │Lowest Vendor │Price Difference│  Variance %  │
    │             │              │ (Max - Min)    │              │
    ├─────────────┼──────────────┼───────────────┼──────────────┤
    │   142.00    │ Best Foods   │     6.00      │    4.05%     │
    │ [Add to PR] │              │               │              │
    ├─────────────┼──────────────┼───────────────┼──────────────┤
    │   138.00    │ XYZ Trading  │     7.00      │    4.83%     │
    │ [Add to PR] │              │               │              │
    └─────────────┴──────────────┴───────────────┴──────────────┘
```

## Visual Indicators

### Color Coding
- **Green Background**: Lowest price cell
- **Yellow Background**: Within 5% of lowest price
- **Red Background**: More than 10% above lowest price

### Price Badges
- **Best Price**: Green badge
- **Competitive**: Yellow badge
- **High**: Red badge

## Interactive Features

1. **Sortable Columns**
   - Click column header to sort
   - Multi-level sorting support

2. **Quick Actions**
   - "Add to PR" button for each product
   - Quick vendor contact info on hover
   - Price history trend on click

3. **Expandable Details**
   - Click product to see price history
   - Vendor terms and conditions
   - Minimum order quantities

## Calculation Formulas

- **Price Difference** = MAX(Vendor Prices) - MIN(Vendor Prices)
- **Variance %** = (Price Difference / Lowest Price) × 100
- **Potential Savings** = (Current Vendor Price - Lowest Price) × Quantity

## Export Format

### Excel Export Includes:
- All vendor prices
- Calculation columns
- Conditional formatting preserved
- Filters applied noted in header
- Timestamp and user who exported
