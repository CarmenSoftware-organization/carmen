'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileText, PencilLine, MoreVertical, Trash2, List, LayoutGrid } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdvancedFilter } from './components/advanced-filter';
import { FilterType } from '@/lib/utils/filter-storage';
import { toast } from '@/components/ui/use-toast';
import { Vendor } from './[id]/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"

// Define a simplified vendor interface for the list page
interface VendorListItem {
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
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterType<VendorListItem>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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
        setFilteredVendors(data.vendors || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setVendors([]);
        setFilteredVendors([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, []);

  // Apply filters and search to vendors
  useEffect(() => {
    try {
      let filtered = [...vendors];
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          vendor =>
            vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.businessType?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.addresses.some(a => a.addressLine.toLowerCase().includes(searchQuery.toLowerCase())) ||
            vendor.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Apply advanced filters
      if (activeFilters.length > 0) {
        filtered = filtered.filter(vendor => {
          return activeFilters.every(filter => {
            const field = filter.field;
            const value = filter.value;
            const operator = filter.operator;

            // Handle nested fields like businessType.name
            let fieldValue: any;
            if (field.toString().includes('.')) {
              const [parentField, childField] = field.toString().split('.');
              const parentValue = vendor[parentField as keyof VendorListItem];
              
              // Handle nested objects
              if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
                fieldValue = (parentValue as any)[childField];
              } else {
                fieldValue = undefined;
              }
            } else {
              fieldValue = vendor[field];
            }

            // Handle undefined or null values
            if (fieldValue === undefined || fieldValue === null) {
              return false;
            }

            // Convert to string for comparison if not already a string
            const stringFieldValue = String(fieldValue).toLowerCase();
            const stringValue = String(value).toLowerCase();

            switch (operator) {
              case 'equals':
                return stringFieldValue === stringValue;
              case 'contains':
                return stringFieldValue.includes(stringValue);
              case 'startsWith':
                return stringFieldValue.startsWith(stringValue);
              case 'endsWith':
                return stringFieldValue.endsWith(stringValue);
              case 'greaterThan':
                return Number(fieldValue) > Number(value);
              case 'lessThan':
                return Number(fieldValue) < Number(value);
              default:
                return true;
            }
          });
        });
      }

      setFilteredVendors(filtered);
    } catch (error) {
      console.error('Error filtering vendors:', error);
      toast({
        title: "Error filtering vendors",
        description: "There was a problem filtering the vendors.",
        variant: "destructive"
      });
    }
  }, [activeFilters, vendors, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchQuery(e.target.value);
    } catch (error) {
      console.error('Error handling search:', error);
      toast({
        title: "Error",
        description: "There was a problem with the search.",
        variant: "destructive"
      });
    }
  };

  const handleAddVendor = () => {
    try {
      router.push('/vendor-management/manage-vendors/new');
    } catch (error) {
      console.error('Error navigating to add vendor:', error);
      toast({
        title: "Error",
        description: "There was a problem navigating to add vendor page.",
        variant: "destructive"
      });
    }
  };

  const handleApplyFilters = (filters: FilterType<VendorListItem>[]) => {
    try {
      setActiveFilters(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast({
        title: "Error",
        description: "There was a problem applying the filters.",
        variant: "destructive"
      });
    }
  };

  const handleClearFilters = () => {
    try {
      setActiveFilters([]);
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast({
        title: "Error",
        description: "There was a problem clearing the filters.",
        variant: "destructive"
      });
    }
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredVendors.map((vendor) => (
        <Card 
          key={vendor.id} 
          className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm"
        >
          <div className="flex flex-col h-full">
            {/* Card Header */}
            <div className="p-5 pb-3 bg-muted/30 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{vendor.companyName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{vendor.businessType?.name}</p>
                </div>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-5 flex-grow">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Primary Address</p>
                  <p className="text-sm">{vendor.addresses.find(a => a.isPrimary)?.addressLine || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Primary Contact</p>
                  <p className="text-sm">{vendor.contacts.find(c => c.isPrimary)?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{vendor.contacts.find(c => c.isPrimary)?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}
                className="h-8 w-8 rounded-full"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}/edit`)}
                className="h-8 w-8 rounded-full"
              >
                <PencilLine className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}/edit`)}>
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-12">
      <ListPageTemplate
        title="Vendor Management"
        actionButtons={
          <Button onClick={handleAddVendor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        }
        filters={
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <AdvancedFilter
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none h-8 px-2"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">Table View</span>
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-none h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Card View</span>
                </Button>
              </div>
            </div>
          </div>
        }
        content={
          <div className="space-y-4">
            {viewMode === 'table' ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Primary Address</TableHead>
                      <TableHead>Primary Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.companyName}</TableCell>
                        <TableCell>{vendor.businessType?.name}</TableCell>
                        <TableCell>
                          {vendor.addresses.find(a => a.isPrimary)?.addressLine || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {vendor.contacts.find(c => c.isPrimary)?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}
                              className="h-8 w-8 rounded-full"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}/edit`)}
                              className="h-8 w-8 rounded-full"
                            >
                              <PencilLine className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}/edit`)}>
                                  <PencilLine className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              renderCardView()
            )}
          </div>
        }
      />
    </div>
  );
}
