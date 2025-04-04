'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Location {
  id: string;
  name: string;
  type: string;
  code: string;
}

// Mock function to replace the missing getLocations
function getLocations(): Location[] {
  return [
    { id: '1', name: 'Main Kitchen', type: 'kitchen', code: 'MK001' },
    { id: '2', name: 'Dry Storage', type: 'storage', code: 'DS001' },
    { id: '3', name: 'Walk-in Refrigerator', type: 'storage', code: 'WR001' },
    { id: '4', name: 'Bar Area', type: 'bar', code: 'BA001' },
    { id: '5', name: 'Dining Room', type: 'restaurant', code: 'DR001' }
  ];
}

interface LocationSelectionProps {
  formData: {
    selectedLocations: string[];
    department: string;
    targetCount: string;
  };
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FormData {
  selectedLocations: string[];
  [key: string]: string | string[] | number | Record<string, unknown>;
}

export function LocationSelection({ formData, setFormData, onNext, onBack }: LocationSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get locations for the selected department
  const departmentLocations = formData.department 
    ? getLocations().filter((location: Location) => location.type === formData.department)
    : [];

  const filteredLocationsByType = departmentLocations.filter((location: Location) => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (locationId: string) => {
    const isSelected = formData.selectedLocations.includes(locationId);
    const newSelectedLocations = isSelected
      ? formData.selectedLocations.filter(id => id !== locationId)
      : [...formData.selectedLocations, locationId];
    
    setFormData({
      ...formData,
      selectedLocations: newSelectedLocations
    });
  };

  const handleSelectAll = () => {
    setFormData({
      ...formData,
      selectedLocations: formData.selectedLocations.length === filteredLocationsByType.length
        ? [] // Deselect all
        : filteredLocationsByType.map((location: Location) => location.id) // Select all
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selectAll" 
                checked={formData.selectedLocations.length === filteredLocationsByType.length && filteredLocationsByType.length > 0}
                onCheckedChange={handleSelectAll} 
              />
              <Label htmlFor="selectAll">Select All</Label>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredLocationsByType.map((location: Location) => (
                  <div key={location.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={location.id}
                      checked={formData.selectedLocations.includes(location.id)}
                      onCheckedChange={() => handleLocationSelect(location.id)}
                    />
                    <Label htmlFor={location.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">Code: {location.code}</div>
                    </Label>
                  </div>
                ))}
                
                {filteredLocationsByType.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">
                    No locations match your search
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onBack}>Back</Button>
              <div className="text-sm">
                {formData.selectedLocations.length} locations selected
              </div>
              <Button onClick={onNext} disabled={formData.selectedLocations.length === 0}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
