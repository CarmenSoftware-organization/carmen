'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileText, Edit, MoreVertical, Trash2, List, LayoutGrid, Download, MoreHorizontal, Filter, Grid, Copy } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdvancedFilter } from './components/advanced-filter';
import { FilterType } from '@/lib/utils/filter-storage';
import { toast } from '@/components/ui/use-toast';
import { Vendor } from '../types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { vendorService } from '../lib/services/vendor-service'
import { getVendors } from './actions'
import VendorSearchBar from '../components/VendorSearchBar'
import VendorFilters from '../components/VendorFilters'
import VendorCard from '../components/VendorCard'
import VendorDeletionDialog from '../components/VendorDeletionDialog'

// Define a simplified vendor interface for the list page
interface VendorListItem {
  id: string;
  companyName: string;
  businessType: { name: string };
  addresses: { addressLine: string; isPrimary: boolean }[];
  contacts: { name: string; phone: string; isPrimary: boolean }[];
  isActive?: boolean;
  rating?: number;
  status?: 'active' | 'inactive';
}

const VendorDataList = { vendors : [
  {
    id: "1",
    companyName: "Tech Innovations Inc.",
    businessType: { name: "Technology" },
    addresses: [{ addressLine: "123 Silicon Valley, CA 94025", isPrimary: true }],
    contacts: [{ name: "John Doe", phone: "555-1234", isPrimary: true }],
    status: "active" as const
  },
  {
    id: "2",
    companyName: "Green Fields Produce",
    businessType: { name: "Agriculture" },
    addresses: [{ addressLine: "456 Farm Road, OR 97301", isPrimary: true }],
    contacts: [{ name: "Jane Smith", phone: "555-5678", isPrimary: true }],
    status: "active" as const
  },
  {
    id: "3",
    companyName: "Global Logistics Co.",
    businessType: { name: "Transportation" },
    addresses: [{ addressLine: "789 Harbor Blvd, NY 10001", isPrimary: true }],
    contacts: [{ name: "Mike Johnson", phone: "555-9012", isPrimary: true }],
    status: "inactive" as const
  },
  {
    id: "4",
    companyName: "Stellar Manufacturing",
    businessType: { name: "Manufacturing" },
    addresses: [{ addressLine: "101 Factory Lane, MI 48201", isPrimary: true }],
    contacts: [{ name: "Sarah Brown", phone: "555-3456", isPrimary: true }],
    status: "active" as const
  },
  {
    id: "5",
    companyName: "Eco Energy Solutions",
    businessType: { name: "Energy" },
    addresses: [{ addressLine: "202 Green Street, TX 77001", isPrimary: true }],
    contacts: [{ name: "Tom Wilson", phone: "555-7890", isPrimary: true }],
    status: "inactive" as const
  },
  {
    id: "6",
    companyName: "Quantum Computing Labs",
    businessType: { name: "Research" },
    addresses: [{ addressLine: "303 Science Park, MA 02139", isPrimary: true }],
    contacts: [{ name: "Emily Chen", phone: "555-2345", isPrimary: true }],
    status: "active" as const
  },
  {
    id: "7",
    companyName: "Global Pharma Inc.",
    businessType: { name: "Pharmaceuticals" },
    addresses: [{ addressLine: "404 Health Avenue, NJ 07101", isPrimary: true }],
    contacts: [{ name: "David Lee", phone: "555-6789", isPrimary: true }],
    status: "inactive" as const
  },
  {
    id: "8",
    companyName: "Gourmet Foods Distributors",
    businessType: { name: "Food Distribution" },
    addresses: [{ addressLine: "505 Culinary Court, IL 60601", isPrimary: true }],
    contacts: [{ name: "Lisa Taylor", phone: "555-0123", isPrimary: true }],
    status: "active" as const
  },
  {
    id: "9",
    companyName: "Advanced Materials Corp",
    businessType: { name: "Materials Science" },
    addresses: [{ addressLine: "606 Innovation Way, PA 19019", isPrimary: true }],
    contacts: [{ name: "Robert Garcia", phone: "555-4567", isPrimary: true }],
    status: "inactive" as const
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

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

  const handleAddFilters = () => {
    setShowAdvancedFilters(true)
    toast({
      title: "Advanced Filters",
      description: "Advanced filtering options will be available in a future release",
    })
  }

  const handleSavedFilters = () => {
    setShowSavedFilters(true)
    toast({
      title: "Saved Filters",
      description: "Saved filters functionality will be available in a future release",
    })
  }

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
            <div className="flex justify-end px-4 py-3 bg-muted/20 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}?edit=1`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
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
    <div className="p-8">
      {/* Vendor Management Card with Header */}
      <Card>
        <CardHeader className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Vendor Management</CardTitle>
              <div className="text-sm text-gray-600">Manage vendor profiles and relationships</div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleAddVendor} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Left Side - Search and Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              {/* Search Input */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Basic Filter Dropdowns */}
              <div className="flex gap-2 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Side - Action Buttons and View Toggle */}
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={handleSavedFilters}>
                Saved Filters
              </Button>

              <Button variant="outline" size="sm" onClick={handleAddFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Add Filters
              </Button>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="border-r"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'card' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Primary Address</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{vendor.companyName}</TableCell>
                    <TableCell>{vendor.businessType?.name}</TableCell>
                    <TableCell>
                      {vendor.addresses.find(a => a.isPrimary)?.addressLine || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {vendor.contacts.find(c => c.isPrimary)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-xs px-2 py-1 ${
                          vendor.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {vendor.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/vendor-management/manage-vendors/${vendor.id}?edit=1`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            renderCardView()
          )}
        </CardContent>
      </Card>
    </div>
  );
}
