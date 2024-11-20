'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockLocations } from '@/lib/mock/inventory-data';
import { useCountStore } from '@/lib/store/use-count-store';
import type { LocationType, HotelLocation } from '@/lib/types/hotel';

export default function LocationPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LocationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof HotelLocation | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { setSelectedLocations } = useCountStore();

  const handleSort = (field: keyof HotelLocation) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLocations = (mockLocations as HotelLocation[]).filter(location => {
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    const modifier = sortDirection === 'asc' ? 1 : -1;
    return (aValue > bValue ? 1 : aValue < bValue ? -1 : 0) * modifier;
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Select Locations</CardTitle>
        <CardDescription>Choose the locations to include in the spot check</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedType} onValueChange={(value: LocationType) => setSelectedType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Locations Table */}
        <div className="border rounded-md">
          <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 border-b">
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:bg-muted"
              onClick={() => handleSort('name')}
            >
              Name
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:bg-muted"
              onClick={() => handleSort('type')}
            >
              Type
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:bg-muted"
              onClick={() => handleSort('itemCount')}
            >
              Items
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:bg-muted"
              onClick={() => handleSort('lastCount')}
            >
              Last Count
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <div>Status</div>
          </div>
          <div className="divide-y">
            {sortedLocations.map((location) => (
              <div
                key={location.id}
                className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  setSelectedLocations([location.id]);
                  router.push('/inventory-management/spot-check/new/items');
                }}
              >
                <div className="font-medium">{location.name}</div>
                <div className="capitalize">{location.type}</div>
                <div className="font-medium">{location.itemCount} items</div>
                <div className="font-medium">{location.lastCount || 'Never'}</div>
                <div className="capitalize">{location.status}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
