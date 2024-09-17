'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Vendor {
  id: string;
  companyName: string;
  businessType: { name: string };
  addresses: { addressLine: string; isPrimary: boolean }[];
  contacts: { name: string; phone: string; isPrimary: boolean }[];
}

const VendorDataList = { vendors : [
  {
    id: "1",
    companyName: "Tech Innovations Inc.",
    businessType: { name: "Technology" },
    addresses: [{ addressLine: "123 Silicon Valley, CA 94025", isPrimary: true }],
    contacts: [{ name: "John Doe", phone: "555-1234", isPrimary: true }]
  },
  {
    id: "2",
    companyName: "Green Fields Produce",
    businessType: { name: "Agriculture" },
    addresses: [{ addressLine: "456 Farm Road, OR 97301", isPrimary: true }],
    contacts: [{ name: "Jane Smith", phone: "555-5678", isPrimary: true }]
  },
  {
    id: "3",
    companyName: "Global Logistics Co.",
    businessType: { name: "Transportation" },
    addresses: [{ addressLine: "789 Harbor Blvd, NY 10001", isPrimary: true }],
    contacts: [{ name: "Mike Johnson", phone: "555-9012", isPrimary: true }]
  },
  {
    id: "4",
    companyName: "Stellar Manufacturing",
    businessType: { name: "Manufacturing" },
    addresses: [{ addressLine: "101 Factory Lane, MI 48201", isPrimary: true }],
    contacts: [{ name: "Sarah Brown", phone: "555-3456", isPrimary: true }]
  },
  {
    id: "5",
    companyName: "Eco Energy Solutions",
    businessType: { name: "Energy" },
    addresses: [{ addressLine: "202 Green Street, TX 77001", isPrimary: true }],
    contacts: [{ name: "Tom Wilson", phone: "555-7890", isPrimary: true }]
  },
  {
    id: "6",
    companyName: "Quantum Computing Labs",
    businessType: { name: "Research" },
    addresses: [{ addressLine: "303 Science Park, MA 02139", isPrimary: true }],
    contacts: [{ name: "Emily Chen", phone: "555-2345", isPrimary: true }]
  },
  {
    id: "7",
    companyName: "Global Pharma Inc.",
    businessType: { name: "Pharmaceuticals" },
    addresses: [{ addressLine: "404 Health Avenue, NJ 07101", isPrimary: true }],
    contacts: [{ name: "David Lee", phone: "555-6789", isPrimary: true }]
  },
  {
    id: "8",
    companyName: "Gourmet Foods Distributors",
    businessType: { name: "Food Distribution" },
    addresses: [{ addressLine: "505 Culinary Court, IL 60601", isPrimary: true }],
    contacts: [{ name: "Lisa Taylor", phone: "555-0123", isPrimary: true }]
  },
  {
    id: "9",
    companyName: "Advanced Materials Corp",
    businessType: { name: "Materials Science" },
    addresses: [{ addressLine: "606 Innovation Way, PA 19019", isPrimary: true }],
    contacts: [{ name: "Robert Garcia", phone: "555-4567", isPrimary: true }]
  },
  {
    id: "10",
    companyName: "Oceanic Exploration Co.",
    businessType: { name: "Marine Research" },
    addresses: [{ addressLine: "707 Seaside Drive, FL 33101", isPrimary: true }],
    contacts: [{ name: "Amanda Fisher", phone: "555-8901", isPrimary: true }]
  }

]};

export default function VendorList(): JSX.Element {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoading(true);
        // const response = await fetch('/api/vendors');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch vendors');
        // }
        // const data = await response.json();
        const data = VendorDataList;

        setVendors(data.vendors || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, []);

  const handleAddVendor = () => {
    router.push('/vendor-management/manage-vendors/new');
  };

  const actionButtons = (
    <Button onClick={handleAddVendor}>
      Add Vendor
    </Button>
  );

  const content = (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : vendors.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Business Type</TableHead>
              <TableHead>Primary Address</TableHead>
              <TableHead>Primary Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.companyName}</TableCell>
                <TableCell>{vendor.businessType?.name}</TableCell>
                <TableCell>
                  {vendor.addresses.find(a => a.isPrimary)?.addressLine || 'N/A'}
                </TableCell>
                <TableCell>
                  {vendor.contacts.find(c => c.isPrimary)?.name || 'N/A'}
                  {' '}
                  {vendor.contacts.find(c => c.isPrimary)?.phone || ''}
                </TableCell>
                <TableCell>
                  <Link href={`/vendor-management/manage-vendors/${vendor.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No vendors found. Click "Add Vendor" to create one.</p>
      )}
    </>
  );

  return (
    <ListPageTemplate
      title="Vendor Management"
      actionButtons={actionButtons}
      content={content}
    />
  );
}
