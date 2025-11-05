# Purchase Order Detail Report - Template Structure

## Template Layout

```
┌──────────────────────────────────────────────────────────────────┐
│           Purchase Order Detail Report                            │
│                                                                    │
│  Filters:                                                          │
│  ├─ Date From To: [____] to [____]                               │
│  ├─ Vendor From To: [____] to [____]                             │
│  ├─ Location From To: [____] to [____]                           │
│  └─ Status: [Pending/Approved/Partial/Complete/Cancelled]        │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│PO No: PO-20250220-001            Date: 20/02/2025                │
│Vendor: ABC Supplies Co., Ltd     Status: Partial Received        │
│Delivery Date: 27/02/2025         Currency: THB                   │
│Total Amount: 45,280.00           Received: 30,150.00             │
│Fulfillment: [████████░░] 66.6%                                   │
├────────────┬──────────┬─────────────┬──────────┬────────────────┤
│ Ref PR.No. │  Store   │  Product ID │Description│  Order Qty    │
│            │ Location │             │           │               │
├────────────┼──────────┼─────────────┼──────────┼────────────────┤
│เลขที่ PR   │สถานที่   │รหัสสินค้า   │รายละเอียด│ จำนวนสั่ง     │
│ อ้างอิง    │จัดเก็บ   │             │           │               │
├────────────┼──────────┼─────────────┼──────────┼────────────────┤
│PR-2025-001 │Main Store│F&B-001      │Rice 5kg  │      200       │
│PR-2025-001 │Kitchen   │F&B-015      │Cooking Oil│     100       │
└────────────┴──────────┴─────────────┴──────────┴────────────────┘

    ┌──────┬─────┬──────┬────────┬─────────┬──────────┬─────────┐
    │Order │ Foc │Price │Discount│   Tax   │   Net    │Received │
    │Unit  │ Qty │      │        │ Amount  │  Amount  │   Qty   │
    ├──────┼─────┼──────┼────────┼─────────┼──────────┼─────────┤
    │หน่วย │ FOC │ราคา/ │ส่วนลด  │  ภาษี   │ยอดสุทธิ  │ รับแล้ว │
    │      │     │หน่วย │        │         │          │         │
    ├──────┼─────┼──────┼────────┼─────────┼──────────┼─────────┤
    │  Bag │  0  │145.00│  500.00│2,030.00 │ 30,530.00│   150   │
    │Bottle│  5  │140.00│  200.00│  980.00 │ 14,780.00│   100   │
    ├──────┴─────┴──────┴────────┴─────────┼──────────┼─────────┤
    │                           Sub Total: │ 45,310.00│   250   │
    │                        Pending Qty:  │          │   150   │
    │                     Fulfillment: 62.5%│          │         │
    └──────────────────────────────────────┴──────────┴─────────┘
```

## Column Specifications

| Column | Width | Alignment | Format | Description |
|--------|-------|-----------|--------|-------------|
| Ref PR.No. | 120px | Left | Text | Reference PR number |
| Store Location | 130px | Left | Text | Delivery location |
| Product ID | 100px | Left | Text | Product code |
| Description | 250px | Left | Text | Product name |
| Order Qty | 90px | Right | #,##0.00 | Ordered quantity |
| Order Unit | 70px | Center | Text | Unit of measure |
| Foc Qty | 80px | Right | #,##0.00 | Free of charge qty |
| Price | 100px | Right | #,##0.00 | Unit price |
| Discount | 90px | Right | #,##0.00 | Discount amount |
| Tax Amount | 90px | Right | #,##0.00 | Tax |
| Net Amount | 120px | Right | #,##0.00 | Line total |
| Received Qty | 90px | Right | #,##0.00 | Received to date |
| Pending Qty | 90px | Right | #,##0.00 | Yet to receive |

## Visual Indicators

### Status Colors
- **Pending** (Received = 0): Orange background
- **Partial** (0 < Received < Order): Yellow background
- **Complete** (Received = Order): Green background
- **Over-received** (Received > Order): Red background

### Fulfillment Progress Bar
```
[████████████] 100% - Complete
[████████░░░░]  66% - Partial
[░░░░░░░░░░░░]   0% - Pending
```

## Calculation Formulas

- **Net Amount** = (Order Qty × Price) - Discount + Tax Amount
- **Received Amount** = (Received Qty ÷ Order Qty) × Net Amount
- **Pending Amount** = Net Amount - Received Amount
- **Fulfillment %** = (Received Qty ÷ Order Qty) × 100

## Export Features

### Excel Export
- Separate sheet per vendor
- Summary dashboard sheet
- Conditional formatting for status
- Pivot table for analysis

### PDF Export
- Page break per PO
- Vendor summary page
- Landscape orientation
