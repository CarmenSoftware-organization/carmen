import { Vendor } from '../[id]/types'

// Define a simple enum for address types since we don't have access to the lib version
export enum AddressType {
  MAIN = 'MAIN',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BRANCH = 'BRANCH'
}

export const MOCK_VENDORS: Record<string, Vendor> = {
  '1': {
    id: '1',
    companyName: 'Acme Corporation',
    businessRegistrationNumber: 'BR123456',
    taxId: 'TAX123456',
    establishmentDate: '2000-01-01',
    businessTypeId: 'BT001',
    rating: 4.5,
    isActive: true,
    addresses: [
      {
        id: 'addr1',
        addressLine: '123 Main St',
        subDistrictId: 'SD001',
        districtId: 'D001',
        provinceId: 'P001',
        postalCode: '10001',
        addressType: AddressType.MAIN,
        isPrimary: true
      }
    ],
    contacts: [
      {
        id: 'cont1',
        name: 'John Doe',
        email: 'john.doe@acme.com',
        phone: '+1-555-0123',
        position: 'Manager',
        department: 'Procurement',
        isPrimary: true
      }
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'ISO 9001',
        status: 'active',
        issuer: 'ISO',
        validUntil: '2025-12-31'
      }
    ],
    environmentalImpact: {
      carbonFootprint: {
        value: 2450,
        unit: 'tCO2e',
        trend: -12
      },
      energyEfficiency: {
        value: 85,
        benchmark: 80,
        trend: 5
      },
      wasteReduction: {
        value: 45,
        trend: 15
      },
      complianceRate: {
        value: 98,
        trend: 3
      },
      lastUpdated: '2024-03-15',
      esgScore: 'A+',
      certifications: [
        {
          name: 'ISO 14001',
          status: 'Active',
          expiry: '2025-12-31'
        },
        {
          name: 'Carbon Trust',
          status: 'Active',
          expiry: '2024-08-15'
        },
        {
          name: 'ESG Rating A+',
          status: 'Active',
          expiry: '2024-12-31'
        }
      ]
    },
    taxProfile: 'standard',
    taxRate: 10,
    taxType: 'add',
  }
}

export const BUSINESS_TYPES = [
  { id: "TECH001", name: "Technology" },
  { id: "RETAIL001", name: "Retail" },
  { id: "MANUF001", name: "Manufacturing" },
  { id: "SERVICE001", name: "Service" },
  { id: "CONSULT001", name: "Consulting" }
]

export const ADDRESS_TYPES = [
  { id: AddressType.MAIN, name: "Main Office" },
  { id: AddressType.BILLING, name: "Billing Address" },
  { id: AddressType.SHIPPING, name: "Shipping Address" },
  { id: AddressType.BRANCH, name: "Branch Office" }
]

export function getMockVendor(id: string): Vendor | undefined {
  return MOCK_VENDORS[id]
} 