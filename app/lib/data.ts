/**
 * Data Access Layer
 * 
 * This file provides data access functions using mock data instead of
 * external database connections for development and testing purposes.
 */

import { unstable_noStore as noStore } from 'next/cache';
import { mockPurchaseRequests } from '@/lib/mock-data';

// Mock certifications data
const mockCertifications = [
  {
    id: '1',
    name: 'Organic Certification',
    description: 'USDA Organic certification for organic food products',
    issuer: 'USDA',
    validityPeriod: '1 year',
    requiredDocuments: 'Organic farm certificate, Processing facility certificate'
  },
  {
    id: '2', 
    name: 'Halal Certification',
    description: 'Halal certification for food products according to Islamic law',
    issuer: 'Islamic Food and Nutrition Council of America',
    validityPeriod: '2 years',
    requiredDocuments: 'Halal slaughter certificate, Facility inspection report'
  },
  {
    id: '3',
    name: 'Fair Trade Certification',
    description: 'Fair Trade certification ensuring ethical sourcing and fair wages',
    issuer: 'Fair Trade USA',
    validityPeriod: '3 years',
    requiredDocuments: 'Producer agreement, Social compliance audit'
  }
];

export async function fetchCertifications() {
  noStore();
  try {
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCertifications;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certifications.');
  }
}

export async function fetchCertificationById(id: string) {
  noStore();
  try {
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 100));
    const certification = mockCertifications.find(cert => cert.id === id);
    return certification || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certification.');
  }
}

export async function fetchPurchaseRequests() {
  noStore();
  try {
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPurchaseRequests;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchase requests.');
  }
}