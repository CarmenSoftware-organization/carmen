'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockLocations, getLocationsByDepartment, Location } from '@/lib/mock/inventory-data';

interface LocationSelectionProps {
  formData: {
    selectedLocations: string[];
    department: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const locationTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'storage', label: 'Storage' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function LocationSelection({ formData, setFormData, onNext, onBack }: LocationSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const handleLocationSelect = (locationId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedLocations: prev.selectedLocations.includes(locationId)
        ? prev.selectedLocations.filter((id: string) => id !== locationId)
        : [...prev.selectedLocations, locationId],
    }));
  };

  // Get locations for the selected department
  const departmentLocations = formData.department 
    ? getLocationsByDepartment(formData.department)
    : [];

  const filteredLocations = departmentLocations.filter((location) => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Locations</CardTitle>
        <CardDescription>
          Choose the locations you want to include in this physical count.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No locations found matching your criteria.
            </div>
          ) : (
            filteredLocations.map((location) => (
              <div
                key={location.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  formData.selectedLocations.includes(location.id)
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleLocationSelect(location.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.code}</p>
                  </div>
                  <Badge variant="secondary">
                    {location.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Floor {location.floor}</p>
                  <p>{location.building}</p>
                  {location.capacity && (
                    <p>Capacity: {location.capacity} items</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Selected {formData.selectedLocations.length} of {filteredLocations.length} locations
          </div>
          <div>
            {locationTypes.length - 1} types | {departmentLocations.length} total locations
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
