'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Building2, UtensilsCrossed, Wine, Warehouse, Wrench, Check, ChevronRight, Clock, Package2, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { mockLocations, getLocationsByDepartment, getProductsByLocation, Location } from '@/lib/mock/inventory-data';
import { format } from 'date-fns';

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
  const [selectedArea, setSelectedArea] = useState('all');

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

  const areas = useMemo(() => {
    const uniqueAreas = new Set(departmentLocations.map(loc => loc.building || 'Other'));
    return ['all', ...Array.from(uniqueAreas)];
  }, [departmentLocations]);

  const filteredLocations = departmentLocations.filter((location) => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const matchesArea = selectedArea === 'all' || location.building === selectedArea;
    return matchesSearch && matchesType && matchesArea;
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
      {/* Search Bar */}
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search locations by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>
                {area === 'all' ? 'All Areas' : area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          {locationTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            return (
              <Button
                key={type.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-10"
                onClick={() => setSelectedType(type.value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Location Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => {
              const stats = locationStats[location.id];
              const Icon = getLocationIcon(location.type);
              const isSelected = formData.selectedLocations.includes(location.id);
              const isDisabled = !isSelected && formData.selectedLocations.length >= formData.targetCount;

              return (
                <Card
                  key={location.id}
                  className={cn(
                    "relative transition-all hover:shadow-md cursor-pointer group",
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50",
                    isDisabled && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => !isDisabled && handleLocationSelect(location.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">{location.name}</CardTitle>
                        <CardDescription className="truncate">{location.code}</CardDescription>
                      </div>
                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Package2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{stats.itemCount}</p>
                          <p className="text-xs text-muted-foreground">Items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {stats.lastCountDate 
                              ? format(stats.lastCountDate, 'MMM d')
                              : 'Never'}
                          </p>
                          <p className="text-xs text-muted-foreground">Last Count</p>
                        </div>
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

        {/* Selected Location Panel */}
        {formData.selectedLocations.length > 0 && (
          <div className="hidden xl:block w-80 border-l pl-6">
            <div className="sticky top-6">
              <h3 className="font-semibold mb-4">Selected Locations</h3>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  {formData.selectedLocations.map((locationId) => {
                    const location = departmentLocations.find(l => l.id === locationId);
                    const stats = locationStats[locationId];
                    if (!location) return null;

                    return (
                      <Card key={locationId} className="relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocationSelect(locationId);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              {getLocationIcon(location.type)({ className: "h-4 w-4 text-muted-foreground" })}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{location.name}</h4>
                              <p className="text-sm text-muted-foreground">{location.code}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Items</p>
                              <p className="font-medium">{stats.itemCount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Low Stock</p>
                              <p className="font-medium">{stats.lowStockCount}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Last Count</p>
                              <p className="font-medium">
                                {stats.lastCountDate
                                  ? format(stats.lastCountDate, 'PPP')
                                  : 'Never counted'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-medium">{formData.selectedLocations.length} of {formData.targetCount}</span>
                </div>
                <Button className="w-full" onClick={onNext} disabled={formData.selectedLocations.length === 0}>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
