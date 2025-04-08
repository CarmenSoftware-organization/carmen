import { CreditNote } from '@/lib/types/credit-note'


export const staticCreditNotes: CreditNote[] = [
  {
    id: 1,
    refNumber: 'CN-2024-0001',
    description: 'Credit Note for damaged beverage products',
    vendorName: 'Thai Beverage PCL',
    status: 'Draft',
    createdDate: new Date('2024-03-15'),
    docNumber: 'TAXCN-2024-0001',
    docDate: new Date('2024-03-15'),
    netAmount: 12500.00,
    taxAmount: 875.00,
    totalAmount: 13375.00,
    vendorId: 1,
    currency: 'THB',
    notes: 'Damaged products from delivery GRN-2024-0089. Items show signs of mishandling during transport.',
    createdBy: 'john.doe',
    updatedDate: new Date('2024-03-15'),
    updatedBy: 'john.doe',
    items: [
      {
        id: 1,
        description: 'Coffee mate 450g - Damaged packaging',
        quantity: 50,
        unitPrice: 125.00,
        discountPercentage: 0,
        taxPercentage: 7
      },
      {
        id: 2,
        description: 'Heineken Beer 330ml - Broken bottles',
        quantity: 120,
        unitPrice: 85.00,
        discountPercentage: 0,
        taxPercentage: 7
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'damage_report.pdf',
        fileSize: 2048576,
        uploadDate: new Date('2024-03-15'),
        uploadedBy: 'john.doe'
      },
      {
        id: 2,
        fileName: 'product_photos.zip',
        fileSize: 5242880,
        uploadDate: new Date('2024-03-15'),
        uploadedBy: 'john.doe'
      }
    ],
  },
  {
    id: 2,
    refNumber: 'CN-2024-0002',
    description: 'Credit Note for pricing adjustment',
    vendorName: 'Siam Makro PCL',
    status: 'Pending Approval',
    createdDate: new Date('2024-03-10'),
    docNumber: 'TAXCN-2024-0002',
    docDate: new Date('2024-03-10'),
    netAmount: 25000.00,
    taxAmount: 1750.00,
    totalAmount: 26750.00,
    vendorId: 2,
    currency: 'THB',
    notes: 'Price adjustment for incorrect pricing on GRN-2024-0075. Contract price not applied correctly.',
    createdBy: 'sarah.wong',
    updatedDate: new Date('2024-03-10'),
    updatedBy: 'sarah.wong',
    items: [
      {
        id: 1,
        description: 'Thai Jasmine Rice 25kg - Price adjustment',
        quantity: 50,
        unitPrice: 500.00,
        discountPercentage: 0,
        taxPercentage: 7
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'price_contract.pdf',
        fileSize: 1048576,
        uploadDate: new Date('2024-03-10'),
        uploadedBy: 'sarah.wong'
      },
      {
        id: 2,
        fileName: 'email_correspondence.pdf',
        fileSize: 524288,
        uploadDate: new Date('2024-03-10'),
        uploadedBy: 'sarah.wong'
      }
    ],
  },
  {
    id: 3,
    refNumber: 'CN-2024-0003',
    description: 'Credit Note for expired products',
    vendorName: 'CP Foods PCL',
    status: 'Approved',
    createdDate: new Date('2024-03-05'),
    docNumber: 'TAXCN-2024-0003',
    docDate: new Date('2024-03-05'),
    netAmount: 15800.00,
    taxAmount: 1106.00,
    totalAmount: 16906.00,
    vendorId: 3,
    currency: 'THB',
    notes: 'Products received with less than agreed shelf life from GRN-2024-0062.',
    createdBy: 'mike.chen',
    updatedDate: new Date('2024-03-07'),
    updatedBy: 'lisa.park',
    items: [
      {
        id: 1,
        description: 'Frozen Chicken Breast 2kg - Short shelf life',
        quantity: 40,
        unitPrice: 395.00,
        discountPercentage: 0,
        taxPercentage: 7
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'quality_report.pdf',
        fileSize: 1572864,
        uploadDate: new Date('2024-03-05'),
        uploadedBy: 'mike.chen'
      },
      {
        id: 2,
        fileName: 'shelf_life_policy.pdf',
        fileSize: 786432,
        uploadDate: new Date('2024-03-05'),
        uploadedBy: 'mike.chen'
      }
    ],
  },
  {
    id: 4,
    refNumber: 'CN-2024-0004',
    description: 'Credit Note for incorrect delivery',
    vendorName: 'Charoen Pokphand Foods PCL',
    status: 'Rejected',
    createdDate: new Date('2024-03-01'),
    docNumber: 'TAXCN-2024-0004',
    docDate: new Date('2024-03-01'),
    netAmount: 45000.00,
    taxAmount: 3150.00,
    totalAmount: 48150.00,
    vendorId: 4,
    currency: 'THB',
    notes: 'Wrong items delivered against PO-2024-0158. Items do not match specifications.',
    createdBy: 'tom.wilson',
    updatedDate: new Date('2024-03-02'),
    updatedBy: 'david.lee',
    items: [
      {
        id: 1,
        description: 'Fresh Tiger Prawns 1kg - Wrong specification',
        quantity: 100,
        unitPrice: 450.00,
        discountPercentage: 0,
        taxPercentage: 7
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'delivery_note.pdf',
        fileSize: 1048576,
        uploadDate: new Date('2024-03-01'),
        uploadedBy: 'tom.wilson'
      },
      {
        id: 2,
        fileName: 'product_specs.pdf',
        fileSize: 2097152,
        uploadDate: new Date('2024-03-01'),
        uploadedBy: 'tom.wilson'
      }
    ],
  },
  {
    id: 5,
    refNumber: 'CN-2024-0005',
    description: 'Credit Note for overcharged items',
    vendorName: 'Taokaenoi Food PCL',
    status: 'Posted',
    createdDate: new Date('2024-02-28'),
    docNumber: 'TAXCN-2024-0005',
    docDate: new Date('2024-02-28'),
    netAmount: 8500.00,
    taxAmount: 595.00,
    totalAmount: 9095.00,
    vendorId: 5,
    currency: 'THB',
    notes: 'Overcharged on invoice INV-2024-0245. Promotional discount not applied.',
    createdBy: 'jane.smith',
    updatedDate: new Date('2024-02-29'),
    updatedBy: 'jane.smith',
    items: [
      {
        id: 1,
        description: 'Seaweed Snack Original 3g - Promotional price adjustment',
        quantity: 500,
        unitPrice: 17.00,
        discountPercentage: 0,
        taxPercentage: 7
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: 'promotion_terms.pdf',
        fileSize: 1048576,
        uploadDate: new Date('2024-02-28'),
        uploadedBy: 'jane.smith'
      },
      {
        id: 2,
        fileName: 'original_invoice.pdf',
        fileSize: 1572864,
        uploadDate: new Date('2024-02-28'),
        uploadedBy: 'jane.smith'
      }
    ],
  }
]
