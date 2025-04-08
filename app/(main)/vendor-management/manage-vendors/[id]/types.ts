// Define interfaces directly
export interface Address {
  id: string;
  addressType?: string;
  addressLine?: string;
  subDistrictId?: string;
  districtId?: string;
  provinceId?: string;
  postalCode: string;
  isPrimary: boolean;
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Contact {
  id: string;
  name: string;
  position?: string;
  phone: string;
  email: string;
  department?: string;
  isPrimary: boolean;
  role?: string;
}

export interface Certification {
  id: string;
  name: string;
  status: string;
  issuer: string;
  validUntil: string;
}

export interface EnvironmentalImpact {
  carbonFootprint: {
    value: number;
    unit: string;
    trend: number;
  };
  energyEfficiency: {
    value: number;
    benchmark: number;
    trend: number;
  };
  wasteReduction: {
    value: number;
    trend: number;
  };
  complianceRate: {
    value: number;
    trend: number;
  };
  lastUpdated: string;
  esgScore: string;
  certifications: Array<{
    name: string;
    status: string;
    expiry: string;
  }>;
}

export interface Vendor {
  id: string;
  companyName: string;
  businessRegistrationNumber?: string;
  vendorCode?: string;
  taxId: string;
  establishmentDate?: string;
  businessTypeId?: string;
  website?: string;
  industry?: string;
  foundedYear?: number;
  description?: string;
  logo?: string;
  status?: string;
  rating: number;
  isActive: boolean;
  addresses: Address[];
  contacts: Contact[];
  certifications: Certification[];
  environmentalImpact: EnvironmentalImpact;
} 