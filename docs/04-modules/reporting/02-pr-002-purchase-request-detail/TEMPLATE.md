# Purchase Request Detail Report - Template Structure

## Template Layout

```
┌──────────────────────────────────────────────────────────────────┐
│           Purchase Request Detail Report                          │
│                                                                    │
│  Filters:                                                          │
│  ├─ Date From To: [____] to [____]                               │
│  ├─ Vendor From To: [____] to [____]                             │
│  ├─ Location From To: [____] to [____]                           │
│  └─ Status: [All/Draft/Pending/Approved]                         │
│                                                                    │
├─────────────┬──────────┬──────────────┬──────────┬──────────────┤
│PR No: PR-20250220-001              Date: 20/02/2025              │
│Department: Finance                  Status: Approved              │
│Delivery Date: 25/02/2025                                         │
├─────────────┬──────────┬──────────────┬──────────┬──────────────┤
│   Store     │ Product  │ Description  │Order Qty │  Order Unit  │
│  Location   │    ID    │              │          │              │
├─────────────┼──────────┼──────────────┼──────────┼──────────────┤
│   สถานที่   │รหัสสินค้า│ รายละเอียด   │  จำนวน  │    หน่วย     │
├─────────────┼──────────┼──────────────┼──────────┼──────────────┤
│Main Store   │PRD-001   │Printer Paper │   100    │     Box      │
│Main Store   │PRD-002   │Staples       │    50    │     Box      │
└─────────────┴──────────┴──────────────┴──────────┴──────────────┘

    ┌─────────┬──────┬─────────┬─────────┬──────────┐
    │Foc Qty  │Price │Discount │   Tax   │   Net    │
    │         │      │         │ Amount  │  Amount  │
    ├─────────┼──────┼─────────┼─────────┼──────────┤
    │   FOC   │ราคา  │ส่วนลด   │  ภาษี   │ยอดสุทธิ  │
    ├─────────┼──────┼─────────┼─────────┼──────────┤
    │    0    │120.00│   0.00  │  840.00 │12,840.00 │
    │    5    │ 35.00│  50.00  │  119.00 │ 1,819.00 │
    ├─────────┴──────┴─────────┴─────────┼──────────┤
    │                          Sub Total: │14,659.00 │
    │                        Grand Total: │14,659.00 │
    └─────────────────────────────────────┴──────────┘
```

## Column Specifications

| Column | Width | Alignment | Format |
|--------|-------|-----------|--------|
| Store Location | 120px | Left | Text |
| Product ID | 100px | Left | Text |
| Description | 250px | Left | Text |
| Order Qty | 90px | Right | #,##0.00 |
| Order Unit | 70px | Center | Text |
| Foc Qty | 80px | Right | #,##0.00 |
| Price | 100px | Right | #,##0.00 |
| Discount | 90px | Right | #,##0.00 |
| Tax Amount | 90px | Right | #,##0.00 |
| Net Amount | 120px | Right | #,##0.00 |

## Calculation Formulas

- **Net Amount** = (Order Qty × Price) - Discount + Tax Amount
- **Sub Total** = Sum of all line item Net Amounts per PR
- **Grand Total** = Sum of all Sub Totals

## Display Features

- Collapsible PR sections
- PR header shows: PR No, Date, Department, Status, Delivery Date
- Subtotals after each PR section
- Grand total at the end
- Highlighting for:
  - Negative quantities (red)
  - Over budget items (yellow)
  - FOC items (green background)
