'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Building2, UtensilsCrossed, Wine, Warehouse, Wrench, Check, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { mockLocations, getLocationsByDepartment, getProductsByLocation, Location } from '@/lib/mock/inventory-data';

interface LocationSelectionProps {
  formData: {
    selectedLocations: string[];
    department: string;
    targetCount: number;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const locationTypes = [
  { value: 'all', label: 'All Types', icon: MapPin },
  { value: 'storage', label: 'Storage', icon: Warehouse },
  { value: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { value: 'restaurant', label: 'Restaurant', icon: Building2 },
  { value: 'bar', label: 'Bar', icon: Wine },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const getLocationIcon = (type: string) => {
  const locationType = locationTypes.find(t => t.value === type);
  return locationType?.icon || MapPin;
};

export function SpotCheckLocationSelection({ formData, setFormData, onNext, onBack }: LocationSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const handleLocationSelect = (locationId: string) => {
    setFormData((prev: any) => {
      const currentSelected = prev.selectedLocations.includes(locationId)
        ? prev.selectedLocations.filter((id: string) => id !== locationId)
        : prev.selectedLocations.length < prev.targetCount
          ? [...prev.selectedLocations, locationId]
          : prev.selectedLocations;

      return {
        ...prev,
        selectedLocations: currentSelected,
      };
    });
  };

  const departmentLocations = useMemo(() => 
    formData.department ? getLocationsByDepartment(formData.department) : [],
    [formData.department]
  );

  const filteredLocations = departmentLocations.filter((location) => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const locationStats = useMemo(() => {
    return departmentLocations.reduce((acc, location) => {
      const products = getProductsByLocation(location.id);
      acc[location.id] = {
        itemCount: products.length,
        lowStockCount: products.filter(p => p.currentStock <= p.reorderPoint).length,
        lastCountDate: products.reduce((latest, p) => {
          if (!p.lastCountDate) return latest;
          const date = new Date(p.lastCountDate);
          return !latest || date > latest ? date : latest;
        }, null as Date | null),
      };
      return acc;
    }, {} as Record<string, { itemCount: number; lowStockCount: number; lastCountDate: Date | null; }>);
  }, [departmentLocations]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search locations by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location Type" />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Location Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {filteredLocations.map((location) => {
              const stats = locationStats[location.id];
              const Icon = getLocationIcon(location.type);
              const isSelected = formData.selectedLocations.includes(location.id);
              const isDisabled = !isSelected && formData.selectedLocations.length >= formData.targetCount;

              return (
                <Card
                  key={location.id}
                  className={cn(
                    "relative transition-all hover:shadow-md cursor-pointer",
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50",
                    isDisabled && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => !isDisabled && handleLocationSelect(location.id)}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{location.name}</CardTitle>
                        <CardDescription className="truncate">{location.code}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Items</p>
                        <p className="text-lg font-medium">{stats.itemCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Last Count</p>
                        <p className="text-lg font-medium">
                          {stats.lastCountDate 
                            ? new Date(stats.lastCountDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No locations found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Selected Locations Panel */}
        <div className="hidden lg:block w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                Selected Locations
                <Badge variant="secondary" className="ml-2">
                  {formData.selectedLocations.length} / {formData.targetCount}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] -mx-4 px-4">
                <div className="space-y-3">
                  {formData.selectedLocations.map((locationId) => {
                    const location = departmentLocations.find(l => l.id === locationId);
                    if (!location) return null;
                    const stats = locationStats[location.id];
                    const Icon = getLocationIcon(location.type);

                    return (
                      <div 
                        key={location.id} 
                        className="group relative p-4 rounded-lg border hover:border-primary/50"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocationSelect(location.id);
                          }}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        <div className="flex gap-3">
                          <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium leading-none truncate">{location.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1 truncate">{location.code}</p>
                            
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Items</p>
                                <p className="font-medium">{stats.itemCount}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Last Count</p>
                                <p className="font-medium">
                                  {stats.lastCountDate 
                                    ? new Date(stats.lastCountDate).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric'
                                      })
                                    : 'Never'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {formData.selectedLocations.length === 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">No locations selected</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select locations from the grid to begin
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
