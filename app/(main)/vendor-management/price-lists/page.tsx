'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Pricelist {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const pricelistDataList  ={ total : 10, pricelists : [
  {
    id: "1",
    name: "Summer Sale 2023",
    description: "Special discounts for summer products",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    isActive: true
  },
  {
    id: "2",
    name: "Back to School 2023",
    description: "Discounts on school supplies",
    startDate: "2023-08-15",
    endDate: "2023-09-15",
    isActive: true
  },
  {
    id: "3",
    name: "Holiday Season 2023",
    description: "Festive discounts on various products",
    startDate: "2023-11-25",
    endDate: "2023-12-31",
    isActive: false
  },
  {
    id: "4",
    name: "Spring Collection 2024",
    description: "New arrivals for spring season",
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    isActive: false
  },
  {
    id: "5",
    name: "Clearance Sale",
    description: "Year-round discounts on clearance items",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    isActive: true
  },
  {
    id: "6",
    name: "Black Friday 2023",
    description: "Exclusive deals for Black Friday",
    startDate: "2023-11-24",
    endDate: "2023-11-24",
    isActive: false
  },
  {
    id: "7",
    name: "Cyber Monday 2023",
    description: "Online-only discounts for Cyber Monday",
    startDate: "2023-11-27",
    endDate: "2023-11-27",
    isActive: false
  },
  {
    id: "8",
    name: "Valentine's Day Special",
    description: "Romantic offers for Valentine's Day",
    startDate: "2024-02-01",
    endDate: "2024-02-14",
    isActive: false
  },
  {
    id: "9",
    name: "Earth Day Eco-Friendly Products",
    description: "Discounts on sustainable and eco-friendly items",
    startDate: "2024-04-22",
    endDate: "2024-04-28",
    isActive: false
  },
  {
    id: "10",
    name: "End of Year Clearance",
    description: "Final discounts to clear inventory",
    startDate: "2023-12-26",
    endDate: "2023-12-31",
    isActive: false
  }
]};

export default function PricelistList(): JSX.Element {
  const router = useRouter();
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search query changes
  };

  const handleAddPricelist = () => {
    router.push('/vendor-management/price-lists/new');
  };

  const handleImport = () => {
    router.push('/vendor-management/price-lists/import');
  };

  const handleGenerateReport = () => {
    router.push('/vendor-management/reports/pricelists');
  };

  useEffect(() => {
    async function fetchPricelists() {
      try {
        // const response = await fetch(`/api/pricelists?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch pricelists');
        // }
        // const data = await response.json();
        const data = pricelistDataList;
        setPricelists(data.pricelists);
        setTotalPages(Math.ceil(data.total / pageSize));
      } catch (err) {
        setError('Error fetching pricelists');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPricelists();
  }, [currentPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const actionButtons = (
    <>
      <Button onClick={handleAddPricelist}>
        Add Pricelist
      </Button>
      <Button variant="secondary" onClick={handleImport}>
        Import
      </Button>
      <Button variant="outline" onClick={handleGenerateReport}>
        Generate Report
      </Button>
    </>
  );

  const content = (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search pricelists..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {pricelists && pricelists.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricelists.map((pricelist) => (
              <TableRow key={pricelist.id}>
                <TableCell>{pricelist.name}</TableCell>
                <TableCell>{pricelist.description}</TableCell>
                <TableCell>{new Date(pricelist.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(pricelist.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={pricelist.isActive ? "default" : "destructive"}>
                    {pricelist.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="link" asChild>
                    <Link href={`/vendor-management/price-lists/${pricelist.id}`}>View</Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href={`/vendor-management/price-lists/${pricelist.id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="link"
                    onClick={() => alert(`Delete functionality will be implemented in the detail page`)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl mb-4">No pricelists found</p>
          <Button onClick={handleAddPricelist}>Add Your First Pricelist</Button>
        </div>
      )}
      {pricelists.length > 0 && (
        <div className="mt-4 flex justify-end items-center">
          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <ListPageTemplate
      title="Pricelist List"
      actionButtons={actionButtons}
      content={content}
    />
  );
}
