# Order Pending Report - Template Structure

## Implementation Note

This report has been **merged into PO-002: Purchase Order Detail Report**.

## How to View Pending Orders

1. Navigate to **PO Detail Report** (PO-002)
2. Set filter: **Status = "Pending"**
3. Optionally group by:
   - Vendor (to see all pending items per supplier)
   - Product (to see all pending products across vendors)
   - Location (to see pending deliveries per location)

## Sample View

When filtered for "Pending" status in PO Detail Report, you will see:

```
┌──────────────────────────────────────────────────────────────────┐
│           Purchase Order Detail Report (Pending Only)             │
│                                                                    │
│  Filter Applied: Status = Pending                                 │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│PO No: PO-20250220-001            Date: 20/02/2025                │
│Vendor: ABC Supplies Co., Ltd     Status: Pending                 │
│Delivery Date: 27/02/2025         Received: 0.00                  │
│                                  Pending: 45,280.00               │
├────────────┬──────────┬─────────────┬──────────┬────────────────┤
│ Product ID │Description│  Order Qty │Order Unit│  Pending Qty   │
├────────────┼──────────┼─────────────┼──────────┼────────────────┤
│  F&B-001   │Rice 5kg  │     200     │   Bag    │      200       │
│  F&B-015   │Cook Oil  │     100     │  Bottle  │      100       │
└────────────┴──────────┴─────────────┴──────────┴────────────────┘
```

## See Also

- **PO-002**: Purchase Order Detail Report (full template)
- **PO-003**: Purchase Order List Report (summary view)
