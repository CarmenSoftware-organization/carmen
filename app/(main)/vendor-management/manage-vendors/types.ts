export interface Address {
  id: string
  type: 'billing' | 'shipping'
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isPrimary?: boolean
}

export interface Contact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  isPrimary?: boolean
}

export interface Certification {
  id: string
  name: string
  issuer: string
  expiryDate: string
  status: 'active' | 'expired' | 'pending'
}

export interface Vendor {
  id: string
  companyName: string
  code: string
  status: 'active' | 'inactive'
  type: string
  businessTypeId: string
  businessRegistrationNumber: string
  taxId: string
  website: string
  industry: string
  description: string
  establishmentDate: string
  foundedYear: number
  employeeCount: number
  annualRevenue: number
  rating: number
  addresses: Address[]
  contacts: Contact[]
  certifications: Certification[]
  createdAt: string
  updatedAt: string
} 