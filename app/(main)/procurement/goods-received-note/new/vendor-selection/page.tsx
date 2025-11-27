'use client'

import React, { useState, useEffect } from 'react';
import { useGRNCreationStore } from '@/lib/store/grn-creation.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Vendor } from '@/lib/types';

// Mock data - replace with actual API call
const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    vendorCode: 'V001',
    companyName: 'Global Foods Inc.',
    businessRegistrationNumber: 'BRN001',
    taxId: 'T001',
    establishmentDate: '2000-01-01',
    businessType: 'distributor',
    status: 'active',
    rating: 4,
    isActive: true,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
  {
    id: 'vendor-2',
    vendorCode: 'V002',
    companyName: 'Local Produce Suppliers',
    businessRegistrationNumber: 'BRN002',
    taxId: 'T002',
    establishmentDate: '2010-05-15',
    businessType: 'wholesaler',
    status: 'active',
    rating: 5,
    isActive: true,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 15',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
  {
    id: 'vendor-3',
    vendorCode: 'V003',
    companyName: 'Specialty Imports Ltd.',
    businessRegistrationNumber: 'BRN003',
    taxId: 'T003',
    establishmentDate: '2005-11-20',
    businessType: 'distributor',
    status: 'inactive',
    rating: 3,
    isActive: false,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
];

async function fetchVendors(): Promise<Vendor[]> {
  // Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return MOCK_VENDORS;
}

export default function VendorSelectionPage() {
  const router = useRouter();
  const { setSelectedVendor, setStep } = useGRNCreationStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVendors = async () => {
      setIsLoading(true);
      const fetchedVendors = await fetchVendors();
      setVendors(fetchedVendors);
      setFilteredVendors(fetchedVendors);
      setIsLoading(false);
    };
    loadVendors();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = vendors.filter(vendor =>
      (vendor.companyName?.toLowerCase() || '').includes(lowerCaseSearch) ||
      (vendor.businessRegistrationNumber?.toLowerCase() || '').includes(lowerCaseSearch)
    );
    setFilteredVendors(results);
  }, [searchTerm, vendors]);

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setStep('po-selection');
    router.push('/procurement/goods-received-note/new/po-selection');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Vendor</CardTitle>
        <CardDescription>Choose the vendor for this Goods Receive Note.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <p>Loading vendors...</p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Reg. No.</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>{vendor.businessRegistrationNumber}</TableCell>
                      <TableCell>{vendor.companyName}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleSelectVendor(vendor)}>
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
         {/* Add Pagination if needed */}
      </CardContent>
    </Card>
  );
} 