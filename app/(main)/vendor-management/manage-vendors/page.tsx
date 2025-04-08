'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileUp, FileDown, FileText, Edit, Trash2, Copy, MoreHorizontal, Ban } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AdvancedFilter } from './components/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { Vendor } from './[id]/types'
import { MOCK_VENDORS } from './data/mock'
import type { EnvironmentalImpact } from './[id]/types'
import {
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MetricValue = {
  value: number;
  unit?: string;
  trend: number;
  benchmark?: number;
};

type NestedFieldValue = string | number | boolean | Date | null | MetricValue;

export default function VendorList(): JSX.Element {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>(Object.values(MOCK_VENDORS))
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>(Object.values(MOCK_VENDORS))
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<FilterType<Vendor>[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoading(true)
        // Simulating API call with mock data
        const data = Object.values(MOCK_VENDORS)
        setVendors(data)
        setFilteredVendors(data)
      } catch (err) {
        console.error('Fetch error:', err)
        toast.error("Error fetching vendors", {
          description: "There was a problem loading the vendor list."
        })
        setVendors([])
        setFilteredVendors([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendors()
  }, [])

  // Apply filters and search to vendors
  useEffect(() => {
    try {
      let filtered = [...vendors]
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          vendor =>
            vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vendor.businessRegistrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            vendor.addresses.some(a => a.addressLine?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            vendor.contacts.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }
      
      // Apply advanced filters
      if (activeFilters.length > 0) {
        filtered = filtered.filter(vendor => {
          return activeFilters.every(filter => {
            const field = filter.field
            const value = filter.value
            const operator = filter.operator

            // Handle nested fields
            let fieldValue: NestedFieldValue = null
            if (field.toString().includes('.')) {
              const [parentField, childField] = field.toString().split('.')
              const parentValue = vendor[parentField as keyof Vendor]
              
              // Handle nested objects
              if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
                if (parentField === 'environmentalImpact') {
                  const envImpact = parentValue as EnvironmentalImpact
                  const [metric, property] = childField.split('.')
                  const metricValue = envImpact[metric as keyof EnvironmentalImpact]
                  fieldValue = property && typeof metricValue === 'object' ? 
                    ((metricValue as unknown) as MetricValue)[property as keyof MetricValue] ?? null :
                    (metricValue as unknown) as NestedFieldValue ?? null
                } else {
                  fieldValue = ((parentValue as unknown) as Record<string, NestedFieldValue>)[childField] ?? null
                }
              }
            } else {
              fieldValue = vendor[field as keyof Vendor] as NestedFieldValue ?? null
            }

            // Handle undefined or null values
            if (fieldValue === undefined || fieldValue === null) {
              return false
            }

            // Convert to string for comparison if not already a string
            const stringFieldValue = String(fieldValue).toLowerCase()
            const stringValue = String(value).toLowerCase()

            switch (operator) {
              case 'equals':
                return stringFieldValue === stringValue
              case 'contains':
                return stringFieldValue.includes(stringValue)
              case 'startsWith':
                return stringFieldValue.startsWith(stringValue)
              case 'endsWith':
                return stringFieldValue.endsWith(stringValue)
              case 'greaterThan':
                return Number(fieldValue) > Number(value)
              case 'lessThan':
                return Number(fieldValue) < Number(value)
              default:
                return true
            }
          })
        })
      }

      setFilteredVendors(filtered)
    } catch (error) {
      console.error('Error filtering vendors:', error)
      toast.error("Error filtering vendors", {
        description: "There was a problem filtering the vendors."
      })
    }
  }, [activeFilters, vendors, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleAddVendor = () => {
    router.push('/vendor-management/manage-vendors/new')
  }

  const handleFilterChange = (filters: FilterType<Vendor>[]) => {
    setActiveFilters(filters)
  }

  const handleDelete = async (id: string) => {
    // In a real application, this would call an API to delete the vendor
    const updatedVendors = vendors.filter(vendor => vendor.id !== id)
    setVendors(updatedVendors)
    setFilteredVendors(filteredVendors.filter(vendor => vendor.id !== id))
    toast.success("Vendor deleted", {
      description: "The vendor has been deleted successfully."
    })
  }

  const handleDuplicate = async (vendor: Vendor) => {
    // In a real application, this would call an API to duplicate the vendor
    const newVendor = {
      ...vendor,
      id: `VEN${String(vendors.length + 1).padStart(5, '0')}`,
      companyName: `${vendor.companyName} (Copy)`
    }
    setVendors([...vendors, newVendor])
    setFilteredVendors([...filteredVendors, newVendor])
    toast.success("Vendor duplicated", {
      description: "The vendor has been duplicated successfully."
    })
  }

  const handleToggleStatus = async (vendor: Vendor) => {
    // In a real application, this would call an API to update the vendor status
    const updatedVendor = { ...vendor, isActive: !vendor.isActive }
    const updatedVendors = vendors.map(v => v.id === vendor.id ? updatedVendor : v)
    setVendors(updatedVendors)
    setFilteredVendors(filteredVendors.map(v => v.id === vendor.id ? updatedVendor : v))
    toast.success("Vendor status updated", {
      description: `Vendor is now ${updatedVendor.isActive ? 'active' : 'inactive'}.`
    })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vendor-management">Vendor Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/vendor-management/manage-vendors">Manage Vendors</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Manage Vendors</h1>
              <p className="text-muted-foreground mt-1">View and manage your vendor relationships</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddVendor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
              <Button variant="outline">
                <FileUp className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="py-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-8"
                    />
                  </div>
                </div>
                <AdvancedFilter onFilterChange={handleFilterChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75">
                  <TableHead className="py-3 font-medium text-gray-600">Company Name</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Registration No.</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Primary Contact</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Primary Address</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                  <TableHead className="py-3 font-medium text-gray-600 w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No vendors found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map(vendor => {
                    const primaryContact = vendor.contacts.find(c => c.isPrimary) || vendor.contacts[0]
                    const primaryAddress = vendor.addresses.find(a => a.isPrimary) || vendor.addresses[0]

                    return (
                      <TableRow key={vendor.id} className="group hover:bg-gray-50/50">
                        <TableCell className="font-medium">{vendor.companyName}</TableCell>
                        <TableCell>{vendor.businessRegistrationNumber}</TableCell>
                        <TableCell>
                          {primaryContact ? (
                            <div>
                              <div className="font-medium">{primaryContact.name}</div>
                              <div className="text-sm text-muted-foreground">{primaryContact.phone}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No contact</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {primaryAddress ? (
                            primaryAddress.addressLine
                          ) : (
                            <span className="text-muted-foreground">No address</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={vendor.isActive ? "default" : "secondary"}>
                            {vendor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/vendor-management/manage-vendors/${vendor.id}`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/vendor-management/manage-vendors/${vendor.id}/edit`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>Edit Vendor</TooltipContent>
                              </Tooltip>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDuplicate(vendor)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(vendor)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    {vendor.isActive ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(vendor.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
