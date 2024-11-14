// Import the base types from lib
import { Address as LibAddress, Contact as LibContact } from '@/lib/types'

// Extend the lib types
export type Address = LibAddress

export type Contact = LibContact

export interface Certification {
  id: string
  name: string
  status: 'active' | 'expired' | 'pending'
  issuer: string
  validUntil: string
}

export interface EnvironmentalImpact {
  carbonFootprint: {
    value: number
    unit: string
    trend: number
  }
  energyEfficiency: {
    value: number
    benchmark: number
    trend: number
  }
  wasteReduction: {
    value: number
    trend: number
  }
  complianceRate: {
    value: number
    trend: number
  }
  lastUpdated: string
  esgScore: string
  certifications: Array<{
    name: string
    status: 'Active' | 'Expired' | 'Pending'
    expiry: string
  }>
}

export interface Vendor {
  id: string
  companyName: string
  businessRegistrationNumber: string
  taxId: string
  establishmentDate: string
  businessTypeId: string
  rating: number
  isActive: boolean
  addresses: LibAddress[]
  contacts: LibContact[]
  certifications: Certification[]
  environmentalImpact?: EnvironmentalImpact
} 