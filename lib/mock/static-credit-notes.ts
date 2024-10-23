import { CreditNote } from '@/lib/types/credit-note'

export const staticCreditNotes: CreditNote[] = [
  {
    id: 1,
    refNumber: "CN0001",
    description: "Credit Note 1",
    vendorId: 1,
    vendorName: "Supplier A",
    createdDate: new Date("2023-07-01T00:00:00Z"),
    docNumber: "INV1001",
    docDate: new Date("2023-06-15T00:00:00Z"),
    netAmount: 1000,
    taxAmount: 100,
    totalAmount: 1100,
    currency: "USD",
    status: "Approved",
    notes: "Additional notes for credit note 1",
    createdBy: "user1@example.com",
    updatedDate: "2023-07-01T12:00:00Z",
    updatedBy: "user1@example.com",
    items: [
      {
        id: 1,
        description: "Item 1 for CN0001",
        quantity: 5,
        unitPrice: 200,
        discountPercentage: 0,
        taxPercentage: 10,
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: "attachment1_cn1.pdf",
        fileSize: 500000,
        uploadDate: new Date("2023-07-01T12:00:00Z"),
        uploadedBy: "user1@example.com",
      }
    ]
  },
  // Add more static credit notes here...
]
