# Purchase Request List Report - Template Structure

## Template Layout

```
┌─────────────────────────────────────────────────────────────┐
│             Purchase Request List Report                      │
│                                                               │
│  Filters:                                                     │
│  ├─ Date From To: [____] to [____]                          │
│  ├─ Delivery Date From To: [____] to [____]                 │
│  ├─ Status: [All/Draft/Pending/Approved]                    │
│  └─ PR Type: [All/Stock/Service/Other]                      │
│                                                               │
├─────────┬────────┬─────────────┬────────────┬──────────────┤
│  Date   │ PR.NO  │ Description │ Department │ Delivery Date│
│         │        │             │  Request   │              │
├─────────┼────────┼─────────────┼────────────┼──────────────┤
│วันที่ PR │หมายเลข│Description  │Department  │วันที่ส่งสินค้า│
│         │  PR    │  header PR  │  Request   │              │
├─────────┼────────┼─────────────┼────────────┼──────────────┤
│20/02/25 │PR-2025 │Office       │Finance     │25/02/2025    │
│         │0220-001│Supplies     │            │              │
└─────────┴────────┴─────────────┴────────────┴──────────────┘

    ┌──────────┬────────┬──────────┐
    │ PR Type  │ Status │  Total   │
    ├──────────┼────────┼──────────┤
    │ประเภทของ │สถานะ PR│ยอดสุทธิ  │
    │   PR     │        │  ของ PR  │
    ├──────────┼────────┼──────────┤
    │ Stock    │Approved│ 15,500.00│
    └──────────┴────────┴──────────┘
```

## Column Specifications

| Column | Width | Alignment | Format |
|--------|-------|-----------|--------|
| Date | 100px | Center | DD/MM/YYYY |
| PR.NO | 120px | Left | PR-YYYYMMDD-XXXX |
| Description | 250px | Left | Text |
| Department Request | 150px | Left | Text |
| Delivery Date | 110px | Center | DD/MM/YYYY |
| PR Type | 120px | Center | Text |
| Status | 100px | Center | Badge/Label |
| Total | 130px | Right | #,##0.00 |

## Status Badge Colors

- **Draft**: Yellow (#FFC107)
- **Pending Approval**: Orange (#FF9800)
- **Approved**: Green (#4CAF50)
- **Rejected**: Red (#F44336)
- **Cancelled**: Gray (#9E9E9E)

## Export Formats

### Excel Export
- Include filter parameters in header rows
- Freeze column headers
- Apply number formatting
- Auto-fit columns

### PDF Export
- Landscape orientation
- Include company header
- Page numbers
- Filter parameters summary
