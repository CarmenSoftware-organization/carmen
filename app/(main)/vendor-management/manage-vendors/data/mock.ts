import { Vendor, Certification, Address, Contact } from '../[id]/types'


// Define address types to match the library type
const ADDRESS_TYPE = {
  MAIN: 'MAIN',
  BILLING: 'BILLING',
  SHIPPING: 'SHIPPING'
} as const

// Define certification status types
const CERTIFICATION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending'
} as const

const ENVIRONMENTAL_CERTIFICATION_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  PENDING: 'Pending'
} as const

// Create mock vendors for each ID in the list (VEN00001 to VEN00010)
export const MOCK_VENDORS: Record<string, Vendor> = {
  'VEN000001': {
    id: 'VEN000001',
    companyName: 'Thai Fresh Foods Co., Ltd.',
    businessRegistrationNumber: 'BR0105563123456',
    taxId: 'TAX3123456789',
    establishmentDate: '1995-03-15',
    businessTypeId: 'FOOD_SUPPLIER',
    rating: 4.82,
    isActive: true,
    addresses: [
      {
        id: 'ADD001',
        addressType: 'MAIN',
        addressLine: '123/45 Sukhumvit 71, Phra Khanong Nuea',
        subDistrictId: 'PKN',
        districtId: 'WAT',
        provinceId: 'BKK',
        postalCode: '10110',
        isPrimary: true
      },
      {
        id: 'ADD002',
        addressType: 'SHIPPING',
        addressLine: '89/12 Bangna-Trad Rd., Bangna',
        subDistrictId: 'BNA',
        districtId: 'BNA',
        provinceId: 'BKK',
        postalCode: '10260',
        isPrimary: false
      }
    ],
    contacts: [
      {
        id: 'CON001',
        name: 'Somchai Jaidee',
        position: 'Sales Director',
        phone: '+66891234567',
        email: 'somchai.j@thaifresh.co.th',
        department: 'Sales',
        isPrimary: true
      },
      {
        id: 'CON002',
        name: 'Pranee Suksai',
        position: 'Account Manager',
        phone: '+66851234567',
        email: 'pranee.s@thaifresh.co.th',
        department: 'Finance',
        isPrimary: false
      }
    ],
    certifications: [
      {
        id: 'CERT001',
        name: 'ISO 22000:2018',
        status: 'active',
        issuer: 'SGS Thailand',
        validUntil: '2025-12-31'
      },
      {
        id: 'CERT002',
        name: 'HACCP',
        status: 'active',
        issuer: 'Department of Livestock Development',
        validUntil: '2024-06-30'
      },
      {
        id: 'CERT003',
        name: 'GMP',
        status: 'active',
        issuer: 'Thai FDA',
        validUntil: '2024-12-31'
      }
    ],
    environmentalImpact: {
      carbonFootprint: {
        value: 125.3,
        unit: 'tCO2e/year',
        trend: -5.2
      },
      energyEfficiency: {
        value: 85.6,
        benchmark: 75.0,
        trend: 2.3
      },
      wasteReduction: {
        value: 78.4,
        trend: 4.1
      },
      complianceRate: {
        value: 98.5,
        trend: 0.5
      },
      lastUpdated: '2024-03-15',
      esgScore: 'A-',
      certifications: [
        {
          name: 'ISO 14001:2015',
          status: 'Active',
          expiry: '2025-12-31'
        }
      ]
    }
  },
  'VEN000002': {
    id: 'VEN000002',
    companyName: 'Bangkok Kitchen Equipment Ltd.',
    businessRegistrationNumber: 'BR0105562789012',
    taxId: 'TAX7890123456',
    establishmentDate: '2001-08-22',
    businessTypeId: 'EQUIPMENT_SUPPLIER',
    rating: 4.35,
    isActive: true,
    addresses: [
      {
        id: 'ADD003',
        addressType: 'MAIN',
        addressLine: '789/123 Ratchadaphisek Rd., Dindaeng',
        subDistrictId: 'DND',
        districtId: 'DND',
        provinceId: 'BKK',
        postalCode: '10400',
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'CON003',
        name: 'Wichai Sangthong',
        position: 'General Manager',
        phone: '+66931234567',
        email: 'wichai@bkkitchen.co.th',
        department: 'Management',
        isPrimary: true
      }
    ],
    certifications: [
      {
        id: 'CERT004',
        name: 'ISO 9001:2015',
        status: 'active',
        issuer: 'Bureau Veritas',
        validUntil: '2024-08-31'
      }
    ],
    environmentalImpact: {
      carbonFootprint: {
        value: 85.7,
        unit: 'tCO2e/year',
        trend: -3.1
      },
      energyEfficiency: {
        value: 79.2,
        benchmark: 75.0,
        trend: 1.8
      },
      wasteReduction: {
        value: 72.5,
        trend: 2.8
      },
      complianceRate: {
        value: 95.8,
        trend: 1.2
      },
      lastUpdated: '2024-02-28',
      esgScore: 'B+',
      certifications: [
        {
          name: 'Green Industry Level 3',
          status: 'Active',
          expiry: '2025-06-30'
        }
      ]
    }
  },
  'VEN000003': {
    id: 'VEN000003',
    companyName: 'Siam Packaging Solutions Co., Ltd.',
    businessRegistrationNumber: 'BR0105564567890',
    taxId: 'TAX4567890123',
    establishmentDate: '2012-04-10',
    businessTypeId: 'PACKAGING_SUPPLIER',
    rating: 3.95,
    isActive: true,
    addresses: [
      {
        id: 'ADD004',
        addressType: 'MAIN',
        addressLine: '456 Moo 3, Bangpoo Industrial Estate',
        subDistrictId: 'BPO',
        districtId: 'MPT',
        provinceId: 'SMT',
        postalCode: '10280',
        isPrimary: true
      },
      {
        id: 'ADD005',
        addressType: 'BILLING',
        addressLine: '78/9 Silom Rd., Bangrak',
        subDistrictId: 'SLM',
        districtId: 'BNR',
        provinceId: 'BKK',
        postalCode: '10500',
        isPrimary: false
      }
    ],
    contacts: [
      {
        id: 'CON004',
        name: 'Supaporn Ritthisuk',
        position: 'Sales Manager',
        phone: '+66971234567',
        email: 'supaporn@siampack.co.th',
        department: 'Sales',
        isPrimary: true
      },
      {
        id: 'CON005',
        name: 'Tanawat Meesuwan',
        position: 'Production Manager',
        phone: '+66951234567',
        email: 'tanawat@siampack.co.th',
        department: 'Production',
        isPrimary: false
      }
    ],
    certifications: [
      {
        id: 'CERT005',
        name: 'ISO 9001:2015',
        status: 'active',
        issuer: 'TUV Nord',
        validUntil: '2025-03-31'
      },
      {
        id: 'CERT006',
        name: 'FSC Chain of Custody',
        status: 'active',
        issuer: 'FSC Thailand',
        validUntil: '2024-09-30'
      }
    ],
    environmentalImpact: {
      carbonFootprint: {
        value: 156.8,
        unit: 'tCO2e/year',
        trend: -2.8
      },
      energyEfficiency: {
        value: 71.3,
        benchmark: 75.0,
        trend: 1.5
      },
      wasteReduction: {
        value: 68.9,
        trend: 3.2
      },
      complianceRate: {
        value: 94.2,
        trend: 0.8
      },
      lastUpdated: '2024-03-01',
      esgScore: 'B',
      certifications: [
        {
          name: 'Green Industry Level 2',
          status: 'Active',
          expiry: '2024-12-31'
        }
      ]
    }
  },
  'VEN000004': {
    id: 'VEN000004',
    companyName: 'Global Seafood Enterprises Ltd.',
    businessRegistrationNumber: 'BR0105565432198',
    taxId: 'TAX5432198765',
    establishmentDate: '1998-11-30',
    businessTypeId: 'SEAFOOD_SUPPLIER',
    rating: 4.67,
    isActive: true,
    addresses: [
      {
        id: 'ADD006',
        addressType: 'MAIN',
        addressLine: '99/8 Rama 2 Rd., Samae Dam',
        subDistrictId: 'SMD',
        districtId: 'BBT',
        provinceId: 'BKK',
        postalCode: '10150',
        isPrimary: true
      },
      {
        id: 'ADD007',
        addressType: 'SHIPPING',
        addressLine: '188 Moo 5, Mahachai',
        subDistrictId: 'MHC',
        districtId: 'MHC',
        provinceId: 'SKN',
        postalCode: '74000',
        isPrimary: false
      }
    ],
    contacts: [
      {
        id: 'CON006',
        name: 'Chaiwat Thongchai',
        position: 'Managing Director',
        phone: '+66819876543',
        email: 'chaiwat@globalseafood.co.th',
        department: 'Management',
        isPrimary: true
      },
      {
        id: 'CON007',
        name: 'Siriporn Wongsa',
        position: 'Quality Control Manager',
        phone: '+66869876543',
        email: 'siriporn@globalseafood.co.th',
        department: 'Quality Control',
        isPrimary: false
      }
    ],
    certifications: [
      {
        id: 'CERT007',
        name: 'HACCP',
        status: 'active',
        issuer: 'Department of Fisheries',
        validUntil: '2025-06-30'
      },
      {
        id: 'CERT008',
        name: 'BAP 4-Star',
        status: 'active',
        issuer: 'Global Aquaculture Alliance',
        validUntil: '2024-12-31'
      },
      {
        id: 'CERT009',
        name: 'MSC Chain of Custody',
        status: 'active',
        issuer: 'Marine Stewardship Council',
        validUntil: '2024-09-30'
      }
    ],
    environmentalImpact: {
      carbonFootprint: {
        value: 198.4,
        unit: 'tCO2e/year',
        trend: -4.2
      },
      energyEfficiency: {
        value: 82.1,
        benchmark: 75.0,
        trend: 2.7
      },
      wasteReduction: {
        value: 76.8,
        trend: 3.5
      },
      complianceRate: {
        value: 97.3,
        trend: 0.9
      },
      lastUpdated: '2024-03-10',
      esgScore: 'A',
      certifications: [
        {
          name: 'ISO 14001:2015',
          status: 'Active',
          expiry: '2025-09-30'
        },
        {
          name: 'ASC Chain of Custody',
          status: 'Active',
          expiry: '2024-12-31'
        }
      ]
    }
  }
}

export const BUSINESS_TYPES = [
  { id: "BT001", name: "Technology" },
  { id: "BT002", name: "Manufacturing" },
  { id: "BT003", name: "Service" },
  { id: "BT004", name: "Retail" },
  { id: "BT005", name: "Consulting" }
]

export const ADDRESS_TYPES = [
  { id: ADDRESS_TYPE.MAIN, name: "Main Office" },
  { id: ADDRESS_TYPE.BILLING, name: "Billing Address" },
  { id: ADDRESS_TYPE.SHIPPING, name: "Shipping Address" }
]

export function getMockVendor(id: string): Vendor | undefined {
  return MOCK_VENDORS[id]
} 